/* ── Icons ─────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.33A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.6 7.8c.2-.45.4-.46.6-.47.16 0 .35 0 .5 0 .17 0 .4-.06.62.47.23.55.78 1.9.85 2.04.07.14.12.31.02.5-.1.19-.15.3-.3.46-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.28.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.17-.19.7-.82.89-1.1.19-.28.38-.23.63-.14.26.1 1.62.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.16 1.34-.23.66-1.34 1.3-1.86 1.38-.5.09-1.13.13-1.83-.11-.42-.14-.96-.32-1.65-.63-2.9-1.25-4.8-4.16-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42Z" fill="currentColor" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 6.5 7.35 5.6a1 1 0 0 0 1.3 0L20 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18"></polyline>
    </svg>
  );
}

/* ── Main component ──────────────────────────── */
export default function LandingPageVerifikasiMetode_001({ navigate }) {
  return (
    <div className="lpm-page lp-_001-container">

      {/* ── Visual Panel (Left) ── */}
      <div className="lpm-left" style={{ width: '53.4%', minHeight: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--luna-orange-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="lpm-pattern lpm-pattern-1"></div>
        <div className="lpm-pattern lpm-pattern-2"></div>
        <div className="lpm-pattern lpm-pattern-3"></div>

        <div className="lpm-left-content" style={{
          position: 'relative',
          padding: '72px 56px 110px 56px',
          width: '85%',
          maxWidth: '680px',
          background: 'rgba(10, 9, 8, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '28px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left'
        }}>
          <div className="lpm-left-copy">
            <h1 className="lpm-left-title" style={{ color: '#fff', fontSize: '48px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              Keamanan Terverifikasi
            </h1>
            <p className="lpm-left-subtitle" style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', lineHeight: '1.8', fontWeight: '400' }}>
              Sistem keamanan ganda LUNA melindungi data perusahaan Anda dengan standar terbaik. Kami memastikan hanya Anda yang memiliki kendali penuh.
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: '40px', left: '56px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            &copy; 2026 LUNA
          </div>
        </div>
      </div>

      {/* ── Form Panel (Right) ── */}
      <div className="lpm-right" style={{ width: '46.6%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(40px, 10%, 150px)', background: '#fff', position: 'relative', zIndex: 10, boxShadow: '-8px 0 16px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>

        <div className="lpm-form-wrap" style={{ width: '100%' }}>
          <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent', overflow: 'visible' }}>

            <div className="lpotp-head" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '28px' }}>
              <div className="lpotp-title-block lpm-heading">
                <div className="lpm-right-logo" style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 10 }}>
                  <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
                </div>
                <div className="lpm-heading-text">
                  <h2 className="lpm-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Pilih Metode Verifikasi</h2>
                  <p className="lpm-subtitle">Pilih cara Anda ingin menerima kode verifikasi untuk mengamankan akun.</p>
                </div>
              </div>
            </div>

            <div className="lpotp-method-list">
              <button type="button" className="lpotp-method-card" onClick={() => navigate?.('landingpage-otp_001')}>
                <div className="lpotp-method-icon-wrap"><WhatsAppIcon /></div>
                <div className="lpotp-method-text">
                  <span className="lpotp-method-title">Verifikasi via WhatsApp</span>
                  <span className="lpotp-method-desc">Kode dikirim melalui pesan WhatsApp ke nomor Anda</span>
                </div>
                <span className="lpotp-method-arrow"><ArrowIcon /></span>
              </button>

              <button type="button" className="lpotp-method-card" onClick={() => navigate?.('landingpage-otp-email_001')}>
                <div className="lpotp-method-icon-wrap"><EmailIcon /></div>
                <div className="lpotp-method-text">
                  <span className="lpotp-method-title">Verifikasi via Email</span>
                  <span className="lpotp-method-desc">Kode dikirim ke alamat email yang Anda daftarkan</span>
                </div>
                <span className="lpotp-method-arrow"><ArrowIcon /></span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
