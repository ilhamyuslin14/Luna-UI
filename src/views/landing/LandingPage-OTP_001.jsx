import { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '../../data/countries.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import OTPInput from '../../components/OTPInput.jsx';

/* ── Main component ──────────────────────────── */
export default function LandingPageOTP_001({ navigate, phone = '' }) {
  const { user, refreshCompanyData } = useAuth();
  const [step, setStep] = useState('nomor');   // 'nomor' | 'mengirim' | 'otp'
  const [isVerifying, setIsVerifying] = useState(false);
  const [nomor, setNomor] = useState(phone);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Country Dropdown States
  const [countries, setCountries] = useState(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [dropdownRef]);

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

  const handleKirim = () => {
    if (!nomor.trim()) return;
    setStep('mengirim');
    setTimeout(() => {
      setStep('otp');
      startTimer(60);
    }, 2200);
  };

  const handleVerif = async () => {
    if (otp.join('').length < 6 || isVerifying) return;
    setIsVerifying(true);
    // Dummy verification: nomor & kode tidak divalidasi ke provider WA manapun,
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

  // Phone validation: Dynamic based on country
  const isIndonesia = selectedCountry.cca2 === 'ID';
  const rawNomor = nomor.replace(/\D/g, ''); // Ambil angka murninya saja
  let isValidPhone = false;
  let phoneErrorText = '';

  if (isIndonesia) {
    isValidPhone = rawNomor.length >= 9 && rawNomor.length <= 13 && rawNomor.startsWith('8');
    if (rawNomor.length > 0 && !isValidPhone) {
      if (rawNomor.length > 13) phoneErrorText = 'Nomor maksimal 13 digit (tanpa kode negara)';
      else if (!rawNomor.startsWith('8')) phoneErrorText = 'Nomor harus diawali dengan 8';
      else phoneErrorText = 'Nomor minimal 9 digit';
    }
  } else {
    isValidPhone = rawNomor.length >= 5 && rawNomor.length <= 15;
    if (rawNomor.length > 0 && !isValidPhone) {
      phoneErrorText = 'Nomor tidak valid (5-15 digit)';
    }
  }

  const showPhoneError = rawNomor.length > 0 && !isValidPhone;

  const displayNomor = rawNomor ? `${selectedCountry.idd} ${nomor}` : `${selectedCountry.idd} 812-3456-7890`;
  const otpFull = otp.join('').length === 6;

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
              Keamanan Terverifikasi
            </h1>
            <p className="lpm-left-subtitle" style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', lineHeight: '1.8', fontWeight: '400' }}>
              Sistem keamanan ganda LUNA melindungi data perusahaan Anda dengan standar terbaik. Kami memastikan hanya Anda yang memiliki kendali penuh.
            </p>
          </div>
          {/* Copyright di kiri bawah frame kaca */}
          <div style={{ position: 'absolute', bottom: '40px', left: '56px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            &copy; 2026 LUNA
          </div>
        </div>
      </div>

      {/* ── Form Panel (Right) ── */}
      <div className="lpm-right" style={{ width: '46.6%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(40px, 10%, 150px)', background: '#fff', position: 'relative', zIndex: 10, boxShadow: '-8px 0 16px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>

        {/* Watermark Logo LUNA di bagian bawah
        <div style={{
          position: 'absolute',
          bottom: '-27%',
          right: '25%',
          width: '80%',
          opacity: 0.02,
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
          // transform: 'rotate(-5deg)'
        }}>
          <img src="/assets/logos/luna-new-orange.png" alt="" style={{ width: '100%', height: 'auto', filter: 'brightness(0)' }} />
        </div> */}

        <div className="lpm-form-wrap" style={{ width: '100%' }}>

          {/* ── Step 1: Input Nomor ── */}
          {step === 'nomor' && (
            <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent', overflow: 'visible' }}>
              <div className="lpotp-head" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '32px' }}>
                <div className="lpotp-title-block lpm-heading">
                  <div className="lpm-right-logo" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    zIndex: 10
                  }}>
                    <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
                  </div>
                  <div className="lpm-heading-text">
                    <h2 className="lpm-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Verifikasi WhatsApp</h2>
                    <p className="lpm-subtitle lpm-hide-on-mobile">Kami akan mengirim kode verifikasi ke nomor Anda untuk mengamankan akun.</p>
                    <p className="lpm-subtitle lpm-show-on-mobile">Kode OTP akan dikirim ke nomor anda.</p>
                  </div>
                </div>
              </div>

              <div className="lpotp-body" style={{ padding: '0' }}>
                <div className="lpotp-phone-field">
                  {/* Phone input with dropdown prefix */}
                  <div className="lpotp-phone-input-wrap" style={{ position: 'relative' }} ref={dropdownRef}>
                    <div
                      className="lpotp-country-select"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="lpotp-prefix">{selectedCountry.idd}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#555f71', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {isDropdownOpen && (
                      <div className="lpotp-dropdown-menu">
                        <ul className="lpotp-dropdown-list">
                          {countries.map(c => (
                            <li
                              key={c.cca2}
                              className={`lpotp-dropdown-item ${selectedCountry.cca2 === c.cca2 ? 'lpotp-dropdown-item-active' : ''}`}
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="lpotp-dropdown-item-name">{c.name}</span>
                              <span className="lpotp-dropdown-item-idd">{c.idd}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="lpotp-prefix-sep"></div>
                    <input
                      className="lpotp-phone-input"
                      type="tel"
                      placeholder={isIndonesia ? "8xx-xxxx-xxxx" : "Masukkan nomor telepon"}
                      value={nomor}
                      onChange={e => {
                        let raw = e.target.value.replace(/\D/g, '').slice(0, 15);
                        let formatted = '';
                        if (raw.length > 0) formatted += raw.slice(0, 3);
                        if (raw.length > 3) formatted += '-' + raw.slice(3, 7);
                        if (raw.length > 7) formatted += '-' + raw.slice(7, 11);
                        if (raw.length > 11) formatted += '-' + raw.slice(11, 15);
                        setNomor(formatted);
                      }}
                      maxLength={19}
                      inputMode="numeric"
                    />
                  </div>

                  {/* Error message */}
                  {showPhoneError && (
                    <p className="lpotp-phone-error">
                      {phoneErrorText}
                    </p>
                  )}

                  {/* Info box */}
                  {!showPhoneError && (
                    <div className="lpotp-info-box">
                      <img src="/assets/landing/lp-otp-info-icon.svg" alt="" className="lpotp-info-icon" />
                      <p className="lpotp-info-text">Pastikan nomor ini aktif dan terhubung dengan WhatsApp Anda.</p>
                    </div>
                  )}
                </div>

                <div className="lpotp-actions">
                  <button
                    className={`lpm-submit${!isValidPhone ? ' lpm-disabled' : ''}`}
                    disabled={!isValidPhone}
                    onClick={handleKirim}
                    style={{ width: '100%', marginTop: '16px', height: '48px', fontSize: '15px' }}
                  >
                    Kirim Kode Verifikasi
                  </button>

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

          {/* ── Step 2: Mengirim ── */}
          {step === 'mengirim' && (
            <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent' }}>
              <div className="lpotp-mengirim-body" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="luna-modern-spinner"></div>
                <div className="lpotp-title-block" style={{ marginTop: '24px' }}>
                  <h2 className="lpm-title" style={{ fontSize: '28px', marginBottom: '12px' }}>Mengirim Kode OTP</h2>
                  <p className="lpm-subtitle" style={{ fontSize: '15px' }}>Mohon tunggu sebentar, kami sedang mengirimkan kode ke WhatsApp Anda...</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Input OTP ── */}
          {step === 'otp' && (
            <div className="lpotp-card lpotp-card-400" style={{ boxShadow: 'none', border: 'none', padding: '0', margin: '0 auto', background: 'transparent' }}>
              <div className="lpotp-head" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '16px' }}>
                <div className="lpotp-title-block lpm-heading">
                  <div className="lpm-right-logo" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    zIndex: 10
                  }}>
                    <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: 'auto', width: '56px', position: 'relative', zIndex: 2 }} />
                  </div>
                  <div className="lpm-heading-text">
                    <h2 className="lpm-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Cek WhatsApp Anda</h2>
                    <p className="lpm-subtitle">
                      Kami telah mengirimkan 6 digit kode via WhatsApp ke <strong style={{ color: '#111827' }}>{displayNomor}</strong>{' '}
                      <button type="button" className="lpm-register-link" onClick={() => { setStep('nomor'); setOtp(Array(6).fill('')); }} style={{ fontSize: '14px', marginLeft: '4px' }}>
                        Ubah Nomor
                      </button>
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
                    <p className="lpm-register" style={{ marginBottom: '8px' }}>Belum menerima pesan?</p>
                    <button
                      className="lpm-register-link"
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      style={{ fontSize: '14px', color: resendTimer > 0 ? '#9ca3af' : 'var(--luna-orange-500)', textDecoration: resendTimer > 0 ? 'none' : 'underline' }}
                    >
                      {resendTimer > 0 ? `Kirim ulang kode (${resendTimer}s)` : 'Kirim ulang kode'}
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
