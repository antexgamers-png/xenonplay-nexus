'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY STANDBY v5.0 - EMOTIVE EDITION
 * Menampilkan maskot dengan ekspresi sedih saat sesi habis.
 */
export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* DARK MOODY AMBIENT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(2,6,23,1)_80%)]" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.25, 0.1],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full"
            />

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center gap-10">
                {/* SAD MASCOT WITH BREATHING EFFECT */}
                <div className="relative">
                    {/* Shadow/Glow base */}
                    <div className="absolute inset-0 bg-blue-900/20 blur-[100px] rounded-full scale-75" />
                    
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            scale: [1, 1.03, 1],
                            filter: ["brightness(0.8) contrast(1.1)", "brightness(1) contrast(1.2)", "brightness(0.8) contrast(1.1)"]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="relative size-72 md:size-[480px]"
                    >
                        <Image 
                            src="/mascot.png" 
                            alt="Xenon Standby" 
                            fill 
                            className="object-contain grayscale-[0.2]"
                            priority
                        />
                    </motion.div>
                </div>

                {/* STATUS & INFO */}
                <div className="text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-4 bg-red-500/5 border border-red-500/20 px-10 py-3 rounded-[2rem]"
                    >
                        <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-xl font-black text-red-500/60 uppercase tracking-[0.6em]">SESI HABIS</span>
                    </motion.div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white/30 uppercase tracking-[0.5em]">Waktu Mabar Telah Usai</h2>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                            Hubungi petugas kasir untuk perpanjangan atau top-up poin member Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* LOGO WATERMARK - BOTTOM LEFT */}
            <div className="absolute bottom-10 left-12 flex items-center gap-4 opacity-10">
                <div className="relative size-12">
                    <Image src="/xenonplay-logo.png" alt="Logo Small" fill className="object-contain" />
                </div>
                <div className="h-8 w-px bg-white/50" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">XenonPlay Nexus</span>
            </div>

            {/* CRT SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_2px] pointer-events-none opacity-40" />
        </div>
    );
}
