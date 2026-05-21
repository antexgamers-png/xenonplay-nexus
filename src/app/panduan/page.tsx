
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
    FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Master Deployment Guide v1.3</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">XenonPlay <span className="text-primary">Nexus Guide</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Instruksi lengkap instalasi hardware otomatis dan konfigurasi Server Offline.
        </p>
      </header>

      <Tabs defaultValue="tv" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl mb-8 border flex w-full overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="tv" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Monitor className="size-3"/> 1. Setup TV</TabsTrigger>
            <TabsTrigger value="laptop" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Laptop className="size-3"/> 2. Setup Laptop</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-primary"><Server className="size-3"/> 3. Mode Offline</TabsTrigger>
            <TabsTrigger value="install" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2"><Package className="size-3"/> 4. Instalasi Bridge</TabsTrigger>
            <TabsTrigger value="trouble" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 flex-1 gap-2 text-red-500"><AlertTriangle className="size-3"/> Troubleshooting</TabsTrigger>
        </TabsList>

        {/* STEP 1: TV SETUP */}
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
                                <li className="flex gap-3">
                                    <span className="font-black text-primary">01.</span>
                                    Buka <b>Settings</b> &gt; <b>About</b>. Cari baris <b>Build Number</b>.
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-black text-primary">02.</span>
                                    Tekan tombol OK di remote sebanyak <b>7 kali</b> sampai muncul pesan "You are now a developer!".
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-black text-primary">03.</span>
                                    Kembali, cari menu baru <b>Developer Options</b>.
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-black text-primary font-bold text-red-500 underline decoration-red-500/30">04.</span>
                                    Aktifkan <b>USB Debugging</b> dan <b>Wireless Debugging</b>.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                        <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                <Wifi className="size-4" /> B. Pengaturan Jaringan Statis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Agar koneksi tidak putus-nyambung, TV <b>Wajib</b> memiliki alamat IP yang tidak berubah.
                            </p>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight">Cara Setel IP Statis:</p>
                                <p className="text-[10px] text-emerald-600 leading-relaxed italic">
                                    Settings &gt; Network &gt; Wi-Fi &gt; Pilih WiFi Anda &gt; IP Settings &gt; Ubah ke <b>Static</b>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* STEP 2: LAPTOP SETUP */}
        <TabsContent value="laptop" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xl shadow-slate-500/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Lingkungan Windows</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Globe className="size-4" /> 1. Network Profile: Private
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-3">
                            <p>Windows sering memblokir komunikasi antar perangkat jika jaringan dianggap <b>Public</b>.</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Klik kanan ikon WiFi di Taskbar &gt; Properties.</li>
                                <li>Ubah Network Profile ke <b>Private</b>.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="size-4" /> 2. Matikan Firewall
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-3">
                            <p>Matikan <b>Public Network Firewall</b> di laptop kasir untuk memastikan koneksi ADB tidak terblokir (Error 10060).</p>
                            <div className="p-2 rounded-lg bg-slate-900 text-slate-300 font-mono text-[9px]">
                                Windows Security &gt; Firewall & Network Protection &gt; Matikan Firewall.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* STEP 3: OFFLINE MODE */}
        <TabsContent value="offline" className="space-y-8 animate-in fade-in zoom-in-95">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Server Offline</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-2 border-emerald-500/20 bg-emerald-500/[0.01]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <ArrowDownToLine className="size-4 text-emerald-600" /> Tahap 0: Transfer Kode via GitHub
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground">Di Browser Studio (Cloud):</p>
                                <ol className="text-xs space-y-2 list-decimal list-inside text-muted-foreground">
                                    <li>Jalankan skrip: <code className="bg-slate-900 text-slate-300 px-1 rounded">sh setup-git.sh</code></li>
                                    <li>Masukkan Token GitHub Anda.</li>
                                </ol>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground">Di Laptop Kasir (Fisik):</p>
                                <CodeBlock code="git clone https://github.com/[USERNAME]/xenonplay-nexus.git\ncd xenonplay-nexus && npm install" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <PlayCircle className="size-4 text-emerald-500" /> Tahap 1: Jalankan Server Lokal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground font-bold">1. Database (Emulator):</p>
                            <CodeBlock code="firebase emulators:start --import=./local_data --export-on-exit" />
                            <p className="text-xs text-muted-foreground font-bold">2. Aplikasi Web (Dev):</p>
                            <CodeBlock code="npm run dev" />
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-primary">
                                <Zap className="size-4" /> Shortcut Offline (Tanpa Terminal)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Agar Bridge otomatis masuk mode offline tanpa perlu membuka terminal, lakukan ini di folder <b>XenonSource</b>:
                            </p>
                            <div className="p-4 rounded-xl bg-white border border-dashed border-primary/30 flex items-start gap-3">
                                <FileSearch className="size-5 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase">Buat File Flag:</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Klik kanan &gt; New &gt; Text Document. <br/>Beri nama: <b>OFFLINE_MODE</b> (hapus akhiran .txt).
                                    </p>
                                </div>
                            </div>
                            <p className="text-[9px] text-muted-foreground italic">*Fitur ini tersedia pada Master Bridge V1.3.0+</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* STEP 4: INSTALL BRIDGE */}
        <TabsContent value="install" className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            {/* DOWNLOAD SECTION */}
            <section className="space-y-6">
                <Card className="bg-primary/5 border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                    <div className="space-y-3 text-center md:text-left">
                        <Badge className="bg-primary text-white border-none font-black text-[10px] tracking-widest px-3 h-6 rounded-lg shadow-lg">OFFICIAL RELEASE</Badge>
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Ambil <span className="text-primary">Installer</span> Bridge</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">Dapatkan paket lengkap installer Windows (.exe) yang sudah termasuk driver ADB.</p>
                    </div>
                    <Link href="https://drive.google.com/file/d/1PRVPT_WZv67eken3ytf7pP6g4OcfPj56/view?usp=sharing" target="_blank">
                        <Button size="lg" className="h-20 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 text-lg gap-4 group">
                            <Download className="size-6 group-hover:animate-bounce" />
                            Download App (.exe)
                        </Button>
                    </Link>
                </Card>
            </section>

            {/* SUB-SECTION 4.1: USER INSTALLATION */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xl shadow-emerald-500/20 text-lg">4.1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Langkah Instalasi & Aktivasi</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-primary">01. Download & Ekstrak</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Klik tombol download di atas. Simpan file <code>XenonBridge_Setup.exe</code> ke folder Desktop Anda agar mudah ditemukan.
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-primary">02. Jalankan Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Klik kanan file setup &gt; <b>Run as Administrator</b>. Ikuti petunjuk di layar sampai selesai. Shortcut akan muncul di Desktop.
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-primary">03. Jalankan Aplikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Klik 2x pada shortcut <b>XenonPlay Bridge</b>. Aplikasi berjalan di latar belakang (tanpa jendela) untuk keamanan sistem.
                        </CardContent>
                    </Card>
                </div>

                <Alert className="bg-primary/5 border-primary/20 mt-4">
                    <ShieldCheck className="size-4 text-primary" />
                    <AlertTitle className="text-xs font-black uppercase">Verifikasi Akhir (Wajib)</AlertTitle>
                    <AlertDescription className="text-[10px] text-muted-foreground">
                        Setelah aplikasi berjalan, buka menu <b>Integrasi &gt; Simulator Control</b> di dashboard ini. Klik tombol <b>"Verifikasi Link"</b>. Lihat layar TV Anda, jika muncul pesan perizinan ADB, centang <b>"Always allow"</b> dan klik <b>OK</b>.
                    </AlertDescription>
                </Alert>
            </section>

            <Separator />

            {/* SUB-SECTION 4.2: DEVELOPER TOOLS */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xl shadow-slate-500/20 text-lg">4.2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Update &amp; Rebuild (Developer)</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <RefreshCw className="size-4 text-primary" /> A. Update Script (.js &gt; .exe)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Jika Anda mengubah kode di <code>bridge.js</code>, Anda harus mengompilasinya ulang agar perubahan aktif di Windows.
                            </p>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Langkah Rebuild:</p>
                                <ol className="text-[10px] space-y-1 list-decimal list-inside text-muted-foreground">
                                    <li>Buka <b>Task Manager</b>, matikan <code>xenon-bridge.exe</code>.</li>
                                    <li>Buka CMD di folder <b>XenonSource</b>.</li>
                                    <li>Jalankan perintah persiapan & kompilasi di bawah.</li>
                                </ol>
                            </div>
                            <CodeBlock code="npm install -g pkg\nnpm init -y\nnpm install firebase-admin\npkg . --targets node18-win-x64 --output xenon-bridge.exe" />
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <FileText className="size-4 text-primary" /> B. Buat Installer (Setup.exe)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Gunakan <b>Inno Setup Compiler</b> untuk membungkus file <code>.exe</code>, folder <code>bin</code>, dan kunci akses menjadi satu installer.
                            </p>
                            <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-5 rounded bg-primary flex items-center justify-center text-[10px] text-white font-bold">1</div>
                                    <p className="text-[10px] font-bold">Buka Inno Setup</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-5 rounded bg-primary flex items-center justify-center text-[10px] text-white font-bold">2</div>
                                    <p className="text-[10px] font-bold">Muat file <code>installer.iss</code></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-5 rounded bg-primary flex items-center justify-center text-[10px] text-white font-bold">3</div>
                                    <p className="text-[10px] font-bold">Klik tombol <b>Build &gt; Compile</b></p>
                                </div>
                            </div>
                            <Alert className="bg-amber-500/10 border-amber-500/20">
                                <AlertDescription className="text-[9px] text-amber-700 italic">
                                    Pastikan file <code>serviceAccountKey.json</code> sudah ada di folder XenonSource sebelum melakukan compile.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* STEP 5: TROUBLESHOOTING */}
        <TabsContent value="trouble" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black shadow-xl shadow-red-500/20 text-lg">
                        <AlertTriangle className="size-6" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Pusat Bantuan (Error Fixing)</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-red-500/20 bg-red-500/[0.02]">
                        <CardHeader className="pb-3 border-b border-red-500/10">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                                <AlertTriangle className="size-4" /> Error 10060 (Timeout)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3 text-xs text-muted-foreground">
                            <p className="font-bold text-foreground">Artinya: Laptop tidak bisa "melihat" TV.</p>
                            <p><b>Solusi:</b></p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Pastikan Laptop dan TV di WiFi yang <b>sama</b>.</li>
                                <li>Matikan <b>AP Isolation</b> di Router.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/20 bg-blue-500/[0.02]">
                        <CardHeader className="pb-3 border-b border-blue-500/10">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <Activity className="size-4" /> Cara Melihat Log (Debug Mode)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3 text-xs text-muted-foreground">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Matikan bridge di Task Manager.</li>
                                <li>Jalankan <code>xenon-bridge.exe</code> langsung (bukan via shortcut vbs).</li>
                                <li>Jendela CMD akan terbuka dan menampilkan status koneksi per detik.</li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-8 rounded-[2.5rem] bg-muted/30 border border-border flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="size-20 rounded-3xl bg-primary flex items-center justify-center text-white shrink-0 rotate-3 shadow-lg shadow-primary/20">
              <Zap className="size-10 fill-current" />
          </div>
          <div className="space-y-2 text-center md:text-left">
              <h4 className="font-black uppercase tracking-tight text-xl text-primary">Sistem Siap Operasi</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  Semua perintah mulai dari Power ON hingga Power OFF akan dilakukan secara otomatis oleh sistem melalui <b>Xenon Bridge</b> yang berjalan tenang di latar belakang.
              </p>
          </div>
      </div>
    </div>
  );
}

    