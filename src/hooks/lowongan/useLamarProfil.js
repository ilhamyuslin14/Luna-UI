import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPelamarResume } from '../../services/pelamarResumeService.js';
import { sudahMelamar } from '../../services/lamarProfilService.js';

// Status "bisa lamar cepat?" untuk satu lowongan Luna, dari sisi pelamar yang login:
//  'tamu'     belum login sebagai pelamar (pakai form biasa)
//  'memuat'   sedang dicek
//  'sudah'    sudah pernah melamar ke lowongan ini
//  'tanpa-cv' belum punya CV yang selesai diproses di profil
//  'siap'     bisa lamar cepat dengan data profil
//  'galat'    gagal mengecek (pakai form biasa)
export default function useLamarProfil(seleksiId) {
  const { user, isPelamar } = useAuth() || {};
  const [state, setState] = useState({ status: 'memuat', resume: null });

  useEffect(() => {
    if (!seleksiId) { setState({ status: 'tamu', resume: null }); return undefined; }
    if (!isPelamar || !user?.id) { setState({ status: 'tamu', resume: null }); return undefined; }
    let aktif = true;
    setState({ status: 'memuat', resume: null });
    (async () => {
      try {
        const [sudah, resume] = await Promise.all([sudahMelamar(seleksiId), getPelamarResume(user.id)]);
        if (!aktif) return;
        if (sudah) setState({ status: 'sudah', resume });
        else if (!resume || resume.parsing_status !== 'completed') setState({ status: 'tanpa-cv', resume });
        else setState({ status: 'siap', resume });
      } catch (err) {
        console.error('Gagal mengecek status lamaran cepat:', err);
        if (aktif) setState({ status: 'galat', resume: null });
      }
    })();
    return () => { aktif = false; };
  }, [seleksiId, isPelamar, user?.id]);

  const tandaiSudah = () => setState((s) => ({ ...s, status: 'sudah' }));
  return { ...state, tandaiSudah, seleksiId };
}
