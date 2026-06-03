export default function PopupKonfirmasi({ title, body, confirmLabel = 'Konfirmasi', onConfirm, onClose }) {
  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-text">
          <p className="cm-title">{title}</p>
          <p className="cm-body">{body}</p>
        </div>
        <div className="cm-footer">
          <button className="cm-btn-cancel" onClick={onClose}>Batal</button>
          <button className="cm-btn-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
