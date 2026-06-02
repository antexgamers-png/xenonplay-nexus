
#!/bin/bash

# XenonPlay Nexus - Ultimate Sync & Deploy (v2.0)
# Script ini melakukan Build, Deploy ke Hosting, dan Push ke GitHub secara berurutan.
# Dirancang untuk menjaga riwayat versi (History) tetap utuh.

echo "--------------------------------------------------"
echo "🚀 MEMULAI PROSES DUAL DEPLOY (WEB + GITHUB)..."
echo "--------------------------------------------------"

# Pastikan skrip berhenti jika ada error di tengah jalan
set -e

# 1. Jalankan build produksi (Static Export)
echo "🏗️ Membangun paket aplikasi (npm run build)..."
npm run build

# 2. Verifikasi folder output
if [ -d "out" ]; then
    echo "✅ Paket siap. Folder 'out' terverifikasi."
else
    echo "❌ Error: Folder 'out' tidak ditemukan! Build gagal."
    exit 1
fi

# 3. Jalankan perintah deploy ke Firebase Hosting & Firestore Rules
echo "📦 Mengunggah ke server Firebase..."
# Menggunakan ID Proyek yang sudah terdaftar di firebaseConfig
# Menyertakan 'firestore' agar aturan keamanan rules_version juga ikut terupdate
firebase deploy --only hosting,firestore --project studio-6812150142-ab408 --message "Update via Deploy Script: $(date +'%Y-%m-%d %H:%M:%S')"

# 4. Sinkronisasi ke GitHub (Menjaga riwayat versi)
echo "📡 Menyinkronkan perubahan ke GitHub..."

# Pastikan Git sudah diinisialisasi
if [ ! -d ".git" ]; then
    echo "⚠️ Git belum terdeteksi. Melakukan inisialisasi awal..."
    git init
    git remote add origin https://github.com/antexgamers-png/xenonplay-nexus.git
    git branch -M main
fi

# Tambahkan perubahan, buat commit dengan timestamp, dan push
git add .

# Jika tidak ada perubahan, git commit akan memberikan pesan peringatan, kita handle agar script tetap jalan
COMMIT_MSG="Deployment Sync: $(date +'%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "✅ Tidak ada perubahan kode baru yang perlu di-commit."

echo "📤 Melakukan Push ke Main Branch..."
# Push normal (tanpa --force) untuk menjaga integritas riwayat commit terdahulu
git push origin main

echo "--------------------------------------------------"
echo "✅ SEMUA PROSES BERHASIL!"
echo "Akses Server: https://xenonplay.web.app"
echo "Cek GitHub: https://github.com/antexgamers-png/xenonplay-nexus"
echo "--------------------------------------------------"
