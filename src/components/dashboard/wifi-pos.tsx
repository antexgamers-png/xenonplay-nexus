'use client';

import { useState } from 'react';
import type { PricingRule, GeneralSettings, Shift } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, Zap, CheckCircle2, RefreshCw, Printer, AlertTriangle, Loader2 } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';

export function WifiPos({ packages }: { packages: PricingRule[] }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { activeShift, setIsOpeningDialog } = useShift();
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [wifiCode, setWifiCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);

    const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
    const { data: settings } = useDoc<GeneralSettings>(settingsRef);

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

    const handlePrintVoucher = () => {
        if (!lastOrder) return;
        setIsPrinting(true);
        
        const storeName = settings?.storeName || 'XENONPLAY';
        const paperSize = settings?.receiptPaperSize || '58mm';
        const fontSize = settings?.receiptFontSize || 12;
        const fontWeight = settings?.receiptFontWeight || '500';
        const headerMsg = settings?.receiptHeader || 'Selamat datang di toko kami';
        const footerMsg = settings?.receiptFooter || 'Terimakasih Telah Bermain\n"Good Game, Well Played"';
        const wifiGuide = settings?.wifiInstructions || 'Silahkan hubungi kasir jika ada kendala.';
        
        const dateStr = format(lastOrder.timestamp, 'dd/MM/yyyy');
        const timeStr = format(lastOrder.timestamp, 'HH:mm');
        const cashierName = activeShift?.openedByName || 'Operator';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>XenonPlay Wifi Voucher - ${lastOrder.id}</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"></script>
          <style>
            @page { margin: 0; size: ${paperSize} auto; }
            html, body { 
                margin: 0; padding: 0; background: #f1f5f9; 
                display: flex; flex-direction: column; align-items: center; 
                font-family: 'Courier New', Courier, monospace; min-height: 100vh;
            }
            .receipt-paper { 
                width: ${paperSize}; padding: 8mm 5mm; background: #fffdf5; 
                font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: 1.4; color: #000; 
                box-sizing: border-box; border: 1px solid #e2e8f0; 
                box-shadow: 0 20px 50px rgba(0,0,0,0.1); margin: 40px 0 100px; position: relative;
            }
            .center { text-align: center; } .right { text-align: right; } .bold { font-weight: bold; }
            .sep { border-top: 1px dashed #000; margin: 12px 0; opacity: 0.5; }
            .flex { display: flex; justify-content: space-between; } 
            .logo { width: 50px; height: auto; margin: 0 auto 10px; display: block; filter: grayscale(1); opacity: 0.8; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            
            /* UI Controls */
            .fab-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column-reverse; align-items: center; gap: 15px; z-index: 1000; }
            .fab-main { width: 64px; height: 64px; background: #0ea5e9; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5); cursor: pointer; border: none; transition: all 0.3s; }
            .fab-main svg { width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 2.5; }
            .fab-main.active { transform: rotate(135deg); background: #ef4444; }
            .fab-menu { display: flex; flex-direction: column; gap: 12px; opacity: 0; transform: translateY(20px) scale(0.8); pointer-events: none; transition: all 0.3s; }
            .fab-menu.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
            .fab-item { width: 56px; height: 56px; background: white; color: #64748b; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); cursor: pointer; border: 1px solid #f1f5f9; }
            .fab-item svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; }

            @media print {
              .fab-container { display: none; }
              .receipt-paper { border: none; box-shadow: none; width: ${paperSize}; margin: 0; padding: 0; background: #fff; }
              body { background: #fff; }
            }
          </style>
        </head>
        <body>
            <div id="receipt-target" class="receipt-paper">
                <div class="center">
                    <img src="/xenonplay-logo.png" class="logo" />
                    <div class="bold" style="font-size: 1.2em;">${storeName.toUpperCase()}</div>
                    <div style="margin-top: 6px; font-size: 0.8em; opacity: 0.7;">${headerMsg}</div>
                </div>
                <div class="sep"></div>
                <div class="center py-6">
                    <span style="font-size: 0.8em; font-weight: 900; letter-spacing: 2px; opacity: 0.6; display: block; margin-bottom: 5px;">KODE VOUCHER WI-FI</span>
                    <div style="font-size: 3.2em; font-weight: 900; margin: 10px 0; letter-spacing: 4px; line-height: 1;">${lastOrder.claimCode}</div>
                    <div class="bold" style="font-size: 1.1em; text-transform: uppercase; margin-top: 10px; color: #3b82f6;">PAKET: ${lastOrder.pkgName}</div>
                </div>
                <div class="sep"></div>
                <div style="padding: 10px 5px;">
                    <div class="bold" style="font-size: 0.85em; margin-bottom: 5px; border-bottom: 1px solid #000; width: fit-content;">PANDUAN KONEKSI:</div>
                    <div style="font-size: 0.8em; line-height: 1.4; white-space: pre-wrap; opacity: 0.9;">${wifiGuide}</div>
                </div>
                <div class="sep"></div>
                <div class="flex" style="font-size: 0.7em; opacity: 0.6;">
                    <div>Tgl: ${dateStr} ${timeStr}</div>
                    <div class="right">Kasir: ${cashierName.toUpperCase()}</div>
                </div>
                <div class="sep"></div>
                <div class="center" style="font-size: 0.8em; font-style: italic; white-space: pre-wrap; margin-top: 10px; opacity: 0.6;">${footerMsg}</div>
            </div>

            <div class="fab-container">
                <button class="fab-main" id="fab-main" onclick="toggleMenu()">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-item" onclick="window.print()" title="Cetak Ke Printer">
                        <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 4H8v-6h8v6z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportImage()" title="Simpan Gambar PNG">
                        <svg viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportPDF()" title="Simpan Dokumen PDF">
                        <svg viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v5h5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </div>

            <script>
                function toggleMenu() {
                    const main = document.getElementById('fab-main');
                    const menu = document.getElementById('fab-menu');
                    main.classList.toggle('active');
                    menu.classList.toggle('active');
                }

                function exportImage() {
                    const target = document.getElementById('receipt-target');
                    const originalBorder = target.style.border;
                    const originalShadow = target.style.shadow;
                    target.style.border = 'none';
                    target.style.boxShadow = 'none';
                    target.style.margin = '0';
                    
                    html2canvas(target, { backgroundColor: '#fffdf5', scale: 3 }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'XenonPlay_Wifi_${lastOrder.claimCode}.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        target.style.border = originalBorder;
                        target.style.boxShadow = originalShadow;
                        target.style.margin = '40px 0 100px';
                    });
                }

                function exportPDF() {
                    const target = document.getElementById('receipt-target');
                    target.style.border = 'none';
                    target.style.boxShadow = 'none';
                    target.style.margin = '0';
                    const { jsPDF } = window.jspdf;
                    
                    html2canvas(target, { backgroundColor: '#fffdf5', scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: [canvas.width / 2, canvas.height / 2]
                        });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
                        pdf.save('XenonPlay_Wifi_${lastOrder.claimCode}.pdf');
                        target.style.border = '1px solid #e2e8f0';
                        target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                        target.style.margin = '40px 0 100px';
                    });
                }
            </script>
        </body>
      </html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        setIsPrinting(false);
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
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">Daftarkan di Master Data &gt; Tab Kupon Wi-Fi</p>
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
                        <Button 
                            onClick={handlePrintVoucher}
                            disabled={isPrinting}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
                        >
                            {isPrinting ? <RefreshCw className="size-5 animate-spin" /> : <Printer className="size-5" />}
                            Cetak Kupon Wifi
                        </Button>
                        <DialogClose asChild><Button variant="ghost" className="w-full font-bold uppercase text-[10px]">Tutup</Button></DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
