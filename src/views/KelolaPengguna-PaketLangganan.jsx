import React, { useState } from 'react';

const CheckGreen = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="pl-check-icon">
    <circle cx="7" cy="7" r="7" fill="#E6F8EF"/>
    <path d="M4.5 7L6.5 9L9.5 5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckBlue = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="pl-check-icon">
    <circle cx="7" cy="7" r="7" fill="#EBF5FF"/>
    <path d="M4.5 7L6.5 9L9.5 5" stroke="#0977BE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export default function PaketLangganan({ navigate }) {
  const [billingCycle, setBillingCycle] = useState('bulanan');

  return (
    <div className="pl-view">
      {/* Absolute Background */}
      <div className="pl-bg-wrapper">
        <img src="/assets/pricing_bg.svg" alt="Background" className="pl-banner-bg" />
      </div>

      <div className="pl-content-wrapper">
        {/* Banner Section */}
        <div className="pl-banner-content">
          <div className="pl-banner-text">
            <h1 className="pl-banner-title">Tingkatkan Efisiensi Rekrutmen Anda</h1>
            <p className="pl-banner-subtitle">
              Pilih paket yang sesuai skala tim Anda. Kelola ratusan CV dalam hitungan menit dan temukan talenta terbaik dengan akurasi AI.
            </p>
          </div>
          
          <div className="pl-billing-toggle">
            <div 
              className={`pl-toggle-option ${billingCycle === 'bulanan' ? 'active' : 'inactive'}`}
              onClick={() => setBillingCycle('bulanan')}
            >
              Bulanan
            </div>
            <div 
              className={`pl-toggle-option ${billingCycle === 'tahunan' ? 'active' : 'inactive'}`}
              onClick={() => setBillingCycle('tahunan')}
            >
              Tahunan
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="pl-cards-container">
          
          {/* BASIC Card */}
          <div className="pl-card pl-card-hoverable">
            <div className="pl-card-header">
              <div className="pl-card-title-block">
                <h2 className="pl-card-title pl-title-basic">BASIC</h2>
                <p className="pl-card-desc">Ideal untuk startup & tim kecil dengan kebutuhan rekrutmen terukur.</p>
              </div>
              {billingCycle === 'bulanan' ? (
                <div className="pl-card-price-block">
                  <h3 className="pl-price">Rp 250.000</h3>
                  <p className="pl-price-suffix">/ pengguna / bulan</p>
                </div>
              ) : (
                <div className="pl-card-price-block-annual">
                  <div className="pl-price-main">
                    <h3 className="pl-price">Rp 190.000</h3>
                    <p className="pl-price-suffix">/ pengguna / bulan</p>
                  </div>
                  <div className="pl-annual-badge">Ditagih tahunan (Total Rp 2.280.000)</div>
                </div>
              )}
            </div>
            
            <div className="pl-features-list">
              <h4 className="pl-features-title">TERMASUK FITUR :</h4>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Jumlah lowongan aktif <span className="pl-feature-bold">15</span></p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Jumlah kuota kandidat <span className="pl-feature-bold">5.000</span></p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Sistem Penilaian Cerdas LUNA AI</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Pembuat Kriteria Otomatis LUNA AI</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Dashboard Data Rekrutmen</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Dukungan Pelanggan</p>
              </div>
            </div>

            <button className="pl-btn-outline" onClick={() => navigate('ringkasan-pembayaran', { plan: 'BASIC', cycle: billingCycle })}>
              Pilih Paket
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* PLUS Card */}
          <div className="pl-card pl-card-hoverable pl-card-default-highlight">
            <div className="pl-badge-popular">
              <img src="/assets/sparkles.svg" alt="Sparkles" width="13" height="13" />
              TERPOPULER
            </div>
            
            <div className="pl-card-header">
              <div className="pl-card-title-block">
                <h2 className="pl-card-title pl-title-plus">PLUS</h2>
                <p className="pl-card-desc">Skalabilitas penuh tanpa batas untuk perusahaan yang aktif bertumbuh.</p>
              </div>
              {billingCycle === 'bulanan' ? (
                <div className="pl-card-price-block">
                  <h3 className="pl-price">Rp 490.000</h3>
                  <p className="pl-price-suffix">/ pengguna / bulan</p>
                </div>
              ) : (
                <div className="pl-card-price-block-annual">
                  <div className="pl-price-main">
                    <div className="pl-price-row">
                      <h3 className="pl-price">Rp 390.000</h3>
                      <p className="pl-price-strikethrough">Rp 490.000</p>
                    </div>
                    <p className="pl-price-suffix">/ pengguna / bulan</p>
                  </div>
                  <div className="pl-annual-badge">Ditagih tahunan (Total Rp 4.680.000)</div>
                </div>
              )}
            </div>
            
            <div className="pl-features-list">
              <h4 className="pl-features-title">TERMASUK FITUR :</h4>
              <div className="pl-feature-item">
                <CheckBlue />
                <p className="pl-feature-text">Jumlah lowongan aktif <span className="pl-feature-highlight">tidak terbatas</span></p>
              </div>
              <div className="pl-feature-item">
                <CheckBlue />
                <p className="pl-feature-text">Jumlah kuota kandidat <span className="pl-feature-highlight">tidak terbatas</span></p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Sistem Penilaian Cerdas LUNA AI</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Pembuat Kriteria Otomatis LUNA AI</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Dashboard Data Rekrutmen</p>
              </div>
              <div className="pl-feature-item">
                <CheckGreen />
                <p className="pl-feature-text">Dukungan Pelanggan</p>
              </div>
            </div>

            <button className="pl-btn-solid" onClick={() => navigate('ringkasan-pembayaran', { plan: 'PLUS', cycle: billingCycle })}>
              Pilih Paket
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
