'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Gamepad2, 
    ShieldCheck, 
    Zap,
    Trophy,
    Activity,
    Clock,
    Monitor,
    Crown
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * XENONPLAY CINEMATIC WELCOME SIGNAGE v2.2 - LOCAL ASSET EDITION
 * Fitur: Video Intro Autoplay (Local) -> Smooth Transition -> Dashboard Status.
 */

export default function WelcomePage() {
    const [time, setTime] = useState('--:--');
    const [date, setDate] = useState('---');
    const [mounted, setMounted] = useState(false);
    const [introEnded, setIntroEnded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // PATH KE FILE LOKAL: Pastikan file ditaruh di folder 'public' dengan nama 'intro.mp4'
    const videoUrl = "/intro.mp4";

    useEffect(() => {
        setMounted(true);
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
            setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }));
        };
        update();
        const timer = setInterval(update, 1000);

        // Backup: Otomatis masuk ke dashboard jika video macet atau tidak ditemukan setelah 12 detik
        const safetyTimer = setTimeout(() => {
            setIntroEnded(true);
        }, 12000);

        return () => {
            clearInterval(timer);
            clearTimeout(safetyTimer);
        };
    }, []);

    const handleVideoEnd = () => {
        setIntroEnded(true);
    };

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-[#02040a] text-white overflow-hidden font-body flex flex-col border-none select-none">
            
            {/* LAYER 1: VIDEO INTRO (FULL SCREEN) */}
            <AnimatePresence>
                {!introEnded && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                    >
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            playsInline
                            onEnded={handleVideoEnd}
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                        
                        {/* Overlay: Branding Tipis saat Intro */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none" />
                        <div className="absolute bottom-12 left-12 flex items-center gap-4 opacity-40">
                             <div className="relative size-10">
                                <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                             </div>
                             <span className="text-sm font-black uppercase tracking-[0.4em]">Initializing Nexus Arena...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LAYER 2: MAIN DASHBOARD CONTENT */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: introEnded ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 flex flex-col h-full relative z-10"
            >
                {/* AMBIENT BACKGROUND LAYER */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-30%] left-[-10%] w-[80vw] h-[80vh] bg-primary/10 rounded-full blur-[160px] opacity-60" />
                    <div className="absolute bottom-[-30%] right-[-10%] w-[80vw] h-[80vh] bg-accent/5 rounded-full blur-[160px] opacity-40" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
                </div>

                {/* TOP NAVIGATION BAR */}
                <header className="h-[14vh] flex justify-between items-center px-[6vw] z-20 relative shrink-0">
                    <div className="flex items-center gap-[2.5vw]">
                        <div className="relative h-[9vh] w-[9vh] drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] rotate-3">
                            <Image src="/xenonplay-logo.png" alt="Xenon Logo" fill className="object-contain" priority />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[4.5vh] font-black tracking-tighter uppercase leading-none italic flex items-center gap-2">
                                XENONPLAY <span className="text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">NEXUS</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="h-[0.3vh] w-8 bg-primary rounded-full" />
                                <p className="text-[1.2vh] font-black uppercase tracking-[0.4em] text-slate-500">Elite Gaming Arena</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-[4vw]">
                        <div className="text-right border-r border-white/10 pr-[3vw] h-full flex flex-col justify-center">
                            <div className="text-[1.2vh] text-slate-500 font-bold uppercase tracking-[0.3em] mb-1">
                                {date}
                            </div>
                            <div className="text-[6.5vh] font-black font-mono tracking-widest text-primary leading-none tabular-nums">
                                {time}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10">
                            <Activity className="size-[3vh] text-emerald-500 animate-pulse" />
                            <span className="text-[0.8vh] font-black uppercase mt-1 text-emerald-500/60">Status: OK</span>
                        </div>
                    </div>
                </header>

                {/* MAIN CINEMATIC STAGE */}
                <main className="flex-1 flex flex-col items-center justify-center p-[4vw] z-10 relative">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: introEnded ? 0 : 20, opacity: introEnded ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative w-full max-w-[88vw] flex flex-col items-center"
                    >
                        {/* Floating Badge */}
                        <div className="mb-8 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 flex items-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-bounce-slow">
                            <Crown className="size-5 text-primary fill-current" />
                            <span className="text-[1.5vh] font-black uppercase tracking-[0.5em] text-primary-foreground">VVIP Premium Experience</span>
                        </div>

                        {/* Central Hero Block */}
                        <div className="text-center space-y-4">
                            <h2 className="text-[5vh] font-medium uppercase tracking-[0.5em] text-slate-400 opacity-60">SELAMAT DATANG DI</h2>
                            <div className="relative inline-block">
                                <h3 className="text-[14vh] font-black uppercase tracking-tighter leading-none bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent italic filter drop-shadow-2xl">
                                    ARENA XENON
                                </h3>
                                <div className="absolute -bottom-4 left-0 w-full h-[0.8vh] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            </div>
                            <p className="text-[3.5vh] text-slate-400 font-medium max-w-[70vw] pt-8 leading-tight">
                                Persiapkan diri untuk performa <span className="text-white font-black">Next-Gen Gaming</span> terbaik.<br/>
                                <span className="text-primary italic">#TheNextLevelOfPlay</span>
                            </p>
                        </div>

                        {/* Status BENTO Grid */}
                        <div className="mt-[10vh] grid grid-cols-4 gap-6 w-full max-w-[75vw]">
                            <StatusCard icon={ShieldCheck} label="Hardware" value="Verified" color="primary" />
                            <StatusCard icon={Trophy} label="Rank" value="Pro Arena" color="amber" />
                            <StatusCard icon={Zap} label="Speed" value="Ultrafast" color="emerald" />
                            <StatusCard icon={Monitor} label="Display" value="4K HDR" color="blue" />
                        </div>
                    </motion.div>
                </main>

                {/* LOWER MARQUEE STRIP */}
                <footer className="h-[10vh] bg-primary relative flex items-center overflow-hidden z-30 shrink-0 border-t border-white/20 shadow-[0_-15px_50px_rgba(59,130,246,0.3)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] opacity-30" />
                    <div className="flex whitespace-nowrap animate-marquee-css items-center h-full">
                        <span className="text-white font-black text-[3.2vh] tracking-[0.4em] uppercase mx-[8vw] drop-shadow-md">
                            MOHON JAGA KEBERSIHAN • KUMPULKAN POIN MEMBER SETIAP BERMAIN • SNACK & MINUMAN TERSEDIA DI KASIR • HUBUNGI OPERATOR UNTUK TOP-UP • TERIMA KASIH TELAH MEMILIH XENONPLAY •
                        </span>
                        <span className="text-white font-black text-[3.2vh] tracking-[0.4em] uppercase mx-[8vw] drop-shadow-md">
                            MOHON JAGA KEBERSIHAN • KUMPULKAN POIN MEMBER SETIAP BERMAIN • SNACK & MINUMAN TERSEDIA DI KASIR • HUBUNGI OPERATOR UNTUK TOP-UP • TERIMA KASIH TELAH MEMILIH XENONPLAY •
                        </span>
                    </div>
                </footer>
            </motion.div>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function StatusCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colorClasses = {
        primary: "text-primary bg-primary/10 border-primary/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        blue: "text-blue-400 bg-blue-400/10 border-blue-400/20"
    };

    return (
        <div className="flex items-center gap-5 bg-white/[0.03] px-6 py-5 rounded-[2rem] border border-white/5 hover:bg-white/[0.05] transition-colors group">
            <div className={cn("size-[7vh] rounded-2xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-110", colorClasses[color as keyof typeof colorClasses])}>
                <Icon className="size-[3.5vh]" />
            </div>
            <div className="text-left">
                <p className="text-[1.1vh] font-black uppercase text-slate-500 tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-[1.8vh] font-black uppercase tracking-tight text-white/90">{value}</p>
            </div>
        </div>
    );
}
