# Luna Lowongan Collector (PROD)

Varian extension untuk database **production**. Cara kerja dan tampilannya sama dengan
`../lowongan-collector`, bedanya:

- **Tanpa login.** Menulis langsung ke tabel lewat anon key (lihat `api.js`).
- **Tujuan data diatur di `config.js`**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TABLE_NAME`.
- **Penanda PROD** berwarna merah di panel, popup, dan judul aktivitas, supaya tidak tertukar dengan versi dev.
- **Posisi dan hotkey sama dengan versi dev** (panel di kiri atas; `Alt+Shift+D` Lihat Detail, `Alt+Shift+A` Refresh Data,
  `Alt+Shift+S` Simpan). Karena itu jangan menyalakan dua-duanya bersamaan di JobStreet: matikan salah satu lewat saklar di popup.

## Memasang
1. Jalankan `prod-setup.sql` di database production (membuat tabel `lowongan_eksternal_masuk`).
2. `config.js` sudah berisi URL project dan kunci publishable production; ubah hanya kalau tujuan berganti.
3. `chrome://extensions` → Mode pengembang → **Muat yang belum dipaketkan** → pilih folder ini.
4. Klik ikon extension, pastikan saklar aktif, lalu buka JobStreet.

Kolom yang ditulis ke tabel: `source, external_id, kode, external_url, title, company_name, logo_url,
location, category, employment_type_raw, employment_type, salary_min, salary_max, salary_text,
description, posted_at, status, last_verified_at, updated_at`. Upsert memakai
`on_conflict=source,external_id`, jadi tabel perlu unique constraint pada pasangan itu.

Kode pengolah halaman (`parsers.js`, `extractors.js`) disalin dari versi dev. Kalau ada perbaikan di
sana, salin juga ke sini.
