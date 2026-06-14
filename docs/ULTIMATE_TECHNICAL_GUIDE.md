# 💎 XENONPLAY NEXUS: THE ULTIMATE TECHNICAL BIBLE v1.2

Dokumen ini adalah warisan teknis lengkap yang menjelaskan setiap algoritma, arsitektur, dan logika yang membuat **XenonPlay Nexus** berjalan. Ini dirancang agar sistem dapat dipahami, diperbaiki, dan dikembangkan bahkan setelah transisi platform.

---

## I. ARSITEKTUR SISTEM (THE SKELETON)
Sistem ini menggunakan arsitektur **Serverless Hybrid**:
*   **Database Terpusat (Cloud)**: Firebase Firestore sebagai *Single Source of Truth*. Seluruh status TV, uang, dan member ada di sini.
*   **Edge Computing (Local)**: Laptop Kasir menjalankan skrip Node.js (XPBridge) yang bertindak sebagai eksekutor hardware.
*   **Frontend (UI)**: Next.js 15 dengan App Router, dioptimalkan untuk kecepatan akses dan reaktivitas real-time.

---

## II. LOGIKA BARU LOYALITAS (UPDATE v1.2)
Sistem loyalitas kini dioptimalkan untuk mendorong member melakukan **Manual Redemption**:
1.  **Stamp Reward**: Member mendapatkan stempel tiap sesi sewa. Saat mencapai 10 stempel, member otomatis mendapatkan **5 Poin**.
2.  **No Auto-Voucher**: Tidak ada pemberian voucher gratis otomatis saat stempel penuh.
3.  **Redemption Store**: Member harus menukarkan poin yang mereka kumpulkan dengan hadiah yang ada di katalog (diatur oleh Admin).

---

## III. LOGIKA INTI BACKEND (THE BRAIN)

### 1. Struktur Data & Relasi
Berdasarkan `docs/backend.json`, kita menggunakan skema koleksi datar (*flat*) untuk performa kueri maksimal:
*   `users`: Profil operator + `currentSessionId` (Kunci keamanan sesi tunggal).
*   `stations`: Unit hardware. Properti paling kritis adalah `end_time` (Unix Timestamp) dan `last_action`.
*   `transactions`: Jantung keuangan. Setiap sesi atau item kantin yang keluar dicatat di sini.
*   `members`: Profil loyalitas pelanggan.
*   `shifts`: Audit laci kasir (Modal vs Penjualan vs Uang Fisik).

### 2. Keamanan Tingkat Tinggi (Firestore Rules)
Keamanan tidak hanya mengandalkan login, tapi pada fungsi pembatasan di `firestore.rules`:
*   `isAdmin()`: Mengecek peran di dokumen `/users/{uid}`.
*   `isOwner()`: Memastikan staff hanya bisa mengubah data tertentu.
*   **Public Read**: Koleksi `pricingRules` dan `stations` bisa dibaca publik untuk Monitor TV dan Landing Page.

---

## IV. LOGIKA MUTASI DATA (THE HEART - `src/lib/data.ts`)

Seluruh mutasi data yang krusial menggunakan **Firestore Transactions** (`runTransaction`) untuk menjamin tidak ada data yang "nanggung" jika koneksi terputus.

### 1. Algoritma Perhitungan Sesi
Saat sesi dimulai (`createTransaction`):
```typescript
// Logika: Bruto = Harga Paket + (Jumlah Stik Extra * 1000)
const finalBruto = baseAmount + (extraSticks * 1000);
// Logika: Netto = Bruto - Diskon
const finalNetto = Math.max(0, finalBruto - discount);
```

### 2. Sistem Loyalitas (Stamp to Point)
Dijalankan setiap kali transaksi dilunasi (`processLoyaltyInTransaction`):
*   **Input**: `stamps` lama.
*   **Proses**: `nextStamps = currentStamps + 1`.
*   **Threshold**: Jika `nextStamps >= 10`, maka `points += 5` dan `stamps = 0`.
*   **Audit**: Update `lastActivity` member untuk mencegah kedaluwarsa poin.

### 3. Konversi Sesi ke Kredit (Voucher)
Fungsi `convertSessionToCredit` menghitung sisa waktu secara presisi:
```typescript
const remainingMs = Math.max(0, (sData.end_time) - Date.now());
const remainingMins = Math.floor(remainingMs / 60000);
// Syarat minimal: 5 menit.
```

---

## V. OTOMASI HARDWARE (THE ARMS - `bridge.js`)

XPBridge adalah penghubung antara dunia Digital dan Fisik via **ADB (Android Debug Bridge)**.

### 1. Sistem "Watcher" Real-time
Menggunakan `db.collection('stations').onSnapshot`. Bridge tidak melakukan request terus menerus (polling), melainkan "mendengarkan" perubahan data. Jika kolom `last_action` berubah, Bridge bereaksi instan (< 500ms).

### 2. Alur Clean Transition (Anti-Home Android)
Ini adalah trik visual agar menu Home Android tidak muncul:
*   **STOP Action**:
    1.  `input keyevent 223` (Sleep): Mematikan layar & memutus HDMI.
    2.  `delay 1.5s`: Memberi jeda napas bagi OS TV.
    3.  `input keyevent 224` (Wake): Menyalakan layar.
    4.  `am start... /tv-landing`: Membuka browser langsung ke video "Sesi Habis".

---
*Handcrafted by App Prototyper for XenonPlay Nexus - Versi Dokumentasi Terlengkap © 2026*
