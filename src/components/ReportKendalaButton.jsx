import { useState, useRef, useEffect } from 'react';
import useReportKendala from '../hooks/useReportKendala.js';
import '../../css/shared/report-kendala-button.css';

const IconAlertTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="11" y2="11" />
    <line x1="11" y1="1" x2="1" y2="11" />
  </svg>
);

// Trigger inline "Laporkan Kendala" — dipasang HANYA di layar pembuatan
// lowongan (form & wizard AI), bukan lagi tombol mengambang global. `halaman`
// dipakai sebagai label konteks di laporan (mis. 'buat-lowongan-form').
export default function ReportKendalaButton({ halaman }) {
  const { lastError, note, setNote, submitting, sent, handleSubmit } = useReportKendala(halaman);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div className="rkb-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`rkb-trigger${lastError ? ' alert' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <IconAlertTriangle />
        <span>Laporkan Kendala</span>
        {lastError && <span className="rkb-dot" />}
      </button>

      {open && (
        <div className="rkb-panel">
          <div className="rkb-panel-head">
            <span>Laporkan Kendala</span>
            <button className="rkb-panel-close" onClick={() => setOpen(false)}><IconClose /></button>
          </div>
          {sent ? (
            <div className="rkb-sent">Terima kasih, laporan sudah terkirim.</div>
          ) : (
            <>
              {lastError && (
                <div className="rkb-context">
                  Halaman: {halaman} &middot; Error: {lastError.pesan}
                </div>
              )}
              {!lastError && (
                <p className="rkb-hint">Belum ada error yang tercatat baru-baru ini. Ceritakan kendala yang kamu alami:</p>
              )}
              <textarea
                className="rkb-textarea"
                placeholder="Ceritakan kejadiannya (opsional)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="rkb-submit"
                disabled={submitting}
                onClick={() => handleSubmit(() => setOpen(false))}
              >
                {submitting ? 'Mengirim…' : 'Kirim Laporan'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
