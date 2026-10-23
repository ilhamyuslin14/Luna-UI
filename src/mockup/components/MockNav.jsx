import { useState, useRef, useEffect } from 'react';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import { useMockSession } from '../MockSession.jsx';

// Menu akun pelamar versi mockup (desktop dan mobile). Tampilannya sama dengan PelamarNavMenu /
// PelamarMobileNav, tapi TANPA "Lamaran Saya" dan keluar lewat sesi palsu, bukan Supabase.
// Memakai class pp001-* (desktop) dan pmn-* / msh-* (mobile) yang sama dengan aslinya, jadi
// halaman yang memakainya harus mengimpor css/pelamar/profil-pelamar_001.css.
function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function MockNavMenu({ navigate }) {
  const { logout, pelamarProfile } = useMockSession();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const nama = pelamarProfile?.nama_lengkap || 'Akun';
  const email = pelamarProfile?.email || '';

  const konfirmasiKeluar = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate?.('pelamar-masuk');
  };

  return (
    <>
      <div className="pp001-user-menu-wrapper" ref={wrapRef}>
        <div className={`pp001-nav-user-pill ${open ? 'active' : ''}`} onClick={() => setOpen(v => !v)} title="Menu Akun">
          <div className="pp001-nav-avatar">{getInitials(nama)}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0908' }}>{nama.split(' ')[0]}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5C56" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="pp001-user-dropdown">
            <div className="pp001-user-dropdown-header">
              <div className="pp001-user-dropdown-name">{nama}</div>
              <div className="pp001-user-dropdown-email">{email}</div>
            </div>

            <button type="button" className="pp001-dropdown-item" onClick={() => { setOpen(false); navigate?.('profil-pelamar_001'); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Profil Saya
            </button>

            <div className="pp001-dropdown-divider" />

            <button type="button" className="pp001-dropdown-item danger" onClick={() => { setOpen(false); setShowLogoutConfirm(true); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Keluar (Logout)
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <PopupKonfirmasi
          title="Keluar dari Akun?"
          body="Anda akan keluar dari sesi akun pelamar saat ini."
          confirmLabel="Keluar"
          danger
          onConfirm={konfirmasiKeluar}
          onClose={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}

export function MockMobileNav({ navigate, activeTab }) {
  const { logout, pelamarProfile } = useMockSession();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nama = pelamarProfile?.nama_lengkap || 'Akun';
  const email = pelamarProfile?.email || '';
  const go = (menu) => { setOpen(false); navigate?.(menu); };

  const konfirmasiKeluar = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate?.('pelamar-masuk');
  };

  return (
    <>
      <button type="button" className="pmn-trigger" onClick={() => setOpen(true)}>
        <span className="pmn-avatar">{getInitials(nama)}</span>
        <span className="pmn-name">{nama.split(' ')[0]}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <div className={`msh-sheet${open ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="msh-sheet-profile">
          <div className="msh-sheet-profile-avatar">{getInitials(nama)}</div>
          <div>
            <div className="msh-sheet-profile-name">{nama}</div>
            <div className="msh-sheet-profile-email">{email}</div>
          </div>
        </div>

        <div className="pmn-section-label">Navigasi</div>
        <button className={`msh-sheet-item${activeTab === 'cari' ? ' active' : ''}`} onClick={() => go('semua-lowongan_002')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          Cari Lowongan
        </button>
        <button className={`msh-sheet-item${activeTab === 'profil' ? ' active' : ''}`} onClick={() => go('profil-pelamar_001')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Profil Saya
        </button>

        <div className="pmn-sheet-divider" />
        <button className="msh-sheet-item danger" onClick={() => { setOpen(false); setShowLogoutConfirm(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Keluar (Logout)
        </button>
      </div>

      {showLogoutConfirm && (
        <PopupKonfirmasi
          title="Keluar dari Akun?"
          body="Anda akan keluar dari sesi akun pelamar saat ini."
          confirmLabel="Keluar"
          danger
          onConfirm={konfirmasiKeluar}
          onClose={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
