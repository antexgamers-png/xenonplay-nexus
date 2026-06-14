
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY STANDBY v7.0 - TERMINATION EDITION
 * Desain ulang total menggunakan landing_mascot.png.
 * Tampilan waspada saat sesi berakhir.
 */
export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* LAYER 1: EMERGENCY RED AMBIENT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,rgba(2,6,23,1)_85%)]" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.25, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute inset-0 bg-red-900/5 blur-[120px] rounded-full"
            />

            {/* LAYER 2: DARK GRID OVERLAY */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-30 flex flex-col items-center gap-8 w-full max-w-7xl px-8">
                
                {/* TERMINATION MASCOT WITH ALERT EFFECT */}
                <div className="relative">
                    <motion.div
                        animate={{ 
                            y: [0, -15, 0],
                            filter: ["grayscale(0.2) brightness(0.8)", "grayscale(0) brightness(1.1)", "grayscale(0.2) brightness(0.8)"]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-[70vw] h-[50vh] md:w-[60vw] md:h-[60vh] lg:w-[600px] lg:h-[600px]"
                    >
                        <Image 
                            src="/landing_mascot.png" 
                            alt="Xenon Standby" 
                            fill 
                            className="object-contain drop-shadow-[0_0_60px_rgba(239,68,68,0.4)]"
                            priority
                        />
                    </motion.div>
                </div>

                {/* TERMINATION STATUS */}
                <div className="text-center space-y-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-6 bg-red-600/10 border border-red-600/30 px-12 py-5 rounded-[3rem] backdrop-blur-xl shadow-2xl"
                    >
                        <div className="size-4 rounded-full bg-red-600 shadow-[0_0_25px_#dc2626] animate-pulse" />
                        <span className="text-3xl md:text-5xl font-black text-red-500 uppercase tracking-[0.6em] ml-[0.6em]">SESI HABIS</span>
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-4xl font-black text-white/30 uppercase tracking-[0.5em] ml-[0.5em]">Waktu Main Selesai</h2>
                        <div className="h-1 w-48 bg-gradient-to-r from-transparent via-red-600/30 to-transparent mx-auto rounded-full" />
                        <p className="text-[10px] md:text-xs font-bold text-white/10 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed ml-[0.3em]">
                            Unit akan segera dinonaktifkan secara otomatis.<br/>Silakan ke Kasir untuk mendaftar Member atau Top-up.
                        </p>
                    </div>
                </div>
            </div>

            {/* CENTER LOGO WATERMARK (BOTTOM) */}
            <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-15 z-40">
                <div className="relative size-16 grayscale brightness-200">
                    <Image src="/xenonplay-logo.png" alt="Logo Watermark" fill className="object-contain" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.8em] ml-[0.8em]">XENONPLAY NEXUS</span>
            </div>

            {/* VIGNETTE EFFECT */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)] z-10" />
        </div>
    );
}
