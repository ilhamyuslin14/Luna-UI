export default function Toast({ message, subMessage, type = 'success', onClose }) {
  const getIcon = () => {
    if (type === 'error') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" stroke="#ef4444" strokeWidth="1" />
          <path d="M5 5L11 11M11 5L5 11" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'warning') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" stroke="#f59e0b" strokeWidth="1" />
          <path d="M8 4V8M8 11.5V12" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }
    // Default success
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="#14b541" strokeWidth="1" />
        <path d="M4.5 8L6.8 10.5L11.5 5.5" stroke="#14b541" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-text">
        <span className="toast-message">{message}</span>
        {subMessage && <span className="toast-sub">{subMessage}</span>}
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#555f71" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>
      )}
    </div>
  );
}
