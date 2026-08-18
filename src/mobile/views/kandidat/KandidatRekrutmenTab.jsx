import { useState } from 'react';
import { createPortal } from 'react-dom';
import '../../../../css/mobile/kandidat/kandidat-rekrutmen.css';

const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>);
const IconSliders = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);

const SORT_OPTIONS = [
  { label: 'Skor Tertinggi', value: 'skor_desc' },
  { label: 'Skor Terendah', value: 'skor_asc' },
  { label: 'Posisi (A-Z)', value: 'posisi_asc' },
  { label: 'Posisi (Z-A)', value: 'posisi_desc' },
];

const QUICK_CHIPS = [
  { label: 'Tinggi', color: 'var(--fit-high)' },
  { label: 'Sedang', color: 'var(--fit-moderate)' },
];

const FIT_LEVEL_MAP = { Tinggi: 'high', Sedang: 'moderate', Rendah: 'low' };

// Sama persis dengan stageCategory di LowonganKandidatTab.jsx (Beranda's
// bucketing: Hired mulai level 8, Wawancara level 4-7, sisanya Baru) —
// tambahan "tidak-sesuai" untuk alur 0, yang di tab ini justru ditampilkan
// (beda dari daftar lain di app yang menyembunyikannya).
const stageCategory = (alur) => (alur === 0 ? 'tidak-sesuai' : alur >= 8 ? 'hired' : alur >= 4 ? 'wawancara' : 'baru');

// Padanan mobile dari Kandidat-Lowongan_001.jsx (tabel "Tahap Rekrutmen" di
// desktop) — datanya sengaja tidak fetch ulang, dipass dari aiScores yang
// sudah di-fetch useKandidatDetailData untuk kartu Ringkasan. Tap skor/alur
// membuka MobileScoreDetailSheet milik parent (satu instance dipakai bareng
// tab Ringkasan) lewat callback onOpenItem.
export default function KandidatRekrutmenTab({ aiScores, isLoadingScores, alurList, navigate, onOpenItem }) {
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('skor_desc');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const toggleFilter = (s) => setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const hasActiveFilters = activeFilters.size > 0;
  const alurNama = (level) => alurList.find(a => a.level === level)?.nama ?? '-';

  // Beda dari daftar lain di app — tab Rekrutmen justru menampilkan posisi
  // dengan alur "Tidak Sesuai" juga (riwayat lengkap semua posisi yang
  // pernah diikuti kandidat), makanya di sini tidak difilter.
  const rows = aiScores;
  let filteredRows = activeFilters.size === 0
    ? rows
    : rows.filter(r => [...activeFilters].some(f => FIT_LEVEL_MAP[f] === r.fit));

  filteredRows = [...filteredRows].sort((a, b) => {
    switch (activeSort) {
      case 'skor_desc': return (b.score ?? -1) - (a.score ?? -1);
      case 'skor_asc': return (a.score ?? -1) - (b.score ?? -1);
      case 'posisi_asc': return (a.posisi || '').localeCompare(b.posisi || '');
      case 'posisi_desc': return (b.posisi || '').localeCompare(a.posisi || '');
      default: return 0;
    }
  });

  return (
    <>
      <div className="rk-toolbar">
        <div className="rk-toolbar-row">
          <span className="rk-count">{rows.length} posisi diikuti</span>
        </div>
        <div className="rk-chiprow">
          <button className={`rk-chip${!hasActiveFilters ? ' active' : ''}`} onClick={() => setActiveFilters(new Set())}>Semua</button>
          {QUICK_CHIPS.map(({ label, color }) => (
            <button key={label} className={`rk-chip${activeFilters.has(label) ? ' active' : ''}`} onClick={() => toggleFilter(label)}>
              <span className="rk-filter-dot" style={{ background: activeFilters.has(label) ? '#ffffff' : color }} />{label}
            </button>
          ))}
          <button className="rk-chip-sort" onClick={() => setFilterSheetOpen(true)}>
            <IconSliders />
            {hasActiveFilters && <span className="rk-chip-sort-dot" />}
          </button>
        </div>
      </div>

      <div className="rk-list">
        {isLoadingScores ? (
          <>
            <div className="msh-skel" style={{ height: 96 }} />
            <div className="msh-skel" style={{ height: 96 }} />
          </>
        ) : filteredRows.length === 0 ? (
          <div className="rk-empty">
            <p>{rows.length === 0 ? 'Kandidat belum mengikuti seleksi apapun.' : 'Tidak ada hasil yang sesuai filter.'}</p>
          </div>
        ) : (
          filteredRows.map(item => {
            const fitKey = item.belumDinilai ? 'none' : item.fit;
            return (
              <div className="rk-card" key={item.id}>
                <div className="rk-card-top" onClick={() => navigate('lowongan-detail_001', { seleksiId: item.seleksiId, jabatan: item.posisi, activeTab: 'kandidat' })}>
                  <div>
                    <div className="rk-posisi">{item.posisi}</div>
                    {item.departemen && <div className="rk-dept">{item.departemen}</div>}
                  </div>
                  <div className="rk-chev"><IconChevronRight /></div>
                </div>
                <div className="rk-footer">
                  <button className={`rk-alur-pill ${stageCategory(item.alur)}`} onClick={() => onOpenItem(item)}>
                    <span>{alurNama(item.alur)}</span><IconChevronDown />
                  </button>
                  <button className={`rk-skor ${fitKey}`} onClick={() => onOpenItem(item)}>
                    <span className="rk-skor-label">{item.belumDinilai ? 'Belum Dinilai' : item.label}</span>
                    <span className="rk-skor-num">{item.belumDinilai ? '—' : item.score}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── sheet: filter & urutkan ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${filterSheetOpen ? ' open' : ''}`} onClick={() => setFilterSheetOpen(false)} />
          <div className={`msh-sheet${filterSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="rk-sheet-title">Filter &amp; Urutkan</div>

            <div className="rk-sheet-label">Penilaian</div>
            <div className="rk-filter-grid">
              {['Tinggi', 'Sedang', 'Rendah'].map(label => (
                <button key={label} className={`rk-filter-opt${activeFilters.has(label) ? ' sel' : ''}`} onClick={() => toggleFilter(label)}>{label}</button>
              ))}
            </div>

            <div className="rk-sheet-label">Urutkan</div>
            <div className="rk-sort-list">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} className={`rk-sort-item${activeSort === opt.value ? ' sel' : ''}`} onClick={() => setActiveSort(opt.value)}>
                  {opt.label}
                  {activeSort === opt.value && <IconCheck />}
                </button>
              ))}
            </div>

            <button className="rk-sheet-cta" onClick={() => setFilterSheetOpen(false)}>Terapkan</button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
