
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { LogOut, User, Bell, Check, Maximize, Minimize } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useUser } from '@/firebase';
import { useNotifications } from '@/components/providers/notification-provider';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function AppHeader() {
  const auth = useFirebaseAuth();
  const { user } = useUser();
  const { notifications, unreadCount, markAsRead, triggerTransactionDetail } = useNotifications();
  const { setOpen } = useSidebar();
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setOpen(false); // Otomatis tutup sidebar saat masuk fullscreen
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  }

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    if (notif.type === 'session-ended' && notif.transactionId) {
        triggerTransactionDetail(notif.transactionId);
    }
    markAsRead(notif.id);
  }

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 text-slate-500 hover:text-primary transition-colors" />
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen} 
            className="h-9 w-9 text-slate-500 hover:text-primary"
            title={isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh"}
        >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Tidak ada notifikasi baru.
              </div>
            ) : (
                notifications.map(notif => (
                    <DropdownMenuItem 
                      key={notif.id} 
                      className="flex flex-col items-start gap-2 cursor-pointer" 
                      onClick={() => handleNotificationClick(notif)}
                      disabled={notif.isRead && notif.type !== 'session-ended'}
                    >
                        <div className='w-full'>
                            <div className='flex justify-between'>
                                <p className="text-sm font-medium">{notif.stationName}</p>
                                {!notif.isRead && (
                                     <Button variant="ghost" size="icon" className="h-6 w-6" title="Tandai sudah dibaca" onClick={(e) => handleMarkAsRead(e, notif.id)}>
                                        <Check className='h-4 w-4'/>
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: id })}
                            </p>
                        </div>
                    </DropdownMenuItem>
                ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="size-8">
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Akun Saya</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
