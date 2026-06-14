'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Member, Transaction, PointRedemption, CreditVoucher, Reward } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Search, 
    User, 
    Trophy, 
    History, 
    Gift, 
    AlertCircle, 
    Clock, 
    Gamepad2,
    ArrowLeft,
    CheckCircle2,
    ShieldAlert,
    Loader2,
    Phone,
    Ticket,
    XCircle,
    Star,
    Sparkles,
    Zap,
    TrendingUp,
    ChevronRight,
    Crown,
    Medal
} from 'lucide-react';
import { format, addMonths, isAfter, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const TIERS = [
    { name: 'Bronze', minPoints: 0, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Medal },
    { name: 'Silver', minPoints: 100, color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Medal },
    { name: 'Gold', minPoints: 300, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Crown },
    { name: 'Platinum', minPoints: 1000, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: Sparkles },
];

export default function CheckMemberPage() {
    const firestore = useFirestore();
    const [phoneInput, setPhoneInput] = useState('');
    const [searchedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Queries
    const memberQuery = useMemoFirebase(() => {
        if (!firestore || !searchedPhone) return null;
        return query(collection(firestore, 'members'), where('phone', '==', searchedPhone), limit(1));
    }, [firestore, searchedPhone]);

    const rewardsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'rewards');
    }, [firestore]);

    const { data: members, isLoading: isLoadingMember, error: memberError } = useCollection<Member>(memberQuery);
    const { data: allRewards } = useCollection<Reward>(rewardsQuery);
    
    const member = members && members.length > 0 ? members[0] : null;

    // Additional Member Data
    const transQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'transactions'), where('memberId', '==', member.id), limit(5));
    }, [firestore, member?.id]);

    const redeemQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'redemptions'), where('memberId', '==', member.id), limit(5));
    }, [firestore, member?.id]);

    const { data: transactions } = useCollection<Transaction>(transQuery);
    const { data: redemptions } = useCollection<PointRedemption>(redeemQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = phoneInput.trim();
        if (!cleanPhone) return;
        setIsSearching(true);
        setVerifiedPhone(cleanPhone);
        setTimeout(() => setIsSearching(false), 800);
    };

    const memberTier = useMemo(() => {
        if (!member) return TIERS[0];
        const sorted = [...TIERS].reverse();
        return sorted.find(t => member.points >= t.minPoints) || TIERS[0];
    }, [member]);

    const nextTier = useMemo(() => {
        if (!member) return TIERS[1];
        return TIERS.find(t => t.minPoints > member.points) || null;
    }, [member]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20 selection:bg-primary">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-accent/5 blur-[150px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative size-8">
                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase">XenonPlay <span className="text-primary">Nexus</span></span>
                    </Link>
                    <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"><ArrowLeft className="size-3" /> Beranda</Button></Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 relative z-10">
                {!member || searchedPhone !== phoneInput ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* SEARCH PANEL */}
                        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Portal Member Sultan</Badge>
                                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Cek Poin & <span className="text-primary">Katalog Hadiah</span></h1>
                                <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg">Masukkan nomor WhatsApp Anda untuk mengelola saldo poin dan melihat daftar penukaran hadiah.</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Validasi WhatsApp</Label>
                                        <div className="relative">
                                            <Input placeholder="Contoh: 08123456789" className="h-16 pl-14 text-2xl font-black bg-slate-900/50 border-white/10 rounded-2xl tracking-widest focus:ring-primary shadow-inner" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required />
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"><Phone className="size-6" /></div>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSearching} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/30 transition-all active:scale-95">
                                        {isSearching ? <Loader2 className="size-5 animate-spin mr-2" /> : "MASUK KE DASHBOARD SAYA"}
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* PREVIEW CATALOG / TIERS */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><Star className="size-3 text-amber-500" /> Katalog Penukaran</h3>
                                <div className="space-y-2">
                                    {allRewards?.slice(0, 3).map(r => (
                                        <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                            <span className="text-[11px] font-bold uppercase">{r.label}</span>
                                            <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black">{r.points} Pts</Badge>
                                        </div>
                                    ))}
                                    <p className="text-[10px] text-slate-600 font-bold uppercase text-center mt-4">...dan banyak pilihan lainnya</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Crown className="size-3" /> Tier Membership</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {TIERS.map(t => (
                                        <div key={t.name} className={cn("p-3 rounded-2xl border bg-slate-900/50", t.border)}>
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest", t.color)}>{t.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500">Min {t.minPoints} Pts</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        {/* MEMBER HEADER DASHBOARD */}
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white/5 p-8 md:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Gamepad2 className="size-48" /></div>
                            
                            <div className="relative group">
                                <div className={cn("size-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500", memberTier.bg, memberTier.border)}>
                                    <memberTier.icon className={cn("size-16", memberTier.color)} />
                                </div>
                                <div className="absolute -bottom-3 -right-3 size-12 rounded-full bg-slate-950 border-4 border-white/10 flex items-center justify-center shadow-lg">
                                    <Badge className="bg-primary text-white text-[8px] font-black h-6 border-none">{memberTier.name}</Badge>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{member.name}</h2>
                                    <Badge variant="outline" className="w-fit mx-auto md:mx-0 border-white/10 text-slate-400 font-mono text-[10px]">{member.phone}</Badge>
                                </div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Member Sejak {format(member.joinDate, 'MMMM yyyy', { locale: id })}</p>
                                
                                {nextTier && (
                                    <div className="pt-4 max-w-sm mx-auto md:mx-0">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Progress ke {nextTier.name}</span>
                                            <span className="text-[10px] font-black text-primary">{member.points} / {nextTier.minPoints}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, (member.points / nextTier.minPoints) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button variant="outline" size="sm" onClick={() => { setVerifiedPhone(null); setPhoneInput(''); }} className="rounded-xl border-white/10 h-10 px-6 font-black uppercase text-[10px] tracking-widest relative z-10 hover:bg-red-500/10 hover:text-red-500 transition-colors">Keluar</Button>
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-primary/5 border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 text-primary/5 group-hover:text-primary/10 transition-colors"><Trophy className="size-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Saldo Poin Anda</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl font-black font-mono tracking-tighter leading-none">{member.points}</span>
                                        <span className="text-xs font-black uppercase text-primary/60">Points</span>
                                    </div>
                                    <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Zap className="size-4 text-amber-500 animate-pulse" />
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Poin ini bisa ditukarkan dengan hadiah spesial di bawah.</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-amber-500/5 border-amber-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-[0.3em]">Koleksi Stempel</p>
                                        <Badge className="bg-amber-500 text-white font-black text-[10px] border-none px-3 h-6">{member.stamps || 0}/10</Badge>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3 mb-6">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className={cn(
                                                "aspect-square rounded-xl border-2 flex items-center justify-center p-1.5 transition-all duration-500",
                                                i < (member.stamps || 0) ? "bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105" : "bg-slate-900 border-white/5 opacity-30"
                                            )}>
                                                {i < (member.stamps || 0) && <Image src="/xenonplay-logo.png" alt="Logo" width={24} height={24} className="object-contain" />}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-amber-600 font-bold uppercase italic leading-relaxed text-center">*Dapatkan bonus 5 Poin setiap 10 stempel!</p>
                                </div>
                            </Card>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400"><TrendingUp className="size-6" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Sesi</p>
                                        <p className="text-xl font-black uppercase">{transactions?.length || 0} Kali Mabar</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400"><Gift className="size-6" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Redeem</p>
                                        <p className="text-xl font-black uppercase">{redemptions?.length || 0} Hadiah</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* REWARDS CATALOG & HISTORY */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                            {/* CATALOG (NEW) */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/10"><Gift className="size-5" /></div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Katalog Hadiah Sultan</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tersedia {allRewards?.length || 0} Pilihan</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {allRewards?.map(reward => {
                                        const canAfford = member.points >= reward.points;
                                        return (
                                            <div key={reward.id} className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                                                canAfford 
                                                    ? "bg-card border-primary/20 hover:border-primary shadow-lg" 
                                                    : "bg-muted/30 border-transparent opacity-60"
                                            )}>
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className="space-y-3">
                                                        <Badge variant="outline" className={cn("text-[8px] font-black px-2 py-0 h-4 border-none", reward.type === 'time' ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400")}>
                                                            {reward.type === 'time' ? 'VOUCHER WAKTU' : 'ITEM KANTIN'}
                                                        </Badge>
                                                        <h4 className="text-lg font-black uppercase tracking-tight leading-none">{reward.label}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded bg-slate-900 text-primary"><Zap className="size-2.5 fill-current" /></div>
                                                            <span className="text-sm font-black font-mono text-primary">{reward.points} Poin</span>
                                                        </div>
                                                    </div>
                                                    {canAfford ? (
                                                        <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in">
                                                            <CheckCircle2 className="size-5" />
                                                        </div>
                                                    ) : (
                                                        <div className="size-10 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center">
                                                            <Clock className="size-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                {canAfford && (
                                                    <div className="mt-4 pt-4 border-t border-white/5">
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Sparkles className="size-3" /> Poin kamu cukup! Klaim di kasir.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* RECENT HISTORY */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="p-2 rounded-lg bg-slate-900 text-slate-500"><History className="size-4" /></div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Riwayat Aktivitas</h3>
                                </div>

                                <div className="space-y-3">
                                    {redemptions?.length ? redemptions.map(r => (
                                        <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Gift className="size-5" /></div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-tight">{r.rewardLabel}</p>
                                                    <p className="text-[9px] text-slate-500 font-mono">{format(r.timestamp, 'dd MMM yyyy')}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black">-{r.pointsRedeemed}</Badge>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Belum ada redeem</p>
                                        </div>
                                    )}

                                    {transactions?.length ? transactions.map(t => (
                                        <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Gamepad2 className="size-5" /></div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-tight">{t.stationName}</p>
                                                    <p className="text-[9px] text-slate-500 font-mono">{format(t.timestamp, 'dd MMM, HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-primary">+{t.durationMinutes}m</p>
                                                <p className="text-[8px] text-emerald-500 font-bold uppercase">Check-in</p>
                                            </div>
                                        </div>
                                    )) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
