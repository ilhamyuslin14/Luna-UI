import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import OTPInput from '../../components/OTPInput.jsx';

/* ── Main component ──────────────────────────── */
export default function LandingPageOTPEmail_001({ navigate }) {
  const { user, refreshCompanyData } = useAuth();
  const [step, setStep] = useState('mengirim');   // 'mengirim' | 'otp'
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Countdown timer for resend */
  const startTimer = (secs = 60) => {
    setResendTimer(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Simulasi kirim kode ke email begitu laman dibuka
  useEffect(() => {
    const t = setTimeout(() => {
      setStep('otp');
      startTimer(60);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const handleVerif = async () => {
    if (otp.join('').length < 6 || isVerifying) return;
    setIsVerifying(true);
    // Dummy verification: kode tidak divalidasi ke provider email manapun,
    // tapi status "verified" tetap ditulis ke akun supaya wajib dilewati sekali per akun.
    if (user?.id) {
      await supabase.from('profiles').update({ otp_verified: true }).eq('id', user.id);
      await refreshCompanyData(user.id);
    }
    localStorage.setItem('luna_trigger_tour', 'true');
    navigate?.('beranda_001');
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(Array(6).fill(''));
    setStep('mengirim');
    setTimeout(() => { setStep('otp'); startTimer(60); }, 1800);
  };

  const otpFull = otp.join('').length === 6;
  const email = user?.email || 'email Anda';

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

          {/* ── Step 1: Mengirim ── */}
          {step === 'mengirim' && (
            <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent' }}>
              <div className="lpotp-mengirim-body" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="luna-modern-spinner"></div>
                <div className="lpotp-title-block" style={{ marginTop: '24px' }}>
                  <h2 className="lpm-title" style={{ fontSize: '28px', marginBottom: '12px' }}>Mengirim Kode OTP</h2>
                  <p className="lpm-subtitle" style={{ fontSize: '15px' }}>Mohon tunggu sebentar, kami sedang mengirimkan kode ke email Anda...</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Input OTP ── */}
          {step === 'otp' && (
            <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent' }}>
              <div className="lpotp-head" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '16px' }}>
                <div className="lpotp-title-block lpm-heading">
                  <div className="lpm-right-logo" style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 10 }}>
                    <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
                  </div>
                  <div className="lpm-heading-text">
                    <h2 className="lpm-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Cek Email Anda</h2>
                    <p className="lpm-subtitle">
                      Kami telah mengirimkan 6 digit kode via email ke <strong style={{ color: '#111827' }}>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="lpotp-body" style={{ padding: '0' }}>
                <OTPInput value={otp} onChange={setOtp} />

                <div className="lpotp-actions" style={{ marginTop: '24px' }}>
                  <button
                    className={`lpm-submit${(!otpFull || isVerifying) ? ' lpm-disabled' : ''}`}
                    disabled={!otpFull || isVerifying}
                    onClick={handleVerif}
                    style={{ width: '100%', height: '48px', fontSize: '15px' }}
                  >
                    {isVerifying ? 'Memverifikasi...' : 'Verifikasi OTP'}
                  </button>

                  <div className="lpotp-resend-block" style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p className="lpm-register" style={{ marginBottom: '8px' }}>Belum menerima kode?</p>
                    <button
                      className="lpm-register-link"
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      style={{ fontSize: '14px', color: resendTimer > 0 ? '#9ca3af' : 'var(--luna-orange-500)', textDecoration: resendTimer > 0 ? 'none' : 'underline' }}
                    >
                      {resendTimer > 0 ? `Kirim ulang kode (${resendTimer}s)` : 'Kirim ulang kode'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="lpm-register-link"
                      onClick={() => navigate?.('landingpage-verifikasi-metode_001')}
                      style={{ fontSize: '13px' }}
                    >
                      Ganti metode verifikasi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
