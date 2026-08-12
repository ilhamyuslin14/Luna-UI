import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useBerandaData from '../../../hooks/beranda/useBerandaData.js';
import MobileBuatLowonganChoice from '../lowongan/MobileBuatLowonganChoice.jsx';
import MobileBuatLowonganQA from '../lowongan/MobileBuatLowonganQA.jsx';
import '../../../../css/mobile/beranda.css';

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconLowongan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconSebar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconKandidat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTotal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const SHARE_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

const STEPS = [
  { key: 'buat-lowongan_001', num: 1, title: 'Buat Lowongan Pekerjaan', desc: 'Rancang deskripsi & kriteria dengan mudah', primary: true },
  { key: 'sebar_001', num: 2, title: 'Bagikan & Sebar Lowongan', desc: 'Sebarkan link karir ke berbagai kanal' },
  { key: 'kandidat_001', num: 3, title: 'Seleksi Kandidat Masuk', desc: 'Evaluasi pelamar dengan skoring AI' },
];

export default function BerandaMobile({ navigate }) {
  const { user, profileName, companyName, companyId } = useAuth() || {};
  const userName = profileName || user?.user_metadata?.full_name || 'HR Team';
  const companyDisplay = companyName || 'Perusahaan Anda';

  const { metrics, recentJobs, isLoading, hasActivity, buildKaririUrl, shareToPlatform } = useBerandaData(companyId);

  const [shareJob, setShareJob] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showCreateChoice, setShowCreateChoice] = useState(false);
  const [showGuidedFlow, setShowGuidedFlow] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const handleShare = (platform) => {
    if (!shareJob) return;
    const result = shareToPlatform(platform, shareJob);
    if (result?.message) showToast(result.message);
    setShareJob(null);
  };

  return (
    <>
      <div className="mdb002-hero">
        <div className="mdb002-hero-badge"><span className="mdb002-hero-badge-dot" />{companyDisplay}</div>
        <h1>Selamat Datang{hasActivity ? ' Kembali' : ''}, {userName}!</h1>
        <p>Mari mulai rekrutmen hari ini dan temukan talenta terbaik.</p>
        <button className="mdb002-hero-cta" onClick={() => setShowCreateChoice(true)}>
          <IconPlus /> Buat Lowongan Baru
        </button>
      </div>

      <div className="mdb002-section">
        <div className="mdb002-section-head"><span className="mdb002-section-title">Mulai di Sini</span></div>
        <div className="mdb002-steps">
          {STEPS.map(step => (
            <button
              key={step.key}
              className={`mdb002-step${step.primary ? ' primary' : ''}`}
              onClick={() => step.key === 'buat-lowongan_001' ? setShowCreateChoice(true) : navigate(step.key)}
            >
              {step.primary && <span className="mdb002-step-flag">Mulai di sini</span>}
              <div className="mdb002-step-num">{step.num}</div>
              <div className="mdb002-step-body">
                <div className="mdb002-step-title">{step.title}</div>
                <div className="mdb002-step-desc">{step.desc}</div>
              </div>
              <div className="mdb002-step-chevron"><IconChevron /></div>
            </button>
          ))}
        </div>
      </div>

      <div className="mdb002-section">
        <div className="mdb002-section-head"><span className="mdb002-section-title">Ringkasan</span></div>
        <div className="mdb002-metrics">
          <button className="mdb002-metric-card" onClick={() => navigate('lowongan_001')}>
            <div className="mdb002-metric-icon orange"><IconLowongan /></div>
            <div className="mdb002-metric-value">{isLoading ? '–' : (metrics.lowonganAktif || 0)}</div>
            <div className="mdb002-metric-label">Lowongan Aktif</div>
          </button>
          <button className="mdb002-metric-card" onClick={() => navigate('kandidat_001')}>
            <div className="mdb002-metric-icon dark"><IconKandidat /></div>
            <div className="mdb002-metric-value">{isLoading ? '–' : (metrics.totalKandidat || 0)}</div>
            <div className="mdb002-metric-label">Total Kandidat</div>
          </button>
        </div>
      </div>

      <div className="mdb002-section">
        <div className="mdb002-section-head">
          <span className="mdb002-section-title">Lowongan Terbaru</span>
          <button className="mdb002-section-link" onClick={() => navigate('lowongan_001')}>
            Lihat Semua <IconChevron />
          </button>
        </div>

        {isLoading ? (
          <div className="mdb002-jobs">
            <div className="msh-skel" style={{ height: 130 }} />
            <div className="msh-skel" style={{ height: 130 }} />
          </div>
        ) : recentJobs && recentJobs.length > 0 ? (
          <div className="mdb002-jobs">
            {recentJobs.slice(0, 6).map(job => (
              <div className="mdb002-job-card" key={job.id}>
                <div className="mdb002-job-top">
                  <div className="mdb002-job-title-wrap" onClick={() => navigate('lowongan-detail_001', { seleksiId: job.id, jabatan: job.posisi })}>
                    <div className="mdb002-job-title">{job.posisi}</div>
                    <div className="mdb002-job-meta">
                      {job.departemen || job.dept || 'Umum'}
                      <span className="mdb002-job-meta-dot" />
                      {job.lokasi || job.companyLokasi || 'Lokasi tidak diset'}
                    </div>
                  </div>
                  <div className="mdb002-job-actions">
                    <span className={`mdb002-status-pill${job.status === 'Aktif' ? '' : ' draft'}`}>{job.status || 'Aktif'}</span>
                    <button className="mdb002-share-btn" onClick={() => setShareJob(job)}>
                      <IconShare />
                    </button>
                  </div>
                </div>

                <div className="mdb002-job-stages">
                  <span className="mdb002-stage"><span className="mdb002-stage-dot blue" />{job.stages?.baru || 0} Baru</span>
                  <span className="mdb002-stage"><span className="mdb002-stage-dot orange" />{job.stages?.interview || 0} Wawancara</span>
                  <span className="mdb002-stage"><span className="mdb002-stage-dot green" />{job.stages?.hired || 0} Hired</span>
                </div>

                <div className="mdb002-job-footer">
                  <span className="mdb002-job-total"><IconTotal />{job.jumlahKandidat ?? job.kandidatCount ?? 0} Kandidat</span>
                  <button
                    className="mdb002-job-manage"
                    onClick={() => navigate('lowongan-detail_001', { seleksiId: job.id, jabatan: job.posisi })}
                  >
                    Kelola <IconChevron />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mdb002-empty">
            <p><strong>Belum ada lowongan pekerjaan dibuka.</strong><br />Buat lowongan pertama Anda untuk mulai menerima lamaran kandidat.</p>
          </div>
        )}
      </div>

      {createPortal(
        <>
          <div className={`msh-sheet-overlay${shareJob ? ' open' : ''}`} onClick={() => setShareJob(null)} />
          <div className={`msh-sheet${shareJob ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mdb002-sheet-eyebrow">Bagikan Laman Karier</div>
            {shareJob && (
              <>
                <div className="mdb002-sheet-link">
                  <span>{buildKaririUrl(shareJob)}</span>
                  <button className="mdb002-sheet-copy" onClick={() => handleShare('copy')}>Salin</button>
                </div>
                <div className="mdb002-sheet-grid">
                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                    <button key={key} className="mdb002-share-item" onClick={() => handleShare(key)}>
                      <span className="mdb002-share-icon"><Icon /></span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {toastMsg && <div className="mdb002-toast">{toastMsg}</div>}

      <MobileBuatLowonganChoice
        open={showCreateChoice}
        onClose={() => setShowCreateChoice(false)}
        onPilihPanduan={() => { setShowCreateChoice(false); setShowGuidedFlow(true); }}
        onPilihForm={() => { setShowCreateChoice(false); navigate('buat-lowongan_001'); }}
      />
      <MobileBuatLowonganQA
        open={showGuidedFlow}
        onClose={() => setShowGuidedFlow(false)}
        navigate={navigate}
      />
    </>
  );
}
