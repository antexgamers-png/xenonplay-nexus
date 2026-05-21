
'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { startOfDay } from 'date-fns';
import type { Reservation, Station, PricingRule } from '@/lib/types';
import { ReservationClient } from '@/components/reservations/reservation-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';

export default function ReservationsPage() {
  const firestore = useFirestore();
  const { isRoleLoading } = useAuth();
  const [todayTimestamp, setTodayTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // Set timestamp hanya di client untuk menghindari hydration mismatch
    setTodayTimestamp(startOfDay(new Date()).getTime());
  }, []);

  const stationsQuery = useMemoFirebase(() => 
    !firestore || isRoleLoading ? null : collection(firestore, 'stations'), 
    [firestore, isRoleLoading]
  );

  const pricingQuery = useMemoFirebase(() => 
    !firestore || isRoleLoading ? null : collection(firestore, 'pricingRules'), 
    [firestore, isRoleLoading]
  );

  // Load reservations for today
  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore || isRoleLoading || !todayTimestamp) return null;
    return query(
        collection(firestore, 'reservations'),
        where('startTime', '>=', todayTimestamp),
        orderBy('startTime', 'asc')
    );
  }, [firestore, isRoleLoading, todayTimestamp]);

  const { data: stations, isLoading: isLoadingStations } = useCollection<Station>(stationsQuery);
  const { data: pricingRules, isLoading: isLoadingPricing } = useCollection<PricingRule>(pricingQuery);
  const { data: reservations, isLoading: isLoadingRes } = useCollection<Reservation>(reservationsQuery);

  const isLoading = isLoadingStations || isLoadingPricing || isLoadingRes;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Booking & Reservasi</h1>
        <p className="text-muted-foreground mt-1">Kelola pesanan tempat pelanggan agar tidak bentrok.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <ReservationClient 
            initialData={reservations || []} 
            stations={stations || []}
            pricingRules={pricingRules || []}
        />
      )}
    </div>
  );
}
