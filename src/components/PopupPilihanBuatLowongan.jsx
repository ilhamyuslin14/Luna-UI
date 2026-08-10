const IconPanduan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const IconForm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

export default function PopupPilihanBuatLowongan({ onClose, onPilihPanduan, onPilihForm }) {
  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="blp-modal" onClick={e => e.stopPropagation()}>
        <div className="blp-head">
          <h2>Bagaimana Anda ingin membuat lowongan?</h2>
          <p>Pilih cara yang paling nyaman — dipandu lewat obrolan singkat, atau isi sendiri lewat form lengkap.</p>
        </div>
        <div className="blp-grid">
          <button className="blp-card primary" onClick={onPilihPanduan}>
            <span className="blp-flag">Baru</span>
            <span className="blp-icon"><IconPanduan /></span>
            <span className="blp-title">Buat dengan Bantuan Luna</span>
            <span className="blp-desc">Jawab beberapa pertanyaan singkat untuk menyusun deskripsi &amp; kualifikasi pekerjaan yang lengkap dan rapi.</span>
          </button>
          <button className="blp-card" onClick={onPilihForm}>
            <span className="blp-icon"><IconForm /></span>
            <span className="blp-title">Buat dengan Form</span>
            <span className="blp-desc">Isi form lengkap secara manual — cocok kalau Anda sudah tahu persis detail lowongannya.</span>
          </button>
        </div>
        <button className="blp-cancel" onClick={onClose}>Batal</button>
      </div>
    </div>
  );
}
