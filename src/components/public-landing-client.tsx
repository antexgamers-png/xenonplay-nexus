'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import type { Station, PricingRule, GeneralSettings, LandingSettings, Member, Transaction, Reservation } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ReservationFormDialog } from '@/components/reservations/reservation-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addMemberRequest } from '@/lib/data';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon className={className} />;
};

const ActivityTicker = memo(function ActivityTicker({ 
    members, 
    transactions, 
    reservations 
}: { 
    members: Member[] | null, 
    transactions: Transaction[] | null, 
    reservations: Reservation[] | null 
}) {
    const tickerItems = useMemo(() => {
        const dummyEvents = [
            "Paket Sultan 3 Jam baru saja dipesan.",
            "Member baru saja menukarkan 10 stempel!",
            "Unit PS5 Core-01 baru saja disterilisasi.",
            "Update: Kopi Susu Aren tersedia di kantin!",
            "Pemain VVIP sedang mabar di Stasiun 02.",
            "Member baru saja bergabung dalam komunitas.",
            "Tips: Mabar jam 10 pagi dapat diskon Happy Hour!"
        ];

        const realEvents: string[] = [];

        if (members && members.length > 0) {
            members.slice(0, 3).forEach(m => {
                realEvents.push(`Selamat bergabung, ${m.name}!`);
            });
        }

        if (transactions && transactions.length > 0) {
            transactions.slice(0, 3).forEach(t => {
                if (t.stationId !== 'pos') {
                    realEvents.push(`Sesi seru dimulai di ${t.stationName}.`);
                }
            });
        }

        if (reservations && reservations.length > 0) {
            reservations.slice(0, 3).forEach(r => {
                realEvents.push(`Slot jam ${new Date(r.startTime).getHours()}:00 sudah ada yang booking.`);
            });
        }

        return [...realEvents, ...dummyEvents].sort(() => Math.random() - 0.5);
    }, [members, transactions, reservations]);

    if (tickerItems.length === 0) return null;

    return (
        <div className="w-full bg-muted/20 border-y border-border/50 py-3 overflow-hidden relative">
            <div className="flex whitespace-nowrap animate-marquee-css items-center">
                {tickerItems.map((item, idx) => (
                    <div key={`idx-${idx}`} className="flex items-center gap-4 mx-8">
                        <div className="size-1.5 rounded-full bg-primary/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                            {item}
                        </span>
                    </div>
                ))}
                {tickerItems.map((item, idx) => (
                    <div key={`dup-${idx}`} className="flex items-center gap-4 mx-8">
                        <div className="size-1.5 rounded-full bg-primary/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export function PublicLandingClient() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [year, setYear] = useState<number>(2025);
  const [isResOpen, setIsResOpen] = useState(false);
  const [defaultBookingStationId, setDefaultBookingStationId] = useState<string | undefined>(undefined);
  
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => { setYear(new Date().getFullYear()); }, []);
  
  const stationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stations') : null, [firestore]);
  const pricingQuery = useMemoFirebase(() => firestore ? collection(firestore, 'pricingRules') : null, [firestore]);
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
  const landingRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'landing') : null, [firestore]);

  const recentMembersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'members'), orderBy('joinDate', 'desc'), limit(3)) : null, 
    [firestore]
  );
  const recentTransQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'transactions'), orderBy('timestamp', 'desc'), limit(3)) : null, 
    [firestore]
  );
  const recentResQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'reservations'), orderBy('createdAt', 'desc'), limit(3)) : null, 
    [firestore]
  );

  const { data: stations } = useCollection<Station>(stationsQuery);
  const { data: pricingRules } = useCollection<PricingRule>(pricingQuery);
  const { data: generalSettings } = useDoc<GeneralSettings>(settingsRef);
  const { data: landingData, isLoading: isLandingLoading } = useDoc<LandingSettings>(landingRef);

  const { data: recentMembers } = useCollection<Member>(recentMembersQuery);
  const { data: recentTransactions } = useCollection<Transaction>(recentTransQuery);
  const { data: recentReservations } = useCollection<Reservation>(recentResQuery);

  const defaultSettings: LandingSettings = {
    heroHeadline: 'Nongkrong Sultan, Harga Teman.',
    heroSubHeadline: 'Nikmati atmosfer pro-gaming sesungguhnya dengan TV 4K HDR, Full AC, dan Sofa Sultan yang super nyaman.',
    ctaText: 'Gas Mabar!',
    ctaLink: '#live',
    ctaIcon: 'Gamepad2',
    facilities: [
        { icon: 'Monitor', title: 'Visual 4K HDR', description: 'Gambar Super Jernih' },
        { icon: 'Coffee', title: 'Menu Kantin', description: 'Amunisi Mabar' },
        { icon: 'Wifi', title: 'Koneksi Kilat', description: 'Anti-Lag' },
        { icon: 'Star', title: 'Sofa Sultan', description: 'Kenyamanan Maksimal' }
    ],
    whatsapp: '',
    instagram: '',
    tiktok: '',
    address: 'Jl. Raya Utama No. 123, Kota Pusat',
    latitude: '',
    longitude: ''
  };

  const settings: LandingSettings = {
    ...defaultSettings,
    ...(landingData || {}),
    facilities: landingData?.facilities || defaultSettings.facilities
  };

  const sortedStations = (stations || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const allPricing = (pricingRules || []).sort((a, b) => a.price - b.price);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
  }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const mapUrl = useMemo(() => {
      if (settings.latitude && settings.longitude) {
          const lat = settings.latitude.trim();
          const lng = settings.longitude.trim();
          return `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=16&output=embed`;
      }
      return settings.googleMapsEmbedUrl || '';
  }, [settings.latitude, settings.longitude, settings.googleMapsEmbedUrl]);

  const directionsUrl = useMemo(() => {
      if (settings.latitude && settings.longitude) {
          return `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`;
      }
      return null;
  }, [settings.latitude, settings.longitude]);

  const handleBookingStation = (stationId: string) => {
    setDefaultBookingStationId(stationId);
    setIsResOpen(true);
  };

  const handleManualResOpen = () => {
    setDefaultBookingStationId(undefined);
    setIsResOpen(true);
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!firestore || !regName || !regPhone) return;
      
      setIsRegistering(true);
      try {
          await addMemberRequest(firestore, {
              name: regName,
              phone: regPhone
          });
          setRegSuccess(true);
          toast({
              title: "Permohonan Terkirim!",
              description: "Data kamu sedang ditinjau. Tunggu konfirmasi dari tim kami ya!",
              variant: "success"
          });
      } catch (err: any) {
          toast({
              title: "Waduh, Gagal!",
              description: "Coba kirim ulang atau langsung daftar di kasir saja.",
              variant: "destructive"
          });
      } finally {
          setIsRegistering(false);
      }
  };

  if (isLandingLoading) return <div className="h-screen w-screen bg-background flex items-center justify-center"><div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden selection:bg-primary">
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="relative size-8">
                      <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter uppercase leading-none sm:hidden">
                        XP <span className="text-primary">- Game Center</span>
                    </span>
                    <span className="text-lg font-black tracking-tighter uppercase leading-none hidden sm:inline">
                        {generalSettings?.storeName || 'XENONPLAY'}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary hidden sm:block">
                        Elite Gaming Hub
                    </span>
                  </div>
              </div>
              <div className="flex items-center gap-6">
                  <Link href="#live" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors hidden sm:block">Status Unit</Link>
                  <Link href="#membership" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors hidden sm:block">Membership</Link>
                  <Link href="#paket" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors hidden sm:block">Daftar Harga</Link>
                  <Button onClick={handleManualResOpen} size="sm" className="rounded-lg font-black uppercase text-[9px] tracking-widest h-8 px-4">
                      Booking Slot
                  </Button>
              </div>
          </div>
      </nav>

      <section className="relative pt-32 pb-8 px-6">
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
                    <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <LucideIcons.Sparkles className="size-3 mr-2 inline" /> Next-Gen Gaming Experience
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-6">
                        {settings.heroHeadline}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                        {settings.heroSubHeadline}
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        <Button onClick={handleManualResOpen} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 gap-2">
                            <LucideIcons.CalendarCheck className="size-4" /> Amankan Slot
                        </Button>
                        <Link href="#live">
                            <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs border-border bg-muted/20 hover:bg-muted/40">
                                Cek Unit Ready
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="relative hidden lg:flex items-center justify-center min-h-[400px]"
                >
                    <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="relative size-80 rounded-full bg-card border border-border flex items-center justify-center shadow-[0_0_100px_rgba(59,130,246,0.15)] group">
                        <div className="absolute inset-[-10px] rounded-full border border-primary/20 border-dashed animate-[spin_20s_linear_infinite] group-hover:border-primary/40 transition-colors" />
                        <div className="relative size-56 filter drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain transition-transform duration-700 group-hover:scale-110" priority />
                        </div>
                    </div>
                </motion.div>
              </div>
          </div>
      </section>

      <ActivityTicker 
        members={recentMembers} 
        transactions={recentTransactions} 
        reservations={recentReservations} 
      />

      <section className="py-12 px-6 border-b border-border/50 bg-muted/10">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(settings.facilities || []).map((f, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                          <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-all shadow-sm">
                              <DynamicIcon name={f.icon} className="size-5 text-primary" />
                          </div>
                          <div>
                              <h3 className="font-bold uppercase tracking-tight text-[11px] leading-none">{f.title}</h3>
                              <p className="text-[9px] text-muted-foreground uppercase font-black mt-1 tracking-widest">{f.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      <section id="live" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Cek Unit yang <span className="text-primary">Ready</span></h2>
                    <p className="text-xs text-muted-foreground">Status unit kami terpantau secara real-time dari manapun kamu berada.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Server</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {sortedStations.map((station) => (
                      <motion.div 
                        key={station.id} 
                        whileHover={{ y: -5 }}
                        className={cn(
                            "p-6 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-center gap-4 text-center group", 
                            station.is_active 
                                ? "bg-muted/40 border-border opacity-60" 
                                : "bg-card border-border hover:border-emerald-500/50 shadow-lg"
                        )}
                      >
                          <div className="relative size-16 mb-1 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                              <Image src={`/${station.type.toLowerCase()}-logo.png`} alt={station.type} fill className="object-contain group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="space-y-1">
                              <p className="font-black text-sm uppercase tracking-tighter">{station.name}</p>
                              <p className="font-bold text-[10px] uppercase text-muted-foreground">{station.type} CORE</p>
                          </div>
                          
                          <div className="flex flex-col w-full gap-2 mt-2">
                              <div className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                  station.is_active ? "border-border text-muted-foreground" : "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                              )}>
                                {station.is_active ? 'Sedang Dipakai' : 'Unit Siaga'}
                              </div>
                              
                              {!station.is_active && (
                                <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleBookingStation(station.id)}
                                    className="h-8 rounded-xl font-black uppercase text-[8px] tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                                >
                                    Booking Sekarang
                                </Button>
                              )}
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      <section id="membership" className="py-24 px-6 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                      <div className="space-y-4">
                          <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase text-[10px] tracking-[0.2em] px-3 h-6">Sultan Membership</Badge>
                          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                              Makin Sering Mabar, <span className="text-primary">Banyak Bonusnya.</span>
                          </h2>
                          <p className="text-slate-400 text-lg font-medium leading-relaxed">
                              Jadilah bagian dari komunitas elit XenonPlay. Kumpulkan poin dari tiap sesi bermainmu dan tukarkan dengan berbagai reward menarik mulai dari jam main gratis hingga camilan favorit.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
                              <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                  <LucideIcons.Trophy className="size-5" />
                              </div>
                              <h4 className="text-white font-black uppercase text-sm mb-2 tracking-tight">Kumpulkan Poin</h4>
                              <p className="text-slate-500 text-xs leading-relaxed">Dapatkan 5 Poin bonus secara otomatis setiap kali koleksi stempelmu penuh.</p>
                          </div>
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-emerald-500/50 transition-colors">
                              <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                                  <LucideIcons.Gift className="size-5" />
                              </div>
                              <h4 className="text-white font-black uppercase text-sm mb-2 tracking-tight">Klaim Reward</h4>
                              <p className="text-slate-500 text-xs leading-relaxed">Tukar poin terkumpul dengan voucher mabar atau item kantin langsung di kasir.</p>
                          </div>
                      </div>

                      <Link href="/check-member" target="_blank" className="inline-flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-widest hover:gap-5 transition-all">
                          Cek Saldo Poin & Katalog Reward <LucideIcons.ArrowRight className="size-4" />
                      </Link>
                  </div>

                  <Card className="bg-white/5 border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
                      
                      <AnimatePresence mode="wait">
                        {!regSuccess ? (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-8">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Join Membership</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Daftar sekarang, nikmati keuntungannya</p>
                                </div>

                                <form onSubmit={handleRegisterMember} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                                        <div className="relative">
                                            <Input 
                                                placeholder="Andi Gaming" 
                                                className="h-14 pl-12 bg-slate-900/50 border-white/5 text-white rounded-2xl focus:ring-primary shadow-inner"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                required
                                            />
                                            <LucideIcons.User className="absolute left-4 top-4 size-6 text-slate-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor WhatsApp</Label>
                                        <div className="relative">
                                            <Input 
                                                placeholder="Contoh: 08123456789" 
                                                className="h-14 pl-12 bg-slate-900/50 border-white/5 text-white rounded-2xl focus:ring-primary shadow-inner font-mono"
                                                value={regPhone}
                                                onChange={(e) => setRegPhone(e.target.value)}
                                                required
                                            />
                                            <LucideIcons.Phone className="absolute left-4 top-4 size-6 text-slate-600" />
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={isRegistering}
                                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3"
                                    >
                                        {isRegistering ? <LucideIcons.RefreshCw className="size-5 animate-spin" /> : <LucideIcons.Zap className="size-5 fill-current" />}
                                        Daftar Sekarang
                                    </Button>
                                    <p className="text-[9px] text-center text-slate-600 uppercase font-bold italic tracking-tighter mt-4">
                                        *Admin akan segera mengonfirmasi pendaftaranmu.
                                    </p>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="size-20 rounded-[2.5rem] bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border-4 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                    <LucideIcons.CheckCircle2 className="size-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Permohonan Terkirim</h3>
                                    <p className="text-slate-400 text-sm font-medium">Mantap <span className="text-primary font-black uppercase">{regName}</span>, datamu sudah masuk!</p>
                                </div>
                                <p className="text-slate-500 text-[10px] leading-relaxed max-w-[280px] mx-auto uppercase font-bold tracking-widest">
                                    Admin kami akan segera meninjau pendaftaranmu. Tunggu info konfirmasi selanjutnya yang akan dikirim melalui WhatsApp ya!
                                </p>
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setRegSuccess(false); setRegName(''); setRegPhone(''); }}
                                    className="border-white/10 text-white hover:bg-white/5 rounded-xl h-10 px-8 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Daftarkan Akun Lain
                                </Button>
                            </motion.div>
                        )}
                      </AnimatePresence>
                  </Card>
              </div>
          </div>
      </section>

      <section id="paket" className="py-20 px-6 bg-muted/10 border-t border-border/40">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12 gap-4">
                <div className="text-left">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Pilihan <span className="text-primary">Paket Mabar</span></h2>
                    <p className="text-xs text-muted-foreground">Pilih durasi main paling pas buat gaya gaming kamu.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full size-10 border-border bg-card hover:bg-muted" onClick={scrollPrev}>
                        <LucideIcons.ChevronLeft className="size-5 text-primary" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full size-10 border-border bg-card hover:bg-muted" onClick={scrollNext}>
                        <LucideIcons.ChevronRight className="size-5 text-primary" />
                    </Button>
                </div>
              </div>

              <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                      {allPricing.map((rule) => {
                          const isBundle = rule.items && rule.items.length > 0;
                          const isPopular = rule.duration === 120 || rule.duration === 180;
                          const isHighlighted = isBundle || isPopular;

                          return (
                              <div key={rule.id} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0 pr-4 py-4">
                                  <div className={cn(
                                      "p-6 h-full rounded-[2.5rem] transition-all group relative overflow-hidden flex flex-col",
                                      isHighlighted 
                                        ? "bg-card border-2 border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.1)] ring-1 ring-primary/10" 
                                        : "bg-card border border-border hover:border-border/80 shadow-md"
                                  )}>
                                      {isHighlighted && (
                                          <div className="absolute top-4 right-4 z-20">
                                              <Badge className="bg-primary text-white border-none font-black text-[8px] tracking-[0.2em] px-2 h-5 rounded-lg shadow-lg">
                                                  {isBundle ? 'BEST VALUE' : 'TERLARIS'}
                                              </Badge>
                                          </div>
                                      )}

                                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                      
                                      <div className="flex justify-between items-start mb-6 relative z-10">
                                          <div>
                                              <Badge className={cn(
                                                  "border-none text-[8px] font-black mb-2 px-2 py-0 h-4",
                                                  isHighlighted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                              )}>
                                                {rule.type === 'All' ? 'PRO STATIONS' : `${rule.type} CORE`}
                                              </Badge>
                                              <h3 className="text-xl font-black uppercase tracking-tight leading-none">{rule.name}</h3>
                                          </div>
                                          <LucideIcons.Clock className={cn("size-4", isHighlighted ? "text-primary" : "text-muted-foreground")} />
                                      </div>

                                      <div className="space-y-2 mb-6 relative z-10 flex-1">
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                              <LucideIcons.CheckCircle2 className="size-3 text-primary" />
                                              <span className="text-xs font-medium">Sewa {formatDuration(rule.duration)}</span>
                                          </div>
                                          {rule.items?.map((item, idx) => (
                                              <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                                                  <LucideIcons.Sparkles className="size-3 text-emerald-500" />
                                                  <span className="text-xs font-bold">Include {item.name} x{item.quantity}</span>
                                              </div>
                                          ))}
                                          {!isBundle && (
                                              <div className="flex items-center gap-2 text-muted-foreground/60 italic">
                                                  <LucideIcons.Zap className="size-3" />
                                                  <span className="text-[10px]">Stabil 60 FPS Experience</span>
                                              </div>
                                          )}
                                      </div>

                                      <div className="pt-4 border-t border-border flex justify-between items-center relative z-10 mt-auto">
                                          <div>
                                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Rate Paket</p>
                                              <p className={cn(
                                                  "text-2xl font-black font-mono tracking-tighter",
                                                  isHighlighted ? "text-primary" : "text-foreground"
                                              )}>
                                                  {formatCurrency(rule.price).replace(',00', '')}
                                              </p>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={handleManualResOpen}
                                            className={cn(
                                                "size-10 rounded-xl transition-all",
                                                isHighlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted border border-border hover:bg-muted/80"
                                            )}
                                          >
                                              <LucideIcons.ArrowRight className="size-5" />
                                          </Button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </section>

      <section className="py-24 px-6 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/123/1920/1080')] opacity-10 mix-blend-overlay grayscale" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <LucideIcons.Gamepad2 className="size-16 text-primary-foreground/20 mx-auto mb-8 animate-bounce" />
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-primary-foreground">Siap Dominasi Permainan?</h2>
              <p className="text-primary-foreground/80 text-lg font-medium mb-10">Jangan sampai kehabisan unit! Amankan slot mabar kamu sekarang.</p>
              <Button onClick={handleManualResOpen} size="lg" className="h-16 px-12 rounded-2xl bg-background text-primary hover:bg-muted font-black uppercase tracking-widest shadow-2xl transition-transform hover:scale-105 active:scale-95">
                  Booking Unit Sekarang
              </Button>
          </div>
      </section>

      <section id="lokasi" className="py-24 px-6 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Lokasi <span className="text-primary">Mabar</span> Kami</h2>
                    <p className="text-xs text-muted-foreground">Mampir ke basecamp kami dan rasakan pengalaman gaming kelas atas.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-primary opacity-50">
                    <LucideIcons.Navigation className="size-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active Marker</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card border-border p-8 rounded-[2.5rem] relative overflow-hidden h-full flex flex-col justify-center shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-5">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <LucideIcons.MapPin className="size-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-3">BASECAMP XENONPLAY</h3>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                          {settings.address || 'Alamat lengkap sedang diperbarui.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-3xl bg-muted/50 border border-border flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                            <LucideIcons.Clock className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Jam Operasional</p>
                            <p className="text-sm font-bold uppercase">Buka Tiap Hari: 08:00 - 00:00 WITA</p>
                        </div>
                    </div>

                    {directionsUrl && (
                        <Link href={directionsUrl} target="_blank" className="block w-full">
                            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/30 mt-2">
                                <LucideIcons.Navigation className="size-5" />
                                Gas ke Lokasi (Peta)
                            </Button>
                        </Link>
                    )}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-3 rounded-[2.5rem] overflow-hidden border border-border h-[450px] shadow-2xl relative">
                {mapUrl ? (
                  <>
                    <iframe 
                        src={mapUrl}
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale-[0.2] contrast-[1.1] dark:invert dark:hue-rotate-180"
                    />
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="bg-primary p-2 rounded-2xl border-4 border-background shadow-[0_15px_40px_rgba(59,130,246,0.4)] relative"
                        >
                            <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-20 scale-150" />
                            <div className="relative size-10 drop-shadow-lg">
                                <Image src="/xenonplay-logo.png" alt="Xenon Marker" fill className="object-contain" />
                            </div>
                        </motion.div>
                        <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase border-none shadow-lg tracking-widest px-2 h-5">XenonPlay</Badge>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-4">
                      <LucideIcons.Map className="size-12 text-muted-foreground/30" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">Peta belum diatur</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>

      <footer className="py-12 border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-2 opacity-40">
                      <div className="relative size-6">
                          <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                      </div>
                      <span className="text-xs font-black tracking-widest uppercase">{generalSettings?.storeName || 'XENONPLAY'}</span>
                  </div>
                  
                  <div className="flex gap-8 text-center md:text-left">
                      {settings.whatsapp && (
                          <Link href={`https://wa.me/${settings.whatsapp}`} target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors">
                              <LucideIcons.MessageCircle className="size-4" />
                              <span className="text-[10px] font-black uppercase">WhatsApp</span>
                          </Link>
                      )}
                      {settings.instagram && (
                          <Link href={`https://instagram.com/${settings.instagram.replace('@','')}`} target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-pink-600 transition-colors">
                              <LucideIcons.Instagram className="size-4" />
                              <span className="text-[10px] font-black uppercase">Instagram</span>
                          </Link>
                      )}
                      {settings.tiktok && (
                          <Link href={`https://tiktok.com/@${settings.tiktok.replace('@','')}`} target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                              <LucideIcons.Music className="size-4" />
                              <span className="text-[10px] font-black uppercase">TikTok</span>
                          </Link>
                      )}
                  </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border text-center">
                  <p className="text-muted-foreground/60 text-[8px] uppercase font-bold tracking-[0.3em]">
                    © {year} {generalSettings?.storeName || 'XenonPlay Gaming Center'} • Stability is the Core of Business
                  </p>
              </div>
          </div>
      </footer>

      <ReservationFormDialog 
        isOpen={isResOpen}
        onOpenChange={setIsResOpen}
        stations={sortedStations || []}
        pricingRules={pricingRules || []}
        defaultStationId={defaultBookingStationId}
      />
    </div>
  );
}
