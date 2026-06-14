'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY STANDBY v6.0 - ULTIMATE ENDING EDITION
 * Menggunakan aset landing.png dengan suasana "Sultan Mode" saat sesi habis.
 */
export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* DARK MOODY AMBIENT (DEEP BLUE/PURPLE) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,rgba(2,6,23,1)_85%)]" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute inset-0 bg-primary/5 blur-[150px] rounded-full"
            />

            {/* CRT SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_2px] pointer-events-none opacity-40 z-20" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-30 flex flex-col items-center gap-12 px-6">
                
                {/* STANDBY MASCOT WITH BREATHING EFFECT */}
                <div className="relative group">
                    {/* Shadow & Glow Base */}
                    <div className="absolute inset-0 bg-blue-900/10 blur-[120px] rounded-full scale-75" />
                    
                    <motion.div
                        animate={{ 
                            y: [0, -15, 0],
                            scale: [1, 1.05, 1],
                            filter: ["brightness(0.7) contrast(1.1)", "brightness(0.9) contrast(1.2)", "brightness(0.7) contrast(1.1)"]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-[75vw] h-[55vh] md:w-[65vw] md:h-[65vh] lg:w-[850px] lg:h-[650px]"
                    >
                        <Image 
                            src="/landing.png" 
                            alt="Xenon Standby" 
                            fill 
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </div>

                {/* STATUS & CALL TO ACTION */}
                <div className="text-center space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-6 bg-red-500/5 border border-red-500/20 px-12 py-4 rounded-[2.5rem] backdrop-blur-md shadow-2xl"
                    >
                        <div className="size-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />
                        <span className="text-2xl md:text-3xl font-black text-red-500/70 uppercase tracking-[0.7em] ml-[0.7em]">SESI HABIS</span>
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-white/20 uppercase tracking-[0.6em] ml-[0.6em]">Waktu Bermain Selesai</h2>
                        <div className="h-0.5 w-32 bg-white/5 mx-auto rounded-full" />
                        <p className="text-[11px] md:text-xs font-black text-white/10 uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed ml-[0.4em]">
                            Unit segera dinonaktifkan.<br/>Hubungi Kasir untuk perpanjangan sesi atau redeem poin.
                        </p>
                    </div>
                </div>
            </div>

            {/* LOGO WATERMARK - BOTTOM LEFT */}
            <div className="absolute bottom-10 left-12 flex items-center gap-5 opacity-10 z-40">
                <div className="relative size-14">
                    <Image src="/xenonplay-logo.png" alt="Logo Small" fill className="object-contain" />
                </div>
                <div className="h-10 w-px bg-white/30" />
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">XenonPlay Nexus</span>
                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-1">Management Console</span>
                </div>
            </div>

            {/* VIGNETTE EFFECT */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
        </div>
    );
}
