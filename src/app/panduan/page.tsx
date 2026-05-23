
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
    Layers
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Master Deployment Guide v1.3.2</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">XenonPlay <span className="text-primary">Nexus Guide</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Instruksi lengkap instalasi hardware otomatis dan pembangunan aplikasi Bridge Pro (Enterprise).
        </p>
      </header>

      <Tabs defaultValue="build-pro" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl mb-8 border flex w-full overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="build-pro" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-emerald-500"><Layers className="size-3"/> 🚀 Build Pro EXE</TabsTrigger>
            <TabsTrigger value="tv" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Monitor className="size-3"/> 1. Setup TV</TabsTrigger>
            <TabsTrigger value="laptop" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Laptop className="size-3"/> 2. Setup Laptop</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-primary"><Server className="size-3"/> 3. Mode Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="build-pro" className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xl shadow-emerald-500/20 text-lg">0</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Folder Sumber</h3>
                </div>
                <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Buat folder <b>XenonSource</b> di Desktop laptop Anda. Struktur ini menjamin hasil build menjadi <b>Satu File Installer</b> yang bisa dipasang di PC mana saja:</p>
                        <div className="p-5 rounded-3xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed shadow-2xl border border-white/5 relative overflow-hidden">
                            <p className="text-emerald-500 font-bold mb-2">📁 XenonSource/</p>
                            <p>├── 📄 bridge.js <span className="text-slate-500">(Ambil dari Simulator &gt; Master Pro V1.3.2)</span></p>
                            <p>├── 📄 package.json <span className="text-slate-500">(Salin kode di bawah)</span></p>
                            <p>├── 📄 serviceAccountKey.json <span className="text-slate-500">(Dari Firebase Console)</span></p>
                            <p>├── 📁 <b>assets/</b></p>
                            <p>│   └── 📄 app-icon.ico <span className="text-slate-500">(Ikon logo Xenon)</span></p>
                            <p>└── 📁 <b>bin/</b></p>
                            <p>    ├── 📄 adb.exe</p>
                            <p>    ├── 📄 AdbWinApi.dll</p>
                            <p>    └── 📄 AdbWinUsbApi.dll</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Metadata Build (package.json)</h3>
                </div>
                <Card className="border-border">
                    <CardHeader>
                        <CardDescription>Simpan sebagai <code>package.json</code>. Versi ini sudah terverifikasi stabil untuk fitur System Tray dan Hot-Swap.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock language="json" code={`{
  "name": "xenon-bridge-pro",
  "version": "1.3.2",
  "main": "bridge.js",
  "bin": "bridge.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "systray2": "^2.1.2"
  }
}`} />
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Kompilasi ke EXE</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka <b>CMD</b> di folder <b>XenonSource</b>, lalu jalankan perintah ini secara berurutan:</p>
                    <CodeBlock code={`npm install\nnpm install -g pkg\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Skrip Inno Setup Pro (.iss)</h3>
                </div>
                <Card className="border-border">
                    <CardHeader>
                        <CardDescription>Gunakan skrip ini di Inno Setup Compiler untuk menghasilkan file <b>XenonBridge_Pro_Setup.exe</b>.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock language="iss" code={`[Setup]
AppName=XenonPlay Bridge Pro
AppVersion=1.3.2
DefaultDirName={autopf}\\XenonPlayBridge
OutputDir=.
OutputBaseFilename=XenonBridge_Pro_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=assets\\app-icon.ico

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\\*"; DestDir: "{app}\\bin"; Flags: ignoreversion recursesubdirs
Source: "assets\\*"; DestDir: "{app}\\assets"; Flags: ignoreversion
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\\XenonPlay Bridge"; Filename: "{app}\\xenon-bridge.exe"; IconFilename: "{app}\\assets\\app-icon.ico"
Name: "{userstartup}\\XenonPlay Bridge"; Filename: "{app}\\xenon-bridge.exe"

[Run]
Filename: "{app}\\xenon-bridge.exe"; Description: "Jalankan XenonPlay Bridge Pro"; Flags: nowait postinstall skipifsilent`} />
                    </CardContent>
                </Card>
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
                            <p className="text-xs text-muted-foreground leading-relaxed">TV <b>Wajib</b> memiliki alamat IP Statis agar koneksi Bridge tidak terputus saat router dinyalakan ulang.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="laptop" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xl shadow-slate-500/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Keamanan Windows</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Globe className="size-4" /> Network Profile</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Ubah profil WiFi Anda ke <b>Private</b> agar Windows tidak memblokir sinyal nirkabel ADB.</CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="size-4" /> Firewall Rule</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Izinkan aplikasi <code>xenon-bridge.exe</code> melewati Firewall jika muncul notifikasi keamanan.</CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="offline" className="space-y-8 animate-in fade-in zoom-in-95">
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Server Lokal (Tanpa Internet)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader><CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2"><PlayCircle className="size-4 text-emerald-500" /> Aktifkan Emulator</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground font-bold">1. Jalankan Database Lokal:</p>
                            <CodeBlock code="firebase emulators:start --import=./local_data --export-on-exit" />
                            <p className="text-xs text-muted-foreground font-bold">2. Jalankan Bridge:</p>
                            <p className="text-xs text-muted-foreground">Pilih <b>No</b> pada dialog startup aplikasi Bridge Pro.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/20">
                        <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary"><Monitor className="size-4" /> Akses Kasir</CardTitle></CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>Buka <b>http://localhost:9002</b> di browser laptop kasir.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
