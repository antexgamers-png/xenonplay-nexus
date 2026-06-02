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
    Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/alert";
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
          Instruksi lengkap instalasi jembatan kontrol TV otomatis (ADB Bridge) menggunakan arsitektur Hybrid v1.3.3 yang anti-macet.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
          <Alert className="bg-blue-500/5 border-blue-500/20">
              <Info className="size-4 text-blue-600" />
              <AlertTitle className="text-blue-700 font-black uppercase text-[10px] tracking-widest">Update Penting v1.3.3</AlertTitle>
              <AlertDescription className="text-[10px] text-blue-600/80 leading-relaxed">
                  Versi ini memperbaiki bug "Single Queue" yang membuat TV membeku jika salah satu unit offline. Kini sistem berjalan <b>Paralel</b> dan 100% kompatibel dengan Smart TV MediaTek.
              </AlertDescription>
          </Alert>
          <Alert className="bg-emerald-500/5 border-emerald-500/20">
              <Zap className="size-4 text-emerald-600" />
              <AlertTitle className="text-emerald-700 font-black uppercase text-[10px] tracking-widest">RAM Watchdog Enabled</AlertTitle>
              <AlertDescription className="text-[10px] text-emerald-600/80 leading-relaxed">
                  Sistem pengawas waktu kini disimpan di RAM laptop kasir. Menghemat ribuan kuota Firestore harian karena tidak perlu terus-menerus mengecek cloud.
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
                            <Download className="size-4 text-primary" /> Software Wajib (Download)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">1</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase">Node.js LTS (v20+)</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">Mesin utama untuk menjalankan skrip bridge.</p>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" asChild>
                                        <a href="https://nodejs.org/" target="_blank"><ExternalLink className="size-3 mr-2" /> Download Node.js</a>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">2</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase">ADB Platform Tools</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">Binary inti untuk mengontrol TV via WiFi.</p>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" asChild>
                                        <a href="https://developer.android.com/tools/releases/platform-tools" target="_blank"><ExternalLink className="size-3 mr-2" /> Download ADB</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                    <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <Wifi className="size-4" /> Persiapan Jaringan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Laptop dan seluruh TV harus berada dalam <b>Satu Jaringan WiFi</b>.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Profil WiFi Windows wajib diset ke <b>PRIVATE</b> agar tidak diblokir firewall.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Gunakan <b>IP Statis</b> pada TV (Lihat Tab 2).</span>
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
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konstruksi Folder Kerja</h3>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FolderTree className="size-32 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <FolderOpen className="size-4 text-emerald-500" />
                        <p className="text-emerald-500 font-bold text-[10px] tracking-widest uppercase">Lokasi Rekomendasi: C:\XenonBridge</p>
                    </div>
                    <div className="font-mono text-xs text-slate-300 space-y-3">
                        <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>bin/</b> <span className="text-slate-500 ml-4">// Ekstrak isi Platform Tools ke sini (adb.exe, dll)</span></p>
                        <p className="flex items-center gap-3"><FileCode className="size-3 text-primary"/> 📄 <b>bridge.js</b> <span className="text-slate-500 ml-4">// Kode dari menu Simulator v1.3.3</span></p>
                        <p className="flex items-center gap-3"><FileJson className="size-3 text-primary"/> 📄 <b>serviceAccountKey.json</b> <span className="text-slate-500 ml-4">// Kunci Admin dari Firebase Console</span></p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Inisialisasi Project</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka CMD di dalam folder <code>C:\XenonBridge</code>, lalu jalankan perintah ini satu per satu:</p>
                    <CodeBlock code={`npm init -y\nnpm install firebase-admin`} />
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 2: SETUP TV */}
        <TabsContent value="tahap-2" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Rahasia Smart TV</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Settings className="size-4 text-primary" /> 1. Aktifkan Debugging
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-[11px] text-muted-foreground leading-relaxed">
                            <ol className="space-y-3">
                                <li className="flex gap-3"><span className="font-black text-primary">A.</span> Buka Settings &gt; About &gt; Klik <b>Build Number</b> 7x sampai muncul "You are a developer".</li>
                                <li className="flex gap-3"><span className="font-black text-primary">B.</span> Masuk ke <b>Developer Options</b> &gt; Aktifkan <b>USB Debugging</b>.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">C.</span> Aktifkan <b>Wireless Debugging</b> (Jika ada).</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap className="size-4 text-primary" /> 2. Kunci IP Statis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                TV <b>Wajib</b> memiliki IP Statis agar koneksi tidak berubah saat router restart. 
                                <br/><br/>
                                Atur di menu: <i>Network &amp; Internet &gt; IP Settings &gt; Static</i>. 
                                <br/>Contoh: <code>192.168.1.50</code>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 3: BUILD EXE (SANGAT DETAIL) */}
        <TabsContent value="build-exe" className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
            <header className="space-y-2">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20">
                        <Wrench className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Langkah Build Executable (.EXE)</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Mengubah skrip v1.3.3 menjadi aplikasi mandiri Windows.</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-8">
                {/* LANGKAH 1: PACKAGE JSON */}
                <Card className="border-border overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <FileJson className="size-4 text-primary" /> 1. Konfigurasi Metadata (Aset)
                            </CardTitle>
                            <Badge variant="secondary" className="text-[8px] font-black">package.json</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Buka file <code>package.json</code> di folder <code>XenonBridge</code> Anda, lalu <b>timpa seluruh isinya</b> dengan kode ini. 
                            Bagian <code>"pkg"</code> sangat penting agar file <code>adb.exe</code> dan <code>serviceAccountKey.json</code> ikut terbungkus ke dalam file EXE.
                        </p>
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
                    </CardContent>
                </Card>

                {/* LANGKAH 2: KOMPILASI */}
                <Card className="border-border overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="size-4 text-primary" /> 2. Proses Kompilasi Terminal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-xs text-muted-foreground">Instal alat pembungkus EXE secara global, lalu jalankan perintah kompilasi:</p>
                        <CodeBlock code={`npm install -g pkg\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                        <Alert className="bg-blue-500/5 border-blue-500/20 mt-4">
                            <Info className="size-4 text-blue-600" />
                            <AlertDescription className="text-[10px] text-blue-700">
                                Jika muncul peringatan <i>"Failed to make bytecode"</i>, abaikan saja. File <code>xenon-bridge.exe</code> akan tetap muncul di folder Anda.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* LANGKAH 3: SILENT MODE */}
                <Card className="border-emerald-500/20 bg-emerald-500/[0.01] overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                <MousePointer2 className="size-4" /> 3. Aktifkan Silent Mode & Notifikasi
                            </CardTitle>
                            <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black">REKOMENDASI</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Agar jendela hitam CMD tidak mengganggu kasir saat bekerja, kita gunakan skrip VBScript untuk "menyembunyikan" aplikasinya namun tetap mendapatkan notifikasi sukses di pojok layar.
                        </p>
                        
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Buat file baru: <code>run-bridge.vbs</code></p>
                            <CodeBlock language="vbs" code={`Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run "xenon-bridge.exe", 0, false`} />
                        </div>

                        <div className="p-4 rounded-xl bg-background border border-border flex items-start gap-4">
                            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <BellRing className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase text-primary">Fitur Startup Alert v1.3.3</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    Meskipun jendela CMD hilang, kasir akan tetap melihat <b>Pop-up Notifikasi Windows</b> bertuliskan: <br/>
                                    <span className="text-emerald-600 font-bold">"Xenon Bridge V1.3.3 Hybrid telah AKTIF di latar belakang."</span>
                                    <br/>Ini memastikan kasir tahu bahwa sistem sudah siap mengontrol TV.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
                            <ShieldAlert className="size-4" /> Masalah Saat Build / Menjalankan EXE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <div className="p-6 space-y-8">
                                {/* Masalah 1 */}
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 01</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">Perintah 'pkg' tidak dikenali (Not Recognized)</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> Pkg belum terinstal secara global atau PATH Node.js belum terdaftar di Windows.
                                        <br/><b>Solusi:</b> Gunakan perintah <code>npx pkg . --targets node18-win-x64</code> atau pastikan sudah menjalankan <code>npm install -g pkg</code> dengan hak akses Administrator.
                                    </p>
                                </div>
                                <Separator />
                                {/* Masalah 2 */}
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 02</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">EXE Jalan, Tapi TV Tidak Merespons (Offline)</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> File ADB di folder <code>bin/</code> tidak ikut terbawa ke dalam EXE atau TV belum "Authorize".
                                        <br/><b>Solusi:</b> Cek folder <code>C:\XenonBridge\bin</code>, pastikan ada file <code>adb.exe</code>. Lakukan tes manual: Ketik <code>adb connect [IP_TV]:5555</code> di CMD biasa, lalu cek layar TV untuk klik "Izinkan Selalu".
                                    </p>
                                </div>
                                <Separator />
                                {/* Masalah 3 */}
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 03</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">Notifikasi PowerShell Tidak Muncul</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> Execution Policy PowerShell di Windows dibatasi (Restricted).
                                        <br/><b>Solusi:</b> Buka PowerShell as Admin, ketik: <code>Set-ExecutionPolicy RemoteSigned</code> lalu tekan Y. Ini mengizinkan skrip notifikasi bridge berjalan.
                                    </p>
                                </div>
                                <Separator />
                                {/* Masalah 4 */}
                                <div className="space-y-3">
                                    <Badge className="bg-red-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Kasus 04</Badge>
                                    <h4 className="text-sm font-black uppercase leading-tight">Error 'ServiceAccountKey.json' Not Found</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        <b>Sebab:</b> Nama file kunci di folder tidak sama dengan yang tertulis di <code>bridge.js</code>.
                                        <br/><b>Solusi:</b> Pastikan file kunci Anda bernama persis <code>serviceAccountKey.json</code> (perhatikan huruf besar-kecilnya) dan berada di folder utama yang sama dengan <code>bridge.js</code>.
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-10" />

      <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
          <div className="size-20 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30 rotate-3">
              <ShieldCheck className="size-10" />
          </div>
          <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black uppercase tracking-tight text-primary">Kunci Stabilitas Total</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
                  "Rahasia sistem yang tidak pernah gagal adalah <b>Jaringan Tanpa Traffic Luar</b>. Jangan biarkan pelanggan masuk ke WiFi Bridge. Gunakan router terpisah untuk sinyal kontrol agar perintah ADB masuk tepat dalam milidetik tanpa antrean paket data YouTube/Sosmed pemain."
              </p>
          </div>
      </div>
    </div>
  );
}
