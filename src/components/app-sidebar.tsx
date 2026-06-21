
'use client';

import {
  BarChart3,
  Database,
  LayoutDashboard,
  Settings,
  ArrowRightLeft,
  Tv,
  Users,
  Gift,
  Monitor as MonitorIcon,
  ClockArrowUp,
  UserCog,
  Wallet,
  MonitorSmartphone,
  BookText,
  ChevronRight,
  Code,
  LayoutTemplate,
  CalendarCheck,
  Sparkles,
  ShieldCheck,
  Shield,
  Camera
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from '@/components/ui/sidebar';
import { useAuth } from './providers/auth-provider';
import { Badge } from './ui/badge';

const navGroups = [
  {
    label: 'Pusat Kendali Utama',
    items: [
      { href: '/nexus', label: 'Dashboard Utama', icon: LayoutDashboard },
      { href: '/shifts', label: 'Kasir & Laci Shift', icon: ClockArrowUp },
      { href: '/reservations', label: 'Booking & Reservasi', icon: CalendarCheck },
      { href: '/members', label: 'Data Sultan Member', icon: Users },
    ],
  },
  {
    label: 'Manajemen & Cuan',
    roles: ['admin'],
    items: [
      { href: '/transactions', label: 'Riwayat Transaksi', icon: ArrowRightLeft },
      { href: '/expenses', label: 'Biaya Pengeluaran', icon: Wallet },
      { href: '/reports', label: 'Laporan Keuangan', icon: BarChart3 },
      { href: '/master-data', label: 'Atur Harga & Stok', icon: Database },
    ],
  },
  {
    label: 'Layar TV Monitor',
    items: [
      { href: '/public-display', label: 'Status TV Publik', icon: MonitorIcon },
      { href: '/welcome', label: 'Halaman Welcome', icon: Sparkles },
      { href: '/tv-landing', label: 'Halaman Selesai', icon: Tv },
    ],
  },
  {
    label: 'Pengaturan Sistem',
    roles: ['admin'],
    items: [
      { href: '/users', label: 'Kelola Tim Staff', icon: UserCog },
      { href: '/pengaturan/landing', label: 'Edit Tampilan Depan', icon: LayoutTemplate },
      { href: '/pengaturan/hadiah', label: 'Katalog Hadiah', icon: Gift },
      { 
        label: 'Koneksi Hardware', 
        icon: MonitorSmartphone,
        subItems: [
            { href: '/integrasi/stasiun', label: 'Setup IP TV', icon: MonitorSmartphone },
            { href: '/integrasi/cctv', label: 'Pantau CCTV', icon: Camera },
            { href: '/panduan', label: 'Panduan Master', icon: BookText },
            { href: '/simulasi-adb', label: 'Simulator Kontrol', icon: MonitorSmartphone },
        ]
      },
      { href: '/pengaturan', label: 'Pengaturan Umum', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { role, isRoleLoading } = useAuth();
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const isUserAllowed = (roles: string[] | undefined) => {
    if (!roles) return true;
    if (isRoleLoading) return false;
    if (!role) return false;
    return roles.includes(role);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/50 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="relative size-9 shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            <Image 
                src="/xenonplay-logo.png" 
                alt="Logo" 
                fill 
                className="object-contain relative z-10"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-tighter uppercase leading-none">XenonPlay</h2>
            {isRoleLoading ? (
                <div className="h-3 w-12 bg-muted animate-pulse rounded mt-1" />
            ) : (
                <div className="flex items-center gap-1.5 mt-1">
                    {role === 'admin' ? (
                        <Badge className="bg-primary text-white text-[7px] font-black h-3.5 px-1.5 border-none uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="size-2" /> Admin Access
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[7px] font-black h-3.5 px-1.5 uppercase tracking-widest border-border text-muted-foreground flex items-center gap-1">
                            <Shield className="size-2" /> Staff Duty
                        </Badge>
                    )}
                </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        {navGroups.map((group) => {
          if (!isUserAllowed(group.roles)) return null;

          return (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2">
                  {group.items.map((item) => {
                    if (item.subItems) {
                      const isParentActive = item.subItems.some(sub => pathname === sub.href || pathname?.startsWith(sub.href + '/'));

                      return (
                        <Collapsible key={item.label} className="w-full" defaultOpen={isParentActive}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="w-full justify-between group h-9 px-3 rounded-lg">
                                <div className="flex items-center gap-2.5">
                                  <item.icon className="size-3.5 group-hover:text-primary transition-colors" />
                                  <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                                </div>
                                <ChevronRight className="h-3 w-3 transform transition-transform duration-200 group-data-[state=open]:rotate-90 text-muted-foreground" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                          </SidebarMenuItem>
                          <AnimatePresence>
                            <CollapsibleContent asChild>
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <SidebarMenu className="pl-6 mt-0.5 space-y-0.5 border-l-2 border-sidebar-border ml-5">
                                      {item.subItems.map((subItem) => (
                                        <SidebarMenuItem key={subItem.label}>
                                          <SidebarMenuButton asChild isActive={pathname === subItem.href} className="h-8 px-3 rounded-md">
                                            <Link href={subItem.href}>
                                              <span className="text-[10px] font-bold uppercase tracking-wider">{subItem.label}</span>
                                            </Link>
                                          </SidebarMenuButton>
                                        </SidebarMenuItem>
                                      ))}
                                    </SidebarMenu>
                                </motion.div>
                            </CollapsibleContent>
                          </AnimatePresence>
                        </Collapsible>
                      );
                    }

                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === item.href} 
                          tooltip={item.label}
                          className="h-9 px-3 rounded-lg mb-0.5"
                        >
                            <Link href={item.href!}>
                                <item.icon className="size-3.5" />
                                <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
          <div className="flex flex-col gap-0.5 items-center justify-center">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <Code className="size-2.5" /> Handcrafted By
              </div>
              <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">
                  © {year} AfrIbr Studio
              </p>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
