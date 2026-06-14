'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
    LayoutTemplate, 
    Save, 
    Plus, 
    Trash2, 
    Monitor, 
    Coffee, 
    Wifi, 
    Star, 
    Gamepad2, 
    Zap, 
    ArrowRight,
    Play,
    Send,
    Instagram,
    MessageCircle,
    Music,
    MapPin,
    Navigation
} from 'lucide-react';
import type { LandingSettings, LandingFacility } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { saveLandingSettings } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ICON_OPTIONS = [
    { value: 'Monitor', icon: Monitor },
    { value: 'Coffee', icon: Coffee },
    { value: 'Wifi', icon: Wifi },
    { value: 'Star', icon: Star },
    { value: 'Gamepad2', icon: Gamepad2 },
    { value: 'Zap', icon: Zap },
    { value: 'ArrowRight', icon: ArrowRight },
    { value: 'Play', icon: Play },
    { value: 'Send', icon: Send },
    { value: 'Instagram', icon: Instagram },
    { value: 'MessageCircle', icon: MessageCircle },
    { value: 'Music', icon: Music },
];

const DEFAULT_SETTINGS: LandingSettings = {
    heroHeadline: 'Nongkrong Sultan, Harga Teman.',
    heroSubHeadline: 'Nikmati atmosfer pro-gaming sesungguhnya dengan TV 4K HDR, Full AC, dan Sofa Sultan yang super nyaman.',
    ctaText: 'Gas Mabar!',
    ctaLink: '#live',
    ctaIcon: 'Gamepad2',
    facilities: [
        { icon: 'Monitor', title: 'Visual 4K HDR', description: 'Gambar Super Jernih' },
        { icon: 'Coffee', title: 'Menu Kantin', description: 'Amunisi Mabar' },
        { icon: 'Wifi', title: 'Koneksi Kilat', description: 'Anti-Lag' },
        { icon: 'Star', title: 'Sofa Sultan', description: 'Kenyamanan Maksimal' }
    ],
    whatsapp: '',
    instagram: '',
    tiktok: '',
    address: 'Jl. Raya Utama No. 123, Kota Pusat',
    googleMapsEmbedUrl: '',
    latitude: '',
    longitude: ''
};

export default function LandingEditorPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'landing') : null, [firestore]);
  const { data: currentSettings, isLoading } = useDoc<LandingSettings>(settingsRef);

  const [formData, setFormData] = useState<LandingSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (currentSettings) {
      setFormData(prev => ({
          ...DEFAULT_SETTINGS,
          ...currentSettings,
          facilities: currentSettings.facilities || DEFAULT_SETTINGS.facilities || []
      }));
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await saveLandingSettings(firestore, formData);
      toast({ title: 'Berhasil', description: 'Konten beranda diperbarui.', variant: 'success' });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Gagal menyimpan konten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFacility = () => {
      setFormData({
          ...formData,
          facilities: [...(formData.facilities || []), { icon: 'Star', title: 'Fasilitas Baru', description: 'Deskripsi singkat' }]
      });
  };

  const handleRemoveFacility = (index: number) => {
      setFormData({
          ...formData,
          facilities: (formData.facilities || []).filter((_, i) => i !== index)
      });
  };

  const updateFacility = (index: number, field: keyof LandingFacility, value: string) => {
      const newFacilities = [...(formData.facilities || [])];
      newFacilities[index] = { ...newFacilities[index], [field]: value };
      setFormData({ ...formData, facilities: newFacilities });
  };

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-64"/><Skeleton className="h-96 w-full"/></div>;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <LayoutTemplate className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Content Management</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Editor <span className="text-primary">Beranda</span></h1>
            <p className="text-muted-foreground text-sm">Kelola teks dan visual halaman utama XenonPlay.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/30">
            {isSaving ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Perubahan
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Hero Section</CardTitle>
                      <CardDescription>Bagian penyambutan utama di atas halaman.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label>Headline Utama</Label>
                          <Input 
                            value={formData.heroHeadline} 
                            onChange={(e) => setFormData({...formData, heroHeadline: e.target.value})}
                            placeholder="Contoh: Nongkrong Sultan, Harga Teman."
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Sub-Headline</Label>
                          <Input 
                            value={formData.heroSubHeadline} 
                            onChange={(e) => setFormData({...formData, heroSubHeadline: e.target.value})}
                            placeholder="Penjelasan singkat di bawah headline..."
                          />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>Teks Tombol (CTA)</Label>
                              <Input 
                                value={formData.ctaText} 
                                onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                                placeholder="Gas Mabar!"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label>Link Tujuan Tombol</Label>
                              <Input 
                                value={formData.ctaLink} 
                                onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                                placeholder="#live atau https://wa.me/..."
                              />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                              <Label>Ikon Tombol</Label>
                              <Select value={formData.ctaIcon} onValueChange={(val) => setFormData({...formData, ctaIcon: val})}>
                                  <SelectTrigger>
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {ICON_OPTIONS.map(opt => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                              <div className="flex items-center gap-2">
                                                  <opt.icon className="size-4" />
                                                  <span>{opt.value}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Fasilitas</CardTitle>
                        <CardDescription>Daftar keunggulan yang ditampilkan.</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAddFacility} className="gap-2">
                          <Plus className="size-4" /> Tambah
                      </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {(formData.facilities || []).map((fac, idx) => (
                          <div key={idx} className="p-4 rounded-xl border bg-muted/30 space-y-4 relative group">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveFacility(idx)}
                              >
                                  <Trash2 className="size-4" />
                              </Button>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <Label>Ikon</Label>
                                      <Select value={fac.icon} onValueChange={(val) => updateFacility(idx, 'icon', val)}>
                                          <SelectTrigger className="bg-background">
                                              <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {ICON_OPTIONS.map(opt => (
                                                  <SelectItem key={opt.value} value={opt.value}>
                                                      <div className="flex items-center gap-2">
                                                          <opt.icon className="size-4" />
                                                          <span>{opt.value}</span>
                                                      </div>
                                                  </SelectItem>
                                              ))}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="space-y-2">
                                      <Label>Judul</Label>
                                      <Input 
                                        value={fac.title} 
                                        onChange={(e) => updateFacility(idx, 'title', e.target.value)}
                                        className="bg-background"
                                      />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                      <Label>Deskripsi Singkat</Label>
                                      <Input 
                                        value={fac.description} 
                                        onChange={(e) => updateFacility(idx, 'description', e.target.value)}
                                        className="bg-background"
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                      {(!formData.facilities || formData.facilities.length === 0) && (
                          <div className="py-10 text-center border-2 border-dashed rounded-2xl opacity-50">
                              <p className="text-xs font-bold uppercase tracking-widest">Belum ada fasilitas. Klik "Tambah" untuk memulai.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <MapPin className="size-5 text-primary" />
                        Lokasi & Peta Arena
                      </CardTitle>
                      <CardDescription>Atur alamat fisik dan titik koordinat untuk marker logo.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <Label>Alamat Lengkap (Teks)</Label>
                          <Textarea 
                            value={formData.address} 
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Contoh: Jl. Ahmad Yani No. 45, Bandung"
                            className="min-h-[80px] bg-muted/20"
                          />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                          <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                  <Navigation className="size-3 text-primary" /> Latitude
                              </Label>
                              <Input 
                                value={formData.latitude} 
                                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                placeholder="-6.123456"
                                className="bg-background font-mono text-xs"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                  <Navigation className="size-3 text-primary" /> Longitude
                              </Label>
                              <Input 
                                value={formData.longitude} 
                                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                placeholder="106.123456"
                                className="bg-background font-mono text-xs"
                              />
                          </div>
                          <div className="sm:col-span-2 p-3 rounded-lg bg-white/50 border border-dashed border-primary/20">
                              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                <b>Tips Presisi:</b> Buka Google Maps &gt; Klik Kanan di lokasi toko Anda &gt; Pilih baris pertama (angka koordinat) untuk menyalin. Masukkan angka tersebut ke kolom di atas.
                              </p>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>

          <div className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Kontak & Sosmed</CardTitle>
                      <CardDescription>Link navigasi di footer dan tombol chat.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                              <MessageCircle className="size-3.5 text-emerald-500" /> WhatsApp (Nomor)
                          </Label>
                          <Input 
                            value={formData.whatsapp} 
                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                            placeholder="628123456789"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                              <Instagram className="size-3.5 text-pink-500" /> Instagram Username
                          </Label>
                          <Input 
                            value={formData.instagram} 
                            onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                            placeholder="@xenonplay"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                              <Music className="size-3.5 text-slate-900" /> TikTok Username
                          </Label>
                          <Input 
                            value={formData.tiktok} 
                            onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                            placeholder="@xenonplay"
                          />
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Info Integrasi Peta</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-3">
                      <p>• Marker Logo XenonPlay akan muncul secara otomatis tepat di titik tengah koordinat yang Anda masukkan.</p>
                      <p>• Peta menggunakan mode interaktif yang memungkinkan pelanggan melakukan zoom atau membuka rute di aplikasi Google Maps mereka.</p>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}
