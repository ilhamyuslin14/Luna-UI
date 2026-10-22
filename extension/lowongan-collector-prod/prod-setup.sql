-- Tabel tujuan extension "Luna Lowongan Collector (PROD)".
-- Jalankan di database production (SQL editor). Strukturnya sama dengan tabel dev
-- lowongan_eksternal (di prod namanya lowongan_eksternal_masuk). Kalau nama tabel diganti, ubah juga TABLE_NAME di config.js.
--
-- CATATAN KEAMANAN (sudah diketahui dan diterima): extension menulis langsung memakai anon key
-- tanpa login, jadi tabel ini harus bisa ditulis publik. Tim prod yang memutuskan pengamannya
-- (RLS, edge function, dsb). Selama RLS mati, siapa pun yang memegang anon key bisa
-- membaca, mengubah, dan menghapus isi tabel ini.

create table if not exists public.lowongan_eksternal_masuk (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,                      -- mis. EXT-JS-95426273
  source text not null check (source in ('jobstreet', 'glints', 'kalibrr')),
  external_id text,
  title text not null,
  company_name text not null,
  location text,
  category text,
  employment_type_raw text,
  employment_type text,
  salary_min bigint,
  salary_max bigint,
  salary_text text,
  description text,
  external_url text not null,
  posted_at timestamptz,
  expires_at timestamptz,
  status text not null default 'aktif' check (status in ('aktif', 'ditutup', 'kedaluwarsa')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  logo_url text,
  view_count integer not null default 0,
  unique (source, external_id)                    -- dasar upsert dari extension (on_conflict=source,external_id)
);

create index if not exists lowongan_eksternal_masuk_status_posted_idx
  on public.lowongan_eksternal_masuk (status, posted_at desc);

-- Tanpa RLS (sesuai kondisi prod): dibaca dan ditulis lewat anon key.
alter table public.lowongan_eksternal_masuk disable row level security;
grant select, insert, update on public.lowongan_eksternal_masuk to anon, authenticated;

-- Supaya PostgREST langsung mengenali tabel baru.
notify pgrst, 'reload schema';
