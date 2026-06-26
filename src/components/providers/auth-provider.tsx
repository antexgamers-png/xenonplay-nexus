'use client';

import type { UserRole, UserProfile } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';
import { useUser } from '@/firebase/provider';
import { doc, getDoc, setDoc, collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { signInAnonymously, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  role: UserRole | null;
  isRoleLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// KONFIGURASI KEAMANAN
const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 Jam Inaktifitas
const THROTTLE_PING_MS = 15 * 60 * 1000;    // Ping DB tiap 15 menit
const SAFETY_RELEASE_MS = 5000;              // Fail-safe loading

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const auth = useFirebaseAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const anonymousTriggered = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isPublicRoute = (path: string) => {
    const normalized = path.replace(/\/$/, '') || '/';
    return normalized === '/' ||
           normalized === '/login' ||
           normalized === '/tv-landing' || 
           normalized === '/public-display' ||
           normalized === '/price-list' ||
           normalized === '/welcome' ||
           normalized === '/check-member';
  };

  // 1. AUTO-LOGOUT LOGIC
  const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      if (user && !user.isAnonymous && !isPublicRoute(pathname || '')) {
          const lastPing = parseInt(localStorage.getItem('xenon_last_ping') || '0');
          const now = Date.now();
          
          // Throttled Ping ke Firestore untuk update status aktif
          if (now - lastPing > THROTTLE_PING_MS && firestore) {
              setDoc(doc(firestore, 'users', user.uid), { lastLogin: now }, { merge: true }).catch(() => {});
              localStorage.setItem('xenon_last_ping', now.toString());
          }

          idleTimerRef.current = setTimeout(() => {
              toast({ 
                  title: "Sesi Berakhir", 
                  description: "Sistem otomatis keluar karena tidak ada aktivitas selama 12 jam.", 
                  variant: "destructive" 
              });
              signOut(auth);
          }, IDLE_TIMEOUT_MS);
      }
  }, [user, pathname, toast, firestore, auth]);

  useEffect(() => {
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      if (user && !user.isAnonymous && !isPublicRoute(pathname || '')) {
          events.forEach(e => window.addEventListener(e, resetIdleTimer));
          resetIdleTimer();
      }
      return () => {
          events.forEach(e => window.removeEventListener(e, resetIdleTimer));
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
  }, [user, pathname, resetIdleTimer]);

  // 2. ROLE LOCKDOWN LOGIC
  useEffect(() => {
    setMounted(true);
    if (isUserLoading) return;
    
    if (!user) {
        setRole(null);
        if (isPublicRoute(pathname || '') && auth && !anonymousTriggered.current) {
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

    const initSecureProfile = async () => {
      if (!firestore) { setIsRoleLoading(false); return; }
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // JIKA PROFIL SUDAH ADA: Kunci Role & Update Sesi saja
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setRole(userData.role);
          
          const mySessionId = localStorage.getItem('xenon_session_id') || userData.currentSessionId || Math.random().toString(36).substring(2, 15);
          if (!localStorage.getItem('xenon_session_id')) {
              localStorage.setItem('xenon_session_id', mySessionId);
          }
          
          // CRITICAL: Jangan kirim field 'role' di sini agar tidak tertimpa
          await setDoc(userDocRef, { 
            currentSessionId: mySessionId, 
            lastLogin: Date.now() 
          }, { merge: true });
        } 
        // JIKA USER BARU: Tentukan Role sekali saja
        else if (user.email) {
          const adminQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'), limit(1));
          const adminSnap = await getDocs(adminQuery);
          
          const newRole: UserRole = adminSnap.empty ? 'admin' : 'staff';
          const mySessionId = localStorage.getItem('xenon_session_id') || Math.random().toString(36).substring(2, 15);
          
          const newUserDoc: UserProfile = { 
            id: user.uid, 
            email: user.email, 
            role: newRole,
            displayName: user.displayName || user.email.split('@')[0],
            createdAt: Date.now(), 
            currentSessionId: mySessionId, 
            lastLogin: Date.now()
          };
          
          await setDoc(userDocRef, newUserDoc);
          setRole(newRole);
        }
      } catch (error) {
        console.error("[SecureAuth] Init Error:", error);
      } finally {
        setIsRoleLoading(false);
      }
    };

    initSecureProfile();
  }, [user, isUserLoading, mounted, firestore, pathname, auth]);

  return (
    <AuthContext.Provider value={{ role, isRoleLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) return { role: null, isRoleLoading: false };
  return context;
}
