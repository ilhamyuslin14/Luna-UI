// MOCKUP: salinan PelamarDaftar_001 untuk presentasi. Tidak ada login/pendaftaran sungguhan; tombol hanya berpindah layar.
import { useState } from 'react';
import { simpanEmailOtp } from '../../utils/pelamarOtpMockup.js';
import '../../../css/pelamar/pelamar-masuk_001.css';

// Daftar pakai Supabase Auth sungguhan (akun pelamar hidup di
// pelamar_profiles, terpisah dari akun perusahaan — lihat
// handle_new_user() di DB). Tombol Google/Facebook masih dekoratif,
// belum ada OAuth sungguhan.
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
const IconGoogle = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.63l4 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" /></svg>
);

export default function PelamarDaftarMock({ navigate }) {
  const [nama, setNama] = useState('Dina Pratama');
  const [email, setEmail] = useState('dina.pratama@email.com');
  const [password, setPassword] = useState('rahasia123');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = nama.trim() && email.trim() && password.trim().length >= 6 && agree;

  // Mockup: data apa pun diterima, lanjut ke layar OTP.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    simpanEmailOtp(email.trim());
    setTimeout(() => navigate?.('pelamar-verifikasi-otp'), 600);
  };

  const handleSocialRegister = () => {
    setError('Daftar via akun sosial belum tersedia — pakai email dulu ya.');
  };

  return (
    <div className="pm001-shell">
      <div className="pm001-hero">
        <div className="pm001-hero-top">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" className="pm001-hero-logo" />
          <span className="pm001-hero-badge">Portal Karir</span>
        </div>

        <div className="pm001-hero-mid">
          <h2>Satu akun, semua lamaranmu dalam genggaman.</h2>
          <p>Pantau status tiap lamaran, simpan lowongan favorit, dan lengkapi profil sekali — pakai ulang buat melamar ke mana saja di Luna.</p>
        </div>

        <button type="button" className="pm001-hero-back" onClick={() => navigate?.('semua-lowongan_002')}>
          ← Kembali cari lowongan
        </button>
      </div>

      <div className="pm001-form-side">
       <div className="pm001-form-col">
        <>
        <div className="pm001-form-head">
          <h1>Buat akun pelamar</h1>
          <p>Gratis, cuma butuh beberapa detik buat mulai.</p>
        </div>

        <form className="pm001-form" onSubmit={handleSubmit}>
          {error && <div className="pm001-error">{error}</div>}

          <div className="pm001-field">
            <label className="pm001-label" htmlFor="pm001-nama">Nama Lengkap</label>
            <input
              id="pm001-nama"
              type="text"
              className="pm001-input"
              placeholder="Nama sesuai KTP"
              value={nama}
              onChange={e => setNama(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="pm001-field">
            <label className="pm001-label" htmlFor="pm001-email">Email</label>
            <input
              id="pm001-email"
              type="email"
              className="pm001-input"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="pm001-field">
            <label className="pm001-label" htmlFor="pm001-password">Kata Sandi</label>
            <div className="pm001-pass-wrap">
              <input
                id="pm001-password"
                type={showPass ? 'text' : 'password'}
                className="pm001-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="pm001-pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <label className="pm001-check-row">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <span>Saya setuju dengan <a href="#" onClick={e => e.preventDefault()}>Syarat &amp; Ketentuan</a> dan <a href="#" onClick={e => e.preventDefault()}>Kebijakan Privasi</a> Luna.</span>
          </label>

          <button type="submit" className="pm001-submit" disabled={!isValid || loading}>
            {loading ? 'Memproses…' : 'Daftar Akun'}
          </button>
        </form>

        <div className="pm001-divider-row"><span /><b>atau</b><span /></div>

        <div className="pm001-social">
          <button type="button" className="pm001-social-btn" onClick={() => handleSocialRegister('Google')}>
            <IconGoogle />Google
          </button>
          <button type="button" className="pm001-social-btn" onClick={() => handleSocialRegister('Facebook')}>
            <IconFacebook />Facebook
          </button>
        </div>

        <div className="pm001-switch">
          Sudah punya akun? <button type="button" onClick={() => navigate?.('pelamar-masuk')}>Masuk</button>
        </div>

        <div className="pm001-note">
          Atau tenang — kamu tetap bisa <b>melamar langsung tanpa daftar</b> lewat halaman lowongan.
        </div>
        </>

        <span className="pm001-company-link">Punya perusahaan &amp; ingin merekrut? Masuk sebagai perusahaan →</span>
       </div>
      </div>
    </div>
  );
}
