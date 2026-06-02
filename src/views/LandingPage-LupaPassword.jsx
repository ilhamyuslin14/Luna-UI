import { useState, useEffect } from 'react';

export default function LandingPageLupaPassword({ navigate }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <div className="lpotp-page">
      <div className="lplp-card">

        {!sent ? (
          <>
            {/* Header */}
            <div className="lplp-head">
              <div className="lplp-icon-wrap">
                <img src="/assets/landing/lp-lupa-lock.svg" alt="" className="lplp-icon" />
              </div>
              <div className="lplp-title-block">
                <h2 className="lplp-title">Lupa Password?</h2>
                <p className="lplp-desc">
                  Masukkan email yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                </p>
              </div>
            </div>

            {/* Form */}
            <form className="lplp-form" onSubmit={handleSubmit}>
              <div className="lplp-field">
                <label className="lplp-label">Email Terdaftar</label>
                <input
                  className={`lplp-input${email && !isValid ? ' lplp-input-error' : ''}`}
                  type="email"
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className={`lplp-btn${!isValid || loading ? ' lplp-btn-disabled' : ''}`}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>
                    <svg className="lplp-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                    </svg>
                    Mengirim…
                  </>
                ) : 'Kirim Tautan Reset'}
              </button>
            </form>

            {/* Back to login */}
            <button className="lplp-back" onClick={() => navigate?.('landingpage-masuk')}>
              <img src="/assets/landing/lp-lupa-arrow.svg" alt="" className="lplp-back-arrow" />
              Kembali ke Login
            </button>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="lplp-head">
              <div className="lplp-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b541" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="lplp-title-block">
                <h2 className="lplp-title">Email Terkirim!</h2>
                <p className="lplp-desc">
                  Tautan untuk mengatur ulang password telah dikirim ke <strong>{email}</strong>. Cek kotak masuk Anda.
                </p>
              </div>
            </div>

            <button className="lplp-back" onClick={() => navigate?.('landingpage-masuk')}>
              <img src="/assets/landing/lp-lupa-arrow.svg" alt="" className="lplp-back-arrow" />
              Kembali ke Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}
