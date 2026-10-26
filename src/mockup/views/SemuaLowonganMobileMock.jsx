// MOCKUP: salinan SemuaLowonganMobile_002 untuk presentasi (data dummy, sesi palsu, tanpa database).
import { useEffect, useRef, useState } from 'react';
import { LOWONGAN_DUMMY } from '../data/lowonganDummy.js';
import { createPortal } from 'react-dom';
import useSemuaLowonganMock, { PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../hooks/useSemuaLowonganMock.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { useMockSession } from '../MockSession.jsx';
import { MockMobileNav } from '../components/MockNav.jsx';
import CompanyLogoBox from '../../components/lowongan/CompanyLogoBox.jsx';
import LowonganDrawerMock from '../components/LowonganDrawerMock.jsx';
import LamarCepatMock from '../components/LamarCepatMock.jsx';
import KecocokanMini from '../../components/lowongan/KecocokanMini.jsx';
import '../../../css/mobile/lowongan/laman-karir.css';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/mobile/lowongan/semua-lowongan_002.css';

// Versi mobile dari SemuaLowongan_002.jsx (desktop) — halaman, data, dan
// semua logic filter/sort/pagination sama persis (pakai hook yang sama),
// cuma layout & interaksinya didesain ulang buat layar sempit: filter jadi
// bottom sheet (bukan sidebar), kartu lowongan satu kolom penuh.
const IconUser = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconCompany = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconFilter = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><line x1="4" y1="12" x2="20" y2="12" /><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="11" cy="17" r="2" fill="currentColor" stroke="none" /></svg>);
const IconSort = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconChevronLeft = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);

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

function FilterSheet({ open, onClose, tipeKerja, toggleTipeKerja, pengalamanBucket, togglePengalamanBucket, gajiBucket, toggleGajiBucket, sumber, toggleSumber, sumberOptions, resetFilters, activeFilterCount }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet sl2m-filter-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="sl2m-sheet-head">
          <h3>Filter</h3>
          {activeFilterCount > 0 && <button type="button" onClick={resetFilters}>Reset semua</button>}
        </div>

        <div className="sl2m-sheet-body">
          <div className="sl2m-filter-group">
            <div className="sl2m-flabel">Tipe Pekerjaan</div>
            <div className="sl2m-pill-group">
              {DROPDOWN_OPTIONS.ikatanKerja.map(opt => (
                <button type="button" key={opt} className={`sl2m-pill${tipeKerja.includes(opt) ? ' active' : ''}`} onClick={() => toggleTipeKerja(opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="sl2m-filter-group">
            <div className="sl2m-flabel">Pengalaman</div>
            <div className="sl2m-pill-group">
              {PENGALAMAN_BUCKETS.map(b => (
                <button type="button" key={b.value} className={`sl2m-pill${pengalamanBucket.includes(b.value) ? ' active' : ''}`} onClick={() => togglePengalamanBucket(b.value)}>{b.label}</button>
              ))}
            </div>
          </div>

          <div className="sl2m-filter-group">
            <div className="sl2m-flabel">Rentang Gaji</div>
            <div className="sl2m-seg-group">
              {GAJI_BUCKETS.map(b => (
                <button type="button" key={b.value} className={`sl2m-seg${gajiBucket.includes(b.value) ? ' active' : ''}`} onClick={() => toggleGajiBucket(b.value)}>
                  <span className="sl2m-seg-bar" />{b.label}
                </button>
              ))}
            </div>
          </div>

          {sumberOptions.length > 1 && (
            <div className="sl2m-filter-group">
              <div className="sl2m-flabel">Lamar Lewat</div>
              <div className="sl2m-pill-group">
                {sumberOptions.map(o => (
                  <button type="button" key={o.value} className={`sl2m-pill${sumber.includes(o.value) ? ' active' : ''}`} onClick={() => toggleSumber(o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="button" className="sl2m-apply-btn" onClick={onClose}>
          Terapkan Filter
          {activeFilterCount > 0 && <span className="sl2m-apply-count">{activeFilterCount}</span>}
        </button>
      </div>
    </>,
    document.body
  );
}

function SortSheet({ open, onClose, value, onSelect, options }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="sl2m-sheet-head" style={{ marginBottom: 8 }}><h3>Urutkan</h3></div>
        {options.map(opt => (
          <button
            key={opt.value}
            className={`sl2m-sortopt${value === opt.value ? ' active' : ''}`}
            onClick={() => { onSelect(opt.value); onClose(); }}
          >
            <span>{opt.label}</span>
            <span className={`sl2m-sortring${value === opt.value ? ' on' : ''}`}>{value === opt.value && <IconCheck />}</span>
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

export default function SemuaLowonganMobileMock({ navigate, awal }) {
  const { isPelamar, skor: skorMap } = useMockSession();
  const goMasuk = () => navigate?.('pelamar-masuk');
  const goPerusahaan = () => {}; // mockup: tombol tampil tapi tidak berpindah halaman
  const {
    loading, search, setSearch, sort, setSort, sortOptions, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    sumber, toggleSumber, sumberOptions,
    kota, setKota,
    resetFilters, activeFilterCount,
    pagedJobs, totalPages, pinKeys,
  } = useSemuaLowonganMock(10, { skorMap });

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Klik kartu membuka panel detail. "Lamar Sekarang": lowongan Luna membuka popup lamar dengan profil,
  // lowongan eksternal membuka halaman aslinya (JobStreet) di tab baru.
  const [drawerJob, setDrawerJob] = useState(null);
  // Datang dari landing: kata kunci posisi, kota, atau lowongan yang langsung dibuka panel detailnya.
  useEffect(() => {
    if (!awal) return;
    setSearch(awal.q || '');
    setKota(awal.kota || '');
    if (awal.buka) { const j = LOWONGAN_DUMMY.find((x) => x.key === awal.buka); if (j) setDrawerJob(j); }
  }, [awal]);

  const openJob = (job) => setDrawerJob(job);
  const [lamarJob, setLamarJob] = useState(null);
  const lamarSekarang = (job) => (job.is_external ? window.open(job.external_url, '_blank', 'noopener,noreferrer') : setLamarJob(job));
  const lamar = (e, job) => { e.stopPropagation(); lamarSekarang(job); };

  const popularSearches = ['Content Writer', 'Frontend Developer', 'Admin Operasional'];
  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || 'Terbaru';

  return (
    <div className="sl2m-page">
      {lamarJob && <LamarCepatMock job={lamarJob} onClose={() => setLamarJob(null)} />}
      {drawerJob && (
        <LowonganDrawerMock job={drawerJob} onClose={() => setDrawerJob(null)} onLamar={lamarSekarang} />
      )}
      <div className="lk-head">
        <a className="lk-logo" href="#" onClick={e => { e.preventDefault(); navigate?.('landingpage-pelamar'); }}>
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

      <section className="sl2m-hero">
        <h1>Temukan lowongan yang benar-benar cocok buat kamu.</h1>
        <p>Cari berdasarkan posisi, lokasi, atau bidang, biar yang kamu temu memang pas.</p>

        <form className="sl2m-search" onSubmit={e => e.preventDefault()}>
          <IconSearch />
          <input type="text" placeholder="Posisi, kota, bidang..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>

        <div className="sl2m-trending">
          {popularSearches.map(term => (
            <button type="button" key={term} className="sl2m-chip" onClick={() => setSearch(term)}>{term}</button>
          ))}
        </div>
      </section>

      <div className="sl2m-toolbar">
        <button type="button" className={`sl2m-tool-btn${activeFilterCount > 0 ? ' active' : ''}`} onClick={() => setFilterOpen(true)}>
          <IconFilter /> Filter
          {activeFilterCount > 0 && <span className="sl2m-tool-count">{activeFilterCount}</span>}
        </button>
        <button type="button" className="sl2m-tool-btn" onClick={() => setSortOpen(true)}>
          <IconSort /> {currentSortLabel}
        </button>
      </div>

      <section className="sl2m-list">
        {kota && (
          <div className="sl2m-kota-chip">
            Kota: <b>{kota}</b>
            <button type="button" onClick={() => setKota('')} aria-label="Hapus filter kota">×</button>
          </div>
        )}

        {loading ? (
          <div className="sl2m-empty">Memuat lowongan…</div>
        ) : pagedJobs.length > 0 ? (
          pagedJobs.map(job => {
            const companyName = job.company_name;
            return (
              <article key={job.key} className="sl2m-job" onClick={() => openJob(job)}>
                <span className="sl2m-job-bar" />
                <div className="sl2m-job-content">
                  <div className="sl2m-job-top">
                    <CompanyLogoBox className="sl2m-job-logo" src={job.logo_url} alt={companyName} color={avatarColor(companyName)} initials={initials(companyName)} />
                    <div className="sl2m-job-body">
                      {pinKeys.has(job.key) && <span className="sl2m-job-pin">Lowongan Luna</span>}
                      <h4 className="sl2m-job-title">{job.title}</h4>
                      <div className="sl2m-job-meta">
                        <b>{companyName}</b>
                        <span className="sep">·</span>
                        <span>{job.location || 'Indonesia'}</span>
                      </div>
                      <div className="sl2m-job-meta">
                        {job.employment_label && <span>{job.employment_label}</span>}
                        {job.employment_label && job.experience_label && <span className="sep">·</span>}
                        {job.experience_label && <span>{job.experience_label}</span>}
                      </div>
                    </div>
                    {skorMap[job.key] != null
                        ? <KecocokanMini score={skorMap[job.key]} />
                        : isPelamar && <KecocokanMini ghost />}
                  </div>
                  <div className="sl2m-job-bottom">
                    {job.salary_label ? <div className={`sl2m-job-salary${job.salary_text_only ? ' muted' : ''}`}>{job.salary_label}</div> : <span />}
                    <div className="sl2m-job-cta">
                      <button type="button" className="sl2m-job-apply" onClick={e => lamar(e, job)}>Lamar Sekarang <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></button>
                      {job.source_label && <span className="sl2m-job-note">Lamar lewat {job.source_label}</span>}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="sl2m-empty">Tidak ada lowongan yang cocok dengan pencarian kamu.</div>
        )}

        {!loading && pagedJobs.length > 0 && totalPages > 1 && (
          <div className="sl2m-pagination">
            <button type="button" className="sl2m-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><IconChevronLeft /></button>
            <span className="sl2m-page-label">Hal {page} / {totalPages}</span>
            <button type="button" className="sl2m-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><IconChevronRight /></button>
          </div>
        )}
      </section>

      <footer className="sl2m-footer">
        <div className="sl2m-footer-brand">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <b>Luna</b>
        </div>
        <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>

        <div className="sl2m-footer-cols">
          <div className="sl2m-footer-col">
            <h5>Untuk Pelamar</h5>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Cari Lowongan</button>
            <button type="button" onClick={() => navigate?.('pelamar-daftar')}>Buat Profil</button>
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

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        tipeKerja={tipeKerja} toggleTipeKerja={toggleTipeKerja}
        pengalamanBucket={pengalamanBucket} togglePengalamanBucket={togglePengalamanBucket}
        gajiBucket={gajiBucket} toggleGajiBucket={toggleGajiBucket}
        sumber={sumber} toggleSumber={toggleSumber} sumberOptions={sumberOptions}
        resetFilters={resetFilters} activeFilterCount={activeFilterCount}
      />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} value={sort} onSelect={setSort} options={sortOptions} />
    </div>
  );
}
