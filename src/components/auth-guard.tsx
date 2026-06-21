'use client';

import { useAuth } from './providers/auth-provider';
import { useUser } from '@/firebase/provider';
import { usePathname } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { AppLayout } from '@/components/app-layout';
import { ShiftProvider } from './providers/shift-provider';

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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { role, isRoleLoading } = useAuth();
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

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

  if (isPublicRoute(pathname || '')) {
    return <>{children}</>;
  }

  if (isUserLoading || (user && !user.isAnonymous && isRoleLoading)) {
    return <FullPageLoader />;
  }

  if (!user || user.isAnonymous) {
    return <LoginPage />;
  }

  return (
    <ShiftProvider role={role} isRoleLoading={isRoleLoading}>
      <AppLayout>{children}</AppLayout>
    </ShiftProvider>
  );
}