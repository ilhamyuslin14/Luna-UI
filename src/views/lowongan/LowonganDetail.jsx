import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import ToastProgress from '../../components/ToastProgress.jsx';
import Toast from '../../components/Toast.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import LowonganKandidat from './Lowongan-Kandidat.jsx';
import LowonganRingkasan from './Lowongan-Ringkasan.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksiById, updateSeleksi, duplicateSeleksi, archiveSeleksi } from '../../services/seleksiService.js';
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

export default function LowonganDetail({ seleksiId, jabatan: initialJabatan = 'Project Manager', navigate, back, activeTab = 'ringkasan', onTabChange }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  
  const [recruitStatus, setRecruitStatus] = useState('rencana');
  const [jabatan, setJabatan] = useState(initialJabatan);
  const [lokasi, setLokasi] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [seleksiKode, setSeleksiKode] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [copied, setCopied] = useState(false);
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
        window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: cap }));
      } catch (err) {
        console.error(err);
        setRecruitStatus(prevStatus);
        setToast({ message: 'Gagal memperbarui status', subMessage: err.message || 'Terjadi kesalahan.', type: 'error' });
      }
    }
  };

  const handleCopyLink = () => {
    if (!karilEnabled) return;
    navigator.clipboard.writeText(kaririUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShowTitleMenu(false);
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setShowTitleMenu(false);
    setIsDuplicating(true);
    try {
      const duplicated = await duplicateSeleksi(seleksiId);
      navigate('seleksi-detail', { seleksiId: duplicated.id, jabatan: duplicated.jabatan, activeTab: 'ringkasan' });
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
      setShowArchiveConfirm(false);
      back ? back() : navigate('seleksi_001');
    } catch (err) {
      console.error(err);
      setShowArchiveConfirm(false);
      setToast({ message: 'Gagal mengarsipkan', subMessage: err.message || 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="sd-view" onClick={() => { setShowStatusDrop(false); setShowTitleMenu(false); }}>
      {/* ── Title Bar ─────────────────────────────────── */}
      <div className="sd-title-bar">
        <div className="sd-title-content" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="sd-title-group">
          <h1 className="sd-title">{jabatan}</h1>

          {/* Status badge + dropdown */}
          <div className="sd-status-wrap" onClick={e => e.stopPropagation()}>
            <button
              className={`sd-status-badge${showStatusDrop ? ' open' : ''}`}
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
              <div className="sd-status-dropdown">
                {STATUS_OPTS.map(opt => {
                  const isLocked = isFreePlan && opt.val !== 'rencana' && opt.val !== 'aktif';
                  const color = isLocked ? '#b8b5ae' : opt.text;
                  return (
                    <button
                      key={opt.val}
                      className={`sd-status-option${recruitStatus === opt.val ? ' active' : ''}${isLocked ? ' disabled' : ''}`}
                      style={{ '--opt-color': color }}
                      onClick={() => {
                        if (isLocked) {
                          setToast({ message: 'Perlu paket berlangganan', subMessage: `Status "${opt.label}" hanya tersedia di paket berbayar.`, type: 'error' });
                          return;
                        }
                        handleStatusChange(opt.val);
                      }}
                    >
                      <span className="sd-status-opt-icon" style={{ color }}>
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

        <div className="sd-title-actions">
          <button className="sd-header-btn-primary" onClick={() => navigate('seleksi-tambah-kandidat', { seleksiId, jabatan })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah kandidat
          </button>

          {/* Buka Laman Karir — with tooltip when disabled */}
          <div className="sd-cta-tip-wrap">
            <button
              className={`sd-open-karir-btn${!karilEnabled ? ' sd-btn-disabled' : ''}`}
              onClick={() => karilEnabled && window.open(kaririUrl, '_blank')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Buka Laman Karir
            </button>
            {!karilEnabled && (
              <div className="sd-cta-tooltip">
                Status rekrutmen harus Aktif untuk mengaktifkan fitur ini
              </div>
            )}
          </div>

          {/* Menu titik-tiga: Salin Tautan + Duplikat Seleksi */}
          <div className="sd-share-wrap" onClick={e => e.stopPropagation()}>
            <button
              className={`sd-title-menu-btn${showTitleMenu ? ' active' : ''}`}
              onClick={() => setShowTitleMenu(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showTitleMenu && (
              <div className="sd-share-dropdown">
                <button
                  className="sd-share-option"
                  onClick={handleCopyLink}
                  disabled={!karilEnabled}
                  style={!karilEnabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  title={!karilEnabled ? 'Status rekrutmen harus Aktif untuk mengaktifkan fitur ini' : undefined}
                >
                  <span className="sd-share-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  {copied ? 'Disalin!' : 'Salin Tautan'}
                </button>
                <button
                  className="sd-share-option"
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  style={isDuplicating ? { opacity: 0.6, cursor: 'wait' } : undefined}
                >
                  <span className="sd-share-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </span>
                  {isDuplicating ? 'Menduplikat…' : 'Duplikat Seleksi'}
                </button>
                <div style={{ borderTop: '1px solid #f0f2f6', margin: '4px 0' }} />
                <button
                  className="sd-share-option"
                  onClick={() => { setShowTitleMenu(false); setShowArchiveConfirm(true); }}
                >
                  <span className="sd-share-icon">
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
          title="Arsipkan Posisi"
          body={`Apakah Anda yakin ingin mengarsipkan posisi "${jabatan}"? Posisi yang diarsipkan tidak akan tampil di daftar seleksi aktif.`}
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

      <div className="sd-content">
        {activeTab === 'kandidat' ? (
          <LowonganKandidat navigate={navigate} back={back} seleksiId={seleksiId} />
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
              <BackButton onClick={() => back ? back() : navigate('seleksi')} />
            </div>
            <LowonganRingkasan seleksiId={seleksiId} jabatan={jabatan} navigate={navigate} />
          </>
        )}
      </div>
    </div>
  );
}
