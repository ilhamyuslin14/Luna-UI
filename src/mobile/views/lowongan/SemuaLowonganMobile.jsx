import { useState } from 'react';
import { createPortal } from 'react-dom';
import useSemuaLowonganData, { SEMUA_LOWONGAN_SORT_OPTIONS } from '../../../hooks/lowongan/useSemuaLowonganData.js';
import { formatUpah } from '../../../hooks/lowongan/useLamanKarirData.js';
import '../../../../css/mobile/lowongan/laman-karir.css';

const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconChevronLeft = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconSort = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);

function CompanyLogo({ url, name, className }) {
  return url
    ? <div className={className}><img src={url} alt={name || ''} /></div>
    : <div className={className}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

function SortSheet({ open, onClose, value, onSelect }) {
  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="lk-sheet-title" style={{ marginBottom: 8 }}>Urutkan Lowongan</div>
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

// Padanan mobile dari SemuaLowongan.jsx (desktop) — laman publik "Semua
// Lowongan" (?view=semua-lowongan), bisa diakses siapa saja tanpa login.
// Duplikat dari layar sukses melamar di LamanKarirMobile.jsx, tapi berdiri
// sendiri (tidak terikat 1 lowongan/perusahaan), jadi banner-nya pesan
// terbuka dan tanpa CTA "Kembali ke lowongan".
export default function SemuaLowonganMobile() {
  const {
    loading, search, setSearch, sort, setSort, page, setPage,
    sortedJobs, pagedJobs, totalPages, pageSize,
  } = useSemuaLowonganData(8);

  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const activeSortLabel = SEMUA_LOWONGAN_SORT_OPTIONS.find(o => o.value === sort)?.label || 'Terbaru';

  const goToJob = (job) => {
    const url = job.kode ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}` : `/?view=laman-karir&jabatan=${encodeURIComponent(job.jabatan)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="lk-page">
      <div className="lk-head">
        <a className="lk-logo" href="/?view=semua-lowongan">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
          <span className="lk-logo-word">Luna</span>
          <span className="lk-badge-portal">PORTAL KARIR</span>
        </a>
      </div>

      {/* Banner — pesan terbuka, bukan pesan sukses melamar */}
      <div className="lk-success-band">
        <div className="lk-success-title">Temukan Karier Impianmu di Luna</div>
        <div className="lk-success-sub">Jelajahi seluruh lowongan pekerjaan aktif dari perusahaan-perusahaan terverifikasi di platform kami.</div>
      </div>

      <div className="lk-section-head" style={{ marginTop: 20 }}><div className="lk-section-title">Semua Lowongan Aktif di Luna</div></div>
      <div className="lk-search">
        <IconSearch />
        <input placeholder="Cari lowongan, perusahaan, kota…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="lk-m-sortrow">
        <button className="lk-m-sortbtn" onClick={() => setSortSheetOpen(true)}>
          <IconSort />
          Urutkan: <b>{activeSortLabel}</b>
          <IconChevronDown />
        </button>
      </div>

      {loading ? (
        <div className="lk-portal-empty">Memuat lowongan…</div>
      ) : pagedJobs.length === 0 ? (
        <div className="lk-portal-empty">Tidak ada lowongan yang cocok dengan pencarian Anda.</div>
      ) : (
        <div className="lk-m-joblist">
          {pagedJobs.map(job => (
            <button className="lk-m-jobrow" key={job.id} onClick={() => goToJob(job)}>
              <CompanyLogo url={job.companies?.logo_url} name={job.companies?.name} className="lk-m-jobrow-logo" />
              <div className="lk-m-jobrow-body">
                <div className="lk-m-jobrow-title">{job.jabatan}</div>
                <div className="lk-m-jobrow-meta">{job.companies?.name || 'Perusahaan'} · {job.lokasi || 'Indonesia'}</div>
              </div>
              <div className="lk-m-jobrow-side">
                {formatUpah(job) && <span className="lk-m-jobrow-salary">Rp {formatUpah(job)}</span>}
                <span className="lk-m-jobrow-chev"><IconChevronRight /></span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && sortedJobs.length > 0 && (
        <div className="lk-m-pagination">
          <span className="lk-m-pg-summary">
            Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedJobs.length)} dari {sortedJobs.length}
          </span>
          <div className="lk-m-pg-controls">
            <button className="lk-m-pg-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><IconChevronLeft /></button>
            <span className="lk-m-pg-current">{page} / {totalPages}</span>
            <button className="lk-m-pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><IconChevronRight /></button>
          </div>
        </div>
      )}

      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sort}
        onSelect={(v) => { setSort(v); setSortSheetOpen(false); }}
      />
    </div>
  );
}
