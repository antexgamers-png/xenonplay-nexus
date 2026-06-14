
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WELCOME v7.0 - GHOST SPIRIT EDITION
 * Desain ulang total menggunakan welcome_mascot.png sebagai pusat visual.
 * Dioptimalkan untuk performa tinggi di browser TV tanpa lag.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* LAYER 1: DEEP DYNAMIC NEON BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,183,255,0.12)_0%,rgba(2,6,23,1)_80%)]" />
            
            <motion.div 
                animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] blur-[100px]"
            />

            {/* LAYER 2: CRT SCANLINES (GAMING AESTHETIC) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-40" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-30 flex flex-col items-center gap-12 w-full max-w-7xl px-8">
                
                {/* SPIRIT MASCOT WITH ADVANCED BREATHING EFFECT */}
                <div className="relative">
                    {/* Shadow & Floor Glow */}
                    <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-10 bg-primary/20 blur-3xl rounded-full"
                    />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ 
                            y: [0, -40, 0],
                            opacity: 1,
                            filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"]
                        }}
                        transition={{ 
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 1.5 },
                            filter: { duration: 4, repeat: Infinity }
                        }}
                        className="relative w-[80vw] h-[50vh] md:w-[60vw] md:h-[60vh] lg:w-[650px] lg:h-[650px]"
                    >
                        <Image 
                            src="/welcome_mascot.png" 
                            alt="Xenon Spirit" 
                            fill 
                            className="object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]"
                            priority
                        />
                    </motion.div>
                </div>

                {/* TEXTUAL BRANDING & STATUS */}
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-[0.3em] leading-none drop-shadow-2xl">
                            READY <span className="text-primary">TO PLAY</span>
                        </h1>
                        <p className="text-[10px] md:text-sm font-black text-primary/40 uppercase tracking-[1em] ml-[1em]">
                            XENONPLAY • ELITE GAMING CORE
                        </p>
                    </motion.div>

                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-flex items-center gap-4 bg-primary/10 border border-primary/20 px-10 py-3 rounded-full backdrop-blur-md"
                    >
                        <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_#3b82f6] animate-ping" />
                        <span className="text-xs md:text-base font-black text-primary uppercase tracking-[0.5em] ml-[0.5em]">System Synchronized</span>
                    </motion.div>
                </div>
            </div>

            {/* TOP LEFT: LOGO BRANDING */}
            <div className="absolute top-10 left-12 flex items-center gap-4 z-40">
                <div className="relative size-12 rotate-6">
                    <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black text-white uppercase tracking-tighter leading-none">XENONPLAY</span>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.4em]">Nexus Core v7.0</span>
                </div>
            </div>

            {/* BOTTOM RIGHT: VESTIGE IDENTIFIER */}
            <div className="absolute bottom-10 right-12 opacity-30 z-40 text-right">
                <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Stable Operation Active</p>
            </div>

            {/* VIGNETTE SHADOW */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] z-10" />
        </div>
    );
}
