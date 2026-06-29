import { useState, useEffect } from 'react';

export default function LandingPageLupaPassword_001({ navigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <div className="lpm-page lp-_001-container">

      {/* ── Visual Panel (Left) ── */}
      <div className="lpm-left" style={{ width: '53.4%', minHeight: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--luna-orange-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* CSS Patterns */}
        <div className="lpm-pattern lpm-pattern-1"></div>
        <div className="lpm-pattern lpm-pattern-2"></div>
        <div className="lpm-pattern lpm-pattern-3"></div>

        {/* Glassmorphism Frame */}
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

          {/* Headline + subtitle */}
          <div className="lpm-left-copy">
            <h1 className="lpm-left-title" style={{ color: '#fff', fontSize: '48px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              Pemulihan Akses Cepat & Aman
            </h1>
            <p className="lpm-left-subtitle" style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', lineHeight: '1.8', fontWeight: '400' }}>
              Keamanan akun Anda adalah prioritas kami. Sistem LUNA memastikan hanya Anda yang memiliki akses penuh ke dalam ekosistem rekrutmen perusahaan Anda.
            </p>
          </div>

          {/* Copyright di kiri bawah frame kaca */}
          <div style={{ position: 'absolute', bottom: '40px', left: '56px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            &copy; 2026 LUNA
          </div>
        </div>
      </div>

      {/* ── Form Panel (Right) ── */}
      <div className="lpm-right" style={{ width: '46.6%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(40px, 10%, 150px)', background: '#fff', position: 'relative', zIndex: 10, boxShadow: '-8px 0 16px rgba(0, 0, 0, 0.15)' }}>

        {/* Logo LUNA di pojok kanan atas form panel */}
        <div className="lpm-right-logo" style={{
          position: 'absolute',
          top: '40px',
          right: '40px',
          zIndex: 10
        }}>
          <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
        </div>

        <div className="lpm-form-wrap" style={{ width: '100%' }}>

          {!sent ? (
            <>
              {/* Heading */}
              <div className="lpm-heading">
                <h2 className="lpm-title">Lupa Password?</h2>
                <p className="lpm-subtitle">Masukkan email terdaftar Anda untuk mengatur ulang sandi.</p>
              </div>

              {/* Form */}
              <form className="lpm-form" onSubmit={handleSubmit}>
                <div className="lpm-field">
                  <label className="lpm-label">Email Terdaftar</label>
                  <input
                    className="lpm-input"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    style={{ borderColor: email && !isValid ? '#ef4444' : '' }}
                  />
                </div>

                <button
                  type="submit"
                  className={`lpm-submit${loading ? ' lpm-loading' : ''}${!isValid && !loading ? ' lpm-disabled' : ''}`}
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <>
                      <svg className="lpm-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                      </svg>
                      Mengirim Tautan…
                    </>
                  ) : 'Kirim Tautan Reset'}
                </button>
              </form>

              {/* Back link */}
              <p className="lpm-register" style={{ marginTop: '32px' }}>
                <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-masuk_001')} style={{ fontSize: '14px' }}>
                  &larr; Kembali ke Login
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="lpm-heading" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <h2 className="lpm-title">Email Terkirim!</h2>
                <p className="lpm-subtitle" style={{ marginTop: '12px' }}>
                  Tautan untuk mengatur ulang password telah dikirim ke <strong style={{ color: '#111827' }}>{email}</strong>. Cek kotak masuk Anda.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-masuk_001')} style={{ fontSize: '14px' }}>
                  &larr; Kembali ke Login
                </button>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}
