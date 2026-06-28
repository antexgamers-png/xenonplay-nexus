'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

/**
 * WATCHDOG PROVIDER (WEB EDITION - HEMAT KUOTA)
 * Browser hanya bertugas sebagai monitor pasif untuk Trigger Alert suara/visual.
 * Logika penutupan sesi di database diserahkan sepenuhnya ke Laptop Bridge
 * untuk menghindari tabrakan penulisan (Write Conflict) yang boros kuota.
 */

const WatchdogContext = createContext<null>(null);

export function WatchdogProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const pathname = usePathname();
  const { toast } = useToast();
  const alertedStations = useRef<Set<string>>(new Set());
  
  const stationsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'stations') : null, 
    [firestore]
  );
  const { data: stations } = useCollection<Station>(stationsQuery);

  const isPublicRoute = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname?.startsWith('/tv-landing') || 
    pathname?.startsWith('/public-display') ||
    pathname?.startsWith('/price-list');

  useEffect(() => {
    if (!stations || !firestore) return;

    const watchdogInterval = setInterval(async () => {
      const now = Date.now();

      stations.forEach((s) => {
        if (s.is_active && !s.is_paused && s.end_time) {
          const timeLeft = s.end_time - now;

          // 1. Alert 5 Menit Terakhir (Hanya Suara & Toast)
          if (timeLeft > 0 && timeLeft <= 5 * 60 * 1000 && !alertedStations.current.has(s.id)) {
            alertedStations.current.add(s.id);
            if (!isPublicRoute) {
                playAlertSound();
                toast({ 
                    title: "Waktu Hampir Habis", 
                    description: `${s.name} tersisa kurang dari 5 menit.`, 
                    variant: "warning" 
                });
            }
          }

          // 2. Deteksi Waktu Habis (Logging saja, Stop dilakukan Laptop Bridge)
          if (timeLeft <= 0) {
              // Browser tidak melakukan Write ke Firestore lagi (Hemat Kuota)
              console.log(`[PassiveWatchdog] ${s.name} durasi telah habis.`);
          }
        }

        if (!s.is_active) {
          alertedStations.current.delete(s.id);
        }
      });
    }, 5000); // Cek setiap 5 detik sudah cukup (Hemat CPU & Quota)

    return () => clearInterval(watchdogInterval);
  }, [stations, firestore, toast, isPublicRoute]);

  return (
    <WatchdogContext.Provider value={null}>
      {children}
    </WatchdogContext.Provider>
  );
}

const playAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  } catch (e) {}
};
