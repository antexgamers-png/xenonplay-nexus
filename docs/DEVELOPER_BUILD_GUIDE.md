
# 🛠️ XenonPlay Bridge PRO - Developer Build Guide v1.3.3 FINAL

Dokumen ini berisi spesifikasi teknis untuk membangun **XenonBridge EXE V1.3.3**. Versi ini berjalan di latar belakang (Silent Mode) dan memberikan notifikasi saat berhasil dijalankan.

---

## 1. Persiapan Folder Source
Buat folder `XenonBridge` di Desktop laptop kasir Anda. Struktur foldernya **wajib** seperti ini:

- `bridge.js`: Salin kode dari Dashboard > Simulator Control.
- `serviceAccountKey.json`: Kunci Admin dari Firebase Console.
- `package.json`: (Lihat Bagian 2 di bawah).
- `bin/`: 
    - `adb.exe`, `AdbWinApi.dll`, `AdbWinUsbApi.dll`.

---

## 2. File Metadata (package.json)
Buat file bernama `package.json` di dalam folder tersebut dan isi dengan kode ini:

```json
{
  "name": "xenon-bridge-hybrid",
  "version": "1.3.3",
  "main": "bridge.js",
  "bin": "bridge.js",
  "pkg": {
    "assets": ["bin/**/*", "serviceAccountKey.json"]
  },
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
```

---

## 3. Cara Membuat File EXE (Build)
Pastikan Anda sudah menginstal **Node.js** di laptop.

1. Buka CMD di dalam folder `XenonBridge`.
2. Instal library yang dibutuhkan:
   ```bash
   npm install
   ```
3. Instal alat pembungkus EXE:
   ```bash
   npm install -g pkg
   ```
4. Jalankan perintah kompilasi:
   ```bash
   pkg . --targets node18-win-x64 --output xenon-bridge.exe
   ```

---

## 4. Cara Menjalankan Agar Ada Notifikasi & Tanpa Jendela (Silent)
Agar aplikasi berjalan otomatis di latar belakang tanpa jendela hitam CMD yang mengganggu, kita gunakan script **VBScript** sederhana.

1. Buat file baru bernama `run-bridge.vbs` di folder yang sama.
2. Isi kodenya:
   ```vbs
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.Run "xenon-bridge.exe", 0, false
   ```
3. **Selesai!** Cukup klik 2x file `run-bridge.vbs`. 
4. Anda akan melihat **Notifikasi Windows** di pojok kanan bawah yang bertuliskan: *"Xenon Bridge V1.3.3 Hybrid telah AKTIF di latar belakang."*

---

## 5. Fitur Baru V1.3.3 (Hybrid Ultimate)
- **Startup Alert**: Menggunakan PowerShell Proxy untuk memicu notifikasi asli Windows 10/11 saat aplikasi dimulai.
- **Parallel Core**: Menghapus sistem antrean tunggal yang sering membeku.
- **MediaTek Stability**: Jeda stabilitas 800ms untuk menjamin TV bangun & pindah HDMI sukses.
- **RAM Watchdog**: Pengecekan sisa waktu dilakukan di RAM laptop, menghemat biaya Cloud Google.

---
*© 2026 XenonPlay Nexus - Enterprise Hardware Automation*
