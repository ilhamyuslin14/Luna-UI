import { useState, useEffect } from 'react';

export default function LandingPageMasuk({ navigate }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate?.('beranda');
    }, 1200);
  };

  const isValid = email.trim() && password.trim();

  return (
    <div className="lpm-page">

      {/* ── Left panel ── */}
      <div className="lpm-left">
        <img src="/assets/landing/lp-masuk-bg.svg" alt="" className="lpm-left-bg" />

        <div className="lpm-left-content">
          {/* Logo */}
          <div className="lpm-left-logo">
            <img src="/assets/landing/lp-masuk-logo.svg" alt="LUNA" className="lpm-left-logo-icon" />
            <span className="lpm-left-logo-text">LUNA</span>
          </div>

          {/* Headline + subtitle */}
          <div className="lpm-left-copy">
            <h1 className="lpm-left-title">
              Bangun Ekosistem<br />
              Rekrutmen Anda<br />
              Bersama LUNA.
            </h1>
            <p className="lpm-left-subtitle">
              Sistem ATS cerdas yang terintegrasi dengan AI untuk membantu Anda menemukan dan mengelola talenta terbaik 3x lebih cepat.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="lpm-right">
        <div className="lpm-form-wrap">

          {/* Heading */}
          <div className="lpm-heading">
            <h2 className="lpm-title">Selamat Datang</h2>
            <p className="lpm-subtitle">Silakan masuk ke workspace LUNA Anda.</p>
          </div>

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
                <button type="button" className="lpm-forgot" onClick={() => navigate?.('landingpage-lupa-password')}>Lupa password?</button>
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
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
                    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                  </svg>
                  Memproses…
                </>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Register */}
          <p className="lpm-register">
            Belum punya akun?{' '}
            <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-daftar')}>
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
