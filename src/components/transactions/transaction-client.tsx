
'use client';

import { useState, useMemo } from 'react';
import type { Transaction, Station, Shift } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Search, 
    Filter, 
    Wallet, 
    HandCoins, 
    ReceiptText,
    FileSpreadsheet,
    History,
    Zap,
    CalendarDays
} from 'lucide-react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { TransactionTable } from './transaction-table';
import { TransactionDetailDialog } from '@/components/dashboard/transaction-detail-dialog';
import { markTransactionAsPaid } from '@/lib/data';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { updateDoc, doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import * as XLSX from 'xlsx';
import { useShift } from '@/components/providers/shift-provider';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface TransactionClientProps {
  transactions: Transaction[];
  stations: Station[];
}

export function TransactionClient({ transactions, stations }: TransactionClientProps) {
  const { activeShift } = useShift();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [rangeType, setRangeType] = useState<string>('today');
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const firestore = useFirestore();
  const { toast } = useToast();

  const shiftsQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'shifts'), [firestore]);
  const { data: allShifts } = useCollection<Shift>(shiftsQuery);

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

  const dateFilteredTransactions = useMemo(() => {
    if (!date?.from) return transactions;
    const fromTime = date.from.getTime();
    const toTime = date.to ? date.to.getTime() : endOfDay(date.from).getTime();

    return transactions.filter(t => t.timestamp >= fromTime && t.timestamp <= toTime);
  }, [transactions, date]);

  const stats = useMemo(() => {
    const totalCollected = dateFilteredTransactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalReceivables = dateFilteredTransactions
        .filter(t => t.status === 'unpaid')
        .reduce((sum, t) => sum + ((t.amount || 0) - (t.paidAmount || 0)), 0);
    
    const unpaidCount = dateFilteredTransactions.filter(t => t.status === 'unpaid').length;

    return { totalCollected, totalReceivables, unpaidCount };
  }, [dateFilteredTransactions]);

  const filteredTransactions = useMemo(() => {
    return dateFilteredTransactions
      .filter((t) => {
        const matchesSearch = t.stationName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [dateFilteredTransactions, searchQuery, statusFilter]);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleMarkAsPaid = async (member?: any) => {
    if (!selectedTransaction || !firestore) return;
    try {
        await markTransactionAsPaid(firestore, selectedTransaction.id, activeShift?.id, member);
        setIsDetailOpen(false);
        toast({ title: 'Pembayaran Lunas', variant: "success" });
    } catch (e: any) {
        toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    }
  };

  const exportToExcel = () => {
    if (!filteredTransactions.length) return;

    const periodStr = date?.from ? 
        `${format(date.from, 'dd/MM/yyyy')} - ${date.to ? format(date.to, 'dd/MM/yyyy') : format(date.from, 'dd/MM/yyyy')}` 
        : 'Semua Waktu';

    const worksheetData = [
        ['LAPORAN TRANSAKSI'],
        [`Periode : ${periodStr}`],
        [],
        ['No.', 'Nama Operator', 'Tanggal', 'Jam', 'Stasiun', 'Item', 'Total Bruto', 'Diskon', 'Total Netto', 'Status']
    ];

    filteredTransactions.forEach((t, index) => {
        const shift = allShifts?.find(s => s.id === t.shiftId);
        const operatorName = shift?.openedByName || 'operator';
        
        // Logika Ekstraksi Item yang sangat bersih
        const itemDetails = (t.additionalCharges || [])
            .map(c => {
                let desc = c.description || '';
                // Hapus semua prefix teknis
                desc = desc.replace(/^Sewa\s+/i, '');
                desc = desc.replace(/^FnB:\s+/i, '');
                desc = desc.replace(/^Tambah\s+FnB:\s+/i, '');
                desc = desc.replace(/^Tambah\s+waktu\s+/i, '');
                desc = desc.replace(/^Biaya\s+Tambahan\s+/i, '');
                desc = desc.replace(/^Klaim\s+Voucher:\s+/i, '');
                return desc.trim();
            })
            .filter((val, index, self) => val && self.indexOf(val) === index) // Hanya ambil yang unik
            .join(', ');

        const bruto = t.amount || 0;
        const discount = t.discount || 0;
        const netto = Math.max(0, bruto - discount);

        worksheetData.push([
            (index + 1).toString(),
            operatorName,
            format(t.timestamp, 'dd/MM/yyyy'),
            format(t.timestamp, 'HH:mm'),
            t.stationName,
            itemDetails || (t.packageName || 'Sewa TV'),
            bruto.toString(),
            discount.toString(),
            netto.toString(),
            t.status.toUpperCase()
        ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");

    worksheet['!cols'] = [
        { wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, 
        { wch: 60 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }
    ];

    XLSX.writeFile(workbook, `Laporan_Transaksi_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-6 justify-between items-end bg-card/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg transition-all duration-300">
        <div className="flex flex-wrap gap-4 items-end w-full sm:w-auto">
            <div className="space-y-1.5 flex-1 sm:flex-initial">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                    <History className="size-3" /> Periode Transaksi
                </Label>
                <Select value={rangeType} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background font-bold text-xs rounded-xl border-border/60">
                        <SelectValue placeholder="Pilih rentang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl">
                        <SelectItem value="today" className="text-xs font-bold uppercase">Hari Ini</SelectItem>
                        <SelectItem value="yesterday" className="text-xs font-bold uppercase">Kemarin</SelectItem>
                        <SelectItem value="activeShift" disabled={!activeShift} className="text-xs font-bold uppercase text-primary">
                            <div className="flex items-center gap-2">
                                <Zap className="size-3 fill-current" /> Sejak Shift Buka
                            </div>
                        </SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="30days" className="text-xs font-bold uppercase">30 Hari Terakhir</SelectItem>
                        <SelectItem value="thisMonth" className="text-xs font-bold uppercase">Bulan Ini</SelectItem>
                        <SelectItem value="lastMonth" className="text-xs font-bold uppercase">Bulan Lalu</SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="custom" className="text-xs font-bold uppercase">Pilih Manual...</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {rangeType === 'custom' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                        <CalendarDays className="size-3" /> Rentang Tanggal
                    </Label>
                    <DateRangePicker date={date} setDate={setDate} />
                </div>
            )}
        </div>
        
        <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2 h-10 font-black uppercase text-[10px] tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 shadow-sm rounded-xl" 
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0}
        >
            <FileSpreadsheet className="size-4" /> Ekspor (.xlsx)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/[0.02] shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uang Masuk (Lunas)</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase">Pendapatan bersih periode ini.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/[0.02] shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Piutang (Belum Bayar)</CardTitle>
            <HandCoins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(stats.totalReceivables)}</div>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-600 border-amber-500/20 h-4 font-black">
                    {stats.unpaidCount} NOTA
                </Badge>
                <p className="text-[9px] text-muted-foreground uppercase">Menunggu pelunasan.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/[0.02] shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume Transaksi</CardTitle>
            <ReceiptText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black">{dateFilteredTransactions.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase">Total nota tercetak.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm overflow-hidden border-border/50">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Daftar Nota</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Audit Rinci Penjualan</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari stasiun..."
                            className="pl-9 h-10 text-xs rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl text-xs font-bold uppercase">
                            <Filter className="mr-2 h-3 w-3 text-muted-foreground" />
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all" className="text-xs uppercase font-bold">Semua Status</SelectItem>
                            <SelectItem value="paid" className="text-xs uppercase font-bold text-emerald-600">Lunas</SelectItem>
                            <SelectItem value="unpaid" className="text-xs uppercase font-bold text-amber-600">Belum Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <TransactionTable 
                transactions={filteredTransactions} 
                onRowClick={handleRowClick}
            />
        </CardContent>
      </Card>

      {selectedTransaction && (
        <TransactionDetailDialog 
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            transaction={selectedTransaction}
            onMarkAsPaid={handleMarkAsPaid}
        />
      )}
    </div>
  );
}
