import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useBuatLowonganPanduan, { GENERATED_RESULT } from '../../../hooks/lowongan/useBuatLowonganPanduan.js';

const IconAi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconRegenerate = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
);

export default function MobileBuatLowonganQA({ open, onClose, navigate }) {
  const {
    step, currentQ, total, data, current, hasAnswer,
    toggleOption, setText, prevQuestion, nextQuestion, restart, regenerate,
  } = useBuatLowonganPanduan();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (open) restart();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const publish = () => {
    setToast({ message: 'Lowongan berhasil dipublish', sub: '(mode demo — belum tersambung ke database)' });
    setTimeout(() => { setToast(null); onClose(); navigate('lowongan_001'); }, 1600);
  };

  return createPortal(
    <div className={`msh-fullscreen-panel${open ? ' open' : ''}`}>
      {(step === 'qa' || step === 'loading-next') && (
        <>
          <div className="mblw-rail"><div className="mblw-rail-fill" style={{ width: `${((currentQ + 1) / total) * 100}%` }} /></div>
          <div className="mblw-top">
            <button className="mblw-close" onClick={onClose}><IconClose /></button>
            <span className="mblw-progress-label">{String(currentQ + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>

          <div className="mblw-body">
            {step === 'loading-next' ? (
              <div className="mblw-loading"><div className="mblw-spinner" />Menyiapkan pertanyaan berikutnya...</div>
            ) : (
              <>
                {currentQ > 0 && (
                  <button className="mblw-back-link" onClick={prevQuestion}><IconChevronLeft />Sebelumnya</button>
                )}
                <h2 className="mblw-question">{data.q}</h2>

                {data.options && (
                  <>
                    <p className="mblw-subnote">Anda bisa pilih lebih dari satu jawaban</p>
                    <div className="mblw-options">
                      {data.options.map((opt, i) => (
                        <button
                          key={opt}
                          className={`mblw-option${current.selected.includes(i) ? ' selected' : ''}`}
                          onClick={() => toggleOption(i)}
                        >
                          <span className="mblw-option-letter">
                            {current.selected.includes(i) ? <IconCheck /> : String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <p className="mblw-free-label">Opsi lain? Tulis sendiri</p>
                  </>
                )}

                <textarea
                  className="mblw-free-input"
                  rows={1}
                  placeholder={data.placeholder}
                  value={current.text}
                  onChange={e => setText(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="mblw-footer">
            <button className="mblw-next-btn" onClick={nextQuestion} disabled={!hasAnswer || step === 'loading-next'}>
              {currentQ === total - 1 ? 'Lihat Ringkasan' : 'Lanjut'}<IconChevronRight />
            </button>
          </div>
        </>
      )}

      {step === 'loading-summary' && (
        <div className="mblw-body" style={{ display: 'flex' }}>
          <div className="mblw-loading"><div className="mblw-spinner" />Menyusun deskripsi lowongan dari jawaban Anda...</div>
        </div>
      )}

      {step === 'summary' && (
        <>
          <div className="mblw-sum-top">
            <button className="mblw-close" onClick={onClose}><IconClose /></button>
          </div>
          <div className="mblw-sum-body">
            <span className="mblw-sum-eyebrow"><IconAi />Dirangkum otomatis dari {total} jawaban Anda</span>
            <h2 className="mblw-sum-title">Deskripsi Lowongan Siap</h2>
            <div className="mblw-sum-card">
              <div className="mblw-sum-job-title">{GENERATED_RESULT.jobTitle}</div>
              <div className="mblw-sum-job-meta">{GENERATED_RESULT.meta.map(m => <span key={m}>{m}</span>)}</div>

              {GENERATED_RESULT.sections.map(section => (
                <div key={section.title}>
                  <div className="mblw-sum-section-title">{section.title}</div>
                  {section.type === 'text' ? (
                    <p className="mblw-sum-text">{section.content}</p>
                  ) : (
                    <ul className="mblw-sum-list">
                      {section.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mblw-sum-footer">
            <div className="mblw-sum-secondary-row">
              <button className="mblw-sum-btn-ghost" onClick={restart}>Buat Ulang</button>
              <button className="mblw-sum-btn-outline" onClick={regenerate}><IconRegenerate />Perbaiki</button>
            </div>
            <button className="mblw-sum-btn-primary" onClick={publish}><IconCheck />Publish Lowongan</button>
          </div>
        </>
      )}

      {toast && <div className="mblw-toast">{toast.message}<span>{toast.sub}</span></div>}
    </div>,
    document.body
  );
}
