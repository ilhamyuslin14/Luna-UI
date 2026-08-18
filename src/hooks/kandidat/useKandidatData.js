import { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getKandidat, getDirekrutKandidat, archiveKandidat, unarchiveKandidat } from '../../services/kandidatService.js';
import { getSeleksi } from '../../services/seleksiService.js';
import { getCached, invalidate } from '../../services/dataCache.js';

export const PENGALAMAN_OPTS = ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'];
export const JABATAN_OPTS = ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'];

export function getPeriodeText(k) {
  try {
    let exps = [];
    if (Array.isArray(k.pengalaman_kerja)) {
      exps = k.pengalaman_kerja;
    } else if (typeof k.pengalaman_kerja === 'string' && k.pengalaman_kerja.trim().startsWith('[')) {
      exps = JSON.parse(k.pengalaman_kerja);
    }

    if (exps && exps.length > 0) {
      const exp = exps[0];
      const formatDate = (ds) => {
        if (!ds || ds === 'Present') return ds === 'Present' ? 'Sekarang' : '';
        const d = new Date(ds);
        if (isNaN(d.getTime())) return ds;
        return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      };
      const start = formatDate(exp.start);
      const end = formatDate(exp.end);
      if (start && end) return `${start} – ${end}`;
      if (start) return `${start} – Sekarang`;
    }
  } catch (e) { /* noop */ }
  return k.periode || '-';
}

// Logic (fetch, filter, sort, pagination, arsip, unduh CV, tambahkan ke
// lowongan) dipakai bareng oleh tampilan List desktop (Kandidat_001.jsx) dan
// KandidatMobile.jsx — markup & CSS-nya beda total, tapi sumber data &
// handler-nya satu. Selection UI (checkbox/bulk bar) tetap punya tiap
// halaman sendiri karena bentuknya jauh beda antara desktop & mobile.
export default function useKandidatData({ filter = '', searchQuery = '', perPage: initialPerPage = 25 } = {}) {
  const { companyId } = useAuth();
  const { enqueueScoringJob } = useUpload();

  const [kandidatData, setKandidatData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('nama_asc');
  const [archiveModal, setArchiveModal] = useState(null);
  const [unarchiveModal, setUnarchiveModal] = useState(null);
  const [lowonganModal, setLowonganModal] = useState(false);
  const [lowonganSearchQuery, setLowonganSearchQuery] = useState('');
  const [seleksiList, setSeleksiList] = useState([]);
  const [isLoadingSeleksi, setIsLoadingSeleksi] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  useEffect(() => {
    let mounted = true;
    const cacheKey = filter === 'direkrut' ? `kandidat:direkrut:${companyId}` : `kandidat:${companyId}`;
    const fetchFn = filter === 'direkrut' ? () => getDirekrutKandidat(companyId) : () => getKandidat(companyId);
    setIsLoading(true);
    getCached(cacheKey, fetchFn)
      .then(data => { if (mounted) setKandidatData(data || []); })
      .catch(err => { if (mounted) console.error(err); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [companyId, filter]);

  useEffect(() => { setPage(1); }, [activeFilters]);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const filteredData = useMemo(() => {
    let result = kandidatData;

    const statusActive = ['Aktif', 'Arsip'].filter(f => activeFilters.has(f));
    if (statusActive.length === 1) {
      if (statusActive[0] === 'Arsip') result = result.filter(k => k.arsip === true);
      else result = result.filter(k => !k.arsip);
    } else if (statusActive.length === 0) {
      result = result.filter(k => !k.arsip);
    }

    if (activeFilters.has('Portal Karier')) {
      result = result.filter(k => k.sumber === 'public');
    }

    const pengalamanActive = PENGALAMAN_OPTS.filter(f => activeFilters.has(f));
    if (pengalamanActive.length > 0) {
      result = result.filter(k => {
        const tahun = parseFloat(k.pengalaman_tahun) || 0;
        return pengalamanActive.some(f => {
          if (f === '0-2 Tahun') return tahun >= 0 && tahun <= 2;
          if (f === '2-5 tahun') return tahun > 2 && tahun <= 5;
          if (f === '5-10 tahun') return tahun > 5 && tahun <= 10;
          if (f === '>10 tahun') return tahun > 10;
          return false;
        });
      });
    }

    const jabatanActive = JABATAN_OPTS.filter(f => activeFilters.has(f));
    if (jabatanActive.length > 0) {
      result = result.filter(k => {
        const jabatan = (k.jabatan_saat_ini || '').toLowerCase();
        return jabatanActive.some(f => jabatan.includes(f.toLowerCase()));
      });
    }

    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      result = result.filter(k =>
        (k.nama_lengkap || '').toLowerCase().includes(sq) ||
        (k.jurusan || '').toLowerCase().includes(sq) ||
        (k.domisili || '').toLowerCase().includes(sq)
      );
    }

    result = [...result].sort((a, b) => {
      switch (activeSort) {
        case 'nama_asc': return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
        case 'nama_desc': return (b.nama_lengkap || '').localeCompare(a.nama_lengkap || '');
        case 'date_desc': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'date_asc': return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default: return 0;
      }
    });

    return result;
  }, [kandidatData, activeFilters, searchQuery, activeSort]);

  const activeCount = kandidatData.filter(k => !k.arsip).length;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pagedData = filteredData.slice((page - 1) * perPage, page * perPage);

  const doArchive = async (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    await archiveKandidat(idArr);
    invalidate('kandidat');
    setKandidatData(prev => prev.map(k => idArr.includes(k.id) ? { ...k, arsip: true } : k));
    showToast('Berhasil diarsipkan', `${idArr.length} kandidat dipindahkan ke arsip`);
    return idArr;
  };

  const openArchiveModal = (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    setArchiveModal({
      title: 'Arsipkan Kandidat',
      body: idArr.length === 1
        ? 'Apakah Anda yakin ingin mengarsipkan kandidat ini?'
        : `Apakah Anda yakin ingin mengarsipkan ${idArr.length} kandidat yang dipilih?`,
      ids: idArr,
    });
  };

  const doUnarchive = async (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    await Promise.all(idArr.map(id => unarchiveKandidat(id)));
    invalidate('kandidat');
    setKandidatData(prev => prev.map(k => idArr.includes(k.id) ? { ...k, arsip: false } : k));
    return idArr;
  };

  const handleDownloadCv = async (k) => {
    if (!k.cv_url || downloadingId) return;
    setDownloadingId(k.id);
    try {
      const ext = k.cv_url.split('.').pop().split('?')[0] || 'pdf';
      const safeName = (k.nama_lengkap || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CV_${safeName}.${ext}`;

      const response = await fetch(k.cv_url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, using fallback', err);
      window.open(k.cv_url, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBulkDownloadCv = async (ids) => {
    if (isBulkDownloading) return false;
    const targets = kandidatData.filter(k => ids.includes(k.id) && k.cv_url);

    if (targets.length === 0) {
      showToast('Belum ada CV', 'Kandidat yang dipilih belum punya CV yang diunggah');
      return false;
    }

    setIsBulkDownloading(true);
    try {
      const zip = new JSZip();
      const usedNames = new Set();
      let failCount = 0;

      await Promise.all(targets.map(async (k) => {
        try {
          const response = await fetch(k.cv_url);
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();

          const ext = k.cv_url.split('.').pop().split('?')[0] || 'pdf';
          const safeName = (k.nama_lengkap || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
          let filename = `${safeName}.${ext}`;
          let suffix = 2;
          while (usedNames.has(filename)) {
            filename = `${safeName}_${suffix}.${ext}`;
            suffix += 1;
          }
          usedNames.add(filename);
          zip.file(filename, blob);
        } catch (err) {
          console.error(`Gagal mengunduh CV ${k.nama_lengkap}:`, err);
          failCount += 1;
        }
      }));

      const successCount = targets.length - failCount;
      if (successCount === 0) {
        showToast('Gagal mengunduh', 'Semua CV gagal diambil, coba lagi', 'error');
        return false;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const dateStr = new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `CV_Kandidat_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        'CV berhasil diunduh',
        failCount > 0
          ? `${successCount} CV dikemas dalam satu ZIP, ${failCount} gagal diambil`
          : `${successCount} CV dikemas dalam satu file ZIP`
      );
      return true;
    } catch (err) {
      console.error('Bulk download failed', err);
      showToast('Gagal mengunduh', 'Terjadi kesalahan saat mengemas file CV', 'error');
      return false;
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const openLowonganModal = () => {
    setLowonganModal(true);
    setIsLoadingSeleksi(true);
    getSeleksi(companyId)
      .then(rows => setSeleksiList((rows || []).filter(s => !s.arsip)))
      .catch(() => showToast('Gagal memuat', 'Gagal memuat daftar lowongan', 'error'))
      .finally(() => setIsLoadingSeleksi(false));
  };

  const closeLowonganModal = () => {
    setLowonganModal(false);
    setLowonganSearchQuery('');
  };

  const handleTambahkanKeLowongan = (seleksi, ids) => {
    if (!seleksi || !ids?.length) return;
    ids.forEach(kandidatId => {
      const k = kandidatData.find(c => c.id === kandidatId);
      enqueueScoringJob(kandidatId, seleksi.id, seleksi.jabatan, k?.nama_lengkap || '', companyId);
    });
    closeLowonganModal();
    showToast('Kandidat ditambahkan', `${ids.length} kandidat sedang dinilai untuk ${seleksi.jabatan}`);
  };

  const filteredSeleksiList = seleksiList.filter(s =>
    (s.jabatan || '').toLowerCase().includes(lowonganSearchQuery.toLowerCase()) ||
    (s.departments?.name || s.departemen || '').toLowerCase().includes(lowonganSearchQuery.toLowerCase())
  );

  return {
    isLoading, kandidatData,
    activeFilters, toggleFilter, setActiveFilters,
    activeSort, setActiveSort,
    page, setPage, perPage, setPerPage,
    filteredData, pagedData, totalPages, activeCount,
    toast, setToast, showToast,
    archiveModal, setArchiveModal, openArchiveModal, doArchive,
    unarchiveModal, setUnarchiveModal, doUnarchive,
    downloadingId, handleDownloadCv,
    isBulkDownloading, handleBulkDownloadCv,
    lowonganModal, openLowonganModal, closeLowonganModal,
    lowonganSearchQuery, setLowonganSearchQuery,
    seleksiList, isLoadingSeleksi, filteredSeleksiList,
    handleTambahkanKeLowongan,
  };
}
