// MOCKUP: salinan LandingPagePelamar_001 untuk presentasi. Lowongan terbaru dari LOWONGAN_DUMMY (semua sumber), sesi dari
// MockSession, tanpa database. Pencarian selalu membuka daftar sebagai pelamar contoh. Ubah tampilan asli di
// views/landing/LandingPagePelamar_001.jsx lalu salin ulang bagian visualnya ke sini.
import { useMemo, useState } from 'react';
import useIsMobile from '../../hooks/useIsMobile.js';
import { useMockSession } from '../MockSession.jsx';
import { MockNavMenu } from '../components/MockNav.jsx';
import { LOWONGAN_DUMMY } from '../data/lowonganDummy.js';
import { MockMobileNav } from '../components/MockNav.jsx';
import CompanyLogoBox from '../../components/lowongan/CompanyLogoBox.jsx';
import { ID_REGIONS } from '../../utils/idRegions.js';
import '../../../css/landing/landing-page_003.css';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';
import '../../../css/pelamar/profil-pelamar_001.css';
import '../../../css/lowongan/kecocokan-card.css';
import '../../../css/mobile/lowongan/laman-karir.css';
import '../../../css/mobile/lowongan/semua-lowongan_002.css';
import '../../../css/landing/landing-pelamar.css';

// Landing page untuk PELAMAR (/?view=landingpage-pelamar). Memakai sistem desain landing perusahaan
// (LandingPage_003: kelas lp003-*, ukuran font, nav, hero dua kolom, ritme bagian) supaya terasa satu produk;
// bagian khas pelamar memakai kelas lpp-* (landing-pelamar.css). Nada bahasa "kamu", sama dengan portal pelamar.
// Hanya memuat klaim yang benar-benar ada di produk; tidak ada angka besar atau testimoni karangan.

/* ── Ikon ── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>
);
const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);
const IconUser = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconCompany = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>);
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconPin = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconSpark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
);

const LANGKAH = [
  { n: 1, judul: 'Unggah CV sekali', teks: 'CV dibaca otomatis jadi profilmu: pengalaman, pendidikan, dan keahlian terisi sendiri.' },
  { n: 2, judul: 'Atur preferensi kerja', teks: 'Pilih posisi, kota, dan gaji yang kamu mau. Daftar lowongan menyesuaikan.' },
  { n: 3, judul: 'Lihat skor, lalu lamar', teks: 'Tiap lowongan menampilkan seberapa cocok CV-mu. Lamar yang paling pas.' },
];

const FAQ_ITEMS = [
  { q: 'Apakah Luna gratis untuk pelamar?', a: 'Ya. Mencari lowongan, membuat profil, dan melihat skor kecocokan tidak dipungut biaya.' },
  { q: 'Apakah saya wajib membuat akun?', a: 'Untuk mencari dan membuka lowongan, tidak. Akun dibutuhkan untuk melihat skor kecocokan, memakai urutan rekomendasi, dan melamar cepat dengan profil. Lowongan Luna juga tetap bisa dilamar lewat form tanpa akun.' },
  { q: 'Bagaimana skor kecocokan dihitung?', a: 'Luna membandingkan CV-mu dengan deskripsi lowongan, lalu memberi skor 0–100 dalam tiga tingkat: Rendah (0–30), Sedang (31–70), dan Tinggi (71–100). Skor adalah perkiraan, bukan keputusan perekrut.' },
  { q: 'Apakah perusahaan bisa melihat CV saya?', a: 'Hanya setelah kamu melamar ke lowongan Luna dan menyetujui pengiriman profilmu. Untuk lowongan dari sumber lain, Luna tidak mengirim apa pun: kamu melamar di halaman aslinya.' },
];

const warnaLogo = ['#2F5D8A', '#2F7A4F', '#B5482B', '#6B4C8A', '#1F6F72'];
const warnaDari = (seed) => { let h = 0; for (let i = 0; i < (seed || '').length; i++) h = seed.charCodeAt(i) + ((h << 5) - h); return warnaLogo[Math.abs(h) % warnaLogo.length]; };
const inisialDari = (nama) => { const p = (nama || 'P').trim().split(/\s+/).filter(Boolean); return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase(); };

export default function LandingPelamarMock({ navigate }) {
  const { isPelamar, login } = useMockSession();
  const isMobile = useIsMobile();
  const [posisi, setPosisi] = useState('');
  const [kota, setKota] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  // Saran nama kota (daftar yang sama dengan form lowongan: utils/idRegions). Hanya kota, bukan provinsi, karena
  // nilainya dipakai mencocokkan lokasi lowongan. Yang diawali ketikan tampil lebih dulu.
  const [saranTerbuka, setSaranTerbuka] = useState(false);
  const [saranAktif, setSaranAktif] = useState(-1);
  const saran = useMemo(() => {
    const q = kota.trim().toLowerCase();
    if (!q) return [];
    const cocok = ID_REGIONS.filter((r) => r.type === 'city' && r.name.toLowerCase().includes(q));
    return [...cocok.filter((r) => r.name.toLowerCase().startsWith(q)), ...cocok.filter((r) => !r.name.toLowerCase().startsWith(q))].slice(0, 8);
  }, [kota]);
  const pilihKota = (nama) => { setKota(nama); setSaranTerbuka(false); setSaranAktif(-1); };
  const kotaKeyDown = (e) => {
    if (!saranTerbuka || saran.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSaranAktif((i) => (i + 1) % saran.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSaranAktif((i) => (i <= 0 ? saran.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && saranAktif >= 0) { e.preventDefault(); pilihKota(saran[saranAktif].name); }
    else if (e.key === 'Escape') { setSaranTerbuka(false); setSaranAktif(-1); }
  };
  const terbaru = LOWONGAN_DUMMY.slice(0, 6); // lowongan terbaru dari berbagai sumber (data contoh)

  const goDaftar = () => navigate?.('pelamar-daftar');
  const goMasuk = () => navigate?.('pelamar-masuk');
  // Sama dengan navbar halaman Semua Lowongan: akun perusahaan yang sedang masuk ke dasbornya, selain itu ke landing perusahaan.
  const goPerusahaan = () => {}; // mockup: tombol tampil tapi tidak berpindah halaman
  const goProfilSaya = () => (isPelamar ? navigate?.('profil-pelamar_001') : goMasuk());
  // Mockup: membuka daftar lowongan selalu sebagai pelamar contoh (kalau belum masuk, masuk otomatis).
  const bukaDaftar = (params) => { if (!isPelamar) login(); navigate?.('semua-lowongan_002', params); };
  const goDaftarLowongan = () => bukaDaftar();
  // Mockup tidak punya halaman detail lowongan: kartu membuka daftar dengan panel detail lowongan itu terbuka.
  const goLowongan = (j) => bukaDaftar({ buka: j.key });
  const cari = (e, qOverride) => {
    e?.preventDefault();
    bukaDaftar({ q: (qOverride ?? posisi).trim(), kota: kota.trim() });
  };

  return (
    <div className="lp003-page lpp-page">

      {/* ── Navbar: sama dengan halaman Semua Lowongan (menu, status masuk, dan tombol Untuk Perusahaan) ── */}
      {isMobile ? (
        <div className="lk-head">
          <a className="lk-logo" href="/?view=landingpage-pelamar" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
            <span className="lk-logo-divider" />
            <span className="lk-badge-portal">PORTAL KARIR</span>
          </a>
          <div className="lk-head-actions">
            {isPelamar ? (
              <MockMobileNav navigate={navigate} activeTab="cari" />
            ) : (
              <>
                <button className="lk-share-btn" onClick={goMasuk} title="Masuk"><IconUser /></button>
                <button className="lk-share-btn primary" onClick={goPerusahaan} title="Untuk Perusahaan"><IconCompany /></button>
              </>
            )}
          </div>
        </div>
      ) : (
        <header className="lk-header">
          <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="sl2-nav-left">
              <a className="lk-brand" href="/?view=landingpage-pelamar" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
                <span className="lk-brand-divider" />
                <span className="lk-brand-badge">PORTAL KARIR</span>
              </a>
              <nav className="sl2-nav-links">
                <span className="sl2-nav-link" onClick={goDaftarLowongan}>Cari Lowongan</span>
                <span className="sl2-nav-link" onClick={goProfilSaya}>Profil Saya</span>
              </nav>
            </div>
            <div className="lk-header-actions">
              {isPelamar ? (
                <MockNavMenu navigate={navigate} />
              ) : (
                <button className="lk-link-masuk" onClick={goMasuk}>Masuk</button>
              )}
              <span className="lk-nav-divider" />
              <button className="lk-btn-perusahaan" onClick={goPerusahaan}><span className="lk-btn-perusahaan-badge"><IconBriefcase /></span>Untuk Perusahaan</button>
            </div>
          </div>
        </header>
      )}

      {/* ── 1. Hero (opsi E: teks + pencarian 2/3, cuplikan skor 1/3) ── */}
      <section className="lp003-hero lpp-hero">
        <div className="lp003-hero-copy lpp-hero-copy">
          <h1 className="lp003-hero-title lpp-hero-title">Ribuan lowongan dari <span className="lpp-accent">berbagai sumber</span> yang sesuai denganmu</h1>
          <p className="lp003-hero-subtitle lpp-hero-sub">Luna menampilkan ribuan lowongan dari berbagai sumber dan mencocokkannya dengan profil dan ekspektasimu.</p>

          <form className="lpp-search" onSubmit={cari} role="search">
            <label className="lpp-search-field lpp-search-posisi">
              <IconSearch />
              <input type="text" value={posisi} onChange={(e) => setPosisi(e.target.value)} placeholder="Posisi atau jabatan" aria-label="Posisi atau jabatan" autoComplete="off" />
            </label>
            <span className="lpp-search-sep" aria-hidden="true" />
            <label className="lpp-search-field lpp-search-kota">
              <IconPin />
              <input
                type="text"
                value={kota}
                onChange={(e) => { setKota(e.target.value); setSaranTerbuka(true); setSaranAktif(-1); }}
                onFocus={() => setSaranTerbuka(true)}
                onBlur={() => setSaranTerbuka(false)}
                onKeyDown={kotaKeyDown}
                placeholder="Kota"
                aria-label="Kota"
                role="combobox"
                aria-expanded={saranTerbuka && saran.length > 0}
                aria-autocomplete="list"
                autoComplete="off"
              />
              {saranTerbuka && saran.length > 0 && (
                <ul className="lpp-saran" role="listbox">
                  {saran.map((r, i) => (
                    <li key={r.name} role="option" aria-selected={i === saranAktif}>
                      <button type="button" className={i === saranAktif ? 'on' : ''} onMouseDown={(e) => { e.preventDefault(); pilihKota(r.name); }}>
                        <span>{r.name}</span><small>{r.province}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </label>
            <button type="submit" className="lpp-search-btn">Cari Lowongan</button>
          </form>
        </div>

        <div className="lpp-visual" aria-hidden="true">
          <svg className="lpp-visual-ring" viewBox="0 0 480 480">
            <circle cx="240" cy="240" r="210" fill="#FFE7C4" />
            <circle cx="240" cy="240" r="150" fill="#FFB866" />
            <circle cx="240" cy="240" r="228" fill="none" stroke="#FF8D21" strokeWidth="1.5" strokeDasharray="3 7" />
          </svg>
          <div className="lpp-vcard">
            <div className="lpp-vcard-top">
              <span className="lpp-vcard-logo">SD</span>
              <div>
                <div className="lpp-vcard-title">Business Analyst</div>
                <div className="lpp-vcard-meta">PT Sinergi Data · Jakarta Selatan</div>
              </div>
            </div>
            <div className="lpp-vcard-skor">
              <div>
                <div className="lpp-vcard-cap">KECOCOKAN DENGAN CV</div>
                <div className="lpp-vcard-n">91<small>/100</small></div>
              </div>
              <span className="lpp-vcard-pill">Tinggi</span>
            </div>
          </div>
          <div className="lpp-vchip lpp-vchip-cv"><span><IconCheck /></span>CV_Nama_Pelamar.pdf</div>
          <div className="lpp-vchip lpp-vchip-cepat">Lamar cepat dengan profil</div>
        </div>
      </section>

      {/* ── 2. Masalah ── */}
      <section className="lp003-fitur lpp-masalah" id="masalah">
        <div className="lp003-fitur-head">
          <div className="lp003-fitur-eyebrow-row">
            <span className="lp003-fitur-eyebrow">Masalahnya</span>
          </div>
          <h2 className="lp003-fitur-title-main">Cari kerja melelahkan dan semakin sulit</h2>
          <p className="lp003-fitur-sub">Kesulitan yang hampir semua pencari kerja alami, dan yang Luna selesaikan.</p>
        </div>

        <div className="lpp-masalah-grid">
          <div className="lpp-masalah-card">
            <span className="lpp-masalah-ic" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="7" r="2.5" /><circle cx="8" cy="18" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="M8.3 6.4l7.4.4M7.2 8.3l.6 7.2M16.5 9.3l1 5.2M10.4 17.6l5.2-.4" /></svg>
            </span>
            <h3>Susah mencari lowongan dari berbagai sumber</h3>
            <p>Lowongan tersebar di banyak tempat. Kamu harus membuka satu per satu, dan tetap tidak yakin sudah melihat semuanya.</p>
          </div>
          <div className="lpp-masalah-card">
            <span className="lpp-masalah-ic" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4" /><line x1="12" y1="17.6" x2="12.01" y2="17.6" /></svg>
            </span>
            <h3>Tidak tahu kecocokannya, jadi asal kirim lamaran</h3>
            <p>Tanpa tahu seberapa cocok CV-mu dengan lowongan, lamaran dikirim asal-asalan. Waktumu habis, hasilnya tidak jelas.</p>
          </div>
        </div>
      </section>

      {/* ── 3. Solusi: empat poin ── */}
      <section className="lp003-fitur" id="fitur">
        <div className="lp003-fitur-head">
          <div className="lp003-fitur-eyebrow-row">
            <span className="lp003-fitur-eyebrow">Solusinya</span>
          </div>
          <h2 className="lp003-fitur-title-main">Luna menyelesaikan keduanya</h2>
          <p className="lp003-fitur-sub">Semua lowongan di satu tempat, dipilihkan untukmu, lengkap dengan skor kecocokan, dan kamu tetap bebas memilih tempat melamar.</p>
        </div>

        <div className="lpp-bento">
          <div className="lp003-bento-cell lpp-bento-utama">
            <span className="lp003-bento-tag">Berbagai sumber</span>
            <h3>Lowongan dari<br /><span className="lpp-garis">berbagai sumber</span></h3>
            <p>Lowongan dari perusahaan di Luna dan sumber lain dikumpulkan jadi satu. Kamu cukup mencari sekali.</p>
            <div className="lpp-bento-mock lpp-rank">
              <div className="lpp-rank-pref"><span>Sumber</span><b>Luna</b><b>JobStreet</b></div>
              <div className="lpp-rank-row"><div><b>Business Analyst</b><small>PT Sinergi Data</small></div><span className="lpp-src-pill luna">Luna</span></div>
              <div className="lpp-rank-row"><div><b>Junior Business Analyst</b><small>PT Perangkat Lunak Indonesia</small></div><span className="lpp-src-pill">JobStreet</span></div>
            </div>
          </div>

          <div className="lp003-bento-cell">
            <span className="lp003-bento-tag">Skor kecocokan</span>
            <h3>Skor kecocokan untuk setiap lowongan</h3>
            <p>CV-mu dibandingkan dengan deskripsi lowongan, lalu diberi skor 0–100 dalam tiga tingkat.</p>
            <div className="lpp-bento-mock lpp-skor-demo">
              <div className="kcc-banner great lpp-skor-banner">
                <span className="kcc-deco a" /><span className="kcc-deco b" />
                <div className="kcc-banner-cap"><span className="kcc-banner-cap-text"><IconSpark /> Kecocokan dengan CV kamu</span></div>
                <div className="kcc-banner-row">
                  <div className="kcc-banner-score"><b>91</b><span>/100</span></div>
                  <span className="kcc-banner-label">Tinggi</span>
                </div>
              </div>
              <div className="lpp-tiers">
                <div className="lpp-tier"><i className="red" /><b>Rendah</b><span>0–30</span></div>
                <div className="lpp-tier"><i className="amber" /><b>Sedang</b><span>31–70</span></div>
                <div className="lpp-tier"><i className="great" /><b>Tinggi</b><span>71–100</span></div>
              </div>
            </div>
          </div>

          <div className="lpp-bento-stack">
            <div className="lp003-bento-cell">
              <span className="lp003-bento-tag">Dikurasi untukmu</span>
              <h3>Dikurasi sesuai profil dan ekspektasimu</h3>
              <p>Posisi, kota, dan gaji yang kamu mau menentukan lowongan mana yang tampil lebih dulu.</p>
            </div>
            <div className="lp003-bento-cell">
              <span className="lp003-bento-tag">Langsung lamar</span>
              <h3>Langsung lamar dari tempat pilihanmu</h3>
              <p>Lamar cepat dengan profilmu untuk lowongan Luna, atau langsung ke halaman asli sumbernya. Kamu yang memilih.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Cara kerja ── */}
      <section className="lp003-langkah" id="cara-kerja">
        <div className="lp003-langkah-inner">
          <div className="lp003-langkah-head">
            <div className="lp003-langkah-eyebrow-row">
              <span className="lp003-langkah-eyebrow">Sebelum Melamar</span>
            </div>
            <h2 className="lp003-langkah-title-main">Langkah yang kamu lakukan sebelum melamar</h2>
            <p className="lp003-langkah-sub">Tiga langkah singkat. Setelah itu, setiap lowongan yang kamu buka sudah membawa skor kecocokannya.</p>
          </div>
          <div className="lpp-steps">
            {LANGKAH.map((l) => (
              <div className="lpp-step" key={l.n}>
                <span className="lpp-step-n">{l.n}</span>
                <h3>{l.judul}</h3>
                <p>{l.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Lowongan terbaru yang tersedia, dari berbagai sumber (disembunyikan bila belum ada) ── */}
      {terbaru && terbaru.length > 0 && (
        <section className="lp003-fitur lpp-terbaru" id="lowongan">
          <div className="lp003-fitur-head">
            <div className="lp003-fitur-eyebrow-row">
              <span className="lp003-fitur-eyebrow">Lowongan Terbaru</span>
            </div>
            <h2 className="lp003-fitur-title-main">Lowongan terbaru yang tersedia</h2>
            <p className="lp003-fitur-sub">Dikumpulkan dari berbagai sumber dan diurutkan dari yang paling baru. Buka daftar lengkap untuk melihat semuanya.</p>
          </div>

          <div className="lpp-terbaru-grid">
            {terbaru.map((j) => (
              <button type="button" className="lpp-job" key={j.key} onClick={() => goLowongan(j)}>
                <CompanyLogoBox className="lpp-job-logo" src={j.logo_url} alt={j.company_name} color={warnaDari(j.company_name)} initials={inisialDari(j.company_name)} />
                <div className="lpp-job-body">
                  <div className="lpp-job-title">{j.title}</div>
                  <div className="lpp-job-meta">{j.company_name} · {j.location || 'Indonesia'}</div>
                  <div className="lpp-job-foot">
                    <span className={j.salary_text_only ? 'muted' : ''}>{j.salary_label}</span>
                    <span className={`lpp-src-pill${j.source === 'luna' ? ' luna' : ''}`}>{j.source_label}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lpp-terbaru-more">
            <button type="button" className="lpp-lihat" onClick={goDaftarLowongan}>Lihat semua lowongan <IconArrow /></button>
          </div>
        </section>
      )}

      {/* ── 7. FAQ ── */}
      <section className="lp003-faq">
        <div className="lp003-faq-split">
          <div className="lp003-faq-head">
            <div className="lp003-faq-eyebrow">FAQ</div>
            <h2 className="lp003-faq-title">Masih ada pertanyaan?</h2>
            <p className="lp003-faq-sub">Jawaban singkat untuk yang paling sering ditanyakan pelamar.</p>
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
          <h2 className="lp003-cta-quiet-title">Temukan lowongan yang cocok hari ini</h2>
          <button className="lp003-cta-quiet-btn" onClick={goDaftarLowongan}>
            Mulai Cari Lowongan
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </section>

      {/* ── Footer: sama dengan halaman Semua Lowongan ── */}
      {isMobile ? (
        <footer className="sl2m-footer">
          <div className="sl2m-footer-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
            <b>Luna</b>
          </div>
          <p>Luna menampilkan lowongan dari berbagai sumber dan mencocokkannya dengan profil dan ekspektasimu.</p>

          <div className="sl2m-footer-cols">
            <div className="sl2m-footer-col">
              <h5>Untuk Pelamar</h5>
              <button type="button" onClick={goDaftarLowongan}>Cari Lowongan</button>
              <button type="button" onClick={goDaftar}>Buat Profil</button>
            </div>
            <div className="sl2m-footer-col">
              <h5>Untuk Perusahaan</h5>
              <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
              <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
            </div>
          </div>

          <div className="sl2m-footer-bottom">
            <span>© {new Date().getFullYear()} Luna. Semua hak dilindungi.</span>
            <div className="sl2m-footer-social">
              <span><IconLinkedIn /></span>
              <span><IconInstagram /></span>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="sl2-footer">
          <div className="sl2-footer-top">
            <div>
              <div className="sl2-footer-brand">
                <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
                <b>Luna</b>
              </div>
              <p>Luna menampilkan lowongan dari berbagai sumber dan mencocokkannya dengan profil dan ekspektasimu.</p>
            </div>
            <div className="sl2-footer-col">
              <h4>Untuk Pelamar</h4>
              <button type="button" onClick={goDaftarLowongan}>Cari Lowongan</button>
              <button type="button" onClick={goDaftar}>Buat Profil</button>
            </div>
            <div className="sl2-footer-col">
              <h4>Untuk Perusahaan</h4>
              <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
              <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
            </div>
            <div className="sl2-footer-col">
              <h4>Luna</h4>
              <span>Tentang Kami</span>
              <span>Bantuan</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
          <div className="sl2-footer-bottom">
            <span>© 2026 Luna. Seluruh hak cipta dilindungi.</span>
            <div className="sl2-footer-social">
              <span><IconLinkedIn /></span>
              <span><IconInstagram /></span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
