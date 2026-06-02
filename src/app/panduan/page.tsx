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
    Play,
    Plus,
    FolderPlus,
    FilePlus,
    Layers
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">XenonBridge Pro v1.3.3 Hybrid</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Membangun Installer</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Langkah teknis mendalam untuk merakit sistem otomatisasi hardware dari nol hingga menjadi file setup profesional.
        </p>
      </header>

      <Tabs defaultValue="tahap-0" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl mb-8 border flex w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="tahap-0" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Cpu className="size-3.5"/> 0. Alat</TabsTrigger>
            <TabsTrigger value="tahap-1" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><FolderPlus className="size-3.5"/> 1. Siapkan Folder</TabsTrigger>
            <TabsTrigger value="build-exe" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2 text-primary border-primary/20"><Package className="size-3.5"/> 2. Build EXE</TabsTrigger>
            <TabsTrigger value="trouble" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2 text-red-500"><ShieldAlert className="size-3.5"/> 3. Error</TabsTrigger>
        </TabsList>

        {/* TAHAP 0: ALAT & DOWNLOAD */}
        <TabsContent value="tahap-0" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Download className="size-4 text-primary" /> Software Pembangun (Build)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase">1. Node.js LTS</p>
                            <p className="text-[10px] text-muted-foreground mb-3">Mesin utama untuk menjalankan skrip JavaScript.</p>
                            <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-black uppercase" asChild>
                                <a href="https://nodejs.org/" target="_blank"><ExternalLink className="size-3 mr-2" /> Download</a>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase">2. Inno Setup</p>
                            <p className="text-[10px] text-muted-foreground mb-3">Untuk membungkus file menjadi installer (Setup.exe).</p>
                            <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-black uppercase" asChild>
                                <a href="https://jrsoftware.org/isdl.php" target="_blank"><ExternalLink className="size-3 mr-2" /> Download</a>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase">3. ADB Binary</p>
                            <p className="text-[10px] text-muted-foreground mb-3">Alat komunikasi antara laptop dan Smart TV.</p>
                            <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-black uppercase" asChild>
                                <a href="https://developer.android.com/tools/releases/platform-tools" target="_blank"><ExternalLink className="size-3 mr-2" /> Download</a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAHAP 1: SIAPKAN FOLDER */}
        <TabsContent value="tahap-1" className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Membuat Struktur Proyek</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                            <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2 text-primary">
                                <Plus className="size-3" /> Langkah A: Buat Folder Utama
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Buat sebuah folder baru di komputer Anda dengan nama <b>XenonSource</b>. Lokasi bebas, tapi disarankan di <code>C:\XenonSource</code>.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                            <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2 text-primary">
                                <FolderPlus className="size-3" /> Langkah B: Buat Sub-Folder
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Di dalam folder <b>XenonSource</b>, buatlah dua folder baru lagi:
                            </p>
                            <ul className="text-xs font-mono mt-2 space-y-1 pl-4">
                                <li>📁 <b>bin/</b></li>
                                <li>📁 <b>assets/</b></li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FolderTree className="size-32 text-white" />
                        </div>
                        <p className="text-emerald-500 font-bold mb-4 text-[10px] tracking-widest uppercase">Target Struktur Folder Akhir:</p>
                        <div className="font-mono text-xs text-slate-300 space-y-3">
                            <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>XenonSource/</b></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-slate-600"/> 📁 <b>assets/</b> <span className="text-slate-600 ml-2">// (Logo, Ikon)</span></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-emerald-500"/> 📁 <b>bin/</b> <span className="text-slate-500 ml-2">// (Isi ADB Tools ke sini)</span></p>
                            <p className="flex items-center gap-3 ml-6 text-emerald-400"><FileCode className="size-3"/> 📄 <b>bridge.js</b></p>
                            <p className="flex items-center gap-3 ml-6 text-emerald-400"><FileJson className="size-3"/> 📄 <b>package.json</b></p>
                            <p className="flex items-center gap-3 ml-6 text-amber-500"><FileJson className="size-3"/> 📄 <b>serviceAccountKey.json</b></p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-primary/5 border-primary/20">
                    <Info className="size-4 text-primary" />
                    <AlertTitle className="text-primary font-black uppercase text-[10px] tracking-widest">PENTING!</AlertTitle>
                    <AlertDescription className="text-xs text-primary/80">
                        Pastikan isi dari folder <b>platform-tools</b> (adb.exe, AdbWinApi.dll, dll) sudah dipindahkan semua ke dalam folder <b>bin/</b> yang baru Anda buat.
                    </AlertDescription>
                </Alert>
            </section>
        </TabsContent>

        {/* TAHAP 2: BUILD EXE */}
        <TabsContent value="build-exe" className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Proses Kompilasi Binary</h3>
                </div>

                <div className="grid gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">A</div>
                            <h4 className="font-bold text-sm uppercase">Membuat File Konfigurasi</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">Buka folder <code>XenonSource</code>, buat file bernama <code>package.json</code> dan isi dengan kode ini:</p>
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

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">B</div>
                            <h4 className="font-bold text-sm uppercase">Install & Compile</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">Buka Terminal/CMD di dalam folder <code>XenonSource</code> tersebut, jalankan perintah ini satu per satu:</p>
                        <CodeBlock code={`npm install -g pkg\nnpm install\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                        <p className="text-[10px] text-amber-600 font-medium italic">*Jika berhasil, file <b>xenon-bridge.exe</b> akan muncul di dalam folder.</p>
                    </div>

                    <div className="space-y-6 pt-6 border-t">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                                <Layers className="size-5" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Membangun Installer (Inno Setup)</h3>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-card border border-border space-y-4 shadow-sm">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Untuk membuat file <b>XenonBridge_Pro_Setup.exe</b> seperti di gambar referensi:
                            </p>
                            <ol className="text-xs space-y-4 pl-4">
                                <li className="flex gap-4"><Badge className="h-5 rounded-md px-1.5 bg-primary text-white">1</Badge> <span>Buka <b>Inno Setup Compiler</b>, klik <i>File &gt; New</i>.</span></li>
                                <li className="flex gap-4"><Badge className="h-5 rounded-md px-1.5 bg-primary text-white">2</Badge> <span>Pada <b>Application Main Executable</b>, pilih file <code>xenon-bridge.exe</code> yang tadi di-build.</span></li>
                                <li className="flex gap-4"><Badge className="h-5 rounded-md px-1.5 bg-primary text-white">3</Badge> <span>Pada <b>Other Application Files</b>, tambahkan seluruh folder <b>bin/</b> dan file <b>serviceAccountKey.json</b>.</span></li>
                                <li className="flex gap-4"><Badge className="h-5 rounded-md px-1.5 bg-primary text-white">4</Badge> <span>Gunakan skrip <code>hide.vbs</code> untuk menjalankan aplikasi secara tersembunyi.</span></li>
                                <li className="flex gap-4"><Badge className="h-5 rounded-md px-1.5 bg-primary text-white">5</Badge> <span>Klik <b>Compile</b>. Selamat! Installer Anda sudah siap didistribusikan ke laptop kasir.</span></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 3: TROUBLESHOOTING */}
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
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 1</Badge>
                            <h4 className="text-sm font-bold uppercase">File 'bin/adb.exe' tidak ditemukan saat dijalankan</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                <b>Penyebab:</b> Lupa memasukkan folder bin ke dalam aset di <code>package.json</code> atau Inno Setup.
                                <br/><b>Solusi:</b> Pastikan struktur folder saat build harus sama persis dengan saat instalasi.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 2</Badge>
                            <h4 className="text-sm font-bold uppercase">TV Menolak Koneksi (Target Refused)</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                <b>Penyebab:</b> USB Debugging dimatikan oleh sistem TV atau IP TV berubah.
                                <br/><b>Solusi:</b> Cek kembali Tahap 2 (Setting TV), pastikan IP Statis sudah terkunci.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Badge className="bg-red-500 text-white text-[8px] font-black uppercase">Masalah 3</Badge>
                            <h4 className="text-sm font-bold uppercase">Notifikasi Windows Tidak Muncul</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                <b>Penyebab:</b> PowerShell Policy di laptop kasir masih 'Restricted'.
                                <br/><b>Solusi:</b> Jalankan PowerShell sebagai Admin, ketik: <code>Set-ExecutionPolicy RemoteSigned</code>.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
