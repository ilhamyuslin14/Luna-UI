import { useState, useRef } from 'react';

const INITIAL_ROWS = [
  { posisi: 'Project Manager', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'rencana' },
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'aktif' },
  { posisi: 'UI/UX Designer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'ditahan' },
  { posisi: 'Data Analyst', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'selesai' },
  { posisi: 'Frontend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'dibatalkan' },
];

const STATUS_CONFIG = {
  rencana: { icon: '/assets/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status_dibatalkan.svg', label: 'Dibatalkan' },
};

const INITIAL_BOARD = {
  belum: { title: 'Belum Ada Kandidat', cards: [] },
  baru: {
    title: 'Kandidat Baru', cards: [
      { posisi: 'Project Manager', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'rencana', statusLabel: 'Rencana' },
      { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'aktif', statusLabel: 'Aktif' },
    ]
  },
  ditinjau: { title: 'Ditinjau', cards: [{ posisi: 'UI/UX Designer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'ditahan', statusLabel: 'Ditahan' }] },
  diajukan: { title: 'Diajukan', cards: [{ posisi: 'Data Analyst', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'selesai', statusLabel: 'Selesai' }] },
  penjadwalan: { title: 'Penjadwalan Wawancara', cards: [] },
  wawancaraHr: { title: 'Wawancara HR', cards: [{ posisi: 'Frontend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'dibatalkan', statusLabel: 'Dibatalkan' }] },
  wawancaraAkhir: { title: 'Wawancara Akhir', cards: [] },
  penawaran: { title: 'Penawaran Kerja', cards: [] },
  diterima: { title: 'Diterima', cards: [] },
  onboarding: { title: 'Onboarding', cards: [] },
  lolos: { title: 'Lolos Masa Percobaan', cards: [] },
};

export default function Seleksi({ navigate }) {
  const [isBoardView, setIsBoardView] = useState(false);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [openStatusIdx, setOpenStatusIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [archiveModal, setArchiveModal] = useState(null); // { title, body, onConfirm }
  const [boardColumns, setBoardColumns] = useState(INITIAL_BOARD);
  const [collapsedCols, setCollapsedCols] = useState(new Set());
  const [dragOverCol, setDragOverCol] = useState(null);
  const [openCardStatus, setOpenCardStatus] = useState(null); // { key, left, bottom }
  const [openCardMenu, setOpenCardMenu] = useState(null);    // { key, right, top }
  const draggedCard = useRef(null);
  const draggedFromCol = useRef(null);

  const selectAll = selectedRows.size === rows.length;

  const toggleSelectAll = () => {
    if (selectAll) setSelectedRows(new Set());
    else setSelectedRows(new Set(rows.map((_, i) => i)));
  };

  const toggleRow = (i) => {
    const next = new Set(selectedRows);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedRows(next);
  };

  const updateStatus = (rowIdx, newStatus) => {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, status: newStatus } : r));
    setOpenStatusIdx(null);
  };

  const handleArchive = () => {
    if (selectedRows.size === 0) return;
    const n = selectedRows.size;
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: `Apakah Anda yakin ingin mengarsipkan ${n} posisi yang dipilih?`,
      onConfirm: () => { setSelectedRows(new Set()); setShowBulkDropdown(false); setArchiveModal(null); },
    });
  };

  const handleDragStart = (colKey, cardIdx) => {
    draggedCard.current = { colKey, cardIdx };
    draggedFromCol.current = colKey;
  };

  const handleDrop = (targetColKey) => {
    const src = draggedCard.current;
    if (!src || src.colKey === targetColKey) return;
    setBoardColumns(prev => {
      const srcCards = [...prev[src.colKey].cards];
      const [card] = srcCards.splice(src.cardIdx, 1);
      const tgtCards = [...prev[targetColKey].cards, card];
      return { ...prev, [src.colKey]: { ...prev[src.colKey], cards: srcCards }, [targetColKey]: { ...prev[targetColKey], cards: tgtCards } };
    });
    draggedCard.current = null;
  };

  const updateCardStatus = (colKey, cardIdx, newStatus) => {
    setBoardColumns(prev => {
      const cards = prev[colKey].cards.map((c, i) =>
        i === cardIdx ? { ...c, status: newStatus, statusLabel: STATUS_CONFIG[newStatus].label } : c
      );
      return { ...prev, [colKey]: { ...prev[colKey], cards } };
    });
    setOpenCardStatus(null);
  };

  const archiveCard = (colKey, cardIdx) => {
    setOpenCardMenu(null);
    setArchiveModal({
      title: 'Arsipkan Posisi',
      body: 'Apakah Anda yakin ingin mengarsipkan posisi ini?',
      onConfirm: () => {
        setBoardColumns(prev => {
          const cards = prev[colKey].cards.filter((_, i) => i !== cardIdx);
          return { ...prev, [colKey]: { ...prev[colKey], cards } };
        });
        setArchiveModal(null);
      },
    });
  };

  const toggleColCollapse = (colKey) => {
    setCollapsedCols(prev => {
      const next = new Set(prev);
      if (next.has(colKey)) next.delete(colKey); else next.add(colKey);
      return next;
    });
  };

  const ActionsBar = ({ boardMode }) => (
    <div className="lw-actions-bar">
      <div className="lw-left-actions">
        <button className="lw-btn-primary" onClick={() => navigate('setup-penilaian')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg> Setup Penilaian
        </button>
      </div>
      <div className="lw-right-actions">
        <div className="lw-stats-badge">Jumlah Posisi : <strong>5</strong></div>
        <div className="lw-divider"></div>
        {!boardMode && selectedRows.size > 0 && (
          <div className="lw-bulk-container">
            <button className={`lw-btn-bulk${showBulkDropdown ? ' active' : ''}`} onClick={() => setShowBulkDropdown(v => !v)}>
              <div className="lw-bulk-badge" style={{ marginRight: 8 }}>{selectedRows.size}</div> Pilih Aksi
              <svg className="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 4 }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showBulkDropdown && (
              <div className="lw-bulk-dropdown active">
                <a href="#" className="bulk-dropdown-item" onClick={(e) => { e.preventDefault(); handleArchive(); }}>
                  <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" /></svg>
                  Arsipkan
                </a>
              </div>
            )}
          </div>
        )}
        <div className="lw-filter-container">
          <button className={`lw-btn-filter${showFilterDropdown ? ' active' : ''}`} onClick={() => setShowFilterDropdown(v => !v)}>
            <img src="/assets/line240.svg" /> Filter
          </button>
          {showFilterDropdown && (
            <div className="lw-filter-dropdown active">
              <div className="lw-filter-column w-status">
                <span className="lw-filter-column-title">Status</span>
                {['Aktif', 'Arsip'].map(s => (
                  <div key={s}>
                    <div className="lw-filter-item"><input type="checkbox" className="lw-filter-checkbox" /><label>{s}</label></div>
                    <div className="lw-filter-divider-horizontal"></div>
                  </div>
                ))}
              </div>
              <div className="lw-filter-divider-vertical"></div>
              <div className="lw-filter-column w-alur">
                <span className="lw-filter-column-title">Alur Seleksi</span>
                {['Kandidat Baru', 'Terseleksi', 'Diajukan', 'Penjadwalan Wawancara', 'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja', 'Diterima'].map(s => (
                  <div key={s}>
                    <div className="lw-filter-item"><input type="checkbox" className="lw-filter-checkbox" /><label>{s}</label></div>
                    <div className="lw-filter-divider-horizontal"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lw-view-toggle">
          <button className={`lw-toggle-item${boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(true)}>
            <img src="/assets/frame1000006975.svg" /> Papan
          </button>
          <button className={`lw-toggle-item${!boardMode ? ' active' : ''}`} onClick={() => setIsBoardView(false)}>
            <img src="/assets/fi_16116710.svg" /> List
          </button>
        </div>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="lw-pagination">
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
  );

  return (
    <div className="lw-view" onClick={(e) => {
      if (!e.target.closest('.lw-filter-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.lw-bulk-container')) setShowBulkDropdown(false);
      if (!e.target.closest('.lw-status-wrapper')) setOpenStatusIdx(null);
      if (!e.target.closest('.lw-board-card-status-wrap') && !e.target.closest('.lw-status-dropdown')) setOpenCardStatus(null);
      if (!e.target.closest('.lw-board-card-menu-wrap') && !e.target.closest('.lw-board-card-menu-dropdown')) setOpenCardMenu(null);
    }}>
      <div className="lw-header-container">
        <h1 className="lw-title">Seleksi</h1>
      </div>

      <ActionsBar boardMode={isBoardView} />

      {isBoardView ? (
        <div className="lw-board-container">
          <div className="lw-board-scroll">
            {Object.entries(boardColumns).map(([colKey, col]) => {
              const collapsed = collapsedCols.has(colKey);
              return (
                <div key={colKey} className={`lw-board-column${collapsed ? ' collapsed' : ''}`}>
                  <div className="lw-board-col-header">
                    <div className="lw-board-col-left">
                      <span className="lw-board-col-title">{col.title}</span>
                      {!collapsed && <span className="lw-board-col-count">{col.cards.length}</span>}
                    </div>
                    <button className="lw-board-col-collapse-btn" onClick={() => toggleColCollapse(colKey)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                        style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {!collapsed && (
                    <div
                      className={`lw-board-col-cards${dragOverCol === colKey ? ' drag-over' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOverCol(colKey); }}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null); }}
                      onDrop={() => { handleDrop(colKey); setDragOverCol(null); }}
                    >
                      {col.cards.map((card, cardIdx) => {
                        const cardKey = `${colKey}-${cardIdx}`;
                        return (
                          <div
                            key={cardIdx}
                            className="lw-board-card"
                            draggable
                            onDragStart={() => handleDragStart(colKey, cardIdx)}
                          >
                            <div className="lw-board-card-top">
                              <span className="lw-board-card-title">{card.posisi}</span>
                              <div className="lw-board-card-menu-wrap">
                                <button
                                  className="lw-board-card-menu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openCardMenu?.key === cardKey) { setOpenCardMenu(null); return; }
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setOpenCardMenu({ key: cardKey, right: window.innerWidth - r.right, top: r.bottom + 4 });
                                  }}
                                >
                                  <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                                    <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                                    <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                                    <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                                  </svg>
                                </button>
                                {openCardMenu?.key === cardKey && (
                                  <div className="lw-board-card-menu-dropdown" style={{ position: 'fixed', top: openCardMenu.top, right: openCardMenu.right }}>
                                    <button
                                      className="lw-board-card-menu-item"
                                      onClick={(e) => { e.stopPropagation(); archiveCard(colKey, cardIdx); }}
                                    >
                                      <svg width="11" height="11" viewBox="0 0 8.25 8.60156" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
                                      </svg>
                                      Arsipkan
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="lw-board-card-dept">{card.dept}</span>
                            <span className="lw-board-card-loc">{card.lokasi}</span>
                            <div className="lw-board-card-footer">
                              <div className="lw-board-card-status-wrap">
                                <button
                                  className={`lw-board-card-badge ${card.status}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openCardStatus?.key === cardKey) { setOpenCardStatus(null); return; }
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setOpenCardStatus({ key: cardKey, left: r.left, bottom: r.bottom });
                                  }}
                                >
                                  {card.statusLabel}
                                  <svg width="6" height="4" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 1L5 5L9 1" />
                                  </svg>
                                </button>
                                {openCardStatus?.key === cardKey && (
                                  <div
                                    className="lw-status-dropdown active"
                                    style={{ position: 'fixed', top: openCardStatus.bottom + 4, left: openCardStatus.left, bottom: 'auto' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                                      <div
                                        key={key}
                                        className="lw-status-dropdown-item"
                                        data-status={key}
                                        onClick={(e) => { e.stopPropagation(); updateCardStatus(colKey, cardIdx, key); }}
                                      >
                                        <div className="lw-icon-wrapper"><img src={s.icon} /></div>
                                        {s.label}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button className="lw-board-card-detail-btn" onClick={() => navigate('seleksi-detail', { jabatan: card.posisi })}>Detail</button>
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
        </div>
      ) : (
        <div className="lw-table-container">
          <table className="lw-table">
            <thead>
              <tr>
                <th width="24"><input type="checkbox" className="lw-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
                <th width="184">Posisi</th>
                <th width="130">Departemen</th>
                <th width="120">Lokasi</th>
                <th width="145">Status</th>
                <th width="124">Alur Seleksi</th>
                <th width="134">Jumlah Kandidat</th>
                <th width="108">Upah Min</th>
                <th width="100">Upah Maks</th>
                <th width="106">Tanggal Dibuat</th>
                <th width="83">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const cfg = STATUS_CONFIG[row.status];
                return (
                  <tr key={i}>
                    <td><input type="checkbox" className="lw-checkbox lw-row-checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} /></td>
                    <td className="lw-posisi clickable" onClick={() => navigate('seleksi-detail', { jabatan: row.posisi })}>{row.posisi}</td>
                    <td>{row.dept}</td>
                    <td>{row.lokasi}</td>
                    <td>
                      <div className="lw-status-wrapper" onClick={(e) => { e.stopPropagation(); setOpenStatusIdx(openStatusIdx === i ? null : i); }}>
                        <div className={`lw-status-bubble ${row.status}`}>
                          <div className="lw-status-content">
                            <div className="lw-icon-wrapper"><img src={cfg.icon} /></div>
                            <span className="lw-status-text">{cfg.label}</span>
                          </div>
                          <svg className="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        {openStatusIdx === i && (
                          <div className="lw-status-dropdown active">
                            {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                              <div key={key} className="lw-status-dropdown-item" data-status={key} onClick={(e) => { e.stopPropagation(); updateStatus(i, key); }}>
                                <div className="lw-icon-wrapper"><img src={s.icon} /></div> {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{row.alur}</td>
                    <td>{row.kandidat}</td>
                    <td>{row.upahMin}</td>
                    <td>{row.upahMaks}</td>
                    <td>{row.tanggal}</td>
                    <td>
                      <div className="lw-actions">
                        <button className="lw-btn-outline" onClick={() => setArchiveModal({ title: 'Arsipkan Posisi', body: 'Apakah Anda yakin ingin mengarsipkan posisi ini?', onConfirm: () => { setRows(prev => prev.filter((_, idx) => idx !== i)); setArchiveModal(null); } })}><img src="/assets/archive.svg" style={{ marginRight: 4.5 }} /> Arsipkan</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination />

      {archiveModal && (
        <div className="dept-modal-overlay" onClick={() => setArchiveModal(null)}>
          <div className="dept-modal dept-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="dept-modal-confirm-text">
              <p className="dept-modal-title" style={{ fontSize: '18px' }}>{archiveModal.title}</p>
              <p className="dept-modal-subtitle">{archiveModal.body}</p>
            </div>
            <div className="dept-modal-footer dept-modal-footer-stretch">
              <button className="dept-modal-btn-cancel dept-modal-btn-cancel-lg" onClick={() => setArchiveModal(null)}>Batal</button>
              <button className="dept-modal-btn-primary dept-modal-btn-primary-lg" onClick={archiveModal.onConfirm}>Arsipkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
