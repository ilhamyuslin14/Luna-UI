import { useState, useEffect, useMemo } from 'react';
import { getAllActiveJobs } from '../../services/seleksiService.js';

// Hook ringan khusus laman publik "Semua Lowongan" (?view=semua-lowongan) —
// beda dari useLamanKarirData yang dibangun untuk 1 lowongan spesifik +
// alur upload CV/lamar. Di sini cuma perlu daftar semua lowongan aktif
// beserta search/sort/pagination-nya, dipakai bareng oleh versi desktop
// (SemuaLowongan.jsx) dan mobile (SemuaLowonganMobile.jsx).
export const SEMUA_LOWONGAN_SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'az', label: 'Nama A-Z' },
  { value: 'za', label: 'Nama Z-A' },
];

export default function useSemuaLowonganData(pageSize = 9) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);

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

  useEffect(() => { setPage(1); }, [search, sort]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(job =>
      (job.jabatan || '').toLowerCase().includes(q) ||
      (job.companies?.name || '').toLowerCase().includes(q) ||
      (job.lokasi || '').toLowerCase().includes(q)
    );
  }, [jobs, search]);

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
    sortedJobs, pagedJobs, totalPages, pageSize,
  };
}
