import React, { useState, useRef, useEffect } from 'react';
import '../../../css/pelamar/status-lamaran_001.css';

// Mock Data Riwayat Lamaran Pelamar (Mengikuti 10 Tahap Seleksi Standar Luna / DEFAULT_ALUR)
// Stage Pipeline Luna:
// Level 1: Kandidat Baru
// Level 2: Terseleksi (Review CV)
// Level 4: Penjadwalan Wawancara
// Level 5: Wawancara HR
// Level 6: Wawancara Akhir
// Level 7: Penawaran Kerja
// Level 8: Diterima
// Level 0: Tidak Sesuai
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    jobTitle: 'Lead Product Designer',
    companyName: 'Tech Recruitment Solutions',
    lokasi: 'Jakarta Selatan',
    modelKerja: 'Hybrid',
    gaji: 'Rp 28.000.000 – Rp 35.000.000 / bln',
    appliedDate: '14 Okt 2026',
    stageLevel: 4,
    statusText: 'Penjadwalan Wawancara',
    statusCategory: 'wawancara', // 'baru' | 'review' | 'wawancara' | 'diterima' | 'tolak'
    interviewSchedule: {
      date: 'Rabu, 21 Okt 2026',
      time: '14:00 WIB',
      channel: 'Google Meet',
      meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    jobCode: 'TRS-PD-01'
  },
  {
    id: 2,
    jobTitle: 'Senior UI/UX Specialist',
    companyName: 'Fintech Nusantara Digital',
    lokasi: 'Jakarta Pusat',
    modelKerja: 'Di Kantor (On-site)',
    gaji: 'Rp 24.000.000 – Rp 30.000.000 / bln',
    appliedDate: '16 Okt 2026',
    stageLevel: 2,
    statusText: 'Terseleksi (Review CV)',
    statusCategory: 'review',
    jobCode: 'FND-UIUX-02'
  },
  {
    id: 3,
    jobTitle: 'Principal Design System Specialist',
    companyName: 'Global Cloud Systems Asia',
    lokasi: 'Indonesia',
    modelKerja: 'Remote (WFA)',
    gaji: 'Rp 35.000.000 – Rp 45.000.000 / bln',
    appliedDate: '18 Okt 2026',
    stageLevel: 1,
    statusText: 'Kandidat Baru (Lamaran Terkirim)',
    statusCategory: 'baru',
    jobCode: 'GCS-DS-03'
  },
  {
    id: 4,
    jobTitle: 'Product Design Manager',
    companyName: 'Unicorn Logistics Indonesia',
    lokasi: 'Jakarta Barat',
    modelKerja: 'Hybrid',
    gaji: 'Rp 30.000.000 – Rp 40.000.000 / bln',
    appliedDate: '28 Sep 2026',
    stageLevel: 0,
    statusText: 'Tidak Sesuai',
    statusCategory: 'tolak',
    jobCode: 'ULI-PDM-04'
  }
];

// Mock Data Lowongan Tersimpan (Bookmarks)
const INITIAL_SAVED_JOBS = [
  {
    id: 101,
    jobTitle: 'Senior Product Designer (Design System)',
    companyName: 'Tokopedia Nusantara',
    lokasi: 'Jakarta Selatan',
    modelKerja: 'Hybrid',
    gaji: 'Rp 26.000.000 – Rp 34.000.000 / bln',
    savedDate: '17 Okt 2026'
  },
  {
    id: 102,
    jobTitle: 'VP of Product Experience & Design',
    companyName: 'Bank Mandiri Digital Tech',
    lokasi: 'Jakarta Pusat',
    modelKerja: 'Di Kantor (On-site)',
    gaji: 'Rp 45.000.000 – Rp 60.000.000 / bln',
    savedDate: '15 Okt 2026'
  },
  {
    id: 103,
    jobTitle: 'Lead UI/UX Engineer (React & Design System)',
    companyName: 'Traveloka Southeast Asia',
    lokasi: 'BSD City, Tangerang',
    modelKerja: 'Remote (WFA)',
    gaji: 'Rp 30.000.000 – Rp 40.000.000 / bln',
    savedDate: '12 Okt 2026'
  }
];

export default function StatusLamaran_001({ navigate }) {
  const [mainTab, setMainTab] = useState('riwayat'); // 'riwayat' | 'tersimpan'
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [savedJobs, setSavedJobs] = useState(INITIAL_SAVED_JOBS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'wawancara' | 'review' | 'baru' | 'tolak'

  // User Dropdown State
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Data Sederhana
  const filteredApps = applications.filter(app => {
    if (activeFilter === 'wawancara') return app.statusCategory === 'wawancara';
    if (activeFilter === 'review') return app.statusCategory === 'review';
    if (activeFilter === 'baru') return app.statusCategory === 'baru';
    if (activeFilter === 'tolak') return app.statusCategory === 'tolak';
    return true;
  });

  const countWawancara = applications.filter(a => a.statusCategory === 'wawancara').length;
  const countReview = applications.filter(a => a.statusCategory === 'review').length;
  const countBaru = applications.filter(a => a.statusCategory === 'baru').length;
  const countTolak = applications.filter(a => a.statusCategory === 'tolak').length;

  // Direct ke Detail Lowongan
  const handleOpenJob = (jobTitle) => {
    const url = `/?view=laman-karir&jabatan=${encodeURIComponent(jobTitle)}`;
    window.open(url, '_blank');
  };

  const handleRemoveSavedJob = (e, id) => {
    e.stopPropagation();
    setSavedJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <div className="slm001-layout">
      {/* ─── Topbar Navbar (100% Selaras dengan ProfilPelamar_001) ─── */}
      <header className="pp001-navbar">
        <div className="pp001-navbar-container">
          <div className="pp001-nav-left">
            <a
              className="pp001-nav-brand"
              href="/?view=semua-lowongan_002"
              onClick={(e) => { e.preventDefault(); navigate?.('semua-lowongan_002'); }}
            >
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" />
              <span className="pp001-nav-divider" />
              <span className="pp001-nav-badge">PORTAL KARIR</span>
            </a>

            <div className="pp001-nav-links">
              <span className="pp001-nav-link" onClick={() => navigate?.('semua-lowongan_002')}>
                Cari Lowongan
              </span>
              <span className="pp001-nav-link" onClick={() => navigate?.('profil-pelamar_001')}>
                Profil Saya
              </span>
              <span className="pp001-nav-link active">
                Lamaran Saya
                <span style={{ marginLeft: 6, fontSize: 10, background: '#E2E8F0', color: '#1E293B', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{applications.length}</span>
              </span>
            </div>
          </div>

          <div className="pp001-nav-right">
            {/* User Profile Pill & Dropdown Menu */}
            <div className="pp001-user-menu-wrapper" ref={userMenuRef}>
              <div
                className={`pp001-nav-user-pill ${showUserDropdown ? 'active' : ''}`}
                onClick={() => setShowUserDropdown(prev => !prev)}
                title="Menu Akun"
              >
                <div className="pp001-nav-avatar">IY</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0908' }}>
                  Ilham
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5E5C56"
                  strokeWidth="2"
                  style={{ transform: showUserDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {showUserDropdown && (
                <div className="pp001-user-dropdown">
                  <div className="pp001-user-dropdown-header">
                    <div className="pp001-user-dropdown-name">Ilham Yuslin</div>
                    <div className="pp001-user-dropdown-email">ilham.yuslin14@gmail.com</div>
                  </div>

                  <button
                    type="button"
                    className="pp001-dropdown-item"
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate?.('profil-pelamar_001');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profil
                  </button>

                  <button
                    type="button"
                    className="pp001-dropdown-item"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setMainTab('riwayat');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Lamaran Saya
                  </button>

                  <div className="pp001-dropdown-divider" />

                  <button
                    type="button"
                    className="pp001-dropdown-item danger"
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate?.('semua-lowongan_002');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>

            <span className="pp001-nav-separator" />

            {/* CTA Untuk Perusahaan: Persis di paling kanan dengan styling lingkaran ikon briefcase */}
            <button
              type="button"
              className="pp001-btn-perusahaan"
              onClick={() => navigate?.('beranda_002')}
              title="Untuk Perusahaan (Masuk ke Dashboard Recruiter)"
            >
              <span className="pp001-btn-perusahaan-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              Untuk Perusahaan
            </button>
          </div>
        </div>
      </header>

      {/* ─── Konten Utama Lamaran Saya (2-Kolom Layout) ─── */}
      <main className="slm001-container">
        {/* ─── Tab Navigasi Utama: Riwayat Lamaran vs Lamaran Tersimpan ─── */}
        <div className="slm001-main-nav">
          <button
            type="button"
            className={`slm001-main-tab-btn ${mainTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setMainTab('riwayat')}
          >
            Riwayat Lamaran
            <span className="slm001-main-tab-badge">{applications.length}</span>
          </button>
          <button
            type="button"
            className={`slm001-main-tab-btn ${mainTab === 'tersimpan' ? 'active' : ''}`}
            onClick={() => setMainTab('tersimpan')}
          >
            Lamaran Tersimpan
            <span className="slm001-main-tab-badge">{savedJobs.length}</span>
          </button>
        </div>

        <div className="slm001-header-wrap">
          <h1 className="slm001-page-title">
            {mainTab === 'riwayat' ? 'Riwayat Lamaran' : 'Lamaran Tersimpan'}
          </h1>
          <p className="slm001-page-desc">
            {mainTab === 'riwayat'
              ? 'Daftar lowongan yang telah Anda lamar dan status seleksi terkini dari perusahaan.'
              : 'Daftar lowongan kerja yang Anda simpan untuk ditinjau atau dilamar nanti.'}
          </p>
        </div>

        <div className="slm001-grid">
          {/* ════════ KOLOM KIRI (70%): Filter & List Lamaran / Tersimpan ════════ */}
          <div className="slm001-main-col">
            {mainTab === 'riwayat' ? (
              <>
                {/* ─── Filter Status Bar Sederhana ─── */}
                <div className="slm001-filter-tabs">
                  <button
                    type="button"
                    className={`slm001-tab-item ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    Semua <span className="slm001-tab-count">{applications.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`slm001-tab-item ${activeFilter === 'wawancara' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('wawancara')}
                  >
                    Wawancara <span className="slm001-tab-count">{countWawancara}</span>
                  </button>
                  <button
                    type="button"
                    className={`slm001-tab-item ${activeFilter === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('review')}
                  >
                    Terseleksi <span className="slm001-tab-count">{countReview}</span>
                  </button>
                  <button
                    type="button"
                    className={`slm001-tab-item ${activeFilter === 'baru' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('baru')}
                  >
                    Terkirim <span className="slm001-tab-count">{countBaru}</span>
                  </button>
                  <button
                    type="button"
                    className={`slm001-tab-item ${activeFilter === 'tolak' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('tolak')}
                  >
                    Tidak Sesuai <span className="slm001-tab-count">{countTolak}</span>
                  </button>
                </div>

            {/* ─── List Lowongan yang Dilamar ─── */}
            {filteredApps.length === 0 ? (
              <div className="slm001-empty-state">
                <h3>Belum ada lamaran pada kategori ini</h3>
                <p>Lamaran kerja yang Anda kirimkan akan otomatis tercatat dan diperbarui di sini.</p>
                <button
                  type="button"
                  className="slm001-empty-btn"
                  onClick={() => setActiveFilter('all')}
                >
                  Lihat Semua Lamaran
                </button>
              </div>
            ) : (
              <div className="slm001-card-list">
                {filteredApps.map(app => (
                  <div
                    key={app.id}
                    className="slm001-job-card"
                    onClick={() => handleOpenJob(app.jobTitle)}
                    title="Klik untuk membuka detail lowongan"
                  >
                    <div className="slm001-card-main">
                      <div className="slm001-card-content">
                        <div className="slm001-job-heading">
                          <h2 className="slm001-job-name">{app.jobTitle}</h2>
                        </div>
                        <div className="slm001-company-label">{app.companyName}</div>

                        <div className="slm001-meta-row">
                          <span>{app.lokasi}</span>
                          <span className="slm001-meta-divider">•</span>
                          <span>{app.modelKerja}</span>
                          <span className="slm001-meta-divider">•</span>
                          <span className="slm001-meta-salary">{app.gaji}</span>
                        </div>
                      </div>

                      {/* Badge Status Standar Luna Pipeline */}
                      <span className={`slm001-status-badge status-${app.statusCategory}`}>
                        {app.statusText}
                      </span>
                    </div>

                    {/* Strip Jadwal Wawancara (Jika sedang tahap wawancara) */}
                    {app.interviewSchedule && (
                      <div className="slm001-interview-strip" onClick={e => e.stopPropagation()}>
                        <span className="slm001-strip-text">
                          Wawancara: <strong>{app.interviewSchedule.date}</strong> ({app.interviewSchedule.time}) via {app.interviewSchedule.channel}
                        </span>
                        <a
                          href={app.interviewSchedule.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="slm001-strip-link"
                        >
                          Buka Rapat
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="slm001-card-footer">
                      <div className="slm001-footer-left">
                        <span>Dilamar pada: {app.appliedDate}</span>
                      </div>

                      <button
                        type="button"
                        className="slm001-btn-open-job"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenJob(app.jobTitle);
                        }}
                      >
                        Lihat Lowongan
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ─── TAB: LAMARAN TERSIMPAN ─── */
          <>
            {savedJobs.length === 0 ? (
              <div className="slm001-empty-state">
                <h3>Belum ada lowongan tersimpan</h3>
                <p>Klik tombol bookmark atau simpan pada lowongan karir yang menarik minat Anda untuk melamarnya di waktu senggang.</p>
                <button
                  type="button"
                  className="slm001-empty-btn"
                  onClick={() => navigate?.('semua-lowongan_002')}
                >
                  Cari Lowongan Sekarang
                </button>
              </div>
            ) : (
              <div className="slm001-card-list">
                {savedJobs.map(job => (
                  <div
                    key={job.id}
                    className="slm001-saved-card"
                    onClick={() => handleOpenJob(job.jobTitle)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="slm001-saved-top">
                      <div>
                        <div className="slm001-job-heading">
                          <h2 className="slm001-job-name">{job.jobTitle}</h2>
                        </div>
                        <div className="slm001-company-label">{job.companyName}</div>

                        <div className="slm001-meta-row" style={{ marginTop: 8 }}>
                          <span>{job.lokasi}</span>
                          <span className="slm001-meta-divider">•</span>
                          <span>{job.modelKerja}</span>
                          <span className="slm001-meta-divider">•</span>
                          <span className="slm001-meta-salary">{job.gaji}</span>
                        </div>
                      </div>

                      <div className="slm001-saved-actions" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className="slm001-btn-unsave"
                          title="Hapus dari tersimpan"
                          onClick={(e) => handleRemoveSavedJob(e, job.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="slm001-btn-apply"
                          onClick={() => handleOpenJob(job.jobTitle)}
                        >
                          Lamar Sekarang
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="slm001-saved-meta">
                      <span>Disimpan pada: {job.savedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

          {/* ════════ KOLOM KANAN (30% SIDEBAR): Agenda & Widget Berguna ════════ */}
          <div className="slm001-side-col">

            {/* Widget 2: Ringkasan Aktivitas Anda */}
            <div className="slm001-side-card">
              <div className="slm001-side-card-header">
                <div className="slm001-side-card-title-wrap">
                  <span className="slm001-side-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-4" />
                    </svg>
                  </span>
                  <h3 className="slm001-side-card-title">Aktivitas Lamaran</h3>
                </div>
              </div>

              <div className="slm001-stats-grid">
                <div className="slm001-stat-item">
                  <div className="slm001-stat-num">{applications.length}</div>
                  <div className="slm001-stat-lbl">Total Dilamar</div>
                </div>
                <div className="slm001-stat-item">
                  <div className="slm001-stat-num">{countReview + countWawancara}</div>
                  <div className="slm001-stat-lbl">Dalam Proses</div>
                </div>
                <div className="slm001-stat-item">
                  <div className="slm001-stat-num">75%</div>
                  <div className="slm001-stat-lbl">Respon HR</div>
                </div>
              </div>
              <p className="slm001-side-note">
                Rata-rata recruiter merespon berkas lamaran Anda dalam <strong>2–3 hari kerja</strong>.
              </p>
            </div>

            {/* Widget 3: Rekomendasi Lowongan Serupa */}
            <div className="slm001-side-card">
              <div className="slm001-side-card-header">
                <div className="slm001-side-card-title-wrap">
                  <span className="slm001-side-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  <h3 className="slm001-side-card-title">Rekomendasi Lainnya</h3>
                </div>
                <button
                  type="button"
                  className="slm001-link-more"
                  onClick={() => navigate?.('semua-lowongan_002')}
                >
                  Lihat Semua
                </button>
              </div>

              <div className="slm001-recom-list">
                <div
                  className="slm001-recom-card"
                  onClick={() => window.open('/?view=laman-karir&jabatan=Head%20of%20Product%20Design', '_blank')}
                >
                  <div className="slm001-recom-title">Head of Product Design</div>
                  <div className="slm001-recom-company">Astra Digital Ventura • Jakarta</div>
                  <div className="slm001-recom-salary">Rp 40 jt – Rp 55 jt / bln</div>
                </div>

                <div
                  className="slm001-recom-card"
                  onClick={() => window.open('/?view=laman-karir&jabatan=UX%20Design%20Lead', '_blank')}
                >
                  <div className="slm001-recom-title">UX Design Lead</div>
                  <div className="slm001-recom-company">Telkomsel Ecosystem • Hybrid</div>
                  <div className="slm001-recom-salary">Rp 30 jt – Rp 42 jt / bln</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
