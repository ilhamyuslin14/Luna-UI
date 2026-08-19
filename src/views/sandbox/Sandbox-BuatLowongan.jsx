import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Toast from '../../components/Toast.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksi } from '../../services/seleksiService.js';
import { slugify } from '../../utils/slug.js';
import { generateBuatLowonganTanya } from '../../utils/generateBuatLowonganTanya.js';
import { generateBuatLowonganTanyaOpenAI } from '../../utils/generateBuatLowonganTanyaOpenAI.js';
import { generateBuatLowonganDraft } from '../../utils/generateBuatLowonganDraft.js';
import { generateBuatLowonganDraftOpenAI } from '../../utils/generateBuatLowonganDraftOpenAI.js';

// Halaman sandbox ini SENGAJA menduplikasi tampilan dari Lowongan-BuatPanduan_001.jsx
// (bukan meng-import) — supaya alur dummy yang masih tayang di produksi (desktop
// & mobile) tidak ikut berubah selagi versi sandbox ini disambungkan ke AI beneran.
//
// Beda dari versi dummy: pertanyaan ke-2 s/d ke-TOTAL_QUESTIONS sekarang digenerate
// AI secara adaptif (bukan array statis QUESTIONS), jadi navigasi "Sebelumnya" ke pertanyaan
// yang sudah lewat sengaja DIHAPUS — mengedit jawaban lama akan membuat seluruh
// pertanyaan sesudahnya (yang sudah digenerate berdasarkan jawaban itu) tidak lagi
// konsisten. "Buat Ulang" tetap tersedia untuk mulai dari nol.

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const TOTAL_QUESTIONS = 8;

// Satu-satunya pertanyaan yang tetap statis — sisanya (pertanyaan ke-2 s/d
// ke-TOTAL_QUESTIONS) digenerate AI berdasarkan riwayat jawaban sejauh ini.
const TEMPLATE_QUESTION_1 = {
  q: 'Apa yang mau kamu capai dengan merekrut orang ini?',
  subnote: '',
  options: null,
  multi: false,
  placeholder: 'Contoh: meningkatkan penjualan restoran, melakukan pencatatan operasional harian, dll. Gunakan bahasamu sendiri.',
};

const emptyAnswer = () => ({ selected: [], text: '' });

// Textarea jawaban bebas — mulai 2 baris, tumbuh otomatis mengikuti isi
// sampai maksimal 6 baris, lewat itu scroll internal (bukan terus melar).
const FREE_INPUT_MIN_ROWS = 1;
const FREE_INPUT_MAX_ROWS = 6;
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
  const minHeight = lineHeight * FREE_INPUT_MIN_ROWS;
  const maxHeight = lineHeight * FREE_INPUT_MAX_ROWS;
  el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))}px`;
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

// Gabungkan pilihan yang dicentang + teks bebas jadi satu string jawaban —
// inilah yang dikirim ke AI sebagai bagian dari riwayat tanya-jawab.
function answerToText(question, answer) {
  const parts = [];
  if (question.options?.length && answer.selected.length) {
    parts.push(answer.selected.map(i => question.options[i]).filter(Boolean).join(', '));
  }
  if (answer.text?.trim()) parts.push(answer.text.trim());
  return parts.length ? parts.join(' — ') : '(tidak dijawab)';
}

function buildMockPublishedUrl(jobTitle) {
  return `lunasys.id/${slugify(jobTitle || 'lowongan-baru')}`;
}

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

// Ambil config AI terbaru dari DB tiap kali mau generate — sama seperti
// Sandbox-AIScoring.jsx, supaya perubahan yang disimpan di tab Konfigurasi
// langsung ke-pick up tanpa perlu reload halaman.
async function fetchConfig() {
  let provider = 'gemini';
  let apiKey = '';
  const emptyTask = { model: '', prompt: '', useFlexMode: false, temperature: 0.2, reasoningEffort: 'low' };

  try {
    const { data: configData } = await supabase
      .from('sandbox_configs').select('*').order('updated_at', { ascending: false }).limit(1);
    if (configData?.length) {
      provider = configData[0].active_provider === 'openai' ? 'openai' : 'gemini';
      apiKey = provider === 'openai' ? (configData[0].openai_api_key || '') : (configData[0].api_key || '');
    }

    const { data: promptData } = await supabase
      .from('prompt_settings').select('*').in('type', ['BuatLowonganTanya', 'BuatLowonganDraft']);

    const buildTask = (row) => row ? {
      model: provider === 'openai' ? (row.model_openai || '') : (row.model || ''),
      prompt: row.prompt || '',
      useFlexMode: row.use_flex ?? false,
      temperature: row.temperature ?? 0.2,
      reasoningEffort: row.reasoning_effort || 'low',
    } : { ...emptyTask };

    const tanyaRow = promptData?.find(p => p.type === 'BuatLowonganTanya');
    const draftRow = promptData?.find(p => p.type === 'BuatLowonganDraft');

    return { provider, apiKey, tanya: buildTask(tanyaRow), draft: buildTask(draftRow) };
  } catch (err) {
    console.error('Gagal mengambil konfigurasi AI:', err);
    return { provider, apiKey, tanya: { ...emptyTask }, draft: { ...emptyTask } };
  }
}

export default function SandboxBuatLowongan({ navigate }) {
  const { companyId } = useAuth() || {};

  // 'qa' | 'loading-next' | 'loading-summary' | 'summary' | 'fix-input' |
  // 'loading-fix' | 'error' | 'published'
  const [step, setStep] = useState('qa');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(TEMPLATE_QUESTION_1);
  const [currentAnswer, setCurrentAnswer] = useState(emptyAnswer);
  const [qaHistory, setQaHistory] = useState([]); // [{ pertanyaan, jawaban }]

  const [draft, setDraft] = useState(null); // bentuk siap-render, lihat generateBuatLowonganDraft.js
  const [draftRawParsed, setDraftRawParsed] = useState(null); // bentuk mentah AI, dipakai ulang saat "Perbaiki"
  const [outputJson, setOutputJson] = useState('');
  const [fixText, setFixText] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const retryRef = useRef(null);
  const fallbackStepRef = useRef('qa');

  const [toast, setToast] = useState(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpeningLowongan, setIsOpeningLowongan] = useState(false);

  const hasAnswer = currentAnswer.selected.length > 0 || currentAnswer.text.trim().length > 0;
  const publishedUrl = buildMockPublishedUrl(draft?.jobTitle);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    setTimeout(() => setToast(null), 2200);
  };

  const toggleOption = (i) => {
    setCurrentAnswer(prev => {
      let selected = prev.selected.slice();
      if (currentQuestion.multi) {
        selected = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
      } else {
        selected = selected.includes(i) ? [] : [i];
      }
      return { ...prev, selected };
    });
  };
  const setAnswerText = (val) => setCurrentAnswer(prev => ({ ...prev, text: val }));

  // Jalankan satu aksi async yang manggil AI, dengan step loading + error +
  // retry yang seragam. `action` dieksekusi ulang persis sama kalau user
  // klik "Coba Lagi" (closure-nya sudah membawa data yang mau dikirim).
  const runStep = async ({ loadingStep, fallbackStep, action }) => {
    setStep(loadingStep);
    fallbackStepRef.current = fallbackStep;
    retryRef.current = () => runStep({ loadingStep, fallbackStep, action });
    try {
      await action();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan. Coba lagi.');
      setStep('error');
    }
  };

  const requireTaskConfig = (cfg, task, label) => {
    if (!cfg.apiKey) throw new Error(`API Key (${cfg.provider === 'openai' ? 'OpenAI' : 'Gemini'}) belum dikonfigurasi. Cek tab Konfigurasi API.`);
    if (!cfg[task].model) throw new Error(`Model AI untuk "${label}" belum dipilih. Cek tab Konfigurasi API.`);
  };

  const nextQuestion = () => {
    if (!hasAnswer || step === 'loading-next' || step === 'loading-summary') return;
    const jawaban = answerToText(currentQuestion, currentAnswer);
    const nextHistory = [...qaHistory, { pertanyaan: currentQuestion.q, jawaban }];

    if (questionNumber >= TOTAL_QUESTIONS) {
      runStep({
        loadingStep: 'loading-summary',
        fallbackStep: 'qa',
        action: async () => {
          const cfg = await fetchConfig();
          requireTaskConfig(cfg, 'draft', 'Susun Draf Lowongan');
          const generateFn = cfg.provider === 'openai' ? generateBuatLowonganDraftOpenAI : generateBuatLowonganDraft;
          const result = await generateFn({
            history: nextHistory,
            apiKey: cfg.apiKey,
            model: cfg.draft.model,
            prompt: cfg.draft.prompt,
            useFlexMode: cfg.draft.useFlexMode,
            temperature: cfg.draft.temperature,
            reasoningEffort: cfg.draft.reasoningEffort,
          });
          setQaHistory(nextHistory);
          setDraft(result.draft);
          setDraftRawParsed(result.rawParsed);
          setOutputJson(result.rawJson);
          setStep('summary');
        },
      });
      return;
    }

    runStep({
      loadingStep: 'loading-next',
      fallbackStep: 'qa',
      action: async () => {
        const cfg = await fetchConfig();
        requireTaskConfig(cfg, 'tanya', 'Ajukan Pertanyaan');
        const generateFn = cfg.provider === 'openai' ? generateBuatLowonganTanyaOpenAI : generateBuatLowonganTanya;
        const result = await generateFn({
          history: nextHistory,
          questionNumber: questionNumber + 1,
          totalQuestions: TOTAL_QUESTIONS,
          apiKey: cfg.apiKey,
          model: cfg.tanya.model,
          prompt: cfg.tanya.prompt,
          useFlexMode: cfg.tanya.useFlexMode,
          temperature: cfg.tanya.temperature,
          reasoningEffort: cfg.tanya.reasoningEffort,
        });
        setQaHistory(nextHistory);
        setCurrentQuestion(result.question);
        setCurrentAnswer(emptyAnswer());
        setQuestionNumber(n => n + 1);
        setOutputJson(result.rawJson);
        setStep('qa');
      },
    });
  };

  const restart = () => {
    setQaHistory([]);
    setQuestionNumber(1);
    setCurrentQuestion(TEMPLATE_QUESTION_1);
    setCurrentAnswer(emptyAnswer());
    setDraft(null);
    setDraftRawParsed(null);
    setOutputJson('');
    setFixText('');
    setErrorMessage('');
    setStep('qa');
  };

  const openFixInput = () => setStep('fix-input');
  const closeFixInput = () => setStep('summary');

  const regenerate = (text) => {
    runStep({
      loadingStep: 'loading-fix',
      fallbackStep: 'summary',
      action: async () => {
        const cfg = await fetchConfig();
        requireTaskConfig(cfg, 'draft', 'Susun Draf Lowongan');
        const generateFn = cfg.provider === 'openai' ? generateBuatLowonganDraftOpenAI : generateBuatLowonganDraft;
        const result = await generateFn({
          history: qaHistory,
          previousDraft: draftRawParsed,
          revisionNote: text,
          apiKey: cfg.apiKey,
          model: cfg.draft.model,
          prompt: cfg.draft.prompt,
          useFlexMode: cfg.draft.useFlexMode,
          temperature: cfg.draft.temperature,
          reasoningEffort: cfg.draft.reasoningEffort,
        });
        setDraft(result.draft);
        setDraftRawParsed(result.rawParsed);
        setOutputJson(result.rawJson);
        setFixText('');
        setStep('summary');
      },
    });
  };

  const publishDraft = () => setStep('published');

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

  const mulaiSebar = () => navigate?.('sebar_001');

  // Masih prototype (belum benar-benar tersambung ke database), jadi belum
  // ada seleksiId asli buat dibuka — sebagai gantinya arahkan ke lowongan
  // yang paling terakhir dibuat di perusahaan ini.
  const lihatLowongan = async () => {
    if (isOpeningLowongan || !navigate) return;
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
    <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar bg-white/50 backdrop-blur animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
            <IconAi />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Buat Lowongan</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-wide">Baru</span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Wizard "Bantuan Luna" — pertanyaan pertama tetap (template), pertanyaan ke-2 s/d ke-{TOTAL_QUESTIONS} digenerate AI dari riwayat jawaban, lalu draf lowongan disusun AI di langkah terakhir.</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Device frame — bungkus wizard blw-* apa adanya, diberi tinggi tetap
            supaya kelihatan seperti halaman penuh walau ditampilkan di dalam kartu sandbox. */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8" style={{ height: '720px' }}>
          <div className="blw-screen">
            {(step === 'qa' || step === 'loading-next' || step === 'loading-summary' || step === 'error') && (
              <>
                <div className="blw-progress-rail">
                  <div className="blw-progress-fill" style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }} />
                </div>
                <div className="blw-top">
                  <button className="blw-close" onClick={restart}><IconClose />Batalkan</button>
                  <span className="blw-progress-label">Pertanyaan {questionNumber} dari {TOTAL_QUESTIONS}</span>
                </div>

                <div className={`blw-body${step !== 'qa' ? ' blw-body-center' : ''}`}>
                  {step === 'loading-next' && <LoadingState text="Luna sedang menyiapkan pertanyaan berikutnya..." />}
                  {step === 'loading-summary' && <LoadingState text="Menyusun draf lowongan..." sub="Dari seluruh jawabanmu barusan" />}
                  {step === 'error' && (
                    <ErrorState
                      message={errorMessage}
                      onRetry={() => retryRef.current?.()}
                      onBack={() => setStep(fallbackStepRef.current)}
                    />
                  )}

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
                          {currentQuestion.placeholder && <p className="blw-example-note">{currentQuestion.placeholder}</p>}
                          <textarea
                            key={questionNumber}
                            className="blw-free-input"
                            rows={FREE_INPUT_MIN_ROWS}
                            placeholder="Tulis jawabanmu di sini…"
                            value={currentAnswer.text}
                            onChange={e => { setAnswerText(e.target.value); autoResizeTextarea(e.target); }}
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
                            onChange={e => { setAnswerText(e.target.value); autoResizeTextarea(e.target); }}
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
                      {questionNumber === TOTAL_QUESTIONS ? 'Lihat Ringkasan' : 'Lanjut'}<IconChevronRight />
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
                  <button className="blw-pub-view-btn" disabled={isOpeningLowongan} onClick={lihatLowongan}>Lihat Lowongan</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Output box JSON — menampilkan respons mentah AI paling terakhir
            (baik dari generate pertanyaan maupun generate draf). */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Output JSON Buat Lowongan</label>
          <textarea
            className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono"
            readOnly
            value={outputJson}
            placeholder="Hasil generate AI (pertanyaan berikutnya atau draf lowongan) berupa JSON akan muncul di sini..."
            style={{ height: '280px', resize: 'vertical' }}
          />
        </div>
      </div>

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
