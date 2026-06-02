
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    ShieldCheck, 
    Zap, 
    Power, 
    Moon, 
    Home, 
    BookText,
    Activity,
    Play,
    AlertCircle,
    MonitorPlay,
    Volume2,
    Plus,
    Minus,
    VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useShift } from '@/components/providers/shift-provider';
import Link from 'next/link';

export default function AdbSimulatorPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();
  const [now, setNow] = useState<number>(Date.now());
  
  const [customDurations, setCustomDurations] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);
  
  const stationsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'stations') : null), [firestore]);
  const { data: stations } = useCollection<Station>(stationsQuery);

  const sortedStations = useMemo(() => {
      if (!stations) return [];
      return [...stations].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [stations]);

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Shift Belum Dibuka",
        description: "Harap buka shift kasir terlebih dahulu.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  const handleAction = async (stationId: string, action: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      try {
          const updates: any = {
              last_action: action,
              last_action_timestamp: Date.now()
          };
          if (action === 'stop' || action === 'sleep') {
              updates.is_active = false;
              updates.end_time = null;
          }
          await updateDoc(doc(firestore, 'stations', stationId), updates);
          toast({ title: `Sinyal ${action.toUpperCase()} dikirim`, variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  };

  const handleSimulateTime = async (stationId: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      const durationStr = customDurations[stationId] || '0';
      const minutes = parseInt(durationStr);
      if (isNaN(minutes) || minutes <= 0) {
          toast({ title: "Input Salah", description: "Masukkan jumlah menit.", variant: "destructive" });
          return;
      }
      try {
          const nowMs = Date.now();
          const endTime = nowMs + minutes * 60 * 1000;
          await updateDoc(doc(firestore, 'stations', stationId), {
              is_active: true,
              is_paused: false,
              start_time: nowMs,
              end_time: endTime,
              last_action: 'start',
              last_action_timestamp: nowMs,
              current_transaction_id: 'SIM_' + Math.random().toString(36).substring(2, 7).toUpperCase()
          });
          toast({ title: `Simulasi ${minutes}m Dimulai`, variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  };

  const updateCustomDuration = (stationId: string, val: string) => {
      setCustomDurations(prev => ({ ...prev, [stationId]: val }));
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Hardware Command Hub</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Simulator <span className="text-primary">Master</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Panel kontrol darurat untuk memicu perintah hardware secara manual.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/panduan">
                <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl border-border">
                    <BookText className="size-4" /> Buka Panduan & Script
                </Button>
            </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedStations?.map(station => {
                  const hbMillis = station.last_heartbeat?.toMillis ? station.last_heartbeat.toMillis() : (typeof station.last_heartbeat === 'number' ? station.last_heartbeat : 0);
                  const isOnline = hbMillis > 0 && (now - hbMillis < 95000); // Threshold 95s
                  
                  return (
                      <Card key={station.id} className="border-border bg-card shadow-sm overflow-hidden rounded-2xl">
                          <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                              <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                      <div className="relative size-10">
                                          <Image src={`/${station.type.toLowerCase()}-logo.png`} alt={station.type} fill className="object-contain" />
                                      </div>
                                      <div>
                                          <CardTitle className="text-lg font-black uppercase leading-none">{station.name}</CardTitle>
                                          <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-[8px] font-black bg-primary/5 text-primary border-primary/20 tracking-wider">PORT: {station.hdmiIndex || 1}</Badge>
                                              <p className="text-[10px] font-mono text-muted-foreground">{station.ipAddress}</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className={cn(
                                      "size-2.5 rounded-full transition-all duration-500",
                                      isOnline ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500 animate-pulse"
                                  )} title={isOnline ? 'Bridge Connection OK' : 'No Response'} />
                              </div>
                          </CardHeader>
                          <CardContent className="p-5 space-y-4">
                              <div className="grid grid-cols-4 gap-2">
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-emerald-600 border-emerald-500/20" onClick={() => handleAction(station.id, 'wake')}><Power className="size-3.5" /><span className="text-[8px] font-black">WAKE</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-red-600 border-red-500/20" onClick={() => handleAction(station.id, 'sleep')}><Moon className="size-3.5" /><span className="text-[8px] font-black">SLEEP</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'home')}><Home className="size-3.5" /><span className="text-[8px] font-black">HOME</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'hdmi')}><Zap className="size-3.5" /><span className="text-[8px] font-black">HDMI</span></Button>
                              </div>

                              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2 rounded-xl border border-border/50">
                                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-primary hover:bg-primary/10" onClick={() => handleAction(station.id, 'vol_up')}><Plus className="size-3" /><span className="text-[9px] font-black">VOL +</span></Button>
                                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-primary hover:bg-primary/10" onClick={() => handleAction(station.id, 'vol_down')}><Minus className="size-3" /><span className="text-[9px] font-black">VOL -</span></Button>
                                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-amber-600 hover:bg-amber-500/10" onClick={() => handleAction(station.id, 'mute')}><VolumeX className="size-3" /><span className="text-[9px] font-black">MUTE</span></Button>
                              </div>

                              <div className="pt-4 border-t border-dashed space-y-3">
                                  <div className="flex items-center justify-between px-1">
                                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Simulasi Injeksi Waktu</p>
                                      <Badge variant="secondary" className="text-[7px] font-black h-4 px-1.5 border-none bg-muted/50">TEST MODE</Badge>
                                  </div>
                                  <div className="flex gap-2">
                                      <div className="relative flex-1">
                                          <Input 
                                            type="number" 
                                            placeholder="Menit..." 
                                            className="h-9 pr-8 font-black font-mono text-xs rounded-xl bg-muted/30"
                                            value={customDurations[station.id] || ''}
                                            onChange={(e) => updateCustomDuration(station.id, e.target.value)}
                                            disabled={station.is_active}
                                          />
                                          <div className="absolute right-3 top-2.5 text-[8px] font-black text-muted-foreground uppercase">Min</div>
                                      </div>
                                      <Button 
                                          className="h-9 px-4 rounded-xl font-black uppercase text-[9px] gap-2 shadow-lg shadow-primary/20"
                                          onClick={() => handleSimulateTime(station.id)}
                                          disabled={station.is_active}
                                      >
                                          <Play className="size-3 fill-current" /> Play
                                      </Button>
                                      {station.is_active && (
                                          <Button 
                                              variant="destructive" 
                                              size="sm" 
                                              className="h-9 w-9 rounded-xl p-0"
                                              onClick={() => handleAction(station.id, 'stop')}
                                          >
                                              <Power className="size-3.5" />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  )
              })}
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-3 text-blue-600">
                      <div className="p-2 rounded-xl bg-blue-600 text-white">
                        <MonitorPlay className="size-5" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight">Fungsi Simulator</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                      Gunakan panel ini untuk menguji apakah **Xenon Bridge** di laptop Anda sudah merespons sinyal dari Cloud dengan benar tanpa harus membuat transaksi asli.
                  </p>
                  <ul className="space-y-3 text-[10px] text-muted-foreground border-t border-blue-500/10 pt-4">
                      <li className="flex items-start gap-2">
                          <Zap className="size-3 text-blue-500 shrink-0 mt-0.5" />
                          <span>**Wake & Sleep**: Mengirim perintah power asli ke Smart TV via ADB.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <Volume2 className="size-3 text-blue-500 shrink-0 mt-0.5" />
                          <span>**Audio Control**: Mengatur suara TV (v1.4.2+) dari jarak jauh.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <Activity className="size-3 text-blue-500 shrink-0 mt-0.5" />
                          <span>**Play Simulation**: Memulai timer dummy untuk mengetes fitur **RAM Watchdog** pada bridge.</span>
                      </li>
                  </ul>
              </div>

              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="size-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Peringatan Audit</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Seluruh aktivitas di halaman simulator ini **tidak masuk dalam laporan keuangan**, namun tetap tercatat dalam log audit sistem untuk keamanan.
                  </p>
              </div>

              <Card className="bg-card border-border p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                      <Volume2 className="size-4 text-primary" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Status Hardware</h4>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase">Protokol Kendali</span>
                          <span className="font-bold text-primary">ADB WIRELESS</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase">Sync Latency</span>
                          <span className="font-bold text-emerald-600">&lt; 500MS</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase">Fail-Safe Mode</span>
                          <span className="font-bold text-blue-600">ACTIVE</span>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
}
