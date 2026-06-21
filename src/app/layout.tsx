import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { WatchdogProvider } from '@/components/providers/watchdog-provider';
import { ThemeSync } from '@/components/theme-sync';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'XenonPlay Manager',
  description: 'Sistem Manajemen Rental PlayStation Real-Time.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'XenonPlay',
  },
  icons: {
    icon: [
      { url: '/xenonplay-logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/xenonplay-logo.png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <ThemeSync />
            <NotificationProvider>
              <AuthProvider>
                <WatchdogProvider>
                  <AuthGuard>
                    {children}
                  </AuthGuard>
                </WatchdogProvider>
              </AuthProvider>
            </NotificationProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}