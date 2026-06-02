import { useState, useRef, useEffect } from 'react';

const MOCK_KANDIDAT = [
  { initials: 'AM', color: '#19b243', name: 'Aula Maulidatul Mufidah', sub: 'Psikologi · Jakarta Selatan · 3 thn pengalaman' },
  { initials: 'AR', color: '#0977be', name: 'Arif Jackberwin',         sub: 'Human Resources · Jakarta · 10 thn pengalaman' },
  { initials: 'RG', color: '#9333ea', name: 'Rofiq Gonzalez',          sub: 'Frontend Engineer · Bandung · 4 thn pengalaman' },
  { initials: 'DA', color: '#ea580c', name: 'Dito Arkademi',           sub: 'Admin Manager · Tangerang · 2 thn pengalaman' },
];

const MOCK_SELEKSI = [
  { name: 'Senior Frontend Engineer',  sub: 'Engineering · 12 CV masuk',      status: 'Rencana' },
  { name: 'Product Marketing Manager', sub: 'Marketing · 8 CV masuk',          status: 'Aktif'   },
  { name: 'VP of Finance',             sub: 'Finance · 5 CV masuk',            status: 'Ditahan' },
  { name: 'Junior HR Specialist',      sub: 'Human Resources · 3 CV masuk',    status: 'Selesai' },
];

const MOCK_DEPT = [
  { name: 'Engineering',     sub: '3 Lowongan Aktif · 1,204 Kandidat' },
  { name: 'Marketing',       sub: '2 Lowongan Aktif · 856 Kandidat'   },
  { name: 'Finance',         sub: '1 Lowongan Aktif · 432 Kandidat'   },
  { name: 'Human Resources', sub: '1 Lowongan Aktif · 298 Kandidat'   },
];

const STATUS_STYLE = {
  Rencana: { text: '#555f71', bg: '#f4f6fa', border: '#cbd0db' },
  Aktif:   { text: '#0977be', bg: '#eef7fd', border: '#89ccf6' },
  Ditahan: { text: '#fd800c', bg: '#fff5eb', border: '#ffac4e' },
  Selesai: { text: '#089f32', bg: '#edfcf2', border: '#3cd266' },
};

function Highlight({ text, query }) {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

const IcKandidat = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
    <path d="M9.97466 8.56844C9.9307 8.35725 9.7238 8.2217 9.51263 8.26565C9.3014 8.30963 9.16583 8.51649 9.20982 8.7277C9.23515 8.84934 9.20499 8.97405 9.12708 9.06985C9.08195 9.12532 8.98136 9.2184 8.8146 9.2184H7.05079C6.83505 9.2184 6.66017 9.39329 6.66017 9.60903C6.66017 9.82477 6.83505 9.99965 7.05079 9.99965H8.8146C9.17259 9.99965 9.5074 9.84042 9.7332 9.56276C9.96011 9.28372 10.0481 8.92131 9.97466 8.56844Z" fill="currentColor"/>
    <path d="M5.39661 5.32752C6.67995 5.44572 7.84733 6.13355 8.5744 7.21791C8.69452 7.39709 8.93721 7.44498 9.11637 7.32482C9.29557 7.20467 9.34342 6.96201 9.22329 6.78283C8.58231 5.82686 7.65151 5.13186 6.59024 4.7826C7.23702 4.29766 7.65626 3.525 7.65626 2.65625C7.65626 1.19158 6.46465 0 5.00001 0C3.53536 0 2.34376 1.19158 2.34376 2.65625C2.34376 3.52557 2.76352 4.29867 3.411 4.78354C2.81782 4.97881 2.26118 5.2825 1.77403 5.68318C0.880826 6.41789 0.259791 7.4427 0.0253569 8.56879C-0.0481197 8.92166 0.0399077 9.28406 0.266822 9.56311C0.492603 9.84076 0.827427 10 1.18542 10H2.89063C3.10637 10 3.28126 9.82512 3.28126 9.60938C3.28126 9.39363 3.10637 9.21875 2.89063 9.21875H1.18538C1.01862 9.21875 0.918033 9.12568 0.872896 9.0702C0.794986 8.97438 0.76483 8.84969 0.790162 8.72803C1.17266 6.89076 2.72336 5.52096 4.56335 5.33184L3.81762 8.72459C3.78905 8.85473 3.82874 8.99045 3.92294 9.08465L4.70422 9.86603C4.77747 9.93932 4.87684 9.98047 4.98047 9.98047C5.08409 9.98047 5.18344 9.9393 5.2567 9.86603L6.03792 9.08465C6.13211 8.99043 6.1718 8.85473 6.14321 8.72461L5.39661 5.32752ZM3.12501 2.65625C3.12501 1.62236 3.96612 0.78125 5.00001 0.78125C6.03389 0.78125 6.87501 1.62236 6.87501 2.65625C6.87501 3.65893 6.08389 4.48025 5.09307 4.52895C5.0621 4.52838 5.03108 4.52801 5.00001 4.52801C4.96952 4.52801 4.93907 4.52846 4.90862 4.529C3.91702 4.48117 3.12501 3.65949 3.12501 2.65625ZM4.98045 9.03736L4.62661 8.68346L4.98045 7.07359L5.33426 8.68348L4.98045 9.03736Z" fill="currentColor"/>
  </svg>
);

const IcSeleksi = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8.4375 1.90751H6.89936V1.62153C6.89936 0.871003 6.28875 0.260417 5.53824 0.260417H4.46178C3.71125 0.260417 3.10064 0.871022 3.10064 1.62153V1.90751H1.5625C0.700938 1.90751 0 2.60844 0 3.47001V8.17616C0 9.03772 0.700938 9.73866 1.5625 9.73866H8.4375C9.29557 9.73866 9.99646 9.04063 9.99998 8.18264C10.0009 7.96692 9.82668 7.79132 9.61096 7.79042H9.60932C9.39434 7.79042 9.21961 7.96427 9.21873 8.17944C9.21697 8.60841 8.86652 8.95739 8.4375 8.95739H1.5625C1.13172 8.95739 0.78125 8.60692 0.78125 8.17614V6.01518C1.18846 6.37509 1.72322 6.5938 2.30813 6.5938H2.96129C2.9625 6.8085 3.13691 6.98217 3.35189 6.98217C3.56688 6.98217 3.74129 6.8085 3.7425 6.5938H6.25748C6.25869 6.8085 6.43311 6.98217 6.64809 6.98217C6.86307 6.98217 7.03748 6.8085 7.03869 6.5938H7.69184C8.27674 6.5938 8.81152 6.3751 9.21873 6.01518V6.22792C9.21873 6.44366 9.39361 6.61854 9.60936 6.61854C9.8251 6.61854 9.99998 6.44366 9.99998 6.22792V3.47001C10 2.60844 9.29906 1.90751 8.4375 1.90751ZM3.88189 1.62153C3.88189 1.30178 4.14203 1.04167 4.46178 1.04167H5.53824C5.85799 1.04167 6.11811 1.30178 6.11811 1.62153V1.90751H3.88189V1.62153ZM7.69186 5.81255H7.03873V5.68682C7.03873 5.47108 6.86385 5.2962 6.64811 5.2962C6.43236 5.2962 6.25748 5.47108 6.25748 5.68682V5.81255H3.74252V5.68682C3.74252 5.47108 3.56764 5.2962 3.35189 5.2962C3.13615 5.2962 2.96127 5.47108 2.96127 5.68682V5.81255H2.30813C1.46621 5.81255 0.78125 5.12759 0.78125 4.28565V3.47001C0.78125 3.03923 1.13172 2.68876 1.5625 2.68876H8.4375C8.86828 2.68876 9.21875 3.03923 9.21875 3.47001V4.28565C9.21875 5.12759 8.53379 5.81255 7.69186 5.81255Z" fill="currentColor"/>
  </svg>
);

const IcDepartemen = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6.67871 0.351332C7.54013 0.351505 8.24121 1.05238 8.24121 1.91383L8.2373 3.41481H8.4375C9.29906 3.41481 10 4.11575 10 4.97731V7.30641C10 7.52215 9.82512 7.69703 9.60938 7.69703C9.39363 7.69703 9.21875 7.52215 9.21875 7.30641V4.97731C9.21875 4.54653 8.86828 4.19606 8.4375 4.19606H8.2373V8.86891H9.60938C9.82503 8.86891 9.99987 9.04391 10 9.25953C10 9.47528 9.82512 9.65016 9.60938 9.65016H0.390625C0.174883 9.65016 0 9.47528 0 9.25953V4.97731C0 4.11575 0.700937 3.41481 1.5625 3.41481H1.7627L1.76563 1.91383C1.76563 1.05227 2.46656 0.351332 3.32813 0.351332H6.67871ZM1.5625 4.19606C1.13172 4.19606 0.78125 4.54653 0.78125 4.97731V8.86891H1.7627V4.19606H1.5625ZM3.32813 1.13258C2.89734 1.13258 2.54688 1.48305 2.54688 1.91383L2.54395 8.86891H3.51172V7.48121C3.51172 6.66082 4.17961 5.99293 5 5.99293C5.82039 5.99293 6.48828 6.66082 6.48828 7.48121V8.86891H7.45605L7.45996 1.91383C7.45996 1.48315 7.10935 1.13274 6.67871 1.13258H3.32813ZM5 6.77418C4.61039 6.77418 4.29297 7.0916 4.29297 7.48121V8.86891H5.70703V7.48121C5.70703 7.0916 5.38961 6.77418 5 6.77418ZM6.08789 4.01539C6.30535 4.01565 6.48143 4.19241 6.48145 4.40993C6.48145 4.62745 6.30536 4.8042 6.08789 4.80446H3.89746C3.67989 4.80433 3.50391 4.62753 3.50391 4.40993C3.50392 4.19233 3.6799 4.01552 3.89746 4.01539H6.08789ZM6.08789 2.43922C6.30536 2.43948 6.48145 2.61623 6.48145 2.83375C6.48123 3.05109 6.30522 3.22705 6.08789 3.22731H3.89746C3.68002 3.22718 3.50412 3.05117 3.50391 2.83375C3.50391 2.61615 3.67989 2.43935 3.89746 2.43922H6.08789Z" fill="currentColor"/>
  </svg>
);

const TABS = [
  { id: 'kandidat',  label: 'Kandidat',   Icon: IcKandidat  },
  { id: 'seleksi',   label: 'Seleksi',    Icon: IcSeleksi   },
  { id: 'departemen',label: 'Departemen', Icon: IcDepartemen },
];

const HINTS = {
  kandidat:   <span>Cari kandidat berdasarkan <b>nama</b>, <b>keahlian</b>, <b>pengalaman</b>, atau <b>lokasi</b>.</span>,
  seleksi:    <span>Cari lowongan berdasarkan <b>nama posisi</b> atau <b>nama departemen</b>.</span>,
  departemen: <span>Cari lowongan berdasarkan <b>nama departemen</b>.</span>,
};

export default function Navbar({ navigate }) {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const [activeTab, setActiveTab] = useState('kandidat');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const close = () => { setOpen(false); setQuery(''); };

  const q = query.trim();
  const hasQuery = q.length >= 2;

  const kandidatResults  = hasQuery ? MOCK_KANDIDAT.filter(k => k.name.toLowerCase().includes(q.toLowerCase())) : [];
  const seleksiResults   = hasQuery ? MOCK_SELEKSI.filter(s => s.name.toLowerCase().includes(q.toLowerCase())) : [];
  const deptResults      = hasQuery ? MOCK_DEPT.filter(d => d.name.toLowerCase().includes(q.toLowerCase())) : [];

  const navTarget = { kandidat: 'kandidat', seleksi: 'seleksi', departemen: 'departemen' };

  return (
    <>
      <div className="navbar-brand">
        <div className="brand-top">
          <div className="brand-logo">
            <img src="/assets/logo-icon.png" alt="Luna Logo" />
          </div>
          <span className="brand-title">LUNA</span>
        </div>
        <div className="brand-subtitle">By Arkademi</div>
      </div>

      <div className="search-container" ref={wrapRef}>
        <div className={`search-wrapper${open ? ' srch-open' : ''}`} onClick={handleOpen}>
          <input
            ref={inputRef}
            className="srch-input"
            placeholder="Pencarian..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={handleOpen}
          />
          <img src="/assets/group1000006025.svg" className="search-icon" alt="Search" />
        </div>

        {open && (
          <div className="srch-dropdown">
            {/* Header: tabs */}
            <div className="srch-header">
              <span className="srch-cari-label">Cari:</span>
              <div className="srch-tabs">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    className={`srch-tab${activeTab === id ? ' active' : ''}`}
                    onClick={() => setActiveTab(id)}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hint bar */}
            <div className="srch-hint">{HINTS[activeTab]}</div>

            {/* Body */}
            {!hasQuery ? (
              <div className="srch-empty">
                <div className="srch-empty-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <div className="srch-empty-text">
                  <p>Mulai mengetik untuk mencari</p>
                  <span>Minimal 2 karakter</span>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'kandidat' && kandidatResults.map((k, i) => (
                  <div key={i} className="srch-result-item" onClick={() => { navigate?.('kandidat-detail', { kandidat: { nama: k.name } }); close(); }}>
                    <div className="srch-avatar" style={{ background: k.color }}>{k.initials}</div>
                    <div className="srch-result-info">
                      <div className="srch-result-name"><Highlight text={k.name} query={q} /></div>
                      <div className="srch-result-sub">{k.sub}</div>
                    </div>
                  </div>
                ))}

                {activeTab === 'seleksi' && seleksiResults.map((s, i) => {
                  const st = STATUS_STYLE[s.status] || STATUS_STYLE.Rencana;
                  return (
                    <div key={i} className="srch-result-item" onClick={() => { navigate?.('seleksi-detail', { jabatan: s.name }); close(); }}>
                      <div className="srch-icon-circle srch-icon-blue">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        </svg>
                      </div>
                      <div className="srch-result-info">
                        <div className="srch-result-name"><Highlight text={s.name} query={q} /></div>
                        <div className="srch-result-sub">{s.sub}</div>
                      </div>
                      <span className="srch-status-badge" style={{ color: st.text, background: st.bg, borderColor: st.border }}>{s.status}</span>
                    </div>
                  );
                })}

                {activeTab === 'departemen' && deptResults.map((d, i) => (
                  <div key={i} className="srch-result-item" onClick={() => { navigate?.('departemen'); close(); }}>
                    <div className="srch-icon-circle srch-icon-gray">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#555f71">
                        <path d="M1 22V9l11-7 11 7v13H15v-5h-6v5H1zm2-2h4v-5h6v5h4V10.1L12 4.2 3 10.1V20zm5-9h2v2H8v-2zm4 0h2v2h-2v-2z"/>
                      </svg>
                    </div>
                    <div className="srch-result-info">
                      <div className="srch-result-name"><Highlight text={d.name} query={q} /></div>
                      <div className="srch-result-sub">{d.sub}</div>
                    </div>
                  </div>
                ))}

                {/* No results */}
                {((activeTab === 'kandidat' && kandidatResults.length === 0) ||
                  (activeTab === 'seleksi'   && seleksiResults.length === 0)  ||
                  (activeTab === 'departemen'&& deptResults.length === 0)) && (
                  <div className="srch-no-results">Tidak ada hasil untuk "<strong>{q}</strong>"</div>
                )}

                <div className="srch-footer" onClick={() => { navigate?.(navTarget[activeTab]); close(); }}>
                  Lihat Semua
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <div className="user-profile">
          <div className="user-avatar">
            <img src="/assets/layer2.svg" alt="User Avatar" />
          </div>
          <div className="user-info">
            <span className="user-name">Dito Arkademi</span>
            <div className="user-role-container">
              <span className="user-role">Admin</span>
              <div className="role-divider"></div>
              <span className="user-role">PT Arkademi</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
