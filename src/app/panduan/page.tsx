
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    ShieldCheck, 
    Monitor, 
    Laptop, 
    Zap, 
    CheckCircle2, 
    AlertTriangle, 
    PlayCircle, 
    Copy, 
    Terminal, 
    Download, 
    Settings, 
    ChevronRight, 
    Activity, 
    RefreshCw, 
    Network, 
    Wifi, 
    ShieldAlert, 
    Info, 
    Globe, 
    ArrowRightLeft,
    Package,
    Cpu,
    Box,
    FileCode,
    Command,
    ExternalLink,
    MousePointer2,
    WifiOff,
    Server,
    HardDrive,
    Github,
    ArrowDownToLine,
    FileText,
    FileSearch,
    Code,
    Layers,
    FileKey
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CodeBlock = ({ code, language = "bash" }: { code: string, language?: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        toast({ title: "Tersalin!", variant: "success" });
    };
    return (
        <div className="relative group">
            <div className="absolute top-2 left-4 text-[8px] font-black uppercase text-slate-500 tracking-widest">{language}</div>
            <pre className="bg-slate-950 text-slate-300 p-5 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/5 shadow-2xl">
                <code>{code.trim()}</code>
            </pre>
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
                <Copy className="size-3.5" />
            </Button>
        </div>
    );
};

export default function MasterPanduanPage() {
  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Legacy Stable Guide v1.3.0</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Xenon Bridge</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Instruksi lengkap instalasi hardware otomatis menggunakan Node.js Script yang paling stabil dan tangguh.
        </p>
      </header>

      <Tabs defaultValue="script" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl mb-8 border flex w-full overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="script" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-emerald-600"><Terminal className="size-3"/> 1. Setup Script</TabsTrigger>
            <TabsTrigger value="tv" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Monitor className="size-3"/> 2. Konfigurasi TV</TabsTrigger>
            <TabsTrigger value="laptop" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Laptop className="size-3"/> 3. Keamanan Windows</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-primary"><Server className="size-3"/> 4. Mode Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xl shadow-emerald-500/20 text-lg">0</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Folder Laptop</h3>
                </div>
                <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Buat folder <b>XenonBridge</b> di Desktop laptop Anda. Masukkan file-file berikut ke dalamnya:</p>
                        <div className="p-5 rounded-3xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed shadow-2xl border border-white/5 relative overflow-hidden">
                            <p className="text-emerald-500 font-bold mb-2">📁 XenonBridge/</p>
                            <p>├── 📄 bridge.js <span className="text-slate-500">(Ambil kodenya di menu Simulator Control)</span></p>
                            <p>├── 📄 serviceAccountKey.json <span className="text-slate-500">(Ambil dari Firebase Console)</span></p>
                            <p>└── 📁 <b>bin/</b> <span className="text-slate-500">(Opsional: Isi dengan adb.exe jika ingin mode portabel)</span></p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Instalasi Library</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka <b>CMD</b> atau <b>Powershell</b> di dalam folder tersebut, lalu jalankan perintah ini:</p>
                    <CodeBlock code={`npm install firebase-admin`} />
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Menjalankan Bridge</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Gunakan perintah ini untuk mulai memantau unit TV secara real-time:</p>
                    <CodeBlock code={`node bridge.js`} />
                    <Alert className="bg-blue-500/5 border-blue-500/20">
                        <Info className="size-4" />
                        <AlertDescription className="text-xs text-blue-700">
                            Pastikan jendela CMD tetap terbuka selama toko beroperasi. Bridge akan otomatis memproses setiap klik tombol dari dashboard web.
                        </AlertDescription>
                    </Alert>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="tv" className="space-y-8 animate-in fade-in slide-in-from-left-4">
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Smart TV</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Settings className="size-4 text-primary" /> A. Mode Pengembang (Developer)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3 text-xs text-muted-foreground leading-relaxed">
                            <ul className="space-y-3">
                                <li className="flex gap-3"><span className="font-black text-primary">01.</span> Buka <b>Settings</b> &gt; <b>About</b>.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">02.</span> Tekan OK sebanyak <b>7 kali</b> pada Build Number.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">03.</span> Aktifkan <b>USB Debugging</b> dan <b>Wireless Debugging</b>.</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                        <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                <Wifi className="size-4" /> B. Jaringan & IP Statis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">TV <b>Wajib</b> memiliki alamat IP Statis agar koneksi Bridge tidak terputus saat router dinyalakan ulang. Atur IP Statis di menu <i>Network &amp; Internet &gt; IP Settings &gt; Static</i>.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="laptop" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xl shadow-slate-500/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Keamanan Windows</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Globe className="size-4" /> Network Profile</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Ubah profil WiFi Anda ke <b>Private</b> agar Windows tidak memblokir sinyal nirkabel ADB antara laptop dan TV.</CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="size-4" /> Firewall Rule</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Izinkan Node.js melewati Firewall jika muncul notifikasi keamanan saat pertama kali menjalankan script.</CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="offline" className="space-y-8 animate-in fade-in zoom-in-95">
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">4</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Server Lokal (Tanpa Internet)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader><CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2"><PlayCircle className="size-4 text-emerald-500" /> Aktifkan Emulator</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground font-bold">1. Jalankan Database Lokal:</p>
                            <CodeBlock code="firebase emulators:start --import=./local_data --export-on-exit" />
                            <p className="text-xs text-muted-foreground font-bold">2. Jalankan Bridge di Mode Offline:</p>
                            <p className="text-xs text-muted-foreground">Atur environment variable sebelum menjalankan script agar mengarah ke localhost.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/20">
                        <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary"><Monitor className="size-4" /> Akses Kasir</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>Buka <b>http://localhost:9002</b> di browser laptop kasir Anda.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
