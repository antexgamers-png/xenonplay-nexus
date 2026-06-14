'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WELCOME v5.0 - SPIRIT EDITION
 * Menampilkan maskot sebagai "Spirit of the Station" dengan aura neon.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* AMBIENT DYNAMIC BACKGROUND */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute size-[150vh] bg-[radial-gradient(circle,rgba(59,130,246,0.4)_0%,transparent_70%)] blur-[100px] rounded-full"
            />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* FLOATING MASCOT WITH GLOW */}
                <div className="relative group">
                    {/* Character Inner Glow */}
                    <motion.div 
                        animate={{ 
                            opacity: [0.4, 0.7, 0.4],
                            scale: [0.8, 1.1, 0.8]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/40 blur-[80px] rounded-full"
                    />
                    
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: [0, -20, 0], opacity: 1 }}
                        transition={{ 
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 1.5 }
                        }}
                        className="relative size-80 md:size-[520px]"
                    >
                        <Image 
                            src="/mascot.png" 
                            alt="Xenon Spirit" 
                            fill 
                            className="object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]"
                            priority
                        />
                    </motion.div>
                </div>

                {/* TEXTUAL BRANDING */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-px w-64 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto"
                    />
                    
                    <div className="space-y-2">
                        <motion.h1 
                            initial={{ letterSpacing: "1.5em", opacity: 0 }}
                            animate={{ letterSpacing: "0.5em", opacity: 1 }}
                            transition={{ duration: 2 }}
                            className="text-4xl md:text-6xl font-black text-white uppercase tracking-[0.5em] leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            READY <span className="text-primary">TO PLAY</span>
                        </motion.h1>
                        <p className="text-[10px] md:text-xs font-black text-primary/40 uppercase tracking-[0.8em] mt-4">
                            XENONPLAY • ELITE GAMING CORE
                        </p>
                    </div>

                    <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/20 bg-primary/5"
                    >
                        <div className="size-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">System Synchronized</span>
                    </motion.div>
                </div>
            </div>

            {/* RETRO SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
            
            {/* CORNER WATERMARKS */}
            <div className="absolute bottom-10 right-12 opacity-10">
                <div className="relative size-24 grayscale">
                    <Image src="/xenonplay-logo.png" alt="Branding" fill className="object-contain" />
                </div>
            </div>
        </div>
    );
}
