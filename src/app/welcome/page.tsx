'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WELCOME v6.0 - ULTIMATE SPIRIT EDITION
 * Menggunakan aset welcome.png dengan animasi Aura Sultan 3D.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* LAYER 1: AMBIENT DYNAMIC BACKGROUND */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.4, 0.15],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute size-[160vh] bg-[radial-gradient(circle,rgba(59,130,246,0.5)_0%,transparent_75%)] blur-[120px] rounded-full"
            />

            {/* LAYER 2: GRID & SCANLINES (RETRO FEEL) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-20" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-30 flex flex-col items-center gap-4 px-6">
                {/* FLOATING WELCOME MASCOT */}
                <div className="relative group">
                    {/* Inner Mascot Glow */}
                    <motion.div 
                        animate={{ 
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.9, 1.2, 0.9]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full"
                    />
                    
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: [0, -30, 0], opacity: 1 }}
                        transition={{ 
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 1.5 }
                        }}
                        className="relative w-[70vw] h-[50vh] md:w-[60vw] md:h-[60vh] lg:w-[800px] lg:h-[600px]"
                    >
                        <Image 
                            src="/welcome.png" 
                            alt="Xenon Spirit" 
                            fill 
                            className="object-contain drop-shadow-[0_0_80px_rgba(59,130,246,0.7)]"
                            priority
                        />
                    </motion.div>
                </div>

                {/* TEXTUAL BRANDING */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto"
                    />
                    
                    <div className="space-y-3">
                        <motion.h1 
                            initial={{ letterSpacing: "1.5em", opacity: 0 }}
                            animate={{ letterSpacing: "0.4em", opacity: 1 }}
                            transition={{ duration: 2.5 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase leading-none drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                        >
                            READY <span className="text-primary">TO PLAY</span>
                        </motion.h1>
                        <p className="text-[10px] md:text-xs font-black text-primary/50 uppercase tracking-[1em] mt-4 ml-[1em]">
                            XENONPLAY • ELITE GAMING CORE
                        </p>
                    </div>

                    <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-flex items-center gap-3 px-8 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
                    >
                        <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,1)]" />
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Hardware Synchronized</span>
                    </motion.div>
                </div>
            </div>

            {/* CORNER BRANDING */}
            <div className="absolute bottom-10 right-12 opacity-20 z-40 flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Enterprise System</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">v6.0 SPIRIT</p>
                </div>
                <div className="relative size-16 grayscale">
                    <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                </div>
            </div>
        </div>
    );
}
