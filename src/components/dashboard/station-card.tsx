
'use client';

import type { Station, PricingRule, FnbItem, Transaction, Member } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';
import { 
  ArrowRightLeft, 
  PlusCircle, 
  Receipt, 
  Pause, 
  Play, 
  Tv, 
  Power, 
  Moon, 
  Home, 
  Zap,
  Activity,
  Loader2,
  Ticket,
  Copy,
  Check,
  Plus,
  Minus,
  VolumeX,
  Volume2,
  Volume1,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { StartSessionDialog } from './start-session-dialog';
import { useState, useEffect } from 'react';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from 'framer-motion';
import { pauseStation, resumeStation, triggerADBAction, convertSessionToCredit } from '@/lib/data';
import { MoveStationDialog } from './move-station-dialog';
import { useUser } from '@/firebase/provider';
import { useShift } from '@/components/providers/shift-provider';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface StationCardProps {
  station: Station;
  availableStations: Station[];
  pricingRules: PricingRule[];
  fnbItems: FnbItem[];
  onStartSession: (stationId: string, rule: PricingRule, selectedFnb: any[], isPaid: boolean, member?: Member | null, discount?: number, extraSticks?: number) => void;
  onStopSession: (stationId: string) => void;
  onTimerEnd: () => void;
  onAddItems: (stationId: string, transactionId: string, items: any[], isPaid: boolean, discount?: number) => void;
  onAddTime: (stationId: string, transactionId: string, rule: PricingRule, isPaid: boolean, discount?: number) => void;
  onMoveStation: (sourceId: string, transactionId: string, targetId: string) => void;
  onMarkAsPaid: (transactionId: string, member?: Member | null) => void;
  currentTransaction?: Transaction;
  shouldOpenDetail: boolean;
  onDetailOpened: () => void;
}

function CountdownTimer({ 
  endTime, 
  remainingSeconds, 
  isPaused, 
  onTimerEnd 
}: { 
  endTime: number | null; 
  remainingSeconds?: number | null; 
  isPaused?: boolean; 
  onTimerEnd: () => void; 
}) {
  const [remainingTime, setRemainingTime] = useState('--:--:--');

  useEffect(() => {
    if (isPaused && remainingSeconds != null) {
      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;
      setRemainingTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      return;
    }

    if (!endTime) return;

    const update = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setRemainingTime('00:00:00');
        onTimerEnd();
        return false;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setRemainingTime(`${h}:${m}:${s}`);
      return true;
    };

    update();
    const interval = setInterval(() => {
      if (!update()) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, remainingSeconds, isPaused, onTimerEnd]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-black tracking-[0.3em] text-muted-foreground/50 mb-1 uppercase">Sisa Waktu Mabar</span>
      <div className={cn(
        "font-black font-mono tracking-tighter leading-none tabular-nums",
        "text-4xl lg:text-[clamp(1.8rem,3vw,3.2rem)]",
        isPaused ? "text-amber-500/80" : "text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      )}>
        {remainingTime}
      </div>
    </div>
  );
}

export function StationCard({ 
  station, 
  availableStations, 
  pricingRules, 
  fnbItems, 
  onStartSession, 
  onStopSession, 
  onTimerEnd, 
  onAddItems, 
  onAddTime, 
  onMoveStation, 
  onMarkAsPaid, 
  currentTransaction, 
  shouldOpenDetail, 
  onDetailOpened 
}: StationCardProps) {
  const { id, name, type, is_active, is_paused, end_time, remaining_seconds, current_transaction_id, last_heartbeat } = station;
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCrediting, setIsCrediting] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  
  const [showVoucherResult, setShowVoucherResult] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => { 
    if (shouldOpenDetail && currentTransaction) { 
      setIsDetailOpen(true); 
      onDetailOpened(); 
    } 
  }, [shouldOpenDetail, onDetailOpened, currentTransaction]);

  const outstanding = currentTransaction ? (currentTransaction.amount || 0) - (currentTransaction.discount || 0) - (currentTransaction.paidAmount || 0) : 0;
  const isPaid = currentTransaction?.status === 'paid';
  
  const hbMillis = last_heartbeat?.toMillis ? last_heartbeat.toMillis() : (typeof last_heartbeat === 'number' ? last_heartbeat : 0);
  const isOnline = hbMillis && (now - hbMillis < 95000);

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Laci Masih Terkunci",
        description: "Harap buka shift kasir terlebih dahulu untuk memulai mabar.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  const handleRemoteAction = async (action: any) => {
    if (!firestore) return;
    setIsExecuting(true);
    try {
      await triggerADBAction(firestore, id, action, user?.uid, user?.displayName || user?.email || 'Sistem');
      toast({ title: `Sinyal ${action.toUpperCase()} Terkirim`, variant: "success" });
    } catch (e: any) {
      toast({ title: "Gagal memicu hardware", variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  }

  const handleSaveCredit = async () => {
      if (!firestore || !current_transaction_id) return;
      if (!checkShift()) return;
      setIsCrediting(true);
      try {
          const code = await convertSessionToCredit(firestore, id, current_transaction_id);
          setGeneratedCode(code);
          setShowVoucherResult(true);
          toast({
              title: "Kredit Berhasil Disimpan",
              description: "Sisa waktu telah kami ubah jadi kode voucher.",
              variant: "success",
          });
      } catch (e: any) {
          toast({ title: "Gagal simpan kredit", description: e.message, variant: "destructive" });
      } finally {
          setIsCrediting(false);
      }
  }

  const handleCopyCode = () => {
      if (!generatedVoucher) return;
      navigator.clipboard.writeText(generatedCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "Kode voucher tersalin!", variant: "success" });
  };

  return (
    <motion.div 
      layout 
      className="h-full min-h-[280px] lg:min-h-0"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={cn(
        'flex flex-col h-full bg-card border-[0.5px] border-border/50 overflow-hidden transition-all duration-700 relative group p-4 lg:p-3 justify-between',
        is_active 
          ? 'shadow-[0_0_30px_rgba(59,130,246,0.05)] border-primary/20' 
          : outstanding > 0 
            ? 'shadow-[0_0_30px_rgba(245,158,11,0.05)] border-amber-500/20' 
            : 'hover:border-border/80'
      )}>
        <div className="flex justify-between items-center shrink-0">
          <div className='flex items-center gap-3 lg:gap-2'>
            <div className="relative size-7 lg:size-6 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Image src={`/${type.toLowerCase()}-logo.png`} alt={type} fill className="object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs lg:text-[11px] font-black uppercase tracking-[0.2em] truncate leading-tight">
                {name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn(
                  "size-1.5 rounded-full transition-all duration-500",
                  isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 animate-pulse"
                )} />
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest leading-none",
                    isOnline ? "text-emerald-600/80" : "text-red-500/60"
                )}>
                  {isOnline ? 'Bridge Terhubung' : 'Bridge Putus'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/20">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1.5 lg:p-1 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-primary" disabled={isExecuting}>
                  {isExecuting ? <Loader2 className="size-4 lg:size-3.5 animate-spin" /> : <Tv className="size-4 lg:size-3.5" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2 border bg-slate-900 rounded-[1.5rem] shadow-2xl" align="end">
                <div className="flex flex-col gap-2">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 text-center mb-1">Xenon Remote</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-full rounded-xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all" 
                        onClick={() => handleRemoteAction('wake')}
                        title="Bangunkan TV"
                    >
                        <Power className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-full rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/10" 
                        onClick={() => handleRemoteAction('sleep')}
                        title="Tidurkan TV"
                    >
                        <Moon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1 bg-white/5 rounded-2xl p-1">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 flex-1 rounded-lg text-white hover:bg-white/10" onClick={() => handleRemoteAction('vol_up')}>
                            <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 flex-1 rounded-lg text-white hover:bg-white/10" onClick={() => handleRemoteAction('home')}>
                            <Home className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <div className="text-[7px] font-black text-center text-white/20 tracking-widest py-0.5">KONTROL TV</div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 flex-1 rounded-lg text-white hover:bg-white/10" onClick={() => handleRemoteAction('vol_down')}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 flex-1 rounded-lg text-slate-400 hover:bg-slate-700" onClick={() => handleRemoteAction('mute')}>
                            <VolumeX className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-8 w-full rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white text-[9px] font-black uppercase tracking-widest" onClick={() => handleRemoteAction('hdmi')}>
                      <Zap className="h-3 w-3 mr-1.5" /> PINDAH HDMI
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center min-h-0 py-4 lg:py-2">
          {is_active ? (
            <CountdownTimer 
              endTime={end_time} 
              remainingSeconds={remaining_seconds} 
              isPaused={is_paused} 
              onTimerEnd={onTimerEnd} 
            />
          ) : outstanding > 0 ? (
            <div 
                className="text-center animate-in fade-in zoom-in duration-500 cursor-pointer group/bill hover:scale-105 transition-transform" 
                onClick={() => { if(checkShift()) setIsDetailOpen(true); }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/50 mb-1">Tagihan Belum Lunas</p>
              <div className="text-2xl lg:text-xl font-black text-amber-600 font-mono tracking-tighter leading-none">{formatCurrency(outstanding)}</div>
              <p className="text-[8px] font-bold text-amber-600/40 mt-2 uppercase tracking-widest group-hover/bill:text-amber-500 transition-colors underline underline-offset-2">Klik Untuk Bayar Sekarang</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
              <div className="size-12 lg:size-8 border-2 border-muted-foreground/30 rounded-full flex items-center justify-center">
                <Activity className="size-6 lg:size-4" />
              </div>
              <span className="text-[10px] lg:text-[9px] font-black uppercase tracking-[0.4em]">Unit Siaga</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <AnimatePresence>
            {is_active && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="grid grid-cols-4 gap-1 p-1 bg-muted/20 rounded-xl border border-border/10"
              >
                <Button variant="ghost" size="sm" className="h-10 lg:h-8 flex flex-col gap-0.5 rounded-lg text-[10px] lg:text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-background" onClick={() => { if(checkShift()) setIsMoveDialogOpen(true); }}>
                  <ArrowRightLeft className="size-3 lg:size-2.5" /> Pindah
                </Button>
                <Button variant="ghost" size="sm" className="h-10 lg:h-8 flex flex-col gap-0.5 rounded-lg text-[10px] lg:text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-emerald-500 hover:bg-background" onClick={() => { if(checkShift()) setIsAddDialogOpen(true); }}>
                  <PlusCircle className="size-3 lg:size-2.5" /> Item
                </Button>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className={cn("h-10 lg:h-8 flex flex-col gap-0.5 rounded-lg text-[10px] lg:text-[8px] font-black uppercase tracking-widest transition-all", isPaid ? "text-amber-500 hover:bg-amber-500/10" : "text-muted-foreground/30 cursor-not-allowed")} disabled={!isPaid || isCrediting}>
                            <Ticket className="size-3 lg:size-2.5" /> Kredit
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-2"><Ticket className="h-5 w-5 text-amber-500" /> Simpan Sisa Waktu?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium">Sesi di unit <b>{name}</b> akan kami hentikan sekarang, dan sisa waktunya akan kami jadikan kode voucher untuk dipakai nanti.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px]">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveCredit} className="bg-amber-600 hover:bg-amber-700 font-bold uppercase tracking-widest text-[10px]">Ya, Jadikan Voucher</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button variant="ghost" size="sm" className="h-10 lg:h-8 flex flex-col gap-0.5 rounded-lg text-[10px] lg:text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-background" onClick={() => setIsDetailOpen(true)}>
                  <Receipt className="size-3 lg:size-2.5" /> Nota
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-2 mx-1 mb-1">
            {is_active ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className={cn("flex-1 h-12 lg:h-9 text-[10px] lg:text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border-border/50", is_paused && "bg-amber-500/10 text-amber-600 border-amber-500/20")} onClick={async () => { if(is_paused) await resumeStation(firestore!, id); else await pauseStation(firestore!, id); }}>
                  {is_paused ? <Play className="size-3 mr-2 fill-current" /> : <Pause className="size-3 mr-2 fill-current" />} {is_paused ? 'Lanjut' : 'Jeda'}
                </Button>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-[1.5] h-12 lg:h-9 text-[10px] lg:text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-destructive/20 bg-gradient-to-br from-red-500 to-red-700">Stop Mabar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Selesaikan Sesi Bermain?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium">Yakin ingin menyudahi mabar di unit <b>{name}</b>? Hardware TV akan kami kembalikan ke layar siaga.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px]">Belum, Lanjut</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onStopSession(id)} className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20">Ya, Selesaikan Sekarang</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Button 
                className={cn(
                  "w-full h-14 lg:h-10 font-black uppercase text-xs lg:text-[10px] tracking-[0.3em] rounded-xl shadow-xl transition-all duration-500",
                  outstanding > 0 ? "bg-muted text-muted-foreground cursor-not-allowed border-none opacity-50" : "bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 hover:scale-[1.02] active:scale-95"
                )} 
                disabled={outstanding > 0} 
                onClick={() => { if(checkShift()) setIsStartDialogOpen(true); }}
              >
                <Zap className="size-3.5 lg:size-3 mr-2 fill-current" /> {outstanding > 0 ? 'Ada Tagihan Gantung' : 'Mulai Mabar'}
              </Button>
            )}
          </div>
        </div>

        <StartSessionDialog 
            stationType={type} 
            pricingRules={pricingRules} 
            fnbItems={fnbItems} 
            onConfirm={(r, f, p, m, d, es) => { 
                if (r) onStartSession(id, r, f, p, m, d, es); 
                setIsStartDialogOpen(false); 
            }} 
            isOpen={isStartDialogOpen} 
            onOpenChange={setIsStartDialogOpen} 
        />
        {is_active && (
            <StartSessionDialog 
                stationType={type} 
                pricingRules={pricingRules} 
                fnbItems={fnbItems} 
                onConfirm={(r, f, p, m, d) => { 
                    if(r && current_transaction_id) onAddTime(id, current_transaction_id, r, p, d); 
                    if(f.length && current_transaction_id) onAddItems(id, current_transaction_id, f, p, d); 
                    setIsAddDialogOpen(false); 
                }} 
                isOpen={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen} 
                isAddingTime={true} 
                outstandingAmount={outstanding} 
            />
        )}
        <MoveStationDialog isOpen={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen} availableStations={availableStations} sourceStationName={name} onConfirm={(targetId) => { if(current_transaction_id) onMoveStation(id, current_transaction_id, targetId); setIsMoveDialogOpen(false); }} />
        {currentTransaction && (
            <TransactionDetailDialog 
                isOpen={isDetailOpen} 
                onOpenChange={setIsDetailOpen} 
                transaction={currentTransaction} 
                onMarkAsPaid={(member) => { if(checkShift()) onMarkAsPaid(currentTransaction.id, member); }} 
            />
        )}

        <Dialog open={showVoucherResult} onOpenChange={setShowVoucherResult}>
            <DialogContent className="max-w-sm bg-background border-border p-0 overflow-hidden rounded-[2rem]">
                <div className="bg-amber-500 h-2 w-full" />
                <div className="p-8 pt-6 text-center">
                    <div className="size-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Ticket className="size-8 text-amber-600" /></div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-center">Kredit Berhasil!</DialogTitle>
                        <DialogDescription className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Sisa waktu telah diamankan</DialogDescription>
                    </DialogHeader>
                    <div className="mt-8 space-y-4">
                        <div className="relative group cursor-pointer" onClick={handleCopyCode}>
                            <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-colors" />
                            <div className="relative p-6 rounded-3xl border-2 border-dashed border-amber-500/30 bg-amber-500/[0.02] flex flex-col items-center justify-center gap-2 overflow-hidden">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/60">Kode Voucher</span>
                                <div className="text-3xl font-black font-mono tracking-[0.2em] text-amber-600 select-all">{generatedCode}</div>
                                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase">{hasCopied ? <Check className="size-3" /> : <Copy className="size-3" />}{hasCopied ? 'Tersalin' : 'Klik Untuk Salin'}</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed text-center">Berikan kode ini kepada pelanggan.<br/>Bisa dipakai di unit tipe <b>{type}</b> mana saja.</p>
                    </div>
                    <div className="mt-8"><DialogClose asChild><Button className="w-full h-12 font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20 rounded-xl">Mantap, Selesai</Button></DialogClose></div>
                </div>
            </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
