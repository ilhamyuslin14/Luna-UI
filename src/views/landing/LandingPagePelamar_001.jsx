import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import PelamarNavMenu from '../../components/pelamar/PelamarNavMenu.jsx';
import CompanyLogoBox from '../../components/lowongan/CompanyLogoBox.jsx';
import { getAllJobs } from '../../services/lowonganPublikService.js';
import { ID_REGIONS } from '../../utils/idRegions.js';
import '../../../css/landing/landing-page_003.css';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';
import '../../../css/pelamar/profil-pelamar_001.css';
import '../../../css/lowongan/kecocokan-card.css';
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
  { q: 'Lowongannya datang dari mana?', a: 'Dari perusahaan yang memasang lowongan langsung di Luna, ditambah lowongan yang dikumpulkan dari sumber lain seperti JobStreet. Sumbernya selalu tertulis di setiap lowongan.' },
];

const warnaLogo = ['#2F5D8A', '#2F7A4F', '#B5482B', '#6B4C8A', '#1F6F72'];
const warnaDari = (seed) => { let h = 0; for (let i = 0; i < (seed || '').length; i++) h = seed.charCodeAt(i) + ((h << 5) - h); return warnaLogo[Math.abs(h) % warnaLogo.length]; };
const inisialDari = (nama) => { const p = (nama || 'P').trim().split(/\s+/).filter(Boolean); return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase(); };

export default function LandingPagePelamar_001({ navigate }) {
  const { companyId, pelamarProfile, isPelamar } = useAuth() || {};
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
  const [terbaru, setTerbaru] = useState(null); // null = memuat

  useEffect(() => {
    let aktif = true;
    getAllJobs({ includeExternal: false }) // hanya lowongan Luna
      .then((data) => { if (aktif) setTerbaru((data || []).slice(0, 6)); })
      .catch(() => { if (aktif) setTerbaru([]); });
    return () => { aktif = false; };
  }, []);

  const goDaftar = () => navigate?.('pelamar-daftar');
  const goMasuk = () => navigate?.('pelamar-masuk');
  // Sama dengan navbar halaman Semua Lowongan: akun perusahaan yang sedang masuk ke dasbornya, selain itu ke landing perusahaan.
  const goPerusahaan = () => navigate?.(companyId ? 'beranda_002' : 'landingpage_003');
  const goProfilSaya = () => (isPelamar ? navigate?.('profil-pelamar_001') : goMasuk());
  const goDaftarLowongan = () => navigate?.('semua-lowongan_002');
  // Kartu lowongan Luna langsung ke halaman lowongannya (laman karir), bukan ke daftar.
  const goLowongan = (j) => navigate?.('laman-karir', j.kode ? { kode: j.kode } : { jabatan: j.title });
  const cari = (e, qOverride) => {
    e?.preventDefault();
    navigate?.('semua-lowongan_002', { q: (qOverride ?? posisi).trim(), kota: kota.trim() });
  };
  const gulirKe = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="lp003-page lpp-page">

      {/* ── Navbar: sama dengan halaman Semua Lowongan (menu, status masuk, dan tombol Untuk Perusahaan) ── */}
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
              <PelamarNavMenu navigate={navigate} pelamarProfile={pelamarProfile} />
            ) : (
              <button className="lk-link-masuk" onClick={goMasuk}>Masuk</button>
            )}
            <span className="lk-nav-divider" />
            <button className="lk-btn-perusahaan" onClick={goPerusahaan}><span className="lk-btn-perusahaan-badge"><IconBriefcase /></span>Untuk Perusahaan</button>
          </div>
        </div>
      </header>

      {/* ── 1. Hero (opsi E: teks + pencarian 2/3, cuplikan skor 1/3) ── */}
      <section className="lp003-hero lpp-hero">
        <div className="lp003-hero-copy lpp-hero-copy">
          <h1 className="lp003-hero-title lpp-hero-title">Cari lowongan yang benar-benar <span className="lpp-accent">cocok</span> buat kamu</h1>
          <p className="lp003-hero-subtitle lpp-hero-sub">Lihat seberapa cocok CV-mu dengan tiap lowongan sebelum melamar, dari lowongan Luna dan sumber lain di satu tempat.</p>

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

      {/* ── 2. Fitur utama ── */}
      <section className="lp003-fitur" id="fitur">
        <div className="lp003-fitur-head">
          <div className="lp003-fitur-eyebrow-row">
            <span className="lp003-fitur-eyebrow">Kenapa Luna</span>
          </div>
          <h2 className="lp003-fitur-title-main">Cari tahu kecocokan dengan lowongan yang akan dilamar</h2>
          <p className="lp003-fitur-sub">Berhenti melamar sambil menebak. Luna membaca CV-mu, menilai tiap lowongan, dan menyusun yang paling pas di atas.</p>
        </div>

        <div className="lpp-bento">
          <div className="lp003-bento-cell">
            <span className="lp003-bento-tag">Skor kecocokan</span>
            <h3>Skor 0–100 untuk setiap lowongan</h3>
            <p>Luna membandingkan CV-mu dengan deskripsi lowongan, lalu memberi skor dalam tiga tingkat yang mudah dibaca.</p>
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

          <div className="lp003-bento-cell">
            <span className="lp003-bento-tag">Rekomendasi</span>
            <h3>Yang paling pas tampil di atas</h3>
            <p>Posisi dan kota pilihanmu menentukan urutan, lalu lowongan diurutkan dari skor tertinggi.</p>
            <div className="lpp-bento-mock lpp-rank">
              <div className="lpp-rank-pref"><span>Preferensimu</span><b>Data Analyst</b><b>Jakarta</b></div>
              <div className="lpp-rank-row"><span className="lpp-rank-n">1</span><div><b>Business Analyst</b><small>Lowongan Luna</small></div><span className="lpp-rank-s great">91</span></div>
              <div className="lpp-rank-row"><span className="lpp-rank-n">2</span><div><b>Data Analyst</b><small>JobStreet</small></div><span className="lpp-rank-s great">78</span></div>
              <div className="lpp-rank-row"><span className="lpp-rank-n">3</span><div><b>Admin Purchasing</b><small>JobStreet</small></div><span className="lpp-rank-s amber">43</span></div>
            </div>
          </div>

          <div className="lp003-bento-cell">
            <span className="lp003-bento-tag">Lamar cepat</span>
            <h3>Satu profil, lamar tanpa isi form</h3>
            <p>Untuk lowongan Luna, kirim lamaran dari profilmu sekali klik. CV tidak perlu diunggah ulang.</p>
            <div className="lpp-bento-mock lpp-mini-card">
              <div className="lpp-mini-row"><span>Nama</span><b>Nama Pelamar</b></div>
              <div className="lpp-mini-row"><span>Email</span><b>nama@email.com</b></div>
              <div className="lpp-mini-row"><span>Nomor HP</span><b>08xx-xxxx-xxxx</b></div>
              <div className="lpp-mini-row"><span>CV</span><b>CV_Nama_Pelamar.pdf</b></div>
              <div className="lpp-mini-check"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></i>Saya setuju profil dan CV dikirim ke perusahaan</div>
              <div className="lpp-mini-btn">Kirim lamaran</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Cara kerja ── */}
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

      {/* ── 4. Lowongan Luna terbaru (bagian disembunyikan bila belum ada lowongan Luna) ── */}
      {terbaru && terbaru.length > 0 && (
        <section className="lp003-fitur lpp-terbaru" id="lowongan">
          <div className="lp003-fitur-head">
            <div className="lp003-fitur-eyebrow-row">
              <span className="lp003-fitur-eyebrow">Lowongan Luna</span>
            </div>
            <h2 className="lp003-fitur-title-main">Lowongan terbaru dari perusahaan di Luna</h2>
            <p className="lp003-fitur-sub">Dipasang langsung oleh perusahaan yang memakai Luna. Buka daftar lengkap untuk melihat sumber lainnya.</p>
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
                    <span className="lpp-job-src">{j.employment_label}</span>
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

      {/* ── Footer ── */}
      <footer className="lp003-footer">
        <div className="lp003-footer-top">
          <div className="lp003-footer-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" className="lp003-footer-logo" />
            <p className="lp003-footer-desc">Portal karier yang menilai kecocokan CV-mu dengan tiap lowongan, supaya kamu melamar dengan lebih yakin.</p>
          </div>
          <div className="lp003-footer-links">
            <div className="lp003-footer-col">
              <p className="lp003-footer-col-title">Untuk Pelamar</p>
              <div className="lp003-footer-col-links">
                <span onClick={goDaftarLowongan}>Cari Lowongan</span>
                <span onClick={goDaftar}>Buat Profil</span>
                <span onClick={() => gulirKe('fitur')}>Fitur</span>
              </div>
            </div>
            <div className="lp003-footer-col">
              <p className="lp003-footer-col-title">Perusahaan</p>
              <div className="lp003-footer-col-links">
                <span onClick={goPerusahaan}>Untuk Perusahaan</span>
                <span>Tentang Kami</span>
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
