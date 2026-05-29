export default function KelolaPengguna({ navigate }) {
  return (
    <div className="kp-view">
      <div className="kp-header">
        <h1 className="kp-title">Kelola Pengguna</h1>
        <p className="kp-subtitle">Atur informasi akun, langganan, dan pantau penggunaan kuota PT Arkademi.</p>
      </div>

      <div className="kp-stats-row">
        <div className="kp-card kp-card-plan">
          <div className="kp-status-badge">
            <div className="kp-status-dot"></div>
            ACTIVE PLAN
          </div>
          <div className="kp-plan-info">
            <h2 className="kp-plan-name">Paket Plus</h2>
            <p className="kp-plan-billing">Tagihan berikutnya: 14 April 2026</p>
          </div>
        </div>

        <div className="kp-card kp-card-quota">
          <img src="/assets/frame1000007065.svg" className="kp-quota-icon" />
          <div className="kp-quota-info">
            <span className="kp-quota-label">Kuota Lowongan</span>
            <div className="kp-quota-values">
              <span className="kp-quota-current">12</span>
              <span className="kp-quota-total">/ 20</span>
            </div>
            <div className="kp-progress-container">
              <div className="kp-progress-bar" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="kp-card kp-card-quota">
          <img src="/assets/frame1000007066.svg" className="kp-quota-icon" />
          <div className="kp-quota-info">
            <span className="kp-quota-label">Kuota Kandidat</span>
            <div className="kp-quota-values">
              <span className="kp-quota-current">8,500</span>
              <span className="kp-quota-total">/ 10,000</span>
            </div>
            <div className="kp-progress-container">
              <div className="kp-progress-bar" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="kp-settings-section">
        <h2 className="kp-section-title">Pengaturan Akun</h2>
        <div className="kp-settings-grid">
          {[
            { icon: '/assets/kp-user.svg',       title: 'Akun dan Profil',       desc: 'Kelola informasi pribadi, kata sandi, yang terdapat pada akun Anda.', route: 'pengguna-akun' },
            { icon: '/assets/kp-users.svg',      title: 'Pengaturan User',       desc: 'Kelola informasi pribadi, kata sandi, dan preferensi notifikasi akun Anda.', route: 'pengaturan-user' },
            { icon: '/assets/kp-subs.svg',      title: 'Paket & Langganan',     desc: 'Kelola siklus tagihan, perbarui paket langganan LUNA perusahaan Anda.', route: 'paket-langganan' },
            { icon: '/assets/kp-trans.svg',    title: 'Riwayat Transaksi',     desc: 'Lihat riwayat pembayaran dan unduh faktur (invoice) tagihan Anda.', route: 'riwayat-transaksi' },
          ].map((item) => (
            <div 
              className="kp-settings-card" 
              key={item.title} 
              onClick={() => item.route && navigate(item.route)}
              style={item.route ? { cursor: 'pointer' } : {}}
            >
              <div className="kp-setting-icon-wrapper">
                <img src={item.icon} alt={item.title} />
              </div>
              <div className="kp-setting-content">
                <h3 className="kp-setting-title">{item.title}</h3>
                <p className="kp-setting-desc">{item.desc}</p>
              </div>
              <img src="/assets/line242.svg" className="kp-chevron" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
