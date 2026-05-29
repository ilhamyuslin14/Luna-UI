const Navbar = () => `
  <div class="navbar-brand">
    <div class="brand-top">
      <div class="brand-logo">
        <img src="/assets/logo-icon.png" alt="Luna Logo">
      </div>
      <span class="brand-title">LUNA</span>
    </div>
    <div class="brand-subtitle">By Arkademi</div>
  </div>

  <div class="search-container">
    <div class="search-wrapper">
      <span class="search-placeholder">Pencarian</span>
      <img src="/assets/group1000006025.svg" class="search-icon" alt="Search">
    </div>
  </div>

  <div class="navbar-actions">
    <div class="user-profile">
      <div class="user-avatar">
        <img src="/assets/layer2.svg" alt="User Avatar">
      </div>
      <div class="user-info">
        <span class="user-name">Dito Arkademi</span>
        <div class="user-role-container">
          <span class="user-role">Admin</span>
          <div class="role-divider"></div>
          <span class="user-role">PT Arkademi</span>
        </div>
      </div>
    </div>
  </div>
`;

const Sidebar = () => `
  <div class="sidebar-content">
    <div class="sidebar-top">
      <!-- Plan Card -->
      <div class="plan-card">
        <img src="/assets/ellipse46.svg" alt="" class="plan-bg-ellipse">
        <div class="plan-header">
          <div class="plan-label">PAKET SAAT INI</div>
          <div class="plan-name">Basic</div>
          <div class="plan-expiry">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8; margin-right: 2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Aktif s.d : 31 Des 2026</span>
          </div>
        </div>

        <div class="plan-stats">
          <div class="stat-item">
            <div class="stat-info">
              <span>Total Posisi</span>
              <div class="stat-value">
                <span class="font-bold">15</span>
                <span>/ 15</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 100%"></div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-info">
              <span>Total Kandidat</span>
              <div class="stat-value">
                <span class="font-bold">5000</span>
                <span>/ 5000</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 35%"></div>
            </div>
          </div>
        </div>

        <button class="upgrade-btn">Upgrade Paket</button>
      </div>

      <!-- Menu Utama -->
      <div class="sidebar-section">
        <div class="section-title">Menu Utama</div>
        <a href="#" class="menu-item active" data-menu="dashboard">
          <img src="/assets/frame1000006975.svg" alt="Beranda">
          <span>Beranda</span>
        </a>
        <a href="#" class="menu-item" data-menu="departemen">
          <img src="/assets/vector3.svg" alt="Departemen">
          <span>Departemen</span>
        </a>
        <a href="#" class="menu-item" data-menu="lowongan">
          <img src="/assets/group3.svg" alt="Lowongan">
          <span>Seleksi</span>
        </a>
        <a href="#" class="menu-item" data-menu="kandidat">
          <img src="/assets/vector4.svg" alt="Kandidat">
          <span>Kandidat</span>
        </a>
      </div>

      <!-- Pengaturan -->
      <div class="sidebar-section">
        <div class="section-title">Pengaturan</div>
        <a href="#" class="menu-item" data-menu="pengaturan">
          <svg class="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <circle cx="12" cy="11" r="3"></circle>
            <path d="M8 17a4 4 0 0 1 8 0"></path>
          </svg>
          <span>Kelola Pengguna</span>
        </a>
      </div>
    </div>

    <div class="sidebar-footer">
      <a href="#" class="sidebar-footer-item" id="btn-bantuan">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="19.07" y1="4.93" x2="14.83" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="9.17" y1="14.83" x2="4.93" y2="19.07"></line></svg>
        <span>Bantuan</span>
      </a>
      <a href="#" class="sidebar-footer-item" id="btn-keluar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span>Keluar</span>
      </a>
    </div>
  </div>
`;

const Dashboard = () => `
  <div class="db-view">
    <!-- Stats Cards -->
    <div class="db-stats-grid">
      <div class="db-stat-card">
        <div class="db-stat-card-header">
          <div class="db-stat-icon-wrapper" style="background: #eef7fd;">
            <img src="/assets/group1.svg" alt="Talenta">
          </div>
          <div class="db-stat-trend">+124 mgg ini</div>
        </div>
        <div class="db-stat-card-body">
          <div class="db-stat-label">Total Talenta</div>
          <div class="db-stat-value">3,248</div>
        </div>
      </div>
      
      <div class="db-stat-card">
        <div class="db-stat-card-header">
          <div class="db-stat-icon-wrapper" style="background: #ffedff;">
            <img src="/assets/fi8799819.svg" alt="Jobs">
          </div>
          <div class="db-stat-trend">+5 bln ini</div>
        </div>
        <div class="db-stat-card-body">
          <div class="db-stat-label">Lowongan Aktif</div>
          <div class="db-stat-value">12</div>
        </div>
      </div>

      <div class="db-stat-card">
        <div class="db-stat-card-header">
          <div class="db-stat-icon-wrapper" style="background: #e1fce7;">
            <img src="/assets/group4.svg" alt="Hired">
          </div>
          <div class="db-stat-trend">+2 mgg ini</div>
        </div>
        <div class="db-stat-card-body">
          <div class="db-stat-label">Karyawan Direkrut</div>
          <div class="db-stat-value">145</div>
        </div>
      </div>

      <div class="db-stat-card">
        <div class="db-stat-card-header">
          <div class="db-stat-icon-wrapper" style="background: #fff4dd;">
            <img src="/assets/group1000006043.svg" alt="AI Match">
          </div>
          <div class="db-stat-trend">+2.4% vs mgg lalu</div>
        </div>
        <div class="db-stat-card-body">
          <div class="db-stat-label">Rata-rata Kecocokan AI</div>
          <div class="db-stat-value">88%</div>
        </div>
      </div>
    </div>

    <!-- Main Section -->
    <div class="db-main-layout">
      <div class="db-left-column">
        <!-- Quick Actions -->
        <div>
          <div class="db-section-header">
            <h2 class="db-section-title">Aksi Cepat</h2>
          </div>
          <div class="db-actions-grid">
            <div class="db-action-card primary">
              <div class="db-action-info">
                <div class="db-action-name">Setup Penilaian</div>
                <div class="db-action-desc">Mulai setup kriteria penilaian AI untuk role baru.</div>
              </div>
              <div class="db-action-icon-circle">
                <img src="/assets/group.svg" alt="Add">
              </div>
            </div>
            <div class="db-action-card secondary">
              <div class="db-action-info">
                <div class="db-action-name">Import CV Massal</div>
                <div class="db-action-desc">Unggah PDF/ZIP ke Warehouse.</div>
              </div>
              <div class="db-action-icon-circle">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(5.989 8.881)">
                    <path d="M8.78553 3.2778L6.25676 0.728191C5.79102 0.258603 5.17128 0 4.5117 0C3.85213 0 3.23239 0.258603 2.76661 0.728191L0.237877 3.2778C-0.0811424 3.59949 -0.0790097 4.11887 0.242635 4.43789C0.56432 4.75691 1.0837 4.75482 1.40272 4.43313L3.65038 2.16694V10.1309C3.65038 10.5839 4.01763 10.9512 4.47069 10.9512C4.92375 10.9512 5.291 10.5839 5.291 10.1309V2.08421L7.62069 4.43313C7.7811 4.59482 7.99205 4.67578 8.20315 4.67578C8.41192 4.67578 8.62086 4.59654 8.78078 4.43789C9.10242 4.11887 9.10459 3.59949 8.78553 3.2778Z" fill="#171E2C"/>
                  </g>
                  <g transform="translate(0 1.17)">
                    <path d="M18.9492 6.13782V5.59133C18.9492 2.50827 16.4409 0 13.3579 0C12.0154 0 10.7173 0.483 9.70278 1.36008C9.03164 1.94028 8.5123 2.6677 8.18139 3.47611C7.67271 3.21616 7.1046 3.07617 6.52148 3.07617C4.50864 3.07617 2.87109 4.71372 2.87109 6.72656V7.47255C1.22957 7.84063 0 9.29742 0 11.0332C0 12.0083 0.3691 12.9227 1.03934 13.6079C1.71778 14.3016 2.6305 14.6836 3.60938 14.6836H3.89648C4.34954 14.6836 4.7168 14.3163 4.7168 13.8633C4.7168 13.4102 4.34954 13.043 3.89648 13.043H3.60938C2.5054 13.043 1.64062 12.1602 1.64062 11.0332C1.64062 9.925 2.55778 9.02344 3.68509 9.02344H3.69141C4.14446 9.02344 4.51172 8.65618 4.51172 8.20312V6.72656C4.51172 5.61836 5.41328 4.7168 6.52148 4.7168C7.09718 4.7168 7.64642 4.96502 8.02844 5.39782C8.23901 5.63637 8.56849 5.73161 8.87385 5.64223C9.17921 5.55286 9.40533 5.29499 9.45406 4.98057C9.74909 3.0765 11.4273 1.64062 13.3578 1.64062C15.5363 1.64062 17.3086 3.41291 17.3086 5.59133V6.60023C17.3086 6.90375 17.4762 7.18249 17.7443 7.32482C18.7405 7.85355 19.3594 8.88156 19.3594 10.0078C19.3594 11.4335 18.3904 12.6504 17.003 12.9669C16.5613 13.0677 16.285 13.5075 16.3858 13.9492C16.4866 14.3909 16.9264 14.6674 17.368 14.5665C18.3841 14.3346 19.306 13.7581 19.9639 12.9433C20.632 12.1157 21 11.0732 21 10.0078C21 8.44376 20.2256 7.00288 18.9492 6.13782Z" fill="#171E2C"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Jobs -->
        <div>
          <div class="db-section-header" style="align-items: flex-start;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <h2 class="db-section-title">Posisi Terbaru</h2>
              <p style="font-size: 12px; color: var(--color-neutral-600); line-height: 1.4; margin: 0; font-weight: 500;">
                Setiap posisi adalah profil penilaian AI. Upload CV kandidat ke dalamnya Luna akan otomatis memberi skor dan ranking.
              </p>
            </div>
            <a href="#" class="db-view-all-link" style="margin-top: 4px;">Lihat Semua</a>
          </div>
          <div class="db-table-container">
            <div class="db-table-header">
              <div>Posisi</div>
              <div>Departemen</div>
              <div>Kandidat Baru</div>
              <div>Status</div>
            </div>
            
            <div class="db-row">
              <div class="font-semibold">Senior Frontend Engineer</div>
              <div>Engineering</div>
              <div><span class="db-cv-badge">12 CV</span></div>
              <div>
                <div class="db-status-badge">
                  <div class="db-status-icon"><img src="/assets/layer1.svg"></div>
                  <span>Rencana</span>
                </div>
              </div>
            </div>

            <div class="db-row">
              <div class="font-semibold">Product Marketing Manager</div>
              <div>Marketing</div>
              <div><span class="db-cv-badge">12 CV</span></div>
              <div>
                <div class="db-status-badge">
                  <div class="db-status-icon"><img src="/assets/layer1.svg"></div>
                  <span>Rencana</span>
                </div>
              </div>
            </div>

            <div class="db-row">
              <div class="font-semibold">VP of Finance</div>
              <div>Finance</div>
              <div><span class="db-cv-badge">12 CV</span></div>
              <div>
                <div class="db-status-badge">
                  <div class="db-status-icon"><img src="/assets/layer1.svg"></div>
                  <span>Rencana</span>
                </div>
              </div>
            </div>

            <div class="db-row">
              <div class="font-semibold">Senior Frontend Engineer</div>
              <div>Engineering</div>
              <div><span class="db-cv-badge">12 CV</span></div>
              <div>
                <div class="db-status-badge">
                  <div class="db-status-icon"><img src="/assets/layer1.svg"></div>
                  <span>Rencana</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="db-right-column">
        <!-- Recent Activity -->
        <div class="db-activity-card">
          <h2 class="db-section-title">Aktivitas Terbaru</h2>
          <div class="db-activity-list">
            <div class="db-activity-item">
              <div class="db-activity-icon-wrapper" style="background: #eef7fd;">
                <img src="/assets/fi_16116710.svg">
              </div>
              <div class="db-activity-content">
                <div class="db-activity-text">24 CV baru berhasil diparsing AI untuk Senior Frontend Engineer.</div>
                <div class="db-activity-time">Baru saja</div>
              </div>
            </div>

            <div class="db-activity-item">
              <div class="db-activity-icon-wrapper" style="background: #ffedff;">
                <img src="/assets/fi8799820.svg">
              </div>
              <div class="db-activity-content">
                <div class="db-activity-text">Lowongan 'Product Marketing Manager' dipublikasikan.</div>
                <div class="db-activity-time">2 jam yang lalu</div>
              </div>
            </div>

            <div class="db-activity-item">
              <div class="db-activity-icon-wrapper" style="background: #e1fce7;">
                <img src="/assets/fi1004765.svg">
              </div>
              <div class="db-activity-content">
                <div class="db-activity-text">Kandidat 'Rofiq Gonzalez' diubah statusnya menjadi Wawancara.</div>
                <div class="db-activity-time">Kemarin, 14:30 WIB</div>
              </div>
            </div>

            <div class="db-activity-item">
              <div class="db-activity-icon-wrapper" style="background: #eef7fd;">
                <img src="/assets/fi_16116710.svg">
              </div>
              <div class="db-activity-content">
                <div class="db-activity-text">50 CV diimpor massal ke dalam Candidate Warehouse.</div>
                <div class="db-activity-time">Kemarin, 10:15 WIB</div>
              </div>
            </div>

            <div class="db-activity-item">
              <div class="db-activity-icon-wrapper" style="background: #f4f7fb;">
                <img src="/assets/fi3114812.svg">
              </div>
              <div class="db-activity-content">
                <div class="db-activity-text">Kriteria penilaian AI diperbarui untuk Departemen Engineering.</div>
                <div class="db-activity-time">Kemarin, 09:00 WIB</div>
              </div>
            </div>
          </div>
        </div>

        <!-- NPS Widget -->
        <div class="nps-card" id="nps-widget">
          <button class="nps-close-btn" id="nps-close-btn">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="11" y2="11"></line>
              <line x1="11" y1="1" x2="1" y2="11"></line>
            </svg>
          </button>
          <p class="nps-title">Bagaimana kualitas analisa dan scoring kandidat dari LUNA menurut Anda?</p>
          <div class="nps-scores-container">
            <div class="nps-scores-row">
              <button class="nps-score-btn" data-score="1">1</button>
              <button class="nps-score-btn" data-score="2">2</button>
              <button class="nps-score-btn" data-score="3">3</button>
              <button class="nps-score-btn" data-score="4">4</button>
              <button class="nps-score-btn" data-score="5">5</button>
              <button class="nps-score-btn" data-score="6">6</button>
              <button class="nps-score-btn" data-score="7">7</button>
              <button class="nps-score-btn" data-score="8">8</button>
              <button class="nps-score-btn" data-score="9">9</button>
              <button class="nps-score-btn" data-score="10">10</button>
            </div>
            <div class="nps-labels-row">
              <span>SANGAT BURUK</span>
              <span>SANGAT BAIK</span>
            </div>
          </div>
          <button class="nps-submit-btn" id="nps-submit-btn" disabled>Pilih Skor Dulu</button>
        </div>
      </div>
    </div>
  </div>
`;

const Lowongan = () => `
  <div class="lw-view">
    <div class="lw-header-container">
      <h1 class="lw-title">Seleksi</h1>
    </div>

    <div class="lw-actions-bar">
      <div class="lw-left-actions">
        <button class="lw-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Setup Penilaian
        </button>
      </div>
      <div class="lw-right-actions">
        <div class="lw-stats-badge">Jumlah Posisi : <strong>5</strong></div>
        <div class="lw-divider"></div>
        <!-- Bulk Action Dropdown -->
        <div class="lw-bulk-container" id="lw-bulk-container" style="display: none;">
          <button class="lw-btn-bulk" id="lw-btn-bulk">
            <div class="lw-bulk-badge" id="lw-selected-count" style="margin-right: 8px;">0</div> Pilih Aksi <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none" style="margin-left: 4px;"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lw-bulk-dropdown" id="lw-bulk-dropdown">
            <a href="#" class="bulk-dropdown-item" id="lw-btn-bulk-archive">
              <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
              </svg>
              Arsipkan
            </a>
          </div>
        </div>
        <div class="lw-filter-container">
          <button class="lw-btn-filter" id="lw-btn-filter"><img src="/assets/line240.svg"> Filter</button>
          <div class="lw-filter-dropdown" id="lw-filter-dropdown">
            <div class="lw-filter-column w-status">
              <span class="lw-filter-column-title">Status</span>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-status-aktif" class="lw-filter-checkbox">
                <label for="filter-status-aktif">Aktif</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-status-arsip" class="lw-filter-checkbox">
                <label for="filter-status-arsip">Arsip</label>
              </div>
            </div>
            <div class="lw-filter-divider-vertical"></div>
            <div class="lw-filter-column w-alur">
              <span class="lw-filter-column-title">Alur Seleksi</span>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-baru" class="lw-filter-checkbox">
                <label for="filter-alur-baru">Kandidat Baru</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-terseleksi" class="lw-filter-checkbox">
                <label for="filter-alur-terseleksi">Terseleksi</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-diajukan" class="lw-filter-checkbox">
                <label for="filter-alur-diajukan">Diajukan</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-sched" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-sched">Penjadwalan Wawancara</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-hr" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-hr">Wawancara HR</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-akhir" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-akhir">Wawancara Akhir</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-offer" class="lw-filter-checkbox">
                <label for="filter-alur-offer">Penawaran Kerja</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-diterima" class="lw-filter-checkbox">
                <label for="filter-alur-diterima">Diterima</label>
              </div>
            </div>
          </div>
        </div>
        <div class="lw-view-toggle">
          <button class="lw-toggle-item" data-lw-view="papan">
            <img src="/assets/frame1000006975.svg"> Papan
          </button>
          <button class="lw-toggle-item active" data-lw-view="list">
            <img src="/assets/fi_16116710.svg"> List
          </button>
        </div>
      </div>
    </div>

    <div class="lw-table-container">
      <table class="lw-table">
        <thead>
          <tr>
            <th width="24"><input type="checkbox" class="lw-checkbox-all" id="lw-checkbox-all"></th>
            <th width="184">Posisi</th>
            <th width="130">Departemen</th>
            <th width="120">Lokasi</th>
            <th width="145">Status</th>
            <th width="124">Alur Seleksi</th>
            <th width="134">Jumlah Kandidat</th>
            <th width="108">Upah Min</th>
            <th width="100">Upah Maks</th>
            <th width="106">Tanggal Dibuat</th>
            <th width="83">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="checkbox" class="lw-checkbox lw-row-checkbox"></td>
            <td class="lw-posisi clickable" onclick="window.navigateToSeleksiDetail('Project Manager')">Project Manager</td>
            <td>Tech</td>
            <td>Jakarta Selatan</td>
            <td>
              <div class="lw-status-wrapper">
                <div class="lw-status-bubble rencana">
                  <div class="lw-status-content">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div>
                    <span class="lw-status-text">Rencana</span>
                  </div>
                  <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#cbd0db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="lw-status-dropdown">
                  <div class="lw-status-dropdown-item" data-status="rencana">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div> Rencana
                  </div>
                  <div class="lw-status-dropdown-item" data-status="aktif">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div> Aktif
                  </div>
                  <div class="lw-status-dropdown-item" data-status="ditahan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div> Ditahan
                  </div>
                  <div class="lw-status-dropdown-item" data-status="selesai">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div> Selesai
                  </div>
                  <div class="lw-status-dropdown-item" data-status="dibatalkan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div> Dibatalkan
                  </div>
                </div>
              </div>
            </td>
            <td>Tanpa Kandidat</td>
            <td>86</td>
            <td>Rp. 6.000.000</td>
            <td>Rp. 8.000.000</td>
            <td>19 Feb 2026</td>
            <td>
              <div class="lw-actions">
                <button class="lw-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="lw-checkbox lw-row-checkbox"></td>
            <td class="lw-posisi clickable" onclick="window.navigateToSeleksiDetail('Backend Engineer')">Backend Engineer</td>
            <td>Tech</td>
            <td>Jakarta Selatan</td>
            <td>
              <div class="lw-status-wrapper">
                <div class="lw-status-bubble aktif">
                  <div class="lw-status-content">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div>
                    <span class="lw-status-text">Aktif</span>
                  </div>
                  <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#0977be" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="lw-status-dropdown">
                  <div class="lw-status-dropdown-item" data-status="rencana">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div> Rencana
                  </div>
                  <div class="lw-status-dropdown-item" data-status="aktif">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div> Aktif
                  </div>
                  <div class="lw-status-dropdown-item" data-status="ditahan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div> Ditahan
                  </div>
                  <div class="lw-status-dropdown-item" data-status="selesai">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div> Selesai
                  </div>
                  <div class="lw-status-dropdown-item" data-status="dibatalkan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div> Dibatalkan
                  </div>
                </div>
              </div>
            </td>
            <td>Tanpa Kandidat</td>
            <td>86</td>
            <td>Rp. 6.000.000</td>
            <td>Rp. 8.000.000</td>
            <td>19 Feb 2026</td>
            <td>
              <div class="lw-actions">
                <button class="lw-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="lw-checkbox lw-row-checkbox"></td>
            <td class="lw-posisi clickable" onclick="window.navigateToSeleksiDetail('UI/UX Designer')">UI/UX Designer</td>
            <td>Tech</td>
            <td>Jakarta Selatan</td>
            <td>
              <div class="lw-status-wrapper">
                <div class="lw-status-bubble ditahan">
                  <div class="lw-status-content">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div>
                    <span class="lw-status-text">Ditahan</span>
                  </div>
                  <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#fd800c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="lw-status-dropdown">
                  <div class="lw-status-dropdown-item" data-status="rencana">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div> Rencana
                  </div>
                  <div class="lw-status-dropdown-item" data-status="aktif">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div> Aktif
                  </div>
                  <div class="lw-status-dropdown-item" data-status="ditahan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div> Ditahan
                  </div>
                  <div class="lw-status-dropdown-item" data-status="selesai">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div> Selesai
                  </div>
                  <div class="lw-status-dropdown-item" data-status="dibatalkan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div> Dibatalkan
                  </div>
                </div>
              </div>
            </td>
            <td>Tanpa Kandidat</td>
            <td>86</td>
            <td>Rp. 6.000.000</td>
            <td>Rp. 8.000.000</td>
            <td>19 Feb 2026</td>
            <td>
              <div class="lw-actions">
                <button class="lw-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="lw-checkbox lw-row-checkbox"></td>
            <td class="lw-posisi clickable" onclick="window.navigateToSeleksiDetail('Data Analyst')">Data Analyst</td>
            <td>Tech</td>
            <td>Jakarta Selatan</td>
            <td>
              <div class="lw-status-wrapper">
                <div class="lw-status-bubble selesai">
                  <div class="lw-status-content">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div>
                    <span class="lw-status-text">Selesai</span>
                  </div>
                  <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#14b541" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="lw-status-dropdown">
                  <div class="lw-status-dropdown-item" data-status="rencana">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div> Rencana
                  </div>
                  <div class="lw-status-dropdown-item" data-status="aktif">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div> Aktif
                  </div>
                  <div class="lw-status-dropdown-item" data-status="ditahan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div> Ditahan
                  </div>
                  <div class="lw-status-dropdown-item" data-status="selesai">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div> Selesai
                  </div>
                  <div class="lw-status-dropdown-item" data-status="dibatalkan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div> Dibatalkan
                  </div>
                </div>
              </div>
            </td>
            <td>Tanpa Kandidat</td>
            <td>86</td>
            <td>Rp. 6.000.000</td>
            <td>Rp. 8.000.000</td>
            <td>19 Feb 2026</td>
            <td>
              <div class="lw-actions">
                <button class="lw-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="lw-checkbox lw-row-checkbox"></td>
            <td class="lw-posisi clickable" onclick="window.navigateToSeleksiDetail('Frontend Engineer')">Frontend Engineer</td>
            <td>Tech</td>
            <td>Jakarta Selatan</td>
            <td>
              <div class="lw-status-wrapper">
                <div class="lw-status-bubble dibatalkan">
                  <div class="lw-status-content">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div>
                    <span class="lw-status-text">Dibatalkan</span>
                  </div>
                  <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#eb5757" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="lw-status-dropdown">
                  <div class="lw-status-dropdown-item" data-status="rencana">
                    <div class="lw-icon-wrapper"><img src="/assets/status_rencana.svg"></div> Rencana
                  </div>
                  <div class="lw-status-dropdown-item" data-status="aktif">
                    <div class="lw-icon-wrapper"><img src="/assets/status_aktif.svg"></div> Aktif
                  </div>
                  <div class="lw-status-dropdown-item" data-status="ditahan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_ditahan.svg"></div> Ditahan
                  </div>
                  <div class="lw-status-dropdown-item" data-status="selesai">
                    <div class="lw-icon-wrapper"><img src="/assets/status_selesai.svg"></div> Selesai
                  </div>
                  <div class="lw-status-dropdown-item" data-status="dibatalkan">
                    <div class="lw-icon-wrapper"><img src="/assets/status_dibatalkan.svg"></div> Dibatalkan
                  </div>
                </div>
              </div>
            </td>
            <td>Tanpa Kandidat</td>
            <td>86</td>
            <td>Rp. 6.000.000</td>
            <td>Rp. 8.000.000</td>
            <td>19 Feb 2026</td>
            <td>
              <div class="lw-actions">
                <button class="lw-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="lw-pagination">
      <div class="lw-page-container">
        <div class="lw-page-box">1</div>
        <span class="lw-page-text">dari 3</span>
        <div class="lw-page-controls">
          <button class="lw-page-btn prev"><img src="/assets/line244.svg" alt="Prev"></button>
          <div class="lw-page-btn-divider"></div>
          <button class="lw-page-btn next"><img src="/assets/line242.svg" alt="Next"></button>
        </div>
      </div>
    </div>
  </div>
`;

const LowonganBoard = () => {
  const stages = [
    { id: 'belum', title: 'Belum Ada Kandidat', cards: [] },
    {
      id: 'baru', title: 'Kandidat Baru', cards: [
        { posisi: 'Project Manager', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'rencana', statusLabel: 'Rencana' },
        { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'aktif', statusLabel: 'Aktif' },
      ]
    },
    {
      id: 'ditinjau', title: 'Ditinjau', cards: [
        { posisi: 'UI/UX Designer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'ditahan', statusLabel: 'Ditahan' },
      ]
    },
    {
      id: 'diajukan', title: 'Diajukan', cards: [
        { posisi: 'Data Analyst', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'selesai', statusLabel: 'Selesai' },
      ]
    },
    { id: 'penjadwalan', title: 'Penjadwalan Wawancara', cards: [] },
    {
      id: 'wawancara-hr', title: 'Wawancara HR', cards: [
        { posisi: 'Frontend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', status: 'dibatalkan', statusLabel: 'Dibatalkan' },
      ]
    },
    { id: 'wawancara-akhir', title: 'Wawancara Akhir', cards: [] },
    { id: 'penawaran', title: 'Penawaran Kerja', cards: [] },
    { id: 'diterima', title: 'Diterima', cards: [] },
    { id: 'onboarding', title: 'Onboarding', cards: [] },
    { id: 'lolos', title: 'Lolos Masa Percobaan', cards: [] },
  ];

  const menuIcon = `<svg width="3" height="13" viewBox="0 0 3 13" fill="none"><circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1"/><circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1"/><circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1"/></svg>`;
  const collapseIcon = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 7L5 4L8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const cardHtml = (card) => `
    <div class="lw-board-card" draggable="true" ondragstart="window.lwDragStart(event)" ondragend="window.lwDragEnd(event)">
      <div class="lw-board-card-top">
        <span class="lw-board-card-title">${card.posisi}</span>
        <button class="lw-board-card-menu" onclick="event.stopPropagation()">${menuIcon}</button>
      </div>
      <span class="lw-board-card-dept">${card.dept}</span>
      <span class="lw-board-card-loc">${card.lokasi}</span>
      <div class="lw-board-card-footer">
        <div class="lw-board-card-badge ${card.status}">${card.statusLabel}</div>
        <button class="lw-board-card-detail-btn" onclick="window.navigateToSeleksiDetail('${card.posisi}')">Detail</button>
      </div>
    </div>`;

  const colHtml = (stage) => `
    <div class="lw-board-column" data-stage="${stage.id}">
      <div class="lw-board-col-header">
        <div class="lw-board-col-left">
          <span class="lw-board-col-title">${stage.title}</span>
          <span class="lw-board-col-count">${stage.cards.length}</span>
        </div>
        <button class="lw-board-col-collapse-btn" onclick="window.lwColCollapse(this)">${collapseIcon}</button>
      </div>
      <div class="lw-board-col-cards" ondragover="window.lwDragOver(event)" ondragleave="window.lwDragLeave(event)" ondrop="window.lwDrop(event)">
        ${stage.cards.map(cardHtml).join('')}
      </div>
    </div>`;

  return `
  <div class="lw-view">
    <div class="lw-header-container">
      <h1 class="lw-title">Seleksi</h1>
    </div>

    <div class="lw-actions-bar">
      <div class="lw-left-actions">
        <button class="lw-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Setup Penilaian
        </button>
      </div>
      <div class="lw-right-actions">
        <div class="lw-stats-badge">Jumlah Posisi : <strong>5</strong></div>
        <div class="lw-divider"></div>
        <div class="lw-filter-container">
          <button class="lw-btn-filter" id="lw-btn-filter"><img src="/assets/line240.svg"> Filter</button>
          <div class="lw-filter-dropdown" id="lw-filter-dropdown">
            <div class="lw-filter-column w-status">
              <span class="lw-filter-column-title">Status</span>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-status-aktif" class="lw-filter-checkbox">
                <label for="filter-status-aktif">Aktif</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-status-arsip" class="lw-filter-checkbox">
                <label for="filter-status-arsip">Arsip</label>
              </div>
            </div>
            <div class="lw-filter-divider-vertical"></div>
            <div class="lw-filter-column w-alur">
              <span class="lw-filter-column-title">Alur Seleksi</span>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-baru" class="lw-filter-checkbox">
                <label for="filter-alur-baru">Kandidat Baru</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-terseleksi" class="lw-filter-checkbox">
                <label for="filter-alur-terseleksi">Terseleksi</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-diajukan" class="lw-filter-checkbox">
                <label for="filter-alur-diajukan">Diajukan</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-sched" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-sched">Penjadwalan Wawancara</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-hr" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-hr">Wawancara HR</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-wawancara-akhir" class="lw-filter-checkbox">
                <label for="filter-alur-wawancara-akhir">Wawancara Akhir</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-offer" class="lw-filter-checkbox">
                <label for="filter-alur-offer">Penawaran Kerja</label>
              </div>
              <div class="lw-filter-divider-horizontal"></div>
              <div class="lw-filter-item">
                <input type="checkbox" id="filter-alur-diterima" class="lw-filter-checkbox">
                <label for="filter-alur-diterima">Diterima</label>
              </div>
            </div>
          </div>
        </div>
        <div class="lw-view-toggle">
          <button class="lw-toggle-item active" data-lw-view="papan">
            <img src="/assets/frame1000006975.svg"> Papan
          </button>
          <button class="lw-toggle-item" data-lw-view="list">
            <img src="/assets/fi_16116710.svg"> List
          </button>
        </div>
      </div>
    </div>

    <div class="lw-board-container">
      <div class="lw-board-scroll">
        ${stages.map(colHtml).join('')}
      </div>
    </div>

    <div class="lw-pagination">
      <div class="lw-page-container">
        <div class="lw-page-box">1</div>
        <span class="lw-page-text">dari 3</span>
        <div class="lw-page-controls">
          <button class="lw-page-btn prev"><img src="/assets/line244.svg" alt="Prev"></button>
          <div class="lw-page-btn-divider"></div>
          <button class="lw-page-btn next"><img src="/assets/line242.svg" alt="Next"></button>
        </div>
      </div>
    </div>
  </div>
  `;
};

const SeleksiDetail = (namaJabatan = 'Project Manager') => `
  <div class="sd-view">

    <!-- Sticky Title Bar -->
    <div class="sd-title-bar">
      <h1 class="sd-title">${namaJabatan}</h1>
      <button class="sd-title-menu-btn" title="Opsi">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="4" r="1.5" fill="#555f71"/>
          <circle cx="10" cy="10" r="1.5" fill="#555f71"/>
          <circle cx="10" cy="16" r="1.5" fill="#555f71"/>
        </svg>
      </button>
    </div>

    <!-- Sticky Sub-nav Tabs -->
    <div class="sd-subnav">
      <div class="sd-tabs">
        <button class="sd-tab" id="sd-tab-kandidat" onclick="window.sdSwitchTab('kandidat')">Kandidat</button>
        <button class="sd-tab active" id="sd-tab-ringkasan" onclick="window.sdSwitchTab('ringkasan')">Ringkasan</button>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="sd-content">
      <div class="sd-columns">

        <!-- Kolom Kiri -->
        <div class="sd-col-left">

          <!-- Card: Detail Pekerjaan -->
          <div class="sd-card">
            <div class="sd-card-header">
              <span class="sd-card-title">Detail Pekerjaan</span>
              <button class="sd-edit-btn">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
            </div>
            <div class="sd-detail-rows">
              <div class="sd-detail-row">
                <span class="sd-detail-label">Kode Lowongan</span>
                <span class="sd-detail-value">JD000001</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Nama Jabatan</span>
                <span class="sd-detail-value">${namaJabatan}</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Departemen</span>
                <span class="sd-detail-value">Product</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Lokasi</span>
                <span class="sd-detail-value">Tebet, Jakarta Selatan</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Remote</span>
                <span class="sd-detail-value add-data">
                  Tambahkan data
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" stroke-width="1"/>
                    <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Status Rekrutmen</span>
                <span class="sd-detail-value">Aktif</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Jumlah Rekrut (Orang)</span>
                <span class="sd-detail-value">2</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Ikatan Kerja</span>
                <span class="sd-detail-value">Waktu Tidak Tertentu</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Upah Minimal</span>
                <span class="sd-detail-value">Rp 6.000.000</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Upah Maksimum</span>
                <span class="sd-detail-value">Rp 8.000.000</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Siklus Upah</span>
                <span class="sd-detail-value">Bulanan</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Tanggal Mulai Rekrutmen</span>
                <span class="sd-detail-value">Jumat, 20 Februari 2026</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Tanggal Target On-Boarding</span>
                <span class="sd-detail-value">Jumat, 6 Maret 2026</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Minimal Pendidikan</span>
                <span class="sd-detail-value">D4/S1 (Sarjana)</span>
              </div>
              <div class="sd-detail-row">
                <span class="sd-detail-label">Minimal Pengalaman Kerja (Tahun)</span>
                <span class="sd-detail-value">3</span>
              </div>
            </div>
          </div>

          <!-- Card: Deskripsi Pekerjaan -->
          <div class="sd-card">
            <div class="sd-card-header">
              <span class="sd-card-title">Deskripsi Pekerjaan</span>
              <button class="sd-edit-btn">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
            </div>
            <div class="sd-deskripsi-content">
              <h3 class="sd-deskripsi-section-title">Role Overview</h3>
              <p class="sd-deskripsi-p">We are looking for a proactive and results-driven Talent Acquisition Specialist to join our HR team. You will be responsible for the full lifecycle of recruitment, from sourcing and interviewing to closing top-tier candidates. The ideal candidate is a "people person" with a strategic mindset—someone who can identify not just the best skills, but the best cultural fit for our growing team.</p>

              <h4 class="sd-deskripsi-subtitle">Key Responsibilities</h4>
              <ul class="sd-deskripsi-list">
                <li><strong>End-to-End Recruitment:</strong> Manage the entire hiring process, including job posting, resume screening, initial phone interviews, and coordinating final rounds.</li>
                <li><strong>Strategic Sourcing:</strong> Proactively hunt for passive candidates through LinkedIn Recruiter, niche job boards, and professional networks.</li>
                <li><strong>Candidate Experience:</strong> Act as the primary point of contact, ensuring every candidate has a positive, transparent, and professional experience regardless of the outcome.</li>
                <li><strong>Stakeholder Management:</strong> Partner with Hiring Managers to understand their specific needs and provide market insights to help refine job requirements.</li>
                <li><strong>Employer Branding:</strong> Assist in building our brand presence online and offline (career pages, social media, and career fairs).</li>
                <li><strong>Data-Driven Hiring:</strong> Maintain the Applicant Tracking System (ATS) and provide regular reports on hiring metrics like time-to-hire and source quality.</li>
              </ul>

              <h4 class="sd-deskripsi-subtitle">Requirements &amp; Qualifications</h4>
              <ul class="sd-deskripsi-list">
                <li><strong>Experience:</strong> 2–4 years of experience in recruitment (agency or in-house). Experience in [specify industry, e.g., Tech/Retail/Creative] is a plus.</li>
                <li><strong>Communication:</strong> Exceptional verbal and written communication skills in English.</li>
                <li><strong>Tech-Savvy:</strong> Proficiency with ATS platforms (e.g., Greenhouse, Lever, or Workable) and LinkedIn Recruiter.</li>
                <li><strong>Mindset:</strong> A strong hunter mentality with the ability to "sell" the company vision to potential hires.</li>
                <li><strong>Interpersonal Skills:</strong> High emotional intelligence and the ability to build rapport quickly with diverse personalities.</li>
              </ul>
            </div>
          </div>

        </div><!-- /sd-col-left -->

        <!-- Kolom Kanan -->
        <div class="sd-col-right">

          <!-- Card: Kriteria Penilaian -->
          <div class="sd-card">
            <div class="sd-card-header">
              <span class="sd-card-title">Kriteria Penilaian</span>
              <button class="sd-edit-btn">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
            </div>
            <div class="sd-kriteria-content">

              <!-- AI Badge -->
              <div class="sd-ai-badge">
                <div class="sd-ai-icon">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="#0977be"/>
                    <path d="M2 0.5L2.45 2.05L4 2.5L2.45 2.95L2 4.5L1.55 2.95L0 2.5L1.55 2.05L2 0.5Z" fill="#0977be" opacity="0.6"/>
                  </svg>
                </div>
                <div class="sd-ai-text-group">
                  <p class="sd-ai-title">Kriteria Berbasis AI</p>
                  <p class="sd-ai-desc">Untuk membantu akurasi AI telah merangkum kriteria berdasarkan data Job Description.<br>Klik 'Edit' jika ada penyesuaian kriteria.</p>
                </div>
              </div>

              <!-- Sections wrapper -->
              <div class="sd-kriteria-sections">

                <!-- Section: Wajib -->
                <div class="sd-kriteria-section">
                  <div class="sd-kriteria-header">
                    <h3 class="sd-kriteria-section-title primary">Wajib</h3>
                    <span class="sd-kriteria-bobot-label">Bobot Nilai</span>
                  </div>
                  <div class="sd-kriteria-items">
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Minimum 3 years PM experience in tech or software house</li></ul>
                      <span class="sd-bobot-badge tinggi">Tinggi</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Expertise in Agile, Scrum, or Kanban methodologies</li></ul>
                      <span class="sd-bobot-badge tinggi">Tinggi</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Proficiency in Jira, Trello, Asana, or ClickUp</li></ul>
                      <span class="sd-bobot-badge sedang">Sedang</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Strong analytical thinking and task breakdown skills</li></ul>
                      <span class="sd-bobot-badge tinggi">Tinggi</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Proven leadership and team management abilities</li></ul>
                      <span class="sd-bobot-badge sedang">Sedang</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Advanced negotiation and bridge communication skills</li></ul>
                      <span class="sd-bobot-badge sedang">Sedang</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Experience managing timelines, budgets, and resources</li></ul>
                      <span class="sd-bobot-badge rendah">Rendah</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Ability to manage PRD and project documentation</li></ul>
                      <span class="sd-bobot-badge rendah">Rendah</span>
                    </div>
                  </div>
                </div>

                <!-- Section: Nilai Tambah -->
                <div class="sd-kriteria-section">
                  <div class="sd-kriteria-header">
                    <h3 class="sd-kriteria-section-title neutral">Nilai Tambah</h3>
                    <span class="sd-kriteria-bobot-label">Bobot Nilai</span>
                  </div>
                  <div class="sd-kriteria-items">
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>PMP or CSM certification</li></ul>
                      <span class="sd-bobot-badge sedang">Sedang</span>
                    </div>
                    <div class="sd-kriteria-item">
                      <ul class="sd-kriteria-list"><li>Technical background as Developer or QA</li></ul>
                      <span class="sd-bobot-badge rendah">Rendah</span>
                    </div>
                  </div>
                </div>

              </div><!-- /sd-kriteria-sections -->

            </div>
          </div>

        </div><!-- /sd-col-right -->

      </div><!-- /sd-columns -->
    </div><!-- /sd-content -->

  </div><!-- /sd-view -->
`;

const Departemen = () => `
  <div class="dept-view">
    <div class="dept-header-container">
      <h1 class="dept-title">Departemen</h1>
    </div>
    <div class="dept-body">
      <div class="dept-actions-bar">
        <div class="dept-left-actions">
          <button class="dept-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Tambah Departemen
          </button>
        </div>
        <div class="dept-right-actions">
          <div class="dept-stats-badge">Jumlah Departemen : <strong>5</strong></div>
          <div class="dept-divider"></div>
          <!-- Bulk Action Dropdown -->
          <div class="dept-bulk-container" id="dept-bulk-container" style="display: none;">
            <button class="dept-btn-bulk" id="dept-btn-bulk">
              <div class="dept-bulk-badge" id="dept-selected-count" style="margin-right: 8px;">0</div> Pilih Aksi <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none" style="margin-left: 4px;"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="dept-bulk-dropdown" id="dept-bulk-dropdown">
              <a href="#" class="bulk-dropdown-item" id="btn-bulk-archive">
                <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                </svg>
                Arsipkan
              </a>
            </div>
          </div>
          <!-- Filter Dropdown Container -->
          <div class="dept-filter-container">
            <button class="dept-btn-filter" id="dept-btn-filter"><img src="/assets/line240.svg"> Filter</button>
            <div class="dept-filter-dropdown" id="dept-filter-dropdown">
              <a href="#" class="filter-dropdown-item" id="btn-filter-archive">
                <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                </svg>
                Arsipkan
              </a>
              <a href="#" class="filter-dropdown-item" id="btn-filter-delete">
                <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                  <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                  <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                  <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                </svg>
                Delete
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="dept-table-container">
        <table class="dept-table">
          <thead>
            <tr>
              <th width="24"><input type="checkbox" class="dept-checkbox-all" id="dept-checkbox-all"></th>
              <th width="550">Departemen</th>
              <th width="260">Lowongan Terkait</th>
              <th width="159">Create at</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="checkbox" class="dept-checkbox row-checkbox"></td>
              <td class="dept-name">HR</td>
              <td>Backend Engineer</td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>19 Feb 2026</span>
                  <div class="dept-actions">
                    <button class="dept-btn-outline btn-archive">
                      <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                      </svg>
                      Arsipkan
                    </button>
                    <button class="dept-btn-outline btn-delete">
                      <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                        <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                        <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><input type="checkbox" class="dept-checkbox row-checkbox"></td>
              <td class="dept-name">Engineering</td>
              <td>Frontend Developer</td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>19 Feb 2026</span>
                  <div class="dept-actions">
                    <button class="dept-btn-outline btn-archive">
                      <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                      </svg>
                      Arsipkan
                    </button>
                    <button class="dept-btn-outline btn-delete-disabled" disabled>
                      <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                        <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                        <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><input type="checkbox" class="dept-checkbox row-checkbox"></td>
              <td class="dept-name">Marketing</td>
              <td>Social Media Lead</td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>19 Feb 2026</span>
                  <div class="dept-actions">
                    <button class="dept-btn-outline btn-archive">
                      <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                      </svg>
                      Arsipkan
                    </button>
                    <button class="dept-btn-outline btn-delete-disabled" disabled>
                      <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                        <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                        <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><input type="checkbox" class="dept-checkbox row-checkbox"></td>
              <td class="dept-name">Finance</td>
              <td>Head of Finance</td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>19 Feb 2026</span>
                  <div class="dept-actions">
                    <button class="dept-btn-outline btn-archive">
                      <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                      </svg>
                      Arsipkan
                    </button>
                    <button class="dept-btn-outline btn-delete">
                      <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                        <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                        <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><input type="checkbox" class="dept-checkbox row-checkbox"></td>
              <td class="dept-name">Product</td>
              <td>UX Researcher</td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>19 Feb 2026</span>
                  <div class="dept-actions">
                    <button class="dept-btn-outline btn-archive">
                      <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
                      </svg>
                      Arsipkan
                    </button>
                    <button class="dept-btn-outline btn-delete">
                      <svg width="9" height="9" viewBox="0 0 8.1819 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4.5px;">
                        <path d="M7.77272 1.63636H6.54545V1.22727C6.54545 0.901781 6.41615 0.58962 6.18599 0.359462C5.95583 0.129303 5.64367 1.90735e-06 5.31818 1.90735e-06H2.86364C2.53814 1.90735e-06 2.22598 0.129303 1.99582 0.359462C1.76566 0.58962 1.63636 0.901781 1.63636 1.22727V1.63636H0.409091C0.300593 1.63636 0.196539 1.67947 0.11982 1.75618C0.0431005 1.8329 0 1.93696 0 2.04546C0 2.15395 0.0431005 2.25801 0.11982 2.33473C0.196539 2.41145 0.300593 2.45455 0.409091 2.45455H0.433636L0.724091 7.08136C0.756405 7.60157 0.986092 8.08983 1.36624 8.44641C1.74639 8.80299 2.24833 9.001 2.76954 9H5.42045C5.94167 9.001 6.4436 8.80299 6.82375 8.44641C7.20391 8.08983 7.43359 7.60157 7.46591 7.08136L7.74818 2.45455H7.77272C7.88122 2.45455 7.98528 2.41145 8.062 2.33473C8.13871 2.25801 8.18182 2.15395 8.18182 2.04546C8.18182 1.93696 8.13871 1.8329 8.062 1.75618C7.98528 1.67947 7.88122 1.63636 7.77272 1.63636ZM2.45454 1.22727C2.45454 1.11878 2.49765 1.01472 2.57436 0.938003C2.65108 0.861284 2.75514 0.818183 2.86364 0.818183H5.31818C5.42668 0.818183 5.53073 0.861284 5.60745 0.938003C5.68417 1.01472 5.72727 1.11878 5.72727 1.22727V1.63636H2.45454V1.22727ZM6.64363 7.03227C6.62385 7.34411 6.48586 7.63665 6.25781 7.85026C6.02976 8.06387 5.72882 8.18244 5.41636 8.18182H2.76545C2.45299 8.18244 2.15205 8.06387 1.92401 7.85026C1.69596 7.63665 1.55797 7.34411 1.53818 7.03227L1.25182 2.45455H6.93L6.64363 7.03227Z" fill="currentColor"/>
                        <path d="M3.27273 3.68182C3.16423 3.68182 3.06017 3.72492 2.98345 3.80164C2.90674 3.87836 2.86363 3.98241 2.86363 4.09091V6.54545C2.86363 6.65395 2.90674 6.75801 2.98345 6.83472C3.06017 6.91144 3.16423 6.95454 3.27273 6.95454C3.38122 6.95454 3.48528 6.91144 3.562 6.83472C3.63872 6.75801 3.68182 6.65395 3.68182 6.54545V4.09091C3.68182 3.98241 3.63872 3.87836 3.562 3.80164C3.48528 3.72492 3.38122 3.68182 3.27273 3.68182Z" fill="currentColor"/>
                        <path d="M4.90909 3.68182C4.80059 3.68182 4.69654 3.72492 4.61982 3.80164C4.5431 3.87836 4.5 3.98241 4.5 4.09091V6.54545C4.5 6.65395 4.5431 6.75801 4.61982 6.83472C4.69654 6.91144 4.80059 6.95454 4.90909 6.95454C5.01759 6.95454 5.12164 6.91144 5.19836 6.83472C5.27508 6.75801 5.31818 6.65395 5.31818 6.54545V4.09091C5.31818 3.98241 5.27508 3.87836 5.19836 3.80164C5.12164 3.72492 5.01759 3.68182 4.90909 3.68182Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="dept-pagination">
        <div class="dept-page-container">
          <div class="dept-page-box">1</div>
          <span class="dept-page-text">dari 3</span>
          <div class="dept-page-controls">
            <button class="dept-page-btn prev"><img src="/assets/line244.svg" alt="Prev"></button>
            <div class="dept-page-btn-divider"></div>
            <button class="dept-page-btn next"><img src="/assets/line242.svg" alt="Next"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
const Kandidat = () => `
  <div class="kan-view">
    <div class="kan-header-container">
      <h1 class="kan-title">Kandidat</h1>
    </div>

    <div class="kan-actions-bar">
      <div class="kan-left-actions">
        <button class="kan-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Tambah Kandidat
        </button>
      </div>
      <div class="kan-right-actions">
        <div class="kan-stats-badge">Jumlah Kandidat : <strong>8</strong></div>
        <div class="kan-divider"></div>
        <!-- Bulk Action Dropdown -->
        <div class="kan-bulk-container" id="kan-bulk-container" style="display: none;">
          <button class="kan-btn-bulk" id="kan-btn-bulk">
            <div class="kan-bulk-badge" id="kan-selected-count" style="margin-right: 8px;">0</div> Pilih Aksi <svg class="chevron-down" width="8" height="6" viewBox="0 0 10 6" fill="none" style="margin-left: 4px;"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="kan-bulk-dropdown" id="kan-bulk-dropdown">
            <a href="#" class="bulk-dropdown-item" id="kan-btn-bulk-addjob">
              <svg width="9" height="9" viewBox="0 0 9 8.745" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.875 2.25H6.75V1.6875C6.75 1.06641 6.24609 0.5625 5.625 0.5625H3.375C2.75391 0.5625 2.25 1.06641 2.25 1.6875V2.25H1.125C0.503906 2.25 0 2.75391 0 3.375V7.3125C0 7.93359 0.503906 8.4375 1.125 8.4375H7.875C8.49609 8.4375 9 7.93359 9 7.3125V3.375C9 2.75391 8.49609 2.25 7.875 2.25ZM3 1.6875C3 1.47891 3.16875 1.3125 3.375 1.3125H5.625C5.83125 1.3125 6 1.47891 6 1.6875V2.25H3V1.6875ZM8.25 7.3125C8.25 7.51875 8.08125 7.6875 7.875 7.6875H1.125C0.91875 7.6875 0.75 7.51875 0.75 7.3125V5.25H8.25V7.3125ZM8.25 4.5H0.75V3.375C0.75 3.16875 0.91875 3 1.125 3H7.875C8.08125 3 8.25 3.16875 8.25 3.375V4.5Z" fill="currentColor"/>
              </svg>
              Tambahkan ke Lowongan
            </a>
            <div class="kan-bulk-dropdown-divider"></div>
            <a href="#" class="bulk-dropdown-item" id="kan-btn-bulk-archive">
              <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
              </svg>
              Arsipkan
             </a>
          </div>
        </div>
        <div class="kan-filter-container">
          <button class="kan-btn-filter" id="kan-btn-filter"><img src="/assets/line240.svg"> Filter</button>
          <div class="kan-filter-dropdown" id="kan-filter-dropdown">
            <div class="kan-filter-column w-left">
              <span class="kan-filter-column-title">Status</span>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-status-aktif" class="kan-filter-checkbox">
                <label for="filter-kan-status-aktif">Aktif</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-status-arsip" class="kan-filter-checkbox">
                <label for="filter-kan-status-arsip">Arsip</label>
              </div>
              
              <div class="kan-filter-divider-horizontal-thick"></div>
              
              <span class="kan-filter-column-title">Pengalaman</span>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-exp-02" class="kan-filter-checkbox">
                <label for="filter-kan-exp-02">0-2 Tahun</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-exp-25" class="kan-filter-checkbox">
                <label for="filter-kan-exp-25">2-5 tahun</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-exp-510" class="kan-filter-checkbox">
                <label for="filter-kan-exp-510">5-10 tahun</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-exp-10plus" class="kan-filter-checkbox">
                <label for="filter-kan-exp-10plus">&gt;10 tahun</label>
              </div>
            </div>
            
            <div class="kan-filter-divider-vertical"></div>
            
            <div class="kan-filter-column w-right">
              <span class="kan-filter-column-title">Jabatan</span>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-intern" class="kan-filter-checkbox">
                <label for="filter-kan-jab-intern">Intern</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-junior" class="kan-filter-checkbox">
                <label for="filter-kan-jab-junior">Junior</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-staff" class="kan-filter-checkbox">
                <label for="filter-kan-jab-staff">Staff</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-senior" class="kan-filter-checkbox">
                <label for="filter-kan-jab-senior">Senior</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-supervisor" class="kan-filter-checkbox">
                <label for="filter-kan-jab-supervisor">Supervisor</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-manager" class="kan-filter-checkbox">
                <label for="filter-kan-jab-manager">Manager</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-head" class="kan-filter-checkbox">
                <label for="filter-kan-jab-head">Head of</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-gm" class="kan-filter-checkbox">
                <label for="filter-kan-jab-gm">General Manager</label>
              </div>
              <div class="kan-filter-divider-horizontal"></div>
              <div class="kan-filter-item">
                <input type="checkbox" id="filter-kan-jab-advisor" class="kan-filter-checkbox">
                <label for="filter-kan-jab-advisor">Advisor</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="kan-table-container">
      <table class="kan-table">
        <thead>
          <tr>
            <th width="40"><input type="checkbox" class="kan-checkbox-all" id="kan-checkbox-all"></th>
            <th width="250">Nama Kandidat</th>
            <th width="200">Jabatan</th>
            <th width="160">Perusahaan</th>
            <th width="110">Pengalaman</th>
            <th width="190">Domisili</th>
            <th width="150"></th>
            <th width="100"></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="checkbox" class="kan-checkbox kan-row-checkbox"></td>
            <td class="kan-name">Arif Jackberwin</td>
            <td>
              <div class="kan-jabatan-container">
                <div class="kan-jabatan">Junior Human Resources</div>
                <div class="kan-periode">Jan 2024 – Okt 2024</div>
              </div>
            </td>
            <td>PT. Indah Jaya</td>
            <td>10 Tahun</td>
            <td>Jakarta Selatan, Indonesia</td>
            <td>linkedin.com/in/aula...</td>
            <td>
              <div class="kan-actions">
                <button class="kan-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="kan-checkbox kan-row-checkbox"></td>
            <td class="kan-name">Rofiq Gonzalez</td>
            <td>
              <div class="kan-jabatan-container">
                <div class="kan-jabatan">Senior Frontend Engineer</div>
                <div class="kan-periode">Feb 2020 – Jan 2024</div>
              </div>
            </td>
            <td>Tech Global Corp</td>
            <td>4 Tahun</td>
            <td>Bandung, Indonesia</td>
            <td>linkedin.com/in/rofiq...</td>
            <td>
              <div class="kan-actions">
                <button class="kan-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="kan-checkbox kan-row-checkbox"></td>
            <td class="kan-name">Dito Arkademi</td>
            <td>
              <div class="kan-jabatan-container">
                <div class="kan-jabatan">Admin Manager</div>
                <div class="kan-periode">Mar 2022 – Sekarang</div>
              </div>
            </td>
            <td>PT Arkademi</td>
            <td>2 Tahun</td>
            <td>Tangerang, Indonesia</td>
            <td>linkedin.com/in/dito...</td>
            <td>
              <div class="kan-actions">
                <button class="kan-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="kan-checkbox kan-row-checkbox"></td>
            <td class="kan-name">Siti Fatimah</td>
            <td>
              <div class="kan-jabatan-container">
                <div class="kan-jabatan">UX Designer</div>
                <div class="kan-periode">Jun 2021 – Feb 2024</div>
              </div>
            </td>
            <td>Design Studio Inc</td>
            <td>3 Tahun</td>
            <td>Jakarta Barat, Indonesia</td>
            <td>linkedin.com/in/siti...</td>
            <td>
              <div class="kan-actions">
                <button class="kan-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><input type="checkbox" class="kan-checkbox kan-row-checkbox"></td>
            <td class="kan-name">Budi Santoso</td>
            <td>
              <div class="kan-jabatan-container">
                <div class="kan-jabatan">Backend Developer</div>
                <div class="kan-periode">Jan 2019 – Des 2023</div>
              </div>
            </td>
            <td>Bank Central Asia</td>
            <td>5 Tahun</td>
            <td>Jakarta Pusat, Indonesia</td>
            <td>linkedin.com/in/budi...</td>
            <td>
              <div class="kan-actions">
                <button class="kan-btn-outline"><img src="/assets/archive.svg" style="margin-right: 4.5px;"> Arsipkan</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="kan-pagination">
      <div class="kan-page-container">
        <div class="kan-page-box">1</div>
        <span class="kan-page-text">dari 3</span>
        <div class="kan-page-controls">
          <button class="kan-page-btn prev"><img src="/assets/line244.svg" alt="Prev"></button>
          <div class="kan-page-btn-divider"></div>
          <button class="kan-page-btn next"><img src="/assets/line242.svg" alt="Next"></button>
        </div>
      </div>
    </div>
  </div>
`;

const KelolaPengguna = () => `
  <div class="kp-view">
    <div class="kp-header">
      <h1 class="kp-title">Kelola Pengguna</h1>
      <p class="kp-subtitle">Atur informasi akun, langganan, dan pantau penggunaan kuota PT Arkademi.</p>
    </div>

    <div class="kp-stats-row">
      <!-- Active Plan -->
      <div class="kp-card kp-card-plan">
        <div class="kp-status-badge">
          <div class="kp-status-dot"></div>
          ACTIVE PLAN
        </div>
        <div class="kp-plan-info">
          <h2 class="kp-plan-name">Paket Plus</h2>
          <p class="kp-plan-billing">Tagihan berikutnya: 14 April 2026</p>
        </div>
      </div>

      <!-- Quota Lowongan -->
      <div class="kp-card kp-card-quota">
        <img src="/assets/line201.svg" class="kp-quota-icon" style="opacity: 0.1; position: absolute; left: -9999px;"> <!-- Preload check -->
        <img src="/assets/frame1000007065.svg" class="kp-quota-icon">
        <div class="kp-quota-info">
          <span class="kp-quota-label">Kuota Lowongan</span>
          <div class="kp-quota-values">
            <span class="kp-quota-current">12</span>
            <span class="kp-quota-total">/ 20</span>
          </div>
          <div class="kp-progress-container">
            <div class="kp-progress-bar" style="width: 60%;"></div>
          </div>
        </div>
      </div>

      <!-- Quota Kandidat -->
      <div class="kp-card kp-card-quota">
        <img src="/assets/frame1000007066.svg" class="kp-quota-icon">
        <div class="kp-quota-info">
          <span class="kp-quota-label">Kuota Kandidat</span>
          <div class="kp-quota-values">
            <span class="kp-quota-current">8,500</span>
            <span class="kp-quota-total">/ 10,000</span>
          </div>
          <div class="kp-progress-container">
            <div class="kp-progress-bar" style="width: 85%;"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="kp-settings-section">
      <h2 class="kp-section-title">Pengaturan Akun</h2>
      <div class="kp-settings-grid">
        <!-- Akun dan Profil -->
        <div class="kp-settings-card">
          <div class="kp-setting-icon-wrapper">
            <img src="/assets/vector5.svg" alt="Profile">
          </div>
          <div class="kp-setting-content">
            <h3 class="kp-setting-title">Akun dan Profil</h3>
            <p class="kp-setting-desc">Kelola informasi pribadi, kata sandi, yang terdapat pada akun Anda.</p>
          </div>
          <img src="/assets/line242.svg" class="kp-chevron">
        </div>

        <!-- Pengaturan User -->
        <div class="kp-settings-card">
          <div class="kp-setting-icon-wrapper">
            <img src="/assets/fi1004765.svg" alt="Users">
          </div>
          <div class="kp-setting-content">
            <h3 class="kp-setting-title">Pengaturan User</h3>
            <p class="kp-setting-desc">Kelola informasi pribadi, kata sandi, dan preferensi notifikasi akun Anda.</p>
          </div>
          <img src="/assets/line242.svg" class="kp-chevron">
        </div>

        <!-- Paket & Langganan -->
        <div class="kp-settings-card">
          <div class="kp-setting-icon-wrapper">
            <img src="/assets/fi8799819.svg" alt="Subscription">
          </div>
          <div class="kp-setting-content">
            <h3 class="kp-setting-title">Paket & Langganan</h3>
            <p class="kp-setting-desc">Kelola siklus tagihan, perbarui paket langganan LUNA perusahaan Anda.</p>
          </div>
          <img src="/assets/line242.svg" class="kp-chevron">
        </div>

        <!-- Riwayat Transaksi -->
        <div class="kp-settings-card">
          <div class="kp-setting-icon-wrapper">
            <img src="/assets/fi_16116710.svg" alt="Transactions">
          </div>
          <div class="kp-setting-content">
            <h3 class="kp-setting-title">Riwayat Transaksi</h3>
            <p class="kp-setting-desc">Lihat riwayat pembayaran dan unduh faktur (invoice) tagihan Anda.</p>
          </div>
          <img src="/assets/line242.svg" class="kp-chevron">
        </div>
      </div>
    </div>
  </div>
`;

const EmptyContent = (title) => `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #abb2c1;">
    <h2 style="font-size: 24px; margin-bottom: 10px;">${title}</h2>
    <p>Halaman ini sedang dalam pengembangan.</p>
  </div>
`;

const updateDeptBulkActionsBar = () => {
  const checkedCheckboxes = document.querySelectorAll('.dept-table tbody .row-checkbox:checked');
  const bulkContainer = document.getElementById('dept-bulk-container');
  const countSpan = document.getElementById('dept-selected-count');

  if (bulkContainer && countSpan) {
    const count = checkedCheckboxes.length;
    countSpan.innerText = count;
    if (count > 0) {
      bulkContainer.style.display = 'inline-block';
    } else {
      bulkContainer.style.display = 'none';
      const bulkDropdown = document.getElementById('dept-bulk-dropdown');
      const bulkBtn = document.getElementById('dept-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtn) bulkBtn.classList.remove('active');
    }
  }
};

const updateLwBulkActionsBar = () => {
  const checkedCheckboxes = document.querySelectorAll('.lw-table tbody .lw-row-checkbox:checked');
  const bulkContainer = document.getElementById('lw-bulk-container');
  const countSpan = document.getElementById('lw-selected-count');

  if (bulkContainer && countSpan) {
    const count = checkedCheckboxes.length;
    countSpan.innerText = count;
    if (count > 0) {
      bulkContainer.style.display = 'inline-block';
    } else {
      bulkContainer.style.display = 'none';
      const bulkDropdown = document.getElementById('lw-bulk-dropdown');
      const bulkBtn = document.getElementById('lw-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtn) bulkBtn.classList.remove('active');
    }
  }
};

const updateKanBulkActionsBar = () => {
  const checkedCheckboxes = document.querySelectorAll('.kan-table tbody .kan-row-checkbox:checked');
  const bulkContainer = document.getElementById('kan-bulk-container');
  const countSpan = document.getElementById('kan-selected-count');

  if (bulkContainer && countSpan) {
    const count = checkedCheckboxes.length;
    countSpan.innerText = count;
    if (count > 0) {
      bulkContainer.style.display = 'inline-block';
    } else {
      bulkContainer.style.display = 'none';
      const bulkDropdown = document.getElementById('kan-bulk-dropdown');
      const bulkBtn = document.getElementById('kan-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtn) bulkBtn.classList.remove('active');
    }
  }
};

const sortDeptTable = (sortType) => {
  const tbody = document.querySelector('.dept-table tbody');
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const nameA = a.querySelector('.dept-name').innerText.trim().toLowerCase();
    const nameB = b.querySelector('.dept-name').innerText.trim().toLowerCase();

    if (sortType === 'asc') {
      return nameA.localeCompare(nameB);
    } else if (sortType === 'desc') {
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  tbody.innerHTML = '';
  rows.forEach(row => tbody.appendChild(row));
};

const renderContent = (menuId) => {
  const contentElement = document.getElementById('content');
  if (!contentElement) return;

  switch (menuId) {
    case 'dashboard':
      contentElement.innerHTML = Dashboard();
      break;
    case 'departemen':
      contentElement.innerHTML = Departemen();
      break;
    case 'lowongan':
      contentElement.innerHTML = Lowongan();
      break;
    case 'kandidat':
      contentElement.innerHTML = Kandidat();
      break;
    case 'pengaturan':
      contentElement.innerHTML = KelolaPengguna();
      break;
    default:
      contentElement.innerHTML = Dashboard();
  }
};

window.switchMenu = (menuId) => {
  // Update active state in UI
  document.querySelectorAll('.menu-item').forEach(i => {
    i.classList.remove('active');
    if (i.getAttribute('data-menu') === menuId) {
      i.classList.add('active');
    }
  });

  // Render content
  renderContent(menuId);

  // Toggle main padding class
  const contentEl = document.getElementById('content');
  if (contentEl) {
    if (menuId === 'departemen' || menuId === 'lowongan' || menuId === 'kandidat' || menuId === 'seleksi-detail') {
      contentEl.classList.add('no-padding');
    } else {
      contentEl.classList.remove('no-padding');
    }
  }
};

// Navigate to Seleksi Detail page (called when clicking nama posisi in tabel Seleksi)
window.navigateToSeleksiDetail = (namaJabatan) => {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;
  contentEl.innerHTML = SeleksiDetail(namaJabatan);
  contentEl.classList.add('no-padding');
  // Keep Seleksi active in sidebar
  document.querySelectorAll('.menu-item').forEach(i => {
    i.classList.remove('active');
    if (i.getAttribute('data-menu') === 'lowongan') i.classList.add('active');
  });
};

// Switch tabs inside Seleksi Detail
window.sdSwitchTab = (tabId) => {
  const tabs = document.querySelectorAll('.sd-tab');
  tabs.forEach(t => t.classList.remove('active'));
  const active = document.getElementById('sd-tab-' + tabId);
  if (active) active.classList.add('active');
};


// ─── Board View Drag-and-Drop ────────────────────────────────────
let _lwDraggedCard = null;

window.lwDragStart = (event) => {
  _lwDraggedCard = event.currentTarget;
  event.currentTarget.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
};

window.lwDragEnd = (event) => {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.lw-board-col-cards').forEach(col => col.classList.remove('drag-over'));
  _lwDraggedCard = null;
};

window.lwDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('drag-over');
};

window.lwDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove('drag-over');
  }
};

window.lwDrop = (event) => {
  event.preventDefault();
  const col = event.currentTarget;
  col.classList.remove('drag-over');
  if (_lwDraggedCard && col !== _lwDraggedCard.parentElement) {
    col.appendChild(_lwDraggedCard);
    _lwDraggedCard.classList.remove('dragging');
    document.querySelectorAll('.lw-board-column').forEach(column => {
      const count = column.querySelector('.lw-board-col-cards').children.length;
      const badge = column.querySelector('.lw-board-col-count');
      if (badge) badge.textContent = count;
    });
  }
};

window.lwColCollapse = (btn) => {
  const col = btn.closest('.lw-board-column');
  if (col) col.classList.toggle('collapsed');
};

document.addEventListener('DOMContentLoaded', () => {
  const navbarElement = document.getElementById('navbar');
  const sidebarElement = document.getElementById('sidebar');

  if (navbarElement) navbarElement.innerHTML = Navbar();
  if (sidebarElement) sidebarElement.innerHTML = Sidebar();

  // Initial render (Dashboard)
  renderContent('dashboard');

  document.addEventListener('change', (e) => {
    // Checklist all in Departemen
    if (e.target.id === 'dept-checkbox-all') {
      const isChecked = e.target.checked;
      const rowCheckboxes = document.querySelectorAll('.dept-table tbody .row-checkbox');
      rowCheckboxes.forEach(cb => cb.checked = isChecked);
      updateDeptBulkActionsBar();
    }

    // Individual row checkbox in Departemen
    if (e.target.classList.contains('row-checkbox') && e.target.closest('.dept-table')) {
      const allCheckbox = document.getElementById('dept-checkbox-all');
      const rowCheckboxes = document.querySelectorAll('.dept-table tbody .row-checkbox');
      const checkedCount = document.querySelectorAll('.dept-table tbody .row-checkbox:checked').length;

      if (allCheckbox) {
        allCheckbox.checked = (checkedCount === rowCheckboxes.length);
      }
      updateDeptBulkActionsBar();
    }

    // Checklist all in Lowongan (Seleksi)
    if (e.target.id === 'lw-checkbox-all') {
      const isChecked = e.target.checked;
      const rowCheckboxes = document.querySelectorAll('.lw-table tbody .lw-row-checkbox');
      rowCheckboxes.forEach(cb => cb.checked = isChecked);
      updateLwBulkActionsBar();
    }

    // Individual row checkbox in Lowongan (Seleksi)
    if (e.target.classList.contains('lw-row-checkbox') && e.target.closest('.lw-table')) {
      const allCheckbox = document.getElementById('lw-checkbox-all');
      const rowCheckboxes = document.querySelectorAll('.lw-table tbody .lw-row-checkbox');
      const checkedCount = document.querySelectorAll('.lw-table tbody .lw-row-checkbox:checked').length;

      if (allCheckbox) {
        allCheckbox.checked = (checkedCount === rowCheckboxes.length);
      }
      updateLwBulkActionsBar();
    }

    // Checklist all in Kandidat
    if (e.target.id === 'kan-checkbox-all') {
      const isChecked = e.target.checked;
      const rowCheckboxes = document.querySelectorAll('.kan-table tbody .kan-row-checkbox');
      rowCheckboxes.forEach(cb => cb.checked = isChecked);
      updateKanBulkActionsBar();
    }

    // Individual row checkbox in Kandidat
    if (e.target.classList.contains('kan-row-checkbox') && e.target.closest('.kan-table')) {
      const allCheckbox = document.getElementById('kan-checkbox-all');
      const rowCheckboxes = document.querySelectorAll('.kan-table tbody .kan-row-checkbox');
      const checkedCount = document.querySelectorAll('.kan-table tbody .kan-row-checkbox:checked').length;

      if (allCheckbox) {
        allCheckbox.checked = (checkedCount === rowCheckboxes.length);
      }
      updateKanBulkActionsBar();
    }
  });

  document.addEventListener('click', (e) => {
    const menuItem = e.target.closest('.menu-item');
    if (menuItem) {
      e.preventDefault();
      const menuId = menuItem.getAttribute('data-menu');
      window.switchMenu(menuId);
    }

    // NPS Widget Interactions
    const scoreBtn = e.target.closest('.nps-score-btn');
    if (scoreBtn) {
      e.preventDefault();
      document.querySelectorAll('.nps-score-btn').forEach(btn => btn.classList.remove('active'));
      scoreBtn.classList.add('active');
      const submitBtn = document.getElementById('nps-submit-btn');
      if (submitBtn) {
        submitBtn.innerText = 'Kirim Feedback';
        submitBtn.removeAttribute('disabled');
      }
    }

    const closeBtn = e.target.closest('#nps-close-btn');
    if (closeBtn) {
      e.preventDefault();
      const widget = document.getElementById('nps-widget');
      if (widget) {
        widget.style.display = 'none';
      }
    }

    const submitBtn = e.target.closest('#nps-submit-btn');
    if (submitBtn && !submitBtn.hasAttribute('disabled')) {
      e.preventDefault();
      submitBtn.innerText = 'Terkirim!';
      submitBtn.setAttribute('disabled', 'true');
      setTimeout(() => {
        const widget = document.getElementById('nps-widget');
        if (widget) {
          widget.style.display = 'none';
        }
      }, 1000);
    }

    // Toggle Filter Dropdown in Departemen
    const filterBtn = e.target.closest('#dept-btn-filter');
    if (filterBtn) {
      e.preventDefault();
      const dropdown = document.getElementById('dept-filter-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        filterBtn.classList.toggle('active');
      }
      // Close bulk dropdown if open
      const bulkDropdown = document.getElementById('dept-bulk-dropdown');
      const bulkBtn = document.getElementById('dept-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtn) bulkBtn.classList.remove('active');
      return;
    }

    // Toggle Bulk Action Dropdown in Departemen
    const bulkBtn = e.target.closest('#dept-btn-bulk');
    if (bulkBtn) {
      e.preventDefault();
      const dropdown = document.getElementById('dept-bulk-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        bulkBtn.classList.toggle('active');
      }
      // Close filter dropdown if open
      const filterDropdown = document.getElementById('dept-filter-dropdown');
      const filterBtnEl = document.getElementById('dept-btn-filter');
      if (filterDropdown) filterDropdown.classList.remove('active');
      if (filterBtnEl) filterBtnEl.classList.remove('active');
      return;
    }

    // Filter item click in Departemen
    const filterItem = e.target.closest('.filter-dropdown-item');
    if (filterItem) {
      e.preventDefault();
      const dropdown = document.getElementById('dept-filter-dropdown');
      const filterBtnEl = document.getElementById('dept-btn-filter');
      if (dropdown) dropdown.classList.remove('active');
      if (filterBtnEl) filterBtnEl.classList.remove('active');

      const isDelete = filterItem.id === 'btn-filter-delete';
      const selectedRows = document.querySelectorAll('.dept-table tbody .row-checkbox:checked');

      if (isDelete) {
        if (selectedRows.length > 0) {
          alert(`${selectedRows.length} Departemen berhasil dihapus!`);
          selectedRows.forEach(cb => cb.checked = false);
          const allCheckbox = document.getElementById('dept-checkbox-all');
          if (allCheckbox) allCheckbox.checked = false;
          updateDeptBulkActionsBar();
        } else {
          alert('Pilih departemen terlebih dahulu!');
        }
      } else {
        // Archive
        if (selectedRows.length > 0) {
          alert(`${selectedRows.length} Departemen berhasil diarsipkan!`);
          selectedRows.forEach(cb => cb.checked = false);
          const allCheckbox = document.getElementById('dept-checkbox-all');
          if (allCheckbox) allCheckbox.checked = false;
          updateDeptBulkActionsBar();
        } else {
          alert('Pilih departemen terlebih dahulu!');
        }
      }
      return;
    }

    // Bulk Action "Arsipkan" click in Departemen
    const bulkArchiveBtn = e.target.closest('#btn-bulk-archive');
    if (bulkArchiveBtn) {
      e.preventDefault();
      const selectedRows = document.querySelectorAll('.dept-table tbody .row-checkbox:checked');
      if (selectedRows.length > 0) {
        alert(`${selectedRows.length} Departemen berhasil diarsipkan!`);
        selectedRows.forEach(cb => cb.checked = false);
        const allCheckbox = document.getElementById('dept-checkbox-all');
        if (allCheckbox) allCheckbox.checked = false;
        updateDeptBulkActionsBar();
      }
      const bulkDropdown = document.getElementById('dept-bulk-dropdown');
      const bulkBtnEl = document.getElementById('dept-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtnEl) bulkBtnEl.classList.remove('active');
      return;
    }

    // Toggle Filter Dropdown in Seleksi
    const lwFilterBtn = e.target.closest('#lw-btn-filter');
    if (lwFilterBtn) {
      e.preventDefault();
      const dropdown = document.getElementById('lw-filter-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        lwFilterBtn.classList.toggle('active');
      }
      return;
    }

    // Toggle Bulk Action Dropdown in Seleksi
    const lwBulkBtn = e.target.closest('#lw-btn-bulk');
    if (lwBulkBtn) {
      e.preventDefault();
      const dropdown = document.getElementById('lw-bulk-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        lwBulkBtn.classList.toggle('active');
      }
      // Close filter dropdown if open
      const filterDropdown = document.getElementById('lw-filter-dropdown');
      const filterBtnEl = document.getElementById('lw-btn-filter');
      if (filterDropdown) filterDropdown.classList.remove('active');
      if (filterBtnEl) filterBtnEl.classList.remove('active');
      return;
    }

    // Bulk Action "Arsipkan" click in Seleksi
    const lwBulkArchiveBtn = e.target.closest('#lw-btn-bulk-archive');
    if (lwBulkArchiveBtn) {
      e.preventDefault();
      const selectedRows = document.querySelectorAll('.lw-table tbody .lw-row-checkbox:checked');
      if (selectedRows.length > 0) {
        alert(`${selectedRows.length} Posisi berhasil diarsipkan!`);
        selectedRows.forEach(cb => cb.checked = false);
        const allCheckbox = document.getElementById('lw-checkbox-all');
        if (allCheckbox) allCheckbox.checked = false;
        updateLwBulkActionsBar();
      }
      const bulkDropdown = document.getElementById('lw-bulk-dropdown');
      const bulkBtnEl = document.getElementById('lw-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtnEl) bulkBtnEl.classList.remove('active');
      return;
    }

    // Toggle Status Dropdown in Seleksi
    const statusBubble = e.target.closest('.lw-status-bubble');
    if (statusBubble) {
      e.preventDefault();
      const wrapper = statusBubble.closest('.lw-status-wrapper');
      const dropdown = wrapper.querySelector('.lw-status-dropdown');

      // Close other status dropdowns
      document.querySelectorAll('.lw-status-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

      if (dropdown) dropdown.classList.toggle('active');
      return;
    }

    // Select Status Item in dropdown
    const statusItem = e.target.closest('.lw-status-dropdown-item');
    if (statusItem) {
      e.preventDefault();
      const status = statusItem.getAttribute('data-status');
      const wrapper = statusItem.closest('.lw-status-wrapper');
      const bubble = wrapper.querySelector('.lw-status-bubble');
      const dropdown = wrapper.querySelector('.lw-status-dropdown');

      if (bubble && status) {
        // Reset old status classes
        bubble.className = 'lw-status-bubble ' + status;

        // Update text
        const textSpan = bubble.querySelector('.lw-status-text');
        if (textSpan) {
          textSpan.innerText = statusItem.innerText.trim();
        }

        // Update icon
        const iconImg = bubble.querySelector('.lw-icon-wrapper img');
        if (iconImg) {
          iconImg.src = `/assets/status_${status}.svg`;
        }

        // Update chevron stroke
        const chevronPath = bubble.querySelector('.chevron-down path');
        if (chevronPath) {
          let color = '#7e8799'; // Rencana
          if (status === 'aktif') color = '#0977be';
          else if (status === 'ditahan') color = '#fd800c';
          else if (status === 'selesai') color = '#14b541';
          else if (status === 'dibatalkan') color = '#eb5757';
          chevronPath.setAttribute('stroke', color);
        }
      }

      if (dropdown) dropdown.classList.remove('active');
      return;
    }

    // Toggle Board/List view in Seleksi
    const lwViewToggleBtn = e.target.closest('.lw-toggle-item[data-lw-view]');
    if (lwViewToggleBtn) {
      e.preventDefault();
      const view = lwViewToggleBtn.getAttribute('data-lw-view');
      const contentEl = document.getElementById('content');
      if (!contentEl) return;
      if (view === 'papan') {
        contentEl.innerHTML = LowonganBoard();
      } else {
        contentEl.innerHTML = Lowongan();
      }
      return;
    }

    // Toggle Filter Button in Kandidat
    const kanFilterBtn = e.target.closest('#kan-btn-filter');
    if (kanFilterBtn) {
      e.preventDefault();
      kanFilterBtn.classList.toggle('active');
      const kanFilterDropdown = document.getElementById('kan-filter-dropdown');
      if (kanFilterDropdown) kanFilterDropdown.classList.toggle('active');
      return;
    }

    // Toggle Bulk Action Dropdown in Kandidat
    const kanBulkBtn = e.target.closest('#kan-btn-bulk');
    if (kanBulkBtn) {
      e.preventDefault();
      const dropdown = document.getElementById('kan-bulk-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('active');
        kanBulkBtn.classList.toggle('active');
      }
      return;
    }

    // Bulk Action "Tambahkan ke Lowongan" click in Kandidat
    const kanBulkAddJobBtn = e.target.closest('#kan-btn-bulk-addjob');
    if (kanBulkAddJobBtn) {
      e.preventDefault();
      const selectedRows = document.querySelectorAll('.kan-table tbody .kan-row-checkbox:checked');
      if (selectedRows.length > 0) {
        alert(`${selectedRows.length} Kandidat berhasil ditambahkan ke Lowongan!`);
        selectedRows.forEach(cb => cb.checked = false);
        const allCheckbox = document.getElementById('kan-checkbox-all');
        if (allCheckbox) allCheckbox.checked = false;
        updateKanBulkActionsBar();
      }
      const bulkDropdown = document.getElementById('kan-bulk-dropdown');
      const bulkBtnEl = document.getElementById('kan-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtnEl) bulkBtnEl.classList.remove('active');
      return;
    }

    // Bulk Action "Arsipkan" click in Kandidat
    const kanBulkArchiveBtn = e.target.closest('#kan-btn-bulk-archive');
    if (kanBulkArchiveBtn) {
      e.preventDefault();
      const selectedRows = document.querySelectorAll('.kan-table tbody .kan-row-checkbox:checked');
      if (selectedRows.length > 0) {
        alert(`${selectedRows.length} Kandidat berhasil diarsipkan!`);
        selectedRows.forEach(cb => cb.checked = false);
        const allCheckbox = document.getElementById('kan-checkbox-all');
        if (allCheckbox) allCheckbox.checked = false;
        updateKanBulkActionsBar();
      }
      const bulkDropdown = document.getElementById('kan-bulk-dropdown');
      const bulkBtnEl = document.getElementById('kan-btn-bulk');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtnEl) bulkBtnEl.classList.remove('active');
      return;
    }

    // Individual "Arsipkan" button click in Kandidat table
    const kanRowArchiveBtn = e.target.closest('.kan-table tbody .kan-btn-outline');
    if (kanRowArchiveBtn) {
      e.preventDefault();
      const row = kanRowArchiveBtn.closest('tr');
      const name = row.querySelector('.kan-name').innerText.trim();
      alert(`Kandidat "${name}" berhasil diarsipkan!`);
      return;
    }

    // Close dropdowns when clicking outside
    if (!e.target.closest('.dept-filter-container') && !e.target.closest('.dept-bulk-container') && !e.target.closest('.lw-filter-container') && !e.target.closest('.lw-bulk-container') && !e.target.closest('.lw-status-wrapper') && !e.target.closest('.kan-bulk-container') && !e.target.closest('.kan-filter-container')) {
      const filterDropdown = document.getElementById('dept-filter-dropdown');
      const filterBtnEl = document.getElementById('dept-btn-filter');
      const bulkDropdown = document.getElementById('dept-bulk-dropdown');
      const bulkBtnEl = document.getElementById('dept-btn-bulk');

      if (filterDropdown) filterDropdown.classList.remove('active');
      if (filterBtnEl) filterBtnEl.classList.remove('active');
      if (bulkDropdown) bulkDropdown.classList.remove('active');
      if (bulkBtnEl) bulkBtnEl.classList.remove('active');

      const lwFilterDropdown = document.getElementById('lw-filter-dropdown');
      const lwFilterBtnEl = document.getElementById('lw-btn-filter');
      if (lwFilterDropdown) lwFilterDropdown.classList.remove('active');
      if (lwFilterBtnEl) lwFilterBtnEl.classList.remove('active');

      const lwBulkDropdown = document.getElementById('lw-bulk-dropdown');
      const lwBulkBtnEl = document.getElementById('lw-btn-bulk');
      if (lwBulkDropdown) lwBulkDropdown.classList.remove('active');
      if (lwBulkBtnEl) lwBulkBtnEl.classList.remove('active');

      const kanBulkDropdown = document.getElementById('kan-bulk-dropdown');
      const kanBulkBtnEl = document.getElementById('kan-btn-bulk');
      if (kanBulkDropdown) kanBulkDropdown.classList.remove('active');
      if (kanBulkBtnEl) kanBulkBtnEl.classList.remove('active');

      const kanFilterDropdown = document.getElementById('kan-filter-dropdown');
      const kanFilterBtnEl = document.getElementById('kan-btn-filter');
      if (kanFilterDropdown) kanFilterDropdown.classList.remove('active');
      if (kanFilterBtnEl) kanFilterBtnEl.classList.remove('active');

      document.querySelectorAll('.lw-status-dropdown').forEach(d => {
        d.classList.remove('active');
      });
    }
  });
});
