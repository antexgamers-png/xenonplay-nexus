
'use client';

import type { Station, PricingRule, FnbItem, Transaction, Member, CreditVoucher } from '@/lib/types';
import { useState, useEffect, useRef, useMemo } from 'react';
import { StationCard } from './station-card';
import { createTransaction, addItemsToTransaction, addTimeToTransaction, markTransactionAsPaid, triggerADBAction, moveStation } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, updateDoc, doc, getDocs, query, where, writeBatch, setDoc } from 'firebase/firestore';
import { useNotifications } from '@/components/providers/notification-provider';
import { useShift } from '@/components/providers/shift-provider';
import { Button } from '../ui/button';
import { AlertTriangle, Ticket, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { VoucherHistoryDialog } from './voucher-history-dialog';
import { useUser } from '@/firebase/provider';
import Image from 'next/image';

export function StationGrid({
  initialStations,
  pricingRules,
  fnbItems,
}: {
  initialStations: Station[];
  pricingRules: PricingRule[];
  fnbItems: FnbItem[];
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { addNotification, transactionToOpen, clearTransactionToOpen } = useNotifications();
  const { activeShift, setIsOpeningDialog } = useShift();

  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  
  const [verifiedVoucher, setVerifiedVoucher] = useState<CreditVoucher | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const stationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stations') : null, [firestore]);
  const transactionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'transactions') : null, [firestore]);

  const { data: stations } = useCollection<Station>(stationsQuery);
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);
  const prevStationsRef = useRef<Station[]>(undefined);
  
  const sortedStations = useMemo(() => {
    const list = stations || initialStations || [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }, [stations, initialStations]);

  const availableStations = useMemo(() => sortedStations.filter(s => !s.is_active), [sortedStations]);

  const eligibleStations = useMemo(() => {
      if (!verifiedVoucher) return [];
      return availableStations.filter(s => verifiedVoucher.stationType === 'All' || s.type === verifiedVoucher.stationType);
  }, [availableStations, verifiedVoucher]);

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Shift Belum Dibuka",
        description: "Harap buka shift kasir terlebih dahulu untuk melakukan tindakan ini.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (stations) {
      const prevStations = prevStationsRef.current || initialStations;
      stations.forEach(currentStation => {
        const prevStation = prevStations.find(s => s.id === currentStation.id);
        if (!prevStation) return;
        
        if (currentStation.is_active === false && prevStation.is_active === true) {
             addNotification({
                stationId: currentStation.id,
                stationName: currentStation.name,
                type: 'session-ended',
                priority: 'medium',
                message: 'Sesi berakhir otomatis. TV dikembalikan ke menu utama.',
                transactionId: currentStation.current_transaction_id
             });
        }
      });
      prevStationsRef.current = stations;
    }
  }, [stations, addNotification, initialStations]);

  const handleStartSession = async (stationId: string, rule: PricingRule, selectedFnb: any[], isPaid: boolean, member?: Member | null, discount?: number, extraSticks?: number) => {
    if (!checkShift()) return;
    const station = stations?.find(s => s.id === stationId);
    if (!station || !firestore) return;
    const now = Date.now();
    const endTime = now + rule.duration * 60 * 1000;
    try {
        const transaction = await createTransaction(firestore, {
            stationId: station.id, 
            stationName: station.name, 
            durationMinutes: rule.duration,
            amount: rule.price, 
            fnbItems: selectedFnb, 
            isPaid, 
            memberId: member?.id || null,
            memberName: member?.name || null, 
            discount, 
            extraSticks,
            activeShiftId: activeShift?.id
        });
        
        await updateDoc(doc(firestore, 'stations', stationId), {
            is_active: true, 
            is_paused: false, 
            start_time: now, 
            end_time: endTime, 
            current_transaction_id: transaction.id,
            last_action: 'start',
            last_action_timestamp: now
        });
        toast({ title: 'Sesi Berhasil Dimulai', description: `${station.name} siap dimainkan.`, variant: "success" });
    } catch(e: any) {
        toast({ title: 'Gagal Memulai Sesi', description: e.message, variant: 'destructive' });
    }
  };

  const handleManualStop = async (stationId: string) => {
    if (!firestore) return;
    try {
        const now = Date.now();
        const stationRef = doc(firestore, 'stations', stationId);
        
        if (user) {
            const logRef = doc(collection(firestore, 'auditLogs'));
            await setDoc(logRef, {
                id: logRef.id,
                userId: user.uid,
                userName: user.displayName || user.email || 'Operator',
                action: 'MANUAL_STOP',
                target: stationId,
                details: 'Operator menghentikan sesi secara manual dari dashboard.',
                timestamp: now
            });
        }

        await updateDoc(stationRef, {
            is_active: false,
            is_paused: false,
            end_time: null,
            last_action: 'stop',
            last_action_timestamp: now
        });

        toast({ title: 'Sesi Dihentikan', description: 'Sistem telah dinonaktifkan dan sinyal stop dikirim ke hardware.', variant: "success" });
    } catch(e: any) {
        toast({ title: 'Gagal Mengaktifkan Unit', description: e.message, variant: 'destructive' });
    }
  };

  const handleAddItems = async (sId: string, tId: string, items: any[], isPaid: boolean, discount?: number) => {
    if (!checkShift()) return;
    if (!firestore) return;
    try {
        await addItemsToTransaction(firestore, tId, items, items.reduce((s, i) => s + i.price * i.quantity, 0), isPaid, discount, activeShift?.id);
        toast({ title: 'Pesanan Berhasil Ditambah', variant: "success" });
    } catch (e: any) { 
        toast({ title: 'Gagal Tambah Pesanan', description: e.message, variant: 'destructive' }); 
    }
  };

  const handleAddTime = async (sId: string, tId: string, rule: PricingRule, isPaid: boolean, discount: number = 0) => {
    if (!checkShift()) return;
    if(!firestore) return;
    try {
        await addTimeToTransaction(firestore, tId, sId, rule.duration, rule.price, isPaid, discount, activeShift?.id);
        toast({ title: 'Durasi Berhasil Ditambah', variant: "success" });
    } catch (e: any) { 
        toast({ title: 'Gagal Tambah Waktu', description: e.message, variant: 'destructive' }); 
    }
  };

  const handleMoveStation = async (sourceId: string, transactionId: string, targetId: string) => {
     if (!firestore) return;
     try {
         await moveStation(firestore, sourceId, targetId, transactionId);
         toast({ title: "Berhasil Pindah Unit", variant: "success" });
     } catch (e: any) { 
         toast({ title: "Gagal Pindah Unit", description: e.message, variant: "destructive" }); 
     }
  };

  const handleMarkAsPaid = async (tId: string, member?: Member | null) => {
    if (!checkShift()) return;
    if (!firestore) return;
    try {
        await markTransactionAsPaid(firestore, tId, activeShift?.id, member);
        const stationToClear = stations?.find(s => s.current_transaction_id === tId);
        if (stationToClear && !stationToClear.is_active) {
            await updateDoc(doc(firestore, 'stations', stationToClear.id), { current_transaction_id: null });
        }
        toast({ title: 'Pembayaran Lunas', description: 'Transaksi telah masuk dalam laporan.', variant: "success" });
    } catch (e: any) { 
        toast({ title: 'Gagal Melunasi', description: e.message, variant: 'destructive' }); 
    }
  };

  const handleGlobalPause = async () => {
     if (!firestore || !stations) return;
     setIsEmergencyLoading(true);
     const batch = writeBatch(firestore);
     const now = Date.now();
     try {
         stations.forEach(s => {
             if (s.is_active && !s.is_paused) {
                 const remaining = Math.max(0, Math.floor(((s.end_time || 0) - now) / 1000));
                 batch.update(doc(firestore, 'stations', s.id), { 
                    is_paused: true, 
                    remaining_seconds: remaining, 
                    last_action: 'pause', 
                    last_action_timestamp: now 
                 });
             }
         });
         await batch.commit();
         toast({ title: "Jeda Darurat Aktif", description: "Seluruh unit aktif telah dijeda.", variant: "success" });
     } catch (e: any) { 
         toast({ title: "Gagal Mengaktifkan Jeda", description: e.message, variant: "destructive" }); 
     }
     finally { setIsEmergencyLoading(false); }
  };

  const handleCheckVoucher = async () => {
     if (!checkShift()) return;
     if (!firestore || !claimCode) return;
     setIsClaiming(true);
     try {
         const q = query(collection(firestore, 'vouchers'), where('code', '==', claimCode.toUpperCase()), where('status', '==', 'active'));
         const snap = await getDocs(q);
         if (snap.empty) { 
            toast({ title: "Kode Tidak Valid", description: "Voucher tidak ditemukan atau sudah terpakai.", variant: "destructive" }); 
            return; 
         }
         const voucher = snap.docs[0].data() as CreditVoucher;
         setVerifiedVoucher({ ...voucher, id: snap.docs[0].id });
     } catch (e: any) { 
        toast({ title: "Gagal Verifikasi Kode", description: e.message, variant: "destructive" }); 
     }
     finally { setIsClaiming(false); }
  };

  const handleFinalClaim = async () => {
     if (!checkShift()) return;
     if (!firestore || !verifiedVoucher || !selectedStationId) return;
     setIsClaiming(true);
     const targetStation = stations?.find(s => s.id === selectedStationId);
     if (!targetStation) return;
     try {
         const now = Date.now();
         const endTime = now + verifiedVoucher.durationMinutes * 60 * 1000;
         const batch = writeBatch(firestore);
         const transRef = doc(collection(firestore, 'transactions'));
         
         batch.set(transRef, { 
            id: transRef.id, 
            stationId: targetStation.id, 
            stationName: targetStation.name, 
            durationMinutes: verifiedVoucher.durationMinutes, 
            amount: 0, 
            discount: 0, 
            paidAmount: 0, 
            timestamp: now, 
            status: 'paid', 
            shiftId: activeShift?.id || null, 
            fnbItems: [], 
            additionalCharges: [{ description: `Klaim Voucher: ${verifiedVoucher.code}`, amount: 0, timestamp: now, isPaid: true }], 
            claimCode: verifiedVoucher.code 
         });
         
         batch.update(doc(firestore, 'vouchers', verifiedVoucher.id), { status: 'used', claimedAt: now });
         
         batch.update(doc(firestore, 'stations', targetStation.id), { 
            is_active: true, 
            is_paused: false, 
            start_time: now, 
            end_time: endTime, 
            current_transaction_id: transRef.id, 
            last_action: 'start', 
            last_action_timestamp: now 
         });
         
         await batch.commit();
         toast({ title: "Voucher Berhasil Diklaim", description: `Sesi ${targetStation.name} telah dimulai.`, variant: "success" });
         
         setVerifiedVoucher(null);
         setClaimCode('');
         setSelectedStationId(null);
         setIsClaimOpen(false);
     } catch (e: any) { 
        toast({ title: "Gagal Klaim Voucher", description: e.message, variant: "destructive" }); 
     }
     finally { setIsClaiming(false); }
  };

  return (
    <div className="h-full flex flex-col overflow-visible lg:overflow-hidden px-1 lg:px-0">
      <div className="flex gap-2 mb-3 shrink-0">
        <Button variant="outline" size="sm" className="h-8 bg-amber-500/5 text-amber-600 border-amber-500/20 text-[10px] font-black uppercase" onClick={handleGlobalPause} disabled={isEmergencyLoading}><AlertTriangle className="mr-1.5 h-3 w-3"/> Jeda Darurat</Button>
        <Button variant="outline" size="sm" className="h-8 bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase" onClick={() => { if(checkShift()) setIsClaimOpen(true); }}><Ticket className="mr-1.5 h-3 w-3"/> Tukar Voucher</Button>
      </div>

      <div className={cn(
          "grid gap-4 flex-1 min-h-0",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr"
      )}>
        {sortedStations.map(station => {
            const currentTransaction = transactions?.find(t => t.id === station.current_transaction_id);
            return (
                <StationCard
                    key={station.id}
                    station={station}
                    availableStations={availableStations}
                    pricingRules={pricingRules}
                    fnbItems={fnbItems}
                    onStartSession={handleStartSession}
                    onStopSession={handleManualStop}
                    onTimerEnd={() => {}} 
                    onAddItems={handleAddItems}
                    onAddItemsToTransaction={handleAddItems}
                    onAddTime={handleAddTime}
                    onMoveStation={handleMoveStation}
                    currentTransaction={currentTransaction}
                    onMarkAsPaid={handleMarkAsPaid}
                    shouldOpenDetail={!!(transactionToOpen && currentTransaction?.id === transactionToOpen)}
                    onDetailOpened={clearTransactionToOpen}
                />
            )
        })}
      </div>

      <Dialog open={isClaimOpen} onOpenChange={(val) => { 
          setIsClaimOpen(val); 
          if(!val) {
              setVerifiedVoucher(null);
              setClaimCode('');
              setSelectedStationId(null);
          } 
      }}>
          <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="text-xl font-black uppercase flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Tukar Voucher Kredit</DialogTitle></DialogHeader>
              <div className="py-4 space-y-4">
                  {!verifiedVoucher ? (
                      <div className="space-y-4">
                        <Input 
                            placeholder="Masukkan Kode Voucher..." 
                            className="h-14 text-2xl font-black text-center uppercase tracking-widest bg-muted" 
                            value={claimCode} 
                            onChange={(e) => setClaimCode(e.target.value)} 
                        />
                        <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest opacity-50" onClick={() => setIsHistoryOpen(true)}>Lihat Riwayat Voucher</Button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Durasi Terdeteksi</p>
                              <p className="text-2xl font-black text-emerald-700">{verifiedVoucher.durationMinutes} Menit ({verifiedVoucher.stationType})</p>
                          </div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Pilih Unit Standby</p>
                          <ScrollArea className="h-[200px]">
                              <div className="grid gap-2 pr-4">
                                  {eligibleStations.map(s => (
                                      <button key={s.id} onClick={() => setSelectedStationId(s.id)} className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all", selectedStationId === s.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30")}>
                                          <div className="flex items-center gap-3">
                                              <div className="relative size-8">
                                                  <Image src={`/${s.type.toLowerCase()}-logo.png`} alt={s.type} fill className="object-contain" />
                                              </div>
                                              <div className="text-left font-bold uppercase text-sm">{s.name}</div>
                                          </div>
                                          {selectedStationId === s.id && <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />}
                                      </button>
                                  ))}
                                  {eligibleStations.length === 0 && (
                                      <div className="py-10 text-center border-2 border-dashed rounded-xl opacity-50">
                                          <p className="text-xs font-bold uppercase tracking-widest">Tidak ada unit {verifiedVoucher.stationType} kosong</p>
                                      </div>
                                  )}
                              </div>
                          </ScrollArea>
                      </div>
                  )}
              </div>
              <DialogFooter className="gap-2">
                  {!verifiedVoucher ? (
                      <Button className="w-full h-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleCheckVoucher} disabled={!claimCode || isClaiming}>Verifikasi Kode</Button>
                  ) : (
                      <Button className="w-full h-12 font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700" onClick={handleFinalClaim} disabled={!selectedStationId || isClaiming}>Mulai Dengan Voucher</Button>
                  )}
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <VoucherHistoryDialog isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </div>
  );
}
