'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    ShieldCheck, 
    Monitor, 
    Zap, 
    CheckCircle2, 
    Copy, 
    Terminal, 
    Download, 
    Settings, 
    Cpu, 
    Package, 
    FileCode, 
    FileJson, 
    BellRing, 
    FolderTree, 
    Info, 
    ExternalLink, 
    RefreshCw, 
    ShieldAlert, 
    Box,
    Layers,
    Keyboard,
    FileText,
    Activity,
    Check,
    Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

const RESPONSIVE_HYBRID_BRIDGE_V1_3_5 = `
/**
 * XENONPLAY NEXUS - XPBridge v1.3.5 (Responsive Hybrid)
 * Gabungan Kecepatan v1.2.8 + Kecerdasan v1.3.3
 */

const admin = require('firebase-admin');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

// --- 1. PATH RESOLUTION (FIX FATAL ERROR) ---
const isPkg = !!process.pkg;
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;

// --- 2. DUAL LOGGING ---
const logFile = path.join(baseDir, "bridge.log");
function log(msg) {
    const timestamp = new Date().toLocaleString('id-ID');
    const fullMsg = \`[\${timestamp}] \${msg}\`;
    console.log(fullMsg);
    try { fs.appendFileSync(logFile, fullMsg + "\\n"); } catch (e) {}
}

log("==================================================");
log("🚀 XENON BRIDGE V1.3.5 RESPONSIVE HYBRID ACTIVE");
log("📍 Root: " + baseDir);
log("==================================================");

// --- 3. KONFIGURASI ---
const serviceAccountPath = path.join(baseDir, "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
    log("❌ FATAL: serviceAccountKey.json tidak ditemukan!");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const adbPath = path.join(baseDir, 'bin', 'adb.exe');
const adbCmd = fs.existsSync(adbPath) ? \`"\${adbPath}"\` : 'adb';

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const localSessions = new Map();
const execOptions = { windowsHide: true, timeout: 10000 };

async function sendStartupNotification() {
    const msg = "Xenon Bridge V1.3.5 (Responsive) AKTIF.";
    const cmd = \`powershell -Command "(New-Object -ComObject WScript.Shell).Popup('\${msg}', 4, 'XenonPlay Nexus', 64)"\`;
    try { await execAsync(cmd, execOptions); } catch (e) {}
}

sendStartupNotification();

// Listener Perintah
db.collection('stations').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(async change => {
    const data = change.doc.data();
    const stationId = change.doc.id;

    // Sinkronisasi RAM Watchdog
    if (data.is_active && data.end_time) {
        localSessions.set(stationId, { name: data.name, endTime: data.end_time, ip: data.ipAddress, hdmi: data.hdmiIndex || 1 });
    } else {
        localSessions.delete(stationId);
    }

    // Eksekusi Signal
    if (data.last_action) {
      log(\`📡 Signal: \${data.last_action.toUpperCase()} -> \${data.name}\`);
      await db.collection('stations').doc(stationId).update({ last_action: null });
      handleAdbWorkflow(data.ipAddress, data.last_action, data.hdmiIndex || 1, data.name, stationId);
    }
  });
});

async function handleAdbWorkflow(ip, action, hdmi, name, stationId) {
    if (!ip) return;
    try {
        // Langsung connect tanpa disconnect (v1.2.8 style - LEBIH CEPAT)
        await execAsync(\`\${adbCmd} connect \${ip}:5555\`, execOptions);
        
        const hw = 4 + parseInt(hdmi);
        const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hw}\`;

        if (action === 'start' || action === 'wake' || action === 'resume' || action === 'hdmi') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 224"\`, execOptions); 
            await new Promise(r => setTimeout(r, 600)); // Latensi stabilitas
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "\${intent}"\`, execOptions); 
        } 
        else if (action === 'stop' || action === 'sleep' || action === 'pause') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 3"\`, execOptions); 
            await new Promise(r => setTimeout(r, 400));
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 223"\`, execOptions); 
        }
        else if (action === 'ping') {
            const { stdout } = await execAsync(\`\${adbCmd} -s \${ip}:5555 shell getprop sys.boot_completed\`, execOptions);
            if (stdout.trim() === '1') {
                log(\`✅ [\${name}] Heartbeat OK\`);
                await db.collection('stations').doc(stationId).update({ last_heartbeat: admin.firestore.FieldValue.serverTimestamp() });
            }
        }
    } catch (err) {
        log(\`❌ [\${name}] Error: \${err.message}\`);
    }
}

// RAM Watchdog (Interval 2 detik)
setInterval(() => {
    const now = Date.now();
    localSessions.forEach((session, id) => {
        if (now >= session.endTime) {
            log(\`⏰ [\${session.name}] Durasi Habis.\`);
            db.collection('stations').doc(id).update({
                is_active: false,
                end_time: null,
                last_action: 'stop',
                last_action_timestamp: now
            });
            localSessions.delete(id);
        }
    });
}, 2000);
`;

export default function MasterPanduanPage() {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(RESPONSIVE_HYBRID_BRIDGE_V1_3_5.trim());
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({ title: "Script v1.3.5 Tersalin!", variant: "success" });
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">XenonPlay Nexus Enterprise v1.3.5 "Responsive Hybrid"</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Panduan <span className="text-primary">Master Terintegrasi</span></h1>
        <p className="text-muted-foreground text-sm max-w-3xl font-medium">
          Dua pilar utama untuk menjaga stabilitas operasional: Teknik membangun software installer dan konfigurasi hardware yang presisi.
        </p>
      </header>

      <Tabs defaultValue="installer" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-16 rounded-[2rem] mb-12 border flex w-full overflow-x-auto">
            <TabsTrigger value="installer" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all min-w-[200px]">
                <Package className="size-5"/> 1. Membangun Installer
            </TabsTrigger>
            <TabsTrigger value="konfigurasi" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all min-w-[200px]">
                <Settings className="size-5"/> 2. Konfigurasi Laptop & TV
            </TabsTrigger>
            <TabsTrigger value="bridge" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all min-w-[200px]">
                <FileCode className="size-5"/> 3. Script Bridge
            </TabsTrigger>
        </TabsList>

        <TabsContent value="installer" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                <Terminal className="size-4 text-primary" /> 2. ADB Platform Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Paket binary <code>adb.exe</code> dan file pendukung DLL untuk kontrol TV.</p>
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

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Menyiapkan Folder XenonSource</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Buat folder baru bernama <b>XenonSource</b> di Desktop. Folder ini adalah dapur produksi Anda.
                        </p>
                        <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">A</div>
                                <p className="text-xs font-bold uppercase">Folder bin/ (3 File Wajib)</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-9 leading-relaxed">Pastikan folder <b>bin/</b> berisi 3 file ini: <code>adb.exe</code>, <code>AdbWinApi.dll</code>, dan <code>AdbWinUsbApi.dll</code>. Tanpa DLL, bridge akan crash.</p>
                            
                            <div className="flex items-center gap-3">
                                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">B</div>
                                <p className="text-xs font-bold uppercase">Folder assets/</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-9">Masukkan ikon aplikasi Anda di sini. Simpan dengan nama <b><code>app-icon.ico</code></b> (Wajib).</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FolderTree className="size-32 text-white" />
                        </div>
                        <p className="text-emerald-500 font-bold mb-4 text-[10px] tracking-widest uppercase">Target Struktur Folder Akhir:</p>
                        <div className="font-mono text-[11px] text-slate-300 space-y-3">
                            <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>XenonSource/</b></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-slate-600"/> 📁 <b>assets/</b></p>
                            <p className="flex items-center gap-3 ml-12 text-slate-400">📄 <b>app-icon.ico</b></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-emerald-500"/> 📁 <b>bin/</b></p>
                            <p className="flex items-center gap-3 ml-12 text-emerald-400">📄 <b>adb.exe</b></p>
                            <p className="flex items-center gap-3 ml-12 text-emerald-400">📄 <b>AdbWinApi.dll</b></p>
                            <p className="flex items-center gap-3 ml-12 text-emerald-400">📄 <b>AdbWinUsbApi.dll</b></p>
                            <p className="flex items-center gap-3 ml-6 text-primary"><FileCode className="size-3"/> 📄 <b>bridge.js</b></p>
                            <p className="flex items-center gap-3 ml-6 text-primary"><FileJson className="size-3"/> 📄 <b>package.json</b></p>
                            <p className="flex items-center gap-3 ml-6 text-amber-500"><FileJson className="size-3"/> 📄 <b>serviceAccountKey.json</b></p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Membuat File Konfigurasi</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Di dalam folder <b>XenonSource</b>, buat file bernama <b><code>package.json</code></b> agar seluruh aset di atas ikut terbungkus otomatis:
                    </p>
                    <CodeBlock language="json" code={`{
  "name": "xenon-bridge-hybrid",
  "version": "1.3.5",
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

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Proses Kompilasi & Installer</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-2 items-start">
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                            <Terminal className="size-4 text-primary" /> Langkah A: Build Binary (.exe)
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Buka CMD di folder <b>XenonSource</b> dan jalankan perintah ini satu per satu:
                        </p>
                        <CodeBlock code={`npm install\nnpm install -g pkg\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                        <Alert className="bg-emerald-500/5 border-emerald-500/20">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <AlertTitle className="text-emerald-700 font-bold uppercase text-[10px]">Verifikasi!</AlertTitle>
                            <AlertDescription className="text-[10px] text-emerald-600">Pastikan file <b>xenon-bridge.exe</b> sudah muncul di folder Anda.</AlertDescription>
                        </Alert>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-card border border-border space-y-4">
                        <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                            <FileText className="size-4 text-primary" /> Langkah B: Skrip Inno Setup (.iss)
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Buat file baru bernama <b><code>setup.iss</code></b> di folder XenonSource, lalu tempel kode ini.
                        </p>
                        <CodeBlock language="iss" code={`[Setup]
AppName=XenonPlay Bridge
AppVersion=1.3.5
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
                            Simpan, lalu <b>klik kanan setup.iss &gt; Compile</b>. Anda akan mendapatkan file <b>XenonBridge_Pro_Setup.exe</b>.
                        </p>
                    </div>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="konfigurasi" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xl shadow-amber-500/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Sinkronisasi & Handshake Manual</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Instal file <b>XenonBridge_Pro_Setup.exe</b> di laptop kasir. Sebelum digunakan secara otomatis, lakukan langkah <b>Fail-Proof</b> ini satu kali:
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-amber-500">
                                <Keyboard className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Handshake ADB (Sekali Saja)</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">Langkah ini wajib agar status TV tidak 'Unauthorized'. Buka CMD di laptop dan ketik:</p>
                            <CodeBlock code={`cd "C:\\Program Files (x86)\\XenonPlayBridge\\bin"\nadb connect [ALAMAT_IP_TV]:5555`} />
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[10px] text-amber-600 font-bold italic">"PENTING: Cek layar TV Anda, centang 'Always Allow' lalu klik OK saat muncul popup izin koneksi."</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-muted/30 border border-border space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <ShieldAlert className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Izin Notifikasi Windows</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">Agar notifikasi startup 100% muncul, Anda harus mengizinkan eksekusi skrip di Windows. Jalankan <b>PowerShell sebagai Admin</b> dan ketik:</p>
                            <CodeBlock code={`Set-ExecutionPolicy RemoteSigned`} />
                            <p className="text-[10px] text-muted-foreground italic leading-tight">Pilih <b>[Y] Yes</b> saat diminta konfirmasi.</p>
                        </div>
                    </div>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="bridge" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Apa yang baru di v1.3.5?</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="size-4 text-primary" /> Responsive Core
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Menghapus jeda diskoneksi yang tidak perlu. Signal dikirim secara instan ke TV (Zero Overhead) layaknya versi v1.2.8 namun dengan sistem keamanan v1.3.
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Layers className="size-4 text-emerald-600" /> Path Resolution Fix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Memperbaiki kesalahan pembacaan folder saat dibungkus EXE. Bridge v1.3.5 dijamin bisa menemukan file ADB dan kunci Firebase Anda di mana pun folder instalasinya.
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <FileText className="size-4 text-amber-600" /> Dual-Mode Logging
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Mencatat setiap aktivitas ke file <code>bridge.log</code>. Memudahkan penelusuran jika TV tiba-tiba tidak merespon perintah dari server.
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="size-4 text-blue-600" /> Hybrid RAM Watchdog
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Pengecekan sisa waktu dilakukan di memori RAM setiap 2 detik. Menghemat biaya operasional Firestore hingga 90%.
                    </CardContent>
                </Card>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                    <FileCode className="size-32 text-white" />
                </div>
                
                <div className="space-y-2 relative z-10">
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-4 h-6 font-black uppercase text-[10px] tracking-widest">Script v1.3.5 Responsive Ready</Badge>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Amankan Kode Bridge Anda</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Klik tombol di bawah untuk menyalin seluruh kode sumber <b>bridge.js</b> versi terbaru yang paling stabil dan responsif.
                    </p>
                </div>

                <Button 
                    size="lg" 
                    onClick={handleCopyScript}
                    className={cn(
                        "h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all active:scale-95 gap-3",
                        hasCopied ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/30"
                    )}
                >
                    {hasCopied ? <Check className="size-5" /> : <Terminal className="size-5" />}
                    {hasCopied ? "Script Tersalin!" : "Ambil Script v1.3.5"}
                </Button>

                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Path Verified</div>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-1.5"><Activity className="size-3" /> Real-time Sync</div>
                </div>
            </div>

            <Alert className="bg-amber-500/5 border-amber-500/20">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 font-bold uppercase text-[10px]">Penting!</AlertTitle>
                <AlertDescription className="text-[10px] text-amber-600">
                    Gunakan script ini jika Anda mengalami masalah TV yang lambat merespon atau status 'Offline' padahal internet stabil.
                </AlertDescription>
            </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
