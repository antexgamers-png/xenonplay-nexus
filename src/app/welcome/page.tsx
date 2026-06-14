'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WELCOME v8.1 - ELITE DASHBOARD EDITION
 * Penambahan Watermark Logo di belakang maskot untuk kesan Sultan.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-[#020617] overflow-hidden flex items-center justify-center select-none font-body">
            
            {/* LAYER 1: CINEMATIC BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
            
            {/* AMBIENT MESH GLOW */}
            <motion.div 
                animate={{ 
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-0 -translate-y-1/2 w-[60vw] h-[80vh] bg-primary/10 blur-[150px] rounded-full"
            />

            {/* LAYER 2: CRT SCANLINES & NOISE */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_2px] pointer-events-none z-20 opacity-30" />

            {/* MAIN DASHBOARD CONTAINER */}
            <div className="relative z-30 w-full max-w-[90vw] h-full flex flex-col md:flex-row items-center justify-between gap-12">
                
                {/* LEFT SIDE: BRANDING & HEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative size-14 rotate-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" priority />
                        </div>
                        <div className="h-10 w-px bg-white/20 hidden md:block" />
                        <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">XenonPlay <span className="text-primary">Nexus</span></span>
                    </div>

                    <div className="space-y-2">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]"
                        >
                            READY <br />
                            <span className="text-primary">TO PLAY</span>
                        </motion.h1>
                        <p className="text-sm md:text-lg font-black text-white/40 uppercase tracking-[0.5em] pt-4">
                            ELITE GAMING EXPERIENCE
                        </p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="inline-flex items-center gap-4 bg-primary/10 border border-primary/20 px-8 py-3 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="size-2 rounded-full bg-primary shadow-[0_0_15px_#3b82f6] animate-ping" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">System Online • 60 FPS Stable</span>
                    </motion.div>
                </motion.div>

                {/* RIGHT SIDE: MASCOT & WATERMARK COMPOSITION */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex-1 relative w-full h-[50vh] md:h-full flex items-center justify-center lg:justify-end"
                >
                    {/* Watermark Logo (Behind Mascot) */}
                    <div className="absolute top-1/2 left-1/2 md:left-auto md:right-[5%] -translate-x-1/2 md:translate-x-0 -translate-y-1/2 size-[450px] md:size-[600px] opacity-[0.04] pointer-events-none grayscale brightness-200">
                        <Image src="/xenonplay-logo.png" alt="Watermark" fill className="object-contain" />
                    </div>

                    {/* Mascot Aura */}
                    <div className="absolute top-1/2 left-1/2 md:left-auto md:right-1/4 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 size-[400px] bg-primary/5 blur-[80px] rounded-full animate-pulse" />
                    
                    <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            filter: ["brightness(1) contrast(1)", "brightness(1.1) contrast(1.05)", "brightness(1) contrast(1)"]
                        }}
                        transition={{ 
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                            filter: { duration: 4, repeat: Infinity }
                        }}
                        className="relative w-full h-full max-h-[70vh] flex items-center justify-center lg:justify-end z-10"
                    >
                        <div className="relative w-full h-full">
                            <Image 
                                src="/welcome_mascot.png" 
                                alt="Xenon Spirit" 
                                fill 
                                className="object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.4)]"
                                priority
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* STATUS BAR FOOTER */}
            <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end z-40 border-t border-white/5 pt-8 opacity-40">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Server</span>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-1">Global Region Hub</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Nexus Core v8.1</span>
                </div>
            </div>

            {/* VIGNETTE EDGE */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
        </div>
    );
}
