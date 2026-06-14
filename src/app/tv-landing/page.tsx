'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WEB-ANIMATED STANDBY v4.0
 * Optimal untuk mode standby TV saat sesi kosong (Unit Ready).
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
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full scale-150"
            />

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center gap-16">
                {/* FLOATING LOGO (Reduced Motion) */}
                <motion.div
                    animate={{ 
                        y: [0, -15, 0],
                        filter: ["drop-shadow(0 0 10px rgba(59,130,246,0.2))", "drop-shadow(0 0 30px rgba(59,130,246,0.5))", "drop-shadow(0 0 10px rgba(59,130,246,0.2))"]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative size-56 md:size-72 grayscale-[0.5] opacity-80"
                >
                    <Image 
                        src="/xenonplay-logo.png" 
                        alt="XenonPlay Standby" 
                        fill 
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* STATUS INDICATOR */}
                <div className="text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 px-8 py-3 rounded-2xl"
                    >
                        <div className="size-3 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xl font-black text-emerald-500 uppercase tracking-[0.4em]">UNIT READY</span>
                    </motion.div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white/30 uppercase tracking-[0.5em]">Sesi Berakhir</h2>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">Silakan hubungi kasir untuk isi ulang waktu</p>
                    </div>
                </div>
            </div>

            {/* LOGO WATERMARK (Background) */}
            <div className="absolute bottom-[-10vh] right-[-10vh] size-[50vh] opacity-[0.02] rotate-12">
                <Image src="/xenonplay-logo.png" alt="BG" fill className="object-contain" />
            </div>

            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        </div>
    );
}
