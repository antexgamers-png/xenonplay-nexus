
# XENONPLAY NEXUS: MASTER BLUEPRINT v2.5

## 1. Visi & Filosofi Produk
XenonPlay Nexus adalah sistem manajemen rental PlayStation premium yang menggabungkan kemudahan operasional kasir dengan otomatisasi hardware tingkat tinggi. Fokus utama adalah **Zero-Idle** (memastikan unit tidak pernah menyala tanpa dibayar) dan **Real-Time Visibility**.

---

## 2. Arsitektur Teknis
### Tech Stack
- **Framework**: Next.js 15 (App Router).
- **Database & Real-time**: Google Firebase Firestore.
- **Authentication**: Firebase Auth (Role-based: Admin & Staff).
- **UI System**: ShadCN UI + Tailwind CSS (Azure Cyan & Vibrant Amber Theme).
- **Animation**: Framer Motion (untuk transisi antar menu).
- **Automation Bridge**: Node.js Backend (Smart Guardian Bridge) yang berjalan di laptop kasir.

### Konsep Skalabilitas Layar
- **Dashboard**: Menggunakan sistem `overflow-hidden` dengan scroll area internal untuk kenyamanan navigasi operator.
- **Public Page**: Menggunakan arsitektur `Hybrid-Scroll`. Terkunci (Scale-to-fit) pada layar besar (TV/Monitor) untuk kesan Digital Signage, dan Scrolling alami pada perangkat Mobile.

---

## 3. Modul Core & Logika Bisnis

### A. Manajemen Sesi (Billing & Timer)
1. **Inisialisasi**: Sesi dimulai dengan memilih paket waktu. Sistem secara otomatis menghitung `end_time` (Waktu Sekarang + Durasi).
2. **Otomatisasi Hardware**: Saat `is_active` berubah menjadi `true`, field `last_action: "start"` memicu Bridge untuk mengirim perintah `Wake Up` & `Switch HDMI` ke Smart TV terkait via ADB.
3. **Smart Watchdog**: Bridge memantau sisa waktu setiap detik. Jika `now >= end_time`, Bridge akan mengeksekusi urutan `Stop`: TV kembali ke Home -> Menampilkan Landing Page -> Nonaktifkan sesi di database.
4. **Pause/Resume Logic**: Saat dijeda, sistem menyimpan `remaining_seconds`. Saat dilanjutkan, sistem menghitung ulang `end_time` baru berdasarkan sisa detik tersebut.

### B. Sistem Akuntansi & Shift
- **Integritas Saldo**: Setiap staff wajib memasukkan "Modal Awal" (uang fisik di laci).
- **Perhitungan Otomatis**: 
  `Ekspektasi Saldo = Modal Awal + Total Penjualan Lunas`.
- **Tutup Shift**: Sistem membandingkan uang fisik akhir dengan ekspektasi. Selisih (minus/surplus) wajib dicatat untuk audit pemilik.

### C. Membership & Loyalitas
- **Akumulasi Poin**: (Sedang dalam pengembangan) Pelanggan mendapatkan poin berdasarkan nominal transaksi.
- **Redeem**: Member dapat menukar poin dengan hadiah (Bonus waktu atau FnB) yang akan memotong tagihan (`discount`) secara otomatis di kasir.

### D. Manajemen Inventaris (FnB)
- **Real-time Sync**: Stok barang otomatis berkurang setiap kali ada transaksi kantin (baik via dashboard stasiun maupun POS murni).
- **Low-Stock Alert**: Notifikasi muncul di bar atas jika stok barang tertentu di bawah 5 pcs.

---

## 4. Protokol Integrasi Hardware (ADB WiFi)
Aplikasi menggunakan perintah **Android Debug Bridge (ADB)** standar untuk mengontrol Smart TV:
- **Wake Up**: `input keyevent 224`
- **Sleep**: `input keyevent 223`
- **Home**: `input keyevent 3`
- **HDMI Switch**: `input keyevent 176`
- **Open URL**: `am start -a android.intent.action.VIEW -d "[URL]"`

---

## 5. Standar Desain & Bahasa
- **Bahasa**: Menggunakan Bahasa Indonesia "Natural-Operasional". Contoh: Bukan "Pending Transaction" tapi "Tagihan Gantung", bukan "Available" tapi "Unit Ready".
- **Visual**: Tema Dark Mode eksklusif (Slate 950) dengan aksen cahaya biru tipis untuk unit yang sedang aktif bermain.
- **Mobile First**: Seluruh tombol di dashboard dirancang cukup besar untuk navigasi layar sentuh (Tablet Kasir).

---

## 6. Alur Deployment
1. **PWA Optimization**: File `manifest.json` memastikan aplikasi berjalan tanpa address bar browser.
2. **Start URL**: Langsung mengarah ke `/login/` untuk keamanan operator.
3. **Environment**: Terintegrasi langsung dengan Firebase Hosting (`xenonplay.web.app`).
