import { useState } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';
import Pagination from '../../components/Pagination.jsx';
import BackButton from '../../components/BackButton.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';

const FIT_CONFIG = {
  high:     { label: 'Tinggi',     border: '#a3e1b0', chip: '#089f32' },
  moderate: { label: 'Sedang', border: '#ffd086', chip: '#f8aa01' },
  low:      { label: 'Rendah',        border: '#fca5a5', chip: '#fb484b' },
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
    if (!e.target.closest('.filter-dropdown-container')) setShowFilter(false);
    if (!e.target.closest('.ks-alur-wrap'))        setOpenAlurRow(null);
  };

  return (
    <div className="ks-view" onClick={handleOuterClick}>

      {/* ── Action bar ── */}
      <div className="ks-action-bar">
        <BackButton onClick={() => back ? back() : navigate?.('kandidat')} />

        <FilterDropdown
          groups={[
            { title: 'Tahun Pengalaman', options: ['1-3 Tahun', '3-5 Tahun', '> 5 Tahun'] },
            { title: 'Penilaian', options: ['Tinggi', 'Sedang', 'Rendah'] },
            { title: 'Departemen', options: ['Product', 'Engineering', 'Marketing'] }
          ]}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          isOpen={showFilter}
          onToggleOpen={(e) => { e?.stopPropagation(); setShowFilter(v => !v); }}
        />
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
      <Pagination />
      {scorePanel && <KandidatPenilaian kandidat={scorePanel} onClose={() => setScorePanel(null)} />}
    </div>
  );
}
