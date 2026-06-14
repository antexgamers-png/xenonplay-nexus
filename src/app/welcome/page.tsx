'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * XENONPLAY WEB-ANIMATED WELCOME v4.5
 * Menggunakan kombinasi Maskot dan Logo untuk visual brand yang kuat.
 */
export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-screen w-screen bg-slate-950" />;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none">
            {/* AMBIENT BACKGROUND */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute size-[140vh] bg-gradient-to-tr from-primary/20 via-transparent to-accent/10 blur-[120px] rounded-full"
            />

            {/* DECORATIVE RINGS */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute size-[65vh] border border-primary/10 rounded-full border-dashed"
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* MASCOT & LOGO STACK */}
                <div className="relative">
                    {/* Character Mascot (Bigger) */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: [0, -25, 0], opacity: 1 }}
                        transition={{ 
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 1 }
                        }}
                        className="relative size-72 md:size-[450px]"
                    >
                        <Image 
                            src="/mascot.png" 
                            alt="Xenon Mascot" 
                            fill 
                            className="object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.3)]"
                            priority
                            onError={(e) => {
                                // Fallback ke logo jika mascot.png belum diupload
                                (e.target as any).src = '/xenonplay-logo.png';
                            }}
                        />
                    </motion.div>

                    {/* Small Branding Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 size-24 bg-slate-950 p-4 rounded-3xl border border-white/10 shadow-2xl"
                    >
                        <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain p-4" />
                    </motion.div>
                </div>

                {/* TEXT ANIMATION */}
                <div className="text-center space-y-4 mt-12">
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
                    <p className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.8em]">
                        XENONPLAY • ELITE GAMING CENTER
                    </p>
                </div>
            </div>

            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        </div>
    );
}
