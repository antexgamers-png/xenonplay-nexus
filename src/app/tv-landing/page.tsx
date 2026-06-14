'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY STANDBY v8.1 - TERMINATION DASHBOARD
 * Penambahan Watermark Logo transparan di belakang maskot.
 */
export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-[#020617] overflow-hidden flex items-center justify-center select-none font-body">
            
            {/* LAYER 1: STANDBY RED AMBIENT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(239,68,68,0.1)_0%,transparent_50%)]" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-0 -translate-y-1/2 w-[60vw] h-[80vh] bg-red-900/10 blur-[150px] rounded-full"
            />

            {/* LAYER 2: DARK GRID OVERLAY */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-30 w-full max-w-[90vw] h-full flex flex-col md:flex-row items-center justify-between gap-12">
                
                {/* LEFT SIDE: WARNING & INSTRUCTIONS */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="relative size-12 grayscale opacity-40">
                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">Standby Mode Active</span>
                    </div>

                    <div className="space-y-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-4 bg-red-600/10 border border-red-600/30 px-8 py-4 rounded-2xl backdrop-blur-xl shadow-2xl"
                        >
                            <div className="size-3 rounded-full bg-red-600 shadow-[0_0_20px_#dc2626] animate-pulse" />
                            <span className="text-4xl md:text-6xl font-black text-red-500 uppercase tracking-tighter">SESI HABIS</span>
                        </motion.div>

                        <div className="space-y-3">
                            <h2 className="text-xl md:text-3xl font-black text-white/40 uppercase tracking-[0.3em]">Waktu Main Selesai</h2>
                            <p className="text-[10px] md:text-xs font-bold text-white/20 uppercase tracking-[0.3em] max-w-sm leading-relaxed">
                                Sesi Anda telah berakhir secara otomatis.<br />Silakan hubungi Kasir untuk perpanjang atau mendaftar Member.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <div className="flex flex-col border-l-2 border-red-600/20 pl-4">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Next Action</span>
                            <span className="text-[9px] font-bold text-white/20 uppercase mt-1">Automatic Reset In 30s</span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT SIDE: MASCOT & WATERMARK COMPOSITION */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1.5 }}
                    className="flex-1 relative w-full h-[50vh] md:h-full flex items-center justify-center lg:justify-end"
                >
                    {/* Watermark Logo (Behind Mascot) */}
                    <div className="absolute top-1/2 left-1/2 md:left-auto md:right-[5%] -translate-x-1/2 md:translate-x-0 -translate-y-1/2 size-[450px] md:size-[600px] opacity-[0.04] pointer-events-none grayscale">
                        <Image src="/xenonplay-logo.png" alt="Watermark" fill className="object-contain" />
                    </div>

                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 size-[400px] bg-red-600/5 blur-[100px] rounded-full" />
                    
                    <motion.div
                        animate={{ 
                            y: [0, -15, 0],
                            filter: ["grayscale(0.5) brightness(0.7)", "grayscale(0.3) brightness(0.9)", "grayscale(0.5) brightness(0.7)"]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full h-full max-h-[65vh] flex items-center justify-center lg:justify-end z-10"
                    >
                        <div className="relative w-full h-full">
                            <Image 
                                src="/landing_mascot.png" 
                                alt="Xenon Standby" 
                                fill 
                                className="object-contain drop-shadow-[0_0_60px_rgba(239,68,68,0.2)]"
                                priority
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* FOOTER INFO */}
            <div className="absolute bottom-10 left-12 opacity-10 flex items-center gap-3">
                <div className="relative size-10 grayscale brightness-200">
                    <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">XENONPLAY NEXUS SYSTEM</span>
            </div>

            {/* VIGNETTE SHADOW */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
        </div>
    );
}
