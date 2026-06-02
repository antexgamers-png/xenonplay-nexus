'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Terminal,
    Copy,
    Activity,
    Play,
    AlertCircle,
    VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useShift } from '@/components/providers/shift-provider';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdbSimulatorPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeShift, setIsOpeningDialog } = useShift();
  const [hasCopied, setHasCopied] = useState(false);
  const [now, setNow] = useState<number>(0);
  
  const [customDurations, setCustomDurations] = useState<Record<string, string>>({});

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

  const HYBRID_BRIDGE_V1_3_3 = `
/**
 * XENONPLAY NEXUS - XPBridge V1.3.3 (Ultimate Hybrid)
 * Arsitektur: Parallel Execution + Local RAM Watchdog
 * Solusi: Mengatasi TV MediaTek macet & Hemat Kuota Firestore.
 */

const admin = require('firebase-admin');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

// --- 1. KONFIGURASI ---
// Jika menjalankan via EXE hasil compile 'pkg', pastikan aset terpanggil dengan benar.
const serviceAccount = require('./serviceAccountKey.json');
const execOptions = { windowsHide: true }; 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const localSessions = new Map(); // Penyimpanan sisa waktu di RAM Laptop (Quota Saver)

// Path ADB Otomatis (Mendukung folder bin/ di laptop kasir)
const adbPath = path.join(__dirname, 'bin', 'adb.exe');
const adbCmd = fs.existsSync(adbPath) ? \`"\${adbPath}"\` : 'adb';

// --- NOTIFIKASI STARTUP ---
// Muncul otomatis di pojok kanan bawah Windows saat aplikasi dinyalakan.
async function sendStartupNotification() {
    const msg = "Xenon Bridge V1.3.3 Hybrid telah AKTIF di latar belakang.";
    const command = \`powershell -Command "(New-Object -ComObject WScript.Shell).Popup('\${msg}', 5, 'XenonPlay Nexus', 64)"\`;
    try {
        await execAsync(command, execOptions);
    } catch (e) {
        console.log("Startup Alert: " + msg);
    }
}

console.log('--------------------------------------------------');
console.log('🚀 XENON BRIDGE V1.3.3 HYBRID STARTING...');
console.log('🛡️ Status: Parallel Mode & Quota Saver Active');
console.log('--------------------------------------------------');

sendStartupNotification();

// --- 2. LISTENER PERINTAH (REAL-TIME) ---
db.collection('stations').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const data = change.doc.data();
    const stationId = change.doc.id;

    // Sinkronisasi RAM Watchdog
    if (data.is_active && data.end_time) {
        localSessions.set(stationId, { name: data.name, endTime: data.end_time, ip: data.ipAddress });
    } else {
        localSessions.delete(stationId);
    }

    // Trigger Eksekusi Hardware
    if (data.last_action) {
      console.log(\`[\${new Date().toLocaleTimeString()}] Signal: \${data.last_action.toUpperCase()} -> \${data.name}\`);
      db.collection('stations').doc(stationId).update({ last_action: null });
      handleAdbWorkflow(data.ipAddress, data.last_action, data.hdmiIndex || 1, data.name);
    }
  });
});

async function handleAdbWorkflow(ip, action, hdmi, name) {
    try {
        // Handshake Sequence
        await execAsync(\`\${adbCmd} disconnect \${ip}:5555\`, execOptions);
        const { stdout } = await execAsync(\`\${adbCmd} connect \${ip}:5555\`, execOptions);
        
        if (!stdout.includes('connected')) {
            console.log(\`⚠️ \${name} (\${ip}) Gagal Terhubung (Offline/Refused)\`);
            return;
        }

        // Target HDMI Intent (MediaTek Optimized)
        const hw = 4 + parseInt(hdmi);
        const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hw}\`;

        if (action === 'start' || action === 'wake' || action === 'resume' || action === 'hdmi') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 224"\`, execOptions); // Wakeup
            await new Promise(r => setTimeout(r, 800)); // MediaTek Stability Pause
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "\${intent}"\`, execOptions); // Switch HDMI
            console.log(\`✅ \${name} Started/Switched Successfully\`);
        } 
        else if (action === 'stop' || action === 'sleep' || action === 'pause') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 3"\`, execOptions); // Home
            await new Promise(r => setTimeout(r, 500));
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 223"\`, execOptions); // Sleep
            console.log(\`🛑 \${name} Session Ended/Paused\`);
        }
        else if (action === 'home') {
            await execAsync(\`\${adbCmd} -s \${ip}:5555 shell "input keyevent 3"\`, execOptions);
        }
    } catch (err) {
        console.log(\`❌ Hardware Error on \${name}: \${err.message}\`);
    }
}

// --- 3. LOCAL RAM WATCHDOG (DETIKAN) ---
// Mematikan TV secara otomatis tanpa menarik data Cloud (Hemat Biaya)
setInterval(() => {
    const now = Date.now();
    localSessions.forEach((session, id) => {
        if (now >= session.endTime) {
            console.log(\`⏰ WAKTU HABIS: \${session.name}. Mengirim sinyal stop...\`);
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

// --- 4. REAL ADB HEARTBEAT ---
// Memperbarui indikator Online/Offline di dashboard berdasarkan respon asli hardware.
setInterval(async () => {
    const stations = await db.collection('stations').get();
    stations.forEach(async (doc) => {
        const s = doc.data();
        if (s.ipAddress) {
            try {
                const { stdout } = await execAsync(\`\${adbCmd} -s \${s.ipAddress}:5555 shell "getprop sys.boot_completed"\`, execOptions);
                if (stdout.trim() === '1') {
                    doc.ref.update({ last_heartbeat: Date.now() });
                }
            } catch (e) {}
        }
    });
}, 45000);
  `;

  const handleCopyCode = () => {
      navigator.clipboard.writeText(HYBRID_BRIDGE_V1_3_3.trim());
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "XPBridge v1.3.3 Hybrid Tersalin!", variant: "success" });
  };

  const handleAction = async (stationId: string, action: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      try {
          const updates: any = {
              last_action: action,
              last_action_timestamp: Date.now()
          };
          if (action === 'stop' || action === 'sleep') {
              updates.is_active = false;
              updates.end_time = null;
          }
          await updateDoc(doc(firestore, 'stations', stationId), updates);
          toast({ title: `Sinyal ${action.toUpperCase()} dikirim`, variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  };

  const handleSimulateTime = async (stationId: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      const durationStr = customDurations[stationId] || '0';
      const minutes = parseInt(durationStr);
      if (isNaN(minutes) || minutes <= 0) {
          toast({ title: "Input Salah", description: "Masukkan jumlah menit.", variant: "destructive" });
          return;
      }
      try {
          const nowMs = Date.now();
          const endTime = nowMs + minutes * 60 * 1000;
          await updateDoc(doc(firestore, 'stations', stationId), {
              is_active: true,
              is_paused: false,
              start_time: nowMs,
              end_time: endTime,
              last_action: 'start',
              last_action_timestamp: nowMs,
              current_transaction_id: 'SIM_' + Math.random().toString(36).substring(2, 7).toUpperCase()
          });
          toast({ title: `Simulasi ${minutes}m Dimulai`, variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
  };

  const updateCustomDuration = (stationId: string, val: string) => {
      setCustomDurations(prev => ({ ...prev, [stationId]: val }));
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:grid md:grid-cols-2 justify-between items-start md:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Ultimate Hybrid v1.3.3</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Simulator <span className="text-primary">Master</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Kendali hardware paralel dengan penghematan kuota RAM Watchdog.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/panduan">
                <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl border-border">
                    <BookText className="size-4" /> Panduan Build
                </Button>
            </Link>
            <Button onClick={handleCopyCode} className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl shadow-xl shadow-primary/30">
                {hasCopied ? <Check className="size-4" /> : <Terminal className="size-4" />}
                {hasCopied ? 'Tersalin' : 'Ambil Script v1.3.3'}
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedStations?.map(station => {
                  const hbMillis = station.last_heartbeat?.toMillis ? station.last_heartbeat.toMillis() : (typeof station.last_heartbeat === 'number' ? station.last_heartbeat : 0);
                  const isOnline = hbMillis > 0 && (now - hbMillis < 60000);
                  
                  return (
                      <Card key={station.id} className="border-border bg-card shadow-sm overflow-hidden rounded-2xl">
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
                                  <div className={cn(
                                      "size-2.5 rounded-full",
                                      isOnline ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500 animate-pulse"
                                  )} title={isOnline ? 'Verified Link' : 'No Response'} />
                              </div>
                          </CardHeader>
                          <CardContent className="p-5 space-y-4">
                              <div className="grid grid-cols-4 gap-2">
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-emerald-600 border-emerald-500/20" onClick={() => handleAction(station.id, 'wake')}><Power className="size-3.5" /><span className="text-[8px] font-black">WAKE</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1 text-red-600 border-red-500/20" onClick={() => handleAction(station.id, 'sleep')}><Moon className="size-3.5" /><span className="text-[8px] font-black">SLEEP</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'home')}><Home className="size-3.5" /><span className="text-[8px] font-black">HOME</span></Button>
                                  <Button variant="outline" size="sm" className="h-10 flex flex-col gap-1" onClick={() => handleAction(station.id, 'hdmi')}><Zap className="size-3.5" /><span className="text-[8px] font-black">HDMI</span></Button>
                              </div>

                              <div className="pt-4 border-t border-dashed space-y-3">
                                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Simulasi Loss (Tanpa Invoice)</p>
                                  <div className="flex gap-2">
                                      <div className="relative flex-1">
                                          <Input 
                                            type="number" 
                                            placeholder="Menit..." 
                                            className="h-9 pr-8 font-black font-mono text-xs rounded-xl bg-muted/30"
                                            value={customDurations[station.id] || ''}
                                            onChange={(e) => updateCustomDuration(station.id, e.target.value)}
                                            disabled={station.is_active}
                                          />
                                          <div className="absolute right-3 top-2.5 text-[8px] font-black text-muted-foreground uppercase">Min</div>
                                      </div>
                                      <Button 
                                          className="h-9 px-4 rounded-xl font-black uppercase text-[9px] gap-2 shadow-lg shadow-primary/20"
                                          onClick={() => handleSimulateTime(station.id)}
                                          disabled={station.is_active}
                                      >
                                          <Play className="size-3 fill-current" /> Play
                                      </Button>
                                      {station.is_active && (
                                          <Button 
                                              variant="destructive" 
                                              size="sm" 
                                              className="h-9 w-9 rounded-xl p-0"
                                              onClick={() => handleAction(station.id, 'stop')}
                                          >
                                              <Power className="size-3.5" />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  )
              })}
          </div>

          <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                      <AlertCircle className="size-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Kecanggihan Hybrid V1.3.3</h4>
                  </div>
                  <ul className="space-y-2 text-[10px] text-muted-foreground">
                      <li>• <b>Parallel Core</b>: Setiap TV memiliki jalur komunikasinya sendiri. Jika TV 1 macet, TV lain tidak ikut membeku.</li>
                      <li>• <b>RAM Watchdog</b>: Pengecekan sisa waktu dilakukan di memori laptop. Ini menghemat ribuan kuota Firestore harian.</li>
                      <li>• <b>Startup Alert</b>: Memberikan konfirmasi visual kepada kasir saat aplikasi bridge berhasil aktif di latar belakang.</li>
                  </ul>
              </div>

              <Card className="bg-slate-950 border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500" />
                          <div className="size-2 rounded-full bg-amber-500" />
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span className="ml-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">bridge.js (V1.3.3 Hybrid)</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500" onClick={handleCopyCode}>
                          <Copy className="size-3" />
                      </Button>
                  </div>
                  <ScrollArea className="h-[400px]">
                      <pre className="p-6 text-[11px] font-mono text-emerald-400 leading-relaxed">
                          <code>{HYBRID_BRIDGE_V1_3_3.trim()}</code>
                      </pre>
                  </ScrollArea>
              </Card>
          </div>
      </div>
    </div>
  );
}
