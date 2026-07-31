import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const STEPS_001 = [
  {
    selector: null,
    title: 'Selamat Datang di Luna',
    description: 'Mari kita mulai tur singkat untuk mengenali menu dan fitur utama LUNA sebagai job portal rekrutmen Anda.',
    position: 'center',
  },
  { menu: 'beranda_002', selector: '.db002-btn-cta-primary',               title: 'Buat Lowongan Baru', description: 'Langkah pertama rekrutmen — buat lowongan pekerjaan baru langsung dari dashboard.',                                        position: 'bottom' },
  { menu: 'beranda_002', selector: '.db002-tiles-grid',                    title: '3 Langkah Rekrutmen', description: 'Buat lowongan, bagikan ke kandidat, lalu seleksi yang masuk — alur rekrutmen LUNA dirangkum dalam 3 langkah ini.',           position: 'bottom' },
  { menu: 'beranda_002', selector: '.db002-metrics-grid',                  title: 'Ringkasan Metrik',   description: 'Pantau jumlah lowongan aktif, total kandidat, dan yang sudah diterima secara sekilas.',                                    position: 'top'    },
  { menu: 'lowongan_001', selector: '.menu-item[data-menu="lowongan_001"]', title: 'Menu Lowongan',    description: 'Anda kini berada di menu Lowongan — kelola semua lowongan kerja yang dibuka, dari draft hingga status penawaran kerja, di sini.', position: 'right'  },
  { menu: 'lowongan_001', selector: '.lw001-btn-primary',                  title: 'Buat Lowongan',     description: 'Mulai proses rekrutmen dengan membuat lowongan baru dan mengatur kriteria penilaian AI.',                                  position: 'bottom' },
  { menu: 'kandidat_001', selector: '.menu-item[data-menu="kandidat_001"]', title: 'Menu Kandidat',    description: 'Anda kini berada di menu Kandidat — akses seluruh database kandidat yang telah masuk ke sistem LUNA di sini.',              position: 'right'  },
  { menu: 'kandidat_001', selector: '.kan001-btn-primary',                 title: 'Tambah Kandidat',   description: 'Tambah atau cari kandidat terbaik dari database talenta Anda.',                                                           position: 'bottom' },
  { menu: 'kandidat_001', selector: '.search-wrapper',                     title: 'Pencarian Universal', description: 'Temukan lowongan atau kandidat apapun dengan cepat melalui bilah pencarian ini.',                                        position: 'bottom' },
  { menu: 'kandidat_001', selector: '.nav-quick-wrapper',                  title: 'Aksi Cepat',        description: 'Pintasan untuk membuat lowongan baru atau menambah kandidat tanpa perlu berpindah halaman.',                               position: 'bottom' },
  { menu: 'kandidat_001', selector: '.nav-notif-wrapper',                  title: 'Notifikasi',        description: 'Ikuti aktivitas rekrutmen terbaru — lowongan baru, kandidat masuk, hingga perubahan status.',                              position: 'bottom' },
  { menu: 'kandidat_001', selector: '.nav-profile-wrapper',                title: 'Akun & Profil',     description: 'Kelola akun dan profil perusahaan Anda, atau keluar dari akun, melalui menu ini.',                                        position: 'bottom' },
  { menu: 'kandidat_001', selector: '#btn-bantuan',                        title: 'Pusat Bantuan',     description: 'Hubungi tim dukungan kami jika Anda menemui kendala teknis.',                                                             position: 'right'  },
];

const TOOLTIP_W = 400;
const TOOLTIP_H = 200;
const PADDING   = 10;
const GAP       = 20;

function calcPositions(el, position) {
  const rect = el.getBoundingClientRect();
  const spotlight = {
    top:    rect.top    - PADDING,
    left:   rect.left   - PADDING,
    width:  rect.width  + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  let top, left;
  if (position === 'bottom') { top = rect.bottom + PADDING + GAP;                      left = rect.left; }
  if (position === 'top')    { top = rect.top    - PADDING - TOOLTIP_H - GAP;          left = rect.left; }
  if (position === 'right')  { top = rect.top;   left = rect.right  + PADDING + GAP;                     }
  if (position === 'left')   { top = rect.top;   left = rect.left   - PADDING - TOOLTIP_W - GAP;         }

  if (left + TOOLTIP_W > window.innerWidth)  left = window.innerWidth  - TOOLTIP_W - 20;
  if (left < 10)                             left = 10;
  if (top  + TOOLTIP_H > window.innerHeight) top  = window.innerHeight - TOOLTIP_H - 20;
  if (top  < 10)                             top  = 10;

  return { spotlight, tooltip: { top, left } };
}

export default function TourGuide_001({ navigate }) {
  const [active,    setActive]    = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState({ centered: true, style: {} });
  const [tooltip,   setTooltip]   = useState({ pos: 'center', style: {} });

  const endTour = () => {
    setActive(false);
    localStorage.removeItem('luna_trigger_tour');
    localStorage.setItem('luna_tour_completed', 'true');
  };

  const goTo = (index) => setStepIndex(index);
  const next = () => stepIndex < STEPS_001.length - 1 ? goTo(stepIndex + 1) : endTour();
  const prev = () => stepIndex > 0 && goTo(stepIndex - 1);

  // Expose global trigger (e.g. from Bantuan page)
  useEffect(() => {
    window.startProductTour = () => {
      localStorage.removeItem('luna_tour_completed');
      setStepIndex(0);
      setActive(true);
    };
    return () => { delete window.startProductTour; };
  }, []);

  // Auto-start
  useEffect(() => {
    if (localStorage.getItem('luna_trigger_tour') === 'true') {
      const t = setTimeout(() => { setStepIndex(0); setActive(true); }, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  // Render step whenever active or stepIndex changes
  useEffect(() => {
    if (!active) return;
    // Guards against a delayed retry (or navigate-then-render timer) landing
    // after the user has already advanced past this step — without this,
    // a slow-to-mount selector from step N can paint its spotlight/tooltip
    // on top of step N+1's already-current text.
    let cancelled = false;
    const step = STEPS_001[stepIndex];

    const applyStep = (el) => {
      if (cancelled) return;
      const { spotlight: s, tooltip: t } = calcPositions(el, step.position);
      setSpotlight({ centered: false, style: s });
      setTooltip({ pos: step.position, style: t });
    };

    const render = () => {
      if (cancelled) return;
      if (!step.selector) {
        setSpotlight({ centered: true, style: {} });
        setTooltip({ pos: 'center', style: {} });
        return;
      }

      const el = document.querySelector(step.selector);
      if (!el) {
        setTimeout(() => {
          if (cancelled) return;
          const retryEl = document.querySelector(step.selector);
          if (!retryEl) { next(); return; }
          applyStep(retryEl);
        }, 200);
        return;
      }

      applyStep(el);
    };

    let navTimer;
    if (step.menu) {
      navigate(step.menu);
      navTimer = setTimeout(render, 350);
    } else {
      render();
    }

    return () => {
      cancelled = true;
      if (navTimer) clearTimeout(navTimer);
    };
  }, [active, stepIndex]); // eslint-disable-line

  if (!active) return null;

  const step = STEPS_001[stepIndex];

  return createPortal(
    <>
      <div
        id="tour-spotlight"
        className={spotlight.centered ? 'centered' : ''}
        style={spotlight.centered ? {} : spotlight.style}
      />
      <div
        className="tour-tooltip active"
        data-pos={tooltip.pos}
        style={tooltip.pos === 'center' ? {} : tooltip.style}
      >
        <div className="tour-arrow" />
        <div className="tour-tooltip-header">
          <h3 className="tour-tooltip-title">{step.title}</h3>
          <p className="tour-tooltip-desc">{step.description}</p>
        </div>
        <div className="tour-tooltip-footer">
          <button
            className="tour-btn tour-btn-back"
            onClick={prev}
            style={stepIndex === 0 ? { visibility: 'hidden' } : undefined}
          >
            Kembali
          </button>
          <span className="tour-progress">{stepIndex + 1} / {STEPS_001.length}</span>
          <div className="tour-actions-right">
            <button className="tour-btn tour-btn-skip" onClick={endTour}>Lewati</button>
            <button className="tour-btn tour-btn-next" onClick={next}>
              {stepIndex === 0 ? 'Mulai Tour' : stepIndex === STEPS_001.length - 1 ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
