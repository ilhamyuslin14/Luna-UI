/**
 * Luna AI Product Tour Engine (V3 - CTA Focus & Bidirectional)
 */

class TourManager {
  constructor() {
    this.currentStepIndex = 0;
    this.steps = [
      // 1: Welcome Intro
      {
        selector: null,
        title: 'Selamat Datang di Luna V3',
        description: 'Mari kita mulai tur singkat untuk mengenali fitur-fitur baru dan cara memaksimalkan LUNA AI untuk kebutuhan rekrutmen Anda.',
        position: 'center'
      },
      // 2-5: Dashboard Core
      {
        menu: 'dashboard',
        selector: '.db-stats-grid',
        title: 'Statistik Perusahaan',
        description: 'Pantau performa rekrutmen Anda secara menyeluruh melalui ringkasan talenta dan lowongan aktif.',
        position: 'bottom'
      },
      {
        menu: 'dashboard',
        selector: '.db-action-card.primary',
        title: 'Setup Penilaian',
        description: 'Mulai setup kriteria penilaian AI untuk role baru langsung dari dashboard.',
        position: 'bottom'
      },
      {
        menu: 'dashboard',
        selector: '.db-action-card.secondary',
        title: 'Import CV Massal',
        description: 'Unggah dataset CV secara massal ke data Warehouse untuk selanjutnya diproses oleh AI kami.',
        position: 'bottom'
      },
      {
        menu: 'dashboard',
        selector: '.db-activity-card',
        title: 'Arus Aktivitas',
        description: 'Tetap terinformasi dengan log aktivitas terbaru dari tim rekrutmen.',
        position: 'left'
      },

      // 6-7: Departemen Navigation & Action
      {
        menu: 'dashboard',
        selector: '.menu-item[data-menu="departemen"]',
        title: 'Menu Departemen',
        description: 'Klik menu ini untuk mengelola struktur departemen di perusahaan Anda.',
        position: 'right'
      },
      {
        menu: 'departemen',
        selector: '.dept-btn-primary',
        title: 'Tambah Departemen',
        description: 'Klik tombol ini untuk membuat departemen baru pada organisasi Anda.',
        position: 'bottom'
      },

      // 8-9: Seleksi Navigation & Action
      {
        menu: 'departemen',
        selector: '.menu-item[data-menu="seleksi"]',
        title: 'Menu Seleksi',
        description: 'Pantau semua proses seleksi posisi, dari kandidat baru hingga penawaran kerja.',
        position: 'right'
      },
      {
        menu: 'seleksi',
        selector: '.lw-btn-primary',
        title: 'Buat Lowongan Baru',
        description: 'Mulai proses rekrutmen dengan membuat lowongan baru dan mengatur kriteria penilaian AI.',
        position: 'bottom'
      },

      // 10-11: Kandidat Navigation & Action
      {
        menu: 'seleksi',
        selector: '.menu-item[data-menu="kandidat"]',
        title: 'Menu Kandidat',
        description: 'Akses seluruh database kandidat yang telah masuk ke sistem Luna AI.',
        position: 'right'
      },
      {
        menu: 'kandidat',
        selector: '.kan-btn-primary',
        title: 'Tambah Kandidat',
        description: 'Tambah atau cari kandidat terbaik dari database talenta Anda.',
        position: 'bottom'
      },

      // 10-11: Pengaturan Navigation & Content
      {
        menu: 'kandidat',
        selector: '.menu-item[data-menu="pengaturan"]',
        title: 'Menu Kelola Pengguna',
        description: 'Atur profil perusahaan, paket langganan, dan pengguna sistem.',
        position: 'right'
      },
      {
        menu: 'pengaturan',
        selector: '.kp-settings-grid',
        title: 'Pengaturan Akun',
        description: 'Detail akun dan riwayat transaksi dapat Anda kelola secara transparan di sini.',
        position: 'top'
      },

      // 12-13: Navbar Tools
      {
        menu: 'pengaturan',
        selector: '.search-wrapper',
        title: 'Pencarian Universal',
        description: 'Temukan data apapun dengan cepat melalui bilah pencarian ini.',
        position: 'bottom'
      },
      {
        menu: 'pengaturan',
        selector: '#btn-bantuan',
        title: 'Pusat Bantuan',
        description: 'Hubungi tim dukungan kami jika Anda menemui kendala teknis.',
        position: 'right'
      }
    ];

    this.spotlight = null;
    this.tooltip = null;
  }

  init() {
    if (localStorage.getItem('luna_tour_completed') === 'true') {
      return;
    }

    this.createElements();
    this.startTour();
  }

  createElements() {
    if (document.getElementById('tour-spotlight')) return;

    // Spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.id = 'tour-spotlight';
    document.body.appendChild(this.spotlight);

    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip';
    this.tooltip.innerHTML = `
      <div class="tour-arrow"></div>
      <div class="tour-tooltip-header">
        <h3 class="tour-tooltip-title"></h3>
        <p class="tour-tooltip-desc"></p>
      </div>
      <div class="tour-tooltip-footer">
        <div class="tour-actions-left">
           <button class="tour-btn tour-btn-back">Kembali</button>
           <span class="tour-progress"></span>
        </div>
        <div class="tour-actions-right">
          <button class="tour-btn tour-btn-skip">Lewati</button>
          <button class="tour-btn tour-btn-next">Lanjut</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.tooltip);

    // Event Listeners
    this.tooltip.querySelector('.tour-btn-skip').addEventListener('click', () => this.endTour());
    this.tooltip.querySelector('.tour-btn-next').addEventListener('click', () => this.nextStep());
    this.tooltip.querySelector('.tour-btn-back').addEventListener('click', () => this.prevStep());
  }

  async startTour() {
    this.currentStepIndex = 0;
    await this.renderStep();
  }

  async nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      await this.renderStep();
    } else {
      this.endTour();
    }
  }

  async prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      await this.renderStep();
    }
  }

  async renderStep() {
    const step = this.steps[this.currentStepIndex];

    // Navigate if needed
    if (step.menu) {
      const currentMenuActive = document.querySelector('.menu-item.active');
      const currentMenuId = currentMenuActive ? currentMenuActive.getAttribute('data-menu') : null;

      if (step.menu !== currentMenuId) {
        if (window.switchMenu) {
          window.switchMenu(step.menu);
          await new Promise(resolve => setTimeout(resolve, 350));
        }
      }
    }

    // Special case for Intro (selector null)
    if (!step.selector) {
      this.highlightIntro(step);
      this.updateTooltip(step);
      return;
    }

    let element = document.querySelector(step.selector);
    if (!element) {
      console.warn(`Tour element not found: ${step.selector}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 200));
      element = document.querySelector(step.selector);
    }

    if (!element) {
      console.warn(`Tour element still not found: ${step.selector}, skipping step.`);
      await this.nextStep();
      return;
    }

    this.highlight(element, step);
    this.updateTooltip(step);
  }

  highlightIntro(step) {
    this.spotlight.classList.add('centered');
    this.tooltip.className = `tour-tooltip active`;
    this.tooltip.setAttribute('data-pos', 'center');
  }

  highlight(element, step) {
    this.spotlight.classList.remove('centered');
    const rect = element.getBoundingClientRect();
    const padding = 10;

    // Position spotlight
    this.spotlight.style.top = `${rect.top - padding}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;

    // Position tooltip
    this.tooltip.className = `tour-tooltip active`;
    this.tooltip.setAttribute('data-pos', step.position);

    // Initial positioning to get dimensions
    this.tooltip.style.visibility = 'hidden';
    this.tooltip.style.display = 'flex';
    const tooltipRect = this.tooltip.getBoundingClientRect();
    this.tooltip.style.visibility = 'visible';

    let top, left;
    const gap = 20;

    if (step.position === 'bottom') {
      top = rect.bottom + padding + gap;
      left = rect.left;
    } else if (step.position === 'top') {
      top = rect.top - padding - tooltipRect.height - gap;
      left = rect.left;
    } else if (step.position === 'right') {
      top = rect.top;
      left = rect.right + padding + gap;
    } else if (step.position === 'left') {
      top = rect.top;
      left = rect.left - padding - tooltipRect.width - gap;
    }

    // Boundary checks
    if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 20;
    if (left < 10) left = 10;
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 20;
    if (top < 10) top = 10;

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  updateTooltip(step) {
    this.tooltip.querySelector('.tour-tooltip-title').innerText = step.title;
    this.tooltip.querySelector('.tour-tooltip-desc').innerText = step.description;
    this.tooltip.querySelector('.tour-progress').innerText = `${this.currentStepIndex + 1} / ${this.steps.length}`;

    const backBtn = this.tooltip.querySelector('.tour-btn-back');
    backBtn.style.display = this.currentStepIndex === 0 ? 'none' : 'block';

    const nextBtn = this.tooltip.querySelector('.tour-btn-next');
    nextBtn.innerText = this.currentStepIndex === this.steps.length - 1 ? 'Selesai' : (this.currentStepIndex === 0 ? 'Mulai Tour' : 'Lanjut');
  }

  endTour() {
    this.spotlight.style.display = 'none';
    this.tooltip.classList.remove('active');
    setTimeout(() => {
      this.tooltip.style.display = 'none';
      if (this.spotlight.parentNode) this.spotlight.remove();
      if (this.tooltip.parentNode) this.tooltip.remove();
    }, 400);

    localStorage.setItem('luna_tour_completed', 'true');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const v = new URLSearchParams(window.location.search).get('view');
  if (v === 'laman-karir' || v === 'landingpage') return;
  const tour = new TourManager();

  window.startProductTour = () => {
    localStorage.removeItem('luna_tour_completed');
    tour.init();
  };

  setTimeout(() => {
    tour.init();
  }, 1200);
});
