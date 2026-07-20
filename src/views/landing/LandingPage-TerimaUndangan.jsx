import { useState } from 'react';
import { supabase } from '../../config/supabase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LandingPageTerimaUndangan() {
  const { user, companyName, refreshCompanyData, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);
      if (profileErr) throw profileErr;

      await refreshCompanyData(user.id);
      // App.jsx akan otomatis lepas gate begitu mustChangePassword jadi false
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan password baru.');
      setLoading(false);
    }
  };

  return (
    <div className="lpm-page lp-_001-container">

      {/* ── Visual Panel ── */}
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
              Selamat Bergabung di LUNA
            </h1>
            <p className="lpm-left-subtitle" style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', lineHeight: '1.8', fontWeight: '400' }}>
              Kamu diundang bergabung{companyName ? ` ke ${companyName}` : ''} sebagai bagian dari tim rekrutmen. Set password baru untuk mulai menggunakan workspace-mu.
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: '40px', left: '56px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            &copy; 2026 LUNA
          </div>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="lpm-right" style={{ width: '46.6%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(40px, 10%, 150px)', background: '#fff', position: 'relative', zIndex: 10, boxShadow: '-8px 0 16px rgba(0, 0, 0, 0.15)' }}>

        <div className="lpm-form-wrap" style={{ width: '100%' }}>

          <div className="lpm-heading">
            <div className="lpm-right-logo" style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 10 }}>
              <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
            </div>
            <div className="lpm-heading-text">
              <h2 className="lpm-title">Selamat Datang di LUNA</h2>
              <p className="lpm-subtitle">Set password baru untuk mengaktifkan akunmu sebagai Admin.</p>
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="lpm-form" onSubmit={handleSubmit}>
            <div className="lpm-field">
              <label className="lpm-label">Password Baru</label>
              <div className="lpm-pass-wrap">
                <input
                  className="lpm-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="lpm-pass-toggle" onClick={() => setShowPass(v => !v)}>
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

            <div className="lpm-field">
              <label className="lpm-label">Konfirmasi Password</label>
              <div className="lpm-pass-wrap">
                <input
                  className="lpm-input"
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="lpm-pass-toggle" onClick={() => setShowConfirmPass(v => !v)}>
                  {showConfirmPass ? (
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
                  Menyimpan…
                </>
              ) : 'Simpan & Lanjutkan'}
            </button>
          </form>

          <p className="lpm-register">
            Bukan kamu?{' '}
            <button type="button" className="lpm-register-link" onClick={() => logout?.()}>
              Keluar
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
