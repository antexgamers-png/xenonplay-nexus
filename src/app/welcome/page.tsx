'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WEB-ANIMATED WELCOME v4.0
 * Menggantikan video dengan animasi CSS/Framer Motion berperforma tinggi.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* AMBIENT BACKGROUND ANIMATION */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute size-[150vh] bg-gradient-to-tr from-primary/20 via-transparent to-accent/10 blur-[120px] rounded-full"
            />

            {/* DECORATIVE RINGS (Mascot Aura) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute size-[60vh] border border-primary/20 rounded-full border-dashed"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute size-[80vh] border border-white/5 rounded-full border-dashed"
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* LOGO & MASCOT CONTAINER */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    className="relative"
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-primary/40 blur-[80px] rounded-full scale-150 animate-pulse" />
                    
                    {/* The Logo */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative size-64 md:size-80 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]"
                    >
                        <Image 
                            src="/xenonplay-logo.png" 
                            alt="XenonPlay Mascot" 
                            fill 
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* TEXT ANIMATION */}
                <div className="text-center space-y-4">
                    <motion.h1 
                        initial={{ letterSpacing: "1em", opacity: 0 }}
                        animate={{ letterSpacing: "0.4em", opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="text-4xl md:text-6xl font-black text-white uppercase tracking-[0.4em] leading-none"
                    >
                        SELAMAT <span className="text-primary">DATANG</span>
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
                    />
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1.5 }}
                        className="text-xs md:text-sm font-black text-white/60 uppercase tracking-[0.6em]"
                    >
                        XENONPLAY • ELITE GAMING CENTER
                    </motion.p>
                </div>
            </div>

            {/* SCANLINE OVERLAY (TV Aesthetic) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
        </div>
    );
}
