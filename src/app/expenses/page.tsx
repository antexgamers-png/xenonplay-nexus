'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Plus, Wallet, Trash2, Receipt, Search, History, CalendarDays, Zap, Filter, FileSpreadsheet, User, Banknote } from 'lucide-react';
import { addExpense, deleteExpense } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { useShift } from '@/components/providers/shift-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { Separator } from '@/components/ui/separator';

const CATEGORIES: { value: ExpenseCategory; label: string; color: string }[] = [
  { value: 'electricity', label: 'Listrik / Token', color: 'bg-amber-500' },
  { value: 'stock', label: 'Belanja Stok (Snack/Minum)', color: 'bg-emerald-500' },
  { value: 'salary', label: 'Gaji Karyawan', color: 'bg-blue-500' },
  { value: 'maintenance', label: 'Perbaikan / Service', color: 'bg-red-500' },
  { value: 'rent', label: 'Sewa Tempat', color: 'bg-purple-500' },
  { value: 'other', label: 'Lain-lain', color: 'bg-slate-500' },
];

export default function ExpensesPage() {
  const firestore = useFirestore();
  const { role, isRoleLoading } = useAuth();
  const { activeShift, setIsOpeningDialog } = useShift();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rangeType, setRangeType] = useState<string>('today');
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'timestamp'>>({
    amount: 0,
    description: '',
    category: 'other',
    source: 'drawer',
    shiftId: null
  });

  const handleRangeChange = (value: string) => {
    setRangeType(value);
    const now = new Date();
    
    switch (value) {
      case 'today':
        setDate({ from: startOfDay(now), to: endOfDay(now) });
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        setDate({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case 'activeShift':
        if (activeShift) {
            setDate({ from: new Date(activeShift.openedAt), to: endOfDay(now) });
        }
        break;
      case '3days':
        setDate({ from: startOfDay(subDays(now, 2)), to: endOfDay(now) });
        break;
      case '7days':
        setDate({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
        break;
      case '30days':
        setDate({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) });
        break;
      case 'thisMonth':
        setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'lastMonth':
        const prevMonth = subMonths(now, 1);
        setDate({ from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) });
        break;
      case 'custom':
        break;
    }
  };

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Shift Belum Dibuka",
        description: "Harap buka shift kasir terlebih dahulu untuk mencatat pengeluaran.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore || isRoleLoading) return null;
    return query(collection(firestore, 'expenses'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore, isRoleLoading]);

  const { data: expenses, isLoading } = useCollection<Expense>(expensesQuery);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter(e => {
        // Date Filter
        const fromTime = date?.from?.getTime() || 0;
        const toTime = date?.to ? date.to.getTime() : (date?.from ? endOfDay(date.from).getTime() : Infinity);
        const matchesDate = e.timestamp >= fromTime && e.timestamp <= toTime;

        // Category Filter
        const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

        // Search Filter
        const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesDate && matchesCategory && matchesSearch;
    });
  }, [expenses, date, categoryFilter, searchQuery]);

  const totalExpense = useMemo(() => {
      return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkShift()) return;
    if (!firestore || formData.amount <= 0 || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      await addExpense(firestore, {
          ...formData,
          shiftId: activeShift?.id || null
      });
      toast({ title: "Berhasil", description: "Pengeluaran telah dicatat.", variant: "success" });
      setIsAddOpen(false);
      setFormData({ amount: 0, description: '', category: 'other', source: 'drawer', shiftId: null });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!firestore) return;
      try {
          await deleteExpense(firestore, id);
          toast({ title: "Dihapus", variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  }

  if (!isRoleLoading && role !== 'admin') {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <Wallet className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase">Akses Terbatas</h2>
            <p className="text-muted-foreground max-w-sm">Hanya Admin yang dapat mengelola dan memantau biaya operasional bisnis.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 lg:px-0">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-red-500/10 text-red-500">
                    <Wallet className="size-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Operational Costs</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Biaya <span className="text-primary">Operasional</span></h1>
        </div>
        <Button onClick={() => { if(checkShift()) setIsAddOpen(true); }} className="font-black uppercase tracking-widest text-[10px] h-10 gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-3.5 w-3.5" /> Catat Pengeluaran
        </Button>
      </header>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-4 justify-between items-end bg-card/80 backdrop-blur-md p-5 rounded-2xl border shadow-lg border-border/50">
        <div className="flex flex-wrap gap-4 items-end w-full sm:w-auto">
            {/* DATE PRESET */}
            <div className="space-y-1.5 flex-1 sm:flex-initial min-w-[140px]">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                    <History className="size-3" /> Periode
                </Label>
                <Select value={rangeType} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-full h-10 bg-background font-bold text-xs rounded-xl">
                        <SelectValue placeholder="Pilih rentang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl">
                        <SelectItem value="today" className="text-xs font-bold uppercase">Hari Ini</SelectItem>
                        <SelectItem value="yesterday" className="text-xs font-bold uppercase">Kemarin</SelectItem>
                        <SelectItem value="activeShift" disabled={!activeShift} className="text-xs font-bold uppercase text-primary">
                            <div className="flex items-center gap-2">
                                <Zap className="size-3 fill-current" /> Shift Aktif
                            </div>
                        </SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="7days" className="text-xs font-bold uppercase">7 Hari Terakhir</SelectItem>
                        <SelectItem value="thisMonth" className="text-xs font-bold uppercase">Bulan Ini</SelectItem>
                        <SelectItem value="lastMonth" className="text-xs font-bold uppercase">Bulan Lalu</SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="custom" className="text-xs font-bold uppercase">Custom...</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {rangeType === 'custom' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                        <CalendarDays className="size-3" /> Range
                    </Label>
                    <DateRangePicker date={date} setDate={setDate} />
                </div>
            )}

            {/* CATEGORY FILTER */}
            <div className="space-y-1.5 flex-1 sm:flex-initial min-w-[160px]">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                    <Filter className="size-3" /> Kategori
                </Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full h-10 bg-background font-bold text-xs rounded-xl">
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="text-xs font-bold uppercase">Semua Kategori</SelectItem>
                        {CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value} className="text-xs font-bold uppercase">{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex flex-col text-right border-l border-border/50 pl-4 h-9 justify-center hidden lg:flex">
            <p className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] leading-none">Total Periode Ini</p>
            <p className="text-lg font-black text-red-500 font-mono mt-1 uppercase">{formatCurrency(totalExpense).replace(',00', '')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-red-500/[0.03] border-red-500/20 shadow-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-red-600 tracking-widest">Dana Keluar</CardTitle>
                  <Wallet className="h-3.5 w-3.5 text-red-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-red-600">{formatCurrency(totalExpense)}</div>
                  <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">
                    {filteredExpenses.length} Transaksi Terpilih
                  </p>
              </CardContent>
          </Card>
          
          <Card className="md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cari Deskripsi</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="relative w-full">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Ketik keterangan pengeluaran untuk mencari..." 
                        className="pl-10 h-10 rounded-xl bg-muted/30 border-transparent focus:bg-background" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                      />
                  </div>
              </CardContent>
          </Card>
      </div>

      <Card className="bg-card border shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border bg-muted/20 pb-4 pt-4">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <History className="h-4 w-4" />
                </div>
                <div>
                    <CardTitle className="text-base font-black uppercase">Log Pengeluaran Kasir</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">
                        Data audit sesuai rentang waktu yang dipilih
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent h-10">
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tgl & Jam</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Kategori</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Keterangan Biaya</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Sumber Dana</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-right">Nominal</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center w-16">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [1,2,3,4,5].map(i => (
                            <TableRow key={i}>
                                <TableCell colSpan={6} className="py-4 px-4"><Skeleton className="h-10 w-full rounded-lg" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        filteredExpenses.map(e => (
                            <TableRow key={e.id} className="border-border hover:bg-muted/20 transition-colors h-14">
                                <TableCell className="py-2">
                                    <p className="font-bold text-[10px] uppercase">{format(e.timestamp, 'dd MMM yyyy', { locale: idLocale })}</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">{format(e.timestamp, 'HH:mm')} WIB</p>
                                </TableCell>
                                <TableCell className="py-2">
                                    <Badge variant="outline" className={cn("text-[8px] font-black border-none uppercase px-2 h-5", CATEGORIES.find(c => c.value === e.category)?.color, "bg-opacity-10 text-opacity-100")}>
                                        {CATEGORIES.find(c => c.value === e.category)?.label || 'LAIN-LAIN'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs font-bold uppercase tracking-tight py-2 max-w-[150px] truncate">{e.description}</TableCell>
                                <TableCell className="py-2">
                                    <div className="flex items-center gap-1.5">
                                        {e.source === 'drawer' ? (
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-blue-500/20 bg-blue-500/5 text-blue-600">
                                                <Banknote className="size-2 mr-1" /> Kas Laci
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-amber-500/20 bg-amber-500/5 text-amber-600">
                                                <User className="size-2 mr-1" /> Dana Pribadi
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-black font-mono text-red-500 py-2">
                                    {formatCurrency(e.amount)}
                                </TableCell>
                                <TableCell className="text-center py-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors" onClick={() => handleDelete(e.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                    {!isLoading && filteredExpenses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-40 text-center flex flex-col items-center justify-center gap-3 opacity-30">
                                <Receipt className="size-10 text-muted-foreground" />
                                <p className="text-xs font-black uppercase tracking-[0.3em]">Catatan Kosong</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md bg-background border-border rounded-2xl p-0 overflow-hidden">
              <div className="bg-red-500 h-1.5 w-full" />
              <DialogHeader className="px-6 pt-6">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-red-500" />
                      Input Pengeluaran
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Catat operasional harian atau belanja stok
                  </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddExpense} className="space-y-4 p-6 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Kategori Biaya</Label>
                          <Select value={formData.category as ExpenseCategory} onValueChange={(val: ExpenseCategory) => setFormData({...formData, category: val})}>
                              <SelectTrigger className="h-11 bg-muted/40 border-transparent rounded-xl font-bold">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  {CATEGORIES.map(c => (
                                      <SelectItem key={c.value} value={c.value} className="font-bold uppercase text-[10px]">{c.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Sumber Dana</Label>
                          <Select value={formData.source} onValueChange={(val: 'drawer' | 'personal') => setFormData({...formData, source: val})}>
                              <SelectTrigger className="h-11 bg-muted/40 border-transparent rounded-xl font-bold">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="drawer" className="font-bold uppercase text-[10px]">💰 Kas Laci</SelectItem>
                                  <SelectItem value="personal" className="font-bold uppercase text-[10px]">👤 Dana Pribadi</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Deskripsi Singkat</Label>
                      <Input 
                        placeholder="Misal: Beli Galon, Token Listrik, Gaji Shift Pagi" 
                        required 
                        className="h-11 bg-muted/40 border-transparent rounded-xl text-sm font-bold uppercase tracking-tight" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      />
                  </div>

                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nominal (IDR)</Label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm">Rp</span>
                          <Input 
                            type="number" 
                            required 
                            className="h-14 pl-10 text-3xl font-black bg-muted/60 border-transparent focus:ring-red-500 rounded-xl shadow-inner text-red-600" 
                            value={formData.amount || ''} 
                            onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})} 
                          />
                      </div>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-dashed border-primary/20 flex items-start gap-3 mt-4">
                      <Zap className="size-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[9px] text-primary/70 leading-relaxed font-bold uppercase">
                        {formData.source === 'drawer' 
                            ? "Data ini akan MEMOTONG saldo 'Kas Laci' pada laporan shift secara otomatis." 
                            : "Data ini HANYA dicatat sebagai biaya di laporan laba rugi, TANPA memotong saldo kas laci."}
                      </p>
                  </div>

                  <DialogFooter className="pt-6 border-t border-border mt-2 gap-2">
                      <DialogClose asChild>
                          <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase text-[10px]">Batal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting || formData.amount <= 0} className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/20 flex-1">
                          {isSubmitting ? 'Mencatat...' : 'Simpan Pengeluaran'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}