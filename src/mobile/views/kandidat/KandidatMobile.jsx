import { useState } from 'react';
import { createPortal } from 'react-dom';
import useKandidatData, { getPeriodeText, PENGALAMAN_OPTS, JABATAN_OPTS } from '../../../hooks/kandidat/useKandidatData.js';
import useVirtualizedList from '../../../hooks/useVirtualizedList.js';
import PopupKonfirmasi from '../../../components/PopupKonfirmasi.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import MobileAlphaIndex from '../../components/MobileAlphaIndex.jsx';
import '../../../../css/mobile/kandidat/kandidat.css';

const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconSliders = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" /></svg>);
const IconKebab = () => (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" /></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconDownload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const IconArchive = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const IconSpinner = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="mkan001-spin"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);

function getWhatsAppUrl(phone) {
  if (!phone) return null;
  let cleaned = String(phone).trim().replace(/[^0-9+]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '0') return null;
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  else if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
  else if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
  if (cleaned.length < 8) return null;
  return `https://api.whatsapp.com/send?phone=${cleaned}`;
}

const QUICK_CHIPS = ['Portal Karier', 'Arsip'];

const SORT_OPTIONS = [
  { label: 'Terbaru dibuat', value: 'date_desc' },
  { label: 'Terlama dibuat', value: 'date_asc' },
  { label: 'Nama (A-Z)', value: 'nama_asc' },
  { label: 'Nama (Z-A)', value: 'nama_desc' },
];

export default function KandidatMobile({ navigate }) {
  const [searchText, setSearchText] = useState('');

  const {
    isLoading,
    activeFilters, toggleFilter, setActiveFilters,
    activeSort, setActiveSort,
    filteredData, activeCount,
    toast, setToast,
    archiveModal, setArchiveModal, openArchiveModal, doArchive,
    unarchiveModal, setUnarchiveModal, doUnarchive,
    downloadingId, handleDownloadCv,
    isBulkDownloading, handleBulkDownloadCv,
    lowonganModal, openLowonganModal, closeLowonganModal,
    lowonganSearchQuery, setLowonganSearchQuery,
    isLoadingSeleksi, filteredSeleksiList,
    handleTambahkanKeLowongan,
  } = useKandidatData({ searchQuery: searchText });

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [actionRow, setActionRow] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Data sudah full di-fetch sekali di awal (lihat useKandidatData) — jadi
  // "load more" di sini murni soal render, bukan fetch: seluruh
  // filteredData divirtualisasi (cuma baris yang kelihatan di layar yang
  // di-mount ke DOM), bukan dipotong-potong per halaman kaya sebelumnya.
  const rowVirtualizer = useVirtualizedList(filteredData.length, 132);
  // Disembunyikan pas selectMode karena bulkbar (full-width, muncul di
  // bawah layar) bakal numpuk sama rail-nya.
  const alphaActive = (activeSort === 'nama_asc' || activeSort === 'nama_desc') && !isLoading && filteredData.length > 0 && !selectMode;
  const hasActiveFilters = activeFilters.size > 0;

  const toggleRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedRows(new Set()); };
  const selectAllRows = () => setSelectedRows(new Set(filteredData.filter(k => !k.arsip).map(k => k.id)));

  const goDetail = (k) => navigate('kandidat-detail_001', { kandidat: { ...k, nama: k.nama_lengkap } });

  const archiveSelected = (ids) => {
    openArchiveModal(ids);
  };

  const confirmArchive = async () => {
    const ids = archiveModal.ids;
    setArchiveModal(null);
    try {
      const idArr = await doArchive(ids);
      setSelectedRows(prev => { const n = new Set(prev); idArr.forEach(id => n.delete(id)); return n; });
      if (selectMode && selectedRows.size <= idArr.length) exitSelectMode();
    } catch {
      setToast({ message: 'Gagal mengarsipkan', subMessage: 'Terjadi kesalahan, coba lagi', type: 'error' });
    }
  };

  const confirmUnarchive = async () => {
    try {
      if (unarchiveModal.isBulk) {
        const ids = [...selectedRows];
        setUnarchiveModal(null);
        await doUnarchive(ids);
        exitSelectMode();
        setToast({ message: 'Kandidat ditampilkan', subMessage: `${ids.length} kandidat kembali aktif`, type: 'success' });
      } else {
        const { id, nama } = unarchiveModal;
        setUnarchiveModal(null);
        await doUnarchive(id);
        setToast({ message: 'Kandidat ditampilkan', subMessage: `${nama} kembali aktif`, type: 'success' });
      }
    } catch {
      setToast({ message: 'Gagal', subMessage: 'Tidak dapat menampilkan kandidat', type: 'error' });
    }
  };

  const bulkDownload = async () => {
    const ok = await handleBulkDownloadCv([...selectedRows]);
    if (ok) exitSelectMode();
  };

  return (
    <>
      <div className="mkan001-head">
        <div className="mkan001-head-row">
          <div className="mkan001-title">Kandidat</div>
          <div className="mkan001-head-right">
            <span className="mkan001-count">{activeCount} kandidat</span>
            {selectMode ? (
              <>
                <button className="mkan001-select-toggle" onClick={selectAllRows}>Pilih Semua</button>
                <button className="mkan001-select-toggle cancel" onClick={exitSelectMode}>Batal</button>
              </>
            ) : (
              <button className="mkan001-select-toggle" onClick={() => setSelectMode(true)}>Pilih</button>
            )}
          </div>
        </div>
        <div className="mkan001-search">
          <IconSearch />
          <input
            placeholder="Cari nama, jurusan, atau domisili…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="mkan001-chiprow">
          <button
            className={`mkan001-chip${!hasActiveFilters ? ' active' : ''}`}
            onClick={() => setActiveFilters(new Set())}
          >
            Semua
          </button>
          {QUICK_CHIPS.map(label => (
            <button
              key={label}
              className={`mkan001-chip${activeFilters.has(label) ? ' active' : ''}`}
              onClick={() => toggleFilter(label)}
            >
              {label}
            </button>
          ))}
          <button className="mkan001-chip-sort" onClick={() => setFilterSheetOpen(true)}>
            <IconSliders />
            {hasActiveFilters && <span className="mkan001-chip-sort-dot" />}
          </button>
        </div>
      </div>

      <div className="mkan001-list">
        {isLoading ? (
          <>
            <div className="msh-skel" style={{ height: 130 }} />
            <div className="msh-skel" style={{ height: 130 }} />
          </>
        ) : filteredData.length === 0 ? (
          <div className="mkan001-empty">
            <p><strong>Belum ada kandidat yang cocok.</strong><br />Coba ubah kata kunci atau filter yang dipilih.</p>
          </div>
        ) : (
          <div className="mkan001-list-inner" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map(vi => {
              const k = filteredData[vi.index];
              const selected = selectedRows.has(k.id);
              const initial = (k.nama_lengkap || '?').charAt(0).toUpperCase();
              const waUrl = getWhatsAppUrl(k.phone);
              return (
                <div
                  key={k.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={vi.index}
                  className="mkan001-row"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <div
                    className={`mkan001-card${selected ? ' selected' : ''}${k.arsip ? ' archived' : ''}`}
                    onClick={() => {
                      if (selectMode) { if (!k.arsip) toggleRow(k.id); return; }
                      if (!k.arsip) goDetail(k);
                    }}
                  >
                    {selectMode ? (
                      !k.arsip && (
                        <span className={`mkan001-checkbox${selected ? ' checked' : ''}`}>
                          {selected && <IconCheck />}
                        </span>
                      )
                    ) : (
                      <span className="mkan001-avatar">{initial}</span>
                    )}
                    <div className="mkan001-card-body">
                      <div className="mkan001-card-top">
                        <div className="mkan001-name-row">
                          <span className="mkan001-name">{k.nama_lengkap || 'Belum ada nama'}</span>
                          {k.sumber === 'public' && (
                            <span className="mkan001-src-badge"><IconGlobe /></span>
                          )}
                        </div>
                        {!selectMode && !k.arsip && (
                          <span
                            className="mkan001-kebab"
                            onClick={(e) => { e.stopPropagation(); setActionRow(k); }}
                          >
                            <IconKebab />
                          </span>
                        )}
                      </div>
                      <div className="mkan001-jabatan">{k.jabatan_saat_ini || '-'}</div>
                      <div className="mkan001-periode">
                        {k.perusahaan_saat_ini ? `di ${k.perusahaan_saat_ini} · ` : ''}{getPeriodeText(k)}
                      </div>
                      {(k.jurusan || k.domisili) && (
                        <div className="mkan001-meta">
                          {k.jurusan}{k.jurusan && k.domisili && <span className="mkan001-dot" />}{k.domisili}
                        </div>
                      )}
                      <div className="mkan001-footer">
                        {!!k.pengalaman_tahun && (
                          <span className="mkan001-exp-tag">{k.pengalaman_tahun} tahun pengalaman kerja</span>
                        )}
                        {k.arsip ? (
                          <button className="mkan001-show-btn" onClick={(e) => { e.stopPropagation(); setUnarchiveModal({ id: k.id, nama: k.nama_lengkap }); }}>
                            Tampilkan
                          </button>
                        ) : (
                          <div className="mkan001-footer-right">
                            {k.linkedin_url && <span className="mkan001-linkedin"><IconLinkedIn /></span>}
                            {waUrl && (
                              <a
                                className="mkan001-whatsapp"
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Hubungi via WhatsApp"
                              >
                                <IconWhatsApp />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MobileAlphaIndex
        items={filteredData}
        getLetter={(k) => (k.nama_lengkap || '?').charAt(0).toUpperCase()}
        virtualizer={rowVirtualizer}
        active={alphaActive}
      />

      {!selectMode && (
        <button className="mkan001-fab" onClick={() => navigate('kandidat-tambah')}>
          <IconPlus />Tambah Kandidat
        </button>
      )}

      {selectMode && selectedRows.size > 0 && (
        <div className="mkan001-bulkbar">
          <div className="mkan001-bulkbar-top">
            <span className="mkan001-bulkbar-count">{selectedRows.size} kandidat dipilih</span>
            <button className="mkan001-bulkbar-clear" onClick={() => setSelectedRows(new Set())}>Hapus pilihan</button>
          </div>
          <div className="mkan001-bulkbar-actions">
            {activeFilters.has('Arsip') ? (
              <>
                <button className="mkan001-bulkbar-btn" disabled={isBulkDownloading} onClick={bulkDownload}>
                  {isBulkDownloading ? <IconSpinner /> : <IconDownload />}
                  <span>{isBulkDownloading ? 'Mengemas…' : 'Unduh CV'}</span>
                </button>
                <button className="mkan001-bulkbar-btn" onClick={() => setUnarchiveModal({ isBulk: true })}>
                  <IconArchive />
                  <span>Tampilkan</span>
                </button>
              </>
            ) : (
              <>
                <button className="mkan001-bulkbar-btn" onClick={openLowonganModal}>
                  <IconBriefcase />
                  <span>Tambah ke Lowongan</span>
                </button>
                <button className="mkan001-bulkbar-btn" disabled={isBulkDownloading} onClick={bulkDownload}>
                  {isBulkDownloading ? <IconSpinner /> : <IconDownload />}
                  <span>{isBulkDownloading ? 'Mengemas…' : 'Unduh CV'}</span>
                </button>
                <button className="mkan001-bulkbar-btn danger" onClick={() => archiveSelected([...selectedRows])}>
                  <IconArchive />
                  <span>Arsipkan</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── sheet: filter & urutkan ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${filterSheetOpen ? ' open' : ''}`} onClick={() => setFilterSheetOpen(false)} />
          <div className={`msh-sheet${filterSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mkan001-sheet-title">Filter & Urutkan</div>

            <div className="mkan001-sheet-section-label">Status & Sumber</div>
            <div className="mkan001-filter-grid">
              <button className={`mkan001-filter-opt${activeFilters.has('Portal Karier') ? ' sel' : ''}`} onClick={() => toggleFilter('Portal Karier')}>Portal Karier</button>
              <button className={`mkan001-filter-opt${activeFilters.has('Arsip') ? ' sel' : ''}`} onClick={() => toggleFilter('Arsip')}>Arsip</button>
            </div>

            <div className="mkan001-sheet-section-label">Pengalaman</div>
            <div className="mkan001-filter-grid">
              {PENGALAMAN_OPTS.map(opt => (
                <button key={opt} className={`mkan001-filter-opt${activeFilters.has(opt) ? ' sel' : ''}`} onClick={() => toggleFilter(opt)}>{opt}</button>
              ))}
            </div>

            <div className="mkan001-sheet-section-label">Level Jabatan</div>
            <div className="mkan001-filter-grid">
              {JABATAN_OPTS.map(opt => (
                <button key={opt} className={`mkan001-filter-opt${activeFilters.has(opt) ? ' sel' : ''}`} onClick={() => toggleFilter(opt)}>{opt}</button>
              ))}
            </div>

            <div className="mkan001-sheet-section-label">Urutkan</div>
            <div className="mkan001-sort-list">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`mkan001-sort-item${activeSort === opt.value ? ' sel' : ''}`}
                  onClick={() => setActiveSort(opt.value)}
                >
                  {opt.label}
                  {activeSort === opt.value && <IconCheck />}
                </button>
              ))}
            </div>

            <button className="mkan001-sheet-cta" onClick={() => setFilterSheetOpen(false)}>Terapkan</button>
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: aksi kartu ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${actionRow ? ' open' : ''}`} onClick={() => setActionRow(null)} />
          <div className={`msh-sheet${actionRow ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {actionRow && (
              <>
                <div className="mkan001-action-card">
                  <b>{actionRow.nama_lengkap}</b>
                  <span>{actionRow.jabatan_saat_ini || '-'}</span>
                </div>
                <button className="mkan001-action-item" onClick={() => { goDetail(actionRow); setActionRow(null); }}>
                  <IconEye />Lihat Profil Kandidat
                </button>
                <button
                  className={`mkan001-action-item${!actionRow.cv_url ? ' disabled' : ''}`}
                  onClick={() => { handleDownloadCv(actionRow); setActionRow(null); }}
                >
                  <IconDownload />{actionRow.cv_url ? 'Unduh CV' : 'CV belum diunggah'}
                </button>
                <div className="mkan001-action-divider" />
                <button className="mkan001-action-item danger" onClick={() => { archiveSelected(actionRow.id); setActionRow(null); }}>
                  <IconArchive />Arsipkan Kandidat
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: tambahkan ke lowongan ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${lowonganModal ? ' open' : ''}`} onClick={closeLowonganModal} />
          <div className={`msh-sheet${lowonganModal ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mkan001-eyebrow">{selectedRows.size} Kandidat Dipilih</div>
            <div className="mkan001-sheet-title">Tambahkan ke Lowongan</div>
            <div className="mkan001-posisi-search">
              <IconSearch />
              <input
                placeholder="Cari nama posisi atau departemen…"
                value={lowonganSearchQuery}
                onChange={(e) => setLowonganSearchQuery(e.target.value)}
              />
            </div>
            <div className="mkan001-posisi-list">
              {isLoadingSeleksi ? (
                <div className="mkan001-posisi-empty">Memuat daftar lowongan...</div>
              ) : filteredSeleksiList.length === 0 ? (
                <div className="mkan001-posisi-empty">Tidak ada posisi yang cocok</div>
              ) : (
                filteredSeleksiList.map(s => (
                  <div className="mkan001-posisi-item" key={s.id}>
                    <div>
                      <div className="mkan001-posisi-name">{s.jabatan}</div>
                      <div className="mkan001-posisi-dept">{s.departments?.name || s.departemen || '-'}</div>
                    </div>
                    <button
                      className="mkan001-posisi-add"
                      onClick={() => { handleTambahkanKeLowongan(s, [...selectedRows]); exitSelectMode(); }}
                    >
                      Tambahkan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={confirmArchive}
          onClose={() => setArchiveModal(null)}
        />
      )}

      {unarchiveModal && (
        <PopupKonfirmasi
          title="Tampilkan Kandidat"
          body={unarchiveModal.isBulk
            ? `Apakah Anda yakin ingin menampilkan ${selectedRows.size} kandidat yang dipilih?`
            : `Tampilkan kembali "${unarchiveModal.nama}"? Kandidat akan kembali aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={confirmUnarchive}
          onClose={() => setUnarchiveModal(null)}
        />
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
