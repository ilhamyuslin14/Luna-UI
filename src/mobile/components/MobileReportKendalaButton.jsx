import { useState } from 'react';
import { createPortal } from 'react-dom';
import useReportKendala from '../../hooks/useReportKendala.js';
import '../../../css/mobile/report-kendala-button.css';

const IconAlertTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Versi mobile ReportKendalaButton — dipasang di layar buat lowongan (form
// & wizard AI). `variant="icon"` (default) dipakai di header (ikon kecil,
// ruang sempit); `variant="bar"` dipakai di wizard AI, bar penuh di atas
// tombol Lanjut supaya lebih kelihatan dibanding ikon kecil.
export default function MobileReportKendalaButton({ halaman, variant = 'icon' }) {
  const { lastError, note, setNote, submitting, sent, handleSubmit } = useReportKendala(halaman);
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'bar' ? (
        <button
          type="button"
          className={`mrkb-bar${lastError ? ' alert' : ''}`}
          onClick={() => setOpen(true)}
        >
          <IconAlertTriangle />
          <span>Laporkan Kendala</span>
          {lastError && <span className="mrkb-dot" />}
        </button>
      ) : (
        <button
          type="button"
          className={`mrkb-trigger${lastError ? ' alert' : ''}`}
          onClick={() => setOpen(true)}
        >
          <IconAlertTriangle />
          {lastError && <span className="mrkb-dot" />}
        </button>
      )}

      {createPortal(
        <>
          <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
          <div className={`msh-sheet${open ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mrkb-sheet-title">Laporkan Kendala</div>
            {sent ? (
              <div className="mrkb-sent">Terima kasih, laporan sudah terkirim.</div>
            ) : (
              <>
                {lastError && (
                  <div className="mrkb-context">
                    Halaman: {halaman} &middot; Error: {lastError.pesan}
                  </div>
                )}
                {!lastError && (
                  <p className="mrkb-hint">Belum ada error yang tercatat baru-baru ini. Ceritakan kendala yang kamu alami:</p>
                )}
                <textarea
                  className="mrkb-textarea"
                  placeholder="Ceritakan kejadiannya (opsional)…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  className="mrkb-submit"
                  disabled={submitting}
                  onClick={() => handleSubmit(() => setOpen(false))}
                >
                  {submitting ? 'Mengirim…' : 'Kirim Laporan'}
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
