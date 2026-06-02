'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * XENONPLAY SESSION ENDED SCREEN v3.0 - PURE VIDEO EDITION
 * Menghapus seluruh elemen UI website. 
 * Fokus 100% pada video animasi "Sesi Habis" untuk estetika maksimal.
 */

export default function TvLandingPage() {
    const [mounted, setMounted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // PATH KE FILE LOKAL: Diambil dari folder 'public/ended.mp4'
    const videoUrl = "/ended.mp4";

    useEffect(() => {
        setMounted(true);
        
        // Memaksa video untuk berputar secara eksplisit (Penting untuk Smart TV)
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                console.log("Autoplay blocked by browser policy, waiting for interaction.");
            });
        }
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 h-screen w-screen bg-black overflow-hidden flex items-center justify-center border-none select-none">
            {/* VIDEO PLAYER LAYER */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            >
                <source src={videoUrl} type="video/mp4" />
                {/* Fallback jika video gagal */}
                <div className="flex flex-col items-center justify-center text-white/20 text-center px-10">
                    <p className="text-xl font-black uppercase tracking-[0.5em]">XENONPLAY NEXUS</p>
                    <p className="text-[10px] font-bold uppercase mt-4 opacity-50 tracking-widest">Sesi Bermain Telah Berakhir</p>
                </div>
            </video>

            {/* Overlay Gradient untuk kedalaman visual */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />
        </div>
    );
}
