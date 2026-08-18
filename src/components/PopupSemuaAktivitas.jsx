import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useSemuaAktivitas from '../hooks/notifikasi/useSemuaAktivitas.js';

const EXIT_DURATION = 180;

export default function PopupSemuaAktivitas({ onClose, onNavigate }) {
  const { companyId } = useAuth();
  const [closing, setClosing] = useState(false);
  const { isLoading, activities, visible, hasMore, loadMore } = useSemuaAktivitas(companyId);

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, EXIT_DURATION);
  };

  return createPortal(
    <div className={`psa-overlay${closing ? ' psa-closing' : ''}`} onClick={dismiss}>
      <div className="psa-modal" onClick={e => e.stopPropagation()}>
        <div className="psa-header">
          <h2 className="psa-title">Semua Notifikasi</h2>
          <button className="psa-close" onClick={dismiss} title="Tutup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="psa-list">
          {isLoading ? (
            <div className="psa-empty">Memuat aktivitas...</div>
          ) : visible.length === 0 ? (
            <div className="psa-empty">Belum ada aktivitas rekrutmen.</div>
          ) : (
            visible.map((item, idx) => (
              <div
                key={idx}
                className="psa-item"
                onClick={() => {
                  if (item.type === 'seleksi' || item.type === 'scoring') onNavigate?.('seleksi_001');
                  else if (item.type === 'kandidat' || item.type === 'upload') onNavigate?.('kandidat_001');
                  dismiss();
                }}
              >
                <div className="psa-dot"></div>
                <div className="psa-content">
                  <p className="psa-text">{item.text}</p>
                  <span className="psa-time">{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && (
          <div className="psa-footer">
            {hasMore ? (
              <button className="psa-load-more" onClick={loadMore}>
                Muat Lebih Banyak
              </button>
            ) : activities.length > 0 ? (
              <span className="psa-done">Semua aktivitas telah ditampilkan</span>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
