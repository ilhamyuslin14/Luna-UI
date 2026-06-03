import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import ToastProgress from '../../components/ToastProgress.jsx';
import SeleksiKandidat from './Seleksi-Kandidat.jsx';
import SeleksiRingkasan from './Seleksi-Ringkasan.jsx';

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

export default function SeleksiDetail({ jabatan = 'Project Manager', navigate, back, activeTab = 'ringkasan', onTabChange }) {
  const [recruitStatus, setRecruitStatus] = useState('rencana');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [pageCreated, setPageCreated] = useState(false);
  const [pageCreation, setPageCreation] = useState('idle'); // 'idle' | 'creating'
  const [creationProgress, setCreationProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const kaririUrl = `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(jabatan)}`;
  const karilEnabled = recruitStatus === 'aktif' && pageCreated;
  const currentOpt = STATUS_OPTS.find(o => o.val === recruitStatus);

  const handleStatusChange = (newVal) => {
    setRecruitStatus(newVal);
    setShowStatusDrop(false);
    if (newVal === 'aktif' && pageCreation === 'idle') {
      setPageCreated(false);
      setCreationProgress(0);
      setPageCreation('creating');
    }
  };

  useEffect(() => {
    if (pageCreation !== 'creating') return;
    const interval = setInterval(() => {
      setCreationProgress(p => Math.min(p + 2.5, 100));
    }, 90);
    return () => clearInterval(interval);
  }, [pageCreation]);

  useEffect(() => {
    if (creationProgress < 100 || pageCreation !== 'creating') return;
    setPageCreated(true);
    setPageCreation('idle');
    setShowSuccess(true);
  }, [creationProgress, pageCreation]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3500);
    return () => clearTimeout(t);
  }, [showSuccess]);

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

        <div className="sd-title-actions">
          <button className="sd-header-btn-primary" onClick={() => navigate('seleksi-tambah-kandidat')}>
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
                {pageCreation === 'creating'
                  ? 'Laman karir sedang dibuat, harap tunggu...'
                  : 'Status rekrutmen harus Aktif untuk mengaktifkan fitur ini'}
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
                {pageCreation === 'creating'
                  ? 'Laman karir sedang dibuat, harap tunggu...'
                  : 'Status rekrutmen harus Aktif untuk mengaktifkan fitur ini'}
              </div>
            )}
          </div>
        </div>
      </div>

      {(pageCreation === 'creating' || showSuccess) && (
        <ToastProgress
          state={showSuccess ? 'success' : 'creating'}
          label={showSuccess ? 'Laman karir berhasil dibuat!' : 'Membuat laman karir...'}
          subLabel={pageCreation === 'creating' ? 'Harap tunggu sebentar' : undefined}
          progress={creationProgress}
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
          <SeleksiKandidat navigate={navigate} back={back} />
        ) : (
          <>
            <div style={{ margin: '-20px -20px 0', padding: '0 30px', height: 64, display: 'flex', alignItems: 'center' }}>
              <BackButton onClick={() => back ? back() : navigate('seleksi')} />
            </div>
            <SeleksiRingkasan jabatan={jabatan} />
          </>
        )}
      </div>
    </div>
  );
}
