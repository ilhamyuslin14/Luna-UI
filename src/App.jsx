import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './views/Dashboard.jsx';
import Seleksi from './views/Seleksi.jsx';
import SeleksiDetail from './views/SeleksiDetail.jsx';
import Departemen from './views/Departemen.jsx';
import Kandidat from './views/Kandidat.jsx';
import KelolaPengguna from './views/KelolaPengguna.jsx';
import KandidatTambah from './views/Kandidat-Tambah.jsx';
import LamanKarir from './views/Seleksi-LamanKarir.jsx';
import KandidatDetail from './views/KandidatDetail.jsx';
import DepartemenDetail from './views/DepartemenDetail.jsx';
import Bantuan from './views/Bantuan.jsx';
import PengaturanAkunProfil from './views/KelolaPengguna-AkunProfil.jsx';
import PaketLangganan from './views/KelolaPengguna-PaketLangganan.jsx';
import SetupPenilaian from './views/Seleksi-SetupPenilaian.jsx';
import PengaturanUser from './views/KelolaPengguna-User.jsx';
import RiwayatTransaksi from './views/KelolaPengguna-RiwayatTransaksi.jsx';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const [activeMenu, setActiveMenu] = useState(urlParams.get('view') || 'dashboard');
  const [seleksiJabatan, setSeleksiJabatan] = useState(urlParams.get('jabatan') || '');
  const [selectedKandidat, setSelectedKandidat] = useState(null);
  const [selectedDepartemen, setSelectedDepartemen] = useState(null);
  const [seleksiActiveTab, setSeleksiActiveTab] = useState('ringkasan');
  const [historyStack, setHistoryStack] = useState([]);

  const navigate = (menu, params = {}) => {
    setHistoryStack(stack => [...stack, { menu: activeMenu, jabatan: seleksiJabatan, kandidat: selectedKandidat, departemen: selectedDepartemen, seleksiActiveTab }]);
    if (menu === 'seleksi-detail') setSeleksiJabatan(params.jabatan || '');
    if (menu === 'kandidat-detail') setSelectedKandidat(params.kandidat || null);
    if (menu === 'departemen-detail') setSelectedDepartemen(params.departemen || null);
    setActiveMenu(menu);
  };

  const back = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(stack => stack.slice(0, -1));
    setActiveMenu(prev.menu);
    setSeleksiJabatan(prev.jabatan);
    setSelectedKandidat(prev.kandidat);
    setSelectedDepartemen(prev.departemen);
    setSeleksiActiveTab(prev.seleksiActiveTab ?? 'ringkasan');
  };

  window.switchMenu = navigate;

  const noPadding = ['departemen', 'seleksi', 'kandidat', 'seleksi-detail', 'kandidat-detail', 'departemen-detail', 'bantuan', 'pengguna-akun', 'paket-langganan', 'setup-penilaian', 'pengaturan-user', 'riwayat-transaksi', 'kandidat-tambah'].includes(activeMenu);

  if (activeMenu === 'laman-karir') {
    return <LamanKarir jabatan={seleksiJabatan} navigate={navigate} />;
  }

  const renderView = () => {
    switch (activeMenu) {
      case 'dashboard':     return <Dashboard navigate={navigate} />;
      case 'departemen':    return <Departemen navigate={navigate} />;
      case 'departemen-detail': return <DepartemenDetail departemen={selectedDepartemen} navigate={navigate} back={back} />;
      case 'seleksi':       return <Seleksi navigate={navigate} />;
      case 'seleksi-detail':return <SeleksiDetail jabatan={seleksiJabatan} navigate={navigate} back={back} activeTab={seleksiActiveTab} onTabChange={setSeleksiActiveTab} />;
      case 'kandidat':        return <Kandidat navigate={navigate} />;
      case 'kandidat-tambah': return <KandidatTambah navigate={navigate} />;
      case 'kandidat-detail': return <KandidatDetail kandidat={selectedKandidat} navigate={navigate} back={back} />;
      case 'pengaturan':      return <KelolaPengguna navigate={navigate} />;
      case 'pengaturan-user': return <PengaturanUser navigate={navigate} />;
      case 'pengguna-akun':   return <PengaturanAkunProfil navigate={navigate} />;
      case 'paket-langganan': return <PaketLangganan navigate={navigate} />;
      case 'riwayat-transaksi': return <RiwayatTransaksi navigate={navigate} />;
      case 'bantuan':         return <Bantuan />;
      case 'setup-penilaian': return <SetupPenilaian navigate={navigate} />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <header id="navbar">
        <Navbar />
      </header>
      <aside id="sidebar">
        <Sidebar activeMenu={activeMenu} onNavigate={(menu) => { setHistoryStack([]); setActiveMenu(menu); }} />
      </aside>
      <main id="content" className={noPadding ? 'no-padding' : ''}>
        {renderView()}
      </main>
    </div>
  );
}
