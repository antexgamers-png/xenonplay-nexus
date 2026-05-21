'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Save, Play, Square, Moon, Info, RefreshCw } from 'lucide-react';
import type { SessionSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SessionSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'session') : null, [firestore]);
  const { data: currentSettings, isLoading } = useDoc<SessionSettings>(settingsRef);

  const [formData, setFormData] = useState<SessionSettings>({
    enableAutoWake: true,
    enableAutoHdmi: true,
    enableResetOnEnd: true,
    resetDelay: 5,
    enableAutoLanding: false,
    enableAutoSleep: true,
    autoSleepDelay: 30,
    landingUrl: 'https://xenonplay.web.app/tv-landing'
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'settings', 'session'), formData);
      toast({
        title: 'Sukses',
        description: 'Pengaturan alur sesi berhasil diperbarui.',
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alur Otomatisasi Sesi</h1>
          <p className="text-muted-foreground mt-1">
            Atur apa yang dilakukan TV secara otomatis saat sesi dimulai atau berakhir.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </header>

      <Alert className="bg-blue-500/5 border-blue-500/50">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-500 font-bold">Sinkronisasi Otomatis (Live Sync)</AlertTitle>
        <AlertDescription className="text-xs">
          Jika Anda menggunakan Laptop Bridge <b>v9.0.0+</b>, perubahan durasi atau URL di sini akan langsung diterapkan ke laptop kasir secara real-time tanpa perlu memperbarui script atau restart aplikasi bridge.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* START SESSION FLOW */}
        <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <Play className="h-5 w-5" />
              Alur Mulai Sesi (Start)
            </CardTitle>
            <CardDescription>Perintah yang dikirim saat tombol "Mulai Sesi" diklik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Bangunkan TV (Auto Wake)</Label>
                <p className="text-sm text-muted-foreground">Kirim perintah Power On/Wake Up ke TV.</p>
              </div>
              <Switch 
                checked={formData.enableAutoWake} 
                onCheckedChange={(val) => setFormData({...formData, enableAutoWake: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Pindah ke HDMI (Auto Switch)</Label>
                <p className="text-sm text-muted-foreground">Otomatis pindah ke input PS3/PS4/PS5 sesuai tipe stasiun.</p>
              </div>
              <Switch 
                checked={formData.enableAutoHdmi} 
                onCheckedChange={(val) => setFormData({...formData, enableAutoHdmi: val})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* END SESSION FLOW */}
        <Card className="border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Square className="h-5 w-5" />
              Alur Selesai Sesi (End)
            </CardTitle>
            <CardDescription>Perintah yang dikirim saat waktu habis atau tombol "Stop Sesi" diklik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Reset TV (Sleep-Wake)</Label>
                <p className="text-sm text-muted-foreground">Tidurkan TV sejenak lalu bangunkan kembali untuk menyegarkan tampilan.</p>
              </div>
              <Switch 
                checked={formData.enableResetOnEnd} 
                onCheckedChange={(val) => setFormData({...formData, enableResetOnEnd: val})} 
              />
            </div>
            {formData.enableResetOnEnd && (
               <div className="pl-6 pt-2 space-y-2 border-l-2 border-amber-500/30">
                  <Label>Delay Reset (Detik)</Label>
                  <Input 
                    type="number"
                    value={formData.resetDelay} 
                    onChange={(e) => setFormData({...formData, resetDelay: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-muted-foreground italic">TV akan ditidurkan selama ini sebelum dibangunkan kembali.</p>
               </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Buka Landing Page</Label>
                <p className="text-sm text-muted-foreground">Arahkan TV ke halaman promosi/iklan. Jika mati, akan diarahkan ke Home.</p>
              </div>
              <Switch 
                checked={formData.enableAutoLanding} 
                onCheckedChange={(val) => setFormData({...formData, enableAutoLanding: val})} 
              />
            </div>
            {formData.enableAutoLanding && (
               <div className="pl-6 pt-2 space-y-2 border-l-2 border-amber-500/30">
                  <Label>URL Landing Page</Label>
                  <Input 
                    value={formData.landingUrl} 
                    onChange={(e) => setFormData({...formData, landingUrl: e.target.value})}
                    placeholder="https://..."
                  />
               </div>
            )}
          </CardContent>
        </Card>

        {/* POWER SAVING */}
        <Card className="border-blue-500/20 bg-blue-500/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-500">
              <Moon className="h-5 w-5" />
              Penghematan Daya (Sleep)
            </CardTitle>
            <CardDescription>Manajemen TV saat kondisi idle setelah alur Selesai Sesi selesai.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Tidurkan TV Otomatis (Auto Sleep)</Label>
                <p className="text-sm text-muted-foreground">Menidurkan TV jika tidak ada aktivitas dalam waktu tertentu setelah sesi berakhir.</p>
              </div>
              <Switch 
                checked={formData.enableAutoSleep} 
                onCheckedChange={(val) => setFormData({...formData, enableAutoSleep: val})} 
              />
            </div>
            {formData.enableAutoSleep && (
               <div className="pl-6 pt-2 space-y-2 border-l-2 border-blue-500/30">
                  <Label>Delay Auto-Sleep (Detik)</Label>
                  <Input 
                    type="number"
                    value={formData.autoSleepDelay} 
                    onChange={(e) => setFormData({...formData, autoSleepDelay: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-muted-foreground italic">Sistem akan menunggu selama ini sebelum mengirim sinyal Power Off akhir.</p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
