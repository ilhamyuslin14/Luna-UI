import { useState } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';

const FIT_CONFIG = {
  high:     { label: 'High Fit',     border: '#a3e1b0', chip: '#089f32' },
  moderate: { label: 'Moderate Fit', border: '#ffd086', chip: '#f8aa01' },
  low:      { label: 'Low Fit',      border: '#ffb3b5', chip: '#fb484b' },
};

const ALUR_STAGES = [
  'Kandidat Baru', 'Ditinjau', 'Diajukan', 'Penjadwalan Wawancara',
  'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja',
  'Diterima', 'Onboarding', 'Lolos Masa Percobaan',
];

const INITIAL_DATA = [
  { id: 1, posisi: 'Backend Engineer',        alur: 'Diajukan',  skor: 75, fit: 'moderate' },
  { id: 2, posisi: 'Senior Frontend Engineer', alur: 'Ditinjau',  skor: 88, fit: 'high'     },
];

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="6" height="4" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1L5 5L9 1"/>
  </svg>
);

export default function KandidatSeleksi({ back, navigate, kandidat }) {
  const [rows, setRows]               = useState(INITIAL_DATA);
  const [showFilter, setShowFilter]   = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [openAlurRow, setOpenAlurRow] = useState(null);
  const [scorePanel, setScorePanel]   = useState(null);

  const openPanel = (row) => setScorePanel({
    nama: kandidat?.nama || row.posisi,
    skor: { level: row.fit, score: row.skor },
  });

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const updateAlur = (id, stage) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, alur: stage } : r));
    setOpenAlurRow(null);
  };

  const handleOuterClick = (e) => {
    if (!e.target.closest('.ks-filter-container')) setShowFilter(false);
    if (!e.target.closest('.ks-alur-wrap'))        setOpenAlurRow(null);
  };

  return (
    <div className="ks-view" onClick={handleOuterClick}>

      {/* ── Action bar ── */}
      <div className="ks-action-bar">
        <button
          className="kd-back-btn"
          onClick={() => back ? back() : navigate?.('kandidat')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali
        </button>

        <div className="ks-filter-container">
          <button
            className={`kan-btn-filter${(showFilter || activeFilters.size > 0) ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowFilter(v => !v); }}
          >
            <FilterIcon /> Filter
          </button>

          {showFilter && (
            <div className="kan-filter-dropdown active" onClick={e => e.stopPropagation()}>
              {/* Penilaian */}
              <div className="kan-filter-column w-left">
                <span className="kan-filter-column-title">Penilaian</span>
                {['High Fit', 'Moderate Fit', 'Low Fit'].map((s) => (
                  <div key={s}>
                    <div className="kan-filter-item" style={{ padding: '6px 0' }}>
                      <input type="checkbox" className="kan-filter-checkbox" checked={activeFilters.has(s)} onChange={() => toggleFilter(s)} />
                      <label>{s}</label>
                    </div>
                    <div className="kan-filter-divider-horizontal" style={{ margin: '2px 0' }} />
                  </div>
                ))}
              </div>

              <div className="kan-filter-divider-vertical" />

              {/* Alur Seleksi */}
              <div className="kan-filter-column w-right">
                <span className="kan-filter-column-title">Alur Seleksi</span>
                {ALUR_STAGES.map((s) => (
                  <div key={s}>
                    <div className="kan-filter-item" style={{ padding: '6px 0' }}>
                      <input type="checkbox" className="kan-filter-checkbox" checked={activeFilters.has(s)} onChange={() => toggleFilter(s)} />
                      <label>{s}</label>
                    </div>
                    <div className="kan-filter-divider-horizontal" style={{ margin: '2px 0' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="ks-table">

        <div className="ks-table-head">
          <div className="ks-col-posisi">Posisi</div>
          <div className="ks-col-alur">Alur Seleksi</div>
          <div className="ks-col-skor">Penilaian</div>
          <div className="ks-col-action" />
        </div>

        {rows.map(row => {
          const fit = FIT_CONFIG[row.fit];
          return (
            <div className="ks-table-row" key={row.id}>
              <div className="ks-col-posisi">
                <span className="ks-posisi-link" onClick={() => navigate?.('seleksi-detail', { jabatan: row.posisi, activeTab: 'kandidat' })}>{row.posisi}</span>
              </div>

              <div className="ks-col-alur">
                <div className="ks-alur-wrap">
                  <button
                    className="ks-alur-badge"
                    onClick={(e) => { e.stopPropagation(); setOpenAlurRow(openAlurRow === row.id ? null : row.id); }}
                  >
                    <span>{row.alur}</span>
                    <ChevronDown />
                  </button>
                  {openAlurRow === row.id && (
                    <div className="ks-alur-dropdown">
                      {ALUR_STAGES.map(stage => (
                        <button
                          key={stage}
                          className={`ks-alur-option${row.alur === stage ? ' active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); updateAlur(row.id, stage); }}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ks-col-skor">
                <div
                  className="ks-fit-badge"
                  style={{ borderColor: fit.border, cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); openPanel(row); }}
                >
                  <span className="ks-fit-label">{fit.label}</span>
                  <span className="ks-fit-chip" style={{ background: fit.chip }}>{row.skor}</span>
                </div>
              </div>

              <div className="ks-col-action">
                <span className="ks-detail-link" onClick={(e) => { e.stopPropagation(); openPanel(row); }}>
                  Detail Penilaian
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="lw-pagination" style={{ justifyContent: 'space-between' }}>
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
        <div className="lw-page-container">
          <div className="lw-page-box">1</div>
          <span className="lw-page-text">dari 3</span>
          <div className="lw-page-controls">
            <button className="lw-page-btn prev"><img src="/assets/line244.svg" alt="Prev" /></button>
            <div className="lw-page-btn-divider"></div>
            <button className="lw-page-btn next"><img src="/assets/line242.svg" alt="Next" /></button>
          </div>
        </div>
      </div>
      {scorePanel && <KandidatPenilaian kandidat={scorePanel} onClose={() => setScorePanel(null)} />}
    </div>
  );
}
