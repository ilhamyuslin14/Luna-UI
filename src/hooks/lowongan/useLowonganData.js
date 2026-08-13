import { useState, useEffect, useRef } from 'react';
import {
  getSeleksi,
  updateSeleksiStatus,
  getKandidatCountBySeleksi,
  getMaxAlurBySeleksi,
  archiveSeleksi,
  unarchiveSeleksi,
} from '../../services/seleksiService.js';
import { getAlurSeleksi, DEFAULT_ALUR, alurNamaByLevel } from '../../services/alurSeleksiService.js';
import { getCached, invalidate } from '../../services/dataCache.js';
import { slugify } from '../../utils/slug.js';

export const STATUS_CONFIG = {
  rencana: { icon: '/assets/status/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status/status_dibatalkan.svg', label: 'Dibatalkan' },
};

export const STATUS_NORMALIZE = {
  Aktif: 'aktif', aktif: 'aktif',
  Rencana: 'rencana', rencana: 'rencana',
  Ditahan: 'ditahan', ditahan: 'ditahan',
  Selesai: 'selesai', selesai: 'selesai',
  Dibatalkan: 'dibatalkan', dibatalkan: 'dibatalkan',
};

export const STATUS_TO_DB = {
  rencana: 'Rencana', aktif: 'Aktif', ditahan: 'Ditahan',
  selesai: 'Selesai', dibatalkan: 'Dibatalkan',
};

export function applyStatusFilters(rows, activeFilters) {
  const statusFilterActive = [...activeFilters].some(f => f !== 'Arsip');
  if (!statusFilterActive) return rows;
  return rows.filter(r => {
    if (r.arsip) return activeFilters.has('Arsip');
    const label = STATUS_CONFIG[r.status]?.label;
    return activeFilters.has(label);
  });
}

// Logic (fetch, filter, sort, pagination, aksi mutasi) dipakai bareng oleh
// tampilan List desktop (Lowongan_001.jsx) dan LowonganMobile.jsx — markup &
// CSS-nya 100% beda, tapi sumber data & handler-nya satu supaya perbaikan
// bug di satu tempat kepakai di keduanya. Kanban/board view desktop sengaja
// tidak masuk ke sini karena murni fitur presentasi desktop-only.
export default function useLowonganData(companyId, companyPlan, { searchQuery = '', perPage: initialPerPage = 25 } = {}) {
  const isFreePlan = companyPlan === 'free';
  const statusConfigEntries = isFreePlan
    ? Object.entries(STATUS_CONFIG).filter(([key]) => key === 'rencana' || key === 'aktif')
    : Object.entries(STATUS_CONFIG);

  const [rows, setRows] = useState([]);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [maxAlurMap, setMaxAlurMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('nama_asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  const filterArchiveOnly = activeFilters.has('Arsip') && activeFilters.size === 1;
  const filterBothOn = activeFilters.has('Arsip') && activeFilters.size > 1;

  const [archiveModal, setArchiveModal] = useState(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const loadData = async (opts = {}) => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const showArchived = opts.showArchived ?? filterArchiveOnly;
      const showAll = opts.showAll ?? filterBothOn;

      const cacheKey = `seleksi:${companyId}:${showArchived}:${showAll}`;
      const { data, kandCountMap, maxMap, alur } = await getCached(cacheKey, async () => {
        const [data, kandCountMap, maxMap, alur] = await Promise.all([
          getSeleksi(companyId, { showArchived, showAll }),
          getKandidatCountBySeleksi(companyId),
          getMaxAlurBySeleksi(companyId),
          getAlurSeleksi(companyId),
        ]);
        return { data, kandCountMap, maxMap, alur };
      });

      setAlurList(alur);
      setMaxAlurMap(maxMap);

      const formattedRows = (data || []).map(item => {
        const maxLevel = maxMap[item.id];
        const alurNama = maxLevel != null
          ? (alurNamaByLevel(alur, maxLevel) || 'Belum ada kandidat')
          : 'Belum ada kandidat';
        return {
          id: item.id,
          posisi: item.jabatan || '-',
          levelJabatan: item.level_jabatan || '-',
          dept: item.departments?.name || '-',
          lokasi: item.lokasi || '-',
          alur: alurNama,
          kandidat: kandCountMap[item.id] || 0,
          tanggal: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawDate: item.created_at,
          status: STATUS_NORMALIZE[item.status] || 'rencana',
          arsip: item.arsip || false,
          kode: item.kode || null,
        };
      });
      setRows(formattedRows);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat', 'Data seleksi tidak dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    setPage(1);
    if (companyId) loadData({ showArchived: filterArchiveOnly, showAll: filterBothOn });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  let filteredRows = applyStatusFilters(rows, activeFilters);

  if (searchQuery.trim()) {
    const sq = searchQuery.toLowerCase().trim();
    filteredRows = filteredRows.filter(r =>
      (r.posisi || '').toLowerCase().includes(sq) ||
      (r.dept || '').toLowerCase().includes(sq)
    );
  }

  filteredRows = [...filteredRows].sort((a, b) => {
    switch (activeSort) {
      case 'nama_asc': return (a.posisi || '').localeCompare(b.posisi || '');
      case 'nama_desc': return (b.posisi || '').localeCompare(a.posisi || '');
      case 'date_desc': return new Date(b.rawDate || 0) - new Date(a.rawDate || 0);
      case 'date_asc': return new Date(a.rawDate || 0) - new Date(b.rawDate || 0);
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);
  const activeCount = rows.filter(r => !r.arsip).length;

  const updateStatus = (rowId, newStatus) => {
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    const prevStatus = rows.find(r => r.id === rowId)?.status;
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: newStatus } : r));
    updateSeleksiStatus(rowId, STATUS_TO_DB[newStatus] || newStatus)
      .then(() => { invalidate('seleksi'); showToast('Status berhasil diperbarui', `Status diubah ke ${label}`); })
      .catch(err => {
        showToast('Gagal memperbarui status', err.message);
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: prevStatus } : r));
      });
  };

  const handleRowArchive = (row) => {
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: `Apakah Anda yakin ingin mengarsipkan posisi "${row.posisi}"?`,
      onConfirm: async () => {
        try {
          await archiveSeleksi(row.id);
          invalidate('seleksi');
          showToast('Posisi diarsipkan', 'Data dipindahkan ke arsip');
          setArchiveModal(null);
          loadData({ showArchived: filterArchiveOnly, showAll: filterBothOn });
        } catch {
          showToast('Gagal', 'Tidak dapat mengarsipkan posisi');
          setArchiveModal(null);
        }
      },
    });
  };

  const handleUnarchiveConfirm = async () => {
    try {
      await unarchiveSeleksi(unarchiveTarget.id);
      invalidate('seleksi');
      showToast('Posisi ditampilkan kembali', 'Status diubah ke aktif');
      setUnarchiveTarget(null);
      loadData({ showArchived: filterArchiveOnly, showAll: filterBothOn });
    } catch {
      showToast('Gagal', 'Terjadi kesalahan saat menampilkan posisi');
      setUnarchiveTarget(null);
    }
  };

  const buildKaririUrl = (row, companyName) => row.kode
    ? `${window.location.origin}/?view=laman-karir&perusahaan=${slugify(companyName)}&posisi=${slugify(row.posisi)}&kode=${encodeURIComponent(row.kode)}`
    : `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(row.posisi)}`;

  const handleViewLaman = (row, companyName) => {
    if (row.status !== 'aktif') return;
    window.open(buildKaririUrl(row, companyName), '_blank', 'noopener,noreferrer');
  };

  const handleShare = (platform, row, companyName) => {
    const url = buildKaririUrl(row, companyName);
    const text = `Lowongan ${row.posisi} di ${companyName || 'perusahaan kami'}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'instagram':
        navigator.clipboard.writeText(url).then(() => {
          showToast('Link disalin', 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.');
        });
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          showToast('Tautan disalin', 'Link laman karier sudah disalin ke clipboard.');
        });
    }
  };

  return {
    isFreePlan,
    statusConfigEntries,
    rows, alurList, maxAlurMap, isLoading,
    activeFilters, setActiveFilters, toggleFilter,
    activeSort, setActiveSort,
    page, setPage, perPage, setPerPage,
    filteredRows, pagedRows, totalPages, activeCount,
    filterArchiveOnly, filterBothOn,
    toast, setToast, showToast,
    archiveModal, setArchiveModal,
    unarchiveTarget, setUnarchiveTarget,
    loadData,
    updateStatus,
    handleRowArchive,
    handleUnarchiveConfirm,
    buildKaririUrl,
    handleViewLaman,
    handleShare,
  };
}
