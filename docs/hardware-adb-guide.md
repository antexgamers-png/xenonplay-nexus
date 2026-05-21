
# 📟 XenonPlay Nexus: XPBridge V.01 Stable (MediaTek Optimized)

Sistem ini menggunakan satu laptop kasir sebagai pusat kontrol yang mengirimkan perintah ke banyak TV melalui jaringan WiFi menggunakan protokol ADB dan skrip **XPBridge**.

---

## 1. Persiapan TV (Wajib)
Lakukan ini di setiap unit TV:
1. **Developer Options**: Buka *Settings > About*, klik *Build Number* 7x.
2. **Wireless Debugging**: Aktifkan *USB Debugging* dan *Wireless Debugging*.
3. **Static IP**: Atur IP TV menjadi statis (misal: `192.168.1.10`).
4. **Always On WiFi**: Pastikan WiFi tetap aktif saat TV standby (*Settings > Network > Stay connected when sleep*).

---

## 2. Persiapan Laptop Kasir
1. **Instal ADB**: Unduh `platform-tools` Android dan tambahkan ke Environment Path.
2. **Hubungkan TV**: Buka CMD, ketik `adb connect [IP_TV]:5555`. 
   *Muncul notifikasi di TV? Centang "Selalu Izinkan" dan klik OK.*
3. **Instal Node.js**: Download dari `nodejs.org`.

---

## 3. Menjalankan XPBridge V.01 Stable
1. Ambil skrip `bridge.js` dari menu **Simulator Control** di dashboard.
2. Dapatkan file `serviceAccountKey.json` dari:
   *Firebase Console > Project Settings > Service Accounts > Generate New Private Key*.
3. Letakkan kedua file dalam satu folder.
4. Jalankan perintah:
   ```bash
   npm install firebase-admin
   node bridge.js
   ```

---

## 4. Analisis Teknis V.01 Stable
Skrip ini dioptimalkan berdasarkan review mendalam untuk menangani kondisi lapangan:
- **Sequential Exec**: Menggunakan `util.promisify` agar perintah ke banyak TV tidak membuat ADB server crash.
- **Wake-on-Switch**: Mengirim sinyal `Wakeup (224)` sebelum perintah `am start` untuk memastikan TV MediaTek merespons instan.
- **Fail-Safe**: Menghapus antrean perintah di Firestore hanya setelah verifikasi lokal berhasil, mencegah perintah "hilang" saat internet tidak stabil.

---
*© 2026 XenonPlay Nexus - Enterprise Hardware Automation*
