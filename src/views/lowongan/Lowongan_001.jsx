import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
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
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import PopupPilihanBuatLowongan from '../../components/PopupPilihanBuatLowongan.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Toast from '../../components/Toast.jsx';

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
    <circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 16.5v-3.7a2.3 2.3 0 0 1 4.5 0v3.7" />
    <line x1="11" y1="10.5" x2="11" y2="16.5" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M14 8.5h-1.3c-.9 0-1.7.7-1.7 1.7V12h3l-.4 2.5h-2.6V19" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
  </svg>
);

const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SHARE_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

const IconPapan = () => (
  <svg width="14" height="14" viewBox="0 0 12.79 12.79" fill="none">
    <path d="M8.46622 0.5H4.32378C2.21197 0.5 0.5 2.21197 0.5 4.32378V8.46622C0.5 10.578 2.21197 12.29 4.32378 12.29H8.46622C10.578 12.29 12.29 10.578 12.29 8.46622V4.32378C12.29 2.21197 10.578 0.5 8.46622 0.5Z" stroke="currentColor" />
    <path d="M3.6367 9.08418V5.83461M6.47331 9.08418V3.70285M9.15314 9.08418V5.00421" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

const IconList = () => (
  <svg width="13" height="13" viewBox="0 0 12 12.1471" fill="none">
    <path d="M7.78346 0.0789063H7.90162C8.0246 0.0789862 8.14211 0.129039 8.22779 0.217578L11.2874 3.40508C11.3682 3.48895 11.4142 3.60211 11.4143 3.71855V9.25566C11.4252 10.7711 10.2446 12.0093 8.72682 12.0711L3.81666 12.0721C2.29326 12.0376 1.08031 10.7699 1.11354 9.2459V2.78398C1.14883 1.28555 2.38665 0.0789063 3.87428 0.0789063H7.7024C7.71566 0.0777304 7.72889 0.075008 7.74244 0.075C7.75624 0.075 7.76997 0.0776972 7.78346 0.0789063ZM3.87525 0.985156C2.87437 0.985194 2.04334 1.79601 2.01979 2.7957V9.25566C1.99744 10.2904 2.81274 11.1428 3.83717 11.1658H8.70826C9.71636 11.1241 10.5152 10.2864 10.5081 9.25957V4.29375H9.2942C8.18878 4.29073 7.28932 3.38917 7.28932 2.28496V0.985156H3.87525ZM7.63014 7.69219C7.88007 7.69235 8.08326 7.89534 8.08326 8.14531C8.08322 8.39525 7.88005 8.59827 7.63014 8.59844H4.36842C4.11837 8.59844 3.91534 8.39535 3.91529 8.14531C3.91529 7.89523 4.11834 7.69219 4.36842 7.69219H7.63014ZM6.39479 5.42266C6.64469 5.42286 6.84791 5.62583 6.84791 5.87578C6.84787 6.1257 6.64466 6.3287 6.39479 6.32891H4.36744C4.11739 6.32891 3.91436 6.12582 3.91432 5.87578C3.91432 5.6257 4.11736 5.42266 4.36744 5.42266H6.39479ZM8.19557 2.28496C8.19557 2.89143 8.68931 3.38569 9.29518 3.3875H10.0149L8.19557 1.49199V2.28496Z" fill="currentColor" />
  </svg>
);

const STATUS_CONFIG = {
  rencana: { icon: '/assets/status/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status/status_dibatalkan.svg', label: 'Dibatalkan' },
};

const STATUS_NORMALIZE = {
  Aktif: 'aktif', aktif: 'aktif',
  Rencana: 'rencana', rencana: 'rencana',
  Ditahan: 'ditahan', ditahan: 'ditahan',
  Selesai: 'selesai', selesai: 'selesai',
  Dibatalkan: 'dibatalkan', dibatalkan: 'dibatalkan',
};

const STATUS_TO_DB = {
  rencana: 'Rencana', aktif: 'Aktif', ditahan: 'Ditahan',
  selesai: 'Selesai', dibatalkan: 'Dibatalkan',
};

const ArchiveSvg = ({ style } = {}) => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5, ...style }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

function applyStatusFilters(rows, activeFilters) {
  const statusFilterActive = [...activeFilters].some(f => f !== 'Arsip');
  if (!statusFilterActive) return rows;
  return rows.filter(r => {
    if (r.arsip) return activeFilters.has('Arsip');
    const label = STATUS_CONFIG[r.status]?.label;
    return activeFilters.has(label);
  });
}

function buildBoardFromData(alurList, rows, maxAlurMap) {
  const belumCol = { title: 'Belum Ada Kandidat', cards: [] };
  const alurCols = alurList
    .filter(a => a.level > 0)
    .map(a => ({ level: a.level, title: a.nama, cards: [] }));

  rows.forEach(r => {
    const maxLevel = maxAlurMap[r.id];
    const card = { ...r, statusLabel: STATUS_CONFIG[r.status]?.label || 'Rencana' };
    if (maxLevel == null) {
      belumCol.cards.push(card);
    } else {
      const col = alurCols.find(c => c.level === maxLevel);
      if (col) col.cards.push(card);
      else belumCol.cards.push(card);
    }
  });

  const colEntries = [['belum', belumCol]];
  alurCols.forEach(c => colEntries.push([`alur_${c.level}`, c]));
  return Object.fromEntries(colEntries);
}

export default function Lowongan_001({ navigate, searchQuery = '' }) {
  const { companyId, companyPlan, companyName } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const statusConfigEntries = isFreePlan
    ? Object.entries(STATUS_CONFIG).filter(([key]) => key === 'rencana' || key === 'aktif')
    : Object.entries(STATUS_CONFIG);
  const [isBoardView, setIsBoardView] = useState(false);
  const [rows, setRows] = useState([]);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [maxAlurMap, setMaxAlurMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openStatusIdx, setOpenStatusIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('nama_asc');
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // archive filter logic (same pattern as Departemen)
  const filterArchiveOnly = activeFilters.has('Arsip') && activeFilters.size === 1;
  const filterBothOn = activeFilters.has('Arsip') && activeFilters.size > 1;

  const [archiveModal, setArchiveModal] = useState(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [showCreateChoice, setShowCreateChoice] = useState(false);
  const toastTimer = useRef(null);
  const [openShareRow, setOpenShareRow] = useState(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const [boardColumns, setBoardColumns] = useState({});
  const [collapsedCols, setCollapsedCols] = useState(new Set());
  const [dragOverCol, setDragOverCol] = useState(null);
  const [openCardStatus, setOpenCardStatus] = useState(null);
  const [openCardMenu, setOpenCardMenu] = useState(null);
  const draggedCard = useRef(null);
  const draggedFromCol = useRef(null);

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

      const boardRows = applyStatusFilters(formattedRows, activeFilters);
      setBoardColumns(buildBoardFromData(alur, boardRows, maxMap));
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat', 'Data seleksi tidak dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // reload when filter changes (archive filter affects DB query)
  useEffect(() => {
    setPage(1);
    if (companyId) loadData({ showArchived: filterArchiveOnly, showAll: filterBothOn });
  }, [activeFilters]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  // client-side filter by recruitment status (not archive)
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

  // count only non-archived for the stats badge
  const activeCount = rows.filter(r => !r.arsip).length;

  const selectAll = pagedRows.length > 0 && pagedRows.every(r => selectedRows.has(r.id));
  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (selectAll) pagedRows.forEach(r => next.delete(r.id));
    else pagedRows.forEach(r => next.add(r.id));
    setSelectedRows(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const updateStatus = (rowId, newStatus) => {
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    const prevStatus = rows.find(r => r.id === rowId)?.status;
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: newStatus } : r));
    setOpenStatusIdx(null);
    updateSeleksiStatus(rowId, STATUS_TO_DB[newStatus] || newStatus)
      .then(() => { invalidate('seleksi'); showToast('Status berhasil diperbarui', `Status diubah ke ${label}`); })
      .catch(err => {
        showToast('Gagal memperbarui status', err.message);
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: prevStatus } : r));
      });
  };

  const handleBulkArchive = () => {
    if (selectedRows.size === 0) return;
    const n = selectedRows.size;
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: `Apakah Anda yakin ingin mengarsipkan ${n} posisi yang dipilih?`,
      onConfirm: async () => {
        try {
          await Promise.all([...selectedRows].map(id => archiveSeleksi(id)));
          invalidate('seleksi');
          showToast(`${n} posisi diarsipkan`, 'Data dipindahkan ke arsip');
          setSelectedRows(new Set());
          setShowBulkDropdown(false);
          setArchiveModal(null);
          loadData({ showArchived: filterArchiveOnly, showAll: filterBothOn });
        } catch {
          showToast('Gagal', 'Terjadi kesalahan saat mengarsipkan');
          setArchiveModal(null);
        }
      },
    });
  };

  const buildKaririUrl = (row) => row.kode
    ? `${window.location.origin}/?view=laman-karir&perusahaan=${slugify(companyName)}&posisi=${slugify(row.posisi)}&kode=${encodeURIComponent(row.kode)}`
    : `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(row.posisi)}`;

  const handleViewLaman = (row) => {
    if (row.status !== 'aktif') return;
    window.open(buildKaririUrl(row), '_blank', 'noopener,noreferrer');
  };

  const handleShare = (platform, row) => {
    const url = buildKaririUrl(row);
    const text = `Lowongan ${row.posisi} di ${companyName || 'perusahaan kami'}`;
    setOpenShareRow(null);

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

  // board card archive
  const archiveCard = (colKey, cardIdx) => {
    setOpenCardMenu(null);
    const card = boardColumns[colKey].cards[cardIdx];
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: `Apakah Anda yakin ingin mengarsipkan posisi "${card.posisi}"?`,
      onConfirm: async () => {
        try {
          if (card.id) await archiveSeleksi(card.id);
          invalidate('seleksi');
          setBoardColumns(prev => {
            const cards = prev[colKey].cards.filter((_, i) => i !== cardIdx);
            return { ...prev, [colKey]: { ...prev[colKey], cards } };
          });
          setRows(prev => prev.filter(r => r.id !== card.id));
          setArchiveModal(null);
          showToast('Posisi berhasil diarsipkan', 'Data telah dipindahkan ke arsip');
        } catch {
          showToast('Gagal', 'Tidak dapat mengarsipkan posisi');
          setArchiveModal(null);
        }
      },
    });
  };

  const handleDragStart = (e, colKey, cardIdx) => {
    e.dataTransfer.effectAllowed = 'move';
    draggedCard.current = { colKey, cardIdx };
    draggedFromCol.current = colKey;
  };

  const handleDrop = async (targetColKey) => {
    const src = draggedCard.current;
    if (!src || src.colKey === targetColKey) return;
    
    // Get the actual card
    const cardToMove = boardColumns[src.colKey].cards[src.cardIdx];
    const newStatusLabel = STATUS_CONFIG[targetColKey].label;

    try {
      // Update DB
      await updateSeleksi(cardToMove.id, { status: newStatusLabel });
      invalidate('seleksi');
      showToast('Status Diperbarui', 'Status posisi berhasil diubah.');

      // Update Local State
      setBoardColumns(prev => {
        const srcCards = [...prev[src.colKey].cards];
        const [card] = srcCards.splice(src.cardIdx, 1);
        card.status = targetColKey;
        card.statusLabel = newStatusLabel;
        const tgtCards = [...prev[targetColKey].cards, card];
        return { ...prev, [src.colKey]: { ...prev[src.colKey], cards: srcCards }, [targetColKey]: { ...prev[targetColKey], cards: tgtCards } };
      });
      // Also update rows so List View is in sync
      setRows(prev => prev.map(r => r.id === cardToMove.id ? { ...r, status: targetColKey } : r));
    } catch (err) {
      showToast('Gagal', err.message || 'Terjadi kesalahan saat memindahkan status.', 'error');
    }

    draggedCard.current = null;
  };

  const updateCardStatus = (colKey, cardIdx, newStatus) => {
    const card = boardColumns[colKey].cards[cardIdx];
    const prevStatus = card.status;
    const prevStatusLabel = card.statusLabel;
    setBoardColumns(prev => {
      const cards = prev[colKey].cards.map((c, i) =>
        i === cardIdx ? { ...c, status: newStatus, statusLabel: STATUS_CONFIG[newStatus].label } : c
      );
      return { ...prev, [colKey]: { ...prev[colKey], cards } };
    });
    setOpenCardStatus(null);
    if (card.id) {
      updateSeleksiStatus(card.id, STATUS_TO_DB[newStatus] || newStatus)
        .then(() => { invalidate('seleksi'); showToast('Status berhasil diperbarui', `Status diubah ke ${STATUS_CONFIG[newStatus].label}`); })
        .catch(err => {
          showToast('Gagal memperbarui status', err.message || 'Coba lagi');
          setBoardColumns(prev => {
            const cards = prev[colKey].cards.map((c, i) =>
              i === cardIdx ? { ...c, status: prevStatus, statusLabel: prevStatusLabel } : c
            );
            return { ...prev, [colKey]: { ...prev[colKey], cards } };
          });
        });
    }
  };

  const toggleColCollapse = (colKey) => {
    setCollapsedCols(prev => {
      const next = new Set(prev);
      if (next.has(colKey)) next.delete(colKey); else next.add(colKey);
      return next;
    });
  };

  const ActionsBar = ({ boardMode }) => (
    <div className="lw001-toolbar-row">
      <div className="lw001-title-group">
        <h1 className="lw001-title">Lowongan</h1>
        <span className="lw001-count-text">{activeCount} lowongan</span>
      </div>
      <div className="lw001-toolbar-spacer"></div>
      <div className="lw001-right-actions">
        {!boardMode && selectedRows.size > 0 && !activeFilters.has('Arsip') && (
          <CTABulkAksi
            count={selectedRows.size}
            isOpen={showBulkDropdown}
            onToggle={() => { setShowSortDropdown(false); setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
            actions={[{ icon: <ArchiveSvg />, label: 'Arsipkan', onClick: handleBulkArchive }]}
          />
        )}
        <SortDropdown
          options={[
            { label: 'Nama (A-Z)', value: 'nama_asc' },
            { label: 'Nama (Z-A)', value: 'nama_desc' },
            { label: 'Terbaru', value: 'date_desc' },
            { label: 'Terlama', value: 'date_asc' }
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          isOpen={showSortDropdown}
          onToggleOpen={() => { setShowBulkDropdown(false); setShowFilterDropdown(false); setShowSortDropdown(v => !v); }}
        />
        <FilterDropdown
          groups={[
            { title: 'Arsip', options: ['Arsip'] },
            { title: 'Status Lowongan', options: ['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'] },
          ]}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          isOpen={showFilterDropdown}
          onToggleOpen={() => { setShowBulkDropdown(false); setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
        />
        <div className="lw001-view-toggle">
          <button className={`lw001-toggle-item${boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(true)}>
            <IconPapan /> Papan
          </button>
          <button className={`lw001-toggle-item${!boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(false)}>
            <IconList /> List
          </button>
        </div>
        <button className="lw001-btn-primary" onClick={() => setShowCreateChoice(true)}>
          <span className="lw001-btn-primary-icon">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          Buat Lowongan
        </button>
      </div>
    </div>
  );

  return (
    <div className="lw001-view" onClick={(e) => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
      if (!e.target.closest('.lw001-status-wrapper')) setOpenStatusIdx(null);
      if (!e.target.closest('.lw001-board-card-status-wrap') && !e.target.closest('.lw001-status-dropdown')) setOpenCardStatus(null);
      if (!e.target.closest('.lw001-board-card-menu-wrap') && !e.target.closest('.lw001-board-card-menu-dropdown')) setOpenCardMenu(null);
      if (!e.target.closest('.lw001-share-menu-wrap')) setOpenShareRow(null);
    }}>
      {ActionsBar({ boardMode: isBoardView })}

      {isBoardView ? (
        <div className="lw001-board-container">
          <div className="lw001-board-scroll">
            {Object.entries(boardColumns).map(([colKey, col]) => {
              const collapsed = collapsedCols.has(colKey);
              const sortedCards = [...col.cards].sort((a, b) => {
                switch (activeSort) {
                  case 'nama_asc': return (a.posisi || '').localeCompare(b.posisi || '');
                  case 'nama_desc': return (b.posisi || '').localeCompare(a.posisi || '');
                  case 'date_desc': return new Date(b.rawDate || 0) - new Date(a.rawDate || 0);
                  case 'date_asc': return new Date(a.rawDate || 0) - new Date(b.rawDate || 0);
                  default: return 0;
                }
              });
              
              return (
                <div
                  key={colKey}
                  className={`lw001-board-column${collapsed ? ' collapsed' : ''}`}
                  style={{ width: collapsed ? '48px' : '280px', flexShrink: 0, transition: 'width 0.2s' }}
                >
                  <div className="lw001-board-col-header">
                    <div className="lw001-board-col-left">
                      <span className="lw001-board-col-title">{col.title}</span>
                      {!collapsed && <span className="lw001-board-col-count">{col.cards.length}</span>}
                    </div>
                    <button className="lw001-board-col-collapse-btn" onClick={() => toggleColCollapse(colKey)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                        style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {!collapsed && (
                    <div className="lw001-board-col-cards">
                      {sortedCards.map((card, cardIdx) => {
                        const cardKey = `${colKey}-${cardIdx}`;
                        return (
                          <div
                            key={cardIdx}
                            className="lw001-board-card"
                          >
                            <div className="lw001-board-card-top">
                              <span
                                className="lw001-board-card-title"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('lowongan-detail_001', { seleksiId: card.id, jabatan: card.posisi, activeTab: card.kandidat > 0 ? 'kandidat' : 'ringkasan' })}
                              >
                                {card.posisi}
                              </span>
                              <div className="lw001-board-card-menu-wrap">
                                <button
                                  className="lw001-board-card-menu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openCardMenu?.key === cardKey) { setOpenCardMenu(null); return; }
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setOpenCardMenu({ key: cardKey, right: window.innerWidth - r.right, top: r.bottom + 4 });
                                  }}
                                >
                                  <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                                    <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                                    <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                                    <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                                  </svg>
                                </button>
                                {openCardMenu?.key === cardKey && (
                                  <div className="lw001-board-card-menu-dropdown" style={{ position: 'fixed', top: openCardMenu.top, right: openCardMenu.right }}>
                                    <button
                                      className="lw001-board-card-menu-item"
                                      onClick={(e) => { e.stopPropagation(); archiveCard(colKey, cardIdx); }}
                                    >
                                      <ArchiveSvg /> Arsipkan
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="lw001-board-card-dept">{card.dept}</span>
                            <span className="lw001-board-card-loc">{card.lokasi}</span>
                            <div className="lw001-board-card-footer">
                              <div className="lw001-board-card-status-wrap">
                                <button
                                  className={`lw001-board-card-badge ${card.status}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openCardStatus?.key === cardKey) { setOpenCardStatus(null); return; }
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setOpenCardStatus({ key: cardKey, left: r.left, bottom: r.bottom });
                                  }}
                                >
                                  {card.statusLabel}
                                  <svg width="6" height="4" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 1L5 5L9 1" />
                                  </svg>
                                </button>
                                {openCardStatus?.key === cardKey && (
                                  <div
                                    className="lw001-status-dropdown active"
                                    style={{ position: 'fixed', top: openCardStatus.bottom + 4, left: openCardStatus.left, bottom: 'auto' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {statusConfigEntries.map(([key, s]) => (
                                      <div
                                        key={key}
                                        className="lw001-status-dropdown-item"
                                        data-status={key}
                                        onClick={(e) => { e.stopPropagation(); updateCardStatus(colKey, cardIdx, key); }}
                                      >
                                        <div className="lw001-icon-wrapper"><img src={s.icon} /></div>
                                        {s.label}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button className="lw001-board-card-detail-btn" disabled={card.arsip} onClick={card.arsip ? undefined : () => navigate('lowongan-detail_001', { seleksiId: card.id, jabatan: card.posisi, activeTab: card.kandidat > 0 ? 'kandidat' : 'ringkasan' })} style={card.arsip ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>Detail</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="lw001-table-container">
          <table className="lw001-table">
            <thead>
              <tr>
                <th width="24"><input type="checkbox" className="lw001-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
                <th width="184">Posisi</th>
                <th width="110">Level</th>
                <th width="130">Departemen</th>
                <th width="120">Lokasi</th>
                <th width="145">Status</th>
                <th width="124">Tahap Rekrutmen</th>
                <th width="134">Jumlah Kandidat</th>
                <th width="106">Tanggal Dibuat</th>
                <th width="128">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Memuat data lowongan...</td></tr>
              ) : pagedRows.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                  {filterArchiveOnly ? 'Tidak ada lowongan yang diarsipkan.' : 'Belum ada lowongan pekerjaan.'}
                </td></tr>
              ) : pagedRows.map((row) => {
                const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.rencana;
                return (
                  <tr key={row.id} className={row.arsip ? 'lw001-row-archived' : ''}>
                    <td><input type="checkbox" className="lw001-checkbox lw001-row-checkbox" checked={selectedRows.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                    <td
                      className={`lw001-posisi${row.arsip ? '' : ' clickable'}`}
                      onClick={row.arsip ? undefined : () => navigate('lowongan-detail_001', { seleksiId: row.id, jabatan: row.posisi, activeTab: row.kandidat > 0 ? 'kandidat' : 'ringkasan' })}
                      style={row.arsip ? { cursor: 'default', opacity: 0.5 } : {}}
                    >{row.posisi}</td>
                    <td>{row.levelJabatan}</td>
                    <td>{row.dept}</td>
                    <td>{row.lokasi}</td>
                    <td>
                      {row.arsip ? (
                        <div className="lw001-status-bubble rencana" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                          <div className="lw001-status-content">
                            <div className="lw001-icon-wrapper"><img src={cfg.icon} /></div>
                            <span className="lw001-status-text">{cfg.label}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="lw001-status-wrapper" onClick={(e) => { e.stopPropagation(); setOpenStatusIdx(openStatusIdx === row.id ? null : row.id); }}>
                          <div className={`lw001-status-bubble ${row.status}`}>
                            <div className="lw001-status-content">
                              <div className="lw001-icon-wrapper"><img src={cfg.icon} /></div>
                              <span className="lw001-status-text">{cfg.label}</span>
                            </div>
                            <svg className="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          {openStatusIdx === row.id && (
                            <div className="lw001-status-dropdown active">
                              {statusConfigEntries.map(([key, s]) => (
                                <div key={key} className="lw001-status-dropdown-item" data-status={key} onClick={(e) => { e.stopPropagation(); updateStatus(row.id, key); }}>
                                  <div className="lw001-icon-wrapper"><img src={s.icon} /></div> {s.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{row.alur}</td>
                    <td><div className="lw001-kandidat-badge">{row.kandidat}</div></td>
                    <td>{row.tanggal}</td>
                    <td>
                      {row.arsip ? (
                        <div className="lw001-actions">
                          <button className="lw001-btn-outline btn-show" onClick={() => setUnarchiveTarget(row)}>
                            Tampilkan
                          </button>
                        </div>
                      ) : (
                        <div className="lw001-icon-actions">
                          <button
                            className="lw001-iaction-btn"
                            disabled={row.status !== 'aktif'}
                            onClick={() => handleViewLaman(row)}
                          >
                            <span className="lw001-iaction-tip">
                              {row.status === 'aktif' ? 'Lihat Laman Karier' : 'Aktifkan status dulu untuk buka laman karier'}
                            </span>
                            <IconEye />
                          </button>

                          <div className="lw001-share-menu-wrap">
                            <button
                              className="lw001-iaction-btn"
                              disabled={row.status !== 'aktif'}
                              onClick={() => setOpenShareRow(openShareRow === row.id ? null : row.id)}
                            >
                              <span className="lw001-iaction-tip">
                                {row.status === 'aktif' ? 'Bagikan Laman Karier' : 'Aktifkan status dulu untuk bagikan'}
                              </span>
                              <IconShare />
                            </button>

                            {openShareRow === row.id && (
                              <div className="lw001-share-menu" onClick={(e) => e.stopPropagation()}>
                                <div className="lw001-share-eyebrow">Bagikan Laman Karier</div>
                                <div className="lw001-share-linkcard">
                                  <span className="lw001-share-linkcard-url">{buildKaririUrl(row)}</span>
                                  <button className="lw001-share-linkcard-copy" onClick={() => handleShare('copy', row)}>
                                    <IconLink />
                                    Salin
                                  </button>
                                </div>
                                <div className="lw001-share-divider" />
                                <div className="lw001-share-grid">
                                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                                    <button key={key} className="lw001-share-gridbtn" onClick={() => handleShare(key, row)}>
                                      <span className="lw001-share-gridbtn-icon"><Icon /></span>
                                      <span className="lw001-share-gridbtn-label">{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <button className="lw001-iaction-btn danger" onClick={() => handleRowArchive(row)}>
                            <span className="lw001-iaction-tip">Arsipkan Posisi</span>
                            <ArchiveSvg style={{ marginRight: 0, width: 14, height: 14 }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isBoardView && (
        <Pagination
          page={page}
          total={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        />
      )}

      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={archiveModal.onConfirm}
          onClose={() => setArchiveModal(null)}
        />
      )}

      {unarchiveTarget && (
        <PopupKonfirmasi
          title="Tampilkan Posisi"
          body={`Tampilkan kembali posisi "${unarchiveTarget.posisi}"? Status akan diubah ke aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={handleUnarchiveConfirm}
          onClose={() => setUnarchiveTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}

      {showCreateChoice && (
        <PopupPilihanBuatLowongan
          onClose={() => setShowCreateChoice(false)}
          onPilihPanduan={() => { setShowCreateChoice(false); navigate('buat-lowongan-panduan_001'); }}
          onPilihForm={() => { setShowCreateChoice(false); navigate('setup-penilaian_001'); }}
        />
      )}
    </div>
  );
}
