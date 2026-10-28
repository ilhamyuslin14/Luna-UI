import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DOKUMEN_LEGAL, TERAKHIR_DIPERBARUI } from '../../data/dokumenLegal.js';
import { EVENT_BUKA_LEGAL } from '../../utils/bukaLegal.js';
import '../../../css/legal/legal-modal.css';

// Pop up kecil berisi Syarat & Ketentuan atau Kebijakan Privasi. Dibuka lewat bukaLegal() (utils/bukaLegal.js).
// Kalau pemanggil memberi `persetujuan`, kaki pop up berisi kotak ceklis yang tersinkron dengan kotak di formulirnya.
export default function LegalModalHost() {
  const [dokumen, setDokumen] = useState(null);
  const [persetujuan, setPersetujuan] = useState(null); // { setuju, onUbah } dari pemanggil
  const [setuju, setSetuju] = useState(false);

  useEffect(() => {
    const buka = (e) => {
      const { dokumen: d, persetujuan: p } = e.detail || {};
      setDokumen(d in DOKUMEN_LEGAL ? d : 'syarat');
      setPersetujuan(p || null);
      setSetuju(!!p?.setuju);
    };
    window.addEventListener(EVENT_BUKA_LEGAL, buka);
    return () => window.removeEventListener(EVENT_BUKA_LEGAL, buka);
  }, []);

  useEffect(() => {
    if (!dokumen) return undefined;
    const tutupDenganEsc = (e) => { if (e.key === 'Escape') setDokumen(null); };
    window.addEventListener('keydown', tutupDenganEsc);
    return () => window.removeEventListener('keydown', tutupDenganEsc);
  }, [dokumen]);

  if (!dokumen) return null;
  const doc = DOKUMEN_LEGAL[dokumen];
  const tutup = () => setDokumen(null);
  const ubahSetuju = (nilai) => { setSetuju(nilai); persetujuan?.onUbah?.(nilai); };

  return createPortal(
    <div className="lgm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) tutup(); }}>
      <div className="lgm-card" role="dialog" aria-modal="true" aria-label={doc.judul}>
        <div className="lgm-head">
          <div className="lgm-tabs">
            {Object.entries(DOKUMEN_LEGAL).map(([kunci, d]) => (
              <button key={kunci} type="button" className={`lgm-tab${kunci === dokumen ? ' on' : ''}`} onClick={() => setDokumen(kunci)}>
                {d.judul}
              </button>
            ))}
          </div>
          <button type="button" className="lgm-x" onClick={tutup} aria-label="Tutup">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="lgm-body">
          <p className="lgm-meta">Terakhir diperbarui {TERAKHIR_DIPERBARUI}</p>
          {doc.bagian.map((b) => (
            <section key={b.judul}>
              <h3>{b.judul}</h3>
              {b.isi.map((x, j) => (typeof x === 'string'
                ? <p key={j}>{x}</p>
                : <ul key={j}>{x.daftar.map((t) => <li key={t}>{t}</li>)}</ul>
              ))}
            </section>
          ))}
        </div>

        <div className="lgm-foot">
          {persetujuan && (
            <label className={`lgm-consent${setuju ? ' on' : ''}`}>
              <input type="checkbox" className="lgm-cb" checked={setuju} onChange={(e) => ubahSetuju(e.target.checked)} />
              <span>Saya telah membaca dan menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi Luna.</span>
            </label>
          )}
          <div className="lgm-foot-row">
            <button type="button" className="lgm-tutup" onClick={tutup}>Tutup</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
