
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { CreditVoucher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Plus, History, Check, Copy, Loader2, Zap, Monitor, Clock, FileText } from 'lucide-react';
import { createManualVoucher } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useShift } from '@/components/providers/shift-provider';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn, formatDuration } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function VoucherPos() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { activeShift, setIsOpeningDialog } = useShift();
    
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        duration: '60',
        type: 'All',
        note: ''
    });

    const [lastCode, setLastCode] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const vouchersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'vouchers'), orderBy('createdAt', 'desc'), limit(15));
    }, [firestore]);

    const { data: vouchers, isLoading } = useCollection<CreditVoucher>(vouchersQuery);

    const checkShift = () => {
        if (!activeShift) {
            toast({ title: "Shift Belum Dibuka", description: "Buka shift kasir untuk membuat voucher.", variant: "destructive" });
            setIsOpeningDialog(true);
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !checkShift()) return;

        setIsCreating(true);
        try {
            const code = await createManualVoucher(firestore, {
                durationMinutes: parseInt(formData.duration),
                stationType: formData.type,
                note: formData.note
            }, activeShift?.id);

            setLastCode(code);
            setFormData(prev => ({ ...prev, note: '' }));
            toast({ title: "Voucher Berhasil Dibuat", variant: "success" });
        } catch (err: any) {
            toast({ title: "Gagal Membuat Voucher", description: err.message, variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast({ title: "Kode Tersalin", variant: "success" });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CREATION FORM */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-primary/20 bg-primary/[0.02] rounded-[2rem] overflow-hidden shadow-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Ticket className="size-4 text-primary" /> Buat Voucher Baru
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-primary/60">
                            Cetak kode waktu untuk pelanggan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-8 space-y-6">
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Durasi Bermain</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                    <Select value={formData.duration} onValueChange={(val) => setFormData({...formData, duration: val})}>
                                        <SelectTrigger className="h-11 pl-10 rounded-xl bg-background font-bold text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 Menit</SelectItem>
                                            <SelectItem value="60">1 Jam (60m)</SelectItem>
                                            <SelectItem value="120">2 Jam (120m)</SelectItem>
                                            <SelectItem value="180">3 Jam (180m)</SelectItem>
                                            <SelectItem value="300">5 Jam (300m)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tipe Console</Label>
                                <div className="relative">
                                    <Monitor className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                        <SelectTrigger className="h-11 pl-10 rounded-xl bg-background font-bold text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">Berlaku Semua (All)</SelectItem>
                                            <SelectItem value="PS5">Khusus PS5</SelectItem>
                                            <SelectItem value="PS4">Khusus PS4</SelectItem>
                                            <SelectItem value="PS3">Khusus PS3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Keterangan / Memo</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Misal: Hadiah Giveaway..." 
                                        className="h-11 pl-10 rounded-xl bg-background text-sm font-medium" 
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isCreating} 
                                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/20"
                            >
                                {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                Buat Kode Voucher
                            </Button>
                        </form>

                        {lastCode && (
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 animate-in zoom-in duration-500">
                                <p className="text-[8px] font-black uppercase text-emerald-600 tracking-[0.3em] text-center mb-2">Voucher Terakhir Dibuat</p>
                                <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-emerald-500/10 shadow-sm">
                                    <span className="text-xl font-black font-mono tracking-widest text-emerald-600">{lastCode}</span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleCopy(lastCode)}>
                                        {hasCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <Zap className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-700 leading-relaxed font-bold uppercase">
                        Voucher manual tidak menambah "Omzet Lunas" pada laporan laci kasir saat dibuat, namun akan mengurangi "Sisa Waktu" stasiun saat ditukarkan.
                    </p>
                </div>
            </div>

            {/* HISTORY TABLE */}
            <div className="lg:col-span-8">
                <Card className="rounded-[2rem] overflow-hidden border shadow-sm h-full flex flex-col">
                    <CardHeader className="bg-muted/20 border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <History className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Riwayat Voucher</CardTitle>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Daftar penggunaan dan stok voucher</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                    <TableRow className="border-border hover:bg-transparent h-10">
                                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-6">Kode & Info</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Durasi & Tipe</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Status</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-right px-6">Tgl Buat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1,2,3,4,5].map(i => (
                                            <TableRow key={i}><TableCell colSpan={4} className="p-4"><div className="h-10 w-full bg-muted animate-pulse rounded-lg" /></TableCell></TableRow>
                                        ))
                                    ) : vouchers?.length ? (
                                        vouchers.map(v => (
                                            <TableRow key={v.id} className="border-border group hover:bg-muted/20 transition-colors h-16">
                                                <TableCell className="px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black font-mono tracking-widest text-sm text-primary">{v.code}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(v.code)}>
                                                                <Copy className="size-3" />
                                                            </Button>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight max-w-[150px] truncate">{v.description || 'Voucher Manual'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs">{formatDuration(v.durationMinutes)}</span>
                                                        <Badge variant="outline" className="w-fit h-4 text-[8px] font-black border-primary/20 bg-primary/5 text-primary mt-1">{v.stationType}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={cn(
                                                        "text-[9px] font-black border-none px-2 h-5",
                                                        v.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {v.status === 'active' ? 'READY' : 'USED'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-bold uppercase">{format(v.createdAt, 'dd MMM yyyy', { locale: id })}</span>
                                                        <span className="text-[9px] font-mono text-muted-foreground">{format(v.createdAt, 'HH:mm')} WIB</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center flex flex-col items-center justify-center gap-3 opacity-30">
                                                <Ticket className="size-10 text-muted-foreground" />
                                                <p className="text-xs font-black uppercase tracking-[0.3em]">Belum ada data</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
