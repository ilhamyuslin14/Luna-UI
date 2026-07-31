import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardMetrics, getRecentJobs, getRecentActivities } from '../../services/dashboardService.js';
import { getCached } from '../../services/dataCache.js';
import '../../../css/beranda_002.css';

export default function Beranda_002({ navigate }) {
  const { user, profileName, companyName, companyId } = useAuth() || {};
  const userName = profileName || user?.user_metadata?.full_name || 'HR Team';
  const companyDisplay = companyName || 'Perusahaan Anda';

  const sliderRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveDot(0);
      return;
    }
    const totalDots = Math.ceil(recentJobs.slice(0, 6).length / 3);
    const progress = scrollLeft / maxScroll;
    const index = Math.min(Math.round(progress * (totalDots - 1)), totalDots - 1);
    setActiveDot(Math.max(0, index));
  };

  const scrollToDot = (index) => {
    if (!sliderRef.current) return;
    const clientWidth = sliderRef.current.clientWidth;
    sliderRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    isDraggingRef.current = false;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleCardClick = (e, job) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      return;
    }
    navigate('lowongan-detail_001', { id: job.id, jabatan: job.posisi });
  };

  const [metrics, setMetrics] = useState({
    totalKandidat: 0,
    lowonganAktif: 0,
    direkrut: 0,
    rataKecocokan: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    getCached(`beranda_002:${companyId}`, async () => {
      const [m, jobs] = await Promise.all([
        getDashboardMetrics(companyId),
        getRecentJobs(companyId),
      ]);
      return { metrics: m, recentJobs: jobs };
    })
      .then(data => {
        setMetrics(data.metrics || {});
        setRecentJobs(data.recentJobs || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return (
    <div className="db002-view">
      {/* Hero Action Banner */}
      <div className="db002-hero-card">
        <div className="db002-hero-bg-glow"></div>
        <div className="db002-hero-content">
          <div className="db002-hero-badge">
            <span className="db002-hero-badge-dot"></span>
            {companyDisplay}
          </div>
          <h1 className="db002-hero-title">
            Selamat Datang Kembali, {userName}!
          </h1>
          <p className="db002-hero-subtitle">
            Mari mulai rekrutmen hari ini. Langkah pertama adalah membuat lowongan pekerjaan baru untuk mendapatkan talenta terbaik.
          </p>
        </div>
        <div className="db002-hero-action">
          <button 
            className="db002-btn-cta-primary" 
            onClick={() => navigate('buat-lowongan_001')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Buat Lowongan Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Step Action Tiles */}
      <div className="db002-flow-section">
        <div className="db002-tiles-grid">
          {/* Tile 1 */}
          <div className="db002-action-tile" onClick={() => navigate('buat-lowongan_001')}>
            <div className="db002-tile-header">
              <div className="db002-tile-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span className="db002-tile-step-num">Langkah 1</span>
            </div>
            <div>
              <h3 className="db002-tile-title">1. Buat Lowongan Pekerjaan</h3>
              <p className="db002-tile-desc">Rancang deskripsi & kriteria lowongan kerja baru dengan mudah.</p>
            </div>
            <div className="db002-tile-footer">
              <span>Mulai Buat</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="db002-action-tile" onClick={() => navigate('lowongan_001')}>
            <div className="db002-tile-header">
              <div className="db002-tile-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <span className="db002-tile-step-num">Langkah 2</span>
            </div>
            <div>
              <h3 className="db002-tile-title">2. Bagikan & Sebar Lowongan</h3>
              <p className="db002-tile-desc">Sebarkan link karir lowongan Anda ke berbagai media & kanal.</p>
            </div>
            <div className="db002-tile-footer">
              <span>Lihat Lowongan</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="db002-action-tile" onClick={() => navigate('kandidat_001')}>
            <div className="db002-tile-header">
              <div className="db002-tile-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="db002-tile-step-num">Langkah 3</span>
            </div>
            <div>
              <h3 className="db002-tile-title">3. Seleksi Kandidat Masuk</h3>
              <p className="db002-tile-desc">Evaluasi pelamar dengan penilaian otomatis AI & skoring transparan.</p>
            </div>
            <div className="db002-tile-footer">
              <span>Kelola Kandidat</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Separator Divider Line */}
      <div className="db002-section-divider">
        <span className="db002-divider-text">Ringkasan Metrik</span>
        <div className="db002-divider-line"></div>
      </div>

      {/* Metrics Row */}
      <div className="db002-metrics-grid">
        <div className="db002-metric-card" onClick={() => navigate('lowongan_001')} style={{ cursor: 'pointer' }}>
          <div className="db002-metric-left">
            <div className="db002-metric-icon-box db002-icon-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="db002-metric-info">
              <span className="db002-metric-label">Lowongan Aktif</span>
              <span className="db002-metric-value">{metrics.lowonganAktif || 0}</span>
            </div>
          </div>
          <span className="db002-metric-badge db002-badge-orange">Aktif</span>
        </div>

        <div className="db002-metric-card" onClick={() => navigate('kandidat_001')} style={{ cursor: 'pointer' }}>
          <div className="db002-metric-left">
            <div className="db002-metric-icon-box db002-icon-dark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="db002-metric-info">
              <span className="db002-metric-label">Total Kandidat</span>
              <span className="db002-metric-value">{metrics.totalKandidat || 0}</span>
            </div>
          </div>
          <span className="db002-metric-badge db002-badge-dark">Total</span>
        </div>

        <div className="db002-metric-card" style={{ cursor: 'default' }}>
          <div className="db002-metric-left">
            <div className="db002-metric-icon-box db002-icon-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="db002-metric-info">
              <span className="db002-metric-label">Diterima / Dihire</span>
              <span className="db002-metric-value">{metrics.direkrut || 0}</span>
            </div>
          </div>
          <span className="db002-metric-badge db002-badge-green">Selesai</span>
        </div>
      </div>

      {/* Recent Jobs Slider — Pipeline Stage Cards (Single Row Drag Slider max 6) */}
      <div className="db002-jobs-section">
        <div className="db002-jobs-header">
          <div className="db002-jobs-title-wrap">
            <h2 className="db002-section-label">Daftar Lowongan Pekerjaan Terbaru</h2>
          </div>
          <span className="db002-link-all" onClick={() => navigate('lowongan_001')}>
            Lihat Semua Lowongan
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>

        {recentJobs && recentJobs.length > 0 ? (
          <>
            <div 
              className={`db002-jobs-track ${isMouseDown ? 'is-dragging' : ''}`}
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onScroll={handleScroll}
            >
              {recentJobs.slice(0, 6).map(job => (
                <div 
                  key={job.id} 
                  className="db002-pipeline-card"
                  onClick={(e) => handleCardClick(e, job)}
                >
                  {/* Card Top */}
                  <div className="db002-pipeline-top">
                    <div className="db002-pipeline-header">
                      <div className="db002-pipeline-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                      </div>
                      <span className={`db002-status-pill ${job.status === 'Aktif' ? 'status-active' : 'status-draft'}`}>
                        {job.status || 'Aktif'}
                      </span>
                    </div>
                    <h3 className="db002-pipeline-title" title={job.posisi}>{job.posisi}</h3>
                    <div className="db002-pipeline-tags">
                      <span className="db002-pipeline-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        {job.departemen || job.dept || 'Umum'}
                      </span>
                      <span className="db002-pipeline-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {job.lokasi || job.companyLokasi || 'Lokasi tidak diset'}
                      </span>
                    </div>
                  </div>

                  {/* Pipeline Mini Stages Bar */}
                  <div className="db002-pipeline-stages">
                    <div className="db002-stage-item">
                      <span className="db002-stage-dot dot-blue"></span>
                      <span className="db002-stage-num">{job.stages?.baru || 0}</span>
                      <span className="db002-stage-lbl">Baru</span>
                    </div>
                    <div className="db002-stage-item">
                      <span className="db002-stage-dot dot-orange"></span>
                      <span className="db002-stage-num">{job.stages?.interview || 0}</span>
                      <span className="db002-stage-lbl">Wawancara</span>
                    </div>
                    <div className="db002-stage-item">
                      <span className="db002-stage-dot dot-green"></span>
                      <span className="db002-stage-num">{job.stages?.hired || 0}</span>
                      <span className="db002-stage-lbl">Hired</span>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="db002-pipeline-footer">
                    <span className="db002-total-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                      {job.jumlahKandidat ?? job.kandidatCount ?? 0} Kandidat
                    </span>
                    <button className="db002-pipeline-btn">
                      <span>Kelola</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Slider Dots Indicator */}
            {recentJobs.slice(0, 6).length > 3 && (
              <div className="db002-slider-dots">
                {Array.from({ length: Math.ceil(recentJobs.slice(0, 6).length / 3) }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`db002-slider-dot ${activeDot === idx ? 'active' : ''}`}
                    onClick={() => scrollToDot(idx)}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="db002-empty-state">
            <div className="db002-tile-icon-box" style={{ width: 44, height: 44 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <p className="db002-empty-title">Belum ada lowongan pekerjaan dibuka</p>
            <p className="db002-empty-desc">Buat lowongan pekerjaan pertama Anda sekarang untuk mulai menerima lamaran kandidat.</p>
            <button className="db002-btn-cta-primary" style={{ marginTop: 6 }} onClick={() => navigate('buat-lowongan_001')}>
              + Buat Lowongan Pekerjaan Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
