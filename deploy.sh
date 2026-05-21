
#!/bin/bash

# XenonPlay Nexus - Enterprise Deploy Script (Final v1.3)
echo "--------------------------------------------------"
echo "🚀 MEMULAI PROSES PRODUKSI: XENONPLAY NEXUS"
echo "--------------------------------------------------"

# Pastikan skrip berhenti jika ada error
set -e

# 1. Jalankan build produksi (Static Export)
echo "🏗️ Membangun paket aplikasi (next build)..."
npm run build

# 2. Verifikasi folder output
if [ -d "out" ]; then
    echo "✅ Paket siap. Folder 'out' terverifikasi."
else
    echo "❌ Error: Folder 'out' tidak ditemukan! Build gagal."
    exit 1
fi

# 3. Jalankan perintah deploy ke Firebase Hosting
echo "📦 Mengunggah ke server global..."
# Menggunakan ID Proyek yang sudah terdaftar di firebaseConfig
firebase deploy --only hosting --project studio-6812150142-ab408 --message "Final Stable Release v1.3.0"

echo "--------------------------------------------------"
echo "✅ DEPLOYMENT BERHASIL!"
echo "Akses: https://xenonplay.web.app"
echo "TIPS: Pastikan Laptop Bridge sudah menggunakan skrip V1.3.0"
echo "--------------------------------------------------"
