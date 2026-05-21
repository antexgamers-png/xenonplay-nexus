
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PricingForm } from '@/components/pricing/pricing-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Price } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { MonitorPlay, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const firestore = useFirestore();
  const { isRoleLoading } = useAuth();

  const priceRef = useMemoFirebase(() => {
    if (!firestore || isRoleLoading) return null;
    return doc(firestore, 'prices', 'default');
  }, [firestore, isRoleLoading]);
  
  const { data: currentPricing, isLoading: isLoadingPrice } = useDoc<Price>(priceRef);
  const isLoading = isRoleLoading || isLoadingPrice;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Harga & Tampilan TV</h1>
            <p className="text-muted-foreground mt-1">
            Atur harga dasar dan kelola tampilan daftar harga digital.
            </p>
        </div>
        <Link href="/public-display" target="_blank">
            <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                <MonitorPlay className="h-4 w-4" />
                Buka Public Display
                <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
            </Button>
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Harga Dasar per Jam</CardTitle>
            <CardDescription>
              Harga ini digunakan sebagai patokan dasar untuk semua stasiun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-full max-w-xs" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
              </div>
            )}
            {!isLoading && currentPricing && <PricingForm currentPrice={currentPricing.perHour} />}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                    <MonitorPlay className="h-5 w-5" />
                    Digital Signage Mode
                </CardTitle>
                <CardDescription>
                    Tampilkan daftar harga yang ada di Master Data ke monitor TV pelanggan dengan desain yang telah diperbarui.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-primary/10 text-xs text-muted-foreground italic leading-relaxed">
                    "Gunakan rute ini pada Smart TV atau PC yang terhubung ke monitor publik untuk menampilkan promo paket secara estetik dan futuristik."
                </div>
                <Link href="/public-display" target="_blank">
                    <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                        Lihat Tampilan Baru
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
