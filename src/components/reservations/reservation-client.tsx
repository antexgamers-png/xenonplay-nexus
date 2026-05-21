'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, CalendarCheck, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ReservationTable } from './reservation-table';
import { ReservationFormDialog } from './reservation-form-dialog';
import type { Reservation, Station, PricingRule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReservationClientProps {
    initialData: Reservation[];
    stations: Station[];
    pricingRules: PricingRule[];
}

export function ReservationClient({ initialData, stations, pricingRules }: ReservationClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredData = useMemo(() => {
    return initialData.filter(r => 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.stationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialData, searchQuery]);

  const stats = useMemo(() => {
    const active = initialData.filter(r => r.status === 'scheduled').length;
    const now = Date.now();
    const imminent = initialData.filter(r => 
        r.status === 'scheduled' && 
        r.startTime > now && 
        r.startTime <= now + 30 * 60 * 1000
    ).length;
    
    return { active, imminent };
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest">Booking Terjadwal</CardTitle>
                <CalendarCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black">{stats.active}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Sesi yang akan datang hari ini</p>
            </CardContent>
        </Card>
        <Card className={stats.imminent > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900/50"}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase tracking-widest">Segera Datang</CardTitle>
                <Clock className={stats.imminent > 0 ? "h-4 w-4 text-amber-500 animate-pulse" : "h-4 w-4 text-slate-500"} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className={stats.imminent > 0 ? "text-2xl font-black text-amber-500" : "text-2xl font-black"}>
                    {stats.imminent}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Dalam 30 menit ke depan</p>
            </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama, hp, atau stasiun..." 
            className="pl-10 h-11 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="h-11 font-bold gap-2">
          <Plus className="h-4 w-4" /> Tambah Reservasi
        </Button>
      </div>

      <ReservationTable 
        data={filteredData} 
        stations={stations}
        pricingRules={pricingRules}
      />

      <ReservationFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        stations={stations}
        pricingRules={pricingRules}
      />
    </div>
  );
}
