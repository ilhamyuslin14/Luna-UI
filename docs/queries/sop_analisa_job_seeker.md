# SOP & Catatan Query: Analisa Job Seeker

Panduan standar operasional (SOP) dan kueri SQL Supabase (`nijybuxerotauevrivge`) untuk memantau pendaftar pencari kerja (*Job Seeker*), menganalisis funnel konversi (CV upload & klik lamaran), serta mendiagnosis alasan/hipotesis drop-off pelamar (CV Ready tapi belum klik lamar).

---

## 📌 1. Tujuan & Metrik Utama

Analisa ini bertujuan untuk:
1. **Memantau Registrasi Job Seeker Harian:** Mengidentifikasi pendaftar baru yang melengkapi CV vs yang drop-off tanpa CV.
2. **Filtering Akun Uji Coba (Test Exclusion):** Mengecualikan akun internal tim/developer dan email sekali pakai (*temp mail/disposable email*) agar data evaluasi murni berbasis pengguna riil.
3. **Mendiagnosis Alasan Pasif (Klik = 0):** Memetakan mengapa user yang sudah melengkapi profil & CV belum mengeksekusi lamaran (*Lamar Sekarang*). 
4. **Menyajikan Angka Pembanding Nyata (Two-Layer Metrics):**
   * **Total Muncul di Layar:** Jumlah kartu rekomendasi yang disajikan sistem/algoritma AI ke layar feed user.
   * **Total Cocok Riil:** Jumlah lowongan yang benar-benar memenuhi kriteria spesifik user (jabatan impian, domisili/lokasi target, dan batas minimal gaji).
   * **Rumusan Hipotesis:** Memberikan analisis objektif apakah masalahnya bersumber dari **Zero Supply**, **Regional Mismatch**, **Gaji Negosiasi**, atau **Discovery/UX**.

---

## 🗄️ 2. Arsitektur Data & Tabel Database

| Tabel | Keterangan Data | Kolom Kunci |
| :--- | :--- | :--- |
| **`public.luna_job_seeker_registrations`** | Data registrasi utama akun job seeker | `id`, `nama_lengkap`, `email`, `cv_uploaded`, `registration_date` |
| **`public.luna_job_seeker_preferences`** | Preferensi jabatan impian yang diinput pelamar | `user_id`, `position_titles`, `locations`, `salary_minimum` |
| **`public.v4_candidate_lowongan_scores`** | Hasil matching AI feed rekomendasi ke layar user | `user_id`, `lowongan_id`, `match_score`, `score_label` |
| **`public.luna_candidates`** | Data lamaran pekerjaan yang diklik/diapply user | `user_id`, `lowongan_id`, `created_at` |
| **`public.lowongan`** | Data seluruh katalog lowongan kerja di portal | `id`, `nama_jabatan`, `lokasi`, `upah_minimum`, `is_published`, `status` |
| **`public.utm_tracking`** | Pelacakan sumber trafik dan kampanye pendaftaran | `user_id`, `user_type`, `utm_source`, `utm_campaign` |

---

## 🔍 3. Kueri SQL Standar

### A. Query Monitoring Daftar Job Seeker (Real Users Only)
Mengambil daftar pendaftar job seeker dengan mengecualikan akun testing dan menghitung jumlah lamaran (`klik`):

```sql
SELECT 
    r.id AS full_user_id,
    SUBSTRING(r.id::text, 1, 8) AS user_id,
    r.registration_date,
    r.nama_lengkap,
    r.email,
    CASE WHEN r.cv_uploaded = true THEN 'Yes' ELSE 'No' END AS cv_status,
    COALESCE(c.applied_count, 0) AS total_klik_lamar,
    p.position_titles AS posisi_dicari,
    p.locations AS lokasi_impian,
    p.salary_minimum AS min_gaji,
    t.utm_source,
    t.utm_campaign
FROM public.luna_job_seeker_registrations r
LEFT JOIN public.luna_job_seeker_preferences p ON p.user_id = r.id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS applied_count 
    FROM public.luna_candidates 
    WHERE lowongan_id IS NOT NULL 
    GROUP BY user_id
) c ON c.user_id = r.id::text
LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, utm_source, utm_campaign
    FROM public.utm_tracking
    WHERE user_type = 'job_seeker'
    ORDER BY user_id, created_at DESC
) t ON t.user_id = r.id::text
WHERE 
  -- Filter Pengecualian Akun Testing & Disposable Email:
  r.email NOT LIKE '%@arkademi.com%'
  AND r.email NOT LIKE '%@drtall.com%'
  AND r.email NOT LIKE '%@emailkeep.com%'
  AND r.email NOT LIKE '%@caps7.com%'
  AND r.email NOT LIKE '%@murkstar.com%'
  AND r.email NOT LIKE '%@soppat.com%'
  AND r.email NOT LIKE '%@iconcubic.com%'
  AND r.email NOT LIKE '%@dropoffs.org%'
  AND r.nama_lengkap NOT ILIKE '%admin%'
  AND r.nama_lengkap NOT ILIKE '%test%'
ORDER BY r.created_at DESC;
```

---

### B. Query Rekomendasi yang Muncul di Layar User
Menghitung jumlah kartu lowongan yang disajikan pada layar rekomendasi user berdasarkan AI matching:

```sql
SELECT 
    COUNT(*) AS total_muncul_di_layar,
    COUNT(*) FILTER (WHERE match_score >= 70) AS skor_tinggi,
    COUNT(*) FILTER (WHERE match_score BETWEEN 40 AND 69) AS skor_sedang,
    COUNT(*) FILTER (WHERE match_score < 40) AS skor_rendah
FROM public.v4_candidate_lowongan_scores
WHERE user_id = :user_uuid;
```

---

### C. Query Validasi Match Riil (Supply Posisi, Lokasi & Gaji)
Menghitung jumlah lowongan aktif di database yang memenuhi kata kunci posisi dan lokasi target:

```sql
SELECT 
    COUNT(*) AS total_cocok_riil,
    COUNT(*) FILTER (WHERE upah_minimum >= :salary_min) AS gaji_memenuhi,
    COUNT(*) FILTER (WHERE upah_minimum IS NULL) AS gaji_negosiasi
FROM public.lowongan
WHERE is_published = true 
  AND is_archived = false 
  AND status = 'aktif'
  AND (
    -- Ganti dengan array lokasi target user
    lokasi ILIKE ANY (ARRAY['%Bandung%'])
  )
  AND (
    -- Ganti dengan kata kunci jabatan yang dicari user
    nama_jabatan ILIKE ANY (ARRAY['%Admin Gudang%', '%Staf Gudang%', '%Admin Operasional%'])
  );
```

---

## 🧭 4. Alur Kerja (SOP) Analisa Job Seeker

1. **Ekstraksi Data Pendaftar Harian:**
   * Jalankan kueri filtering job seeker untuk mengambil pendaftar terbaru yang berstatus `cv_uploaded = true` dan `total_klik_lamar = 0`.
2. **Identifikasi Preferensi Jabatan:**
   * Periksa `position_titles`, `locations`, dan `salary_minimum` pada profil pendaftar.
3. **Pengecekan Dua Lapisan Metrik (Two-Layer Cross Check):**
   * **Lapisan 1 (Layar User):** Tarik total kartu lowongan yang disodorkan algoritma ke layar pelamar via tabel `v4_candidate_lowongan_scores`.
   * **Lapisan 2 (Kesesuaian Nyata):** Jalankan kueri supply riil untuk mengetahui berapa dari lowongan tersebut yang lokasinya benar-benar sesuai target user dan gajinya transparan/memenuhi syarat.
4. **Klasifikasi Hipotesis:**
   * **Tipe A — Zero Supply Gap:** Lowongan di kota/spesialisasi target = 0 (layar kosong).
   * **Tipe B — Regional Mismatch:** Layar menampilkan loker, namun $\ge 80\%$ loker berada di luar kota domisili user.
   * **Tipe C — Unclear/Low Salary:** Lowongan cocok secara posisi & kota, tetapi mencantumkan gaji di bawah ekspektasi atau berstatus *Gaji Negosiasi / Tidak Ditampilkan*.
   * **Tipe D — Discovery / Paradox of Choice:** Lowongan cocok sangat melimpah ($\ge 20$ loker cocok), user belum melamar karena kebingungan menyortir atau butuh push notifikasi kurasi.
5. **Penyajian Laporan Audit:**
   * Sajikan tabel hasil audit berkala dengan kolom lengkap (User ID, Nama, Email, Posisi, Lokasi, Min Gaji, Total Muncul di Layar, Cocok Riil, Hipotesis Spesifik).

---

## 📊 5. Format Standar Laporan Audit

| User ID | Nama Jobseeker | Email | Posisi Dicari | Lokasi Impian | Min. Gaji | Total Muncul di Layar | Cocok Riil (Lokasi & Gaji) | Hipotesis Spesifik & Detail Gap |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `[id]` | [Nama Lengkap] | `[email]` | [Daftar Posisi] | [Lokasi] | [Nominal] | **X loker** | **Y loker** | [Klasifikasi Tipe Gap & Alasan Detail] |
