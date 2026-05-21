# 🚀 Panduan Mengunggah Kode ke GitHub

Gunakan panduan ini untuk mengunggah proyek XenonPlay ke GitHub pertama kali atau saat ingin membersihkan riwayat file besar.

### Langkah 1: Siapkan Personal Access Token (PAT)
GitHub tidak lagi mengizinkan login menggunakan password akun biasa di terminal. Anda harus menggunakan **Token**.
1. Buka GitHub Anda -> **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2. Klik **Generate new token (classic)**.
3. Beri nama "XenonPlay-Deploy", centang bagian `repo` (semua), lalu klik **Generate**.
4. **SALIN TOKEN TERSEBUT**. Anda tidak akan bisa melihatnya lagi.

### Langkah 2: Jalankan Skrip Setup
Buka terminal di Firebase Studio (bawah layar) dan jalankan perintah ini:

```bash
sh setup-git.sh
```

### Langkah 3: Masukkan Kredensial
Saat skrip berjalan, terminal akan meminta:
- **Username**: Masukkan username GitHub Anda (contoh: `antexgamers-png`).
- **Password**: **JANGAN masukkan password akun**, tetapi **PASTE TOKEN** yang Anda salin di Langkah 1 (teks tidak akan muncul saat di-paste, tekan saja Enter).

### Langkah 4: Cek Hasil & Build APK
1. Buka halaman GitHub Anda di browser.
2. Cek apakah file sudah muncul.
3. Klik tab **Actions**.
4. Di sisi kiri, pilih **"Build Android TV APK"**.
5. Klik **Run workflow** untuk mulai membuat file `.apk` secara otomatis di server GitHub.

---
*Catatan: Gunakan metode ini jika Anda mendapat error "File exceeds 100MB".*
