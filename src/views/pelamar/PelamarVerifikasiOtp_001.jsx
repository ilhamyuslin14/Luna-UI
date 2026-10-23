import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { bacaEmailOtp } from '../../utils/pelamarOtpMockup.js';
import '../../../css/pelamar/pelamar-masuk_001.css';
import '../../../css/pelamar/pelamar-otp_001.css';

// MOCKUP verifikasi OTP email untuk pelamar. Alur dan teksnya mengikuti verifikasi email di
// pendaftaran HR (LandingPage-OTP-Email_001): "Mengirim Kode OTP" -> 6 kotak kode -> "Verifikasi
// OTP" -> kirim ulang dengan hitung mundur 60 detik. Kode tidak divalidasi ke mana pun.
// Tampilannya mengikuti gaya Daftar/Masuk pelamar (pm001-*).
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function OtpBoxes({ value, onChange }) {
  const inputs = useRef([]);

  const onKeyDown = (i, e) => {
    if (e.key !== 'Backspace') return;
    if (value[i]) {
      const next = [...value];
      next[i] = '';
      onChange(next);
    } else if (i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onInput = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="pm001-otp-boxes" role="group" aria-label="Kode verifikasi 6 digit">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          className={`pm001-otp-box${digit ? ' filled' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          aria-label={`Digit ${i + 1}`}
          onChange={e => onInput(i, e)}
          onKeyDown={e => onKeyDown(i, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
}

export default function PelamarVerifikasiOtp_001({ navigate }) {
  const { user } = useAuth() || {};
  const [step, setStep] = useState('mengirim'); // 'mengirim' | 'otp'
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const email = bacaEmailOtp() || user?.email || 'nama@email.com';
  const otpFull = otp.join('').length === OTP_LENGTH;

  const startTimer = (secs = RESEND_SECONDS) => {
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

  // Simulasi kirim kode ke email begitu layar dibuka.
  useEffect(() => {
    const t = setTimeout(() => { setStep('otp'); startTimer(); }, 1800);
    return () => clearTimeout(t);
  }, []);

  const handleVerif = () => {
    if (!otpFull || verifying) return;
    setVerifying(true);
    // Dummy: kode apa pun diterima, lalu lanjut ke onboarding (unggah CV + preferensi kerja).
    setTimeout(() => navigate?.('pelamar-onboarding'), 900);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setStep('mengirim');
    setTimeout(() => { setStep('otp'); startTimer(); }, 1800);
  };

  return (
    <div className="pm001-shell">
      <div className="pm001-hero">
        <div className="pm001-hero-top">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" className="pm001-hero-logo" />
          <span className="pm001-hero-badge">Portal Karir</span>
        </div>

        <div className="pm001-hero-mid">
          <h2>Satu langkah lagi, akunmu hampir siap.</h2>
          <p>Kode verifikasi memastikan hanya kamu yang memegang kendali atas akun dan data lamaranmu.</p>
        </div>

        <button type="button" className="pm001-hero-back" onClick={() => navigate?.('pelamar-daftar')}>
          ← Kembali ke pendaftaran
        </button>
      </div>

      <div className="pm001-form-side">
        <div className="pm001-form-col">
          {step === 'mengirim' ? (
            <div className="pm001-otp-sending" role="status" aria-live="polite">
              <div className="pm001-otp-spinner" aria-hidden="true" />
              <h1>Mengirim kode OTP</h1>
              <p>Mohon tunggu sebentar, kami sedang mengirimkan kode ke email kamu...</p>
            </div>
          ) : (
            <>
              <div className="pm001-form-head">
                <h1>Cek email kamu</h1>
                <p>Kami telah mengirimkan 6 digit kode via email ke <b className="pm001-otp-email">{email}</b></p>
              </div>

              <OtpBoxes value={otp} onChange={setOtp} />

              <button type="button" className="pm001-submit pm001-otp-submit" disabled={!otpFull || verifying} onClick={handleVerif}>
                {verifying ? 'Memverifikasi…' : 'Verifikasi OTP'}
              </button>

              <div className="pm001-otp-resend">
                <p>Belum menerima kode?</p>
                <button type="button" onClick={handleResend} disabled={resendTimer > 0}>
                  {resendTimer > 0 ? `Kirim ulang kode (${resendTimer}s)` : 'Kirim ulang kode'}
                </button>
              </div>

              <div className="pm001-note">Contoh tampilan: kode 6 angka apa saja akan diterima.</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
