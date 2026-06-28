'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import type { Shift, Transaction, Expense } from '@/lib/types';
import { useShift } from '@/components/providers/shift-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    User, 
    Banknote, 
    Calculator, 
    History, 
    AlertTriangle, 
    CheckCircle2, 
    FileText,
    LogOut,
    ShieldAlert,
    Gamepad2,
    ShoppingCart,
    Zap,
    Search,
    Receipt,
    Wallet,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Info,
    Calendar,
    Timer,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ShiftsPage() {
  const firestore = useFirestore();
  const { activeShift, closeActiveShift, setIsOpeningDialog } = useShift();
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [actualBalanceInput, setActualBalanceInput] = useState('0');
  const [closingNotes, setClosingNotes] = useState('');
  const [isProcessing, setIsSubmitting] = useState(false);

  // State untuk Detail Audit & Navigation
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailStep, setDetailStep] = useState(1); // 1: Recap, 2: Transactions, 3: Expenses
  
  // Internal Pagination for Transactions in Dialog
  const [transPage, setTransPage] = useState(0);
  const ITEMS_PER_PAGE = 7; // Dipadatkan agar pas di layar

  // History Query
  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'shifts'), orderBy('openedAt', 'desc'), limit(50));
  }, [firestore]);

  const { data: shiftHistory, isLoading: isLoadingHistory } = useCollection<Shift>(historyQuery);

  // Data untuk Detail Dialog (Historical)
  const detailTransactionsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedShiftId) return null;
    return query(collection(firestore, 'transactions'), where('shiftId', '==', selectedShiftId));
  }, [firestore, selectedShiftId]);

  const detailExpensesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedShiftId) return null;
    return query(collection(firestore, 'expenses'), where('shiftId', '==', selectedShiftId));
  }, [firestore, selectedShiftId]);

  const { data: detailTransactions } = useCollection<Transaction>(detailTransactionsQuery);
  const { data: detailExpenses } = useCollection<Expense>(detailExpensesQuery);

  const selectedShift = useMemo(() => 
    shiftHistory?.find(s => s.id === selectedShiftId), 
    [shiftHistory, selectedShiftId]
  );

  const currentShiftTransactionsQuery = useMemoFirebase(() => {
    if (!firestore || !activeShift) return null;
    return query(collection(firestore, 'transactions'), where('shiftId', '==', activeShift.id));
  }, [firestore, activeShift]);
  const { data: currentShiftTransactions } = useCollection<Transaction>(currentShiftTransactionsQuery);

  const breakdown = useMemo(() => {
    if (!currentShiftTransactions) return { rental: 0, fnb: 0 };
    return currentShiftTransactions.reduce((acc, t) => {
        const rental = (t.additionalCharges || [])
            .filter(c => !c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);
        const fnb = (t.additionalCharges || [])
            .filter(c => c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);
        return { rental: acc.rental + rental, fnb: acc.fnb + fnb };
    }, { rental: 0, fnb: 0 });
  }, [currentShiftTransactions]);

  // Pagination Logic for Step 2
  const paginatedTransactions = useMemo(() => {
      if (!detailTransactions) return [];
      const sorted = [...detailTransactions].sort((a, b) => b.timestamp - a.timestamp);
      return sorted.slice(transPage * ITEMS_PER_PAGE, (transPage + 1) * ITEMS_PER_PAGE);
  }, [detailTransactions, transPage]);

  const totalTransPages = Math.ceil((detailTransactions?.length || 0) / ITEMS_PER_PAGE);

  const handleCloseShift = async () => {
    if (!activeShift) return;
    setIsSubmitting(true);
    try {
      await closeActiveShift(parseInt(actualBalanceInput) || 0, closingNotes);
      setIsClosingOpen(false);
      setActualBalanceInput('0');
      setClosingNotes('');
    } catch (e) {} finally { setIsSubmitting(false); }
  };

  const openDetail = (shiftId: string) => {
      setSelectedShiftId(shiftId);
      setDetailStep(1);
      setTransPage(0);
      setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-primary/10 text-primary"><Banknote className="size-3.5" /></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Manajemen Kas Laci</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Shift & <span className="text-primary">Laporan Kasir</span></h1>
        </div>
        {activeShift ? (
            <Badge className="bg-emerald-500 text-white border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider animate-pulse shadow-md shadow-emerald-500/10">Shift Sedang Jalan</Badge>
        ) : (
            <Button onClick={() => setIsOpeningDialog(true)} size="sm" className="font-bold uppercase tracking-widest px-6 h-9 shadow-lg shadow-primary/20 gap-2"><Zap className="size-3.5 fill-current" /> Buka Shift Baru</Button>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* LEFT: ACTIVE SHIFT DASHBOARD */}
        <div className="lg:col-span-4 space-y-4">
            <Card className={cn("border transition-all duration-500 overflow-hidden relative group", activeShift ? "border-primary/20 bg-card shadow-sm" : "border-dashed border-border opacity-50 bg-muted/30")}>
                {activeShift && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2"><Activity className="size-4 text-primary" /> Status Laci Terkini</CardTitle></CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                    {activeShift ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Petugas</p>
                                    <p className="font-black text-xs truncate text-primary uppercase">{activeShift.openedByName}</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Waktu Buka</p>
                                    <p className="font-bold text-xs font-mono">{format(activeShift.openedAt, 'HH:mm')} WIB</p>
                                </div>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-xl bg-primary/[0.03] border border-primary/10">
                                    <div className="flex items-center gap-1.5 text-primary/60 mb-0.5"><Gamepad2 className="size-2.5" /><span className="text-[8px] font-black uppercase">Sewa</span></div>
                                    <p className="text-sm font-black font-mono">{formatCurrency(breakdown.rental)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                    <div className="flex items-center gap-1.5 text-emerald-600/60 mb-0.5"><ShoppingCart className="size-2.5" /><span className="text-[8px] font-black uppercase">Kantin</span></div>
                                    <p className="text-sm font-black font-mono">{formatCurrency(breakdown.fnb)}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50 border border-border shadow-inner space-y-1.5">
                                <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground uppercase font-bold">Modal Awal</span><span className="font-mono font-bold">{formatCurrency(activeShift.initialBalance)}</span></div>
                                <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground uppercase font-bold">Total Sales</span><span className="font-mono font-bold text-emerald-600">+{formatCurrency(activeShift.totalSales)}</span></div>
                                <Separator className="my-1.5" />
                                <div className="flex justify-between items-end pt-1">
                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">Target di Laci</span>
                                    <span className="text-xl font-black font-mono text-primary leading-none">{formatCurrency(activeShift.expectedBalance).replace(',00', '')}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center border border-border"><ShieldAlert className="size-6 text-muted-foreground opacity-30" /></div>
                            <div className="space-y-1"><h3 className="font-black uppercase tracking-tight text-sm">Laci Terkunci</h3><p className="text-[10px] text-muted-foreground">Harap buka shift dulu untuk mulai kerja.</p></div>
                            <Button onClick={() => setIsOpeningDialog(true)} variant="outline" size="sm" className="border-primary text-primary h-8 px-6 font-black uppercase text-[9px] tracking-widest rounded-lg">Buka Shift Sekarang</Button>
                        </div>
                    )}
                </CardContent>
                {activeShift && (
                    <CardFooter className="pb-4 px-4">
                        <Dialog open={isClosingOpen} onOpenChange={setIsClosingOpen}>
                            <DialogTrigger asChild><Button size="sm" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl shadow-lg shadow-red-600/10"><LogOut className="size-3.5" /> Tutup Buku & Laci</Button></DialogTrigger>
                            <DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Calculator className="size-5 text-primary" /> Audit Uang Laci</DialogTitle><DialogDescription>Pastikan uang fisik di laci sesuai dengan hitungan sistem.</DialogDescription></DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border flex justify-between items-center"><div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Target Harusnya</p><p className="text-2xl font-black font-mono text-primary leading-none">{formatCurrency(activeShift.expectedBalance).replace(',00', '')}</p></div><Calculator className="size-5 text-primary/40" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Total Uang Fisik</Label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-sm">Rp</span><Input type="number" className="h-14 pl-10 text-2xl font-black bg-muted rounded-xl" value={actualBalanceInput} onChange={(e) => setActualBalanceInput(e.target.value)} autoFocus /></div></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Catatan Shift</Label><Textarea className="bg-muted border-border min-h-[80px] rounded-xl text-xs" placeholder="Kenapa ada selisih? Tulis kendala di sini..." value={closingNotes} onChange={(e) => setClosingNotes(e.target.value)} /></div>
                                </div>
                                <DialogFooter className="gap-2"><DialogClose asChild><Button variant="outline" className="h-10 rounded-lg font-bold text-xs">Batal</Button></DialogClose><Button onClick={handleCloseShift} disabled={isProcessing} className="h-10 flex-1 bg-red-600 text-white font-black uppercase text-[10px]">Lunas & Tutup</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}
            </Card>
        </div>

        {/* RIGHT: HISTORY LIST */}
        <div className="lg:col-span-8">
            <Card className="bg-card border shadow-sm overflow-hidden h-full flex flex-col rounded-[1.5rem]">
                <CardHeader className="border-b bg-muted/20 pb-4 pt-4 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><History className="size-4" /></div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Riwayat Tutup Buku</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10"><TableRow className="border-border hover:bg-transparent h-10"><TableHead className="text-[9px] font-black uppercase px-6">Operator & Waktu</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Target Laci</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Uang Fisik</TableHead><TableHead className="text-[9px] font-black uppercase text-center">Hasil Audit</TableHead><TableHead className="text-[9px] font-black uppercase text-center w-12"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {isLoadingHistory ? [1,2,3,4].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-4"><Skeleton className="h-10 w-full rounded-lg" /></TableCell></TableRow>) :
                                shiftHistory?.map(shift => (
                                    <TableRow key={shift.id} className="border-border group hover:bg-muted/20 h-14">
                                        <TableCell className="py-2 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[10px] text-primary uppercase tracking-tight">{shift.openedByName}</span>
                                                <span className="text-[9px] text-muted-foreground font-mono">{format(shift.openedAt, 'dd MMM, HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-mono font-bold">{formatCurrency(shift.expectedBalance).replace(',00', '')}</TableCell>
                                        <TableCell className="text-right text-xs font-mono font-bold text-foreground">{shift.status === 'open' ? '...' : formatCurrency(shift.actualBalance || 0).replace(',00', '')}</TableCell>
                                        <TableCell className="text-center py-2">
                                            {shift.status === 'open' ? (
                                                <Badge className="bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase border-none px-3">OPEN SESSION</Badge>
                                            ) : (
                                                <Badge className={cn("text-[8px] font-bold min-w-[70px] justify-center h-5 border-none uppercase tracking-tighter", (shift.difference || 0) === 0 ? "bg-emerald-500/10 text-emerald-600" : (shift.difference || 0) > 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600")}>
                                                    {(shift.difference || 0) === 0 ? 'COCOK' : formatCurrency(Math.abs(shift.difference || 0)).replace('Rp', (shift.difference || 0) > 0 ? 'SURPLUS ' : 'DEFISIT ')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-2 pr-4"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 bg-muted/50 rounded-lg" onClick={() => openDetail(shift.id)}><FileText className="size-4" /></Button></TableCell>
                                    </TableRow>
                                ))
                            }
                            {!isLoadingHistory && shiftHistory?.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic text-xs uppercase font-bold tracking-widest opacity-20">Belum ada riwayat audit</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* 3-STEP PREMIUM DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-xl bg-[#020617] border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
              {selectedShift && (
                  <>
                    <div className={cn("h-1.5 w-full", selectedShift.status === 'open' ? 'bg-blue-500' : (selectedShift.difference || 0) === 0 ? "bg-emerald-500" : (selectedShift.difference || 0) < 0 ? "bg-red-500" : "bg-blue-500")} />
                    <DialogHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-xl shadow-primary/10 border border-primary/20"><FileText className="size-6" /></div>
                                <div className="space-y-0.5">
                                    <DialogTitle className="text-xl font-black uppercase text-white tracking-tight">Audit Sesi Kerja</DialogTitle>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">{selectedShift.openedByName} • ID: {selectedShift.id.substring(0,8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
                                {[1,2,3].map(i => (
                                    <button 
                                        key={i} 
                                        onClick={() => setDetailStep(i)}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-500", 
                                            detailStep === i ? "w-8 bg-primary" : "w-1.5 bg-white/10 hover:bg-white/20"
                                        )} 
                                    />
                                ))}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-[380px] px-8 py-2">
                        {detailStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* TIME LOGS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar className="size-14" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1.5 tracking-widest flex items-center gap-2"><div className="size-1.5 rounded-full bg-emerald-500" /> Jam Buka Laci</p>
                                            <p className="text-sm font-black text-white">{format(selectedShift.openedAt, 'dd MMMM yyyy', { locale: id })}</p>
                                            <p className="text-xl font-black text-primary font-mono tabular-nums">{format(selectedShift.openedAt, 'HH:mm:ss')} <span className="text-[10px]">WIB</span></p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Timer className="size-14" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1.5 tracking-widest flex items-center gap-2"><div className="size-1.5 rounded-full bg-red-500" /> Jam Tutup Buku</p>
                                            {selectedShift.closedAt ? (
                                                <>
                                                    <p className="text-sm font-black text-white">{format(selectedShift.closedAt, 'dd MMMM yyyy', { locale: id })}</p>
                                                    <p className="text-xl font-black text-red-400 font-mono tabular-nums">{format(selectedShift.closedAt, 'HH:mm:ss')} <span className="text-[10px]">WIB</span></p>
                                                </>
                                            ) : (
                                                <div className="h-[4.5rem] flex items-center">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-none px-4 h-7 font-black uppercase text-[10px] animate-pulse">SESI MASIH AKTIF</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-white/[0.02] border-white/5 p-5 rounded-3xl">
                                        <p className="text-[9px] font-black uppercase text-white/40 mb-4 tracking-widest flex items-center gap-2"><Banknote className="size-3.5" /> Ringkasan Keuangan</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px]"><span className="text-white/40 uppercase font-bold">Saldo Awal</span><span className="text-white font-mono">{formatCurrency(selectedShift.initialBalance)}</span></div>
                                            <div className="flex justify-between text-[10px]"><span className="text-white/40 uppercase font-bold">Penjualan</span><span className="text-emerald-500 font-mono font-bold">+{formatCurrency(selectedShift.totalSales)}</span></div>
                                            <Separator className="bg-white/5 my-3" />
                                            <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-primary tracking-widest">Target Laci</span><span className="text-2xl font-black text-primary font-mono leading-none tabular-nums">{formatCurrency(selectedShift.expectedBalance).replace(',00', '')}</span></div>
                                        </div>
                                    </Card>
                                    <Card className="bg-white/[0.02] border-white/5 p-5 rounded-3xl flex flex-col justify-center">
                                        <p className="text-[9px] font-black uppercase text-white/40 mb-4 tracking-widest flex items-center gap-2"><Calculator className="size-3.5" /> Hitungan Fisik</p>
                                        <div className="flex justify-between items-end mb-3"><span className="text-[10px] font-black uppercase text-white/60">Uang Di Laci</span><span className="text-2xl font-black text-white font-mono leading-none tabular-nums">{selectedShift.status === 'open' ? '---' : formatCurrency(selectedShift.actualBalance || 0).replace(',00', '')}</span></div>
                                        <div className={cn("p-3 rounded-2xl flex justify-between items-center border transition-colors", selectedShift.status === 'open' ? "bg-white/5 border-white/5" : (selectedShift.difference || 0) === 0 ? "bg-emerald-500/10 border-emerald-500/20" : (selectedShift.difference || 0) < 0 ? "bg-red-500/10 border-red-500/20" : "bg-blue-500/10 border-blue-500/20")}>
                                            <span className="text-[9px] font-black uppercase opacity-60">Status Selisih</span>
                                            <span className="text-sm font-black font-mono">{(selectedShift.difference || 0) > 0 ? '+' : ''}{formatCurrency(selectedShift.difference || 0)}</span>
                                        </div>
                                    </Card>
                                </div>
                                <div className="p-4 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 relative overflow-hidden">
                                    <p className="text-[9px] font-black uppercase text-amber-500 mb-2 flex items-center gap-2"><Info className="size-3" /> Memo Operator</p>
                                    <p className="text-xs text-white/70 italic leading-relaxed">"{selectedShift.notes || 'Staff tidak meninggalkan catatan khusus untuk shift ini.'}"</p>
                                </div>
                            </div>
                        )}

                        {detailStep === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/20"><Receipt className="size-4" /></div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Nota Terbit ({detailTransactions?.length || 0})</h4>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-black text-white/30 uppercase font-mono">{transPage + 1} / {totalTransPages || 1}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white" onClick={() => setTransPage(p => Math.max(0, p - 1))} disabled={transPage === 0}><ChevronLeft className="size-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white" onClick={() => setTransPage(p => Math.min(totalTransPages - 1, p + 1))} disabled={transPage >= totalTransPages - 1}><ChevronRight className="size-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-[1.5rem] border border-white/5 overflow-hidden bg-white/[0.01]">
                                    <Table>
                                        <TableHeader className="bg-white/5"><TableRow className="border-white/5 h-10"><TableHead className="text-[9px] font-black px-6 uppercase text-white/40 tracking-widest">Waktu</TableHead><TableHead className="text-[9px] font-black px-6 uppercase text-white/40 tracking-widest">Unit / Deskripsi</TableHead><TableHead className="text-[9px] font-black px-6 uppercase text-white/40 tracking-widest text-right">Total Netto</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {paginatedTransactions.map(t => (
                                                <TableRow key={t.id} className="border-white/5 h-12 hover:bg-white/[0.04] transition-colors">
                                                    <TableCell className="font-mono text-[10px] text-white/40 px-6 tabular-nums">{format(t.timestamp, 'HH:mm')}</TableCell>
                                                    <TableCell className="font-bold text-[11px] text-white/80 uppercase px-6 tracking-tight truncate max-w-[180px]">{t.stationName}</TableCell>
                                                    <TableCell className="text-right font-black font-mono text-white/90 text-xs px-6 tabular-nums">{formatCurrency(t.paidAmount || 0).replace(',00', '')}</TableCell>
                                                </TableRow>
                                            ))}
                                            {(!detailTransactions || detailTransactions.length === 0) && <TableRow><TableCell colSpan={3} className="h-48 text-center text-[11px] text-white/10 uppercase italic font-bold tracking-widest">Belum ada transaksi di shift ini</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {detailStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="p-2 rounded-xl bg-red-500/20 text-red-500 border border-red-500/20"><Wallet className="size-4" /></div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Pengeluaran Kasir ({detailExpenses?.length || 0})</h4>
                                </div>
                                <ScrollArea className="h-[280px] rounded-[1.5rem] border border-white/5 bg-white/[0.01]">
                                    <Table>
                                        <TableHeader className="bg-white/5"><TableRow className="border-white/5 h-10"><TableHead className="text-[9px] font-black px-6 uppercase text-white/40">Keterangan Biaya</TableHead><TableHead className="text-[9px] font-black px-6 uppercase text-white/40 text-right">Nominal</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {detailExpenses?.map(e => (
                                                <TableRow key={e.id} className="border-white/5 h-14 hover:bg-white/[0.04] transition-colors">
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[11px] text-white/80 uppercase truncate max-w-[250px] tracking-tight">{e.description}</span>
                                                            <span className="text-[9px] text-white/20 font-mono uppercase">{e.category} • {format(e.timestamp, 'HH:mm')} WIB</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-black font-mono text-red-500 text-xs px-6 tabular-nums">{formatCurrency(e.amount).replace(',00', '')}</TableCell>
                                                </TableRow>
                                            ))}
                                            {(!detailExpenses || detailExpenses.length === 0) && <TableRow><TableCell colSpan={2} className="h-48 text-center text-[11px] text-white/10 uppercase italic font-bold tracking-widest">Tidak ada catatan dana keluar</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-row items-center justify-between gap-4">
                        <div className="flex gap-2 flex-1">
                            {detailStep > 1 && (
                                <Button variant="outline" className="h-12 rounded-2xl border-white/10 bg-transparent text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/5" onClick={() => setDetailStep(s => s - 1)}><ChevronLeft className="size-4 mr-2" /> Kembali</Button>
                            )}
                            <DialogClose asChild><Button variant="ghost" className="h-12 rounded-2xl text-white/30 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">Tutup</Button></DialogClose>
                        </div>
                        {detailStep < 3 ? (
                            <Button className="h-12 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90" onClick={() => setDetailStep(s => s + 1)}>
                                {detailStep === 1 ? 'Daftar Nota' : 'Daftar Biaya'} <ArrowRight className="size-4" />
                            </Button>
                        ) : (
                            <div className="bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <CheckCircle2 className="size-4" /> Audit Selesai
                                </span>
                            </div>
                        )}
                    </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
