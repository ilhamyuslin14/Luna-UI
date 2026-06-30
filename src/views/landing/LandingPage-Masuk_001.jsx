import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LandingPageMasuk_001({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      // App.jsx will automatically handle redirect to 'beranda'
    } catch (err) {
      setErrorMsg(err.message || 'Gagal masuk. Silakan cek kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = email.trim() && password.trim();

  return (
    <div className="lpm-page lp-_001-container">

      {/* ── Visual Panel (now physically on the left in DOM) ── */}
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
              Bangun Ekosistem Rekrutmen Anda            </h1>
            <p className="lpm-left-subtitle" style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', lineHeight: '1.8', fontWeight: '400' }}>
              LUNA ATS memadukan kecerdasan buatan dengan desain intuitif untuk menyortir, menganalisis, dan memilih kandidat terbaik dari ribuan pelamar. Nikmati alur kerja yang terstruktur dan tingkatkan efisiensi waktu hiring Anda hingga 3x lebih cepat.
            </p>
          </div>

          {/* Copyright di kiri bawah frame kaca */}
          <div style={{ position: 'absolute', bottom: '40px', left: '56px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            &copy; 2026 LUNA
          </div>
        </div>
      </div>

      {/* ── Form Panel (now physically on the right in DOM) ── */}
      <div className="lpm-right" style={{ width: '46.6%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(40px, 10%, 150px)', background: '#fff', position: 'relative', zIndex: 10, boxShadow: '-8px 0 16px rgba(0, 0, 0, 0.15)' }}>

        <div className="lpm-form-wrap" style={{ width: '100%' }}>

          {/* Heading */}
          <div className="lpm-heading">
            <div className="lpm-right-logo" style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              zIndex: 10
            }}>
              <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
            </div>
            <div className="lpm-heading-text">
              <h2 className="lpm-title">Selamat Datang</h2>
              <p className="lpm-subtitle">Silakan masuk ke workspace LUNA Anda.</p>
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="lpm-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="lpm-field">
              <label className="lpm-label">Email Kerja</label>
              <input
                className="lpm-input"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lpm-field">
              <div className="lpm-label-row">
                <label className="lpm-label">Password</label>
                <button type="button" className="lpm-forgot" onClick={() => navigate?.('landingpage-lupa-password_001')}>Lupa password?</button>
              </div>
              <div className="lpm-pass-wrap">
                <input
                  className="lpm-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lpm-pass-toggle"
                  onClick={() => setShowPass(v => !v)}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Memproses…
                </>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Register */}
          <p className="lpm-register">
            Belum punya akun?{' '}
            <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-daftar_001')}>
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
