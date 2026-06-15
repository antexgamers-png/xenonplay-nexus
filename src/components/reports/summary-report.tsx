'use client';

import type { Transaction, FnbItem, Station, Expense } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Gift, Wallet, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
};

export function SummaryReport({ 
    transactions, 
    fnbItems, 
    stations, 
    expenses 
}: { 
    transactions: Transaction[], 
    fnbItems: FnbItem[], 
    stations: Station[], 
    expenses: Expense[] 
}) {
  
  const chartData = useMemo(() => {
    const dailyMap: Record<string, { date: string, income: number, expense: number, profit: number }> = {};
    const categoryMap: Record<string, number> = {};
    
    let totalIncome = 0;
    let totalExpense = 0;
    let totalRental = 0;
    let totalFnB = 0;
    let totalDiscount = 0;

    const sortedTransactions = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    // Process Income
    sortedTransactions.forEach(t => {
      const dateKey = format(t.timestamp, 'dd MMM', { locale: id });
      
      const rentalAmount = (t.additionalCharges || [])
        .filter(c => c && c.description && !c.description.includes('FnB:'))
        .reduce((sum, c) => sum + (c.amount || 0), 0);
        
      const fnbAmount = (t.additionalCharges || [])
        .filter(c => c && c.description && c.description.includes('FnB:'))
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      const discount = t.discount || 0;
      // Net Income = (Rental + FnB) - Discount
      const netIncome = Math.max(0, (rentalAmount + fnbAmount) - discount);

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, income: 0, expense: 0, profit: 0 };
      }
      dailyMap[dateKey].income += netIncome;
      dailyMap[dateKey].profit += netIncome;

      totalRental += rentalAmount;
      totalFnB += fnbAmount;
      totalDiscount += discount;
      totalIncome += netIncome;
    });

    // Process Expenses
    expenses.forEach(e => {
        const dateKey = format(e.timestamp, 'dd MMM', { locale: id });
        if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = { date: dateKey, income: 0, expense: 0, profit: 0 };
        }
        dailyMap[dateKey].expense += e.amount;
        dailyMap[dateKey].profit -= e.amount;

        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        totalExpense += e.amount;
    });

    const trendData = Object.values(dailyMap);
    
    const pieData = [
      { name: 'Sewa Stasiun', value: totalRental },
      { name: 'Penjualan FnB', value: totalFnB }
    ];

    const expensePieData = Object.entries(categoryMap).map(([name, value]) => ({ 
        name: name === 'electricity' ? 'Listrik' : 
              name === 'stock' ? 'Stok FnB' :
              name === 'salary' ? 'Gaji' :
              name === 'maintenance' ? 'Service' :
              name === 'rent' ? 'Sewa' : 'Lainnya', 
        value 
    }));

    return { trendData, pieData, expensePieData, totalRental, totalFnB, totalDiscount, totalIncome, totalExpense };
  }, [transactions, expenses]);

  const netProfit = chartData.totalIncome - chartData.totalExpense;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-emerald-500/[0.03] border-emerald-500/20">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-black uppercase text-emerald-500 tracking-widest">Total Pemasukan</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(chartData.totalIncome)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">Omzet setelah diskon</p>
              </CardContent>
          </Card>

          <Card className="bg-red-500/[0.03] border-red-500/20">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-black uppercase text-red-500 tracking-widest">Total Pengeluaran</CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(chartData.totalExpense)}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">Biaya operasional</p>
              </CardContent>
          </Card>

          <Card className={cn(
              "border-2 transition-all duration-500",
              netProfit >= 0 ? "bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5" : "bg-red-500/[0.05] border-red-500/30"
          )}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Profit Bersih</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className={cn("text-3xl font-black", netProfit >= 0 ? "text-primary" : "text-red-500")}>
                      {formatCurrency(netProfit)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">Pendapatan - Biaya</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TREN PROFITABILITAS */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Analisis Profitabilitas</CardTitle>
            <CardDescription>Perbandingan harian antara pemasukan dan pengeluaran.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trendData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: number) => formatCurrency(v)}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={0} name="Pemasukan" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={0} name="Pengeluaran" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Laba/Rugi" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ALOKASI PENGELUARAN */}
        <Card>
          <CardHeader>
            <CardTitle>Alokasi Biaya</CardTitle>
            <CardDescription>Distribusi pengeluaran berdasarkan kategori.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center">
            {chartData.expensePieData.length > 0 ? (
                <>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData.expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {chartData.expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 min-w-[120px]">
                        {chartData.expensePieData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-medium truncate max-w-[80px]">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="w-full text-center text-xs text-muted-foreground italic">Belum ada data biaya.</div>
            )}
          </CardContent>
        </Card>

        {/* KOMPOSISI PENDAPATAN */}
        <Card>
          <CardHeader>
            <CardTitle>Sumber Pemasukan</CardTitle>
            <CardDescription>Sewa Stasiun vs Penjualan FnB</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-medium">Rental TV</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium">FnB/Stok</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}