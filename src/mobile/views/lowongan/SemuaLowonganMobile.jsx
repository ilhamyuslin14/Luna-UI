import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useSemuaLowonganData, { SEMUA_LOWONGAN_SORT_OPTIONS, PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../../hooks/lowongan/useSemuaLowonganData.js';
import { formatUpah } from '../../../hooks/lowongan/useLamanKarirData.js';
import { DROPDOWN_OPTIONS } from '../../../utils/dropdownOptions.js';
import '../../../../css/mobile/lowongan/laman-karir.css';
import '../../../../css/mobile/lowongan/semua-lowongan_001.css';

const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconFilter = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>);
const IconSort = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconClock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>);
const IconChevronLeft = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
const IconChevronRight = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>);

// Palet avatar inisial (fallback saat perusahaan belum punya logo_url) —
// sama persis dengan versi desktop (SemuaLowongan.jsx), deterministik dari
// nama perusahaan supaya konsisten lintas device.
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
function relativeTime(dateStr) {
  if (!dateStr) return '-';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Hari ini';
  if (days === 1) return '1 hari lalu';
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

function SortSheet({ open, onClose, value, onSelect }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="slm-sheet-title-row"><span className="lk-sheet-title">Urutkan Lowongan</span></div>
        {SEMUA_LOWONGAN_SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`lk-m-sortopt${value === opt.value ? ' active' : ''}`}
            onClick={() => onSelect(opt.value)}
          >
            <span>{opt.label}</span>
            <span className={`lk-m-sortring${value === opt.value ? ' on' : ''}`}>
              {value === opt.value && <IconCheck />}
            </span>
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

// Sidebar filter desktop tidak muat di layar sempit, jadi dipindah jadi
// bottom sheet — pola sama dengan SortSheet (.msh-sheet).
function FilterSheet({
  open, onClose,
  tipeKerja, onToggleTipeKerja,
  pengalamanBucket, onTogglePengalaman,
  gajiBucket, onToggleGaji,
  onReset,
}) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="slm-sheet-title-row">
          <span className="lk-sheet-title">Filter Lowongan</span>
          <button type="button" className="slm-sheet-reset" onClick={onReset}>Reset</button>
        </div>

        <div className="slm-fgroup">
          <div className="slm-flabel">Tipe Pekerjaan</div>
          {DROPDOWN_OPTIONS.ikatanKerja.map(opt => (
            <button type="button" className="slm-fopt" key={opt} onClick={() => onToggleTipeKerja(opt)}>
              {opt}<span className={`slm-cb${tipeKerja.includes(opt) ? ' on' : ''}`}>{tipeKerja.includes(opt) && <IconCheck />}</span>
            </button>
          ))}
        </div>

        <div className="slm-fgroup">
          <div className="slm-flabel">Pengalaman</div>
          {PENGALAMAN_BUCKETS.map(b => (
            <button type="button" className="slm-fopt" key={b.value} onClick={() => onTogglePengalaman(b.value)}>
              {b.label}<span className={`slm-cb${pengalamanBucket.includes(b.value) ? ' on' : ''}`}>{pengalamanBucket.includes(b.value) && <IconCheck />}</span>
            </button>
          ))}
        </div>

        <div className="slm-fgroup">
          <div className="slm-flabel">Rentang Gaji</div>
          {GAJI_BUCKETS.map(b => (
            <button type="button" className="slm-fopt" key={b.value} onClick={() => onToggleGaji(b.value)}>
              {b.label}<span className={`slm-cb${gajiBucket.includes(b.value) ? ' on' : ''}`}>{gajiBucket.includes(b.value) && <IconCheck />}</span>
            </button>
          ))}
        </div>

        <button type="button" className="slm-sheet-cta" onClick={onClose}>Terapkan Filter</button>
      </div>
    </>,
    document.body
  );
}

// Padanan mobile dari SemuaLowongan.jsx (desktop) — laman publik "Semua
// Lowongan" (?view=semua-lowongan), bisa diakses siapa saja tanpa login.
// Header tetap pakai class lk- dari laman-karir.css (dipakai bareng
// LamanKarirMobile/LamanPerusahaanMobile untuk konsistensi), tapi hero +
// daftar lowongan punya CSS sendiri (semua-lowongan_001.css, prefix slm-).
// Pagination sama seperti desktop (nomor halaman + panah), bukan akumulasi
// "Muat Lebih Banyak" — baris nomor dibuat scroll horizontal & auto-scroll
// ke halaman aktif supaya tetap gampang di-tap di layar sempit; sidebar
// filter desktop dipindah jadi bottom sheet karena tidak muat di lebar mobile.
export default function SemuaLowonganMobile() {
  const {
    loading, search, setSearch, sort, setSort, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages,
  } = useSemuaLowonganData(8);

  const pageRowRef = useRef(null);
  useEffect(() => {
    const activeBtn = pageRowRef.current?.querySelector('.slm-page-btn.active');
    activeBtn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [page]);

  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const activeSortLabel = SEMUA_LOWONGAN_SORT_OPTIONS.find(o => o.value === sort)?.label || 'Terbaru';

  const goToJob = (job) => {
    const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="slm-page">
      <div className="lk-head">
        <a className="lk-logo" href="/?view=semua-lowongan">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <span className="lk-logo-divider" />
          <span className="lk-badge-portal">PORTAL KARIR</span>
        </a>
      </div>

      <div className="slm-hero">
        <div className="slm-hero-rings">
          <div className="slm-r slm-r1" />
          <div className="slm-r slm-r2" />
          <div className="slm-r slm-r3" />
        </div>
        <div className="slm-hero-inner">
          <div className="slm-eyebrow"><span className="slm-dot" />Lowongan Aktif</div>
          <h1>Cari lowongan yang cocok buat kamu.</h1>
          <p>Semua lowongan aktif dari perusahaan yang merekrut lewat Luna.</p>
        </div>
      </div>

      <div className="slm-controls">
        <div className="slm-search">
          <IconSearch />
          <input placeholder="Kota, posisi, atau perusahaan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="slm-pillrow">
          <button type="button" className={`slm-pill${activeFilterCount > 0 ? ' active' : ''}`} onClick={() => setFilterSheetOpen(true)}>
            <IconFilter />Filter{activeFilterCount > 0 && <span className="slm-badge">{activeFilterCount}</span>}
          </button>
          <button type="button" className={`slm-pill${sortSheetOpen ? ' active' : ''}`} onClick={() => setSortSheetOpen(true)}>
            <IconSort />{activeSortLabel}
          </button>
        </div>
      </div>

      <div className="slm-count"><b>{sortedJobs.length}</b> lowongan ditemukan</div>

      {loading ? (
        <div className="slm-empty">Memuat lowongan…</div>
      ) : pagedJobs.length === 0 ? (
        <div className="slm-empty">Tidak ada lowongan yang cocok dengan pencarian Anda.</div>
      ) : (
        <div className="slm-list">
          {pagedJobs.map(job => {
            const companyName = job.companies?.name || 'Perusahaan';
            return (
              <button type="button" className="slm-card" key={job.id} onClick={() => goToJob(job)}>
                <div className="slm-card-top">
                  <div className="slm-avatar" style={{ background: avatarColor(companyName) }}>
                    {job.companies?.logo_url ? <img src={job.companies.logo_url} alt={companyName} /> : initials(companyName)}
                  </div>
                  <div className="slm-card-heading">
                    <h3 className="slm-card-title">{job.jabatan}</h3>
                    <div className="slm-card-company">
                      <b>{companyName}</b>
                      {job.companies?.industri && <> · {job.companies.industri}</>}
                    </div>
                    {formatUpah(job) && <div className="slm-card-salary">Rp {formatUpah(job)}</div>}
                  </div>
                </div>

                <div className="slm-chips">
                  {job.departments?.name && <span className="slm-chip">{job.departments.name}</span>}
                  <span className="slm-chip">{pengalamanLabel(job)}</span>
                </div>

                <div className="slm-divider" />

                <div className="slm-meta">
                  <span><IconPin />{job.lokasi || 'Indonesia'}</span>
                  {job.ikatan_kerja && <span><IconBriefcase />{job.ikatan_kerja}</span>}
                  <span><IconClock />{relativeTime(job.created_at)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && sortedJobs.length > 0 && totalPages > 1 && (
        <div className="slm-pagination">
          <button
            type="button"
            className="slm-page-arrow"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <IconChevronLeft />
          </button>
          <div className="slm-page-row" ref={pageRowRef}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                type="button"
                className={`slm-page-btn${p === page ? ' active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="slm-page-arrow"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <IconChevronRight />
          </button>
        </div>
      )}

      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sort}
        onSelect={(v) => { setSort(v); setSortSheetOpen(false); }}
      />
      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        tipeKerja={tipeKerja} onToggleTipeKerja={toggleTipeKerja}
        pengalamanBucket={pengalamanBucket} onTogglePengalaman={togglePengalamanBucket}
        gajiBucket={gajiBucket} onToggleGaji={toggleGajiBucket}
        onReset={resetFilters}
      />
    </div>
  );
}
