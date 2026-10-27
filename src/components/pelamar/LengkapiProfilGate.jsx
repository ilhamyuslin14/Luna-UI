import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPelamarResume, uploadAndParseResume } from '../../services/pelamarResumeService.js';
import { prefDariBaris } from '../../data/preferensiKerja.js';
import LengkapiProfilModal from './LengkapiProfilModal.jsx';

// Pelamar yang belum punya CV atau preferensi kerja (posisi, lokasi, gaji) selalu dihadang modal
// "Lengkapi profil" di halaman mana pun. Status dibaca dari database (bukan dari sesi), jadi menutup
// tab di tengah jalan tidak membuatnya lolos: modal muncul lagi di login berikutnya.
// Layar daftar, masuk, OTP, dan mockup dikecualikan.
const TANPA_MODAL = ['pelamar-masuk', 'pelamar-daftar', 'pelamar-verifikasi-otp', 'pelamar-onboarding', 'mockup'];
const bacaView = () => new URLSearchParams(window.location.search).get('view') || '';

export default function LengkapiProfilGate() {
  const { user, companyId, isPelamar, pelamarProfile, simpanPreferensi } = useAuth() || {};
  const [view, setView] = useState(bacaView);
  const [punyaCv, setPunyaCv] = useState(null); // null = belum diketahui
  const [namaCv, setNamaCv] = useState('');
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    const sinkron = () => setView(bacaView());
    window.addEventListener('luna:navigate', sinkron);
    window.addEventListener('popstate', sinkron);
    return () => { window.removeEventListener('luna:navigate', sinkron); window.removeEventListener('popstate', sinkron); };
  }, []);

  const adalahPelamar = !!user?.id && isPelamar && !companyId;

  useEffect(() => {
    setSelesai(false);
    if (!adalahPelamar) { setPunyaCv(null); return undefined; }
    let aktif = true;
    getPelamarResume(user.id)
      .then((row) => { if (aktif) { setPunyaCv(!!row); setNamaCv(row?.file_name || ''); } })
      .catch(() => { if (aktif) setPunyaCv(true); }); // gagal baca: jangan mengunci pelamar karena gangguan jaringan
    return () => { aktif = false; };
  }, [adalahPelamar, user?.id]);

  if (!adalahPelamar || punyaCv === null || selesai || TANPA_MODAL.includes(view)) return null;

  const pref = prefDariBaris(pelamarProfile);
  const prefLengkap = pref.posisi.length > 0 && pref.lokasi.length > 0 && (pref.gajiMin || 0) > 0;
  if (punyaCv && prefLengkap) return null;

  return (
    <LengkapiProfilModal
      nama={(pelamarProfile?.nama_lengkap || '').trim().split(/\s+/)[0] || undefined}
      namaCv={namaCv}
      stageAwal={punyaCv ? 'posisi' : 'cv'}
      unggahCv={(file, onProgress) => uploadAndParseResume(user.id, file, onProgress)}
      simpan={(jawaban) => simpanPreferensi(jawaban)}
      onSelesai={() => {
        setSelesai(true);
        // Profil Saya membaca CV dan preferensi saat dibuka; beri tahu supaya langsung memuat ulang.
        window.dispatchEvent(new Event('luna:profil-diperbarui'));
      }}
    />
  );
}
