import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardMetrics, getRecentJobs, getRecentActivities } from '../../services/dashboardService.js';
import { supabase } from '../../config/supabase.js';
import { getCached } from '../../services/dataCache.js';

const STATUS_CONFIG = {
  rencana: { icon: '/assets/status/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status/status_dibatalkan.svg', label: 'Dibatalkan' },
};

function IconLock({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10.5" width="14" height="9" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export default function Beranda_001({ navigate }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const [npsState, setNpsState] = useState('popup');
  const [npsScore, setNpsScore] = useState(null);
  const [npsText, setNpsText] = useState('');
  const [npsSubmitted, setNpsSubmitted] = useState(false);

  const handleNpsSubmit = () => {
    setNpsSubmitted(true);
    setTimeout(() => setNpsState('hidden'), 1500);
  };

  const [metrics, setMetrics] = useState({
    totalKandidat: 0,
    lowonganAktif: 0,
    direkrut: 0,
    rataKecocokan: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    getCached(`beranda:${companyId}`, async () => {
      const [metrics, recentJobs, recentActivities] = await Promise.all([
        getDashboardMetrics(companyId),
        getRecentJobs(companyId),
        getRecentActivities(companyId),
      ]);
      return { metrics, recentJobs, recentActivities };
    })
      .then(data => {
        setMetrics(data.metrics);
        setRecentJobs(data.recentJobs);
        setRecentActivities(data.recentActivities);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return (
    <div className="db001-view">
      {/* Stats Cards */}
      <div className="db001-stats-grid">
        <div className="db001-stat-card db001-stat-dark" style={{ cursor: 'pointer' }} onClick={() => navigate('kandidat_001')}>
          <div className="db001-stat-card-header">
            <div className="db001-stat-label">Total Talenta</div>
            <div className="db001-stat-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>
          </div>
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-value"></div>
          ) : (
            <div className="db001-stat-value">{metrics.totalKandidat.toLocaleString()}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLoading ? (
              <div className="db001-skeleton db001-skeleton-badge"></div>
            ) : (
              <div className="db001-stat-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                +{metrics.trends?.kandidat || 0} di bulan ini
              </div>
            )}
          </div>
        </div>

        <div className="db001-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('seleksi_001')}>
          <div className="db001-stat-card-header">
            <div className="db001-stat-label">Posisi Aktif</div>
            <div className="db001-stat-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>
          </div>
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-value"></div>
          ) : (
            <div className="db001-stat-value">{metrics.lowonganAktif.toLocaleString()}</div>
          )}
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-badge"></div>
          ) : (
            <div className="db001-stat-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              +{metrics.trends?.lowongan || 0} di bulan ini
            </div>
          )}
        </div>

        <div className="db001-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('karyawan')}>
          <div className="db001-stat-card-header">
            <div className="db001-stat-label">Karyawan Direkrut</div>
            <div className="db001-stat-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>
          </div>
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-value"></div>
          ) : (
            <div className="db001-stat-value">{metrics.direkrut.toLocaleString()}</div>
          )}
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-badge"></div>
          ) : (
            <div className="db001-stat-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              +{metrics.trends?.direkrut || 0} di bulan ini
            </div>
          )}
        </div>

        <div className="db001-stat-card">
          <div className="db001-stat-card-header">
            <div className="db001-stat-label">Rata-rata Penilaian</div>
          </div>
          {isLoading ? (
            <div className="db001-skeleton db001-skeleton-value"></div>
          ) : (
            <div className="db001-stat-value">{metrics.rataKecocokan}%</div>
          )}
          <div className="db001-stat-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Metrik Keseluruhan
          </div>
          <div className="db001-tooltip-content">Skor rata-rata berdasarkan penilaian AI terhadap seluruh kandidat.</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="db001-main-layout">
        <div className="db001-left-column">
          {/* Quick Actions */}
          <div>
            <div className="db001-section-header">
              <h2 className="db001-section-title">Aksi Cepat</h2>
            </div>
            <div className="db001-actions-grid">
              <div className="db001-action-card primary" style={{ cursor: 'pointer' }} onClick={() => navigate('setup-penilaian_001')}>
                <div className="db001-action-info">
                  <div className="db001-action-name">Setup Penilaian</div>
                  <div className="db001-action-desc">Mulai setup kriteria penilaian AI untuk role baru.</div>
                </div>
                <div className="db001-action-icon-circle">
                  <img src="/assets/group.svg" alt="Add" />
                </div>
              </div>
              <div
                className={`db001-action-card secondary${isFreePlan ? ' db001-action-card--locked' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(isFreePlan ? 'paket-langganan' : 'kandidat-tambah')}
              >
                <div className="db001-action-info">
                  <div className="db001-action-name">Unggah CV Massal</div>
                  <div className="db001-action-desc">Unggah PDF/ZIP ke Warehouse.</div>
                </div>
                <div className="db001-action-icon-circle">
                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(5.989 8.881)">
                      <path d="M8.78553 3.2778L6.25676 0.728191C5.79102 0.258603 5.17128 0 4.5117 0C3.85213 0 3.23239 0.258603 2.76661 0.728191L0.237877 3.2778C-0.0811424 3.59949 -0.0790097 4.11887 0.242635 4.43789C0.56432 4.75691 1.0837 4.75482 1.40272 4.43313L3.65038 2.16694V10.1309C3.65038 10.5839 4.01763 10.9512 4.47069 10.9512C4.92375 10.9512 5.291 10.5839 5.291 10.1309V2.08421L7.62069 4.43313C7.7811 4.59482 7.99205 4.67578 8.20315 4.67578C8.41192 4.67578 8.62086 4.59654 8.78078 4.43789C9.10242 4.11887 9.10459 3.59949 8.78553 3.2778Z" fill="#171E2C" />
                    </g>
                    <g transform="translate(0 1.17)">
                      <path d="M18.9492 6.13782V5.59133C18.9492 2.50827 16.4409 0 13.3579 0C12.0154 0 10.7173 0.483 9.70278 1.36008C9.03164 1.94028 8.5123 2.6677 8.18139 3.47611C7.67271 3.21616 7.1046 3.07617 6.52148 3.07617C4.50864 3.07617 2.87109 4.71372 2.87109 6.72656V7.47255C1.22957 7.84063 0 9.29742 0 11.0332C0 12.0083 0.3691 12.9227 1.03934 13.6079C1.71778 14.3016 2.6305 14.6836 3.60938 14.6836H3.89648C4.34954 14.6836 4.7168 14.3163 4.7168 13.8633C4.7168 13.4102 4.34954 13.043 3.89648 13.043H3.60938C2.5054 13.043 1.64062 12.1602 1.64062 11.0332C1.64062 9.925 2.55778 9.02344 3.68509 9.02344H3.69141C4.14446 9.02344 4.51172 8.65618 4.51172 8.20312V6.72656C4.51172 5.61836 5.41328 4.7168 6.52148 4.7168C7.09718 4.7168 7.64642 4.96502 8.02844 5.39782C8.23901 5.63637 8.56849 5.73161 8.87385 5.64223C9.17921 5.55286 9.40533 5.29499 9.45406 4.98057C9.74909 3.0765 11.4273 1.64062 13.3578 1.64062C15.5363 1.64062 17.3086 3.41291 17.3086 5.59133V6.60023C17.3086 6.90375 17.4762 7.18249 17.7443 7.32482C18.7405 7.85355 19.3594 8.88156 19.3594 10.0078C19.3594 11.4335 18.3904 12.6504 17.003 12.9669C16.5613 13.0677 16.285 13.5075 16.3858 13.9492C16.4866 14.3909 16.9264 14.6674 17.368 14.5665C18.3841 14.3346 19.306 13.7581 19.9639 12.9433C20.632 12.1157 21 11.0732 21 10.0078C21 8.44376 20.2256 7.00288 18.9492 6.13782Z" fill="#171E2C" />
                    </g>
                  </svg>
                </div>
                {isFreePlan && (
                  <>
                    <div className="db001-lock-tint"></div>
                    <div className="db001-lock-ribbon">
                      <IconLock size={14} />
                    </div>
                    <div className="db001-lock-bar">
                      <IconLock size={10} />
                      Upgrade untuk membuka
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div>
            <div className="db001-section-header" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 className="db001-section-title">Posisi Terbaru</h2>
                <p style={{ fontSize: 12, color: 'var(--luna-ink-600)', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                  Setiap posisi adalah profil penilaian AI. Upload CV kandidat ke dalamnya Luna akan otomatis memberi skor dan ranking.
                </p>
              </div>
              <a href="#" className="db001-view-all-link" style={{ marginTop: 4 }} onClick={(e) => { e.preventDefault(); navigate('seleksi_001'); }}>Lihat Semua</a>
            </div>
            <div className="db001-table-container">
              <div className="db001-table-header">
                <div>Posisi</div>
                <div>Departemen</div>
                <div>Kandidat Baru</div>
                <div>Status</div>
              </div>
              {isLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                  Memuat data posisi...
                </div>
              ) : recentJobs.length > 0 ? (
                recentJobs.map((row, i) => {
                  const statusKey = (row.status || 'rencana').toLowerCase();
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.rencana;
                  return (
                    <div className="db001-row db001-row--clickable" key={i} onClick={() => navigate('seleksi-detail_001', { seleksiId: row.id, jabatan: row.posisi })}>
                      <div>{row.posisi}</div>
                      <div>{row.dept}</div>
                      <div><span className="db001-cv-badge">{row.kandidatCount} CV</span></div>
                      <div>
                        <div className={`lw-status-bubble ${statusKey}`} style={{ pointerEvents: 'none' }}>
                          <div className="lw-status-content">
                            <div className="lw-icon-wrapper"><img src={cfg.icon} alt={cfg.label} /></div>
                            <span className="lw-status-text">{cfg.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8b95a5', fontSize: '14px' }}>
                  Belum ada posisi terbaru
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="db001-right-column">
          {/* Recent Activity */}
          <div className="db001-activity-card">
            <h2 className="db001-section-title">Aktivitas Terbaru</h2>
            <div className="db001-activity-list">
              {isLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                  Memuat data aktivitas...
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((item, i) => (
                  <div className="db001-activity-item" key={i}>
                    <div className="db001-activity-icon-wrapper" style={{ background: item.bg }}>
                      <img src={item.icon} />
                    </div>
                    <div className="db001-activity-content">
                      <div className="db001-activity-text">{item.text}</div>
                      <div className="db001-activity-time">{item.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8b95a5', fontSize: '14px' }}>
                  Belum ada aktivitas
                </div>
              )}
            </div>
          </div>

          {/* NPS — popup */}
          {npsState === 'popup' && (
            <div className="nps001-card">
              <button className="nps001-close-btn" onClick={() => setNpsState('widget')}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                </svg>
              </button>

              {npsScore === null ? (
                <>
                  <p className="nps001-title">Bagaimana kualitas analisa dan scoring kandidat dari LUNA menurut Anda?</p>
                  <div className="nps001-scores-container">
                    <div className="nps001-scores-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button key={n} className="nps001-score-btn" onClick={() => setNpsScore(n)}>{n}</button>
                      ))}
                    </div>
                    <div className="nps001-labels-row">
                      <span>SANGAT BURUK</span><span>SANGAT BAIK</span>
                    </div>
                  </div>
                  <button className="nps001-submit-btn" disabled>Pilih Skor</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <button
                      onClick={() => setNpsScore(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0 0', color: 'var(--luna-ink-500)', display: 'flex' }}
                      title="Pilih Ulang Skor"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                    <p className="nps001-title" style={{ paddingRight: 0 }}>Ada hal yang perlu kami tingkatkan?</p>
                  </div>
                  <textarea
                    className="nps001-feedback-text"
                    placeholder="Tulis saran Anda di sini..."
                    value={npsText}
                    onChange={(e) => {
                      setNpsText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={2}
                  />
                  <button className="nps001-submit-btn" disabled={npsSubmitted} onClick={handleNpsSubmit}>
                    {npsSubmitted ? 'Terkirim! ✓' : 'Kirim Feedback'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* NPS — collapsed widget */}
          {npsState === 'widget' && (
            <button className="nps001-widget" onClick={() => setNpsState('popup')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Beri Penilaian</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
