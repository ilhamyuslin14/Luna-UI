import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import useNotifications from '../hooks/navbar/useNotifications.js';
import PopupKonfirmasi from '../components/PopupKonfirmasi.jsx';
import BerandaMobile from './views/beranda/BerandaMobile.jsx';
import LowonganMobile from './views/lowongan/LowonganMobile.jsx';
import LowonganDetailMobile from './views/lowongan/LowonganDetailMobile.jsx';
import MobileBuatLowonganForm from './views/lowongan/MobileBuatLowonganForm.jsx';
import KandidatMobile from './views/kandidat/KandidatMobile.jsx';
import KandidatTambahMobile from './views/kandidat/KandidatTambahMobile.jsx';
import KandidatDetailMobile from './views/kandidat/KandidatDetailMobile.jsx';
import SebarMobile from './views/sebar/SebarMobile.jsx';
import MobileSearch from './components/MobileSearch.jsx';
import MobileNotifications from './components/MobileNotifications.jsx';

const IcBeranda = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-8 9 8" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);
const IcLowongan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IcSebar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IcKandidat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcAkun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="11" r="3" /><path d="M8 17a4 4 0 0 1 8 0" />
  </svg>
);
const IcBantuan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
  </svg>
);
const IcKeluar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IcSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const TABS = [
  { menu: 'beranda_002', label: 'Beranda', Icon: IcBeranda },
  { menu: 'lowongan_001', label: 'Lowongan', Icon: IcLowongan },
  { menu: 'sebar_001', label: 'Sebar', Icon: IcSebar },
  { menu: 'kandidat_001', label: 'Kandidat', Icon: IcKandidat },
];

const PAGE_LABELS = {
  beranda_002: 'Beranda',
  lowongan_001: 'Lowongan',
  sebar_001: 'Sebar',
  kandidat_001: 'Kandidat',
  'pengguna-akun': 'Akun dan Profil',
  bantuan_001: 'Bantuan',
  departemen_001: 'Departemen',
  seleksi_001: 'Lowongan',
  'seleksi-detail_001': 'Detail Lowongan',
  'kandidat-detail_001': 'Detail Kandidat',
};

function DummyPage({ menu }) {
  const label = PAGE_LABELS[menu] || 'Halaman';
  return (
    <>
      <div className="msh-page-eyebrow">Halaman dummy</div>
      <h1 className="msh-page-title">{label}</h1>
      <div className="msh-skel" style={{ height: 84 }} />
      <div className="msh-skel-line" style={{ width: '70%', marginTop: 14 }} />
      <div className="msh-skel-line" style={{ width: '45%' }} />
      <div className="msh-skel" style={{ height: 150, marginTop: 12 }} />
    </>
  );
}

export default function MobileApp({ navigate, back, activeMenu, selectedSeleksiId, seleksiJabatan, seleksiActiveTab, selectedKandidat, kandidatOverlay }) {
  const { user, logout, companyId } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notif = useNotifications(companyId);

  const profileName = user?.user_metadata?.nama_lengkap || user?.user_metadata?.full_name || 'User';
  const profileEmail = user?.email || '';
  const profileInitial = profileName.charAt(0).toUpperCase();

  const closeNotif = () => {
    setNotifOpen(false);
    notif.markSeen();
  };

  const goTo = (menu) => {
    navigate(menu);
    setSheetOpen(false);
  };

  return (
    <div className="msh-app">
      <div className="msh-topbar">
        <img
          src="/assets/logos/luna-logo-clean.png"
          alt="Luna"
          className="msh-brand-logo"
          onClick={() => navigate('beranda_002')}
        />
        <div className="msh-topbar-right">
          <button className="msh-icon-btn" title="Cari" onClick={() => setSearchOpen(true)}>
            <IcSearch />
          </button>
          <button className="msh-icon-btn" title="Notifikasi" onClick={() => setNotifOpen(true)}>
            <IcBell />
            {notif.unreadCount > 0 && <span className="msh-notif-dot" />}
          </button>
          <button className="msh-avatar" onClick={() => setSheetOpen(true)}>
            {profileInitial}
          </button>
        </div>
      </div>

      <div className={`msh-content${['beranda_002', 'lowongan_001', 'lowongan-detail_001', 'buat-lowongan_001', 'kandidat_001', 'kandidat-detail_001', 'kandidat-tambah', 'sebar_001'].includes(activeMenu) ? ' msh-content--flush' : ''}`}>
        {activeMenu === 'beranda_002' ? <BerandaMobile navigate={navigate} />
          : activeMenu === 'lowongan_001' ? <LowonganMobile navigate={navigate} />
          : activeMenu === 'lowongan-detail_001' ? (
            <LowonganDetailMobile
              navigate={navigate}
              back={back}
              seleksiId={selectedSeleksiId}
              jabatan={seleksiJabatan}
              activeTab={seleksiActiveTab}
            />
          )
          : activeMenu === 'buat-lowongan_001' ? <MobileBuatLowonganForm navigate={navigate} />
          : activeMenu === 'kandidat_001' ? <KandidatMobile navigate={navigate} />
          : activeMenu === 'kandidat-tambah' ? <KandidatTambahMobile navigate={navigate} back={back} />
          : activeMenu === 'kandidat-detail_001' ? (
            <KandidatDetailMobile
              navigate={navigate}
              back={back}
              kandidat={selectedKandidat}
              overlay={kandidatOverlay}
            />
          )
          : activeMenu === 'sebar_001' ? <SebarMobile navigate={navigate} />
          : <DummyPage menu={activeMenu} />}
      </div>

      <div className="msh-tabbar">
        {TABS.map(({ menu, label, Icon }) => (
          <button
            key={menu}
            className={`msh-tab${activeMenu === menu ? ' active' : ''}`}
            onClick={() => goTo(menu)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={`msh-sheet-overlay${sheetOpen ? ' open' : ''}`} onClick={() => setSheetOpen(false)} />
      <div className={`msh-sheet${sheetOpen ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="msh-sheet-profile">
          <div className="msh-sheet-profile-avatar">{profileInitial}</div>
          <div>
            <div className="msh-sheet-profile-name">{profileName}</div>
            <div className="msh-sheet-profile-email">{profileEmail}</div>
          </div>
        </div>
        <button className="msh-sheet-item" onClick={() => goTo('pengguna-akun')}>
          <IcAkun /> Akun dan Profil
        </button>
        <button className="msh-sheet-item" onClick={() => goTo('bantuan_001')}>
          <IcBantuan /> Bantuan
        </button>
        <button
          className="msh-sheet-item danger"
          onClick={() => { setSheetOpen(false); setShowLogoutModal(true); }}
        >
          <IcKeluar /> Keluar
        </button>
      </div>

      {showLogoutModal && (
        <PopupKonfirmasi
          title="Keluar dari Akun?"
          body="Apakah Anda yakin ingin keluar?"
          confirmLabel="Keluar"
          onConfirm={() => { setShowLogoutModal(false); logout?.(); navigate('landingpage_003'); }}
          onClose={() => setShowLogoutModal(false)}
        />
      )}

      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} navigate={navigate} />
      <MobileNotifications
        open={notifOpen}
        onClose={closeNotif}
        navigate={navigate}
        notifications={notif.notifications}
        isNotifLoading={notif.isNotifLoading}
        unreadCount={notif.unreadCount}
        readNotifKeys={notif.readNotifKeys}
        markNotifAsRead={notif.markNotifAsRead}
        markAllAsRead={notif.markAllAsRead}
      />
    </div>
  );
}
