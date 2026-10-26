import { useState, useEffect, useMemo } from 'react';
import { LOWONGAN_DUMMY } from '../data/lowonganDummy.js';
import { PELAMAR_DUMMY } from '../MockSession.jsx';
import { relevansiPosisi, cocokLokasi } from '../../utils/personalisasiLowongan.js';

// Salinan useSemuaLowonganData untuk mockup: sumber datanya LOWONGAN_DUMMY (statis), tanpa pemanggilan
// database. Pencarian, filter, urutan, filter sumber ("Lamar Lewat"), dan urutan rekomendasi (slot lowongan
// Luna yang sejalan dengan preferensi, lalu skor) dibuat sama dengan aslinya supaya semua kontrol di
// halaman benar-benar bekerja saat presentasi. Preferensi diambil dari PELAMAR_DUMMY.
export { SEMUA_LOWONGAN_SORT_OPTIONS, PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../hooks/lowongan/useSemuaLowonganData.js';
import { SEMUA_LOWONGAN_SORT_OPTIONS } from '../../hooks/lowongan/useSemuaLowonganData.js';

const MAKS_SLOT_LUNA = 5;
const OPSI_KECOCOKAN = { value: 'kecocokan', label: 'Kecocokan tertinggi' };

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

export default function useSemuaLowonganMock(pageSize = 10, { skorMap = {} } = {}) {
  const posisiPref = PELAMAR_DUMMY.pref_posisi;
  const lokasiPref = PELAMAR_DUMMY.pref_lokasi;

  const [search, setSearch] = useState('');
  const [sortPilihan, setSort] = useState(null);
  const sort = sortPilihan ?? 'kecocokan';
  const sortOptions = [OPSI_KECOCOKAN, ...SEMUA_LOWONGAN_SORT_OPTIONS];
  const [page, setPage] = useState(1);
  const [tipeKerja, setTipeKerja] = useState([]);
  const [pengalamanBucket, setPengalamanBucket] = useState([]);
  const [gajiBucket, setGajiBucket] = useState([]);
  const [sumber, setSumber] = useState([]);
  const [kota, setKota] = useState('');

  const toggleTipeKerja = (v) => setTipeKerja(prev => toggleInArray(prev, v));
  const togglePengalamanBucket = (v) => setPengalamanBucket(prev => toggleInArray(prev, v));
  const toggleGajiBucket = (v) => setGajiBucket(prev => toggleInArray(prev, v));
  const toggleSumber = (v) => setSumber(prev => toggleInArray(prev, v));
  const resetFilters = () => { setTipeKerja([]); setPengalamanBucket([]); setGajiBucket([]); setSumber([]); setKota(''); };
  const activeFilterCount = tipeKerja.length + pengalamanBucket.length + gajiBucket.length + sumber.length;

  useEffect(() => { setPage(1); }, [search, sort, tipeKerja, pengalamanBucket, gajiBucket, sumber, kota]);

  const sumberOptions = useMemo(() => {
    const peta = new Map();
    LOWONGAN_DUMMY.forEach(j => { if (j.source && !peta.has(j.source)) peta.set(j.source, j.source_label || j.source); });
    return [...peta].map(([value, label]) => ({ value, label })).sort((a, b) => (a.value === 'luna' ? -1 : b.value === 'luna' ? 1 : a.label.localeCompare(b.label, 'id')));
  }, []);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const k = kota.trim().toLowerCase();
    return LOWONGAN_DUMMY.filter(job => {
      if (k && !(job.location || '').toLowerCase().includes(k)) return false;
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
      if (sumber.length > 0 && !sumber.includes(job.source)) return false;
      return true;
    });
  }, [search, kota, tipeKerja, pengalamanBucket, gajiBucket, sumber]);

  // Urutan bawaan: sampai 5 lowongan Luna yang sejalan dengan preferensi posisi didahulukan (terlepas dari skor),
  // lalu yang bernilai dari skor tertinggi, lalu yang belum bernilai dari yang paling sejalan dengan preferensi.
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
      const tertinggi = (job) => jobGajiRange(job)?.[1] ?? -1;
      return [...filteredJobs].sort((a, b) => tertinggi(b) - tertinggi(a));
    }
    return [...filteredJobs].sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '', 'id');
      return sort === 'az' ? cmp : -cmp;
    });
  }, [filteredJobs, sort, urutRekomendasi]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const pagedJobs = useMemo(() => sortedJobs.slice((page - 1) * pageSize, page * pageSize), [sortedJobs, page, pageSize]);

  return {
    loading: false,
    search, setSearch, sort, setSort, sortOptions, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    sumber, toggleSumber, sumberOptions,
    kota, setKota,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
    pinKeys: sort === 'kecocokan' ? urutRekomendasi.pinKeys : new Set(),
  };
}
