'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingClient } from '@/components/master-data/pricing/pricing-client';
import { FnbClient } from '@/components/master-data/fnb/fnb-client';
import { WifiClient } from '@/components/master-data/wifi/wifi-client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { PricingRule, FnbItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { ShieldAlert, Tag, ShoppingCart, Wifi } from 'lucide-react';
import { useMemo } from 'react';

export default function MasterDataPage() {
  const firestore = useFirestore();
  const { role, isRoleLoading: isAuthLoading } = useAuth();

  const pricingRulesQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'pricingRules');
  }, [firestore, isAuthLoading, role]);

  const fnbItemsQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'fnbItems');
  }, [firestore, isAuthLoading, role]);

  const { data: pricingRules, isLoading: isLoadingPricing } = useCollection<PricingRule>(pricingRulesQuery);
  const { data: fnbItems, isLoading: isLoadingFnb } = useCollection<FnbItem>(fnbItemsQuery);
  
  const isLoading = isAuthLoading || isLoadingPricing || isLoadingFnb;

  const psPricingRules = useMemo(() => (pricingRules || []).filter(r => r.type !== 'Wifi'), [pricingRules]);
  const wifiPricingRules = useMemo(() => (pricingRules || []).filter(r => r.type === 'Wifi'), [pricingRules]);

  if (!isAuthLoading && role !== 'admin') {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase">Akses Ditolak</h2>
            <p className="text-muted-foreground max-w-sm">Manajemen Master Data (Harga & Stok) hanya dapat dikelola oleh Admin.</p>
        </div>
    )
  }

  const renderSkeleton = () => (
    <div className='space-y-4'>
        <div className='flex justify-end'>
            <Skeleton className='h-10 w-[140px]'/>
        </div>
        <div className="rounded-md border">
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
        <p className="text-muted-foreground mt-1">
          Kelola katalog harga paket, inventaris produk FnB, dan kupon Wi-Fi.
        </p>
      </header>
      <Tabs defaultValue="pricing">
        <TabsList className="bg-muted/50 border p-1 rounded-xl h-11 inline-flex w-auto overflow-x-auto max-w-full">
          <TabsTrigger value="pricing" className="px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 shrink-0">
            <Tag className="size-3.5" /> Harga Rental
          </TabsTrigger>
          <TabsTrigger value="fnb" className="px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 shrink-0">
            <ShoppingCart className="size-3.5" /> Produk FnB
          </TabsTrigger>
          <TabsTrigger value="wifi" className="px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 shrink-0">
            <Wifi className="size-3.5" /> Kupon Wi-Fi
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pricing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Harga & Paket Bundling</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && renderSkeleton()}
              {!isLoading && <PricingClient initialData={psPricingRules} fnbItems={fnbItems || []} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fnb" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Food & Beverage</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && renderSkeleton()}
              {!isLoading && <FnbClient initialData={fnbItems || []} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wifi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Katalog Paket Wi-Fi</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && renderSkeleton()}
              {!isLoading && <WifiClient initialData={wifiPricingRules} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}