import { useState } from 'react';

const ArchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const DeleteSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" style={{ marginRight: 4.5 }}>
    <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor" />
    <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor" />
    <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor" />
  </svg>
);

const INITIAL_DATA = [
  { name: 'HR', totalPosisi: 5, lowongan: 'Backend Engineer', tanggal: '19 Feb 2026', canDelete: true },
  { name: 'Engineering', totalPosisi: 12, lowongan: 'Frontend Developer', tanggal: '19 Feb 2026', canDelete: false },
  { name: 'Marketing', totalPosisi: 3, lowongan: 'Social Media Lead', tanggal: '19 Feb 2026', canDelete: false },
  { name: 'Finance', totalPosisi: 4, lowongan: 'Head of Finance', tanggal: '19 Feb 2026', canDelete: true },
  { name: 'Product', totalPosisi: 8, lowongan: 'UX Researcher', tanggal: '19 Feb 2026', canDelete: true },
];

export default function Departemen({ navigate }) {
  const [deptData, setDeptData] = useState(INITIAL_DATA);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [namaInput, setNamaInput] = useState('');
  const [deskripsiInput, setDeskripsiInput] = useState('');

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectAll = selectedRows.size === deptData.length;

  const toggleSelectAll = () => {
    if (selectAll) setSelectedRows(new Set());
    else setSelectedRows(new Set(deptData.map((_, i) => i)));
  };

  const toggleRow = (i) => {
    const next = new Set(selectedRows);
    if (next.has(i)) next.delete(i); else next.add(i);
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

  const handleSimpan = () => {
    if (!namaInput.trim()) return;
    setShowAddModal(false);
    navigate('departemen-detail', { departemen: namaInput.trim() });
  };

  const handleArchiveConfirm = () => {
    if (archiveTarget === 'bulk') {
      setDeptData(prev => prev.filter((_, i) => !selectedRows.has(i)));
      setSelectedRows(new Set());
      setShowBulkDropdown(false);
    } else if (archiveTarget !== null) {
      setDeptData(prev => prev.filter((_, i) => i !== archiveTarget));
      setSelectedRows(prev => {
        const next = new Set(prev);
        next.delete(archiveTarget);
        return next;
      });
    }
    setArchiveTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget === null) return;
    setDeptData(prev => prev.filter((_, i) => i !== deleteTarget));
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.delete(deleteTarget);
      return next;
    });
    setDeleteTarget(null);
  };

  return (
    <div className="dept-view" onClick={(e) => {
      if (!e.target.closest('.dept-filter-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.dept-bulk-container')) setShowBulkDropdown(false);
    }}>
      <div className="dept-header-container">
        <h1 className="dept-title">Departemen</h1>
      </div>

      <div className="dept-body">
        <div className="dept-actions-bar">
          <div className="dept-left-actions">
            <button className="dept-btn-primary" onClick={openAddModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
              </svg> Tambah Departemen
            </button>
          </div>
          <div className="dept-right-actions">
            <div className="dept-stats-badge">Jumlah Departemen : <strong>{deptData.length}</strong></div>
            <div className="dept-divider"></div>
            {selectedRows.size > 0 && (
              <div className="dept-bulk-container">
                <button className={`dept-btn-bulk${showBulkDropdown ? ' active' : ''}`} onClick={() => { setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}>
                  <div className="dept-bulk-badge" style={{ marginRight: 8 }}>{selectedRows.size}</div> Pilih Aksi
                  <svg className="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 4 }}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showBulkDropdown && (
                  <div className="dept-bulk-dropdown active">
                    <a href="#" className="bulk-dropdown-item" style={{ padding: '6px 0' }} onClick={(e) => { e.preventDefault(); handleBulkArchive(); }}>
                      <ArchiveSvg /> Arsipkan
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="dept-filter-container">
              <button className={`dept-btn-filter${(showFilterDropdown || activeFilters.size > 0) ? ' active' : ''}`} onClick={() => { setShowBulkDropdown(false); setShowFilterDropdown(v => !v); }}>
                <img src="/assets/line240.svg" /> Filter
              </button>
              {showFilterDropdown && (
                <div className="dept-filter-dropdown active" onClick={e => e.stopPropagation()}>
                  <div className="dept-filter-column w-status">
                    <span className="dept-filter-column-title">Status</span>
                    {['Aktif', 'Arsip'].map((s) => (
                      <div key={s}>
                        <div className="dept-filter-item" style={{ padding: '6px 0' }}><input type="checkbox" className="dept-filter-checkbox" checked={activeFilters.has(s)} onChange={() => toggleFilter(s)} /><label>{s}</label></div>
                        <div className="dept-filter-divider-horizontal" style={{ margin: '2px 0' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dept-table-container">
          <table className="dept-table">
            <thead>
              <tr>
                <th width="3%"><input type="checkbox" className="dept-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
                <th width="27%">Departemen</th>
                <th width="15%">Total Posisi</th>
                <th width="25%">Lowongan Terkait</th>
                <th width="30%">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Dibuat Pada</span>
                    <span style={{ marginRight: '70px' }}>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {deptData.map((dept, i) => (
                <tr key={i}>
                  <td><input type="checkbox" className="dept-checkbox row-checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} /></td>
                  <td className="dept-name" onClick={() => navigate && navigate('departemen-detail', { departemen: dept.name })} style={{ cursor: 'pointer' }}>{dept.name}</td>
                  <td>
                    <span style={{ background: '#eef7fd', color: '#0977be', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {dept.totalPosisi}
                    </span>
                  </td>
                  <td>{dept.lowongan}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>{dept.tanggal}</span>
                      <div className="dept-actions">
                        <button className="dept-btn-outline btn-archive" onClick={() => setArchiveTarget(i)}>
                          <ArchiveSvg /> Arsipkan
                        </button>
                        {dept.canDelete ? (
                          <button className="dept-btn-outline btn-delete" onClick={() => setDeleteTarget(i)}>
                            <DeleteSvg /> Hapus
                          </button>
                        ) : (
                          <button className="dept-btn-outline btn-delete-disabled" disabled>
                            <DeleteSvg /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dept-pagination" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#555f71', fontWeight: 500 }}>Tampilkan</span>
            <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd0db', outline: 'none', color: '#171e2c', fontSize: '12px', background: '#fff', cursor: 'pointer' }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span style={{ fontSize: '12px', color: '#555f71', fontWeight: 500 }}>data</span>
          </div>
          <div className="dept-page-container">
            <div className="dept-page-box">1</div>
            <span className="dept-page-text">dari 3</span>
            <div className="dept-page-controls">
              <button className="dept-page-btn prev"><img src="/assets/line244.svg" alt="Prev" /></button>
              <div className="dept-page-btn-divider"></div>
              <button className="dept-page-btn next"><img src="/assets/line242.svg" alt="Next" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Departemen */}
      {showAddModal && (
        <div className="dept-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dept-modal dept-modal-add" onClick={e => e.stopPropagation()}>
            <p className="dept-modal-title">Tambah Departemen</p>
            <div className="dept-modal-form">
              <div className="dept-modal-field">
                <div className="dept-modal-label-group">
                  <p className="dept-modal-label">Nama Departemen</p>
                  <p className="dept-modal-hint">Pastikan jabatan telah sesuai. Contoh: Marketing, Accountant, dll</p>
                </div>
                <input
                  className="dept-modal-input"
                  placeholder="Isi Nama Departemen"
                  value={namaInput}
                  onChange={e => setNamaInput(e.target.value)}
                />
              </div>
              <div className="dept-modal-field">
                <div className="dept-modal-label-group">
                  <p className="dept-modal-label">Deskripsi</p>
                </div>
                <textarea
                  className="dept-modal-textarea"
                  placeholder="Masukan Deskripsi Singkat"
                  value={deskripsiInput}
                  onChange={e => setDeskripsiInput(e.target.value)}
                />
              </div>
            </div>
            <div className="dept-modal-footer dept-modal-footer-end">
              <button className="dept-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Batal</button>
              <button className="dept-modal-btn-primary" onClick={handleSimpan}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Arsip */}
      {archiveTarget !== null && (
        <div className="dept-modal-overlay" onClick={() => setArchiveTarget(null)}>
          <div className="dept-modal dept-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="dept-modal-confirm-text">
              <p className="dept-modal-title" style={{ fontSize: '18px' }}>Arsipkan Departemen</p>
              <p className="dept-modal-subtitle">
                {archiveTarget === 'bulk'
                  ? `Apakah Anda yakin ingin mengarsipkan ${selectedRows.size} departemen yang dipilih?`
                  : 'Apakah Anda yakin ingin mengarsipkan departemen ini?'}
              </p>
            </div>
            <div className="dept-modal-footer dept-modal-footer-stretch">
              <button className="dept-modal-btn-cancel dept-modal-btn-cancel-lg" onClick={() => setArchiveTarget(null)}>Batal</button>
              <button className="dept-modal-btn-primary dept-modal-btn-primary-lg" onClick={handleArchiveConfirm}>Arsipkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus */}
      {deleteTarget !== null && (
        <div className="dept-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="dept-modal dept-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="dept-modal-confirm-text">
              <p className="dept-modal-title" style={{ fontSize: '18px' }}>Hapus Departemen</p>
              <p className="dept-modal-subtitle">Apakah Anda yakin ingin menghapus departemen ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="dept-modal-footer dept-modal-footer-stretch">
              <button className="dept-modal-btn-cancel dept-modal-btn-cancel-lg" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button className="dept-modal-btn-primary dept-modal-btn-primary-lg" onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
