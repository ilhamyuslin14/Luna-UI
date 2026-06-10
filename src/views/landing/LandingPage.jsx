import { useState, useEffect } from 'react';

export default function LandingPage({ navigate }) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';

    const sections = ['fitur', 'keunggulan', 'harga'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.scrollBehavior = '';
      observer.disconnect();
    };
  }, []);
  const [billingCycle, setBillingCycle] = useState('tahunan');

  return (
    <div className="lp-page">

      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-header-logo">
          <img src="/assets/landing/lp-logo-icon.svg" alt="LUNA" className="lp-header-logo-icon" />
          <span className="lp-header-logo-text">LUNA</span>
        </div>
        <nav className="lp-header-nav">
          <button className={`lp-nav-link${activeSection === 'fitur' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}>Fitur</button>
          <button className={`lp-nav-link${activeSection === 'keunggulan' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('keunggulan')?.scrollIntoView({ behavior: 'smooth' })}>Keunggulan</button>
          <button className={`lp-nav-link${activeSection === 'harga' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('harga')?.scrollIntoView({ behavior: 'smooth' })}>Harga</button>
        </nav>
        <div className="lp-header-actions">
          <button className="lp-header-login" onClick={() => navigate?.('landingpage-masuk')}>Masuk</button>
          <button className="lp-header-cta" onClick={() => navigate?.('landingpage-daftar')}>Coba Gratis 14 Hari</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <img src="/assets/landing/lp-hero-bg-wave.svg" alt="" className="lp-hero-bg-wave" />

        <div className="lp-hero-left">
          <div className="lp-hero-badge">
            <img src="/assets/landing/lp-dot-blue.svg" alt="" className="lp-hero-badge-dot" />
            <span>LUNA V3 Kini Tersedia</span>
          </div>
          <h1 className="lp-hero-title">
            Berhenti Membaca<br />Ratusan CV.
          </h1>
          <p className="lp-hero-subtitle">
            Biarkan AI temukan kandidat terbaik Anda dalam hitungan detik. LUNA V3 mengotomatiskan screening, memberikan scoring akurat, dan merapikan pipeline rekrutmen Anda.
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-hero-btn-primary" onClick={() => navigate?.('landingpage-daftar')}>
              Mulai Coba Gratis 14 Hari
              <img src="/assets/landing/lp-arrow-right.svg" alt="" className="lp-hero-btn-arrow" />
            </button>
            <div className="lp-hero-nocc">
              <img src="/assets/landing/lp-icon-no-cc.svg" alt="" />
              <span>Tanpa Kartu Kredit</span>
            </div>
          </div>
        </div>

        <div className="lp-hero-right">
          {/* Dashboard mockup card */}
          <div className="lp-hero-card lp-hero-card-rotated">
            <img src="/assets/landing/lp-dashboard-header.svg" alt="" className="lp-hero-card-header" />
            <div className="lp-hero-card-body">
              {/* Row 1 */}
              <div className="lp-hero-card-toprow">
                <div className="lp-hero-card-label-blue"></div>
                <div className="lp-hero-card-label-gray"></div>
              </div>
              {/* Candidate row High Fit */}
              <div className="lp-hero-candidate-row lp-row-highlighted">
                <div className="lp-hero-cand-info">
                  <img src="/assets/landing/lp-avatar1.png" alt="" className="lp-hero-cand-avatar" />
                  <div className="lp-hero-cand-meta">
                    <div className="lp-hero-cand-name-bar lp-bar-dark"></div>
                    <div className="lp-hero-cand-sub-bar lp-bar-light"></div>
                  </div>
                </div>
                <div className="lp-hero-score-badge lp-score-high">
                  <span className="lp-score-label">High Fit</span>
                  <span className="lp-score-num lp-score-num-green">90</span>
                </div>
              </div>
              {/* Candidate row Moderate Fit */}
              <div className="lp-hero-candidate-row">
                <div className="lp-hero-cand-info">
                  <img src="/assets/landing/lp-avatar2.png" alt="" className="lp-hero-cand-avatar" />
                  <div className="lp-hero-cand-meta">
                    <div className="lp-hero-cand-name-bar lp-bar-lighter"></div>
                    <div className="lp-hero-cand-sub-bar lp-bar-light"></div>
                  </div>
                </div>
                <div className="lp-hero-score-badge lp-score-moderate">
                  <span className="lp-score-label">Moderate Fit</span>
                  <span className="lp-score-num lp-score-num-yellow">75</span>
                </div>
              </div>
              {/* Candidate row Low Fit */}
              <div className="lp-hero-candidate-row">
                <div className="lp-hero-cand-info">
                  <img src="/assets/landing/lp-avatar3.png" alt="" className="lp-hero-cand-avatar" />
                  <div className="lp-hero-cand-meta">
                    <div className="lp-hero-cand-name-bar lp-bar-lighter"></div>
                    <div className="lp-hero-cand-sub-bar lp-bar-light"></div>
                  </div>
                </div>
                <div className="lp-hero-score-badge lp-score-low">
                  <span className="lp-score-label">Low Fit</span>
                  <span className="lp-score-num lp-score-num-red">50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating score panel */}
          <div className="lp-hero-score-panel lp-score-panel-rotated">
            <div className="lp-panel-top">
              <div className="lp-panel-gauge-wrap">
                <div className="lp-panel-gauge-bg">
                  <img src="/assets/landing/lp-gauge-bg.svg" alt="" className="lp-panel-gauge-circle" />
                  <img src="/assets/landing/lp-gauge-fill1.svg" alt="" className="lp-panel-gauge-fill1" />
                  <img src="/assets/landing/lp-gauge-fill2.svg" alt="" className="lp-panel-gauge-fill2" />
                  <img src="/assets/landing/lp-gauge-dot1.svg" alt="" className="lp-panel-gauge-dot1" />
                  <img src="/assets/landing/lp-gauge-dot2.svg" alt="" className="lp-panel-gauge-dot2" />
                  <div className="lp-panel-gauge-text">
                    <span className="lp-panel-gauge-score">75</span>
                    <span className="lp-panel-gauge-level">Moderate</span>
                  </div>
                </div>
              </div>
              <div className="lp-panel-chips">
                <div className="lp-panel-chip lp-chip-green">Tinggi: 4/7</div>
                <div className="lp-panel-chip lp-chip-yellow">Sedang: 2/3</div>
                <div className="lp-panel-chip lp-chip-red">Rendah: 4/10</div>
              </div>
            </div>
            <button className="lp-panel-view-btn">
              <img src="/assets/landing/lp-ai-icon.svg" alt="" />
              See AI Match Overview
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="lp-trust">
        <p className="lp-trust-label">Dipercaya oleh tim rekrutmen inovatif</p>
        <div className="lp-trust-logos">
          <img src="/assets/landing/lp-logo-detikcom.png" alt="Detikcom" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-e27.png" alt="e27" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-theken.svg" alt="The Ken" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-compass.png" alt="Compass List" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-kompas.png" alt="Kompas" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-dailysocial.png" alt="Daily Social" className="lp-trust-logo" />
          <img src="/assets/landing/lp-logo-sindo.png" alt="Koran Sindo" className="lp-trust-logo" />
        </div>
      </section>

      {/* ── Features / Pilar ── */}
      <section className="lp-features" id="fitur">
        <div className="lp-features-heading">
          <img src="/assets/landing/lp-sparkle-section.svg" alt="" className="lp-features-sparkle" />
          <h2 className="lp-features-title">Pilar Operasional LUNA V3</h2>
          <p className="lp-features-subtitle">
            Otomatisasi seluruh alur rekrutmen Anda. Dari tumpukan CV menjadi daftar kandidat terpilih dalam hitungan menit.
          </p>
        </div>
        <div className="lp-features-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrap" style={{ background: '#eef7fd' }}>
              <img src="/assets/landing/lp-icon-upload.svg" alt="" />
            </div>
            <div className="lp-feature-text">
              <h3 className="lp-feature-name">Upload CV Massal</h3>
              <p className="lp-feature-desc">Tarik dan lepas puluhan CV sekaligus dalam format PDF atau DOCX. Sistem mengekstrak data dalam sekejap tanpa data-entry manual.</p>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrap" style={{ background: '#f4f3fe' }}>
              <img src="/assets/landing/lp-icon-brain.svg" alt="" />
            </div>
            <div className="lp-feature-text">
              <h3 className="lp-feature-name">AI Matching &amp; Scoring</h3>
              <p className="lp-feature-desc">AI membaca Job Description dan mencocokkannya dengan kualifikasi kandidat, menghasilkan skor instan bebas bias secara akurat.</p>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrap" style={{ background: '#ecfcf8' }}>
              <img src="/assets/landing/lp-icon-pipeline.svg" alt="" />
            </div>
            <div className="lp-feature-text">
              <h3 className="lp-feature-name">Pipeline Management</h3>
              <p className="lp-feature-desc">Pantau pergerakan kandidat dari Screening hingga Hired menggunakan Kanban board intuitif dengan fitur drag-and-drop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Different ── */}
      <section className="lp-why" id="keunggulan">
        <div className="lp-why-inner">
          {/* Background decoratives — absolute */}
          <div className="lp-why-bg-ellipse-wrap">
            <img src="/assets/landing/lp-bg-ellipse.svg" alt="" className="lp-why-bg-ellipse" />
          </div>
          <div className="lp-why-bg-wave-wrap">
            <img src="/assets/landing/lp-bg-wave2.svg" alt="" className="lp-why-bg-wave" />
          </div>

          {/* Left text — flows normally (relative) */}
          <div className="lp-why-left">
            <div className="lp-why-heading">
              <h2 className="lp-why-title">Mengapa LUNA V3 Berbeda?</h2>
              <p className="lp-why-subtitle">Kami bukan sekadar fitur tambahan di aplikasi HRIS Anda. LUNA dirancang khusus sebagai mesin utama akuisisi talenta perusahaan Anda.</p>
            </div>
            <div className="lp-why-points">
              <div className="lp-why-point">
                <div className="lp-why-point-icon">
                  <img src="/assets/landing/lp-icon-warehouse.svg" alt="" />
                </div>
                <div className="lp-why-point-text">
                  <h4 className="lp-why-point-title">Candidate Warehouse</h4>
                  <p className="lp-why-point-desc">Jangan biarkan data pelamar menguap. LUNA menyimpan seluruh data kandidat menjadi Talent Pool permanen perusahaan Anda, siap dihubungi kapan pun.</p>
                </div>
              </div>
              <div className="lp-why-point">
                <div className="lp-why-point-icon">
                  <img src="/assets/landing/lp-icon-dedicated.svg" alt="" />
                </div>
                <div className="lp-why-point-text">
                  <h4 className="lp-why-point-title">Dedicated Recruitment OS</h4>
                  <p className="lp-why-point-desc">Fokus 100% pada akuisisi talenta. Kami membangun sistem end-to-end yang mengerti alur kerja rekruter, bukan sistem absensi yang dijejali fitur ala kadarnya.</p>
                </div>
              </div>
              <div className="lp-why-point">
                <div className="lp-why-point-icon">
                  <img src="/assets/landing/lp-icon-payment.svg" alt="" />
                </div>
                <div className="lp-why-point-text">
                  <h4 className="lp-why-point-title">Pembayaran Transparan</h4>
                  <p className="lp-why-point-desc">Skalakan tim tanpa biaya tersembunyi (hidden fees). Tagihan jelas, memudahkan perencanaan anggaran HR perusahaan Anda.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo group — absolutely positioned exactly per Figma */}
          {/* left:731px within 1150px inner container (1440 - 2×145 padding) */}
          <div className="lp-why-photo-group">
            {/* Photo inner frame: 458×507, rotate -1.2deg */}
            <div className="lp-why-photo-inner">
              {/* Concentric ring decorations — inside, counter-rotated 1.2deg */}
              <div className="lp-why-ring lp-why-ring-outer">
                <img src="/assets/landing/lp-circle-outer.svg" alt="" style={{ width: 388, height: 388 }} />
              </div>
              <div className="lp-why-ring lp-why-ring-mid">
                <img src="/assets/landing/lp-circle-mid.svg" alt="" style={{ width: 299, height: 299 }} />
              </div>
              <div className="lp-why-ring lp-why-ring-inner">
                <img src="/assets/landing/lp-circle-inner.svg" alt="" style={{ width: 212, height: 212 }} />
              </div>

              {/* Woman photo: fills frame, overflows bottom ~11% */}
              <div className="lp-why-woman-wrap">
                <img src="/assets/landing/lp-hero-woman.png" alt="LUNA V3 User" className="lp-why-woman" />
              </div>

              {/* Floating screenshots */}
              {/* ss1: top-right, left~243px, top 91.5px, ~110px wide, aspect 848/508 */}
              <div className="lp-why-ss lp-why-ss1">
                <img src="/assets/landing/lp-screenshot1.png" alt="" />
              </div>
              {/* ss2: bottom-left, left -70px, top 275px, 154×107px */}
              <div className="lp-why-ss lp-why-ss2">
                <img src="/assets/landing/lp-screenshot2.png" alt="" />
              </div>
              {/* ss3: middle-right, left 320px, top 236px, 92×58px, rotated 1.2deg */}
              <div className="lp-why-ss lp-why-ss3">
                <img src="/assets/landing/lp-screenshot3.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="lp-pricing" id="harga">
        {/* Heading block — 1048px centered, gap-24 */}
        <div className="lp-pricing-head">
          <div className="lp-pricing-texts">
            <h2 className="lp-pricing-title">Investasi Terukur untuk Tim Anda</h2>
            <p className="lp-pricing-subtitle">Pilih paket yang sesuai dengan skala rekrutmen perusahaan Anda.</p>
          </div>
          {/* Toggle */}
          <div className="lp-billing-toggle">
            <button
              className={`lp-billing-opt${billingCycle === 'bulanan' ? ' lp-billing-active' : ''}`}
              onClick={() => setBillingCycle('bulanan')}
            >Bulanan</button>
            <button
              className={`lp-billing-opt${billingCycle === 'tahunan' ? ' lp-billing-active' : ''}`}
              onClick={() => setBillingCycle('tahunan')}
            >Tahunan</button>
          </div>
        </div>

        {/* Cards row — position:relative for TERPOPULER badge */}
        <div className="lp-pricing-cards">

          {/* ── BASIC ── */}
          <div className="lp-plan-card">
            <div className="lp-plan-inner">

              {/* Header: name + price */}
              <div className="lp-plan-header">
                <div className="lp-plan-name-block">
                  <h3 className="lp-plan-name">BASIC</h3>
                  <p className="lp-plan-tagline">Ideal untuk startup &amp; tim kecil dengan kebutuhan rekrutmen terukur.</p>
                </div>
                <div className="lp-plan-price-block">
                  {billingCycle === 'bulanan' ? (
                    <div className="lp-plan-price-group">
                      <span className="lp-plan-price">Rp 250.000</span>
                      <span className="lp-plan-price-period">/ pengguna / bulan</span>
                    </div>
                  ) : (
                    <>
                      <div className="lp-plan-price-group">
                        <span className="lp-plan-price">Rp 190.000</span>
                        <span className="lp-plan-price-period">/ pengguna / bulan</span>
                      </div>
                      <div className="lp-plan-annual-badge">Ditagih tahunan (Total Rp 2.280.000)</div>
                    </>
                  )}
                </div>
              </div>

              {/* Feature list */}
              <div className="lp-plan-features">
                <p className="lp-plan-feat-label">TERMASUK FITUR :</p>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Jumlah lowongan aktif <strong>15</strong></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Jumlah kuota kandidat <strong>5.000</strong></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Sistem Penilaian Cerdas LUNA AI</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Pembuat Kriteria Otomatis LUNA AI</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dashboard Data Rekrutmen</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dukungan Pelanggan</span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button className="lp-plan-btn lp-plan-btn-outline">
              Pilih Paket
              <div className="lp-plan-btn-arrow">
                <img src="/assets/landing/lp-arrow-basic.svg" alt="" />
              </div>
            </button>
          </div>

          {/* ── PLUS ── */}
          <div className="lp-plan-card lp-plan-card-plus">
            {/* TERPOPULER badge — inside card, absolute top-right */}
            <div className="lp-terpopuler-badge">
              <img src="/assets/landing/lp-sparkle-pop.svg" alt="" className="lp-terpopuler-icon" />
              TERPOPULER
            </div>
            <div className="lp-plan-inner">

              {/* Header: name + price */}
              <div className="lp-plan-header">
                <div className="lp-plan-name-block">
                  <h3 className="lp-plan-name">PLUS</h3>
                  <p className="lp-plan-tagline">Skalabilitas penuh tanpa batas untuk perusahaan yang aktif bertumbuh.</p>
                </div>
                <div className="lp-plan-price-block">
                  {billingCycle === 'bulanan' ? (
                    <div className="lp-plan-price-group">
                      <span className="lp-plan-price">Rp 490.000</span>
                      <span className="lp-plan-price-period">/ pengguna / bulan</span>
                    </div>
                  ) : (
                    <>
                      <div className="lp-plan-price-group">
                        <div className="lp-plan-price-row">
                          <span className="lp-plan-price">Rp 390.000</span>
                          <span className="lp-plan-price-strike">Rp 490.000</span>
                        </div>
                        <span className="lp-plan-price-period">/ pengguna / bulan</span>
                      </div>
                      <div className="lp-plan-annual-badge">Ditagih tahunan (Total Rp 4.680.000)</div>
                    </>
                  )}
                </div>
              </div>

              {/* Feature list */}
              <div className="lp-plan-features">
                <p className="lp-plan-feat-label">TERMASUK FITUR :</p>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-blue.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Jumlah lowongan aktif <span className="lp-plan-feat-blue">tidak terbatas</span></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-blue.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Jumlah kuota kandidat <span className="lp-plan-feat-blue">tidak terbatas</span></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Sistem Penilaian Cerdas LUNA AI</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Pembuat Kriteria Otomatis LUNA AI</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dashboard Data Rekrutmen</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dukungan Pelanggan</span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button className="lp-plan-btn lp-plan-btn-solid">
              Pilih Paket
              <div className="lp-plan-btn-arrow">
                <img src="/assets/landing/lp-arrow-plus.svg" alt="" />
              </div>
            </button>
          </div>

        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="lp-cta">
        <img src="/assets/landing/lp-cta-bg1.svg" alt="" className="lp-cta-bg1" />
        <img src="/assets/landing/lp-cta-bg2.svg" alt="" className="lp-cta-bg2" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">Siap mentransformasi cara Anda merekrut?</h2>
          <p className="lp-cta-subtitle">Bergabunglah sekarang dan rasakan efisiensi AI dalam 14 hari ke depan. Tanpa risiko, tanpa komitmen awal.</p>
          <button className="lp-cta-btn" onClick={() => navigate?.('landingpage-daftar')}>Mulai Coba Gratis 14 Hari</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <img src="/assets/landing/lp-logo-icon.svg" alt="LUNA" />
              <span className="lp-footer-logo-text">LUNA</span>
            </div>
            <p className="lp-footer-desc">End-to-End Recruitment Operating System bertenaga AI. Fokus pada manusia, biarkan AI menangani administrasinya.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <p className="lp-footer-col-title">Produk</p>
              <div className="lp-footer-col-links">
                <span onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}>Fitur</span>
                <span onClick={() => document.getElementById('keunggulan')?.scrollIntoView({ behavior: 'smooth' })}>Keunggulan</span>
                <span onClick={() => document.getElementById('harga')?.scrollIntoView({ behavior: 'smooth' })}>Harga</span>
              </div>
            </div>
            <div className="lp-footer-col">
              <p className="lp-footer-col-title">Perusahaan</p>
              <div className="lp-footer-col-links">
                <span>Tentang Kami</span>
                <span>Hubungi Bantuan</span>
                <span>Kebijakan Privasi</span>
              </div>
            </div>
          </div>
        </div>
        <img src="/assets/landing/lp-footer-line.svg" alt="" className="lp-footer-divider" />
        <p className="lp-footer-copy">© 2026 Lunasys</p>
      </footer>

    </div>
  );
}
