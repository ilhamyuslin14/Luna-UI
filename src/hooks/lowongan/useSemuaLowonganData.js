import { useState, useEffect, useMemo } from 'react';
import { getAllJobs } from '../../services/lowonganPublikService.js';
import { relevansiPosisi, cocokLokasi } from '../../utils/personalisasiLowongan.js';

// Hook ringan khusus laman publik "Semua Lowongan" (?view=semua-lowongan) —
// beda dari useLamanKarirData yang dibangun untuk 1 lowongan spesifik +
// alur upload CV/lamar. Di sini cuma perlu daftar semua lowongan aktif
// beserta search/sort/filter/pagination-nya, dipakai bareng oleh versi desktop
// (SemuaLowongan.jsx) dan mobile (SemuaLowonganMobile.jsx).
export const SEMUA_LOWONGAN_SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'gaji', label: 'Gaji tertinggi' },
  { value: 'az', label: 'Nama A-Z' },
  { value: 'za', label: 'Nama Z-A' },
];

// Urutan "Kecocokan tertinggi" hanya ditawarkan ke pelamar yang login (hanya mereka yang punya skor).
const MAKS_SLOT_LUNA = 5; // lowongan Luna yang sejalan dengan preferensi didahulukan di posisi teratas
const KOSONG = [];

const OPSI_KECOCOKAN = { value: 'kecocokan', label: 'Kecocokan tertinggi' };

export const PENGALAMAN_BUCKETS = [
  { value: 'fresh', label: 'Fresh graduate' },
  { value: '1-3', label: '1–3 tahun' },
  { value: '3-5', label: '3–5 tahun' },
  { value: '5+', label: '5 tahun ke atas' },
];

export const GAJI_BUCKETS = [
  { value: 'under3', label: 'Di bawah Rp 3 jt' },
  { value: '3-5', label: 'Rp 3 – 5 jt' },
  { value: '5-10', label: 'Rp 5 – 10 jt' },
  { value: 'over10', label: 'Di atas Rp 10 jt' },
];

const GAJI_RANGES = {
  under3: [0, 3_000_000],
  '3-5': [3_000_000, 5_000_000],
  '5-10': [5_000_000, 10_000_000],
  over10: [10_000_000, Infinity],
};

// experience_years null = sumber tidak menyediakan pengalaman (lowongan
// eksternal) → tidak masuk bucket manapun, supaya tidak salah dianggap fresh.
function pengalamanBucketOf(job) {
  const n = job.experience_years;
  if (n == null) return null;
  if (n <= 0) return 'fresh';
  if (n < 3) return '1-3';
  if (n < 5) return '3-5';
  return '5+';
}

// Bucket gaji cuma bisa dibandingkan kalau siklusnya bulanan — membandingkan
// upah "per jam"/"per hari" ke bucket "Rp 3-5 jt" tidak masuk akal, jadi
// lowongan dengan siklus lain sengaja tidak match filter gaji manapun
// (bukan bug, ini memang bukan sesuatu yang bisa dinormalisasi dengan aman).
function jobGajiRange(job) {
  if (job.salary_cycle !== 'bulanan') return null;
  const min = job.salary_min;
  const max = job.salary_max;
  if (min == null && max == null) return null;
  return [min ?? max, max ?? min];
}

function matchesGajiBucket(job, bucketValue) {
  const range = jobGajiRange(job);
  if (!range) return false;
  const [bMin, bMax] = GAJI_RANGES[bucketValue];
  return range[0] <= bMax && range[1] >= bMin;
}

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export default function useSemuaLowonganData(pageSize = 9, { includeExternal = false, skorMap = {}, urutKecocokan = false, posisiPref = KOSONG, lokasiPref = KOSONG } = {}) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  // Pilihan eksplisit pengguna; kalau belum memilih, pelamar yang login otomatis melihat yang paling cocok di atas.
  const [sortPilihan, setSort] = useState(null);
  const sort = sortPilihan ?? (urutKecocokan ? 'kecocokan' : 'terbaru');
  const sortOptions = urutKecocokan ? [OPSI_KECOCOKAN, ...SEMUA_LOWONGAN_SORT_OPTIONS] : SEMUA_LOWONGAN_SORT_OPTIONS;
  const [page, setPage] = useState(1);

  const [tipeKerja, setTipeKerja] = useState([]);
  const [pengalamanBucket, setPengalamanBucket] = useState([]);
  const [gajiBucket, setGajiBucket] = useState([]);
  const [sumber, setSumber] = useState([]); // nilai job.source: 'luna', 'jobstreet', ...
  const [kota, setKota] = useState('');      // dari pencarian di landing pelamar; ditampilkan sebagai chip yang bisa dihapus

  const toggleTipeKerja = (value) => setTipeKerja(prev => toggleInArray(prev, value));
  const togglePengalamanBucket = (value) => setPengalamanBucket(prev => toggleInArray(prev, value));
  const toggleGajiBucket = (value) => setGajiBucket(prev => toggleInArray(prev, value));
  const toggleSumber = (value) => setSumber(prev => toggleInArray(prev, value));
  const resetFilters = () => { setTipeKerja([]); setPengalamanBucket([]); setGajiBucket([]); setSumber([]); setKota(''); };
  const activeFilterCount = tipeKerja.length + pengalamanBucket.length + gajiBucket.length + sumber.length;

  useEffect(() => {
    let active = true;
    getAllJobs({ includeExternal }).then(data => {
      if (active) {
        setJobs(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [includeExternal]);

  useEffect(() => { setPage(1); }, [search, sort, tipeKerja, pengalamanBucket, gajiBucket, sumber, kota]);

  // Pilihan filter "Lamar lewat": sumber yang memang ada di data, Luna dulu.
  const sumberOptions = useMemo(() => {
    const peta = new Map();
    jobs.forEach(j => { if (j.source && !peta.has(j.source)) peta.set(j.source, j.source_label || j.source); });
    return [...peta].map(([value, label]) => ({ value, label })).sort((a, b) => (a.value === 'luna' ? -1 : b.value === 'luna' ? 1 : a.label.localeCompare(b.label, 'id')));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const k = kota.trim().toLowerCase();
    return jobs.filter(job => {
      if (k && !(job.location || '').toLowerCase().includes(k)) return false;
      if (q) {
        const matchesSearch =
          (job.title || '').toLowerCase().includes(q) ||
          (job.company_name || '').toLowerCase().includes(q) ||
          (job.location || '').toLowerCase().includes(q) ||
          (job.category || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (tipeKerja.length > 0 && !tipeKerja.includes(job.employment_type)) return false;
      if (pengalamanBucket.length > 0 && !pengalamanBucket.includes(pengalamanBucketOf(job))) return false;
      if (gajiBucket.length > 0 && !gajiBucket.some(b => matchesGajiBucket(job, b))) return false;
      if (sumber.length > 0 && !sumber.includes(job.source)) return false;
      return true;
    });
  }, [jobs, search, kota, tipeKerja, pengalamanBucket, gajiBucket, sumber]);

  // Urutan bawaan pelamar login:
  //  1. sampai ${MAKS_SLOT_LUNA} lowongan Luna yang judul/deskripsinya sejalan dengan posisi di preferensi didahulukan,
  //     terlepas dari skornya (tidak dipaksakan bila tidak ada yang cocok, atau saat pelamar sedang mencari kata kunci);
  //  2. sisanya: yang sudah punya skor dari skor tertinggi, lalu yang belum punya skor dari yang paling sejalan
  //     dengan preferensi. Sort stabil: urutan "terbaru" berlaku di antara yang setara.
  const urutRekomendasi = useMemo(() => {
    const skor = (job) => (typeof skorMap[job.key] === 'number' ? skorMap[job.key] : -1);
    const rel = new Map(filteredJobs.map((job) => [job.key, relevansiPosisi(job, posisiPref) * 2 + (cocokLokasi(job, lokasiPref) ? 1 : 0)]));
    const relPosisi = (job) => relevansiPosisi(job, posisiPref);
    const pinKeys = new Set();
    let sisa = filteredJobs;
    let pinned = [];
    if (posisiPref.length > 0 && !search.trim()) {
      pinned = filteredJobs
        .filter((job) => job.source === 'luna' && relPosisi(job) > 0)
        .sort((a, b) => relPosisi(b) - relPosisi(a) || skor(b) - skor(a))
        .slice(0, MAKS_SLOT_LUNA);
      pinned.forEach((job) => pinKeys.add(job.key));
      sisa = filteredJobs.filter((job) => !pinKeys.has(job.key));
    }
    const urutSisa = [...sisa].sort((a, b) => {
      const sa = skor(a); const sb = skor(b);
      if (sa >= 0 || sb >= 0) return sb - sa || rel.get(b.key) - rel.get(a.key);
      return rel.get(b.key) - rel.get(a.key);
    });
    return { urut: [...pinned, ...urutSisa], pinKeys };
  }, [filteredJobs, skorMap, posisiPref, lokasiPref, search]);

  const sortedJobs = useMemo(() => {
    if (sort === 'terbaru') return filteredJobs;
    if (sort === 'kecocokan') return urutRekomendasi.urut;
    if (sort === 'gaji') {
      // Dibandingkan dari batas atas gaji bulanan. Yang tanpa nominal atau bukan siklus
      // bulanan tidak bisa dibandingkan, jadi ditaruh di bawah. Sort stabil: urutan
      // "terbaru" tetap berlaku di antara gaji yang sama.
      const tertinggi = (job) => jobGajiRange(job)?.[1] ?? -1;
      return [...filteredJobs].sort((a, b) => tertinggi(b) - tertinggi(a));
    }
    return [...filteredJobs].sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '', 'id');
      return sort === 'az' ? cmp : -cmp;
    });
  }, [filteredJobs, sort, urutRekomendasi]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const pagedJobs = useMemo(
    () => sortedJobs.slice((page - 1) * pageSize, page * pageSize),
    [sortedJobs, page, pageSize]
  );

  return {
    loading,
    search, setSearch,
    sort, setSort, sortOptions,
    page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    sumber, toggleSumber, sumberOptions,
    kota, setKota,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
    // Kunci lowongan Luna yang didahulukan karena sejalan dengan preferensi (hanya terisi di urutan bawaan).
    pinKeys: sort === 'kecocokan' ? urutRekomendasi.pinKeys : new Set(),
  };
}
