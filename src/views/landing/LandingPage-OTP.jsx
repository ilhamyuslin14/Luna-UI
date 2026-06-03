import { useState, useEffect, useRef } from 'react';

/* ── OTP 6-box input ─────────────────────────── */
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const next = [...value];
        next[i] = '';
        onChange(next);
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    const focus = Math.min(pasted.length, 5);
    inputs.current[focus]?.focus();
  };

  return (
    <div className="lpotp-boxes">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          className={`lpotp-box${digit ? ' lpotp-box-filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────── */
export default function LandingPageOTP({ navigate, phone = '' }) {
  const [step, setStep]       = useState('nomor');   // 'nomor' | 'mengirim' | 'otp'
  const [nomor, setNomor]     = useState(phone);
  const [otp, setOtp]         = useState(Array(6).fill(''));
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

  const handleKirim = () => {
    if (!nomor.trim()) return;
    setStep('mengirim');
    setTimeout(() => {
      setStep('otp');
      startTimer(60);
    }, 2200);
  };

  const handleVerif = () => {
    if (otp.join('').length < 6) return;
    navigate?.('beranda');
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(Array(6).fill(''));
    setStep('mengirim');
    setTimeout(() => { setStep('otp'); startTimer(60); }, 1800);
  };

  // Phone validation: starts with 8, 9–13 digits (Indonesian mobile without country code)
  const isValidPhone = nomor.length >= 9 && nomor.length <= 13 && nomor.startsWith('8');
  const showPhoneError = nomor.length > 0 && !isValidPhone;

  const displayNomor = nomor ? `+62 ${nomor}` : '+62 812-3456-7890';
  const otpFull = otp.join('').length === 6;

  return (
    <div className="lpotp-page">

      {/* ── Step 1: Input Nomor ── */}
      {step === 'nomor' && (
        <div className="lpotp-card lpotp-card-400">
          <div className="lpotp-head">
            <div className="lpotp-icon-wrap">
              <img src="/assets/landing/lp-otp-wa-icon.svg" alt="" className="lpotp-icon" />
            </div>
            <div className="lpotp-title-block">
              <h2 className="lpotp-title">Tambahkan Nomor WhatsApp</h2>
              <p className="lpotp-desc">Kami akan mengirim kode verifikasi ke nomor WhatsApp Anda untuk mengamankan akun.</p>
            </div>
          </div>

          <div className="lpotp-body">
            <div className="lpotp-phone-field">
              {/* Phone input with +62 prefix */}
              <div className="lpotp-phone-input-wrap">
                <span className="lpotp-prefix">+62</span>
                <div className="lpotp-prefix-sep"></div>
                <input
                  className="lpotp-phone-input"
                  type="tel"
                  placeholder="8xx-xxxx-xxxx"
                  value={nomor}
                  onChange={e => setNomor(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  maxLength={14}
                  inputMode="numeric"
                />
              </div>

              {/* Error message */}
              {showPhoneError && (
                <p className="lpotp-phone-error">
                  {nomor.length > 13
                    ? 'Nomor maksimal 13 digit (tanpa kode negara)'
                    : !nomor.startsWith('8')
                      ? 'Nomor harus diawali dengan 8'
                      : 'Nomor minimal 9 digit'}
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
                className={`lpotp-btn${!isValidPhone ? ' lpotp-btn-disabled' : ''}`}
                disabled={!isValidPhone}
                onClick={handleKirim}
              >
                Kirim Kode Verifikasi
              </button>

              {/* Back link — full width, centered, exact Figma style */}
              <div className="lpotp-back-link" onClick={() => navigate?.('landingpage-daftar')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate?.('landingpage-daftar')}>
                <img src="/assets/landing/lp-otp-back-arrow.svg" alt="" className="lpotp-back-arrow" />
                Kembali ke pendaftaran
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Mengirim ── */}
      {step === 'mengirim' && (
        <div className="lpotp-card lpotp-card-330">
          <div className="lpotp-mengirim-body">
            <img src="/assets/landing/lp-otp-spinner.svg" alt="" className="lpotp-spinner-img" />
            <div className="lpotp-title-block">
              <h2 className="lpotp-title">Mengirim Kode OTP</h2>
              <p className="lpotp-desc">Tunggu sebentar, jangan refresh halaman</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Input OTP ── */}
      {step === 'otp' && (
        <div className="lpotp-card lpotp-card-400">
          <div className="lpotp-head">
            <div className="lpotp-icon-wrap">
              <img src="/assets/landing/lp-otp-wa-icon.svg" alt="" className="lpotp-icon" />
            </div>
            <div className="lpotp-title-block">
              <h2 className="lpotp-title">Cek WhatsApp Anda</h2>
              <p className="lpotp-desc">
                Kami telah mengirimkan 6 digit kode verifikasi via WhatsApp ke{' '}
                <strong>{displayNomor}</strong>{' '}
                <button className="lpotp-ubah-btn" onClick={() => { setStep('nomor'); setOtp(Array(6).fill('')); }}>
                  <img src="/assets/landing/lp-otp-edit-icon.svg" alt="" className="lpotp-edit-icon" />
                  Ubah Nomor
                </button>
              </p>
            </div>
          </div>

          <div className="lpotp-body">
            <OTPInput value={otp} onChange={setOtp} />

            <div className="lpotp-actions">
              <button
                className={`lpotp-btn${!otpFull ? ' lpotp-btn-disabled' : ''}`}
                disabled={!otpFull}
                onClick={handleVerif}
              >
                Verifikasi OTP
              </button>

              <div className="lpotp-resend-block">
                <p className="lpotp-resend-q">Belum menerima pesan?</p>
                <button
                  className={`lpotp-resend-btn${resendTimer > 0 ? ' lpotp-resend-disabled' : ''}`}
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Kirim ulang kode (${resendTimer}s)` : 'Kirim ulang kode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
