import { useState } from 'react';
import LamarCepatPanel from './LamarCepatPanel.jsx';
import useLamarProfil from '../../hooks/lowongan/useLamarProfil.js';

// Di halaman detail lowongan Luna: pelamar yang login dan punya CV di profil melihat kartu "lamar cepat"
// (ringkasan data + satu tombol) sebagai pengganti form. Yang sudah melamar melihat keterangan itu. Selain
// itu (tamu, belum punya CV, gagal mengecek) tetap form lamaran biasa, `children`. "Isi form sendiri" di kartu
// menampilkan form biasa.
export default function LamarCepatKartu({ seleksiId, jabatan, variant = 'kartu', children }) {
  const lp = useLamarProfil(seleksiId);
  const [pakaiForm, setPakaiForm] = useState(false);

  const tampilPanel = !pakaiForm && ['memuat', 'siap', 'sudah'].includes(lp.status);
  if (!tampilPanel) return children;

  return (
    <div className={variant === 'sheet' ? 'lcp-sheet' : 'lk-apply-card'}>
      <LamarCepatPanel lp={lp} jabatan={jabatan} onFormBiasa={() => setPakaiForm(true)} />
    </div>
  );
}
