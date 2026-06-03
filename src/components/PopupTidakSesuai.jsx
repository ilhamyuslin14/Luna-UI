import { useState } from 'react';

const ALASAN_OPTIONS = [
  'Di atas budget',
  'Menerima tawaran lain',
  'Tidak cocok budaya perusahaan',
  'Tidak hadir interview',
  'Tidak tersedia',
  'Tidak memenuhi syarat',
  'Lainnya',
];

export default function PopupTidakSesuai({ targetText = 'Kandidat', onConfirm, onClose }) {
  const [reason, setReason]   = useState('');
  const [details, setDetails] = useState('');

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm?.(reason, details);
    setReason('');
    setDetails('');
  };

  return (
    <div className="pts-overlay" onClick={onClose}>
      <div className="pts-modal" onClick={e => e.stopPropagation()}>

        <div className="pts-header">
          <h3 className="pts-title">Alasan Tidak Sesuai</h3>
          <button className="pts-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pts-body">
          <div className="pts-form-group">
            <label className="pts-label">Pilih alasan tidak sesuai</label>
            <div className="pts-select-wrap">
              <select className="pts-select" value={reason} onChange={e => setReason(e.target.value)}>
                <option value="" disabled>Pilih alasan...</option>
                {ALASAN_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div className="pts-form-group">
            <label className="pts-label">Tambahkan detail alasan <span className="pts-optional">(Opsional)</span></label>
            <textarea
              className="pts-textarea"
              placeholder="Ketik detail lebih lanjut di sini..."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>
        </div>

        <div className="pts-footer">
          <button className="pts-btn-cancel" onClick={onClose}>Batal</button>
          <button className="pts-btn-confirm" onClick={handleConfirm} disabled={!reason}>
            Tandai Tidak Sesuai
          </button>
        </div>

      </div>
    </div>
  );
}
