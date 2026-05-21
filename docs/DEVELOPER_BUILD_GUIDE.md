# 🛠️ XenonPlay Bridge - Developer Build Guide

Dokumen ini berisi instruksi teknis untuk membungkus kode JavaScript XPBridge menjadi file installer Windows (.exe) yang berjalan di latar belakang.

---

## 1. Persiapan Folder Source
Buat folder bernama `XenonSource` di Desktop Anda dan kumpulkan file berikut:

- `bridge.js`: Salin kode dari Dashboard > Simulator Control.
- `serviceAccountKey.json`: Kunci Admin dari Firebase Console.
- `app-icon.ico`: Logo XenonPlay untuk ikon aplikasi.
- `hide.vbs`: Script untuk menjalankan aplikasi secara silent (kode di bawah).
- `bin/`: Folder yang berisi `adb.exe`, `AdbWinApi.dll`, dan `AdbWinUsbApi.dll`.

---

## 2. Script Siluman (hide.vbs)
Buat file teks, beri nama `hide.vbs`, lalu masukkan kode berikut:

```vbscript
Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath
' Menjalankan bridge secara silent (0 = hide)
WshShell.Run "xenon-bridge.exe", 0, False
```

---

## 3. Kompilasi JavaScript ke EXE
Buka terminal/CMD di dalam folder `XenonSource` dan jalankan:

```bash
npm install -g pkg
pkg . --targets node18-win-x64 --output xenon-bridge.exe
```

---

## 4. Skrip Inno Setup (.iss)
Gunakan Inno Setup Compiler untuk membungkus semua file menjadi satu installer resmi.

```iss
[Setup]
AppName=XenonPlay Bridge
AppVersion=1.2.9
DefaultDirName={autopf}\XenonPlayBridge
OutputDir=.
OutputBaseFilename=XenonBridge_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=app-icon.ico

[Files]
Source: "xenon-bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "serviceAccountKey.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "hide.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "app-icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Shortcut memanggil WScript untuk menjalankan hide.vbs secara silent
Name: "{commondesktop}\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\hide.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\app-icon.ico"
Name: "{userstartup}\XenonPlay Bridge"; Filename: "wscript.exe"; Parameters: """{app}\hide.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\app-icon.ico"

[Run]
Filename: "wscript.exe"; Parameters: """{app}\hide.vbs"""; WorkingDir: "{app}"; Description: "Jalankan XenonPlay Bridge"; Flags: nowait postinstall skipifsilent
```

---
*© 2026 XenonPlay Nexus - Enterprise Hardware Automation*
