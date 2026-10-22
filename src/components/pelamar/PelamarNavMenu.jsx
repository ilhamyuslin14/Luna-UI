import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

// Menu akun pelamar (avatar pill + dropdown) dipakai di SEMUA navbar yang
// menampilkan status "sudah login sebagai pelamar" — ProfilPelamar_001,
// SemuaLowongan_002, Lowongan-LamanKarir_001 (desktop). Dulu tiap halaman
// punya versi sendiri-sendiri (ada yang cuma tombol polos tanpa dropdown,
// ada yang style teksnya beda) — sekarang satu komponen, satu sumber
// kebenaran, jadi otomatis konsisten di mana pun dipakai. Pakai class
// pp001-* yang sama persis dengan punya ProfilPelamar_001 (bukan reimplementasi
// terpisah) — halaman yang memakai komponen ini WAJIB import
// css/pelamar/profil-pelamar_001.css.
function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function PelamarNavMenu({ navigate, pelamarProfile }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nama = pelamarProfile?.nama_lengkap || 'Akun';
  const email = pelamarProfile?.email || '';

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
    } catch (err) {
      console.error('Gagal logout:', err);
    }
    navigate?.('semua-lowongan_002');
  };

  return (
    <>
      <div className="pp001-user-menu-wrapper" ref={wrapRef}>
        <div
          className={`pp001-nav-user-pill ${open ? 'active' : ''}`}
          onClick={() => setOpen(v => !v)}
          title="Menu Akun"
        >
          <div className="pp001-nav-avatar">{getInitials(nama)}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0908' }}>{nama.split(' ')[0]}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5C56" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="pp001-user-dropdown">
            <div className="pp001-user-dropdown-header">
              <div className="pp001-user-dropdown-name">{nama}</div>
              <div className="pp001-user-dropdown-email">{email}</div>
            </div>

            <button
              type="button"
              className="pp001-dropdown-item"
              onClick={() => { setOpen(false); navigate?.('status-lamaran_001'); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Lamaran Saya
            </button>

            <div className="pp001-dropdown-divider" />

            <button
              type="button"
              className="pp001-dropdown-item danger"
              onClick={() => { setOpen(false); setShowLogoutConfirm(true); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Keluar (Logout)
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="pp001-modal-overlay" onClick={() => setShowLogoutConfirm(false)} style={{ zIndex: 10000 }}>
          <div
            className="pp001-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 360, padding: '24px 22px 20px 22px', borderRadius: 14, textAlign: 'center', boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.22)' }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#0A0908' }}>Keluar dari Akun?</h4>
            <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#5E5C56', lineHeight: 1.5, padding: '0 6px' }}>
              Anda akan keluar dari sesi akun pelamar saat ini. Apakah Anda yakin ingin melanjutkan?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#3D3B36', border: '1px solid #D5D3CD', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
