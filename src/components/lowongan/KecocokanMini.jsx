import { labelFor } from '../../hooks/lowongan/useKecocokanDummy.js';
import '../../../css/lowongan/kecocokan-mini.css';

const TONE = { 'Tinggi': 'great', 'Sedang': 'amber', 'Rendah': 'red' };

// Skor kecocokan CV di pojok kanan atas kartu lowongan (menggantikan tombol simpan).
// Bentuknya versi kecil banner di halaman detail: ubin berwarna dengan angka besar dan tingkat.
// `loading` = perhitungannya sedang berjalan (dimulai dari panel detail). `ghost` = pelamar login tapi lowongan ini belum pernah dicek.
export default function KecocokanMini({ score, ghost = false, loading = false, terkunci = false, onClick }) {
  // Tamu (belum punya profil/CV): kotak skor terkunci dan bisa diklik untuk daftar.
  if (terkunci) {
    return (
      <button type="button" className="kcmini locked" onClick={onClick} title="Daftar untuk Lihat Skor" aria-label="Daftar untuk lihat skor kecocokan">
        <div className="kcmini-n">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        </div>
        <span className="kcmini-pill">Daftar</span>
      </button>
    );
  }
  if (loading) {
    return (
      <div className="kcmini loading" role="status" aria-label="Kecocokan CV sedang dihitung" title="Kecocokan CV sedang dihitung">
        <div className="kcmini-n"><span className="kcmini-spin" aria-hidden="true" /></div>
        <span className="kcmini-pill">Memproses</span>
      </div>
    );
  }
  if (ghost) {
    return (
      <div className="kcmini ghost" role="img" aria-label="Kecocokan CV belum dicek" title="Kecocokan CV belum dicek. Buka lowongan ini untuk melihatnya.">
        <div className="kcmini-n"><b>––</b></div>
        <span className="kcmini-pill">Belum dicek</span>
      </div>
    );
  }
  if (typeof score !== 'number') return null;
  const label = labelFor(score);
  return (
    <div className={`kcmini ${TONE[label]}`} role="img" aria-label={`Kecocokan dengan CV kamu ${score} dari 100, ${label}`} title={`Kecocokan dengan CV kamu: ${score}/100 (${label})`}>
      <div className="kcmini-n"><b>{score}</b><i>/100</i></div>
      <span className="kcmini-pill">{label}</span>
    </div>
  );
}
