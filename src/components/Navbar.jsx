export default function Navbar() {
  return (
    <>
      <div className="navbar-brand">
        <div className="brand-top">
          <div className="brand-logo">
            <img src="/assets/logo-icon.png" alt="Luna Logo" />
          </div>
          <span className="brand-title">LUNA</span>
        </div>
        <div className="brand-subtitle">By Arkademi</div>
      </div>

      <div className="search-container">
        <div className="search-wrapper">
          <span className="search-placeholder">Pencarian</span>
          <img src="/assets/group1000006025.svg" className="search-icon" alt="Search" />
        </div>
      </div>

      <div className="navbar-actions">
        <div className="user-profile">
          <div className="user-avatar">
            <img src="/assets/layer2.svg" alt="User Avatar" />
          </div>
          <div className="user-info">
            <span className="user-name">Dito Arkademi</span>
            <div className="user-role-container">
              <span className="user-role">Admin</span>
              <div className="role-divider"></div>
              <span className="user-role">PT Arkademi</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
