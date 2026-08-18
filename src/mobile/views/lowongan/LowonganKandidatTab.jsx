import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useLowonganKandidatData from '../../../hooks/lowongan/useLowonganKandidatData.js';
import PopupTidakSesuai from '../../../components/PopupTidakSesuai.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import MobileScoreDetailSheet from '../../components/MobileScoreDetailSheet.jsx';
import '../../../../css/mobile/lowongan/lowongan-kandidat.css';

const IconSliders = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" /></svg>);
const IconKebab = () => (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconReject = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="8" y1="8" x2="16" y2="16" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);

const SORT_OPTIONS = [
  { label: 'Skor Tertinggi', value: 'skor_desc' },
  { label: 'Skor Terendah', value: 'skor_asc' },
  { label: 'Nama (A-Z)', value: 'nama_asc' },
  { label: 'Nama (Z-A)', value: 'nama_desc' },
];

const QUICK_CHIPS = [
  { label: 'Tinggi', color: 'var(--fit-high)' },
  { label: 'Sedang', color: 'var(--fit-moderate)' },
];

// Kategori sama persis dengan kartu ringkasan Beranda (lihat getRecentJobs
// di dashboardService.js): Hired mulai level 8 (Diterima), Wawancara mulai
// level 4 (Penjadwalan Wawancara) s/d 7 (Penawaran Kerja) — Terseleksi &
// Diajukan (level 2-3) masih dihitung Baru.
const stageCategory = (alur) => (alur >= 8 ? 'hired' : alur >= 4 ? 'wawancara' : 'baru');

export default function LowonganKandidatTab({ seleksiId, jabatan, navigate, back, overlay }) {
  const { companyId, companyPlan } = useAuth() || {};
  const isFreePlan = companyPlan === 'free';

  const {
    isLoading, listData, activeCount, alurList,
    activeFilters, toggleFilter, setActiveFilters,
    activeSort, setActiveSort,
    changeAlur, rescore, reject,
    toast, setToast,
  } = useLowonganKandidatData(seleksiId, companyId);

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [actionRow, setActionRow] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [rejectTarget, setRejectTarget] = useState(null); // { ids: [...], isBulk }

  // Sheet skor dibuka lewat history entry (sama seperti Kandidat Detail)
  // supaya swipe-back menutup sheet ini, bukan lompat ke luar tab Kandidat.
  const [fitDetailItem, setFitDetailItem] = useState(null);
  const fitDetailOpen = overlay === 'penilaian';
  const openScoreSheet = (item) => {
    setFitDetailItem(item);
    navigate('lowongan-detail_001', { seleksiId, jabatan, activeTab: 'kandidat', overlay: 'penilaian' });
  };
  const closeScoreSheet = () => back();

  const hasActiveFilters = activeFilters.size > 0;
  const alurNama = (level) => alurList.find(a => a.level === level)?.nama ?? '-';

  const toggleRow = (scoringId) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(scoringId) ? next.delete(scoringId) : next.add(scoringId);
      return next;
    });
  };
  const exitSelectMode = () => { setSelectMode(false); setSelectedRows(new Set()); };
  const selectAllRows = () => setSelectedRows(new Set(listData.map(k => k.scoringId)));

  const goDetail = (k) => navigate('kandidat-detail_001', { kandidat: { id: k.kandidatId, nama_lengkap: k.nama } });

  const confirmReject = async (alasan, detail) => {
    const { ids } = rejectTarget;
    setRejectTarget(null);
    const ok = await reject(ids, alasan, detail);
    if (ok && selectMode) exitSelectMode();
  };

  return (
    <>
      <div className="mlk-toolbar">
        <div className="mlk-toolbar-row">
          <span className="mlk-count">{activeCount} kandidat</span>
          <div className="mlk-toolbar-actions">
            {selectMode ? (
              <>
                <button className="mlk-select-toggle" onClick={selectAllRows}>Pilih Semua</button>
                <button className="mlk-select-toggle cancel" onClick={exitSelectMode}>Batal</button>
              </>
            ) : (
              <button className="mlk-select-toggle" onClick={() => setSelectMode(true)}>Pilih</button>
            )}
          </div>
        </div>
        <div className="mlk-chiprow">
          <button className={`mlk-chip${!hasActiveFilters ? ' active' : ''}`} onClick={() => setActiveFilters(new Set())}>Semua</button>
          {QUICK_CHIPS.map(({ label, color }) => (
            <button key={label} className={`mlk-chip${activeFilters.has(label) ? ' active' : ''}`} onClick={() => toggleFilter(label)}>
              <span className="mlk-filter-dot" style={{ background: activeFilters.has(label) ? '#ffffff' : color }} />{label}
            </button>
          ))}
          <button className="mlk-chip-sort" onClick={() => setFilterSheetOpen(true)}>
            <IconSliders />
            {hasActiveFilters && <span className="mlk-chip-sort-dot" />}
          </button>
        </div>
      </div>

      <div className="mlk-list">
        {isLoading ? (
          <>
            <div className="msh-skel" style={{ height: 130 }} />
            <div className="msh-skel" style={{ height: 130 }} />
          </>
        ) : listData.length === 0 ? (
          <div className="mlk-empty">
            <p><strong>Belum ada kandidat pada posisi ini.</strong><br />Tambahkan kandidat lewat menu Kandidat untuk memulai penilaian.</p>
          </div>
        ) : (
          listData.map(k => {
            const selected = selectedRows.has(k.scoringId);
            const initial = (k.nama || '?').charAt(0).toUpperCase();
            const fitKey = k.belumDinilai ? 'none' : k.fit;
            return (
              <div
                className={`mlk-card${selected ? ' selected' : ''}`}
                key={k.scoringId}
                onClick={() => { if (selectMode) toggleRow(k.scoringId); else goDetail(k); }}
              >
                {selectMode ? (
                  <span className={`mlk-checkbox${selected ? ' checked' : ''}`}>{selected && <IconCheck />}</span>
                ) : (
                  <span className="mlk-avatar">{initial}</span>
                )}
                <div className="mlk-body">
                  <div className="mlk-top">
                    <div className="mlk-name-row">
                      <span className="mlk-name">{k.nama}</span>
                      {k.sumber === 'public' && <span className="mlk-src-badge"><IconGlobe /></span>}
                    </div>
                    {!selectMode && (
                      <span className="mlk-kebab" onClick={(e) => { e.stopPropagation(); setActionRow(k); }}><IconKebab /></span>
                    )}
                  </div>
                  <div className="mlk-jabatan">{k.jabatanKandidat}{k.perusahaan && k.perusahaan !== '-' ? ` di ${k.perusahaan}` : ''}</div>
                  <div className="mlk-meta">
                    {k.pengalaman != null ? `${k.pengalaman} tahun pengalaman` : null}
                    {k.pengalaman != null && k.domisili && k.domisili !== '-' && <span className="mlk-dot" />}
                    {k.domisili && k.domisili !== '-' ? k.domisili : null}
                  </div>
                  <div className="mlk-footer">
                    <button className={`mlk-alur-pill ${stageCategory(k.alur)}`} onClick={(e) => { e.stopPropagation(); openScoreSheet(k); }}>
                      <span>{alurNama(k.alur)}</span>
                    </button>
                    <div className="mlk-footer-right">
                      {k.linkedin && (
                        <a
                          className="mlk-linkedin"
                          href={k.linkedin.startsWith('http') ? k.linkedin : `https://${k.linkedin}`}
                          target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        >
                          <IconLinkedIn />
                        </a>
                      )}
                      <button className={`mlk-skor ${fitKey}`} onClick={(e) => { e.stopPropagation(); openScoreSheet(k); }}>
                        <span className="mlk-skor-label">{k.belumDinilai ? 'Belum Dinilai' : k.label}</span>
                        <span className="mlk-skor-num">{k.belumDinilai ? '—' : k.score}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectMode && selectedRows.size > 0 && (
        <div className="mlk-bulkbar">
          <div className="mlk-bulkbar-top">
            <span className="mlk-bulkbar-count">{selectedRows.size} kandidat dipilih</span>
            <button className="mlk-bulkbar-clear" onClick={() => setSelectedRows(new Set())}>Hapus pilihan</button>
          </div>
          <button
            className="mlk-bulkbar-btn"
            onClick={() => setRejectTarget({ ids: [...selectedRows] })}
          >
            <IconReject />Tandai Tidak Sesuai
          </button>
        </div>
      )}

      {!selectMode && (
        <button className="mlk-fab" onClick={() => navigate('lowongan-tambah-kandidat', { seleksiId, jabatan })}>
          <IconPlus />Tambah Kandidat
        </button>
      )}

      {/* ── sheet: filter & urutkan ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${filterSheetOpen ? ' open' : ''}`} onClick={() => setFilterSheetOpen(false)} />
          <div className={`msh-sheet${filterSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mlk-sheet-title">Filter & Urutkan</div>

            <div className="mlk-sheet-label">Penilaian</div>
            <div className="mlk-filter-grid">
              {['Tinggi', 'Sedang', 'Rendah'].map(label => (
                <button key={label} className={`mlk-filter-opt${activeFilters.has(label) ? ' sel' : ''}`} onClick={() => toggleFilter(label)}>{label}</button>
              ))}
            </div>

            <div className="mlk-sheet-label">Tahap Rekrutmen</div>
            <div className="mlk-filter-grid">
              {alurList.filter(a => a.level !== 0).map(a => (
                <button key={a.level} className={`mlk-filter-opt${activeFilters.has(a.nama) ? ' sel' : ''}`} onClick={() => toggleFilter(a.nama)}>{a.nama}</button>
              ))}
            </div>

            <div className="mlk-sheet-label">Urutkan</div>
            <div className="mlk-sort-list">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} className={`mlk-sort-item${activeSort === opt.value ? ' sel' : ''}`} onClick={() => setActiveSort(opt.value)}>
                  {opt.label}
                  {activeSort === opt.value && <IconCheck />}
                </button>
              ))}
            </div>

            <button className="mlk-sheet-cta" onClick={() => setFilterSheetOpen(false)}>Terapkan</button>
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
                <div className="mlk-action-card">
                  <b>{actionRow.nama}</b>
                  <span>{actionRow.jabatanKandidat}</span>
                </div>
                <button
                  className="mlk-action-item"
                  onClick={() => { setRejectTarget({ ids: [actionRow.scoringId] }); setActionRow(null); }}
                >
                  <IconReject />Tandai Tidak Sesuai
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      <MobileScoreDetailSheet
        open={fitDetailOpen}
        item={fitDetailItem}
        alurList={alurList}
        isFreePlan={isFreePlan}
        onClose={closeScoreSheet}
        onRescore={async () => {
          const updated = await rescore(fitDetailItem);
          if (updated) setFitDetailItem(updated);
        }}
        onReject={() => { setRejectTarget({ ids: [fitDetailItem.scoringId] }); closeScoreSheet(); }}
        onChangeAlur={(level) => {
          changeAlur(fitDetailItem, level);
          setFitDetailItem(item => item ? { ...item, alur: level } : item);
        }}
        onUpgrade={() => navigate('paket-langganan')}
      />

      {rejectTarget && (
        <PopupTidakSesuai
          targetText={rejectTarget.ids.length > 1 ? `${rejectTarget.ids.length} kandidat` : 'Kandidat'}
          onConfirm={confirmReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
