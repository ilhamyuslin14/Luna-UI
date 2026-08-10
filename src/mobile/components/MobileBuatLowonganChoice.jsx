import { createPortal } from 'react-dom';

const IconPanduan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const IconForm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);

export default function MobileBuatLowonganChoice({ open, onClose, onPilihPanduan, onPilihForm }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="mblp-head">
          <h2>Bagaimana Anda ingin membuat lowongan?</h2>
          <p>Dipandu lewat obrolan singkat, atau isi sendiri lewat form lengkap.</p>
        </div>
        <button className="mblp-row primary" onClick={onPilihPanduan}>
          <span className="mblp-row-flag">Baru</span>
          <span className="mblp-row-icon"><IconPanduan /></span>
          <span className="mblp-row-body">
            <span className="mblp-row-title">Buat dengan Bantuan Luna</span>
            <span className="mblp-row-desc">Susun deskripsi lewat tanya-jawab singkat</span>
          </span>
          <span className="mblp-row-chevron"><IconChevron /></span>
        </button>
        <button className="mblp-row" onClick={onPilihForm}>
          <span className="mblp-row-icon"><IconForm /></span>
          <span className="mblp-row-body">
            <span className="mblp-row-title">Buat dengan Form</span>
            <span className="mblp-row-desc">Isi form lengkap secara manual</span>
          </span>
          <span className="mblp-row-chevron"><IconChevron /></span>
        </button>
        <button className="mblp-cancel" onClick={onClose}>Batal</button>
      </div>
    </>,
    document.body
  );
}
