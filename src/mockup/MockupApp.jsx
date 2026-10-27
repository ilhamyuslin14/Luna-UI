import { useState, useEffect, useCallback } from 'react';
import useIsMobile from '../hooks/useIsMobile.js';
import { MockSessionProvider, useMockSession } from './MockSession.jsx';
import LengkapiProfilModal from '../components/pelamar/LengkapiProfilModal.jsx';
import PelamarMasukMock from './views/PelamarMasukMock.jsx';
import PelamarDaftarMock from './views/PelamarDaftarMock.jsx';
import PelamarVerifikasiOtpMock from './views/PelamarVerifikasiOtpMock.jsx';
import PelamarOnboardingMock from './views/PelamarOnboardingMock.jsx';
import LandingPelamarMock from './views/LandingPelamarMock.jsx';
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
  'landingpage-pelamar': 'landing',
  'pelamar-masuk': 'masuk',
  'pelamar-daftar': 'daftar',
  'pelamar-verifikasi-otp': 'otp',
  'pelamar-onboarding': 'onboarding',
  'semua-lowongan_002': 'lowongan',
  'profil-pelamar_001': 'profil',
};

// Layar pertama saat presentasi dibuka tanpa ?screen=. Ganti ke 'masuk' bila ingin mulai dari layar Masuk.
const LAYAR_AWAL = 'landing';

const bacaLayarAwal = () => {
  const dariUrl = new URLSearchParams(window.location.search).get('screen');
  return Object.values(LAYAR).includes(dariUrl) ? dariUrl : LAYAR_AWAL;
};

// Unggah CV tiruan: progres berjalan beberapa detik, tanpa file yang benar-benar dikirim.
const tiruUnggah = async (_file, onProgress) => {
  const tahap = [[12, 'Mengunggah CV…'], [45, 'Membaca isi CV…'], [78, 'Mengisi profilmu dari CV…'], [100, 'Selesai']];
  for (const [persen, label] of tahap) { onProgress?.(persen, label); await new Promise((r) => setTimeout(r, 650)); }
};

function Isi() {
  const isMobile = useIsMobile();
  const [layar, setLayar] = useState(bacaLayarAwal);
  const [paramAwal, setParamAwal] = useState(null); // {q, kota, buka} dari landing ke daftar lowongan
  const { masuk, profilBelumLengkap, selesaikanProfil } = useMockSession();

  // Tautkan layar ke ?screen= (tanpa menambah riwayat) supaya memuat ulang tetap di layar yang sama.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'mockup');
    url.searchParams.set('screen', layar);
    window.history.replaceState(window.history.state, '', url);
    window.scrollTo({ top: 0 });
  }, [layar]);

  const navigate = useCallback((menu, params) => {
    const tujuan = LAYAR[menu];
    if (!tujuan) return;
    setParamAwal(params ? { ...params } : null);
    setLayar(tujuan);
  }, []);

  const layarDenganModal = ['landing', 'lowongan', 'profil'].includes(layar);
  const modal = masuk && profilBelumLengkap && layarDenganModal ? (
    <LengkapiProfilModal
      nama="Dina"
      cvTiruan
      stageAwal="cv"
      unggahCv={tiruUnggah}
      simpan={async () => { await new Promise((r) => setTimeout(r, 600)); }}
      onSelesai={selesaikanProfil}
    />
  ) : null;

  return <>{tampilkan()}{modal}</>;

  function tampilkan() {
  switch (layar) {
    case 'daftar': return <PelamarDaftarMock navigate={navigate} />;
    case 'otp': return <PelamarVerifikasiOtpMock navigate={navigate} />;
    case 'onboarding': return <PelamarOnboardingMock navigate={navigate} />;
    case 'landing': return <LandingPelamarMock navigate={navigate} />;
    case 'lowongan': return isMobile ? <SemuaLowonganMobileMock navigate={navigate} awal={paramAwal} /> : <SemuaLowonganMock navigate={navigate} awal={paramAwal} />;
    case 'profil': return <ProfilMock navigate={navigate} />;
    default: return <PelamarMasukMock navigate={navigate} />;
  }
  }
}

export default function MockupApp() {
  return (
    <MockSessionProvider>
      <Isi />
    </MockSessionProvider>
  );
}
