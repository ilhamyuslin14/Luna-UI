import { useState, useEffect, useCallback } from 'react';
import useIsMobile from '../hooks/useIsMobile.js';
import { MockSessionProvider } from './MockSession.jsx';
import PelamarMasukMock from './views/PelamarMasukMock.jsx';
import PelamarDaftarMock from './views/PelamarDaftarMock.jsx';
import PelamarVerifikasiOtpMock from './views/PelamarVerifikasiOtpMock.jsx';
import PelamarOnboardingMock from './views/PelamarOnboardingMock.jsx';
import SemuaLowonganMock from './views/SemuaLowonganMock.jsx';
import SemuaLowonganMobileMock from './views/SemuaLowonganMobileMock.jsx';
import ProfilMock from './views/ProfilMock.jsx';

// Mockup alur pelamar untuk presentasi, dibuka lewat /?view=mockup. Berdiri sendiri: layar-layar di
// folder ini adalah salinan layar asli yang datanya dummy dan tombolnya hanya berpindah layar, tanpa
// Supabase, tanpa login sungguhan. Alur: Masuk -> Daftar -> OTP -> Onboarding -> Semua Lowongan <-> Profil Saya.
//
// Layar asli memanggil navigate('nama-menu-asli'); tabel di bawah menerjemahkannya ke layar mockup
// supaya salinannya tidak perlu diubah banyak. Menu di luar tabel (mis. Lamaran Saya, Untuk
// Perusahaan) sengaja diabaikan.
const LAYAR = {
  'pelamar-masuk': 'masuk',
  'pelamar-daftar': 'daftar',
  'pelamar-verifikasi-otp': 'otp',
  'pelamar-onboarding': 'onboarding',
  'semua-lowongan_002': 'lowongan',
  'profil-pelamar_001': 'profil',
};

const bacaLayarAwal = () => {
  const dariUrl = new URLSearchParams(window.location.search).get('screen');
  return Object.values(LAYAR).includes(dariUrl) ? dariUrl : 'masuk';
};

function Isi() {
  const isMobile = useIsMobile();
  const [layar, setLayar] = useState(bacaLayarAwal);

  // Tautkan layar ke ?screen= (tanpa menambah riwayat) supaya memuat ulang tetap di layar yang sama.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'mockup');
    url.searchParams.set('screen', layar);
    window.history.replaceState(window.history.state, '', url);
    window.scrollTo({ top: 0 });
  }, [layar]);

  const navigate = useCallback((menu) => {
    const tujuan = LAYAR[menu];
    if (tujuan) setLayar(tujuan);
  }, []);

  switch (layar) {
    case 'daftar': return <PelamarDaftarMock navigate={navigate} />;
    case 'otp': return <PelamarVerifikasiOtpMock navigate={navigate} />;
    case 'onboarding': return <PelamarOnboardingMock navigate={navigate} />;
    case 'lowongan': return isMobile ? <SemuaLowonganMobileMock navigate={navigate} /> : <SemuaLowonganMock navigate={navigate} />;
    case 'profil': return <ProfilMock navigate={navigate} />;
    default: return <PelamarMasukMock navigate={navigate} />;
  }
}

export default function MockupApp() {
  return (
    <MockSessionProvider>
      <Isi />
    </MockSessionProvider>
  );
}
