'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * XENONPLAY SESSION ENDED SCREEN v3.1 - TV OPTIMIZED
 * Optimasi looping dan autoplay untuk hardware TV dengan spek rendah.
 */

export default function TvLandingPage() {
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoUrl = "/ended.mp4";

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const attemptPlay = () => {
            if (video) {
                video.muted = true;
                video.play().then(() => {
                    setIsReady(true);
                }).catch(() => {
                    setTimeout(attemptPlay, 1000);
                });
            }
        };

        attemptPlay();

        // Restart manual untuk stabilitas loop di GeckoView/Engine TV lama
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
            <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onCanPlayThrough={() => setIsReady(true)}
                style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)'
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                <div className="flex flex-col items-center justify-center text-white/10 text-center">
                    <p className="text-xl font-black uppercase tracking-[0.5em]">XENONPLAY NEXUS</p>
                </div>
            </video>

            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
    );
}
