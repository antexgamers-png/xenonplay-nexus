
# 🛠️ XenonPlay Bridge PRO - Developer Build Guide v1.3.2

Dokumen ini berisi spesifikasi teknis untuk membangun **XenonBridge Pro V1.3.2** yang memiliki antarmuka System Tray, Hot-Swap Online/Offline, dan Native Windows UI.

---

## 1. Persiapan Folder Source
Buat folder `XenonSource` dan pastikan struktur berikut terpenuhi:

- `bridge.js`: Salin kode dari Dashboard > Simulator Control.
- `serviceAccountKey.json`: Kunci Admin dari Firebase Console.
- `package.json`: Gunakan skrip di bawah.
- `assets/`:
    - `app-icon.ico`: Logo aplikasi (Ikon Tray & EXE).
- `bin/`: 
    - `adb.exe`, `AdbWinApi.dll`, `AdbWinUsbApi.dll`.

---

## 2. File Metadata (package.json)
```json
{
  "name": "xenon-bridge-pro",
  "version": "1.3.2",
  "main": "bridge.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "systray2": "^2.3.0"
  },
  "pkg": {
    "assets": [
      "assets/**/*",
      "bin/**/*"
    ]
  }
}
```

---

## 3. Kompilasi JavaScript ke EXE
Gunakan `pkg` untuk membungkus kode beserta asetnya.
```bash
npm install
npm install -g pkg
pkg . --targets node18-win-x64 --output xenon-bridge.exe
```

---

## 4. Skrip Inno Setup Pro (.iss)
Buka Inno Setup Compiler dan gunakan skrip ini:

```iss
[Setup]
AppName=XenonPlay Bridge Pro
AppVersion=1.3.2
DefaultDirName={autopf}\XenonPlayBridge
OutputDir=.
OutputBaseFilename=XenonBridge_Pro_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=assets\app-icon.ico

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\XenonPlay Bridge"; Filename: "{app}\xenon-bridge.exe"; IconFilename: "{app}\assets\app-icon.ico"
Name: "{userstartup}\XenonPlay Bridge"; Filename: "{app}\xenon-bridge.exe"

[Run]
Filename: "{app}\xenon-bridge.exe"; Description: "Jalankan XenonPlay Bridge Pro"; Flags: nowait postinstall skipifsilent
```

---

## 5. Fitur Baru V1.3.2
- **Hot-Swap Engine**: Menggunakan `admin.app().delete()` untuk memutus koneksi secara bersih saat pindah mode.
- **Sequential Execution**: Memastikan perintah ADB ke banyak TV diproses satu per satu untuk stabilitas server.
- **PowerShell Dialog**: Menampilkan jendela pemilihan mode (Yes/No) tanpa butuh Electron/Webview.

---
*© 2026 XenonPlay Nexus - Professional Hardware Automation*
