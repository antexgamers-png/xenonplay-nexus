
# 💎 XenonPlay Nexus - Enterprise Game Center Manager

Sistem manajemen rental PlayStation real-time dengan teknologi **Hybrid Autonomy V1.3.3**.

## 🚀 Prosedur Deployment (Online)
Jika Anda melakukan perubahan pada tampilan web, gunakan perintah ini di terminal:
```bash
sh deploy.sh
```
Akses Server: **[https://xenonplay.web.app](https://xenonplay.web.app)**.

## 📟 Setup Laptop Kasir (XPBridge V1.3.3 Hybrid - REKOMENDASI)
Sistem ini menggunakan satu laptop kasir sebagai pengawas hardware anti-macet.

### Mengapa V1.3.3 Hybrid?
- **Parallel Core**: TV macet tidak menyandera TV lain.
- **MediaTek Sync**: Jeda stabilitas 800ms untuk menjamin TV bangun & pindah HDMI 100% sukses.
- **Real Heartbeat**: Status hijau di dashboard benar-benar dicek via ADB Ping (Bukan Fake Date).
- **Quota Saver**: Pengecekan sisa waktu dilakukan di RAM laptop, menghemat biaya Cloud Google.

### Langkah Instalasi:
1. Buka dashboard di menu **Integrasi > Simulator Control**.
2. Klik tombol **Ambil Script v1.3.3**.
3. Simpan kodenya sebagai `bridge.js` di folder `C:\XenonBridge`.
4. Masukkan file `serviceAccountKey.json` dari Firebase Console ke folder yang sama.
5. Jalankan perintah:
   ```bash
   npm install firebase-admin
   node bridge.js
   ```

## 🏠 Mode Server Offline
Jika internet terputus, sistem tetap berjalan lancar. Ikuti panduan di `docs/OFFLINE_SETUP_GUIDE.md`.

---
Handcrafted by **AfrIbr Studio** © 2026 • *Stability is the Core of Business*
