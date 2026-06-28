'use client';
import { StationGrid } from '@/components/dashboard/station-grid';
import { FnbPos } from '@/components/dashboard/fnb-pos';
import { VoucherPos } from '@/components/dashboard/voucher-pos';
import { WifiPos } from '@/components/dashboard/wifi-pos';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Station, PricingRule, FnbItem, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { Gamepad2, ShoppingCart, Ticket, Wifi } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from 'react';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { isRoleLoading } = useAuth();

  const stationsQuery = useMemoFirebase(() => {
    if (isRoleLoading || !firestore) return null;
    return collection(firestore, 'stations');
  }, [firestore, isRoleLoading]);

  const pricingRulesQuery = useMemoFirebase(() => {
    if (isRoleLoading || !firestore) return null;
    return collection(firestore, 'pricingRules');
  }, [firestore, isRoleLoading]);

  const fnbItemsQuery = useMemoFirebase(() => {
    if (isRoleLoading || !firestore) return null;
    return collection(firestore, 'fnbItems');
  }, [firestore, isRoleLoading]);

  // Hemat Kuota: Dashboard hanya butuh transaksi terbaru untuk fungsionalitas tombol "Nota" (Limit 100)
  const transactionsQuery = useMemoFirebase(() => {
    if (isRoleLoading || !firestore) return null;
    return query(collection(firestore, 'transactions'), orderBy('timestamp', 'desc'), limit(100));
  }, [firestore, isRoleLoading]);

  const { data: stations, isLoading: isLoadingStations } = useCollection<Station>(stationsQuery);
  const { data: pricingRules, isLoading: isLoadingPricing } = useCollection<PricingRule>(pricingRulesQuery);
  const { data: fnbItems, isLoading: isLoadingFnb } = useCollection<FnbItem>(fnbItemsQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  
  const isLoading = isRoleLoading || isLoadingStations || isLoadingPricing || isLoadingFnb || isLoadingTransactions;

  const wifiPackages = useMemo(() => (pricingRules || []).filter(r => r.type === 'Wifi'), [pricingRules]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 px-1 lg:px-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Dashboard Nexus</h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Pantau & Kontrol Unit Real-Time</p>
        </div>
      </header>

      <Tabs defaultValue="rental" className="flex flex-col">
        <TabsList className="inline-flex items-center justify-start h-10 bg-muted/50 backdrop-blur-md border p-1 mb-4 rounded-xl shrink-0 w-fit mx-1 lg:ml-0 overflow-x-auto max-w-full">
          <TabsTrigger 
            value="rental" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest gap-2 h-full whitespace-nowrap"
          >
            <Gamepad2 className="h-3 w-3" />
            Monitor Rental
          </TabsTrigger>
          <TabsTrigger 
            value="kasir" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest gap-2 h-full whitespace-nowrap"
          >
            <ShoppingCart className="h-3 w-3" />
            Kasir Kantin
          </TabsTrigger>
          <TabsTrigger 
            value="wifi" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest gap-2 h-full whitespace-nowrap"
          >
            <Wifi className="h-3 w-3" />
            Hotspot Wi-Fi
          </TabsTrigger>
          <TabsTrigger 
            value="voucher" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest gap-2 h-full whitespace-nowrap"
          >
            <Ticket className="h-3 w-3" />
            Voucher Mabar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rental" className="mt-0 outline-none">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video lg:aspect-square w-full rounded-xl" />
                ))}
            </div>
          ) : (
            stations && pricingRules && fnbItems && (
              <StationGrid 
                  initialStations={stations} 
                  pricingRules={pricingRules}
                  fnbItems={fnbItems}
                  externalTransactions={transactions || []}
              />
            )
          )}
        </TabsContent>

        <TabsContent value="kasir" className="mt-0 outline-none pb-20 lg:pb-0">
          {isLoading ? <Skeleton className="h-[500px]" /> : fnbItems && <FnbPos items={fnbItems} />}
        </TabsContent>

        <TabsContent value="wifi" className="mt-0 outline-none pb-20 lg:pb-0">
          {isLoading ? <Skeleton className="h-[400px]" /> : <WifiPos packages={wifiPackages} />}
        </TabsContent>

        <TabsContent value="voucher" className="mt-0 outline-none pb-20 lg:pb-0">
          {isLoading ? <Skeleton className="h-[400px]" /> : <VoucherPos />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
