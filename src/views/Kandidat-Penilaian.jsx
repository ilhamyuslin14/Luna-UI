const CRITERIA_DATA = {
  high: [
    { level: 'high',     name: 'Talent Acquisition Experience', desc: 'Candidate has 6 years of experience in human capital and recruitment roles' },
    { level: 'high',     name: 'ATS Experience',                desc: 'Candidate is familiar with using ATS for recruitment purposes' },
    { level: 'high',     name: 'Time Management',               desc: 'Candidate has experience working with time-to-hire targets in previous roles' },
    { level: 'moderate', name: 'Professional Network',          desc: 'Candidate has some experience in professional communities but needs more evidence' },
    { level: 'moderate', name: 'Technical Knowledge',           desc: 'Candidate shows some understanding of technical terms but requires more demonstration' },
    { level: 'none',     name: 'Communication Skills',          desc: 'Candidate lacks clear evidence of strong communication and negotiation skills' },
  ],
  moderate: [
    { level: 'high',     name: 'ATS Experience',                desc: 'Candidate is familiar with using ATS for recruitment purposes' },
    { level: 'moderate', name: 'Talent Acquisition Experience', desc: 'Candidate has some recruitment experience but not enough for all requirements' },
    { level: 'moderate', name: 'Professional Network',          desc: 'Candidate has a developing professional network in the industry' },
    { level: 'moderate', name: 'Technical Knowledge',           desc: 'Candidate shows basic understanding of technical requirements' },
    { level: 'none',     name: 'Communication Skills',          desc: 'Candidate lacks evidence of advanced communication and negotiation skills' },
    { level: 'low',      name: 'Time Management',               desc: 'Candidate does not show measurable time-to-hire management experience' },
  ],
  low: [
    { level: 'moderate', name: 'ATS Experience',                desc: 'Candidate has limited exposure to ATS tools in previous roles' },
    { level: 'none',     name: 'Professional Network',          desc: 'Limited professional community presence and engagement' },
    { level: 'none',     name: 'Talent Acquisition Experience', desc: 'Candidate has minimal recruitment experience for this role' },
    { level: 'low',      name: 'Communication Skills',          desc: 'Candidate lacks clear evidence of strong communication and negotiation skills' },
    { level: 'low',      name: 'Time Management',               desc: 'No evidence of time-to-hire management in previous experience' },
    { level: 'low',      name: 'Technical Knowledge',           desc: 'Candidate shows very limited technical knowledge relevant to the role' },
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

const Tip = ({ text, children }) => (
  <span className="sc-tip-wrap">
    {children}
    <span className="sc-tip">{text}</span>
  </span>
);

/**
 * Props:
 *   kandidat  — { nama, skor: { level: 'high'|'moderate'|'low', score: number } }
 *   onClose   — function
 */
export default function KandidatPenilaian({ kandidat, onClose }) {
  const criteria = CRITERIA_DATA[kandidat.skor.level] || [];
  const countByLevel = (lvl) => criteria.filter(c => c.level === lvl).length;
  const gaugeColor = GAUGE_COLORS[kandidat.skor.level];
  const levelText = { high: 'High', moderate: 'Moderate', low: 'Low' }[kandidat.skor.level];

  const r = 33;
  const circumference = 2 * Math.PI * r;
  const filled = (kandidat.skor.score / 100) * circumference;

  return (
    <div className="sc-overlay" onClick={onClose}>
      <div className="sc-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sc-header">
          <div className="sc-header-tag">
            <IconSpark />
            AI Match Overview
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
                <span className="sc-gauge-total-label">TOTAL SCORE</span>
                <span className="sc-gauge-score" style={{ color: gaugeColor }}>{kandidat.skor.score}</span>
                <span className="sc-gauge-level-text" style={{ color: gaugeColor }}>{levelText}</span>
              </div>
            </div>
            <div className="sc-chips">
              <span className="sc-chip high">Tinggi: {countByLevel('high')}/{criteria.length}</span>
              <span className="sc-chip moderate">Sedang: {countByLevel('moderate')}/{criteria.length}</span>
              <span className="sc-chip low">Rendah: {countByLevel('low')}/{criteria.length}</span>
            </div>
          </div>

          <div className="sc-score-divider" />

          <div className="sc-ai-summary">
            <div className="sc-ai-title">
              <IconSpark color="#171e2c" size={11} />
              AI Summary
            </div>
            <p className="sc-ai-text">{AI_SUMMARY[kandidat.skor.level]}</p>
          </div>
        </div>

        {/* Criteria Table */}
        <div className="sc-criteria-section">
          <div className="sc-criteria-col-header">
            <div className="sc-criteria-col-rating">
              Rating <Tip text="AI menilai kesesuaian kandidat berdasarkan kriteria penilaian yang ditetapkan"><IconInfo /></Tip>
            </div>
            <div className="sc-criteria-col-req">Requirements</div>
          </div>
          <div className="sc-criteria-list">
            {criteria.map((c, i) => (
              <div key={i} className="sc-criteria-row">
                <div className="sc-criteria-level-col">
                  <span className={`sc-level-badge ${c.level}`}>{LEVEL_LABELS[c.level]}</span>
                </div>
                <div className="sc-criteria-info">
                  <div className="sc-criteria-name">
                    {c.name}
                    <Tip text="Bobot kriteria ini dalam penilaian AI Luna"><IconInfo /></Tip>
                  </div>
                  <div className="sc-criteria-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sc-footer">
          <button className="sc-btn-reassess">
            <IconRefresh />
            Penilaian Ulang
            <Tip text="Minta Luna AI menilai ulang kandidat ini berdasarkan kriteria terbaru"><IconInfo /></Tip>
          </button>
          <button className="sc-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
