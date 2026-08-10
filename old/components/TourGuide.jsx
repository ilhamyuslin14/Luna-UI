import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const STEPS = [
  {
    selector: null,
    title: 'Selamat Datang di Luna V3',
    description: 'Mari kita mulai tur singkat untuk mengenali fitur-fitur baru dan cara memaksimalkan LUNA AI untuk kebutuhan rekrutmen Anda.',
    position: 'center',
  },
  { menu: 'beranda_001', selector: '.db001-stats-grid',           title: 'Statistik Perusahaan',    description: 'Pantau performa rekrutmen Anda secara menyeluruh melalui ringkasan talenta dan lowongan aktif.',                       position: 'bottom' },
  { menu: 'beranda_001', selector: '.db001-action-card.primary',  title: 'Buat Lowongan',          description: 'Mulai buat lowongan baru dan atur kriteria penilaian AI langsung dari dashboard.',                                         position: 'bottom' },
  { menu: 'beranda_001', selector: '.db001-action-card.secondary',title: 'Unggah CV Massal',         description: 'Unggah dataset CV secara massal ke data Warehouse untuk selanjutnya diproses oleh AI kami.',                        position: 'bottom' },
  { menu: 'beranda_001', selector: '.db001-activity-card',        title: 'Arus Aktivitas',           description: 'Tetap terinformasi dengan log aktivitas terbaru dari tim rekrutmen.',                                               position: 'left'   },
  { menu: 'beranda_001', selector: '.menu-item[data-menu="departemen_001"]', title: 'Menu Departemen', description: 'Klik menu ini untuk mengelola struktur departemen di perusahaan Anda.',                                             position: 'right'  },
  { menu: 'departemen_001', selector: '.dept001-btn-primary',     title: 'Tambah Departemen',        description: 'Klik tombol ini untuk membuat departemen baru pada organisasi Anda.',                                               position: 'bottom' },
  { menu: 'departemen_001', selector: '.menu-item[data-menu="lowongan_001"]', title: 'Menu Lowongan',   description: 'Pantau semua lowongan kerja yang dibuka, dari kandidat baru hingga status penawaran kerja.',                                    position: 'right'  },
  { menu: 'lowongan_001',  selector: '.lw001-btn-primary',          title: 'Buat Lowongan Baru',       description: 'Mulai proses rekrutmen dengan membuat lowongan baru dan mengatur kriteria penilaian AI.',                          position: 'bottom' },
  { menu: 'lowongan_001',  selector: '.menu-item[data-menu="kandidat_001"]',  title: 'Menu Kandidat',   description: 'Akses seluruh database kandidat yang telah masuk ke sistem Luna AI.',                                             position: 'right'  },
  { menu: 'kandidat_001', selector: '.kan001-btn-primary',         title: 'Tambah Kandidat',          description: 'Tambah atau cari kandidat terbaik dari database talenta Anda.',                                                    position: 'bottom' },
  { menu: 'kandidat_001', selector: '.menu-item[data-menu="pengaturan"]',title: 'Menu Kelola Pengguna', description: 'Atur profil perusahaan, paket langganan, dan pengguna sistem.',                                              position: 'right'  },
  { menu: 'pengaturan', selector: '.kp-settings-list',      title: 'Pengaturan Akun',          description: 'Detail akun dan riwayat transaksi dapat Anda kelola secara transparan di sini.',                                  position: 'top'    },
  { menu: 'pengaturan', selector: '.search-wrapper',        title: 'Pencarian Universal',      description: 'Temukan data apapun dengan cepat melalui bilah pencarian ini.',                                                    position: 'bottom' },
  { menu: 'pengaturan', selector: '#btn-bantuan',           title: 'Pusat Bantuan',            description: 'Hubungi tim dukungan kami jika Anda menemui kendala teknis.',                                                     position: 'right'  },
];

const TOOLTIP_W = 340;
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

export default function TourGuide({ navigate }) {
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
  const next = () => stepIndex < STEPS.length - 1 ? goTo(stepIndex + 1) : endTour();
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
    const step = STEPS[stepIndex];

    const render = () => {
      if (!step.selector) {
        setSpotlight({ centered: true, style: {} });
        setTooltip({ pos: 'center', style: {} });
        return;
      }

      let el = document.querySelector(step.selector);
      if (!el) {
        const retry = setTimeout(() => {
          el = document.querySelector(step.selector);
          if (!el) { next(); return; }
          const { spotlight: s, tooltip: t } = calcPositions(el, step.position);
          setSpotlight({ centered: false, style: s });
          setTooltip({ pos: step.position, style: t });
        }, 200);
        return () => clearTimeout(retry);
      }

      const { spotlight: s, tooltip: t } = calcPositions(el, step.position);
      setSpotlight({ centered: false, style: s });
      setTooltip({ pos: step.position, style: t });
    };

    if (step.menu) {
      navigate(step.menu);
      const t = setTimeout(render, 350);
      return () => clearTimeout(t);
    } else {
      render();
    }
  }, [active, stepIndex]); // eslint-disable-line

  if (!active) return null;

  const step = STEPS[stepIndex];

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
          <span className="tour-progress">{stepIndex + 1} / {STEPS.length}</span>
          <div className="tour-actions-right">
            <button className="tour-btn tour-btn-skip" onClick={endTour}>Lewati</button>
            <button className="tour-btn tour-btn-next" onClick={next}>
              {stepIndex === 0 ? 'Mulai Tour' : stepIndex === STEPS.length - 1 ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
