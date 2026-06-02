import { useState } from 'react';

export default function Sidebar({ activeMenu, onNavigate }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: '/assets/frame1000006975.svg', label: 'Beranda' },
    { id: 'departemen', icon: '/assets/vector3.svg', label: 'Departemen' },
    { id: 'seleksi', icon: '/assets/group3.svg', label: 'Seleksi' },
    { id: 'kandidat', icon: '/assets/vector4.svg', label: 'Kandidat' },
  ];

  return (
    <>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <div className="plan-card">
            <img src="/assets/ellipse46.svg" alt="" className="plan-bg-ellipse" />
            <div className="plan-header">
              <div className="plan-label">PAKET SAAT INI</div>
              <div className="plan-name">Basic</div>
              <div className="plan-expiry">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, marginRight: 2 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Aktif s.d : 31 Des 2026</span>
              </div>
            </div>
            <div className="plan-stats">
              <div className="stat-item">
                <div className="stat-info">
                  <span>Total Posisi</span>
                  <div className="stat-value">
                    <span className="font-bold">15</span>
                    <span>/ 15</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-info">
                  <span>Total Kandidat</span>
                  <div className="stat-value">
                    <span className="font-bold">5000</span>
                    <span>/ 5000</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
            <button className="upgrade-btn" onClick={() => onNavigate('paket-langganan')}>
              Upgrade Paket
            </button>
          </div>

          <div className="sidebar-section">
            <div className="section-title">Menu Utama</div>
            {menuItems.map(item => (
              <a
                key={item.id}
                href="#"
                data-menu={item.id}
                className={`menu-item${activeMenu === item.id || ((activeMenu === 'seleksi-detail' || activeMenu === 'setup-penilaian') && item.id === 'seleksi') || (activeMenu === 'departemen-detail' && item.id === 'departemen') ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
              >
                <img src={item.icon} alt={item.label} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="section-title">Pengaturan</div>
            <a
              href="#"
              data-menu="pengaturan"
              className={`menu-item${activeMenu === 'pengaturan' || activeMenu === 'pengguna-akun' || activeMenu === 'paket-langganan' ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('pengaturan'); }}
            >
              <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <circle cx="12" cy="11" r="3"></circle>
                <path d="M8 17a4 4 0 0 1 8 0"></path>
              </svg>
              <span>Kelola Pengguna</span>
            </a>
          </div>
        </div>

        <div className="sidebar-footer">
          <a
            id="btn-bantuan"
            href="#"
            className={`sidebar-footer-item${activeMenu === 'bantuan' ? ' active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('bantuan'); }}
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
          <a href="#" className="sidebar-footer-item" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}>
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
        <div className="dept-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="dept-modal dept-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="dept-modal-confirm-text">
              <p className="dept-modal-title" style={{ fontSize: '18px' }}>Keluar dari Akun?</p>
              <p className="dept-modal-subtitle">
                Apakah Anda yakin ingin keluar?
              </p>
            </div>
            <div className="dept-modal-footer dept-modal-footer-stretch">
              <button className="dept-modal-btn-cancel dept-modal-btn-cancel-lg" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="dept-modal-btn-primary dept-modal-btn-primary-lg" onClick={() => { setShowLogoutModal(false); onNavigate('landingpage'); }}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
