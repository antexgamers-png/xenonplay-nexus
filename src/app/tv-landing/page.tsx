'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY STANDBY v4.5
 * Optimal untuk kenyamanan mata saat TV standby, menampilkan maskot yang sedang "istirahat".
 */
export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* DARK AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-primary/5" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full scale-150"
            />

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* SLEEPING/STANDBY MASCOT */}
                <motion.div
                    animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative size-64 md:size-[380px] grayscale-[0.3]"
                >
                    <Image 
                        src="/mascot.png" 
                        alt="Xenon Standby" 
                        fill 
                        className="object-contain"
                        priority
                        onError={(e) => {
                            (e.target as any).src = '/xenonplay-logo.png';
                        }}
                    />
                </motion.div>

                {/* STATUS INDICATOR */}
                <div className="text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 px-8 py-3 rounded-3xl"
                    >
                        <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-lg font-black text-emerald-500/60 uppercase tracking-[0.5em]">UNIT READY</span>
                    </motion.div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white/20 uppercase tracking-[0.6em]">Sesi Berakhir</h2>
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Hubungi kasir untuk isi ulang waktu mabar</p>
                    </div>
                </div>
            </div>

            {/* LOGO WATERMARK */}
            <div className="absolute bottom-[-5vh] left-[-5vh] size-[40vh] opacity-[0.01]">
                <Image src="/xenonplay-logo.png" alt="Logo BG" fill className="object-contain" />
            </div>

            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        </div>
    );
}
