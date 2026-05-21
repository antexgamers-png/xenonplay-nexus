
'use client';

import { useState, useMemo } from 'react';
import type { Transaction, Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Search, 
    Filter, 
    Wallet, 
    HandCoins, 
    ReceiptText,
    FileSpreadsheet
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
import { useFirestore } from '@/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/reports/date-range-picker';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

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

  const handleRangeChange = (value: string) => {
    setRangeType(value);
    const now = new Date();
    
    switch (value) {
      case 'today':
        setDate({ from: startOfDay(now), to: endOfDay(now) });
        break;
      case '3days':
        setDate({ from: startOfDay(subDays(now, 2)), to: endOfDay(now) });
        break;
      case '7days':
        setDate({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
        break;
      case 'custom':
        break;
    }
  };

  const dateFilteredTransactions = useMemo(() => {
    if (!date?.from) return transactions;
    const fromTime = startOfDay(date.from).getTime();
    const toTime = date.to ? endOfDay(date.to).getTime() : endOfDay(date.from).getTime();

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

  const handleMarkAsPaid = async () => {
    if (!selectedTransaction || !firestore) return;
    
    try {
        await markTransactionAsPaid(firestore, selectedTransaction.id);
        
        const stationToClear = stations.find(s => s.current_transaction_id === selectedTransaction.id);
        if (stationToClear && !stationToClear.is_active) {
            await updateDoc(doc(firestore, 'stations', stationToClear.id), {
                current_transaction_id: null,
            });
        }

        toast({
            title: 'Pembayaran Sukses',
            description: `Transaksi ${selectedTransaction.stationName} telah lunas.`,
            variant: 'success'
        });
        setIsDetailOpen(false);
    } catch (e: any) {
        toast({
            title: 'Gagal',
            description: e.message,
            variant: 'destructive'
        });
    }
  };

  const exportToExcel = () => {
    if (!filteredTransactions.length) return;

    const excelData = filteredTransactions.map((t, index) => ({
        'No': index + 1,
        'Tanggal': format(t.timestamp, 'dd/MM/yyyy'),
        'Jam': format(t.timestamp, 'HH:mm'),
        'Stasiun': t.stationName,
        'Durasi (Min)': t.stationId === 'pos' ? '-' : t.durationMinutes,
        'Bruto (IDR)': t.amount || 0,
        'Diskon (IDR)': t.discount || 0,
        'Netto (IDR)': Math.max(0, (t.amount || 0) - (t.discount || 0)),
        'Status Pembayaran': t.status.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Transaksi");

    const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 12 }, 
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Audit_Transaksi_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* DATE FILTER RANGE */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-end bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Periode Transaksi</Label>
                <Select value={rangeType} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-[200px] h-10 bg-background">
                        <SelectValue placeholder="Pilih rentang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="3days">3 Hari Terakhir</SelectItem>
                        <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                        <SelectItem value="custom">Pilih Rentang Waktu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {rangeType === 'custom' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Pilih Tanggal</Label>
                    <DateRangePicker date={date} setDate={setDate} />
                </div>
            )}
        </div>
        
        <Button 
            variant="outline" 
            className="gap-2 h-10 font-black uppercase text-[10px] tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 shadow-sm" 
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0}
        >
            <FileSpreadsheet className="size-4" /> Ekspor Excel (.xlsx)
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uang Masuk (Lunas)</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total pendapatan periode ini.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <HandCoins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(stats.totalReceivables)}</div>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {stats.unpaidCount} Transaksi
                </Badge>
                <p className="text-xs text-muted-foreground">Menunggu pembayaran.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block border-blue-500/20 bg-blue-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nota</CardTitle>
            <ReceiptText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dateFilteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Riwayat nota periode ini.</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card>
        <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-primary" />
                    Daftar Nota
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari stasiun..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="paid">Lunas</SelectItem>
                            <SelectItem value="unpaid">Belum Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <TransactionTable 
                transactions={filteredTransactions} 
                onRowClick={handleRowClick}
            />
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
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
