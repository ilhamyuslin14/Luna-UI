import { useState } from 'react';

export default function PopupUndangAnggota({ onConfirm, onClose }) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = nama.trim() && email.trim();

  const handleConfirm = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm?.({ nama, email });
      setNama(''); setEmail('');
    } catch (err) {
      setError(err.message || 'Gagal mengundang anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pua-overlay" onClick={onClose}>
      <div className="pua-modal" onClick={e => e.stopPropagation()}>

        <div className="pua-header">
          <h3 className="pua-title">Undang Anggota Tim</h3>
          <p className="pua-desc">
            Akun baru akan langsung dibuat dengan password default <strong>12345678</strong>. Bagikan info login ini secara manual — pengguna akan diminta mengganti password saat pertama kali login.
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
          {error && <p style={{ color: '#e11d48', fontSize: 13, margin: 0 }}>{error}</p>}
        </div>

        <div className="pua-footer">
          <button className="pua-btn-cancel" onClick={onClose} disabled={isSubmitting}>Batal</button>
          <button
            className="pua-btn-confirm"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Mengundang…' : 'Kirim Undangan'}
          </button>
        </div>

      </div>
    </div>
  );
}
