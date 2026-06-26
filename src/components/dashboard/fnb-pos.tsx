'use client';

import { useState, useMemo, useEffect } from 'react';
import type { FnbItem, GeneralSettings, Shift } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Search, 
    ShoppingCart, 
    Plus, 
    Minus, 
    Trash2, 
    CreditCard, 
    RefreshCcw, 
    AlertCircle, 
    Banknote, 
    Coins, 
    X, 
    Store, 
    Printer, 
    CheckCircle2 
} from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { createStandaloneFnbTransaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useShift } from '@/components/providers/shift-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { doc } from 'firebase/firestore';

interface FnbItemWithQuantity extends FnbItem {
  quantity: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const QUICK_DENOMINATIONS = [5000, 10000, 20000, 50000, 100000];

export function FnbPos({ items }: { items: FnbItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isProcessing, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  const [cashReceived, setCashReceived] = useState<string>('0');
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
  const { data: settings } = useDoc<GeneralSettings>(settingsRef);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = items.find(i => i.id === id);
        if (!item || quantity <= 0) return null;
        return { ...item, quantity };
      })
      .filter((i): i is FnbItemWithQuantity => i !== null);
  }, [cart, items]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cashAmountNum = parseInt(cashReceived) || 0;
  const changeAmount = Math.max(0, cashAmountNum - totalAmount);
  const isCashEnough = cashAmountNum >= totalAmount && totalAmount > 0;

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Laci Kasir Terkunci",
        description: "Buka shift dulu ya di tab 'Kasir & Laci' sebelum jualan amunisi.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isConfirmOpen) {
        setCashReceived('0');
    }
  }, [isConfirmOpen]);

  const handleUpdateCart = (itemId: string, change: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const item = items.find(i => i.id === itemId);
      const next = current + change;
      
      if (next < 0) return prev;
      if (item && next > item.stock) {
        toast({ title: "Waduh, Stok Habis!", description: `Item ${item.name} cuma sisa ${item.stock} lagi.`, variant: "destructive" });
        return prev;
      }
      
      return { ...prev, [itemId]: next };
    });
  };

  const handleCheckout = async () => {
    if (!checkShift()) return;
    if (!firestore || cartItems.length === 0 || !isCashEnough) return;
    setIsSubmitting(true);
    try {
      const orderData = cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.sellPrice,
        quantity: i.quantity
      }));
      
      const transaction = await createStandaloneFnbTransaction(firestore, orderData, activeShift?.id);
      
      setLastOrderDetails({
          id: transaction.id,
          items: orderData,
          total: totalAmount,
          cash: cashAmountNum,
          change: changeAmount,
          cashier: activeShift?.openedByName || 'Operator',
          timestamp: Date.now()
      });

      toast({
        title: "Mantap, Terjual!",
        description: `Kembalian pelanggan: ${formatCurrency(changeAmount)}`,
        variant: "success"
      });
      
      setCart({});
      setIsConfirmOpen(false);
      setIsSheetOpen(false);
      setIsSuccessOpen(true);
    } catch (e: any) {
      toast({ title: "Waduh, Gagal!", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
      if (!lastOrderDetails) return;
      
      const storeName = settings?.storeName || 'XENONPLAY';
      const address = settings?.address || '';
      
      const conf = {
          paperSize: settings?.receiptPaperSize || '58mm',
          fontSize: settings?.receiptFontSize || 12,
          fontWeight: settings?.receiptFontWeight || '500',
          fontFamily: settings?.receiptFontFamily || 'sans',
          showLogo: settings?.receiptShowLogo ?? true,
          showStoreName: settings?.receiptShowStoreName ?? true,
          showAddress: settings?.receiptShowAddress ?? true,
          showFooter: settings?.receiptShowFooter ?? true,
          footerText: settings?.receiptFooter || 'Terimakasih Telah Bermain',
      };

      const fontFamilyCSS = conf.fontFamily === 'mono' ? "'Courier New', monospace" : conf.fontFamily === 'serif' ? "Georgia, serif" : "Inter, sans-serif";
      const dateStr = format(lastOrderDetails.timestamp, 'dd/MM/yyyy');
      const timeStr = format(lastOrderDetails.timestamp, 'HH:mm');
      const totalQty = lastOrderDetails.items.reduce((s: number, i: any) => s + i.quantity, 0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>XenonPlay Receipt - ${lastOrderDetails.id}</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"></script>
          <style>
            @page { margin: 0; size: ${conf.paperSize} auto; }
            html, body { 
              margin: 0; padding: 0; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; 
              font-family: ${fontFamilyCSS}; min-height: 100vh;
            }
            .receipt-paper { 
              width: ${conf.paperSize}; padding: 8mm 5mm; background: #fffdf5; font-size: ${conf.fontSize}px; 
              font-weight: ${conf.fontWeight}; line-height: 1.4; color: #000; box-sizing: border-box; 
              border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.1); margin: 40px 0 100px;
            }
            .center { text-align: center; } .right { text-align: right; } .bold { font-weight: bold; }
            .sep { border-top: 1px dashed #000; margin: 12px 0; opacity: 0.5; }
            .item-block { margin-bottom: 10px; } .item-name { font-weight: bold; display: block; text-transform: uppercase; }
            .flex { display: flex; justify-content: space-between; } 
            .logo { width: 50px; height: auto; margin: 0 auto 10px; display: block; filter: grayscale(1); opacity: 0.8; }
            .summary-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 8px 0; font-weight: 900; font-size: 1.2em; border-top: 1.5px solid #000; padding-top: 8px; }
            
            .fab-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column-reverse; align-items: center; gap: 15px; z-index: 1000; }
            .fab-main { width: 64px; height: 64px; background: #0ea5e9; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5); cursor: pointer; border: none; transition: all 0.3s; }
            .fab-main svg { width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 2.5; }
            .fab-main.active { transform: rotate(135deg); background: #ef4444; }
            .fab-menu { display: flex; flex-direction: column; gap: 12px; opacity: 0; transform: translateY(20px) scale(0.8); pointer-events: none; transition: all 0.3s; }
            .fab-menu.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
            .fab-item { width: 56px; height: 56px; background: white; color: #64748b; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); cursor: pointer; border: 1px solid #f1f5f9; }

            @media print {
              .fab-container { display: none; }
              .receipt-paper { border: none; box-shadow: none; width: ${conf.paperSize}; margin: 0; padding: 0; background: #fff; }
              body { background: #fff; }
            }
          </style>
        </head>
        <body>
            <div id="receipt-target" class="receipt-paper">
                <div class="center">
                    ${conf.showLogo ? `<img src="/xenonplay-logo.png" class="logo" />` : ''}
                    ${conf.showStoreName ? `<div class="bold" style="font-size: 1.2em;">${storeName.toUpperCase()}</div>` : ''}
                    ${conf.showAddress ? `<div style="font-size: 0.75em; opacity: 0.7;">${address}</div>` : ''}
                </div>
                
                <div class="sep"></div>
                
                <div class="flex" style="font-size: 0.75em;">
                    <div>Nota: ${lastOrderDetails.id.substring(0,8).toUpperCase()}<br>Tgl: ${dateStr} ${timeStr}</div>
                    <div class="right">Kasir:<br><span class="bold">${lastOrderDetails.cashier.toUpperCase()}</span></div>
                </div>

                <div class="sep"></div>

                ${lastOrderDetails.items.map((item: any, idx: number) => `
                    <div class="item-block">
                        <span class="item-name" style="font-size: 0.85em;">${idx + 1}. ${item.name}</span>
                        <div class="flex" style="font-size: 0.75em;">
                            <span>${item.quantity} x ${item.price.toLocaleString('id-ID')}</span>
                            <span class="right bold">${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                `).join('')}

                <div class="sep"></div>

                <div class="summary-row" style="font-size: 0.75em;"><span>Total Qty</span><span class="right">${totalQty} Items</span></div>
                <div class="summary-row" style="font-size: 0.75em;"><span>Sub Total</span><span class="right">${lastOrderDetails.total.toLocaleString('id-ID')}</span></div>
                <div class="total-row"><span>TOTAL</span><span class="right">${lastOrderDetails.total.toLocaleString('id-ID')}</span></div>

                <div class="summary-row" style="opacity: 0.7; font-size: 0.75em;"><span>Bayar Tunai</span><span class="right">${lastOrderDetails.cash.toLocaleString('id-ID')}</span></div>
                <div class="summary-row" style="font-size: 0.85em;"><span>Kembali</span><span class="right bold">${lastOrderDetails.change.toLocaleString('id-ID')}</span></div>

                <div class="sep"></div>
                ${conf.showFooter ? `<div class="center" style="font-size: 0.8em; font-style: italic; white-space: pre-wrap; margin-top: 10px; opacity: 0.6;">${conf.footerText}</div>` : ''}
            </div>

            <div class="fab-container">
                <button class="fab-main" id="fab-main" onclick="toggleMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-item" onclick="window.print()" title="Cetak">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 4H8v-6h8v6z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportImage()" title="Simpan Gambar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
                    target.style.border = 'none'; target.style.boxShadow = 'none'; target.style.margin = '0';
                    html2canvas(target, { backgroundColor: '#fffdf5', scale: 3 }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'FnbReceipt_${lastOrderDetails.id.substring(0,8)}.png';
                        link.href = canvas.toDataURL('image/png'); link.click();
                        target.style.border = '1px solid #e2e8f0'; target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)'; target.style.margin = '40px 0 100px';
                    });
                }
            </script>
        </body>
      </html>`;

      printWindow.document.write(html);
      printWindow.document.close();
  };

  return (
    <div className="relative pb-24 px-1 pr-1 sm:px-0">
      {/* SELECTION PANEL */}
      <div className="flex flex-col gap-6">
        <div className="relative max-w-2xl mx-auto w-full group">
          <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari amunisi mabar (snack/minuman)..." 
            className="pl-12 h-14 bg-card border-border text-base sm:text-lg rounded-2xl shadow-sm focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:grid sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredItems.map(item => (
            <Card 
              key={item.id} 
              className={cn(
                "cursor-pointer hover:border-primary transition-all border-border bg-card group active:scale-[0.98]",
                (cart[item.id] || 0) > 0 ? "border-primary ring-1 ring-primary bg-primary/[0.02]" : "shadow-sm"
              )}
              onClick={() => handleUpdateCart(item.id, 1)}
            >
              <div className="flex sm:flex-col items-center sm:items-start p-3 sm:p-4 gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0 sm:mb-2">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-tight leading-tight line-clamp-1 sm:line-clamp-2 group-hover:text-primary transition-colors">
                            {item.name}
                        </CardTitle>
                        {(cart[item.id] || 0) > 0 && (
                            <Badge className="h-5 px-1.5 bg-primary text-white border-none animate-in zoom-in text-[10px] sm:hidden">
                                {cart[item.id]}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-primary font-black text-sm sm:text-lg leading-none">{formatCurrency(item.sellPrice)}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter sm:hidden">Sisa: {item.stock}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-0 sm:mt-3 shrink-0 sm:w-full">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest hidden sm:block">Sisa: {item.stock}</p>
                    <div className="size-10 sm:size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Plus className="size-5 sm:size-4" />
                    </div>
                    {(cart[item.id] || 0) > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 px-2 bg-primary text-white border-2 border-background shadow-lg animate-in zoom-in hidden sm:flex">
                            {cart[item.id]}
                        </Badge>
                    )}
                  </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
            <Button 
                size="lg" 
                className={cn(
                    "fixed bottom-24 right-4 left-4 sm:right-8 sm:left-auto h-16 px-6 rounded-2xl shadow-2xl z-40 transition-all",
                    totalItemsCount > 0 ? "animate-in slide-in-from-bottom-10" : "hidden"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <ShoppingCart className="size-6" />
                        <span className="absolute -top-3 -right-3 size-6 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
                            {totalItemsCount}
                        </span>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Belanja</span>
                        <span className="text-lg font-black font-mono">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:w-full sm:max-w-md bg-background border-t p-0 flex flex-col rounded-t-[2.5rem] sm:rounded-none">
          <SheetHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShoppingCart className="size-5" />
                    </div>
                    <div>
                        <SheetTitle className="text-xl font-black uppercase tracking-tight">Keranjang Belanja</SheetTitle>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{totalItemsCount} amunisi terpilih</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black" onClick={() => setCart({})}>Bersihkan</Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-3">
                {cartItems.map(item => (
                    <div key={item.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-xs font-black uppercase tracking-tight flex-1">{item.name}</span>
                            <span className="text-xs font-black font-mono text-primary">{formatCurrency(item.sellPrice * item.quantity)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-destructive" onClick={() => setCart(prev => { const n = {...prev}; delete n[item.id]; return n; })}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> <span className="text-[9px] font-black uppercase">Hapus</span>
                            </Button>
                            <div className="flex items-center gap-4 bg-background p-1 rounded-xl border border-border/50">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateCart(item.id, -1)} disabled={(cart[item.id] || 0) === 0}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-black font-mono w-6 text-center">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateCart(item.id, 1)} disabled={(cart[item.id] || 0) >= item.stock}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>

          <div className="p-6 bg-card border-t border-border space-y-6 shrink-0">
            <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tagihan Akhir</span>
                <span className="text-3xl font-black text-primary font-mono leading-none">{formatCurrency(totalAmount).replace(',00', '')}</span>
            </div>
            
            <AlertDialog open={isConfirmOpen} onOpenChange={(val) => { if(val && !checkShift()) return; setIsConfirmOpen(val); }}>
                <AlertDialogTrigger asChild>
                <Button className="w-full h-16 text-lg font-black uppercase tracking-widest gap-3 shadow-xl rounded-2xl" disabled={cartItems.length === 0 || isProcessing}>
                    <CreditCard className="h-6 w-6" /> BAYAR TUNAI SEKARANG
                </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-2xl bg-background border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Pembayaran Tunai</AlertDialogTitle>
                    <AlertDialogDescription>Masukkan jumlah uang tunai yang diterima dari pelanggan.</AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                            <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Detail Amunisi</p>
                            </div>
                            <ScrollArea className="max-h-[150px] p-3 space-y-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-[11px]">
                                        <span className="truncate flex-1 uppercase font-bold">{item.name} x{item.quantity}</span>
                                        <span className="font-mono font-bold ml-2">{formatCurrency(item.sellPrice * item.quantity)}</span>
                                    </div>
                                ))}
                            </ScrollArea>
                            <div className="p-4 bg-primary/5 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-primary">Total Harus Bayar</span>
                                    <span className="text-xl font-black text-primary font-mono">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Uang Tunai Diterima</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-lg">Rp</span>
                                <Input type="number" className="h-16 pl-12 text-3xl font-black bg-muted border-border" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} autoFocus />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {QUICK_DENOMINATIONS.map(denom => (
                                <Button key={denom} variant="outline" size="sm" className="h-10 text-xs font-bold" onClick={() => setCashReceived(denom.toString())}>{denom >= 1000 ? `${denom/1000}rb` : denom}</Button>
                            ))}
                            <Button variant="outline" size="sm" className="h-10 text-xs font-black text-primary" onClick={() => setCashReceived(totalAmount.toString())}>Uang Pas</Button>
                        </div>
                        <div className={cn("p-5 rounded-2xl border-2 flex justify-between items-center", isCashEnough ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/5 border-red-500/20")}>
                            <div>
                                <span className={cn("text-[10px] font-black uppercase", isCashEnough ? "text-emerald-600" : "text-red-600")}>{isCashEnough ? 'Kembalian' : 'Masih Kurang'}</span>
                                <p className={cn("text-2xl font-black font-mono", isCashEnough ? "text-emerald-600" : "text-red-600")}>{formatCurrency(isCashEnough ? changeAmount : Math.abs(cashAmountNum - totalAmount))}</p>
                            </div>
                            <div className={cn("p-3 rounded-xl", isCashEnough ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600")}>
                                {isCashEnough ? <Coins className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </div>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="gap-2 border-t pt-4">
                    <AlertDialogCancel className="font-bold h-12 rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckout} className={cn("h-12 flex-1 rounded-xl font-black uppercase", isCashEnough ? "bg-primary shadow-primary/20" : "bg-muted text-muted-foreground")} disabled={isProcessing || !isCashEnough}>
                        {isProcessing ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <Banknote className="h-4 w-4 mr-2" />} LUNASI PEMBAYARAN
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] p-0 overflow-hidden">
            <div className="bg-emerald-500 h-2 w-full" />
            <div className="p-8 text-center space-y-6">
                <div className="size-20 rounded-[2.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border-4 border-emerald-500/20 shadow-xl"><CheckCircle2 className="size-10" /></div>
                
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Transaksi Berhasil!</DialogTitle>
                    <DialogDescription className="text-center text-xs text-muted-foreground font-bold uppercase">
                        Kembalian pelanggan: <span className="text-emerald-600 font-mono">{formatCurrency(lastOrderDetails?.change || 0)}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 pt-4">
                    <Button onClick={handlePrintReceipt} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20">
                        <Printer className="size-5" /> Cetak Nota Belanja
                    </Button>
                    <DialogClose asChild>
                        <Button variant="ghost" className="w-full h-12 font-bold uppercase text-[10px]">Tutup</Button>
                    </DialogClose>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}