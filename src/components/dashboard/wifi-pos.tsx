'use client';

import { useState } from 'react';
import type { WifiPackage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, Zap, CheckCircle2, RefreshCw, Printer, AlertTriangle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { createWifiTransaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useShift } from '@/components/providers/shift-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';

export function WifiPos({ packages }: { packages: WifiPackage[] }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { activeShift, setIsOpeningDialog } = useShift();
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [wifiCode, setWifiCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);

    const checkShift = () => {
        if (!activeShift) {
            toast({ title: "Laci Terkunci", description: "Buka shift dulu di tab Laci Kasir.", variant: "destructive" });
            setIsOpeningDialog(true);
            return false;
        }
        return true;
    };

    const handleSell = async () => {
        if (!firestore || !checkShift() || !selectedId || !wifiCode.trim()) return;
        
        setIsProcessing(true);
        const pkg = packages.find(p => p.id === selectedId);
        if (!pkg) return;

        try {
            const transaction = await createWifiTransaction(firestore, pkg, wifiCode.toUpperCase(), activeShift?.id);
            setLastOrder({ ...transaction, pkgName: pkg.name });
            setIsSuccessOpen(true);
            toast({ title: "Penjualan Berhasil!", variant: "success" });
            setWifiCode('');
            setSelectedId(null);
        } catch (err: any) {
            toast({ title: "Gagal menjual", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-1 lg:px-0">
            <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packages.map(pkg => (
                        <Card 
                            key={pkg.id} 
                            onClick={() => setSelectedId(pkg.id)}
                            className={cn(
                                "cursor-pointer border-2 transition-all active:scale-[0.98] group relative overflow-hidden",
                                selectedId === pkg.id ? "border-primary bg-primary/[0.03] shadow-lg" : "border-border bg-card hover:border-primary/40"
                            )}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-2 rounded-xl transition-colors", selectedId === pkg.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                                        <Wifi className="size-5" />
                                    </div>
                                    {selectedId === pkg.id && <CheckCircle2 className="size-5 text-primary animate-in zoom-in" />}
                                </div>
                                <h3 className="font-black uppercase tracking-tight text-lg leading-tight">{pkg.name}</h3>
                                <p className="text-xl font-black font-mono text-primary mt-2">{formatCurrency(pkg.price)}</p>
                            </div>
                        </Card>
                    ))}
                    {packages.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[2rem] opacity-40">
                            <p className="text-xs font-black uppercase tracking-widest">Belum ada paket Wi-Fi di Master Data.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card className="border-primary/20 bg-primary/[0.01] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="size-4 text-primary" /> Input Kode Mikhmon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ketik Kode Voucher</Label>
                            <Input 
                                placeholder="CONTOH: 72A9X" 
                                className="h-16 text-3xl font-black text-center uppercase tracking-[0.3em] bg-background border-border shadow-inner"
                                value={wifiCode}
                                onChange={(e) => setWifiCode(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground italic text-center">Salin kode yang muncul di layar Mikhmon Anda.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="uppercase font-bold text-muted-foreground">Paket Terpilih</span>
                                <span className="font-black uppercase text-primary">{packages.find(p => p.id === selectedId)?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-border/50">
                                <span className="font-black uppercase">Total Bayar</span>
                                <span className="font-black text-primary font-mono">{formatCurrency(packages.find(p => p.id === selectedId)?.price || 0)}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30"
                            disabled={!selectedId || !wifiCode || isProcessing}
                            onClick={handleSell}
                        >
                            {isProcessing ? <RefreshCw className="size-5 animate-spin mr-2" /> : <CheckCircle2 className="size-5 mr-2" />}
                            VALIDASI & CETAK VOUCHER
                        </Button>
                    </CardContent>
                </Card>

                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-[2rem] flex items-start gap-4">
                    <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-1" />
                    <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase">
                        PASTIKAN KODE BENAR. Penjualan Wi-Fi bersifat final dan otomatis menambah saldo laci kasir Anda saat diklik.
                    </p>
                </div>
            </div>

            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="max-w-sm rounded-[2.5rem] p-0 overflow-hidden bg-background">
                    <div className="bg-primary h-2 w-full" />
                    <div className="p-8 text-center space-y-6">
                        <div className="size-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mx-auto border-4 border-primary/20"><CheckCircle2 className="size-10" /></div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Berhasil Terjual!</DialogTitle>
                            <DialogDescription className="text-center text-xs font-bold text-muted-foreground uppercase">Transaksi Wi-Fi telah dicatat ke laporan.</DialogDescription>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20">
                            <Printer className="size-5" /> Cetak Kupon Wifi
                        </Button>
                        <DialogClose asChild><Button variant="ghost" className="w-full font-bold uppercase text-[10px]">Tutup</Button></DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}