import React, { useState, useRef, useEffect } from 'react';
import { useUpload } from '../context/UploadContext';

const SpinIcon = ({ color = '#0977be', size = 16 }) => (
  <svg className="kt-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </svg>
);
const DoneIcon = ({ color = '#089f32', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const WarnIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CloseBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Tutup notifikasi"
    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0, borderRadius: 4 }}
    onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
);

export default function UploadProgressWidget({ navigate }) {
  const { globalFiles, isUploading, scoringQueue, clearScoringQueue } = useUpload();
  const [dismissed, setDismissed] = useState(false);
  const autoCloseTimer = useRef(null);
  const prevFilesLen = useRef(0);
  const prevScoringLen = useRef(0);

  // ── Compute stats (before any hooks that depend on them) ──
  const hasUpload    = isUploading && globalFiles.length > 0;
  const total        = globalFiles.length;
  const done         = globalFiles.filter(f => f.status === 'berhasil' || f.status === 'gagal').length;
  const gagal        = globalFiles.filter(f => f.status === 'gagal').length;
  const isUploadDone = !hasUpload || done === total;
  const uploadPct    = total > 0 ? (done / total) * 100 : 0;

  const hasScoring    = scoringQueue.length > 0;
  const scTotal       = scoringQueue.length;
  const scDone        = scoringQueue.filter(j => j.status === 'done' || j.status === 'error').length;
  const scGagal       = scoringQueue.filter(j => j.status === 'error').length;
  const isScoringDone = scDone === scTotal;
  const scoringPct    = scTotal > 0 ? (scDone / scTotal) * 100 : 0;

  const allDone = isUploadDone && (!hasScoring || isScoringDone);
  const canDismissUpload = allDone;

  // Auto-close 5 detik setelah semua proses selesai
  useEffect(() => {
    clearTimeout(autoCloseTimer.current);
    if (allDone && !dismissed && (hasUpload || hasScoring)) {
      autoCloseTimer.current = setTimeout(() => {
        clearScoringQueue();
        setDismissed(true);
      }, 5000);
    }
    return () => clearTimeout(autoCloseTimer.current);
  }, [allDone, dismissed]);

  // Reset dismissed saat sesi upload baru dimulai
  useEffect(() => {
    if (globalFiles.length > 0 && prevFilesLen.current === 0) {
      setDismissed(false);
    }
    prevFilesLen.current = globalFiles.length;
  }, [globalFiles.length]);

  // Reset dismissed saat scoring baru masuk (setelah queue dikosongkan)
  useEffect(() => {
    if (scoringQueue.length > prevScoringLen.current) {
      setDismissed(false);
    }
    prevScoringLen.current = scoringQueue.length;
  }, [scoringQueue.length]);

  if (!hasUpload && scoringQueue.length === 0) return null;
  if (dismissed) return null;

  const handleDismissScoring = (e) => {
    e.stopPropagation();
    clearTimeout(autoCloseTimer.current);
    clearScoringQueue();
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
        border: '1px solid #e2e8f0',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Upload section — klik navigasi ke riwayat unggah ── */}
      {hasUpload && (
        <div onClick={() => navigate && navigate('kandidat-tambah')} style={{ cursor: 'pointer' }}>
          <div style={{ height: 4, width: '100%', backgroundColor: '#e2e8f0' }}>
            <div style={{
              height: '100%',
              width: `${uploadPct}%`,
              backgroundColor: isUploadDone ? (gagal > 0 ? '#f97316' : '#089f32') : '#0977be',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isUploadDone ? <SpinIcon color="#0977be" /> : gagal > 0 ? <WarnIcon /> : <DoneIcon color="#089f32" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                {isUploadDone
                  ? gagal > 0 ? `Unggah selesai — ${gagal} gagal` : 'Semua berhasil diunggah'
                  : `Mengunggah ${done}/${total} CV...`}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Klik untuk lihat detail</div>
            </div>
            {canDismissUpload && (
              <CloseBtn onClick={e => { e.stopPropagation(); clearTimeout(autoCloseTimer.current); clearScoringQueue(); setDismissed(true); }} />
            )}
          </div>
        </div>
      )}

      {/* ── Scoring section — hanya info, tanpa navigasi ── */}
      {hasScoring && (
        <>
          {hasUpload && <div style={{ height: 1, backgroundColor: '#f0f2f6' }} />}
          <div style={{ height: hasUpload ? 3 : 4, width: '100%', backgroundColor: '#e2e8f0' }}>
            <div style={{
              height: '100%',
              width: `${scoringPct}%`,
              backgroundColor: isScoringDone ? (scGagal > 0 ? '#f97316' : '#089f32') : '#8b5cf6',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ padding: hasUpload ? '10px 14px' : '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isScoringDone ? <SpinIcon color="#8b5cf6" size={hasUpload ? 15 : 16} /> : scGagal > 0 ? <WarnIcon size={hasUpload ? 15 : 16} /> : <DoneIcon color="#089f32" size={hasUpload ? 15 : 16} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                {isScoringDone
                  ? scGagal > 0 ? `Penilaian selesai — ${scGagal} gagal` : 'Semua penilaian selesai'
                  : `Menilai ${scDone}/${scTotal} kandidat...`}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>AI Scoring otomatis</div>
            </div>
            <CloseBtn onClick={handleDismissScoring} />
          </div>
        </>
      )}
    </div>
  );
}
