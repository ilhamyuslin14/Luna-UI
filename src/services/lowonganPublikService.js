import { supabase } from '../config/supabase.js';
import { getAllActiveJobs } from './seleksiService.js';
import { formatUpah } from '../hooks/lowongan/useLamanKarirData.js';
import { SUMBER_EKSTERNAL } from '../data/lowonganEksternalConfig.js';
import { formatSiklusLabel, GAJI_TIDAK_DITAMPILKAN } from '../utils/siklusUpah.js';

// Satu-satunya pintu data untuk laman publik (Semua Lowongan). Mengembalikan
// bentuk "kartu" yang sudah dinormalisasi, sama untuk lowongan Luna dan
// eksternal. Nanti isi getAllJobs/getExternalJobByKode/laporkanLowongan
// diganti query ke view gabungan + tabel Supabase; pemanggilnya tidak berubah.
//
// Bentuk kartu: key, id, kode, source, source_label, is_external, title,
// company_name, company_slug, logo_url, location, category, employment_type
// (nilai baku untuk filter), employment_label (teks tampil), experience_years,
// experience_label, salary_min, salary_max, salary_cycle, salary_label,
// posted_at, external_url.

function parseRupiah(val) {
  if (!val) return null;
  const digits = String(val).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : null;
}

function formatAngka(n) {
  return Number(n).toLocaleString('id-ID');
}

function toLunaJob(row) {
  const years = parseInt(row.pengalaman, 10);
  const experienceYears = Number.isFinite(years) && years > 0 ? years : 0;
  const upah = formatUpah(row);
  // Field lama (jabatan, companies, lokasi, ...) sengaja ikut dibawa lewat
  // spread supaya halaman lama yang belum pindah ke bentuk kartu tetap jalan.
  return {
    ...row,
    key: `luna:${row.id}`,
    source: 'luna',
    source_label: 'Luna',
    is_external: false,
    title: row.jabatan,
    company_name: row.companies?.name || 'Perusahaan',
    company_slug: row.companies?.slug || null,
    logo_url: row.companies?.logo_url || null,
    location: row.lokasi || null,
    category: row.departments?.name || null,
    employment_type: row.ikatan_kerja || null,
    employment_label: row.ikatan_kerja || null,
    experience_years: experienceYears,
    experience_label: experienceYears > 0 ? `${experienceYears}+ tahun` : 'Fresh graduate',
    salary_min: parseRupiah(row.upah_min),
    salary_max: parseRupiah(row.upah_maks),
    salary_cycle: (row.siklus_upah || '').toLowerCase() || null,
    salary_label: upah ? `Rp ${upah}` : GAJI_TIDAK_DITAMPILKAN,
    salary_text_only: !upah,
    posted_at: row.created_at,
    external_url: null,
  };
}

function externalSalaryLabel(job) {
  const { salary_min: min, salary_max: max } = job;
  if (min != null || max != null) {
    const a = min != null ? formatAngka(min) : formatAngka(max);
    const b = max != null ? formatAngka(max) : formatAngka(min);
    return `Rp ${a} – ${b} / ${formatSiklusLabel('bulanan')}`;
  }
  // "Gaji tidak ditampilkan" yang terlanjur tersimpan sebagai teks = tidak ada gaji.
  if (/tidak ditampilkan/i.test(job.salary_text || '')) return null;
  return job.salary_text || null;
}

function toExternalJob(row) {
  const hasRange = row.salary_min != null || row.salary_max != null;
  const salaryLabel = externalSalaryLabel(row);
  return {
    key: `${row.source}:${row.id}`,
    id: row.id,
    kode: row.kode,
    source: row.source,
    source_label: SUMBER_EKSTERNAL[row.source]?.label || row.source,
    is_external: true,
    title: row.title,
    company_name: row.company_name,
    company_slug: null,
    logo_url: row.logo_url || null,
    location: row.location,
    category: row.category,
    employment_type: row.employment_type,
    employment_label: row.employment_type_raw,
    experience_years: null,
    experience_label: null,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    salary_cycle: hasRange ? 'bulanan' : null,
    salary_label: salaryLabel || GAJI_TIDAK_DITAMPILKAN,
    // true = tidak ada nominal (teks bebas seperti "Negosiasi" atau default
    // "Gaji tidak ditampilkan"); ditampilkan redup, bukan sebagai gaji.
    salary_text_only: !hasRange,
    posted_at: row.posted_at,
    external_url: row.external_url,
    description: row.description,
    view_count: row.view_count ?? 0,
    company_industry: row.company_industry || null,
    company_size: row.company_size || null,
  };
}

function byTerbaru(a, b) {
  return new Date(b.posted_at || 0) - new Date(a.posted_at || 0);
}

async function fetchExternalRows() {
  const { data, error } = await supabase
    .from('lowongan_eksternal')
    .select('*')
    .eq('status', 'aktif')
    .order('posted_at', { ascending: false });
  if (error) {
    console.error('Error fetching external jobs:', error);
    return [];
  }
  return data || [];
}

export async function getAllJobs({ includeExternal = true } = {}) {
  const [lunaRows, externalRows] = await Promise.all([
    getAllActiveJobs(),
    includeExternal ? fetchExternalRows() : Promise.resolve([]),
  ]);
  const luna = (lunaRows || []).map(toLunaJob);
  if (!includeExternal) return luna;
  return [...luna, ...externalRows.map(toExternalJob)].sort(byTerbaru);
}

export async function getExternalJobByKode(kode) {
  if (!kode) return null;
  const { data, error } = await supabase
    .from('lowongan_eksternal')
    .select('*')
    .eq('kode', kode)
    .eq('status', 'aktif')
    .maybeSingle();
  if (error) {
    console.error('Error fetching external job:', error);
    return null;
  }
  return data ? toExternalJob(data) : null;
}

// Menghitung tayangan halaman detail lowongan eksternal, dengan aturan yang
// sama seperti lowongan Luna (recordJobView): maksimal sekali per 24 jam per
// perangkat. Mengembalikan jumlah terbaru (atau jumlah sekarang kalau tidak
// dihitung / gagal).
export async function recordExternalView(kode, currentCount = 0) {
  if (!kode) return currentCount || 0;

  const lockKey = `luna_pv_${kode}`;
  try {
    const last = localStorage.getItem(lockKey);
    if (last && Date.now() - parseInt(last, 10) < 24 * 60 * 60 * 1000) return currentCount || 0;
    localStorage.setItem(lockKey, Date.now().toString());
  } catch { /* penyimpanan diblokir: tetap lanjut hitung */ }

  const { data, error } = await supabase.rpc('increment_external_view', { p_kode: kode });
  if (error) {
    console.error('Gagal mencatat tayangan:', error.message);
    return currentCount || 0;
  }
  return typeof data === 'number' ? data : (currentCount || 0);
}

// Dummy: belum ada tabel `lowongan_laporan`, jadi laporan hanya dicatat di
// konsol. Tetap async supaya kontrak pemanggil sama dengan versi DB nanti.
export async function laporkanLowongan({ kode, alasan, catatan }) {
  console.info('[laporkanLowongan] (dummy)', { kode, alasan, catatan });
  return { ok: true };
}
