import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/* Sama seperti planCardVariants di Sidebar.jsx. Untuk perusahaan dengan
   companyPlan === 'free', kartu ini otomatis terkunci ke varian "free" dan
   klik-nya dinonaktifkan (lihat isFreePlan di bawah). Varian lain (basic,
   trial, plus, berakhir) belum tersambung ke data asli, jadi klik kartu
   tetap cycle antar tier sebagai preview desain. */
const PLAN_VARIANT_ORDER = ['berakhir', 'trial', 'free', 'basic', 'plus'];

const PLAN_VARIANTS = {
  basic: {
    className: 'kp-panel--basic',
    label: 'PAKET SAAT INI',
    name: 'Basic',
    expiry: 'Aktif s.d : 31 Des 2026',
  },
  trial: {
    className: 'kp-panel--trial',
    label: 'PAKET SAAT INI',
    name: 'Trial',
    expiry: 'Aktif s.d : 31 Des 2026',
  },
  free: {
    className: 'kp-panel--free',
    label: 'PAKET SAAT INI',
    name: 'Free',
    expiry: 'Aktif s.d : 31 Des 2026',
  },
  plus: {
    className: 'kp-panel--plus',
    label: 'PAKET SAAT INI',
    name: 'Plus',
    expiry: 'Aktif s.d : 31 Des 2026',
  },
  berakhir: {
    className: 'kp-panel--berakhir',
    label: 'PAKET SAAT INI',
    name: 'Berakhir',
    expiry: 'Berakhir pada : 31 Des 2026',
    showQuota: false,
    buttonLabel: 'Pilih Paket',
  },
};

const DEFAULT_PLAN_INDEX = PLAN_VARIANT_ORDER.indexOf('basic');

export default function KelolaPengguna({ navigate }) {
  const { companyName, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const [planIndex, setPlanIndex] = useState(DEFAULT_PLAN_INDEX);
  const cyclePlan = () => {
    if (isFreePlan) return;
    setPlanIndex(i => (i + 1) % PLAN_VARIANT_ORDER.length);
  };

  const initials = (companyName || 'PT')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const plan = isFreePlan ? PLAN_VARIANTS.free : PLAN_VARIANTS[PLAN_VARIANT_ORDER[planIndex]];

  return (
    <div className="kp-view">
      <div className="kp-page">
        <div className={`kp-panel ${plan.className}`} onClick={cyclePlan} style={{ cursor: isFreePlan ? 'default' : 'pointer' }}>
          <div className="kp-panel-top">
            <div className="kp-avatar">{initials}</div>
            <div className="kp-company">{companyName || 'Perusahaan Anda'}</div>
          </div>

          <div className="kp-panel-plan">
            <span className="kp-plan-badge">
              <span className="kp-plan-dot"></span>{plan.label}
            </span>
            <div className="kp-plan-name">{plan.name}</div>
            <div className="kp-plan-billing">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, marginRight: 2 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{plan.expiry}</span>
            </div>
          </div>

          {plan.showQuota !== false ? (
            <>
              <div className="kp-panel-divider"></div>
              <div className="kp-panel-quota-stack">
                <div className="kp-panel-quota">
                  <span className="kp-panel-quota-label">Kuota Lowongan</span>
                  <span className="kp-panel-quota-val">12 <small>/ 20</small></span>
                  <div className="kp-panel-quota-bar"><span style={{ width: '60%' }}></span></div>
                </div>
                <div className="kp-panel-quota">
                  <span className="kp-panel-quota-label">Kuota Kandidat</span>
                  <span className="kp-panel-quota-val">8.500 <small>/ 10.000</small></span>
                  <div className="kp-panel-quota-bar"><span style={{ width: '85%' }}></span></div>
                </div>
              </div>
            </>
          ) : (
            <button
              className="kp-upgrade-btn"
              onClick={(e) => { e.stopPropagation(); navigate('paket-langganan'); }}
            >
              {plan.buttonLabel}
            </button>
          )}
        </div>

        <div className="kp-settings-col">
          <div className="kp-settings-head">
            <h2 className="kp-section-title">Pengaturan Akun</h2>
            <p className="kp-settings-sub">Kelola akun, tim, dan langganan perusahaan Anda.</p>
          </div>

          <div className="kp-settings-list">
            {[
              { icon: '/assets/kp-user.svg', title: 'Akun dan Profil', desc: 'Kelola informasi pribadi, kata sandi, yang terdapat pada akun Anda.', route: 'pengguna-akun' },
              { icon: '/assets/kp-users.svg', title: 'Pengaturan User', desc: 'Kelola informasi pribadi, kata sandi, dan preferensi notifikasi akun Anda.', route: 'pengaturan-user' },
              { icon: '/assets/kp-subs.svg', title: 'Paket & Langganan', desc: 'Kelola siklus tagihan, perbarui paket langganan LUNA perusahaan Anda.', route: 'paket-langganan' },
              { icon: '/assets/kp-trans.svg', title: 'Riwayat Transaksi', desc: 'Lihat riwayat pembayaran dan unduh faktur (invoice) tagihan Anda.', route: 'riwayat-transaksi' },
            ].map((item) => (
              <div
                className="kp-settings-row"
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
    </div>
  );
}
