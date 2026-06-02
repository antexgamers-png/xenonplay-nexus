
#!/bin/bash

# XenonPlay Nexus - Git Re-initializer (Safe Mode)
# Gunakan ini HANYA jika ingin mengganti akun GitHub atau memperbaiki remote.

echo "--------------------------------------------------"
echo "⚠️ PERINGATAN: SKRIP INI HANYA UNTUK PERBAIKAN REPO"
echo "--------------------------------------------------"

echo "Apakah Anda yakin ingin mengatur ulang remote GitHub? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Menghapus origin lama jika ada
    git remote remove origin || true
    
    # Hubungkan ke Remote Baru
    git remote add origin https://github.com/antexgamers-png/xenonplay-nexus.git
    git branch -M main
    
    echo "✅ Remote diperbarui ke: https://github.com/antexgamers-png/xenonplay-nexus.git"
    echo "💡 Gunakan 'sh deploy.sh' untuk melakukan push harian."
else
    echo "❌ Aksi dibatalkan."
fi
