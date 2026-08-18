import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLamanKarirData, {
  formatDeskripsiToHtml, formatTanggal, formatPengalaman, formatUpah, getApplyErrorInfo, getAdminActivityState,
} from '../../../hooks/lowongan/useLamanKarirData.js';
import MobileToast from '../../components/MobileToast.jsx';
import '../../../../css/mobile/lowongan/laman-karir.css';

const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconLink = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>);
const IconMoney = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>);
const IconDoc = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconChevronLeft = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>);
const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconInfo = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const IconClose = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconSend = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const IconSpin = () => (<svg className="lk-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);
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

function CompanyLogo({ url, name, className }) {
  return url
    ? <div className={className}><img src={url} alt={name || ''} /></div>
    : <div className={className}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

function Header({ onShare, shareDisabled }) {
  return (
    <div className="lk-head">
      <div className="lk-logo">
        <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
        <span className="lk-logo-word">Luna</span>
        <span className="lk-badge-portal">PORTAL KARIR</span>
      </div>
      <button className="lk-share-btn" onClick={onShare} disabled={shareDisabled} title="Bagikan"><IconShare /></button>
    </div>
  );
}

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

// Padanan mobile dari Lowongan-LamanKarir_001.jsx (desktop) — laman publik
// (tanpa login) yang dibuka lewat link `?view=laman-karir&kode=...`. Pakai
// hook `useLamanKarirData` yang sama persis dengan desktop (fetch, validasi
// form, alur submit upload→ekstrak AI→scoring) — cuma markup & CSS beda
// total (2-kolom sticky sidebar di desktop vs sheet+sticky-bar di sini).
export default function LamanKarirMobile({ kode }) {
  const {
    pageState, seleksiData, viewCount,
    form, handleChange, handlePhoneChange, linkedinError,
    cvFile, setCvFile, fileError, dragOver, setDragOver, handleDrop, handleFileInput,
    submitState, submitErrorMsg, progressText, uploadPercent, handleSubmit, resetApply,
    portalJobs, portalSearch, setPortalSearch, portalCategory, setPortalCategory,
    handleShareAction,
  } = useLamanKarirData(kode);

  const [applyOpen, setApplyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [kualExpanded, setKualExpanded] = useState(false);

  const onShareDone = (result) => {
    setShareOpen(false);
    if (result === 'copied') setToast({ message: 'Link disalin', subMessage: 'Link lowongan berhasil disalin ke clipboard.', type: 'success' });
    else if (result === 'instagram') setToast({ message: 'Link disalin', subMessage: 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.', type: 'success' });
  };

  if (pageState === 'loading') {
    return (
      <div className="lk-page lk-loading">
        <IconSpin />
        <p>Memuat informasi lowongan pekerjaan...</p>
      </div>
    );
  }

  if (pageState === 'not-found' || !seleksiData) {
    return (
      <div className="lk-page lk-notfound">
        <div className="lk-notfound-icon"><IconAlert /></div>
        <h2>Lowongan Tidak Ditemukan</h2>
        <p>Lowongan pekerjaan ini mungkin sudah ditutup atau tautan yang Anda buka tidak valid.</p>
        <button className="lk-apply-btn" onClick={() => { window.location.href = '/'; }}>Kembali ke Beranda</button>
      </div>
    );
  }

  const upahStr = formatUpah(seleksiData);
  const companyName = seleksiData.companies?.name || seleksiData.companies?.nama || seleksiData.company_name || null;
  const companySlug = seleksiData.companies?.slug || null;
  const companyLogoUrl = seleksiData.companies?.logo_url || null;
  const companyPageUrl = companySlug ? `/?view=laman-perusahaan&slug=${encodeURIComponent(companySlug)}` : null;
  const departemenName = seleksiData.departments?.name || null;
  const adminActivity = getAdminActivityState(seleksiData);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // ── layar berhasil melamar + portal rekomendasi/semua lowongan ──
  if (submitState === 'success') {
    const recommendedJobs = portalJobs.filter(job => {
      if (job.id === seleksiData.id) return false;
      const dept = (job.departments?.name || '').toLowerCase();
      const pos = (job.jabatan || '').toLowerCase();
      const currDept = (departemenName || '').toLowerCase();
      const currPos = (seleksiData.jabatan || '').toLowerCase();
      return (dept && currDept && (dept.includes(currDept) || currDept.includes(dept))) ||
             (pos && currPos && (pos.includes(currPos) || currPos.includes(pos)));
    });
    const categories = ['Semua', ...new Set(portalJobs.map(j => j.departments?.name).filter(Boolean))];
    const filteredPortalJobs = portalJobs.filter(job => {
      const matchSearch = !portalSearch.trim() ||
        (job.jabatan || '').toLowerCase().includes(portalSearch.toLowerCase()) ||
        (job.companies?.name || '').toLowerCase().includes(portalSearch.toLowerCase());
      const matchCat = portalCategory === 'Semua' || (job.departments?.name === portalCategory);
      return matchSearch && matchCat;
    });
    const goToJob = (job) => {
      const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
      window.open(url, '_blank');
    };

    return (
      <div className="lk-page">
        <div className="lk-head">
          <div className="lk-logo">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
            <span className="lk-logo-word">Luna</span>
            <span className="lk-badge-portal">PORTAL KARIR</span>
          </div>
          <button className="lk-share-btn" onClick={resetApply} title="Kembali ke lowongan"><IconChevronLeft /></button>
        </div>

        <div className="lk-success-band">
          <div className="lk-success-icon"><IconCheck /></div>
          <div className="lk-success-title">Lamaran Berhasil Dikirim!</div>
          <div className="lk-success-sub">Terima kasih telah melamar ke <b>{companyName || 'Perusahaan'}</b>. Berkas CV Anda (<b>{cvFile?.name || 'CV.pdf'}</b>) sedang diproses oleh tim rekrutmen.</div>
        </div>
        <div className="lk-applied-card">
          <CompanyLogo url={companyLogoUrl} name={companyName} className="lk-applied-logo" />
          <div>
            <div className="lk-applied-title">{seleksiData.jabatan}</div>
            <div className="lk-applied-sub">{companyName || 'Perusahaan'} • {seleksiData.lokasi || 'Indonesia'}</div>
          </div>
        </div>

        {recommendedJobs.length > 0 && (
          <>
            <div className="lk-section-head"><div className="lk-section-title">✨ Rekomendasi Lowongan Sejenis</div></div>
            <div className="lk-reco-scroll">
              {recommendedJobs.map(job => (
                <div className="lk-reco-card" key={job.id}>
                  <span className="lk-reco-tag">🔥 Recommended</span>
                  <CompanyLogo url={job.companies?.logo_url} name={job.companies?.name} className="lk-reco-logo" />
                  <div className="lk-reco-title">{job.jabatan}</div>
                  <div className="lk-reco-co">{job.companies?.name || 'Perusahaan'}</div>
                  <button className="lk-reco-btn" onClick={() => goToJob(job)}>Melamar Sekarang</button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="lk-section-head"><div className="lk-section-title">🔍 Semua Lowongan Aktif</div></div>
        <div className="lk-search">
          <IconSearch />
          <input placeholder="Cari lowongan atau perusahaan…" value={portalSearch} onChange={e => setPortalSearch(e.target.value)} />
        </div>
        {categories.length > 1 && (
          <div className="lk-chiprow">
            {categories.map(cat => (
              <button key={cat} className={`lk-chip${portalCategory === cat ? ' active' : ''}`} onClick={() => setPortalCategory(cat)}>{cat}</button>
            ))}
          </div>
        )}
        {filteredPortalJobs.length === 0 ? (
          <div className="lk-portal-empty">Tidak ada lowongan yang cocok dengan pencarian Anda.</div>
        ) : (
          <div className="lk-job-list">
            {filteredPortalJobs.map(job => (
              <button className="lk-job-card" key={job.id} onClick={() => goToJob(job)}>
                <CompanyLogo url={job.companies?.logo_url} name={job.companies?.name} className="lk-job-card-logo" />
                <div className="lk-job-card-body">
                  <div className="lk-job-card-title">{job.jabatan}</div>
                  <div className="lk-job-card-meta">{job.companies?.name || 'Perusahaan'} • {job.lokasi || 'Indonesia'}</div>
                </div>
                <span className="lk-job-card-btn">Lamar</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── layar detail lowongan + form lamar ──
  return (
    <div className="lk-page">
      <Header onShare={() => setShareOpen(true)} />
      <div className="lk-crumb">
        {companyPageUrl ? <a href={companyPageUrl}>{companyName}</a> : <span>{companyName || 'Lowongan Pekerjaan'}</span>}
        {' / '}<b>{seleksiData.jabatan}</b>
      </div>

      <div className="lk-hero-wrap">
        <div className="lk-hero">
          <div className="lk-hero-top">
            <CompanyLogo url={companyLogoUrl} name={companyName} className="lk-co-logo" />
            <div>
              <div className="lk-co-name">{companyName}</div>
              <div className="lk-hero-badges">
                <span className="lk-pill-mini active"><span className="dot" />Lowongan Aktif</span>
                <span className="lk-pill-mini views"><IconEye />{viewCount.toLocaleString('id-ID')} Dilihat</span>
              </div>
            </div>
          </div>
          <div className="lk-job-title">{seleksiData.jabatan}</div>
          <div className="lk-hero-pills">
            {seleksiData.lokasi && <span className="lk-hero-pill"><IconPin />{seleksiData.lokasi}</span>}
            {seleksiData.remote && <span className="lk-hero-pill">{seleksiData.remote}</span>}
            {seleksiData.ikatan_kerja && seleksiData.ikatan_kerja !== seleksiData.remote && (
              <span className="lk-hero-pill"><IconBriefcase />{seleksiData.ikatan_kerja}</span>
            )}
          </div>
          {upahStr && <div className="lk-hero-salary"><span>Estimasi Gaji</span>Rp {upahStr}</div>}
          <div className="lk-hero-badges" style={{ marginTop: 8 }}>
            <span className={`lk-pill-mini${adminActivity.isOnline ? ' active' : ''}`} style={!adminActivity.isOnline ? { background: 'rgba(255,255,255,0.16)', color: '#fff' } : undefined}>
              {adminActivity.isOnline && <span className="dot" />}{adminActivity.text}
            </span>
          </div>
        </div>
      </div>

      <div className="lk-body">
        <div className="lk-card">
          <div className="lk-card-title">Detail Pekerjaan</div>
          <div className="lk-detail-row"><span>Departemen</span><span>{departemenName || '-'}</span></div>
          <div className="lk-detail-row"><span>Level Jabatan</span><span>{seleksiData.level_jabatan || '-'}</span></div>
          <div className="lk-detail-row"><span>Lokasi</span><span>{seleksiData.lokasi || '-'}</span></div>
          <div className="lk-detail-row"><span>Ikatan Kerja</span><span>{seleksiData.ikatan_kerja || '-'}</span></div>
          {upahStr && <div className="lk-detail-row"><span>Upah / Gaji</span><span style={{ color: 'var(--luna-orange-600)' }}>Rp {upahStr}</span></div>}
          <div className="lk-detail-row"><span>Min. Pendidikan</span><span>{seleksiData.pendidikan || '-'}</span></div>
          <div className="lk-detail-row"><span>Min. Pengalaman</span><span>{formatPengalaman(seleksiData.pengalaman) || '-'}</span></div>
          <div className="lk-detail-row"><span>Jumlah Posisi</span><span>{seleksiData.jumlah_rekrut ? `${seleksiData.jumlah_rekrut} Orang` : '-'}</span></div>
          <div className="lk-detail-row"><span>Tanggal Buka</span><span>{formatTanggal(seleksiData.tgl_onboard || seleksiData.target_onboarding || seleksiData.target_date || seleksiData.created_at)}</span></div>
        </div>

        <div className="lk-card">
          <div className="lk-card-title">Deskripsi &amp; Tanggung Jawab</div>
          <div
            className={`lk-desc-text${!descExpanded ? ' clamped' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.deskripsi) || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }}
          />
          <button className="lk-more-link" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}</button>
        </div>

        {seleksiData.kualifikasi && (
          <div className="lk-card">
            <div className="lk-card-title">Persyaratan &amp; Kualifikasi</div>
            <div
              className={`lk-desc-text${!kualExpanded ? ' clamped' : ''}`}
              dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.kualifikasi) }}
            />
            <button className="lk-more-link" onClick={() => setKualExpanded(v => !v)}>{kualExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}</button>
          </div>
        )}

        <div className="lk-card">
          <div className="lk-co-mini">
            <CompanyLogo url={companyLogoUrl} name={companyName} className="lk-co-mini-logo" />
            <div className="lk-co-mini-body">
              <div className="lk-co-mini-name">{companyName}</div>
              <div className="lk-co-mini-sub">{seleksiData.lokasi || 'Indonesia'}</div>
            </div>
            {companyPageUrl && <a className="lk-co-mini-link" href={companyPageUrl}>Profil<IconChevronRight /></a>}
          </div>
        </div>
      </div>

      <div className="lk-stickybar">
        <div className="lk-stickybar-info">
          <div className="lk-stickybar-label">{upahStr ? 'Gaji per bulan' : 'Posisi'}</div>
          <div className="lk-stickybar-val">{upahStr ? `Rp ${upahStr}` : seleksiData.jabatan}</div>
        </div>
        <button className="lk-apply-btn" onClick={() => setApplyOpen(true)}>Lamar Posisi Ini</button>
      </div>

      {/* ── sheet: form lamar ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${applyOpen ? ' open' : ''}`} onClick={() => submitState !== 'uploading' && setApplyOpen(false)} />
          <div className={`msh-sheet${applyOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {submitState === 'uploading' ? (
              <div className="lk-progress-wrap">
                <div className="lk-progress-ring">
                  <svg viewBox="0 0 64 64">
                    <circle className="lk-progress-ring-track" cx="32" cy="32" r="27" fill="none" strokeWidth="6" />
                    <circle className="lk-progress-ring-fill" cx="32" cy="32" r="27" fill="none" strokeWidth="6"
                      strokeDasharray="169.6" strokeDashoffset={169.6 * (1 - uploadPercent / 100)} />
                  </svg>
                  <div className="lk-progress-pct">{uploadPercent}%</div>
                </div>
                <div className="lk-progress-title">{progressText || 'Memproses berkas CV Anda...'}</div>
                <div className="lk-progress-sub">Mohon tunggu, jangan tutup laman ini sampai proses selesai.</div>
                <div className="lk-progress-steps">
                  <div className={`lk-progress-step${uploadPercent >= 30 ? ' done' : ' active'}`}><span className="ic">{uploadPercent >= 30 ? <IconCheck /> : null}</span>Mengunggah berkas CV</div>
                  <div className={`lk-progress-step${uploadPercent >= 75 ? ' done' : uploadPercent >= 30 ? ' active' : ''}`}><span className="ic">{uploadPercent >= 75 ? <IconCheck /> : null}</span>Mengekstrak data dengan AI</div>
                  <div className={`lk-progress-step${uploadPercent >= 100 ? ' done' : uploadPercent >= 75 ? ' active' : ''}`}><span className="ic">{uploadPercent >= 100 ? <IconCheck /> : null}</span>Menilai kualifikasi posisi</div>
                </div>
              </div>
            ) : (
              <>
                <div className="lk-sheet-head">
                  <div className="lk-sheet-title">Lamar Posisi Ini</div>
                  <div className="lk-sheet-sub">Isi data diri dan unggah CV Anda</div>
                </div>
                <form className="lk-sheet-form-body" onSubmit={handleSubmit}>
                  <div className="lk-field">
                    <label>Nama Lengkap <span className="req">*</span></label>
                    <input className="lk-input" name="nama" placeholder="Masukkan nama lengkap Anda" value={form.nama} onChange={handleChange} />
                  </div>
                  <div className="lk-field">
                    <label>Email <span className="req">*</span></label>
                    <input className="lk-input" type="email" name="email" placeholder="contoh@email.com" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="lk-field">
                    <label>Nomor HP <span className="req">*</span></label>
                    <input className="lk-input" inputMode="numeric" name="phone" placeholder="+62 812 3456 7890" value={form.phone} onChange={handlePhoneChange} />
                  </div>
                  <div className="lk-field">
                    <label>LinkedIn <span className="opt">(opsional)</span></label>
                    <input className={`lk-input${linkedinError ? ' error' : ''}`} name="linkedin" placeholder="linkedin.com/in/username" value={form.linkedin} onChange={handleChange} />
                    {linkedinError && <span className="lk-error-text">Masukkan URL yang valid, contoh: linkedin.com/in/nama</span>}
                  </div>
                  <div className="lk-field">
                    <label>Unggah CV <span className="req">*</span></label>
                    {cvFile ? (
                      <div className="lk-file-chip">
                        <div className="lk-file-chip-icon"><IconDoc /></div>
                        <span className="lk-file-chip-name">{cvFile.name}</span>
                        <button type="button" className="lk-file-chip-x" onClick={() => setCvFile(null)}><IconClose /></button>
                      </div>
                    ) : (
                      <div
                        className={`lk-dropzone${dragOver ? ' drag-over' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('lk-mobile-cv-input').click()}
                      >
                        <div className="lk-dropzone-icon"><IconUpload /></div>
                        <div className="lk-dropzone-label">Seret &amp; lepas file, atau <span>pilih file</span></div>
                        <div className="lk-dropzone-sub">PDF, DOC, DOCX • Maks. 10MB</div>
                        <input id="lk-mobile-cv-input" type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
                      </div>
                    )}
                    {fileError && <span className="lk-error-text">{fileError}</span>}
                    <div className="lk-upload-notes">
                      <div className="lk-upload-note-item"><IconInfo />Pastikan CV dalam format teks yang dapat dibaca, bukan hasil scan gambar.</div>
                      <div className="lk-upload-note-item"><IconInfo />Jika lebih dari 1 file, gabungkan menjadi 1 file PDF/DOC sebelum diunggah.</div>
                    </div>
                  </div>

                  {submitState === 'error' && (
                    <div className="lk-error-card">
                      <h4>{getApplyErrorInfo(submitErrorMsg).title}</h4>
                      <p>{getApplyErrorInfo(submitErrorMsg).desc}</p>
                    </div>
                  )}

                  <button type="submit" className="lk-sheet-cta" disabled={!cvFile}>
                    <IconSend />Kirim Lamaran
                  </button>
                </form>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} onShare={(p) => handleShareAction(p, onShareDone)} pageUrl={pageUrl} />
      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
