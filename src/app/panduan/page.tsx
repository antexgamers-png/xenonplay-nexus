'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    ShieldCheck, 
    Monitor, 
    Laptop, 
    Zap, 
    CheckCircle2, 
    AlertTriangle, 
    Copy, 
    Terminal, 
    Download, 
    Settings, 
    Cpu, 
    Package, 
    FileCode, 
    FileJson, 
    Wrench, 
    BellRing, 
    FolderTree, 
    Info, 
    ExternalLink, 
    RefreshCw, 
    ShieldAlert, 
    Box,
    Layers,
    Plus,
    FolderPlus,
    MonitorPlay,
    Wifi,
    MousePointer2,
    Command,
    Keyboard,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const CodeBlock = ({ code, language = "bash" }: { code: string, language?: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        toast({ title: "Tersalin!", variant: "success" });
    };
    return (
        <div className="relative group">
            <div className="absolute top-2 left-4 text-[8px] font-black uppercase text-slate-500 tracking-widest">{language}</div>
            <pre className="bg-slate-950 text-slate-300 p-5 pt-8 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/5 shadow-2xl">
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
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">XenonPlay Nexus Enterprise v1.3.3</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Master Terintegrasi</span></h1>
        <p className="text-muted-foreground text-sm max-w-3xl font-medium">
          Dua pilar utama untuk menjaga stabilitas operasional: Teknik membangun software installer dan konfigurasi hardware yang presisi.
        </p>
      </header>

      <Tabs defaultValue="installer" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-16 rounded-[2rem] mb-12 border flex w-full">
            <TabsTrigger value="installer" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">
                <Package className="size-5"/> 1. Membangun Installer (.exe)
            </TabsTrigger>
            <TabsTrigger value="konfigurasi" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">
                <Settings className="size-5"/> 2. Konfigurasi Laptop & TV
            </TabsTrigger>
        </TabsList>

        {/* MODUL 1: MEMBANGUN INSTALLER */}
        <TabsContent value="installer" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TAHAP 0: ALAT */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">0</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Alat (Build Tools)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-border hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Cpu className="size-4 text-primary" /> 1. Node.js LTS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Mesin utama untuk menjalankan skrip JavaScript dan melakukan kompilasi.</p>
                            <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase" asChild>
                                <a href="https://nodejs.org/" target="_blank"><ExternalLink className="size-3 mr-2" /> Download Node.js</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="size-4 text-primary" /> 2. ADB Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">File binary adb.exe, AdbWinApi.dll, dan AdbWinUsbApi.dll untuk kontrol TV.</p>
                            <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase" asChild>
                                <a href="https://developer.android.com/tools/releases/platform-tools" target="_blank"><ExternalLink className="size-3 mr-2" /> Download ADB</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Layers className="size-4 text-primary" /> 3. Inno Setup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Software untuk membungkus seluruh file sistem menjadi satu file Installer tunggal.</p>
                            <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase" asChild>
                                <a href="https://jrsoftware.org/isdl.php" target="_blank"><ExternalLink className="size-3 mr-2" /> Download Inno</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* TAHAP 1: STRUKTUR FOLDER */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Menyiapkan Folder XenonSource</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Buat folder baru bernama <b>XenonSource</b> di Desktop atau C:\. Folder ini akan menjadi pusat produksi Anda.
                        </p>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">A</div>
                                <p className="text-xs font-bold uppercase">Buat Sub-Folder "bin/"</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-9">Pindahkan isi dari <code>platform-tools</code> (adb.exe, dll) ke dalam folder <b>bin/</b> ini.</p>
                            
                            <div className="flex items-center gap-3">
                                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">B</div>
                                <p className="text-xs font-bold uppercase">Buat Sub-Folder "assets/"</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-9">Gunakan folder ini untuk menyimpan ikon aplikasi (.ico) atau logo Xenon.</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FolderTree className="size-32 text-white" />
                        </div>
                        <p className="text-emerald-500 font-bold mb-4 text-[10px] tracking-widest uppercase">Target Struktur Folder Akhir:</p>
                        <div className="font-mono text-xs text-slate-300 space-y-3">
                            <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>XenonSource/</b></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-slate-600"/> 📁 <b>assets/</b> <span className="text-slate-600 ml-2">// (Logo, Ikon)</span></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-emerald-500"/> 📁 <b>bin/</b> <span className="text-slate-500 ml-2">// (Isi ADB Tools di sini)</span></p>
                            <p className="flex items-center gap-3 ml-6 text-emerald-400"><FileCode className="size-3"/> 📄 <b>bridge.js</b></p>
                            <p className="flex items-center gap-3 ml-6 text-emerald-400"><FileJson className="size-3"/> 📄 <b>package.json</b></p>
                            <p className="flex items-center gap-3 ml-6 text-amber-500"><FileJson className="size-3"/> 📄 <b>serviceAccountKey.json</b></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAHAP 2: KONFIGURASI FILE */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Membuat File Konfigurasi</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Di dalam folder <b>XenonSource</b>, buat file baru bernama <b><code>package.json</code></b> dan masukkan kode berikut agar seluruh aset ikut terbungkus saat di-compile:
                    </p>
                    <CodeBlock language="json" code={`{
  "name": "xenon-bridge-hybrid",
  "version": "1.3.3",
  "main": "bridge.js",
  "bin": "bridge.js",
  "pkg": {
    "assets": ["bin/**/*", "serviceAccountKey.json"]
  },
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}`} />
                </div>
            </section>

            {/* TAHAP 3: COMPILE & BUILD */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Proses Kompilasi & Installer</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2 items-start">
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                            <Terminal className="size-4 text-primary" /> Langkah A: Build Binary (.exe)
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Buka CMD di dalam folder <b>XenonSource</b> dan jalankan perintah kompilasi ini satu per satu:
                        </p>
                        <CodeBlock code={`npm install\nnpm install -g pkg\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                        <Alert className="bg-emerald-500/5 border-emerald-500/20">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <AlertTitle className="text-emerald-700 font-bold uppercase text-[10px]">Sukses!</AlertTitle>
                            <AlertDescription className="text-[10px] text-emerald-600">File <b>xenon-bridge.exe</b> akan muncul di folder Anda.</AlertDescription>
                        </Alert>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-card border border-border space-y-4">
                        <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                            <FileText className="size-4 text-primary" /> Langkah B: Skrip Inno Setup (.iss)
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Buat file baru bernama <b><code>setup.iss</code></b> di folder XenonSource, lalu tempel kode di bawah ini. Skrip ini akan membuat file Installer otomatis.
                        </p>
                        <CodeBlock language="iss" code={`[Setup]
AppName=XenonPlay Bridge
AppVersion=1.3.3
DefaultDirName={autopf}\\XenonPlayBridge
DefaultGroupName=XenonPlay Bridge
OutputDir=.
OutputBaseFilename=XenonBridge_Pro_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=assets\\app-icon.ico

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\\*"; DestDir: "{app}\\bin"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\\*"; DestDir: "{app}\\assets"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{commondesktop}\\XenonPlay Bridge"; Filename: "{app}\\xenon-bridge.exe"; IconFilename: "{app}\\assets\\app-icon.ico"
Name: "{userstartup}\\XenonPlay Bridge"; Filename: "{app}\\xenon-bridge.exe"; IconFilename: "{app}\\assets\\app-icon.ico"

[Run]
Filename: "{app}\\xenon-bridge.exe"; Description: "Jalankan XenonPlay Bridge"; Flags: nowait postinstall skipifsilent`} />
                        <p className="text-[10px] text-muted-foreground italic">
                            Setelah file disimpan, klik kanan <b>setup.iss</b> lalu pilih <b>Compile</b>. Anda akan mendapatkan file <b>XenonBridge_Pro_Setup.exe</b>.
                        </p>
                    </div>
                </div>
            </section>
        </TabsContent>

        {/* MODUL 2: KONFIGURASI LAPTOP & TV */}
        <TabsContent value="konfigurasi" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* SETTING TV */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xl shadow-amber-500/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Smart TV (MediaTek)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap className="size-4 text-amber-500" /> Tahap A: Aktifkan Developer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <ol className="text-xs space-y-3 text-muted-foreground list-decimal list-inside">
                                <li>Buka <i>Settings &gt; Device Preferences &gt; About</i>.</li>
                                <li>Klik baris <b>Build Number</b> sebanyak 7 kali hingga muncul pesan "You are now a developer".</li>
                                <li>Kembali, masuk ke menu <b>Developer Options</b> yang baru muncul.</li>
                                <li>Aktifkan <b>USB Debugging</b> dan <b>Wireless Debugging</b>.</li>
                            </ol>
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Wifi className="size-4 text-amber-500" /> Tahap B: Kunci IP Statis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Agar koneksi tidak terputus saat router restart, Anda <b>WAJIB</b> menyetel IP Statis di menu:
                                <br/><code className="bg-muted px-2 py-1 rounded block mt-2 text-[10px]">Network &amp; Internet &gt; [Nama WiFi] &gt; IP Settings &gt; Static</code>
                            </p>
                            <Alert className="bg-amber-500/5 border-amber-500/20 p-3 mt-2">
                                <Info className="size-3.5 text-amber-600" />
                                <AlertDescription className="text-[10px] text-amber-700">Contoh IP stabil: 192.168.1.101, 192.168.1.102, dst.</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* SETTING LAPTOP */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xl shadow-amber-500/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Laptop Kasir</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Instal file <b>XenonBridge_Pro_Setup.exe</b> yang telah Anda buat di Modul 1. Setelah terinstal, lakukan langkah sinkronisasi pertama:
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-amber-500">
                                <Keyboard className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Handshake ADB Manual</h4>
                            </div>
                            <p className="text-[11px] text-slate-400">Gunakan perintah ini di CMD laptop untuk mengizinkan akses koneksi permanen dari TV:</p>
                            <CodeBlock code={`cd "C:\\Program Files (x86)\\XenonPlayBridge\\bin"\nadb connect [ALAMAT_IP_TV]:5555`} />
                            <p className="text-[10px] text-amber-600 italic">"Cek layar TV, centang 'Always Allow' lalu klik OK saat muncul popup izin."</p>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-muted/30 border border-border space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <ShieldAlert className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Izin PowerShell (Notifikasi)</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">Agar notifikasi Windows bisa muncul di pojok kanan bawah, jalankan PowerShell sebagai Admin dan ketik:</p>
                            <CodeBlock code={`Set-ExecutionPolicy RemoteSigned`} />
                        </div>
                    </div>
                </div>
            </section>

            {/* TROUBLESHOOTING */}
            <section className="space-y-6">
                <header className="flex items-center gap-4 text-red-500">
                    <div className="size-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black shadow-xl shadow-red-500/20 text-lg">!</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Analisis &amp; Solusi Kendala</h3>
                </header>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 space-y-3">
                        <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 1</Badge>
                        <h4 className="text-xs font-bold uppercase">TV 'Offline' di Dashboard</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed"><b>Solusi:</b> Restart WiFi TV atau jalankan perintah <code>adb connect</code> ulang. Pastikan IP TV tidak berubah.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 space-y-3">
                        <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 2</Badge>
                        <h4 className="text-xs font-bold uppercase">Target Refused / Unauthorized</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed"><b>Solusi:</b> Matikan lalu nyalakan kembali 'Wireless Debugging' di menu Developer TV.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 space-y-3">
                        <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 3</Badge>
                        <h4 className="text-xs font-bold uppercase">Bridge Tidak Berjalan</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed"><b>Solusi:</b> Periksa <i>Task Manager</i>, pastikan proses <code>xenon-bridge.exe</code> tidak ada yang dobel.</p>
                    </div>
                </div>
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
