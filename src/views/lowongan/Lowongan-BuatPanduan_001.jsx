import { useState } from 'react';
import Toast from '../../components/Toast.jsx';
import useBuatLowonganPanduan, { GENERATED_RESULT } from '../../hooks/lowongan/useBuatLowonganPanduan.js';

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

export default function LowonganBuatPanduan_001({ navigate, back }) {
  const {
    step, currentQ, total, data, current, hasAnswer,
    toggleOption, setText, prevQuestion, nextQuestion, restart, regenerate,
  } = useBuatLowonganPanduan();
  const [toast, setToast] = useState(null);

  const handleCancel = () => {
    if (back) back(); else navigate('beranda_002');
  };

  const publish = () => {
    setToast({ message: 'Lowongan berhasil dipublish', subMessage: '(mode demo — belum tersambung ke database)' });
    setTimeout(() => navigate('lowongan_001'), 1600);
  };

  return (
    <div className="blw-screen">
      {(step === 'qa' || step === 'loading-next') && (
        <>
          <div className="blw-progress-rail">
            <div className="blw-progress-fill" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
          </div>
          <div className="blw-top">
            <button className="blw-close" onClick={handleCancel}><IconClose />Batalkan</button>
            <span className="blw-progress-label">{String(currentQ + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>

          <div className="blw-body">
            <div className="blw-inner">
              {step === 'loading-next' ? (
                <div className="blw-loading">
                  <div className="blw-spinner" />
                  Menyiapkan pertanyaan berikutnya...
                </div>
              ) : (
                <>
                  <h2 className="blw-question">{data.q}</h2>

                  {data.options && (
                    <>
                      <p className="blw-subnote">Anda bisa pilih lebih dari satu jawaban</p>
                      <div className="blw-options">
                        {data.options.map((opt, i) => (
                          <button
                            key={opt}
                            className={`blw-option${current.selected.includes(i) ? ' selected' : ''}`}
                            onClick={() => toggleOption(i)}
                          >
                            <span className="blw-option-letter">
                              {current.selected.includes(i) ? <IconCheck /> : String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                      <p className="blw-free-label">Opsi lain? Tulis sendiri</p>
                    </>
                  )}

                  <textarea
                    className="blw-free-input"
                    rows={1}
                    placeholder={data.placeholder}
                    value={current.text}
                    onChange={e => setText(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="blw-footer">
            <button className="blw-back-btn" onClick={prevQuestion} style={{ visibility: currentQ === 0 ? 'hidden' : 'visible' }}>
              <IconChevronLeft />Sebelumnya
            </button>
            <button className="blw-next-btn" onClick={nextQuestion} disabled={!hasAnswer || step === 'loading-next'}>
              {currentQ === total - 1 ? 'Lihat Ringkasan' : 'Lanjut'}<IconChevronRight />
            </button>
          </div>
        </>
      )}

      {step === 'loading-summary' && (
        <div className="blw-body" style={{ height: '100%' }}>
          <div className="blw-loading">
            <div className="blw-spinner" />
            Menyusun deskripsi lowongan dari jawaban Anda...
          </div>
        </div>
      )}

      {step === 'summary' && (
        <>
          <div className="blw-sum-top">
            <span className="blw-sum-eyebrow"><IconAi />Dirangkum otomatis dari {total} jawaban Anda</span>
            <h2>Deskripsi Lowongan Siap</h2>
            <p>Tinjau hasilnya di bawah — bisa diminta ulang, atau langsung diterbitkan.</p>
          </div>
          <div className="blw-sum-body">
            <div className="blw-sum-card">
              <div className="blw-sum-job-title">{GENERATED_RESULT.jobTitle}</div>
              <div className="blw-sum-job-meta">{GENERATED_RESULT.meta.map(m => <span key={m}>{m}</span>)}</div>

              {GENERATED_RESULT.sections.map(section => (
                <div key={section.title}>
                  <div className="blw-sum-section-title">{section.title}</div>
                  {section.type === 'text' ? (
                    <p className="blw-sum-body-text">{section.content}</p>
                  ) : (
                    <ul className="blw-sum-list">
                      {section.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="blw-sum-footer">
            <button className="blw-sum-btn-ghost" onClick={restart}>Buat Ulang</button>
            <button className="blw-sum-btn-outline" onClick={regenerate}><IconRegenerate />Perbaiki</button>
            <button className="blw-sum-btn-primary" onClick={publish}><IconCheck />Publish Lowongan</button>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
