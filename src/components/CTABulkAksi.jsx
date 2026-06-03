export default function CTABulkAksi({ count, isOpen, onToggle, actions }) {
  return (
    <div className="bulk-aksi-container">
      <button
        className={`bulk-aksi-btn${isOpen ? ' active' : ''}`}
        onClick={onToggle}
      >
        <span className="bulk-aksi-badge">{count}</span>
        Pilih Aksi
        <svg className="bulk-aksi-chevron" width="8" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="bulk-aksi-dropdown">
          {actions.map((action, i) =>
            action.type === 'divider'
              ? <div key={i} className="bulk-aksi-divider" />
              : (
                <button key={i} className="bulk-aksi-item" onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </button>
              )
          )}
        </div>
      )}
    </div>
  );
}
