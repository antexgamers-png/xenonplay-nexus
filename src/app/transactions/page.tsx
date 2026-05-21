'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Transaction, Station } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { TransactionClient } from "@/components/transactions/transaction-client";

export default function TransactionsPage() {
  const firestore = useFirestore();
  const { isRoleLoading } = useAuth();
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || isRoleLoading) return null;
    return collection(firestore, 'transactions');
  }, [firestore, isRoleLoading]);

  const stationsQuery = useMemoFirebase(() => {
    if (!firestore || isRoleLoading) return null;
    return collection(firestore, 'stations');
  }, [firestore, isRoleLoading]);

  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: stations, isLoading: isLoadingStations } = useCollection<Station>(stationsQuery);

  const isLoading = isRoleLoading || isLoadingTransactions || isLoadingStations;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
        <p className="text-muted-foreground mt-1">Audit keuangan dan manajemen tagihan pelanggan.</p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <TransactionClient 
            transactions={transactions || []} 
            stations={stations || []}
        />
      )}
    </div>
  );
}
