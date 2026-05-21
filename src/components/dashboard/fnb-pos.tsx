'use client';

import { useState, useMemo, useEffect } from 'react';
import type { FnbItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, RefreshCcw, AlertCircle, Banknote, Coins, X, Store } from 'lucide-react';
import { useFirestore } from '@/firebase';
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
import { Label } from '@/components/ui/label';

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
  
  // Payment calculator state
  const [cashReceived, setCashReceived] = useState<string>('0');
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();

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
        title: "Shift Belum Dibuka",
        description: "Harap buka shift kasir terlebih dahulu untuk melakukan penjualan.",
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
  }, [isConfirmOpen, totalAmount]);

  const handleUpdateCart = (itemId: string, change: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const item = items.find(i => i.id === itemId);
      const next = current + change;
      
      if (next < 0) return prev;
      if (item && next > item.stock) {
        toast({ title: "Stok Terbatas", description: `Hanya tersedia ${item.stock} pcs`, variant: "destructive" });
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
      
      await createStandaloneFnbTransaction(firestore, orderData, activeShift?.id);
      
      toast({
        title: "Penjualan Berhasil",
        description: `Total ${formatCurrency(totalAmount)} telah dibayarkan. Kembalian: ${formatCurrency(changeAmount)}`,
        variant: "success"
      });
      setCart({});
      setIsConfirmOpen(false);
      setIsSheetOpen(false);
    } catch (e: any) {
      toast({ title: "Gagal Checkout", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pb-24 px-1 sm:px-0">
      {/* SELECTION PANEL */}
      <div className="flex flex-col gap-6">
        <div className="relative max-w-2xl mx-auto w-full group">
          <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari makanan atau minuman..." 
            className="pl-12 h-14 bg-card border-border text-base sm:text-lg rounded-2xl shadow-sm focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* LAYOUT LIST UNTUK MOBILE, GRID UNTUK DESKTOP */}
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
              {/* Layout horizontal pada mobile untuk kenyamanan jari */}
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
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter sm:hidden">Stok: {item.stock}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-0 sm:mt-3 shrink-0 sm:w-full">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest hidden sm:block">Stok: {item.stock}</p>
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
          {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <Store className="size-12" />
                  <p className="text-xs font-black uppercase tracking-widest">Produk tidak ditemukan</p>
              </div>
          )}
        </div>
      </div>

      {/* FLOATING CART BUTTON (OPTIMIZED FOR MOBILE) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
            <Button 
                size="lg" 
                className={cn(
                    "fixed bottom-24 right-4 left-4 sm:right-8 sm:left-auto h-16 sm:h-16 px-6 sm:px-8 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-between sm:justify-start sm:gap-4 transition-all hover:scale-105 active:scale-95 z-40",
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
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Ringkasan</span>
                        <span className="text-lg font-black font-mono">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest sm:hidden">
                    Cek Out
                </div>
            </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:w-full sm:max-w-md bg-background border-t sm:border-l border-border p-0 flex flex-col rounded-t-[2.5rem] sm:rounded-none">
          <SheetHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShoppingCart className="size-5" />
                    </div>
                    <div>
                        <SheetTitle className="text-xl font-black uppercase tracking-tight">Keranjang</SheetTitle>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{totalItemsCount} item terpilih</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive" onClick={() => setCart({})}>
                    Reset
                </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-3">
                {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-30">
                    <ShoppingCart className="h-16 w-16 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Keranjang Kosong</p>
                </div>
                ) : (
                cartItems.map(item => (
                    <div key={item.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-xs font-black uppercase tracking-tight leading-tight flex-1">{item.name}</span>
                            <span className="text-xs font-black font-mono text-primary shrink-0">{formatCurrency(item.sellPrice * item.quantity)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5" onClick={() => setCart(prev => { const n = {...prev}; delete n[item.id]; return n; })}>
                                <Trash2 className="h-3.5 w-3.5" /> <span className="text-[9px] font-black uppercase">Hapus</span>
                            </Button>
                            <div className="flex items-center gap-4 bg-background p-1 rounded-xl border border-border/50 shadow-sm">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => handleUpdateCart(item.id, -1)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-black font-mono w-6 text-center">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => handleUpdateCart(item.id, 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))
                )}
            </div>
          </ScrollArea>

          <div className="p-6 bg-card border-t border-border space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0">
            <div className="space-y-2">
                <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tagihan Akhir</span>
                    <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] font-mono leading-none">
                        {formatCurrency(totalAmount).replace(',00', '')}
                    </span>
                </div>
            </div>
            
            <AlertDialog open={isConfirmOpen} onOpenChange={(val) => { if(val && !checkShift()) return; setIsConfirmOpen(val); }}>
                <AlertDialogTrigger asChild>
                <Button 
                    className="w-full h-16 text-lg font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/30 rounded-2xl" 
                    disabled={cartItems.length === 0 || isProcessing}
                >
                    <CreditCard className="h-6 w-6" />
                    BAYAR SEKARANG
                </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-2xl bg-background border-border max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Pembayaran Tunai
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                    Masukkan jumlah uang yang diterima dari pelanggan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden flex flex-col">
                            <div className="p-3 bg-muted/50 border-b border-border flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Detail Item</p>
                            </div>
                            <ScrollArea className="max-h-[150px]">
                                <div className="p-3 space-y-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground line-clamp-1 flex-1">{item.name} <span className="font-bold text-foreground">x{item.quantity}</span></span>
                                    <span className="font-mono ml-2">{formatCurrency(item.sellPrice * item.quantity)}</span>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 bg-primary/5 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-primary">Total Bayar</span>
                                    <span className="text-xl font-black text-primary font-mono">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Uang Diterima (Cash)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-lg">Rp</span>
                                <Input type="number" className="h-16 pl-12 text-3xl font-black bg-muted border-border focus:ring-primary shadow-inner" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} autoFocus />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                {QUICK_DENOMINATIONS.map(denom => (
                                    <Button key={denom} variant="outline" size="sm" className="h-10 text-xs font-bold border-border hover:bg-primary/10" onClick={() => setCashReceived(denom.toString())}>
                                        {denom >= 1000 ? `${denom/1000}rb` : denom}
                                    </Button>
                                ))}
                                <Button variant="outline" size="sm" className="h-10 text-xs font-black border-primary/30 text-primary bg-primary/5" onClick={() => setCashReceived(totalAmount.toString())}>Uang Pas</Button>
                            </div>
                        </div>

                        <div className={cn("p-5 rounded-2xl border-2 transition-all duration-500 flex justify-between items-center", isCashEnough ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/5 border-red-500/20")}>
                            <div className="space-y-0.5">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isCashEnough ? "text-emerald-600" : "text-red-600")}>{isCashEnough ? 'Kembalian' : 'Kurang'}</span>
                                <p className={cn("text-2xl font-black font-mono leading-none", isCashEnough ? "text-emerald-600" : "text-red-600")}>{formatCurrency(isCashEnough ? changeAmount : Math.abs(cashAmountNum - totalAmount))}</p>
                            </div>
                            <div className={cn("p-3 rounded-xl", isCashEnough ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600")}>
                                {isCashEnough ? <Coins className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </div>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="gap-2 border-t border-border pt-4 mt-2">
                    <AlertDialogCancel className="font-bold h-12 px-6 rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                    onClick={handleCheckout} 
                    className={cn(
                        "font-black uppercase tracking-widest px-10 h-12 flex-1 shadow-lg transition-all rounded-xl",
                        isCashEnough ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20" : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={isProcessing || !isCashEnough}
                    >
                    {isProcessing ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <Banknote className="h-4 w-4 mr-2" />}
                    Selesaikan Penjualan
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
