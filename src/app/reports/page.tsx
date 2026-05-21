
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsClient } from "@/components/reports/reports-client";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Transaction, FnbItem, Station, Expense } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { ShieldAlert } from "lucide-react";

export default function ReportsPage() {
  const firestore = useFirestore();
  const { role, isRoleLoading: isAuthLoading } = useAuth();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'transactions');
  }, [firestore, isAuthLoading, role]);

  const fnbQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'fnbItems');
  }, [firestore, isAuthLoading, role]);

  const stationsQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'stations');
  }, [firestore, isAuthLoading, role]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'expenses');
  }, [firestore, isAuthLoading, role]);

  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: fnbItems, isLoading: isLoadingFnb } = useCollection<FnbItem>(fnbQuery);
  const { data: stations, isLoading: isLoadingStations } = useCollection<Station>(stationsQuery);
  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesQuery);

  const isLoading = isAuthLoading || isLoadingTransactions || isLoadingFnb || isLoadingStations || isLoadingExpenses;

  if (!isAuthLoading && role !== 'admin') {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase">Akses Terbatas</h2>
            <p className="text-muted-foreground max-w-sm">Hanya Admin yang dapat melihat laporan keuangan dan statistik performa bisnis.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Laporan</h1>
        <p className="text-muted-foreground mt-1">Pantau performa bisnis rental dan penjualan FnB Anda.</p>
      </header>
      
      {isLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-10 w-[400px]" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <ReportsClient 
          transactions={transactions || []} 
          fnbItems={fnbItems || []}
          stations={stations || []}
          expenses={expenses || []}
        />
      )}
    </div>
  );
}
