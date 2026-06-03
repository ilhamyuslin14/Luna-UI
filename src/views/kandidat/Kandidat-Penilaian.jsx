import React, { useState, useRef, useEffect } from 'react';

const CRITERIA_DATA = {
  high: [
    { level: 'high',     name: 'Talent Acquisition Experience', desc: 'Candidate has 6 years of experience in human capital and recruitment roles', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.' },
    { level: 'high',     name: 'ATS Experience',                desc: 'Candidate is familiar with using ATS for recruitment purposes', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).' },
    { level: 'high',     name: 'Time Management',               desc: 'Candidate has experience working with time-to-hire targets in previous roles', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.' },
    { level: 'moderate', name: 'Professional Network',          desc: 'Candidate has some experience in professional communities but needs more evidence', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.' },
    { level: 'moderate', name: 'Technical Knowledge',           desc: 'Candidate shows some understanding of technical terms but requires more demonstration', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.' },
    { level: 'none',     name: 'Communication Skills',          desc: 'Candidate lacks clear evidence of strong communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.' },
  ],
  moderate: [
    { level: 'high',     name: 'ATS Experience',                desc: 'Candidate is familiar with using ATS for recruitment purposes', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).' },
    { level: 'moderate', name: 'Talent Acquisition Experience', desc: 'Candidate has some recruitment experience but not enough for all requirements', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.' },
    { level: 'moderate', name: 'Professional Network',          desc: 'Candidate has a developing professional network in the industry', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.' },
    { level: 'moderate', name: 'Technical Knowledge',           desc: 'Candidate shows basic understanding of technical requirements', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.' },
    { level: 'none',     name: 'Communication Skills',          desc: 'Candidate lacks evidence of advanced communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.' },
    { level: 'low',      name: 'Time Management',               desc: 'Candidate does not show measurable time-to-hire management experience', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.' },
  ],
  low: [
    { level: 'moderate', name: 'ATS Experience',                desc: 'Candidate has limited exposure to ATS tools in previous roles', req: 'Memiliki pengalaman dalam mengoperasikan sistem ATS (Applicant Tracking System).' },
    { level: 'none',     name: 'Professional Network',          desc: 'Limited professional community presence and engagement', req: 'Memiliki jejaring profesional yang luas dalam komunitas industri terkait.' },
    { level: 'none',     name: 'Talent Acquisition Experience', desc: 'Candidate has minimal recruitment experience for this role', req: 'Pengalaman minimal 5 tahun di bidang Human Capital dan Talent Acquisition.' },
    { level: 'low',      name: 'Communication Skills',          desc: 'Candidate lacks clear evidence of strong communication and negotiation skills', req: 'Kemampuan komunikasi persuasif dan negosiasi yang kuat.' },
    { level: 'low',      name: 'Time Management',               desc: 'No evidence of time-to-hire management in previous experience', req: 'Mampu mengelola proses rekrutmen dengan target time-to-hire yang terukur.' },
    { level: 'low',      name: 'Technical Knowledge',           desc: 'Candidate shows very limited technical knowledge relevant to the role', req: 'Memahami istilah dan kebutuhan teknis untuk berbagai posisi yang sedang dibuka.' },
  ],
};

const AI_SUMMARY = {
  high:     'Candidate has strong experience, meets most required criteria including ATS and LinkedIn Recruiter usage, with good potential fit in professional network and technical terms.',
  moderate: 'Candidate has 6 years of experience, meets some required criteria like using ATS and LinkedIn Recruiter, but lacks evidence of good communication and negotiation skills, with potential fit in professional network and technical terms.',
  low:      'Candidate does not sufficiently meet the key criteria for this role. Most required skills and experience are either absent or need significant development.',
};

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
export default function KandidatPenilaian({ kandidat, onClose, onReject }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isAlurOpen, setIsAlurOpen] = useState(false);
  const [selectedAlur, setSelectedAlur] = useState(kandidat.alur || 'Terseleksi');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAlurOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alurOptions = [
    'Kandidat Baru', 'Terseleksi', 'Diajukan', 'Penjadwalan Wawancara',
    'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja', 'Diterima',
    'Onboarding', 'Lolos Masa Percobaan'
  ];

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const criteria = CRITERIA_DATA[kandidat.skor.level] || [];
  const countByLevel = (lvl) => criteria.filter(c => c.level === lvl).length;
  const gaugeColor = GAUGE_COLORS[kandidat.skor.level];
  const levelText = { high: 'Tinggi', moderate: 'Sedang', low: 'Rendah' }[kandidat.skor.level];

  const r = 33;
  const circumference = 2 * Math.PI * r;
  const filled = (kandidat.skor.score / 100) * circumference;

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
    <div className={`sc-overlay${isClosing ? ' closing' : ''}`} onClick={handleClose}>
      <div className={`sc-panel${isClosing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sc-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div className="sc-header-tag">
              Hasil Penilaian AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ fontSize: '11px', color: '#7e8799', fontWeight: 500 }}>Penilaian untuk posisi</div>
              <div style={{ color: '#0977be', fontWeight: 700, fontSize: '18px', lineHeight: 1 }}>{kandidat.jabatan}</div>
            </div>
          </div>
          <div className="sc-header-name">{kandidat.nama}</div>
        </div>

        {/* Score Summary */}
        <div className="sc-score-section">
          <div className="sc-score-left">
            <div className="sc-gauge-wrapper">
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
                <span className="sc-gauge-score" style={{ color: gaugeColor }}>{kandidat.skor.score}</span>
              </div>
            </div>
            <div className="sc-chips">
              <span className="sc-chip high">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#089f32" />
                  <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tinggi: {countByLevel('high')}/{criteria.length}
              </span>
              <span className="sc-chip moderate">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#da8700" />
                  <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sedang: {countByLevel('moderate')}/{criteria.length}
              </span>
              <span className="sc-chip low">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="7" fill="#ef4444" />
                  <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Rendah: {countByLevel('low')}/{criteria.length}
              </span>
            </div>
          </div>

          <div className="sc-score-divider" />

          <div className="sc-ai-summary">
            <div className="sc-ai-title">
              Rangkuman AI
            </div>
            <p className="sc-ai-text">{AI_SUMMARY[kandidat.skor.level]}</p>
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
            {criteria.map((c, i) => (
              <div key={i} className="sc-criteria-row">
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
                        <strong style={{ color: '#171e2c' }}>Kriteria Penilaian</strong>
                        <span>{c.req}</span>
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
            <Tip text="Nilai ulang dengan kriteria aktif saat ini. Disarankan dilakukan setelah mengubah kriteria. Sedikit variasi skor antar penilaian adalah normal.">
              <button className="sc-btn-action primary">
                <IconRefresh />
                Penilaian Ulang
              </button>
            </Tip>
            
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                className={`sc-btn-action ${isAlurOpen ? 'active' : ''}`}
                onClick={() => setIsAlurOpen(!isAlurOpen)}
                style={{ justifyContent: 'space-between', minWidth: '150px' }}
              >
                <span>{selectedAlur}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {isAlurOpen && (
                <div className="sc-alur-dropdown">
                  {alurOptions.map(opt => (
                    <button 
                      key={opt} 
                      className={`sc-alur-option ${selectedAlur === opt ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAlur(opt);
                        setIsAlurOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="sc-btn-action grey" 
              onClick={(e) => {
                e.stopPropagation();
                if (isClosing) return;
                setIsClosing(true);
                setTimeout(() => {
                  if (onReject) onReject();
                }, 300);
              }}
            >
              Tidak Sesuai
            </button>
          </div>
          <button className="sc-btn-close" onClick={handleClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
