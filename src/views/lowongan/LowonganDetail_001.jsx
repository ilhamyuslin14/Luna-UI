import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import ToastProgress from '../../components/ToastProgress.jsx';
import Toast from '../../components/Toast.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import LowonganKandidat_001 from './Lowongan-Kandidat_001.jsx';
import LowonganRingkasan_002 from './Lowongan-Ringkasan_002.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksiById, updateSeleksi, duplicateSeleksi, archiveSeleksi } from '../../services/seleksiService.js';
import { invalidate } from '../../services/dataCache.js';
import { slugify } from '../../utils/slug.js';

const STATUS_OPTS = [
  { val: 'rencana', label: 'Rencana', text: '#555f71', bg: '#f4f6fa', border: '#cbd0db' },
  { val: 'aktif', label: 'Aktif', text: '#0977be', bg: '#eef7fd', border: '#89ccf6' },
  { val: 'ditahan', label: 'Ditahan', text: '#fd800c', bg: '#fff5eb', border: '#ffac4e' },
  { val: 'selesai', label: 'Selesai', text: '#089f32', bg: '#edfcf2', border: '#3cd266' },
  { val: 'dibatalkan', label: 'Dibatalkan', text: '#fb484b', bg: '#fff3f3', border: '#ffabad' },
];

const StatusIcon = ({ val, size = 13 }) => {
  const s = { flexShrink: 0 };
  if (val === 'rencana') return (
    <svg style={s} width={size} height={size} viewBox="0 0 13 13" fill="none">
      <path d="M9.5 1.5L11.5 3.5L4 11H2V9L9.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (val === 'aktif') return (
    <svg style={s} width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 4.5L9.5 6.5L5 8.5V4.5Z" fill="currentColor" />
    </svg>
  );
  if (val === 'ditahan') return (
    <svg style={s} width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="5" y1="4.5" x2="5" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="4.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  if (val === 'selesai') return (
    <svg style={s} width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 6.5L5.8 8.5L9.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (val === 'dibatalkan') return (
    <svg style={s} width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 4.5L8.5 8.5M8.5 4.5L4.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
  return null;
};

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
    <circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 16.5v-3.7a2.3 2.3 0 0 1 4.5 0v3.7" />
    <line x1="11" y1="10.5" x2="11" y2="16.5" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M14 8.5h-1.3c-.9 0-1.7.7-1.7 1.7V12h3l-.4 2.5h-2.6V19" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
  </svg>
);

const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SHARE_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

export default function LowonganDetail_001({ seleksiId, jabatan: initialJabatan = 'Project Manager', navigate, back, activeTab = 'ringkasan', onTabChange }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  
  const [recruitStatus, setRecruitStatus] = useState('rencana');
  const [jabatan, setJabatan] = useState(initialJabatan);
  const [lokasi, setLokasi] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [seleksiKode, setSeleksiKode] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showTitleMenu, setShowTitleMenu] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [toast, setToast] = useState(null);

  const kaririUrl = seleksiKode
    ? `${window.location.origin}/?view=laman-karir&perusahaan=${slugify(companyName)}&posisi=${slugify(jabatan)}&kode=${encodeURIComponent(seleksiKode)}`
    : `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(jabatan)}`;
  const karilEnabled = recruitStatus === 'aktif';
  const currentOpt = STATUS_OPTS.find(o => o.val === recruitStatus) || STATUS_OPTS[0];

  const fetchSeleksiData = () => {
    if (!seleksiId) return;
    getSeleksiById(seleksiId).then(data => {
      if (data) {
        setJabatan(data.jabatan || initialJabatan);
        setLokasi(data.lokasi || '');
        setDepartemen(data.departments?.name || '');
        setSeleksiKode(data.kode || null);
        setCompanyName(data.companies?.name || null);
        if (data.status) {
          const s = data.status.trim().toLowerCase();
          setRecruitStatus(s);
        }
      }
    });
  };

  useEffect(() => {
    fetchSeleksiData();
  }, [seleksiId]);

  useEffect(() => {
    window.addEventListener('syncSeleksiData', fetchSeleksiData);
    return () => window.removeEventListener('syncSeleksiData', fetchSeleksiData);
  }, [seleksiId]);

  // Listen to global status updates from Ringkasan
  useEffect(() => {
    const handleSync = (e) => {
      const newVal = e.detail.toLowerCase();
      setRecruitStatus(newVal);
    };
    window.addEventListener('syncSeleksiStatus', handleSync);
    return () => window.removeEventListener('syncSeleksiStatus', handleSync);
  }, []);

  const handleStatusChange = async (newVal) => {
    const prevStatus = recruitStatus;
    setRecruitStatus(newVal);
    setShowStatusDrop(false);

    if (seleksiId) {
      const cap = newVal.charAt(0).toUpperCase() + newVal.slice(1);
      try {
        await updateSeleksi(seleksiId, { status: cap });
        invalidate('seleksi');
        window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: cap }));
      } catch (err) {
        console.error(err);
        setRecruitStatus(prevStatus);
        setToast({ message: 'Gagal memperbarui status', subMessage: err.message || 'Terjadi kesalahan.', type: 'error' });
      }
    }
  };

  const handleShareAction = (platform) => {
    const text = `Lowongan ${jabatan} di ${companyName || 'perusahaan kami'}`;
    setShowShareMenu(false);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${kaririUrl}`)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(kaririUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(kaririUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(kaririUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(kaririUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'instagram':
        navigator.clipboard.writeText(kaririUrl).then(() => {
          setToast({ message: 'Link disalin', subMessage: 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.' });
        });
        break;
      default:
        navigator.clipboard.writeText(kaririUrl).then(() => {
          setToast({ message: 'Tautan disalin', subMessage: 'Link laman karier sudah disalin ke clipboard.' });
        });
    }
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setShowTitleMenu(false);
    setIsDuplicating(true);
    try {
      const duplicated = await duplicateSeleksi(seleksiId);
      invalidate('seleksi');
      navigate('lowongan-detail_001', { seleksiId: duplicated.id, jabatan: duplicated.jabatan, activeTab: 'ringkasan' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal menduplikat', subMessage: err.message || 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      await archiveSeleksi(seleksiId);
      invalidate('seleksi');
      setShowArchiveConfirm(false);
      back ? back() : navigate('lowongan_001');
    } catch (err) {
      console.error(err);
      setShowArchiveConfirm(false);
      setToast({ message: 'Gagal mengarsipkan', subMessage: err.message || 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="sd001-view" onClick={() => { setShowStatusDrop(false); setShowTitleMenu(false); setShowShareMenu(false); }}>
      {/* ── Title Bar ─────────────────────────────────── */}
      <div className="sd001-title-bar">
        <div className="sd001-title-content" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="sd001-title-group">
          <h1 className="sd001-title">{jabatan}</h1>

          {/* Status badge + dropdown */}
          <div className="sd001-status-wrap" onClick={e => e.stopPropagation()}>
            <button
              className={`sd001-status-badge${showStatusDrop ? ' open' : ''}`}
              style={{ color: currentOpt.text, background: currentOpt.bg, borderColor: currentOpt.border }}
              onClick={() => setShowStatusDrop(v => !v)}
            >
              <StatusIcon val={recruitStatus} size={12} />
              {currentOpt.label}
              <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M1 1L5 5L9 1" />
              </svg>
            </button>

            {showStatusDrop && (
              <div className="sd001-status-dropdown">
                {STATUS_OPTS.map(opt => {
                  const isLocked = isFreePlan && opt.val !== 'rencana' && opt.val !== 'aktif';
                  const color = isLocked ? '#b8b5ae' : opt.text;
                  return (
                    <button
                      key={opt.val}
                      className={`sd001-status-option${recruitStatus === opt.val ? ' active' : ''}${isLocked ? ' disabled' : ''}`}
                      style={{ '--opt-color': color }}
                      onClick={() => {
                        if (isLocked) {
                          setToast({ message: 'Perlu paket berlangganan', subMessage: `Status "${opt.label}" hanya tersedia di paket berbayar.`, type: 'error' });
                          return;
                        }
                        handleStatusChange(opt.val);
                      }}
                    >
                      <span className="sd001-status-opt-icon" style={{ color }}>
                        <StatusIcon val={opt.val} size={13} />
                      </span>
                      <span style={{ color }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Lokasi & Departemen Meta */}
        {(departemen && departemen !== '-' || lokasi && lokasi !== '-') && (
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#7e8799' }}>
            {departemen && departemen !== '-' && <span>{departemen}</span>}
            {departemen && departemen !== '-' && lokasi && lokasi !== '-' && <span style={{ margin: '0 6px', color: '#cbd0db' }}>|</span>}
            {lokasi && lokasi !== '-' && <span style={{ fontWeight: 600, color: '#555f71' }}>{lokasi}</span>}
          </div>
        )}
      </div>

        <div className="sd001-title-actions">
          <button className="sd001-header-btn-primary" onClick={() => navigate('lowongan-tambah-kandidat', { seleksiId, jabatan })}>
            <span className="sd001-header-btn-primary-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Tambah kandidat
          </button>

          {/* Buka Laman Karir — with tooltip when disabled */}
          <div className="sd001-cta-tip-wrap">
            <button
              className={`sd001-open-karir-btn${!karilEnabled ? ' sd001-btn-disabled' : ''}`}
              onClick={() => karilEnabled && window.open(kaririUrl, '_blank')}
            >
              <IconEye />
              Buka Halaman Lowongan
            </button>
            {!karilEnabled && (
              <div className="sd001-cta-tooltip">
                Status lowongan harus Aktif untuk mengaktifkan fitur ini
              </div>
            )}
          </div>

          {/* Bagikan Laman Karir */}
          <div className="sd001-cta-tip-wrap" onClick={e => e.stopPropagation()}>
            <button
              className={`sd001-open-karir-btn${!karilEnabled ? ' sd001-btn-disabled' : ''}`}
              onClick={() => karilEnabled && setShowShareMenu(v => !v)}
            >
              <IconShare />
              Bagikan Laman Karier
            </button>
            {!karilEnabled && (
              <div className="sd001-cta-tooltip">
                Status lowongan harus Aktif untuk mengaktifkan fitur ini
              </div>
            )}

            {showShareMenu && (
              <div className="lw001-share-menu" onClick={e => e.stopPropagation()}>
                <div className="lw001-share-eyebrow">Bagikan Laman Karier</div>
                <div className="lw001-share-linkcard">
                  <span className="lw001-share-linkcard-url">{kaririUrl}</span>
                  <button className="lw001-share-linkcard-copy" onClick={() => handleShareAction('copy')}>
                    <IconLink />
                    Salin
                  </button>
                </div>
                <div className="lw001-share-divider" />
                <div className="lw001-share-grid">
                  {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                    <button key={key} className="lw001-share-gridbtn" onClick={() => handleShareAction(key)}>
                      <span className="lw001-share-gridbtn-icon"><Icon /></span>
                      <span className="lw001-share-gridbtn-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu titik-tiga: Duplikat Seleksi + Arsipkan */}
          <div className="sd001-share-wrap" onClick={e => e.stopPropagation()}>
            <button
              className={`sd001-title-menu-btn${showTitleMenu ? ' active' : ''}`}
              onClick={() => setShowTitleMenu(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showTitleMenu && (
              <div className="sd001-share-dropdown">
                <button
                  className="sd001-share-option"
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  style={isDuplicating ? { opacity: 0.6, cursor: 'wait' } : undefined}
                >
                  <span className="sd001-share-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </span>
                  {isDuplicating ? 'Menduplikat…' : 'Duplikat Lowongan'}
                </button>
                <div style={{ borderTop: '1px solid #f0f2f6', margin: '4px 0' }} />
                <button
                  className="sd001-share-option"
                  onClick={() => { setShowTitleMenu(false); setShowArchiveConfirm(true); }}
                >
                  <span className="sd001-share-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  </span>
                  Arsipkan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} type={toast.type} onClose={() => setToast(null)} />}

      {showArchiveConfirm && (
        <PopupKonfirmasi
          title="Arsipkan Lowongan"
          body={`Apakah Anda yakin ingin mengarsipkan lowongan "${jabatan}"? Lowongan yang diarsipkan tidak akan tampil di daftar lowongan aktif.`}
          confirmLabel={isArchiving ? 'Mengarsipkan…' : 'Arsipkan'}
          onConfirm={handleArchive}
          onClose={() => setShowArchiveConfirm(false)}
        />
      )}

      <TabNav
        tabs={[
          { id: 'kandidat', label: 'Kandidat' },
          { id: 'ringkasan', label: 'Ringkasan' },
        ]}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      <div className="sd001-content">
        {activeTab === 'kandidat' ? (
          <LowonganKandidat_001 navigate={navigate} back={back} seleksiId={seleksiId} />
        ) : (
          <>
            <div style={{ 
              margin: '-20px -20px -16px -20px', 
              padding: '0 30px', 
              height: 64, 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0
            }}>
              <BackButton onClick={() => back ? back() : navigate('lowongan_001')} />
            </div>
            <LowonganRingkasan_002 seleksiId={seleksiId} jabatan={jabatan} navigate={navigate} />
          </>
        )}
      </div>
    </div>
  );
}
