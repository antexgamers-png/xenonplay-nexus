'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Terminal, Laptop, Package, ShieldCheck, CheckCircle2, ArrowRight, Download, FileCode, Box, MonitorOff, FileText, Info, FolderTree, ExternalLink, Play, AlertTriangle, Image as ImageIcon, RefreshCw, ZoomIn, Search, HelpCircle, Zap, MonitorPlay, Wifi, Cpu, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
            <pre className="bg-slate-950 text-slate-300 p-6 pt-8 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/5 shadow-2xl">
                <code>{code.trim()}</code>
            </pre>
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
                <Copy className="size-3.5" />
            </Button>
        </div>
    );
};

export default function PanduanPortablePage() {
  return (
    <div className="flex flex-col gap-8 pb-20 max-w-4xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <Package className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Professional Installer Workflow</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Dokumentasi <span className="text-primary">XenonBridge (.exe)</span></h1>
        <p className="text-muted-foreground text-sm">
          Panduan teknis membangun, mengupdate, dan mengaktifkan installer Windows resmi yang berjalan <b>100% di Latar Belakang</b>.
        </p>
      </header>

      <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl flex items-start gap-4">
          <HelpCircle className="size-6 text-amber-600 shrink-0 mt-1" />
          <div className="space-y-2">
              <h4 className="font-black uppercase tracking-tight text-amber-700">Memahami Perilaku Aplikasi</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                  Setelah diinstal, Anda akan memiliki shortcut dengan logo <b>Xenon</b> di Desktop. Saat diklik, <b>memang tidak akan muncul jendela apa pun</b>. Ini disengaja (Silent Mode) agar sistem berjalan tenang di latar belakang.
              </p>
          </div>
      </div>

      <Tabs defaultValue="update" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl mb-8 border w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="update" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Update Script</TabsTrigger>
            <TabsTrigger value="pkg" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Build EXE</TabsTrigger>
            <TabsTrigger value="inno" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Buat Installer</TabsTrigger>
            <TabsTrigger value="test" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Tes ADB</TabsTrigger>
            <TabsTrigger value="debug" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Mode Debug</TabsTrigger>
        </TabsList>

        {/* TAB: UPDATE SCRIPT */}
        <TabsContent value="update" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                        <RefreshCw className="size-5" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Prosedur Pembaruan Script</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Karena aplikasi <b>.exe</b> bersifat statis, Anda tidak bisa mengedit script di dalamnya secara langsung. Anda harus melakukan kompilasi ulang (Rebuild) menggunakan folder sumber Anda.
                </p>
                
                <div className="grid gap-6">
                    <Card className="border-border bg-muted/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase text-primary tracking-widest">1. Edit File Sumber</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-4">
                            <p>Buka folder <b>XenonSource</b> di komputer build Anda. Cari file <code>bridge.js</code>.</p>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>Ambil kode terbaru dari menu <b>Simulator Control</b> di Dashboard ini.</li>
                                <li>Buka <code>bridge.js</code> dengan Notepad atau VS Code.</li>
                                <li>Timpa seluruh kodenya dengan yang baru saja disalin, lalu <b>Simpan</b>.</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase text-primary tracking-widest">2. Kompilasi Ulang</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">Buka CMD di folder tersebut dan jalankan perintah ini:</p>
                            <CodeBlock code={`pkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                            <Alert className="bg-blue-500/5 border-blue-500/20">
                                <Info className="size-4" />
                                <AlertDescription className="text-[10px] text-blue-700">
                                    Abaikan peringatan <i>"Failed to make bytecode"</i>. File EXE Anda tetap akan berfungsi normal.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase text-red-600 tracking-widest">3. Deployment (Ganti File)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex gap-4 items-start bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                    <div className="size-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">!</div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-red-700">HENTIKAN VERSI LAMA</p>
                                        <p className="text-[10px] text-red-600">Buka <b>Task Manager</b> (Ctrl+Shift+Esc), cari <code>xenon-bridge.exe</code>, lalu klik <b>End Task</b>.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                    <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-emerald-700">TIMPA FILE</p>
                                        <p className="text-[10px] text-emerald-600">Copy file <code>xenon-bridge.exe</code> hasil build baru, lalu paste/timpa ke folder instalasi di: <br/><code>C:\Program Files (x86)\XenonPlayBridge</code></p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="pkg" className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <section className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">1</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Persiapan Lingkungan Build</h3>
                </div>
                <p className="text-sm text-muted-foreground">Jika Anda menggunakan laptop baru, pastikan alat build terinstal:</p>
                <CodeBlock code={`npm install -g pkg\nnpm init -y\nnpm install firebase-admin`} />
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">2</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Struktur Folder XenonSource</h3>
                </div>
                <Card className="border-primary/20 bg-primary/[0.01]">
                    <CardContent className="pt-6">
                        <div className="p-5 rounded-3xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed shadow-2xl border border-white/5 relative overflow-hidden">
                            <p className="text-primary font-bold mb-2">📁 XenonSource/</p>
                            <p>├── 📄 bridge.js <span className="text-[9px] text-slate-500">(File script utama)</span></p>
                            <p>├── 📄 serviceAccountKey.json <span className="text-[9px] text-slate-500">(Kunci Firebase)</span></p>
                            <p>├── 📄 package.json <span className="text-[9px] text-slate-500">(Metadata project)</span></p>
                            <p>├── 📄 hide.vbs <span className="text-[9px] text-slate-500">(Script silent mode)</span></p>
                            <p>├── 📄 app-icon.ico</p>
                            <p>└── 📁 <b>bin/</b> <span className="text-[9px] text-emerald-500 font-bold">(Isi adb.exe, AdbWinApi.dll, AdbWinUsbApi.dll)</span></p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </TabsContent>

        <TabsContent value="inno" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">1</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Langkah Build Installer (.exe)</h3>
                </div>
                
                <div className="grid gap-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-primary">A. Persiapan Alat</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-3">
                            <p>Download dan instal <b>Inno Setup Compiler</b> (Versi 6+) dari situs resminya.</p>
                            <p>Pastikan seluruh file di folder <b>XenonSource</b> sudah lengkap (termasuk file <code>xenon-bridge.exe</code> yang baru saja Anda build di tab sebelumnya).</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-primary">B. Skrip Konfigurasi (.iss)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">Buat file baru bernama <code>installer.iss</code> di dalam folder XenonSource, lalu salin kode ini:</p>
                            <CodeBlock language="Inno Setup Script" code={`
[Setup]
AppName=XenonPlay Bridge
AppVersion=1.3.0
DefaultDirName={autopf}\\XenonPlayBridge
OutputDir=.
OutputBaseFilename=XenonBridge_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=app-icon.ico

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\\*"; DestDir: "{app}\\bin"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "hide.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "app-icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\\app-icon.ico"
Name: "{userstartup}\\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\\app-icon.ico"

[Run]
Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; WorkingDir: "{app}"; Description: "Jalankan XenonPlay Bridge"; Flags: nowait postinstall skipifsilent
                            `} />
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-primary">C. Proses Kompilasi</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-4">
                            <ol className="list-decimal list-inside space-y-3">
                                <li>Klik kanan file <code>installer.iss</code>, pilih <b>Compile</b>.</li>
                                <li>Atau buka program Inno Setup, pilih <b>Open existing script</b>, cari file <code>installer.iss</code>, lalu klik ikon <b>Play (Run)</b> di toolbar.</li>
                                <li>Tunggu hingga selesai. File <b><code>XenonBridge_Setup.exe</code></b> akan muncul di dalam folder XenonSource Anda.</li>
                            </ol>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                <p className="text-emerald-700 font-bold uppercase tracking-tight">Installer Siap Didistribusikan!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="test" className="space-y-8 animate-in fade-in zoom-in-95">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xl shadow-emerald-500/20 text-lg">
                        <Cpu className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Verifikasi Alat ADB Manual</h3>
                        <p className="text-xs text-muted-foreground italic">Gunakan ini jika TV tidak merespons sama sekali.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Cara Tes Tanpa Aplikasi Bridge</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ol className="text-xs space-y-4 text-muted-foreground">
                                <li className="flex gap-3">
                                    <span className="font-black text-primary">01.</span>
                                    <div>
                                        <p className="text-foreground font-bold mb-1">Buka folder instalasi di CMD</p>
                                        <p>Buka CMD, ketik perintah ini:</p>
                                        <div className="mt-2"><CodeBlock code={`cd "C:\\Program Files (x86)\\XenonPlayBridge\\bin"`} /></div>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-black text-primary">02.</span>
                                    <div>
                                        <p className="text-foreground font-bold mb-1">Coba sambung paksa ke IP TV</p>
                                        <p>Ganti [IP_TV] dengan alamat IP TV Anda (misal 192.168.1.10):</p>
                                        <div className="mt-2"><CodeBlock code={`adb connect [IP_TV]:5555`} /></div>
                                    </div>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="debug" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xl shadow-amber-500/20 text-lg">
                        <MonitorPlay className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Melihat Log Langsung</h3>
                        <p className="text-xs text-muted-foreground italic">Gunakan ini untuk melihat aktivitas bridge secara visual.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-amber-500/20 bg-amber-500/[0.02]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-amber-700 tracking-widest">Langkah Debug</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex gap-4 items-start bg-background p-4 rounded-xl border border-border">
                                    <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                    <p className="text-xs font-medium">Matikan bridge di <b>Task Manager</b>.</p>
                                </div>
                                <div className="flex gap-4 items-start bg-background p-4 rounded-xl border border-border">
                                    <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                    <p className="text-xs font-medium">Jalankan file <b><code>xenon-bridge.exe</code></b> langsung dari folder instalasi.</p>
                                </div>
                                <div className="flex gap-4 items-start bg-background p-4 rounded-xl border border-border">
                                    <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                    <p className="text-xs font-medium">Jendela CMD akan terbuka dan menampilkan status koneksi per detik.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
