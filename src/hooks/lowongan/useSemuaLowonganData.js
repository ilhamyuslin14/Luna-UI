import { useState, useEffect, useMemo } from 'react';
import { getAllActiveJobs } from '../../services/seleksiService.js';

// Hook ringan khusus laman publik "Semua Lowongan" (?view=semua-lowongan) —
// beda dari useLamanKarirData yang dibangun untuk 1 lowongan spesifik +
// alur upload CV/lamar. Di sini cuma perlu daftar semua lowongan aktif
// beserta search/sort/filter/pagination-nya, dipakai bareng oleh versi desktop
// (SemuaLowongan.jsx) dan mobile (SemuaLowonganMobile.jsx).
export const SEMUA_LOWONGAN_SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'az', label: 'Nama A-Z' },
  { value: 'za', label: 'Nama Z-A' },
];

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

function pengalamanBucketOf(job) {
  const n = parseInt(job.pengalaman, 10);
  if (!n || n <= 0) return 'fresh';
  if (n < 3) return '1-3';
  if (n < 5) return '3-5';
  return '5+';
}

function parseRupiah(val) {
  if (!val) return null;
  const digits = String(val).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : null;
}

// Bucket gaji cuma bisa dibandingkan kalau siklusnya bulanan — membandingkan
// upah "per jam"/"per hari" ke bucket "Rp 3-5 jt" tidak masuk akal, jadi
// lowongan dengan siklus lain sengaja tidak match filter gaji manapun
// (bukan bug, ini memang bukan sesuatu yang bisa dinormalisasi dengan aman).
function jobGajiRange(job) {
  if ((job.siklus_upah || '').toLowerCase() !== 'bulanan') return null;
  const min = parseRupiah(job.upah_min);
  const max = parseRupiah(job.upah_maks);
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

export default function useSemuaLowonganData(pageSize = 9) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);

  const [tipeKerja, setTipeKerja] = useState([]);
  const [pengalamanBucket, setPengalamanBucket] = useState([]);
  const [gajiBucket, setGajiBucket] = useState([]);

  const toggleTipeKerja = (value) => setTipeKerja(prev => toggleInArray(prev, value));
  const togglePengalamanBucket = (value) => setPengalamanBucket(prev => toggleInArray(prev, value));
  const toggleGajiBucket = (value) => setGajiBucket(prev => toggleInArray(prev, value));
  const resetFilters = () => { setTipeKerja([]); setPengalamanBucket([]); setGajiBucket([]); };
  const activeFilterCount = tipeKerja.length + pengalamanBucket.length + gajiBucket.length;

  useEffect(() => {
    let active = true;
    getAllActiveJobs().then(data => {
      if (active) {
        setJobs(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => { setPage(1); }, [search, sort, tipeKerja, pengalamanBucket, gajiBucket]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter(job => {
      if (q) {
        const matchesSearch =
          (job.jabatan || '').toLowerCase().includes(q) ||
          (job.companies?.name || '').toLowerCase().includes(q) ||
          (job.lokasi || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (tipeKerja.length > 0 && !tipeKerja.includes(job.ikatan_kerja)) return false;
      if (pengalamanBucket.length > 0 && !pengalamanBucket.includes(pengalamanBucketOf(job))) return false;
      if (gajiBucket.length > 0 && !gajiBucket.some(b => matchesGajiBucket(job, b))) return false;
      return true;
    });
  }, [jobs, search, tipeKerja, pengalamanBucket, gajiBucket]);

  const sortedJobs = useMemo(() => {
    if (sort === 'terbaru') return filteredJobs;
    return [...filteredJobs].sort((a, b) => {
      const cmp = (a.jabatan || '').localeCompare(b.jabatan || '', 'id');
      return sort === 'az' ? cmp : -cmp;
    });
  }, [filteredJobs, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const pagedJobs = useMemo(
    () => sortedJobs.slice((page - 1) * pageSize, page * pageSize),
    [sortedJobs, page, pageSize]
  );

  return {
    loading,
    search, setSearch,
    sort, setSort,
    page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
  };
}
