
'use client';

import { useEffect, useState } from 'react';
import { Clock, BellRing, Monitor, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * TV LANDING PAGE - GLASSMORPHISM EDITION
 * Didesain khusus untuk browser Smart TV dengan estetika premium.
 * Mendukung Adaptive Theme (Light/Dark) secara otomatis.
 */

export default function TvLandingPage() {
  const [time, setTime] = useState<string>('--:--');
  const [date, setDate] = useState<string>('---');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-background text-foreground overflow-hidden font-body flex flex-col border-none select-none">
      
      {/* AMBIENT GLOW BACKGROUND (Identik dengan Public Display) */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-primary/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-accent/5 blur-[200px] rounded-full animate-pulse delay-1000 pointer-events-none" />

      {/* TOP HEADER */}
      <header className="h-[15vh] flex justify-between items-center px-[5vw] z-20 bg-background/20 backdrop-blur-2xl border-b shrink-0">
        <div className="flex items-center gap-[2vw]">
          <div className="relative h-[8vh] w-[8vh] rotate-3 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Image 
                src="/xenonplay-logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
                priority
            />
          </div>
          <div>
            <h1 className="text-[4.5vh] font-black tracking-tighter uppercase leading-none">
                XENONPLAY <span className="text-primary">NEXUS</span>
            </h1>
            <p className="text-[1.3vh] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1">Smart Gaming Hub</p>
          </div>
        </div>

        <div className="text-right border-l pl-[3vw] border-border">
            <div className="text-[6.5vh] font-black font-mono tracking-widest text-primary leading-none">
                {time}
            </div>
            <div className="text-[1.3vh] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-[1vh]">
                {date}
            </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-[5vw] z-10 text-center relative">
        
        {/* BIG ALERT BOX - GLASSMORPHISM STYLE */}
        <div className="max-w-[85vw] w-full bg-foreground/5 backdrop-blur-3xl rounded-[4vw] border-[0.6vh] border-border shadow-[0_30px_100px_rgba(0,0,0,0.1)] p-[6vh] relative overflow-hidden group">
            {/* Side Accent Line */}
            <div className="absolute top-0 left-0 w-[1vw] h-full bg-accent shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
            
            <div className="flex flex-col items-center gap-[4vh]">
                <div className="size-[14vh] rounded-[3.5vw] bg-accent/10 flex items-center justify-center text-accent border-[0.3vh] border-accent/20 animate-pulse">
                    <BellRing className="size-[7vh]" />
                </div>
                
                <div className="space-y-[1.5vh]">
                    <h2 className="text-[9.5vh] font-black uppercase tracking-tighter leading-none text-foreground">
                        WAKTU <span className="text-accent drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">HABIS</span>
                    </h2>
                    <div className="h-[0.5vh] w-[25vw] bg-muted mx-auto rounded-full" />
                </div>

                <p className="text-[3.8vh] text-muted-foreground font-semibold max-w-[65vw] leading-tight">
                    Sesi bermain Anda telah berakhir.<br/>
                    Silakan hubungi <span className="text-foreground font-black underline underline-offset-8 decoration-primary/30">Operator Kasir</span> untuk menambah durasi.
                </p>
            </div>
        </div>

        {/* SUBTLE FOOTER INFO */}
        <div className="mt-[8vh] flex gap-[5vw] items-center">
            <div className="flex items-center gap-3 bg-primary/5 px-[2vw] py-[1vh] rounded-full border border-primary/10">
                <ShieldCheck className="size-[2.5vh] text-primary" />
                <span className="text-[1.6vh] font-black uppercase tracking-widest text-primary/80">Sistem Otonom Aktif</span>
            </div>
            <div className="flex items-center gap-3 bg-foreground/5 px-[2vw] py-[1vh] rounded-full border border-border/50">
                <Monitor className="size-[2.5vh] text-muted-foreground" />
                <span className="text-[1.6vh] font-black uppercase tracking-widest text-muted-foreground">Ready for Next Session</span>
            </div>
        </div>
      </main>

      {/* BOTTOM MARQUEE (CSS NATIVE) */}
      <footer className="h-[9vh] bg-primary flex items-center overflow-hidden z-30 shrink-0 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="animate-marquee-css">
            <span className="text-primary-foreground font-black text-[3.2vh] tracking-[0.6em] uppercase mx-[6vw] whitespace-nowrap">
                SELAMAT DATANG DI XENONPLAY CENTER • NIKMITI PENGALAMAN GAMING TERBAIK • KUMPULKAN POIN MEMBER ANDA • HUBUNGI KASIR UNTUK TOP-UP WAKTU • ENJOY YOUR GAME! •
            </span>
            <span className="text-primary-foreground font-black text-[3.2vh] tracking-[0.6em] uppercase mx-[6vw] whitespace-nowrap">
                SELAMAT DATANG DI XENONPLAY CENTER • NIKMITI PENGALAMAN GAMING TERBAIK • KUMPULKAN POIN MEMBER ANDA • HUBUNGI KASIR UNTUK TOP-UP WAKTU • ENJOY YOUR GAME! •
            </span>
        </div>
      </footer>
    </div>
  );
}
