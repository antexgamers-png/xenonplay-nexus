# 💎 XENONPLAY NEXUS: ULTIMATE TECHNICAL BLUEPRINT v1.0

Dokumen ini adalah panduan teknis lengkap yang menjelaskan arsitektur, logika kode, dan integrasi hardware sistem **XenonPlay Nexus**. Dirancang untuk memastikan keberlanjutan sistem setelah masa transisi.

---

## 1. Arsitektur Teknologi (Tech Stack)
Sistem ini dibangun dengan pendekatan modern untuk performa tinggi dan skalabilitas:

*   **Frontend**: Next.js 15 (App Router) - Framework React tercepat saat ini.
*   **Styling**: Tailwind CSS & Shadcn UI - Desain antarmuka profesional dan responsif.
*   **Database & Auth**: Firebase (Firestore & Authentication) - Pusat data real-time.
*   **Hardware Bridge**: Node.js (Background Service) - Jembatan antara Cloud dan TV via ADB.
*   **State Management**: React Hooks & Context API (AuthProvider, ShiftProvider, NotificationProvider).

---

## 2. Struktur Data Firestore (Backend)
Basis data Firestore dirancang dengan skema **Flat-Collection** untuk efisiensi kueri:

### A. Entitas Utama (`/docs/backend.json`)
1.  **`users`**: Profil operator (Admin/Staff) dengan `currentSessionId` untuk keamanan sesi tunggal.
2.  **`stations`**: Status hardware (Timer, EndTime, IsActive, LastAction).
3.  **`transactions`**: Log keuangan, rincian biaya sewa, dan FnB.
4.  **`members`**: Data pelanggan, saldo poin, dan progres stempel loyalitas.
5.  **`shifts`**: Audit kasir (Modal awal vs Uang fisik).
6.  **`vouchers`**: Kode kredit sisa waktu dari penghentian sesi dini.
7.  **`settings`**: Pengaturan tema master dan konten landing page.

---

## 3. Logika Inti & Mutasi Data (`src/lib/data.ts`)
Seluruh mutasi data menggunakan **Firestore Transactions** (`runTransaction`) untuk menjamin integritas data (Atomicity).

### A. Pemrosesan Loyalitas (Loyalty Logic)
Setiap kali sesi dibayar/dilunasi, sistem menjalankan fungsi `processLoyaltyInTransaction`:
1.  Menambah 1 Stempel (`stamps`).
2.  Jika Stempel = 10, Reset ke 0 dan Tambah 1 Poin (`points`).
3.  Otomatis membuat voucher gratis 1 jam sebagai reward poin.

### B. Konversi Sesi ke Kredit (Voucher System)
Fungsi `convertSessionToCredit` melakukan:
1.  Menghitung sisa menit dari `endTime` stasiun.
2.  Membuat dokumen di koleksi `vouchers` dengan kode unik.
3.  Menghentikan sesi hardware (`last_action: 'stop'`).

---

## 4. Integrasi Hardware (XPBridge Engine)
Jantung otomasi hardware berada pada skrip `bridge.js` yang berjalan di laptop kasir.

### A. Alur "Clean Transition" (v1.9.1)
Skrip ini memantau koleksi `stations` menggunakan listener `onSnapshot`.
*   **Action START**: Membuka `/welcome` -> Delay 3.5s -> Switch HDMI.
*   **Action STOP (Hard Reset)**: Perintah Sleep (223) -> Delay 1.5s -> Wakeup (224) -> Buka `/tv-landing`.
    *   *Tujuan*: Mematikan HDMI paksa agar menu "Home" Android tidak sempat muncul.

### B. ADB Command Presisi
*   **Wakeup**: `input keyevent 224`
*   **Sleep**: `input keyevent 223`
*   **HDMI MediaTek**: `am start -n com.mediatek.wwtv.tvcenter/.../HW[4+HDMI]`

---

## 5. Fitur Keamanan & Stabilitas
1.  **Single Device Enforcement**: Setiap user memiliki `currentSessionId`. Jika user login di laptop baru, sesi di HP lama otomatis logout.
2.  **Theme Sync**: Komponen `src/components/theme-sync.tsx` menyinkronkan warna dashboard (Terang/Gelap) seluruh perangkat sesuai jadwal yang diatur Admin.
3.  **Web Watchdog**: Fail-safe di `WatchdogProvider.tsx` yang tetap mematikan stasiun jika koneksi internet laptop Bridge terputus sebentar.

---

## 6. Prosedur Pemeliharaan (Ops)
1.  **Deployment**: Gunakan `sh deploy.sh` untuk sinkronisasi otomatis ke Firebase dan GitHub.
2.  **Mode Offline**: Jika internet mati total, jalankan `firebase emulators:start` untuk menjadikan laptop kasir sebagai server lokal.
3.  **Update Hardware**: Jika menambah TV baru, cukup daftarkan IP-nya di menu **Manajemen Hardware**; Bridge akan otomatis mendeteksi tanpa restart.

---
*Handcrafted by App Prototyper for XenonPlay Nexus © 2026*
