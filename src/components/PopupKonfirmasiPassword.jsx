import { useState } from 'react';

export default function PopupKonfirmasiPassword({ onConfirm, onClose }) {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (!password.trim()) return;
    onConfirm?.(password);
    setPassword('');
  };

  return (
    <div className="pkp-overlay" onClick={onClose}>
      <div className="pkp-modal" onClick={e => e.stopPropagation()}>

        <div className="pkp-header">
          <h3 className="pkp-title">Konfirmasi Password</h3>
          <p className="pkp-desc">Masukkan Password untuk mengubah email Anda</p>
        </div>

        <div className="pkp-field">
          <label className="pkp-label">Password</label>
          <input
            className="pkp-input"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
            autoFocus
          />
        </div>

        <div className="pkp-footer">
          <button className="pkp-btn-cancel" onClick={onClose}>Batal</button>
          <button className="pkp-btn-confirm" onClick={handleConfirm} disabled={!password.trim()}>
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}
