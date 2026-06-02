import React from 'react';

const formatRp = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount).replace('Rp', 'Rp ');
};

export default function RingkasanPembayaran({ plan = 'BASIC', cycle = 'bulanan', navigate, back }) {
  // Pricing Logic
  let subtotal = 0;
  if (plan === 'BASIC') {
    subtotal = cycle === 'bulanan' ? 250000 : 2280000;
  } else if (plan === 'PLUS') {
    subtotal = cycle === 'bulanan' ? 490000 : 4680000;
  }
  
  const ppn = subtotal * 0.11;
  const kodeUnik = 123;
  const total = subtotal + ppn + kodeUnik;

  return (
    <div className="rp-page">
      <div className="rp-container">

        {/* Back Button */}
        <button
          className="rp-back-btn"
          onClick={() => back ? back() : navigate('paket-langganan')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19L5 12L12 5" />
          </svg>
          <span>Kembali</span>
        </button>

        {/* Title */}
        <div className="rp-title-block">
          <h1 className="rp-title">Ringkasan Pembayaran</h1>
          <p className="rp-subtitle">Harap periksa detail pembayaran sebelum melakukan transaksi</p>
        </div>

        {/* Main Content */}
        <div className="rp-layout">

          {/* Left Column: Forms */}
          <div className="rp-left">

            {/* Informasi Penagihan */}
            <div className="rp-card">
              <div className="rp-card-header">
                <div className="rp-card-icon">
                  <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="#0977BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="rp-card-title-group">
                  <h2 className="rp-card-title">Informasi Penagihan</h2>
                  <p className="rp-card-subtitle">Faktur pajak akan dikirimkan sesuai data ini</p>
                </div>
              </div>

              <div className="rp-fields">
                <div className="rp-field-row">
                  <div className="rp-field-group">
                    <label className="rp-label">Nama Lengkap</label>
                    <div className="rp-input">
                      <input type="text" defaultValue="Arif Berwin" className="rp-input-text" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} />
                    </div>
                  </div>
                  <div className="rp-field-group">
                    <label className="rp-label">Email Invoice</label>
                    <div className="rp-input-muted">
                      <input type="email" defaultValue="berwin.arif@example.com" className="rp-input-text-muted" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} />
                    </div>
                  </div>
                </div>

                <div className="rp-field-group">
                  <label className="rp-label">Nama Perusahaan</label>
                  <div className="rp-input">
                    <input type="text" defaultValue="PT. Teknologi Masa Depan" className="rp-input-text" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} />
                  </div>
                </div>

                <div className="rp-field-group">
                  <label className="rp-label">No Kontak</label>
                  <div className="rp-input">
                    <input type="number" defaultValue="081223456789" className="rp-input-text" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} />
                  </div>
                </div>

                <div className="rp-field-group">
                  <label className="rp-label">
                    NPWP Perusahaan <span className="rp-label-optional">(Opsional)</span>
                  </label>
                  <div className="rp-input">
                    <input type="text" placeholder="1221.3456.7890.1234" className="rp-input-placeholder" style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="rp-card">
              <div className="rp-card-header">
                <div className="rp-card-icon">
                  <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="#0977BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
                <div className="rp-card-title-group">
                  <h2 className="rp-card-title">Metode Pembayaran</h2>
                  <p className="rp-card-subtitle">Pilih metode pembayaran yang tersedia</p>
                </div>
              </div>

              <label className="rp-payment-row" style={{ cursor: 'pointer' }}>
                <div className="rp-radio-wrap">
                  <input type="radio" name="paymentMethod" value="transfer" defaultChecked className="rp-radio-input" />
                </div>
                <div className="rp-bank-logo">
                  <svg className="rp-mandiri-logo" viewBox="0 0 62 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M48.5 3C53.5 1.5 58.5 2.5 61.5 4.5C57.5 5.5 52.5 4.5 48.5 3Z" fill="#FDB813" />
                    <path d="M46.5 5.5C51.5 4 56.5 5.5 60.5 7.5C56.5 7 51.5 6 46.5 5.5Z" fill="#F58220" />
                    <text x="1" y="14" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="900" fontStyle="italic" fill="#003d79" letterSpacing="-0.3">mandiri</text>
                  </svg>
                </div>
                <div className="rp-payment-info">
                  <p className="rp-payment-name">Transfer Bank (Manual Check)</p>
                  <p className="rp-payment-desc">
                    Lakukan transfer ke rekening perusahaan kami. Verifikasi pembayaran akan dilakukan dalam waktu maksimal 1x24 jam.
                  </p>
                </div>
              </label>
            </div>

          </div>

          {/* Right Column: Rincian Transaksi */}
          <div className="rp-right">
            <h2 className="rp-section-title">Rincian Transaksi</h2>

            <div className="rp-plan-badge">
              <div className="rp-plan-badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0977BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <p className="rp-plan-badge-name">{plan} PLAN</p>
                <p className="rp-plan-badge-cycle">• {cycle}</p>
              </div>
            </div>

            <div className="rp-price-rows">
              <div className="rp-price-row">
                <span className="rp-price-label">Subtotal</span>
                <span className="rp-price-value">{formatRp(subtotal)}</span>
              </div>
              <div className="rp-price-row">
                <span className="rp-price-label">PPN (11%)</span>
                <span className="rp-price-value">{formatRp(ppn)}</span>
              </div>
              <div className="rp-price-row">
                <div className="rp-kode-unik-wrap">
                  <span className="rp-price-label">Kode Unik</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#939cac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <span className="rp-price-value-orange">{kodeUnik}</span>
              </div>
            </div>

            <div className="rp-dashed-line" />

            <div className="rp-total-block">
              <div className="rp-total-label-group">
                <span className="rp-total-label">Total Pembayaran</span>
                <span className="rp-total-sub">Termasuk PPN</span>
              </div>
              <span className="rp-total-amount">{formatRp(total)}</span>
            </div>

            <button
              className="rp-btn-order"
              onClick={() => navigate('menunggu-pembayaran')}
            >
              BUAT PESANAN
            </button>

            <p className="rp-tos-text">
              Dengan melanjutkan pembayaran, Anda menyetujui <span className="rp-tos-link">Syarat &amp; Ketentuan</span> layanan LUNA AI.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
