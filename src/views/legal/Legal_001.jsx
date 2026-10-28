import { useEffect } from 'react';
import { DOKUMEN_LEGAL, TERAKHIR_DIPERBARUI } from '../../data/dokumenLegal.js';
import '../../../css/legal/legal.css';

// Halaman publik Syarat & Ketentuan dan Kebijakan Privasi (tanpa login). `dokumen` = 'syarat' | 'privasi'.
const RUTE = { syarat: 'syarat-ketentuan', privasi: 'kebijakan-privasi' };

export default function Legal_001({ dokumen = 'syarat', navigate }) {
  const doc = DOKUMEN_LEGAL[dokumen] || DOKUMEN_LEGAL.syarat;

  useEffect(() => {
    const lama = document.title;
    document.title = `${doc.judul} · Luna`;
    window.scrollTo(0, 0);
    return () => { document.title = lama; };
  }, [doc.judul]);

  const keBeranda = () => navigate?.('landingpage-pelamar');

  return (
    <div className="lg-page">
      <header className="lg-top">
        <div className="lg-top-in">
          <button type="button" className="lg-brand" onClick={keBeranda} aria-label="Ke beranda Luna">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          </button>
          <button type="button" className="lg-back" onClick={keBeranda}>← Kembali ke Luna</button>
        </div>
      </header>

      <main className="lg-main">
        <nav className="lg-tabs" aria-label="Dokumen">
          {Object.entries(DOKUMEN_LEGAL).map(([kunci, d]) => (
            <button
              key={kunci}
              type="button"
              className={`lg-tab${kunci === dokumen ? ' on' : ''}`}
              aria-current={kunci === dokumen ? 'page' : undefined}
              onClick={() => navigate?.(RUTE[kunci], {}, { replace: true })}
            >
              {d.judul}
            </button>
          ))}
        </nav>

        <article className="lg-doc">
          <h1>{doc.judul}</h1>
          <p className="lg-meta">Terakhir diperbarui {TERAKHIR_DIPERBARUI}</p>
          <p className="lg-lead">{doc.ringkas}</p>

          {doc.bagian.map((b, i) => (
            <section key={b.judul} className="lg-sec">
              <h2><span>{i + 1}.</span> {b.judul}</h2>
              {b.isi.map((x, j) => (typeof x === 'string'
                ? <p key={j}>{x}</p>
                : <ul key={j}>{x.daftar.map((t) => <li key={t}>{t}</li>)}</ul>
              ))}
            </section>
          ))}
        </article>
      </main>

      <footer className="lg-foot">© 2026 Luna. Seluruh hak cipta dilindungi.</footer>
    </div>
  );
}
