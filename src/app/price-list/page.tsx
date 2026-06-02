'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { PricingRule } from '@/lib/types';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart, Sparkles, Zap, BadgeCheck } from 'lucide-react';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export default function PriceListTVPage() {
  const [now, setNow] = useState<number>(0);
  const [year, setYear] = useState<number>(2026);
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    setYear(new Date().getFullYear());
    const clock = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(clock);
  }, []);
  
  const pricingQuery = useMemoFirebase(() => firestore ? collection(firestore, 'pricingRules') : null, [firestore]);
  const { data: pricingRules, isLoading } = useCollection<PricingRule>(pricingQuery);

  const [emblaRef] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 10000, stopOnInteraction: false })
  ]);

  const sortedRules = useMemo(() => {
    if (!pricingRules) return [];
    return [...pricingRules].sort((a, b) => a.price - b.price);
  }, [pricingRules]);

  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden relative font-body flex flex-col select-none">
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-primary/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-accent/10 blur-[200px] rounded-full animate-pulse delay-1000 pointer-events-none" />

      <header className="h-[12vh] flex justify-between items-center px-12 relative z-20 bg-white/40 backdrop-blur-2xl border-b border-white/20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="relative size-16 rotate-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-slate-900">
                XENONPLAY <span className="text-primary">PRICING</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-[10px] text-muted-foreground font-black tracking-[0.4em] uppercase">Elite Gaming Hub • Official Rates</p>
            </div>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="text-5xl font-black font-mono tracking-tighter leading-none text-primary drop-shadow-sm tabular-nums">
            {now > 0 ? new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 border-t border-slate-200 pt-1">
            {now > 0 ? new Date(now).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '---'}
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 overflow-hidden flex items-center px-6 min-h-0">
        {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
                <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Syncing Catalog...</span>
            </div>
        ) : (
            <div className="embla w-full h-full" ref={emblaRef}>
                <div className="embla__container flex h-full">
                    {sortedRules.map((rule) => (
                        <div key={rule.id} className="embla__slide flex-[0_0_100%] min-w-0 p-4 h-full flex items-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-[70vh] bg-white/80 backdrop-blur-xl border-4 border-white rounded-[4rem] p-12 flex gap-12 items-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none scale-[2] grayscale">
                                    <Image src="/xenonplay-logo.png" alt="XenonPlay Watermark" width={600} height={600} priority />
                                </div>

                                <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-primary via-accent to-primary" />
                                
                                <div className="flex-[1.2] space-y-8 min-w-0 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-[0.3em] uppercase">
                                                {rule.type === 'All' ? 'PRO STATIONS' : `${rule.type} CORE`}
                                            </div>
                                            {rule.items && rule.items.length > 0 && (
                                                <div className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
                                                    <Zap className="size-3 fill-current" /> BEST BUNDLE
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-7xl font-black tracking-tighter uppercase leading-[0.85] text-slate-900 break-words">
                                            {rule.name}
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 rounded-3xl border-2 border-primary/10">
                                            <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg">
                                                <Clock className="size-6" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-primary/60 uppercase tracking-[0.3em]">Play Session</p>
                                                <p className="text-3xl font-black text-slate-900">{formatDuration(rule.duration)}</p>
                                            </div>
                                        </div>
                                        
                                        {rule.items && rule.items.length > 0 && (
                                            <div className="flex items-center gap-4 bg-emerald-500/5 px-6 py-4 rounded-3xl border-2 border-emerald-500/10">
                                                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg">
                                                    <Sparkles className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.3em]">Bundle Bonus</p>
                                                    <p className="text-2xl font-black text-emerald-700">{rule.items.length} Rewards</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 border-l border-slate-100 pl-12 h-full relative z-10">
                                    <div className="relative">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.6em] mb-2">ALL-INCLUSIVE RATE</p>
                                        <div className="text-8xl font-black text-primary font-mono tracking-tighter leading-none flex items-start justify-center">
                                            <span className="text-2xl mt-2 mr-1 opacity-40">RP</span>
                                            {formatCurrency(rule.price).replace('Rp', '').replace(',00', '')}
                                            <span className="text-2xl mt-auto ml-1 text-slate-300">,-</span>
                                        </div>
                                        <div className="absolute -top-6 -right-6 rotate-12">
                                            <BadgeCheck className="size-12 text-emerald-500 fill-white" />
                                        </div>
                                    </div>

                                    {rule.items && rule.items.length > 0 ? (
                                        <div className="w-full max-w-sm bg-slate-50 p-6 rounded-[2.5rem] border-2 border-white shadow-inner space-y-4">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">INCLUDED IN PACKAGE</p>
                                            <div className="space-y-2">
                                                {rule.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-lg pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                                                        <span className="text-slate-700 font-black uppercase tracking-tight truncate mr-2">{item.name}</span>
                                                        <div className="px-3 py-0.5 rounded-lg bg-white border border-slate-200 font-black text-primary font-mono text-sm">
                                                            x{item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-6 opacity-30">
                                            <Zap className="size-10 text-slate-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Standard Solo Play</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      <footer className="h-[8vh] bg-primary flex items-center overflow-hidden z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-white/10 shrink-0">
        <motion.div
          animate={{ x: [2000, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-xl font-black uppercase tracking-[0.6em] text-white flex gap-24 items-center"
        >
          <span>NIKMITI PENGALAMAN GAMING TERBAIK HANYA DI XENONPLAY CENTER</span>
          <span>•</span>
          <span>KUMPULKAN POIN TIAP JAM DAN TUKARKAN DENGAN HADIAH MENARIK</span>
          <span>•</span>
          <span>SEDIA BERBAGAI PILIHAN SNACK DAN MINUMAN SEGAR DI KASIR</span>
          <span>•</span>
          <span>HUBUNGI OPERATOR UNTUK BOOKING DAN TOP-UP SESI ANDA</span>
          <span>•</span>
          <span>© {year} BY AFRIBR</span>
          <span>•</span>
        </motion.div>
      </footer>
    </div>
  );
}
