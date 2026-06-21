'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Camera, 
    MonitorPlay, 
    ShieldCheck, 
    Wifi, 
    Settings, 
    Maximize, 
    RefreshCcw, 
    AlertCircle,
    Info,
    ExternalLink,
    Laptop,
    HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CCTVPage() {
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState('http://localhost:8090'); // Default Agent DVR local port
  const [isLive, setIsLive] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleTestConnection = () => {
      setIsLive(true);
      toast({ title: "Mencoba Menghubungkan", description: `Menghubungi server Agent DVR di ${streamUrl}...`, variant: "default" });
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Camera className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Security Surveillance</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Monitoring <span className="text-primary">CCTV</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Pantau area arena secara real-time via Agent DVR.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="font-bold gap-2" onClick={() => setIsConfiguring(!isConfiguring)}>
                <Settings className="size-4" /> {isConfiguring ? 'Tutup Pengaturan' : 'Konfigurasi IP'}
            </Button>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20" onClick={handleTestConnection}>
                <RefreshCcw className="size-4" /> Refresh Stream
            </Button>
        </div>
      </header>

      {isConfiguring && (
          <Card className="border-primary/20 bg-primary/[0.02] animate-in slide-in-from-top-4">
              <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Settings className="size-4 text-primary" /> Alamat Server Agent DVR
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Local IP / Hostname</Label>
                          <Input 
                            value={streamUrl} 
                            onChange={(e) => setStreamUrl(e.target.value)}
                            placeholder="Contoh: http://192.168.1.100:8090"
                            className="bg-background font-mono"
                          />
                      </div>
                      <div className="flex items-end">
                          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            Masukkan IP laptop kasir tempat Anda menginstal **Agent DVR**. Port standar biasanya **8090**.
                          </p>
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MAIN PLAYER */}
          <div className="lg:col-span-9 space-y-6">
              <Card className="rounded-[2.5rem] overflow-hidden border-border bg-black shadow-2xl relative aspect-video group">
                  {isLive ? (
                      <iframe 
                        src={streamUrl}
                        className="w-full h-full border-none"
                        allow="autoplay; fullscreen"
                      />
                  ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-950">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                            <div className="relative size-24 rounded-[2rem] border-2 border-white/10 flex items-center justify-center bg-white/5">
                                <MonitorPlay className="size-12 text-primary" />
                            </div>
                          </div>
                          <div className="text-center space-y-2">
                              <h3 className="text-xl font-black uppercase tracking-tight text-white/80">Stream Belum Aktif</h3>
                              <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Klik tombol refresh untuk menghubungkan</p>
                          </div>
                      </div>
                  )}

                  <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-red-600 text-white border-none font-black text-[9px] tracking-widest px-3 h-6 flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
                      </Badge>
                      <Button variant="secondary" size="icon" className="size-8 rounded-lg bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20">
                          <Maximize className="size-4" />
                      </Button>
                  </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Alert className="bg-emerald-500/5 border-emerald-500/20">
                      <ShieldCheck className="size-4 text-emerald-600" />
                      <AlertTitle className="text-[10px] font-black uppercase text-emerald-600">Local Connection</AlertTitle>
                      <AlertDescription className="text-[10px] text-emerald-700">Data terenkripsi via jaringan internal.</AlertDescription>
                  </Alert>
                  <Alert className="bg-primary/5 border-primary/20">
                      <Wifi className="size-4 text-primary" />
                      <AlertTitle className="text-[10px] font-black uppercase text-primary">Latency Low</AlertTitle>
                      <AlertDescription className="text-[10px] text-primary/70">Optimasi streaming &lt; 200ms.</AlertDescription>
                  </Alert>
                  <Alert className="bg-blue-500/5 border-blue-500/20">
                      <Laptop className="size-4 text-blue-600" />
                      <AlertTitle className="text-[10px] font-black uppercase text-blue-600">Agent DVR Ready</AlertTitle>
                      <AlertDescription className="text-[10px] text-blue-700">Terdeteksi di Laptop Bridge.</AlertDescription>
                  </Alert>
              </div>
          </div>

          {/* SIDE INFO */}
          <div className="lg:col-span-3 space-y-6">
              <Card className="rounded-3xl border-border bg-card shadow-sm p-6 space-y-6">
                  <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <Info className="size-3.5" /> Panduan Setup
                      </h4>
                      <ol className="space-y-4">
                          {[
                              "Instal Agent DVR di Laptop Kasir.",
                              "Masukkan link RTSP V380 Pro ke Agent DVR.",
                              "Buka akses Web UI pada port 8090.",
                              "Dashboard XenonPlay akan otomatis mengenali stream."
                          ].map((step, i) => (step && (
                              <li key={i} className="flex gap-3">
                                  <span className="text-[10px] font-black text-primary/40 mt-0.5">0{i+1}</span>
                                  <p className="text-[11px] font-medium leading-relaxed">{step}</p>
                              </li>
                          )))}
                      </ol>
                  </div>

                  <div className="pt-6 border-t border-border">
                      <Button variant="outline" className="w-full justify-between h-11 rounded-xl text-xs font-bold" asChild>
                          <a href="https://www.ispyconnect.com/download.aspx" target="_blank" rel="noopener noreferrer">
                              Download Agent DVR
                              <ExternalLink className="size-3.5" />
                          </a>
                      </Button>
                  </div>
              </Card>

              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                      <HelpCircle className="size-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Akses Jarak Jauh?</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Agar bisa memantau dari luar toko (via HP), gunakan layanan **Cloudflare Tunnel** atau **ngrok** untuk mem-forward port 8090 laptop kasir Anda secara aman.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
