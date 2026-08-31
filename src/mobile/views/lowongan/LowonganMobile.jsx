import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useBuatLowonganPanduanContext } from '../../../context/BuatLowonganPanduanContext.jsx';
import useLowonganData from '../../../hooks/lowongan/useLowonganData.js';
import useVirtualizedList from '../../../hooks/useVirtualizedList.js';
import PopupKonfirmasi from '../../../components/PopupKonfirmasi.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import MobileAlphaIndex from '../../components/MobileAlphaIndex.jsx';
import MobileBuatLowonganChoice from './MobileBuatLowonganChoice.jsx';
import '../../../../css/mobile/lowongan/lowongan.css';

const STATUS_DOT = {
  rencana: '#7E8799',
  aktif: '#0977BE',
  ditahan: '#FD800C',
  selesai: '#089F32',
  dibatalkan: '#FB484B',
};

const STATUS_TINT = {
  rencana: '#F1F2F5',
  aktif: '#E7F3FC',
  ditahan: '#FFF1E5',
  selesai: '#E9F9EE',
  dibatalkan: '#FDEBEC',
};

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconSliders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" /></svg>
);
const IconKebab = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
);
const IconKandidat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);
const IconArchive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const SHARE_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

const SORT_OPTIONS = [
  { label: 'Terbaru dibuat', value: 'date_desc' },
  { label: 'Terlama dibuat', value: 'date_asc' },
  { label: 'Nama posisi (A-Z)', value: 'nama_asc' },
  { label: 'Nama posisi (Z-A)', value: 'nama_desc' },
];

const QUICK_CHIPS = ['Aktif', 'Rencana', 'Selesai'];

export default function LowonganMobile({ navigate }) {
  const { companyId, companyPlan, companyName } = useAuth() || {};
  const wizardPanduan = useBuatLowonganPanduanContext();
  const [searchText, setSearchText] = useState('');

  const {
    statusConfigEntries,
    isLoading,
    activeFilters, toggleFilter, setActiveFilters,
    activeSort, setActiveSort,
    filteredRows, activeCount,
    toast, setToast,
    archiveModal, setArchiveModal,
    unarchiveTarget, setUnarchiveTarget,
    handleRowArchive,
    handleUnarchiveConfirm,
    buildKaririUrl: buildKaririUrlBase,
    handleViewLaman: handleViewLamanBase,
    handleShare: handleShareBase,
  } = useLowonganData(companyId, companyPlan, { searchQuery: searchText });

  const buildKaririUrl = (row) => buildKaririUrlBase(row, companyName);
  const handleViewLaman = (row) => handleViewLamanBase(row, companyName);
  const handleShare = (platform, row) => handleShareBase(platform, row, companyName);

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [actionRow, setActionRow] = useState(null);
  const [shareRow, setShareRow] = useState(null);
  const [showCreateChoice, setShowCreateChoice] = useState(false);

  // Sama seperti Kandidat: filteredRows sudah lengkap di memori, jadi tidak
  // ada lagi "load more" berbasis fetch — seluruh list divirtualisasi,
  // cuma baris yang kelihatan di layar yang di-mount ke DOM.
  const rowVirtualizer = useVirtualizedList(filteredRows.length, 150);
  const alphaActive = (activeSort === 'nama_asc' || activeSort === 'nama_desc') && !isLoading && filteredRows.length > 0;
  const hasActiveFilters = activeFilters.size > 0;

  const goDetail = (row) => navigate('lowongan-detail_001', {
    seleksiId: row.id, jabatan: row.posisi, activeTab: row.kandidat > 0 ? 'kandidat' : 'ringkasan',
  });

  return (
    <>
      <div className="mlw001-head">
        <div className="mlw001-head-row">
          <div className="mlw001-title">Lowongan</div>
          <div className="mlw001-count">{activeCount} lowongan</div>
        </div>
        <div className="mlw001-search">
          <IconSearch />
          <input
            placeholder="Cari posisi atau departemen…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="mlw001-chiprow">
          <button
            className={`mlw001-chip${!hasActiveFilters ? ' active' : ''}`}
            onClick={() => setActiveFilters(new Set())}
          >
            Semua
          </button>
          {QUICK_CHIPS.map(label => (
            <button
              key={label}
              className={`mlw001-chip${activeFilters.has(label) ? ' active' : ''}`}
              onClick={() => toggleFilter(label)}
            >
              <span className="mlw001-status-dot" style={{ background: activeFilters.has(label) ? '#ffffff' : STATUS_DOT[label.toLowerCase()] }} />
              {label}
            </button>
          ))}
          <button className="mlw001-chip-sort" onClick={() => setFilterSheetOpen(true)}>
            <IconSliders />
            {hasActiveFilters && <span className="mlw001-chip-sort-dot" />}
          </button>
        </div>
      </div>

      <div className="mlw001-list">
        {isLoading ? (
          <>
            <div className="msh-skel" style={{ height: 130 }} />
            <div className="msh-skel" style={{ height: 130 }} />
          </>
        ) : filteredRows.length === 0 ? (
          <div className="mlw001-empty">
            <p><strong>Belum ada lowongan yang cocok.</strong><br />Coba ubah kata kunci atau filter yang dipilih.</p>
          </div>
        ) : (
          <div className="mlw001-list-inner" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map(vi => {
              const row = filteredRows[vi.index];
              const cfg = statusConfigEntries.find(([key]) => key === row.status)?.[1];
              const label = cfg?.label || 'Rencana';
              return (
                <div
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={vi.index}
                  className="mlw001-row"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <div className={`mlw001-card${row.arsip ? ' archived' : ''}`}>
                    <div className="mlw001-card-top">
                      <div onClick={() => !row.arsip && goDetail(row)} style={{ cursor: row.arsip ? 'default' : 'pointer' }}>
                        <div className="mlw001-card-posisi">{row.posisi}</div>
                        <div className="mlw001-card-meta">
                          {row.dept}<span className="mlw001-dot" />{row.lokasi}<span className="mlw001-dot" />{row.levelJabatan}
                        </div>
                      </div>
                      {!row.arsip && (
                        <button className="mlw001-kebab" onClick={() => setActionRow(row)}>
                          <IconKebab />
                        </button>
                      )}
                    </div>

                    <div className="mlw001-card-badges">
                      <span
                        className="mlw001-status-pill"
                        style={{ background: STATUS_TINT[row.status], color: STATUS_DOT[row.status] }}
                      >
                        <span className="mlw001-status-dot" style={{ background: STATUS_DOT[row.status] }} />
                        {label}
                      </span>
                      {row.kandidat > 0 && <span className="mlw001-stage-pill">{row.alur}</span>}
                    </div>

                    <div className="mlw001-card-footer">
                      <div className="mlw001-card-kandidat"><IconKandidat />{row.kandidat} kandidat</div>
                      <div className="mlw001-card-tanggal">{row.tanggal}</div>
                      {row.arsip ? (
                        <button className="mlw001-card-show-btn" onClick={() => setUnarchiveTarget(row)}>Tampilkan</button>
                      ) : (
                        <button className="mlw001-card-kelola" onClick={() => goDetail(row)}>Kelola<IconChevron /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MobileAlphaIndex
        items={filteredRows}
        getLetter={(row) => (row.posisi || '?').charAt(0).toUpperCase()}
        virtualizer={rowVirtualizer}
        active={alphaActive}
      />

      <button className="mlw001-fab" onClick={() => setShowCreateChoice(true)}>
        <IconPlus />Buat Lowongan
      </button>

      {/* ── sheet: filter & urutkan ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${filterSheetOpen ? ' open' : ''}`} onClick={() => setFilterSheetOpen(false)} />
          <div className={`msh-sheet${filterSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mlw001-sheet-title">Filter & Urutkan</div>

            <div className="mlw001-sheet-section-label">Status</div>
            <div className="mlw001-filter-grid">
              {statusConfigEntries.map(([key, cfg]) => (
                <button
                  key={key}
                  className={`mlw001-filter-opt${activeFilters.has(cfg.label) ? ' sel' : ''}`}
                  onClick={() => toggleFilter(cfg.label)}
                >
                  <span className="mlw001-status-dot" style={{ background: STATUS_DOT[key] }} />
                  {cfg.label}
                </button>
              ))}
              <button
                className={`mlw001-filter-opt${activeFilters.has('Arsip') ? ' sel' : ''}`}
                onClick={() => toggleFilter('Arsip')}
              >
                Arsip
              </button>
            </div>

            <div className="mlw001-sheet-section-label">Urutkan</div>
            <div className="mlw001-sort-list">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`mlw001-sort-item${activeSort === opt.value ? ' sel' : ''}`}
                  onClick={() => setActiveSort(opt.value)}
                >
                  {opt.label}
                  {activeSort === opt.value && <IconCheck />}
                </button>
              ))}
            </div>

            <button className="mlw001-sheet-cta" onClick={() => setFilterSheetOpen(false)}>Terapkan</button>
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
                <div className="mlw001-action-card">
                  <b>{actionRow.posisi}</b>
                  <span>{actionRow.dept} · {actionRow.lokasi}</span>
                </div>
                {actionRow.status !== 'aktif' && (
                  <div className="mlw001-action-hint">Aktifkan status posisi ini dulu untuk membuka & membagikan laman karier.</div>
                )}
                <button
                  className={`mlw001-action-item${actionRow.status !== 'aktif' ? ' disabled' : ''}`}
                  onClick={() => { handleViewLaman(actionRow); setActionRow(null); }}
                >
                  <IconEye />Lihat Laman Karier
                </button>
                <button
                  className={`mlw001-action-item${actionRow.status !== 'aktif' ? ' disabled' : ''}`}
                  onClick={() => { setShareRow(actionRow); setActionRow(null); }}
                >
                  <IconShare />Bagikan Laman Karier
                </button>
                <div className="mlw001-action-divider" />
                <button
                  className="mlw001-action-item danger"
                  onClick={() => { handleRowArchive(actionRow); setActionRow(null); }}
                >
                  <IconArchive />Arsipkan Posisi
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: bagikan laman karier ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${shareRow ? ' open' : ''}`} onClick={() => setShareRow(null)} />
          <div className={`msh-sheet${shareRow ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mlw001-sheet-title" style={{ marginBottom: 12 }}>Bagikan Laman Karier</div>
            {shareRow && (
              <>
                <div className="mlw001-share-link">
                  <span>{buildKaririUrl(shareRow)}</span>
                  <button className="mlw001-share-copy" onClick={() => { handleShare('copy', shareRow); setShareRow(null); }}>Salin</button>
                </div>
                <div className="mlw001-share-grid">
                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                    <button key={key} className="mlw001-share-item" onClick={() => { handleShare(key, shareRow); setShareRow(null); }}>
                      <span className="mlw001-share-icon"><Icon /></span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>,
        document.body
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

      <MobileToast toast={toast} onClose={() => setToast(null)} />

      <MobileBuatLowonganChoice
        open={showCreateChoice}
        onClose={() => setShowCreateChoice(false)}
        onPilihPanduan={() => { setShowCreateChoice(false); wizardPanduan.restart(); navigate('buat-lowongan-panduan_001'); }}
        onPilihForm={() => { setShowCreateChoice(false); navigate('buat-lowongan_001'); }}
      />
    </>
  );
}
