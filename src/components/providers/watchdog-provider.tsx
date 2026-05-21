'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

/**
 * WATCHDOG PROVIDER (WEB EDITION)
 * Berjalan di level root aplikasi. Memantau end_time stasiun secara real-time.
 * Berfungsi sebagai fail-safe jika laptop bridge mengalami kendala koneksi.
 */

const WatchdogContext = createContext<null>(null);

export function WatchdogProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const pathname = usePathname();
  const { toast } = useToast();
  const alertedStations = useRef<Set<string>>(new Set());
  
  // Ambil data stasiun secara real-time
  const stationsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'stations') : null, 
    [firestore]
  );
  const { data: stations } = useCollection<Station>(stationsQuery);

  // Daftar rute publik yang tidak boleh menampilkan alert operasional
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
      const stationsToStop: Station[] = [];

      stations.forEach((s) => {
        if (s.is_active && !s.is_paused && s.end_time) {
          const timeLeft = s.end_time - now;

          // 1. Notifikasi Suara/Visual (5 Menit Terakhir)
          if (timeLeft > 0 && timeLeft <= 5 * 60 * 1000 && !alertedStations.current.has(s.id)) {
            alertedStations.current.add(s.id);
            
            // HANYA tampilkan notifikasi jika BUKAN di rute publik
            if (!isPublicRoute) {
                playAlertSound();
                toast({ 
                    title: "Waktu Hampir Habis", 
                    description: `${s.name} tersisa kurang dari 5 menit.`, 
                    variant: "warning" 
                });
            }
          }

          // 2. Deteksi Waktu Habis
          if (timeLeft <= 0) {
            stationsToStop.push(s);
          }
        }

        // Reset alert tracking jika unit sudah tidak aktif
        if (!s.is_active) {
          alertedStations.current.delete(s.id);
        }
      });

      // Eksekusi penghentian sesi secara massal (Atomic Batch)
      if (stationsToStop.length > 0) {
        const batch = writeBatch(firestore);
        stationsToStop.forEach((s) => {
          console.log(`[WebWatchdog] Menghentikan ${s.name} secara otomatis.`);
          const ref = doc(firestore, 'stations', s.id);
          batch.update(ref, {
            is_active: false,
            is_paused: false,
            end_time: null,
            last_action: 'stop',
            last_action_timestamp: now
          });
        });
        
        try {
          await batch.commit();
        } catch (e) {
          console.error("Watchdog Batch Error:", e);
        }
      }
    }, 2000); // Cek setiap 2 detik (lebih hemat CPU daripada per 1 detik)

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