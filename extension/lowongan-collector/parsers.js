// Fungsi murni pengolah teks mentah dari halaman lowongan → kolom tabel
// `lowongan_eksternal`. Dipisah dari kode DOM supaya bisa diuji tanpa browser.

export const EMPLOYMENT_NORM = {
  'Full time': null,
  'Part time': 'Part Time',
  'Kontrak': 'Waktu Tertentu',
  'Magang': 'Magang',
  'Freelance': 'Freelance',
  'Temporer': 'Temporer',
};
export const EMPLOYMENT_OPTIONS = Object.keys(EMPLOYMENT_NORM);

const KODE_PREFIX = { jobstreet: 'JS' };

export function jobIdFromUrl(url) {
  const m = String(url || '').match(/\/job\/(\d+)/);
  return m ? m[1] : null;
}

// URL lowongan yang bersih. Halaman detail penuh: /job/ID di path. Panel di
// samping daftar pencarian: ID diambil dari link di dalam panel (mis. tombol
// lamar), lalu dari parameter ?jobId= sebagai cadangan.
export function resolveJobUrl(tabUrl, hints = []) {
  let origin = 'https://id.jobstreet.com';
  let jobIdParam = null;
  try {
    const u = new URL(tabUrl);
    origin = u.origin;
    jobIdParam = u.searchParams.get('jobId');
  } catch { /* URL tab tidak valid */ }

  if (jobIdFromUrl(tabUrl)) return canonicalUrl(tabUrl);
  let id = null;
  for (const h of hints) { id = jobIdFromUrl(h); if (id) break; }
  if (!id && /^\d+$/.test(jobIdParam || '')) id = jobIdParam;
  return id ? `${origin}/id/job/${id}` : null;
}

export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/+$/, '');
  } catch {
    return String(url || '');
  }
}

export function mapEmployment(text) {
  const t = String(text || '').toLowerCase();
  if (/part\s*time|paruh/.test(t)) return 'Part time';
  if (/full/.test(t)) return 'Full time';
  if (/magang|intern/.test(t)) return 'Magang';
  if (/freelance|lepas/.test(t)) return 'Freelance';
  if (/kontrak|temporer|contract/.test(t)) return 'Kontrak';
  if (/kasual|casual|liburan/.test(t)) return 'Temporer';
  return 'Full time';
}

// Angka gaji hanya diisi kalau jelas bulanan; selain itu disimpan sebagai teks
// supaya tidak salah dibandingkan di filter gaji.
export function parseSalary(text) {
  const t = String(text || '').trim();
  if (!t || /tidak ditampilkan/i.test(t)) return { min: null, max: null, text: null };

  const mult = /juta|\bjt\b/i.test(t) ? 1e6 : 1;
  // Urutan alternatif penting: ribuan ("5.000.000") → desimal ("4,5") → bulat.
  const nums = [...t.matchAll(/\d{1,3}(?:[.,]\d{3})+|\d+[.,]\d{1,2}(?!\d)|\d+/g)]
    .map(m => (/^\d{1,3}([.,]\d{3})+$/.test(m[0])
      ? parseInt(m[0].replace(/[.,]/g, ''), 10)
      : parseFloat(m[0].replace(',', '.'))))
    .map(n => Math.round(n < 1000 ? n * mult : n))
    .filter(n => n > 0);

  const monthly = /bulan|month/i.test(t);
  if (monthly && nums.length >= 1 && nums.length <= 2) {
    return {
      min: Math.min(...nums),
      max: nums.length === 2 ? Math.max(...nums) : null,
      text: null,
    };
  }
  return { min: null, max: null, text: t };
}

function ymd(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// "Diposting 3 hari yang lalu" → tanggal absolut (yyyy-mm-dd).
export function parsePosted(text, now = new Date()) {
  const t = String(text || '');
  const d = new Date(now);
  if (/hari ini|baru saja/i.test(t)) return ymd(d);
  const m = t.match(/(\d+)\s*\+?\s*(menit|jam|hari|minggu|bulan)/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const days = { menit: 0, jam: 0, hari: n, minggu: n * 7, bulan: n * 30 }[m[2].toLowerCase()];
  d.setDate(d.getDate() - days);
  return ymd(d);
}

export function buildRecord(raw, { source, url, now = new Date() }) {
  const id = jobIdFromUrl(url);
  const salary = parseSalary(raw.salaryText);
  return {
    source,
    external_id: id,
    kode: `EXT-${KODE_PREFIX[source] || 'XX'}-${id}`,
    external_url: canonicalUrl(url),
    title: (raw.title || '').trim(),
    company_name: (raw.company || '').trim(),
    location: (raw.location || '').trim(),
    category: (raw.classification || '').trim(),
    employment_type_raw: mapEmployment(raw.workType),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_text: salary.text,
    salary_raw: raw.salaryText || null,
    logo_url: raw.logoUrl || null,
    description: (raw.description || '').trim(),
    posted_at: parsePosted(raw.postedText, now) || ymd(now),
  };
}
