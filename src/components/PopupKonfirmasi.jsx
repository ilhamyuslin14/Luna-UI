import { useState } from 'react';
import { createPortal } from 'react-dom';

const EXIT_DURATION = 180;

export default function PopupKonfirmasi({ title, body, confirmLabel = 'Konfirmasi', danger = false, onConfirm, onClose }) {
  const [closing, setClosing] = useState(false);

  const dismiss = (action) => {
    if (closing) return;
    setClosing(true);
    setTimeout(action, EXIT_DURATION);
  };

  // Lewat portal ke <body>: dipanggil dari dalam navbar yang punya backdrop-filter/sticky, position: fixed
  // jadi terjebak di area navbar dan popup muncul di atas halaman, bukan di tengah.
  return createPortal(
    <div className={`cm-overlay${closing ? ' cm-closing' : ''}`} onClick={() => dismiss(onClose)}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-text">
          <p className="cm-title">{title}</p>
          <p className="cm-body">{body}</p>
        </div>
        <div className="cm-footer">
          <button className="cm-btn-cancel" onClick={() => dismiss(onClose)}>Batal</button>
          <button className={`cm-btn-confirm${danger ? ' danger' : ''}`} onClick={() => dismiss(onConfirm)}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
