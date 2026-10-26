import { useEffect } from 'react';
import useKecocokan from '../../hooks/lowongan/useKecocokan.js';
import { STEPS, labelFor } from '../../hooks/lowongan/useKecocokanDummy.js';
import { VARIAN_KECOCOKAN_DEFAULT } from './kecocokanVarian.js';
import '../../../css/lowongan/kecocokan-card.css';

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

const TONE = {
  'Tinggi': 'great',
  'Sedang': 'amber',
  'Rendah': 'red',
};

// Bagian atas kartu hasil: banner berwarna sesuai tingkat, angka putih besar.
function ScoreBanner({ score, onRefresh }) {
  // Label dihitung dari skor, bukan dari cache, supaya hasil lama tidak merusak tampilan.
  const label = labelFor(score);
  return (
    <div className={`kcc-banner ${TONE[label]}`}>
      <span className="kcc-deco a" />
      <span className="kcc-deco b" />
      <div className="kcc-banner-cap">
        <span className="kcc-banner-cap-text"><IconSpark />Kecocokan dengan CV kamu</span>
        {onRefresh && (
          <button type="button" className="kcc-refresh" onClick={onRefresh} title="Hitung ulang kecocokan" aria-label="Hitung ulang kecocokan">
            <IconRefresh />
          </button>
        )}
      </div>
      <div className="kcc-banner-row">
        <div className="kcc-banner-score"><b>{score}</b><span>/100</span></div>
        <span className="kcc-banner-label">{label}</span>
      </div>
    </div>
  );
}

// Kartu "Kecocokan dengan CV kamu" di laman detail lowongan (Luna & eksternal).
// Hasilnya dari edge function hitung-kecocokan (lihat useKecocokan).
export default function KecocokanCard({ jobKey, jobTitle, navigate, varian = VARIAN_KECOCOKAN_DEFAULT, onHasil, tundaOtomatis = 0 }) {
  const { state, step, result, message, retry, generate, regenerate } = useKecocokan({ jobKey, jobTitle, tundaOtomatis });
  const go = (menu) => (navigate ? navigate(menu) : (window.location.href = `/?view=${menu}`));
  const isDone = state === 'done' && result;

  // Kabari halaman induk saat hasil tersedia (mis. untuk tag skor di daftar lowongan).
  useEffect(() => {
    if (isDone && onHasil) onHasil(result.score, result.label);
  }, [isDone, result?.score]);

  return (
    <section className={`kcc-card${isDone ? ' is-done' : ''}`} aria-live="polite">
      {!isDone && (
        <div className="kcc-head">
          <span className="kcc-title"><IconSpark />Kecocokan dengan CV kamu</span>
        </div>
      )}

      {state === 'checking' && (
        <div className="kcc-skel" aria-hidden="true"><span /><span /><span /></div>
      )}

      {state === 'guest' && (
        <div className="kcc-body">
          <p className="kcc-text">Skor kecocokan muncul setelah kamu punya profil dan CV, jadi kamu tahu seberapa cocok sebelum melamar.</p>
          <button type="button" className="kcc-btn" onClick={() => go('pelamar-daftar')}>Daftar untuk Lihat Skor</button>
          <p className="kcc-hint"><button type="button" className="kcc-link" onClick={() => go('pelamar-masuk')}>Sudah punya akun? Masuk</button></p>
        </div>
      )}

      {state === 'no-cv' && (
        <div className="kcc-body">
          <p className="kcc-text">Unggah CV di profil kamu, lalu kami hitung kecocokannya dengan setiap lowongan yang kamu buka.</p>
          <button type="button" className="kcc-btn" onClick={() => go('profil-pelamar_001')}>Unggah CV di profil</button>
        </div>
      )}

      {state === 'ready' && (
        <div className="kcc-body">
          <p className="kcc-text">CV kamu sudah siap dicocokkan dengan lowongan ini. Klik tombol di bawah untuk melihat hasilnya.</p>
          <button type="button" className="kcc-btn" onClick={generate}>Cek kecocokan sekarang</button>
          <p className="kcc-hint">Hasilnya tersimpan, jadi tidak perlu dihitung ulang kalau kamu membuka lowongan ini lagi.</p>
        </div>
      )}

      {state === 'processing' && (
        <div className="kcc-body">
          <div className="kcc-bar"><span style={{ width: `${Math.min(100, ((step + 0.4) / STEPS.length) * 100)}%` }} /></div>
          <ul className="kcc-steps">
            {STEPS.map((label, i) => {
              const status = i < step ? 'done' : i === step ? 'now' : 'wait';
              return (
                <li key={label} className={status}>
                  <span className="kcc-dot">{status === 'done' ? <IconCheck /> : null}</span>
                  {label}{status === 'now' ? '…' : ''}
                </li>
              );
            })}
          </ul>
          <p className="kcc-hint">Biasanya selesai dalam beberapa detik. Kamu bisa lanjut membaca lowongan.</p>
        </div>
      )}

      {state === 'error' && (
        <div className="kcc-body">
          <p className="kcc-text kcc-err">{message || 'Kecocokan belum bisa dihitung sekarang. Coba lagi sebentar lagi.'}</p>
          <button type="button" className="kcc-btn ghost" onClick={retry}>Coba lagi</button>
        </div>
      )}

      {state === 'limit' && (
        <div className="kcc-body">
          <p className="kcc-text">{message || 'Batas pengecekan kecocokan hari ini sudah tercapai. Coba lagi besok.'}</p>
        </div>
      )}

      {isDone && (
        <>
          <ScoreBanner score={result.score} onRefresh={regenerate} />
          {varian === 'lengkap' && (
          <div className="kcc-body kcc-done-body">
            {result.pros.length > 0 && (
            <div className="kcc-group">
              <div className="kcc-group-title pro">Yang sudah cocok</div>
              <ul className="kcc-points pro">
                {result.pros.map(t => <li key={t}><span className="kcc-bullet" />{t}</li>)}
              </ul>
            </div>
            )}
            {result.cons.length > 0 && (
            <div className="kcc-group">
              <div className="kcc-group-title con">Yang bisa dilengkapi</div>
              <ul className="kcc-points con">
                {result.cons.map(t => <li key={t}><span className="kcc-bullet" />{t}</li>)}
              </ul>
            </div>
            )}

            <p className="kcc-hint">Dihitung otomatis oleh Luna dari CV dan deskripsi lowongan. Bukan penentu keputusan perekrut.</p>
          </div>
          )}
        </>
      )}
    </section>
  );
}
