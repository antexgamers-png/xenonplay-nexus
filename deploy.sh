
#!/bin/bash

# XenonPlay Nexus - Ultimate Sync & Deploy (v2.2)
# Script ini melakukan pembersihan cache build, Build, Deploy, dan Push ke GitHub.
# Dirancang untuk menjaga integritas data dan riwayat versi.

echo "--------------------------------------------------"
echo "🧹 MEMBERSIHKAN CACHE & MEMULAI PROSES DEPLOY..."
echo "--------------------------------------------------"

# Pastikan skrip berhenti jika ada error
set -e

# Bersihkan sisa build lama untuk menghindari error Static Export
echo "🧼 Menghapus folder .next dan out..."
rm -rf .next out

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
# Pastikan Anda sudah login ke firebase CLI
firebase deploy --only hosting,firestore --project studio-6812150142-ab408 --message "Stable Deploy: $(date +'%Y-%m-%d %H:%M:%S')"

# 4. Sinkronisasi ke GitHub (Menjaga riwayat versi)
echo "📡 Menyinkronkan perubahan ke GitHub..."

# Pastikan Git sudah diinisialisasi
if [ ! -d ".git" ]; then
    echo "⚠️ Git belum terdeteksi. Melakukan inisialisasi awal..."
    git init
    git remote add origin https://github.com/antexgamers-png/xenonplay-nexus.git
    git branch -M main
fi

# Ambil perubahan terbaru dari GitHub untuk menghindari rejected error
echo "📥 Menarik data terbaru dari GitHub (Rebase)..."
git pull origin main --rebase || echo "⚠️ Rebase dilewati (mungkin repo baru)."

# Tambahkan perubahan, buat commit, dan push
git add .

# Jika tidak ada perubahan, git commit akan memberikan pesan peringatan, kita handle agar script tetap jalan
COMMIT_MSG="System Clean Sync: $(date +'%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "✅ Kode sudah sinkron, tidak ada yang perlu di-commit."

echo "📤 Melakukan Push ke GitHub..."
# Masukkan Personal Access Token (PAT) jika diminta password
git push origin main

echo "--------------------------------------------------"
echo "✅ PROSES SELESAI DENGAN BERSIH!"
echo "Akses Server: https://xenonplay.web.app"
echo "--------------------------------------------------"
