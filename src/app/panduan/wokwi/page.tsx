
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CodeBlock = ({ code }: { code: string }) => {
    return (
        <pre className="bg-slate-900 text-white p-4 rounded-md overflow-x-auto text-sm">
            <code>{code.trim()}</code>
        </pre>
    );
};

export default function WokwiGuidePage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panduan Simulasi Wokwi</h1>
        <p className="text-muted-foreground mt-1">
          Uji coba firmware ESP32 secara virtual menggunakan simulator Wokwi.
        </p>
      </header>

       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Apa itu Wokwi?</AlertTitle>
          <AlertDescription>
            Wokwi adalah simulator online gratis yang memungkinkan Anda menjalankan kode ESP32, menghubungkan komponen virtual, dan bahkan terhubung ke internet langsung dari browser Anda. Ini adalah cara sempurna untuk menguji logika sebelum merakit perangkat keras fisik.
          </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Langkah-langkah Simulasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg">1. Buka Proyek Baru di Wokwi</h3>
                <p className="text-muted-foreground mt-1">
                    Buka <a href="https://wokwi.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">wokwi.com</a> dan pilih **ESP32** untuk memulai proyek baru.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-lg">2. Salin Kode Firmware</h3>
                <p className="text-muted-foreground mt-1 mb-2">
                    Salin seluruh kode C++ dari halaman <Link href="/panduan" className="text-primary underline">Panduan Integrasi</Link> dan tempelkan ke editor kode di Wokwi (biasanya file `sketch.ino`).
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-lg">3. Isi Detail Konfigurasi dalam Kode</h3>
                 <p className="text-muted-foreground mt-1 mb-2">
                    Cari bagian `--- KONFIGURASI PENGGUNA ---` di dalam kode dan isi detailnya.
                </p>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Konfigurasi WiFi untuk Wokwi</AlertTitle>
                    <AlertDescription>
                        Untuk simulasi internet di Wokwi, Anda harus menggunakan nama WiFi `Wokwi-GUEST` dan biarkan passwordnya kosong (`""`). Wokwi akan secara otomatis menyediakan koneksi internet virtual.
                    </AlertDescription>
                </Alert>
                <p className="text-muted-foreground mt-4">
                    Kredensial `API_KEY` dan `FIREBASE_PROJECT_ID` sudah terisi otomatis di dalam kode yang Anda salin. Anda mungkin perlu mengganti `station_ids` jika ID stasiun Anda berbeda.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-lg">4. Tambahkan Library (Metode Baru)</h3>
                <p className="text-muted-foreground mt-1 mb-2">
                    Klik tombol `+` di editor file Wokwi dan buat file baru bernama `wokwi.toml`. File ini akan memberitahu Wokwi library apa saja yang harus diinstal. Hapus file `libraries.txt` jika ada.
                </p>
                <p className="text-muted-foreground mt-1 mb-2">
                    Salin dan tempel konten berikut ke dalam file `wokwi.toml`:
                </p>
                <CodeBlock code={`[wokwi]\nversion = 1\n\n[dependencies]\nFirebase-ESP-Client = "latest"\nArduinoJson = "latest"`} />
            </div>

            <div>
                <h3 className="font-semibold text-lg">5. Tambahkan Komponen Virtual</h3>
                 <p className="text-muted-foreground mt-1 mb-2">
                    Klik tombol `+` biru di area diagram simulasi (kanan) untuk menambahkan komponen. Tambahkan:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>1 buah **ESP32** (biasanya sudah ada).</li>
                    <li>5 buah **Relay Module**.</li>
                </ul>
            </div>

            <div>
                <h3 className="font-semibold text-lg">6. Hubungkan Kabel Virtual (Penting!)</h3>
                 <p className="text-muted-foreground mt-1 mb-2">
                    Hubungkan pin ESP32 ke 5 modul relay sesuai skema di panduan utama. **Pastikan pin GND terhubung ke SEMUA relay.** Klik pada satu pin, lalu klik pada pin tujuan untuk membuat kabel.
                </p>
                <Image src="https://storage.googleapis.com/studio-hosting-assets/multi_station_wiring.png" alt="Skema koneksi Wokwi" width={600} height={400} className="rounded-md border"/>
            </div>

            <div>
                <h3 className="font-semibold text-lg">7. Jalankan Simulasi</h3>
                 <p className="text-muted-foreground mt-1 mb-2">
                    Klik tombol hijau **Start Simulation**. Perhatikan panel **Serial Monitor** di bagian bawah. Jika semua benar, Anda akan melihat log koneksi ke WiFi dan Firebase.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-lg">8. Uji Coba</h3>
                 <p className="text-muted-foreground mt-1">
                    Buka aplikasi XenonPlay Manager Anda, mulai sesi untuk stasiun mana pun. Anda akan melihat relay yang sesuai di Wokwi "berbunyi" dan LED-nya menyala. Saat sesi dihentikan, relay akan mati.
                </p>
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
