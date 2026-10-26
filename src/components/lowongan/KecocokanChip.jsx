import { labelFor } from '../../hooks/lowongan/useKecocokanDummy.js';
import '../../../css/lowongan/kecocokan-chip.css';

const TONE = { 'Tinggi': 'great', 'Sedang': 'amber', 'Rendah': 'red' };

// Tag skor kecocokan CV di kartu daftar lowongan. Hanya ditampilkan untuk lowongan
// yang hasilnya sudah ada; warnanya sama dengan banner di kartu kecocokan.
export default function KecocokanChip({ score, className = '' }) {
  if (typeof score !== 'number') return null;
  const label = labelFor(score);
  return (
    <span className={`kcm-chip ${TONE[label]} ${className}`.trim()} title={`Kecocokan dengan CV kamu: ${score}/100 (${label})`}>
      <i aria-hidden="true" />Kecocokan {score} · {label}
    </span>
  );
}
