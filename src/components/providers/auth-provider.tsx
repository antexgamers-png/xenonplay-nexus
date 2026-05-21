'use client';

import type { UserRole, UserProfile } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';
import { useUser } from '@/firebase/provider';
import { doc, getDoc, setDoc, collection, getDocs, limit, query, onSnapshot, updateDoc } from 'firebase/firestore';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { AppLayout } from '@/components/app-layout';
import LoginPage from '@/app/login/page';
import { usePathname, useRouter } from 'next/navigation';
import { signInAnonymously, signOut } from 'firebase/auth';
import { ShiftProvider } from './shift-provider';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  role: UserRole | null;
  isRoleLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// KONFIGURASI SESI (STRESS-TESTED)
const IDLE_TIMEOUT_MS = 120 * 60 * 1000; // 2 Jam Diam -> Logout
const MAX_SESSION_AGE_MS = 12 * 60 * 60 * 1000; // 12 Jam Maksimal Sesi (Check on Load/Resume)
const THROTTLE_PING_MS = 10 * 60 * 1000; // Update lastLogin maksimal 10 menit sekali
const SAFETY_RELEASE_MS = 5000;

const FullPageLoader = () => (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Menghubungkan ke Nexus...</p>
        </div>
    </div>
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const anonymousTriggered = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();
  const auth = useFirebaseAuth();
  const { user, isUserLoading } = useUser();

  const normalizedPath = (pathname || '/').replace(/\/$/, '') || '/';
  const isPublicRoute = 
    normalizedPath === '/' ||
    normalizedPath === '/login' ||
    normalizedPath === '/tv-landing' || 
    normalizedPath === '/public-display' ||
    normalizedPath === '/price-list' ||
    normalizedPath === '/welcome' ||
    normalizedPath === '/check-member';

  // SAFETY TIMEOUT: Hilangkan loading screen jika database lambat
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
        if (isRoleLoading) setIsRoleLoading(false);
    }, SAFETY_RELEASE_MS);
    return () => clearTimeout(timer);
  }, [isRoleLoading]);

  // LOGIC: Pengecekan Kadaluarsa Sesi (Hard Expiry)
  const checkSessionExpiry = useCallback(async (uid: string) => {
    if (!firestore || isPublicRoute) return;
    try {
        const snap = await getDoc(doc(firestore, 'users', uid));
        if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const now = Date.now();
            if (data.lastLogin && (now - data.lastLogin > MAX_SESSION_AGE_MS)) {
                toast({ title: "Sesi Habis", description: "Demi keamanan, silakan login kembali.", variant: "destructive" });
                signOut(auth);
                return true;
            }
        }
    } catch (e) { console.error("Session check fail:", e); }
    return false;
  }, [firestore, isPublicRoute, auth, toast]);

  // MONITOR: Konflik Sesi & Visibilitas (Handle Laptop Sleep/Wake)
  useEffect(() => {
      if (!firestore || !user || user.isAnonymous) return;

      const userDocRef = doc(firestore, 'users', user.uid);
      
      // 1. Snapshot untuk Force Logout dari perangkat lain
      const unsubscribe = onSnapshot(userDocRef, (snap) => {
          if (!snap.exists()) return;
          const data = snap.data() as UserProfile;
          const mySessionId = localStorage.getItem('xenon_session_id');
          
          if (data.currentSessionId && mySessionId && data.currentSessionId !== mySessionId) {
              toast({ title: "Sesi Dialihkan", description: "Akun login di perangkat lain.", variant: "destructive" });
              signOut(auth);
          }
      });

      // 2. Handle Resume dari Sleep (visibilitychange)
      const handleVisibility = () => {
          if (document.visibilityState === 'visible') {
              checkSessionExpiry(user.uid);
          }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
          unsubscribe();
          document.removeEventListener('visibilitychange', handleVisibility);
      };
  }, [user, firestore, auth, toast, checkSessionExpiry]);

  // LOGIC: Rolling Activity & Idle Timeout
  const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      if (user && !user.isAnonymous && !isPublicRoute) {
          const lastPing = parseInt(localStorage.getItem('xenon_last_ping') || '0');
          const now = Date.now();
          
          // Rolling Ping: Perbarui lastLogin tiap 10 menit aktivitas
          if (now - lastPing > THROTTLE_PING_MS && firestore) {
              updateDoc(doc(firestore, 'users', user.uid), { lastLogin: now }).catch(() => {});
              localStorage.setItem('xenon_last_ping', now.toString());
          }

          idleTimerRef.current = setTimeout(() => {
              toast({ title: "Sesi Berakhir", description: "Sistem logout otomatis karena diam.", variant: "destructive" });
              signOut(auth);
          }, IDLE_TIMEOUT_MS);
      }
  }, [user, auth, isPublicRoute, toast, firestore]);

  useEffect(() => {
      const events = ['mousedown', 'keydown', 'touchstart'];
      if (user && !user.isAnonymous && !isPublicRoute) {
          events.forEach(e => window.addEventListener(e, resetIdleTimer));
          resetIdleTimer();
      }
      return () => {
          events.forEach(e => window.removeEventListener(e, resetIdleTimer));
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
  }, [user, isPublicRoute, resetIdleTimer]);

  useEffect(() => {
    if (!mounted || isUserLoading) return;
    
    if (!user) {
        setRole(null);
        if (isPublicRoute && auth && !anonymousTriggered.current) {
            anonymousTriggered.current = true;
            signInAnonymously(auth).catch(() => setIsRoleLoading(false));
            return;
        }
        setIsRoleLoading(false);
        return;
    }

    if (user.isAnonymous) {
        setRole(null);
        setIsRoleLoading(false);
        return;
    }

    const fetchUserRole = async () => {
      if (!firestore) { setIsRoleLoading(false); return; }
      try {
        const isExpired = await checkSessionExpiry(user.uid);
        if (isExpired) return;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setRole(userData.role);
          
          // Sync Session ID jika hilang di local (misal clear cache browser)
          if (!localStorage.getItem('xenon_session_id') && userData.currentSessionId) {
              localStorage.setItem('xenon_session_id', userData.currentSessionId);
          }
        } else if (user.email) {
          // Logic: Pengguna pertama otomatis Admin
          const usersSnap = await getDocs(query(collection(firestore, 'users'), limit(1)));
          const isFirstUser = usersSnap.empty;
          const newRole: UserRole = isFirstUser ? 'admin' : 'staff';
          const newSessionId = Math.random().toString(36).substring(2, 15);
          
          const newUserDoc: UserProfile = { 
            id: user.uid, email: user.email, role: newRole,
            displayName: user.displayName || user.email.split('@')[0],
            createdAt: Date.now(), currentSessionId: newSessionId, lastLogin: Date.now()
          };
          
          localStorage.setItem('xenon_session_id', newSessionId);
          await setDoc(userDocRef, newUserDoc, { merge: true });
          setRole(newRole);
        }
      } catch (error) {
        console.error("[Auth] Init Error:", error);
      } finally {
        setIsRoleLoading(false);
      }
    };
    fetchUserRole();
  }, [user, isUserLoading, mounted, firestore, isPublicRoute, auth, checkSessionExpiry]);

  if (!mounted) return null;
  if (isPublicRoute) return <>{children}</>;
  if (isUserLoading || (user && !user.isAnonymous && isRoleLoading)) return <FullPageLoader />;
  if (!user || user.isAnonymous) return <LoginPage />;

  return (
    <AuthContext.Provider value={{ role, isRoleLoading }}>
      <ShiftProvider role={role} isRoleLoading={isRoleLoading}>
        <AppLayout>{children}</AppLayout>
      </ShiftProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) return { role: null, isRoleLoading: false };
  return context;
}
