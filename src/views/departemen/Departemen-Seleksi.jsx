import { useState, useEffect, useRef } from 'react';
import BackButton from '../../components/BackButton.jsx';
import Toast from '../../components/Toast.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Pagination from '../../components/Pagination.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksi, updateSeleksiStatus, getKandidatCountBySeleksi, getMaxAlurBySeleksi, archiveSeleksi, unarchiveSeleksi } from '../../services/seleksiService.js';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import { getAlurSeleksi, DEFAULT_ALUR, alurNamaByLevel } from '../../services/alurSeleksiService.js';

const ArchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const fmtUpah = (val) => {
  if (!val) return '-';
  const n = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? '-' : 'Rp ' + n.toLocaleString('id-ID');
};

const fmtTanggal = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS_NORMALIZE = {
  'Aktif': 'aktif', 'aktif': 'aktif',
  'Rencana': 'rencana', 'rencana': 'rencana',
  'Ditahan': 'ditahan', 'ditahan': 'ditahan',
  'Selesai': 'selesai', 'selesai': 'selesai',
  'Dibatalkan': 'dibatalkan', 'dibatalkan': 'dibatalkan',
};

const STATUS_CONFIG = {
  rencana: { icon: '/assets/status/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status/status_dibatalkan.svg', label: 'Dibatalkan' },
};


export default function DepartemenSeleksi({ navigate, onBack, departemen }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const statusConfigEntries = isFreePlan
    ? Object.entries(STATUS_CONFIG).filter(([key]) => key === 'rencana' || key === 'aktif')
    : Object.entries(STATUS_CONFIG);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openStatusIdx, setOpenStatusIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('nama_asc');
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [archiveModal, setArchiveModal] = useState(null);
  const [unarchiveModal, setUnarchiveModal] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);

  useEffect(() => {
    async function loadData() {
      if (!companyId) return;
      try {
        setIsLoading(true);
        const [data, kandCountMap, maxAlurMap, alur] = await Promise.all([
          getSeleksi(companyId, { showAll: true }),
          getKandidatCountBySeleksi(companyId),
          getMaxAlurBySeleksi(companyId),
          getAlurSeleksi(companyId),
        ]);
        setAlurList(alur);
        
        let rawData = data || [];
        if (departemen) {
          rawData = rawData.filter(s => {
            const deptName = s.departments?.name || s.departemen || '';
            return deptName.toLowerCase() === departemen.toLowerCase();
          });
        }

        const mapped = rawData.map(s => {
          const maxLevel = maxAlurMap[s.id];
          const alurNama = maxLevel != null
            ? (alurNamaByLevel(alur, maxLevel) || 'Belum ada kandidat')
            : 'Belum ada kandidat';
          return {
            id: s.id,
            posisi: s.jabatan || '-',
            dept: s.departments?.name || s.departemen || '-',
            lokasi: s.lokasi || '-',
            status: STATUS_NORMALIZE[s.status] || 'rencana',
            alur: alurNama,
            kandidat: kandCountMap[s.id] || 0,
            upahMin: fmtUpah(s.upah_min),
            upahMaks: fmtUpah(s.upah_maks),
            upahMaks: fmtUpah(s.upah_maks),
            tanggal: fmtTanggal(s.created_at),
            rawDate: s.created_at,
            arsip: s.arsip || false,
          };
        });
        setRows(mapped);
      } catch (err) {
        console.error('Error loading seleksi:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setPage(1);
  };

  let filteredRows = rows;

  if (activeFilters.has('Arsip')) {
    filteredRows = filteredRows.filter(r => r.arsip === true);
  } else {
    filteredRows = filteredRows.filter(r => !r.arsip);
  }

  const statusPosisiOpts = ['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'];
  const activeStatusPosisi = statusPosisiOpts.filter(f => activeFilters.has(f));
  if (activeStatusPosisi.length > 0) {
    filteredRows = filteredRows.filter(r => {
      const statusLabel = STATUS_CONFIG[r.status]?.label;
      return activeStatusPosisi.includes(statusLabel);
    });
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

  const selectAll = pagedRows.length > 0 && pagedRows.every(r => selectedRows.has(r.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (selectAll) pagedRows.forEach(r => next.delete(r.id));
    else           pagedRows.forEach(r => next.add(r.id));
    setSelectedRows(next);
  };

  const toggleRow = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedRows(next);
  };

  const STATUS_TO_DB = {
    rencana: 'Rencana', aktif: 'Aktif', ditahan: 'Ditahan',
    selesai: 'Selesai', dibatalkan: 'Dibatalkan',
  };

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const updateStatus = (rowId, newStatus) => {
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    const prevStatus = rows.find(r => r.id === rowId)?.status;
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: newStatus } : r));
    setOpenStatusIdx(null);
    updateSeleksiStatus(rowId, STATUS_TO_DB[newStatus] || newStatus)
      .then(() => showToast('Status berhasil diperbarui', `Status diubah ke ${label}`))
      .catch(err => {
        console.error('Gagal update status seleksi:', err);
        showToast('Gagal memperbarui status', err.message);
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: prevStatus } : r));
      });
  };


  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      onClick={(e) => {
        if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
        if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
        if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
        if (!e.target.closest('.lw-status-wrapper')) setOpenStatusIdx(null);
      }}
    >
      {/* Actions Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e5ec', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '64px', flexShrink: 0 }}>
        {onBack && (
          <BackButton onClick={onBack} />
        )}
        <div className="lw-right-actions">
          <div className="lw-stats-badge">Jumlah Posisi : <strong>{filteredRows.length}</strong></div>
          <div className="lw-divider" />
          {selectedRows.size > 0 && (
            <CTABulkAksi
              count={selectedRows.size}
              isOpen={showBulkDropdown}
              onToggle={(e) => { e?.stopPropagation(); setShowSortDropdown(false); setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
              actions={
                activeFilters.has('Arsip') ? [
                  {
                    icon: <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ transform: 'rotate(180deg)' }}><path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" /></svg>,
                    label: 'Tampilkan',
                    onClick: () => {
                      setShowBulkDropdown(false);
                      setUnarchiveModal({ isBulk: true });
                    }
                  }
                ] : [
                  {
                    icon: <ArchiveSvg />,
                    label: 'Arsipkan',
                    onClick: () => {
                      setShowBulkDropdown(false);
                      setArchiveModal({
                        ids: [...selectedRows],
                        title: 'Arsipkan Posisi',
                        body: `Apakah Anda yakin ingin mengarsipkan ${selectedRows.size} posisi yang dipilih?`,
                      });
                    },
                  }
                ]
              }
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
            onToggleOpen={(e) => { e?.stopPropagation(); setShowBulkDropdown(false); setShowFilterDropdown(false); setShowSortDropdown(v => !v); }}
          />
          <FilterDropdown
            groups={[
              { title: 'Status', options: ['Arsip'] },
              { title: 'Status Posisi', options: ['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'] },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={(e) => { e?.stopPropagation(); setShowBulkDropdown(false); setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="lw-table-container" style={{ flex: 1 }}>
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
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="11" style={{ textAlign: 'center', padding: 24, color: '#888' }}>Memuat data...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan="11" style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                {activeFilters.has('Arsip') ? 'Tidak ada posisi yang diarsipkan.' : 'Belum ada posisi seleksi.'}
              </td></tr>
            ) : pagedRows.map((row) => {
              const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.rencana;
              return (
                <tr key={row.id} className={row.arsip ? 'lw-row-archived' : ''}>
                  <td><input type="checkbox" className="lw-checkbox lw-row-checkbox" checked={selectedRows.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                  <td
                    className={`lw-posisi${row.arsip ? '' : ' clickable'}`}
                    onClick={row.arsip ? undefined : () => navigate('seleksi-detail', { seleksiId: row.id, jabatan: row.posisi, activeTab: row.kandidat > 0 ? 'kandidat' : 'ringkasan' })}
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
                          <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        {openStatusIdx === row.id && (
                          <div className="lw-status-dropdown active">
                            {statusConfigEntries.map(([key, s]) => (
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
                    {row.arsip ? (
                      <button className="lw-btn-outline" onClick={() => {
                        setUnarchiveModal({
                          id: row.id,
                          posisi: row.posisi
                        });
                      }}>
                        <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5, transform: 'rotate(180deg)' }}>
                          <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
                        </svg>
                        Tampilkan
                      </button>
                    ) : (
                      <button className="lw-btn-outline btn-archive" onClick={() => {
                        setArchiveModal({
                          ids: [row.id],
                          title: 'Arsipkan Posisi',
                          body: `Apakah Anda yakin ingin mengarsipkan posisi "${row.posisi}"?`,
                        });
                      }}>
                        <ArchiveSvg /> Arsipkan
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={totalPages}
        perPage={perPage}
        onPageChange={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
        onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
      />
      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={async () => {
            setArchiveModal(null);
            try {
              await Promise.all(archiveModal.ids.map(id => archiveSeleksi(id)));
              setRows(prev => prev.map(r => archiveModal.ids.includes(r.id) ? { ...r, arsip: true } : r));
              setSelectedRows(new Set());
              showToast('Berhasil diarsipkan', `${archiveModal.ids.length} posisi dipindahkan ke arsip`);
            } catch {
              showToast('Gagal mengarsipkan', 'Terjadi kesalahan, coba lagi');
            }
          }}
          onClose={() => setArchiveModal(null)}
        />
      )}
      {unarchiveModal && (
        <PopupKonfirmasi
          title="Tampilkan Posisi"
          body={unarchiveModal.isBulk
            ? `Apakah Anda yakin ingin menampilkan ${selectedRows.size} posisi yang dipilih?`
            : `Tampilkan kembali posisi "${unarchiveModal.posisi}"? Status akan diubah ke aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={async () => {
            if (unarchiveModal.isBulk) {
              const ids = [...selectedRows];
              setUnarchiveModal(null);
              try {
                await Promise.all(ids.map(id => unarchiveSeleksi(id)));
                setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, arsip: false } : r));
                setSelectedRows(new Set());
                showToast('Posisi ditampilkan', `${ids.length} posisi kembali aktif`);
              } catch {
                showToast('Gagal menampilkan', 'Terjadi kesalahan, coba lagi');
              }
            } else {
              const { id, posisi } = unarchiveModal;
              setUnarchiveModal(null);
              try {
                await unarchiveSeleksi(id);
                setRows(prev => prev.map(r => r.id === id ? { ...r, arsip: false } : r));
                showToast('Posisi ditampilkan', `${posisi} kembali aktif`);
              } catch {
                showToast('Gagal menampilkan', 'Terjadi kesalahan, coba lagi');
              }
            }
          }}
          onClose={() => setUnarchiveModal(null)}
        />
      )}
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
