import { labelFor } from '../../hooks/lowongan/useKecocokanDummy.js';
import '../../../css/lowongan/kecocokan-mini.css';

const TONE = { 'Tinggi': 'great', 'Sedang': 'amber', 'Rendah': 'red' };

// Skor kecocokan CV di pojok kanan atas kartu lowongan (menggantikan tombol simpan).
// Bentuknya versi kecil banner di halaman detail: ubin berwarna dengan angka besar dan tingkat.
// `loading` = perhitungannya sedang berjalan (dimulai dari panel detail). `ghost` = pelamar login tapi lowongan ini belum pernah dicek.
export default function KecocokanMini({ score, ghost = false, loading = false }) {
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
