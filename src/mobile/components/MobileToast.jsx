const IconSuccess = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" stroke="#14b541" strokeWidth="1" />
    <path d="M4.5 8L6.8 10.5L11.5 5.5" stroke="#14b541" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconError = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" stroke="#ef4444" strokeWidth="1" />
    <path d="M5 5L11 11M11 5L5 11" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconWarning = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" stroke="#f59e0b" strokeWidth="1" />
    <path d="M8 4V8M8 11.5V12" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
  </svg>
);

export default function MobileToast({ toast, onClose }) {
  if (!toast) return null;
  const type = toast.type || 'success';
  const Icon = type === 'error' ? IconError : type === 'warning' ? IconWarning : IconSuccess;

  return (
    <div className={`msh-toast ${type}`}>
      <div className="msh-toast-icon"><Icon /></div>
      <div className="msh-toast-text">
        <span className="msh-toast-message">{toast.message}</span>
        {toast.subMessage && <span className="msh-toast-sub">{toast.subMessage}</span>}
      </div>
      {onClose && (
        <button className="msh-toast-close" onClick={onClose}><IconClose /></button>
      )}
    </div>
  );
}
