
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
    Wifi,
    MonitorOff,
    MonitorPlay,
    FolderPlus,
    FileArchive
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

const RESPONSIVE_HYBRID_BRIDGE_V1_3_6 = `
/**
 * XENONPLAY NEXUS - XPBridge v1.3.6 (Sentinel Edition)
 * Perbaikan: True Background Mode + Auto Heartbeat
 */

const admin = require('firebase-admin');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

const isPkg = !!process.pkg;
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;

const logFile = path.join(baseDir, "bridge.log");
function log(msg) {
    const timestamp = new Date().toLocaleString('id-ID');
    const fullMsg = \`[\${timestamp}] \${msg}\`;
    console.log(fullMsg);
    try { fs.appendFileSync(logFile, fullMsg + "\\n"); } catch (e) {}
}

log("==================================================");
log("🚀 XENON BRIDGE V1.3.6 SENTINEL ACTIVE");
log("📍 Root: " + baseDir);
log("==================================================");

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
    const msg = "Xenon Bridge v1.3.6 AKTIF di latar belakang.";
    const cmd = \`powershell -Command "(New-Object -ComObject WScript.Shell).Popup('\${msg}', 4, 'XenonPlay Nexus', 64)"\`;
    try { await execAsync(cmd, execOptions); } catch (e) {}
}

sendStartupNotification();

db.collection('stations').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(async change => {
    const data = change.doc.data();
    const stationId = change.doc.id;

    if (data.is_active && data.end_time) {
        localSessions.set(stationId, { name: data.name, endTime: data.end_time, ip: data.ipAddress, hdmi: data.hdmiIndex || 1 });
    } else {
        localSessions.delete(stationId);
    }

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
        await execAsync(\`\${adbCmd} connect \${ip}:5555\`, execOptions);
        const hw = 4 + parseInt(hdmi);
        const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hw}\`;

        if (action === 'start' || action === 'wake' || action === 'resume' || action === 'hdmi') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 224"\`, execOptions); 
            await new Promise(r => setTimeout(r, 600)); 
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "\${intent}"\`, execOptions); 
        } 
        else if (action === 'stop' || action === 'sleep' || action === 'pause') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 3"\`, execOptions); 
            await new Promise(r => setTimeout(r, 400));
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 223"\`, execOptions); 
        }
    } catch (err) { log(\`❌ [\${name}] Error: \${err.message}\`); }
}

setInterval(async () => {
    try {
        const snap = await db.collection('stations').get();
        for (const doc of snap.docs) {
            const s = doc.data();
            if (s.ipAddress) {
                exec(\`\${adbCmd} connect \${s.ipAddress}:5555\`, (err, stdout) => {
                    if (!err && stdout.includes("connected")) {
                        db.collection('stations').doc(doc.id).update({
                            last_heartbeat: admin.firestore.FieldValue.serverTimestamp()
                        }).catch(() => {});
                    }
                });
            }
        }
    } catch (e) {}
}, 60000);

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

const PACKAGE_JSON_TEMPLATE = `
{
  "name": "xenon-bridge-sentinel",
  "version": "1.3.6",
  "main": "bridge.js",
  "bin": "bridge.js",
  "pkg": {
    "assets": ["bin/**/*", "serviceAccountKey.json"]
  },
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
`;

const HIDE_VBS_TEMPLATE = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "xenon-bridge.exe", 0, false
`;

export default function MasterPanduanPage() {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(RESPONSIVE_HYBRID_BRIDGE_V1_3_6.trim());
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({ title: "Script v1.3.6 Tersalin!", variant: "success" });
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">XenonPlay Nexus Enterprise v1.3.6 "Sentinel"</span>
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
                <Settings className="size-5"/> 2. Konfigurasi Sistem
            </TabsTrigger>
            <TabsTrigger value="bridge" className="rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex-1 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all min-w-[200px]">
                <FileCode className="size-5"/> 3. Script Bridge
            </TabsTrigger>
        </TabsList>

        <TabsContent value="installer" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TAHAP 1: PERSIAPAN FOLDER */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">1</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Persiapan Folder & Aset</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Card className="border-border">
                            <CardHeader className="bg-muted/20">
                                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                    <FolderPlus className="size-4 text-primary" /> Buat Struktur Root
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Buat folder baru di Desktop dengan nama <b>XenonSource</b>. Di dalamnya, buatlah sub-folder berikut:
                                </p>
                                <ul className="text-[11px] space-y-2 font-bold text-slate-600 list-disc list-inside">
                                    <li>📁 <b>bin/</b> - Untuk menyimpan binary ADB.</li>
                                    <li>📁 <b>assets/</b> - Untuk file ikon (.ico) dan gambar.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader className="bg-muted/20">
                                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                    <Box className="size-4 text-primary" /> Isi Folder bin/
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-[11px] text-muted-foreground">
                                <p>Ekstrak ADB Platform Tools ke dalam folder <b>bin/</b>. Pastikan 3 file ini ada:</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="font-mono text-[9px]">adb.exe</Badge>
                                    <Badge variant="outline" className="font-mono text-[9px]">AdbWinApi.dll</Badge>
                                    <Badge variant="outline" className="font-mono text-[9px]">AdbWinUsbApi.dll</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FolderTree className="size-32 text-white" />
                        </div>
                        <p className="text-emerald-500 font-bold mb-4 text-[10px] tracking-widest uppercase">Target Visual Folder:</p>
                        <div className="font-mono text-[11px] text-slate-300 space-y-3">
                            <p className="flex items-center gap-3"><Box className="size-3 text-primary"/> 📁 <b>XenonSource/</b></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-emerald-500"/> 📁 <b>bin/</b> <span className="text-[9px] text-slate-500">(ADB Files)</span></p>
                            <p className="flex items-center gap-3 ml-6"><Box className="size-3 text-amber-500"/> 📁 <b>assets/</b> <span className="text-[9px] text-slate-500">(app-icon.ico)</span></p>
                            <p className="flex items-center gap-3 ml-6 text-primary"><FileJson className="size-3"/> 📄 <b>package.json</b></p>
                            <p className="flex items-center gap-3 ml-6 text-primary"><FileCode className="size-3"/> 📄 <b>bridge.js</b></p>
                            <p className="flex items-center gap-3 ml-6 text-primary"><FileCode className="size-3"/> 📄 <b>hide.vbs</b></p>
                            <p className="flex items-center gap-3 ml-6 text-amber-500"><FileJson className="size-3"/> 📄 <b>serviceAccountKey.json</b></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAHAP 2: PEMBUATAN FILE KONFIGURASI */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Membuat File Konfigurasi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileJson className="size-4 text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-widest">1. package.json</h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            File ini memberitahu <b>pkg</b> file mana saja yang harus dibungkus ke dalam EXE.
                        </p>
                        <CodeBlock language="json" code={PACKAGE_JSON_TEMPLATE} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileCode className="size-4 text-emerald-500" />
                            <h4 className="text-xs font-black uppercase tracking-widest">2. hide.vbs</h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Script sederhana untuk menjalankan Bridge tanpa memunculkan jendela hitam CMD.
                        </p>
                        <CodeBlock language="vbscript" code={HIDE_VBS_TEMPLATE} />
                    </div>
                </div>
            </section>

            {/* TAHAP 3: KOMPILASI & PACKAGING */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Kompilasi & Inno Setup</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="size-4 text-primary" /> Langkah A: Build EXE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <p className="text-[10px] text-muted-foreground">Jalankan di terminal dalam folder <b>XenonSource</b>:</p>
                            <CodeBlock code={`npm install\nnpm install -g pkg\npkg . --targets node18-win-x64 --output xenon-bridge.exe`} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <FileArchive className="size-4 text-primary" /> Langkah B: Inno Setup (.iss)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <p className="text-[10px] text-muted-foreground">Buat file <code>setup.iss</code>, salin kode ini untuk membuat Installer profesional:</p>
                            <CodeBlock language="iss" code={`
[Setup]
AppName=XenonPlay Bridge
AppVersion=1.3.6
DefaultDirName={autopf}\\XenonPlayBridge
OutputDir=.
OutputBaseFilename=XenonBridge_Pro_Setup
SetupIconFile=assets\\app-icon.ico
SolidCompression=yes

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "hide.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\\*"; DestDir: "{app}\\bin"; Flags: ignoreversion recursesubdirs
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\\*"; DestDir: "{app}\\assets"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; IconFilename: "{app}\\assets\\app-icon.ico"
Name: "{userstartup}\\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; IconFilename: "{app}\\assets\\app-icon.ico"

[Run]
Filename: "wscript.exe"; Parameters: """{app}\\hide.vbs"""; Description: "Jalankan XenonPlay Bridge Sekarang"; Flags: nowait postinstall skipifsilent
                            `} />
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                                <p className="text-[10px] text-primary font-bold italic leading-relaxed">
                                    Simpan, lalu <b>klik kanan setup.iss &gt; Compile</b>. Anda akan mendapatkan file <b>XenonBridge_Pro_Setup.exe</b>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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
                            <ol className="text-xs space-y-3 text-muted-foreground list-decimal list-inside font-medium">
                                <li>Buka <i>Settings &gt; Device Preferences &gt; About</i>.</li>
                                <li>Klik baris <b>Build Number</b> 7 kali.</li>
                                <li>Masuk menu <b>Developer Options</b>.</li>
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
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Wajib setel IP Statis agar koneksi bridge tidak putus saat router restart.
                            </p>
                            <Alert className="bg-amber-500/5 border-amber-500/20 p-3 mt-2">
                                <Info className="size-3.5 text-amber-600" />
                                <AlertDescription className="text-[10px] text-amber-700">Contoh IP: 192.168.1.101, dst.</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xl shadow-amber-500/20 text-lg">2</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Handshake & Policy Windows</h3>
                </div>
                <div className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 text-amber-500">
                                <Keyboard className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Handshake ADB (Sekali Saja)</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Wajib dilakukan manual agar status TV tidak 'Unauthorized'. Hubungkan kabel USB atau pastikan TV menyala.
                            </p>
                            <CodeBlock code={`cd "C:\\Program Files (x86)\\XenonPlayBridge\\bin"\nadb connect [IP_TV]:5555`} />
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[10px] text-amber-600 font-bold italic">"Cek layar TV, centang 'Always Allow' lalu klik OK."</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-muted/30 border border-border space-y-4 shadow-sm">
                            <div className="flex items-center gap-3 text-primary">
                                <ShieldAlert className="size-5" />
                                <h4 className="font-bold text-xs uppercase tracking-widest">Izin Notifikasi Windows</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Jalankan PowerShell sebagai <b>Administrator</b> dan ketik perintah ini agar notifikasi bridge 100% muncul:
                            </p>
                            <CodeBlock code={`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`} />
                        </div>
                    </div>
                </div>
            </section>
        </TabsContent>

        <TabsContent value="bridge" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-xl shadow-primary/20 text-lg">3</div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Apa yang baru di v1.3.6?</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="size-4 text-primary" /> Sentinel Heartbeat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Sistem kini otomatis mengecek koneksi ke seluruh TV setiap 60 detik. Status Hijau di dashboard dijamin 100% akurat sesuai kondisi hardware asli.
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Layers className="size-4 text-emerald-600" /> True Background Mode
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
                        Menggunakan peluncur <code>hide.vbs</code> untuk memastikan tidak ada jendela CMD yang mengganggu aktivitas kasir. Bridge berjalan senyap di sistem tray.
                    </CardContent>
                </Card>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                    <FileCode className="size-32 text-white" />
                </div>
                
                <div className="space-y-2 relative z-10">
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-4 h-6 font-black uppercase text-[10px] tracking-widest">Script v1.3.6 Sentinel Ready</Badge>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Amankan Kode Bridge Anda</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Salin kode sentinel untuk mendapatkan akurasi status hardware dan mode latar belakang yang sempurna.
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
                    {hasCopied ? "Script v1.3.6 Tersalin!" : "Ambil Script v1.3.6"}
                </Button>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
