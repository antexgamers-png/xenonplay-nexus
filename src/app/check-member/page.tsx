'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Member, Transaction, PointRedemption, Reward } from '@/lib/types';
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
    Clock, 
    Gamepad2,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Phone,
    Star,
    Sparkles,
    Zap,
    TrendingUp,
    Crown,
    Medal
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const RANK_ICONS = [Crown, Medal, Medal];
const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-orange-400'];
const RANK_BGS = ['bg-amber-500/10', 'bg-slate-400/10', 'bg-orange-500/10'];

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

    const topMembersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'members'), orderBy('points', 'desc'), limit(3));
    }, [firestore]);

    const { data: members, isLoading: isLoadingMember } = useCollection<Member>(memberQuery);
    const { data: allRewards } = useCollection<Reward>(rewardsQuery);
    const { data: topMembers } = useCollection<Member>(topMembersQuery);
    
    const member = members && members.length > 0 ? members[0] : null;

    // Additional Member Data
    const transQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'transactions'), where('memberId', '==', member.id), limit(5));
    }, [firestore, member?.id]);

    const redeemQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        // FIXED: Correct collection name and query syntax
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
                    <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"><ArrowLeft className="size-3" /> Kembali ke Beranda</Button></Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 relative z-10">
                {!member || searchedPhone !== phoneInput ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* SEARCH PANEL */}
                        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Portal Member Sultan</Badge>
                                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Cek Poin & <span className="text-primary">Bonus Mabar</span></h1>
                                <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg">Masukkan nomor WhatsApp kamu untuk melihat saldo poin, stempel, dan daftar hadiah yang bisa diklaim.</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Nomor WhatsApp Kamu</Label>
                                        <div className="relative">
                                            <Input placeholder="Contoh: 08123456789" className="h-16 pl-14 text-2xl font-black bg-slate-900/50 border-white/10 rounded-2xl tracking-widest focus:ring-primary shadow-inner" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required />
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"><Phone className="size-6" /></div>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSearching} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/30 transition-all active:scale-95">
                                        {isSearching ? <Loader2 className="size-5 animate-spin mr-2" /> : "MASUK KE DASHBOARD SULTAN"}
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* TOP 3 & CATALOG */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Trophy className="size-3" /> Hall of Fame: Elite Sultan</h3>
                                <div className="space-y-4">
                                    {topMembers?.map((m, idx) => {
                                        const Icon = RANK_ICONS[idx] || Medal;
                                        return (
                                            <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5 animate-in slide-in-from-right duration-500" style={{ delay: `${idx * 100}ms` }}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("size-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg", RANK_BGS[idx], RANK_COLORS[idx])}>
                                                        #{idx + 1}
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-tight truncate max-w-[180px]">{m.name}</span>
                                                </div>
                                                <Icon className={cn("size-5", RANK_COLORS[idx])} />
                                            </div>
                                        )
                                    })}
                                    {(!topMembers || topMembers.length === 0) && (
                                        <p className="text-[10px] text-slate-600 font-bold uppercase text-center py-4 tracking-widest">Menghubungkan ke Hall of Fame...</p>
                                    )}
                                </div>
                                <p className="text-[9px] text-center text-slate-500 uppercase font-black tracking-widest">Poin disembunyikan demi privasi Sultan.</p>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><Star className="size-3 text-amber-500" /> Katalog Penukaran</h3>
                                <div className="space-y-3">
                                    {allRewards?.slice(0, 3).map(r => (
                                        <div key={r.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
                                            <span className="text-[11px] font-bold uppercase">{r.label}</span>
                                            <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black">{r.points} Pts</Badge>
                                        </div>
                                    ))}
                                    <p className="text-[10px] text-slate-600 font-bold uppercase text-center mt-4 italic tracking-widest">Dan masih banyak pilihan hadiah lainnya...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                        {/* MEMBER HEADER DASHBOARD */}
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white/5 p-8 md:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Gamepad2 className="size-48" /></div>
                            
                            <div className="relative group">
                                <div className="size-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 bg-primary/10 border border-primary/20">
                                    <User className="size-16 text-primary" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{member.name}</h2>
                                    <Badge variant="outline" className="w-fit mx-auto md:mx-0 border-white/10 text-slate-400 font-mono text-[11px] px-3">{member.phone}</Badge>
                                </div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Member Terverifikasi Sejak {format(member.joinDate, 'MMMM yyyy', { locale: id })}</p>
                                
                                <div className="pt-2 flex items-center gap-3 justify-center md:justify-start">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-inner">
                                        <TrendingUp className="size-3 text-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status Akun: Aktif</span>
                                    </div>
                                    <Badge className="bg-emerald-500 text-white font-black text-[9px] h-7 px-4">SULTAN MEMBER</Badge>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" onClick={() => { setVerifiedPhone(null); setPhoneInput(''); }} className="rounded-xl border-white/10 h-11 px-8 font-black uppercase text-[10px] tracking-widest relative z-10 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95">Keluar Dashboard</Button>
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-primary/5 border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 text-primary/5 group-hover:text-primary/10 transition-colors"><Trophy className="size-32" /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Saldo Poin Kamu</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl font-black font-mono tracking-tighter leading-none">{member.points}</span>
                                        <span className="text-xs font-black uppercase text-primary/60">Points</span>
                                    </div>
                                    <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Zap className="size-4 text-amber-500 animate-pulse" />
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Tukarkan poin ini dengan hadiah spesial di bawah!</p>
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
                                                "aspect-square rounded-xl border-2 flex items-center justify-center p-1.5 transition-all duration-700",
                                                i < (member.stamps || 0) ? "bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105" : "bg-slate-900 border-white/5 opacity-30"
                                            )}>
                                                {i < (member.stamps || 0) && <Image src="/xenonplay-logo.png" alt="X" width={24} height={24} className="object-contain" />}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-amber-600 font-black uppercase text-center tracking-widest">
                                        Bonus 5 Poin tiap 10 stempel!
                                    </p>
                                </div>
                            </Card>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-center gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 shadow-inner"><TrendingUp className="size-7" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Sesi</p>
                                        <p className="text-2xl font-black uppercase">{transactions?.length || 0} Kali Mabar</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 shadow-inner"><Gift className="size-7" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Redeem</p>
                                        <p className="text-2xl font-black uppercase">{redemptions?.length || 0} Hadiah</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* REWARDS CATALOG & HISTORY */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                            {/* CATALOG */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/10"><Gift className="size-6" /></div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Katalog Hadiah Sultan</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block">Tersedia {allRewards?.length || 0} Pilihan</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {allRewards?.map(reward => {
                                        const canAfford = member.points >= reward.points;
                                        return (
                                            <div key={reward.id} className={cn(
                                                "p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group",
                                                canAfford 
                                                    ? "bg-card border-primary/20 hover:border-primary shadow-xl scale-100 hover:scale-[1.02]" 
                                                    : "bg-muted/30 border-transparent opacity-60"
                                            )}>
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className="space-y-4">
                                                        <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-0 h-5 border-none", reward.type === 'time' ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400")}>
                                                            {reward.type === 'time' ? 'VOUCHER WAKTU' : 'ITEM KANTIN'}
                                                        </Badge>
                                                        <h4 className="text-xl font-black uppercase tracking-tight leading-none">{reward.label}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 rounded-lg bg-slate-900 text-primary shadow-inner"><Zap className="size-3 fill-current" /></div>
                                                            <span className="text-lg font-black font-mono text-primary">{reward.points} Poin</span>
                                                        </div>
                                                    </div>
                                                    {canAfford ? (
                                                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 animate-in zoom-in">
                                                            <CheckCircle2 className="size-6" />
                                                        </div>
                                                    ) : (
                                                        <div className="size-12 rounded-2xl bg-slate-900 text-slate-600 flex items-center justify-center">
                                                            <Clock className="size-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                {canAfford && (
                                                    <div className="mt-6 pt-6 border-t border-white/5">
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Sparkles className="size-3.5" /> Poin kamu cukup! Langsung klaim di kasir.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* RECENT HISTORY */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="p-3 rounded-xl bg-slate-900 text-slate-500 shadow-inner"><History className="size-5" /></div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Aktivitas Terakhir</h3>
                                </div>

                                <div className="space-y-4">
                                    {redemptions?.length ? redemptions.map(r => (
                                        <div key={r.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner"><Gift className="size-5" /></div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-tight">{r.rewardLabel}</p>
                                                        <p className="text-[9px] text-muted-foreground font-mono">{format(r.timestamp, 'dd MMM yyyy')}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-black">-{r.pointsRedeemed} Pts</Badge>
                                            </div>
                                            
                                            {/* STATUS KODE UNTUK PELANGGAN */}
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status Hadiah</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-primary uppercase animate-pulse">KLAIM DI KASIR</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Belum ada penukaran</p>
                                        </div>
                                    )}

                                    {transactions?.length ? transactions.map(t => (
                                        <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Gamepad2 className="size-5" /></div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-tight">{t.stationName}</p>
                                                    <p className="text-[9px] text-slate-500 font-mono">{format(t.timestamp, 'dd MMM, HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-primary">+{t.durationMinutes}m</p>
                                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Check-in</p>
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
