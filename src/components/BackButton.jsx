export default function BackButton({ onClick, label = 'Kembali', variant = 'default' }) {
  return (
    <button className={`back-btn back-btn--${variant}`} onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label}
    </button>
  );
}
