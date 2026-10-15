# Catatan Query Database

Kumpulan query SQL yang digunakan untuk analisis data dan integrasi dashboard pada database Supabase (`nijybuxerotauevrivge`).

---

## 📢 1. Query Published Lowongan
Query ini digunakan untuk mengambil seluruh lowongan pekerjaan yang berstatus **Published** (aktif tayang di portal karir) beserta detail lengkapnya.

* **Kondisi Filter:** `is_archived = false` AND `is_published = true`

```sql
SELECT 
  l.id AS lowongan_id,
  l.nama_jabatan AS judul_lowongan,
  COALESCE(o.company_name, u.nama_perusahaan) AS nama_perusahaan,
  o.company_logo_url AS logo_url,
  u.nama AS nama_pembuat,
  u.email AS email_pembuat,
  l.departemen,
  COALESCE(l.level_jabatan, '—') AS level_jabatan,
  l.lokasi,
  l.ikatan_kerja,
  
  -- Gaji
  CASE 
    WHEN l.upah_minimum IS NOT NULL AND l.upah_maksimum IS NOT NULL 
      THEN CONCAT('Rp ', to_char(l.upah_minimum, 'FM999,999,999'), ' – ', to_char(l.upah_maksimum, 'FM999,999,999'), ' / ', COALESCE(l.siklus_upah, 'Bulanan'))
    WHEN l.upah_minimum IS NOT NULL 
      THEN CONCAT('Rp ', to_char(l.upah_minimum, 'FM999,999,999'), ' / ', COALESCE(l.siklus_upah, 'Bulanan'))
    ELSE 'Negosiasi'
  END AS upah_gaji,
  
  COALESCE(l.minimal_pendidikan, '—') AS minimal_pendidikan,
  
  -- Pengalaman
  CASE 
    WHEN l.minimal_pengalaman_kerja = 0 THEN 'Fresh graduate'
    ELSE CONCAT(l.minimal_pengalaman_kerja, ' Tahun')
  END AS minimal_pengalaman,
  
  l.jumlah_rekrut AS jumlah_posisi,
  l.created_at AS tanggal_dibuat_system,
  l.deskripsi_pekerjaan,
  LOWER(l.status) AS job_status,
  
  -- Menggunakan kolom is_published asli dari database
  CASE 
    WHEN l.is_published = true THEN 'Published'
    ELSE 'Unpublished'
  END AS published_state,
  
  -- Short Link (Subquery)
  (
    SELECT CONCAT('lunasys.id/', code) 
    FROM public.short_links 
    WHERE lowongan_id = l.id 
    LIMIT 1
  ) AS short_link

FROM public.lowongan l
JOIN public.live_users u ON l.user_id = u.id
LEFT JOIN public.organizations o ON u.organization_id = o.id
WHERE l.is_archived = false 
  -- FILTER UTAMA: Hanya lowongan yang terpublikasi (Published)
  AND l.is_published = true
ORDER BY l.created_at DESC;
```

---

## 📋 2. Kriteria Pembersihan Lowongan Suspect / Dummy
Berikut adalah daftar kriteria dasar hasil diskusi untuk menyaring dan mengidentifikasi lowongan yang terindikasi dummy, testing, draf belum selesai, atau berisi data asal-asalan:

### A. Kriteria Berdasarkan Akun Pembuat (Account-Based)
1. **Deteksi Akun Pengujian (Test/Demo User):**
   * Menandai lowongan jika nama pembuat, email, atau nama perusahaannya mengandung kata kunci pengujian seperti: `test`, `tester`, `demo`, atau `contoh`.
2. **Domain Email Palsu (Disposable Email):**
   * Menandai akun yang mendaftar menggunakan penyedia email sekali pakai (*temp mail / disposable email*) seperti `@murkstar.com`, `@mailinator.com`, dll.
3. **Ketidakcocokan Domain Bisnis dengan Perusahaan:**
   * Jika akun menggunakan email bisnis (bukan email publik gratisan seperti Gmail/Yahoo), namun nama domain emailnya tidak cocok atau berbeda jauh dengan nama perusahaannya (contoh: Perusahaan "PT Indah Jaya" tetapi domain emailnya `@tokomakananacak.com`).

### B. Kriteria Berdasarkan Kualitas Konten (Content-Based)
4. **Deskripsi Terlalu Singkat (Minimal Karakter):**
   * Membatasi deskripsi pekerjaan agar tidak terlalu pendek (misal, minimal 50-100 karakter) untuk menghindari pengisian asal-asalan (seperti hanya menulis *"membuat website"*).
5. **Penggunaan Kata Penanda Draf (Placeholder Text):**
   * Menyaring lowongan yang deskripsinya masih mengandung teks draf sementara seperti `TBU` (To Be Updated), `Lorem Ipsum`, atau teks acak (*keyboard smash* seperti `asdfghjkl`, `qwerty`).
6. **Judul Lowongan Tidak Valid:**
   * Judul lowongan tidak boleh berupa istilah umum yang menggambarkan status ikatan kerja (seperti *"Fulltime"*, *"Part-time"*, *"Internship"*) melainkan harus nama posisi/jabatan yang spesifik.
7. **Rentang Gaji Tidak Logis:**
   * Menandai lowongan jika terjadi kesalahan pengisian di mana nominal gaji minimum yang diinput lebih besar dari gaji maksimum.

### C. Kriteria Berdasarkan Logika Sistem & Duplikasi (System-Based)
8. **Kuota Rekrutmen Tidak Realistis:**
   * Menandai lowongan jika jumlah kuota orang yang ingin direkrut diisi angka yang tidak masuk akal (misal: di atas 150 atau 1.000 orang untuk posisi staf biasa di perusahaan kecil).
9. **Duplikasi Ganda Berdekatan (Double-Submit):**
   * Jika terdapat lowongan dari perusahaan yang sama, dengan judul yang sama persis, dan dibuat dalam selisih waktu yang sangat berdekatan (misal kurang dari 5 menit), maka lowongan yang terdeteksi paling akhir akan dianggap sebagai duplikat suspect.
10. **Inkonsistensi Status Terbit (Status Integrity Check):**
    * Menandai lowongan jika `is_published = true` namun status operasional internalnya bukan `'aktif'` (misal: masih `'rencana'`, `'ditahan'`, atau `'dibatalkan'`). Ketidakcocokan status ini menyebabkan link publik lowongan mengalami error `404: Lowongan tidak ditemukan`.

---

## 🧭 3. Panduan Alur Kerja (SOP) Pembersihan & Audit Publikasi Lowongan
Rangkaian langkah kerja terstruktur untuk asisten AI dalam memproses audit dan pembersihan data lowongan:

1. **Pengambilan Data Awal (Data Extraction):**
   * **Jalur A (Lowongan Terbit / Published):** Asisten AI mengeksekusi query database untuk menarik seluruh lowongan aktif yang terpublikasi (`is_published = true`).
   * **Jalur B (Kandidat Terbit / Unpublished Active):** Asisten AI memindai lowongan draf/unpublished (`is_published = false`) yang berstatus internal `status = 'aktif'` dan bukan lowongan template (`Contoh - %`).

2. **Penyaringan Berdasarkan Kriteria (Filtering & Screening Dua Arah):**
   * **Screening Suspect (Jalur A):** Menerapkan 10 kriteria suspect (`query.md` bagian 2) ke dalam data lowongan terbit untuk mendeteksi lowongan bermasalah yang perlu di-unpublish.
   * **Screening Layak Publish (Jalur B):** Memeriksa kualitas data lowongan draf aktif (deskripsi lengkap, email valid, kuota realistis, gaji logis) untuk mendeteksi lowongan resmi yang **seharusnya terbit/published**.

3. **Penyajikan Laporan Audit (Reporting):**
   * Menyajikan laporan 2 kategori kepada pengguna:
     * **Tabel Lowongan Suspect (Kandidat Unpublish):** Beserta alasan detail penandaan suspect.
     * **Tabel Lowongan Valid (Kandidat Publish):** Lowongan draf aktif yang valid dan direkomendasikan untuk diterbitkan.

4. **Tinjauan & Konfirmasi Pengguna (User Review):**
   * AI berhenti sejenak dan menunggu instruksi/keputusan pengguna mengenai lowongan mana yang disetujui untuk di-unpublish atau di-publish.

5. **Eksekusi Tindakan Status (Execution via MCP):**
   * **WAJIB dilakukan langsung oleh asisten AI menggunakan Supabase MCP tool** (bukan memberikan kueri update manual kepada pengguna). AI memperbarui status kolom `is_published` (`true` atau `false`) sesuai instruksi dan persetujuan pengguna.

---

## 📝 4. Log Riwayat Unpublish Lowongan (Internal)
Catatan internal lowongan yang telah dinonaktifkan (`is_published` diubah ke `false`) oleh asisten AI berdasarkan instruksi dan persetujuan pengguna:

| Tanggal Aksi | ID & Judul Lowongan | Nama & Email Pembuat | Nama Perusahaan | Short Link | Alasan Penonaktifan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-08-27** | **`JD000195`**<br>Crew | Christian Kurniawan<br>`christian.kurniawan@seven-retail.com` | PT Sumber Natural Indonesia | `lunasys.id/GVUj6zRZ` | **Kriteria B.5 (Draf Placeholder):** Deskripsi pekerjaan hanya diisi teks penanda sementara berupa `TBU`. |
| **2026-08-27** | **`JD000256`**<br>Software Engineer | Maulana Akbar Esa Putra<br>`it@adhitamamitranusantara.com` | PT Adhitama Mitra Nusantara | `lunasys.id/vaebj8Ga` | **Kriteria B.4 & C.8:** Deskripsi kerja asal-asalan hanya *"membuat webisite"* dengan target rekrutmen kuota 100 orang. |
| **2026-08-27** | **`JD000250`**<br>Internal Audit Sr. | CV. Onic<br>`tahekog730@murkstar.com` | CV. Onic | `lunasys.id/24Sve79A` | **Kriteria A.1 & A.2:** Akun testing menggunakan domain email disposable/sekali pakai (`@murkstar.com`). |
| **2026-08-27** | **`JD000246`**<br>Fulltime | Azhar Kania<br>`azharkania@gmail.com` | Toffee Dev | `lunasys.id/qDt4r4cJ` | **Kriteria B.6:** Judul posisi diisi status kontrak kerja (`Fulltime`) alih-alih nama jabatan spesifik. |
| **2026-09-09** | **`JD000273`**<br>HR Generalist | Salsabila Imansari<br>`salsa.arkademi@gmail.com` | PT Arkademi Daya Indonesia | `lunasys.id/W6Jt6gtn` | **Kriteria C.10 (Inkonsistensi Status Terbit):** Status lowongan masih `'rencana'` namun kolom `is_published = true`, menyebabkan link publik rusak (Error 404). Dinonaktifkan atas instruksi user. |
| **2026-09-24** | **`JD000478`**<br>Senior Frontend Engineer (1) | [TESTUSER] FE<br>`wohadi4139@murkstar.com` | PT Slythrn | `lunasys.id/BzAevbtw` | **Kriteria A.1 & A.2 (Akun Testing):** Dibuat oleh akun tester internal menggunakan email disposable (`@murkstar.com`). Dinonaktifkan atas instruksi user. |
| **2026-09-24** | **`JD000479`**<br>HR & Talent Acquisition Specialist | [TESTUSER] FE<br>`wohadi4139@murkstar.com` | PT Slythrn | `lunasys.id/yyr54iJ6` | **Kriteria A.1 & A.2 (Akun Testing):** Dibuat oleh akun tester internal menggunakan email disposable (`@murkstar.com`). Dinonaktifkan atas instruksi user. |
| **2026-09-24** | **`JD000480`**<br>Senior Frontend Engineer (mbl) | [TESTUSER] FE<br>`wohadi4139@murkstar.com` | PT Slythrn | `lunasys.id/EUezucX8` | **Kriteria A.1 & A.2 (Akun Testing):** Dibuat oleh akun tester internal menggunakan email disposable (`@murkstar.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-07** | **`JD000502`**<br>Content Creator Toko Pakaian | ADMIN<br>`wisom99433@caps7.com` | PT. TEST GETTING STARTED | `lunasys.id/yAvHyZtR` | **Kriteria A.1 & A.2 (Testing Onboarding):** Akun testing fitur Getting Started menggunakan email disposable (`@caps7.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-07** | **`JD000503`**<br>Content Writer | TESTER GETTING STARTED<br>`ciwomok941@caps7.com` | PT. TEST | `lunasys.id/sEXV73tf` | **Kriteria A.1 & A.2 (Testing Onboarding):** Akun testing fitur Getting Started menggunakan email disposable (`@caps7.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-07** | **`JD000504`**<br>Senior Backend Engineer | TEST GS<br>`pecis16484@caps7.com` | CV. TEST | `lunasys.id/6AP2ZrBF` | **Kriteria A.1 & A.2 (Testing Onboarding):** Akun testing fitur Getting Started menggunakan email disposable (`@caps7.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-07** | **`JD000505`**<br>Content Writer | TESTER GETTING STARTED<br>`ciwomok941@caps7.com` | PT. TEST | `lunasys.id/KEtwSe46` | **Kriteria A.1 & A.2 (Testing Onboarding):** Akun testing fitur Getting Started menggunakan email disposable (`@caps7.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-07** | **`JD000506`**<br>Senior Backend Engineer | TEST GS 1<br>`kiyen65000@caps7.com` | PT. TEST1 | `lunasys.id/ME443tCa` | **Kriteria A.1 & A.2 (Testing Onboarding):** Akun testing fitur Getting Started menggunakan email disposable (`@caps7.com`). Dinonaktifkan atas instruksi user. |
| **2026-10-15** | **`JD000530`**<br>Senior Frontend Engineer | latexi9396@iconcubic.com<br>`latexi9396@iconcubic.com` | latexi9396@iconcubic.com | — | **Kriteria A.1 & A.2 (Akun Testing User):** Akun pengujian internal user menggunakan email disposable (`@iconcubic.com`). Dinonaktifkan atas instruksi user. |

---

## 📝 5. Log Riwayat Publish Lowongan (Internal)
Catatan internal lowongan yang telah diaktifkan publikasinya (`is_published` diubah ke `true`) oleh asisten AI berdasarkan instruksi pengguna:

| Tanggal Aksi | ID & Judul Lowongan | Nama & Email Pembuat | Nama Perusahaan | Short Link | Alasan Pengaktifan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-08-28** | **`JD000405`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Malang, Jawa Timur. |
| **2026-08-28** | **`JD000404`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Cimahi, Jawa Barat. |
| **2026-08-28** | **`JD000403`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Bandung, Jawa Barat. |
| **2026-08-28** | **`JD000402`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Bandar Lampung, Lampung. |
| **2026-08-28** | **`JD000401`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Padang, Sumatera Barat. |
| **2026-08-28** | **`JD000400`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Pontianak, Kalimantan Barat. |
| **2026-08-28** | **`JD000399`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Balikpapan, Kalimantan Timur. |
| **2026-08-28** | **`JD000398`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Samarinda, Kalimantan Timur. |
| **2026-08-28** | **`JD000397`**<br>Sales Executive - Merchant Acquisition | Sanu Noprian<br>`sanusigency@gmail.com` | PT Sigency Karya Indonesia | — | **Instruksi Pengguna:** Pengaktifan penempatan regional Kota Makassar, Sulawesi Selatan. |
| **2026-09-07** | **`JD000458`**<br>Sales Agent Akulaku Malang | Agung Triwibowo<br>`akulaku.malang1@gmail.com` | PT AKULAKU FINANCE INDONESIA | — | **Audit SOP & Instruksi Pengguna:** Lowongan draf aktif valid yang telah terverifikasi resmi dan diaktifkan publikasinya. |
