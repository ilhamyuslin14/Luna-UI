import { useState } from 'react';
import PopupKonfirmasi from '../PopupKonfirmasi.jsx';
import { LAMARAN_SAYA_AKTIF } from '../../utils/fiturPelamar.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Navbar mobile pelamar — "Opsi 2" dari artifact review (avatar pill + satu
// bottom sheet konsolidasi: navigasi + akun + Untuk Perusahaan jadi satu
// tap target, bukan dicecer sebagai banyak ikon header terpisah). Pakai
// class .msh-sheet/.msh-sheet-item yang SAMA dengan sheet akun sisi
// perusahaan di MobileApp.jsx — bukan reimplementasi gaya baru, supaya
// konsisten dengan bahasa visual mobile app yang sudah ada.
function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function PelamarMobileNav({ navigate, pelamarProfile, goPerusahaan, activeTab, keluarKe }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nama = pelamarProfile?.nama_lengkap || 'Akun';
  const email = pelamarProfile?.email || '';

  const go = (menu) => { setOpen(false); navigate?.(menu); };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
    } catch (err) {
      console.error('Gagal logout:', err);
    }
    // Tetap di halaman asal; hanya halaman yang butuh akun (mis. Profil Saya) yang mengirim keluarKe.
    if (keluarKe) navigate?.(keluarKe);
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
        {LAMARAN_SAYA_AKTIF && (
          <button className={`msh-sheet-item${activeTab === 'lamaran' ? ' active' : ''}`} onClick={() => go('status-lamaran_001')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Lamaran Saya
          </button>
        )}

        <div className="pmn-sheet-divider" />
        <div className="pmn-section-label">Akun</div>
        <button className="msh-sheet-item" onClick={() => { setOpen(false); goPerusahaan?.(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          Untuk Perusahaan
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
          onConfirm={handleConfirmLogout}
          onClose={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
