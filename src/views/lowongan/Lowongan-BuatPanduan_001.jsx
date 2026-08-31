import { useState } from 'react';
import Toast from '../../components/Toast.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import { buildLamanKarirUrl } from '../../hooks/lowongan/useBuatLowonganPanduan.js';
import { useBuatLowonganPanduanContext } from '../../context/BuatLowonganPanduanContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const IconAi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.6A3 3 0 0 0 5 8v1a3 3 0 0 0-1 5.5A2.5 2.5 0 0 0 6 18a2.5 2.5 0 0 0 4.5 1.4A2.5 2.5 0 0 0 12 18V4.5A2.5 2.5 0 0 0 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v.6A3 3 0 0 1 19 8v1a3 3 0 0 1 1 5.5A2.5 2.5 0 0 1 18 18a2.5 2.5 0 0 1-4.5 1.4A2.5 2.5 0 0 1 12 18V4.5A2.5 2.5 0 0 1 14.5 2Z" />
    <path d="M9 8a2 2 0 0 1 2 2" /><path d="M15 8a2 2 0 0 0-2 2" /><path d="M8 14a2 2 0 0 0 2-2" /><path d="M16 14a2 2 0 0 1-2-2" />
  </svg>
);
const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconShareGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);

// Textarea jawaban bebas — mulai 2 baris, tumbuh otomatis mengikuti isi
// sampai maksimal 6 baris, lewat itu scroll internal (bukan terus melar).
const FREE_INPUT_MIN_ROWS = 1;
const FREE_INPUT_MAX_ROWS = 6;
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  const styles = getComputedStyle(el);
  const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.4 || 20;
  const minHeight = lineHeight * FREE_INPUT_MIN_ROWS;
  const maxHeight = lineHeight * FREE_INPUT_MAX_ROWS;
  // Baca scrollHeight SEKALI lalu simpan — membaca ulang setelah style.height
  // di-set bisa balik memberi angka beda (lebar konten ikut berubah begitu
  // scrollbar muncul/hilang), yang bikin tinggi ke-apply lebih kecil dari
  // tinggi konten sebenarnya (teks kepotong tanpa scrollbar).
  const contentHeight = el.scrollHeight;
  el.style.height = `${Math.max(minHeight, Math.min(contentHeight, maxHeight))}px`;
  el.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
}

// Dipanggil lewat ref (bukan cuma onChange) supaya textarea yang mount
// dengan teks yang SUDAH panjang (bukan hasil ngetik — mis. jawaban yang
// dibawa lewat BuatLowonganPanduanContext saat pindah desktop<->mobile di
// tengah wizard) ikut ukurannya benar sejak awal, bukan nyangkut di tinggi
// 1 baris sampai user ngetik satu huruf lagi. Diukur dua kali: sekali saat
// mount, sekali lagi setelah font web (Inter Tight) selesai di-swap browser
// — pengukuran pertama sering keburu jalan dengan metrik font fallback,
// jadi hasilnya lebih pendek dari yang sebenarnya kalau tidak diukur ulang.
function initAutoResize(el) {
  if (!el) return;
  autoResizeTextarea(el);
  document.fonts.ready.then(() => autoResizeTextarea(el));
}

// Satu badge loading dipakai ulang di beberapa momen (antar pertanyaan, draf
// pertama, perbaiki draf, menerbitkan) — cuma teksnya beda, lihat pemakaian
// di bawah.
function LoadingState({ text, sub }) {
  return (
    <div className="blw-loading">
      <div className="blw-loadbadge"><IconBrain /></div>
      <div className="blw-loading-text">{text}</div>
      {sub && <div className="blw-loading-sub">{sub}</div>}
    </div>
  );
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <div className="blw-loading">
      <div className="blw-loadbadge" style={{ animation: 'none', background: 'var(--luna-ink-100)' }}>
        <span style={{ color: 'var(--luna-ink-500)' }}><IconClose /></span>
      </div>
      <div className="blw-loading-text">Gagal memproses permintaan</div>
      {message && <div className="blw-loading-sub">{message}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button className="blw-sum-btn-outline" onClick={onBack}>Kembali</button>
        <button className="blw-next-btn" onClick={onRetry}>Coba Lagi</button>
      </div>
    </div>
  );
}

export default function LowonganBuatPanduan_001({ navigate, back }) {
  const { companyName } = useAuth() || {};
  const {
    step, questionNumber, totalQuestions, currentQuestion, currentAnswer, hasAnswer, qaHistory,
    draft, publishedSeleksiId, publishedKode, errorMessage, fixText, setFixText,
    toggleOption, setText, nextQuestion, restart,
    openFixInput, closeFixInput, regenerate, publishDraft,
    retryLastAction, goBackFromError,
  } = useBuatLowonganPanduanContext();
  const [toast, setToast] = useState(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const publishedUrl = buildLamanKarirUrl({ companyName, jabatan: draft?.jobTitle, kode: publishedKode });

  const handleCancel = () => {
    if (back) back(); else navigate('beranda_002');
  };

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    setTimeout(() => setToast(null), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      showToast('Tautan disalin');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Gagal menyalin', 'Coba salin manual dari kotak tautan');
    }
  };

  const mulaiSebar = () => navigate('sebar_001');

  // Lowongan sudah beneran tersimpan (publishDraft menulis ke DB), jadi
  // seleksiId-nya sudah pasti ada — tidak perlu lagi menebak "yang terakhir
  // dibuat" seperti versi dummy sebelumnya.
  const lihatLowongan = () => {
    if (publishedSeleksiId) {
      navigate('lowongan-detail_001', { seleksiId: publishedSeleksiId, jabatan: draft?.jobTitle, activeTab: 'ringkasan' });
    } else {
      navigate('lowongan_001');
    }
  };

  return (
    <div className="blw-screen">
      {(step === 'qa' || step === 'loading-next' || step === 'loading-summary') && (
        <>
          <div className="blw-progress-rail">
            <div className="blw-progress-fill" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
          </div>
          <div className="blw-top">
            <button className="blw-close" onClick={handleCancel}><IconClose />Batalkan</button>
            <span className="blw-progress-label">Pertanyaan {questionNumber} dari {totalQuestions}</span>
          </div>

          <div className={`blw-body${step !== 'qa' ? ' blw-body-center' : ''}`}>
            {step === 'loading-next' && <LoadingState text="Luna sedang menyiapkan pertanyaan berikutnya..." />}
            {step === 'loading-summary' && <LoadingState text="Menyusun draf lowongan..." sub="Dari seluruh jawabanmu barusan" />}

            {step === 'qa' && (
              <div className="blw-inner">
                <h2 className="blw-question">{currentQuestion.q}</h2>
                {currentQuestion.subnote && <p className="blw-subnote">{currentQuestion.subnote}</p>}

                {currentQuestion.options && (
                  <>
                    {currentQuestion.multi && <p className="blw-subnote">Boleh pilih lebih dari satu.</p>}
                    <div className="blw-options">
                      {currentQuestion.options.map((opt, i) => (
                        <button
                          key={opt}
                          className={`blw-option${currentAnswer.selected.includes(i) ? ' selected' : ''}`}
                          onClick={() => toggleOption(i)}
                        >
                          <span className="blw-option-letter">
                            {currentAnswer.selected.includes(i) ? <IconCheck /> : String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {!currentQuestion.options ? (
                  <>
                    {/* Pertanyaan freetext murni (tanpa pilihan) — contoh
                        jawaban ditaruh sebagai teks tetap di atas kotak,
                        bukan placeholder, supaya tidak kepotong & tetap
                        kebaca terus (placeholder hilang begitu user mulai
                        ngetik atau kalau teksnya kepanjangan buat kotaknya). */}
                    {currentQuestion.placeholder && <p className="blw-example-note">{currentQuestion.placeholder}</p>}
                    <textarea
                      key={questionNumber}
                      className="blw-free-input"
                      rows={FREE_INPUT_MIN_ROWS}
                      placeholder="Tulis jawabanmu di sini…"
                      value={currentAnswer.text}
                      ref={initAutoResize}
                      onChange={e => { setText(e.target.value); autoResizeTextarea(e.target); }}
                    />
                  </>
                ) : (
                  <>
                    <p className="blw-free-label">Opsi lain? Tulis sendiri</p>
                    <textarea
                      key={questionNumber}
                      className="blw-free-input"
                      rows={FREE_INPUT_MIN_ROWS}
                      placeholder={currentQuestion.placeholder}
                      value={currentAnswer.text}
                      ref={initAutoResize}
                      onChange={e => { setText(e.target.value); autoResizeTextarea(e.target); }}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {step === 'qa' && (
            <div className="blw-footer">
              <div />
              <button className="blw-next-btn" onClick={nextQuestion} disabled={!hasAnswer}>
                {questionNumber === totalQuestions ? 'Lihat Ringkasan' : 'Lanjut'}<IconChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {step === 'summary' && (
        <>
          <div className="blw-sum-top">
            <span className="blw-sum-eyebrow"><IconAi />Dirangkum otomatis dari {qaHistory.length} jawaban Anda</span>
            <h2>Deskripsi Lowongan Siap</h2>
            <p>Tinjau hasilnya di bawah — bisa diminta ulang, atau langsung diterbitkan.</p>
          </div>
          <div className="blw-sum-body">
            <div className="blw-sum-card">
              <div className="blw-sum-job-title">{draft?.jobTitle}</div>
              <div className="blw-sum-detail-rows">
                <div className="blw-sum-detail-row"><span>Level</span><b>{draft?.detail.levelJabatan || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Lokasi</span><b>{draft?.detail.lokasi || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Jumlah rekrut</span><b>{draft?.detail.jumlahRekrut || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Ikatan kerja</span><b>{draft?.detail.ikatanKerja || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Upah</span><b>{draft?.detail.upah || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Pendidikan minimal</span><b>{draft?.detail.pendidikan || '-'}</b></div>
                <div className="blw-sum-detail-row"><span>Pengalaman minimal</span><b>{draft?.detail.pengalaman || '-'}</b></div>
              </div>
            </div>

            <div className="blw-sum-card">
              {(draft?.sections || []).map(section => (
                <div key={section.title}>
                  <div className="blw-sum-section-title">{section.title}</div>
                  {section.type === 'text' ? (
                    <p className="blw-sum-body-text">{section.content || '-'}</p>
                  ) : (
                    <ul className="blw-sum-list">
                      {section.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {draft?.catatanLuna && (
              <div className="blw-note">
                <div className="blw-note-title">Catatan dari Luna</div>
                <p className="blw-note-body">{draft.catatanLuna}</p>
              </div>
            )}
          </div>
          <div className="blw-sum-footer">
            <button className="blw-sum-btn-ghost" onClick={() => setShowRestartConfirm(true)}>Buat Ulang</button>
            <button className="blw-sum-btn-outline" onClick={openFixInput}><IconRegenerate />Perbaiki</button>
            <button className="blw-sum-btn-primary" onClick={() => setShowPublishConfirm(true)}><IconCheck />Terbitkan Lowongan</button>
          </div>
        </>
      )}

      {step === 'fix-input' && (
        <>
          <div className="blw-top">
            <button className="blw-close" onClick={closeFixInput}><IconClose />Batal</button>
          </div>
          <div className="blw-body">
            <div className="blw-inner">
              <h2 className="blw-question">Bagian apa yang mau diperbaiki?</h2>
              <p className="blw-subnote">Tulis apa yang ingin diubah. Boleh menyebut lebih dari satu bagian sekaligus.</p>
              <textarea
                className="blw-fix-textarea"
                placeholder="Contoh: lokasinya di Bandung Selatan, gaji jangan disebut, tambahkan makan disediakan"
                value={fixText}
                onChange={e => setFixText(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="blw-footer">
            <button className="blw-back-btn" onClick={closeFixInput}>Batal</button>
            <button className="blw-next-btn" disabled={!fixText.trim()} onClick={() => regenerate(fixText)}>Perbaiki Draf</button>
          </div>
        </>
      )}

      {step === 'loading-fix' && (
        <div className="blw-body blw-body-center">
          <LoadingState text="Luna sedang memperbaiki draf..." />
        </div>
      )}

      {step === 'publishing' && (
        <div className="blw-body blw-body-center">
          <LoadingState text="Menerbitkan lowongan..." sub="Menyimpan &amp; menyusun kriteria penilaian" />
        </div>
      )}

      {step === 'error' && (
        <div className="blw-body blw-body-center">
          <ErrorState message={errorMessage} onRetry={retryLastAction} onBack={goBackFromError} />
        </div>
      )}

      {step === 'published' && (
        <>
          <div className="blw-sum-body blw-pub-body">
            <div className="blw-pub-header">
              <div className="blw-pub-header-text">
                <div className="blw-pub-title">Lowongan kamu sudah tayang</div>
                <p className="blw-pub-sub">{draft?.jobTitle} sekarang bisa dilamar siapa saja.</p>
              </div>
              <div className="blw-pub-icon"><IconCheck /></div>
            </div>

            <div className="blw-pub-link-card">
              <div className="blw-pub-link-label">Tautan Lowongan</div>
              <div className="blw-pub-link-url">{publishedUrl}</div>
              <button className="blw-pub-copy-btn" onClick={copyLink}>
                {copied ? <IconCheck /> : <IconCopy />}{copied ? 'Tersalin' : 'Salin Tautan'}
              </button>
            </div>

            <div className="blw-pub-share-title">Sekarang sebarkan lowongannya</div>
            <p className="blw-pub-share-sub">Lowongan tidak akan dapat pelamar kalau tidak disebar. Bagikan tautannya ke WhatsApp, Instagram, atau grup lowongan kerja.</p>
            <button className="blw-pub-share-btn" onClick={mulaiSebar}><IconShareGlyph />Mulai Sebar</button>
          </div>
          <div className="blw-sum-footer">
            <button className="blw-pub-view-btn" onClick={lihatLowongan}>Lihat Lowongan</button>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}

      {showRestartConfirm && (
        <PopupKonfirmasi
          title="Buat ulang dari awal?"
          body="Semua jawaban dan draf yang sudah jadi akan hilang. Kamu akan mulai lagi dari pertanyaan pertama."
          confirmLabel="Buat Ulang"
          danger
          onConfirm={() => { setShowRestartConfirm(false); restart(); }}
          onClose={() => setShowRestartConfirm(false)}
        />
      )}

      {showPublishConfirm && (
        <PopupKonfirmasi
          title="Tayangkan lowongan ini?"
          body="Lowongan akan langsung tayang dan bisa dilamar siapa saja. Kamu masih bisa mengubahnya nanti lewat menu Lowongan."
          confirmLabel="Tayangkan"
          onConfirm={() => { setShowPublishConfirm(false); publishDraft(); }}
          onClose={() => setShowPublishConfirm(false)}
        />
      )}
    </div>
  );
}
