import { useEffect, useState } from 'react';
import { STEPS, labelFor } from '../../hooks/lowongan/useKecocokanDummy.js';
import { useMockSession } from '../MockSession.jsx';
import '../../../css/lowongan/kecocokan-card.css';

// Kartu "Kecocokan dengan CV kamu" versi mockup: tanpa edge function dan tanpa Supabase.
// Lowongan yang sudah punya skor langsung menampilkan banner; yang belum menampilkan tombol
// "Cek kecocokan sekarang", lalu animasi langkah-langkah, lalu skor muncul (lihat MockSession.mulaiCek).
// Class kcc-* sama dengan KecocokanCard asli.
const IconSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);

const TONE = { 'Tinggi': 'great', 'Sedang': 'amber', 'Rendah': 'red', 'Tidak Sesuai': 'gray' };

export default function KecocokanCardMock({ jobKey }) {
  const { skor, proses, mulaiCek, DURASI_CEK_MS } = useMockSession();
  const score = skor[jobKey];
  const mulai = proses[jobKey];
  const memproses = mulai != null;

  // Langkah animasi dihitung dari waktu mulai (bukan dari state lokal), jadi kalau panel ditutup lalu
  // dibuka lagi saat proses masih berjalan, animasinya tetap lanjut dari posisi yang benar.
  const [, tik] = useState(0);
  useEffect(() => {
    if (!memproses) return undefined;
    const id = setInterval(() => tik(n => n + 1), 200);
    return () => clearInterval(id);
  }, [memproses]);
  const step = memproses ? Math.min(STEPS.length - 1, Math.floor(((Date.now() - mulai) / DURASI_CEK_MS) * STEPS.length)) : 0;

  const selesai = score != null && !memproses;
  const label = selesai ? labelFor(score) : null;

  return (
    <section className={`kcc-card${selesai ? ' is-done' : ''}`} aria-live="polite">
      {!selesai && (
        <div className="kcc-head">
          <span className="kcc-title"><IconSpark />Kecocokan dengan CV kamu</span>
        </div>
      )}

      {!selesai && !memproses && (
        <div className="kcc-body">
          <p className="kcc-text">CV kamu sudah siap dicocokkan dengan lowongan ini. Klik tombol di bawah untuk melihat hasilnya.</p>
          <button type="button" className="kcc-btn" onClick={() => mulaiCek(jobKey)}>Cek kecocokan sekarang</button>
          <p className="kcc-hint">Hasilnya tersimpan, jadi tidak perlu dihitung ulang kalau kamu membuka lowongan ini lagi.</p>
        </div>
      )}

      {memproses && (
        <div className="kcc-body">
          <div className="kcc-bar"><span style={{ width: `${Math.min(100, ((step + 0.4) / STEPS.length) * 100)}%` }} /></div>
          <ul className="kcc-steps">
            {STEPS.map((nama, i) => {
              const status = i < step ? 'done' : i === step ? 'now' : 'wait';
              return (
                <li key={nama} className={status}>
                  <span className="kcc-dot">{status === 'done' ? <IconCheck /> : null}</span>
                  {nama}{status === 'now' ? '…' : ''}
                </li>
              );
            })}
          </ul>
          <p className="kcc-hint">Biasanya selesai dalam beberapa detik. Kamu bisa lanjut membaca lowongan.</p>
        </div>
      )}

      {selesai && (
        <div className={`kcc-banner ${TONE[label]}`}>
          <span className="kcc-deco a" />
          <span className="kcc-deco b" />
          <div className="kcc-banner-cap">
            <span className="kcc-banner-cap-text"><IconSpark />Kecocokan dengan CV kamu</span>
            <button type="button" className="kcc-refresh" onClick={() => mulaiCek(jobKey)} title="Hitung ulang kecocokan" aria-label="Hitung ulang kecocokan">
              <IconRefresh />
            </button>
          </div>
          <div className="kcc-banner-row">
            <div className="kcc-banner-score"><b>{score}</b><span>/100</span></div>
            <span className="kcc-banner-label">{label}</span>
          </div>
        </div>
      )}
    </section>
  );
}
