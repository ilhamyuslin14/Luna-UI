import { useState, useEffect } from 'react';
import { getCompanyBySlug, getActiveSeleksiByCompany } from '../../services/seleksiService.js';
import '../../../css/lowongan-laman-karir_001.css';
import '../../../css/lowongan-perusahaan_001.css';

function formatDeskripsiToHtml(text) {
  if (!text) return '';
  if (text.includes('<p>') || text.includes('<ul>') || text.includes('<ol>') || text.includes('<br')) return text;

  const lines = text.split('\n');
  let inList = false;
  let listType = null;
  let html = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      return;
    }

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
    const isNumbered = /^\d+[\.\)]\s*/.test(trimmed);

    if (isBullet) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ul';
        html += '<ul>';
      }
      html += `<li>${trimmed.replace(/^[•\-\*]\s*/, '')}</li>`;
    } else if (isNumbered) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ol';
        html += '<ol>';
      }
      html += `<li>${trimmed.replace(/^\d+[\.\)]\s*/, '')}</li>`;
    } else {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      html += `<p>${trimmed}</p>`;
    }
  });

  if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
  return html;
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    let id = null;
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
    else id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" /><circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 16.5v-3.7a2.3 2.3 0 0 1 4.5 0v3.7" /><line x1="11" y1="10.5" x2="11" y2="16.5" />
  </svg>
);

const IconTikTok = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4v9.5a3.5 3.5 0 1 1-3-3.46" /><path d="M16 4a4.5 4.5 0 0 0 4.5 4.5" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function LowonganPerusahaan_001({ slug }) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setPageState('not-found');
      return;
    }
    getCompanyBySlug(slug)
      .then(data => {
        if (!active) return null;
        if (!data) {
          setPageState('not-found');
          return null;
        }
        setCompany(data);
        return getActiveSeleksiByCompany(data.id);
      })
      .then(jobList => {
        if (!active || !jobList) return;
        setJobs(jobList);
        setPageState('ready');
      })
      .catch(() => {
        if (active) setPageState('not-found');
      });
    return () => { active = false; };
  }, [slug]);

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

  if (pageState === 'loading') {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--karir-ink-500)', fontSize: '14px' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--karir-primary)" strokeWidth="2.5" style={{ margin: '0 auto 12px auto' }}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <p>Memuat profil perusahaan...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'not-found' || !company) {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="lk-section-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--karir-ink-900)', margin: '0 0 8px 0' }}>Perusahaan Tidak Ditemukan</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--karir-ink-600)', margin: '0 0 20px 0', lineHeight: '1.5' }}>Halaman ini mungkin sudah tidak aktif atau tautan yang Anda buka tidak valid.</p>
          <button className="lk-btn-submit" style={{ margin: '0 auto', maxWidth: '200px' }} onClick={() => window.location.href = '/'}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(company.video_profil_url);
  const social = company.media_sosial || {};
  const metaLine = [company.industri, company.ukuran, company.lokasi].filter(Boolean).join(' · ');
  const initials = (company.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="lk-page-wrapper">
      <header className="lk-header">
        <div className="lk-header-container">
          <div className="lk-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
            <span className="lk-brand-badge">PORTAL KARIR</span>
          </div>
        </div>
      </header>

      <div className="lk-breadcrumb-bar">
        <a href="/">Portal Karir</a>
        <span>/</span>
        <span className="active">{company.name}</span>
      </div>

      <div className="lpr-hero">
        {company.banner_url && <div className="lpr-hero-banner" style={{ backgroundImage: `url(${company.banner_url})` }} />}
        <div className="lpr-hero-overlay" />
        <div className="lpr-hero-content">
          <div className="lpr-hero-logo">
            {company.logo_url ? <img src={company.logo_url} alt={company.name} /> : <span>{initials}</span>}
          </div>
          <h1 className="lpr-hero-name">{company.name}</h1>
          {company.tagline && <p className="lpr-hero-tagline">{company.tagline}</p>}
          {metaLine && <p className="lpr-hero-meta">{metaLine}</p>}

          {(company.website || social.instagram || social.linkedin || social.tiktok) && (
            <div className="lpr-hero-links">
              {company.website && (
                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                  <IconGlobe /> Website
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <IconInstagram /> Instagram
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin.startsWith('http') ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noopener noreferrer">
                  <IconLinkedIn /> LinkedIn
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/${social.tiktok.replace('@', '@')}`} target="_blank" rel="noopener noreferrer">
                  <IconTikTok /> TikTok
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="lk-main-container">
        <div className="lk-left-col">
          <div className="lk-section-card">
            <h2 className="lk-section-title">Tentang Perusahaan</h2>
            {company.deskripsi ? (
              <div className="lk-rich-content" dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(company.deskripsi) }} />
            ) : (
              <p className="lk-rich-content">Perusahaan ini belum menambahkan deskripsi.</p>
            )}
          </div>

          {embedUrl && (
            <div className="lk-section-card">
              <h2 className="lk-section-title">Video Profil</h2>
              <div className="lpr-video-wrap">
                <iframe
                  src={embedUrl}
                  title={`Video profil ${company.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div className="lk-right-col">
          <div className="lpr-job-panel">
            <h2 className="lk-section-title">Lowongan Aktif ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <p className="lpr-empty">Belum ada lowongan aktif dari perusahaan ini saat ini.</p>
            ) : (
              <div className="lpr-job-list">
                {jobs.map(job => (
                  <a key={job.id} className="lpr-job-card" href={`/?view=laman-karir&kode=${encodeURIComponent(job.kode)}`}>
                    <div className="lpr-job-card-main">
                      <span className="lpr-job-title">{job.jabatan}</span>
                      <span className="lpr-job-meta">
                        {[job.departments?.name, job.lokasi, job.ikatan_kerja].filter(Boolean).join(' · ') || '-'}
                      </span>
                    </div>
                    <IconArrowRight />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
