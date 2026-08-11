import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useBuatLowonganPanduan, { GENERATED_RESULT, buildDetailFromAnswers, buildMockPublishedUrl } from '../../../hooks/lowongan/useBuatLowonganPanduan.js';
import PopupKonfirmasi from '../../../components/PopupKonfirmasi.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { getSeleksi } from '../../../services/seleksiService.js';

const IconAi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
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
// Satu badge loading dipakai ulang di 3 momen (antar pertanyaan, draf
// pertama, & perbaiki draf) — cuma teksnya beda, lihat pemakaian di bawah.
function LoadingState({ text, sub }) {
  return (
    <div className="mblw-loading">
      <div className="mblw-loadbadge"><IconBrain /></div>
      <div className="mblw-loading-text">{text}</div>
      {sub && <div className="mblw-loading-sub">{sub}</div>}
    </div>
  );
}

const CONFETTI_COLORS = ['#FF7B00', '#FFB76B', '#FFCD90', '#3D3B36', '#D66800'];

// Efek congrats sekali putar pas halaman "sudah tayang" muncul — posisi/warna
// acak di-generate sekali (useState lazy init), bukan tiap render, supaya
// tidak keacak ulang tiap kali ada state lain (mis. tombol salin) berubah.
function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.3,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.round(Math.random() * 360),
      width: 6 + Math.random() * 5,
    }))
  );
  return (
    <div className="mblw-confetti" aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          className="mblw-confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            width: p.width,
            height: p.width * 0.4,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function MobileBuatLowonganQA({ open, onClose, navigate }) {
  const { companyId } = useAuth() || {};
  const {
    step, currentQ, total, data, current, answers, hasAnswer, fixText, setFixText,
    toggleOption, setText, prevQuestion, nextQuestion, restart,
    openFixInput, closeFixInput, regenerate, publishDraft,
  } = useBuatLowonganPanduan();
  const [toast, setToast] = useState(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpeningLowongan, setIsOpeningLowongan] = useState(false);
  const detail = buildDetailFromAnswers(answers);
  const publishedUrl = buildMockPublishedUrl();

  useEffect(() => {
    if (open) restart();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (message, sub) => {
    setToast({ message, sub });
    setTimeout(() => setToast(null), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publishedUrl}`);
      setCopied(true);
      showToast('Tautan disalin');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Gagal menyalin', 'Coba salin manual dari kotak tautan');
    }
  };

  const mulaiSebar = () => { onClose(); navigate('sebar_001'); };

  // Masih prototype (belum benar-benar tersambung ke database), jadi belum
  // ada seleksiId asli buat dibuka — sebagai gantinya arahkan ke lowongan
  // yang paling terakhir dibuat di perusahaan ini.
  const lihatLowongan = async () => {
    if (isOpeningLowongan) return;
    setIsOpeningLowongan(true);
    try {
      const rows = await getSeleksi(companyId);
      const latest = rows?.[0];
      onClose();
      if (latest) navigate('lowongan-detail_001', { seleksiId: latest.id, jabatan: latest.jabatan, activeTab: 'ringkasan' });
      else navigate('lowongan_001');
    } catch {
      onClose();
      navigate('lowongan_001');
    } finally {
      setIsOpeningLowongan(false);
    }
  };

  return createPortal(
    <>
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
                <LoadingState text="Menyiapkan pertanyaan berikutnya…" />
              ) : (
                <>
                  {currentQ > 0 && (
                    <button className="mblw-back-link" onClick={prevQuestion}><IconChevronLeft />Sebelumnya</button>
                  )}
                  <h2 className="mblw-question">{data.q}</h2>
                  {data.subnote && <p className="mblw-subnote">{data.subnote}</p>}

                  {data.options && (
                    <>
                      {data.multi && <p className="mblw-subnote">Boleh pilih lebih dari satu.</p>}
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
                    </>
                  )}

                  {/* Freetext selalu tampil — buat pertanyaan tanpa pilihan
                      (jawaban murni teks) maupun pertanyaan pilihan ganda
                      (opsi lain di luar A/B/C/D yang tersedia). */}
                  {!data.options ? (
                    <>
                      {/* Contoh jawaban ditaruh sebagai teks tetap di atas
                          kotak, bukan placeholder — placeholder-nya suka
                          kepanjangan & kepotong/hilang begitu mulai ngetik. */}
                      {data.placeholder && <p className="mblw-example-note">{data.placeholder}</p>}
                      <textarea
                        className="mblw-free-input"
                        rows={1}
                        placeholder="Tulis jawabanmu di sini…"
                        value={current.text}
                        onChange={e => setText(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <p className="mblw-free-label">Opsi lain? Tulis sendiri</p>
                      <textarea
                        className="mblw-free-input"
                        rows={1}
                        placeholder={data.placeholder}
                        value={current.text}
                        onChange={e => setText(e.target.value)}
                      />
                    </>
                  )}
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
            <LoadingState text="Menyusun draf lowongan…" sub="Dari jawabanmu barusan" />
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
                <div className="mblw-sum-detail-rows">
                  <div className="mblw-sum-detail-row"><span>Level</span><b>{GENERATED_RESULT.detail.levelJabatan}</b></div>
                  <div className="mblw-sum-detail-row"><span>Lokasi</span><b>{detail.lokasi}</b></div>
                  <div className="mblw-sum-detail-row"><span>Jumlah rekrut</span><b>{detail.jumlahRekrut}</b></div>
                  <div className="mblw-sum-detail-row"><span>Ikatan kerja</span><b>{GENERATED_RESULT.detail.ikatanKerja}</b></div>
                  <div className="mblw-sum-detail-row"><span>Upah</span><b>{detail.upah}</b></div>
                  <div className="mblw-sum-detail-row"><span>Pendidikan minimal</span><b>{GENERATED_RESULT.detail.pendidikan}</b></div>
                  <div className="mblw-sum-detail-row"><span>Pengalaman minimal</span><b>{GENERATED_RESULT.detail.pengalaman}</b></div>
                </div>
              </div>

              <div className="mblw-sum-card">
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
                <button className="mblw-sum-btn-ghost" onClick={() => setShowRestartConfirm(true)}>Buat Ulang</button>
                <button className="mblw-sum-btn-outline" onClick={openFixInput}><IconRegenerate />Perbaiki</button>
              </div>
              <button className="mblw-sum-btn-primary" onClick={() => setShowPublishConfirm(true)}><IconCheck />Terbitkan Lowongan</button>
            </div>
          </>
        )}

        {step === 'fix-input' && (
          <>
            <div className="mblw-top">
              <button className="mblw-close" onClick={closeFixInput}><IconClose /></button>
              <span />
            </div>
            <div className="mblw-body">
              <h2 className="mblw-question">Bagian apa yang mau diperbaiki?</h2>
              <p className="mblw-subnote">Tulis apa yang ingin diubah. Boleh menyebut lebih dari satu bagian sekaligus.</p>
              <textarea
                className="mblw-fix-textarea"
                placeholder="Contoh: lokasinya di Bandung Selatan, gaji jangan disebut, tambahkan makan disediakan"
                value={fixText}
                onChange={e => setFixText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mblw-footer">
              <button className="mblw-btn-ghost" onClick={closeFixInput}>Batal</button>
              <button className="mblw-next-btn" disabled={!fixText.trim()} onClick={() => regenerate(fixText)}>Perbaiki Draf</button>
            </div>
          </>
        )}

        {step === 'loading-fix' && (
          <div className="mblw-body" style={{ display: 'flex' }}>
            <LoadingState text="Luna sedang memperbaiki draf…" />
          </div>
        )}

        {step === 'published' && (
          <>
            <Confetti />
            <div className="mblw-sum-body mblw-pub-body">
              <div className="mblw-pub-header">
                <div className="mblw-pub-header-text">
                  <div className="mblw-pub-title">Lowongan kamu sudah tayang</div>
                  <p className="mblw-pub-sub">{GENERATED_RESULT.jobTitle} sekarang bisa dilamar siapa saja.</p>
                </div>
                <div className="mblw-pub-icon"><IconCheck /></div>
              </div>

              <div className="mblw-pub-link-card">
                <div className="mblw-pub-link-label">Tautan Lowongan</div>
                <div className="mblw-pub-link-url">{publishedUrl}</div>
                <button className="mblw-pub-copy-btn" onClick={copyLink}>
                  {copied ? <IconCheck /> : <IconCopy />}{copied ? 'Tersalin' : 'Salin Tautan'}
                </button>
              </div>

              <div className="mblw-pub-share-title">Sekarang sebarkan lowongannya</div>
              <p className="mblw-pub-share-sub">Lowongan tidak akan dapat pelamar kalau tidak disebar. Bagikan tautannya ke WhatsApp, Instagram, atau grup lowongan kerja.</p>
              <button className="mblw-pub-share-btn" onClick={mulaiSebar}><IconShareGlyph />Mulai Sebar</button>
            </div>
            <div className="mblw-sum-footer">
              <button className="mblw-pub-view-btn" disabled={isOpeningLowongan} onClick={lihatLowongan}>Lihat Lowongan</button>
            </div>
          </>
        )}

        {toast && <div className="mblw-toast">{toast.message}{toast.sub && <span>{toast.sub}</span>}</div>}
      </div>

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
    </>,
    document.body
  );
}
