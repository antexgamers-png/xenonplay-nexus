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
    RotateCcw,
    Type,
    Bold,
    Wifi,
    Ticket,
    CheckCircle2
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
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';

const DEFAULT_FORM_DATA: GeneralSettings = {
  storeName: 'XenonPlay Manager',
  address: '',
  phone: '',
  themeMode: 'light',
  dayThemeStart: '06:00',
  nightThemeStart: '18:00',
  
  // Nota Default
  receiptPaperSize: '58mm',
  receiptHeader: 'Selamat datang di toko kami',
  receiptFooter: 'Terima kasih telah berkunjung!',
  receiptFontSize: 12,
  receiptFontWeight: '500',
  receiptFontFamily: 'sans',
  receiptShowLogo: true,
  receiptShowStoreName: true,
  receiptShowAddress: true,
  receiptShowFooter: true,

  // Kupon Default
  couponPaperSize: '58mm',
  couponFooter: 'Simpan kode ini dengan baik.',
  couponFontSize: 12,
  couponFontWeight: '500',
  couponFontFamily: 'mono',
  couponShowLogo: true,
  couponShowStoreName: true,
  couponShowAddress: false,
  couponShowFooter: true,

  wifiInstructions: '1. Hubungkan ke Wi-Fi kami\n2. Masukkan kode voucher di atas\n3. Selesai!'
};

const FONT_WEIGHT_OPTIONS = [
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Tebal (Bold)' },
    { value: '800', label: 'Sangat Tebal' },
    { value: '900', label: 'Hitam (Black)' },
];

const FONT_FAMILY_OPTIONS = [
    { value: 'sans', label: 'Modern (Sans)' },
    { value: 'mono', label: 'Classic (Mono)' },
    { value: 'serif', label: 'Elegant (Serif)' },
];

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

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-[300px]" /><Skeleton className="h-[400px] w-full" /></div>;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 lg:px-0">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-lg bg-primary/10 text-primary"><Settings2 className="size-4" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Configuration</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Pengaturan <span className="text-primary">Umum</span></h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/30 gap-2">
            {isSaving ? <RotateCcw className="size-4 animate-spin" /> : <Save className="size-4" />}
            Simpan Seluruh Pengaturan
        </Button>
      </header>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-14 rounded-[1.5rem] mb-8 border flex w-full sm:w-fit overflow-x-auto shadow-inner">
            <TabsTrigger value="business" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6"><Store className="size-3.5" /> Profil Bisnis</TabsTrigger>
            <TabsTrigger value="printer" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6"><Printer className="size-3.5" /> Layout Struk & Kupon</TabsTrigger>
            <TabsTrigger value="theme" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-primary px-6"><Palette className="size-3.5" /> Tema Visual</TabsTrigger>
            <TabsTrigger value="danger" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:text-red-500 px-6"><ShieldAlert className="size-3.5" /> Zona Bahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] overflow-hidden border-border shadow-sm max-w-3xl">
                <CardHeader className="bg-muted/20 border-b"><CardTitle className="text-lg font-black uppercase tracking-tight">Identitas Toko</CardTitle><CardDescription className="text-xs">Informasi ini akan muncul pada dashboard dan nota pelanggan.</CardDescription></CardHeader>
                <CardContent className="space-y-6 pt-8">
                    <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Rental / Toko</Label>
                        <Input id="storeName" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="h-12 rounded-xl bg-muted/40 border-transparent font-bold text-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest ml-1">Nomor WhatsApp</Label>
                            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11 rounded-xl bg-muted/40 border-transparent font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest ml-1">Alamat Singkat</Label>
                            <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="h-11 rounded-xl bg-muted/40 border-transparent font-bold" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="printer" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Tabs defaultValue="receipt_mode" className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6 border w-full sm:w-fit">
                            <TabsTrigger value="receipt_mode" className="rounded-lg font-bold uppercase text-[9px] tracking-widest gap-2">
                                <ReceiptText className="size-3" /> Nota (Rental/FnB)
                            </TabsTrigger>
                            <TabsTrigger value="coupon_mode" className="rounded-lg font-bold uppercase text-[9px] tracking-widest gap-2">
                                <Ticket className="size-3" /> Kupon Wi-Fi
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="receipt_mode" className="space-y-6">
                            <Card className="rounded-[2rem] border-primary/20 overflow-hidden shadow-sm">
                                <CardHeader className="bg-primary/5 border-b border-primary/10">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <ReceiptText className="size-4 text-primary" /> Pengaturan Nota Transaksi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Layout Elements Toggles */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { id: 'receiptShowLogo', label: 'Tampilkan Logo', icon: Store },
                                            { id: 'receiptShowStoreName', label: 'Nama Toko', icon: Type },
                                            { id: 'receiptShowAddress', label: 'Alamat', icon: Store },
                                            { id: 'receiptShowFooter', label: 'Footer', icon: History },
                                        ].map(item => (
                                            <div key={item.id} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                                <item.icon className="size-4 text-muted-foreground" />
                                                <Label className="text-[9px] font-black uppercase tracking-widest">{item.label}</Label>
                                                <Switch 
                                                    checked={!!(formData as any)[item.id]} 
                                                    onCheckedChange={(val) => setFormData({...formData, [item.id]: val})} 
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Kertas</Label>
                                            <Select value={formData.receiptPaperSize} onValueChange={(val) => setFormData({...formData, receiptPaperSize: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl"><SelectItem value="58mm">58mm</SelectItem><SelectItem value="80mm">80mm</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Font Size (px)</Label>
                                            <Input type="number" value={formData.receiptFontSize} onChange={(e) => setFormData({...formData, receiptFontSize: parseInt(e.target.value) || 12})} className="h-11 rounded-xl bg-background font-bold" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Tipe Font</Label>
                                            <Select value={formData.receiptFontFamily} onValueChange={(val: any) => setFormData({...formData, receiptFontFamily: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">{FONT_FAMILY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Ketebalan</Label>
                                            <Select value={formData.receiptFontWeight} onValueChange={(val) => setFormData({...formData, receiptFontWeight: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">{FONT_WEIGHT_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Pesan Footer</Label>
                                        <Textarea value={formData.receiptFooter} onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})} className="min-h-[80px] bg-background rounded-xl font-bold text-xs" />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="coupon_mode" className="space-y-6">
                            <Card className="rounded-[2rem] border-amber-500/20 overflow-hidden shadow-sm">
                                <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <Ticket className="size-4 text-amber-600" /> Pengaturan Kupon Wi-Fi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Layout Elements Toggles */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { id: 'couponShowLogo', label: 'Tampilkan Logo', icon: Store },
                                            { id: 'couponShowStoreName', label: 'Nama Toko', icon: Type },
                                            { id: 'couponShowAddress', label: 'Alamat', icon: Store },
                                            { id: 'couponShowFooter', label: 'Footer', icon: History },
                                        ].map(item => (
                                            <div key={item.id} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                                <item.icon className="size-4 text-muted-foreground" />
                                                <Label className="text-[9px] font-black uppercase tracking-widest">{item.label}</Label>
                                                <Switch 
                                                    checked={!!(formData as any)[item.id]} 
                                                    onCheckedChange={(val) => setFormData({...formData, [item.id]: val})} 
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Kertas</Label>
                                            <Select value={formData.couponPaperSize} onValueChange={(val) => setFormData({...formData, couponPaperSize: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl"><SelectItem value="58mm">58mm</SelectItem><SelectItem value="80mm">80mm</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Font Size (px)</Label>
                                            <Input type="number" value={formData.couponFontSize} onChange={(e) => setFormData({...formData, couponFontSize: parseInt(e.target.value) || 12})} className="h-11 rounded-xl bg-background font-bold" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Tipe Font</Label>
                                            <Select value={formData.couponFontFamily} onValueChange={(val: any) => setFormData({...formData, couponFontFamily: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">{FONT_FAMILY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Ketebalan</Label>
                                            <Select value={formData.couponFontWeight} onValueChange={(val) => setFormData({...formData, couponFontWeight: val})}>
                                                <SelectTrigger className="h-11 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">{FONT_WEIGHT_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Wifi className="size-3 text-primary" /> Panduan Koneksi Wi-Fi</Label>
                                        <Textarea value={formData.wifiInstructions} onChange={(e) => setFormData({...formData, wifiInstructions: e.target.value})} className="min-h-[100px] bg-background border-primary/20 rounded-xl font-bold py-4 text-xs leading-relaxed" />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-4 sticky top-24">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border bg-muted/10 shadow-2xl">
                        <CardHeader className="bg-card border-b py-4">
                            <div className="flex items-center gap-2"><Eye className="size-4 text-primary" /><CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Live Preview Simulator</CardTitle></div>
                        </CardHeader>
                        <CardContent className="p-8 flex justify-center bg-slate-200/50 min-h-[500px]">
                            <div 
                                className={cn(
                                    "bg-[#fffdf5] text-black shadow-2xl p-6 transition-all duration-500 relative", 
                                    formData.receiptPaperSize === '58mm' ? "w-[220px]" : "w-[280px]"
                                )} 
                                style={{ 
                                    minHeight: '400px', 
                                    fontSize: `${formData.receiptFontSize}px`, 
                                    fontWeight: formData.receiptFontWeight,
                                    fontFamily: formData.receiptFontFamily === 'mono' ? "'Courier New', monospace" : formData.receiptFontFamily === 'serif' ? "Georgia, serif" : "Inter, sans-serif"
                                }}
                            >
                                {formData.receiptShowLogo && (
                                    <div className="flex justify-center mb-4 opacity-50 grayscale">
                                        <Image src="/xenonplay-logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                                    </div>
                                )}
                                {formData.receiptShowStoreName && (
                                    <div className="text-center font-black uppercase mb-1" style={{ fontSize: '1.2em' }}>{formData.storeName}</div>
                                )}
                                {formData.receiptShowAddress && (
                                    <div className="text-center opacity-60 mb-2" style={{ fontSize: '0.8em' }}>{formData.address}</div>
                                )}
                                
                                <div className="border-t border-dashed border-black/30 my-4" />
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center" style={{ fontSize: '0.9em' }}>
                                        <span className="font-bold uppercase">CONTOH ITEM x1</span>
                                        <span className="font-mono">10.000</span>
                                    </div>
                                    <div className="border-t border-black/10 pt-4 flex justify-between items-end">
                                        <span className="font-black uppercase text-[0.8em]">TOTAL</span>
                                        <span className="font-black" style={{ fontSize: '1.4em' }}>10.000</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-black/30 my-4" />
                                
                                {formData.receiptShowFooter && (
                                    <div className="text-center opacity-50 italic" style={{ fontSize: '0.8em' }}>{formData.receiptFooter}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="theme" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] border-border overflow-hidden shadow-sm max-w-3xl">
                <CardHeader className="bg-muted/20 border-b"><CardTitle className="text-lg font-black uppercase tracking-tight">Preferensi Antarmuka</CardTitle></CardHeader>
                <CardContent className="space-y-8 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Mode Tema Master</Label>
                            <Select value={formData.themeMode} onValueChange={(val: any) => setFormData({...formData, themeMode: val})}><SelectTrigger className="h-12 bg-background rounded-xl font-bold"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="light">Mode Terang (Light)</SelectItem><SelectItem value="dark">Mode Gelap (Dark)</SelectItem><SelectItem value="scheduled" className="text-primary">Jadwal Otomatis</SelectItem></SelectContent></Select>
                        </div>
                        {formData.themeMode === 'scheduled' && (
                            <div className="space-y-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 animate-in zoom-in-95">
                                <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Clock className="size-3" /> Jam Transisi</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><Label className="text-[8px] uppercase">Mulai Siang</Label><Input type="time" value={formData.dayThemeStart} onChange={(e) => setFormData({...formData, dayThemeStart: e.target.value})} className="h-10 rounded-xl font-mono font-bold" /></div>
                                    <div className="space-y-1.5"><Label className="text-[8px] uppercase">Mulai Malam</Label><Input type="time" value={formData.nightThemeStart} onChange={(e) => setFormData({...formData, nightThemeStart: e.target.value})} className="h-10 rounded-xl font-mono font-bold" /></div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="danger" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-[2rem] border-red-500/20 bg-red-500/[0.02] overflow-hidden shadow-sm max-w-4xl">
                <CardHeader className="bg-red-500/5 border-b border-red-500/10"><CardTitle className="text-lg font-black uppercase text-red-600 flex items-center gap-2"><ShieldAlert className="size-5" /> Maintenance Data</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm"><div className="flex gap-3"><ReceiptText className="h-5 w-5 text-slate-400 mt-1" /><div className="space-y-1"><h4 className="font-bold text-xs uppercase">Transaksi</h4><p className="text-[9px] text-muted-foreground">Sewa, Wi-Fi & FnB.</p></div></div><ResetButton label="Reset" onConfirm={() => handleReset('transactions')} isLoading={isDeleting === 'transactions'} /></div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm"><div className="flex gap-3"><Wallet className="h-5 w-5 text-slate-400 mt-1" /><div className="space-y-1"><h4 className="font-bold text-xs uppercase">Biaya</h4><p className="text-[9px] text-muted-foreground">Catatan operasional.</p></div></div><ResetButton label="Reset" onConfirm={() => handleReset('expenses')} isLoading={isDeleting === 'expenses'} /></div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm"><div className="flex gap-3"><History className="h-5 w-5 text-slate-400 mt-1" /><div className="space-y-1"><h4 className="font-bold text-xs uppercase">Audit Shift</h4><p className="text-[9px] text-muted-foreground">Log buka/tutup laci.</p></div></div><ResetButton label="Reset" onConfirm={() => handleReset('shifts')} isLoading={isDeleting === 'shifts'} /></div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm"><div className="flex gap-3"><Users className="h-5 w-5 text-slate-400 mt-1" /><div className="space-y-1"><h4 className="font-bold text-xs uppercase">Member</h4><p className="text-[9px] text-muted-foreground">Seluruh data Sultan.</p></div></div><ResetButton label="Reset" onConfirm={() => handleReset('members')} isLoading={isDeleting === 'members'} /></div>
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
            <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="h-9 px-4 font-black uppercase text-[9px] tracking-widest rounded-xl">{isLoading ? '...' : label}</Button></AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-border bg-background"><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-tight"><AlertTriangle className="h-5 w-5" /> Konfirmasi Reset</AlertDialogTitle><AlertDialogDescription className="text-sm font-medium">Tindakan ini akan menghapus data tersebut secara PERMANEN.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="font-bold uppercase text-[10px] rounded-xl border-border">Batal</AlertDialogCancel><AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest rounded-xl" disabled={isLoading}>{isLoading ? 'Menghapus...' : 'Ya, Hapus Sekarang'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
    );
}