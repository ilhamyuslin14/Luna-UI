# Luna Collector: Panduan Singkat

Alat bantu untuk menyimpan lowongan dari JobStreet ke database Luna, cukup dengan satu klik.
Tidak perlu daftar atau login.

---

## A. Memasang (cukup sekali)

**1. Ekstrak file ZIP**
Klik kanan file `Luna-Collector-PROD.zip` → **Extract All / Ekstrak semua**. (Di Mac: klik dua kali file ZIP-nya.)
Simpan hasilnya di tempat yang tetap, misalnya `Documents`.
> Jangan hapus atau pindahkan foldernya setelah dipasang, karena extension akan berhenti bekerja.

**2. Buka halaman extension Chrome**
Di Chrome, klik kolom alamat di atas, ketik `chrome://extensions`, lalu tekan **Enter**.

**3. Nyalakan Mode pengembang**
Di pojok kanan atas halaman itu ada tombol **Developer mode / Mode pengembang**. Geser sampai menyala (biru).

**4. Pasang folder**
Klik tombol **Load unpacked / Muat yang belum dipaketkan** (muncul di kiri atas).
Pilih folder hasil ekstrak tadi (folder yang berisi file `manifest.json`), lalu klik **Select Folder / Pilih Folder**.

**5. (Disarankan) Tampilkan ikonnya**
Klik ikon puzzle 🧩 di sebelah kolom alamat → klik ikon pin 📌 di samping **Luna Lowongan Collector (PROD)**.

Selesai. Ikon berwarna oranye-hitam dengan huruf **L** akan muncul di pojok kanan atas Chrome.

---

## B. Cara memakai

**1. Pastikan menyala**
Klik ikon extension. Saklar **Collector di JobStreet** harus menyala (oranye).

**2. Buka JobStreet**
Buka `jobstreet.com`, cari lowongan, lalu **klik satu lowongan** sampai detailnya terbuka di sebelah kanan.

**3. Pakai panel Luna di sisi kiri layar**

| Tombol | Fungsinya |
|---|---|
| **Refresh Data** | Membaca lowongan yang sedang terbuka. **Tekan ini setiap kali kamu pindah ke lowongan lain.** |
| **Lihat Detail** | Membuka formulir di kanan untuk memeriksa atau memperbaiki data sebelum disimpan. Klik lagi untuk menutup. |
| **Simpan ke Luna** | Menyimpan lowongan ke database. |

**4. Alur yang paling mudah**
1. Klik satu lowongan di JobStreet.
2. Tekan **Refresh Data**.
3. Lihat bagian **Data dimuat**: pastikan judul dan perusahaannya benar.
4. Tekan **Simpan ke Luna**.
5. Lihat bagian **Aktivitas** di bawah panel: tertulis **Tersimpan di Luna** (berhasil) atau **Gagal menyimpan** (ada masalah).

Di bagian Data dimuat juga ada keterangan **Sudah di Luna** (lowongan itu pernah disimpan, jadi akan diperbarui) atau **Belum tersimpan**.

**Pintasan keyboard** (lebih cepat)

| Tekan | Fungsi |
|---|---|
| `Alt` + `Shift` + `A` | Refresh Data |
| `Alt` + `Shift` + `D` | Lihat Detail |
| `Alt` + `Shift` + `S` | Simpan |

> **Pengguna Mac:** tombol `Alt` di atas adalah tombol **Option (⌥)**. Jadi tekan `Option` + `Shift` + `A` / `D` / `S`.

**Mematikan sementara:** klik ikon extension, lalu matikan saklarnya. Panel akan hilang.

---

## C. Kalau ada masalah

| Masalah | Solusi |
|---|---|
| Panel Luna tidak muncul | Pastikan saklar di ikon extension menyala, lalu tekan **F5** di halaman JobStreet. |
| Chrome menampilkan pesan *"Disable developer mode extensions"* saat dibuka | Normal untuk cara pasang ini. Tutup pesannya (klik X atau **Cancel**), jangan klik Disable. |
| **Gagal menyimpan** | Cek koneksi internet, lalu coba lagi. Kalau terus gagal, kirim ke admin tulisan merah yang muncul di Aktivitas. |
| Data yang terbaca bukan lowongan yang dimaksud | Klik lowongan yang benar, lalu tekan **Refresh Data** lagi. |
| Extension hilang atau tidak jalan setelah memindahkan folder | Pasang ulang dari langkah A.4, dengan folder di lokasi yang baru. |

## D. Memperbarui ke versi baru

1. Hapus folder lama, lalu ekstrak ZIP versi baru ke tempat yang sama.
2. Buka `chrome://extensions`, cari **Luna Lowongan Collector (PROD)**, klik ikon **muat ulang** ⟳.
3. Tekan **F5** di halaman JobStreet.
