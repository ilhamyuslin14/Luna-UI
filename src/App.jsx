import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import useIsMobile from './hooks/useIsMobile.js';
import MobileApp from './mobile/MobileApp.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar_001 from './components/Sidebar_001.jsx';
import TourGuide_001 from './components/TourGuide_001.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import UploadProgressWidget from './components/UploadProgressWidget.jsx';
import GlobalAIPoller from './components/GlobalAIPoller.jsx';
import Beranda from './views/beranda/Beranda.jsx';
import Beranda_001 from './views/beranda/Beranda_001.jsx';
import Beranda_002 from './views/beranda/Beranda_002.jsx';
import Lowongan from './views/lowongan/Lowongan.jsx';
import Lowongan_001 from './views/lowongan/Lowongan_001.jsx';
import LowonganDetail from './views/lowongan/LowonganDetail.jsx';
import LowonganDetail_001 from './views/lowongan/LowonganDetail_001.jsx';
import LowonganDetail_002 from './views/lowongan/LowonganDetail_002.jsx';
import Departemen from './views/departemen/Departemen.jsx';
import Departemen_001 from './views/departemen/Departemen_001.jsx';
import Kandidat from './views/kandidat/Kandidat.jsx';
import Kandidat_001 from './views/kandidat/Kandidat_001.jsx';
import Karyawan from './views/karyawan/Karyawan.jsx';
import KelolaPengguna from './views/kelola-pengguna/KelolaPengguna.jsx';
import KandidatTambah from './views/kandidat/Kandidat-Tambah.jsx';
import LowonganTambahKandidat from './views/lowongan/Lowongan-TambahKandidat.jsx';
import LamanKarir from './views/lowongan/Lowongan-LamanKarir.jsx';
import LamanKarir_001 from './views/lowongan/Lowongan-LamanKarir_001.jsx';
import LamanPerusahaan_001 from './views/lowongan/Lowongan-Perusahaan_001.jsx';
import LamanKarirMobile from './mobile/views/lowongan/LamanKarirMobile.jsx';
import LamanPerusahaanMobile from './mobile/views/lowongan/LamanPerusahaanMobile.jsx';
import KandidatDetail from './views/kandidat/KandidatDetail.jsx';
import KandidatDetail_001 from './views/kandidat/KandidatDetail_001.jsx';
import DepartemenDetail from './views/departemen/DepartemenDetail.jsx';
import DepartemenDetail_001 from './views/departemen/DepartemenDetail_001.jsx';
import Bantuan from './views/bantuan/Bantuan.jsx';
import Bantuan_001 from './views/bantuan/Bantuan_001.jsx';
import PengaturanAkunProfil from './views/kelola-pengguna/KelolaPengguna-AkunProfil.jsx';
import PaketLangganan from './views/kelola-pengguna/KelolaPengguna-PaketLangganan.jsx';
import RingkasanPembayaran from './views/kelola-pengguna/KelolaPengguna-RingkasanPembayaran.jsx';
import SetupPenilaian from './views/lowongan/Lowongan-SetupPenilaian.jsx';
import SetupPenilaian_001 from './views/lowongan/Lowongan-SetupPenilaian_001.jsx';
import LowonganBuatPanduan_001 from './views/lowongan/Lowongan-BuatPanduan_001.jsx';
import Sebar_001 from './views/sebar/Sebar_001.jsx';
import PengaturanUser from './views/kelola-pengguna/KelolaPengguna-User.jsx';
import RiwayatTransaksi from './views/kelola-pengguna/KelolaPengguna-RiwayatTransaksi.jsx';
import MenungguPembayaran from './views/kelola-pengguna/KelolaPengguna-MenungguPembayaran.jsx';
import PembayaranBerhasil from './views/kelola-pengguna/KelolaPengguna-PembayaranBerhasil.jsx';
import LandingPage from './views/landing/LandingPage.jsx';
import LandingPage_001 from './views/landing/LandingPage_001.jsx';
import LandingPage_002 from './views/landing/LandingPage_002.jsx';
import LandingPage_003 from './views/landing/LandingPage_003.jsx';
import LandingPageMasuk from './views/landing/LandingPage-Masuk.jsx';
import LandingPageDaftar from './views/landing/LandingPage-Daftar.jsx';
import LandingPageOTP from './views/landing/LandingPage-OTP.jsx';
import LandingPageLupaPassword from './views/landing/LandingPage-LupaPassword.jsx';
import LandingPageMasuk_001 from './views/landing/LandingPage-Masuk_001.jsx';
import LandingPageDaftar_001 from './views/landing/LandingPage-Daftar_001.jsx';
import LandingPageOTP_001 from './views/landing/LandingPage-OTP_001.jsx';
import LandingPageOTPEmail_001 from './views/landing/LandingPage-OTP-Email_001.jsx';
import LandingPageVerifikasiMetode_001 from './views/landing/LandingPage-VerifikasiMetode_001.jsx';
import LandingPageLupaPassword_001 from './views/landing/LandingPage-LupaPassword_001.jsx';
import LandingPageTerimaUndangan from './views/landing/LandingPage-TerimaUndangan.jsx';
const sandboxModules = import.meta.glob('./views/sandbox/Sandbox.jsx');
const loadSandbox = sandboxModules['./views/sandbox/Sandbox.jsx'];

function SandboxWrapper({ navigate }) {
  const [SandboxComponent, setSandboxComponent] = useState(null);
  useEffect(() => {
    if (loadSandbox) {
      loadSandbox().then(mod => setSandboxComponent(() => mod.default));
    }
  }, []);
  if (!SandboxComponent) return <div style={{ padding: 20 }}>Sandbox (Local Only) - Module not found</div>;
  return <SandboxComponent navigate={navigate} />;
}

export default function App() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const rrNavigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const [activeMenu, setActiveMenu] = useState(urlParams.get('view') || 'beranda_002');
  const [seleksiJabatan, setSeleksiJabatan] = useState(urlParams.get('jabatan') || '');
  const [selectedSeleksiId, setSelectedSeleksiId] = useState(urlParams.get('seleksiId') || '');
  const [lamanKarirKode, setLamanKarirKode] = useState(urlParams.get('kode') || '');
  const [lamanPerusahaanSlug, setLamanPerusahaanSlug] = useState(urlParams.get('slug') || '');
  const [selectedKandidat, setSelectedKandidat] = useState(urlParams.get('kandidat') || null);
  const [kandidatOverlay, setKandidatOverlay] = useState(null);
  const [kandidatFilter, setKandidatFilter] = useState(urlParams.get('filter') || '');
  const [selectedDepartemen, setSelectedDepartemen] = useState(urlParams.get('departemen') || null);
  const [selectedDepartemenId, setSelectedDepartemenId] = useState(urlParams.get('departemenId') || null);
  const [seleksiActiveTab, setSeleksiActiveTab] = useState('ringkasan');
  const [seleksiOverlay, setSeleksiOverlay] = useState(null);
  const [kandidatOverlay, setKandidatOverlay] = useState(null);
  const [shellPanel, setShellPanel] = useState(urlParams.get('panel') || null);
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [selectedCycle, setSelectedCycle] = useState('bulanan');
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');

  // Bangun search-string baru sambil mempertahankan param yang tidak eksplisit
  // ditangani di sini (mis. kode/slug laman karir) — sama seperti updateUrl()
  // versi lama yang mulai dari URL saat ini, bukan dari kosongan.
  const buildSearch = (menu, params) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('view', menu);
    // Navigasi normal selalu menutup panel shell (mis. pencarian global) yang
    // lagi terbuka — cegah query `panel` lama nyangkut ke laman berikutnya.
    newParams.delete('panel');
    if (params.seleksiId) newParams.set('seleksiId', params.seleksiId); else newParams.delete('seleksiId');
    if (params.jabatan) newParams.set('jabatan', params.jabatan); else newParams.delete('jabatan');
    const kandidatId = params.kandidat?.id ?? (typeof params.kandidat === 'string' ? params.kandidat : null);
    if (kandidatId) newParams.set('kandidat', kandidatId); else newParams.delete('kandidat');
    if (params.departemen) newParams.set('departemen', params.departemen); else newParams.delete('departemen');
    if (params.departemenId) newParams.set('departemenId', params.departemenId); else newParams.delete('departemenId');
    if (params.filter) newParams.set('filter', params.filter); else newParams.delete('filter');
    if (params.search) newParams.set('search', params.search); else newParams.delete('search');
    return `${location.pathname}?${newParams.toString()}`;
  };

  // navigate() menyimpan seluruh `params` sebagai location.state milik entry
  // history yang baru dibuat — jadi begitu user "kembali" ke entry ini nanti
  // (lewat back() ataupun tombol back fisik browser), React Router otomatis
  // mengembalikan location.state persis seperti saat entry ini pertama kali
  // dibuat. Ini menggantikan historyStack manual yang sebelumnya bisa gak
  // sinkron dengan tombol back browser.
  const navigate = (menu, params = {}, options = {}) => {
    if (menu === 'seleksi-detail' || menu === 'seleksi-detail_001' || menu === 'seleksi-detail_002' || menu === 'seleksi-tambah-kandidat' ||
        menu === 'lowongan-detail' || menu === 'lowongan-detail_001' || menu === 'lowongan-detail_002' || menu === 'lowongan-tambah-kandidat') {
      if (params.seleksiId) setSelectedSeleksiId(params.seleksiId);
      if (params.jabatan) setSeleksiJabatan(params.jabatan);
      if (params.activeTab) setSeleksiActiveTab(params.activeTab);
      setSeleksiOverlay(params.overlay || null);
    }
    if (menu === 'kandidat-detail' || menu === 'kandidat-detail_001') {
      setSelectedKandidat(params.kandidat || null);
      setKandidatOverlay(params.overlay || null);
    }
    if (menu === 'departemen-detail' || menu === 'departemen-detail_001') {
      setSelectedDepartemen(params.departemen || null);
      setSelectedDepartemenId(params.departemenId || null);
    }
    if (menu === 'kandidat') setKandidatFilter(params.filter || '');
    if (menu === 'ringkasan-pembayaran') {
      setSelectedPlan(params.plan || 'BASIC');
      setSelectedCycle(params.cycle || 'bulanan');
    }
    setActiveMenu(menu);
    setSearchQuery(params.search || '');
    rrNavigate(buildSearch(menu, params), { state: params, replace: !!options.replace });
  };

  // "Kembali" sekarang murni riwayat browser asli — satu mekanisme yang sama
  // dipakai baik oleh tombol back di app maupun tombol back fisik browser,
  // gantikan historyStack + popstate listener terpisah yang sebelumnya bisa
  // gak sinkron satu sama lain.
  const back = () => {
    rrNavigate(-1);
  };

  // Panel shell (mis. pencarian global) bisa dibuka dari HALAMAN MANAPUN, jadi
  // tidak lewat navigate()/buildSearch() yang di-scope per menu — cukup
  // tambahkan query `panel` ke URL & entry history yang sama (state dibawa
  // apa adanya, tidak menimpa overlay milik laman manapun yang sedang aktif).
  // Menutupnya pakai back() yang sama seperti tombol back fisik/gesture, jadi
  // "swipe back" & tap tombol close selalu konsisten satu mekanisme.
  const openShellPanel = (panel) => {
    const sp = new URLSearchParams(location.search);
    sp.set('panel', panel);
    rrNavigate(`${location.pathname}?${sp.toString()}`, { state: location.state });
  };

  // Dipakai oleh tab di dalam halaman detail (mis. tab Kandidat di Lowongan
  // Detail): ganti tab TIDAK membuat entry history baru (persis seperti
  // sebelumnya, URL tidak berubah), tapi tetap menulis ke location.state milik
  // entry yang sedang aktif via `replace` — supaya kalau nanti user drill-down
  // lebih dalam lalu "kembali" ke halaman ini, tab yang tersimpan adalah tab
  // TERAKHIR yang dilihat, bukan tab awal saat halaman ini pertama dibuka.
  const setActiveTabAndSync = (tab) => {
    setSeleksiActiveTab(tab);
    rrNavigate(`${location.pathname}${location.search}`, {
      state: { ...(location.state || {}), activeTab: tab },
      replace: true,
    });
  };

  // Setiap kali location berubah (navigate() baru, back(), ATAU tombol back/
  // forward fisik browser) — sinkronkan seluruh state lokal dari URL + state
  // milik entry history yang sekarang aktif. Ini satu-satunya tempat yang
  // menangani "restore" state, jadi tidak ada lagi risiko dua mekanisme beda
  // hasil seperti sebelumnya.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = location.state || {};
    setActiveMenu(params.get('view') || 'beranda_002');
    setSeleksiJabatan(params.get('jabatan') || '');
    setSelectedSeleksiId(params.get('seleksiId') || '');
    setLamanKarirKode(params.get('kode') || '');
    setLamanPerusahaanSlug(params.get('slug') || '');
    setSelectedKandidat(state.kandidat ?? params.get('kandidat') ?? null);
    setKandidatOverlay(state.overlay || null);
    setKandidatFilter(params.get('filter') || '');
    setSelectedDepartemen(state.departemen ?? params.get('departemen') ?? null);
    setSelectedDepartemenId(params.get('departemenId') || null);
    setSeleksiActiveTab(state.activeTab || 'ringkasan');
    setSeleksiOverlay(state.overlay || null);
    setSelectedPlan(state.plan || 'BASIC');
    setSelectedCycle(state.cycle || 'bulanan');
    setSearchQuery(params.get('search') || '');
    setShellPanel(params.get('panel') || null);
  }, [location]);

  window.switchMenu = navigate;

  const noPadding = ['departemen', 'departemen_001', 'seleksi', 'seleksi_001', 'lowongan', 'lowongan_001', 'kandidat', 'kandidat_001', 'karyawan', 'seleksi-detail', 'seleksi-detail_001', 'seleksi-detail_002', 'lowongan-detail', 'lowongan-detail_001', 'lowongan-detail_002', 'kandidat-detail', 'kandidat-detail_001', 'departemen-detail', 'departemen-detail_001', 'bantuan', 'bantuan_001', 'pengguna-akun', 'paket-langganan', 'setup-penilaian', 'setup-penilaian_001', 'buat-lowongan', 'buat-lowongan_001', 'buat-lowongan-panduan_001', 'pengaturan-user', 'riwayat-transaksi', 'menunggu-pembayaran', 'kandidat-tambah', 'seleksi-tambah-kandidat', 'lowongan-tambah-kandidat', 'pembayaran-berhasil'].includes(activeMenu);

  const { user, loading, mustChangePassword, otpVerified } = useAuth();

  useEffect(() => {
    if (loading) return;

    const publicMenus = ['landingpage', 'landingpage_001', 'landingpage_002', 'landingpage_003', 'landingpage-masuk', 'landingpage-daftar', 'landingpage-otp', 'landingpage-lupa-password', 'landingpage-masuk_001', 'landingpage-daftar_001', 'landingpage-otp_001', 'landingpage-lupa-password_001', 'laman-karir', 'laman-perusahaan', 'sandbox'];
    const authMenus = ['landingpage-masuk', 'landingpage-daftar', 'landingpage-lupa-password', 'landingpage-masuk_001', 'landingpage-daftar_001', 'landingpage-lupa-password_001'];

    if (!user && !publicMenus.includes(activeMenu)) {
      // Not logged in -> redirect to landing page
      navigate('landingpage_003');
    } else if (user && authMenus.includes(activeMenu)) {
      // Logged in -> redirect to beranda
      navigate('beranda_002');
    }
  }, [user, loading, activeMenu]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" style={{ animation: 'sb-spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        </svg>
      </div>
    );
  }

  if (user && mustChangePassword) {
    return <LandingPageTerimaUndangan />;
  }

  if (user && !otpVerified) {
    return <LandingPageOTPEmail_001 navigate={navigate} />;
  }

  if (activeMenu === 'laman-karir' || activeMenu === 'laman-karir_001') {
    return isMobile
      ? <LamanKarirMobile kode={lamanKarirKode} jabatan={seleksiJabatan} navigate={navigate} />
      : <LamanKarir_001 kode={lamanKarirKode} jabatan={seleksiJabatan} navigate={navigate} />;
  }

  if (activeMenu === 'laman-karir_old') {
    return <LamanKarir kode={lamanKarirKode} jabatan={seleksiJabatan} navigate={navigate} />;
  }

  if (activeMenu === 'laman-perusahaan') {
    return isMobile
      ? <LamanPerusahaanMobile slug={lamanPerusahaanSlug} />
      : <LamanPerusahaan_001 slug={lamanPerusahaanSlug} />;
  }

  if (activeMenu === 'landingpage') {
    return <LandingPage navigate={navigate} />;
  }

  if (activeMenu === 'landingpage_001') {
    return <LandingPage_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage_002') {
    return <LandingPage_002 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage_003') {
    return <LandingPage_003 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-masuk') {
    return <LandingPageMasuk navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-daftar') {
    return <LandingPageDaftar navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-otp') {
    return <LandingPageOTP navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-lupa-password') {
    return <LandingPageLupaPassword navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-masuk_001') {
    return <LandingPageMasuk_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-daftar_001') {
    return <LandingPageDaftar_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-otp_001') {
    return <LandingPageOTP_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-otp-email_001') {
    return <LandingPageOTPEmail_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-verifikasi-metode_001') {
    return <LandingPageVerifikasiMetode_001 navigate={navigate} />;
  }

  if (activeMenu === 'landingpage-lupa-password_001') {
    return <LandingPageLupaPassword_001 navigate={navigate} />;
  }

  if (activeMenu === 'ringkasan-pembayaran') {
    return <RingkasanPembayaran plan={selectedPlan} cycle={selectedCycle} navigate={navigate} back={back} />;
  }

  const renderView = () => {
    switch (activeMenu) {
      case 'beranda': return <Beranda navigate={navigate} />;
      case 'beranda_001': return <Beranda_001 navigate={navigate} />;
      case 'beranda_002': return <Beranda_002 navigate={navigate} />;
      case 'departemen': return <Departemen navigate={navigate} searchQuery={searchQuery} />;
      case 'departemen_001': return <Departemen_001 navigate={navigate} searchQuery={searchQuery} />;
      case 'departemen-detail': return <DepartemenDetail departemen={selectedDepartemen} navigate={navigate} back={back} />;
      case 'departemen-detail_001': return <DepartemenDetail_001 departemen={selectedDepartemen} departemenId={selectedDepartemenId} navigate={navigate} back={back} />;
      case 'seleksi':
      case 'lowongan': return <Lowongan navigate={navigate} searchQuery={searchQuery} />;
      case 'seleksi_001':
      case 'lowongan_001': return <Lowongan_001 navigate={navigate} searchQuery={searchQuery} />;
      case 'seleksi-detail':
      case 'lowongan-detail': return <LowonganDetail seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setActiveTabAndSync} />;
      case 'seleksi-detail_001':
      case 'lowongan-detail_001': return <LowonganDetail_001 seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setActiveTabAndSync} />;
      case 'seleksi-detail_002':
      case 'lowongan-detail_002': return <LowonganDetail_002 seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setActiveTabAndSync} />;
      case 'kandidat': return <Kandidat navigate={navigate} searchQuery={searchQuery} filter={kandidatFilter} />;
      case 'kandidat_001': return <Kandidat_001 navigate={navigate} searchQuery={searchQuery} filter={kandidatFilter} />;
      case 'karyawan': return <Karyawan navigate={navigate} searchQuery={searchQuery} />;
      case 'kandidat-tambah': return <KandidatTambah navigate={navigate} back={back} />;
      case 'seleksi-tambah-kandidat':
      case 'lowongan-tambah-kandidat': return <LowonganTambahKandidat navigate={navigate} back={back} jabatan={seleksiJabatan} seleksiId={selectedSeleksiId} />;
      case 'kandidat-detail': return <KandidatDetail kandidat={selectedKandidat} navigate={navigate} back={back} />;
      case 'kandidat-detail_001': return <KandidatDetail_001 kandidat={selectedKandidat} navigate={navigate} back={back} />;
      case 'pengaturan': return <KelolaPengguna navigate={navigate} />;
      case 'pengaturan-user': return <PengaturanUser navigate={navigate} />;
      case 'pengguna-akun': return <PengaturanAkunProfil navigate={navigate} />;
      case 'paket-langganan': return <PaketLangganan navigate={navigate} />;
      case 'riwayat-transaksi': return <RiwayatTransaksi navigate={navigate} />;
      case 'menunggu-pembayaran': return <MenungguPembayaran navigate={navigate} back={back} />;
      case 'pembayaran-berhasil': return <PembayaranBerhasil navigate={navigate} />;
      case 'bantuan': return <Bantuan navigate={navigate} />;
      case 'bantuan_001': return <Bantuan_001 navigate={navigate} />;
      case 'setup-penilaian':
      case 'buat-lowongan': return <SetupPenilaian navigate={navigate} />;
      case 'setup-penilaian_001':
      case 'buat-lowongan_001': return <SetupPenilaian_001 navigate={navigate} />;
      case 'buat-lowongan-panduan_001': return <LowonganBuatPanduan_001 navigate={navigate} back={back} />;
      case 'sebar':
      case 'sebar_001': return <Sebar_001 navigate={navigate} />;
      default: return <Beranda_002 navigate={navigate} />;
    }
  };

  if (location.pathname === '/sandbox') {
    return <SandboxWrapper navigate={navigate} />;
  }

  if (isMobile) {
    return (
      <MobileApp
        navigate={navigate}
        back={back}
        activeMenu={activeMenu}
        selectedSeleksiId={selectedSeleksiId}
        seleksiJabatan={seleksiJabatan}
        seleksiActiveTab={seleksiActiveTab}
        seleksiOverlay={seleksiOverlay}
        selectedKandidat={selectedKandidat}
        kandidatOverlay={kandidatOverlay}
        shellPanel={shellPanel}
        openShellPanel={openShellPanel}
      />
    );
  }

  return (
    <div className="app-container">
      <header id="navbar">
        <Navbar navigate={navigate} activeMenu={activeMenu} seleksiJabatan={seleksiJabatan} />
      </header>
      <aside id="sidebar">
        <Sidebar_001 activeMenu={activeMenu} onNavigate={(menu) => navigate(menu, {}, { replace: true })} />
      </aside>
      <main id="content" className={noPadding ? 'no-padding' : ''}>
        {renderView()}
      </main>
      <TourGuide_001 navigate={navigate} />
      <OnboardingModal />
      <UploadProgressWidget navigate={navigate} />
      <GlobalAIPoller />
    </div>
  );
}
