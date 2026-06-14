'use client';

import type { Transaction, FnbItem, Station, Expense } from '@/lib/types';
import { useState, useMemo, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
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
import { FileSpreadsheet, CalendarDays, History, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import * as XLSX from 'xlsx';
import { useShift } from '@/components/providers/shift-provider';
import { cn } from '@/lib/utils';

interface ReportsClientProps {
  transactions: Transaction[];
  fnbItems: FnbItem[];
  stations: Station[];
  expenses: Expense[];
}

export function ReportsClient({ transactions, fnbItems, stations, expenses }: ReportsClientProps) {
  const { activeShift } = useShift();
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

  const filteredTransactions = useMemo(() => {
    if (!date?.from) return transactions;
    const fromTime = date.from.getTime();
    const toTime = date.to ? date.to.getTime() : endOfDay(date.from).getTime();

    return transactions.filter(t => t.timestamp >= fromTime && t.timestamp <= toTime)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, date]);

  const filteredExpenses = useMemo(() => {
    if (!date?.from) return expenses;
    const fromTime = date.from.getTime();
    const toTime = date.to ? date.to.getTime() : endOfDay(date.from).getTime();

    return expenses.filter(e => e.timestamp >= fromTime && e.timestamp <= toTime);
  }, [expenses, date]);

  const exportToExcel = () => {
    // DAILY SUMMARY LOGIC
    const summaryMap: Record<string, { 
        date: string, 
        rental: number, 
        fnb: number, 
        discount: number, 
        netIncome: number, 
        expenses: number, 
        profit: number 
    }> = {};

    // 1. Process Income (Transactions)
    filteredTransactions.forEach(t => {
        const dateKey = format(t.timestamp, 'yyyy-MM-dd');
        if (!summaryMap[dateKey]) {
            summaryMap[dateKey] = { date: dateKey, rental: 0, fnb: 0, discount: 0, netIncome: 0, expenses: 0, profit: 0 };
        }

        const rental = (t.additionalCharges || [])
            .filter(c => !c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);
            
        const fnb = (t.additionalCharges || [])
            .filter(c => c.description.includes('FnB:'))
            .reduce((s, c) => s + (c.amount || 0), 0);

        summaryMap[dateKey].rental += rental;
        summaryMap[dateKey].fnb += fnb;
        summaryMap[dateKey].discount += (t.discount || 0);
    });

    // 2. Process Expenses
    filteredExpenses.forEach(e => {
        const dateKey = format(e.timestamp, 'yyyy-MM-dd');
        if (!summaryMap[dateKey]) {
            summaryMap[dateKey] = { date: dateKey, rental: 0, fnb: 0, discount: 0, netIncome: 0, expenses: 0, profit: 0 };
        }
        summaryMap[dateKey].expenses += e.amount;
    });

    // Final Header and Metadata
    const periodStr = date?.from ? 
        `${format(date.from, 'dd/MM/yyyy')} - ${date.to ? format(date.to, 'dd/MM/yyyy') : format(date.from, 'dd/MM/yyyy')}` 
        : 'Semua Waktu';

    const worksheetData = [
        ['LAPORAN KEUANGAN'],
        [`Periode : ${periodStr}`],
        [],
        ['No.', 'Tanggal', 'Total Sewa TV', 'Total Jual FnB', 'Total Diskon', 'Pemasukan Netto', 'Biaya Operasional', 'Profit / Loss']
    ];

    Object.values(summaryMap)
        .sort((a, b) => b.date.localeCompare(a.date))
        .forEach((day, index) => {
            const netIncome = (day.rental + day.fnb) - day.discount;
            const profitLoss = netIncome - day.expenses;
            
            worksheetData.push([
                (index + 1).toString(),
                day.date,
                day.rental.toString(),
                day.fnb.toString(),
                day.discount.toString(),
                netIncome.toString(),
                day.expenses.toString(),
                profitLoss.toString()
            ]);
        });

    if (worksheetData.length <= 4) return;

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    // Adjust column widths
    worksheet['!cols'] = [
        { wch: 5 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];

    XLSX.writeFile(workbook, `XP_Summary_Keuangan_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-4 justify-between items-end bg-card/80 backdrop-blur-md p-5 rounded-2xl border shadow-lg transition-all duration-300">
        <div className="flex flex-wrap gap-4 items-end w-full sm:w-auto">
            <div className="space-y-1.5 flex-1 sm:flex-initial">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                    <History className="size-3" /> Periode Audit
                </Label>
                <Select value={rangeType} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-full sm:w-[220px] h-10 bg-background font-bold text-xs rounded-xl border-border/60">
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
                        <SelectItem value="3days" className="text-xs font-bold uppercase">3 Hari Terakhir</SelectItem>
                        <SelectItem value="7days" className="text-xs font-bold uppercase">7 Hari Terakhir</SelectItem>
                        <SelectItem value="30days" className="text-xs font-bold uppercase">30 Hari Terakhir</SelectItem>
                        <Separator className="my-1" />
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-initial gap-2 h-10 font-black uppercase text-[10px] tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 shadow-sm rounded-xl" 
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0 && filteredExpenses.length === 0}
          >
            <FileSpreadsheet className="size-4" /> Ekspor Excel
          </Button>
          <div className="hidden lg:flex flex-col text-right border-l border-border/50 pl-4 h-9 justify-center">
            <p className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] leading-none">Status Data</p>
            <p className="text-[10px] font-mono text-emerald-500 font-bold mt-1 uppercase">Live Updated</p>
          </div>
        </div>
      </div>

      {date?.from && (
          <div className="px-4 py-2 bg-muted/30 border border-dashed rounded-lg inline-flex items-center gap-2 animate-in fade-in duration-500">
              <CalendarDays className="size-3 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Menampilkan data: {format(date.from, 'dd MMM yyyy', { locale: idLocale })} 
                  {date.to && date.to.getTime() !== date.from.getTime() ? ` - ${format(date.to, 'dd MMM yyyy', { locale: idLocale })}` : ''}
              </span>
          </div>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1 rounded-xl border border-border/50 shadow-inner">
          <TabsTrigger value="summary" className="rounded-lg font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Summary & Profit</TabsTrigger>
          <TabsTrigger value="rental" className="rounded-lg font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Statistik Rental</TabsTrigger>
          <TabsTrigger value="fnb" className="rounded-lg font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Statistik FnB</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="outline-none space-y-6">
          <SummaryReport 
            transactions={filteredTransactions} 
            fnbItems={fnbItems} 
            stations={stations}
            expenses={filteredExpenses}
          />
        </TabsContent>

        <TabsContent value="rental" className="outline-none space-y-6">
          <RentalReport transactions={filteredTransactions} />
        </TabsContent>

        <TabsContent value="fnb" className="outline-none space-y-6">
          <FnBReport transactions={filteredTransactions} fnbItems={fnbItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
