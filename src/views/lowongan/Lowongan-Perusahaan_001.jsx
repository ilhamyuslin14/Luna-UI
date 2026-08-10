import { useState, useEffect } from 'react';
import { getCompanyBySlug, getActiveSeleksiByCompany } from '../../services/seleksiService.js';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/lowongan-perusahaan_001.css';
import '../../../css/lowongan/lowongan_001.css';

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

// Icons
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

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

const IconWhatsApp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" />
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

const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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

export default function LowonganPerusahaan_001({ slug }) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

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

  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShareAction = (platform) => {
    const pageUrl = window.location.href;
    const shareText = `Profil Perusahaan ${company?.name || ''}`;

    if (platform === 'copy') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pageUrl);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }
      setShowShareMenu(false);
      return;
    }

    let url = '';
    if (platform === 'wa') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + pageUrl)}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setShowShareMenu(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--karir-ink-500)', fontSize: '14px' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-400)" strokeWidth="2.5" style={{ margin: '0 auto 12px auto' }}>
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
          <p style={{ fontSize: '13.5px', color: 'var(--karir-ink-600)', margin: '0 0 20px 0', lineHeight: '1.5' }}>Halaman profil ini tidak tersedia atau tautan yang Anda buka telah kedaluwarsa.</p>
          <button className="lk-btn-submit" style={{ margin: '0 auto', maxWidth: '200px' }} onClick={() => window.location.href = '/'}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(company.video_profil_url);
  const social = company.media_sosial || {};
  const initials = (company.name || '?').trim().charAt(0).toUpperCase();

  const filteredJobs = jobs.filter(j => {
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return (j.jabatan || '').toLowerCase().includes(q) || (j.departments?.name || '').toLowerCase().includes(q) || (j.lokasi || '').toLowerCase().includes(q);
  });

  return (
    <div className="lk-page-wrapper lpr-page-wrap" onClick={() => setShowShareMenu(false)}>
      {/* Header Bar Top */}
      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="lk-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
            <span className="lk-brand-badge">PORTAL KARIR</span>
          </div>

          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={`lpr-btn-share${showShareMenu ? ' active' : ''}`}
              onClick={() => setShowShareMenu(v => !v)}
              title="Bagikan Halaman Perusahaan"
            >
              <IconShare />
              <span>Bagikan</span>
            </button>

            {showShareMenu && (
              <div className="lw001-share-menu" style={{ right: 0, top: 'calc(100% + 8px)', zIndex: 100 }} onClick={e => e.stopPropagation()}>
                <div className="lw001-share-eyebrow">BAGIKAN LAMAN PERUSAHAAN</div>
                <div className="lw001-share-linkcard">
                  <span className="lw001-share-linkcard-url">{window.location.href}</span>
                  <button type="button" className="lw001-share-linkcard-copy" onClick={() => handleShareAction('copy')}>
                    <IconLink />
                    {copiedToast ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <div className="lw001-share-divider" />
                <div className="lw001-share-grid">
                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                    <button key={key} type="button" className="lw001-share-gridbtn" onClick={() => handleShareAction(key)}>
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

      {/* Modern Hero Showcase */}
      <div className="lpr-hero-card">
        <div className="lpr-hero-body">
          <div className="lpr-hero-top-row">
            <div className="lpr-hero-logo-wrap">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="lpr-hero-logo-img" />
              ) : (
                <div className="lpr-hero-logo-initials">{initials}</div>
              )}
            </div>

            <div className="lpr-hero-title-wrap">
              <div className="lpr-hero-name-row">
                <h1 className="lpr-hero-name">{company.name}</h1>
                {company.jenis_badan_usaha && (
                  <span className="lpr-legal-badge">{company.jenis_badan_usaha}</span>
                )}
                {company.tahun_didirikan && (
                  <span className="lpr-legal-badge">Berdiri {company.tahun_didirikan}</span>
                )}
              </div>

              {/* Key Meta Badges Bar */}
              <div className="lpr-hero-meta-bar">
                {company.industri && (
                  <div className="lpr-meta-item">
                    <IconBuilding />
                    <span>{company.industri}</span>
                  </div>
                )}
                {company.ukuran && (
                  <div className="lpr-meta-item">
                    <IconUsers />
                    <span>{company.ukuran}</span>
                  </div>
                )}
                {company.lokasi && (
                  <div className="lpr-meta-item">
                    <IconMapPin />
                    <span>{company.lokasi}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links & Contact Badges */}
          {(company.website || social.instagram || social.linkedin || social.tiktok || company.email_kontak || company.telepon_kontak) && (
            <div className="lpr-hero-links-strip">
              {company.website && (
                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="lpr-link-pill">
                  <IconGlobe /> Website
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="lpr-link-pill">
                  <IconInstagram /> Instagram
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin.startsWith('http') ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noopener noreferrer" className="lpr-link-pill">
                  <IconLinkedIn /> LinkedIn
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/${social.tiktok.replace('@', '@')}`} target="_blank" rel="noopener noreferrer" className="lpr-link-pill">
                  <IconTikTok /> TikTok
                </a>
              )}
              {company.email_kontak && (
                <a href={`mailto:${company.email_kontak}`} className="lpr-link-pill">
                  <IconMail /> {company.email_kontak}
                </a>
              )}
              {company.telepon_kontak && (
                <a href={`tel:${company.telepon_kontak}`} className="lpr-link-pill">
                  <IconPhone /> {company.telepon_kontak}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Split Body */}
      <div className="lk-main-container" style={{ marginTop: '24px' }}>
        {/* Left Main Column (68%) */}
        <div className="lk-left-col">
          {/* Card 1: Tentang Perusahaan */}
          <div className="lk-section-card lpr-section-box">
            <h2 className="lk-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Tentang Perusahaan
            </h2>
            {company.deskripsi ? (
              <div className="lk-rich-content lpr-desc-content" dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(company.deskripsi) }} />
            ) : (
              <p className="lk-rich-content" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                Perusahaan ini belum menambahkan deskripsi profil lengkap.
              </p>
            )}
          </div>

          {/* Card 2: Video Profil (If Embed Available) */}
          {embedUrl && (
            <div className="lk-section-card lpr-section-box">
              <h2 className="lk-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Video Pengenalan Perusahaan
              </h2>
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

          {/* Card 3: Lokasi & Alamat Lengkap */}
          {(company.lokasi || company.alamat) && (
            <div className="lk-section-card lpr-section-box">
              <h2 className="lk-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Lokasi & Kantor Pusat
              </h2>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 141, 33, 0.12)', color: 'var(--luna-orange-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconMapPin />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                    {company.lokasi || 'Kantor Utama'}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {company.alamat || 'Alamat lengkap belum ditambahkan.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column (32%) */}
        <div className="lk-right-col">
          {/* Card: Lowongan Pekerjaan Aktif */}
          <div className="lpr-job-panel">
            <div className="lpr-panel-header">
              <h2 className="lk-section-title" style={{ margin: 0 }}>
                Lowongan Aktif
              </h2>
              <span className="lpr-job-count-badge">{jobs.length}</span>
            </div>

            {jobs.length > 0 && (
              <div className="lpr-search-box">
                <input
                  type="text"
                  className="lpr-search-input"
                  placeholder="Cari nama posisi lowongan..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                />
              </div>
            )}

            {filteredJobs.length === 0 ? (
              <p className="lpr-empty">
                {jobSearch ? 'Tidak ada lowongan yang sesuai dengan pencarian Anda.' : 'Belum ada lowongan pekerjaan aktif dari perusahaan ini saat ini.'}
              </p>
            ) : (
              <div className="lpr-job-list">
                {filteredJobs.map(job => (
                  <a key={job.id} className="lpr-job-card" href={`/?view=laman-karir&kode=${encodeURIComponent(job.kode)}`}>
                    <div className="lpr-job-card-main">
                      <span className="lpr-job-title">{job.jabatan}</span>
                      <div className="lpr-job-tags">
                        {job.departments?.name && <span className="lpr-tag-dept">{job.departments.name}</span>}
                        {job.ikatan_kerja && <span className="lpr-tag-type">{job.ikatan_kerja}</span>}
                        {job.lokasi && <span className="lpr-tag-loc">{job.lokasi}</span>}
                      </div>
                    </div>
                    <div className="lpr-job-apply-cta">
                      <IconArrowRight />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Card: Ringkasan Informasi Perusahaan */}
          <div className="lpr-info-card" style={{ marginTop: '20px' }}>
            <h3 className="lpr-info-card-title">Ringkasan Perusahaan</h3>
            <div className="lpr-info-list">
              {company.industri && (
                <div className="lpr-info-row">
                  <span className="lpr-info-label">Industri</span>
                  <span className="lpr-info-val">{company.industri}</span>
                </div>
              )}
              {company.ukuran && (
                <div className="lpr-info-row">
                  <span className="lpr-info-label">Ukuran Perusahaan</span>
                  <span className="lpr-info-val">{company.ukuran}</span>
                </div>
              )}
              {company.tahun_didirikan && (
                <div className="lpr-info-row">
                  <span className="lpr-info-label">Tahun Didirikan</span>
                  <span className="lpr-info-val">{company.tahun_didirikan}</span>
                </div>
              )}
              {company.jenis_badan_usaha && (
                <div className="lpr-info-row">
                  <span className="lpr-info-label">Badan Usaha</span>
                  <span className="lpr-info-val">{company.jenis_badan_usaha}</span>
                </div>
              )}
              {company.lokasi && (
                <div className="lpr-info-row">
                  <span className="lpr-info-label">Lokasi Utama</span>
                  <span className="lpr-info-val">{company.lokasi}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

