
# 💎 XenonPlay Nexus - Enterprise Game Center Manager

Sistem manajemen rental PlayStation real-time dengan teknologi **Hybrid Autonomy** (Tetap stabil meskipun internet terputus).

## 🚀 Prosedur Deployment (Online)
Jika Anda melakukan perubahan pada tampilan web, gunakan perintah ini di terminal:
```bash
sh deploy.sh
```
Aplikasi akan diperbarui secara otomatis di **[https://xenonplay.web.app](https://xenonplay.web.app)**.

## 📟 Setup Laptop Kasir (XPBridge V1.3.0 Stable)
Sistem ini menggunakan laptop kasir sebagai pengawas hardware.

### Langkah Instalasi Pertama:
1. Buka dashboard di menu **Integrasi > Simulator Control**.
2. Klik tombol **Ambil Master Bridge V1.3.0**.
3. Simpan kodenya sebagai `bridge.js` di laptop kasir.
4. Masukkan file `serviceAccountKey.json` dari Firebase Console ke folder yang sama.
5. Jalankan perintah:
   ```bash
   npm install firebase-admin
   node bridge.js
   ```

### Fitur Unggulan V1.3.0:
- **Local Watchdog**: TV pasti mati tepat waktu meskipun internet mati saat sesi berakhir.
- **Deep Sleep Fix**: Sinyal "Burst Wakeup" menjamin TV bangun instan dari tidur nyenyak.
- **Persistent Connection**: Menggunakan < 1% CPU laptop, sangat ringan dan dingin.

## 🏠 Mode Server Offline (Kedaulatan 100%)
Jika Anda ingin sistem berjalan sepenuhnya di jaringan lokal tanpa internet sama sekali, ikuti panduan di `docs/OFFLINE_SETUP_GUIDE.md`.

---
Handcrafted by **AfrIbr Studio** © 2026 • *Build for Stability*
