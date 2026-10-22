import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLamanKarirEksternalData, { formatTanggalPosting, formatDeskripsiEksternal, formatWaktuPosting } from '../../../hooks/lowongan/useLamanKarirEksternalData.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import PelamarMobileNav from '../../../components/pelamar/PelamarMobileNav.jsx';
import LaporanKendalaForm from '../../../components/lowongan/LaporanKendalaForm.jsx';
import KecocokanCard from '../../../components/lowongan/KecocokanCard.jsx';
import LowonganShareSheet from '../../components/LowonganShareSheet.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import LowonganHeader, { ViewCountBadge } from '../../../components/lowongan/LowonganHeader.jsx';
import SumberLowonganBadge from '../../../components/lowongan/SumberLowonganBadge.jsx';
import '../../../../css/mobile/lowongan/laman-karir.css';
import '../../../../css/mobile/lowongan/semua-lowongan_002.css';
import '../../../../css/mobile/lowongan/laman-karir-eksternal.css';

const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconUser = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconCompany = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const IconExternal = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>);
const IconFlag = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4M4 4h13l-2 4 2 4H4" /></svg>);
const IconAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);
const IconSpin = () => (<svg className="lk-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);

// Padanan mobile dari Lowongan-LamanKarirEksternal_001.jsx — varian laman
// karir untuk lowongan agregat: tanpa form lamar, CTA keluar ke situs sumber.
export default function LamanKarirEksternalMobile({ kode, navigate }) {
  const { companyId, pelamarProfile, isPelamar } = useAuth() || {};
  const goMasuk = () => navigate ? navigate('pelamar-masuk') : (window.location.href = '/?view=pelamar-masuk');
  const goPerusahaan = () => {
    const target = companyId ? 'beranda_002' : 'landingpage_003';
    if (navigate) navigate(target); else window.location.href = `/?view=${target}`;
  };
  const { pageState, job, viewCount, handleShareAction, laporan } = useLamanKarirEksternalData(kode);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const onShareDone = (result) => {
    setShareOpen(false);
    if (result === 'copied') setToast({ message: 'Link disalin', subMessage: 'Link lowongan berhasil disalin ke clipboard.', type: 'success' });
    else if (result === 'instagram') setToast({ message: 'Link disalin', subMessage: 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.', type: 'success' });
  };
  const [descExpanded, setDescExpanded] = useState(false);

  if (pageState === 'loading') {
    return (
      <div className="lk-page lk-loading">
        <IconSpin />
        <p>Memuat informasi lowongan pekerjaan...</p>
      </div>
    );
  }

  if (pageState === 'not-found' || !job) {
    return (
      <div className="lk-page lk-notfound">
        <div className="lk-notfound-icon"><IconAlert /></div>
        <h2>Lowongan Tidak Ditemukan</h2>
        <p>Lowongan ini mungkin sudah ditutup atau tautan yang kamu buka tidak valid.</p>
        <button className="lk-apply-btn" onClick={() => navigate ? navigate('semua-lowongan_002') : (window.location.href = '/?view=semua-lowongan_002')}>Cari Lowongan Lain</button>
      </div>
    );
  }

  const sumber = job.source_label;

  return (
    <div className="lk-page">
      <div className="lk-head">
        <a className="lk-logo" href="/?view=semua-lowongan_002">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <span className="lk-logo-divider" />
          <span className="lk-badge-portal">PORTAL KARIR</span>
        </a>
        <div className="lk-head-actions">
          <button className="lk-share-btn" onClick={() => setShareOpen(true)} title="Bagikan"><IconShare /></button>
          <span className="lk-head-divider" />
          {isPelamar ? (
            <PelamarMobileNav navigate={navigate} pelamarProfile={pelamarProfile} goPerusahaan={goPerusahaan} activeTab="cari" />
          ) : (
            <>
              <button className="lk-share-btn" onClick={goMasuk} title="Masuk"><IconUser /></button>
              <button className="lk-share-btn primary" onClick={goPerusahaan} title="Untuk Perusahaan"><IconCompany /></button>
            </>
          )}
        </div>
      </div>

      <div className="lk-crumb">
        <span>{job.company_name}</span>{' / '}<b>{job.title}</b>
      </div>

      <div className="lkh-m-wrap">
        <LowonganHeader
          companyName={job.company_name}
          logoUrl={job.logo_url}
          badges={<><SumberLowonganBadge job={job} /><ViewCountBadge count={viewCount} /></>}
          title={job.title}
          meta={[
            job.location && { icon: 'pin', text: job.location },
            job.employment_label && { icon: 'brief', text: job.employment_label },
            formatWaktuPosting(job.posted_at) && { icon: 'clock', text: formatWaktuPosting(job.posted_at) },
          ].filter(Boolean)}
          salaryLabel={job.salary_label}
          salaryMuted={job.salary_text_only}
        />
      </div>

      <div className="lk-body">
        <KecocokanCard jobKey={job.key} jobTitle={job.title} navigate={navigate} />
        <div className="lk-card">
          <div className="lk-card-title">Detail Pekerjaan</div>
          <div className="lk-detail-row"><span>Perusahaan</span><span>{job.company_name}</span></div>
          <div className="lk-detail-row"><span>Lokasi</span><span>{job.location || '-'}</span></div>
          <div className="lk-detail-row"><span>Kategori</span><span>{job.category || '-'}</span></div>
          <div className="lk-detail-row"><span>Ikatan Kerja</span><span>{job.employment_label || '-'}</span></div>
          <div className="lk-detail-row"><span>Upah / Gaji</span><span style={!job.salary_text_only ? { color: 'var(--luna-orange-600)' } : { color: 'var(--luna-ink-400)', fontWeight: 500 }}>{job.salary_label}</span></div>
          <div className="lk-detail-row"><span>Tanggal Posting</span><span>{formatTanggalPosting(job.posted_at)}</span></div>
          <div className="lk-detail-row"><span>Sumber</span><span>{sumber}</span></div>
        </div>

        <div className="lk-card">
          <div className="lk-card-title">Deskripsi &amp; Tanggung Jawab</div>
          <div
            className={`lk-desc-text${!descExpanded ? ' clamped' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatDeskripsiEksternal(job.description) || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }}
          />
          <button className="lk-more-link" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}</button>
        </div>

        <div className="lk-card">
          <div className="lk-card-title">Tentang lamaran ini</div>
          <ul className="lkem-notes">
            <li>Kamu akan dialihkan ke halaman resmi {sumber}.</li>
          </ul>
          <div className="lkem-report">
            <span>Lowongan sudah ditutup atau link bermasalah?</span>
            <button type="button" className="lkem-report-btn" onClick={laporan.bukaLaporan}><IconFlag />Laporkan kendala</button>
          </div>
        </div>
      </div>

      <footer className="sl2m-footer">
        <div className="sl2m-footer-brand">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <b>Luna</b>
        </div>
        <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>

        <div className="sl2m-footer-cols">
          <div className="sl2m-footer-col">
            <h5>Untuk Pelamar</h5>
            <button type="button" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</button>
            <button type="button" onClick={() => navigate?.('pelamar-daftar')}>Buat Profil</button>
            <button type="button" onClick={() => navigate?.('pelamar-masuk')}>Status Lamaran</button>
          </div>
          <div className="sl2m-footer-col">
            <h5>Untuk Perusahaan</h5>
            <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
            <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
          </div>
        </div>

        <div className="sl2m-footer-bottom">
          <span>© {new Date().getFullYear()} Luna. Semua hak dilindungi.</span>
          <div className="sl2m-footer-social">
            <span><IconLinkedIn /></span>
            <span><IconInstagram /></span>
          </div>
        </div>
      </footer>

      <div className="lk-stickybar">
        <div className="lk-stickybar-info">
          <div className="lk-stickybar-label">Dikelola oleh</div>
          <div className="lk-stickybar-val">{sumber}</div>
        </div>
        <a className="lk-apply-btn lkem-apply" href={job.external_url} target="_blank" rel="noopener noreferrer nofollow">
          Lamar Lowongan<IconExternal />
        </a>
      </div>

      {createPortal(
        <>
          <div className={`msh-sheet-overlay${laporan.open ? ' open' : ''}`} onClick={laporan.tutupLaporan} />
          <div className={`msh-sheet${laporan.open ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="lkem-sheet-body">
              <LaporanKendalaForm laporan={laporan} sourceLabel={sumber} />
            </div>
          </div>
        </>,
        document.body
      )}

      <LowonganShareSheet open={shareOpen} onClose={() => setShareOpen(false)} onShare={(p) => handleShareAction(p, onShareDone)} pageUrl={typeof window !== 'undefined' ? window.location.href : ''} />
      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
