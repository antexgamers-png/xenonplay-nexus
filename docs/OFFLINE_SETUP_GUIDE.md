# 🏠 Panduan Setup XenonPlay Mode Offline (100% Tanpa Internet)

Gunakan panduan ini untuk menjadikan **Laptop Kasir** Anda sebagai pusat data (Server) sehingga aplikasi tetap berjalan lancar meskipun Wi-Fi tidak memiliki koneksi internet.

---

## 📦 Bagian 0: Memindahkan Kode ke Laptop (Butuh Internet Sekali)

Sebelum bisa berjalan offline, Anda harus mendownload file aplikasi ini ke harddisk laptop kasir Anda:

1.  **Kirim ke GitHub**: Di terminal Firebase Studio (bawah layar ini), jalankan perintah:
    ```bash
    sh setup-git.sh
    ```
    *Pastikan Anda sudah mengikuti panduan di `docs/git-setup-guide.md` untuk menyiapkan Token GitHub.*

2.  **Clone di Laptop Kasir**: Buka Terminal/CMD di laptop kasir Anda, lalu ketik:
    ```bash
    git clone https://github.com/[USERNAME_ANDA]/xenonplay-nexus.git
    cd xenonplay-nexus
    ```

3.  **Instal Library**: Di dalam folder proyek di laptop kasir, jalankan:
    ```bash
    npm install
    ```

---

## 🏗️ Bagian 1: Persiapan Server (Sekali Jalan)

Lakukan langkah-langkah ini di Laptop Kasir:

1.  **Instal Node.js**: Download dan instal versi LTS dari [nodejs.org](https://nodejs.org/).
2.  **Instal Firebase CLI**: Buka Terminal/CMD, lalu ketik perintah berikut:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Instal Java (Wajib)**: Emulator Firebase membutuhkan Java untuk berjalan. Download dan instal dari [java.com](https://www.java.com/).

---

## 🚀 Bagian 2: Menjalankan Server Setiap Hari

Setiap kali Anda membuka toko, lakukan hal berikut di laptop kasir:

### Langkah 1: Jalankan Database Lokal
Buka folder proyek Anda di Terminal, lalu ketik:
```bash
firebase emulators:start --import=./local_data --export-on-exit
```
*Catatan: Parameter `--import` dan `--export` memastikan data transaksi dan member Anda tersimpan permanen di harddisk.*

### Langkah 2: Jalankan Aplikasi Web
Buka Terminal baru, lalu ketik:
```bash
npm run dev
```
Aplikasi sekarang dapat diakses di:
*   **Laptop Kasir**: `http://localhost:9002`
*   **HP/Tablet Lain (Satu Wi-Fi)**: `http://[IP_LAPTOP_KASIR]:9002`

---

## 📟 Bagian 3: Penyesuaian XPBridge (Hardware)

Agar XPBridge bisa mengontrol TV saat offline, Anda harus menyetel "Mode Emulator" pada skrip `bridge.js`:

1.  Buka terminal tempat Anda menjalankan `node bridge.js`.
2.  Gunakan perintah ini agar ia membaca database lokal:
    ```bash
    # Windows CMD
    set FIRESTORE_EMULATOR_HOST=localhost:8080
    set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
    node bridge.js
    ```

---

## 💡 Mengapa Menggunakan Cara Ini?
1.  **Gratis Selamanya**: Anda tidak memakai kuota Cloud Google.
2.  **Zero Latency**: Timer berjalan sangat akurat karena tidak ada delay internet.
3.  **Data Aman**: Data transaksi Anda tidak pernah keluar dari ruangan kasir.

---
*© 2026 XenonPlay Nexus - Offline Infrastructure Support*