import { useState } from 'react';

/* ── Icons (placeholder — dipakai sampai aset visual dari Odon siap) ── */
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

function IconDownload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m7.5 11 4.5 4.5L16.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
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

const COMPARISON_ROWS = [
  { label: 'Halaman atas nama perusahaan sendiri', googleForm: false, jobPortal: false },
  { label: 'Pelamar melamar tanpa buat akun', googleForm: true, jobPortal: false },
  { label: 'Semua CV bisa diunduh, data milik Anda', googleForm: true, jobPortal: false },
  { label: 'CV dibaca otomatis jadi teks', googleForm: false, jobPortal: false },
  { label: 'Pelamar dinilai dan diurutkan otomatis', googleForm: false, jobPortal: false },
  { label: 'Alur dari lamaran sampai diterima', googleForm: false, jobPortal: false },
  { label: 'Bisa ditemukan di Google', googleForm: false, jobPortal: true },
  { label: 'Lowongan & pelamar tanpa batas, gratis', googleForm: true, jobPortal: false },
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
  const goMasuk = () => navigate?.('landingpage-masuk_001');
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
        <div className="lp003-nav-right">
          <button className="lp003-nav-login" onClick={goMasuk}>Masuk</button>
          <button className="lp003-nav-cta" onClick={goDaftar}>
            Mulai Gratis
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </header>

      {/* ── 1. Hero ── */}
      <section className="lp003-hero">
        <div className="lp003-hero-copy">
          <span className="lp003-hero-dash" />
          <h1 className="lp003-hero-title">Portal Karier Paling Ramah Usaha Kecil. <span className="lp003-hero-title-accent">Gratis.</span></h1>
          <p className="lp003-hero-subtitle">Buat halaman lowongan atas nama perusahaan Anda, sebarkan linknya ke mana pun. Setiap pelamar yang masuk otomatis dinilai dan langsung masuk alur rekrutmen.</p>
          <button className="lp003-btn lp003-btn-primary lp003-btn-lg" onClick={goDaftar}>
            Mulai Gratis
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <div className="lp003-hero-micro">
            <span className="lp003-hero-micro-item"><IconCheck /> Tanpa biaya apapun</span>
            <span className="lp003-hero-micro-item"><IconCheck /> Lowongan &amp; pelamar tanpa batas</span>
          </div>
        </div>

        <div className="lp003-hero-visual">
          <div className="lp003-hero-panel">
            <div className="lp003-hero-mock lp003-hero-mock-job">
              <div className="lp003-hero-mock-bar">
                <span /><span /><span />
                <span className="lp003-hero-mock-url">karir.lunasys.ai/kiranadigital</span>
              </div>

              <div className="lp003-hero-mock-jobhead">
                <img src="/assets/logos/luna-logo-clean.png" alt="" className="lp003-hero-mock-jobhead-logo" />
                <span className="lp003-hero-mock-jobhead-by">Diposting oleh <strong>Kirana Digital</strong></span>
              </div>

              <div className="lp003-hero-mock-jobbody">
                <span className="lp003-hero-mock-status">LOWONGAN AKTIF</span>
                <h4 className="lp003-hero-mock-jobtitle">Admin Marketing</h4>
                <div className="lp003-hero-mock-tags">
                  <span>Jakarta Selatan</span>
                  <span>Penuh waktu</span>
                  <span>Rp 5–6,5 jt</span>
                  <span className="lp003-hero-mock-tag-id">LUN-6690</span>
                </div>

                <div className="lp003-hero-mock-desc">
                  <p className="lp003-hero-mock-desc-title">Deskripsi pekerjaan</p>
                  <p className="lp003-hero-mock-desc-text">Mengelola konten, membalas pesan pelanggan, dan merapikan data penjualan harian.</p>
                  <ul className="lp003-hero-mock-desc-list">
                    <li>Terbiasa dengan Instagram, WhatsApp Business, dan Excel</li>
                    <li>Rapi, teliti, dan enak diajak komunikasi</li>
                  </ul>
                </div>

                <div className="lp003-hero-mock-form">
                  <p className="lp003-hero-mock-form-title">Lamar posisi ini</p>
                  <span className="lp003-hero-mock-input">Nama lengkap</span>
                  <div className="lp003-hero-mock-input-row">
                    <span className="lp003-hero-mock-input">Email</span>
                    <span className="lp003-hero-mock-input">WhatsApp</span>
                  </div>
                  <div className="lp003-hero-mock-upload">UNGGAH CV</div>
                  <div className="lp003-hero-mock-submit">Kirim lamaran</div>
                </div>
              </div>
            </div>

            <div className="lp003-hero-link-pill">
              <IconShare name="link" />
              <span>karir.lunasys.ai/kiranadigital</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Fitur utama ── */}
      <section className="lp003-fitur" id="fitur">
        <div className="lp003-fitur-head">
          <div className="lp003-fitur-eyebrow-row">
            <span className="lp003-fitur-eyebrow">Fitur Utama</span>
          </div>
          <h2 className="lp003-fitur-title-main">Halaman sendiri, pelamar sendiri, data sendiri</h2>
          <p className="lp003-fitur-sub">Satu alur kerja — posting, penyaringan otomatis, dan alur rekrutmen kandidat di tempat yang sama.</p>
        </div>

        <div className="lp003-bento">

          <div className="lp003-bento-cell lp003-bento-a">
            <span className="lp003-bento-tag lp003-bento-tag-dark">Paling membedakan</span>
            <h3>Halaman lowongan atas nama perusahaan Anda</h3>
            <p>Bukan menumpang nama portal. Link dengan nama perusahaan Anda dan bebas disebar ke mana pun.</p>

            <div className="lp003-mock lp003-bento-mock-job">
              <div className="lp003-bjob-bar">
                <span /><span /><span />
                <span className="lp003-bjob-url">karir.lunasys.ai/kopirimba</span>
              </div>

              <div className="lp003-bjob-head">
                <img src="/assets/logos/luna-logo-clean.png" alt="" className="lp003-bjob-head-logo" />
                <span className="lp003-bjob-head-by">Diposting oleh <strong>Kopi Rimba</strong></span>
              </div>

              <div className="lp003-bjob-body">
                <span className="lp003-bjob-status">LOWONGAN AKTIF</span>
                <h4 className="lp003-bjob-title">Barista</h4>
                <div className="lp003-bjob-tags">
                  <span>Bandung</span>
                  <span>Penuh waktu</span>
                  <span>Rp 3,5–4,5 jt</span>
                  <span className="lp003-bjob-tag-id">LUN-2041</span>
                </div>

                <div className="lp003-bjob-desc">
                  <p className="lp003-bjob-desc-title">Deskripsi pekerjaan</p>
                  <p className="lp003-bjob-desc-text">Meracik minuman, melayani pelanggan, dan menjaga kedai kami di Dago tetap rapi.</p>
                  <ul className="lp003-bjob-desc-list">
                    <li>Siap kerja shift, termasuk akhir pekan</li>
                    <li>Ramah ke pelanggan, teliti soal kebersihan</li>
                    <li>Pengalaman barista jadi nilai plus, bukan syarat</li>
                    <li>Lulusan SMA/SMK ke atas, usia 18–30 tahun</li>
                  </ul>

                  <p className="lp003-bjob-desc-title lp003-bjob-desc-title-sp">Yang kami tawarkan</p>
                  <ul className="lp003-bjob-desc-list">
                    <li>Gaji tetap, bonus tip, dan makan siang</li>
                    <li>Pelatihan meracik kopi dari kepala barista</li>
                    <li>BPJS setelah tiga bulan masa percobaan</li>
                  </ul>

                  <div className="lp003-bjob-meta">
                    <span><b>Jam kerja</b> Shift, 8 jam</span>
                    <span><b>Lokasi</b> Dago, Bandung</span>
                    <span><b>Mulai</b> Secepatnya</span>
                  </div>
                </div>

                <div className="lp003-bjob-form">
                  <p className="lp003-bjob-form-title">Lamar posisi ini</p>
                  <div className="lp003-bjob-form-row">
                    <span className="lp003-bjob-input">Nama lengkap</span>
                    <span className="lp003-bjob-input">WhatsApp</span>
                  </div>
                  <div className="lp003-bjob-upload">UNGGAH CV</div>
                  <div className="lp003-bjob-submit">Kirim lamaran</div>
                </div>

                <div className="lp003-bjob-footer">
                  <span>Diposting 2 hari lalu · Ditutup 30 September</span>
                  <span className="lp003-bjob-footer-url">karir.lunasys.ai</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lp003-bento-cell lp003-bento-b">
            <div className="lp003-bento-icon-row">
              <div className="lp003-bento-icon"><IconDownload /></div>
              <h3>Data pelamar milik Anda</h3>
            </div>
            <p>Semua CV bisa diunduh kapan saja. Tidak dikunci, tidak perlu bayar untuk membukanya.</p>

            <div className="lp003-mockD-list">
              <div className="lp003-mockD-row"><span className="lp003-mockD-name">Nadia_Prameswari_CV.pdf</span><span className="lp003-mockD-size">412 KB</span></div>
              <div className="lp003-mockD-row"><span className="lp003-mockD-name">Bagas_Rahmadi_CV.pdf</span><span className="lp003-mockD-size">288 KB</span></div>
              <div className="lp003-mockD-row"><span className="lp003-mockD-name">Sari_Widuri_CV.pdf</span><span className="lp003-mockD-size">356 KB</span></div>
            </div>
            <div className="lp003-bento-dashed-btn"><IconDownload /> Unduh semua CV</div>
          </div>

          <div className="lp003-bento-cell lp003-bento-c">
            <div className="lp003-bento-icon-row">
              <div className="lp003-bento-icon"><IconScore /></div>
              <h3>Pelamar otomatis dinilai dan diurutkan</h3>
            </div>
            <p>Setiap CV dibaca dan diberi skor kesesuaian dengan kriteria lowongan Anda.</p>

            <div className="lp003-mockE-list">
              <div className="lp003-mockE-head">
                <span>3 Pelamar</span>
                <span className="lp003-mockE-head-sub">Diurutkan skor</span>
              </div>
              <div className="lp003-mockE-row">
                <span className="lp003-mockE-avatar">NP</span>
                <span className="lp003-mockE-name">Nadia Prameswari</span>
                <span className="lp003-mockE-score lp003-score-hi">92</span>
              </div>
              <div className="lp003-mockE-row">
                <span className="lp003-mockE-avatar">BR</span>
                <span className="lp003-mockE-name">Bagas Rahmadi</span>
                <span className="lp003-mockE-score lp003-score-hi">85</span>
              </div>
              <div className="lp003-mockE-row">
                <span className="lp003-mockE-avatar">SW</span>
                <span className="lp003-mockE-name">Sari Widuri</span>
                <span className="lp003-mockE-score lp003-score-mid">68</span>
              </div>
            </div>
            <div className="lp003-bento-dashed-btn"><IconEye /> Lihat Detail Penilaian</div>
          </div>

        </div>
      </section>

      {/* ── 2b. Buat Lowongan Otomatis ── */}
      <section className="lp003-otomatis">
        <div className="lp003-otomatis-inner">
          <div className="lp003-otomatis-eyebrow-row">
            <span className="lp003-otomatis-eyebrow">Fitur Baru</span>
          </div>

          <div className="lp003-otomatis-grid">
            <div className="lp003-otomatis-text-col">
              <h2 className="lp003-otomatis-title">Buat lowongan lebih mudah dengan bantuan <span className="lp003-otomatis-title-accent">Luna</span></h2>
              <p className="lp003-otomatis-sub">LUNA membantu menyusun semua yang ada di pikiran Anda menjadi lowongan yang terstruktur dan sesuai kebutuhan.</p>

              <div className="lp003-otomatis-feature-list">
                <div className="lp003-otomatis-feature-item">
                  <div className="lp003-bento-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div>
                    <h4>Disusun dari percakapan alami</h4>
                    <p>Jawab beberapa pertanyaan pakai bahasa sendiri, tanpa perlu tahu format lowongan formal.</p>
                  </div>
                </div>
                <div className="lp003-otomatis-feature-item">
                  <div className="lp003-bento-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div>
                    <h4>Draf lengkap dalam hitungan detik</h4>
                    <p>Judul posisi, tanggung jawab, kualifikasi, hingga nilai tambah tersusun otomatis dan siap ditinjau.</p>
                  </div>
                </div>
                <div className="lp003-otomatis-feature-item">
                  <div className="lp003-bento-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </div>
                  <div>
                    <h4>Tetap dalam kendali Anda</h4>
                    <p>Minta Luna menyempurnakan bagian tertentu, atau sunting langsung sebelum lowongan dipublikasikan.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lp003-otomatis-visual">
              <div className="lp003-mock lp003-otomatis-qa-card">
                <div className="lp003-otomatis-qa-progress-track"><div className="lp003-otomatis-qa-progress-fill" /></div>
                <div className="lp003-otomatis-qa-q">Kandidat seperti apa yang kamu cari?</div>
                <div className="lp003-otomatis-qa-opts">
                  <div className="lp003-otomatis-qa-opt lp003-otomatis-qa-opt-sel">Belum berpengalaman tidak masalah, asal mau belajar</div>
                  <div className="lp003-otomatis-qa-opt lp003-otomatis-qa-opt-sel">Tinggal dekat lokasi kios</div>
                  <div className="lp003-otomatis-qa-opt">Bersedia kerja saat akhir pekan dan hari libur</div>
                </div>
                <div className="lp003-otomatis-qa-foot"><span className="lp003-otomatis-qa-next">Lanjut</span></div>
              </div>

              <div className="lp003-mock lp003-otomatis-draft-card">
                <span className="lp003-otomatis-draft-badge"><IconCheck />Draf Siap</span>
                <div className="lp003-otomatis-draft-title">Karyawan Toko</div>
                <div className="lp003-otomatis-draft-pills">
                  <span className="lp003-otomatis-draft-pill">Staff/Junior</span>
                  <span className="lp003-otomatis-draft-pill">Waktu Tertentu</span>
                  <span className="lp003-otomatis-draft-pill">SMP/Sederajat</span>
                </div>
                <div className="lp003-otomatis-draft-label">Tanggung Jawab</div>
                <ul className="lp003-otomatis-draft-list">
                  <li>Melayani pembeli dan memproses transaksi dengan ramah</li>
                  <li>Menyiapkan dan mengemas pesanan sesuai standar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Langkah ── */}
      <section className="lp003-langkah">
        <div className="lp003-langkah-inner">
        <div className="lp003-langkah-head">
          <div className="lp003-langkah-eyebrow-row">
            <span className="lp003-langkah-eyebrow">Cara Kerja</span>
          </div>
          <h2 className="lp003-langkah-title-main">Anda pasang, LUNA menyaring, Anda putuskan</h2>
          <p className="lp003-langkah-sub">Dua langkah untuk memulai, dua langkah berjalan otomatis — lalu tinggal Anda proses kandidat terbaiknya.</p>
        </div>

        <div className="lp003-zig-list">

          <div className="lp003-zig-row">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow">Langkah 1 — Anda</div>
              <h3>Buat lowongan Otomatis</h3>
              <p>Ceritakan kebutuhan Anda dan Luna yang akan menyusun laman lowongannya.</p>
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
              <div className="lp003-step-eyebrow">Langkah 2 — Anda</div>
              <h3>Sebarkan linknya</h3>
              <p>Bagikan ke WhatsApp, LinkedIn, Instagram, atau grup mana pun. Satu link untuk semua channel.</p>
            </div>
            <div className="lp003-zig-node"><div className="lp003-zig-dot lp003-zig-dot-b">2</div></div>
            <div className="lp003-zig-visual">
              <div className="lp003-flow-share">
                <svg className="lp003-flow-share-svg" viewBox="0 0 260 170"><path d="M60 85 L 205 30" /><path d="M60 85 L 215 85" /><path d="M60 85 L 205 140" /></svg>
                <div className="lp003-flow-share-pill">
                  <IconShare name="link" />
                  <span>lunasys.ai/karir</span>
                </div>
                <div className="lp003-flow-share-node lp003-flow-share-node-hot" style={{ left: 195, top: 14 }}><IconShare name="whatsapp" /></div>
                <div className="lp003-flow-share-node" style={{ left: 205, top: 69 }}><IconShare name="instagram" /></div>
                <div className="lp003-flow-share-node" style={{ left: 195, top: 124 }}><IconShare name="linkedin" /></div>
              </div>
            </div>
          </div>

          <div className="lp003-zig-row">
            <div className="lp003-zig-text">
              <div className="lp003-step-eyebrow">Langkah 3 — Otomatis</div>
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
              <div className="lp003-step-eyebrow">Langkah 4 — Otomatis</div>
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
              <div className="lp003-step-eyebrow">Langkah 5 — Anda</div>
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
          <h2 className="lp003-cmp-title">Dibanding cara lama</h2>
          <p className="lp003-cmp-sub">Google Form tidak punya alur. Job portal mengunci data pelamar Anda. LUNA punya keduanya, dari satu link.</p>
        </div>

        <div className="lp003-cmp-table-wrap">
          <table className="lp003-cmp-table">
            <thead>
              <tr>
                <th className="lp003-cmp-th-param">Parameter</th>
                <th className="lp003-cmp-th-luna">LUNA</th>
                <th>Job Portal</th>
                <th>Google Form</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="lp003-cmp-td-param">{row.label}</td>
                  <td className="lp003-cmp-td-luna">
                    <span className="lp003-icon-yes"><IconCheck /></span>
                  </td>
                  <td>
                    <span className={row.jobPortal ? 'lp003-icon-yes' : 'lp003-icon-no'}>
                      {row.jobPortal ? <IconCheck /> : <IconX />}
                    </span>
                  </td>
                  <td>
                    <span className={row.googleForm ? 'lp003-icon-yes' : 'lp003-icon-no'}>
                      {row.googleForm ? <IconCheck /> : <IconX />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section className="lp003-faq">
        <div className="lp003-faq-split">
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
        </div>
      </section>

      {/* ── 8. Penutup ── */}
      <section className="lp003-cta-quiet">
        <div className="lp003-cta-quiet-inner">
          <div className="lp003-cta-quiet-eyebrow">Siap mulai?</div>
          <h2 className="lp003-cta-quiet-title">Mulai portal karier Anda hari ini</h2>
          <button className="lp003-cta-quiet-btn" onClick={goDaftar}>
            Mulai Gratis
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
