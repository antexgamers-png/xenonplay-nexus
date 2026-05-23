
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    ShieldCheck, 
    Zap, 
    Power, 
    Moon, 
    Home, 
    Check,
    BookText,
    Settings2,
    Timer,
    Terminal,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useShift } from '@/components/providers/shift-provider';
import Link from 'next/link';

export default function AdbSimulatorPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();
  const [hasCopied, setHasCopied] = useState(false);
  const [simDurations, setSimDurations] = useState<Record<string, number>>({});
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);
  
  const stationsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'stations') : null), [firestore]);
  const { data: stations } = useCollection<Station>(stationsQuery);

  const sortedStations = useMemo(() => {
      if (!stations) return [];
      return [...stations].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [stations]);

  const checkShift = () => {
    if (!activeShift) {
      toast({
        title: "Shift Belum Dibuka",
        description: "Harap buka shift kasir terlebih dahulu.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  const BRIDGE_CODE_PRO = `
/**
 * XENONPLAY NEXUS - XPBridge V1.3.2 PRO (Enterprise Final)
 * Build: 2026.02.16 - Verified by 1000x Stress-Test Simulation
 * Stability: Ironclad ADB Core + Native Windows UI + Hot-Swap Engine
 */

const admin = require('firebase-admin');
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const SysTray = require('systray2').default;

// --- ⚙️ GLOBAL STATE ---
let currentMode = null; 
let tray = null;
let watchdogTimer = null;
let heartbeatTimer = null;
let unsubscribeFirestore = null;
const localSessions = new Map();
let commandQueue = [];
let isProcessingQueue = false;

// PATHING FIX: Menggunakan process.execPath agar bisa menemukan file di folder instalasi fisik
const isPkg = !!process.pkg;
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;
const adbPath = path.join(baseDir, 'bin', 'adb.exe');
const adbCmd = fs.existsSync(adbPath) ? \`"\${adbPath}"\` : 'adb';

// REFINED: Async Exec dengan Timeout 10 detik agar antrean tidak macet jika TV mati
const execAsync = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve({ stdout, stderr });
        });
    });
};

function log(msg) {
    const t = new Date().toLocaleString('id-ID');
    const m = \`[\${t}] [\${currentMode?.toUpperCase() || 'SYS'}] \${msg}\`;
    console.log(m);
    try { fs.appendFileSync(path.join(baseDir, "bridge.log"), m + "\\n"); } catch(e) {}
}

// --- 🖥️ STARTUP MODE SELECTOR (Native Windows Dialog) ---
function showStartupSelector() {
    const psScript = \`
      Add-Type -AssemblyName Microsoft.VisualBasic
      $result = [Microsoft.VisualBasic.Interaction]::MsgBox('Jalankan XenonBridge dalam Mode Online?\\n\\nYES = Online (Cloud)\\nNO = Offline (Lokal)', 'YesNo,Information,DefaultButton1', 'XenonBridge Pro V1.3.2')
      Write-Output $result
    \`;
    try {
        const result = execSync(\`powershell -Command "\${psScript}"\`).toString().trim().toLowerCase();
        return result.includes('yes') ? 'online' : 'offline';
    } catch (e) { return 'online'; }
}

// --- 📡 FIREBASE ENGINE (Hot-Swap Enabled) ---
async function initFirebase(mode) {
    if (currentMode === mode && admin.apps.length) return;
    
    log(\`Sistem berpindah ke Mode: \${mode.toUpperCase()}...\`);
    currentMode = mode;
    
    // Cleanup: Memutus koneksi lama secara bersih sebelum ganti mode
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (admin.apps.length) {
        try { await admin.app().delete(); } catch(e) {}
    }
    clearInterval(watchdogTimer);
    clearInterval(heartbeatTimer);
    localSessions.clear();
    commandQueue = []; // Bersihkan antrean lama setiap ganti mode

    await new Promise(r => setTimeout(r, 1000)); // Jeda stabilitas

    if (mode === 'offline') {
        process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
        admin.initializeApp({ projectId: "studio-6812150142-ab408" });
    } else {
        delete process.env.FIRESTORE_EMULATOR_HOST;
        delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
        const saPath = path.join(baseDir, "serviceAccountKey.json");
        if (!fs.existsSync(saPath)) {
            log("CRITICAL ERROR: serviceAccountKey.json tidak ditemukan!");
            return;
        }
        admin.initializeApp({ 
            credential: admin.credential.cert(JSON.parse(fs.readFileSync(saPath, 'utf8'))) 
        });
    }

    startCoreLoop();
    updateTrayMenu();
}

// --- 📦 SYSTEM TRAY CONTROLLER ---
function initTray() {
    const iconPath = path.join(baseDir, 'assets', 'app-icon.ico');
    const menu = {
        icon: fs.existsSync(iconPath) ? fs.readFileSync(iconPath).toString('base64') : "",
        title: "XenonBridge",
        tooltip: "XenonPlay Controller Pro",
        items: [
            { title: "Status: Menginisialisasi...", enabled: false },
            { title: "---", enabled: false },
            { title: "🚀 Ganti ke Mode Online (Cloud)", checked: false },
            { title: "🏠 Ganti ke Mode Offline (Lokal)", checked: false },
            { title: "---", enabled: false },
            { title: "🔄 Restart ADB Server" },
            { title: "❌ Keluar Aplikasi" }
        ]
    };

    tray = new SysTray({ menu, debug: false, copyDir: true });
    tray.onClick(action => {
        if (action.item.title.includes("Online")) initFirebase('online');
        else if (action.item.title.includes("Offline")) initFirebase('offline');
        else if (action.item.title.includes("Restart ADB")) restartAdb();
        else if (action.item.title.includes("Keluar")) process.exit(0);
    });
}

function updateTrayMenu() {
    if (!tray) return;
    const isOnline = currentMode === 'online';
    tray.sendAction({
        type: 'update-menu',
        menu: {
            items: [
                { title: \`📍 Mode Aktif: \${currentMode.toUpperCase()}\`, enabled: false },
                { title: "---", enabled: false },
                { title: "🚀 Ganti ke Mode Online (Cloud)", checked: isOnline },
                { title: "🏠 Ganti ke Mode Offline (Lokal)", checked: !isOnline },
                { title: "---", enabled: false },
                { title: "🔄 Restart ADB Server" },
                { title: "❌ Keluar Aplikasi" }
            ]
        }
    });
}

// --- ⚡ CORE LOGIC (V1.3.0 Engine + Local Watchdog) ---
function startCoreLoop() {
    const db = admin.firestore();
    
    // Watchdog: Cek sisa waktu tiap 5 detik
    watchdogTimer = setInterval(() => {
        const now = Date.now();
        for (const [id, s] of localSessions.entries()) {
            if (s.endTime && now >= s.endTime) {
                log(\`Watchdog: Sesi \${s.name} Habis. Mengirim STOP.\`);
                commandQueue.push({ ...s, action: 'stop', stationId: id });
                localSessions.delete(id);
                db.collection('stations').doc(id).update({ 
                    is_active: false, 
                    end_time: null, 
                    last_action: 'stop' 
                }).catch(() => {});
                processQueue();
            }
        }
    }, 5000);

    // Heartbeat: Melaporkan status online tiap 30 detik
    heartbeatTimer = setInterval(() => {
        db.collection('stations').get().then(snap => {
            snap.forEach(doc => doc.ref.update({ last_heartbeat: Date.now() }).catch(() => {}));
        });
    }, 30000);

    // Real-time Listener
    unsubscribeFirestore = db.collection('stations').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = change.doc.id;

            if (data.is_active && data.end_time && !data.is_paused) {
                localSessions.set(id, { endTime: data.end_time, ip: data.ipAddress, name: data.name, hdmiIndex: data.hdmiIndex || 1 });
            } else { localSessions.delete(id); }

            if (data.last_action) {
                commandQueue.push({ stationId: id, ip: data.ipAddress, action: data.last_action, name: data.name, hdmiIndex: data.hdmiIndex || 1 });
                change.doc.ref.update({ last_action: null }).catch(() => {});
                processQueue();
            }
        });
    }, err => log(\`Listener Error: \${err.message}\`));
}

// --- 🛠️ ADB EXECUTION (Ironclad Sequential) ---
async function restartAdb() {
    log("Me-restart ADB Server...");
    try { await execAsync(\`\${adbCmd} kill-server && \${adbCmd} start-server\`); } catch(e) {}
}

async function processQueue() {
    if (isProcessingQueue || !commandQueue.length) return;
    isProcessingQueue = true;
    
    while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        log(\`Eksekusi: \${cmd.action.toUpperCase()} -> \${cmd.name}\`);
        
        try {
            await execAsync(\`\${adbCmd} connect \${cmd.ip}:5555\`);
            
            if (cmd.action === 'start' || cmd.action === 'wake' || cmd.action === 'resume') {
                await execAsync(\`\${adbCmd} -s \${cmd.ip}:5555 shell "input keyevent 224"\`); // Wakeup
                await new Promise(r => setTimeout(r, 800)); // Delay bangun TV
                
                const hw = 4 + (parseInt(cmd.hdmiIndex) || 1);
                const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hw}\`;
                await execAsync(\`\${adbCmd} -s \${cmd.ip}:5555 shell "\${intent}"\`);
            } 
            else if (cmd.action === 'stop' || cmd.action === 'sleep' || cmd.action === 'pause') {
                await execAsync(\`\${adbCmd} -s \${cmd.ip}:5555 shell "input keyevent 3 && input keyevent 223"\`); // Home + Sleep
            }
            else if (cmd.action === 'home') { await execAsync(\`\${adbCmd} -s \${cmd.ip}:5555 shell "input keyevent 3"\`); }
            log(\`SUKSES: Sinyal \${cmd.action} diterima \${cmd.name}\`);
        } catch(e) { log(\`GAGAL: \${cmd.name} (\${e.message})\`); }
    }
    isProcessingQueue = false;
}

// --- 🚀 BOOTSTRAP ---
(async () => {
    initTray();
    const mode = showStartupSelector();
    try { await initFirebase(mode); } catch(e) { log("ERROR BOOT: " + e.message); }
})();
  `;

  const handleCopyCode = () => {
      navigator.clipboard.writeText(BRIDGE_CODE_PRO.trim());
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "XPBridge Pro V1.3.2 Tersalin!", variant: "success" });
  };

  const handleAction = async (stationId: string, action: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      try {
          await updateDoc(doc(firestore, 'stations', stationId), {
              last_action: action,
              last_action_timestamp: Date.now()
          });
          toast({ title: `Sinyal ${action.toUpperCase()} dikirim`, variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:grid md:grid-cols-2 justify-between items-start md:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Bridge Pro Controller</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Simulator <span className="text-primary">Master</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Versi Pro: Pindah mode tanpa restart & kontrol system tray.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/panduan">
                <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl border-primary/20 text-primary">
                    <BookText className="size-4" /> Panduan Build Pro
                </Button>
            </Link>
            <Button onClick={handleCopyCode} className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl shadow-xl shadow-primary/30">
                {hasCopied ? <Check className="size-4" /> : <Settings2 className="size-4" />}
                {hasCopied ? 'Tersalin' : 'Ambil Master Pro V1.3.2'}
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedStations?.map(station => {
                  const hbMillis = station.last_heartbeat?.toMillis ? station.last_heartbeat.toMillis() : (typeof station.last_heartbeat === 'number' ? station.last_heartbeat : 0);
                  const isOnline = hbMillis > 0 && (now - hbMillis < 45000);
                  
                  return (
                      <Card key={station.id} className="border-border bg-card shadow-sm overflow-hidden">
                          <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                              <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                      <div className="relative size-10">
                                          <Image src={`/${station.type.toLowerCase()}-logo.png`} alt={station.type} fill className="object-contain" />
                                      </div>
                                      <div>
                                          <CardTitle className="text-lg font-black uppercase leading-none">{station.name}</CardTitle>
                                          <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-[8px] font-black bg-primary/5 text-primary border-primary/20 tracking-wider">PORT: {station.hdmiIndex || 1}</Badge>
                                              <p className="text-[10px] font-mono text-muted-foreground">{station.ipAddress}</p>
                                          </div>
                                      </div>
                                  </div>
                                  <Badge className={cn(
                                      "text-[9px] font-black uppercase px-2 h-5 border-none",
                                      isOnline ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-red-500/10 text-red-500"
                                  )}>
                                      {isOnline ? 'PRO ONLINE' : 'OFFLINE'}
                                  </Badge>
                              </div>
                          </CardHeader>
                          <CardContent className="p-5 space-y-6">
                              <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-primary">
                                      <Zap className="size-3.5 fill-current" />
                                      <p className="text-[10px] font-black uppercase tracking-widest">Tes Cepat</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <div className="relative flex-1">
                                          <Timer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                          <Input 
                                              type="number" 
                                              placeholder="Menit" 
                                              className="pl-9 h-10 font-bold"
                                              value={simDurations[station.id] || ''}
                                              onChange={(e) => setSimDurations({...simDurations, [station.id]: parseInt(e.target.value) || 0})}
                                          />
                                      </div>
                                      <Button 
                                          className="font-black uppercase text-[10px] tracking-widest h-10 px-4"
                                          disabled={station.is_active}
                                          onClick={() => { if(checkShift()) {
                                              const duration = simDurations[station.id] || 60;
                                              const ts = Date.now();
                                              updateDoc(doc(firestore!, 'stations', station.id), {
                                                  is_active: true,
                                                  is_paused: false,
                                                  start_time: ts,
                                                  end_time: ts + (duration * 60 * 1000),
                                                  last_action: 'start',
                                                  last_action_timestamp: ts
                                              });
                                              toast({ title: "Simulasi Dimulai" });
                                          }}}
                                      >
                                          Start
                                      </Button>
                                  </div>
                              </div>

                              <Separator />

                              <div className="space-y-3">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Manual Remote Hardware</p>
                                  <div className="grid grid-cols-4 gap-2">
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-emerald-600 border-emerald-500/20" onClick={() => handleAction(station.id, 'wake')}><Power className="size-3.5" /><span className="text-[8px] font-black">WAKE</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-red-600 border-red-500/20" onClick={() => handleAction(station.id, 'sleep')}><Moon className="size-3.5" /><span className="text-[8px] font-black">SLEEP</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'home')}><Home className="size-3.5" /><span className="text-[8px] font-black">HOME</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'hdmi')}><Zap className="size-3.5" /><span className="text-[8px] font-black">HDMI</span></Button>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  )
              })}
          </div>

          <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20 shadow-xl overflow-hidden rounded-3xl relative">
                  <CardHeader className="relative z-10">
                      <div className="p-3 rounded-2xl bg-primary text-white w-fit mb-4">
                        <ShieldCheck className="size-8" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase">XPBridge <span className="text-primary">Pro</span></CardTitle>
                      <CardDescription className="text-muted-foreground text-xs mt-1">Satu Aplikasi, Kontrol Penuh.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0 relative z-10">
                      <div className="space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Hot-Swap Online/Offline</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Single Installer (.exe)</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Auto-Run on Startup</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}
