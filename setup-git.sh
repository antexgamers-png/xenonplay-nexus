#!/bin/bash

# XenonPlay Nexus - Ultimate Git Sync v2.0
echo "--------------------------------------------------"
echo "🚀 MEMULAI PROSES SETUP GIT XENONPLAY..."
echo "--------------------------------------------------"

# 1. Hapus folder .git lama untuk membersihkan riwayat file besar
rm -rf .git
echo "✅ Folder Git lama dihapus (Pembersihan riwayat)."

# 2. Inisialisasi Git baru
git init
echo "✅ Inisialisasi Git baru berhasil."

# 3. Konfigurasi User (Sesuaikan jika perlu)
git config user.email "antexgamers@gmail.com"
git config user.name "antexgamers-png"

# 4. Tambahkan semua file (akan disaring oleh .gitignore)
git add .
echo "✅ File telah disaring dan ditambahkan."

# 5. Commit pertama
git commit -m "Production Ready: Web Nexus + TV Guardian v1.0"
echo "✅ Catatan versi dibuat."

# 6. Hubungkan ke Remote
# Pastikan URL ini sesuai dengan nama repositori Anda di GitHub
git remote add origin https://github.com/antexgamers-png/xenonplay-nexus.git
echo "✅ Terhubung ke GitHub: xenonplay-nexus"

# 7. Push ke GitHub
echo "📡 Mengunggah kode ke GitHub..."
echo "--------------------------------------------------"
echo "TIPS: Jika diminta password, gunakan 'Personal Access Token' Anda."
echo "--------------------------------------------------"
git push -u origin main --force

echo "--------------------------------------------------"
echo "✅ SELESAI! Kode Anda sudah di Cloud."
echo "--------------------------------------------------"
