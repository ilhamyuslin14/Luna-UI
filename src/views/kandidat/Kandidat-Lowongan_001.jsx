import { useState, useEffect, useRef } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';
import Pagination from '../../components/Pagination.jsx';
import BackButton from '../../components/BackButton.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getScoringByKandidat, updateAlurProses } from '../../services/scoringService.js';
import { invalidate } from '../../services/dataCache.js';
import { getAlurSeleksi, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';

const FIT_CONFIG = {
  high: { label: 'Tinggi', border: '#a3e1b0', chip: '#089f32' },
  moderate: { label: 'Sedang', border: '#ffd086', chip: '#f8aa01' },
  low: { label: 'Rendah', border: '#fca5a5', chip: '#fb484b' },
  belum_dinilai: { label: 'Belum Dinilai', border: 'var(--color-neutral-400)', chip: 'var(--color-neutral-400)' },
};

const KATEGORI_TO_FIT = {
  'Sangat Fit': 'high', 'Fit': 'high',
  'Cukup Fit': 'moderate', 'Kurang Fit': 'low',
};

function scoreLevelFromValue(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 20) return 'low';
  return 'none';
}

function mapRow(s, alurList) {
  const belumDinilai = s.total_score == null && s.kategori_fit == null;
  const fit = belumDinilai ? 'belum_dinilai' : (KATEGORI_TO_FIT[s.kategori_fit] || scoreLevelFromValue(s.total_score ?? 0));
  const alur = s.alur_proses ?? 1;
  const alurNama = alurList.find(a => a.level === alur)?.nama ?? `Level ${alur}`;
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
    id: s.id,
    seleksiId: s.seleksi_id,
    posisi: s.seleksi?.jabatan || '-',
    departemen: s.seleksi?.departments?.name || '-',
    alur,
    alurNama,
    alasan: s.alasan_tidak_sesuai || '',
    detail: s.alasan_tidak_sesuai_detail || '',
    skor: belumDinilai ? null : (s.total_score ?? 0),
    belumDinilai,
    fit,
    skor_obj: {
      level: fit,
      score: belumDinilai ? null : (s.total_score ?? 0),
      belumDinilai,
      aiSummary: s.ai_summary || '',
      criteriaData: criteriaData,
      prefData: prefData,
    },
  };
}

const ChevronDown = () => (
  <svg width="6" height="4" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1L5 5L9 1" />
  </svg>
);

export default function KandidatLowongan_001({ back, navigate, kandidat }) {
  const { companyId } = useAuth();
  const [rows, setRows] = useState([]);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('skor_desc');
  const [openAlurRow, setOpenAlurRow] = useState(null);
  const [scorePanel, setScorePanel] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const kandidatId = typeof kandidat === 'string' ? kandidat : kandidat?.id;
    if (!kandidatId || !companyId) { setIsLoading(false); return; }

    Promise.all([
      getScoringByKandidat(kandidatId),
      getAlurSeleksi(companyId),
    ]).then(([scoringRows, alur]) => {
      setAlurList(alur);
      // Deduplicate: latest per seleksi
      const latest = {};
      (scoringRows || []).forEach(s => { if (!latest[s.seleksi_id]) latest[s.seleksi_id] = s; });
      setRows(Object.values(latest).map(s => mapRow(s, alur)));
    }).catch(err => {
      console.error(err);
      showToast('Gagal memuat data', err.message);
    }).finally(() => setIsLoading(false));
  }, [kandidat, companyId]);

  const FIT_LEVEL_MAP = { Tinggi: 'high', Sedang: 'moderate', Rendah: 'low' };
  let filteredRows = activeFilters.size === 0
    ? rows
    : rows.filter(r => [...activeFilters].some(f => FIT_LEVEL_MAP[f] === r.fit));

  filteredRows = [...filteredRows].sort((a, b) => {
    switch (activeSort) {
      case 'skor_desc': return b.skor - a.skor;
      case 'skor_asc': return a.skor - b.skor;
      case 'posisi_asc': return (a.posisi || '').localeCompare(b.posisi || '');
      case 'posisi_desc': return (b.posisi || '').localeCompare(a.posisi || '');
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setPage(1);
  };

  const alurNama = (level) => alurList.find(a => a.level === level)?.nama ?? `Level ${level}`;

  const updateAlur = (scoringId, level) => {
    const row = rows.find(r => r.id === scoringId);
    if (!row) return;
    setRows(prev => prev.map(r => r.id === scoringId ? { ...r, alur: level, alurNama: alurNama(level) } : r));
    setOpenAlurRow(null);
    updateAlurProses(scoringId, level)
      .then(() => { invalidate('karyawan'); showToast('Alur berhasil diubah', `Dipindahkan ke ${alurNama(level)}`); })
      .catch(err => {
        setRows(prev => prev.map(r => r.id === scoringId ? { ...r, alur: row.alur, alurNama: row.alurNama } : r));
        showToast('Gagal memperbarui alur', err.message);
      });
  };

  const kandidatId = typeof kandidat === 'string' ? kandidat : kandidat?.id;
  const openPanel = (row) => setScorePanel({
    scoringId: row.id,
    kandidatId,
    seleksiId: row.seleksiId,
    nama: kandidat?.nama || kandidat?.nama_lengkap || row.posisi,
    jabatan: row.posisi,
    departemen: row.departemen,
    alur: row.alur,
    skor: row.skor_obj,
  });

  return (
    <div className="ks001-view" onClick={e => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilter(false);
      if (!e.target.closest('.sort-dropdown-container')) setShowSortDropdown(false);
      if (!e.target.closest('.ks001-alur-wrap')) setOpenAlurRow(null);
    }}>

      {/* ── Action bar ── */}
      <div className="ks001-action-bar">
        <BackButton onClick={() => back ? back() : navigate?.('kandidat')} />
        <div className="ks001-right-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <SortDropdown
            options={[
              { label: 'Skor Tertinggi', value: 'skor_desc' },
              { label: 'Skor Terendah', value: 'skor_asc' },
              { label: 'Posisi (A-Z)', value: 'posisi_asc' },
              { label: 'Posisi (Z-A)', value: 'posisi_desc' }
            ]}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            isOpen={showSortDropdown}
            onToggleOpen={() => { setShowFilter(false); setShowSortDropdown(v => !v); }}
          />
          <FilterDropdown
            groups={[{ title: 'Penilaian', options: ['Tinggi', 'Sedang', 'Rendah'] }]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilter}
            onToggleOpen={e => { e?.stopPropagation(); setShowSortDropdown(false); setShowFilter(v => !v); }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="ks001-table">
        <div className="ks001-table-head">
          <div className="ks001-col-posisi">Posisi</div>
          <div className="ks001-col-departemen">Departemen</div>
          <div className="ks001-col-alur">Tahap Rekrutmen</div>
          <div className="ks001-col-skor">Penilaian</div>
          <div className="ks001-col-action" />
        </div>

        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: 14 }}>Memuat data...</div>
        ) : pagedRows.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: 14 }}>
            {rows.length === 0 ? 'Kandidat belum mengikuti seleksi apapun.' : 'Tidak ada hasil yang sesuai filter.'}
          </div>
        ) : pagedRows.map(row => {
          const fit = FIT_CONFIG[row.fit] || FIT_CONFIG.low;
          return (
            <div className="ks001-table-row" key={row.id}>
              <div className="ks001-col-posisi">
                <span className="ks001-posisi-link" onClick={() => navigate?.('lowongan-detail_001', { seleksiId: row.seleksiId, jabatan: row.posisi, activeTab: 'kandidat' })}>{row.posisi}</span>
              </div>

              <div className="ks001-col-departemen" style={{ fontSize: '12px', color: '#555f71' }}>
                {row.departemen}
              </div>

              <div className="ks001-col-alur">
                <div className="ks001-alur-wrap">
                  <button
                    className="ks001-alur-badge"
                    onClick={e => { e.stopPropagation(); setOpenAlurRow(openAlurRow === row.id ? null : row.id); }}
                  >
                    <span>{row.alurNama}</span>
                    <ChevronDown />
                  </button>
                  {openAlurRow === row.id && (
                    <div className="ks001-alur-dropdown">
                      {alurList.filter(opt => opt.level !== 0).map(opt => (
                        <button
                          key={opt.level}
                          className={`ks001-alur-option${row.alur === opt.level ? ' active' : ''}`}
                          onClick={e => { e.stopPropagation(); updateAlur(row.id, opt.level); }}
                        >
                          {opt.nama}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ks001-col-skor">
                <div className="ks001-fit-badge" style={{ borderColor: fit.border, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); openPanel(row); }}>
                  <span className="ks001-fit-label">{fit.label}</span>
                  <span className="ks001-fit-chip" style={{ background: fit.chip }}>{row.belumDinilai ? '—' : row.skor}</span>
                </div>
              </div>

              <div className="ks001-col-action">
                <span className="ks001-detail-link" onClick={e => { e.stopPropagation(); openPanel(row); }}>Detail Penilaian</span>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        page={page}
        total={totalPages}
        perPage={perPage}
        onPageChange={p => setPage(Math.max(1, Math.min(p, totalPages)))}
        onPerPageChange={n => { setPerPage(n); setPage(1); }}
      />

      {scorePanel && (
        <KandidatPenilaian
          kandidat={scorePanel}
          navigate={navigate}
          onClose={() => setScorePanel(null)}
          onRescored={() => {
            if (!kandidatId) return;
            getScoringByKandidat(kandidatId).then(scoringRows => {
              const latest = {};
              (scoringRows || []).forEach(s => { if (!latest[s.seleksi_id]) latest[s.seleksi_id] = s; });
              setRows(Object.values(latest).map(s => mapRow(s, alurList)));
            }).catch(() => { });
          }}
        />
      )}
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
