import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLamanPerusahaanData, { formatDeskripsiToHtml, getYoutubeEmbedUrl } from '../../../hooks/lowongan/useLamanPerusahaanData.js';
import MobileToast from '../../components/MobileToast.jsx';
import '../../../../css/mobile/lowongan/laman-karir.css';

const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);
const IconSpin = () => (<svg className="lk-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconTikTok = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4v9.5a3.5 3.5 0 1 1-3-3.46" /><path d="M16 4a4.5 4.5 0 0 0 4.5 4.5" /></svg>);
const IconMail = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>);
const IconPhone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconFacebook = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const IconX = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconTelegram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);

const SHARE_PLATFORMS = [
  { key: 'wa', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

function ShareSheet({ open, onClose, onShare, pageUrl }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="lk-sheet-title" style={{ marginBottom: 14 }}>Bagikan Laman</div>
        <div className="lk-search" style={{ marginLeft: 0, marginRight: 0, marginBottom: 14 }}>
          <span style={{ flex: 1, fontSize: 11, color: 'var(--luna-ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageUrl}</span>
          <button className="lk-job-card-btn" onClick={() => onShare('copy')}>Salin</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => onShare(key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'var(--luna-ink-050)', border: 'none', borderRadius: 12, padding: '12px 6px', fontFamily: 'inherit' }}>
              <span style={{ color: 'var(--luna-ink-700)' }}><Icon /></span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--luna-ink-600)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}

// Padanan mobile dari Lowongan-Perusahaan_001.jsx (desktop) — laman profil
// perusahaan publik (tanpa login), dibuka lewat `?view=laman-perusahaan&slug=`.
// Pakai hook `useLamanPerusahaanData` yang sama persis dengan desktop.
export default function LamanPerusahaanMobile({ slug }) {
  const { pageState, company, filteredJobs, jobs, jobSearch, setJobSearch, handleShareAction } = useLamanPerusahaanData(slug);

  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const onShareDone = (result) => {
    setShareOpen(false);
    if (result === 'copied') setToast({ message: 'Link disalin', subMessage: 'Link profil perusahaan berhasil disalin ke clipboard.', type: 'success' });
    else if (result === 'instagram') setToast({ message: 'Link disalin', subMessage: 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.', type: 'success' });
  };

  if (pageState === 'loading') {
    return (
      <div className="lk-page lk-loading">
        <IconSpin />
        <p>Memuat profil perusahaan...</p>
      </div>
    );
  }

  if (pageState === 'not-found' || !company) {
    return (
      <div className="lk-page lk-notfound">
        <div className="lk-notfound-icon"><IconAlert /></div>
        <h2>Perusahaan Tidak Ditemukan</h2>
        <p>Halaman profil ini tidak tersedia atau tautan yang Anda buka telah kedaluwarsa.</p>
        <button className="lk-apply-btn" onClick={() => { window.location.href = '/'; }}>Kembali ke Beranda</button>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(company.video_profil_url);
  const social = company.media_sosial || {};
  const initials = (company.name || '?').trim().charAt(0).toUpperCase();
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hasLinks = company.website || social.instagram || social.linkedin || social.tiktok || company.email_kontak || company.telepon_kontak;

  return (
    <div className="lk-page">
      <div className="lk-head">
        <div className="lk-logo">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <span className="lk-logo-word">Luna</span>
          <span className="lk-badge-portal">PORTAL KARIR</span>
        </div>
        <button className="lk-share-btn" onClick={() => setShareOpen(true)} title="Bagikan"><IconShare /></button>
      </div>

      <div className="lk-cohero">
        {company.logo_url
          ? <div className="lk-cohero-logo"><img src={company.logo_url} alt={company.name} /></div>
          : <div className="lk-cohero-logo">{initials}</div>}
        <div className="lk-cohero-name">{company.name}</div>
        <div className="lk-cohero-badges">
          {company.jenis_badan_usaha && <span className="lk-cohero-badge">{company.jenis_badan_usaha}</span>}
          {company.tahun_didirikan && <span className="lk-cohero-badge">Berdiri {company.tahun_didirikan}</span>}
        </div>
        <div className="lk-cohero-meta">
          {company.industri && <span>{company.industri}</span>}
          {company.industri && (company.ukuran || company.lokasi) && <span className="lk-cohero-meta-dot" />}
          {company.ukuran && <span>{company.ukuran}</span>}
          {company.ukuran && company.lokasi && <span className="lk-cohero-meta-dot" />}
          {company.lokasi && <span>{company.lokasi}</span>}
        </div>
        {hasLinks && (
          <div className="lk-social-row">
            {company.website && (
              <a className="lk-social-pill" href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer"><IconGlobe />Website</a>
            )}
            {social.instagram && (
              <a className="lk-social-pill" href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"><IconInstagram />Instagram</a>
            )}
            {social.linkedin && (
              <a className="lk-social-pill" href={social.linkedin.startsWith('http') ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noopener noreferrer"><IconLinkedIn />LinkedIn</a>
            )}
            {social.tiktok && (
              <a className="lk-social-pill" href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/${social.tiktok.replace('@', '@')}`} target="_blank" rel="noopener noreferrer"><IconTikTok />TikTok</a>
            )}
            {company.email_kontak && <a className="lk-social-pill" href={`mailto:${company.email_kontak}`}><IconMail />Email</a>}
            {company.telepon_kontak && <a className="lk-social-pill" href={`tel:${company.telepon_kontak}`}><IconPhone />Telepon</a>}
          </div>
        )}
      </div>

      <div className="lk-body">
        <div className="lk-card">
          <div className="lk-card-title">Tentang Perusahaan</div>
          {company.deskripsi ? (
            <>
              <div className={`lk-desc-text${!descExpanded ? ' clamped' : ''}`} dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(company.deskripsi) }} />
              <button className="lk-more-link" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}</button>
            </>
          ) : (
            <p className="lk-desc-text" style={{ fontStyle: 'italic', color: 'var(--luna-ink-300)' }}>Perusahaan ini belum menambahkan deskripsi profil lengkap.</p>
          )}
        </div>

        {embedUrl && (
          <div className="lk-card">
            <div className="lk-card-title">Video Pengenalan Perusahaan</div>
            <div className="lk-video-box">
              <iframe src={embedUrl} title={`Video profil ${company.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}

        {(company.lokasi || company.alamat) && (
          <div className="lk-card">
            <div className="lk-card-title">Lokasi &amp; Kantor Pusat</div>
            <div className="lk-location-row">
              <div className="lk-location-icon"><IconPin /></div>
              <div>
                <div className="lk-location-title">{company.lokasi || 'Kantor Utama'}</div>
                <div className="lk-location-sub">{company.alamat || 'Alamat lengkap belum ditambahkan.'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="lk-card">
          <div className="lk-card-title">Ringkasan Perusahaan</div>
          <div className="lk-summary-grid">
            {company.industri && <div><div className="lk-summary-label">Industri</div><div className="lk-summary-val">{company.industri}</div></div>}
            {company.ukuran && <div><div className="lk-summary-label">Ukuran</div><div className="lk-summary-val">{company.ukuran}</div></div>}
            {company.tahun_didirikan && <div><div className="lk-summary-label">Berdiri</div><div className="lk-summary-val">{company.tahun_didirikan}</div></div>}
            {company.jenis_badan_usaha && <div><div className="lk-summary-label">Badan Usaha</div><div className="lk-summary-val">{company.jenis_badan_usaha}</div></div>}
          </div>
        </div>
      </div>

      <div className="lk-section-head" style={{ marginTop: 4 }}>
        <div className="lk-section-title">Lowongan Aktif · {jobs.length}</div>
      </div>
      {jobs.length > 0 && (
        <div className="lk-search">
          <IconSearch />
          <input placeholder="Cari nama posisi lowongan…" value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
        </div>
      )}
      {filteredJobs.length === 0 ? (
        <div className="lk-portal-empty">{jobSearch ? 'Tidak ada lowongan yang sesuai dengan pencarian Anda.' : 'Belum ada lowongan pekerjaan aktif dari perusahaan ini saat ini.'}</div>
      ) : (
        <div className="lk-job-list">
          {filteredJobs.map(job => (
            <a className="lk-job-card" key={job.id} href={`/?view=laman-karir&kode=${encodeURIComponent(job.kode)}`}>
              <div className="lk-job-card-body">
                <div className="lk-job-card-title">{job.jabatan}</div>
                <div className="lk-job-card-meta">{job.departments?.name || 'Karir'} • {(job.view_count || 0).toLocaleString('id-ID')} Dilihat</div>
              </div>
              <span className="lk-job-card-btn" style={{ display: 'flex', alignItems: 'center' }}><IconChevronRight /></span>
            </a>
          ))}
        </div>
      )}

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} onShare={(p) => handleShareAction(p, onShareDone)} pageUrl={pageUrl} />
      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
