import { useEffect, useState } from 'react';
import useLamanKarirEksternalData, { formatTanggalPosting, formatDeskripsiEksternal, formatWaktuPosting } from '../../hooks/lowongan/useLamanKarirEksternalData.js';
import { LAMARAN_SAYA_AKTIF } from '../../utils/fiturPelamar.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PelamarNavMenu from '../../components/pelamar/PelamarNavMenu.jsx';
import LaporanKendalaForm from '../../components/lowongan/LaporanKendalaForm.jsx';
import KecocokanCard from '../../components/lowongan/KecocokanCard.jsx';
import ShareButton from '../../components/lowongan/ShareButton.jsx';
import { itemProfilPerusahaan } from '../../utils/profilPerusahaan.js';
import LowonganHeader, { ViewCountBadge } from '../../components/lowongan/LowonganHeader.jsx';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';
import '../../../css/lowongan/lowongan-laman-karir-eksternal_001.css';
import '../../../css/pelamar/profil-pelamar_001.css';

const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconExternal = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
);
const IconFlag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22V4M4 4h13l-2 4 2 4H4" /></svg>
);
const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>
);
const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);

// Varian laman karir untuk lowongan agregat (asal luar Luna): tanpa form
// lamar, tanpa profil perusahaan (datanya tidak ada di Luna). CTA utama
// mengarah ke halaman asli di situs sumber.
export default function LowonganLamanKarirEksternal_001({ kode, navigate }) {
  const { companyId, pelamarProfile, isPelamar } = useAuth() || {};
  const goMasuk = () => navigate ? navigate('pelamar-masuk') : (window.location.href = '/?view=pelamar-masuk');
  const goProfilSaya = () => isPelamar ? navigate?.('profil-pelamar_001') : goMasuk();
  const goLamaranSaya = () => isPelamar ? navigate?.('status-lamaran_001') : goMasuk();
  const goPerusahaan = () => {
    const target = companyId ? 'beranda_002' : 'landingpage_003';
    if (navigate) navigate(target); else window.location.href = `/?view=${target}`;
  };
  const { pageState, job, viewCount, handleShareAction, laporan } = useLamanKarirEksternalData(kode);
  const [copied, setCopied] = useState(false);
  const onShare = (platform, done) => handleShareAction(platform, (result) => {
    if (result === 'copied' || result === 'instagram') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    done?.();
  });

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
          <p>Memuat informasi lowongan pekerjaan...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'not-found' || !job) {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="lk-section-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--karir-ink-900)', margin: '0 0 8px 0' }}>Lowongan Tidak Ditemukan</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--karir-ink-600)', margin: '0 0 20px 0', lineHeight: '1.5' }}>Lowongan ini mungkin sudah ditutup atau tautan yang kamu buka tidak valid.</p>
          <button className="lk-btn-submit" style={{ margin: '0 auto', maxWidth: '220px' }} onClick={() => navigate ? navigate('semua-lowongan_002') : (window.location.href = '/?view=semua-lowongan_002')}>Cari Lowongan Lain</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lk-page-wrapper">
      {copied && (
        <div className="lk-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Link lowongan berhasil disalin!</span>
        </div>
      )}

      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sl2-nav-left">
            <a className="lk-brand" href="/?view=semua-lowongan_002">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
              <span className="lk-brand-divider" />
              <span className="lk-brand-badge">PORTAL KARIR</span>
            </a>
            <nav className="sl2-nav-links">
              <span className="sl2-nav-link" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</span>
              <span className="sl2-nav-link" onClick={goProfilSaya}>Profil Saya</span>
              {LAMARAN_SAYA_AKTIF && <span className="sl2-nav-link" onClick={goLamaranSaya}>Lamaran Saya</span>}
            </nav>
          </div>
          <div className="lk-header-actions">
            <ShareButton onShare={onShare} copied={copied} />
            {isPelamar ? (
              <PelamarNavMenu navigate={navigate} pelamarProfile={pelamarProfile} />
            ) : (
              <button className="lk-link-masuk" onClick={goMasuk}>Masuk</button>
            )}
            <span className="lk-nav-divider" />
            <button className="lk-btn-perusahaan" onClick={goPerusahaan}><span className="lk-btn-perusahaan-badge"><IconBriefcase /></span>Untuk Perusahaan</button>
          </div>
        </div>
      </header>

      <div className="lk-breadcrumb-bar">
        <span>{job.company_name}</span>
        <span>/</span>
        <span className="active">{job.title}</span>
      </div>

      <div className="lk-main-container">
        <div className="lk-left-col">
          <LowonganHeader
            companyName={job.company_name}
            logoUrl={job.logo_url}
            badges={<ViewCountBadge count={viewCount} />}
            companyInfo={itemProfilPerusahaan(job)}
            title={job.title}
            meta={[
              job.location && { icon: 'pin', text: job.location },
              job.employment_label && { icon: 'brief', text: job.employment_label },
              formatWaktuPosting(job.posted_at) && { icon: 'clock', text: formatWaktuPosting(job.posted_at) },
            ].filter(Boolean)}
            salaryLabel={job.salary_label}
            salaryMuted={job.salary_text_only}
          />

          <div className="lk-detail-card">
            <div className="lk-detail-header-row">
              <div className="lk-detail-title-accent"></div>
              <h3 className="lk-detail-title">Detail Pekerjaan</h3>
            </div>
            <div className="lk-detail-list-wrapper">
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Perusahaan</span>
                <span className="lk-detail-row-value">{job.company_name}</span>
              </div>
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Lokasi</span>
                <span className="lk-detail-row-value">{job.location || '-'}</span>
              </div>
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Kategori</span>
                <span className="lk-detail-row-value">{job.category || '-'}</span>
              </div>
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Ikatan Kerja</span>
                <span className="lk-detail-row-value">{job.employment_label || '-'}</span>
              </div>
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Upah / Gaji</span>
                <span className="lk-detail-row-value" style={!job.salary_text_only ? { color: '#EA580C', fontWeight: '700' } : { color: 'var(--karir-ink-400)', fontWeight: '500' }}>{job.salary_label}</span>
              </div>
              <div className="lk-detail-row-001">
                <span className="lk-detail-row-label">Tanggal Posting</span>
                <span className="lk-detail-row-value">{formatTanggalPosting(job.posted_at)}</span>
              </div>
            </div>
          </div>

          <div className="lk-section-card">
            <h2 className="lk-section-title-001">Deskripsi & Tanggung Jawab Pekerjaan</h2>
            <div
              className="lk-rich-content"
              dangerouslySetInnerHTML={{ __html: formatDeskripsiEksternal(job.description) || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }}
            />
          </div>
        </div>

        <div className="lk-right-col">
          <KecocokanCard jobKey={job.key} jobTitle={job.title} navigate={navigate} />
          <div className="lk-apply-card">
            <div className="lk-apply-header">
              <h3 className="lk-apply-title">Lamar Lowongan Ini</h3>
              <p className="lk-apply-sub">Tertarik dengan lowongan ini? Lamar sekarang.</p>
            </div>

            <a
              className="lke-btn-apply"
              href={job.external_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <span>Lamar Sekarang</span>
              <IconExternal />
            </a>

            <div className="lke-report">
              <span>Lowongan sudah ditutup atau link bermasalah?</span>
              <button type="button" className="lke-report-btn" onClick={laporan.bukaLaporan}>
                <IconFlag />Laporkan kendala
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="sl2-footer">
        <div className="sl2-footer-top">
          <div>
            <div className="sl2-footer-brand">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
              <b>Luna</b>
            </div>
            <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>
          </div>
          <div className="sl2-footer-col">
            <h4>Untuk Pelamar</h4>
            <button type="button" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</button>
            <button type="button" onClick={() => navigate?.('pelamar-daftar')}>Buat Profil</button>
            <button type="button" onClick={() => navigate?.('pelamar-masuk')}>Status Lamaran</button>
          </div>
          <div className="sl2-footer-col">
            <h4>Untuk Perusahaan</h4>
            <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
            <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
          </div>
          <div className="sl2-footer-col">
            <h4>Luna</h4>
            <span>Tentang Kami</span>
            <span>Bantuan</span>
            <span>Kebijakan Privasi</span>
          </div>
        </div>
        <div className="sl2-footer-bottom">
          <span>© 2026 Luna. Seluruh hak cipta dilindungi.</span>
          <div className="sl2-footer-social">
            <span><IconLinkedIn /></span>
            <span><IconInstagram /></span>
          </div>
        </div>
      </footer>

      {laporan.open && (
        <div className="lke-modal-overlay" onClick={laporan.tutupLaporan}>
          <div className="lke-modal-card" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <LaporanKendalaForm laporan={laporan} />
          </div>
        </div>
      )}
    </div>
  );
}
