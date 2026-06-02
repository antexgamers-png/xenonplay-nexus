
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Station, PricingRule } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PauseCircle, Activity, Clock, Zap } from 'lucide-react';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface MonitorTimerProps {
  endTime: number | null;
  remainingSeconds?: number | null;
  isPaused?: boolean;
}

function MonitorTimer({ endTime, remainingSeconds, isPaused }: MonitorTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  
  useEffect(() => {
    if (!mounted) return;

    if (isPaused && remainingSeconds != null) {
        const h = Math.floor(remainingSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(remainingSeconds % 60).toString().padStart(2, '0');
        setTimeLeft({ h, m, s }); return;
    }
    if (!endTime) return;
    const update = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) { setTimeLeft({ h: '00', m: '00', s: '00' }); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000).toString().padStart(2, '0'),
        m: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
        s: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
      });
    };
    const timer = setInterval(update, 1000); update();
    return () => clearInterval(timer);
  }, [endTime, remainingSeconds, isPaused, mounted]);

  return (
    <div className="flex items-center gap-[1vw]">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
        <div key={i} className="flex items-center gap-[1vw]">
          <div className={cn(
            "bg-foreground/10 backdrop-blur-xl px-[2vw] py-[1.5vh] rounded-[2vw] border-[0.4vh] shadow-inner transition-all duration-1000", 
            isPaused ? "border-amber-400/50 shadow-amber-500/10" : "border-primary/30 shadow-primary/10"
          )}>
            <span className={cn(
              "text-[9vh] font-black font-mono tracking-tighter tabular-nums leading-none drop-shadow-lg", 
              isPaused ? "text-amber-500" : "text-primary"
            )}>{unit}</span>
          </div>
          {i < 2 && <span className={cn("text-[5vh] font-black animate-pulse", isPaused ? "text-amber-500/50" : "text-primary/50")}>:</span>}
        </div>
      ))}
    </div>
  );
}

export function PublicDisplayPage() {
  const firestore = useFirestore();
  const [activeSlide, setActiveSlide] = useState(0); 
  const [now, setNow] = useState<number>(Date.now());
  
  const stationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stations') : null, [firestore]);
  const pricingQuery = useMemoFirebase(() => firestore ? collection(firestore, 'pricingRules') : null, [firestore]);
  
  const { data: stations } = useCollection<Station>(stationsQuery);
  const { data: pricingRules } = useCollection<PricingRule>(pricingQuery);

  // Clock & Online Status Pulse (Forcing re-calculation of isOnline)
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(clock);
  }, []);

  // Slider Interval
  useEffect(() => {
    const slider = setInterval(() => {
        setActiveSlide(prev => prev === 0 ? 1 : 0);
    }, activeSlide === 0 ? 60000 : 15000);
    return () => clearInterval(slider);
  }, [activeSlide]);

  const sortedStations = useMemo(() => (stations || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })), [stations]);
  const sortedPricing = useMemo(() => (pricingRules || []).sort((a, b) => a.price - b.price), [pricingRules]);

  const gridCols = useMemo(() => {
    const c = sortedStations.length;
    if (c <= 4) return "grid-cols-2";
    if (c <= 6) return "grid-cols-3";
    if (c <= 9) return "grid-cols-3";
    if (c <= 12) return "grid-cols-4";
    return "grid-cols-5";
  }, [sortedStations.length]);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col border-none font-body">
      
      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-primary/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-accent/5 blur-[200px] rounded-full animate-pulse delay-1000 pointer-events-none" />

      {/* HEADER (12vh) */}
      <header className="h-[12vh] flex justify-between items-center px-[4vw] z-20 bg-background/20 backdrop-blur-2xl border-b shrink-0">
        <div className="flex items-center gap-[2vw]">
          <div className="relative h-[8vh] w-[8vh] rotate-3 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-[4.5vh] font-black tracking-tighter uppercase leading-none">XENONPLAY <span className="text-primary">CENTER</span></h1>
            <div className="flex items-center gap-[0.5vw] mt-[0.5vh]">
                <div className="h-[1vh] w-[1vh] rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[1.2vh] font-black uppercase tracking-[0.4em] text-muted-foreground">Elite Command Hub</span>
            </div>
          </div>
        </div>
        
        <div className="text-right border-l pl-[3vw] border-border">
          <div className="text-[6vh] font-black font-mono tracking-widest text-primary leading-none">
            {new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[1.3vh] font-black text-muted-foreground uppercase tracking-[0.6em] mt-[1vh]">
            {new Date(now).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT (80vh) */}
      <main className="flex-1 relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div 
              key="monitor" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.02 }} 
              transition={{ duration: 0.8 }}
              className="h-full p-[2.5vh]"
            >
              <div className={cn("grid gap-[2.5vh] h-full", gridCols)}>
                {sortedStations.map(s => {
                  const hbMillis = s.last_heartbeat?.toMillis ? s.last_heartbeat.toMillis() : (typeof s.last_heartbeat === 'number' ? s.last_heartbeat : 0);
                  // 95s tolerance for 60s ping
                  const isOnline = hbMillis && (now - hbMillis < 95000);

                  return (
                    <div 
                      key={s.id} 
                      className={cn(
                        "rounded-[3vw] p-[2.5vw] border-[0.5vh] flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-1000 relative group", 
                        s.is_active 
                          ? s.is_paused 
                            ? "bg-amber-500/5 border-amber-400/30 shadow-amber-500/10" 
                            : "bg-primary/5 border-primary/20 shadow-primary/20" 
                          : "bg-muted/20 border-border opacity-80"
                      )}
                    >
                      <div className="absolute -bottom-10 -right-10 size-[30vh] opacity-[0.03] pointer-events-none grayscale group-hover:scale-110 transition-transform duration-1000">
                          <Image src="/xenonplay-logo.png" alt="Watermark" fill className="object-contain" />
                      </div>

                      <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-[0.5vh]">
                          <h2 className={cn(
                            "text-[4vh] font-black uppercase leading-none tracking-tighter",
                            s.is_active ? "text-foreground" : "text-muted-foreground"
                          )}>{s.name}</h2>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                              "rounded-[0.8vw] text-[1.2vh] font-black uppercase tracking-widest border-[0.2vh] px-[1vw] py-[0.3vh]",
                              s.is_active ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent text-muted-foreground border-border"
                            )}>{s.type} CORE</Badge>
                            {!isOnline && (
                                <span className="text-[1vh] font-black text-red-500 uppercase animate-pulse">Offline</span>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          "px-[1.5vw] py-[0.8vh] rounded-[1.2vw] text-[1.1vh] font-black uppercase tracking-[0.2em] border-[0.2vh] shadow-sm",
                          s.is_active 
                            ? s.is_paused ? "bg-amber-500 text-white border-amber-500" : "bg-primary text-white border-primary" 
                            : "bg-muted text-muted-foreground border-border"
                        )}>
                          {s.is_active ? s.is_paused ? 'FREEZING' : 'PLAYING' : 'READY'}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        {s.is_active ? (
                          <div className="flex flex-col items-center gap-[3vh]">
                            <MonitorTimer endTime={s.end_time} remainingSeconds={s.remaining_seconds} isPaused={s.is_paused} />
                            <div className={cn(
                              "flex items-center gap-[1vw] px-[2vw] py-[1vh] rounded-full border-[0.2vh] transition-colors duration-500 bg-foreground/5",
                              s.is_paused ? "border-amber-400/30 text-amber-500" : "border-primary/20 text-primary"
                            )}>
                              {s.is_paused ? <PauseCircle className="size-[2.5vh]" /> : <Activity className="size-[2.5vh] animate-spin-slow" />}
                              <span className="text-[1.2vh] font-black uppercase tracking-[0.4em]">{s.is_paused ? 'SESSION FROZEN' : 'ACTIVE SESSION'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-[4vh] opacity-20">
                            <div className="size-[12vh] rounded-[3vw] bg-foreground/5 flex items-center justify-center border-[0.3vh] border-border rotate-6 group-hover:rotate-0 transition-transform duration-700">
                              <CheckCircle2 className="size-[7vh] text-foreground" />
                            </div>
                            <span className="text-[3vh] font-black text-foreground uppercase tracking-[0.5em]">Unit Ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="pricing" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.8 }}
              className="h-full flex items-center justify-center p-[5vh]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4vh] w-full max-w-[92vw]">
                {sortedPricing.slice(0, 6).map(r => (
                  <div key={r.id} className="p-[4vh] rounded-[3vw] border-[0.5vh] border-border bg-card/30 backdrop-blur-3xl flex flex-col relative overflow-hidden shadow-2xl group hover:border-primary/30 transition-colors">
                    <div className="absolute top-0 left-0 w-[0.8vw] h-full bg-primary/50" />
                    <div className="flex justify-between items-start mb-[3vh]">
                        <div className="space-y-[1vh]">
                            <Badge className="bg-primary/20 text-primary border-none text-[1vh] font-black uppercase px-[1vw]">{r.type === 'All' ? 'ANY UNIT' : `${r.type} CORE`}</Badge>
                            <h3 className="text-[4.5vh] font-black uppercase leading-none text-foreground tracking-tighter truncate max-w-[20vw]">{r.name}</h3>
                        </div>
                        <div className="size-[7vh] rounded-[1.5vw] bg-foreground/5 flex items-center justify-center border border-border">
                            <Zap className="size-[3.5vh] text-primary fill-current" />
                        </div>
                    </div>
                    <div className="flex items-center gap-[1.5vw] mb-[4vh] bg-foreground/5 p-[2vh] rounded-[1.5vw] border border-border">
                        <div className="p-[1vh] rounded-lg bg-primary/10">
                            <Clock className="size-[3vh] text-primary" />
                        </div>
                        <span className="text-[3.5vh] font-black text-foreground">{formatDuration(r.duration)} Playtime</span>
                    </div>
                    <div className="mt-auto">
                        <div className="text-[7.5vh] font-black text-primary font-mono flex items-start leading-none">
                            <span className="text-[2.5vh] mt-[1.5vh] mr-[0.5vw] opacity-40">RP</span>{formatCurrency(r.price).replace('Rp', '').replace(',00', '')}<span className="text-[2.5vh] mt-auto ml-[0.2vw] opacity-20">,-</span>
                        </div>
                        <p className="text-[1.1vh] font-black text-muted-foreground uppercase tracking-[0.4em] mt-[1.5vh]">Full Service • No Hidden Fees</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-[8vh] bg-primary flex items-center overflow-hidden shrink-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-white/10">
        <div className="animate-marquee-css">
            <span className="text-primary-foreground font-black text-[3.2vh] tracking-[0.6em] uppercase mx-[6vw] whitespace-nowrap">
                SELAMAT DATANG DI XENONPLAY CENTER • NIKMITI PENGALAMAN GAMING NEXT-GEN TERBAIK • KUMPULKAN POIN TIAP JAM DAN TUKARKAN HADIAH MENARIK • SEDIA BERBAGAI SNACK DAN MINUMAN SEGAR •
            </span>
            <span className="text-primary-foreground font-black text-[3.2vh] tracking-[0.6em] uppercase mx-[6vw] whitespace-nowrap">
                SELAMAT DATANG DI XENONPLAY CENTER • NIKMITI PENGALAMAN GAMING NEXT-GEN TERBAIK • KUMPULKAN POIN TIAP JAM DAN TUKARKAN HADIAH MENARIK • SEDIA BERBAGAI SNACK DAN MINUMAN SEGAR •
            </span>
        </div>
      </footer>
    </div>
  );
}
