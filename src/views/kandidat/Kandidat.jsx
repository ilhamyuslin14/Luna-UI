import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getKandidat, archiveKandidat, unarchiveKandidat } from '../../services/kandidatService.js';
import { getSeleksi } from '../../services/seleksiService.js';
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import Toast from '../../components/Toast.jsx';

const ArchiveSvg = () => (
  <svg width="12" height="12" viewBox="0 0 9 9" fill="none" style={{ marginRight: 4.5, display: 'inline-flex', alignItems: 'center' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

export default function Kandidat({ navigate, searchQuery = '' }) {
  const { companyId } = useAuth();
  const { enqueueScoringJob } = useUpload();

  const [kandidatData, setKandidatData]     = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selectedRows, setSelectedRows]     = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters]   = useState(new Set());
  const [showBulkDropdown, setShowBulkDropdown]     = useState(false);
  const [archiveModal, setArchiveModal]     = useState(null);
  const [unarchiveModal, setUnarchiveModal] = useState(null);
  const [lowonganModal, setLowonganModal]   = useState(false);
  const [seleksiList, setSeleksiList]       = useState([]);
  const [selectedSeleksi, setSelectedSeleksi] = useState(null);
  const [isLoadingSeleksi, setIsLoadingSeleksi] = useState(false);
  const [toast, setToast]                   = useState(null);
  const toastTimer                          = useRef(null);
  const [page, setPage]                     = useState(1);
  const [perPage, setPerPage]               = useState(10);

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    getKandidat(companyId)
      .then(data => setKandidatData(data || []))
      .catch(() => showToast('Gagal memuat', 'Gagal memuat data kandidat'))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  useEffect(() => { setPage(1); }, [activeFilters]);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const PENGALAMAN_OPTS = ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'];
  const JABATAN_OPTS    = ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'];

  const filteredData = useMemo(() => {
    let result = kandidatData;

    const statusActive = ['Aktif', 'Arsip'].filter(f => activeFilters.has(f));
    if (statusActive.length === 1) {
      if (statusActive[0] === 'Arsip') result = result.filter(k => k.arsip === true);
      else result = result.filter(k => !k.arsip);
    } else if (statusActive.length === 0) {
      result = result.filter(k => !k.arsip);
    }

    const pengalamanActive = PENGALAMAN_OPTS.filter(f => activeFilters.has(f));
    if (pengalamanActive.length > 0) {
      result = result.filter(k => {
        const tahun = parseFloat(k.pengalaman_tahun) || 0;
        return pengalamanActive.some(f => {
          if (f === '0-2 Tahun')  return tahun >= 0 && tahun <= 2;
          if (f === '2-5 tahun')  return tahun > 2  && tahun <= 5;
          if (f === '5-10 tahun') return tahun > 5  && tahun <= 10;
          if (f === '>10 tahun')  return tahun > 10;
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

    return result;
  }, [kandidatData, activeFilters, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pagedData  = filteredData.slice((page - 1) * perPage, page * perPage);

  const selectAll = pagedData.length > 0 && pagedData.every(k => selectedRows.has(k.id));
  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (selectAll) pagedData.forEach(k => next.delete(k.id));
    else pagedData.forEach(k => next.add(k.id));
    setSelectedRows(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  /* ── Archive ──────────────────────────────────────────────── */
  const doArchive = async (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    await archiveKandidat(idArr);
    setKandidatData(prev => prev.map(k => idArr.includes(k.id) ? { ...k, arsip: true } : k));
    setSelectedRows(prev => { const n = new Set(prev); idArr.forEach(id => n.delete(id)); return n; });
    showToast('Berhasil diarsipkan', `${idArr.length} kandidat dipindahkan ke arsip`);
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

  /* ── Tambahkan ke Lowongan ────────────────────────────────── */
  const openLowonganModal = () => {
    setShowBulkDropdown(false);
    setSelectedSeleksi(null);
    setLowonganModal(true);
    setIsLoadingSeleksi(true);
    getSeleksi(companyId)
      .then(rows => setSeleksiList((rows || []).filter(s => !s.arsip)))
      .catch(() => showToast('Gagal memuat', 'Gagal memuat daftar lowongan'))
      .finally(() => setIsLoadingSeleksi(false));
  };

  const handleTambahkanKeLowongan = () => {
    if (!selectedSeleksi) return;
    const ids = [...selectedRows];
    ids.forEach(kandidatId => {
      const k = kandidatData.find(c => c.id === kandidatId);
      enqueueScoringJob(kandidatId, selectedSeleksi.id, selectedSeleksi.jabatan, k?.nama_lengkap || '', companyId);
    });
    setLowonganModal(false);
    setSelectedRows(new Set());
    showToast('Kandidat ditambahkan', `${ids.length} kandidat sedang dinilai untuk ${selectedSeleksi.jabatan}`);
  };

  return (
    <div className="kan-view" onClick={e => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
    }}>
      <div className="kan-header-container">
        <h1 className="kan-title">Kandidat</h1>
      </div>

      <div className="kan-actions-bar">
        <div className="kan-left-actions">
          <button className="kan-btn-primary" onClick={() => navigate('kandidat-tambah')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Kandidat
          </button>
        </div>
        <div className="kan-right-actions">
          <div className="kan-stats-badge">
            Jumlah Kandidat : <strong>{filteredData.length}</strong>
          </div>
          <div className="kan-divider" />
          {selectedRows.size > 0 && !activeFilters.has('Arsip') && (
            <CTABulkAksi
              count={selectedRows.size}
              isOpen={showBulkDropdown}
              onToggle={() => { setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
              actions={[
                {
                  icon: <svg width="9" height="9" viewBox="0 0 9 8.745" fill="none"><path d="M7.875 2.25H6.75V1.6875C6.75 1.06641 6.24609 0.5625 5.625 0.5625H3.375C2.75391 0.5625 2.25 1.06641 2.25 1.6875V2.25H1.125C0.503906 2.25 0 2.75391 0 3.375V7.3125C0 7.93359 0.503906 8.4375 1.125 8.4375H7.875C8.49609 8.4375 9 7.93359 9 7.3125V3.375C9 2.75391 8.49609 2.25 7.875 2.25ZM3 1.6875C3 1.47891 3.16875 1.3125 3.375 1.3125H5.625C5.83125 1.3125 6 1.47891 6 1.6875V2.25H3V1.6875ZM8.25 7.3125C8.25 7.51875 8.08125 7.6875 7.875 7.6875H1.125C0.91875 7.6875 0.75 7.51875 0.75 7.3125V5.25H8.25V7.3125ZM8.25 4.5H0.75V3.375C0.75 3.16875 0.91875 3 1.125 3H7.875C8.08125 3 8.25 3.16875 8.25 3.375V4.5Z" fill="currentColor" /></svg>,
                  label: 'Tambahkan ke Lowongan',
                  onClick: openLowonganModal,
                },
                { type: 'divider' },
                {
                  icon: <ArchiveSvg />,
                  label: 'Arsipkan',
                  onClick: () => { setShowBulkDropdown(false); openArchiveModal([...selectedRows]); },
                },
              ]}
            />
          )}
          <FilterDropdown
            groups={[
              { title: 'Status', options: ['Arsip'] },
              { title: 'Pengalaman', options: ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'] },
              { title: 'Jabatan', options: ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'] },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={() => { setShowBulkDropdown(false); setShowFilterDropdown(v => !v); }}
          />
        </div>
      </div>

      <div className="kan-table-container">
        <table className="kan-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" className="kan-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th width="250">Nama Kandidat</th>
              <th width="200">Jabatan</th>
              <th width="160">Perusahaan</th>
              <th width="110">Pengalaman</th>
              <th width="190">Domisili</th>
              <th width="150">LinkedIn</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Memuat data kandidat...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                {kandidatData.filter(k => !k.arsip).length === 0 ? 'Belum ada kandidat.' : 'Tidak ada kandidat yang sesuai filter.'}
              </td></tr>
            ) : (
              pagedData.map(k => (
                <tr key={k.id}>
                  <td><input type="checkbox" className="kan-checkbox kan-row-checkbox" checked={selectedRows.has(k.id)} onChange={() => toggleRow(k.id)} /></td>
                  <td
                    className={`kan-name${k.arsip ? '' : ' kan-name-link'}`}
                    onClick={k.arsip ? undefined : () => navigate('kandidat-detail', { kandidat: { ...k, nama: k.nama_lengkap } })}
                    style={k.arsip ? { cursor: 'default', opacity: 0.5 } : {}}
                  >{k.nama_lengkap || 'Belum ada nama'}</td>
                  <td>
                    <div className="kan-jabatan-container">
                      <div className="kan-jabatan">{k.jabatan_saat_ini || '-'}</div>
                      <div className="kan-periode">{k.periode || '-'}</div>
                    </div>
                  </td>
                  <td>{k.perusahaan_saat_ini || '-'}</td>
                  <td>{k.pengalaman_tahun ? `${k.pengalaman_tahun} Tahun` : '-'}</td>
                  <td>{k.domisili || '-'}</td>
                  <td>{k.linkedin_url || '-'}</td>
                  <td>
                    <div className="kan-actions">
                      {k.arsip ? (
                        <button className="lw-btn-outline btn-show" onClick={() => setUnarchiveModal({ id: k.id, nama: k.nama_lengkap })}>
                          Tampilkan
                        </button>
                      ) : (
                        <button className="kan-btn-outline" onClick={() => openArchiveModal(k.id)}>
                          <ArchiveSvg /> Arsipkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={totalPages}
        perPage={perPage}
        onPageChange={p => setPage(Math.min(Math.max(1, p), totalPages))}
        onPerPageChange={n => { setPerPage(n); setPage(1); }}
      />

      {/* Archive confirmation */}
      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={async () => {
            setArchiveModal(null);
            try { await doArchive(archiveModal.ids); }
            catch { showToast('Gagal mengarsipkan', 'Terjadi kesalahan, coba lagi'); }
          }}
          onClose={() => setArchiveModal(null)}
        />
      )}

      {unarchiveModal && (
        <PopupKonfirmasi
          title="Tampilkan Kandidat"
          body={`Tampilkan kembali "${unarchiveModal.nama}"? Kandidat akan kembali aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={async () => {
            const { id, nama } = unarchiveModal;
            setUnarchiveModal(null);
            try {
              await unarchiveKandidat(id);
              setKandidatData(prev => prev.map(k => k.id === id ? { ...k, arsip: false } : k));
              showToast('Kandidat ditampilkan', `${nama} kembali aktif`);
            } catch {
              showToast('Gagal', 'Tidak dapat menampilkan kandidat');
            }
          }}
          onClose={() => setUnarchiveModal(null)}
        />
      )}

      {/* Tambahkan ke Lowongan modal */}
      {lowonganModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLowonganModal(false)}>
          <div style={{ background: '#fff', borderRadius: 12, width: 420, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #e2e5ec' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#171e2c' }}>Tambahkan ke Lowongan</div>
              <div style={{ fontSize: 12, color: '#7e8799', marginTop: 3 }}>Pilih posisi untuk {selectedRows.size} kandidat yang dipilih</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {isLoadingSeleksi ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>Memuat daftar lowongan...</div>
              ) : seleksiList.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>Tidak ada lowongan aktif.</div>
              ) : seleksiList.map(s => (
                <div key={s.id}
                  onClick={() => setSelectedSeleksi(s)}
                  style={{
                    padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    background: selectedSeleksi?.id === s.id ? '#f0f6ff' : 'transparent',
                    borderLeft: `3px solid ${selectedSeleksi?.id === s.id ? '#0977be' : 'transparent'}`,
                    transition: 'background 0.1s',
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#171e2c' }}>{s.jabatan}</div>
                    <div style={{ fontSize: 11, color: '#7e8799', marginTop: 1 }}>{s.status || 'Aktif'}</div>
                  </div>
                  {selectedSeleksi?.id === s.id && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#0977be" />
                      <path d="M4 7L6.5 9.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e5ec', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setLowonganModal(false)} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Batal</button>
              <button onClick={handleTambahkanKeLowongan} disabled={!selectedSeleksi}
                style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: selectedSeleksi ? '#0977be' : '#b0cfe8', color: '#fff', fontSize: 13, cursor: selectedSeleksi ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
