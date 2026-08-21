import { useState, useRef, useEffect } from 'react';
import useSemuaLowonganData, { SEMUA_LOWONGAN_SORT_OPTIONS } from '../../hooks/lowongan/useSemuaLowonganData.js';
import { formatUpah } from '../../hooks/lowongan/useLamanKarirData.js';
import '../../../css/lowongan/lowongan-laman-karir_001.css';

// Laman publik "Semua Lowongan" (?view=semua-lowongan) — daftar seluruh
// lowongan aktif di Luna, bisa diakses siapa saja tanpa login, mirip landing
// page. Duplikat dari bagian "Semua Lowongan Aktif" di laman sukses melamar
// (Lowongan-LamanKarir_001.jsx), tapi berdiri sendiri: tidak terikat 1
// lowongan/perusahaan spesifik, jadi header-nya pesan terbuka (bukan pesan
// sukses melamar) dan tanpa CTA "Kembali ke Lowongan".
export default function SemuaLowongan() {
  const {
    loading, search, setSearch, sort, setSort, page, setPage,
    sortedJobs, pagedJobs, totalPages, pageSize,
  } = useSemuaLowonganData(9);

  const [portalView, setPortalView] = useState('list');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const activeSortLabel = SEMUA_LOWONGAN_SORT_OPTIONS.find(o => o.value === sort)?.label || 'Terbaru';

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
        </div>
      </header>

      <div className="lk-portal-container option2">
        {/* Banner — pesan terbuka, bukan pesan sukses melamar */}
        <div className="lk-tech-banner">
          <div className="lk-tech-banner-top">
            <h1 className="lk-explore-title">Temukan Karier Impianmu di Luna</h1>
            <p className="lk-tech-success-sub">
              Jelajahi seluruh lowongan pekerjaan aktif dari perusahaan-perusahaan terverifikasi di platform kami, dan mulai langkah kariermu berikutnya.
            </p>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="lk-portal-clear-search">×</button>
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
                    {SEMUA_LOWONGAN_SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`lk-sort-control-item${sort === opt.value ? ' active' : ''}`}
                        onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
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

          {loading ? (
            <div className="lk-portal-empty-001">
              <p>Memuat lowongan…</p>
            </div>
          ) : pagedJobs.length > 0 ? (
            portalView === 'list' ? (
              <div className="lk-job-list-001">
                {pagedJobs.map(job => (
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
                {pagedJobs.map(job => (
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
          {!loading && sortedJobs.length > 0 && (
            <div className="lk-portal-pagination">
              <span className="lk-portal-pagination-summary">
                Menampilkan <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedJobs.length)}</strong> dari <strong>{sortedJobs.length}</strong> lowongan
              </span>
              <div className="lk-portal-pagination-controls">
                <button
                  className="lk-portal-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`lk-portal-page-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="lk-portal-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
