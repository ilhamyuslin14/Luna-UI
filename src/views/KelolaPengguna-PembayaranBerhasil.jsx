import React from 'react';

export default function PembayaranBerhasil({ navigate, back }) {
  return (
    <div className="pb-page-wrapper">
      <div className="pb-card">
        {/* Green Background for header */}
        <div className="pb-card-header-bg"></div>
        
        {/* Content Wrapper */}
        <div className="pb-content">
          
          {/* Header Block */}
          <div className="pb-header-block">
            <div className="pb-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="pb-header-text-group">
              <h2 className="pb-title">Pembayaran Berhasil!</h2>
              <p className="pb-subtitle">Terima kasih, pembayaran Anda telah kami terima.</p>
            </div>
          </div>

          {/* Body Block */}
          <div className="pb-body-block">
            
            {/* Plan Box */}
            <div className="pb-plan-box">
              <div className="pb-plan-icon-wrap">
                <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="#0977BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div className="pb-plan-info">
                <h3 className="pb-plan-name">BASIC PLAN</h3>
                <p className="pb-plan-cycle">• Bulanan</p>
              </div>
              <div className="pb-badge-lunas">
                <span>LUNAS</span>
              </div>
            </div>

            {/* Ditagihkan Kepada */}
            <div className="pb-billed-section">
              <p className="pb-billed-label">Ditagihkan Kepada:</p>
              <div className="pb-billed-box">
                <div className="pb-billed-row">
                  <div className="pb-billed-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="pb-billed-details">
                    <p className="pb-billed-name">Arif Berwin</p>
                    <p className="pb-billed-desc">PT. Teknologi Masa Depan</p>
                  </div>
                </div>
                <div className="pb-billed-row">
                  <div className="pb-billed-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div className="pb-billed-details">
                    <p className="pb-billed-name">NPWP: 09.123.456.7-890.000</p>
                  </div>
                </div>
                <div className="pb-billed-row">
                  <div className="pb-billed-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="pb-billed-details">
                    <p className="pb-billed-name">Jl. Jendral Sudirman No. Kav 1, Jakarta Selatan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="pb-invoice-info">
              <div className="pb-invoice-row">
                <p className="pb-invoice-label">No. Invoice</p>
                <p className="pb-invoice-value">INV/LUNA/2026/10024</p>
              </div>
              <div className="pb-invoice-row">
                <p className="pb-invoice-label">Tanggal Bayar</p>
                <p className="pb-invoice-value">02 Feb 2026, 10:45 WIB</p>
              </div>
              <div className="pb-invoice-row">
                <p className="pb-invoice-label">Metode</p>
                <p className="pb-invoice-value">Bank Transfer (Mandiri)</p>
              </div>
            </div>

            {/* Total */}
            <div className="pb-total-row">
              <p className="pb-total-label">Total Dibayar</p>
              <p className="pb-total-value">Rp 277.623</p>
            </div>

            {/* Actions */}
            <div className="pb-actions">
              <button className="pb-btn-secondary" onClick={() => navigate('riwayat-transaksi')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19L5 12L12 5" />
                </svg>
                Kembali
              </button>
              <button className="pb-btn-primary" onClick={() => alert('Fitur unduh receipt belum tersedia.')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Unduh Receipt
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
