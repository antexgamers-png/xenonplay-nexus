
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Member, Transaction, PointRedemption, CreditVoucher } from '@/lib/types';
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
    XCircle
} from 'lucide-react';
import { format, addMonths, isAfter, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckMemberPage() {
    const firestore = useFirestore();
    const [phoneInput, setPhoneInput] = useState('');
    const [searchedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Member Data Query
    const memberQuery = useMemoFirebase(() => {
        if (!firestore || !searchedPhone) return null;
        return query(collection(firestore, 'members'), where('phone', '==', searchedPhone), limit(1));
    }, [firestore, searchedPhone]);

    const { data: members, isLoading: isLoadingMember, error: memberError } = useCollection<Member>(memberQuery);
    const member = members && members.length > 0 ? members[0] : null;

    // Riwayat Transaksi
    const transQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'transactions'), where('memberId', '==', member.id), limit(10));
    }, [firestore, member?.id]);

    // Riwayat Redeem
    const redeemQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'redemptions'), where('memberId', '==', member.id), limit(10));
    }, [firestore, member?.id]);

    // Koleksi Voucher untuk cek status pemakaian
    const voucherQuery = useMemoFirebase(() => {
        if (!firestore || !member?.id) return null;
        return query(collection(firestore, 'vouchers'), limit(100)); // Batasi secukupnya
    }, [firestore, member?.id]);

    const { data: transactions } = useCollection<Transaction>(transQuery);
    const { data: redemptions, error: redeemError } = useCollection<PointRedemption>(redeemQuery);
    const { data: vouchers } = useCollection<CreditVoucher>(voucherQuery);

    const sortedTransactions = useMemo(() => {
        if (!transactions) return [];
        return [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    }, [transactions]);

    const sortedRedemptions = useMemo(() => {
        if (!redemptions) return [];
        return [...redemptions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    }, [redemptions]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = phoneInput.trim();
        if (!cleanPhone) return;
        setIsSearching(true);
        setVerifiedPhone(cleanPhone);
        setTimeout(() => setIsSearching(false), 800);
    };

    const expirationDate = useMemo(() => {
        if (!member?.lastActivity) return null;
        const date = new Date(member.lastActivity);
        return isValid(date) ? addMonths(date, 3) : null;
    }, [member?.lastActivity]);

    const isExpired = useMemo(() => {
        if (!expirationDate) return false;
        return isAfter(new Date(), expirationDate);
    }, [expirationDate]);

    if (memberError || redeemError) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <ShieldAlert className="size-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase text-white">Akses Dibatasi</h2>
                <p className="text-slate-400 mt-2 max-w-sm">Gagal memuat riwayat. Pastikan koneksi stabil atau hubungi admin.</p>
                <Button onClick={() => window.location.reload()} className="mt-8">Coba Lagi</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-accent/5 blur-[150px] rounded-full" />
            </div>

            <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative size-8">
                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase">XenonPlay <span className="text-primary">Nexus</span></span>
                    </Link>
                    <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ArrowLeft className="size-3" /> Beranda</Button></Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-32 relative z-10">
                {!member || searchedPhone !== phoneInput ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-4">
                            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Member Portal</Badge>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Cek Status <span className="text-primary">Loyalty</span></h1>
                            <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">Masukkan nomor WhatsApp Anda untuk melihat total poin dan riwayat hadiah.</p>
                        </div>

                        <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Nomor WhatsApp</Label>
                                    <div className="relative">
                                        <Input placeholder="Contoh: 08123456789" className="h-16 pl-14 text-2xl font-black bg-slate-900/50 border-white/10 rounded-2xl tracking-widest focus:ring-primary shadow-inner" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"><Phone className="size-6" /></div>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isSearching} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30">
                                    {isSearching ? <Loader2 className="size-5 animate-spin mr-2" /> : "Lihat Status Saya"}
                                </Button>
                            </form>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="size-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
                                    <User className="size-10" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Halo, Player!</p>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{member.name}</h2>
                                    <p className="text-slate-500 text-xs mt-2 font-medium">Bergabung sejak {member.joinDate ? format(member.joinDate, 'MMMM yyyy', { locale: id }) : '-'}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setVerifiedPhone(null); setPhoneInput(''); }} className="rounded-xl border-white/10 h-10 px-6 font-black uppercase text-[10px] tracking-widest relative z-10">Cari Nomor Lain</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-primary/5 border-primary/20 p-6 rounded-[2rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors"><Trophy className="size-24" /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Total Poin</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black font-mono tracking-tighter">{member.points}</span>
                                        <span className="text-xs font-black uppercase text-primary/60">Points</span>
                                    </div>
                                    <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                                        <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Kadaluarsa Poin</p>
                                            <p className={cn("text-xs font-bold uppercase mt-0.5", isExpired ? "text-red-500" : "text-white")}>
                                                {!expirationDate ? "Aktif Selamanya" : isExpired ? "Sudah Kadaluarsa" : format(expirationDate, 'dd MMMM yyyy', { locale: id })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-amber-500/5 border-amber-500/20 p-6 rounded-[2rem] relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Stempel Loyalitas</p>
                                        <Badge className="bg-amber-500 text-white font-black text-[9px] border-none">{member.stamps || 0}/10</Badge>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 mb-6">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className={cn(
                                                "aspect-square rounded-xl border-2 flex items-center justify-center p-1.5",
                                                i < (member.stamps || 0) ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-slate-900 border-white/5 opacity-30"
                                            )}>
                                                {i < (member.stamps || 0) && <Image src="/xenonplay-logo.png" alt="Logo" width={20} height={20} className="object-contain" />}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-amber-600 font-bold uppercase italic leading-relaxed">*Dapatkan 1 Poin (Gratis 1 Jam) tiap 10 stempel.</p>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><History className="size-4" /></div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Riwayat Bermain</h3>
                                </div>
                                <div className="space-y-2">
                                    {sortedTransactions.length > 0 ? (
                                        sortedTransactions.map(t => (
                                            <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500"><Gamepad2 className="size-5" /></div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-tight">{t.stationName}</p>
                                                        <p className="text-[9px] text-slate-500 font-mono">{format(t.timestamp, 'dd MMM yyyy, HH:mm')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-primary">{t.durationMinutes}m</p>
                                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Lunas</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-30"><p className="text-[10px] font-black uppercase">Belum ada riwayat</p></div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Gift className="size-4" /></div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Riwayat Hadiah</h3>
                                </div>
                                <div className="space-y-2">
                                    {sortedRedemptions.length > 0 ? (
                                        sortedRedemptions.map(r => {
                                            const voucher = vouchers?.find(v => v.code === r.voucherCode);
                                            const isUsed = voucher?.status === 'used';
                                            
                                            return (
                                                <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-500/40"><CheckCircle2 className="size-5" /></div>
                                                            <div>
                                                                <p className="text-xs font-bold uppercase tracking-tight">{r.rewardLabel}</p>
                                                                <p className="text-[9px] text-slate-500 font-mono">{format(r.timestamp, 'dd MMM yyyy')}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">-{r.pointsRedeemed} Pts</Badge>
                                                    </div>
                                                    {r.voucherCode && (
                                                        <div className={cn("p-3 rounded-xl border flex items-center justify-between", isUsed ? "bg-muted/20 border-white/5 opacity-50" : "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]")}>
                                                            <div className="flex items-center gap-2">
                                                                <Ticket className={cn("size-3", isUsed ? "text-slate-500" : "text-primary")} />
                                                                <span className="text-[11px] font-black font-mono tracking-widest">{r.voucherCode}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {isUsed ? (
                                                                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase"><XCircle className="size-2" /> Terpakai</div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase"><CheckCircle2 className="size-2" /> Ready</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-30"><p className="text-[10px] font-black uppercase">Belum ada penukaran</p></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
