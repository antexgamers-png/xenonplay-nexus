
'use client';

import type { Transaction, FnbItem, Station, Expense } from '@/lib/types';
import { useState, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RentalReport } from './rental-report';
import { FnBReport } from './fnb-report';
import { SummaryReport } from './summary-report';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportsClientProps {
  transactions: Transaction[];
  fnbItems: FnbItem[];
  stations: Station[];
  expenses: Expense[];
}

export function ReportsClient({ transactions, fnbItems, stations, expenses }: ReportsClientProps) {
  const [rangeType, setRangeType] = useState<string>('today');
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

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

  const filteredTransactions = useMemo(() => {
    if (!date?.from) return transactions;
    const fromTime = startOfDay(date.from).getTime();
    const toTime = date.to ? endOfDay(date.to).getTime() : endOfDay(date.from).getTime();

    return transactions.filter(t => t.timestamp >= fromTime && t.timestamp <= toTime)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, date]);

  const filteredExpenses = useMemo(() => {
    if (!date?.from) return expenses;
    const fromTime = startOfDay(date.from).getTime();
    const toTime = date.to ? endOfDay(date.to).getTime() : endOfDay(date.from).getTime();

    return expenses.filter(e => e.timestamp >= fromTime && e.timestamp <= toTime);
  }, [expenses, date]);

  const exportToExcel = () => {
    if (!filteredTransactions.length) return;

    // Siapkan data untuk Excel tanpa kolom ID
    const excelData = filteredTransactions.map((t, index) => {
        const bruto = t.amount || 0;
        const diskon = t.discount || 0;
        const netto = Math.max(0, bruto - diskon);
        
        return {
            'No': index + 1,
            'Tanggal': format(t.timestamp, 'dd/MM/yyyy'),
            'Jam': format(t.timestamp, 'HH:mm'),
            'Stasiun / Sumber': t.stationName,
            'Durasi (Menit)': t.stationId === 'pos' ? '-' : (t.durationMinutes || 0),
            'Total Bruto (IDR)': bruto,
            'Potongan/Diskon (IDR)': diskon,
            'Total Netto (IDR)': netto,
            'Status Pembayaran': t.status === 'paid' ? 'LUNAS' : 'PIUTANG'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Atur lebar kolom (Auto-width simulation)
    const colWidths = [
        { wch: 5 },   // No
        { wch: 15 },  // Tanggal
        { wch: 10 },  // Jam
        { wch: 25 },  // Stasiun
        { wch: 15 },  // Durasi
        { wch: 18 },  // Bruto
        { wch: 18 },  // Diskon
        { wch: 18 },  // Netto
        { wch: 20 }   // Status
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");

    const dateStr = date?.from ? format(date.from, 'yyyy-MM-dd') : 'Laporan';
    XLSX.writeFile(workbook, `XenonPlay_Report_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-end bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Periode Laporan</Label>
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

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-black uppercase text-[10px] tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 shadow-sm" 
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0}
          >
            <FileSpreadsheet className="size-4" /> Ekspor Excel (.xlsx)
          </Button>
          <div className="text-right hidden sm:block border-l pl-6 ml-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Update Terakhir</p>
            <p className="text-xs font-mono text-emerald-500 flex items-center justify-end gap-1.5 mt-1">
                {format(new Date(), 'HH:mm')} WIB
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="summary" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Summary & Profit</TabsTrigger>
          <TabsTrigger value="rental" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Statistik Rental</TabsTrigger>
          <TabsTrigger value="fnb" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Statistik FnB</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="outline-none">
          <SummaryReport 
            transactions={filteredTransactions} 
            fnbItems={fnbItems} 
            stations={stations}
            expenses={filteredExpenses}
          />
        </TabsContent>

        <TabsContent value="rental" className="outline-none">
          <RentalReport transactions={filteredTransactions} />
        </TabsContent>

        <TabsContent value="fnb" className="outline-none">
          <FnBReport transactions={filteredTransactions} fnbItems={fnbItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
