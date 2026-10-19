import { useRef, useState } from 'react';
import useSemuaLowonganData, { SEMUA_LOWONGAN_SORT_OPTIONS, PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../hooks/lowongan/useSemuaLowonganData.js';
import { formatUpah } from '../../hooks/lowongan/useLamanKarirData.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';

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
const IconBookmark = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
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
function pengalamanLabel(job) {
  const n = parseInt(job.pengalaman, 10);
  if (!n || n <= 0) return 'Fresh graduate';
  return `${n}+ tahun`;
}
// Revamp "Opsi 1 — Trusted & Structured" dari artifact review (search-forward
// hero, kategori populer, kartu lowongan lebih informatif, footer lengkap).
// Sengaja dibuat sebagai KOMPONEN BARU (bukan timpa SemuaLowongan.jsx) atas
// permintaan user — biar versi lama tetap ada & bisa dibandingkan. Header
// TIDAK diubah, tetap pakai lk-header/lk-brand yang sudah ada.
export default function SemuaLowongan_002({ navigate }) {
  const { companyId } = useAuth() || {};
  const goMasuk = () => navigate ? navigate('pelamar-masuk') : (window.location.href = '/?view=pelamar-masuk');
  const goPerusahaan = () => {
    const target = companyId ? 'beranda_002' : 'landingpage_003';
    if (navigate) navigate(target); else window.location.href = `/?view=${target}`;
  };
  const {
    loading, search, setSearch, sort, setSort, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
  } = useSemuaLowonganData(8);

  const mainRef = useRef(null);
  const scrollToListing = () => mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Simpan lowongan — dummy, cuma state lokal per sesi (belum ada tabel
  // "saved jobs" di Supabase), sekadar interaksi UI kartu.
  const [savedJobs, setSavedJobs] = useState(() => new Set());
  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    setSavedJobs(prev => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const openJob = (job) => {
    const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
    window.open(url, '_blank');
  };

  const popularSearches = ['Content Writer', 'Frontend Developer', 'Admin Operasional'];

  return (
    <div className="sl2-page">
      {/* Header — navbar baru ala ProfilPelamar_001 (nav-links Cari Lowongan /
          Profil Saya / Lamaran Saya), tapi state SEBELUM login: kanan masih
          CTA "Masuk" + "Untuk Perusahaan" yang sekarang (bukan avatar pill),
          karena pelamar belum login di halaman listing publik ini. Klik
          "Profil Saya"/"Lamaran Saya" saat belum login mengarahkan ke
          halaman Masuk dulu. */}
      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sl2-nav-left">
            <a className="lk-brand" href="/?view=semua-lowongan_002">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
              <span className="lk-brand-divider" />
              <span className="lk-brand-badge">PORTAL KARIR</span>
            </a>
            <nav className="sl2-nav-links">
              <span className="sl2-nav-link active">Cari Lowongan</span>
              <span className="sl2-nav-link" onClick={goMasuk}>Profil Saya</span>
              <span className="sl2-nav-link" onClick={goMasuk}>Lamaran Saya</span>
            </nav>
          </div>
          <div className="lk-header-actions">
            <button className="lk-link-masuk" onClick={goMasuk}>Masuk</button>
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

          <button type="button" className="sl2-apply-btn" onClick={scrollToListing}>
            Terapkan Filter
            {activeFilterCount > 0 && <span className="sl2-apply-count">{activeFilterCount}</span>}
          </button>
        </aside>

        <div className="sl2-main" ref={mainRef}>
          <div className="sl2-listing-head">
            <h2>Lowongan terbaru</h2>
            <div className="sl2-sort-box">
              Urutkan
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {SEMUA_LOWONGAN_SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="sl2-empty">Memuat lowongan…</div>
          ) : pagedJobs.length > 0 ? (
            pagedJobs.map(job => {
              const companyName = job.companies?.name || 'Perusahaan';
              const isSaved = savedJobs.has(job.id);
              return (
                <article key={job.id} className="sl2-job" onClick={() => openJob(job)}>
                  <span className="sl2-job-bar" />
                  <div className="sl2-job-content">
                    <div className="sl2-job-top">
                      <div className="sl2-job-logo" style={{ background: avatarColor(companyName) }}>
                        {job.companies?.logo_url ? <img src={job.companies.logo_url} alt={companyName} /> : initials(companyName)}
                      </div>
                      <div className="sl2-job-body">
                        <h4 className="sl2-job-title">{job.jabatan}</h4>
                        <div className="sl2-job-meta">
                          <b>{companyName}</b>
                          <span className="sep">·</span>
                          <span>{job.lokasi || 'Indonesia'}</span>
                          {job.ikatan_kerja && <><span className="sep">·</span><span>{job.ikatan_kerja}</span></>}
                          <span className="sep">·</span>
                          <span>{pengalamanLabel(job)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`sl2-save-btn${isSaved ? ' active' : ''}`}
                        onClick={e => toggleSaveJob(e, job.id)}
                        aria-label={isSaved ? 'Hapus dari lowongan tersimpan' : 'Simpan lowongan'}
                      >
                        <IconBookmark filled={isSaved} />
                      </button>
                    </div>

                    <div className="sl2-job-bottom">
                      {formatUpah(job) ? (
                        <div className="sl2-job-salary">Rp {formatUpah(job)}</div>
                      ) : <span />}
                      <span className="sl2-job-detail">
                        Lihat Detail <IconArrowRight />
                      </span>
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
