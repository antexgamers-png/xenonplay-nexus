
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Timer, CheckCircle2, PauseCircle, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

function MonitorTimer({ 
  endTime, 
  remainingSeconds, 
  isPaused 
}: { 
  endTime: number | null; 
  remainingSeconds?: number | null;
  isPaused?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isPaused && remainingSeconds != null) {
        const h = Math.floor(remainingSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(remainingSeconds % 60).toString().padStart(2, '0');
        setTimeLeft({ h, m, s });
        return;
    }

    if (!endTime) return;

    const update = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' });
        return;
      }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimeLeft({ h, m, s });
    };

    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, [endTime, remainingSeconds, isPaused, mounted]);

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
          "bg-white/40 backdrop-blur-md px-5 py-4 rounded-[2rem] border-2 transition-all duration-1000 shadow-inner",
          isPaused ? "border-amber-400/50 shadow-amber-500/10" : "border-primary/20 shadow-primary/10"
      )}>
        <span className={cn(
            "text-6xl lg:text-8xl font-black font-mono tracking-tighter tabular-nums drop-shadow-sm",
            isPaused ? "text-amber-500" : "text-primary"
        )}>{timeLeft.h}</span>
      </div>
      <span className={cn("text-4xl font-black animate-pulse", isPaused ? "text-amber-500/50" : "text-primary/50")}>:</span>
      <div className={cn(
          "bg-white/40 backdrop-blur-md px-5 py-4 rounded-[2rem] border-2 transition-all duration-1000 shadow-inner",
          isPaused ? "border-amber-400/50 shadow-amber-500/10" : "border-primary/20 shadow-primary/10"
      )}>
        <span className={cn(
            "text-6xl lg:text-8xl font-black font-mono tracking-tighter tabular-nums drop-shadow-sm",
            isPaused ? "text-amber-500" : "text-primary"
        )}>{timeLeft.m}</span>
      </div>
      <span className={cn("text-4xl font-black animate-pulse", isPaused ? "text-amber-500/50" : "text-primary/50")}>:</span>
      <div className={cn(
          "bg-white/40 backdrop-blur-md px-5 py-4 rounded-[2rem] border-2 transition-all duration-1000 shadow-inner",
          isPaused ? "border-amber-400/50 shadow-amber-500/10" : "border-primary/20 shadow-primary/10"
      )}>
        <span className={cn(
            "text-6xl lg:text-8xl font-black font-mono tracking-tighter tabular-nums drop-shadow-sm",
            isPaused ? "text-amber-500" : "text-primary"
        )}>{timeLeft.s}</span>
      </div>
    </div>
  );
}

export default function MonitorPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    setNow(new Date());
    setYear(new Date().getFullYear());
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);
  
  const stationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stations') : null, [firestore]);
  const { data: stations, isLoading } = useCollection<Station>(stationsQuery);

  const sortedStations = useMemo(() => {
    if (!stations) return [];
    return [...stations].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }, [stations]);

  const gridCols = useMemo(() => {
    const count = sortedStations.length;
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    if (count <= 12) return "grid-cols-4";
    return "grid-cols-5";
  }, [sortedStations.length]);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden relative font-body flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-accent/10 blur-[180px] rounded-full animate-pulse delay-1000" />

      {/* Header */}
      <header className="flex justify-between items-center px-12 py-8 relative z-10 border-b bg-white/40 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <div className="size-20 relative rotate-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">XenonPlay <span className="text-primary">Monitor</span></h1>
            <div className="flex items-center gap-3 mt-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-[11px] text-muted-foreground font-black tracking-[0.5em] uppercase">Elite Operational Hub</p>
            </div>
          </div>
        </div>
        
        <div className="text-right border-l border-slate-200 pl-12">
          <div className="text-6xl font-black font-mono tracking-tighter leading-none text-primary">
            {now ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] mt-3">
            {now ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '---'}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 p-10 relative z-10 overflow-hidden">
        <div className={cn("grid gap-8 h-full", gridCols)}>
          <AnimatePresence mode="popLayout">
            {sortedStations.map((station) => (
              <motion.div
                key={station.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "relative rounded-[4rem] p-10 border-[6px] transition-all duration-1000 flex flex-col justify-between overflow-hidden group shadow-2xl",
                  station.is_active 
                    ? station.is_paused
                        ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-amber-500/20"
                        : "bg-gradient-to-br from-white to-primary/5 border-primary/20 shadow-primary/20" 
                    : "bg-gradient-to-br from-emerald-50/20 to-transparent border-emerald-100 shadow-emerald-500/5"
                )}
              >
                {/* Watermark Logo */}
                <div className="absolute -bottom-10 -right-10 size-64 opacity-[0.05] pointer-events-none grayscale group-hover:scale-110 transition-transform duration-1000">
                    <Image src="/xenonplay-logo.png" alt="Watermark" fill className="object-contain" />
                </div>

                {/* Header Card */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <h2 className={cn(
                        "text-4xl font-black tracking-tighter uppercase line-clamp-1",
                        station.is_active ? "text-slate-900" : "text-slate-400"
                    )}>{station.name}</h2>
                    <Badge variant="outline" className={cn(
                        "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2",
                        station.is_active 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-muted text-muted-foreground border-border"
                    )}>{station.type} CORE</Badge>
                  </div>
                  
                  <div className={cn(
                    "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm transition-all animate-in fade-in zoom-in duration-500",
                    station.is_active 
                      ? station.is_paused
                        ? "bg-amber-500 text-white border-amber-500 animate-pulse"
                        : "bg-primary text-white border-primary shadow-primary/20" 
                      : "bg-emerald-500 text-white border-emerald-500"
                  )}>
                    {station.is_active ? station.is_paused ? 'PAUSED' : 'PLAYING' : 'READY'}
                  </div>
                </div>

                {/* Timer Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  {station.is_active ? (
                    <div className="flex flex-col items-center gap-8">
                      <MonitorTimer 
                        endTime={station.end_time} 
                        remainingSeconds={station.remaining_seconds}
                        isPaused={station.is_paused}
                      />
                      <div className={cn(
                          "flex items-center gap-3 px-8 py-3 rounded-full border-2 transition-colors duration-500",
                          station.is_paused 
                            ? "bg-amber-100/50 border-amber-300 text-amber-600" 
                            : "bg-primary/5 border-primary/20 text-primary"
                      )}>
                        {station.is_paused ? <PauseCircle className="h-5 w-5" /> : <Activity className="h-5 w-5 animate-spin-slow" />}
                        <span className="text-[11px] font-black uppercase tracking-[0.5em]">{station.is_paused ? 'FREEZING' : 'ACTIVE SESSION'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-8 animate-in zoom-in-90 duration-700">
                      <div className="size-32 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-xl shadow-emerald-500/10">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-black text-emerald-500/40 uppercase tracking-[0.3em]">Unit Ready</span>
                        <p className="text-[10px] text-emerald-600/30 font-black uppercase mt-2 tracking-[0.5em]">Waiting for player</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Marquee */}
      <footer className="h-[6vh] bg-primary flex items-center overflow-hidden z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/10">
        <motion.div
          animate={{ x: [2000, -2000] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-lg font-black uppercase tracking-[0.8em] text-white flex gap-32 items-center"
        >
          <span>SELAMAT DATANG DI XENONPLAY GAMING CENTER</span>
          <span>•</span>
          <span>KUMPULKAN POIN SETIAP JAM DAN TUKARKAN DENGAN HADIAH MENARIK</span>
          <span>•</span>
          <span>SEDIA BERBAGAI SNACK DAN MINUMAN SEGAR DI KASIR</span>
          <span>•</span>
          <span>HUBUNGI KASIR UNTUK BOOKING DAN TOP-UP WAKTU ANDA</span>
          <span>•</span>
          <span>© {year || '2026'} BY AFRIBR</span>
          <span>•</span>
        </motion.div>
      </footer>
    </div>
  );
}
