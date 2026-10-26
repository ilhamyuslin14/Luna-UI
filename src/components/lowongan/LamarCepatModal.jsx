import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import LamarCepatPanel from './LamarCepatPanel.jsx';
import useLamarProfil from '../../hooks/lowongan/useLamarProfil.js';
import { bukaLamar } from '../../utils/lamarLowongan.js';
import '../../../css/lowongan/lamar-cepat.css';

// Popup "lamar dengan profil" yang dibuka dari tombol Lamar Sekarang (daftar dan panel detail) untuk
// lowongan Luna saat pelamar sudah login. Lewat portal ke <body> supaya tidak terjebak navbar sticky.
export default function LamarCepatModal({ job, onClose }) {
  const lp = useLamarProfil(job.id);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="lcm-overlay" onClick={onClose}>
      <div className="lcm-card" role="dialog" aria-modal="true" aria-label={`Lamar ${job.title}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lcm-close" onClick={onClose} aria-label="Tutup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <LamarCepatPanel
          lp={lp}
          jabatan={job.title}
          onFormBiasa={() => { bukaLamar(job); onClose(); }}
        />
      </div>
    </div>,
    document.body
  );
}
