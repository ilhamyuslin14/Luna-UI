import { useState, useEffect, useRef } from 'react';

export default function LandingPage_001({ navigate }) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = '50px'; // Offset for fixed navbar

    const sections = ['hero', 'fitur', 'keunggulan', 'harga'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id === 'hero' ? '' : entry.target.id);
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
      document.documentElement.style.scrollPaddingTop = '';
      observer.disconnect();
    };
  }, []);

  // Auto-scroll logic for trust logos
  const logosRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (logosRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = logosRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          logosRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          logosRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const [billingCycle, setBillingCycle] = useState('tahunan');

  const [activeFeature, setActiveFeature] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }
    if (isRightSwipe) {
      setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
    }
  };

  const features = [
    {
      title: "Upload CV Massal",
      icon: "/assets/landing/lp-icon-upload.svg",
      bg: "#eef7fd",
      desc: "Tarik dan lepas puluhan CV sekaligus dalam format PDF atau DOCX. Sistem mengekstrak data dalam sekejap tanpa data-entry manual."
    },
    {
      title: "AI Matching & Scoring",
      icon: "/assets/landing/lp-icon-brain.svg",
      bg: "#f4f3fe",
      desc: "AI membaca Job Description dan mencocokkannya dengan kualifikasi kandidat, menghasilkan skor instan bebas bias secara akurat."
    },
    {
      title: "Pipeline Management",
      icon: "/assets/landing/lp-icon-pipeline.svg",
      bg: "#ecfcf8",
      desc: "Pantau pergerakan kandidat dari Screening hingga Hired menggunakan Kanban board intuitif dengan fitur drag-and-drop."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 10000); // 10 seconds delay as requested, timer resets when activeFeature changes
    return () => clearInterval(timer);
  }, [activeFeature, features.length]);

  return (
    <div className="lp-page lp-_001-container">

      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-header-logo">
          <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" className="lp-header-logo-icon" style={{ height: '58px', width: 'auto' }} />
        </div>
        <nav className="lp-header-nav">
          <button className={`lp-nav-link${activeSection === 'fitur' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}>Fitur</button>
          <button className={`lp-nav-link${activeSection === 'keunggulan' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('keunggulan')?.scrollIntoView({ behavior: 'smooth' })}>Keunggulan</button>
          <button className={`lp-nav-link${activeSection === 'harga' ? ' lp-nav-active' : ''}`} onClick={() => document.getElementById('harga')?.scrollIntoView({ behavior: 'smooth' })}>Harga</button>
        </nav>
        <div className="lp-header-actions">
          <button className="lp-header-login" onClick={() => navigate?.('landingpage-masuk_001')}>Masuk</button>
          <button className="lp-header-cta" onClick={() => navigate?.('landingpage-daftar_001')}>Coba Gratis 14 Hari</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" id="hero">
        <img src="/assets/landing/lp-hero-bg-wave.svg" alt="" className="lp-hero-bg-wave" />

        <div className="lp-hero-left">

          <h1 className="lp-hero-title">
            Berhenti Membaca<br />
            <span className="lp-hero-title-highlight">Ratusan CV.</span>
          </h1>
          <p className="lp-hero-subtitle">
            Biarkan AI temukan kandidat terbaik Anda dalam hitungan detik. LUNA V3 mengotomatiskan screening, memberikan scoring akurat, dan merapikan pipeline rekrutmen Anda.
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-hero-btn-primary" onClick={() => navigate?.('landingpage-daftar_001')}>
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
        <p className="lp-trust-label">Dipercaya oleh</p>
        <div className="lp-trust-logos" ref={logosRef}>
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
          {/* <img src="/assets/logos/logo-icon.png" alt="" className="lp-features-sparkle" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} /> */}
          <h2 className="lp-features-title">Pilar Operasional LUNA V3</h2>
          <p className="lp-features-subtitle">
            Otomatisasi seluruh alur rekrutmen Anda. Dari tumpukan CV menjadi daftar kandidat terpilih dalam hitungan menit.
          </p>
        </div>
        {/* ── DESKTOP GRID (Hidden on Mobile) ── */}
        <div className="lp-features-grid lp-hide-on-mobile">
          {features.map((f, i) => (
            <div className="lp-feature-card" key={i}>
              <div className="lp-feature-icon-wrap" style={{ background: f.bg }}>
                <img src={f.icon} alt="" />
              </div>
              <div className="lp-feature-text">
                <h3 className="lp-feature-name">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MOBILE SLIDER (Hidden on Desktop) ── */}
        <div className="lp-features-slider lp-show-on-mobile">
          <div className="lp-slider-nav">
            {features.map((f, i) => (
              <div key={i} className="lp-slider-tab-container">
                <div 
                  className={`lp-slider-tab ${activeFeature === i ? 'lp-slider-tab-active' : ''}`} 
                  onClick={() => setActiveFeature(i)}
                >
                  {f.title}
                </div>
                {i < features.length - 1 && <span className="lp-slider-separator">|</span>}
              </div>
            ))}
          </div>
          <div 
            className="lp-feature-card lp-slider-card"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            <div className="lp-slider-card-header">
              <div className="lp-feature-icon-wrap" style={{ background: features[activeFeature].bg }}>
                <img src={features[activeFeature].icon} alt="" />
              </div>
              <h3 className="lp-feature-name">{features[activeFeature].title}</h3>
            </div>
            <p className="lp-feature-desc">{features[activeFeature].desc}</p>
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
                  <img src="/assets/landing/lp-icon-upload.svg" alt="" />
                </div>
                <div className="lp-why-point-text">
                  <h4 className="lp-why-point-title">Dual-Flow AI Scoring</h4>
                  <p className="lp-why-point-desc">Kumpulkan kandidat melalui dua cara: HR mengunggah CV secara massal, atau aktifkan Laman Karir bawaan agar kandidat melamar langsung layaknya di job portal sendiri. Semua data otomatis masuk dashboard dan dinilai oleh AI.</p>
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
            <h2 className="lp-pricing-title">Skalakan Rekrutmen Tanpa Biaya Tersembunyi</h2>
            <p className="lp-pricing-subtitle">Pilih infrastruktur AI yang paling sesuai dengan volume hiring perusahaan Anda.</p>
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
                  <p className="lp-plan-tagline">Standardisasi proses hiring dengan AI untuk startup &amp; tim menengah.</p>
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
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Kapasitas <strong>15</strong> Lowongan Aktif</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Database <strong>5.000</strong> Kandidat</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">LUNA AI Candidate Scoring</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">AI Requirement Generator</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dashboard Rekrutmen Terpusat</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dukungan Teknis Standar</span>
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
                  <p className="lp-plan-tagline">Infrastruktur akuisisi talenta tanpa batas untuk scale-up masif.</p>
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
                  <img src="/assets/landing/lp-check-orange_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Lowongan Aktif <span className="lp-plan-feat-blue">Tidak Terbatas</span></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-orange_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Database Kandidat <span className="lp-plan-feat-blue">Tidak Terbatas</span></span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">LUNA AI Candidate Scoring</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">AI Requirement Generator</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dashboard Rekrutmen Terpusat</span>
                </div>
                <div className="lp-plan-feat-row">
                  <img src="/assets/landing/lp-check-green_001.svg" alt="" className="lp-plan-feat-icon" />
                  <span className="lp-plan-feat-text">Dukungan Prioritas 24/7</span>
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
        <img src="/assets/landing/lp-cta-bg1-dark.svg" alt="" className="lp-cta-bg1" />
        <img src="/assets/landing/lp-cta-bg2-dark.svg" alt="" className="lp-cta-bg2" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">Siap mentransformasi cara Anda merekrut?</h2>
          <p className="lp-cta-subtitle">Bergabunglah sekarang dan rasakan efisiensi AI dalam 14 hari ke depan. Tanpa risiko, tanpa komitmen awal.</p>
          <button className="lp-cta-btn" onClick={() => navigate?.('landingpage-daftar_001')}>Mulai Coba Gratis 14 Hari</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" style={{ height: '76px', width: 'auto' }} />
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
