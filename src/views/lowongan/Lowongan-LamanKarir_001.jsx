import { useState, useEffect, useRef } from 'react';
import useLamanKarirData, {
  formatDeskripsiToHtml, formatTanggal, formatPengalaman, formatUpah, getApplyErrorInfo, getAdminActivityState,
} from '../../hooks/lowongan/useLamanKarirData.js';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/lowongan-perusahaan_001.css';
import '../../../css/lowongan/lowongan_001.css';

// Icons
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" /><circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 16.5v-3.7a2.3 2.3 0 0 1 4.5 0v3.7" /><line x1="11" y1="10.5" x2="11" y2="16.5" />
  </svg>
);

const IconInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M14 8.5h-1.3c-.9 0-1.7.7-1.7 1.7V12h3l-.4 2.5h-2.6V19" />
  </svg>
);

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
  </svg>
);

const IconTelegram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SHARE_PLATFORMS = [
  { key: 'wa', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

export default function LowonganLamanKarir_001({ kode }) {
  const {
    pageState, seleksiData, viewCount,
    form, handleChange, handlePhoneChange, linkedinError,
    cvFile, fileError, dragOver, setDragOver, handleDrop, handleFileInput, setCvFile,
    submitState, submitErrorMsg, progressText, uploadPercent, handleSubmit, resetApply,
    portalJobs, portalSearch, setPortalSearch,
    handleShareAction,
  } = useLamanKarirData(kode);

  const [showToast, setShowToast] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ── Kontrol laman portal (layar "berhasil melamar") ──
  const PORTAL_PAGE_SIZE = 9;
  const SORT_OPTIONS = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'az', label: 'Nama A-Z' },
    { value: 'za', label: 'Nama Z-A' },
  ];
  const [portalView, setPortalView] = useState('list'); // 'list' | 'card'
  const [portalSort, setPortalSort] = useState('terbaru');
  const [portalPage, setPortalPage] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cari/urutkan ganti → balik ke halaman 1, supaya tidak nyangkut di halaman
  // kosong kalau hasilnya jadi lebih sedikit dari sebelumnya.
  useEffect(() => { setPortalPage(1); }, [portalSearch, portalSort]);

  useEffect(() => {
    document.body.style.setProperty('overflow', 'visible', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.documentElement.style.setProperty('overflow', 'visible', 'important');
    document.documentElement.style.setProperty('height', 'auto', 'important');

    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
    };
  }, []);

  const onShareDone = (result) => {
    if (result === 'copied' || result === 'instagram') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
    setShowShareMenu(false);
  };

  if (pageState === 'loading') {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--karir-ink-500)', fontSize: '14px' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--karir-primary)" strokeWidth="2.5" style={{ margin: '0 auto 12px auto' }}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <p>Memuat informasi lowongan pekerjaan...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'not-found' || !seleksiData) {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="lk-section-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--karir-ink-900)', margin: '0 0 8px 0' }}>Lowongan Tidak Ditemukan</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--karir-ink-600)', margin: '0 0 20px 0', lineHeight: '1.5' }}>Lowongan pekerjaan ini mungkin sudah ditutup atau tautan yang Anda buka tidak valid.</p>
          <button className="lk-btn-submit" style={{ margin: '0 auto', maxWidth: '200px' }} onClick={() => window.location.href = '/'}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  const upahStr = formatUpah(seleksiData);
  const companyName = seleksiData.companies?.name || seleksiData.companies?.nama || seleksiData.company_name || null;
  const companySlug = seleksiData.companies?.slug || null;
  const companyLogoUrl = seleksiData.companies?.logo_url || null;
  const companyPageUrl = companySlug ? `/?view=laman-perusahaan&slug=${encodeURIComponent(companySlug)}` : null;
  const pengalamanMin = seleksiData.pengalaman || null;
  const departemenName = seleksiData.departments?.name || null;
  const modelKerjaTipeKerja = [seleksiData.remote, seleksiData.ikatan_kerja].filter(Boolean).join(' · ');

  if (submitState === 'success') {
    const filteredPortalJobs = portalJobs.filter(job => {
      return !portalSearch.trim() ||
        (job.jabatan || '').toLowerCase().includes(portalSearch.toLowerCase()) ||
        (job.companies?.name || '').toLowerCase().includes(portalSearch.toLowerCase()) ||
        (job.lokasi || '').toLowerCase().includes(portalSearch.toLowerCase());
    });

    // "Terbaru" = urutan asli dari getAllActiveJobs() (sudah ORDER BY
    // created_at desc dari query-nya), jadi tidak perlu di-sort ulang di sini.
    const sortedPortalJobs = portalSort === 'terbaru'
      ? filteredPortalJobs
      : [...filteredPortalJobs].sort((a, b) => {
          const cmp = (a.jabatan || '').localeCompare(b.jabatan || '', 'id');
          return portalSort === 'az' ? cmp : -cmp;
        });

    const totalPortalPages = Math.max(1, Math.ceil(sortedPortalJobs.length / PORTAL_PAGE_SIZE));
    const pagedPortalJobs = sortedPortalJobs.slice(
      (portalPage - 1) * PORTAL_PAGE_SIZE,
      portalPage * PORTAL_PAGE_SIZE
    );
    const activeSortLabel = SORT_OPTIONS.find(o => o.value === portalSort)?.label || 'Terbaru';

    const openJob = (job) => {
      const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
      window.open(url, '_blank');
    };

    return (
      <div className="lk-page-wrapper">
        {/* Header Navbar */}
        <header className="lk-header">
          <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a className="lk-brand" href="/?view=semua-lowongan">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
              <span className="lk-brand-badge">PORTAL KARIR</span>
            </a>
            <button className="lk-back-ghost" onClick={resetApply}>
              <span className="lk-back-ghost-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </span>
              Kembali ke Lowongan
            </button>
          </div>
        </header>

        <div className="lk-portal-container option2">
          {/* Success Banner */}
          <div className="lk-tech-banner">
            <div className="lk-tech-banner-top">
              <div className="lk-tech-success-pill">
                <span className="lk-tech-check-circle">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span>Aplikasi Berhasil Dikirim</span>
              </div>
              <p className="lk-tech-success-sub">
                Terima kasih telah melamar ke <strong>{companyName || 'Perusahaan'}</strong>. Berkas CV Anda <strong>({cvFile?.name || 'CV.pdf'})</strong> sedang diproses oleh tim rekrutmen.
              </p>
            </div>

            {/* Applied Job Snippet Box */}
            <div className="lk-tech-snippet-box">
              <div className="lk-tech-snippet-info">
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt={companyName} className="lk-tech-logo" />
                ) : (
                  <div className="lk-tech-logo-fallback">{(companyName || 'P')[0]}</div>
                )}
                <div>
                  <h3 className="lk-tech-job-title">{seleksiData.jabatan}</h3>
                  <span className="lk-tech-company-name">
                    {companyName || 'PT Arkademi'}
                    <span className="lk-tech-company-dot" />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {seleksiData.lokasi || 'Indonesia'}
                  </span>
                </div>
              </div>
              <div className="lk-tech-snippet-actions">
                <span className="lk-tech-date-tag">Melamar pada: Hari Ini</span>
              </div>
            </div>
          </div>

          {/* Semua Lowongan Aktif */}
          <div className="lk-portal-section">
            <div className="lk-portal-section-header flex-header">
              <div>
                <h2 className="lk-portal-section-title">Semua Lowongan Aktif di Luna</h2>
                <p className="lk-portal-section-desc">Eksplorasi posisi terbaru dari seluruh perusahaan terverifikasi di platform ini.</p>
              </div>

              <div className="lk-portal-controls">
                {/* Search */}
                <div className="lk-portal-search-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    placeholder="Cari lowongan, perusahaan, kota…"
                    value={portalSearch}
                    onChange={(e) => setPortalSearch(e.target.value)}
                  />
                  {portalSearch && (
                    <button onClick={() => setPortalSearch('')} className="lk-portal-clear-search">×</button>
                  )}
                </div>

                {/* Sort */}
                <div className="lk-sort-control" ref={sortMenuRef}>
                  <button className="lk-sort-control-btn" onClick={() => setShowSortMenu(v => !v)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                    <span className="lk-sort-control-label">Urutkan:</span>
                    <span className="lk-sort-control-value">{activeSortLabel}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showSortMenu && (
                    <div className="lk-sort-control-menu">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`lk-sort-control-item${portalSort === opt.value ? ' active' : ''}`}
                          onClick={() => { setPortalSort(opt.value); setShowSortMenu(false); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="lk-view-toggle">
                  <button
                    className={`lk-view-toggle-btn${portalView === 'list' ? ' active' : ''}`}
                    onClick={() => setPortalView('list')}
                    title="Tampilan daftar"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                  </button>
                  <button
                    className={`lk-view-toggle-btn${portalView === 'card' ? ' active' : ''}`}
                    onClick={() => setPortalView('card')}
                    title="Tampilan kartu"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {pagedPortalJobs.length > 0 ? (
              portalView === 'list' ? (
                <div className="lk-job-list-001">
                  {pagedPortalJobs.map(job => (
                    <article key={job.id} className="lk-job-row" onClick={() => openJob(job)}>
                      <div className="lk-job-row-main">
                        {job.companies?.logo_url ? (
                          <img src={job.companies.logo_url} alt={job.companies.name} className="lk-job-row-logo" />
                        ) : (
                          <div className="lk-job-row-logo lk-job-row-logo-fallback">{(job.companies?.name || 'P')[0]}</div>
                        )}
                        <div className="lk-job-row-body">
                          <div className="lk-pjob-company-eyebrow">{job.companies?.name || 'Perusahaan'}</div>
                          <h3 className="lk-pjob-title">{job.jabatan}</h3>
                          <div className="lk-pjob-meta">
                            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{job.lokasi || 'Indonesia'}</span>
                            {(job.remote || job.ikatan_kerja) && (
                              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>{[job.remote, job.ikatan_kerja].filter(Boolean).join(' · ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="lk-job-row-side">
                        {formatUpah(job) && (
                          <div className="lk-job-row-salary">
                            <span>Estimasi gaji</span>
                            Rp {formatUpah(job)}
                          </div>
                        )}
                        <button className="lk-pjob-btn orange-btn" onClick={(e) => { e.stopPropagation(); openJob(job); }}>
                          <span>Lihat Lowongan</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="lk-portal-jobs-grid tech-grid">
                  {pagedPortalJobs.map(job => (
                    <div key={job.id} className="lk-portal-job-card tech-card" onClick={() => openJob(job)}>
                      <div className="lk-pjob-top">
                        {job.companies?.logo_url ? (
                          <img src={job.companies.logo_url} alt={job.companies.name} className="lk-pjob-logo" />
                        ) : (
                          <div className="lk-pjob-logo-fallback">{(job.companies?.name || 'P')[0]}</div>
                        )}
                      </div>
                      <div>
                        <div className="lk-pjob-company-eyebrow">{job.companies?.name || 'Perusahaan'}</div>
                        <h3 className="lk-pjob-title">{job.jabatan}</h3>
                      </div>

                      <div className="lk-pjob-meta">
                        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{job.lokasi || 'Indonesia'}</span>
                        {(job.remote || job.ikatan_kerja) && (
                          <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>{[job.remote, job.ikatan_kerja].filter(Boolean).join(' · ')}</span>
                        )}
                      </div>

                      {formatUpah(job) && (
                        <div className="lk-pjob-salary">Rp {formatUpah(job)}</div>
                      )}

                      <button className="lk-pjob-btn orange-btn" onClick={(e) => { e.stopPropagation(); openJob(job); }}>
                        <span>Lihat Lowongan</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="lk-portal-empty-001">
                <p>Tidak ada lowongan yang cocok dengan pencarian Anda.</p>
              </div>
            )}

            {/* Pagination */}
            {sortedPortalJobs.length > 0 && (
              <div className="lk-portal-pagination">
                <span className="lk-portal-pagination-summary">
                  Menampilkan <strong>{(portalPage - 1) * PORTAL_PAGE_SIZE + 1}–{Math.min(portalPage * PORTAL_PAGE_SIZE, sortedPortalJobs.length)}</strong> dari <strong>{sortedPortalJobs.length}</strong> lowongan
                </span>
                <div className="lk-portal-pagination-controls">
                  <button
                    className="lk-portal-page-btn"
                    disabled={portalPage <= 1}
                    onClick={() => setPortalPage(p => Math.max(1, p - 1))}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: totalPortalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`lk-portal-page-btn${p === portalPage ? ' active' : ''}`}
                      onClick={() => setPortalPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="lk-portal-page-btn"
                    disabled={portalPage >= totalPortalPages}
                    onClick={() => setPortalPage(p => Math.min(totalPortalPages, p + 1))}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lk-page-wrapper" onClick={() => setShowShareMenu(false)}>
      {/* Toast Alert Feedback */}
      {showToast && (
        <div className="lk-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Link lowongan berhasil disalin!</span>
        </div>
      )}

      {/* Top Clean Professional Header Navbar */}
      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a className="lk-brand" href="/?view=semua-lowongan">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
            <span className="lk-brand-badge">PORTAL KARIR</span>
          </a>

          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={`lpr-btn-share${showShareMenu ? ' active' : ''}`}
              onClick={() => setShowShareMenu(v => !v)}
              title="Bagikan Laman Karir"
            >
              <IconShare />
              <span>Bagikan</span>
            </button>

            {showShareMenu && (
              <div className="lw001-share-menu" style={{ right: 0, top: 'calc(100% + 8px)', zIndex: 100 }} onClick={e => e.stopPropagation()}>
                <div className="lw001-share-eyebrow">BAGIKAN LAMAN KARIR</div>
                <div className="lw001-share-linkcard">
                  <span className="lw001-share-linkcard-url">{window.location.href}</span>
                  <button type="button" className="lw001-share-linkcard-copy" onClick={() => handleShareAction('copy', onShareDone)}>
                    <IconLink />
                    {showToast ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <div className="lw001-share-divider" />
                <div className="lw001-share-grid">
                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                    <button key={key} type="button" className="lw001-share-gridbtn" onClick={() => handleShareAction(key, onShareDone)}>
                      <span className="lw001-share-gridbtn-icon"><Icon /></span>
                      <span className="lw001-share-gridbtn-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="lk-breadcrumb-bar">
        {companyPageUrl ? (
          <a href={companyPageUrl}>{companyName}</a>
        ) : (
          <span>{companyName || 'Lowongan Pekerjaan'}</span>
        )}
        <span>/</span>
        <span className="active">{seleksiData.jabatan}</span>
      </div>

      {/* Main 2-Column Layout Container */}
      <div className="lk-main-container">
        {/* Left Column: Job Details & Requirements (65%) */}
        <div className="lk-left-col">
          {/* Modern Enterprise Job Hero Showcase */}
          <div className="lk-job-hero-card">
            <div className="lk-job-hero-top-row">
              <div className="lk-job-company-logo-wrap">
                {companyPageUrl ? (
                  <a href={companyPageUrl} title={`Lihat profil ${companyName || ''}`}>
                    {companyLogoUrl ? <img src={companyLogoUrl} alt={companyName || ''} /> : <span>{(companyName || '?').charAt(0).toUpperCase()}</span>}
                  </a>
                ) : (
                  companyLogoUrl ? <img src={companyLogoUrl} alt={companyName || ''} /> : <span>{(companyName || '?').charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="lk-job-hero-meta-head">
                {companyName && (
                  <div className="lk-job-company-name-row">
                    {companyPageUrl ? (
                      <a href={companyPageUrl} className="lk-job-company-link">
                        {companyName}
                      </a>
                    ) : (
                      <span className="lk-job-company-title">{companyName}</span>
                    )}
                    <span className="lk-active-hiring-badge">
                      <span className="dot"></span> Lowongan Aktif
                    </span>

                    {(() => {
                      const adminActivity = getAdminActivityState(seleksiData);
                      return (
                        <span className={`lk-admin-activity-badge ${adminActivity.isOnline ? 'online' : ''}`}>
                          {adminActivity.isOnline ? (
                            <span className="online-pulse-dot" />
                          ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                          )}
                          <span>{adminActivity.text}</span>
                        </span>
                      );
                    })()}

                    {typeof viewCount === 'number' && viewCount >= 0 && (
                      <span className="lk-view-count-badge" title="Total tayangan halaman lowongan ini">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{viewCount.toLocaleString('id-ID')} Dilihat</span>
                      </span>
                    )}
                  </div>
                )}

                <h1 className="lk-job-main-title">{seleksiData.jabatan}</h1>
              </div>
            </div>

            <div className="lk-job-hero-details-strip">
              {seleksiData.lokasi && (
                <div className="lk-job-detail-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{seleksiData.lokasi}</span>
                </div>
              )}
              {seleksiData.remote && (
                <div className="lk-job-detail-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  <span>{seleksiData.remote}</span>
                </div>
              )}
              {seleksiData.ikatan_kerja && seleksiData.ikatan_kerja !== seleksiData.remote && (
                <div className="lk-job-detail-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <span>{seleksiData.ikatan_kerja}</span>
                </div>
              )}
              {upahStr && (
                <div className="lk-job-salary-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2.5"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                  <span>Rp {upahStr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modern Professional Non-Flat Detail List Layout */}
          <div className="lk-detail-card">
            <div className="lk-detail-header-row">
              <div className="lk-detail-title-accent"></div>
              <h3 className="lk-detail-title">Detail Pekerjaan</h3>
            </div>

            <div className="lk-detail-list-wrapper">
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Departemen</span>
                <span className="lk-detail-row-value">{departemenName || '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Level Jabatan</span>
                <span className="lk-detail-row-value">{seleksiData.level_jabatan || '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Lokasi</span>
                <span className="lk-detail-row-value">{seleksiData.lokasi || '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Ikatan Kerja</span>
                <span className="lk-detail-row-value">{seleksiData.ikatan_kerja || '-'}</span>
              </div>

              {upahStr && (
                <div className="lk-detail-row-001">
                  <span className="lk-detail-row-label">Upah / Gaji</span>
                  <span className="lk-detail-row-value" style={{ color: '#EA580C', fontWeight: '700' }}>Rp {upahStr}</span>
                </div>
              )}

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Min. Pendidikan</span>
                <span className="lk-detail-row-value">{seleksiData.pendidikan || '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Min. Pengalaman</span>
                <span className="lk-detail-row-value">{formatPengalaman(pengalamanMin) || '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Jumlah Posisi</span>
                <span className="lk-detail-row-value">{seleksiData.jumlah_rekrut ? `${seleksiData.jumlah_rekrut} Orang` : '-'}</span>
              </div>

              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Tanggal Buka</span>
                <span className="lk-detail-row-value">
                  {formatTanggal(seleksiData.tgl_onboard || seleksiData.target_onboarding || seleksiData.target_date || seleksiData.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="lk-section-card">
            <h2 className="lk-section-title-001">Deskripsi & Tanggung Jawab Pekerjaan</h2>
            <div
              className="lk-rich-content"
              dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.deskripsi) || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }}
            />
          </div>

          {/* Job Requirements Card */}
          {seleksiData.kualifikasi && (
            <div className="lk-section-card">
              <h2 className="lk-section-title-001">Persyaratan & Kualifikasi Pelamar</h2>
              <div
                className="lk-rich-content"
                dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.kualifikasi) }}
              />
            </div>
          )}
        </div>

        {/* Right Column: Floating Sticky Form Sidebar (35%) */}
        <div className="lk-right-col">
          <div className="lk-apply-card">
            <div className="lk-apply-header">
              <h3 className="lk-apply-title">Lamar Posisi Ini</h3>
              <p className="lk-apply-sub">Isi data diri dan unggah CV Anda</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Form Input Fields */}
              <div className="lk-form-group">
                <label className="lk-label">Nama Lengkap <span className="req">*</span></label>
                <input type="text" name="nama" className="lk-input-001" placeholder="Masukkan nama lengkap Anda" value={form.nama} onChange={handleChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">Email <span className="req">*</span></label>
                <input type="email" name="email" className="lk-input-001" placeholder="contoh@email.com" value={form.email} onChange={handleChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">Nomor HP <span className="req">*</span></label>
                <input type="text" inputMode="numeric" name="phone" className="lk-input-001" placeholder="+62 812 3456 7890" value={form.phone} onChange={handlePhoneChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">LinkedIn URL <span className="opt">(opsional)</span></label>
                <input type="text" name="linkedin" className={`lk-input-001 ${linkedinError ? 'error' : ''}`} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={handleChange} />
                {linkedinError && <span className="lk-error-text-001">Masukkan URL yang valid, contoh: linkedin.com/in/nama</span>}
              </div>

              {/* File Upload Zone */}
              <div className="lk-form-group">
                <label className="lk-label">Upload CV <span className="req">*</span></label>

                {cvFile ? (
                  <div className="lk-file-active">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      <span className="lk-file-name">{cvFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setCvFile(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>×</button>
                  </div>
                ) : (
                  <div
                    className={`lk-drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('lk-cv-input_001').click()}
                  >
                    <div className="lk-drop-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <span className="lk-drop-title">Seret & lepas file di sini, atau <span style={{ color: 'var(--karir-primary)', textDecoration: 'underline' }}>pilih file</span></span>
                    <span className="lk-drop-sub">PDF, DOC, DOCX • Maks. 10MB • Maks. 1 File</span>
                    <input id="lk-cv-input_001" type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
                  </div>
                )}
                {fileError && <span className="lk-error-text-001">{fileError}</span>}

                {/* Upload Notes */}
                <div className="lk-upload-notes-001">
                  <div className="lk-upload-note-item-001">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Pastikan CV dalam format teks yang dapat dibaca, bukan hasil scan gambar.</span>
                  </div>
                  <div className="lk-upload-note-item-001">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Jika lebih dari 1 file, harap gabungkan menjadi 1 file PDF atau DOC sebelum diunggah (bisa menggunakan <a href="https://www.ilovepdf.com/merge_pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--karir-primary)', textDecoration: 'underline', fontWeight: 600 }}>tools ini</a>).</span>
                  </div>
                </div>

                {/* Animated Upload Progress Card */}
                {submitState === 'uploading' && (
                  <div className="lk-upload-progress-card">
                    <div className="lk-progress-header">
                      <div className="lk-progress-title-wrap">
                        <div className="lk-progress-spinner">
                          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--karir-primary)" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10"></path>
                          </svg>
                        </div>
                        <div className="lk-progress-info">
                          <span className="lk-progress-label">{progressText || 'Memproses berkas CV Anda...'}</span>
                          <span className="lk-progress-filename">{cvFile?.name}</span>
                        </div>
                      </div>
                      <div className="lk-progress-badge">{uploadPercent}%</div>
                    </div>

                    <div className="lk-progress-track">
                      <div className="lk-progress-fill" style={{ width: `${Math.min(100, Math.max(10, uploadPercent))}%` }}>
                        <div className="lk-progress-shimmer"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Error Warning */}
              {submitState === 'error' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '700', color: '#991B1B', margin: '0 0 2px 0' }}>
                    {getApplyErrorInfo(submitErrorMsg).title}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#B91C1C', margin: 0, lineHeight: '1.4' }}>
                    {getApplyErrorInfo(submitErrorMsg).desc}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="lk-btn-submit" disabled={submitState === 'uploading' || !cvFile}>
                {submitState === 'uploading' ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
                    <span>Memproses Lamaran ({uploadPercent}%)...</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span>Kirim Lamaran</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
