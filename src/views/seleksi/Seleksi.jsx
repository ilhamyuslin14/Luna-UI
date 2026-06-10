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
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Toast from '../../components/Toast.jsx';

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

const ArchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5 }}>
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

export default function Seleksi({ navigate, searchQuery = '' }) {
  const { companyId } = useAuth();
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
  const toastTimer = useRef(null);
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

      const [data, kandCountMap, maxMap, alur] = await Promise.all([
        getSeleksi(companyId, { showArchived, showAll }),
        getKandidatCountBySeleksi(companyId),
        getMaxAlurBySeleksi(companyId),
        getAlurSeleksi(companyId),
      ]);

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
          dept: item.departments?.name || '-',
          lokasi: item.lokasi || '-',
          alur: alurNama,
          kandidat: kandCountMap[item.id] || 0,
          upahMin: item.upah_min || '-',
          upahMaks: item.upah_maks || '-',
          tanggal: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawDate: item.created_at,
          status: STATUS_NORMALIZE[item.status] || 'rencana',
          arsip: item.arsip || false,
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
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: newStatus } : r));
    setOpenStatusIdx(null);
    updateSeleksiStatus(rowId, STATUS_TO_DB[newStatus] || newStatus)
      .then(() => showToast('Status berhasil diperbarui', `Status diubah ke ${label}`))
      .catch(err => {
        showToast('Gagal memperbarui status', err.message);
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: r.status } : r));
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

  const handleRowArchive = (row) => {
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: `Apakah Anda yakin ingin mengarsipkan posisi "${row.posisi}"?`,
      onConfirm: async () => {
        try {
          await archiveSeleksi(row.id);
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
      showToast('Gagal', 'Terjadi kesalahan saat memindahkan status.', 'error');
    }

    draggedCard.current = null;
  };

  const updateCardStatus = (colKey, cardIdx, newStatus) => {
    const card = boardColumns[colKey].cards[cardIdx];
    setBoardColumns(prev => {
      const cards = prev[colKey].cards.map((c, i) =>
        i === cardIdx ? { ...c, status: newStatus, statusLabel: STATUS_CONFIG[newStatus].label } : c
      );
      return { ...prev, [colKey]: { ...prev[colKey], cards } };
    });
    setOpenCardStatus(null);
    if (card.id) {
      updateSeleksiStatus(card.id, STATUS_TO_DB[newStatus] || newStatus)
        .then(() => showToast('Status berhasil diperbarui', `Status diubah ke ${STATUS_CONFIG[newStatus].label}`))
        .catch(() => showToast('Gagal memperbarui status', 'Coba lagi'));
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
    <div className="lw-actions-bar">
      <div className="lw-left-actions">
        <button className="lw-btn-primary" onClick={() => navigate('setup-penilaian')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg> Setup Penilaian
        </button>
      </div>
      <div className="lw-right-actions">
        <div className="lw-stats-badge">Jumlah Posisi : <strong>{activeCount}</strong></div>
        <div className="lw-divider"></div>
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
            { title: 'Status Rekrutmen', options: ['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'] },
          ]}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          isOpen={showFilterDropdown}
          onToggleOpen={() => { setShowBulkDropdown(false); setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
        />
        <div className="lw-view-toggle">
          <button className={`lw-toggle-item${boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(true)}>
            <img src="/assets/frame1000006975.svg" /> Papan
          </button>
          <button className={`lw-toggle-item${!boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(false)}>
            <img src="/assets/fi_16116710.svg" /> List
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lw-view" onClick={(e) => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
      if (!e.target.closest('.lw-status-wrapper')) setOpenStatusIdx(null);
      if (!e.target.closest('.lw-board-card-status-wrap') && !e.target.closest('.lw-status-dropdown')) setOpenCardStatus(null);
      if (!e.target.closest('.lw-board-card-menu-wrap') && !e.target.closest('.lw-board-card-menu-dropdown')) setOpenCardMenu(null);
    }}>
      <div className="lw-header-container">
        <h1 className="lw-title">Seleksi</h1>
      </div>

      {ActionsBar({ boardMode: isBoardView })}

      {isBoardView ? (
        <div className="lw-board-container">
          <div className="lw-board-scroll">
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
                  className="lw-board-col"
                  style={{ width: collapsed ? '48px' : '280px', flexShrink: 0, transition: 'width 0.2s' }}
                >
                  <div className="lw-board-col-header">
                    <div className="lw-board-col-left">
                      <span className="lw-board-col-title">{col.title}</span>
                      {!collapsed && <span className="lw-board-col-count">{col.cards.length}</span>}
                    </div>
                    <button className="lw-board-col-collapse-btn" onClick={() => toggleColCollapse(colKey)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                        style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {!collapsed && (
                    <div className="lw-board-col-cards">
                      {sortedCards.map((card, cardIdx) => {
                        const cardKey = `${colKey}-${cardIdx}`;
                        return (
                          <div
                            key={cardIdx}
                            className="lw-board-card"
                          >
                            <div className="lw-board-card-top">
                              <span
                                className="lw-board-card-title"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('seleksi-detail', { jabatan: card.posisi, activeTab: card.kandidat > 0 ? 'kandidat' : 'ringkasan' })}
                              >
                                {card.posisi}
                              </span>
                              <div className="lw-board-card-menu-wrap">
                                <button
                                  className="lw-board-card-menu"
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
                                  <div className="lw-board-card-menu-dropdown" style={{ position: 'fixed', top: openCardMenu.top, right: openCardMenu.right }}>
                                    <button
                                      className="lw-board-card-menu-item"
                                      onClick={(e) => { e.stopPropagation(); archiveCard(colKey, cardIdx); }}
                                    >
                                      <ArchiveSvg /> Arsipkan
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="lw-board-card-dept">{card.dept}</span>
                            <span className="lw-board-card-loc">{card.lokasi}</span>
                            <div className="lw-board-card-footer">
                              <div className="lw-board-card-status-wrap">
                                <button
                                  className={`lw-board-card-badge ${card.status}`}
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
                                    className="lw-status-dropdown active"
                                    style={{ position: 'fixed', top: openCardStatus.bottom + 4, left: openCardStatus.left, bottom: 'auto' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                                      <div
                                        key={key}
                                        className="lw-status-dropdown-item"
                                        data-status={key}
                                        onClick={(e) => { e.stopPropagation(); updateCardStatus(colKey, cardIdx, key); }}
                                      >
                                        <div className="lw-icon-wrapper"><img src={s.icon} /></div>
                                        {s.label}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button className="lw-board-card-detail-btn" disabled={card.arsip} onClick={card.arsip ? undefined : () => navigate('seleksi-detail', { jabatan: card.posisi, activeTab: card.kandidat > 0 ? 'kandidat' : 'ringkasan' })} style={card.arsip ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>Detail</button>
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
        <div className="lw-table-container">
          <table className="lw-table">
            <thead>
              <tr>
                <th width="24"><input type="checkbox" className="lw-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
                <th width="184">Posisi</th>
                <th width="130">Departemen</th>
                <th width="120">Lokasi</th>
                <th width="145">Status</th>
                <th width="124">Alur Seleksi</th>
                <th width="134">Jumlah Kandidat</th>
                <th width="108">Upah Min</th>
                <th width="100">Upah Maks</th>
                <th width="106">Tanggal Dibuat</th>
                <th width="83">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td></tr>
              ) : pagedRows.length === 0 ? (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                  {filterArchiveOnly ? 'Tidak ada posisi yang diarsipkan.' : 'Belum ada posisi seleksi.'}
                </td></tr>
              ) : pagedRows.map((row) => {
                const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.rencana;
                return (
                  <tr key={row.id} className={row.arsip ? 'lw-row-archived' : ''}>
                    <td><input type="checkbox" className="lw-checkbox lw-row-checkbox" checked={selectedRows.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                    <td
                      className={`lw-posisi${row.arsip ? '' : ' clickable'}`}
                      onClick={row.arsip ? undefined : () => navigate('seleksi-detail', { jabatan: row.posisi, activeTab: row.kandidat > 0 ? 'kandidat' : 'ringkasan' })}
                      style={row.arsip ? { cursor: 'default', opacity: 0.5 } : {}}
                    >{row.posisi}</td>
                    <td>{row.dept}</td>
                    <td>{row.lokasi}</td>
                    <td>
                      {row.arsip ? (
                        <div className="lw-status-bubble rencana" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                          <div className="lw-status-content">
                            <div className="lw-icon-wrapper"><img src={cfg.icon} /></div>
                            <span className="lw-status-text">{cfg.label}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="lw-status-wrapper" onClick={(e) => { e.stopPropagation(); setOpenStatusIdx(openStatusIdx === row.id ? null : row.id); }}>
                          <div className={`lw-status-bubble ${row.status}`}>
                            <div className="lw-status-content">
                              <div className="lw-icon-wrapper"><img src={cfg.icon} /></div>
                              <span className="lw-status-text">{cfg.label}</span>
                            </div>
                            <svg className="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          {openStatusIdx === row.id && (
                            <div className="lw-status-dropdown active">
                              {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                                <div key={key} className="lw-status-dropdown-item" data-status={key} onClick={(e) => { e.stopPropagation(); updateStatus(row.id, key); }}>
                                  <div className="lw-icon-wrapper"><img src={s.icon} /></div> {s.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{row.alur}</td>
                    <td><div className="lw-kandidat-badge">{row.kandidat}</div></td>
                    <td>{row.upahMin}</td>
                    <td>{row.upahMaks}</td>
                    <td>{row.tanggal}</td>
                    <td>
                      <div className="lw-actions">
                        {row.arsip ? (
                          <button className="lw-btn-outline btn-show" onClick={() => setUnarchiveTarget(row)}>
                            Tampilkan
                          </button>
                        ) : (
                          <button className="lw-btn-outline btn-archive" onClick={() => handleRowArchive(row)}>
                            <ArchiveSvg /> Arsipkan
                          </button>
                        )}
                      </div>
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
    </div>
  );
}
