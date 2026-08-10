import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import useUniversalSearch from '../../hooks/navbar/useUniversalSearch.js';
import Highlight from '../../components/Highlight.jsx';

const TABS = [
  { id: 'kandidat', label: 'Kandidat' },
  { id: 'seleksi', label: 'Seleksi' },
  { id: 'departemen', label: 'Departemen' },
];

const HINTS = {
  kandidat: <>Cari kandidat berdasarkan <b>nama</b>, <b>keahlian</b>, <b>pengalaman</b>, atau <b>lokasi</b>.</>,
  seleksi: <>Cari lowongan berdasarkan <b>nama posisi</b> atau <b>nama departemen</b>.</>,
  departemen: <>Cari lowongan berdasarkan <b>nama departemen</b>.</>,
};

const NAV_TARGET = { kandidat: 'kandidat_001', seleksi: 'seleksi_001', departemen: 'departemen_001' };

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconSeleksi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconDepartemen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const STATUS_TINT = {
  Aktif: { bg: '#edfcf2', color: '#089f32' },
  Selesai: { bg: '#edfcf2', color: '#089f32' },
  Ditahan: { bg: '#FAF2E7', color: '#c07a1f' },
};

function EmptyResult({ q, isLoading }) {
  return (
    <div className="msh-search-empty">
      {isLoading ? <span>Mencari "{q}"...</span> : <span>Tidak ada hasil untuk "{q}"</span>}
    </div>
  );
}

export default function MobileSearch({ open, onClose, navigate }) {
  const { companyId } = useAuth();
  const { query, setQuery, isLoading, activeTab, setActiveTab, results } = useUniversalSearch(companyId);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
    setQuery('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim();
  const hasQuery = q.length >= 2;
  const kandidatResults = results.kandidat || [];
  const seleksiResults = results.seleksi || [];
  const deptResults = results.departemen || [];

  const goTo = (menu, params) => {
    navigate(menu, params);
    onClose();
  };

  return (
    <div className={`msh-fullscreen-panel${open ? ' open' : ''}`}>
      <div className="msh-search-top">
        <button className="msh-search-back" onClick={onClose}><IconBack /></button>
        <div className="msh-search-input-wrap">
          <IconSearch />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari kandidat, lowongan, departemen..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="msh-search-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`msh-search-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="msh-search-hint">{HINTS[activeTab]}</div>

      <div className="msh-search-body">
        {!hasQuery ? (
          <div className="msh-search-empty">
            <div className="msh-search-empty-icon"><IconSearch /></div>
            <p>Mulai mengetik untuk mencari</p>
            <span>Minimal 2 karakter</span>
          </div>
        ) : (
          <>
            {activeTab === 'kandidat' && (
              kandidatResults.length === 0
                ? <EmptyResult q={q} isLoading={isLoading} />
                : kandidatResults.map(k => (
                  <button key={k.id} className="msh-result-item" onClick={() => goTo('kandidat-detail_001', { kandidat: { id: k.id, nama_lengkap: k.name } })}>
                    <span className="msh-result-avatar" style={{ background: k.color }}>{k.initials}</span>
                    <span className="msh-result-info">
                      <span className="msh-result-name"><Highlight text={k.name} query={q} /></span>
                      <span className="msh-result-sub">{k.sub}</span>
                    </span>
                  </button>
                ))
            )}

            {activeTab === 'seleksi' && (
              seleksiResults.length === 0
                ? <EmptyResult q={q} isLoading={isLoading} />
                : seleksiResults.map(s => {
                  const tint = STATUS_TINT[s.status] || { bg: '#f4f6fa', color: '#5e5c56' };
                  return (
                    <button key={s.id} className="msh-result-item" onClick={() => goTo('seleksi-detail_001', { seleksiId: s.id, jabatan: s.name })}>
                      <span className="msh-result-icon"><IconSeleksi /></span>
                      <span className="msh-result-info">
                        <span className="msh-result-name"><Highlight text={s.name} query={q} /></span>
                        <span className="msh-result-sub">{s.sub}</span>
                      </span>
                      <span className="msh-result-badge" style={{ background: tint.bg, color: tint.color }}>{s.status}</span>
                    </button>
                  );
                })
            )}

            {activeTab === 'departemen' && (
              deptResults.length === 0
                ? <EmptyResult q={q} isLoading={isLoading} />
                : deptResults.map(d => (
                  <button key={d.id} className="msh-result-item" onClick={() => goTo('departemen_001')}>
                    <span className="msh-result-icon"><IconDepartemen /></span>
                    <span className="msh-result-info">
                      <span className="msh-result-name"><Highlight text={d.name} query={q} /></span>
                      <span className="msh-result-sub">{d.sub}</span>
                    </span>
                  </button>
                ))
            )}
          </>
        )}
      </div>

      {hasQuery && (
        <button className="msh-search-footer" onClick={() => goTo(NAV_TARGET[activeTab], { search: q })}>
          Lihat Semua
        </button>
      )}
    </div>
  );
}
