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
    MousePointer2, 
    ExternalLink, 
    AlertCircle, 
    RefreshCw, 
    Command, 
    ShieldAlert, 
    FileArchive, 
    FolderOpen,
    Wifi,
    Box,
    FileText,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ultimate Hybrid v1.3.3 Final</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Master Hardware</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Instruksi lengkap pembangunan installer Windows profesional untuk sistem Xenon Bridge.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
          <Alert className="bg-blue-500/5 border-blue-500/20">
              <Info className="size-4 text-blue-600" />
              <AlertTitle className="text-blue-700 font-black uppercase text-[10px] tracking-widest">Update Penting v1.3.3</AlertTitle>
              <AlertDescription className="text-[10px] text-blue-600/80 leading-relaxed">
                  Gunakan instruksi ini untuk membungkus aplikasi agar tidak mudah terhapus oleh antivirus dan berjalan otomatis saat Windows menyala.
              </AlertDescription>
          </Alert>
          <Alert className="bg-emerald-500/5 border-emerald-500/20">
              <Zap className="size-4 text-emerald-600" />
              <AlertTitle className="text-emerald-700 font-black uppercase text-[10px] tracking-widest">Silent Mode Enabled</AlertTitle>
              <AlertDescription className="text-[10px] text-emerald-600/80 leading-relaxed">
                  Panduan ini menyertakan teknik VBScript agar jendela hitam CMD tidak mengganggu kasir saat bekerja.
              </AlertDescription>
          </Alert>
      </div>

      <Tabs defaultValue="tahap-0" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl mb-8 border flex w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="tahap-0" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Cpu className="size-3.5"/> 0. Alat</TabsTrigger>
            <TabsTrigger value="tahap-1" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Laptop className="size-3.5"/> 1. Laptop</TabsTrigger>
            <TabsTrigger value="tahap-2" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Monitor className="size-3.5"/> 2. TV</TabsTrigger>
            <TabsTrigger value="build-exe" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2 text-primary border-primary/20"><Package className="size-3.5"/> 3. Build EXE</TabsTrigger>
            <TabsTrigger value="trouble" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2 text-red-500"><ShieldAlert className="size-3.5"/> 4. Error</TabsTrigger>
        </TabsList>

        {/* TAHAP 0: ALAT & DOWNLOAD */}
        <TabsContent value="tahap-0" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Download className="size-4 text-primary" /> Software Wajib (Build)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">1</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase">Node.js LTS (v20+)</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">Mesin utama pemroses skrip.</p>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" asChild>
                                        <a href="https://nodejs.org/" target="_blank"><ExternalLink className="size-3 mr-2" /> Download Node.js</a>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">2</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase">Inno Setup Compiler</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">Alat pembuat file installer (.exe).</p>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" asChild>
                                        <a href="https://jrsoftware.org/isdl.php" target="_blank"><ExternalLink className="size-3 mr-2" /> Download Inno Setup</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                    <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <FileArchive className="size-4" /> Komponen Sistem
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span><b>ADB Platform Tools</b>: Binary inti kontrol TV.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span><b>serviceAccountKey.json</b>: Kunci akses Cloud Firebase.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span><b>bridge.js</b>: Logika Hybrid v1.3.3 terbaru.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* TAHAP 1: SETUP LAPTOP */}
        <TabsContent value="tahap-1" className="space-y-10 animate-in fade-in slide-in-from-left-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Menyiapkan Folder Sumber</h3>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FolderTree className="size-32 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <FolderOpen className="size-4 text-emerald-500" />
                        <p className="text-emerald-500 font-bold text-[10px] tracking-widest uppercase">LOKASI: C:\XenonBuild</p>
                    </div>
                    <div className="font-mono text-xs text-slate-300 space-y-3">
                        <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>bin/</b> <span className="text-slate-500 ml-4">// Masukkan adb.exe, AdbWinApi.dll ke sini</span></p>
                        <p className="flex items-center gap-3"><FileCode className="size-3 text-primary"/> 📄 <b>bridge.js</b> <span className="text-slate-500 ml-4">// Ambil kodenya di menu Simulator</span></p>
                        <p className="flex items-center gap-3"><FileJson className="size-3 text-primary"/> 📄 <b>serviceAccountKey.json</b> <span className="text-slate-500 ml-4">// Kunci Admin Firebase</span></p>
                    </div>
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 2: SETUP TV */}
        <TabsContent value="tahap-2" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Setting Smart TV (MediaTek)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Settings className="size-4 text-primary" /> 1. Developer Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-[11px] text-muted-foreground leading-relaxed">
                            <ol className="space-y-3">
                                <li className="flex gap-3"><span className="font-black text-primary">A.</span> Settings &gt; About &gt; Klik <b>Build Number</b> 7x.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">B.</span> Developer Options &gt; Aktifkan <b>USB Debugging</b>.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">C.</span> Developer Options &gt; Aktifkan <b>Wireless Debugging</b>.</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Wifi className="size-4 text-primary" /> 2. Kunci IP Statis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                TV <b>Wajib</b> memiliki IP Statis agar koneksi tidak berubah saat router restart. 
                                <br/><br/>
                                <i>Network &amp; Internet &gt; IP Settings &gt; Static</i>. 
                                <br/>Contoh: <code>192.168.1.50</code>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 3: BUILD EXE & INSTALLER */}
        <TabsContent value="build-exe" className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20">
                        <Wrench className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">1. Konfigurasi Package.json</h3>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Langkah wajib agar file pendukung ikut terbungkus.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka folder <code>C:\XenonBuild</code>, buat file bernama <code>package.json</code> dan isi dengan kode ini:</p>
                    <CodeBlock language="json" code={`{
  "name": "xenon-bridge-hybrid",
  "version": "1.3.3",
  "main": "bridge.js",
  "bin": "bridge.js",
  "pkg": {
    "assets": [
      "bin/**/*",
      "serviceAccountKey.json"
    ]
  },
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}`} />
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20">
                        <Terminal className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">2. Kompilasi Menjadi Binary</h3>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Mengubah skrip menjadi file .exe murni.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka CMD di folder <code>C:\XenonBuild</code>, jalankan perintah ini:</p>
                    <CodeBlock code={`npm install -g pkg\nnpm install\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20">
                        <Package className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">3. Membuat Installer (Inno Setup)</h3>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Membuat file Setup.exe agar bisa diinstal di laptop mana pun.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-6 rounded-[2rem] bg-slate-900 border border-border space-y-4">
                        <p className="text-xs text-slate-300 leading-relaxed">
                            1. Buka <b>Inno Setup Compiler</b>.<br/>
                            2. Klik <i>File &gt; New</i>, ikuti wizard-nya.<br/>
                            3. Pada bagian <b>Application Main Executable</b>, pilih <code>xenon-bridge.exe</code>.<br/>
                            4. Pada bagian <b>Other Application Files</b>, tambahkan seluruh folder <code>bin/</code> dan file <code>serviceAccountKey.json</code>.<br/>
                            5. Terakhir, buat file konfigurasi <code>script.iss</code> untuk menyertakan shortcut ke Desktop.
                        </p>
                        <Alert className="bg-primary/10 border-primary/20">
                            <Info className="size-4 text-primary" />
                            <AlertDescription className="text-[11px] text-primary">
                                Gunakan <b>Inno Setup</b> agar aplikasi terdaftar di Windows Programs dan memiliki fitur Uninstall yang bersih.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20">
                        <BellRing className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">4. Mode Senyap & Startup</h3>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Menyembunyikan jendela CMD tapi tetap memberi notifikasi.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Agar aplikasi berjalan otomatis tanpa terlihat jendela CMD, buat file <code>run.vbs</code> di folder yang sama:</p>
                    <CodeBlock language="vbs" code={`Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run "xenon-bridge.exe", 0, false`} />
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4">
                        <MousePointer2 className="size-5 text-emerald-600 mt-1" />
                        <p className="text-xs text-emerald-700 leading-relaxed italic">
                            "Setelah installer selesai, kasir cukup mengklik shortcut di Desktop. Windows akan memunculkan popup notifikasi <b>'XPBridge Active'</b> dan terminal akan tersembunyi sempurna."
                        </p>
                    </div>
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 4: TROUBLESHOOTING MASTER */}
        <TabsContent value="trouble" className="space-y-8 animate-in fade-in zoom-in-95">
            <header className="flex items-center gap-4 text-red-500">
                <div className="size-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black shadow-xl shadow-red-500/20 text-lg">!</div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Solusi Kendala Lapangan</h3>
            </header>

            <div className="grid gap-6">
                <Card className="border-red-500/20 bg-red-500/[0.02]">
                    <CardHeader className="border-b border-red-500/10">
                        <CardTitle className="text-xs font-black uppercase text-red-700 flex items-center gap-2">
                            <ShieldAlert className="size-4" /> Analisis Kegagalan Build
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[350px]">
                            <div className="p-6 space-y-8">
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 01</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">Error 'pkg' Not Recognized</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> Global bin Node.js belum terdaftar di Environment Path Windows.
                                        <br/><b>Solusi:</b> Gunakan perintah <code>npx pkg . --targets node18-win-x64</code> jika <code>pkg</code> tidak bisa dipanggil langsung.
                                    </p>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 02</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">TV Tidak Terhubung (Offline)</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> File ADB di folder <code>bin/</code> tidak ikut terbawa ke dalam EXE atau TV belum "Authorize".
                                        <br/><b>Solusi:</b> Pastikan struktur folder <code>bin/</code> benar saat build. Tes manual via CMD: <code>adb connect [IP]:5555</code> dan klik "Izinkan" di layar TV.
                                    </p>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 03</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">Notifikasi Tidak Muncul</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> Antivirus memblokir skrip PowerShell yang memicu popup.
                                        <br/><b>Solusi:</b> Tambahkan folder <code>C:\Program Files (x86)\XenonBridge</code> ke daftar <b>Exclusion</b> di Windows Defender.
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
