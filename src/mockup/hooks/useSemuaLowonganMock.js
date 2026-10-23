import { useState, useEffect, useMemo } from 'react';
import { LOWONGAN_DUMMY } from '../data/lowonganDummy.js';

// Salinan useSemuaLowonganData untuk mockup: sumber datanya LOWONGAN_DUMMY (statis), tanpa
// pemanggilan database. Pencarian, filter, urutan, dan paginasi dibuat sama dengan aslinya supaya
// semua kontrol di halaman benar-benar bekerja saat presentasi.
export { SEMUA_LOWONGAN_SORT_OPTIONS, PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../hooks/lowongan/useSemuaLowonganData.js';

const GAJI_RANGES = {
  under3: [0, 3_000_000],
  '3-5': [3_000_000, 5_000_000],
  '5-10': [5_000_000, 10_000_000],
  over10: [10_000_000, Infinity],
};

function pengalamanBucketOf(job) {
  const n = job.experience_years;
  if (n == null) return null;
  if (n <= 0) return 'fresh';
  if (n < 3) return '1-3';
  if (n < 5) return '3-5';
  return '5+';
}

function jobGajiRange(job) {
  if (job.salary_cycle !== 'bulanan') return null;
  const { salary_min: min, salary_max: max } = job;
  if (min == null && max == null) return null;
  return [min ?? max, max ?? min];
}

function matchesGajiBucket(job, bucketValue) {
  const range = jobGajiRange(job);
  if (!range) return false;
  const [bMin, bMax] = GAJI_RANGES[bucketValue];
  return range[0] <= bMax && range[1] >= bMin;
}

const toggleInArray = (arr, value) => (arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);

export default function useSemuaLowonganMock(pageSize = 10) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);
  const [tipeKerja, setTipeKerja] = useState([]);
  const [pengalamanBucket, setPengalamanBucket] = useState([]);
  const [gajiBucket, setGajiBucket] = useState([]);

  const toggleTipeKerja = (v) => setTipeKerja(prev => toggleInArray(prev, v));
  const togglePengalamanBucket = (v) => setPengalamanBucket(prev => toggleInArray(prev, v));
  const toggleGajiBucket = (v) => setGajiBucket(prev => toggleInArray(prev, v));
  const resetFilters = () => { setTipeKerja([]); setPengalamanBucket([]); setGajiBucket([]); };
  const activeFilterCount = tipeKerja.length + pengalamanBucket.length + gajiBucket.length;

  useEffect(() => { setPage(1); }, [search, sort, tipeKerja, pengalamanBucket, gajiBucket]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LOWONGAN_DUMMY.filter(job => {
      if (q) {
        const cocok =
          (job.title || '').toLowerCase().includes(q) ||
          (job.company_name || '').toLowerCase().includes(q) ||
          (job.location || '').toLowerCase().includes(q) ||
          (job.category || '').toLowerCase().includes(q);
        if (!cocok) return false;
      }
      if (tipeKerja.length > 0 && !tipeKerja.includes(job.employment_type)) return false;
      if (pengalamanBucket.length > 0 && !pengalamanBucket.includes(pengalamanBucketOf(job))) return false;
      if (gajiBucket.length > 0 && !gajiBucket.some(b => matchesGajiBucket(job, b))) return false;
      return true;
    });
  }, [search, tipeKerja, pengalamanBucket, gajiBucket]);

  const sortedJobs = useMemo(() => {
    if (sort === 'terbaru') return filteredJobs;
    if (sort === 'gaji') {
      const tertinggi = (job) => jobGajiRange(job)?.[1] ?? -1;
      return [...filteredJobs].sort((a, b) => tertinggi(b) - tertinggi(a));
    }
    return [...filteredJobs].sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '', 'id');
      return sort === 'az' ? cmp : -cmp;
    });
  }, [filteredJobs, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const pagedJobs = useMemo(() => sortedJobs.slice((page - 1) * pageSize, page * pageSize), [sortedJobs, page, pageSize]);

  return {
    loading: false,
    search, setSearch, sort, setSort, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
  };
}
