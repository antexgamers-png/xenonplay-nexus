
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    RefreshCw,
    Activity,
    Clock,
    Play
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

  const STABLE_BRIDGE_V1_3_0 = `
/**
 * XENONPLAY NEXUS - XPBridge V1.3.0 (Stable Legacy)
 * Arsitektur: Node.js Pure Script (Terminal Edition)
 * Karakteristik: Paling stabil, rendah latency, tembus koneksi TV sulit.
 */

const admin = require('firebase-admin');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- 1. KONFIGURASI PATH ---
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Path ADB Portabel (Jika ada di folder bin)
const adbPath = path.join(__dirname, 'bin', 'adb.exe');
const adbCmd = fs.existsSync(adbPath) ? \`"\${adbPath}"\` : 'adb';

console.log('--------------------------------------------------');
console.log('🚀 XENON BRIDGE V1.3.0 STABLE IS RUNNING');
console.log('--------------------------------------------------');

// --- 2. LOGIKA MONITORING & EKSEKUSI ---
db.collection('stations').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const data = change.doc.data();
    const stationId = change.doc.id;

    if (data.last_action) {
      console.log(\`[\${new Date().toLocaleTimeString()}] Menerima sinyal: \${data.last_action.toUpperCase()} -> \${data.name}\`);
      
      const ip = data.ipAddress;
      const action = data.last_action;
      const hdmiIndex = data.hdmiIndex || 1;

      // 3. FORCE HANDSHAKE (Disconnect -> Connect)
      exec(\`\${adbCmd} disconnect \${ip}:5555\`, () => {
        setTimeout(() => {
          exec(\`\${adbCmd} connect \${ip}:5555\`, (err, stdout) => {
            if (stdout.includes('connected')) {
              console.log(\`✅ Terhubung ke \${data.name} (\${ip})\`);
              executeAdbCommand(ip, action, hdmiIndex, data.name);
            } else {
              console.log(\`❌ Gagal terhubung ke \${data.name}\`);
            }
          });
        }, 1200); // Jeda stabilitas socket
      });

      // Reset flag agar tidak loop
      db.collection('stations').doc(stationId).update({ last_action: null });
    }
  });
});

function executeAdbCommand(ip, action, hdmi, name) {
  let cmd = '';
  const hw = 4 + parseInt(hdmi);
  const intent = \`am start -n com.mediatek.wwtv.tvcenter/com.mediatek.wwtv.tvcenter.nav.TurnkeyUiMainActivity -d content://android.media.tv/passthrough/com.mediatek.tvinput/.hdmi.HDMIInputService/HW\${hw}\`;

  if (action === 'start' || action === 'wake' || action === 'resume') {
    cmd = \`shell "input keyevent 224 && sleep 0.8 && \${intent}"\`;
  } else if (action === 'stop' || action === 'sleep' || action === 'pause') {
    cmd = \`shell "input keyevent 3 && input keyevent 223"\`;
  } else if (action === 'home') {
    cmd = \`shell "input keyevent 3"\`;
  }

  if (cmd) {
    exec(\`\${adbCmd} -s \${ip}:5555 \${cmd}\`, (err) => {
      if (!err) console.log(\`✨ Sinyal \${action} sukses terkirim ke \${name}\`);
      else console.log(\`⚠️ \${name} tidak merespons perintah\`);
    });
  }
}

// Heartbeat Status (Online Indicator)
setInterval(() => {
    db.collection('stations').get().then(snap => {
        snap.forEach(d => d.ref.update({ last_heartbeat: Date.now() }));
    });
}, 30000);
  `;

  const handleCopyCode = () => {
      navigator.clipboard.writeText(STABLE_BRIDGE_V1_3_0.trim());
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "XPBridge v1.3.0 Tersalin!", variant: "success" });
  };

  const handleAction = async (stationId: string, action: string) => {
      if (!firestore) return;
      if (!checkShift()) return;
      try {
          const updates: any = {
              last_action: action,
              last_action_timestamp: Date.now()
          };
          
          // Jika action stop, pastikan is_active diset false di sini juga
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

  const handleSimulateTime = async (stationId: string, minutes: number) => {
      if (!firestore) return;
      if (!checkShift()) return;
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
              current_transaction_id: 'SIMULASI_LOSS_' + Math.random().toString(36).substring(2, 7).toUpperCase()
          });
          
          toast({ 
              title: `Simulasi ${minutes}m Dimulai`, 
              description: "Status unit aktif tanpa catatan transaksi (Loss).",
              variant: "success" 
          });
      } catch (err: any) {
          toast({ title: "Gagal Simulasi", description: err.message, variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:grid md:grid-cols-2 justify-between items-start md:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Stable Legacy v1.3.0</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Simulator <span className="text-primary">Master</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Uji coba hardware secara langsung dan simulasi waktu tanpa transaksi.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/panduan">
                <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl border-border">
                    <BookText className="size-4" /> Panduan
                </Button>
            </Link>
            <Button onClick={handleCopyCode} className="font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-xl shadow-xl shadow-primary/30">
                {hasCopied ? <Check className="size-4" /> : <Terminal className="size-4" />}
                {hasCopied ? 'Tersalin' : 'Ambil Script v1.3.0'}
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedStations?.map(station => {
                  const hbMillis = station.last_heartbeat?.toMillis ? station.last_heartbeat.toMillis() : (typeof station.last_heartbeat === 'number' ? station.last_heartbeat : 0);
                  const isOnline = hbMillis > 0 && (now - hbMillis < 45000);
                  
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
                                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                  )} title={isOnline ? 'Bridge Terkoneksi' : 'Offline'} />
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
                                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Simulasi Timer (No Transaksi)</p>
                                  <div className="flex gap-2">
                                      <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1 h-9 rounded-xl font-black uppercase text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                          onClick={() => handleSimulateTime(station.id, 60)}
                                          disabled={station.is_active}
                                      >
                                          <Play className="size-3 fill-current" /> 1 Jam
                                      </Button>
                                      <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1 h-9 rounded-xl font-black uppercase text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                          onClick={() => handleSimulateTime(station.id, 120)}
                                          disabled={station.is_active}
                                      >
                                          <Clock className="size-3" /> 2 Jam
                                      </Button>
                                      {station.is_active && (
                                          <Button 
                                              variant="destructive" 
                                              size="sm" 
                                              className="h-9 w-9 rounded-xl p-0"
                                              onClick={() => handleAction(station.id, 'stop')}
                                              title="Stop Simulasi"
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
              {sortedStations.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl opacity-30">
                      <Activity className="size-12 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">Belum ada unit TV terdaftar</p>
                  </div>
              )}
          </div>

          <div className="lg:col-span-5 space-y-6">
              <Card className="bg-slate-950 border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500" />
                          <div className="size-2 rounded-full bg-amber-500" />
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span className="ml-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">bridge.js (Legacy Stable)</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500" onClick={handleCopyCode}>
                          <Copy className="size-3" />
                      </Button>
                  </div>
                  <ScrollArea className="h-[500px]">
                      <pre className="p-6 text-[11px] font-mono text-emerald-400 leading-relaxed">
                          <code>{STABLE_BRIDGE_V1_3_0.trim()}</code>
                      </pre>
                  </ScrollArea>
              </Card>

              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                      <Zap className="size-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Peringatan Simulasi</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                      "Gunakan tombol simulasi hanya untuk pengujian hardware. Karena tidak mencatat transaksi, omzet pada laporan keuangan tidak akan bertambah."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
