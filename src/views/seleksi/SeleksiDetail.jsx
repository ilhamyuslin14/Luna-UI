import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import ToastProgress from '../../components/ToastProgress.jsx';
import SeleksiKandidat from './Seleksi-Kandidat.jsx';
import SeleksiRingkasan from './Seleksi-Ringkasan.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksiById, updateSeleksi } from '../../services/seleksiService.js';
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

export default function SeleksiDetail({ seleksiId, jabatan: initialJabatan = 'Project Manager', navigate, back, activeTab = 'ringkasan', onTabChange }) {
  const { companyId } = useAuth();
  
  const [recruitStatus, setRecruitStatus] = useState('rencana');
  const [jabatan, setJabatan] = useState(initialJabatan);
  const [lokasi, setLokasi] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [seleksiKode, setSeleksiKode] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setRecruitStatus(newVal);
    setShowStatusDrop(false);
    
    if (seleksiId) {
      const cap = newVal.charAt(0).toUpperCase() + newVal.slice(1);
      await updateSeleksi(seleksiId, { status: cap });
      window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: cap }));
    }
  };

  const handleCopyLink = () => {
    if (!karilEnabled) return;
    navigator.clipboard.writeText(kaririUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="sd-view" onClick={() => setShowStatusDrop(false)}>
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
                {STATUS_OPTS.map(opt => (
                  <button
                    key={opt.val}
                    className={`sd-status-option${recruitStatus === opt.val ? ' active' : ''}`}
                    style={{ '--opt-color': opt.text }}
                    onClick={() => handleStatusChange(opt.val)}
                  >
                    <span className="sd-status-opt-icon" style={{ color: opt.text }}>
                      <StatusIcon val={opt.val} size={13} />
                    </span>
                    <span style={{ color: opt.text }}>{opt.label}</span>
                  </button>
                ))}
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

          {/* Salin Tautan — replaces "Bagikan" */}
          <div className="sd-cta-tip-wrap">
            <button
              className={`sd-share-btn${!karilEnabled ? ' sd-btn-disabled' : ''}${copied ? ' sd-btn-copied' : ''}`}
              onClick={handleCopyLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {copied ? 'Disalin!' : 'Salin Tautan'}
            </button>
            {!karilEnabled && (
              <div className="sd-cta-tooltip sd-cta-tooltip--right">
                Status rekrutmen harus Aktif untuk mengaktifkan fitur ini
              </div>
            )}
          </div>
        </div>
      </div>

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
          <SeleksiKandidat navigate={navigate} back={back} seleksiId={seleksiId} />
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
            <SeleksiRingkasan seleksiId={seleksiId} jabatan={jabatan} />
          </>
        )}
      </div>
    </div>
  );
}
