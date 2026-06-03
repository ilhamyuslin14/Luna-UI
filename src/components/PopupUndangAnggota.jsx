import { useState } from 'react';

export default function PopupUndangAnggota({ onConfirm, onClose }) {
  const [nama,    setNama]    = useState('');
  const [tampilan, setTampilan] = useState('');
  const [email,   setEmail]   = useState('');

  const isValid = nama.trim() && tampilan.trim() && email.trim();

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm?.({ nama, tampilan, email, role: 'Admin' });
    setNama(''); setTampilan(''); setEmail('');
  };

  return (
    <div className="pua-overlay" onClick={onClose}>
      <div className="pua-modal" onClick={e => e.stopPropagation()}>

        <div className="pua-header">
          <h3 className="pua-title">Undang Anggota Tim</h3>
          <p className="pua-desc">
            Kami akan mengirimkan email undangan ke alamat di bawah ini. Pengguna baru akan diminta untuk membuat kata sandi mereka sendiri untuk mengakses LUNA.
          </p>
        </div>

        <div className="pua-form">
          <div className="pua-field">
            <label className="pua-label">Nama Lengkap</label>
            <input
              className="pua-input"
              type="text"
              placeholder="Isi Nama Lengkap"
              value={nama}
              onChange={e => setNama(e.target.value)}
            />
          </div>
          <div className="pua-field">
            <label className="pua-label">Nama Tampilan</label>
            <input
              className="pua-input"
              type="text"
              placeholder="Isi Nama Tampilan"
              value={tampilan}
              onChange={e => setTampilan(e.target.value)}
            />
          </div>
          <div className="pua-field">
            <label className="pua-label">Alamat Email</label>
            <input
              className="pua-input"
              type="email"
              placeholder="Isi Alamat Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="pua-field">
            <label className="pua-label">Peran (Role)</label>
            <input
              className="pua-input pua-input--readonly"
              type="text"
              value="Admin"
              readOnly
            />
          </div>
        </div>

        <div className="pua-footer">
          <button className="pua-btn-cancel" onClick={onClose}>Batal</button>
          <button
            className="pua-btn-confirm"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Kirim Undangan
          </button>
        </div>

      </div>
    </div>
  );
}
