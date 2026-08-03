import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { logSignupIntent } from '../../services/analyticsService.js';

const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconUserSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="18" cy="16" r="2.5" /><line x1="20.5" y1="18.5" x2="22" y2="20" />
  </svg>
);

const IconInfo = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="11" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

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

export default function LandingPageDaftar_001({ navigate }) {
  const [role, setRole] = useState(null); // null | 'hr'
  const [showPelamarInfo, setShowPelamarInfo] = useState(false);
  const [nama, setNama] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChooseRole = (chosen) => {
    logSignupIntent(chosen);
    if (chosen === 'pelamar') setShowPelamarInfo(true);
    else setRole('hr');
  };

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isValid = nama.trim() && perusahaan.trim() && email.trim() && password.length >= 8;

  const { register } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await register(email, password, { nama_lengkap: nama, nama_perusahaan: perusahaan });
      // Redirect ke OTP Email dummy sesuai request
      navigate('landingpage-otp-email_001');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
              LUNA ATS memadukan kecerdasan buatan dengan desain intuitif untuk menyortir, menganalisis, dan memilih kandidat terbaik dari ribuan pelamar. Nikmati alur kerja yang terstruktur dan tingkatkan efisiensi waktu hiring Anda.
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
              <h2 className="lpm-title">{role === 'hr' ? 'Mulai Perjalanan Anda' : 'Selamat Datang di LUNA'}</h2>
              <p className="lpm-subtitle">
                {role === 'hr' ? 'Daftar untuk menikmati trial 14 hari gratis.' : 'Pilih peran Anda untuk melanjutkan pendaftaran.'}
              </p>
            </div>
          </div>

          {!role && (
            <div className="lpd-role-choice">
              <button type="button" className="lpd-role-card" onClick={() => handleChooseRole('hr')}>
                <span className="lpd-role-icon"><IconBriefcase /></span>
                <span className="lpd-role-text">
                  <span className="lpd-role-title">Saya HR / Perusahaan</span>
                  <span className="lpd-role-desc">Pasang lowongan dan kelola kandidat di LUNA.</span>
                </span>
              </button>
              <button type="button" className="lpd-role-card" onClick={() => handleChooseRole('pelamar')}>
                <span className="lpd-role-icon"><IconUserSearch /></span>
                <span className="lpd-role-text">
                  <span className="lpd-role-title">Saya Pencari Kerja</span>
                  <span className="lpd-role-desc">Cari &amp; lamar pekerjaan lewat link lowongan.</span>
                </span>
              </button>
            </div>
          )}

          {role === 'hr' && errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {role === 'hr' && (
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
              <PasswordStrengthBar password={password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`lpm-submit${loading ? ' lpm-loading' : ''}${!isValid && !loading ? ' lpm-disabled' : ''}`}
              disabled={!isValid || loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <svg className="lpm-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                  </svg>
                  Memproses…
                </>
              ) : 'Buat Akun'}
            </button>

            {/* Login link */}
            <p className="lpm-register" style={{ textAlign: 'center', marginTop: '16px' }}>
              Sudah punya akun?{' '}
              <button type="button" className="lpm-register-link" onClick={() => navigate?.('landingpage-masuk_001')}>
                Masuk di sini
              </button>
            </p>
          </form>
          )}
        </div>
      </div>

      {showPelamarInfo && (
        <div className="lpd-modal-overlay" onClick={() => setShowPelamarInfo(false)}>
          <div className="lpd-modal-card" onClick={e => e.stopPropagation()}>
            <div className="lpd-modal-icon"><IconInfo /></div>
            <h3 className="lpd-modal-title">Akun LUNA untuk Tim HR &amp; Perekrut</h3>
            <p className="lpd-modal-desc">
              Akun LUNA digunakan oleh HR dan perusahaan untuk memasang lowongan serta mengelola kandidat.
              Sebagai pencari kerja, Anda tidak perlu membuat akun — cukup buka tautan lowongan yang
              dibagikan oleh perusahaan untuk mengirimkan lamaran secara langsung.
            </p>
            <button type="button" className="lpd-modal-btn" onClick={() => navigate?.('landingpage_003')}>
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
