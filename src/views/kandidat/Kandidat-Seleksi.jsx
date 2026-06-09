import { useState, useEffect, useRef } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';
import Pagination from '../../components/Pagination.jsx';
import BackButton from '../../components/BackButton.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getScoringByKandidat, updateAlurProses } from '../../services/scoringService.js';
import { getAlurSeleksi, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';

const FIT_CONFIG = {
  high: { label: 'Tinggi', border: '#a3e1b0', chip: '#089f32' },
  moderate: { label: 'Sedang', border: '#ffd086', chip: '#f8aa01' },
  low: { label: 'Rendah', border: '#fca5a5', chip: '#fb484b' },
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
  const fit = KATEGORI_TO_FIT[s.kategori_fit] || scoreLevelFromValue(s.total_score ?? 0);
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
    alur,
    alurNama,
    skor: s.total_score ?? 0,
    fit,
    skor_obj: {
      level: fit,
      score: s.total_score ?? 0,
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

export default function KandidatSeleksi({ back, navigate, kandidat }) {
  const { companyId } = useAuth();
  const [rows, setRows] = useState([]);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [openAlurRow, setOpenAlurRow] = useState(null);
  const [scorePanel, setScorePanel] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
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
  const filteredRows = activeFilters.size === 0
    ? rows
    : rows.filter(r => [...activeFilters].some(f => FIT_LEVEL_MAP[f] === r.fit));

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
      .then(() => showToast('Alur berhasil diubah', `Dipindahkan ke ${alurNama(level)}`))
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
    alur: row.alur,
    skor: row.skor_obj,
  });

  return (
    <div className="ks-view" onClick={e => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilter(false);
      if (!e.target.closest('.ks-alur-wrap')) setOpenAlurRow(null);
    }}>

      {/* ── Action bar ── */}
      <div className="ks-action-bar">
        <BackButton onClick={() => back ? back() : navigate?.('kandidat')} />
        <FilterDropdown
          groups={[{ title: 'Penilaian', options: ['Tinggi', 'Sedang', 'Rendah'] }]}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          isOpen={showFilter}
          onToggleOpen={e => { e?.stopPropagation(); setShowFilter(v => !v); }}
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

        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: 14 }}>Memuat data...</div>
        ) : pagedRows.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: 14 }}>
            {rows.length === 0 ? 'Kandidat belum mengikuti seleksi apapun.' : 'Tidak ada hasil yang sesuai filter.'}
          </div>
        ) : pagedRows.map(row => {
          const fit = FIT_CONFIG[row.fit] || FIT_CONFIG.low;
          return (
            <div className="ks-table-row" key={row.id}>
              <div className="ks-col-posisi">
                <span className="ks-posisi-link" onClick={() => navigate?.('seleksi-detail', { jabatan: row.posisi, activeTab: 'kandidat' })}>{row.posisi}</span>
              </div>

              <div className="ks-col-alur">
                <div className="ks-alur-wrap">
                  <button
                    className="ks-alur-badge"
                    onClick={e => { e.stopPropagation(); setOpenAlurRow(openAlurRow === row.id ? null : row.id); }}
                  >
                    <span>{row.alurNama}</span>
                    <ChevronDown />
                  </button>
                  {openAlurRow === row.id && (
                    <div className="ks-alur-dropdown">
                      {alurList.map(opt => (
                        <button
                          key={opt.level}
                          className={`ks-alur-option${row.alur === opt.level ? ' active' : ''}`}
                          onClick={e => { e.stopPropagation(); updateAlur(row.id, opt.level); }}
                        >
                          <span style={{ color: '#9aa3b0', fontSize: 10, marginRight: 6 }}>{opt.level}</span>
                          {opt.nama}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ks-col-skor">
                <div className="ks-fit-badge" style={{ borderColor: fit.border, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); openPanel(row); }}>
                  <span className="ks-fit-label">{fit.label}</span>
                  <span className="ks-fit-chip" style={{ background: fit.chip }}>{row.skor}</span>
                </div>
              </div>

              <div className="ks-col-action">
                <span className="ks-detail-link" onClick={e => { e.stopPropagation(); openPanel(row); }}>Detail Penilaian</span>
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
