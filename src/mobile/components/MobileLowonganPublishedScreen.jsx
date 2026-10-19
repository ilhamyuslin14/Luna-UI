import { useState } from 'react';

// Layar "Lowongan kamu sudah tayang" versi mobile — dipakai bareng oleh jalur
// Bantuan Luna (MobileBuatLowonganQA.jsx) dan jalur Form (MobileBuatLowonganForm.jsx)
// supaya kedua jalur berujung ke pengalaman publish yang sama. Konten "Channel
// Lain" dirender lewat .msh-sheet generik dari shell.css (bukan komponen
// baru), konsisten dengan bottom sheet lain di app.
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
);
const IconWhatsappGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35z" /><path d="M12 2a10 10 0 0 0-8.56 15.14L2 22l4.98-1.4A10 10 0 1 0 12 2zm0 18.2a8.17 8.17 0 0 1-4.17-1.14l-.3-.18-3.1.87.83-3.03-.2-.31A8.2 8.2 0 1 1 12 20.2z" /></svg>
);
const IconTelegramGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);
const IconFacebookGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const IconXGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);

/**
 * @param {string} jobTitle
 * @param {string} publishedUrl
 * @param {string[]} chips
 * @param {() => void} onLihatLowongan
 * @param {() => void} onMulaiSebar
 * @param {(message: string, sub?: string) => void} showToast
 * @param {boolean} [withConfetti] - render confetti di atas (step pertama kali publish)
 */
export default function MobileLowonganPublishedScreen({
  jobTitle, publishedUrl, onLihatLowongan, onMulaiSebar, showToast,
}) {
  const [copied, setCopied] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      showToast('Tautan disalin');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Gagal menyalin', 'Coba salin manual dari kotak tautan');
    }
  };

  const shareText = `Kami sedang membuka lowongan ${jobTitle || 'baru'}. Yuk lamar sekarang:`;
  const shareToLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publishedUrl)}`, '_blank', 'noopener');
    showToast('Membuka LinkedIn');
  };
  const shareToChannel = (channel) => {
    setShareSheetOpen(false);
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${publishedUrl}`)}`, '_blank', 'noopener');
      showToast('Membuka WhatsApp');
    } else if (channel === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(publishedUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
      showToast('Membuka Telegram');
    } else if (channel === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedUrl)}`, '_blank', 'noopener');
      showToast('Membuka Facebook');
    } else if (channel === 'x') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(publishedUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
      showToast('Membuka X');
    } else if (channel === 'copy') {
      copyLink();
    }
  };

  return (
    <>
      <div className="mblw-pub-body">
        <div className="mblw-pub-badge-row">
          <div className="mblw-pub-icon"><IconCheck /></div>
          <div>
            <div className="mblw-pub-title">Lowongan kamu sudah tayang</div>
            <p className="mblw-pub-sub">{jobTitle} sekarang bisa dilamar siapa saja.</p>
          </div>
        </div>

        <div className="mblw-pub-stats">
          <div><span className="mblw-pub-stat-val">0</span><span className="mblw-pub-stat-label">DILIHAT</span></div>
          <div><span className="mblw-pub-stat-val">0</span><span className="mblw-pub-stat-label">PELAMAR</span></div>
        </div>

        <p className="mblw-pub-flow-copy">Sebarkan supaya mulai dapat kandidat. LinkedIn paling pas buat posisi seperti ini.</p>

        <div className="mblw-pub-share-col">
          <button className="mblw-pub-share-primary" onClick={shareToLinkedin}><IconLinkedin />Bagikan ke LinkedIn</button>
          <button className="mblw-pub-share-more" onClick={() => setShareSheetOpen(true)}>
            Channel Lain<IconChevronDown />
          </button>
        </div>

        <div className="mblw-pub-mini-browser">
          <div className="mblw-pub-mini-bar">
            <span className="mblw-pub-mini-dot" /><span className="mblw-pub-mini-dot" /><span className="mblw-pub-mini-dot" />
            <span className="mblw-pub-mini-url">{publishedUrl.replace(/^https?:\/\//, '')}</span>
          </div>
          <div className="mblw-pub-mini-row">
            <div className="mblw-pub-mini-ic"><IconCheck /></div>
            <div>
              <div className="mblw-pub-mini-t">Halaman karier sudah tayang</div>
              <div className="mblw-pub-mini-d">1 lowongan aktif</div>
            </div>
          </div>
        </div>

        <button className="mblw-pub-reach-link" onClick={onMulaiSebar}>Butuh jangkauan lebih luas? Buka menu Sebar</button>
      </div>
      <div className="mblw-sum-footer">
        <button className="mblw-pub-view-btn" onClick={onLihatLowongan}>Lihat Lowongan</button>
      </div>

      <div className={`msh-sheet-overlay${shareSheetOpen ? ' open' : ''}`} onClick={() => setShareSheetOpen(false)} />
      <div className={`msh-sheet${shareSheetOpen ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="mblw-pub-sheet-title">Channel Lain</div>
        <button className="msh-sheet-item" onClick={() => shareToChannel('whatsapp')}>
          <span className="mblw-pub-share-item-ic" style={{ background: '#25D36614', color: '#25D366' }}><IconWhatsappGlyph /></span>
          Bagikan ke WhatsApp
        </button>
        <button className="msh-sheet-item" onClick={() => shareToChannel('telegram')}>
          <span className="mblw-pub-share-item-ic" style={{ background: '#2AABEE14', color: '#2AABEE' }}><IconTelegramGlyph /></span>
          Bagikan ke Telegram
        </button>
        <button className="msh-sheet-item" onClick={() => shareToChannel('facebook')}>
          <span className="mblw-pub-share-item-ic" style={{ background: '#1877F214', color: '#1877F2' }}><IconFacebookGlyph /></span>
          Bagikan ke Facebook
        </button>
        <button className="msh-sheet-item" onClick={() => shareToChannel('x')}>
          <span className="mblw-pub-share-item-ic" style={{ background: 'var(--luna-ink-050)', color: 'var(--luna-ink-900)' }}><IconXGlyph /></span>
          Bagikan ke X
        </button>
        <div className="mblw-pub-sheet-sep" />
        <button className="msh-sheet-item" onClick={() => shareToChannel('copy')}>
          <span className="mblw-pub-share-item-ic" style={{ background: 'var(--luna-ink-050)', color: 'var(--luna-ink-700)' }}>{copied ? <IconCheck /> : <IconCopy />}</span>
          {copied ? 'Tersalin' : 'Salin Tautan'}
        </button>
      </div>
    </>
  );
}
