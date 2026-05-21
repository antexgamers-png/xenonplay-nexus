
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { GeneralSettings } from '@/lib/types';

/**
 * Komponen tak terlihat yang menyinkronkan tema aplikasi 
 * dengan pengaturan Admin di Firestore secara real-time.
 */
export function ThemeSync() {
  const { setTheme } = useTheme();
  const firestore = useFirestore();
  
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'general') : null, 
    [firestore]
  );
  
  const { data: settings } = useDoc<GeneralSettings>(settingsRef);

  useEffect(() => {
    if (!settings) return;

    const applyTheme = () => {
      const { themeMode, dayThemeStart, nightThemeStart } = settings;

      if (themeMode === 'light' || themeMode === 'dark') {
        setTheme(themeMode);
        return;
      }

      if (themeMode === 'scheduled' && dayThemeStart && nightThemeStart) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Cek apakah sekarang dalam rentang siang hari
        // Jika day < night (misal 06:00 - 18:00)
        if (dayThemeStart < nightThemeStart) {
          if (currentTime >= dayThemeStart && currentTime < nightThemeStart) {
            setTheme('light');
          } else {
            setTheme('dark');
          }
        } else {
          // Jika rentang melewati tengah malam (misal siang mulai 18:00, malam mulai 06:00)
          if (currentTime >= dayThemeStart || currentTime < nightThemeStart) {
            setTheme('light');
          } else {
            setTheme('dark');
          }
        }
      }
    };

    applyTheme();

    // Jika menggunakan jadwal, periksa setiap menit
    let interval: NodeJS.Timeout;
    if (settings.themeMode === 'scheduled') {
      interval = setInterval(applyTheme, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings, setTheme]);

  return null;
}
