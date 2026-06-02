'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * XENONPLAY CINEMATIC INTRO v3.0 - PURE VIDEO EDITION
 * Menghapus seluruh elemen UI website. 
 * Fokus 100% pada video intro /branding untuk estetika maksimal.
 */

export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // PATH KE FILE LOKAL: Diambil dari folder 'public/intro.mp4'
    const videoUrl = "/intro.mp4";

    useEffect(() => {
        setMounted(true);
        
        // Memaksa video untuk berputar secara eksplisit (Beberapa browser TV membutuhkan trigger ini)
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
                <div className="flex flex-col items-center justify-center text-white/20">
                    <p className="text-xs font-black uppercase tracking-[0.5em]">XENONPLAY NEXUS</p>
                </div>
            </video>

            {/* Overlay Gradient (Opsional: Memberikan kedalaman visual pada layar TV) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />
        </div>
    );
}
