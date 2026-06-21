'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
    Store, 
    Save, 
    Trash2, 
    AlertTriangle, 
    ShieldAlert, 
    History, 
    Users, 
    Wallet, 
    ReceiptText, 
    Palette, 
    Clock, 
    Printer, 
    Eye,
    Settings2,
    RotateCcw
} from 'lucide-react';
import type { GeneralSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { saveGeneralSettings, deleteAllTransactions, deleteAllExpenses, deleteAllShifts, deleteAllMembers } from '@/lib/data';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';

const DEFAULT_FORM_DATA: GeneralSettings = {
  storeName: 'XenonPlay Manager',
  address: '',
  phone: '',
  themeMode: 'light',
  dayThemeStart: '06:00',
  nightThemeStart: '18:00',
  receiptPaperSize: '58mm',
  receiptHeader: 'Selamat datang di toko kami',
  receiptFooter: 'Terima kasih telah berkunjung!'
};

export default function PengaturanPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
  const { data: currentSettings, isLoading } = useDoc<GeneralSettings>(settingsRef);

  const [formData, setFormData] = useState<GeneralSettings>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (currentSettings) {
      setFormData({
          ...DEFAULT_FORM_DATA,
          ...currentSettings,
      });
    }
  }, [currentSettings]);

  const hasBusinessChanges = useMemo(() => {
    if (!currentSettings) return false;
    return formData.storeName !== (currentSettings.storeName || DEFAULT_FORM_DATA.storeName) ||
           formData.address !== (currentSettings.address || DEFAULT_FORM_DATA.address) ||
           formData.phone !== (currentSettings.phone || DEFAULT_FORM_DATA.phone);
  }, [formData, currentSettings]);

  const hasPrinterChanges = useMemo(() => {
    if (!currentSettings) return false;
    return formData.receiptPaperSize !== (currentSettings.receiptPaperSize || DEFAULT_FORM_DATA.receiptPaperSize) ||
           formData.receiptHeader !== (currentSettings.receiptHeader || DEFAULT_FORM_DATA.receiptHeader) ||
           formData.receiptFooter !== (currentSettings.receiptFooter || DEFAULT_FORM_DATA.receiptFooter);
  }, [formData, currentSettings]);

  const hasThemeChanges = useMemo(() => {
    if (!currentSettings) return false;
    return formData.themeMode !== (currentSettings.themeMode || DEFAULT_FORM_DATA.themeMode) ||
           formData.dayThemeStart !== (currentSettings.dayThemeStart || DEFAULT_FORM_DATA.dayThemeStart) ||
           formData.nightThemeStart !== (currentSettings.nightThemeStart || DEFAULT_FORM_DATA.nightThemeStart);
  }, [formData, currentSettings]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await saveGeneralSettings(firestore, formData);
      toast({
        title: 'Sukses',
        description: 'Pengaturan berhasil diperbarui.',
        variant: 'success'
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = (type: 'business' | 'printer' | 'theme') => {
    if (!currentSettings) return;
    
    if (type === 'business') {
        setFormData(prev => ({
            ...prev,
            storeName: currentSettings.storeName || DEFAULT_FORM_DATA.storeName,
            address: currentSettings.address || DEFAULT_FORM_DATA.address,
            phone: currentSettings.phone || DEFAULT_FORM_DATA.phone,
        }));
    } else if (type === 'printer') {
        setFormData(prev => ({
            ...prev,
            receiptPaperSize: currentSettings.receiptPaperSize || DEFAULT_FORM_DATA.receiptPaperSize,
            receiptHeader: currentSettings.receiptHeader || DEFAULT_FORM_DATA.receiptHeader,
            receiptFooter: currentSettings.receiptFooter || DEFAULT_FORM_DATA.receiptFooter,
        }));
    } else if (type === 'theme') {
        setFormData(prev => ({
            ...prev,
            themeMode: currentSettings.themeMode || DEFAULT_FORM_DATA.themeMode,
            dayThemeStart: currentSettings.dayThemeStart || DEFAULT_FORM_DATA.dayThemeStart,
            nightThemeStart: currentSettings.nightThemeStart || DEFAULT_FORM_DATA.nightThemeStart,
        }));
    }
    toast({ title: 'Perubahan Dibatalkan' });
  };

  const handleReset = async (type: 'transactions' | 'expenses' | 'shifts' | 'members') => {
    if (!firestore) return;
    setIsDeleting(type);
    try {
      if (type === 'transactions') await deleteAllTransactions(firestore);
      if (type === 'expenses') await deleteAllExpenses(firestore);
      if (type === 'shifts') await deleteAllShifts(firestore);
      if (type === 'members') await deleteAllMembers(firestore);

      toast({
        title: 'Data Dihapus',
        description: `Pembersihan data ${type} berhasil dilakukan.`,
        variant: 'success'
      });
    } catch (e: any) {
      toast({ title: 'Gagal Menghapus', description: e.message, variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 lg:px-0">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-primary/10 text-primary">
                    <Settings2 className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Configuration</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Pengaturan <span className="text-primary">Umum</span></h1>
        </div>
      </header>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-14 rounded-[1.5rem] mb-8 border flex w-full sm:w-fit overflow-x-auto shadow-inner">
            <TabsTrigger value="business" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6">
                <Store className="size-3.5" /> Profil Bisnis
            </TabsTrigger>
            <TabsTrigger value="printer" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6">
                <Printer className="size-3.5" /> Printer & Nota
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6">
                <Palette className="size-3.5" /> Tema Visual
            </TabsTrigger>
            <TabsTrigger value="danger" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-red-500 px-6">
                <ShieldAlert className="size-3.5" /> Zona Bahaya
            </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] overflow-hidden border-border shadow-sm max-w-3xl">
                <CardHeader className="bg-muted/20 border-b">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Identitas Toko</CardTitle>
                    <CardDescription className="text-xs">Informasi ini akan muncul pada dashboard dan nota pelanggan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                    <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Rental / Toko</Label>
                        <Input 
                            id="storeName" 
                            value={formData.storeName} 
                            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                            placeholder="Contoh: XenonPlay Gaming Center"
                            className="h-12 rounded-xl bg-muted/40 border-transparent font-bold text-lg"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest ml-1">Nomor WhatsApp</Label>
                            <Input 
                                id="phone" 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="08123456789"
                                className="h-11 rounded-xl bg-muted/40 border-transparent font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest ml-1">Alamat Singkat</Label>
                            <Input 
                                id="address" 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Jl. Raya No. 123, Kota"
                                className="h-11 rounded-xl bg-muted/40 border-transparent font-bold"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-4 flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={() => handleUndo('business')} disabled={!hasBusinessChanges || isSaving} className="font-bold text-[10px] uppercase gap-2">
                        <RotateCcw className="size-3" /> Urungkan
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasBusinessChanges || isSaving} className="font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-lg shadow-primary/20">
                        {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="printer" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="rounded-[2rem] border-primary/20 bg-primary/[0.01] overflow-hidden shadow-sm">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Konfigurasi Struk</CardTitle>
                            <CardDescription className="text-xs text-primary/60">Sesuaikan lebar kertas dan pesan khusus pada struk belanja.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ukuran Kertas Thermal</Label>
                                <Select 
                                    value={formData.receiptPaperSize} 
                                    onValueChange={(val) => setFormData({...formData, receiptPaperSize: val})}
                                >
                                    <SelectTrigger className="h-12 bg-background border-border rounded-xl font-bold">
                                        <SelectValue placeholder="Pilih ukuran" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="58mm" className="font-bold">58mm (Kecil - Standar)</SelectItem>
                                        <SelectItem value="80mm" className="font-bold">80mm (Besar / Wide)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pesan Header (Pembuka)</Label>
                                <Input 
                                    value={formData.receiptHeader}
                                    onChange={(e) => setFormData({...formData, receiptHeader: e.target.value})}
                                    placeholder="Selamat datang..."
                                    className="h-12 bg-background border-border rounded-xl font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pesan Footer (Penutup)</Label>
                                <Textarea 
                                    value={formData.receiptFooter}
                                    onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})}
                                    placeholder="Terima kasih..."
                                    className="min-h-[120px] bg-background border-border rounded-xl font-bold py-4 text-xs leading-relaxed"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t p-4 flex justify-end gap-3">
                            <Button variant="ghost" size="sm" onClick={() => handleUndo('printer')} disabled={!hasPrinterChanges || isSaving} className="font-bold text-[10px] uppercase gap-2">
                                <RotateCcw className="size-3" /> Urungkan
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={!hasPrinterChanges || isSaving} className="font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-lg shadow-primary/20">
                                {isSaving ? 'Menyimpan...' : 'Simpan Layout'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 sticky top-24">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border bg-muted/10 shadow-2xl">
                        <CardHeader className="bg-card border-b py-4">
                            <div className="flex items-center gap-2">
                                <Eye className="size-4 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Live Preview Nota</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex justify-center bg-slate-200/50">
                            <div 
                                className={cn(
                                    "bg-white text-black shadow-2xl p-5 font-mono text-[8px] leading-tight transition-all duration-500",
                                    formData.receiptPaperSize === '58mm' ? "w-[220px]" : "w-[300px]"
                                )}
                                style={{ minHeight: '420px' }}
                            >
                                <div className="text-center space-y-1 mb-4">
                                    <div className="flex justify-center mb-2">
                                        <Image 
                                            src="/xplogo-monochrome.png" 
                                            alt="Logo" 
                                            width={40} 
                                            height={40} 
                                            className="contrast-200"
                                        />
                                    </div>
                                    <div className="font-bold text-[10px] uppercase leading-none">{formData.storeName || 'NAMA TOKO'}</div>
                                    <div className="text-[7.5px] leading-tight opacity-70">{formData.address || 'Alamat Belum Diatur'}</div>
                                    <div className="text-[7.5px] mt-1">{formData.receiptHeader}</div>
                                </div>

                                <div className="border-t border-dashed border-black/30 my-2" />

                                <div className="flex justify-between text-[7px] opacity-80">
                                    <div className="space-y-0.5">
                                        <div>Nota : INV-PREVIEW</div>
                                        <div>Tgl  : 20/05/2026</div>
                                        <div>Jam  : 14:00</div>
                                    </div>
                                    <div className="text-right">
                                        <div>Kasir:</div>
                                        <div className="uppercase font-bold">ADMIN</div>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-black/30 my-2" />

                                <div className="space-y-3">
                                    <div>
                                        <div className="font-bold">1. CONTOH ITEM RENTAL</div>
                                        <div className="flex justify-between mt-0.5">
                                            <span>1 x Rp 25.000</span>
                                            <span>Rp 25.000</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">2. CONTOH ITEM FNB</div>
                                        <div className="flex justify-between mt-0.5">
                                            <span>2 x Rp 5.000</span>
                                            <span>Rp 10.000</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-black/30 my-2" />

                                <div className="space-y-1 text-[7.5px]">
                                    <div className="flex justify-between">
                                        <span>Total QTY : 3</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sub Total</span>
                                        <span className="font-bold">Rp 35.000</span>
                                    </div>
                                    <div className="flex justify-between font-black text-[9px] border-t border-black pt-1.5 mt-1.5">
                                        <span>TOTAL</span>
                                        <span>Rp 35.000</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Bayar (Cash)</span>
                                        <span>Rp 50.000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kembali</span>
                                        <span>Rp 15.000</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-black/30 my-4" />
                                
                                <div className="text-center whitespace-pre-wrap leading-relaxed text-[7.5px] italic">
                                    {formData.receiptFooter}
                                </div>

                                <div className="h-8" />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-card border-t py-3 flex justify-center">
                            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Visualisasi Kertas {formData.receiptPaperSize}</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="theme" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] border-border overflow-hidden shadow-sm max-w-3xl">
                <CardHeader className="bg-muted/20 border-b">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Preferensi Antarmuka</CardTitle>
                    <CardDescription className="text-xs">Kontrol tema aplikasi untuk seluruh perangkat operator dan monitor publik.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mode Tema Master</Label>
                            <Select 
                                value={formData.themeMode} 
                                onValueChange={(val: any) => setFormData({...formData, themeMode: val})}
                            >
                                <SelectTrigger className="h-12 bg-background border-border rounded-xl font-bold">
                                    <SelectValue placeholder="Pilih mode tema" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="light" className="font-bold">Selalu Mode Terang (Light)</SelectItem>
                                    <SelectItem value="dark" className="font-bold">Selalu Mode Gelap (Dark)</SelectItem>
                                    <SelectItem value="scheduled" className="font-bold text-primary">Otomatis Berdasarkan Jadwal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.themeMode === 'scheduled' && (
                            <div className="space-y-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 animate-in zoom-in-95">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Clock className="size-3" /> Atur Jam Transisi
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] uppercase font-black text-muted-foreground">Mulai Siang</Label>
                                        <Input 
                                            type="time" 
                                            value={formData.dayThemeStart} 
                                            onChange={(e) => setFormData({...formData, dayThemeStart: e.target.value})}
                                            className="bg-background h-10 rounded-xl font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] uppercase font-black text-muted-foreground">Mulai Malam</Label>
                                        <Input 
                                            type="time" 
                                            value={formData.nightThemeStart} 
                                            onChange={(e) => setFormData({...formData, nightThemeStart: e.target.value})}
                                            className="bg-background h-10 rounded-xl font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-4 flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={() => handleUndo('theme')} disabled={!hasThemeChanges || isSaving} className="font-bold text-[10px] uppercase gap-2">
                        <RotateCcw className="size-3" /> Urungkan
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasThemeChanges || isSaving} className="font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-lg shadow-primary/20">
                        {isSaving ? 'Menyimpan...' : 'Simpan Tema'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="danger" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] border-red-500/20 bg-red-500/[0.02] overflow-hidden shadow-sm max-w-4xl">
                <CardHeader className="bg-red-500/5 border-b border-red-500/10">
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-red-600 flex items-center gap-2">
                        <ShieldAlert className="size-5" /> Maintenance Data
                    </CardTitle>
                    <CardDescription className="text-xs text-red-500/70">Tindakan pembersihan data permanen. Hanya gunakan untuk audit tahunan atau reset sistem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                            <div className="flex gap-3">
                                <ReceiptText className="h-5 w-5 text-slate-400 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-xs uppercase text-foreground">Hapus Transaksi</h4>
                                    <p className="text-[9px] text-muted-foreground">Seluruh riwayat sewa & FnB.</p>
                                </div>
                            </div>
                            <ResetButton 
                                label="Reset" 
                                onConfirm={() => handleReset('transactions')} 
                                isLoading={isDeleting === 'transactions'} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                            <div className="flex gap-3">
                                <Wallet className="h-5 w-5 text-slate-400 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-xs uppercase text-foreground">Hapus Pengeluaran</h4>
                                    <p className="text-[9px] text-muted-foreground">Seluruh catatan operasional.</p>
                                </div>
                            </div>
                            <ResetButton 
                                label="Reset" 
                                onConfirm={() => handleReset('expenses')} 
                                isLoading={isDeleting === 'expenses'} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                            <div className="flex gap-3">
                                <History className="h-5 w-5 text-slate-400 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-xs uppercase text-foreground">Hapus Log Shift</h4>
                                    <p className="text-[9px] text-muted-foreground">Log audit buka/tutup kasir.</p>
                                </div>
                            </div>
                            <ResetButton 
                                label="Reset" 
                                onConfirm={() => handleReset('shifts')} 
                                isLoading={isDeleting === 'shifts'} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                            <div className="flex gap-3">
                                <Users className="h-5 w-5 text-slate-400 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-xs uppercase text-foreground">Hapus Member</h4>
                                    <p className="text-[9px] text-muted-foreground">Seluruh database pelanggan.</p>
                                </div>
                            </div>
                            <ResetButton 
                                label="Reset" 
                                onConfirm={() => handleReset('members')} 
                                isLoading={isDeleting === 'members'} 
                            />
                        </div>
                    </div>

                    <div className="mt-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase">
                            Peringatan: Reset data akan menghapus statistik pada Dashboard Laporan. Data Master (Unit TV & Daftar Harga) tetap aman.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResetButton({ label, onConfirm, isLoading }: { label: string, onConfirm: () => void, isLoading: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-9 px-4 font-black uppercase text-[9px] tracking-widest rounded-xl">
                    {isLoading ? '...' : label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-border bg-background">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-tight">
                        <AlertTriangle className="h-5 w-5" />
                        Konfirmasi Reset
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium">
                        Tindakan ini akan menghapus data tersebut secara **PERMANEN**. Data yang sudah dihapus tidak dapat dikembalikan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="font-bold uppercase text-[10px] rounded-xl border-border">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        className="bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}