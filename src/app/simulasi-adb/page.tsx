
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
    Terminal, 
    Activity, 
    Check,
    Laptop,
    PlayCircle,
    Timer,
    VolumeX,
    Plus,
    Minus,
    FileCode,
    AlertCircle,
    MonitorPlay,
    BookText,
    WifiOff,
    Cpu,
    Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useShift } from '@/components/providers/shift-provider';
import Link from 'next/link';

export default function SimulasiAdbPage() {
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
        description: "Harap buka shift kasir terlebih dahulu untuk menjalankan simulator.",
        variant: "destructive"
      });
      setIsOpeningDialog(true);
      return false;
    }
    return true;
  };

  const BRIDGE_CODE = `
/**
 * XENONPLAY NEXUS - XPBridge V1.3.0 FINAL (Enterprise Stability)
 * Build: 2026.02.13 (Stable Release)
 * Hybrid Cloud + Local Watchdog + Auto Healing Engine
 * 
 * Fitur Baru: Zero-Terminal Offline Mode
 */

const admin = require('firebase-admin');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');

// --- ⚙️ CONFIGURATION ---
const HEARTBEAT_INTERVAL = 30000; 
const WATCHDOG_INTERVAL = 5000;  
const MAX_RETRIES = 2;           

// --- 🏠 FILE PATHS ---
const isPkg = !!process.pkg;
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;
const logFile = path.join(baseDir, "bridge.log");

function log(msg) {
    const timestamp = new Date().toLocaleString('id-ID');
    const fullMsg = \`[\${timestamp}] \${msg}\`;
    console.log(fullMsg);
    try { 
        if (fs.existsSync(logFile) && fs.statSync(logFile).size > 2000000) {
            fs.renameSync(logFile, logFile + ".old");
        }
        fs.appendFileSync(logFile, fullMsg + "\\n"); 
    } catch (e) {}
}

const localAdbPath = path.join(baseDir, 'bin', 'adb.exe');
let adbCmd = 'adb';
if (fs.existsSync(localAdbPath)) adbCmd = \`"\${localAdbPath}"\`;

// --- 🛡️ SELF-HEALING ADB ---
async function restartAdb() {
    log("🔄 Inisialisasi ADB Server...");
    try {
        await exec(\`\${adbCmd} kill-server\`).catch(() => {});
        await exec(\`\${adbCmd} start-server\`);
        log("✅ ADB Server Siap.");
    } catch (e) { log("⚠️ Error restart ADB: " + e.message); }
}

// --- 📡 FIREBASE INITIALIZATION (WITH AUTO-OFFLINE) ---
const serviceAccountPath = path.join(baseDir, "serviceAccountKey.json");
const offlineFlagPath = path.join(baseDir, "OFFLINE_MODE");

// Deteksi Mode Offline Otomatis
if (fs.existsSync(offlineFlagPath) || process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    admin.initializeApp({ projectId: "studio-6812150142-ab408" });
    log("📍 STATUS: MODE SERVER LOKAL AKTIF (OFFLINE MODE)");
} else {
    if (!fs.existsSync(serviceAccountPath)) {
        log("⚠️ serviceAccountKey.json tidak ditemukan!");
        log("📍 STATUS: MENCOBA MENYAMBUNG KE SERVER LOKAL (DEFAULT)...");
        process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
        admin.initializeApp({ projectId: "studio-6812150142-ab408" });
    } else {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        log("📡 STATUS: MODE CLOUD ONLINE (PRODUCTION)");
    }
}
const db = admin.firestore();

// --- 🧠 LOCAL BRAIN (RAM STORAGE) ---
const localSessions = new Map(); 
const commandQueue = [];
let isProcessingQueue = false;

// --- ⚡ COMMAND EXECUTION ENGINE ---
async function runAdb(cmd, ip, retry = 0) {
    try {
        const fullCmd = \`\${adbCmd} -s \${ip}:5555 \${cmd}\`;
        return await exec(fullCmd, { windowsHide: true, timeout: 12000 });
    } catch (e) {
        if (retry < MAX_RETRIES) {
            log(\`🔄 Mencoba ulang... (\${retry+1}/\${MAX_RETRIES}) ke \${ip}\`);
            await new Promise(r => setTimeout(r, 800));
            return runAdb(cmd, ip, retry + 1);
        }
        throw e;
    }
}

async function connectTv(ip) {
    try {
        const { stdout } = await exec(\`\${adbCmd} devices\`);
        if (stdout.includes(\`\${ip}:5555\`) && !stdout.includes("offline")) return true;
        
        log(\`🔗 Menyambung ke \${ip}...\`);
        const { stdout: connOut } = await exec(\`\${adbCmd} connect \${ip}:5555\`, { timeout: 8000 });
        return connOut.includes("connected");
    } catch (e) {
        log(\`❌ Koneksi Gagal \${ip}: \${e.message}\`);
        return false;
    }
}

async function executeAction(data) {
    const { stationId, ip, action, hdmiIndex, name } = data;
    if (!ip) return;

    const ok = await connectTv(ip);
    if (!ok && action !== 'ping') return;

    try {
        if (action === 'start') {
            log(\`🚀 [Burst Wakeup] Mengaktifkan \${name}\`);
            await runAdb('shell "input keyevent 224"', ip).catch(() => {});
            await runAdb('shell "input keyevent 224"', ip).catch(() => {});
            
            const hwIndex = 4 + (parseInt(hdmiIndex) || 1);
            const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hwIndex}\`;
            await runAdb(\`shell "\${intent}"\`, ip);
        } 
        else if (action === 'stop') {
            log(\`⏹️ [Auto Stop] Mematikan \${name}\`);
            await runAdb('shell "input keyevent 3"', ip).catch(() => {}); 
            await runAdb('shell "input keyevent 223"', ip).catch(() => {}); 
        }
        else if (action === 'ping') {
            await runAdb('shell "input keyevent 0"', ip).catch(() => {});
        }
        else if (action === 'wake') await runAdb('shell "input keyevent 224"', ip);
        else if (action === 'sleep') await runAdb('shell "input keyevent 223"', ip);
        else if (action === 'home') await runAdb('shell "input keyevent 3"', ip);
        else if (action === 'hdmi') {
            const hwIndex = 4 + (parseInt(hdmiIndex) || 1);
            const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hwIndex}\`;
            await runAdb(\`shell "\${intent}"\`, ip);
        }
        else if (action === 'vol_up') await runAdb('shell "input keyevent 24"', ip);
        else if (action === 'vol_down') await runAdb('shell "input keyevent 25"', ip);
        else if (action === 'mute') await runAdb('shell "input keyevent 164"', ip);
        
        log(\`✅ [\${name}] Berhasil: \${action.toUpperCase()}\`);
    } catch (err) {
        log(\`❌ [\${name}] Gagal \${action}: \${err.message}\`);
    }
}

async function processQueue() {
    if (isProcessingQueue || commandQueue.length === 0) return;
    isProcessingQueue = true;
    while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        await executeAction(cmd);
    }
    isProcessingQueue = false;
}

setInterval(async () => {
    const now = Date.now();
    for (const [id, session] of localSessions.entries()) {
        if (session.endTime && now >= session.endTime) {
            log(\`⏰ [Watchdog] Sesi \${session.name} habis. Eksekusi lokal dimulai...\`);
            commandQueue.push({ ...session, action: 'stop', stationId: id });
            localSessions.delete(id);
            processQueue();
            
            db.collection('stations').doc(id).update({
                is_active: false,
                is_paused: false,
                end_time: null,
                last_action: 'stop',
                last_action_timestamp: now
            }).catch(() => {});
        }
    }
}, WATCHDOG_INTERVAL);

setInterval(async () => {
    try {
        const snapshot = await db.collection('stations').get();
        const batch = db.batch();
        snapshot.forEach(doc => {
            const data = doc.data();
            batch.update(doc.ref, { last_heartbeat: admin.firestore.FieldValue.serverTimestamp() });
            
            if (data.is_active && !data.is_paused) {
                commandQueue.push({ stationId: doc.id, ip: data.ipAddress, action: 'ping', name: data.name });
            }
        });
        await batch.commit();
        processQueue();
        log("📡 Heartbeat OK.");
    } catch (e) { log("⚠️ Koneksi database terhambat."); }
}, HEARTBEAT_INTERVAL);

db.collection('stations').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const id = change.doc.id;

        if (data.is_active && data.end_time && !data.is_paused) {
            localSessions.set(id, { 
                endTime: data.end_time, 
                ip: data.ipAddress, 
                hdmiIndex: data.hdmiIndex || 1, 
                name: data.name 
            });
        } else if (data.is_paused || !data.is_active) {
            localSessions.delete(id);
        }

        if (data.last_action) {
            commandQueue.push({
                stationId: id, ip: data.ipAddress,
                action: data.last_action, hdmiIndex: data.hdmiIndex || 1, name: data.name
            });
            change.doc.ref.update({ last_action: null }).catch(() => {});
            processQueue();
        }
    });
}, err => {
    log("❌ Critical Error: " + err.message);
    process.exit(1);
});

log("==================================================");
log("🚀 XPBRIDGE V1.3.0 STABLE - ZERO-TERMINAL READY");
log("🛡️ Local Watchdog: AKTIF");
log("🛡️ Burst Wakeup: AKTIF");
log("==================================================");

restartAdb();
  `;

  const handleCopyCode = () => {
      navigator.clipboard.writeText(BRIDGE_CODE.trim());
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "XPBridge V1.3.0 Tersalin!", variant: "success" });
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

  const handleSimulateStart = async (stationId: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      const duration = simDurations[stationId] || 60;
      const ts = Date.now();
      try {
          await updateDoc(doc(firestore, 'stations', stationId), {
              is_active: true,
              is_paused: false,
              start_time: ts,
              end_time: ts + (duration * 60 * 1000),
              last_action: 'start',
              last_action_timestamp: ts
          });
          toast({ title: "Simulasi Dimulai", description: `Perintah dikirim ke Bridge.`, variant: "success" });
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
                    <Shield className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Enterprise Stability Engine</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Simulator <span className="text-primary">Control</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Otomatisasi V1.3 tetap mematikan TV meskipun tanpa internet.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/panduan">
                <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl border-primary/20 text-primary">
                    <BookText className="size-4" /> Panduan Instalasi
                </Button>
            </Link>
            <Button onClick={handleCopyCode} className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl shadow-xl shadow-primary/30">
                {hasCopied ? <Check className="size-4" /> : <Terminal className="size-4" />}
                {hasCopied ? 'Tersalin' : 'Ambil Master Bridge V1.3.0'}
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
                                      {isOnline ? 'BRIDGE ONLINE' : 'OFFLINE'}
                                  </Badge>
                              </div>
                          </CardHeader>
                          <CardContent className="p-5 space-y-6">
                              <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-primary">
                                      <Zap className="size-3.5 fill-current" />
                                      <p className="text-[10px] font-black uppercase tracking-widest">Kontrol Sesi Cepat</p>
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
                                          onClick={() => handleSimulateStart(station.id)}
                                      >
                                          <PlayCircle className="mr-2 h-4 w-4" /> Start
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
                                      
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'vol_up')}><Plus className="size-3.5" /><span className="text-[8px] font-black">VOL+</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'vol_down')}><Minus className="size-3.5" /><span className="text-[8px] font-black">VOL-</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'mute')}><VolumeX className="size-3.5" /><span className="text-[8px] font-black">MUTE</span></Button>
                                      <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 opacity-30" disabled><Activity className="size-3.5" /><span className="text-[8px] font-black">---</span></Button>
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
                        <Shield className="size-8" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase">Stability <span className="text-primary">V1.3.0</span></CardTitle>
                      <CardDescription className="text-muted-foreground text-xs mt-1">Sistem perlindungan operasional tingkat tinggi.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0 relative z-10">
                      <div className="space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Local Watchdog Active</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Burst Wakeup Enabled</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="size-3.5" /></div>
                              <p className="text-[10px] font-bold uppercase">Intelligent Keep-Alive</p>
                          </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                          <AlertCircle className="size-3 text-amber-500 shrink-0 mb-1" />
                          <p className="text-[9px] text-amber-700 leading-tight">
                              Pastikan Anda telah menyalin dan menjalankan skrip Master Bridge terbaru di laptop kasir untuk mengaktifkan fitur perlindungan offline.
                          </p>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-slate-900 border-none shadow-2xl text-slate-300 overflow-hidden rounded-3xl relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <CardHeader className="relative z-10">
                      <Cpu className="size-8 text-primary mb-4" />
                      <CardTitle className="text-xl font-black uppercase text-white">Performance <span className="text-primary">Optimized</span></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 relative z-10 pt-0">
                      <p className="text-[10px] leading-relaxed text-slate-400">
                          Mesin V1.3 menggunakan cache koneksi untuk meminimalkan beban CPU laptop kasir hingga &lt; 1% pada kondisi idle.
                      </p>
                      <Link href="/docs/OFFLINE_SETUP_GUIDE.md" target="_blank" className="block mt-2">
                          <Button variant="outline" className="w-full h-10 font-bold uppercase text-[10px] tracking-widest border-white/10 hover:bg-white/5 text-white">
                              Detail Optimasi
                          </Button>
                      </Link>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}

    