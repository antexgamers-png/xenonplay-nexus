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

const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;
const THROTTLE_PING_MS = 15 * 60 * 1000;
const SAFETY_RELEASE_MS = 5000;

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

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
        if (isRoleLoading) setIsRoleLoading(false);
    }, SAFETY_RELEASE_MS);
    return () => clearTimeout(timer);
  }, [isRoleLoading]);

  const checkSessionExpiry = useCallback(async (uid: string) => {
    if (!firestore || isPublicRoute(pathname || '')) return;
    try {
        const snap = await getDoc(doc(firestore, 'users', uid));
        if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const now = Date.now();
            if (data.lastLogin && (now - data.lastLogin > MAX_SESSION_AGE_MS)) {
                toast({ title: "Sesi Berakhir", description: "Demi keamanan, silakan masuk kembali.", variant: "destructive" });
                signOut(auth);
                return true;
            }
        }
    } catch (e) { console.error("Session check fail:", e); }
    return false;
  }, [firestore, pathname, auth, toast]);

  const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      if (user && !user.isAnonymous && !isPublicRoute(pathname || '')) {
          const lastPing = parseInt(localStorage.getItem('xenon_last_ping') || '0');
          const now = Date.now();
          
          if (now - lastPing > THROTTLE_PING_MS && firestore) {
              setDoc(doc(firestore, 'users', user.uid), { lastLogin: now }, { merge: true }).catch(() => {});
              localStorage.setItem('xenon_last_ping', now.toString());
          }

          idleTimerRef.current = setTimeout(() => {
              toast({ title: "Sesi Diam Berakhir", description: "Sistem logout otomatis karena tidak ada aktivitas.", variant: "destructive" });
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

  useEffect(() => {
    if (!mounted || isUserLoading) return;
    
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

    const fetchUserRole = async () => {
      if (!firestore) { setIsRoleLoading(false); return; }
      try {
        const isExpired = await checkSessionExpiry(user.uid);
        if (isExpired) return;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // JIKA DOKUMEN ADA: Gunakan data yang ada, JANGAN evaluasi ulang role
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setRole(userData.role);
          
          // Update session ID dan last login saja tanpa menyentuh role
          const mySessionId = localStorage.getItem('xenon_session_id') || userData.currentSessionId || Math.random().toString(36).substring(2, 15);
          if (!localStorage.getItem('xenon_session_id')) {
              localStorage.setItem('xenon_session_id', mySessionId);
          }
          
          await setDoc(userDocRef, { 
            currentSessionId: mySessionId, 
            lastLogin: Date.now() 
          }, { merge: true });
        } 
        // JIKA DOKUMEN TIDAK ADA (User Baru): Baru jalankan logika penentuan role
        else if (user.email) {
          const adminQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'), limit(1));
          const adminSnap = await getDocs(adminQuery);
          
          const newRole: UserRole = adminSnap.empty ? 'admin' : 'staff';
          const mySessionId = localStorage.getItem('xenon_session_id') || Math.random().toString(36).substring(2, 15);
          
          if (!localStorage.getItem('xenon_session_id')) {
              localStorage.setItem('xenon_session_id', mySessionId);
          }
          
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
        console.error("[Auth] Init Error:", error);
      } finally {
        setIsRoleLoading(false);
      }
    };
    fetchUserRole();
  }, [user, isUserLoading, mounted, firestore, pathname, auth, checkSessionExpiry]);

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
