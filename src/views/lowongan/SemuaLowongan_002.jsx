import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useSemuaLowonganData, { PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../hooks/lowongan/useSemuaLowonganData.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { LAMARAN_SAYA_AKTIF } from '../../utils/fiturPelamar.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PelamarNavMenu from '../../components/pelamar/PelamarNavMenu.jsx';
import CompanyLogoBox from '../../components/lowongan/CompanyLogoBox.jsx';
import LowonganDrawer from '../../components/lowongan/LowonganDrawer.jsx';
import KecocokanMini from '../../components/lowongan/KecocokanMini.jsx';
import useHitungOtomatis from '../../hooks/lowongan/useHitungOtomatis.js';
import useKecocokanSkor from '../../hooks/lowongan/useKecocokanSkor.js';
import { bukaLamar } from '../../utils/lamarLowongan.js';
import LamarCepatModal from '../../components/lowongan/LamarCepatModal.jsx';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';
import '../../../css/pelamar/profil-pelamar_001.css';

const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>
);
const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);
const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
    <line x1="4" y1="12" x2="20" y2="12" /><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
    <line x1="4" y1="17" x2="20" y2="17" /><circle cx="11" cy="17" r="2" fill="currentColor" stroke="none" />
  </svg>
);
const IconReset = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 1 3 6.7" /><path d="M3 21v-6h6" />
  </svg>
);

// Palet avatar inisial (fallback saat perusahaan belum punya logo_url) —
// sama persis dengan SemuaLowongan.jsx lama, deterministik dari nama
// perusahaan supaya konsisten lintas halaman.
const AVATAR_COLORS = ['#2F5D8A', '#2F7A4F', '#B5482B', '#6B4C8A', '#1F6F72'];
function avatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < (seed || '').length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  const parts = (name || 'P').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
// Revamp "Opsi 1 — Trusted & Structured" dari artifact review (search-forward
// hero, kategori populer, kartu lowongan lebih informatif, footer lengkap).
// Sengaja dibuat sebagai KOMPONEN BARU (bukan timpa SemuaLowongan.jsx) atas
// permintaan user — biar versi lama tetap ada & bisa dibandingkan. Header
// TIDAK diubah, tetap pakai lk-header/lk-brand yang sudah ada.
export default function SemuaLowongan_002({ navigate }) {
  const { companyId, pelamarProfile, isPelamar } = useAuth() || {};
  const goMasuk = () => navigate ? navigate('pelamar-masuk') : (window.location.href = '/?view=pelamar-masuk');
  const goProfilSaya = () => isPelamar ? navigate?.('profil-pelamar_001') : goMasuk();
  const goLamaranSaya = () => isPelamar ? navigate?.('status-lamaran_001') : goMasuk();
  const goPerusahaan = () => {
    const target = companyId ? 'beranda_002' : 'landingpage_003';
    if (navigate) navigate(target); else window.location.href = `/?view=${target}`;
  };
  // Skor dibaca lebih dulu: daftar diurutkan dari skor tertinggi untuk pelamar yang login.
  const { skorMap, setSkor, prosesMap, siap: skorSiap } = useKecocokanSkor();
  // Urutan memakai skor yang "dibekukan" selama hitung otomatis berjalan, supaya kartu tidak berpindah-pindah
  // tiap satu hasil masuk; urutan baru diterapkan sekali setelah semuanya selesai.
  const [otomatisBerjalan, setOtomatisBerjalan] = useState(false);
  const skorBeku = useRef(skorMap);
  if (!otomatisBerjalan) skorBeku.current = skorMap;
  const {
    loading, search, setSearch, sort, setSort, sortOptions, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    sumber, toggleSumber, sumberOptions,
    kota, setKota,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize, pinKeys,
  } = useSemuaLowonganData(10, { includeExternal: true, skorMap: skorBeku.current, urutKecocokan: !!isPelamar, posisiPref: pelamarProfile?.pref_posisi, lokasiPref: pelamarProfile?.pref_lokasi });

  // Datang dari landing pelamar: ?q= (posisi) dan ?kota= mengisi pencarian dan filter kota.
  const { search: urlSearch } = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(urlSearch);
    const q = p.get('q');
    const k = p.get('kota');
    if (q !== null) setSearch(q);
    setKota(k || '');
  }, [urlSearch]);

  const mainRef = useRef(null);
  const otomatis = useHitungOtomatis({ jobs: pagedJobs, skorMap, prosesMap, siap: skorSiap });
  if (otomatis.berjalan !== otomatisBerjalan) setOtomatisBerjalan(otomatis.berjalan);

  const scrollToListing = () => mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Klik kartu membuka panel detail di sisi kanan (tanpa pindah halaman). "Lamar Sekarang"
  // langsung ke tujuan lamaran: halaman asli (eksternal) atau laman karir di tab baru (Luna).
  const [drawerJob, setDrawerJob] = useState(null);
  const openJob = (job) => setDrawerJob(job);
  // Lowongan Luna + pelamar login: popup lamar dengan profil. Selain itu langsung ke tujuan lamaran (tab baru).
  const [lamarJob, setLamarJob] = useState(null);
  const lamarSekarang = (job) => (isPelamar && !job.is_external ? setLamarJob(job) : bukaLamar(job));
  const lamar = (e, job) => { e.stopPropagation(); lamarSekarang(job); };

  const popularSearches = ['Content Writer', 'Frontend Developer', 'Admin Operasional'];

  return (
    <div className="sl2-page">
      {lamarJob && <LamarCepatModal job={lamarJob} onClose={() => setLamarJob(null)} />}
      {drawerJob && (
        <LowonganDrawer job={drawerJob} navigate={navigate} onClose={() => setDrawerJob(null)} onHasilKecocokan={setSkor} onLamar={lamarSekarang} />
      )}
      {/* Header — navbar ala ProfilPelamar_001 (nav-links Cari Lowongan /
          Profil Saya / Lamaran Saya). State kanan ikut auth sungguhan
          (isPelamar dari pelamar_profiles): sudah login -> avatar pill,
          belum -> CTA "Masuk" seperti biasa. Navigasi antar halaman TIDAK
          lagi memutus sesi — cuma lk-header yang berubah tampilan sesuai
          status login, logout tetap cuma lewat halaman Profil. */}
      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sl2-nav-left">
            <a className="lk-brand" href="/?view=landingpage-pelamar" onClick={(e) => { if (navigate) { e.preventDefault(); navigate('landingpage-pelamar'); } }}>
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
              <span className="lk-brand-divider" />
              <span className="lk-brand-badge">PORTAL KARIR</span>
            </a>
            <nav className="sl2-nav-links">
              <span className="sl2-nav-link active">Cari Lowongan</span>
              <span className="sl2-nav-link" onClick={goProfilSaya}>Profil Saya</span>
              {LAMARAN_SAYA_AKTIF && <span className="sl2-nav-link" onClick={goLamaranSaya}>Lamaran Saya</span>}
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

      {/* Hero — search-forward, copy "kecocokan" (hasil review Opsi 1 + 2) */}
      <section className="sl2-hero">
        <div className="sl2-hero-inner">
          <h1>Temukan lowongan yang benar-benar cocok buat kamu.</h1>
          <p>Bukan sekadar daftar lowongan — cari berdasarkan posisi, lokasi, atau bidang, biar yang kamu temu memang pas sama yang kamu cari.</p>

          <form className="sl2-search" onSubmit={e => e.preventDefault()}>
            <IconSearch />
            <input
              type="text"
              placeholder="Posisi, kota, bidang, atau nama perusahaan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Cari</button>
          </form>

          <div className="sl2-trending">
            <span>Pencarian populer:</span>
            {popularSearches.map(term => (
              <button type="button" key={term} className="sl2-chip" onClick={() => setSearch(term)}>{term}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Listing — 2 kolom: sidebar filter ("Opsi 3 — Pill Toggle & Segmented"
          dari artifact review) + daftar lowongan */}
      <section className="sl2-body">
        <aside className="sl2-sidebar">
          <div className="sl2-sidebar-head">
            <div className="sl2-sidebar-title">
              <span className="sl2-sidebar-ic"><IconFilter /></span>
              <h3>Filter</h3>
            </div>
            <button type="button" className="sl2-reset-btn" onClick={resetFilters} aria-label="Reset semua filter">
              <IconReset />
            </button>
          </div>

          <div className="sl2-filter-group">
            <div className="sl2-flabel">Tipe Pekerjaan</div>
            <div className="sl2-pill-group">
              {DROPDOWN_OPTIONS.ikatanKerja.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`sl2-pill${tipeKerja.includes(opt) ? ' active' : ''}`}
                  onClick={() => toggleTipeKerja(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="sl2-filter-group">
            <div className="sl2-flabel">Pengalaman</div>
            <div className="sl2-pill-group">
              {PENGALAMAN_BUCKETS.map(b => (
                <button
                  type="button"
                  key={b.value}
                  className={`sl2-pill${pengalamanBucket.includes(b.value) ? ' active' : ''}`}
                  onClick={() => togglePengalamanBucket(b.value)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sl2-filter-group">
            <div className="sl2-flabel">Rentang Gaji</div>
            <div className="sl2-seg-group">
              {GAJI_BUCKETS.map(b => (
                <button
                  type="button"
                  key={b.value}
                  className={`sl2-seg${gajiBucket.includes(b.value) ? ' active' : ''}`}
                  onClick={() => toggleGajiBucket(b.value)}
                >
                  <span className="sl2-seg-bar" />
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {sumberOptions.length > 1 && (
            <div className="sl2-filter-group">
              <div className="sl2-flabel">Lamar Lewat</div>
              <div className="sl2-pill-group">
                {sumberOptions.map(o => (
                  <button type="button" key={o.value} className={`sl2-pill${sumber.includes(o.value) ? ' active' : ''}`} onClick={() => toggleSumber(o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="button" className="sl2-apply-btn" onClick={scrollToListing}>
            Terapkan Filter
            {activeFilterCount > 0 && <span className="sl2-apply-count">{activeFilterCount}</span>}
          </button>
        </aside>

        <div className="sl2-main" ref={mainRef}>
          <div className="sl2-listing-head">
            <h2>{sort === 'kecocokan' ? 'Paling cocok untuk kamu' : sort === 'terbaru' ? 'Lowongan terbaru' : 'Semua lowongan'}</h2>
            <div className="sl2-sort-box">
              Urutkan
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {otomatis.berjalan && <div className="sl2-auto-note">Menghitung kecocokan CV kamu dengan lowongan di halaman ini…</div>}
          {!otomatis.berjalan && otomatis.berhenti === 'kuota' && <div className="sl2-auto-note warn">Batas pengecekan kecocokan hari ini sudah tercapai. Sisanya dihitung besok, atau buka detail lowongan setelah kuota kembali.</div>}
          {kota && (
            <div className="sl2-kota-chip">
              Kota: <b>{kota}</b>
              <button type="button" onClick={() => setKota('')} aria-label="Hapus filter kota">×</button>
            </div>
          )}

          {loading ? (
            <div className="sl2-empty">Memuat lowongan…</div>
          ) : pagedJobs.length > 0 ? (
            pagedJobs.map(job => {
              const companyName = job.company_name;
              return (
                <article key={job.key} className={`sl2-job${drawerJob?.key === job.key ? ' active' : ''}`} onClick={() => openJob(job)}>
                  <span className="sl2-job-bar" />
                  <div className="sl2-job-content">
                    <div className="sl2-job-top">
                      <CompanyLogoBox className="sl2-job-logo" src={job.logo_url} alt={companyName} color={avatarColor(companyName)} initials={initials(companyName)} />
                      <div className="sl2-job-body">
                        <div className="sl2-job-titlerow">
                          <h4 className="sl2-job-title">{job.title}</h4>
                          {pinKeys.has(job.key) && <span className="sl2-job-pin">Lowongan Luna</span>}
                        </div>
                        <div className="sl2-job-meta">
                          <b>{companyName}</b>
                          <span className="sep">·</span>
                          <span>{job.location || 'Indonesia'}</span>
                          {job.employment_label && <><span className="sep">·</span><span>{job.employment_label}</span></>}
                          {job.experience_label && <><span className="sep">·</span><span>{job.experience_label}</span></>}
                        </div>
                      </div>
                      {prosesMap[job.key] || (otomatis.memeriksa && skorMap[job.key] == null)
                        ? <KecocokanMini loading />
                        : skorMap[job.key] != null
                          ? <KecocokanMini score={skorMap[job.key]} />
                          : isPelamar && <KecocokanMini ghost />}
                    </div>

                    <div className="sl2-job-bottom">
                      {job.salary_label ? (
                        <div className={`sl2-job-salary${job.salary_text_only ? ' muted' : ''}`}>{job.salary_label}</div>
                      ) : <span />}
                      <div className="sl2-job-cta">
                        <button type="button" className="sl2-job-apply" onClick={e => lamar(e, job)}>Lamar Sekarang <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></button>
                        {job.source_label && <span className="sl2-job-note">Lamar lewat {job.source_label}</span>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="sl2-empty">Tidak ada lowongan yang cocok dengan pencarian kamu.</div>
          )}

          {!loading && sortedJobs.length > 0 && (
            <div className="sl2-pagination">
              <span className="sl2-summary">
                Menampilkan <b>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedJobs.length)}</b> dari <b>{sortedJobs.length}</b> lowongan
              </span>
              <div className="sl2-page-controls">
                <button className="sl2-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`sl2-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="sl2-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="sl2-footer">
        <div className="sl2-footer-top">
          <div>
            <div className="sl2-footer-brand">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
              <b>Luna</b>
            </div>
            <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>
          </div>
          <div className="sl2-footer-col">
            <h4>Untuk Pelamar</h4>
            <button type="button" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</button>
            <button type="button" onClick={() => navigate?.('pelamar-daftar')}>Buat Profil</button>
            <button type="button" onClick={() => navigate?.('pelamar-masuk')}>Status Lamaran</button>
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
    </div>
  );
}
