
'use client';

import type { Reservation, Station, PricingRule } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LogIn, XCircle, Clock, Banknote, User, Monitor, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { updateReservationStatus, createTransaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { StartSessionDialog } from '../dashboard/start-session-dialog';
import { useShift } from '../providers/shift-provider';
import { doc, updateDoc } from 'firebase/firestore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export function ReservationTable({ 
    data, 
    stations,
    pricingRules
}: { 
    data: Reservation[], 
    stations: Station[],
    pricingRules: PricingRule[]
}) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift } = useShift();
  
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  
  // State untuk pemilihan stasiun alternatif jika stasiun asal sibuk
  const [isStationPickerOpen, setIsStationPickerOpen] = useState(false);
  const [tempStationId, setTempStationId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!firestore) return;
    try {
      await updateReservationStatus(firestore, id, 'cancelled');
      toast({ title: "Reservasi Dibatalkan", variant: "success" });
    } catch (e: any) {
      toast({ title: "Gagal", description: e.message, variant: "destructive" });
    }
  };

  const handleOpenCheckIn = (res: Reservation) => {
      const station = stations.find(s => s.id === res.stationId);
      
      // Jika stasiun sibuk, buka picker stasiun alternatif
      if (station?.is_active) {
          setSelectedRes(res);
          setIsStationPickerOpen(true);
          return;
      }
      
      setSelectedRes(res);
      setTempStationId(res.stationId);
      setIsCheckInOpen(true);
  };

  const handleConfirmStation = (stationId: string) => {
      setTempStationId(stationId);
      setIsStationPickerOpen(false);
      setIsCheckInOpen(true);
  };

  const handleConfirmCheckIn = async (
    rule: PricingRule | null, 
    selectedFnb: { id: string; name: string; price: number; quantity: number }[],
    isPaid: boolean,
    member?: any,
    discount?: number
  ) => {
    if (!firestore || !selectedRes || !rule || !tempStationId) return;

    try {
        const now = Date.now();
        const endTime = now + rule.duration * 60 * 1000;
        const targetStation = stations.find(s => s.id === tempStationId);
        
        if (!targetStation) throw new Error("Stasiun tujuan tidak ditemukan.");

        // Gabungkan diskon normal dengan DP yang sudah dibayar
        const totalDiscount = (discount || 0) + (selectedRes.dpAmount || 0);

        const transaction = await createTransaction(firestore, {
            stationId: tempStationId,
            stationName: targetStation.name,
            durationMinutes: rule.duration,
            amount: rule.price,
            fnbItems: selectedFnb,
            isPaid: isPaid,
            memberId: member?.id || null,
            memberName: member?.name || null,
            discount: totalDiscount,
            activeShiftId: activeShift?.id
        });

        // Aktifkan stasiun secara hardware via Firestore watcher
        await updateDoc(doc(firestore, 'stations', tempStationId), {
            is_active: true,
            is_paused: false,
            start_time: now,
            end_time: endTime,
            current_transaction_id: transaction.id,
            last_action: 'start',
            last_action_timestamp: now
        });

        // Update status reservasi
        await updateReservationStatus(firestore, selectedRes.id, 'checked-in');

        toast({ 
            title: "Check-in Berhasil", 
            description: `Sesi ${targetStation.name} dimulai. DP Rp${selectedRes.dpAmount} diterapkan.`, 
            variant: "success" 
        });
        
        setIsCheckInOpen(false);
        setSelectedRes(null);
        setTempStationId(null);
    } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const availableStations = useMemo(() => stations.filter(s => !s.is_active), [stations]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Waktu & Stasiun</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Pelanggan</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Uang Muka (DP)</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((r) => {
              const now = Date.now();
              // Status HANGUS: jika sudah lewat 15 menit dari jam mulai
              const isLate = r.status === 'scheduled' && now > (r.startTime + 15 * 60 * 1000);
              const station = stations.find(s => s.id === r.stationId);
              
              return (
                <TableRow key={r.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-primary" />
                            <span className="font-black text-sm">{format(r.startTime, 'HH:mm')}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-bold">
                                <Monitor className="size-2.5" /> {r.stationName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground/60 uppercase font-medium">
                                <Send className="size-2" /> Submit: {format(r.createdAt, 'HH:mm', { locale: id })}
                            </div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm uppercase tracking-tight">{r.customerName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.customerPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-tighter px-2 h-5",
                        r.status === 'scheduled' 
                            ? isLate ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" : "bg-primary/10 text-primary border-primary/20"
                            : r.status === 'checked-in' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
                    )}>
                        {r.status === 'scheduled' ? isLate ? 'HANGUS / GAGAL' : 'TERJADWAL' : r.status === 'checked-in' ? 'DATANG' : 'BATAL'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                    {r.dpAmount > 0 ? formatCurrency(r.dpAmount) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === 'scheduled' && (
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn(
                                    "h-8 text-[10px] font-black uppercase border-primary/30 text-primary hover:bg-primary/10 gap-1.5",
                                    isLate && "opacity-50 grayscale cursor-not-allowed"
                                )}
                                onClick={() => !isLate && handleOpenCheckIn(r)}
                                disabled={isLate}
                            >
                                <LogIn className="size-3" /> Check-in
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleCancel(r.id)}
                            >
                                <XCircle className="size-4" />
                            </Button>
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">Belum ada reservasi untuk hari ini.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* DIALOG PICKER STASIUN ALTERNATIF */}
      <Dialog open={isStationPickerOpen} onOpenChange={setIsStationPickerOpen}>
          <DialogContent className="max-w-md bg-background">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-amber-500" />
                      Stasiun Pilihan Penuh
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium">
                      Unit <b>{selectedRes?.stationName}</b> saat ini sedang digunakan. Silakan pilih unit lain yang tersedia untuk check-in pelanggan ini.
                  </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 ml-1">Pilih Unit Kosong</p>
                  <ScrollArea className="h-[250px] pr-4">
                      <div className="grid grid-cols-1 gap-2">
                          {availableStations.length > 0 ? (
                              availableStations.map(s => (
                                  <button
                                      key={s.id}
                                      onClick={() => handleConfirmStation(s.id)}
                                      className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className="relative size-10">
                                              <Image src={`/${s.type.toLowerCase()}-logo.png`} alt={s.type} fill className="object-contain" />
                                          </div>
                                          <div>
                                              <p className="font-black text-sm uppercase leading-none">{s.name}</p>
                                              <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">{s.type} CORE</p>
                                          </div>
                                      </div>
                                      <LogIn className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </button>
                              ))
                          ) : (
                              <div className="py-12 text-center border-2 border-dashed rounded-2xl opacity-50 flex flex-col items-center gap-2">
                                  <AlertTriangle className="size-8 text-muted-foreground" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Semua unit sedang penuh</p>
                              </div>
                          )}
                      </div>
                  </ScrollArea>
              </div>
              
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="ghost" className="font-bold uppercase text-[10px]">Batalkan Check-in</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {selectedRes && tempStationId && (
          <StartSessionDialog 
            isOpen={isCheckInOpen}
            onOpenChange={setIsCheckInOpen}
            stationType={stations.find(s => s.id === tempStationId)?.type || 'PS4'}
            pricingRules={pricingRules}
            fnbItems={[]}
            onConfirm={handleConfirmCheckIn}
            outstandingAmount={0}
          />
      )}
    </div>
  );
}
