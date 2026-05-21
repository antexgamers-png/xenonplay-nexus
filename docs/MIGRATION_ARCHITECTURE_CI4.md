# 🏗️ Arsitektur Migrasi: XenonPlay Nexus (PHP/MySQL Edition)

Dokumen ini berisi spesifikasi teknis lengkap untuk membangun ulang XenonPlay menggunakan **CodeIgniter 4**, **MySQL**, dan **XPBridge (Node.js Polling)**.

---

## 1. Konsep Sinkronisasi Hardware (ADB Bridge)
Karena MySQL tidak memiliki fitur real-time push native seperti Firestore, sistem integrasi hardware diubah menjadi model **Queue-Based Polling**.

### A. Tabel Database Utama: `stations`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | VARCHAR(10) | Primary Key (misal: 'tv-01') |
| `ip_address` | VARCHAR(20) | IP Lokal TV |
| `hdmi_index` | INT | Port (1-4) untuk perintah `am start` |
| `last_command` | ENUM | 'start', 'stop', 'pause', 'resume', 'ping', NULL |
| `command_status`| ENUM | 'pending', 'processing', 'executed', 'failed' |
| `last_heartbeat`| TIMESTAMP | Waktu terakhir bridge melapor aktif |

### B. Alur Perintah (The Loop)
1.  **Dashboard (PHP)**: Saat tombol "Mulai Sesi" diklik, PHP mengupdate baris stasiun: `last_command = 'start'`, `command_status = 'pending'`.
2.  **XPBridge (Node.js)**: Script yang berjalan di laptop kasir melakukan query ke MySQL setiap **500ms - 1 detik**:
    `SELECT * FROM stations WHERE command_status = 'pending'`
3.  **Eksekusi ADB**: Jika ditemukan perintah 'start', bridge menjalankan:
    *   `adb connect [IP]:5555`
    *   `input keyevent 224` (Wakeup)
    *   `am start -n com.mediatek.wwtv.tvcenter/.../HW[4+HDMI]`
4.  **Feedback**: Setelah sukses, Bridge mengupdate database: `command_status = 'executed'`.

---

## 2. Logika Real-time Timer (Frontend)
Dashboard tidak boleh melakukan refresh halaman untuk menghitung waktu.
*   **PHP/Server Side**: Hanya menyimpan `end_time` (Unix Timestamp).
*   **JavaScript/Client Side**: 
    *   Gunakan `setInterval` setiap 1 detik.
    *   Hitung: `Sisa = end_time - CurrentTime()`.
    *   Lakukan AJAX Polling setiap 5-10 detik ke API PHP untuk sinkronisasi jika ada perubahan `end_time` dari operator lain.

---

## 3. Skema Database Relasional (MySQL)
Selain tabel `stations`, rancang tabel berikut:
*   **`pricing_rules`**: Menyimpan paket (id, name, duration, price, type).
*   **`transactions`**: Header transaksi (id, station_id, total_amount, status, shift_id).
*   **`transaction_items`**: Detail item (id, transaction_id, item_name, price, qty).
*   **`members`**: (id, name, phone, points, stamps).
*   **`shifts`**: Audit kasir (id, user_id, start_balance, total_sales, end_balance, status).

---

## 4. Prompt AI Terintegrasi (Copy-Paste)

> "Bangun sistem manajemen rental PS berbasis CodeIgniter 4 & MySQL dengan fitur utama otomatisasi hardware ADB. 
> 
> **Fitur Wajib:**
> 1. **ADB Bridge Logic**: Implementasikan sistem antrean perintah di tabel MySQL `stations`. Buat modul PHP yang bisa menulis perintah 'start'/'stop' ke DB. Jelaskan bahwa script Node.js eksternal akan memantau tabel ini untuk mengirim perintah shell ADB (input keyevent & am start intent) ke Smart TV MediaTek.
> 2. **Sistem Shift & Audit**: Operator harus buka laci dengan modal awal. Hitung omzet lunas secara otomatis ke kolom `expected_balance` di tabel `shifts`.
> 3. **Membership Loyalty**: Logika stempel otomatis (1 sesi = 1 stempel). Setiap 10 stempel, berikan 1 poin reward dan reset stempel ke 0.
> 4. **Multi-Item Billing**: Satu nota bisa berisi biaya sewa dan banyak item FnB (makanan/minuman).
> 5. **Hybrid Offline**: Sistem harus berjalan di XAMPP tanpa internet, akses via IP lokal (misal 192.168.1.10).
> 6. **UI/UX**: Gunakan AdminLTE atau Tailwind. Dashboard harus menampilkan grid stasiun dengan timer yang berjalan mundur secara real-time via JavaScript."

---
*Dokumen ini dibuat oleh App Prototyper sebagai panduan teknis migrasi.*
