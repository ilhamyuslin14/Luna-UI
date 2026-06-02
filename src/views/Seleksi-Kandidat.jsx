import { useState } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';

const BOARD_COLUMNS = [
  'Kandidat Baru', 'Terseleksi', 'Diajukan', 'Penjadwalan Wawancara',
  'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja', 'Diterima',
  'Onboarding', 'Lolos Masa Percobaan',
];

const ArchiveSvg = () => (
  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" style={{ marginRight: 4.5 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const RejectSvg = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4.5 }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

const INITIAL_DATA = [
  { nama: 'Arif Jackberwin', jabatan: 'Junior Human Resources', perusahaan: 'Prima Print', pengalaman: '5 Tahun', linkedin: 'www.linkedin.com/in/aulamdtl/', alur: 'Kandidat Baru', skor: { level: 'moderate', label: 'Moderate Fit', score: 75 } },
  { nama: 'Rofiq Gonzalez', jabatan: 'Senior Frontend Engineer', perusahaan: 'Tech Global Corp', pengalaman: '4 Tahun', linkedin: 'www.linkedin.com/in/rofiqg/', alur: 'Kandidat Baru', skor: { level: 'high', label: 'High Fit', score: 90 } },
  { nama: 'Dito Arkademi', jabatan: 'Admin Manager', perusahaan: 'PT Arkademi', pengalaman: '2 Tahun', linkedin: 'www.linkedin.com/in/ditoark/', alur: 'Kandidat Baru', skor: { level: 'low', label: 'Low Fit', score: 50 } },
  { nama: 'Siti Fatimah', jabatan: 'UX Designer', perusahaan: 'Design Studio Inc', pengalaman: '3 Tahun', linkedin: 'www.linkedin.com/in/sitif/', alur: 'Diajukan', skor: { level: 'high', label: 'High Fit', score: 85 } },
  { nama: 'Budi Santoso', jabatan: 'Backend Developer', perusahaan: 'Bank Central Asia', pengalaman: '5 Tahun', linkedin: 'www.linkedin.com/in/budis/', alur: 'Terseleksi', skor: { level: 'moderate', label: 'Moderate Fit', score: 70 } },
];

const Cb = ({ checked, onChange }) => (
  <label className="sdk-cb">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="sdk-cb-box" />
  </label>
);

export default function SeleksiKandidat({ navigate, back }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [selected, setSelected] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showBulk, setShowBulk] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [alurOpen, setAlurOpen] = useState(null);
  const [collapsedCols, setCollapsedCols] = useState(new Set());
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [scorePanel, setScorePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const allSelected = selected.size === data.length;
  const toggleAll = () => allSelected ? setSelected(new Set()) : setSelected(new Set(data.map((_, i) => i)));
  const toggleRow = (i) => {
    const s = new Set(selected);
    if (s.has(i)) s.delete(i); else s.add(i);
    setSelected(s);
  };
  const updateAlur = (i, alur) => {
    setData(prev => prev.map((item, idx) => idx === i ? { ...item, alur } : item));
    setAlurOpen(null);
  };
  const toggleCol = (col) => {
    const s = new Set(collapsedCols);
    if (s.has(col)) s.delete(col); else s.add(col);
    setCollapsedCols(s);
  };

  return (
    <div
      className="sdk-root"
      onClick={(e) => {
        if (!e.target.closest('.sdk-filter-container')) setShowFilter(false);
        if (!e.target.closest('.sdk-alur-cell')) setAlurOpen(null);
        if (!e.target.closest('.sdk-bulk-container')) setShowBulk(false);
        if (!e.target.closest('.sdk-board-card-menu') && !e.target.closest('.sdk-card-dropdown')) setMenuOpen(null);
      }}
    >
      {/* Actions Bar */}
      <div className="sdk-actions-bar">
        {back && (
          <button className="sd-back-btn" onClick={back}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Kembali
          </button>
        )}
        <div className="sdk-right-actions" style={!back ? { marginLeft: 'auto' } : {}}>
          <div className="sdk-stats-badge">
            Jumlah Kandidat : <strong>8</strong>
          </div>

          <div className="sdk-bar-divider" />

          {selected.size > 0 && (
            <div className="sdk-bulk-container">
              <button
                className={`sdk-btn-bulk${showBulk ? ' active' : ''}`}
                onClick={() => { setShowFilter(false); setShowBulk(v => !v); }}
              >
                <span className="sdk-bulk-badge">{selected.size}</span>
                Pilih Aksi
                <svg width="8" height="6" viewBox="0 0 10 6" fill="none" className="sdk-bulk-chevron">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showBulk && (
                <div className="sdk-bulk-dropdown">
                  <button className="sdk-bulk-item" style={{ padding: '6px 0' }} onClick={() => { alert(`${selected.size} kandidat diset tidak sesuai!`); setSelected(new Set()); setShowBulk(false); }}>
                    <RejectSvg /> Tidak Sesuai
                  </button>
                  <button className="sdk-bulk-item" style={{ padding: '6px 0' }} onClick={() => { alert(`${selected.size} kandidat diarsipkan!`); setSelected(new Set()); setShowBulk(false); }}>
                    <ArchiveSvg /> Arsipkan
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="sdk-filter-container">
            <button
              className={`sdk-btn-filter${(showFilter || activeFilters.size > 0) ? ' active' : ''}`}
              onClick={() => { setShowBulk(false); setShowFilter(v => !v); }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1.75 3.5H12.25M3.5 7H10.5M5.25 10.5H8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Filter
            </button>
            {showFilter && (
              <div className="sdk-filter-dropdown" onClick={e => e.stopPropagation()}>
                <div className="sdk-filter-col">
                  <span className="sdk-filter-col-title">Penilaian</span>
                  {['High', 'Moderate', 'Low'].map(s => (
                    <div key={s}>
                      <div className="sdk-filter-item" style={{ padding: '6px 0' }}>
                        <input type="checkbox" className="sdk-filter-checkbox" checked={activeFilters.has(s)} onChange={() => toggleFilter(s)} />
                        <label className="sdk-filter-label">{s}</label>
                      </div>
                      <div className="sdk-filter-divider-horizontal" style={{ margin: '2px 0' }} />
                    </div>
                  ))}
                </div>
                <div className="sdk-filter-divider" />
                <div className="sdk-filter-col">
                  <span className="sdk-filter-col-title">Alur Seleksi</span>
                  {BOARD_COLUMNS.map(s => (
                    <div key={s}>
                      <div className="sdk-filter-item" style={{ padding: '6px 0' }}>
                        <input type="checkbox" className="sdk-filter-checkbox" checked={activeFilters.has(s)} onChange={() => toggleFilter(s)} />
                        <label className="sdk-filter-label">{s}</label>
                      </div>
                      <div className="sdk-filter-divider-horizontal" style={{ margin: '2px 0' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sdk-view-toggle">
            <button
              className={`sdk-view-btn sdk-view-papan${viewMode === 'board' ? ' active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              <img src="/assets/frame1000006975.svg" alt="" /> Papan
            </button>
            <button
              className={`sdk-view-btn sdk-view-list${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <img src="/assets/fi_16116710.svg" alt="" /> List
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="sdk-table-container">
            <table className="sdk-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}><Cb checked={allSelected} onChange={toggleAll} /></th>
                  <th style={{ width: 200 }}>Nama Kandidat</th>
                  <th style={{ width: 240 }}>Jabatan</th>
                  <th style={{ width: 200 }}>LinkedIn</th>
                  <th style={{ width: 160 }}>Alur Seleksi</th>
                  <th style={{ width: 190 }}>Penilaian</th>
                  <th style={{ width: 150 }}></th>
                </tr>
              </thead>
              <tbody>
                {data.map((k, i) => (
                  <tr key={i}>
                    <td><Cb checked={selected.has(i)} onChange={() => toggleRow(i)} /></td>
                    <td
                      className="sdk-name"
                      onClick={() => navigate('kandidat-detail', { kandidat: { nama: k.nama, jabatan: k.jabatan, perusahaan: k.perusahaan, pengalaman: k.pengalaman, linkedin: k.linkedin } })}
                    >
                      {k.nama}
                    </td>
                    <td>
                      <div className="sdk-jabatan-cell">
                        <span className="sdk-jabatan">{k.jabatan} at {k.perusahaan}</span>
                        <span className="sdk-pengalaman">{k.pengalaman}</span>
                      </div>
                    </td>
                    <td className="sdk-linkedin">{k.linkedin}</td>
                    <td className="sdk-alur-cell" onClick={e => e.stopPropagation()}>
                      <div className="sdk-alur-badge" onClick={() => setAlurOpen(alurOpen === i ? null : i)}>
                        <span>{k.alur}</span>
                        <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
                          <path d="M0.5 0.5L3 3L5.5 0.5" stroke="#323b4d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {alurOpen === i && (
                        <div className="sdk-alur-dropdown">
                          {BOARD_COLUMNS.map(opt => (
                            <button key={opt} className="sdk-alur-option" onClick={() => updateAlur(i, opt)}>{opt}</button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div
                        className={`sdk-skor-badge ${k.skor.level}`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setScorePanel(k); }}
                      >
                        <span>{k.skor.label}</span>
                        <span className={`sdk-skor-score ${k.skor.level}`}>{k.skor.score}</span>
                      </div>
                    </td>
                    <td>
                      <button className="sdk-detail-btn" onClick={(e) => { e.stopPropagation(); setScorePanel(k); }}>Detail Penilaian</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </>
      )}

      {scorePanel && <KandidatPenilaian kandidat={scorePanel} onClose={() => setScorePanel(null)} />}

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="sdk-board-scroll">
          {BOARD_COLUMNS.map(col => {
            const collapsed = collapsedCols.has(col);
            return (
              <div key={col} className={`sdk-board-col${collapsed ? ' collapsed' : ''}`}>
                <div className="sdk-board-col-header">
                  <span className="sdk-board-col-title">{col}</span>
                  <button
                    className="sdk-board-col-collapse"
                    onClick={(e) => { e.stopPropagation(); toggleCol(col); }}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M10 12L6 8L10 4" stroke="#7e8799" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {!collapsed && (
                  <div
                    className={`sdk-board-col-body${dragOverCol === col ? ' drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIdx !== null) {
                        setData(prev => prev.map((item, idx) => idx === dragIdx ? { ...item, alur: col } : item));
                      }
                      setDragIdx(null);
                      setDragOverCol(null);
                    }}
                  >
                    {data.map((k, dataIdx) => {
                      if (k.alur !== col) return null;
                      return (
                        <div
                          key={dataIdx}
                          className={`sdk-board-card${dragIdx === dataIdx ? ' dragging' : ''}`}
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); setDragIdx(dataIdx); }}
                          onDragEnd={() => { setDragIdx(null); setDragOverCol(null); }}
                          onClick={() => navigate('kandidat-detail', { kandidat: { nama: k.nama, jabatan: k.jabatan, perusahaan: k.perusahaan, pengalaman: k.pengalaman, linkedin: k.linkedin } })}
                        >
                          <div style={{ position: 'absolute', top: 6, right: 8 }}>
                            <button className="sdk-board-card-menu" onClick={e => {
                              e.stopPropagation();
                              if (menuOpen?.idx === dataIdx) { setMenuOpen(null); return; }
                              const r = e.currentTarget.getBoundingClientRect();
                              setMenuOpen({ idx: dataIdx, right: window.innerWidth - r.right, top: r.bottom + 4 });
                            }} style={{ position: 'relative', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                              <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                                <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                                <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                                <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                              </svg>
                            </button>
                            {menuOpen?.idx === dataIdx && (
                              <div className="sdk-card-dropdown" onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: menuOpen.top, right: menuOpen.right, zIndex: 100000 }}>
                                <button className="sdk-card-dropdown-item" onClick={() => { setMenuOpen(null); alert('Tidak Sesuai'); }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                  Tidak Sesuai
                                </button>
                                <button className="sdk-card-dropdown-item danger" onClick={() => { setMenuOpen(null); alert('Hapus'); }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="sdk-board-card-name">{k.nama}</div>
                          <div className="sdk-board-card-job">{k.jabatan} at {k.perusahaan}</div>
                          <div className="sdk-board-card-exp">{k.pengalaman}</div>
                          <div
                            className={`sdk-skor-badge ${k.skor.level}`}
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setScorePanel(k); }}
                          >
                            <span>{k.skor.label}</span>
                            <span className={`sdk-skor-score ${k.skor.level}`}>{k.skor.score}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
