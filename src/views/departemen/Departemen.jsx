import { useState, useRef, useEffect } from 'react';
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDepartments, createDepartment, archiveDepartment, unarchiveDepartment } from '../../services/departmentService.js';

const ArchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const UnarchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5, transform: 'rotate(180deg)' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

export default function Departemen({ navigate, searchQuery = '' }) {
  const { companyId } = useAuth();
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('nama_asc');
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const fetchDepts = () => {
    const bothOn = activeFilters.has('Arsip') && activeFilters.has('Aktif');
    const archiveOnly = activeFilters.has('Arsip') && !activeFilters.has('Aktif');
    setLoading(true);
    getDepartments({ showArchived: archiveOnly, showAll: bothOn })
      .then(data => setDeptData(data))
      .catch(() => showToast('Gagal memuat data', 'Terjadi kesalahan saat memuat departemen'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const bothOn = activeFilters.has('Arsip') && activeFilters.has('Aktif');
    const archiveOnly = activeFilters.has('Arsip') && !activeFilters.has('Aktif');
    setShowArchived(archiveOnly || bothOn);
    setPage(1);
    fetchDepts();
  }, [activeFilters]);

  let filteredData = deptData;
  if (searchQuery.trim()) {
    const sq = searchQuery.toLowerCase().trim();
    filteredData = filteredData.filter(d => 
      (d.name || '').toLowerCase().includes(sq)
    );
  }

  filteredData = [...filteredData].sort((a, b) => {
    switch (activeSort) {
      case 'nama_asc': return (a.name || '').localeCompare(b.name || '');
      case 'nama_desc': return (b.name || '').localeCompare(a.name || '');
      case 'date_desc': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'date_asc': return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pagedData  = filteredData.slice((page - 1) * perPage, page * perPage);

  const [showAddModal, setShowAddModal] = useState(false);
  const [namaInput, setNamaInput]       = useState('');
  const [deskripsiInput, setDeskripsiInput] = useState('');

  const [archiveTarget, setArchiveTarget]   = useState(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState(null);
  const [toast, setToast]                   = useState(null);
  const toastTimer                          = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const selectAll = pagedData.length > 0 && pagedData.every(d => selectedRows.has(d.id));
  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (selectAll) pagedData.forEach(d => next.delete(d.id));
    else           pagedData.forEach(d => next.add(d.id));
    setSelectedRows(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const handleBulkArchive = () => {
    if (selectedRows.size === 0) return;
    setArchiveTarget('bulk');
  };

  const openAddModal = () => {
    setNamaInput('');
    setDeskripsiInput('');
    setShowAddModal(true);
  };

  const handleSimpan = async () => {
    if (!namaInput.trim() || !companyId) return;
    try {
      await createDepartment(companyId, { name: namaInput.trim(), description: deskripsiInput.trim() });
      showToast('Berhasil', 'Departemen baru telah ditambahkan');
      setShowAddModal(false);
      fetchDepts();
    } catch {
      showToast('Gagal menyimpan', 'Terjadi kesalahan saat menambah departemen');
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      if (archiveTarget === 'bulk') {
        await Promise.all([...selectedRows].map(id => archiveDepartment(id)));
        showToast(`${selectedRows.size} departemen diarsipkan`, 'Data dipindahkan ke arsip');
        setSelectedRows(new Set());
        setShowBulkDropdown(false);
      } else {
        await archiveDepartment(archiveTarget.id);
        showToast('Departemen diarsipkan', 'Data dipindahkan ke arsip');
      }
      fetchDepts();
    } catch {
      showToast('Gagal', 'Terjadi kesalahan saat mengarsipkan');
    }
    setArchiveTarget(null);
  };

  const handleUnarchiveConfirm = async () => {
    try {
      if (unarchiveTarget === 'bulk') {
        await Promise.all([...selectedRows].map(id => unarchiveDepartment(id)));
        showToast(`${selectedRows.size} departemen ditampilkan`, 'Status diubah ke aktif');
        setSelectedRows(new Set());
        setShowBulkDropdown(false);
      } else {
        await unarchiveDepartment(unarchiveTarget.id);
        showToast('Departemen ditampilkan kembali', 'Status diubah ke aktif');
      }
      fetchDepts();
    } catch {
      showToast('Gagal', 'Terjadi kesalahan saat menampilkan departemen');
    }
    setUnarchiveTarget(null);
  };

  return (
    <div className="dept-view" onClick={(e) => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
    }}>
      <div className="dept-header-container">
        <h1 className="dept-title">Departemen</h1>
      </div>

      <div className="dept-body">
        <div className="dept-actions-bar">
          <div className="dept-left-actions">
            <button className="dept-btn-primary" onClick={openAddModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg> Tambah Departemen
            </button>
          </div>
          <div className="dept-right-actions">
            <div className="dept-stats-badge">Jumlah Departemen : <strong>{deptData.length}</strong></div>
            <div className="dept-divider" />
            {selectedRows.size > 0 && (
              <CTABulkAksi
                count={selectedRows.size}
                isOpen={showBulkDropdown}
                onToggle={() => { setShowSortDropdown(false); setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
                actions={
                  showArchived ? [
                    { icon: <UnarchiveSvg />, label: 'Tampilkan', onClick: () => { setShowBulkDropdown(false); setUnarchiveTarget('bulk'); } },
                  ] : [
                    { icon: <ArchiveSvg />, label: 'Arsipkan', onClick: handleBulkArchive },
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
              onToggleOpen={() => { setShowBulkDropdown(false); setShowFilterDropdown(false); setShowSortDropdown(v => !v); }}
            />
            <FilterDropdown
              groups={[{ title: 'Status', options: ['Arsip'] }]}
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              isOpen={showFilterDropdown}
              onToggleOpen={() => { setShowBulkDropdown(false); setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
            />
          </div>
        </div>

        <div className="dept-table-container">
          <table className="dept-table">
            <thead>
              <tr>
                <th width="3%"><input type="checkbox" className="dept-checkbox-all" checked={selectAll} onChange={toggleSelectAll} disabled={pagedData.length === 0 || loading} /></th>
                <th width="27%">Departemen</th>
                <th width="15%">Total Posisi</th>
                <th width="25%">Kontak</th>
                <th width="30%">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Dibuat Pada</span>
                    <span style={{ marginRight: '70px' }}>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td></tr>
              ) : pagedData.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {showArchived ? 'Tidak ada departemen yang diarsipkan.' : 'Belum ada departemen. Silakan tambah baru.'}
                </td></tr>
              ) : pagedData.map((dept) => {
                const dateObj = new Date(dept.created_at);
                const displayDate = isNaN(dateObj) ? '-' : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <tr key={dept.id} className={dept.status === 'arsip' ? 'dept-row-archived' : ''}>
                    <td><input type="checkbox" className="dept-checkbox row-checkbox" checked={selectedRows.has(dept.id)} onChange={() => toggleRow(dept.id)} /></td>
                    <td className="dept-name" onClick={() => navigate && navigate('departemen-detail', { departemen: dept.name })} style={{ cursor: 'pointer' }}>{dept.name}</td>
                    <td>
                      <span style={{ background: '#eef7fd', color: '#0977be', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dept.totalPosisi ?? 0}
                      </span>
                    </td>
                    <td>{dept.contact || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{displayDate}</span>
                        <div className="dept-actions">
                          {dept.status === 'arsip' ? (
                            <button className="dept-btn-outline" onClick={() => setUnarchiveTarget(dept)}>
                              <UnarchiveSvg /> Tampilkan
                            </button>
                          ) : (
                            <button className="dept-btn-outline btn-archive" onClick={() => setArchiveTarget(dept)}>
                              <ArchiveSvg /> Arsipkan
                            </button>
                          )}
                        </div>
                      </div>
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
      </div>

      {/* Modal: Tambah Departemen */}
      {showAddModal && (
        <div className="dept-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dept-modal dept-modal-add" onClick={e => e.stopPropagation()}>
            <p className="dept-modal-title">Tambah Departemen</p>
            <div className="dept-modal-form">
              <div className="dept-modal-field">
                <div className="dept-modal-label-group">
                  <p className="dept-modal-label">Nama Departemen <span style={{ color: '#ef4444' }}>*</span></p>
                  <p className="dept-modal-hint">Pastikan jabatan telah sesuai. Contoh: Marketing, Accountant, dll</p>
                </div>
                <input className="dept-modal-input" placeholder="Isi Nama Departemen" value={namaInput} onChange={e => setNamaInput(e.target.value)} />
              </div>
              <div className="dept-modal-field">
                <div className="dept-modal-label-group">
                  <p className="dept-modal-label">Deskripsi <span style={{ color: '#9aa3b0', fontWeight: 400, marginLeft: 4 }}>(Opsional)</span></p>
                </div>
                <textarea className="dept-modal-textarea" placeholder="Masukan Deskripsi Singkat" value={deskripsiInput} onChange={e => setDeskripsiInput(e.target.value)} />
              </div>
            </div>
            <div className="dept-modal-footer dept-modal-footer-end">
              <button className="dept-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Batal</button>
              <button className="dept-modal-btn-primary" onClick={handleSimpan}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {archiveTarget !== null && (
        <PopupKonfirmasi
          title="Arsipkan Departemen"
          body={archiveTarget === 'bulk'
            ? `Apakah Anda yakin ingin mengarsipkan ${selectedRows.size} departemen yang dipilih?`
            : `Apakah Anda yakin ingin mengarsipkan departemen "${archiveTarget.name}"?`}
          confirmLabel="Arsipkan"
          onConfirm={handleArchiveConfirm}
          onClose={() => setArchiveTarget(null)}
        />
      )}

      {unarchiveTarget !== null && (
        <PopupKonfirmasi
          title="Tampilkan Departemen"
          body={unarchiveTarget === 'bulk'
            ? `Apakah Anda yakin ingin menampilkan ${selectedRows.size} departemen yang dipilih?`
            : `Tampilkan kembali departemen "${unarchiveTarget.name}"? Status akan diubah ke aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={handleUnarchiveConfirm}
          onClose={() => setUnarchiveTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
