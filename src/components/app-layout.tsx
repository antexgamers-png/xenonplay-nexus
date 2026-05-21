'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './app-header';
import { MotionLayout } from './motion-layout';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <SidebarProvider className="h-full w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto outline-none scroll-smooth">
            <div className="p-4 sm:p-6 lg:p-8">
              <MotionLayout>{children}</MotionLayout>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
