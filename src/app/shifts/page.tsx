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
    X
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

  // State untuk Detail Audit
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // History Query
  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'shifts'), orderBy('openedAt', 'desc'), limit(20));
  }, [firestore]);

  const { data: shiftHistory, isLoading: isLoadingHistory } = useCollection<Shift>(historyQuery);

  // Current Shift Transactions Breakdown
  const shiftTransactionsQuery = useMemoFirebase(() => {
    if (!firestore || !activeShift) return null;
    return query(collection(firestore, 'transactions'), where('shiftId', '==', activeShift.id));
  }, [firestore, activeShift]);

  const { data: currentShiftTransactions } = useCollection<Transaction>(shiftTransactionsQuery);

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

  const breakdown = useMemo(() => {
    if (!currentShiftTransactions) return { rental: 0, fnb: 0, count: 0 };
    return currentShiftTransactions.reduce((acc, t) => {
        const rental = (t.additionalCharges || [])
            .filter(c => !c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);
            
        const fnb = (t.additionalCharges || [])
            .filter(c => c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);
            
        return {
            rental: acc.rental + rental,
            fnb: acc.fnb + fnb,
            count: acc.count + 1
        }
    }, { rental: 0, fnb: 0, count: 0 });
  }, [currentShiftTransactions]);

  const handleCloseShift = async () => {
    if (!activeShift) return;
    setIsSubmitting(true);
    try {
      await closeActiveShift(parseInt(actualBalanceInput) || 0, closingNotes);
      setIsClosingOpen(false);
      setActualBalanceInput('0');
      setClosingNotes('');
    } catch (e) {
      // Error handled by provider/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetail = (shiftId: string) => {
      setSelectedShiftId(shiftId);
      setIsDetailOpen(true);
  };

  const actualBalanceNum = parseInt(actualBalanceInput) || 0;
  const isDeficit = activeShift ? actualBalanceNum < activeShift.expectedBalance : false;
  const isMatch = activeShift ? actualBalanceNum === activeShift.expectedBalance : false;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-primary/10 text-primary">
                    <Banknote className="size-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Manajemen Kas Laci</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Shift & <span className="text-primary">Laporan Kasir</span></h1>
        </div>
        {activeShift ? (
            <Badge className="bg-emerald-500 text-white border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider animate-pulse shadow-md shadow-emerald-500/10">
                Shift Sedang Jalan
            </Badge>
        ) : (
            <Button onClick={() => setIsOpeningDialog(true)} size="sm" className="font-bold uppercase tracking-widest px-6 h-9 shadow-lg shadow-primary/20 gap-2">
                <Zap className="size-3.5 fill-current" /> Buka Shift Baru
            </Button>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* LEFT: ACTIVE SHIFT DASHBOARD */}
        <div className="lg:col-span-4 space-y-4">
            <Card className={cn(
                "border transition-all duration-500 overflow-hidden relative group",
                activeShift ? "border-primary/20 bg-card shadow-sm" : "border-dashed border-border opacity-50 bg-muted/30"
            )}>
                {activeShift && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        Status Shift Saat Ini
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-4 pb-4">
                    {activeShift ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Operator Bertugas</p>
                                    <p className="font-bold text-xs truncate">{activeShift.openedByName}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mulai Sejak</p>
                                    <p className="font-bold text-xs font-mono">{format(activeShift.openedAt, 'HH:mm')} WIB</p>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-xl bg-primary/[0.03] border border-primary/10">
                                        <div className="flex items-center gap-1.5 text-primary/60 mb-0.5">
                                            <Gamepad2 className="size-2.5" />
                                            <span className="text-[8px] font-black uppercase">Hasil Sewa</span>
                                        </div>
                                        <p className="text-sm font-black font-mono leading-none">{formatCurrency(breakdown.rental)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                        <div className="flex items-center gap-1.5 text-emerald-600/60 mb-0.5">
                                            <ShoppingCart className="size-2.5" />
                                            <span className="text-[8px] font-black uppercase">Hasil Kantin</span>
                                        </div>
                                        <p className="text-sm font-black font-mono leading-none">{formatCurrency(breakdown.fnb)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/50 border border-border shadow-inner space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-muted-foreground font-medium uppercase">Uang Modal</span>
                                    <span className="font-mono font-bold">{formatCurrency(activeShift.initialBalance)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-muted-foreground font-medium uppercase">Omzet Lunas</span>
                                    <span className="font-mono font-bold text-emerald-500">+{formatCurrency(activeShift.totalSales)}</span>
                                </div>
                                <Separator className="my-1" />
                                <div className="flex justify-between items-end pt-1">
                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">Target Uang Di Laci</span>
                                    <span className="text-xl font-black font-mono text-primary leading-none">
                                        {formatCurrency(activeShift.expectedBalance).replace(',00', '')}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center border border-border">
                                <ShieldAlert className="size-6 text-muted-foreground opacity-30" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black uppercase tracking-tight text-sm">Laci Masih Terkunci</h3>
                                <p className="text-[10px] text-muted-foreground max-w-[160px] mx-auto">Harap buka shift dulu ya sebelum melayani pelanggan.</p>
                            </div>
                            <Button onClick={() => setIsOpeningDialog(true)} variant="outline" size="sm" className="border-primary text-primary h-8 px-6 font-black uppercase text-[9px] tracking-widest rounded-lg">
                                <Zap className="size-3 mr-1.5 fill-current" /> Buka Shift Sekarang
                            </Button>
                        </div>
                    )}
                </CardContent>

                {activeShift && (
                    <CardFooter className="pb-4 px-4">
                        <Dialog open={isClosingOpen} onOpenChange={setIsClosingOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-md shadow-red-500/10 rounded-xl">
                                    <LogOut className="size-3.5" /> Tutup Shift & Akhiri Kerja
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm bg-background">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Calculator className="size-5 text-primary" />
                                        Audit Uang Laci
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-2">
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border flex justify-between items-center shadow-inner">
                                        <div>
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Target Harusnya</p>
                                            <p className="text-2xl font-black font-mono text-primary leading-none">
                                                {formatCurrency(activeShift.expectedBalance).replace(',00', '')}
                                            </p>
                                        </div>
                                        <Calculator className="size-5 text-primary/40" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Uang Fisik di Tangan</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-sm">Rp</span>
                                            <Input 
                                                type="number"
                                                className="h-14 pl-10 text-2xl font-black bg-muted border-border focus:ring-red-500 rounded-xl shadow-inner"
                                                value={actualBalanceInput}
                                                onChange={(e) => setActualBalanceInput(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-4 rounded-xl border transition-all duration-500 flex justify-between items-center",
                                        isMatch ? "bg-emerald-500/5 border-emerald-500/20" : 
                                        isDeficit ? "bg-red-500/5 border-red-500/30" : 
                                        "bg-blue-500/5 border-blue-500/20"
                                    )}>
                                        <div className="space-y-0.5">
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-widest",
                                                isMatch ? "text-emerald-600" : isDeficit ? "text-red-600" : "text-blue-600"
                                            )}>
                                                {isMatch ? 'STATUS: COCOK' : isDeficit ? 'STATUS: KURANG (MINUS)' : 'STATUS: LEBIH (SURPLUS)'}
                                            </p>
                                            <p className={cn(
                                                "text-xl font-black font-mono leading-none",
                                                isMatch ? "text-emerald-600" : isDeficit ? "text-red-600" : "text-blue-600"
                                            )}>
                                                {formatCurrency(Math.abs(actualBalanceNum - activeShift.expectedBalance))}
                                            </p>
                                        </div>
                                        {isMatch ? <CheckCircle2 className="size-5 text-emerald-600" /> : isDeficit ? <ArrowDownRight className="size-5 text-red-600" /> : <ArrowUpRight className="size-5 text-blue-600" />}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Catatan Auditor</Label>
                                        <Textarea 
                                            className="bg-muted border-border min-h-[80px] rounded-xl text-xs p-3"
                                            placeholder={isDeficit ? "Harap jelaskan kenapa uang di laci kurang..." : "Berikan catatan jika ada sesuatu..."}
                                            value={closingNotes}
                                            onChange={(e) => setClosingNotes(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="h-10 rounded-lg font-bold text-xs uppercase">Batal</Button>
                                    </DialogClose>
                                    <Button 
                                        onClick={handleCloseShift} 
                                        disabled={isProcessing || (isDeficit && !closingNotes.trim())} 
                                        className={cn("h-10 flex-1 rounded-lg font-black uppercase text-[10px] tracking-widest", isDeficit && !closingNotes.trim() ? "bg-muted text-muted-foreground" : "bg-red-600 text-white")}
                                    >
                                        {isProcessing ? 'Sabar Ya...' : 'Tutup Shift Sekarang'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}
            </Card>

            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-primary mb-1.5">
                    <ShieldAlert className="size-3.5" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Amanah Kasir</h4>
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                    Setiap rupiah yang selisih akan terekam permanen. Pastikan hitung uang fisik dengan teliti sebelum klik konfirmasi ya.
                </p>
            </div>
        </div>

        {/* RIGHT: HISTORY LIST */}
        <div className="lg:col-span-8">
            <Card className="bg-card border shadow-sm overflow-hidden h-full flex flex-col rounded-2xl">
                <CardHeader className="border-b bg-muted/20 pb-4 pt-4 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <History className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight">Riwayat Tutup Buku</CardTitle>
                                <CardDescription className="text-[10px]">Data shift operasional sebelumnya</CardDescription>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Cari nama staff..." className="pl-8 h-8 w-full sm:w-[160px] text-[10px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow className="border-border hover:bg-transparent h-10">
                                <TableHead className="text-[9px] font-black uppercase text-muted-foreground">Waktu & Staff</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-muted-foreground text-right">Target</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-muted-foreground text-right">Fisik</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-muted-foreground text-center">Status Laci</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-muted-foreground text-center w-12">Detail</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingHistory ? (
                                [1,2,3,4,5].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="py-4 px-4"><Skeleton className="h-10 w-full rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                shiftHistory?.map(shift => {
                                    const diff = shift.difference || 0;
                                    return (
                                        <TableRow key={shift.id} className="border-border group hover:bg-muted/20 transition-colors h-14">
                                            <TableCell className="py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[10px] text-primary uppercase">{shift.openedByName}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                                        {format(shift.openedAt, 'dd/MM HH:mm')} - {shift.closedAt ? format(shift.closedAt, 'HH:mm') : 'MASIH KERJA'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-[10px] font-mono py-2">{formatCurrency(shift.expectedBalance)}</TableCell>
                                            <TableCell className="text-right text-[10px] font-mono font-bold py-2">
                                                {shift.status === 'open' ? <span className="opacity-30 italic">...</span> : formatCurrency(shift.actualBalance || 0)}
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                                {shift.status === 'open' ? '-' : (
                                                    <Badge className={cn(
                                                        "text-[8px] border-none font-bold min-w-[70px] justify-center h-5",
                                                        diff === 0 ? "bg-emerald-500/10 text-emerald-600" : 
                                                        diff > 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {diff === 0 ? 'COCOK' : formatCurrency(Math.abs(diff)).replace('Rp', diff > 0 ? 'LEBIH ' : 'KURANG ')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => openDetail(shift.id)}
                                                >
                                                    <FileText className="size-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* DIALOG DETAIL AUDIT SHIFT */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl bg-[#020617] border-white/5 p-0 overflow-hidden rounded-[1.5rem] shadow-2xl">
              {selectedShift && (
                  <>
                    <div className={cn("h-1.5 w-full", selectedShift.difference === 0 ? "bg-emerald-500" : (selectedShift.difference || 0) < 0 ? "bg-red-500" : "bg-blue-500")} />
                    
                    <DialogHeader className="p-4 md:p-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                <FileText className="size-5 text-primary" />
                                Laporan Rinci Sesi Kerja
                            </DialogTitle>
                            <div className="flex flex-col text-[9px] font-bold uppercase tracking-widest text-white/40">
                                <span>Audit ID: {selectedShift.id}</span>
                                <span className="mt-0.5">Petugas: {selectedShift.openedByName}</span>
                            </div>
                        </div>
                        <Badge variant="outline" className="w-fit border-white/10 bg-white/5 text-white/80 font-black text-[9px] px-3 h-7 tracking-widest">
                            STATUS: {selectedShift.status === 'open' ? 'SESI BERJALAN' : 'FINISH / CLOSED'}
                        </Badge>
                    </DialogHeader>

                    <ScrollArea className="max-h-[65vh]">
                        <div className="p-4 md:p-6 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Summary Card */}
                            <div className="lg:col-span-4 space-y-4">
                                <Card className="bg-white/[0.03] border-white/5 p-4 rounded-[1.2rem] shadow-inner">
                                    <h4 className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Rekap Keuangan</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-white/40 font-bold uppercase">Modal Awal</span>
                                            <span className="text-xs font-black text-white/80 font-mono">{formatCurrency(selectedShift.initialBalance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-white/40 font-bold uppercase">Total Penjualan</span>
                                            <span className="text-xs font-black text-emerald-500 font-mono">+{formatCurrency(selectedShift.totalSales)}</span>
                                        </div>
                                        
                                        <Separator className="bg-white/5" />
                                        
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-primary uppercase">Target Laci</span>
                                            <span className="text-lg font-black font-mono text-primary leading-none">
                                                {formatCurrency(selectedShift.expectedBalance).replace(',00', '')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-white/80 uppercase">Fisik Laci</span>
                                            <span className="text-lg font-black font-mono text-white leading-none">
                                                {formatCurrency(selectedShift.actualBalance || 0).replace(',00', '')}
                                            </span>
                                        </div>

                                        <div className={cn(
                                            "mt-2 p-3 rounded-xl border flex justify-between items-center",
                                            (selectedShift.difference || 0) === 0 
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                                : (selectedShift.difference || 0) < 0 
                                                    ? "bg-red-500/10 border-red-500/20 text-red-500" 
                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                        )}>
                                            <span className="font-black uppercase text-[9px] tracking-widest">Selisih</span>
                                            <span className="font-black font-mono text-base">
                                                {(selectedShift.difference || 0) > 0 ? '+' : ''}
                                                {formatCurrency(selectedShift.difference || 0).replace(',00', '')}
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                {selectedShift.notes && (
                                    <div className="p-4 rounded-[1.2rem] bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                            <AlertTriangle className="size-12 text-amber-500" />
                                        </div>
                                        <h4 className="text-[9px] font-black uppercase text-amber-500 tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <AlertTriangle className="size-2.5" /> Catatan Staff
                                        </h4>
                                        <p className="text-[10px] text-amber-200/60 italic leading-relaxed font-medium">"{selectedShift.notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Data Lists */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Transactions */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                            <Receipt className="size-3 text-primary" /> Daftar Nota Terbit
                                        </h4>
                                        <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-bold h-4 px-2">
                                            {detailTransactions?.length || 0} Transaksi
                                        </Badge>
                                    </div>
                                    <div className="rounded-[1rem] border border-white/5 bg-white/[0.02] overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-white/[0.03] hover:bg-transparent">
                                                <TableRow className="border-white/5 h-9">
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4">Jam</TableHead>
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4 text-center">Unit/Pos</TableHead>
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4 text-right">Netto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detailTransactions?.length ? detailTransactions.sort((a,b) => a.timestamp - b.timestamp).map(t => (
                                                    <TableRow key={t.id} className="border-white/5 h-12 hover:bg-white/[0.03] transition-colors">
                                                        <TableCell className="font-mono text-[10px] text-white/40 px-4">{format(t.timestamp, 'HH:mm')}</TableCell>
                                                        <TableCell className="font-black uppercase text-[10px] text-white/80 text-center px-4">{t.stationName}</TableCell>
                                                        <TableCell className="text-right font-black font-mono text-white/90 text-xs px-4">
                                                            {formatCurrency(t.paidAmount || 0).replace(',00', '')}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-[10px] text-white/20 italic uppercase tracking-widest">Belum ada transaksi</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Expenses */}
                                <div className="space-y-3 pb-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                            <Wallet className="size-3 text-red-500" /> Dana Keluar (Laci)
                                        </h4>
                                        <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-bold h-4 px-2">
                                            {detailExpenses?.length || 0} Pengeluaran
                                        </Badge>
                                    </div>
                                    <div className="rounded-[1rem] border border-white/5 bg-white/[0.02] overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-white/[0.03] hover:bg-transparent">
                                                <TableRow className="border-white/5 h-9">
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4">Jam</TableHead>
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4">Keperluan</TableHead>
                                                    <TableHead className="text-[8px] font-black text-white/30 uppercase tracking-widest px-4 text-right">Nominal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detailExpenses?.length ? detailExpenses.map(e => (
                                                    <TableRow key={e.id} className="border-white/5 h-12 hover:bg-white/[0.03] transition-colors">
                                                        <TableCell className="font-mono text-[10px] text-white/40 px-4">{format(e.timestamp, 'HH:mm')}</TableCell>
                                                        <TableCell className="font-black uppercase text-[10px] text-white/70 px-4 truncate max-w-[150px]">{e.description}</TableCell>
                                                        <TableCell className="text-right font-black font-mono text-red-500 text-xs px-4">
                                                            {formatCurrency(e.amount).replace(',00', '')}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-[10px] text-white/20 italic uppercase tracking-widest">Tidak ada pengeluaran</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-4 md:p-6 pt-2 border-t border-white/5 bg-white/[0.01]">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 bg-transparent text-white/80 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all">
                                Tutup Laporan
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
