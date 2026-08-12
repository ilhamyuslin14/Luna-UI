import { useState } from 'react';
import Toast from '../../components/Toast.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import useBuatLowonganPanduan, { GENERATED_RESULT, buildDetailFromAnswers, buildMockPublishedUrl } from '../../hooks/lowongan/useBuatLowonganPanduan.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksi } from '../../services/seleksiService.js';

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
    <div className="blw-loading">
      <div className="blw-loadbadge"><IconBrain /></div>
      <div className="blw-loading-text">{text}</div>
      {sub && <div className="blw-loading-sub">{sub}</div>}
    </div>
  );
}

export default function LowonganBuatPanduan_001({ navigate, back }) {
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

  const handleCancel = () => {
    if (back) back(); else navigate('beranda_002');
  };

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
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

  const mulaiSebar = () => navigate('sebar_001');

  // Masih prototype (belum benar-benar tersambung ke database), jadi belum
  // ada seleksiId asli buat dibuka — sebagai gantinya arahkan ke lowongan
  // yang paling terakhir dibuat di perusahaan ini.
  const lihatLowongan = async () => {
    if (isOpeningLowongan) return;
    setIsOpeningLowongan(true);
    try {
      const rows = await getSeleksi(companyId);
      const latest = rows?.[0];
      if (latest) navigate('lowongan-detail_001', { seleksiId: latest.id, jabatan: latest.jabatan, activeTab: 'ringkasan' });
      else navigate('lowongan_001');
    } catch {
      navigate('lowongan_001');
    } finally {
      setIsOpeningLowongan(false);
    }
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
            <span className="blw-progress-label">Pertanyaan {currentQ + 1} dari {total}</span>
          </div>

          <div className={`blw-body${step === 'loading-next' ? ' blw-body-center' : ''}`}>
            <div className="blw-inner">
              {step === 'loading-next' ? (
                <LoadingState text="Menyiapkan pertanyaan berikutnya..." />
              ) : (
                <>
                  <h2 className="blw-question">{data.q}</h2>
                  {data.subnote && <p className="blw-subnote">{data.subnote}</p>}

                  {data.options && (
                    <>
                      {data.multi && <p className="blw-subnote">Boleh pilih lebih dari satu.</p>}
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
                    </>
                  )}

                  {!data.options ? (
                    <>
                      {/* Pertanyaan freetext murni (tanpa pilihan) — contoh
                          jawaban ditaruh sebagai teks tetap di atas kotak,
                          bukan placeholder, supaya tidak kepotong & tetap
                          kebaca terus (placeholder hilang begitu user mulai
                          ngetik atau kalau teksnya kepanjangan buat kotaknya). */}
                      {data.placeholder && <p className="blw-example-note">{data.placeholder}</p>}
                      <textarea
                        className="blw-free-input"
                        rows={1}
                        placeholder="Tulis jawabanmu di sini…"
                        value={current.text}
                        onChange={e => setText(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <p className="blw-free-label">Opsi lain? Tulis sendiri</p>
                      <textarea
                        className="blw-free-input"
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
        <div className="blw-body blw-body-center">
          <LoadingState text="Menyusun draf lowongan..." sub="Dari jawabanmu barusan" />
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
              <div className="blw-sum-detail-rows">
                <div className="blw-sum-detail-row"><span>Level</span><b>{GENERATED_RESULT.detail.levelJabatan}</b></div>
                <div className="blw-sum-detail-row"><span>Lokasi</span><b>{detail.lokasi}</b></div>
                <div className="blw-sum-detail-row"><span>Jumlah rekrut</span><b>{detail.jumlahRekrut}</b></div>
                <div className="blw-sum-detail-row"><span>Ikatan kerja</span><b>{GENERATED_RESULT.detail.ikatanKerja}</b></div>
                <div className="blw-sum-detail-row"><span>Upah</span><b>{detail.upah}</b></div>
                <div className="blw-sum-detail-row"><span>Pendidikan minimal</span><b>{GENERATED_RESULT.detail.pendidikan}</b></div>
                <div className="blw-sum-detail-row"><span>Pengalaman minimal</span><b>{GENERATED_RESULT.detail.pengalaman}</b></div>
              </div>
            </div>

            <div className="blw-sum-card">
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

      {step === 'published' && (
        <>
          <div className="blw-sum-body blw-pub-body">
            <div className="blw-pub-header">
              <div className="blw-pub-header-text">
                <div className="blw-pub-title">Lowongan kamu sudah tayang</div>
                <p className="blw-pub-sub">{GENERATED_RESULT.jobTitle} sekarang bisa dilamar siapa saja.</p>
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
            <button className="blw-pub-view-btn" disabled={isOpeningLowongan} onClick={lihatLowongan}>Lihat Lowongan</button>
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
