export default function ToastProgress({ state = 'creating', label, subLabel, progress = 0 }) {
  return (
    <div className={`toast-progress${state === 'success' ? ' toast-progress--success' : ''}`}>
      {state === 'creating' && (
        <>
          <div className="toast-progress-row">
            <div className="toast-progress-spinner" />
            <div className="toast-progress-text">
              <span className="toast-progress-label">{label}</span>
              {subLabel && <span className="toast-progress-sub">{subLabel}</span>}
            </div>
            <span className="toast-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="toast-progress-track">
            <div className="toast-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </>
      )}
      {state === 'success' && (
        <div className="toast-progress-row">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="9" r="7.5" stroke="#089f32" strokeWidth="1.3" />
            <path d="M5.5 9L7.8 11.5L12.5 6" stroke="#089f32" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="toast-progress-label toast-progress-label--success">{label}</span>
        </div>
      )}
    </div>
  );
}
