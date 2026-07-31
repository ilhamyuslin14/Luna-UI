import { useState } from 'react';
import PopupKonfirmasi from './PopupKonfirmasi.jsx';

const IcBeranda = () => (
  <svg width="16" height="16" viewBox="0 0 12.79 12.79" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.46622 0.5H4.32378C2.21197 0.5 0.5 2.21197 0.5 4.32378V8.46622C0.5 10.578 2.21197 12.29 4.32378 12.29H8.46622C10.578 12.29 12.29 10.578 12.29 8.46622V4.32378C12.29 2.21197 10.578 0.5 8.46622 0.5Z" stroke="currentColor" />
    <path d="M3.6367 9.08418V5.83461M6.47331 9.08418V3.70285M9.15314 9.08418V5.00421" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

const IcSeleksi = () => (
  <svg width="16" height="16" viewBox="0 0 12.7667 12.7667" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.80408 11.6337H4.98625C2.895 11.6337 1.84967 11.6337 1.19983 10.9716C0.550001 10.3095 0.550001 9.24433 0.550001 7.11283C0.550001 4.98191 0.550001 3.91616 1.19983 3.25408C1.84967 2.59199 2.895 2.59199 4.98625 2.59199H7.20467C9.29592 2.59199 10.3418 2.59199 10.9917 3.25408C11.4916 3.76333 11.6065 4.51174 11.6333 5.80033" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M11.0599 11.0635L12.2167 12.2167M11.6642 9.6069C11.6688 9.33384 11.619 9.0626 11.5177 8.80899C11.4164 8.55538 11.2656 8.32448 11.0741 8.12975C10.8826 7.93502 10.6543 7.78036 10.4024 7.67479C10.1506 7.56922 9.88021 7.51485 9.60711 7.51485C9.33401 7.51485 9.06365 7.56922 8.81178 7.67479C8.55991 7.78036 8.33158 7.93502 8.1401 8.12975C7.94862 8.32448 7.79783 8.55538 7.69652 8.80899C7.5952 9.0626 7.54539 9.33384 7.54999 9.6069C7.55907 10.1465 7.7798 10.6609 8.1646 11.0393C8.5494 11.4176 9.06745 11.6297 9.60711 11.6297C10.1468 11.6297 10.6648 11.4176 11.0496 11.0393C11.4344 10.6609 11.6552 10.1465 11.6642 9.6069Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.71666 2.59167L8.65832 2.41084C8.36957 1.5125 8.22549 1.06334 7.88191 0.806669C7.53774 0.550002 7.08157 0.550002 6.16749 0.550002H6.01407C5.10116 0.550002 4.64441 0.550002 4.30082 0.806669C3.95666 1.06334 3.81257 1.5125 3.52382 2.41084L3.46666 2.59167" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

const IcKandidat = () => (
  <svg width="16" height="16" viewBox="0 0 13.4 13.4843" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.87695 7.92188H6.37988C8.3346 7.92188 9.9197 9.50628 9.91992 11.4609V11.6299C9.91992 12.4677 9.24014 13.1475 8.40234 13.1475H1.85449C1.0167 13.1475 0.336914 12.4676 0.336914 11.6299V11.4609C0.337139 9.50627 1.92221 7.92188 3.87695 7.92188ZM3.87695 8.25879C2.10839 8.25879 0.674053 9.69244 0.673828 11.4609V11.6299C0.673828 12.2815 1.20285 12.8105 1.85449 12.8105H8.40234C9.05395 12.8105 9.58301 12.2815 9.58301 11.6299V11.4609C9.58278 9.69244 8.14844 8.25879 6.37988 8.25879H3.87695ZM10.1973 7.79297C11.7798 7.79297 13.0625 9.07572 13.0625 10.6582V11.1465C13.0625 11.6119 12.6852 11.9893 12.2197 11.9893H11.6289C11.5358 11.9893 11.46 11.9135 11.46 11.8203C11.4602 11.7274 11.5359 11.6523 11.6289 11.6523H12.2197C12.4989 11.6523 12.7256 11.4259 12.7256 11.1465V10.6582C12.7256 9.26188 11.5936 8.12988 10.1973 8.12988C10.1043 8.12976 10.0293 8.05394 10.0293 7.96094C10.0294 7.86804 10.1044 7.79309 10.1973 7.79297ZM5.12695 0.336914C6.81437 0.336914 8.18262 1.70515 8.18262 3.39258C8.18256 5.07995 6.81433 6.44824 5.12695 6.44824C3.43976 6.44801 2.07233 5.07981 2.07227 3.39258C2.07227 1.70529 3.43972 0.337144 5.12695 0.336914ZM9.52246 1.49512C10.8742 1.49533 11.9697 2.59159 11.9697 3.94336C11.9695 5.29489 10.874 6.39041 9.52246 6.39062C9.35433 6.39062 9.18912 6.37418 9.03027 6.3418C8.96186 6.3277 8.91227 6.27342 8.89941 6.20898V6.14258C8.91803 6.05146 9.00664 5.99242 9.09766 6.01074C9.23444 6.03861 9.37702 6.05371 9.52246 6.05371C10.6879 6.05349 11.6326 5.10872 11.6328 3.94336C11.6328 2.77779 10.688 1.83225 9.52246 1.83203C9.42952 1.83203 9.35374 1.75695 9.35352 1.66406C9.35352 1.57098 9.42938 1.49512 9.52246 1.49512ZM5.12695 0.673828C3.6259 0.674058 2.40918 1.89147 2.40918 3.39258C2.40924 4.89363 3.62593 6.11012 5.12695 6.11035C6.62818 6.11035 7.84564 4.89377 7.8457 3.39258C7.8457 1.89133 6.62821 0.673828 5.12695 0.673828Z" fill="white" stroke="currentColor" strokeWidth="0.674213" />
  </svg>
);

export default function Sidebar_001({ activeMenu, onNavigate }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'beranda_002', Icon: IcBeranda, label: 'Beranda' },
    { id: 'lowongan_001', Icon: IcSeleksi, label: 'Lowongan' },
    { id: 'kandidat_001', Icon: IcKandidat, label: 'Kandidat' },
  ];

  return (
    <>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <div className="sidebar-section">
            <div className="section-title">Menu Utama</div>
            {menuItems.map(item => {
              const isActive = activeMenu === item.id ||
                ((activeMenu === 'beranda' || activeMenu === 'beranda_001' || activeMenu === 'beranda_002') && (item.id === 'beranda_001' || item.id === 'beranda_002')) ||
                ((activeMenu === 'seleksi-detail' || activeMenu === 'seleksi-detail_001' || activeMenu === 'seleksi-detail_002' ||
                  activeMenu === 'lowongan-detail' || activeMenu === 'lowongan-detail_001' || activeMenu === 'lowongan-detail_002' ||
                  activeMenu === 'setup-penilaian' || activeMenu === 'setup-penilaian_001' ||
                  activeMenu === 'buat-lowongan' || activeMenu === 'buat-lowongan_001' ||
                  activeMenu === 'seleksi-tambah-kandidat' || activeMenu === 'lowongan-tambah-kandidat') && item.id === 'lowongan_001');
              return (
                <a
                  key={item.id}
                  href="#"
                  data-menu={item.id}
                  className={`menu-item${isActive ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                >
                  <div className="menu-item-left">
                    <div className="menu-item-icon-box">
                      <item.Icon />
                    </div>
                    <span>{item.label}</span>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="section-title">Pengaturan</div>
            <a
              href="#"
              data-menu="pengaturan"
              className={`menu-item${activeMenu === 'pengaturan' || activeMenu === 'pengguna-akun' || activeMenu === 'paket-langganan' ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('pengguna-akun'); }}
            >
              <div className="menu-item-left">
                <div className="menu-item-icon-box">
                  <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <circle cx="12" cy="11" r="3"></circle>
                    <path d="M8 17a4 4 0 0 1 8 0"></path>
                  </svg>
                </div>
                <span>Akun dan Profil</span>
              </div>
            </a>
          </div>
        </div>

        <div className="sidebar-footer">

          <a
            id="btn-bantuan"
            href="#"
            className={`sidebar-footer-item${activeMenu === 'bantuan_001' ? ' active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('bantuan_001'); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
              <line x1="19.07" y1="4.93" x2="14.83" y2="9.17"></line>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
              <line x1="9.17" y1="14.83" x2="4.93" y2="19.07"></line>
            </svg>
            <span>Bantuan</span>
          </a>
          <a href="#" className="sidebar-footer-item sidebar-footer-item--danger" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Keluar</span>
          </a>
        </div>
      </div>

      {showLogoutModal && (
        <PopupKonfirmasi
          title="Keluar dari Akun?"
          body="Apakah Anda yakin ingin keluar?"
          confirmLabel="Keluar"
          onConfirm={() => { setShowLogoutModal(false); onNavigate('landingpage_001'); }}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
