
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
    Search,
    FileKey,
    UserCog,
    Settings2
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
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Stability Guide v1.3.0 Final</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Master Hardware</span></h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">
          Instruksi lengkap instalasi jembatan kontrol TV otomatis (ADB Bridge) dari tahap nol hingga operasional stabil.
        </p>
      </header>

      <Tabs defaultValue="tahap-0" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl mb-8 border flex w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="tahap-0" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Cpu className="size-3.5"/> 0. Persiapan Alat</TabsTrigger>
            <TabsTrigger value="tahap-1" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Laptop className="size-3.5"/> 1. Setup Laptop</TabsTrigger>
            <TabsTrigger value="tahap-2" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2"><Monitor className="size-3.5"/> 2. Setting TV</TabsTrigger>
            <TabsTrigger value="trouble" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 flex-1 gap-2 text-red-500"><ShieldAlert className="size-3.5"/> 3. Troubleshooting</TabsTrigger>
        </TabsList>

        {/* TAHAP 0: PERSIAPAN ALAT */}
        <TabsContent value="tahap-0" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Download className="size-4 text-primary" /> Software Wajib
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">1</div>
                                <div>
                                    <p className="text-sm font-bold uppercase">Node.js LTS Version</p>
                                    <p className="text-xs text-muted-foreground mt-1">Download di <b>nodejs.org</b>. Pilih versi 20.x ke atas untuk stabilitas terbaik.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">2</div>
                                <div>
                                    <p className="text-sm font-bold uppercase">ADB Platform Tools</p>
                                    <p className="text-xs text-muted-foreground mt-1">Komponen utama untuk menyambung laptop ke TV secara nirkabel.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                    <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <Wifi className="size-4" /> Syarat Jaringan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Laptop dan seluruh TV harus berada dalam <b>Satu Jaringan WiFi</b> yang sama.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Gunakan Router dengan standar minimal <b>WiFi 5 (AC)</b> agar tidak terjadi delay perintah.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-muted-foreground items-start">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span>Profil WiFi di Windows harus diset ke <b>PRIVATE</b> (Bukan Public).</span>
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
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Folder & File</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Agar Bridge bisa berjalan, Anda harus menyiapkan folder khusus di Desktop laptop kasir Anda.
                </p>
                <div className="p-6 rounded-[2rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FolderTree className="size-32 text-white" />
                    </div>
                    <p className="text-emerald-500 font-bold mb-3 text-xs tracking-widest">STRUKTUR FOLDER: C:\Users\Kasir\Desktop\XenonBridge</p>
                    <div className="font-mono text-xs text-slate-300 space-y-2">
                        <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 bin/ <span className="text-slate-500 ml-4">// Isi dengan file adb.exe dari platform-tools</span></p>
                        <p className="flex items-center gap-3"><FileCode className="size-3 text-primary"/> 📄 bridge.js <span className="text-slate-500 ml-4">// Ambil di menu Simulator Control</span></p>
                        <p className="flex items-center gap-3"><FileKey className="size-3 text-primary"/> 📄 serviceAccountKey.json <span className="text-slate-500 ml-4">// Kunci Admin dari Firebase</span></p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Instalasi Jalur Data</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Buka CMD di dalam folder <b>XenonBridge</b> tersebut, lalu jalankan perintah instalasi library ini:</p>
                    <CodeBlock code={`npm install firebase-admin`} />
                </div>
            </section>
        </TabsContent>

        {/* TAHAP 2: SETTING TV */}
        <TabsContent value="tahap-2" className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Konfigurasi Smart TV (MediaTek/Android)</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Settings2 className="size-4 text-primary" /> A. Aktifkan Izin Remot
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-xs text-muted-foreground leading-relaxed">
                            <ol className="space-y-3">
                                <li className="flex gap-3"><span className="font-black text-primary">01.</span> Buka <b>Settings</b> &gt; <b>Device Preferences</b> &gt; <b>About</b>.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">02.</span> Tekan tombol OK di remote sebanyak <b>7 kali</b> pada "Build Number" hingga muncul notifikasi "You are now a developer".</li>
                                <li className="flex gap-3"><span className="font-black text-primary">03.</span> Kembali ke menu sebelumnya, buka <b>Developer Options</b>.</li>
                                <li className="flex gap-3"><span className="font-black text-primary">04.</span> Aktifkan <b>USB Debugging</b> dan <b>Wireless Debugging</b>.</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Network className="size-4 text-primary" /> B. Kunci Alamat IP (Wajib)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                TV tidak boleh berubah alamat IP-nya. Jika berubah, Bridge tidak akan bisa menemukannya.
                            </p>
                            <Alert className="bg-amber-500/5 border-amber-500/20">
                                <Info className="size-4 text-amber-600" />
                                <AlertDescription className="text-[10px] text-amber-700">
                                    Buka <b>Network &amp; Internet</b> &gt; Pilih WiFi Anda &gt; <b>IP Settings</b> &gt; Ubah ke <b>Static</b>. Catat IP ini (Contoh: 192.168.1.15).
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </TabsContent>

        {/* TAB: TROUBLESHOOTING */}
        <TabsContent value="trouble" className="space-y-8 animate-in fade-in zoom-in-95">
            <section className="space-y-6">
                <div className="flex items-center gap-4 text-red-500">
                    <div className="size-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black shadow-xl shadow-red-500/20 text-lg">!</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Pusat Resolusi Kendala</h3>
                </div>

                <div className="grid gap-6">
                    {/* MASALAH 1 */}
                    <div className="p-6 rounded-3xl border border-red-500/20 bg-red-500/[0.02] flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <Badge className="bg-red-500 text-white border-none text-[9px] font-black uppercase px-2 mb-3">Gejala</Badge>
                            <h4 className="text-sm font-black uppercase text-red-700">Status Offline di Dashboard</h4>
                            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                Anda sudah menyalakan script tetapi indikator unit di web tetap berwarna merah.
                            </p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 rounded-2xl bg-white border border-border shadow-sm">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2"><CheckCircle2 className="size-3.5 text-emerald-500"/> Solusi Utama:</p>
                                <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-2 ml-1">
                                    <li>Cek apakah alamat IP di <b>Integrasi &gt; Pengaturan IP TV</b> sudah sama dengan IP yang ada di menu WiFi TV.</li>
                                    <li>Coba matikan (Ctrl+C) dan jalankan ulang script dengan <code>node bridge.js</code>.</li>
                                    <li>Pastikan laptop kasir <b>TIDAK</b> menggunakan VPN.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* MASALAH 2 */}
                    <div className="p-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.02] flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <Badge className="bg-amber-500 text-white border-none text-[9px] font-black uppercase px-2 mb-3">Gejala</Badge>
                            <h4 className="text-sm font-black uppercase text-amber-700">"Connection Refused"</h4>
                            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                Log di terminal menunjukkan pesan "Failed to connect to IP:5555".
                            </p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 rounded-2xl bg-white border border-border shadow-sm">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2"><CheckCircle2 className="size-3.5 text-emerald-500"/> Solusi Utama:</p>
                                <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-2 ml-1">
                                    <li>Masuk ke <b>Developer Options</b> di TV, matikan "USB Debugging" lalu nyalakan lagi (Reset Socket).</li>
                                    <li>Cabut kabel power TV selama 10 detik lalu nyalakan kembali untuk membersihkan sistem Android TV.</li>
                                    <li>Pastikan <b>Firewall Windows</b> di laptop sudah memberi izin akses (Allow) untuk <b>node.exe</b>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* MASALAH 3 */}
                    <div className="p-6 rounded-3xl border border-blue-500/20 bg-blue-500/[0.02] flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <Badge className="bg-blue-500 text-white border-none text-[9px] font-black uppercase px-2 mb-3">Gejala</Badge>
                            <h4 className="text-sm font-black uppercase text-blue-700">"Device Unauthorized"</h4>
                            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                                Script jalan, TV online, tapi perintah tidak pernah masuk ke TV.
                            </p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 rounded-2xl bg-white border border-border shadow-sm">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2"><CheckCircle2 className="size-3.5 text-emerald-500"/> Solusi Utama:</p>
                                <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-2 ml-1">
                                    <li>Lihat ke layar TV, biasanya ada kotak konfirmasi "Allow USB Debugging?".</li>
                                    <li>Centang <b>"Always allow from this computer"</b> lalu klik <b>OK</b>.</li>
                                    <li>Jika kotak tidak muncul, gunakan menu "Revoke USB debugging authorizations" di Developer Options lalu sambungkan ulang.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </TabsContent>
      </Tabs>

      <Separator className="my-10" />

      {/* FINAL ADVICE */}
      <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
          <div className="size-20 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30 rotate-3">
              <ShieldCheck className="size-10" />
          </div>
          <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black uppercase tracking-tight text-primary">Kunci Stabilitas Operasional</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  "Rahasia sistem yang tidak pernah gagal adalah <b>Jaringan WiFi yang Kosong</b>. Jangan sambungkan HP pelanggan ke WiFi yang sama dengan jalur Bridge TV. Gunakan WiFi terpisah agar sinyal kontrol tidak terganggu traffic YouTube/Instagram."
              </p>
          </div>
      </div>
    </div>
  );
}
