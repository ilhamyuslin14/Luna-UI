import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TourGuide from './components/TourGuide.jsx';
import UploadProgressWidget from './components/UploadProgressWidget.jsx';
import GlobalAIPoller from './components/GlobalAIPoller.jsx';
import Beranda from './views/beranda/Beranda.jsx';
import Beranda_001 from './views/beranda/Beranda_001.jsx';
import Seleksi from './views/seleksi/Seleksi.jsx';
import Seleksi_001 from './views/seleksi/Seleksi_001.jsx';
import SeleksiDetail from './views/seleksi/SeleksiDetail.jsx';
import SeleksiDetail_001 from './views/seleksi/SeleksiDetail_001.jsx';
import SeleksiDetail_002 from './views/seleksi/SeleksiDetail_002.jsx';
import Departemen from './views/departemen/Departemen.jsx';
import Departemen_001 from './views/departemen/Departemen_001.jsx';
import Kandidat from './views/kandidat/Kandidat.jsx';
import Kandidat_001 from './views/kandidat/Kandidat_001.jsx';
import Karyawan from './views/karyawan/Karyawan.jsx';
import KelolaPengguna from './views/kelola-pengguna/KelolaPengguna.jsx';
import KandidatTambah from './views/kandidat/Kandidat-Tambah.jsx';
import SeleksiTambahKandidat from './views/seleksi/Seleksi-TambahKandidat.jsx';
import LamanKarir from './views/seleksi/Seleksi-LamanKarir.jsx';
import KandidatDetail from './views/kandidat/KandidatDetail.jsx';
import KandidatDetail_001 from './views/kandidat/KandidatDetail_001.jsx';
import DepartemenDetail from './views/departemen/DepartemenDetail.jsx';
import DepartemenDetail_001 from './views/departemen/DepartemenDetail_001.jsx';
import Bantuan from './views/bantuan/Bantuan.jsx';
import Bantuan_001 from './views/bantuan/Bantuan_001.jsx';
import PengaturanAkunProfil from './views/kelola-pengguna/KelolaPengguna-AkunProfil.jsx';
import PaketLangganan from './views/kelola-pengguna/KelolaPengguna-PaketLangganan.jsx';
import RingkasanPembayaran from './views/kelola-pengguna/KelolaPengguna-RingkasanPembayaran.jsx';
import SetupPenilaian from './views/seleksi/Seleksi-SetupPenilaian.jsx';
import SetupPenilaian_001 from './views/seleksi/Seleksi-SetupPenilaian_001.jsx';
import PengaturanUser from './views/kelola-pengguna/KelolaPengguna-User.jsx';
import RiwayatTransaksi from './views/kelola-pengguna/KelolaPengguna-RiwayatTransaksi.jsx';
import MenungguPembayaran from './views/kelola-pengguna/KelolaPengguna-MenungguPembayaran.jsx';
import PembayaranBerhasil from './views/kelola-pengguna/KelolaPengguna-PembayaranBerhasil.jsx';
import LandingPage from './views/landing/LandingPage.jsx';
import LandingPage_001 from './views/landing/LandingPage_001.jsx';
import LandingPage_002 from './views/landing/LandingPage_002.jsx';
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
  const urlParams = new URLSearchParams(window.location.search);
  const [activeMenu, setActiveMenu] = useState(urlParams.get('view') || 'beranda_001');
  const [seleksiJabatan, setSeleksiJabatan] = useState(urlParams.get('jabatan') || '');
  const [selectedSeleksiId, setSelectedSeleksiId] = useState(urlParams.get('seleksiId') || '');
  const [lamanKarirKode, setLamanKarirKode] = useState(urlParams.get('kode') || '');
  const [selectedKandidat, setSelectedKandidat] = useState(urlParams.get('kandidat') || null);
  const [kandidatFilter, setKandidatFilter] = useState(urlParams.get('filter') || '');
  const [selectedDepartemen, setSelectedDepartemen] = useState(urlParams.get('departemen') || null);
  const [selectedDepartemenId, setSelectedDepartemenId] = useState(urlParams.get('departemenId') || null);
  const [seleksiActiveTab, setSeleksiActiveTab] = useState('ringkasan');
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [selectedCycle, setSelectedCycle] = useState('bulanan');
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
  const [historyStack, setHistoryStack] = useState([]);

  const updateUrl = (menu, params) => {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('view', menu);
    if (params.seleksiId) newUrl.searchParams.set('seleksiId', params.seleksiId); else newUrl.searchParams.delete('seleksiId');
    if (params.jabatan) newUrl.searchParams.set('jabatan', params.jabatan); else newUrl.searchParams.delete('jabatan');
    const kandidatId = params.kandidat?.id ?? (typeof params.kandidat === 'string' ? params.kandidat : null);
    if (kandidatId) newUrl.searchParams.set('kandidat', kandidatId); else newUrl.searchParams.delete('kandidat');
    if (params.departemen) newUrl.searchParams.set('departemen', params.departemen); else newUrl.searchParams.delete('departemen');
    if (params.departemenId) newUrl.searchParams.set('departemenId', params.departemenId); else newUrl.searchParams.delete('departemenId');
    if (params.filter) newUrl.searchParams.set('filter', params.filter); else newUrl.searchParams.delete('filter');
    if (params.search) newUrl.searchParams.set('search', params.search); else newUrl.searchParams.delete('search');
    window.history.pushState({}, '', newUrl);
  };

  const navigate = (menu, params = {}) => {
    setHistoryStack(stack => [...stack, { menu: activeMenu, seleksiId: selectedSeleksiId, jabatan: seleksiJabatan, kandidat: selectedKandidat, departemen: selectedDepartemen, departemenId: selectedDepartemenId, seleksiActiveTab }]);
    if (menu === 'seleksi-detail' || menu === 'seleksi-detail_001' || menu === 'seleksi-detail_002' || menu === 'seleksi-tambah-kandidat') {
      if (params.seleksiId) setSelectedSeleksiId(params.seleksiId);
      if (params.jabatan) setSeleksiJabatan(params.jabatan);
      if (params.activeTab) setSeleksiActiveTab(params.activeTab);
    }
    if (menu === 'kandidat-detail' || menu === 'kandidat-detail_001') setSelectedKandidat(params.kandidat || null);
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
    updateUrl(menu, {
      seleksiId: (menu === 'seleksi-detail' || menu === 'seleksi-detail_001' || menu === 'seleksi-detail_002' || menu === 'seleksi-tambah-kandidat') ? params.seleksiId || selectedSeleksiId : selectedSeleksiId,
      jabatan: (menu === 'seleksi-detail' || menu === 'seleksi-detail_001' || menu === 'seleksi-detail_002' || menu === 'seleksi-tambah-kandidat') ? params.jabatan || seleksiJabatan : seleksiJabatan,
      kandidat: (menu === 'kandidat-detail' || menu === 'kandidat-detail_001') ? params.kandidat : selectedKandidat,
      filter: menu === 'kandidat' ? params.filter : kandidatFilter,
      departemen: (menu === 'departemen-detail' || menu === 'departemen-detail_001') ? params.departemen : selectedDepartemen,
      departemenId: (menu === 'departemen-detail' || menu === 'departemen-detail_001') ? params.departemenId : selectedDepartemenId,
      search: params.search
    });
    setSearchQuery(params.search || '');
  };

  const back = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(stack => stack.slice(0, -1));
    setActiveMenu(prev.menu);
    setSeleksiJabatan(prev.jabatan);
    setSelectedSeleksiId(prev.seleksiId);
    setSelectedKandidat(prev.kandidat);
    setSelectedDepartemen(prev.departemen);
    setSelectedDepartemenId(prev.departemenId);
    setSeleksiActiveTab(prev.seleksiActiveTab);
    setActiveMenu(prev.menu);
    setSearchQuery(prev.search || '');
    updateUrl(prev.menu, { seleksiId: prev.seleksiId, jabatan: prev.jabatan, kandidat: prev.kandidat, departemen: prev.departemen, departemenId: prev.departemenId, search: prev.search });
  };

  window.switchMenu = navigate;

  const noPadding = ['departemen', 'departemen_001', 'seleksi', 'seleksi_001', 'kandidat', 'kandidat_001', 'karyawan', 'seleksi-detail', 'seleksi-detail_001', 'seleksi-detail_002', 'kandidat-detail', 'kandidat-detail_001', 'departemen-detail', 'departemen-detail_001', 'bantuan', 'bantuan_001', 'pengguna-akun', 'paket-langganan', 'setup-penilaian', 'setup-penilaian_001', 'pengaturan-user', 'riwayat-transaksi', 'menunggu-pembayaran', 'kandidat-tambah', 'seleksi-tambah-kandidat', 'pembayaran-berhasil'].includes(activeMenu);

  const { user, loading, mustChangePassword, otpVerified } = useAuth();

  useEffect(() => {
    if (loading) return;

    const publicMenus = ['landingpage', 'landingpage_001', 'landingpage_002', 'landingpage-masuk', 'landingpage-daftar', 'landingpage-otp', 'landingpage-lupa-password', 'landingpage-masuk_001', 'landingpage-daftar_001', 'landingpage-otp_001', 'landingpage-lupa-password_001', 'laman-karir', 'sandbox'];
    const authMenus = ['landingpage-masuk', 'landingpage-daftar', 'landingpage-lupa-password', 'landingpage-masuk_001', 'landingpage-daftar_001', 'landingpage-lupa-password_001'];

    if (!user && !publicMenus.includes(activeMenu)) {
      // Not logged in -> redirect to landing page
      navigate('landingpage_001');
    } else if (user && authMenus.includes(activeMenu)) {
      // Logged in -> redirect to beranda
      navigate('beranda_001');
    }
  }, [user, loading, activeMenu]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveMenu(params.get('view') || 'beranda_001');
      setSeleksiJabatan(params.get('jabatan') || '');
      setSelectedSeleksiId(params.get('seleksiId') || '');
      setLamanKarirKode(params.get('kode') || '');
      setSelectedKandidat(params.get('kandidat') || null);
      setKandidatFilter(params.get('filter') || '');
      setSelectedDepartemen(params.get('departemen') || null);
      setSelectedDepartemenId(params.get('departemenId') || null);
      setSearchQuery(params.get('search') || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const verifikasiMenus = ['landingpage-verifikasi-metode_001', 'landingpage-otp_001', 'landingpage-otp-email_001'];
  if (user && !otpVerified && !verifikasiMenus.includes(activeMenu)) {
    return <LandingPageVerifikasiMetode_001 navigate={navigate} />;
  }

  if (activeMenu === 'laman-karir') {
    return <LamanKarir kode={lamanKarirKode} jabatan={seleksiJabatan} navigate={navigate} />;
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
      case 'departemen': return <Departemen navigate={navigate} searchQuery={searchQuery} />;
      case 'departemen_001': return <Departemen_001 navigate={navigate} searchQuery={searchQuery} />;
      case 'departemen-detail': return <DepartemenDetail departemen={selectedDepartemen} navigate={navigate} back={back} />;
      case 'departemen-detail_001': return <DepartemenDetail_001 departemen={selectedDepartemen} departemenId={selectedDepartemenId} navigate={navigate} back={back} />;
      case 'seleksi': return <Seleksi navigate={navigate} searchQuery={searchQuery} />;
      case 'seleksi_001': return <Seleksi_001 navigate={navigate} searchQuery={searchQuery} />;
      case 'seleksi-detail': return <SeleksiDetail seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setSeleksiActiveTab} />;
      case 'seleksi-detail_001': return <SeleksiDetail_001 seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setSeleksiActiveTab} />;
      case 'seleksi-detail_002': return <SeleksiDetail_002 seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setSeleksiActiveTab} />;
      case 'kandidat': return <Kandidat navigate={navigate} searchQuery={searchQuery} filter={kandidatFilter} />;
      case 'kandidat_001': return <Kandidat_001 navigate={navigate} searchQuery={searchQuery} filter={kandidatFilter} />;
      case 'karyawan': return <Karyawan navigate={navigate} searchQuery={searchQuery} />;
      case 'kandidat-tambah': return <KandidatTambah navigate={navigate} back={back} />;
      case 'seleksi-tambah-kandidat': return <SeleksiTambahKandidat navigate={navigate} back={back} jabatan={seleksiJabatan} seleksiId={selectedSeleksiId} />;
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
      case 'setup-penilaian': return <SetupPenilaian navigate={navigate} />;
      case 'setup-penilaian_001': return <SetupPenilaian_001 navigate={navigate} />;
      default: return <Beranda_001 navigate={navigate} />;
    }
  };

  if (window.location.pathname === '/sandbox') {
    return <SandboxWrapper navigate={navigate} />;
  }

  return (
    <div className="app-container">
      <header id="navbar">
        <Navbar navigate={navigate} />
      </header>
      <aside id="sidebar">
        <Sidebar activeMenu={activeMenu} onNavigate={(menu) => { setHistoryStack([]); navigate(menu); }} />
      </aside>
      <main id="content" className={noPadding ? 'no-padding' : ''}>
        {renderView()}
      </main>
      <TourGuide navigate={navigate} />
      <UploadProgressWidget navigate={navigate} />
      <GlobalAIPoller />
    </div>
  );
}
