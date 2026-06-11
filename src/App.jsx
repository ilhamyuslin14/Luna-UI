import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TourGuide from './components/TourGuide.jsx';
import UploadProgressWidget from './components/UploadProgressWidget.jsx';
import GlobalAIPoller from './components/GlobalAIPoller.jsx';
import Beranda from './views/beranda/Beranda.jsx';
import Seleksi from './views/seleksi/Seleksi.jsx';
import SeleksiDetail from './views/seleksi/SeleksiDetail.jsx';
import Departemen from './views/departemen/Departemen.jsx';
import Kandidat from './views/kandidat/Kandidat.jsx';
import KelolaPengguna from './views/kelola-pengguna/KelolaPengguna.jsx';
import KandidatTambah from './views/kandidat/Kandidat-Tambah.jsx';
import SeleksiTambahKandidat from './views/seleksi/Seleksi-TambahKandidat.jsx';
import LamanKarir from './views/seleksi/Seleksi-LamanKarir.jsx';
import KandidatDetail from './views/kandidat/KandidatDetail.jsx';
import DepartemenDetail from './views/departemen/DepartemenDetail.jsx';
import Bantuan from './views/bantuan/Bantuan.jsx';
import PengaturanAkunProfil from './views/kelola-pengguna/KelolaPengguna-AkunProfil.jsx';
import PaketLangganan from './views/kelola-pengguna/KelolaPengguna-PaketLangganan.jsx';
import RingkasanPembayaran from './views/kelola-pengguna/KelolaPengguna-RingkasanPembayaran.jsx';
import SetupPenilaian from './views/seleksi/Seleksi-SetupPenilaian.jsx';
import PengaturanUser from './views/kelola-pengguna/KelolaPengguna-User.jsx';
import RiwayatTransaksi from './views/kelola-pengguna/KelolaPengguna-RiwayatTransaksi.jsx';
import MenungguPembayaran from './views/kelola-pengguna/KelolaPengguna-MenungguPembayaran.jsx';
import PembayaranBerhasil from './views/kelola-pengguna/KelolaPengguna-PembayaranBerhasil.jsx';
import LandingPage from './views/landing/LandingPage.jsx';
import LandingPageMasuk from './views/landing/LandingPage-Masuk.jsx';
import LandingPageDaftar from './views/landing/LandingPage-Daftar.jsx';
import LandingPageOTP from './views/landing/LandingPage-OTP.jsx';
import LandingPageLupaPassword from './views/landing/LandingPage-LupaPassword.jsx';

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
  const [activeMenu, setActiveMenu] = useState(urlParams.get('view') || 'beranda');
  const [seleksiJabatan, setSeleksiJabatan] = useState(urlParams.get('jabatan') || '');
  const [selectedSeleksiId, setSelectedSeleksiId] = useState(urlParams.get('seleksiId') || '');
  const [lamanKarirKode, setLamanKarirKode] = useState(urlParams.get('kode') || '');
  const [selectedKandidat, setSelectedKandidat] = useState(urlParams.get('kandidat') || null);
  const [kandidatFilter, setKandidatFilter] = useState(urlParams.get('filter') || '');
  const [selectedDepartemen, setSelectedDepartemen] = useState(urlParams.get('departemen') || null);
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
    if (params.filter) newUrl.searchParams.set('filter', params.filter); else newUrl.searchParams.delete('filter');
    if (params.search) newUrl.searchParams.set('search', params.search); else newUrl.searchParams.delete('search');
    window.history.pushState({}, '', newUrl);
  };

  const navigate = (menu, params = {}) => {
    setHistoryStack(stack => [...stack, { menu: activeMenu, seleksiId: selectedSeleksiId, jabatan: seleksiJabatan, kandidat: selectedKandidat, departemen: selectedDepartemen, seleksiActiveTab }]);
    if (menu === 'seleksi-detail' || menu === 'seleksi-tambah-kandidat') {
      if (params.seleksiId) setSelectedSeleksiId(params.seleksiId);
      if (params.jabatan) setSeleksiJabatan(params.jabatan);
      if (params.activeTab) setSeleksiActiveTab(params.activeTab);
    }
    if (menu === 'kandidat-detail') setSelectedKandidat(params.kandidat || null);
    if (menu === 'departemen-detail') setSelectedDepartemen(params.departemen || null);
    if (menu === 'kandidat') setKandidatFilter(params.filter || '');
    if (menu === 'ringkasan-pembayaran') {
      setSelectedPlan(params.plan || 'BASIC');
      setSelectedCycle(params.cycle || 'bulanan');
    }
    setActiveMenu(menu);
    updateUrl(menu, {
      seleksiId: (menu === 'seleksi-detail' || menu === 'seleksi-tambah-kandidat') ? params.seleksiId || selectedSeleksiId : selectedSeleksiId,
      jabatan: (menu === 'seleksi-detail' || menu === 'seleksi-tambah-kandidat') ? params.jabatan || seleksiJabatan : seleksiJabatan,
      kandidat: menu === 'kandidat-detail' ? params.kandidat : selectedKandidat,
      filter: menu === 'kandidat' ? params.filter : kandidatFilter,
      departemen: menu === 'departemen-detail' ? params.departemen : selectedDepartemen,
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
    setSeleksiActiveTab(prev.seleksiActiveTab);
    setActiveMenu(prev.menu);
    setSearchQuery(prev.search || '');
    updateUrl(prev.menu, { seleksiId: prev.seleksiId, jabatan: prev.jabatan, kandidat: prev.kandidat, departemen: prev.departemen, search: prev.search });
  };

  window.switchMenu = navigate;

  const noPadding = ['departemen', 'seleksi', 'kandidat', 'seleksi-detail', 'kandidat-detail', 'departemen-detail', 'bantuan', 'pengguna-akun', 'paket-langganan', 'setup-penilaian', 'pengaturan-user', 'riwayat-transaksi', 'menunggu-pembayaran', 'kandidat-tambah', 'seleksi-tambah-kandidat', 'pembayaran-berhasil'].includes(activeMenu);

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const publicMenus = ['landingpage', 'landingpage-masuk', 'landingpage-daftar', 'landingpage-otp', 'landingpage-lupa-password', 'laman-karir', 'sandbox'];
    const authMenus = ['landingpage-masuk', 'landingpage-daftar', 'landingpage-lupa-password'];

    if (!user && !publicMenus.includes(activeMenu)) {
      // Not logged in -> redirect to landing page
      navigate('landingpage');
    } else if (user && authMenus.includes(activeMenu)) {
      // Logged in -> redirect to beranda
      navigate('beranda');
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

  if (activeMenu === 'laman-karir') {
    return <LamanKarir kode={lamanKarirKode} jabatan={seleksiJabatan} navigate={navigate} />;
  }

  if (activeMenu === 'landingpage') {
    return <LandingPage navigate={navigate} />;
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

  if (activeMenu === 'ringkasan-pembayaran') {
    return <RingkasanPembayaran plan={selectedPlan} cycle={selectedCycle} navigate={navigate} back={back} />;
  }

  const renderView = () => {
    switch (activeMenu) {
      case 'beranda': return <Beranda navigate={navigate} />;
      case 'departemen': return <Departemen navigate={navigate} searchQuery={searchQuery} />;
      case 'departemen-detail': return <DepartemenDetail departemen={selectedDepartemen} navigate={navigate} back={back} />;
      case 'seleksi': return <Seleksi navigate={navigate} searchQuery={searchQuery} />;
      case 'seleksi-detail': return <SeleksiDetail seleksiId={selectedSeleksiId} jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setSeleksiActiveTab} />;
      case 'kandidat': return <Kandidat navigate={navigate} searchQuery={searchQuery} filter={kandidatFilter} />;
      case 'kandidat-tambah': return <KandidatTambah navigate={navigate} />;
      case 'seleksi-tambah-kandidat': return <SeleksiTambahKandidat navigate={navigate} back={back} jabatan={seleksiJabatan} seleksiId={selectedSeleksiId} />;
      case 'kandidat-detail': return <KandidatDetail kandidat={selectedKandidat} navigate={navigate} back={back} />;
      case 'pengaturan': return <KelolaPengguna navigate={navigate} />;
      case 'pengaturan-user': return <PengaturanUser navigate={navigate} />;
      case 'pengguna-akun': return <PengaturanAkunProfil navigate={navigate} />;
      case 'paket-langganan': return <PaketLangganan navigate={navigate} />;
      case 'riwayat-transaksi': return <RiwayatTransaksi navigate={navigate} />;
      case 'menunggu-pembayaran': return <MenungguPembayaran navigate={navigate} back={back} />;
      case 'pembayaran-berhasil': return <PembayaranBerhasil navigate={navigate} />;
      case 'bantuan': return <Bantuan navigate={navigate} />;
      case 'setup-penilaian': return <SetupPenilaian navigate={navigate} />;
      default: return <Beranda />;
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
