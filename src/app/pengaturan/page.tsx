'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Store, Save, Trash2, AlertTriangle, ShieldAlert, CheckCircle2, History, Users, Wallet, ReceiptText, Palette, Clock, Printer, FileText, Eye } from 'lucide-react';
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
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';

export default function PengaturanPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
  const { data: currentSettings, isLoading } = useDoc<GeneralSettings>(settingsRef);

  const [formData, setFormData] = useState<GeneralSettings>({
    storeName: 'XenonPlay Manager',
    address: '',
    phone: '',
    themeMode: 'light',
    dayThemeStart: '06:00',
    nightThemeStart: '18:00',
    receiptPaperSize: '58mm',
    receiptHeader: 'Selamat datang di toko kami',
    receiptFooter: 'Terima kasih telah berkunjung!'
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData({
          ...formData,
          ...currentSettings,
          themeMode: currentSettings.themeMode || 'light',
          dayThemeStart: currentSettings.dayThemeStart || '06:00',
          nightThemeStart: currentSettings.nightThemeStart || '18:00',
          receiptPaperSize: currentSettings.receiptPaperSize || '58mm',
          receiptHeader: currentSettings.receiptHeader || 'Selamat datang di toko kami',
          receiptFooter: currentSettings.receiptFooter || 'Terimakasih Telah Bermain\n"Good Game, Well Played"'
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
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Pengaturan <span className="text-primary">Sistem</span></h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
            Kelola profil bisnis, tema visual, dan pembersihan basis data.
            </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 font-black uppercase tracking-widest px-8 h-12 shadow-lg shadow-primary/20 rounded-xl">
            {isSaving ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Semua Perubahan
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-8">
            {/* PROFIL TOKO */}
            <Card className="rounded-[2rem] overflow-hidden border-border shadow-sm">
                <CardHeader className="bg-muted/20 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Store className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Profil Bisnis</CardTitle>
                        <CardDescription className="text-xs">Informasi ini akan muncul pada dashboard dan nota pelanggan.</CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Rental / Toko</Label>
                    <Input 
                    id="storeName" 
                    value={formData.storeName} 
                    onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    placeholder="Contoh: XenonPlay Gaming Center"
                    className="h-11 rounded-xl bg-muted/40 border-transparent font-bold"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest ml-1">Nomor Telepon / WhatsApp</Label>
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
            </Card>

            {/* PENGATURAN PRINTER & NOTA */}
            <Card className="rounded-[2rem] border-primary/20 bg-primary/[0.01] overflow-hidden shadow-sm">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Printer className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Printer & Desain Nota</CardTitle>
                        <CardDescription className="text-xs text-primary/60">Sesuaikan lebar kertas dan pesan pada struk belanja.</CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <p className="text-[9px] text-muted-foreground italic leading-relaxed px-1">
                            *Pastikan pengaturan printer di komputer Anda juga sesuai dengan ukuran ini.
                        </p>
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
                            className="min-h-[100px] bg-background border-border rounded-xl font-bold py-3 text-xs"
                        />
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* PENGATURAN TEMA TERPUSAT */}
            <Card className="rounded-[2rem] border-border overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/20 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 text-white">
                        <Palette className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Tema & Identitas Visual</CardTitle>
                        <CardDescription className="text-xs">Kontrol tema aplikasi untuk seluruh perangkat operator dan monitor publik.</CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
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
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                                <Clock className="size-3 text-primary" /> Atur Jam Transisi
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Mulai Mode Terang</Label>
                                    <Input 
                                        type="time" 
                                        value={formData.dayThemeStart} 
                                        onChange={(e) => setFormData({...formData, dayThemeStart: e.target.value})}
                                        className="bg-background h-11 rounded-xl font-mono font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Mulai Mode Gelap</Label>
                                    <Input 
                                        type="time" 
                                        value={formData.nightThemeStart} 
                                        onChange={(e) => setFormData({...formData, nightThemeStart: e.target.value})}
                                        className="bg-background h-11 rounded-xl font-mono font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </CardContent>
            </Card>

            {/* ZONA BAHAYA */}
            <Card className="rounded-[2rem] border-red-500/20 bg-red-500/[0.02] overflow-hidden shadow-sm">
                <CardHeader className="bg-red-500/5 border-b border-red-500/10">
                <div className="flex items-center gap-3 text-red-500">
                    <ShieldAlert className="h-5 w-5" />
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Zona Bahaya (Reset Data)</CardTitle>
                        <CardDescription className="text-xs text-red-500/70">Tindakan di bawah ini tidak dapat dibatalkan. Berhati-hatilah.</CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                
                {/* RESET TRANSAKSI */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                    <div className="flex gap-3">
                        <ReceiptText className="h-5 w-5 text-slate-400 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase text-foreground">Kosongkan Riwayat Transaksi</h4>
                            <p className="text-[10px] text-muted-foreground">Menghapus seluruh catatan penjualan sewa dan FnB.</p>
                        </div>
                    </div>
                    <ResetButton 
                        label="Hapus Transaksi" 
                        onConfirm={() => handleReset('transactions')} 
                        isLoading={isDeleting === 'transactions'} 
                    />
                </div>

                {/* RESET PENGELUARAN */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                    <div className="flex gap-3">
                        <Wallet className="h-5 w-5 text-slate-400 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase text-foreground">Kosongkan Biaya Pengeluaran</h4>
                            <p className="text-[10px] text-muted-foreground">Menghapus seluruh catatan uang keluar / biaya operasional.</p>
                        </div>
                    </div>
                    <ResetButton 
                        label="Hapus Pengeluaran" 
                        onConfirm={() => handleReset('expenses')} 
                        isLoading={isDeleting === 'expenses'} 
                    />
                </div>

                {/* RESET SHIFT */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                    <div className="flex gap-3">
                        <History className="h-5 w-5 text-slate-400 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase text-foreground">Kosongkan Riwayat Shift</h4>
                            <p className="text-[10px] text-muted-foreground">Menghapus log audit buka/tutup kasir dari awal.</p>
                        </div>
                    </div>
                    <ResetButton 
                        label="Hapus Log Shift" 
                        onConfirm={() => handleReset('shifts')} 
                        isLoading={isDeleting === 'shifts'} 
                    />
                </div>

                {/* RESET MEMBER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/10 bg-card shadow-sm">
                    <div className="flex gap-3">
                        <Users className="h-5 w-5 text-slate-400 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase text-foreground">Hapus Seluruh Data Member</h4>
                            <p className="text-[10px] text-muted-foreground">Menghapus semua pelanggan terdaftar dan akumulasi poin mereka.</p>
                        </div>
                    </div>
                    <ResetButton 
                        label="Hapus Semua Member" 
                        onConfirm={() => handleReset('members')} 
                        isLoading={isDeleting === 'members'} 
                    />
                </div>

                <div className="flex items-start gap-2 text-[10px] text-muted-foreground italic px-2 pt-2">
                    <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                    <p>Menghapus data operasional tidak akan memengaruhi data Master (Stasiun, Harga, atau Produk FnB). Sistem akan tetap siap digunakan untuk transaksi baru.</p>
                </div>
                </CardContent>
            </Card>
        </div>

        {/* LIVE PREVIEW NOTA */}
        <div className="lg:col-span-4 sticky top-24">
            <Card className="rounded-[2rem] overflow-hidden border-border bg-muted/10 shadow-lg">
                <CardHeader className="bg-card border-b py-4">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Live Preview Nota</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex justify-center bg-slate-200/50">
                    {/* SIMULASI KERTAS THERMAL */}
                    <div 
                        className={cn(
                            "bg-white text-black shadow-2xl p-4 font-mono text-[9px] leading-tight transition-all duration-500",
                            formData.receiptPaperSize === '58mm' ? "w-[220px]" : "w-[300px]"
                        )}
                        style={{ minHeight: '400px' }}
                    >
                        <div className="text-center space-y-1 mb-3">
                            <div className="flex justify-center mb-1">
                                <Image 
                                    src="/xenonplay-logo.png" 
                                    alt="Logo" 
                                    width={40} 
                                    height={40} 
                                    className="grayscale contrast-125 brightness-75"
                                />
                            </div>
                            <div className="font-bold text-[10px] uppercase">{formData.storeName || 'NAMA TOKO'}</div>
                            <div className="text-[8px] leading-tight">{formData.address || 'Alamat Belum Diisi'}</div>
                            <div className="text-[8px]">{formData.receiptHeader}</div>
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="flex justify-between">
                            <div className="space-y-0.5">
                                <div>Nota : INV-SAMPLE</div>
                                <div>Tgl  : 20/05/2026</div>
                                <div>Jam  : 14:00</div>
                            </div>
                            <div className="text-right">
                                <div>Kasir:</div>
                                <div className="uppercase">ADMIN</div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="space-y-3">
                            <div>
                                <div className="font-bold">1. CONTOH ITEM RENTAL</div>
                                <div className="flex justify-between">
                                    <span>1 x Rp 25.000</span>
                                    <span>Rp 25.000</span>
                                </div>
                            </div>
                            <div>
                                <div className="font-bold">2. CONTOH ITEM FNB</div>
                                <div className="flex justify-between">
                                    <span>2 x Rp 5.000</span>
                                    <span>Rp 10.000</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Total QTY : 3</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sub Total</span>
                                <span>Rp 35.000</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Diskon</span>
                                <span>-Rp 5.000</span>
                            </div>
                            <div className="flex justify-between font-bold text-[10px] border-t border-black pt-1 mt-1">
                                <span>TOTAL</span>
                                <span>Rp 30.000</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Bayar (Cash)</span>
                                <span>Rp 50.000</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembali</span>
                                <span>Rp 20.000</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-black my-4" />
                        
                        <div className="text-center whitespace-pre-wrap leading-relaxed text-[8px]">
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
    </div>
  );
}

function ResetButton({ label, onConfirm, isLoading }: { label: string, onConfirm: () => void, isLoading: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2 h-9 font-black uppercase text-[10px] tracking-widest rounded-xl">
                    <Trash2 className="h-3.5 w-3.5" />
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-border bg-background">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-tight">
                        <AlertTriangle className="h-5 w-5" />
                        Konfirmasi Penghapusan
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium">
                        Tindakan ini akan menghapus data tersebut secara **PERMANEN** dari server. Data yang sudah dihapus tidak dapat dikembalikan dengan cara apapun.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="font-bold uppercase text-[10px] rounded-xl border-border">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        className="bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sedang Menghapus...' : 'Ya, Hapus Selamanya'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
