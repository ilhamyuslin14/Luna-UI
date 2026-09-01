import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../../css/mobile/tour.css';

const MOBILE_STEPS = [
  {
    selector: null,
    title: 'Selamat Datang di Luna',
    description: 'Mari kita mulai tur singkat untuk mengenali menu dan fitur utama LUNA sebagai job portal rekrutmen Anda.',
  },
  { menu: 'beranda_002', selector: '.mdb002-hero-cta', title: 'Buat Lowongan Baru', description: 'Langkah pertama rekrutmen — buat lowongan pekerjaan baru langsung dari Beranda.' },
  { menu: 'beranda_002', selector: '.mdb002-steps', title: '3 Langkah Rekrutmen', description: 'Buat lowongan, bagikan ke kandidat, lalu seleksi yang masuk — alur rekrutmen LUNA dirangkum dalam 3 langkah ini.' },
  { menu: 'beranda_002', selector: '.mdb002-metrics', title: 'Ringkasan Metrik', description: 'Pantau jumlah lowongan aktif dan total kandidat secara sekilas.' },
  { menu: 'lowongan_001', selector: '.msh-tab[data-menu="lowongan_001"]', title: 'Menu Lowongan', description: 'Anda kini berada di menu Lowongan — kelola semua lowongan kerja yang dibuka, dari draft hingga status penawaran kerja, di sini.' },
  { menu: 'lowongan_001', selector: '.mlw001-fab', title: 'Buat Lowongan', description: 'Mulai proses rekrutmen dengan membuat lowongan baru dan mengatur kriteria penilaian AI.' },
  { menu: 'sebar_001', selector: '.msh-tab[data-menu="sebar_001"]', title: 'Menu Sebar', description: 'Menu Sebar membantu lowongan Anda dilihat lebih banyak orang — sebar sendiri ke WhatsApp, Instagram, dan LinkedIn, atau titipkan ke akun loker mitra yang followers-nya ribuan.' },
  { menu: 'sebar_001', selector: '.msb-tabs', title: 'Akun Sendiri atau Akun Mitra', description: 'Pilih "Akun Sendiri" untuk salin teks siap pakai ke channel Anda, atau "Akun Mitra" untuk minta bantuan akun loker lain memposting lowongan Anda.' },
  { menu: 'kandidat_001', selector: '.msh-tab[data-menu="kandidat_001"]', title: 'Menu Kandidat', description: 'Anda kini berada di menu Kandidat — akses seluruh database kandidat yang telah masuk ke sistem LUNA di sini.' },
  { menu: 'kandidat_001', selector: '.mkan001-fab', title: 'Tambah Kandidat', description: 'Tambah atau cari kandidat terbaik dari database talenta Anda.' },
  { menu: 'kandidat_001', selector: '.msh-icon-btn[title="Cari"]', title: 'Pencarian Universal', description: 'Temukan lowongan, kandidat, atau departemen apa pun dengan cepat lewat pencarian ini.' },
  { menu: 'kandidat_001', selector: '.msh-icon-btn[title="Notifikasi"]', title: 'Notifikasi', description: 'Ikuti aktivitas rekrutmen terbaru — lowongan baru, kandidat masuk, hingga perubahan status.' },
  { menu: 'kandidat_001', selector: '.msh-avatar', title: 'Akun, Bantuan & Keluar', description: 'Kelola akun dan profil perusahaan, hubungi tim bantuan, atau keluar dari akun — semuanya lewat menu ini.' },
];

const PADDING = 10;

function calcSpotlight(el) {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };
}

export default function MobileTourGuide({ navigate }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState({ centered: true, style: {} });

  const endTour = () => {
    setActive(false);
    localStorage.removeItem('luna_trigger_tour');
    localStorage.setItem('luna_tour_completed', 'true');
  };

  const goTo = (index) => setStepIndex(index);
  const next = () => stepIndex < MOBILE_STEPS.length - 1 ? goTo(stepIndex + 1) : endTour();
  const prev = () => stepIndex > 0 && goTo(stepIndex - 1);

  // Expose global trigger (dipanggil dari tombol "Mulai Tur Interaktif" di BantuanMobile.jsx)
  useEffect(() => {
    window.startProductTour = () => {
      localStorage.removeItem('luna_tour_completed');
      setStepIndex(0);
      setActive(true);
    };
    return () => { delete window.startProductTour; };
  }, []);

  // Auto-start setelah onboarding (lihat OnboardingMobile.jsx)
  useEffect(() => {
    if (localStorage.getItem('luna_trigger_tour') === 'true') {
      const t = setTimeout(() => { setStepIndex(0); setActive(true); }, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  // Render step tiap kali active/stepIndex berubah
  useEffect(() => {
    if (!active) return;
    // Guard terhadap retry yang telat mendarat setelah user sudah lanjut ke
    // step berikutnya — tanpa ini, selector lambat-mount dari step N bisa
    // menimpa spotlight step N+1 yang sudah tampil.
    let cancelled = false;
    const step = MOBILE_STEPS[stepIndex];

    const applyStep = (el) => {
      if (cancelled) return;
      setSpotlight({ centered: false, style: calcSpotlight(el) });
    };

    const render = () => {
      if (cancelled) return;
      if (!step.selector) {
        setSpotlight({ centered: true, style: {} });
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

  const step = MOBILE_STEPS[stepIndex];

  return createPortal(
    <>
      <div
        className={`mtg-spotlight${spotlight.centered ? ' centered' : ''}`}
        style={spotlight.centered ? {} : spotlight.style}
      />
      <div className="mtg-tooltip">
        <div className="mtg-tooltip-header">
          <h3 className="mtg-tooltip-title">{step.title}</h3>
          <p className="mtg-tooltip-desc">{step.description}</p>
        </div>
        <div className="mtg-tooltip-footer">
          <button
            className="mtg-btn mtg-btn-back"
            onClick={prev}
            style={stepIndex === 0 ? { visibility: 'hidden' } : undefined}
          >
            Kembali
          </button>
          <span className="mtg-progress">{stepIndex + 1} / {MOBILE_STEPS.length}</span>
          <div className="mtg-actions-right">
            <button className="mtg-btn mtg-btn-skip" onClick={endTour}>Lewati</button>
            <button className="mtg-btn mtg-btn-next" onClick={next}>
              {stepIndex === 0 ? 'Mulai' : stepIndex === MOBILE_STEPS.length - 1 ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
