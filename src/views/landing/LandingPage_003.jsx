import { useState } from 'react';

/* ── Icons (placeholder — dipakai sampai aset visual dari Odon siap) ── */
function IconPageLink() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h6M7 11.5h6M7 15h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 15.5a3.5 3.5 0 1 0 4-3.46" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m17.5 14.5 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconScore() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9h6M7 12.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.5" cy="17" r="4" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15.9 17 1 1 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare({ name }) {
  const paths = {
    whatsapp: <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.2A8.5 8.5 0 1 0 12 3.5Z" />,
    linkedin: <path d="M4 4h16v16H4V4Zm3 5.5v7M7 6.7v.1M11 11.5v5M11 11.5c0-1.4 1-2.4 2.4-2.4S16 10.1 16 11.5v5" />,
    instagram: <rect x="4" y="4" width="16" height="16" rx="4.5" />,
    facebook: <path d="M15 8.5h-2c-1 0-1.5.5-1.5 1.5v2h3.3L14.4 15H11.5v7h-3v-7H6v-3h2.5v-2.3C8.5 7.4 10 6 12.6 6H15v2.5Z" />,
    x: <path d="M5 5l14 14M19 5 5 19" />,
    telegram: <path d="m4 12 16-7-3 15-6-4.5L7.5 19 7 13.5 20 6" />,
    link: <path d="M9.5 14.5 14.5 9.5M8 12.5 5.8 14.7a3 3 0 0 0 4.2 4.2L12 16.9M16 11.5l2.2-2.2a3 3 0 0 0-4.2-4.2L11.8 7.3" />,
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10.5" width="14" height="9" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

const FREE_FEATURES = [
  '1 lowongan aktif, dipilih sendiri',
  'Halaman lowongan + link berbagi',
  'Kandidat melamar, CV tersimpan',
  'Pipeline hiring penuh',
];

const BASIC_FEATURES = [
  <>Kapasitas <b>15</b> lowongan aktif</>,
  <>Database <b>5.000</b> kandidat</>,
  'LUNA AI Candidate Scoring',
  'AI Requirement Generator',
  'Dashboard rekrutmen terpusat',
  'Dukungan teknis standar',
];

const PLUS_FEATURES = [
  <>Lowongan aktif <b>tidak terbatas</b></>,
  <>Database kandidat <b>tidak terbatas</b></>,
  'LUNA AI Candidate Scoring',
  'AI Requirement Generator',
  'Dashboard rekrutmen terpusat',
  'Dukungan prioritas 24/7',
];

const COMPARISON_ROWS = [
  { label: 'Menampilkan detail lowongan', googleForm: false, jobPortal: true },
  { label: 'Halaman atas nama perusahaan sendiri', googleForm: false, jobPortal: true },
  { label: 'Pelamar tanpa buat akun', googleForm: false, jobPortal: false },
  { label: 'Ubah otomatis CV PDF jadi teks', googleForm: false, jobPortal: false },
  { label: 'Skor kecocokan kandidat otomatis', googleForm: false, jobPortal: false },
  { label: 'Pipeline hiring', googleForm: false, jobPortal: false },
  { label: 'Applicant tracking system lengkap', googleForm: false, jobPortal: false },
  { label: 'Bisa ditemukan di Google', googleForm: false, jobPortal: true },
  { label: 'Tersedia paket gratis', googleForm: true, jobPortal: false },
];

const FAQ_ITEMS = [
  {
    q: 'Apa yang terjadi kalau 14 hari free trial saya habis?',
    a: 'Akun otomatis turun ke paket Free — bukan hilang. Anda tetap bisa pakai 1 lowongan aktif, pipeline hiring, dan semua data kandidat lama tetap tersimpan. Upgrade kapan saja saat siap.',
  },
  {
    q: 'Apakah pelamar perlu membuat akun untuk melamar?',
    a: 'Tidak. Pelamar cukup buka link laman lowongan Anda, isi data, dan unggah CV — tanpa daftar, tanpa login.',
  },
  {
    q: 'Seberapa akurat skor kecocokan kandidat dari AI?',
    a: 'Skor dihitung dari kecocokan CV terhadap kriteria yang Anda tulis di lowongan — bukan keputusan final. Anda tetap yang menentukan siapa lanjut ke tahap berikutnya.',
  },
  {
    q: 'Bisa pakai lebih dari satu lowongan sekaligus?',
    a: 'Di paket Free hanya 1 lowongan aktif. Basic menampung sampai 15 lowongan, Plus tidak terbatas.',
  },
  {
    q: 'Apakah data kandidat dan perusahaan saya aman?',
    a: 'Data disimpan terenkripsi dan hanya bisa diakses oleh tim Anda. LUNA tidak pernah membagikan data kandidat ke pihak ketiga.',
  },
  {
    q: 'Bisa ganti paket atau berhenti berlangganan kapan saja?',
    a: 'Bisa. Upgrade, downgrade, atau berhenti berlangganan kapan saja tanpa penalti — akun otomatis kembali ke paket Free, bukan dihapus.',
  },
];

export default function LandingPage_003({ navigate }) {
  const goDaftar = () => navigate?.('landingpage-daftar_001');
  const [billing, setBilling] = useState('yearly');
  const isYearly = billing === 'yearly';
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="lp003-page">

      {/* ── Nav: cuma logo + 1 CTA ── */}
      <header className="lp003-nav">
        <div className="lp003-nav-pattern" />
        <div className="lp003-nav-pattern lp003-nav-pattern-2" />
        <div className="lp003-nav-left">
          <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" className="lp003-nav-logo" />
          <span className="lp003-nav-tagline">Portal Karier Mandiri</span>
        </div>
        <button className="lp003-nav-cta" onClick={goDaftar}>
          Buat Portal Karier – Gratis
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </header>

      {/* ── 1. Hero ── */}
      <section className="lp003-hero">
        <div className="lp003-hero-copy">
          <h1 className="lp003-hero-title">Portal Karier Mandiri untuk Seluruh Proses Rekrutmen</h1>
          <p className="lp003-hero-subtitle">Buat halaman lowongan atas nama perusahaan Anda, sebarkan linknya ke mana pun. Setiap pelamar yang masuk otomatis dinilai dan langsung masuk pipeline rekrutmen.</p>
          <button className="lp003-btn lp003-btn-primary lp003-btn-lg" onClick={goDaftar}>
            Buat Portal Karier – Gratis
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <div className="lp003-hero-visual">
          <div className="lp003-hero-panel">
            <div className="lp003-hero-mock">
              <div className="lp003-hero-mock-bar">
                <span /><span /><span />
              </div>
              <div className="lp003-hero-mock-body">
                <div className="lp003-hero-mock-line lp003-mock-w60" />
                <div className="lp003-hero-mock-line lp003-mock-w40" />
                <div className="lp003-hero-mock-chip" />
                <div className="lp003-hero-mock-line lp003-mock-w80" />
                <div className="lp003-hero-mock-line lp003-mock-w70" />
              </div>
            </div>
            <div className="lp003-hero-link-pill">
              <IconShare name="link" />
              <span>luna.id/karir/perusahaan-anda</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Fitur utama ── */}
      <section className="lp003-fitur" id="fitur">
        <div className="lp003-fitur-head">
          <div className="lp003-fitur-eyebrow">Fitur Utama</div>
          <h2 className="lp003-fitur-title-main">Satu alur kerja, dari lowongan tayang sampai kandidat terpilih</h2>
          <p className="lp003-fitur-sub">Tidak perlu pindah-pindah tools — posting, penyaringan otomatis, dan pipeline kandidat ada di tempat yang sama.</p>
        </div>

        <div className="lp003-bento">

          <div className="lp003-bento-cell lp003-bento-a">
            <span className="lp003-bento-tag">Paling membedakan</span>
            <h3>Pipeline rekrutmen dari awal sampai akhir</h3>
            <p>Kelola kandidat dari tahap awal sampai akhir dalam satu papan. Tidak ada yang tercecer di chat atau spreadsheet.</p>
            <div className="lp003-mock lp003-bento-mock">
              <div className="lp003-mock-bar"><span /><span /><span /></div>
              <div className="lp003-mockC-body">
                <div className="lp003-mockC-col">
                  <div className="lp003-mockC-col-head" />
                  <div className="lp003-mockC-card" />
                  <div className="lp003-mockC-card" />
                  <div className="lp003-mockC-card" />
                  <div className="lp003-mockC-card" />
                </div>
                <div className="lp003-mockC-col">
                  <div className="lp003-mockC-col-head" />
                  <div className="lp003-mockC-card lp003-mockC-accent" />
                  <div className="lp003-mockC-card" />
                  <div className="lp003-mockC-card" />
                </div>
                <div className="lp003-mockC-col">
                  <div className="lp003-mockC-col-head" />
                  <div className="lp003-mockC-card" />
                  <div className="lp003-mockC-card" />
                </div>
                <div className="lp003-mockC-col">
                  <div className="lp003-mockC-col-head" />
                  <div className="lp003-mockC-card lp003-mockC-accent" />
                  <div className="lp003-mockC-card" />
                </div>
              </div>
            </div>
          </div>

          <div className="lp003-bento-cell lp003-bento-b">
            <div className="lp003-bento-icon-row">
              <div className="lp003-bento-icon"><IconPageLink /></div>
              <h3>Halaman lowongan dan aplikasi lamaran</h3>
            </div>
            <p>Buat lowongan, publish, dan sebarkan link. Pelamar mengisi data dan mengunggah CV langsung di laman Anda.</p>
            <div className="lp003-mock lp003-bento-mock-sm">
              <div className="lp003-mockA-body">
                <div className="lp003-mockA-chips"><div className="lp003-mockA-chip" /><div className="lp003-mockA-chip" /></div>
                <div className="lp003-mockA-line" style={{ width: '80%' }} />
                <div className="lp003-mockA-drop">⬆ Unggah CV</div>
              </div>
            </div>
          </div>

          <div className="lp003-bento-cell lp003-bento-c">
            <div className="lp003-bento-icon-row">
              <div className="lp003-bento-icon"><IconScore /></div>
              <h3>Scoring otomatis kesesuaian kandidat</h3>
            </div>
            <p>Setiap CV yang masuk otomatis dibaca, dianalisis, dan diberi skor kesesuaian dengan kriteria lowongan Anda.</p>
            <div className="lp003-mock lp003-bento-mock-sm">
              <div className="lp003-mockB-body">
                <div className="lp003-mockB-row"><div className="lp003-mockB-avatar" /><div className="lp003-mockB-line" style={{ maxWidth: '60%' }} /><div className="lp003-mockB-score lp003-score-hi">92</div></div>
                <div className="lp003-mockB-row"><div className="lp003-mockB-avatar" /><div className="lp003-mockB-line" style={{ maxWidth: '45%' }} /><div className="lp003-mockB-score lp003-score-mid">68</div></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Langkah ── */}
      <section className="lp003-langkah">
        <div className="lp003-langkah-head">
          <div className="lp003-langkah-eyebrow">Cara Kerja</div>
          <h2 className="lp003-langkah-title-main">Anda pasang, LUNA menyaring, Anda putuskan</h2>
          <p className="lp003-langkah-sub">Dua langkah untuk memulai, dua langkah berjalan otomatis — lalu tinggal Anda proses kandidat terbaiknya.</p>
        </div>

        <div className="lp003-zig-list">

          <div className="lp003-zig-row">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow lp003-tag-you"><span className="lp003-step-dot-mark" />Langkah 1 — Anda</div>
              <h3>Buat lowongan</h3>
              <p>Isi detail posisi, kriteria, dan syaratnya. Laman lowongan langsung jadi.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-a">1</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-form">
                <div className="lp003-flow-form-card">
                  <div className="lp003-flow-form-row"><span className="lp003-flow-form-label" /><span className="lp003-flow-form-input" /></div>
                  <div className="lp003-flow-form-row"><span className="lp003-flow-form-label" /><span className="lp003-flow-form-input" style={{ width: '70%' }} /></div>
                  <div className="lp003-flow-form-row"><span className="lp003-flow-form-label" /><span className="lp003-flow-form-input lp003-flow-form-input-active"><span className="lp003-flow-cursor" /></span></div>
                </div>
                <div className="lp003-flow-form-badge">✓ Laman siap</div>
              </div>
            </div>
          </div>

          <div className="lp003-zig-row lp003-zig-row-flip">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow lp003-tag-you"><span className="lp003-step-dot-mark" />Langkah 2 — Anda</div>
              <h3>Sebarkan linknya</h3>
              <p>Bagikan ke WhatsApp, LinkedIn, Instagram, atau grup mana pun. Satu link untuk semua channel.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-b">2</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-share">
                <svg className="lp003-flow-share-svg" viewBox="0 0 260 170"><path d="M60 85 L 205 30" /><path d="M60 85 L 215 85" /><path d="M60 85 L 205 140" /></svg>
                <div className="lp003-flow-share-pill">
                  <IconShare name="link" />
                  <span>luna.id/karir/anda</span>
                </div>
                <div className="lp003-flow-share-node lp003-flow-share-node-hot" style={{ left: 195, top: 14 }}><IconShare name="whatsapp" /></div>
                <div className="lp003-flow-share-node" style={{ left: 205, top: 69 }}><IconShare name="instagram" /></div>
                <div className="lp003-flow-share-node" style={{ left: 195, top: 124 }}><IconShare name="linkedin" /></div>
              </div>
            </div>
          </div>

          <div className="lp003-zig-row">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow lp003-tag-auto"><span className="lp003-step-dot-mark" />Langkah 3 — Otomatis</div>
              <h3>Pelamar melamar di laman Anda</h3>
              <p>Isi data, unggah CV, selesai. Tidak perlu buat akun.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-a">3</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-phone">
                <div className="lp003-flow-phone-notch" />
                <div className="lp003-flow-phone-body">
                  <div className="lp003-flow-phone-line" style={{ width: '70%' }} />
                  <div className="lp003-flow-phone-line" style={{ width: '50%' }} />
                  <div className="lp003-flow-phone-line" style={{ width: '60%' }} />
                  <div className="lp003-flow-phone-upload">⬆ UNGGAH CV</div>
                  <div className="lp003-flow-phone-sent"><span className="lp003-flow-phone-ring">✓</span>Terkirim</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lp003-zig-row lp003-zig-row-flip">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow lp003-tag-auto"><span className="lp003-step-dot-mark" />Langkah 4 — Otomatis</div>
              <h3>Kandidat masuk sudah terskor</h3>
              <p>CV dibaca dan dinilai secara otomatis berdasarkan kesesuaian dengan kriteria lowongan Anda.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-b">4</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-sorted">
                <div className="lp003-flow-sorted-head">↓ Diurutkan otomatis</div>
                <div className="lp003-flow-sorted-row"><div className="lp003-flow-sorted-avatar" /><div className="lp003-flow-sorted-line" style={{ maxWidth: '60%' }} /><div className="lp003-flow-sorted-score lp003-score-hi">95</div></div>
                <div className="lp003-flow-sorted-row"><div className="lp003-flow-sorted-avatar" /><div className="lp003-flow-sorted-line" style={{ maxWidth: '50%' }} /><div className="lp003-flow-sorted-score lp003-score-hi">88</div></div>
                <div className="lp003-flow-sorted-row"><div className="lp003-flow-sorted-avatar" /><div className="lp003-flow-sorted-line" style={{ maxWidth: '55%' }} /><div className="lp003-flow-sorted-score lp003-score-mid">64</div></div>
              </div>
            </div>
          </div>

          <div className="lp003-zig-row">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow lp003-tag-you"><span className="lp003-step-dot-mark" />Langkah 5 — Anda</div>
              <h3>Proses kandidat lewat pipeline</h3>
              <p>Geser kandidat sesuai tahapannya — wawancara, offer, sampai diterima. Semua dalam satu papan, tanpa pindah aplikasi.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-a">5</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-stage">
                <div className="lp003-flow-stage-toast">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  Dipindah ke tahap Offer
                </div>
                <div className="lp003-flow-stage-track">
                  <div className="lp003-flow-stage-dot lp003-flow-stage-done" />
                  <div className="lp003-flow-stage-seg lp003-flow-stage-done" />
                  <div className="lp003-flow-stage-dot lp003-flow-stage-done" />
                  <div className="lp003-flow-stage-seg lp003-flow-stage-done" />
                  <div className="lp003-flow-stage-dot lp003-flow-stage-active" />
                  <div className="lp003-flow-stage-seg" />
                  <div className="lp003-flow-stage-dot" />
                </div>
                <div className="lp003-flow-stage-labels">
                  <span>Baru</span><span>Wawancara</span><span className="lp003-flow-stage-label-active">Offer</span><span>Diterima</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. Berbagi ── */}
      <section className="lp003-berbagi">
        <div className="lp003-berbagi-inner">
          <div className="lp003-split-row">
            <div className="lp003-berbagi-text">
              <div className="lp003-berbagi-eyebrow">Berbagi</div>
              <h2 className="lp003-berbagi-title">Sebarkan ke mana pun kandidat Anda berada</h2>
              <p className="lp003-berbagi-sub">Setiap laman lowongan punya tombol berbagi. Kirim ke grup WhatsApp, posting di LinkedIn dan Instagram, atau salin linknya untuk ditempel di mana saja.</p>
            </div>

            <div className="lp003-chip-row">
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="whatsapp" /></span>WhatsApp</div>
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="linkedin" /></span>LinkedIn</div>
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="instagram" /></span>Instagram</div>
              <div className="lp003-chip-break" />
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="facebook" /></span>Facebook</div>
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="x" /></span>X</div>
              <div className="lp003-chip"><span className="lp003-chip-icon"><IconShare name="telegram" /></span>Telegram</div>
              <div className="lp003-chip lp003-chip-link"><span className="lp003-chip-icon"><IconShare name="link" /></span>Salin link</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Perbandingan ── */}
      <section className="lp003-cmp" id="perbandingan">
        <div className="lp003-cmp-head">
          <div className="lp003-cmp-eyebrow">Perbandingan</div>
          <h2 className="lp003-cmp-title">Bagaimana LUNA dibandingkan dengan cara lama</h2>
          <p className="lp003-cmp-sub">Google Form tidak punya pipeline. Job portal tidak bisa baca CV otomatis. LUNA punya keduanya, dari satu link.</p>
        </div>

        <div className="lp003-cmp-table-wrap">
          <table className="lp003-cmp-table">
            <thead>
              <tr>
                <th className="lp003-cmp-th-param">Parameter</th>
                <th>Google Form</th>
                <th>Job Portal</th>
                <th className="lp003-cmp-th-luna">
                  <span className="lp003-cmp-luna-badge">Direkomendasikan</span>
                  LUNA
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="lp003-cmp-td-param">{row.label}</td>
                  <td>
                    <span className={row.googleForm ? 'lp003-icon-yes' : 'lp003-icon-no'}>
                      {row.googleForm ? <IconCheck /> : <IconX />}
                    </span>
                  </td>
                  <td>
                    <span className={row.jobPortal ? 'lp003-icon-yes' : 'lp003-icon-no'}>
                      {row.jobPortal ? <IconCheck /> : <IconX />}
                    </span>
                  </td>
                  <td className="lp003-cmp-td-luna">
                    <span className="lp003-icon-yes"><IconCheck /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6. Harga ── */}
      <section className="lp003-harga" id="harga">
        <div className="lp003-harga-head">
          <div className="lp003-harga-eyebrow">Harga</div>
          <h2 className="lp003-harga-title">Skalakan rekrutmen tanpa biaya tersembunyi</h2>
          <p className="lp003-harga-sub">Mulai gratis, upgrade kapan saja begitu volume hiring bertambah.</p>
        </div>

        <div className="lp003-billing-toggle-wrap">
          <div className="lp003-billing-toggle" data-billing={billing}>
            <div className="lp003-billing-thumb" />
            <button
              className={`lp003-billing-btn${!isYearly ? ' active' : ''}`}
              onClick={() => setBilling('monthly')}
            >
              Bulanan
            </button>
            <button
              className={`lp003-billing-btn${isYearly ? ' active' : ''}`}
              onClick={() => setBilling('yearly')}
            >
              Tahunan <span className="lp003-billing-save">Hemat 20%</span>
            </button>
          </div>
        </div>

        <div className="lp003-harga-grid">
          <div className="lp003-plan-card">
            <div>
              <div className="lp003-plan-name">Free</div>
              <p className="lp003-plan-tagline">Untuk mulai merekrut tanpa biaya — cocok kalau volume lowongan masih kecil.</p>
            </div>
            <div>
              <div className="lp003-plan-price-row"><span className="lp003-plan-price">Rp 0</span></div>
              <span className="lp003-plan-price-unit">berlaku selamanya</span>
            </div>
            <button className="lp003-plan-cta lp003-plan-cta-outline" onClick={goDaftar}>Mulai Gratis</button>
            <ul className="lp003-plan-features">
              {FREE_FEATURES.map((f, i) => (
                <li key={i}><span className="lp003-plan-check"><IconCheck /></span>{f}</li>
              ))}
              <li className="is-locked"><span className="lp003-plan-lock"><IconLock /></span>Parsing CV &amp; skor AI otomatis</li>
            </ul>
          </div>

          <div className="lp003-plan-card">
            <div>
              <div className="lp003-plan-name">Basic</div>
              <p className="lp003-plan-tagline">Standardisasi proses hiring dengan AI untuk startup &amp; tim menengah.</p>
            </div>
            <div>
              <div className="lp003-plan-price-row">
                <span className="lp003-plan-price">{isYearly ? 'Rp 190.000' : 'Rp 250.000'}</span>
                <span className="lp003-plan-price-unit">/ pengguna / bulan</span>
              </div>
              {isYearly && <span className="lp003-plan-billed-note">Ditagih tahunan (Total Rp 2.280.000)</span>}
            </div>
            <button className="lp003-plan-cta lp003-plan-cta-outline" onClick={goDaftar}>Pilih Paket</button>
            <ul className="lp003-plan-features">
              {BASIC_FEATURES.map((f, i) => (
                <li key={i}><span className="lp003-plan-check"><IconCheck /></span>{f}</li>
              ))}
            </ul>
          </div>

          <div className="lp003-plan-card is-plus">
            <span className="lp003-plan-badge">✨ Terpopuler</span>
            <div>
              <div className="lp003-plan-name">Plus</div>
              <p className="lp003-plan-tagline">Infrastruktur akuisisi talenta tanpa batas untuk scale-up masif.</p>
            </div>
            <div>
              <div className="lp003-plan-price-row">
                {isYearly && <span className="lp003-plan-price-strike">Rp 490.000</span>}
                <span className="lp003-plan-price">{isYearly ? 'Rp 390.000' : 'Rp 490.000'}</span>
                <span className="lp003-plan-price-unit">/ pengguna / bulan</span>
              </div>
              {isYearly && <span className="lp003-plan-billed-note">Ditagih tahunan (Total Rp 4.680.000)</span>}
            </div>
            <button className="lp003-plan-cta lp003-plan-cta-solid" onClick={goDaftar}>Pilih Paket</button>
            <ul className="lp003-plan-features">
              {PLUS_FEATURES.map((f, i) => (
                <li key={i}><span className="lp003-plan-check"><IconCheck /></span>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section className="lp003-faq">
        <div className="lp003-faq-head">
          <div className="lp003-faq-eyebrow">FAQ</div>
          <h2 className="lp003-faq-title">Masih ada pertanyaan?</h2>
          <p className="lp003-faq-sub">Kalau belum ketemu jawabannya, tim kami siap bantu.</p>
        </div>

        <div className="lp003-faq-acc">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div className={`lp003-faq-item${isOpen ? ' open' : ''}`} key={item.q}>
                <button className="lp003-faq-q" onClick={() => setOpenFaq(isOpen ? -1 : i)}>
                  <span>{item.q}</span>
                  <span className="lp003-faq-q-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
                <div className="lp003-faq-a"><div className="lp003-faq-a-inner">{item.a}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 8. Penutup ── */}
      <section className="lp003-cta-quiet">
        <div className="lp003-cta-quiet-inner">
          <div className="lp003-cta-quiet-eyebrow">Siap mulai?</div>
          <h2 className="lp003-cta-quiet-title">Mulai portal karier Anda hari ini</h2>
          <button className="lp003-cta-quiet-btn" onClick={goDaftar}>
            Buat Portal Karier – Gratis
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <div className="lp003-cta-quiet-micro">
            <span className="lp003-cta-quiet-micro-item"><IconCheck /> Gratis selamanya untuk mulai</span>
            <span className="lp003-cta-quiet-micro-item"><IconCheck /> Tanpa kartu kredit</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp003-footer">
        <div className="lp003-footer-top">
          <div className="lp003-footer-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" className="lp003-footer-logo" />
            <p className="lp003-footer-desc">Software rekrutmen end-to-end bertenaga AI. Fokus pada manusia, biarkan AI menangani administrasinya.</p>
          </div>
          <div className="lp003-footer-links">
            <div className="lp003-footer-col">
              <p className="lp003-footer-col-title">Produk</p>
              <div className="lp003-footer-col-links">
                <span onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}>Fitur</span>
                <span onClick={() => document.getElementById('perbandingan')?.scrollIntoView({ behavior: 'smooth' })}>Perbandingan</span>
                <span onClick={() => document.getElementById('harga')?.scrollIntoView({ behavior: 'smooth' })}>Harga</span>
              </div>
            </div>
            <div className="lp003-footer-col">
              <p className="lp003-footer-col-title">Perusahaan</p>
              <div className="lp003-footer-col-links">
                <span>Tentang Kami</span>
                <span>Hubungi Bantuan</span>
                <span>Kebijakan Privasi</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lp003-footer-divider" />
        <p className="lp003-footer-copy">© 2026 Lunasys</p>
      </footer>

    </div>
  );
}
