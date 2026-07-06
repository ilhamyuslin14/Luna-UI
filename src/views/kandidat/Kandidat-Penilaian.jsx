import React, { useState, useRef, useEffect } from 'react';
import { updateAlurProses, runRescore, markTidakSesuai } from '../../services/scoringService.js';
import PopupTidakSesuai from '../../components/PopupTidakSesuai.jsx';
import { getAlurSeleksi, seedDefaultAlur, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Toast from '../../components/Toast.jsx';

const CRITERIA_DATA = {
  high: {
    criteriaData: [
      { level: 'high', name: 'Talent Acquisition Experience', desc: 'Candidate has 6 years of experience in human capital and recruitment roles', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.', bobot: 'tinggi', score: 100 },
      { level: 'high', name: 'ATS Experience', desc: 'Candidate is familiar with using ATS for recruitment purposes', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).', bobot: 'tinggi', score: 100 },
      { level: 'high', name: 'Time Management', desc: 'Candidate has experience working with time-to-hire targets in previous roles', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.', bobot: 'sedang', score: 70 },
      { level: 'moderate', name: 'Professional Network', desc: 'Candidate has some experience in professional communities but needs more evidence', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.', bobot: 'sedang', score: 70 },
      { level: 'moderate', name: 'Technical Knowledge', desc: 'Candidate shows some understanding of technical terms but requires more demonstration', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.', bobot: 'sedang', score: 70 },
      { level: 'none', name: 'Communication Skills', desc: 'Candidate lacks clear evidence of strong communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.', bobot: 'tinggi', score: 0 },
    ],
    prefData: [
      { level: 'high', name: 'Sertifikasi HR', desc: 'Memiliki sertifikasi CHRP', req: 'Sertifikasi profesional di bidang HR.', bobot: 'rendah', score: 70 },
    ]
  },
  moderate: {
    criteriaData: [
      { level: 'high', name: 'ATS Experience', desc: 'Candidate is familiar with using ATS for recruitment purposes', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).', bobot: 'tinggi', score: 100 },
      { level: 'moderate', name: 'Talent Acquisition Experience', desc: 'Candidate has some recruitment experience but not enough for all requirements', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.', bobot: 'tinggi', score: 70 },
      { level: 'moderate', name: 'Professional Network', desc: 'Candidate has a developing professional network in the industry', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.', bobot: 'sedang', score: 70 },
      { level: 'moderate', name: 'Technical Knowledge', desc: 'Candidate shows basic understanding of technical requirements', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.', bobot: 'sedang', score: 70 },
      { level: 'none', name: 'Communication Skills', desc: 'Candidate lacks evidence of advanced communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.', bobot: 'tinggi', score: 0 },
      { level: 'low', name: 'Time Management', desc: 'Candidate does not show measurable time-to-hire management experience', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.', bobot: 'sedang', score: 40 },
    ],
    prefData: [
      { level: 'none', name: 'Sertifikasi HR', desc: 'Tidak ada sertifikasi yang dilampirkan', req: 'Sertifikasi profesional di bidang HR.', bobot: 'rendah', score: 0 },
    ]
  },
  low: {
    criteriaData: [
      { level: 'moderate', name: 'ATS Experience', desc: 'Candidate has limited exposure to ATS tools in previous roles', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).', bobot: 'tinggi', score: 70 },
      { level: 'none', name: 'Professional Network', desc: 'Limited professional community presence and engagement', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.', bobot: 'sedang', score: 0 },
      { level: 'none', name: 'Talent Acquisition Experience', desc: 'Candidate has minimal recruitment experience for this role', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.', bobot: 'tinggi', score: 0 },
      { level: 'low', name: 'Communication Skills', desc: 'Candidate lacks clear evidence of strong communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.', bobot: 'tinggi', score: 40 },
      { level: 'low', name: 'Time Management', desc: 'No evidence of time-to-hire management in previous experience', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.', bobot: 'sedang', score: 40 },
      { level: 'low', name: 'Technical Knowledge', desc: 'Candidate shows very limited technical knowledge relevant to the role', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.', bobot: 'sedang', score: 40 },
    ],
    prefData: [
      { level: 'none', name: 'Sertifikasi HR', desc: 'Tidak ada sertifikasi yang dilampirkan', req: 'Sertifikasi profesional di bidang HR.', bobot: 'rendah', score: 0 },
    ]
  }
};

const AI_SUMMARY = {
  high: 'Candidate has strong experience, meets most required criteria including ATS and LinkedIn Recruiter usage, with good potential fit in professional network and technical terms.',
  moderate: 'Candidate has 6 years of experience, meets some required criteria like using ATS and LinkedIn Recruiter, but lacks evidence of good communication and negotiation skills, with potential fit in professional network and technical terms.',
  low: 'Candidate does not sufficiently meet the key criteria for this role. Most required skills and experience are either absent or need significant development.',
};

const KATEGORI_TO_FIT = { 'Sangat Fit': 'high', 'Fit': 'high', 'Cukup Fit': 'moderate', 'Kurang Fit': 'low' };
function scoreLevelFromValue(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 20) return 'low';
  return 'none';
}
function mapRowToSkor(row) {
  if (!row) return null;
  const level = KATEGORI_TO_FIT[row.kategori_fit] || scoreLevelFromValue(row.total_score ?? 0);
  const lookup = {};
  (row.raw_kriteria || []).forEach(k => { if (k.tag) lookup[k.tag] = k.teks || ''; });
  const toItem = k => ({
    level: scoreLevelFromValue(k.score_evaluate),
    name: k.tag, desc: k.evidence || '',
    req: lookup[k.tag] || '',
    bobot: k.kategori === 'Wajib' ? 'tinggi' : 'rendah',
    score: k.score_evaluate ?? 0,
    weight: k.weight ?? 0,
  });
  return {
    level,
    score: row.total_score ?? 0,
    aiSummary: row.ai_summary || '',
    departemen: row.seleksi?.departments?.name || '',
    criteriaData: (row.detail_kriteria || []).filter(k => k.kategori === 'Wajib').map(toItem),
    prefData:     (row.detail_kriteria || []).filter(k => k.kategori !== 'Wajib').map(toItem),
  };
}

const LEVEL_LABELS = { high: 'Tinggi', moderate: 'Sedang', none: 'Tidak Sesuai', low: 'Rendah' };
const GAUGE_COLORS = { high: '#14b541', moderate: '#f29a01', low: '#fb484b' };

const IconSpark = ({ color = '#0466a6', size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6.5 1L7.55 4.45H11.18L8.31 6.55L9.36 10L6.5 7.9L3.64 10L4.69 6.55L1.82 4.45H5.45L6.5 1Z" fill={color} />
  </svg>
);

const IconInfo = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6" cy="6" r="5.4" stroke="#7e8799" strokeWidth="1.1" />
    <rect x="5.4" y="5" width="1.2" height="4" rx="0.6" fill="#7e8799" />
    <circle cx="6" cy="3.5" r="0.7" fill="#7e8799" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <path d="M13 7.5A5.5 5.5 0 1 1 7.5 2H10M10 2l-2 2M10 2l-2-2" stroke="#171e2c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tip = ({ text, children }) => {
  const [position, setPosition] = useState('bottom');
  const [align, setAlign] = useState('center');
  const wrapRef = useRef(null);

  const handleMouseEnter = () => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();

    // Deteksi vertikal
    if (rect.bottom + 80 > window.innerHeight) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }

    // Deteksi horizontal
    if (rect.left < 150) {
      setAlign('left');
    } else if (window.innerWidth - rect.right < 150) {
      setAlign('right');
    } else {
      setAlign('center');
    }
  };

  return (
    <span className="sc-tip-wrap" ref={wrapRef} onMouseEnter={handleMouseEnter}>
      {children}
      <div className={`sc-tip ${position} align-${align}`}>{text}</div>
    </span>
  );
};

/**
 * Props:
 *   kandidat  — { nama, skor: { level: 'high'|'moderate'|'low', score: number } }
 *   onClose   — function
 *   onReject  — function
 */
export default function KandidatPenilaian({ kandidat, onClose, onReject, onRescored, onAlurChanged, embedded = false }) {
  const { companyId } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [isAlurOpen, setIsAlurOpen] = useState(false);
  const [selectedAlurLevel, setSelectedAlurLevel] = useState(kandidat.alur ?? 1);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [toast, setToast] = useState(null);
  const [localSkor, setLocalSkor] = useState(kandidat.skor);
  const [isRescoring, setIsRescoring] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const toastTimer = useRef(null);
  const dropdownRef = useRef(null);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const handleRescore = async () => {
    const { scoringId, kandidatId, seleksiId } = kandidat;
    if (!scoringId || !kandidatId || !seleksiId || !companyId) {
      showToast('Tidak bisa nilai ulang', 'Data kandidat atau posisi tidak lengkap.');
      return;
    }
    setIsRescoring(true);
    try {
      const row = await runRescore(scoringId, kandidatId, seleksiId, companyId);
      const newSkor = mapRowToSkor(row);
      setLocalSkor(newSkor);
      showToast('Penilaian ulang selesai', 'Hasil penilaian AI telah diperbarui.');
      if (onRescored) onRescored(row);
    } catch (err) {
      showToast('Gagal menilai ulang', err.message);
    } finally {
      setIsRescoring(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    seedDefaultAlur(companyId);
    getAlurSeleksi(companyId).then(setAlurList).catch(() => {});
  }, [companyId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAlurOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const criteria = localSkor?.criteriaData || CRITERIA_DATA[localSkor?.level]?.criteriaData || (Array.isArray(CRITERIA_DATA[localSkor?.level]) ? CRITERIA_DATA[localSkor?.level] : []);
  const prefs = localSkor?.prefData || CRITERIA_DATA[localSkor?.level]?.prefData || [];
  const allCriteria = [...criteria, ...prefs];
  const aiSummaryText = localSkor?.aiSummary || AI_SUMMARY[localSkor?.level] || '';
  const countByLevel = (lvl) => allCriteria.filter(c => c.level === lvl).length;

  let gaugeColor = GAUGE_COLORS[localSkor?.level];
  if (!gaugeColor) {
    if (localSkor?.score >= 80) gaugeColor = GAUGE_COLORS.high;
    else if (localSkor?.score >= 50) gaugeColor = GAUGE_COLORS.moderate;
    else gaugeColor = GAUGE_COLORS.low;
  }
  const levelText = localSkor?.level ? { high: 'Tinggi', moderate: 'Sedang', low: 'Rendah' }[localSkor.level] : '';

  const r = 33;
  const circumference = 2 * Math.PI * r;
  const filled = ((localSkor?.score ?? 0) / 100) * circumference;

  const getLevelIcon = (lvl) => {
    switch (lvl) {
      case 'high':
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="7" fill="#089f32" />
            <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'moderate':
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="7" fill="#da8700" />
            <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'low':
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="7" fill="#ef4444" />
            <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'none':
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="7" fill="#7e8799" />
            <path d="M4.5 7H9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return (
    <>
    <div className={`sc-overlay${isClosing ? ' closing' : ''}${embedded ? ' embedded' : ''}`} onClick={!embedded ? handleClose : undefined}>
      <div className={`sc-panel${isClosing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sc-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div className="sc-header-tag">
              Hasil Penilaian AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ fontSize: '11px', color: '#7e8799', fontWeight: 500, fontFamily: "'Inter Tight', sans-serif" }}>Penilaian untuk posisi</div>
              <div style={{ color: 'var(--luna-orange-500)', fontWeight: 700, fontSize: '18px', lineHeight: 1, fontFamily: "'Inter Tight', sans-serif" }}>{kandidat.jabatanDilamar || kandidat.jabatan}</div>
              {kandidat.departemen && kandidat.departemen !== '-' && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#475569', 
                  fontWeight: 600, 
                  backgroundColor: '#f1f5f9', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  marginTop: '4px'
                }}>
                  {kandidat.departemen}
                </div>
              )}
            </div>
          </div>
          <div className="sc-header-name">{kandidat.nama}</div>
        </div>

        {/* Score Summary */}
        <div className="sc-score-section">
          <div className="sc-score-left">
            <div
              className="sc-gauge-wrapper"
              onMouseEnter={() => setShowScoreTooltip(true)}
              onMouseLeave={() => setShowScoreTooltip(false)}
            >
              <svg width="86" height="86" viewBox="0 0 86 86" style={{ display: 'block' }}>
                <circle cx="43" cy="43" r={r} fill="none" stroke="#f0f2f6" strokeWidth="9" />
                <circle
                  cx="43" cy="43" r={r}
                  fill="none" stroke={gaugeColor} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={`${filled} ${circumference - filled}`}
                  transform="rotate(-90 43 43)"
                />
                <circle cx="43" cy="43" r="27" fill="white" />
              </svg>
              <div className="sc-gauge-center">
                <span className="sc-gauge-total-label">TOTAL SKOR</span>
                <span className="sc-gauge-score" style={{ color: gaugeColor }}>{localSkor.score}</span>
              </div>
              {showScoreTooltip && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: '#fff', color: '#323b4d', borderRadius: 8, padding: '10px 14px',
                  fontSize: 12, lineHeight: 1.7, whiteSpace: 'nowrap', zIndex: 999,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: '1px solid #e2e5ec', pointerEvents: 'none',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Cara Perhitungan Total Skor</div>
                  <div style={{ color: '#555f71' }}>Rata-rata tertimbang dari</div>
                  <div style={{ color: '#555f71' }}>Kriteria <strong style={{ color: '#0977be' }}>Wajib</strong> saja</div>
                  <div style={{ color: '#abb2c1', marginTop: 6, fontFamily: 'monospace', fontSize: 11 }}>
                    Σ(skor × bobot) / Σ(bobot)
                  </div>
                </div>
              )}
            </div>
            <div className="sc-chips">
              <span className="sc-chip high">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#089f32" />
                  <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tinggi: {countByLevel('high')}/{allCriteria.length}
              </span>
              <span className="sc-chip moderate">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#da8700" />
                  <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sedang: {countByLevel('moderate')}/{allCriteria.length}
              </span>
              <span className="sc-chip low">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#ef4444" />
                  <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Rendah: {countByLevel('low')}/{allCriteria.length}
              </span>
            </div>
          </div>

          <div className="sc-score-divider" />

          <div className="sc-ai-summary">
            <div className="sc-ai-title">
              Rangkuman AI
            </div>
            <p className="sc-ai-text">{aiSummaryText}</p>
          </div>
        </div>

        {/* Criteria Table */}
        <div className="sc-criteria-section">
          <div className="sc-criteria-col-header">
            <div className="sc-criteria-col-rating">
              Penilaian <Tip text={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>AI mengevaluasi kandidat berdasarkan seberapa cocok mereka dengan persyaratan pekerjaan.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 8px' }}>
                    <strong style={{ color: '#171e2c' }}>Tinggi:</strong>
                    <span>Kriteria ditemukan dengan jelas di profil kandidat.</span>
                    <strong style={{ color: '#171e2c' }}>Sedang:</strong>
                    <span>Kriteria disebutkan tetapi kurang jelas atau tidak lengkap.</span>
                    <strong style={{ color: '#171e2c' }}>Rendah:</strong>
                    <span>Kriteria ada namun sangat minim atau kurang relevan.</span>
                    <strong style={{ color: '#171e2c' }}>Tidak Sesuai:</strong>
                    <span>Kriteria tersebut tidak ada atau tidak disebutkan sama sekali.</span>
                  </div>
                </div>
              }><IconInfo /></Tip>
            </div>
            <div className="sc-criteria-col-req">Kriteria</div>
          </div>
          <div className="sc-criteria-list">
            {criteria.length > 0 && (
              <div style={{ padding: '8px 24px', fontSize: '12px', fontWeight: 600, color: '#323b4d', background: '#f8fafc', borderBottom: '1px solid #e2e5ec' }}>
                Kriteria Utama
              </div>
            )}
            {criteria.map((c, i) => (
              <div key={`req-${i}`} className="sc-criteria-row">
                <div className="sc-criteria-level-col">
                  <span className={`sc-level-badge ${c.level}`}>
                    {getLevelIcon(c.level)}
                    {LEVEL_LABELS[c.level]}
                  </span>
                </div>
                <div className="sc-criteria-info">
                  <div className="sc-criteria-name">
                    {c.name}
                    <Tip text={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <strong style={{ color: '#171e2c' }}>Kriteria Penilaian</strong>
                          {c.score !== undefined && (
                            <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {c.score}%
                            </span>
                          )}
                        </div>
                        <span>{c.req}</span>
                        {c.bobot && (
                          <span style={{ fontSize: '11px', color: '#7e8799', marginTop: '2px', textTransform: 'capitalize' }}>
                            {c.bobot}
                          </span>
                        )}
                      </div>
                    }><IconInfo /></Tip>
                  </div>
                  <div className="sc-criteria-desc">{c.desc}</div>
                </div>
              </div>
            ))}

            {prefs.length > 0 && (
              <div style={{ padding: '8px 24px', fontSize: '12px', fontWeight: 600, color: '#323b4d', background: '#f8fafc', borderBottom: '1px solid #e2e5ec', borderTop: '1px solid #e2e5ec' }}>
                Nilai Tambah
              </div>
            )}
            {prefs.map((c, i) => (
              <div key={`pref-${i}`} className="sc-criteria-row">
                <div className="sc-criteria-level-col">
                  <span className={`sc-level-badge ${c.level}`}>
                    {getLevelIcon(c.level)}
                    {LEVEL_LABELS[c.level]}
                  </span>
                </div>
                <div className="sc-criteria-info">
                  <div className="sc-criteria-name">
                    {c.name}
                    <Tip text={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <strong style={{ color: '#171e2c' }}>Kriteria Penilaian</strong>
                          {c.score !== undefined && (
                            <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {c.score}%
                            </span>
                          )}
                        </div>
                        <span>{c.req}</span>
                        {c.bobot && (
                          <span style={{ fontSize: '11px', color: '#7e8799', marginTop: '2px', textTransform: 'capitalize' }}>
                            {c.bobot}
                          </span>
                        )}
                      </div>
                    }><IconInfo /></Tip>
                  </div>
                  <div className="sc-criteria-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sc-footer">
          <div className="sc-footer-actions">
            {kandidat.alur !== 0 && (
              <Tip text="Nilai ulang dengan kriteria aktif saat ini. Disarankan dilakukan setelah mengubah kriteria. Sedikit variasi skor antar penilaian adalah normal.">
                <button
                  className="sc-btn-action primary"
                  onClick={handleRescore}
                  disabled={isRescoring}
                  style={{ opacity: isRescoring ? 0.7 : 1, cursor: isRescoring ? 'not-allowed' : 'pointer' }}
                >
                  {isRescoring
                    ? <svg className="kt-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
                    : <IconRefresh />
                  }
                  {isRescoring ? 'Menilai ulang...' : 'Penilaian Ulang'}
                </button>
              </Tip>
            )}

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <Tip text="Alur Rekrutmen">
                <div
                  className={`sc-btn-action ${isAlurOpen ? 'active' : ''}`}
                  onClick={() => { if (kandidat.alur !== 0) setIsAlurOpen(!isAlurOpen); }}
                  style={{ 
                    justifyContent: 'space-between', 
                    minWidth: '150px', 
                    opacity: kandidat.alur === 0 ? 0.6 : 1, 
                    cursor: kandidat.alur === 0 ? 'not-allowed' : 'pointer' 
                  }}
                >
                  <span>{kandidat.alur === 0 ? 'Tidak Sesuai' : (alurList.find(a => a.level === selectedAlurLevel)?.nama ?? '-')}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Tip>
              {isAlurOpen && (
                <div className="sc-alur-dropdown">
                  {alurList.filter(opt => opt.level !== 0).map(opt => (
                    <button
                      key={opt.level}
                      className={`sc-alur-option ${selectedAlurLevel === opt.level ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAlurLevel(opt.level);
                        setIsAlurOpen(false);
                        if (kandidat.scoringId) {
                          updateAlurProses(kandidat.scoringId, opt.level)
                            .then(() => {
                              showToast('Alur berhasil diubah', `Dipindahkan ke ${opt.nama}`);
                              if (onAlurChanged) onAlurChanged(kandidat.scoringId, opt.level);
                            })
                            .catch(err => showToast('Gagal memperbarui alur', err.message));
                        }
                      }}
                    >
                      {opt.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {kandidat.alur !== 0 && (
              <Tip text="Keluarkan kandidat yang tidak cocok dari proses seleksi posisi ini.">
                <button
                  className="sc-btn-action grey"
                  onClick={(e) => { e.stopPropagation(); setShowRejectPopup(true); }}
                >
                  Tidak Sesuai
                </button>
              </Tip>
            )}

            {kandidat.alur === 0 && (() => {
              const badge = (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', color: '#b91c1c', fontSize: '13px', fontWeight: 500, maxWidth: '260px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kandidat.alasan || 'Alasan tidak tersedia'}</span>
                </div>
              );
              return kandidat.detail ? <Tip text={kandidat.detail}>{badge}</Tip> : badge;
            })()}
          </div>
          <button className="sc-btn-close" onClick={handleClose}>Tutup</button>
        </div>
      </div>
    </div>
    {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    {showRejectPopup && (
      <PopupTidakSesuai
        targetText={kandidat.nama || 'Kandidat'}
        onConfirm={async (reason, detail) => {
          setShowRejectPopup(false);
          if (kandidat.scoringId) {
            try { await markTidakSesuai(kandidat.scoringId, reason, detail); } catch { /* best effort */ }
          }
          if (isClosing) return;
          setIsClosing(true);
          setTimeout(() => { if (onReject) onReject(reason, detail); }, 300);
        }}
        onClose={() => setShowRejectPopup(false)}
      />
    )}
    </>
  );
}
