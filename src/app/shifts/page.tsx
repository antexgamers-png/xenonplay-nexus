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
    TrendingUp,
    LogOut,
    ShieldAlert,
    Gamepad2,
    ShoppingCart,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Receipt,
    Wallet,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Info
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
  const ITEMS_PER_PAGE = 8;

  // History Query
  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'shifts'), orderBy('openedAt', 'desc'), limit(20));
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
                <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2"><User className="size-4 text-primary" /> Status Shift Saat Ini</CardTitle></CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                    {activeShift ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-0.5"><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Staff</p><p className="font-bold text-xs truncate">{activeShift.openedByName}</p></div>
                                <div className="space-y-0.5"><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mulai</p><p className="font-bold text-xs font-mono">{format(activeShift.openedAt, 'HH:mm')} WIB</p></div>
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
                            <div className="p-4 rounded-2xl bg-muted/50 border border-border shadow-inner space-y-1">
                                <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground uppercase">Modal</span><span className="font-mono font-bold">{formatCurrency(activeShift.initialBalance)}</span></div>
                                <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground uppercase">Omzet</span><span className="font-mono font-bold text-emerald-500">+{formatCurrency(activeShift.totalSales)}</span></div>
                                <Separator className="my-1" />
                                <div className="flex justify-between items-end pt-1"><span className="text-[9px] font-black uppercase text-primary tracking-widest">Target Laci</span><span className="text-xl font-black font-mono text-primary leading-none">{formatCurrency(activeShift.expectedBalance).replace(',00', '')}</span></div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center border border-border"><ShieldAlert className="size-6 text-muted-foreground opacity-30" /></div>
                            <div className="space-y-1"><h3 className="font-black uppercase tracking-tight text-sm">Laci Terkunci</h3><p className="text-[10px] text-muted-foreground">Harap buka shift dulu ya.</p></div>
                            <Button onClick={() => setIsOpeningDialog(true)} variant="outline" size="sm" className="border-primary text-primary h-8 px-6 font-black uppercase text-[9px] tracking-widest rounded-lg">Buka Shift Sekarang</Button>
                        </div>
                    )}
                </CardContent>
                {activeShift && (
                    <CardFooter className="pb-4 px-4">
                        <Dialog open={isClosingOpen} onOpenChange={setIsClosingOpen}>
                            <DialogTrigger asChild><Button size="sm" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"><LogOut className="size-3.5" /> Tutup Shift</Button></DialogTrigger>
                            <DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Calculator className="size-5 text-primary" /> Audit Uang Laci</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border flex justify-between items-center"><div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Target Harusnya</p><p className="text-2xl font-black font-mono text-primary leading-none">{formatCurrency(activeShift.expectedBalance).replace(',00', '')}</p></div><Calculator className="size-5 text-primary/40" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Uang Fisik</Label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-sm">Rp</span><Input type="number" className="h-14 pl-10 text-2xl font-black bg-muted rounded-xl" value={actualBalanceInput} onChange={(e) => setActualBalanceInput(e.target.value)} autoFocus /></div></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Catatan</Label><Textarea className="bg-muted border-border min-h-[80px] rounded-xl text-xs" placeholder="Kenapa uang di laci selisih?" value={closingNotes} onChange={(e) => setClosingNotes(e.target.value)} /></div>
                                </div>
                                <DialogFooter className="gap-2"><DialogClose asChild><Button variant="outline" className="h-10 rounded-lg font-bold text-xs">Batal</Button></DialogClose><Button onClick={handleCloseShift} disabled={isProcessing} className="h-10 flex-1 bg-red-600 text-white font-black uppercase text-[10px]">Tutup Shift</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}
            </Card>
        </div>

        {/* RIGHT: HISTORY LIST */}
        <div className="lg:col-span-8">
            <Card className="bg-card border shadow-sm overflow-hidden h-full flex flex-col rounded-2xl">
                <CardHeader className="border-b bg-muted/20 pb-4 pt-4 px-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><History className="size-4" /></div>
                        <CardTitle className="text-sm font-black uppercase">Riwayat Tutup Buku</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10"><TableRow className="border-border hover:bg-transparent h-10"><TableHead className="text-[9px] font-black uppercase">Staff & Waktu</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Target</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Fisik</TableHead><TableHead className="text-[9px] font-black uppercase text-center">Status</TableHead><TableHead className="text-[9px] font-black uppercase text-center w-12">Detail</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {isLoadingHistory ? [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-4"><Skeleton className="h-10 w-full rounded-lg" /></TableCell></TableRow>) :
                                shiftHistory?.map(shift => (
                                    <TableRow key={shift.id} className="border-border group hover:bg-muted/20 h-14">
                                        <TableCell className="py-2"><div className="flex flex-col"><span className="font-bold text-[10px] text-primary uppercase">{shift.openedByName}</span><span className="text-[9px] text-muted-foreground font-mono">{format(shift.openedAt, 'dd/MM HH:mm')}</span></div></TableCell>
                                        <TableCell className="text-right text-[10px] font-mono">{formatCurrency(shift.expectedBalance)}</TableCell>
                                        <TableCell className="text-right text-[10px] font-mono font-bold">{shift.status === 'open' ? '...' : formatCurrency(shift.actualBalance || 0)}</TableCell>
                                        <TableCell className="text-center py-2">
                                            {shift.status === 'open' ? '-' : (
                                                <Badge className={cn("text-[8px] font-bold min-w-[60px] justify-center h-5", (shift.difference || 0) === 0 ? "bg-emerald-500/10 text-emerald-600" : (shift.difference || 0) > 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600")}>
                                                    {(shift.difference || 0) === 0 ? 'COCOK' : formatCurrency(Math.abs(shift.difference || 0)).replace('Rp', (shift.difference || 0) > 0 ? 'SURPLUS ' : 'DEFISIT ')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-2"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openDetail(shift.id)}><FileText className="size-3.5" /></Button></TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* STEPPED DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-xl bg-[#020617] border-white/10 p-0 overflow-hidden rounded-[1.5rem] shadow-2xl">
              {selectedShift && (
                  <>
                    <div className={cn("h-1 w-full", (selectedShift.difference || 0) === 0 ? "bg-emerald-500" : (selectedShift.difference || 0) < 0 ? "bg-red-500" : "bg-blue-500")} />
                    <DialogHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/20 text-primary"><FileText className="size-4" /></div>
                                <div><DialogTitle className="text-base font-black uppercase text-white tracking-tight">Audit Sesi Kerja</DialogTitle><p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">{selectedShift.openedByName} • {format(selectedShift.openedAt, 'dd MMM yyyy', { locale: id })}</p></div>
                            </div>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className={cn("h-0.5 rounded-full transition-all", detailStep === i ? "w-4 bg-primary" : "w-1 bg-white/10")} />)}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-[320px] px-5 py-2">
                        {detailStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="bg-white/[0.02] border-white/5 p-3 rounded-xl">
                                        <p className="text-[8px] font-black uppercase text-white/40 mb-2">Rekap Keuangan</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px]"><span className="text-white/40 uppercase">Modal</span><span className="text-white font-mono">{formatCurrency(selectedShift.initialBalance)}</span></div>
                                            <div className="flex justify-between text-[10px]"><span className="text-white/40 uppercase">Jualan</span><span className="text-emerald-500 font-mono">+{formatCurrency(selectedShift.totalSales)}</span></div>
                                            <Separator className="bg-white/5 my-1" />
                                            <div className="flex justify-between items-end"><span className="text-[9px] font-black uppercase text-primary">Target</span><span className="text-lg font-black text-primary font-mono leading-none">{formatCurrency(selectedShift.expectedBalance).replace(',00', '')}</span></div>
                                        </div>
                                    </Card>
                                    <Card className="bg-white/[0.02] border-white/5 p-3 rounded-xl flex flex-col justify-center">
                                        <p className="text-[8px] font-black uppercase text-white/40 mb-2">Audit Laci Fisik</p>
                                        <div className="flex justify-between items-end mb-2"><span className="text-[9px] font-black uppercase text-white/60">Saldo Fisik</span><span className="text-lg font-black text-white font-mono leading-none">{formatCurrency(selectedShift.actualBalance || 0).replace(',00', '')}</span></div>
                                        <div className={cn("p-2 rounded-lg flex justify-between items-center", (selectedShift.difference || 0) === 0 ? "bg-emerald-500/10" : (selectedShift.difference || 0) < 0 ? "bg-red-500/10" : "bg-blue-500/10")}>
                                            <span className="text-[8px] font-black uppercase opacity-60">Selisih</span>
                                            <span className="text-xs font-black font-mono">{(selectedShift.difference || 0) > 0 ? '+' : ''}{formatCurrency(selectedShift.difference || 0)}</span>
                                        </div>
                                    </Card>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
                                    <p className="text-[8px] font-black uppercase text-amber-500 mb-2 flex items-center gap-1.5"><Info className="size-2.5" /> Memo Operator</p>
                                    <p className="text-[11px] text-white/70 italic leading-relaxed">"{selectedShift.notes || 'Tidak ada catatan khusus.'}"</p>
                                </div>
                            </div>
                        )}

                        {detailStep === 2 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2"><Receipt className="size-3 text-primary" /> Daftar Nota Terbit ({detailTransactions?.length || 0})</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-white/20 uppercase">{transPage + 1} / {totalTransPages || 1}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setTransPage(p => Math.max(0, p - 1))} disabled={transPage === 0}><ChevronLeft className="size-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setTransPage(p => Math.min(totalTransPages - 1, p + 1))} disabled={transPage >= totalTransPages - 1}><ChevronRight className="size-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-white/5"><TableRow className="border-white/5 h-8"><TableHead className="text-[8px] font-black px-4 uppercase">Jam</TableHead><TableHead className="text-[8px] font-black px-4 uppercase">Unit</TableHead><TableHead className="text-[8px] font-black px-4 uppercase text-right">Netto</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {paginatedTransactions.map(t => (
                                                <TableRow key={t.id} className="border-white/5 h-10 hover:bg-white/5 transition-colors"><TableCell className="font-mono text-[9px] text-white/30 px-4">{format(t.timestamp, 'HH:mm')}</TableCell><TableCell className="font-bold text-[10px] text-white/80 uppercase px-4">{t.stationName}</TableCell><TableCell className="text-right font-black font-mono text-white/90 text-xs px-4">{formatCurrency(t.paidAmount || 0).replace(',00', '')}</TableCell></TableRow>
                                            ))}
                                            {(!detailTransactions || detailTransactions.length === 0) && <TableRow><TableCell colSpan={3} className="h-40 text-center text-[9px] text-white/10 uppercase italic">Kosong</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {detailStep === 3 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-1"><Wallet className="size-3 text-red-500" /> Rekap Pengeluaran Kas ({detailExpenses?.length || 0})</h4>
                                <ScrollArea className="h-[260px] rounded-xl border border-white/5">
                                    <Table>
                                        <TableHeader className="bg-white/5"><TableRow className="border-white/5 h-8"><TableHead className="text-[8px] font-black px-4 uppercase">Item</TableHead><TableHead className="text-[8px] font-black px-4 uppercase text-right">Nominal</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {detailExpenses?.map(e => (
                                                <TableRow key={e.id} className="border-white/5 h-12 hover:bg-white/5"><TableCell className="px-4"><div className="flex flex-col"><span className="font-bold text-[10px] text-white/80 uppercase truncate max-w-[200px]">{e.description}</span><span className="text-[8px] text-white/20 font-mono uppercase">{e.category} • {format(e.timestamp, 'HH:mm')}</span></div></TableCell><TableCell className="text-right font-black font-mono text-red-500 text-xs px-4">{formatCurrency(e.amount).replace(',00', '')}</TableCell></TableRow>
                                            ))}
                                            {(!detailExpenses || detailExpenses.length === 0) && <TableRow><TableCell colSpan={2} className="h-40 text-center text-[9px] text-white/10 uppercase italic">Tidak ada pengeluaran</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-5 border-t border-white/5 bg-white/[0.02] flex flex-row items-center justify-between gap-3">
                        <div className="flex gap-2 flex-1">
                            {detailStep > 1 && (
                                <Button variant="outline" className="h-10 rounded-xl border-white/10 bg-transparent text-white/60 font-bold uppercase text-[9px]" onClick={() => setDetailStep(s => s - 1)}><ChevronLeft className="size-3 mr-1" /> Kembali</Button>
                            )}
                            <DialogClose asChild><Button variant="ghost" className="h-10 rounded-xl text-white/30 font-bold uppercase text-[9px]">Tutup</Button></DialogClose>
                        </div>
                        {detailStep < 3 ? (
                            <Button className="h-10 px-8 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl shadow-primary/20" onClick={() => setDetailStep(s => s + 1)}>
                                {detailStep === 1 ? 'Lihat Nota' : 'Lihat Pengeluaran'} <ArrowRight className="size-3" />
                            </Button>
                        ) : (
                            <div className="bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20"><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="size-3" /> Audit Selesai</span></div>
                        )}
                    </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
