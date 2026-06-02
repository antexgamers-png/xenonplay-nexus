'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * XENONPLAY CINEMATIC INTRO v3.1 - TV OPTIMIZED
 * Optimasi khusus Smart TV untuk menghindari lag dan tombol play muncul di awal.
 */

export default function WelcomePage() {
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoUrl = "/intro.mp4";

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Force play logic untuk bypass blokir autoplay browser TV
        const attemptPlay = () => {
            if (video) {
                video.muted = true; // Wajib untuk autoplay
                video.play().then(() => {
                    setIsReady(true);
                }).catch(() => {
                    // Autoplay diblokir, coba lagi dalam 1 detik
                    setTimeout(attemptPlay, 1000);
                });
            }
        };

        attemptPlay();

        // Fix untuk GeckoView: Pastikan video me-restart jika loop bawaan gagal
        const handleEnded = () => {
            if (video) {
                video.currentTime = 0;
                video.play();
            }
        };

        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, []);

    return (
        <div className="fixed inset-0 h-screen w-screen bg-black overflow-hidden flex items-center justify-center border-none select-none">
            {/* 
               Lapis Video dengan Transisi Opacity:
               Menyembunyikan UI 'Play' bawaan browser sebelum video benar-benar siap berputar.
            */}
            <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onCanPlayThrough={() => setIsReady(true)}
                style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'translateZ(0)', // Memaksa TV menggunakan chip GPU (Anti-lag)
                    WebkitTransform: 'translateZ(0)'
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                {/* Fallback jika video gagal total */}
                <div className="flex flex-col items-center justify-center text-white/20 text-center px-10">
                    <p className="text-xl font-black uppercase tracking-[0.5em]">XENONPLAY</p>
                </div>
            </video>

            {/* Overlay ringan tanpa efek blur berat untuk menjaga FPS TV tetap stabil */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
    );
}
