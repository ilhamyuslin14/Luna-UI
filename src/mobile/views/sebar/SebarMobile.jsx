import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useSebarData from '../../../hooks/sebar/useSebarData.js';
import MobileToast from '../../components/MobileToast.jsx';
import '../../../../css/mobile/sebar/sebar.css';

const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const IconUsers = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconFile = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>);
const IconQr = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17h.01M17 14h.01" /></svg>);
const IconCopy = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconDownload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconExternal = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>);

const IconFacebook = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></svg>);
const IconTelegram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconX = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconThreads = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8a4 4 0 1 0 4 4v.5a1.5 1.5 0 0 1-3 0V12" /></svg>);

const PLATFORM_ICONS = {
  Facebook: IconFacebook,
  Instagram: IconInstagram,
  Telegram: IconTelegram,
  WhatsApp: IconWhatsApp,
  'X / Twitter': IconX,
  Threads: IconThreads,
};

// Padanan mobile dari Sebar_001.jsx (desktop) — difokuskan dulu ke tab
// "Akun Sendiri"; tab "Akun Mitra" tampil sebagai navigasi tapi isinya
// nyusul. Data & draf teks (getKarirLink/getKualifikasiText/getBroadcastText)
// dipakai apa adanya dari useSebarData, dibagi bareng desktop.
export default function SebarMobile({ navigate }) {
  const { companyId, companyName, profileName } = useAuth() || {};
  const {
    isLoading, searchQuery, setSearchQuery, searchedJobs,
    namaPerusahaan, namaPengirim,
    getKarirLink, getKualifikasiText, getBroadcastText, getPartnerMessage,
    copiedKey, copyText, toast, setToast,
    PARTNER_ACCOUNTS, ALL_PARTNER_ACCOUNTS,
    selectedPartnerPlatform, setSelectedPartnerPlatform,
    partnerSearchQuery, setPartnerSearchQuery, filteredPartnerAccounts,
  } = useSebarData(companyId, companyName, profileName);

  const [activeTab, setActiveTab] = useState('sendiri');
  const [expanded, setExpanded] = useState({});
  const [qrJob, setQrJob] = useState(null);

  const isExpanded = (job, idx, mode) => {
    const key = `${job.id}:${mode}`;
    return expanded[key] !== undefined ? expanded[key] : idx === 0;
  };
  const toggleExpand = (job, idx, mode) => {
    const key = `${job.id}:${mode}`;
    setExpanded(prev => ({ ...prev, [key]: !isExpanded(job, idx, mode) }));
  };

  const openKarir = (job) => window.open(getKarirLink(job), '_blank', 'noopener,noreferrer');
  const openRingkasan = (job) => navigate('lowongan-detail_001', { seleksiId: job.id, jabatan: job.posisi || job.jabatan, activeTab: 'ringkasan' });

  const downloadQr = (job) => {
    const karirLink = getKarirLink(job);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(karirLink)}`;
    fetch(qrUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (job.posisi || job.jabatan || 'Karir').replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `QRCode-LamanKarir-${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.open(qrUrl, '_blank', 'noopener,noreferrer'));
  };

  const renderJobCard = (job, idx, mode) => {
    const expandedNow = isExpanded(job, idx, mode);
    const copyKey = `${job.id}:${mode}`;
    const isCopied = copiedKey === copyKey;
    const posisi = job.posisi || job.jabatan || 'Lowongan';
    const lokasi = job.lokasi || job.domisili || 'Indonesia';
    const dept = job.dept || job.departemen || job.departments?.name;
    const karirLink = getKarirLink(job);

    return (
      <div className={`msb-card${expandedNow ? ' expanded' : ''}`} key={copyKey} onClick={() => toggleExpand(job, idx, mode)}>
        <div className="msb-card-top">
          <div className="msb-card-icon"><IconBriefcase /></div>
          <div className="msb-card-title-wrap">
            <div className="msb-card-title-row">
              <span className="msb-card-title">{posisi}</span>
              <span className="msb-card-badge">Aktif</span>
            </div>
            <div className="msb-card-meta">
              <span>{lokasi}</span>
              {dept && <><span className="msb-dot" />{dept}</>}
              <span className="msb-dot" />
              <span className="msb-cand"><IconUsers />{job.kandidatCount ?? 0} Kandidat</span>
            </div>
          </div>
        </div>

        <div className="msb-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="msb-icon-btn" onClick={() => openKarir(job)} aria-label="Lihat Laman Karier"><IconEye /></button>
          <button className="msb-icon-btn" onClick={() => openRingkasan(job)} aria-label="Lihat Ringkasan Lowongan"><IconFile /></button>
          <button className="msb-icon-btn qr" onClick={() => setQrJob(job)} aria-label="Kode QR Laman Karier"><IconQr /></button>
          <button
            className={`msb-copy-btn${isCopied ? ' copied' : ''}`}
            onClick={() => copyText(
              copyKey,
              mode === 'lain' ? getPartnerMessage(job) : getBroadcastText(job),
              mode === 'lain' ? 'Pesan untuk admin berhasil disalin!' : 'Teks & link lowongan berhasil disalin!'
            )}
          >
            {isCopied ? <><IconCheck />Tersalin!</> : <><IconCopy />{mode === 'lain' ? 'Salin Pesan' : 'Salin Teks'}</>}
          </button>
        </div>

        {expandedNow && (
          <div className="msb-preview" onClick={(e) => e.stopPropagation()}>
            {mode === 'lain' && (
              <>
                Halo, Kak Admin. Saya <b>{namaPengirim}</b> dari <b>{namaPerusahaan}</b>.
                <br /><br />
                Kami sedang membuka lowongan <b>{posisi}</b> di {lokasi}. Boleh minta tolong dibantu posting di akun kakak, ya. Terima kasih, kak.
                <hr className="msb-preview-sep" />
              </>
            )}
            Kami, <b>{namaPerusahaan}</b>, sedang membuka lowongan <b>{posisi}</b> untuk penempatan di {lokasi}.
            <span className="msb-preview-label">Kualifikasi:</span>
            <span className="msb-preview-qual">{getKualifikasiText(job)}</span>
            <a className="msb-preview-link" href={karirLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{karirLink}</a>
          </div>
        )}

        <div className="msb-hint">
          <span style={{ transform: expandedNow ? 'rotate(180deg)' : 'none' }}><IconChevronDown /></span>
          {expandedNow ? `Ketuk kartu untuk menyembunyikan draf ${mode === 'lain' ? 'pesan' : 'teks'}` : `Ketuk kartu untuk menampilkan draf ${mode === 'lain' ? 'pesan' : 'teks'}`}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="msb-hero">
        <div className="msb-hero-badge"><span className="dot" />Sebar Lowongan</div>
        <div className="msb-hero-title">Sebarkan lowongan ke semua kanal</div>
        <p className="msb-hero-sub">Sebar sendiri, atau titipkan ke akun loker lain. Makin banyak jalur, makin banyak pelamar.</p>
      </div>

      <div className="msb-tabs">
        <button className={`msb-tab${activeTab === 'sendiri' ? ' active' : ''}`} onClick={() => setActiveTab('sendiri')}>Akun Sendiri</button>
        <button className={`msb-tab${activeTab === 'lain' ? ' active' : ''}`} onClick={() => setActiveTab('lain')}>Akun Mitra</button>
      </div>

      <div className="msb-tip">
        <IconShare />
        <div>
          {activeTab === 'lain' ? (
            <>
              <span className="msb-tip-lead">Titip ke akun loker yang followernya ribuan</span>
              <span className="msb-tip-detail">Kirim DM ke admin akun loker — kebanyakan bersedia posting gratis, jangkauannya jauh lebih luas dari akun sendiri.</span>
            </>
          ) : (
            <>
              <span className="msb-tip-lead">Sebar ke semua kanal sekaligus</span>
              <span className="msb-tip-detail">WhatsApp, Instagram, Facebook, LinkedIn, Telegram — cukup salin sekali, tempel di mana saja.</span>
            </>
          )}
        </div>
      </div>

      <div className="msb-search">
        <IconSearch />
        <input
          placeholder="Cari posisi atau lokasi lowongan…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="msb-list" style={activeTab === 'lain' ? { paddingBottom: 0 } : undefined}>
        {isLoading ? (
          <>
            <div className="msh-skel" style={{ height: 150 }} />
            <div className="msh-skel" style={{ height: 150 }} />
          </>
        ) : searchedJobs.length === 0 ? (
          <div className="msb-empty">
            <p>{searchQuery.trim() ? `Tidak ada lowongan yang cocok dengan "${searchQuery.trim()}"` : 'Belum ada lowongan aktif untuk disebar.'}</p>
          </div>
        ) : (
          searchedJobs.map((job, idx) => renderJobCard(job, idx, activeTab))
        )}
      </div>

      {activeTab === 'lain' && (
        <>
          <div className="msb-divider" />

          <div className="msb-partner-head">
            <div className="msb-partner-title-row">
              <div>
                <div className="msb-partner-title">Daftar Akun Mitra</div>
                <p className="msb-partner-sub">Akun &amp; komunitas loker publik terverifikasi untuk sebar lowongan lebih luas</p>
              </div>
              <span className="msb-partner-count">{ALL_PARTNER_ACCOUNTS.length} Akun</span>
            </div>
          </div>

          <div className="msb-platform-chips">
            <button
              className={`msb-pchip${selectedPartnerPlatform === 'Semua' ? ' active' : ''}`}
              onClick={() => setSelectedPartnerPlatform('Semua')}
            >
              Semua <span className="msb-pchip-count">{ALL_PARTNER_ACCOUNTS.length}</span>
            </button>
            {PARTNER_ACCOUNTS.filter(p => (p.accounts || []).length > 0).map(p => {
              const Icon = PLATFORM_ICONS[p.platform];
              const isActive = selectedPartnerPlatform === p.platform;
              return (
                <button
                  key={p.platform}
                  className={`msb-pchip${isActive ? ' active' : ''}`}
                  onClick={() => setSelectedPartnerPlatform(p.platform)}
                >
                  <Icon />{p.platform} <span className="msb-pchip-count">{p.accounts.length}</span>
                </button>
              );
            })}
          </div>

          <div className="msb-psearch">
            <IconSearch />
            <input
              placeholder="Cari nama akun / komunitas mitra…"
              value={partnerSearchQuery}
              onChange={(e) => setPartnerSearchQuery(e.target.value)}
            />
          </div>

          {filteredPartnerAccounts.length === 0 ? (
            <div className="msb-partner-empty">
              <p>Akun mitra tidak ditemukan. Coba kata kunci lain atau pilih platform berbeda.</p>
            </div>
          ) : (
            <div className="msb-plist">
              {filteredPartnerAccounts.map((acc, index) => {
                const Icon = PLATFORM_ICONS[acc.platform];
                return (
                  <div className="msb-pcard" key={`${acc.platform}-${acc.name}-${index}`}>
                    <div className="msb-pcard-top">
                      <span className="msb-pbadge" style={{ background: acc.bg, color: acc.color }}><Icon />{acc.platform}</span>
                      <span className="msb-verified"><IconCheck />Terverifikasi</span>
                    </div>
                    <div className="msb-pname">{acc.name}</div>
                    <div className="msb-pcat">{acc.category}</div>
                    <a className="msb-pbtn" href={acc.url} target="_blank" rel="noopener noreferrer">Buka Akun<IconExternal /></a>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── sheet: kode QR ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${qrJob ? ' open' : ''}`} onClick={() => setQrJob(null)} />
          <div className={`msh-sheet${qrJob ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {qrJob && (
              <>
                <div className="msb-qr-eyebrow">Kode QR Laman Karier</div>
                <div className="msb-qr-title">{qrJob.posisi || qrJob.jabatan}</div>
                <div className="msb-qr-sub">{namaPerusahaan}</div>
                <div className="msb-qr-box">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(getKarirLink(qrJob))}`} alt="QR Code Laman Karir" />
                </div>
                <div className="msb-qr-url-row">
                  <span>{getKarirLink(qrJob)}</span>
                  <button onClick={() => copyText('qr-url', getKarirLink(qrJob), 'Tautan Laman Karir tersalin!')}>Salin</button>
                </div>
                <button className="msb-qr-download" onClick={() => downloadQr(qrJob)}><IconDownload />Unduh Gambar QR (PNG)</button>
                <button className="msb-qr-cancel" onClick={() => setQrJob(null)}>Tutup</button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
