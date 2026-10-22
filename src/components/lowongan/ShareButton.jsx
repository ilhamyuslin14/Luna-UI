import { useState } from 'react';
import '../../../css/lowongan/lowongan-perusahaan_001.css';
import '../../../css/lowongan/lowongan_001.css';

// Tombol + menu "Bagikan" di navbar desktop (gaya sama dengan laman karir Luna).
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconShare = () => (<svg width="14" height="14" viewBox="0 0 24 24" {...stroke} strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconLink = () => (<svg viewBox="0 0 24 24" {...stroke} strokeWidth="2"><path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const IconWhatsApp = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" /></svg>);
const IconLinkedIn = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="7.5" y1="10.5" x2="7.5" y2="16.5" /><circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" /><path d="M11 16.5v-3.7a2.3 2.3 0 0 1 4.5 0v3.7" /><line x1="11" y1="10.5" x2="11" y2="16.5" /></svg>);
const IconInstagram = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></svg>);
const IconFacebook = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M14 8.5h-1.3c-.9 0-1.7.7-1.7 1.7V12h3l-.4 2.5h-2.6V19" /></svg>);
const IconX = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" /></svg>);
const IconTelegram = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...stroke}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);

const SHARE_PLATFORMS = [
  { key: 'wa', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

export default function ShareButton({ onShare, copied }) {
  const [open, setOpen] = useState(false);
  const done = () => setOpen(false);

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        className={`lpr-btn-share${open ? ' active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Bagikan Laman Karir"
      >
        <IconShare />
        <span>Bagikan</span>
      </button>

      {open && (
        <div className="lw001-share-menu" style={{ right: 0, top: 'calc(100% + 8px)', zIndex: 100 }}>
          <div className="lw001-share-eyebrow">BAGIKAN LAMAN KARIR</div>
          <div className="lw001-share-linkcard">
            <span className="lw001-share-linkcard-url">{window.location.href}</span>
            <button type="button" className="lw001-share-linkcard-copy" onClick={() => onShare('copy', done)}>
              <IconLink />
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <div className="lw001-share-divider" />
          <div className="lw001-share-grid">
            {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
              <button key={key} type="button" className="lw001-share-gridbtn" onClick={() => onShare(key, done)}>
                <span className="lw001-share-gridbtn-icon"><Icon /></span>
                <span className="lw001-share-gridbtn-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
