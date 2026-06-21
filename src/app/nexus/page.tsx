
'use client';
import { StationGrid } from '@/components/dashboard/station-grid';
import { FnbPos } from '@/components/dashboard/fnb-pos';
import { VoucherPos } from '@/components/dashboard/voucher-pos';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Station, PricingRule, FnbItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { Gamepad2, ShoppingCart, Ticket } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const { data: stations, isLoading: isLoadingStations } = useCollection<Station>(stationsQuery);
  const { data: pricingRules, isLoading: isLoadingPricing } = useCollection<PricingRule>(pricingRulesQuery);
  const { data: fnbItems, isLoading: isLoadingFnb } = useCollection<FnbItem>(fnbItemsQuery);
  
  const isLoading = isRoleLoading || isLoadingStations || isLoadingPricing || isLoadingFnb;

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
              />
            )
          )}
        </TabsContent>

        <TabsContent value="kasir" className="mt-0 outline-none pb-20 lg:pb-0">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-[500px]" />
              <Skeleton className="h-[500px]" />
            </div>
          ) : (
            fnbItems && <FnbPos items={fnbItems} />
          )}
        </TabsContent>

        <TabsContent value="voucher" className="mt-0 outline-none pb-20 lg:pb-0">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-1 h-[400px]" />
              <Skeleton className="lg:col-span-2 h-[400px]" />
            </div>
          ) : (
            <VoucherPos />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
