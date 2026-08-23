import useSemuaLowonganData, { SEMUA_LOWONGAN_SORT_OPTIONS, PENGALAMAN_BUCKETS, GAJI_BUCKETS } from '../../hooks/lowongan/useSemuaLowonganData.js';
import { formatUpah } from '../../hooks/lowongan/useLamanKarirData.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import '../../../css/lowongan/lowongan-laman-karir_001.css';
import '../../../css/lowongan/semua-lowongan_001.css';

// Palet avatar inisial (fallback saat perusahaan belum punya logo_url) —
// deterministik dari nama perusahaan supaya satu perusahaan konsisten
// dapat warna yang sama, bukan acak tiap render.
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

// Laman publik "Semua Lowongan" (?view=semua-lowongan) — daftar seluruh
// lowongan aktif di Luna, bisa diakses siapa saja tanpa login, mirip landing
// page. Header (lk-header/lk-brand) tetap dipakai dari
// lowongan-laman-karir_001.css supaya konsisten dengan Laman Karir/Perusahaan
// yang belum direvamp, tapi hero + daftar lowongan punya CSS sendiri
// (semua-lowongan_001.css, prefix sl-) supaya tidak ikut mengubah tampilan
// section "Semua Lowongan Aktif" di Lowongan-LamanKarir_001.jsx yang berbagi
// class lk-portal-*/lk-job-row* yang sama.
export default function SemuaLowongan() {
  const {
    loading, search, setSearch, sort, setSort, page, setPage,
    tipeKerja, toggleTipeKerja,
    pengalamanBucket, togglePengalamanBucket,
    gajiBucket, toggleGajiBucket,
    resetFilters, activeFilterCount,
    sortedJobs, pagedJobs, totalPages, pageSize,
  } = useSemuaLowonganData(10);

  const activeSortLabel = SEMUA_LOWONGAN_SORT_OPTIONS.find(o => o.value === sort)?.label || 'Terbaru';

  const openJob = (job) => {
    const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="sl-page">
      {/* Header Navbar — tidak direvamp, tetap pakai class lk- yang sama dengan Laman Karir/Perusahaan */}
      <header className="lk-header">
        <div className="lk-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a className="lk-brand" href="/?view=semua-lowongan">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
            <span className="lk-brand-divider" />
            <span className="lk-brand-badge">PORTAL KARIR</span>
          </a>
        </div>
      </header>

      {/* Hero — full-bleed */}
      <div className="sl-hero">
        <div className="sl-hero-rings">
          <div className="sl-ring sl-ring--outer" />
          <div className="sl-ring sl-ring--mid" />
          <div className="sl-ring sl-ring--fill" />
        </div>
        <div className="sl-hero-inner">
          <div className="sl-hero-eyebrow"><span className="sl-dot" />Lowongan Aktif</div>
          <h1>Cari lowongan yang cocok buat kamu.</h1>
          <p>Semua lowongan aktif dari perusahaan yang merekrut lewat Luna.</p>
        </div>
      </div>

      <div className="sl-wrap">
        <div className="sl-layout">
          {/* Sidebar */}
          <aside className="sl-sidebar">
            <div className="sl-sidebar-head">
              <h3>Cari &amp; Filter</h3>
              <button type="button" onClick={() => { setSearch(''); resetFilters(); }}>Reset</button>
            </div>

            <div className="sl-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Kota, posisi, atau perusahaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="sl-filter-group">
              <div className="sl-flabel">Tipe Pekerjaan</div>
              {DROPDOWN_OPTIONS.ikatanKerja.map(opt => (
                <label className="sl-fopt" key={opt}>
                  <input type="checkbox" checked={tipeKerja.includes(opt)} onChange={() => toggleTipeKerja(opt)} /> {opt}
                </label>
              ))}
            </div>

            <div className="sl-filter-group">
              <div className="sl-flabel">Pengalaman</div>
              {PENGALAMAN_BUCKETS.map(b => (
                <label className="sl-fopt" key={b.value}>
                  <input type="checkbox" checked={pengalamanBucket.includes(b.value)} onChange={() => togglePengalamanBucket(b.value)} /> {b.label}
                </label>
              ))}
            </div>

            <div className="sl-filter-group">
              <div className="sl-flabel">Rentang Gaji</div>
              {GAJI_BUCKETS.map(b => (
                <label className="sl-fopt" key={b.value}>
                  <input type="checkbox" checked={gajiBucket.includes(b.value)} onChange={() => toggleGajiBucket(b.value)} /> {b.label}
                </label>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="sl-main">
            <div className="sl-main-head">
              <div className="sl-count-text"><b>{sortedJobs.length}</b> lowongan ditemukan</div>
              <div className="sl-sort-box">
                Urutkan
                <select className="sl-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SEMUA_LOWONGAN_SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="sl-empty">Memuat lowongan…</div>
            ) : pagedJobs.length > 0 ? (
              <div className="sl-job-list">
                {pagedJobs.map(job => {
                  const companyName = job.companies?.name || 'Perusahaan';
                  return (
                    <article key={job.id} className="sl-job-card" onClick={() => openJob(job)}>
                      <div className="sl-job-top">
                        <div className="sl-job-avatar" style={{ background: avatarColor(companyName) }}>
                          {job.companies?.logo_url ? (
                            <img src={job.companies.logo_url} alt={companyName} />
                          ) : (
                            initials(companyName)
                          )}
                        </div>
                        <div className="sl-job-heading">
                          <h3 className="sl-job-title">{job.jabatan}</h3>
                          <div className="sl-job-company">
                            <b>{companyName}</b>
                            {job.companies?.industri && <><span className="sl-sep">·</span>{job.companies.industri}</>}
                          </div>
                        </div>
                        {formatUpah(job) && (
                          <div className="sl-job-salary"><div className="sl-amount">Rp {formatUpah(job)}</div></div>
                        )}
                      </div>

                      <div className="sl-job-chips">
                        {job.departments?.name && <span className="sl-chip">{job.departments.name}</span>}
                        <span className="sl-chip">{pengalamanLabel(job)}</span>
                      </div>

                      <div className="sl-job-divider" />

                      <div className="sl-job-meta">
                        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{job.lokasi || 'Indonesia'}</span>
                        {job.ikatan_kerja && (
                          <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>{job.ikatan_kerja}</span>
                        )}
                        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>{relativeTime(job.created_at)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="sl-empty">Tidak ada lowongan yang cocok dengan pencarian Anda.</div>
            )}

            {/* Pagination */}
            {!loading && sortedJobs.length > 0 && (
              <div className="sl-pagination">
                <span className="sl-summary">
                  Menampilkan <b>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedJobs.length)}</b> dari <b>{sortedJobs.length}</b> lowongan
                </span>
                <div className="sl-page-controls">
                  <button className="sl-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`sl-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  ))}
                  <button className="sl-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
