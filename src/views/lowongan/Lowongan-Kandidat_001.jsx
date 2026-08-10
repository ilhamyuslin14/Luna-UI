import { useState, useRef, useEffect } from 'react';
import KandidatPenilaian from '../kandidat/Kandidat-Penilaian.jsx';
import Pagination from '../../components/Pagination.jsx';
import BackButton from '../../components/BackButton.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import PopupTidakSesuai from '../../components/PopupTidakSesuai.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getScoringBySeleksi, updateAlurProses, markTidakSesuai } from '../../services/scoringService.js';
import { invalidate } from '../../services/dataCache.js';
import { getAlurSeleksi, seedDefaultAlur, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';

const IconPapan = () => (
  <svg width="14" height="14" viewBox="0 0 12.79 12.79" fill="none">
    <path d="M8.46622 0.5H4.32378C2.21197 0.5 0.5 2.21197 0.5 4.32378V8.46622C0.5 10.578 2.21197 12.29 4.32378 12.29H8.46622C10.578 12.29 12.29 10.578 12.29 8.46622V4.32378C12.29 2.21197 10.578 0.5 8.46622 0.5Z" stroke="currentColor" />
    <path d="M3.6367 9.08418V5.83461M6.47331 9.08418V3.70285M9.15314 9.08418V5.00421" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

const IconList = () => (
  <svg width="13" height="13" viewBox="0 0 12 12.1471" fill="none">
    <path d="M7.78346 0.0789063H7.90162C8.0246 0.0789862 8.14211 0.129039 8.22779 0.217578L11.2874 3.40508C11.3682 3.48895 11.4142 3.60211 11.4143 3.71855V9.25566C11.4252 10.7711 10.2446 12.0093 8.72682 12.0711L3.81666 12.0721C2.29326 12.0376 1.08031 10.7699 1.11354 9.2459V2.78398C1.14883 1.28555 2.38665 0.0789063 3.87428 0.0789063H7.7024C7.71566 0.0777304 7.72889 0.075008 7.74244 0.075C7.75624 0.075 7.76997 0.0776972 7.78346 0.0789063ZM3.87525 0.985156C2.87437 0.985194 2.04334 1.79601 2.01979 2.7957V9.25566C1.99744 10.2904 2.81274 11.1428 3.83717 11.1658H8.70826C9.71636 11.1241 10.5152 10.2864 10.5081 9.25957V4.29375H9.2942C8.18878 4.29073 7.28932 3.38917 7.28932 2.28496V0.985156H3.87525ZM7.63014 7.69219C7.88007 7.69235 8.08326 7.89534 8.08326 8.14531C8.08322 8.39525 7.88005 8.59827 7.63014 8.59844H4.36842C4.11837 8.59844 3.91534 8.39535 3.91529 8.14531C3.91529 7.89523 4.11834 7.69219 4.36842 7.69219H7.63014ZM6.39479 5.42266C6.64469 5.42286 6.84791 5.62583 6.84791 5.87578C6.84787 6.1257 6.64466 6.3287 6.39479 6.32891H4.36744C4.11739 6.32891 3.91436 6.12582 3.91432 5.87578C3.91432 5.6257 4.11736 5.42266 4.36744 5.42266H6.39479ZM8.19557 2.28496C8.19557 2.89143 8.68931 3.38569 9.29518 3.3875H10.0149L8.19557 1.49199V2.28496Z" fill="currentColor" />
  </svg>
);

/* ── helpers ─────────────────────────────────────────────── */
function scoreLevelFromValue(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 20) return 'low';
  return 'none';
}

const LEVEL_LABEL = { high: 'Tinggi', moderate: 'Sedang', low: 'Rendah', none: '-', belum_dinilai: 'Belum Dinilai' };

const KATEGORI_LEVEL = {
  'Sangat Fit': 'high', 'Fit': 'high',
  'Cukup Fit': 'moderate', 'Kurang Fit': 'low',
};

// Baris scoring dgn total_score & kategori_fit null hanya terjadi lewat
// jalur skip-scoring paket Free (lihat run-scoring/index.ts) — kombinasi ini
// tidak pernah muncul dari hasil AI yang normal, jadi aman dipakai sbg penanda.
function mapScoringRow(s) {
  const belumDinilai = s.total_score == null && s.kategori_fit == null;
  const level = belumDinilai ? 'belum_dinilai' : (KATEGORI_LEVEL[s.kategori_fit] || scoreLevelFromValue(s.total_score ?? 0));
  const aiOutput = s.detail_kriteria || [];
  const getAiMatch = (rawTag) => {
    if (!rawTag || aiOutput.length === 0) return null;
    const normTag = rawTag.toLowerCase().trim();
    let match = aiOutput.find(ai => ai.tag && ai.tag.toLowerCase().trim() === normTag);
    if (!match) {
      match = aiOutput.find(ai => {
        if (!ai.tag) return false;
        const t = ai.tag.toLowerCase().trim();
        return t.includes(normTag) || normTag.includes(t);
      });
    }
    return match;
  };

  const toItemFromRaw = rawKrit => {
    const aiMatch = getAiMatch(rawKrit.tag);
    const scoreVal = aiMatch ? (aiMatch.score_evaluate ?? 0) : 0;
    return {
      level: scoreLevelFromValue(scoreVal),
      name: rawKrit.tag || 'Kriteria',
      desc: aiMatch ? (aiMatch.evidence || 'Tidak ada analisis dari AI.') : 'Analisis AI tidak tersedia untuk kriteria ini.',
      req: rawKrit.teks || '',
      bobot: rawKrit.kategori === 'Wajib' ? 'tinggi' : 'rendah',
      score: scoreVal,
    };
  };

  const rawKriteriaList = s.raw_kriteria || [];
  const criteriaData = rawKriteriaList.filter(k => k.kategori === 'Wajib').map(toItemFromRaw);
  const prefData     = rawKriteriaList.filter(k => k.kategori !== 'Wajib').map(toItemFromRaw);

  return {
    scoringId: s.id,
    kandidatId: s.kandidat?.id || s.kandidat_id,
    nama_lengkap: s.kandidat?.nama_lengkap || '-',
    nama: s.kandidat?.nama_lengkap || '-',
    sumber: s.kandidat?.sumber || '',
    jabatan: s.kandidat?.jabatan_saat_ini || '-',
    jabatanDilamar: s.seleksi?.jabatan || '-',
    departemen: s.seleksi?.departments?.name || '',
    perusahaan: s.kandidat?.perusahaan_saat_ini || '-',
    pengalaman: s.kandidat?.pengalaman_tahun ? `${s.kandidat.pengalaman_tahun} Tahun` : '-',
    linkedin: s.kandidat?.linkedin_url || '-',
    domisili: s.kandidat?.domisili || '-',
    alur: s.alur_proses ?? 1,
    alasan: s.alasan_tidak_sesuai || '',
    detail: s.alasan_tidak_sesuai_detail || '',
    skor: {
      level,
      label: LEVEL_LABEL[level] || '-',
      score: belumDinilai ? null : (s.total_score ?? 0),
      belumDinilai,
      aiSummary: s.ai_summary || '',
      criteriaData,
      prefData,
    },
  };
}

/* ── icons ───────────────────────────────────────────────── */
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

const Cb = ({ checked, onChange }) => (
  <label className="sdk001-cb">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="sdk001-cb-box" />
  </label>
);

/* ── main component ──────────────────────────────────────── */
export default function LowonganKandidat_001({ navigate, back, seleksiId }) {
  const { companyId } = useAuth();
  const [data, setData] = useState([]);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('skor_desc');
  const [showBulk, setShowBulk] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [alurOpen, setAlurOpen] = useState(null);
  const [collapsedCols, setCollapsedCols] = useState(new Set([0]));
  const [draggedScoringId, setDraggedScoringId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [scorePanel, setScorePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  const [hoveredScore, setHoveredScore] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!companyId) return;
    seedDefaultAlur(companyId);
    getAlurSeleksi(companyId).then(setAlurList).catch(() => { });
  }, [companyId]);

  useEffect(() => {
    if (!seleksiId) { setIsLoading(false); return; }
    setIsLoading(true);
    getScoringBySeleksi(seleksiId)
      .then(rows => {
        const mapped = rows
          .filter(s => !s.kandidat?.arsip)
          .map(mapScoringRow)
          .sort((a, b) => (b.skor.score ?? 0) - (a.skor.score ?? 0));
        setData(mapped);
      })
      .catch(err => { console.error(err); showToast('Gagal memuat data', err.message); })
      .finally(() => setIsLoading(false));
  }, [seleksiId]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setPage(1);
  };

  const alurNama = (level) => alurList.find(a => a.level === level)?.nama ?? `Level ${level}`;

  const penilaianOpts = new Set(['Tinggi', 'Sedang', 'Rendah']);
  let filteredData = activeFilters.size === 0 ? data : data.filter(k => {
    const penilaianFilters = [...activeFilters].filter(f => penilaianOpts.has(f));
    const alurFilters = [...activeFilters].filter(f => !penilaianOpts.has(f));
    if (penilaianFilters.length > 0) {
      const levelMap = { Tinggi: 'high', Sedang: 'moderate', Rendah: 'low' };
      if (!penilaianFilters.some(f => levelMap[f] === k.skor.level)) return false;
    }
    if (alurFilters.length > 0 && !alurFilters.some(f => f === alurNama(k.alur))) return false;
    return true;
  });

  filteredData = [...filteredData].sort((a, b) => {
    switch (activeSort) {
      case 'skor_desc': return (b.skor.score ?? 0) - (a.skor.score ?? 0);
      case 'skor_asc': return (a.skor.score ?? 0) - (b.skor.score ?? 0);
      case 'nama_asc': return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
      case 'nama_desc': return (b.nama_lengkap || '').localeCompare(a.nama_lengkap || '');
      default: return 0;
    }
  });

  // exclude "Tidak Sesuai" candidates from the list view — they only appear in the board's Tidak Sesuai column
  const listData = filteredData.filter(k => k.alur !== 0);

  const totalPages = Math.max(1, Math.ceil(listData.length / perPage));
  const pagedData = listData.slice((page - 1) * perPage, page * perPage);

  const allSelected = pagedData.length > 0 && pagedData.every(k => selected.has(k.scoringId));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) pagedData.forEach(k => next.delete(k.scoringId));
    else pagedData.forEach(k => next.add(k.scoringId));
    setSelected(next);
  };
  const toggleRow = (scoringId) => { const s = new Set(selected); s.has(scoringId) ? s.delete(scoringId) : s.add(scoringId); setSelected(s); };

  const updateAlur = (scoringId, level) => {
    const row = data.find(r => r.scoringId === scoringId);
    if (!row) return;
    setData(prev => prev.map(item => item.scoringId === scoringId ? { ...item, alur: level } : item));
    setAlurOpen(null);
    updateAlurProses(scoringId, level)
      .then(() => { invalidate('karyawan'); showToast('Alur berhasil diubah', `Kandidat dipindahkan ke ${alurNama(level)}`); })
      .catch(err => {
        console.error('Gagal update alur:', err);
        setData(prev => prev.map(item => item.scoringId === scoringId ? { ...item, alur: row.alur } : item));
        showToast('Gagal memperbarui alur', err.message);
      });
  };

  const toggleCol = (level) => {
    const s = new Set(collapsedCols);
    s.has(level) ? s.delete(level) : s.add(level);
    setCollapsedCols(s);
  };

  return (
    <div
      className="sdk001-root"
      onClick={(e) => {
        if (!e.target.closest('.filter-dropdown-container')) setShowFilter(false);
        if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
        if (!e.target.closest('.sdk001-alur-cell')) setAlurOpen(null);
        if (!e.target.closest('.bulk-aksi-container')) setShowBulk(false);
        if (!e.target.closest('.sdk001-board-card-menu') && !e.target.closest('.sdk001-card-dropdown')) setMenuOpen(null);
      }}
    >
      {/* Actions Bar */}
      <div className="sdk001-actions-bar">
        {back && <BackButton onClick={back} />}
        <div className="sdk001-right-actions" style={!back ? { marginLeft: 'auto' } : {}}>
          <div className="sdk001-stats-badge">{filteredData.length} kandidat</div>

          {selected.size > 0 && (
            <CTABulkAksi
              count={selected.size}
              isOpen={showBulk}
              onToggle={() => { setShowSortDropdown(false); setShowFilter(false); setShowBulk(v => !v); }}
              actions={[
                { icon: <RejectSvg />, label: 'Tidak Sesuai', onClick: () => { setDropTarget('bulk'); setDropModalOpen(true); } },
              ]}
            />
          )}

          <SortDropdown
            options={[
              { label: 'Skor Tertinggi', value: 'skor_desc' },
              { label: 'Skor Terendah', value: 'skor_asc' },
              { label: 'Nama (A-Z)', value: 'nama_asc' },
              { label: 'Nama (Z-A)', value: 'nama_desc' }
            ]}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            isOpen={showSortDropdown}
            onToggleOpen={() => { setShowBulk(false); setShowFilter(false); setShowSortDropdown(v => !v); }}
          />

          <FilterDropdown
            groups={[
              { title: 'Penilaian', options: ['Tinggi', 'Sedang', 'Rendah'] },
              { title: 'Tahap Rekrutmen', options: alurList.filter(a => a.level !== 0).map(a => a.nama) },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilter}
            onToggleOpen={() => { setShowBulk(false); setShowSortDropdown(false); setShowFilter(v => !v); }}
          />

          <div className="sdk001-view-toggle">
            <button className={`sdk001-view-btn sdk001-view-papan${viewMode === 'board' ? ' active' : ''}`} onClick={() => setViewMode('board')}>
              <IconPapan /> Papan
            </button>
            <button className={`sdk001-view-btn sdk001-view-list${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>
              <IconList /> List
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="sdk001-table-container">
            <table className="sdk001-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}><Cb checked={allSelected} onChange={toggleAll} /></th>
                  <th style={{ width: 220 }}>Nama Kandidat</th>
                  <th style={{ width: 240 }}>Jabatan</th>
                  <th style={{ width: 220 }}>LinkedIn</th>
                  <th style={{ width: 140 }}>Domisili</th>
                  <th style={{ width: 160 }}>Tahap Rekrutmen</th>
                  <th style={{ width: 190 }}>Penilaian</th>
                  <th style={{ width: 130 }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24, color: '#888' }}>Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24, color: '#888' }}>Belum ada kandidat pada posisi ini.</td></tr>
                ) : listData.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24, color: '#888' }}>Tidak ada kandidat yang sesuai pada posisi ini.</td></tr>
                ) : pagedData.map((k) => (
                  <tr key={k.scoringId}>
                    <td><Cb checked={selected.has(k.scoringId)} onChange={() => toggleRow(k.scoringId)} /></td>
                    <td className="sdk001-name" style={{ maxWidth: 220 }} onClick={() => navigate('kandidat-detail_001', { kandidat: { id: k.kandidatId, nama_lengkap: k.nama } })}>
                      <span className="sdk001-name-cell">
                        <span className="sdk001-name-text">{k.nama}</span>
                        {k.sumber === 'public' && (
                          <span className="sdk001-src-badge">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" />
                            </svg>
                            <span className="sdk001-src-badge-tip">Melamar mandiri via Portal Karier</span>
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ maxWidth: 250 }}>
                      <div className="sdk001-jabatan-cell">
                        <span className="sdk001-jabatan" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.jabatan}{k.perusahaan !== '-' ? ` at ${k.perusahaan}` : ''}</span>
                        <span className="sdk001-pengalaman">{k.pengalaman}</span>
                      </div>
                    </td>
                    <td className="sdk001-linkedin" style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {k.linkedin !== '-' ? (
                        <a 
                          href={k.linkedin.startsWith('http') ? k.linkedin : `https://${k.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--luna-orange-500)', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {k.linkedin}
                        </a>
                      ) : '-'}
                    </td>
                    <td style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {k.domisili}
                    </td>
                    <td className="sdk001-alur-cell" onClick={e => e.stopPropagation()}>
                      <div className="sdk001-alur-badge" onClick={() => setAlurOpen(alurOpen === k.scoringId ? null : k.scoringId)}>
                        <span>{alurNama(k.alur)}</span>
                        <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
                          <path d="M0.5 0.5L3 3L5.5 0.5" stroke="#323b4d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {alurOpen === k.scoringId && (
                        <div className="sdk001-alur-dropdown">
                          {alurList.filter(opt => opt.level !== 0).map(opt => (
                            <button key={opt.level} className={`sdk001-alur-option${k.alur === opt.level ? ' active' : ''}`} onClick={() => updateAlur(k.scoringId, opt.level)}>
                              {opt.nama}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div
                        className={`sdk001-skor-badge ${k.skor.level}`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setScorePanel({ ...k, seleksiId }); }}
                      >
                        <span>{k.skor.label}</span>
                        <span className={`sdk001-skor-score ${k.skor.level}`}>{k.skor.belumDinilai ? '—' : k.skor.score}</span>
                      </div>
                    </td>
                    <td>
                      <button className="sdk001-detail-btn" onClick={(e) => { e.stopPropagation(); setScorePanel({ ...k, seleksiId }); }}>Detail Penilaian</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
            onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          />
        </>
      )}

      {scorePanel && (
        <KandidatPenilaian
          kandidat={scorePanel}
          navigate={navigate}
          onClose={() => setScorePanel(null)}
          onReject={() => { setScorePanel(null); setDropTarget(scorePanel); setDropModalOpen(true); }}
          onRescored={() => {
            getScoringBySeleksi(seleksiId).then(rows => {
              const mapped = rows
                .filter(s => !s.kandidat?.arsip)
                .map(mapScoringRow)
                .sort((a, b) => (b.skor.score ?? 0) - (a.skor.score ?? 0));
              setData(mapped);
            }).catch(() => { });
          }}
          onAlurChanged={(scoringId, level) => {
            setData(prev => prev.map(item => item.scoringId === scoringId ? { ...item, alur: level } : item));
            setScorePanel(prev => prev && prev.scoringId === scoringId ? { ...prev, alur: level } : prev);
          }}
        />
      )}

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="sdk001-board-scroll">
          {alurList.map(col => {
            const collapsed = collapsedCols.has(col.level);
            const colItems = filteredData.filter(k => k.alur === col.level);
            return (
              <div key={col.level} className={`sdk001-board-col${collapsed ? ' collapsed' : ''}`}>
                <div className="sdk001-board-col-header">
                  <span className="sdk001-board-col-title">{col.nama}</span>
                  <button className="sdk001-board-col-collapse" onClick={(e) => { e.stopPropagation(); toggleCol(col.level); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                      <path d="M10 12L6 8L10 4" stroke="#7e8799" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {!collapsed && (
                  <div
                    className={`sdk001-board-col-body${dragOverCol === col.level ? ' drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.level); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedScoringId !== null) {
                        if (col.level === 0) {
                          setDropTarget({ scoringId: draggedScoringId });
                          setDropModalOpen(true);
                        } else {
                          updateAlur(draggedScoringId, col.level);
                        }
                      }
                      setDraggedScoringId(null);
                      setDragOverCol(null);
                    }}
                  >
                    {colItems.length === 0 && !isLoading && (
                      <div style={{ fontSize: 11, color: '#c4c9d4', textAlign: 'center', padding: '16px 8px' }}>Belum ada kandidat</div>
                    )}
                    {colItems.map((k) => {
                      return (
                        <div
                          key={k.scoringId}
                          className={`sdk001-board-card${draggedScoringId === k.scoringId ? ' dragging' : ''}`}
                          draggable={k.alur !== 0}
                          onDragStart={(e) => { 
                            if (k.alur === 0) {
                              e.preventDefault();
                              return;
                            }
                            e.stopPropagation(); 
                            setDraggedScoringId(k.scoringId); 
                          }}
                          onDragEnd={() => { setDraggedScoringId(null); setDragOverCol(null); }}
                          onClick={() => navigate('kandidat-detail_001', { kandidat: { id: k.kandidatId, nama_lengkap: k.nama } })}
                        >
                          <div style={{ position: 'absolute', top: 6, right: 8 }}>
                            <button className="sdk001-board-card-menu" onClick={e => {
                              e.stopPropagation();
                              if (menuOpen?.idx === k.scoringId) { setMenuOpen(null); return; }
                              const r = e.currentTarget.getBoundingClientRect();
                              setMenuOpen({ idx: k.scoringId, right: window.innerWidth - r.right, top: r.bottom + 4 });
                            }} style={{ position: 'relative', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                              <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                                <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                                <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                                <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                              </svg>
                            </button>
                            {menuOpen?.idx === k.scoringId && (
                              <div className="sdk001-card-dropdown" onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: menuOpen.top, right: menuOpen.right, zIndex: 100000 }}>
                                <button className="sdk001-card-dropdown-item" onClick={() => { setMenuOpen(null); setDropTarget(k); setDropModalOpen(true); }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                  Tidak Sesuai
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="sdk001-board-card-name">{k.nama}</div>
                          <div className="sdk001-board-card-job">{k.jabatan}{k.perusahaan !== '-' ? ` at ${k.perusahaan}` : ''}</div>
                          <div className="sdk001-board-card-exp">{k.pengalaman}</div>
                          <div style={{ position: 'relative' }} onMouseLeave={() => setHoveredScore(null)}>
                            <div
                              className={`sdk001-skor-badge ${k.skor.level}`}
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); setScorePanel({ ...k, seleksiId }); }}
                              onMouseEnter={(e) => {
                                const badgeRect = e.currentTarget.getBoundingClientRect();
                                const cardEl = e.currentTarget.closest('.sdk001-board-card');
                                const cardRect = cardEl ? cardEl.getBoundingClientRect() : badgeRect;
                                setHoveredScore({ idx: k.scoringId, top: badgeRect.bottom, left: cardRect.left, width: cardRect.width });
                              }}
                            >
                              <span>{k.skor.label}</span>
                              <span className={`sdk001-skor-score ${k.skor.level}`}>{k.skor.belumDinilai ? '—' : k.skor.score}</span>
                            </div>
                            {hoveredScore?.idx === k.scoringId && (
                              <div className="sdk001-score-popover-wrapper" onClick={e => e.stopPropagation()} style={{ top: hoveredScore.top, left: hoveredScore.left, width: hoveredScore.width }}>
                                <div className="sdk001-score-popover">
                                  {k.skor.belumDinilai ? (
                                    <div className="sdk001-score-locked">
                                      <p>Kandidat ini belum dinilai AI — paket Free tidak termasuk skoring otomatis.</p>
                                      <button className="sdk001-score-action" onClick={() => navigate('paket-langganan')}>
                                        Upgrade Paket
                                      </button>
                                    </div>
                                  ) : (
                                  <>
                                  <div className="sdk001-score-popover-top">
                                    <div className="sdk001-score-donut" style={{
                                      background: `conic-gradient(${k.skor.level === 'high' ? '#089f32' : k.skor.level === 'moderate' ? '#da8700' : '#fb484b'} ${k.skor.score}%, #f0f2f6 ${k.skor.score}%)`
                                    }}>
                                      <span className="sdk001-score-donut-val" style={{ color: k.skor.level === 'high' ? '#089f32' : k.skor.level === 'moderate' ? '#da8700' : '#fb484b' }}>{k.skor.score}</span>
                                      <span className="sdk001-score-donut-lbl" style={{ color: k.skor.level === 'high' ? '#089f32' : k.skor.level === 'moderate' ? '#da8700' : '#fb484b' }}>
                                        {k.skor.level === 'high' ? 'High' : k.skor.level === 'moderate' ? 'Moderate' : 'Low'}
                                      </span>
                                    </div>
                                    <div className="sdk001-score-stats">
                                      <span className="sdk001-stat-pill tinggi">Tinggi: {k.skor.criteriaData?.filter(c => c.level === 'high').length ?? 0}/{k.skor.criteriaData?.length ?? 0}</span>
                                      <span className="sdk001-stat-pill sedang">Sedang: {k.skor.criteriaData?.filter(c => c.level === 'moderate').length ?? 0}/{k.skor.criteriaData?.length ?? 0}</span>
                                      <span className="sdk001-stat-pill rendah">Rendah: {(k.skor.criteriaData?.filter(c => c.level === 'low').length ?? 0) + (k.skor.criteriaData?.filter(c => c.level === 'none').length ?? 0)}/{k.skor.criteriaData?.length ?? 0}</span>
                                    </div>
                                  </div>
                                  <button className="sdk001-score-action" onClick={() => setScorePanel({ ...k, seleksiId })}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                                    </svg>
                                    Lihat Ringkasan AI
                                  </button>
                                  </>
                                  )}
                                </div>
                              </div>
                            )}
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

      {dropModalOpen && (
        <PopupTidakSesuai
          targetText={dropTarget === 'bulk' ? `${selected.size} kandidat` : 'Kandidat'}
          onConfirm={async (reason, detail) => {
            const isBulk = dropTarget === 'bulk';
            setDropModalOpen(false);
            const ids = isBulk ? [...selected] : [dropTarget?.scoringId].filter(Boolean);
            try {
              await Promise.all(ids.map(id => markTidakSesuai(id, reason, detail)));
              setData(prev => prev.map(r => ids.includes(r.scoringId) ? { ...r, alur: 0 } : r));
              if (isBulk) { setSelected(new Set()); setShowBulk(false); }
              else setMenuOpen(null);
              showToast(
                isBulk ? `${ids.length} kandidat ditandai tidak sesuai` : 'Kandidat ditandai tidak sesuai',
                `Alasan: ${reason}`
              );
            } catch {
              showToast('Gagal', 'Gagal menandai tidak sesuai');
            }
          }}
          onClose={() => setDropModalOpen(false)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
