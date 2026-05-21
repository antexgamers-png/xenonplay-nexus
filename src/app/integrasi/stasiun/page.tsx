'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { StationClient } from '@/components/master-data/stations/station-client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { ShieldAlert, MonitorSmartphone, ShieldCheck, Wifi } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StationManagementPage() {
  const firestore = useFirestore();
  const { role, isRoleLoading: isAuthLoading } = useAuth();

  const stationsQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return collection(firestore, 'stations');
  }, [firestore, isAuthLoading, role]);

  const { data: stations, isLoading } = useCollection<Station>(stationsQuery);

  const sortedStations = useMemo(() => {
    if (!stations) return [];
    return [...stations].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }, [stations]);

  if (!isAuthLoading && role !== 'admin') {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase">Akses Ditolak</h2>
            <p className="text-muted-foreground max-w-sm">Manajemen Hardware Stasiun hanya dapat dikelola oleh Admin.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Bridge Guardian Active</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase">Manajemen Hardware</h1>
        <p className="text-muted-foreground mt-1">
          Konfigurasi unit Smart TV untuk kontrol otomatis via <b>Xenon Bridge</b>.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
          <Alert className="bg-primary/5 border-primary/20">
            <Wifi className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-black uppercase text-[10px] tracking-widest">Alamat IP Statis</AlertTitle>
            <AlertDescription className="text-xs text-primary/80 leading-relaxed">
              Pastikan setiap TV memiliki <b>IP Statis</b> agar koneksi Bridge tidak terputus saat router dinyalakan ulang.
            </AlertDescription>
          </Alert>

          <Alert className="bg-emerald-500/5 border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">Local Watchdog v2.2</AlertTitle>
            <AlertDescription className="text-xs text-emerald-700/80 leading-relaxed">
              Sistem pengawas waktu kini berjalan di laptop Bridge. TV pasti mati meskipun dashboard ditutup.
            </AlertDescription>
          </Alert>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <MonitorSmartphone className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Daftar Unit TV</CardTitle>
                <CardDescription>Atur nomor urut dan alamat IP unit di sini.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
                <div className="flex justify-end"><Skeleton className="h-10 w-[140px]"/></div>
                <div className="rounded-md border p-4 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
          ) : (
            <StationClient initialData={sortedStations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
