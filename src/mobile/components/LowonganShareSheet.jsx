import { createPortal } from 'react-dom';
import '../../../css/mobile/lowongan/laman-karir.css';

// Bottom sheet "Bagikan" untuk laman lowongan mobile (padanan ShareButton desktop).
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);
const IconFacebook = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const IconX = () => (<svg viewBox="0 0 24 24" {...stroke}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconTelegram = () => (<svg viewBox="0 0 24 24" {...stroke}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);

const SHARE_PLATFORMS = [
  { key: 'wa', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

export default function LowonganShareSheet({ open, onClose, onShare, pageUrl }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="lk-sheet-title" style={{ marginBottom: 14 }}>Bagikan Laman</div>
        <div className="lk-search" style={{ marginLeft: 0, marginRight: 0, marginBottom: 14 }}>
          <span style={{ flex: 1, fontSize: 11, color: 'var(--luna-ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageUrl}</span>
          <button className="lk-job-card-btn" onClick={() => onShare('copy')}>Salin</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => onShare(key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'var(--luna-ink-050)', border: 'none', borderRadius: 12, padding: '12px 6px', fontFamily: 'inherit' }}>
              <span className="lk-share-grid-icon" style={{ color: 'var(--luna-ink-700)' }}><Icon /></span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--luna-ink-600)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
