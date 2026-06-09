import { useState, useEffect, useRef } from 'react';

export default function ScoringProgressWidget({ jobs, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const dismissTimer = useRef(null);

  const jobList = Object.entries(jobs); // [[posisiId, { nama, status, error }]]
  const total    = jobList.length;
  const done     = jobList.filter(([, j]) => j.status === 'done' || j.status === 'error').length;
  const hasError = jobList.some(([, j]) => j.status === 'error');
  const isAllDone = done === total && total > 0;
  const pct = total > 0 ? (done / total) * 100 : 0;

  // Auto-dismiss setelah 6 detik kalau semua selesai tanpa error
  useEffect(() => {
    if (isAllDone && !hasError) {
      dismissTimer.current = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 6000);
    }
    return () => clearTimeout(dismissTimer.current);
  }, [isAllDone, hasError]);

  // Reset visible kalau ada job baru masuk
  useEffect(() => {
    if (total > 0) setVisible(true);
  }, [total]);

  if (!visible || total === 0) return null;

  const handleDismiss = () => {
    clearTimeout(dismissTimer.current);
    setVisible(false);
    onDismiss?.();
  };

  const progressColor = isAllDone
    ? (hasError ? '#f97316' : '#089f32')
    : '#0977be';

  return (
    <div style={{
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
    }}>
      {/* Progress bar */}
      <div style={{ height: 4, width: '100%', backgroundColor: '#e2e8f0' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: progressColor,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Header */}
      <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isAllDone ? (
          <svg className="kt-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
          </svg>
        ) : hasError ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#089f32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}

        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
          {isAllDone
            ? hasError ? 'Penilaian selesai — ada yang gagal' : 'Semua penilaian selesai'
            : `Menilai kandidat... (${done}/${total})`}
        </span>

        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Job list */}
      <div style={{ padding: '2px 14px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {jobList.map(([posisiId, job]) => (
          <div key={posisiId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {job.status === 'loading' ? (
              <svg className="kt-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.22-8.56" />
              </svg>
            ) : job.status === 'done' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#089f32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span style={{
              fontSize: 11,
              color: job.status === 'error' ? '#ef4444' : job.status === 'done' ? '#64748b' : '#1e293b',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {job.nama}
            </span>
            {job.status === 'error' && job.error && (
              <span style={{ fontSize: 10, color: '#ef4444', flexShrink: 0, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.error}>
                {job.error}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
