'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Wallet, Trash2, Receipt, Search, History } from 'lucide-react';
import { addExpense, deleteExpense } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { useShift } from '@/components/providers/shift-provider';
import { cn, formatCurrency } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'timestamp'>>({
    amount: 0,
    description: '',
    category: 'other',
    shiftId: null
  });

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
    return query(collection(firestore, 'expenses'), orderBy('timestamp', 'desc'), limit(100));
  }, [firestore, isRoleLoading]);

  const { data: expenses, isLoading } = useCollection<Expense>(expensesQuery);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(e => 
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        CATEGORIES.find(c => c.value === e.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

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
      setFormData({ amount: 0, description: '', category: 'other', shiftId: null });
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
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biaya Operasional</h1>
          <p className="text-muted-foreground mt-1">Catat setiap pengeluaran untuk memantau laba bersih yang akurat.</p>
        </div>
        <Button onClick={() => { if(checkShift()) setIsAddOpen(true); }} className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Catat Pengeluaran
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-red-500/[0.03] border-red-500/20">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-black uppercase text-red-500 tracking-widest">Total Pengeluaran</CardTitle>
                  <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">Dari {filteredExpenses.length} catatan</p>
              </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
              <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Filter & Cari</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Cari deskripsi atau kategori..." className="pl-10 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
              </CardContent>
          </Card>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-primary" />
                <div>
                    <CardTitle>Riwayat Pengeluaran</CardTitle>
                    <CardDescription>Daftar biaya operasional yang tercatat di sistem.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Tanggal & Jam</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Kategori</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Keterangan</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right">Nominal</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center w-20">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [1,2,3].map(i => (
                            <TableRow key={i}>
                                <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        filteredExpenses.map(e => (
                            <TableRow key={e.id} className="border-border hover:bg-muted/30 transition-colors">
                                <TableCell className="text-xs">
                                    <p className="font-bold">{format(e.timestamp, 'dd MMM yyyy')}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{format(e.timestamp, 'HH:mm')} WIB</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[9px] font-black border-none", CATEGORIES.find(c => c.value === e.category)?.color, "bg-opacity-10 text-opacity-100")}>
                                        {CATEGORIES.find(c => c.value === e.category)?.label.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{e.description}</TableCell>
                                <TableCell className="text-right font-black font-mono text-red-500">
                                    {formatCurrency(e.amount)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(e.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                    {!isLoading && filteredExpenses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-40 text-center flex flex-col items-center justify-center gap-2">
                                <Receipt className="size-8 text-muted-foreground opacity-20" />
                                <p className="text-sm text-muted-foreground italic">Belum ada catatan pengeluaran.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Catat Pengeluaran Baru
                  </DialogTitle>
                  <DialogDescription>Input rincian uang keluar dari operasional.</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddExpense} className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Kategori Biaya</Label>
                      <Select value={formData.category as ExpenseCategory} onValueChange={(val: ExpenseCategory) => setFormData({...formData, category: val})}>
                          <SelectTrigger className="bg-background border-border">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              {CATEGORIES.map(c => (
                                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label>Deskripsi / Keterangan</Label>
                      <Input placeholder="Contoh: Token listrik 50rb" required className="bg-background border-border" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                      <Label>Nominal (IDR)</Label>
                      <div className="relative">
                          <span className="absolute left-3 top-3 text-muted-foreground font-black">Rp</span>
                          <Input type="number" required className="bg-background border-border pl-10 text-xl font-black text-red-500" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})} />
                      </div>
                  </div>

                  <DialogFooter className="pt-6 border-t border-border mt-4">
                      <DialogClose asChild>
                          <Button type="button" variant="outline">Batal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting || formData.amount <= 0} className="font-bold">
                          {isSubmitting ? 'Mencatat...' : 'Simpan Pengeluaran'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}