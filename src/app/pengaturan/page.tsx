'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Store, Save, Trash2, AlertTriangle, ShieldAlert, CheckCircle2, History, Users, Wallet, ReceiptText, Palette, Clock } from 'lucide-react';
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
    nightThemeStart: '18:00'
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData({
          ...formData,
          ...currentSettings,
          themeMode: currentSettings.themeMode || 'light',
          dayThemeStart: currentSettings.dayThemeStart || '06:00',
          nightThemeStart: currentSettings.nightThemeStart || '18:00'
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
      <header className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
            <p className="text-muted-foreground mt-1">
            Kelola profil bisnis, tema visual, dan pembersihan basis data.
            </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 font-bold px-8 h-12 shadow-lg shadow-primary/20">
            {isSaving ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Semua Perubahan
        </Button>
      </header>

      <div className="grid gap-8">
        {/* PROFIL TOKO */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Store className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle>Profil Bisnis</CardTitle>
                    <CardDescription>Informasi ini akan muncul pada dashboard dan nota pelanggan.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nama Rental / Toko</Label>
              <Input 
                id="storeName" 
                value={formData.storeName} 
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                placeholder="Contoh: XenonPlay Gaming Center"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                    <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="08123456789"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Alamat Singkat</Label>
                    <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Jl. Raya No. 123, Kota"
                    />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* PENGATURAN TEMA TERPUSAT */}
        <Card className="border-primary/20 bg-primary/[0.01]">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Palette className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle>Tema & Identitas Visual</CardTitle>
                    <CardDescription>Kontrol tema aplikasi untuk seluruh perangkat operator dan monitor publik.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mode Tema Master</Label>
                    <Select 
                        value={formData.themeMode} 
                        onValueChange={(val: any) => setFormData({...formData, themeMode: val})}
                    >
                        <SelectTrigger className="h-12 bg-background border-border">
                            <SelectValue placeholder="Pilih mode tema" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Selalu Mode Terang (Light)</SelectItem>
                            <SelectItem value="dark">Selalu Mode Gelap (Dark)</SelectItem>
                            <SelectItem value="scheduled">Otomatis Berdasarkan Jadwal</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">
                        *Perangkat publik (TV/Monitor) akan mengikuti pengaturan ini secara otomatis.
                    </p>
                </div>

                {formData.themeMode === 'scheduled' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="size-3 text-primary" /> Atur Jam Transisi
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold">Mulai Mode Terang</Label>
                                <Input 
                                    type="time" 
                                    value={formData.dayThemeStart} 
                                    onChange={(e) => setFormData({...formData, dayThemeStart: e.target.value})}
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold">Mulai Mode Gelap</Label>
                                <Input 
                                    type="time" 
                                    value={formData.nightThemeStart} 
                                    onChange={(e) => setFormData({...formData, nightThemeStart: e.target.value})}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* ZONA BAHAYA */}
        <Card className="border-red-500/20 bg-red-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-3 text-red-500">
                <ShieldAlert className="h-5 w-5" />
                <div>
                    <CardTitle>Zona Bahaya (Reset Data)</CardTitle>
                    <CardDescription className="text-red-500/70">Tindakan di bawah ini tidak dapat dibatalkan. Berhati-hatilah.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* RESET TRANSAKSI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/10 bg-card shadow-sm">
                <div className="flex gap-3">
                    <ReceiptText className="h-5 w-5 text-slate-400 mt-1" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">Kosongkan Riwayat Transaksi</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/10 bg-card shadow-sm">
                <div className="flex gap-3">
                    <Wallet className="h-5 w-5 text-slate-400 mt-1" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">Kosongkan Biaya Pengeluaran</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/10 bg-card shadow-sm">
                <div className="flex gap-3">
                    <History className="h-5 w-5 text-slate-400 mt-1" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">Kosongkan Riwayat Shift</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/10 bg-card shadow-sm">
                <div className="flex gap-3">
                    <Users className="h-5 w-5 text-slate-400 mt-1" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">Hapus Seluruh Data Member</h4>
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
    </div>
  );
}

function ResetButton({ label, onConfirm, isLoading }: { label: string, onConfirm: () => void, isLoading: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2 h-9 font-bold text-[10px] uppercase tracking-widest">
                    <Trash2 className="h-3.5 w-3.5" />
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500 font-black uppercase tracking-tight">
                        <AlertTriangle className="h-5 w-5" />
                        Konfirmasi Penghapusan
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini akan menghapus data tersebut secara **PERMANEN** dari server. Data yang sudah dihapus tidak dapat dikembalikan dengan cara apapun.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        className="bg-red-600 hover:bg-red-700 font-bold"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sedang Menghapus...' : 'Ya, Hapus Selamanya'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
