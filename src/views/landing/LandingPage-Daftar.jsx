import { useState, useEffect } from 'react';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return Math.min(score, 3);
}

const STRENGTH_COLORS = ['#ECEFF4', '#fb484b', '#f8aa01', '#14b541'];
const STRENGTH_LABELS = ['', 'Lemah', 'Sedang', 'Kuat'];

function PasswordStrengthBar({ password }) {
  const strength = getPasswordStrength(password);
  const segments = [1, 2, 3];
  return (
    <div className="lpd-pwbar-wrap">
      <svg viewBox="0 0 371 3" preserveAspectRatio="none" className="lpd-pwbar-svg">
        {segments.map((seg, i) => {
          const x1 = i === 0 ? 1.5 : i === 1 ? 127.833 : 254.167;
          const x2 = i === 0 ? 116.833 : i === 1 ? 243.167 : 369.5;
          const filled = strength >= seg;
          const color = filled ? STRENGTH_COLORS[strength] : '#ECEFF4';
          return (
            <line
              key={seg}
              x1={x1} y1="1.5" x2={x2} y2="1.5"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: 'stroke 0.25s' }}
            />
          );
        })}
      </svg>
      <div className="lpd-pwbar-row">
        <p className="lpd-pw-hint">Minimal 8 karakter, kombinasi huruf, dan angka</p>
        {password && (
          <span className="lpd-pw-label" style={{ color: STRENGTH_COLORS[strength] }}>
            {STRENGTH_LABELS[strength]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandingPageDaftar({ navigate }) {
  const [nama, setNama]         = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isValid = nama.trim() && perusahaan.trim() && email.trim() && password.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate?.('landingpage-otp');
    }, 1400);
  };

  return (
    <div className="lpm-page">

      {/* ── Left panel (identical to masuk) ── */}
      <div className="lpm-left">
        <img src="/assets/landing/lp-masuk-bg.svg" alt="" className="lpm-left-bg" />
        <div className="lpm-left-content">
          <div className="lpm-left-logo">
            <img src="/assets/landing/lp-masuk-logo.svg" alt="LUNA" className="lpm-left-logo-icon" />
            <span className="lpm-left-logo-text">LUNA</span>
          </div>
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
            <h2 className="lpm-title">Mulai Perjalanan Anda</h2>
            <p className="lpm-subtitle">Daftar untuk menikmati trial 14 hari gratis.</p>
          </div>

          {/* Form */}
          <form className="lpm-form" onSubmit={handleSubmit}>

            {/* Nama Lengkap */}
            <div className="lpm-field">
              <label className="lpm-label">Nama Lengkap</label>
              <input
                className="lpm-input"
                type="text"
                placeholder="Budi Satoso"
                value={nama}
                onChange={e => setNama(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Nama Perusahaan */}
            <div className="lpm-field">
              <label className="lpm-label">Nama Perusahaan</label>
              <input
                className="lpm-input"
                type="text"
                placeholder="PT. Inovasi Mandiri"
                value={perusahaan}
                onChange={e => setPerusahaan(e.target.value)}
                autoComplete="organization"
              />
            </div>

            {/* Email Kerja */}
            <div className="lpm-field">
              <label className="lpm-label">Email Kerja</label>
              <input
                className="lpm-input"
                type="email"
                placeholder="budi@perusahaan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password + strength bar */}
            <div className="lpm-field">
              <label className="lpm-label">Password</label>
              <div className="lpm-pass-wrap">
                <input
                  className="lpm-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Buat password yang kuat"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              <PasswordStrengthBar password={password} />
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
              ) : 'Buat Akun'}
            </button>
          </form>

          {/* Login link */}
          <p className="lpm-register">
            Sudah punya akun?{' '}
            <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-masuk')}>
              Masuk di sini
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
