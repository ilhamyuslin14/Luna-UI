import { useState, useRef } from 'react';
import { supabase } from '../../config/supabase.js';
import { slugify } from '../../utils/slug.js';
import { createSeleksi } from '../../services/seleksiService.js';
import { invalidate } from '../../services/dataCache.js';

// Versi produksi — porting dari Sandbox (Sandbox-BuatLowongan.jsx), setelah
// dites di sana. Beda utama dari versi sandbox: di sini panggilan AI lewat
// Supabase Edge Function (`buat-lowongan-tanya`/`buat-lowongan-draft`), bukan
// langsung ke Gemini/OpenAI dari browser — supaya API key provider AI (yang
// dipakai bareng oleh seluruh perusahaan di platform ini) tidak pernah sampai
// ke browser user. Server yang resolve config (sandbox_configs/prompt_settings),
// hook ini cuma kirim riwayat jawaban & terima hasil siap-pakai.
//
// "Terbitkan Lowongan" juga sudah beneran (bukan dummy lagi) — padanan persis
// dari submit() di useBuatLowonganForm.js (alur "Buat dengan Form"): insert ke
// `seleksi` lalu fire-and-forget ke Edge Function `generate-kriteria`. Bedanya
// cuma sumber datanya dari draf AI, bukan isian form manual.

export const TOTAL_QUESTIONS = 8;

// Satu-satunya pertanyaan yang tetap statis — sisanya (pertanyaan ke-2 s/d
// ke-TOTAL_QUESTIONS) digenerate AI berdasarkan riwayat jawaban sejauh ini,
// jadi tidak ada lagi "urutan pertanyaan tetap" yang bisa diasumsikan indexnya.
const TEMPLATE_QUESTION_1 = {
  q: 'Apa yang mau kamu capai dengan merekrut orang ini?',
  subnote: '',
  options: null,
  multi: false,
  placeholder: 'Contoh: meningkatkan penjualan restoran, melakukan pencatatan operasional harian, dll. Gunakan bahasamu sendiri.',
};

const emptyAnswer = () => ({ selected: [], text: '' });

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

// Tautan Laman Karir asli — pola sama persis dengan getKarirLink() di
// useSebarData.js dan "Salin Tautan" di LowonganDetail(_001).jsx, supaya
// tautan yang ditampilkan di sini benar-benar bisa dibuka & konsisten
// dengan tautan yang sama untuk lowongan yang sama di halaman lain.
export function buildLamanKarirUrl({ companyName, jabatan, kode }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (kode) {
    return `${origin}/?view=laman-karir&perusahaan=${slugify(companyName || '')}&posisi=${slugify(jabatan || '')}&kode=${encodeURIComponent(kode)}`;
  }
  return `${origin}/?view=laman-karir&jabatan=${encodeURIComponent(jabatan || '')}`;
}

async function invokeBuatLowonganFn(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || 'Gagal menghubungi server AI. Coba lagi.');
  if (data?.error) throw new Error(data.message || 'Terjadi kesalahan saat memproses permintaan.');
  return data;
}

// Susun `deskripsi` (HTML) dari sections + catatan Luna hasil draf AI. Dibuat
// dengan kosakata tag yang sama dengan formatDeskripsiToHtml.js (<p>/<ul><li>
// saja) supaya konsisten dengan `deskripsi` yang ditulis alur "Buat dengan
// Form" dan bisa dirender apa adanya di halaman detail lowongan.
function buildDeskripsiHtml(draft) {
  const parts = [];
  (draft.sections || []).forEach(section => {
    parts.push(`<p><strong>${section.title}</strong></p>`);
    if (section.type === 'list') {
      const items = (section.items || []).map(i => `<li>${i}</li>`).join('');
      parts.push(items ? `<ul>${items}</ul>` : '<p>-</p>');
    } else {
      parts.push(`<p>${section.content || '-'}</p>`);
    }
  });
  if (draft.catatanLuna) {
    parts.push('<p><strong>Catatan dari Luna</strong></p>');
    parts.push(`<p>${draft.catatanLuna}</p>`);
  }
  return parts.join('');
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function useBuatLowonganPanduan(companyId, companyPlan) {
  // 'qa' | 'loading-next' | 'loading-summary' | 'summary' | 'fix-input' |
  // 'loading-fix' | 'publishing' | 'error' | 'published'
  const [step, setStep] = useState('qa');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(TEMPLATE_QUESTION_1);
  const [currentAnswer, setCurrentAnswer] = useState(emptyAnswer);
  const [qaHistory, setQaHistory] = useState([]); // [{ pertanyaan, jawaban }]

  const [draft, setDraft] = useState(null); // bentuk siap-render: { jobTitle, detail, sections, catatanLuna }
  const [draftRawParsed, setDraftRawParsed] = useState(null); // bentuk mentah AI, dipakai ulang saat "Perbaiki"
  const [fixText, setFixText] = useState('');
  const [publishedSeleksiId, setPublishedSeleksiId] = useState(null);
  const [publishedKode, setPublishedKode] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const retryRef = useRef(null);
  const fallbackStepRef = useRef('qa');

  const hasAnswer = currentAnswer.selected.length > 0 || currentAnswer.text.trim().length > 0;

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
  const setText = (val) => setCurrentAnswer(prev => ({ ...prev, text: val }));

  // Jalankan satu aksi async (manggil Edge Function AI atau nulis ke DB),
  // dengan step loading + error + retry yang seragam. `action` dieksekusi
  // ulang persis sama kalau user klik "Coba Lagi" (closure-nya sudah
  // membawa data yang mau dikirim).
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

  const nextQuestion = () => {
    if (!hasAnswer || step === 'loading-next' || step === 'loading-summary') return;
    const jawaban = answerToText(currentQuestion, currentAnswer);
    const nextHistory = [...qaHistory, { pertanyaan: currentQuestion.q, jawaban }];

    if (questionNumber >= TOTAL_QUESTIONS) {
      runStep({
        loadingStep: 'loading-summary',
        fallbackStep: 'qa',
        action: async () => {
          const result = await invokeBuatLowonganFn('buat-lowongan-draft', { history: nextHistory });
          setQaHistory(nextHistory);
          setDraft(result.draft);
          setDraftRawParsed(result.rawParsed);
          setStep('summary');
        },
      });
      return;
    }

    runStep({
      loadingStep: 'loading-next',
      fallbackStep: 'qa',
      action: async () => {
        const result = await invokeBuatLowonganFn('buat-lowongan-tanya', {
          history: nextHistory,
          questionNumber: questionNumber + 1,
          totalQuestions: TOTAL_QUESTIONS,
        });
        setQaHistory(nextHistory);
        setCurrentQuestion(result.question);
        setCurrentAnswer(emptyAnswer());
        setQuestionNumber(n => n + 1);
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
    setFixText('');
    setErrorMessage('');
    setPublishedSeleksiId(null);
    setPublishedKode(null);
    setStep('qa');
  };

  // "Perbaiki" tetap 2 langkah: buka layar isian dulu (fix-input), baru
  // regenerate beneran jalan setelah user submit teksnya.
  const openFixInput = () => setStep('fix-input');
  const closeFixInput = () => setStep('summary');

  const regenerate = (text) => {
    runStep({
      loadingStep: 'loading-fix',
      fallbackStep: 'summary',
      action: async () => {
        const result = await invokeBuatLowonganFn('buat-lowongan-draft', {
          history: qaHistory,
          previousDraft: draftRawParsed,
          revisionNote: text,
        });
        setDraft(result.draft);
        setDraftRawParsed(result.rawParsed);
        setFixText('');
        setStep('summary');
      },
    });
  };

  // Padanan persis submit() di useBuatLowonganForm.js — insert ke `seleksi`
  // lalu (kalau deskripsi cukup panjang & bukan paket Free) fire-and-forget
  // generate-kriteria. Sumber datanya draf AI, bukan isian form manual.
  const publishDraft = () => {
    if (!draft) return;
    runStep({
      loadingStep: 'publishing',
      fallbackStep: 'summary',
      action: async () => {
        if (!companyId) throw new Error('Data perusahaan tidak ditemukan. Muat ulang halaman dan coba lagi.');

        const isFreePlan = companyPlan === 'free';
        const htmlDeskripsi = buildDeskripsiHtml(draft);
        const plainText = stripHtml(htmlDeskripsi);
        const isSufficientDesc = !isFreePlan && plainText.length >= 300;
        const jumlahRekrut = parseInt(String(draft.detail.jumlahRekrut || '').replace(/[^\d]/g, ''), 10) || null;

        const dataBaru = await createSeleksi(companyId, {
          department_id: null,
          jabatan: draft.jobTitle,
          level_jabatan: draft.detail.levelJabatan,
          lokasi: draft.detail.lokasi,
          status: 'Aktif',
          jumlah_rekrut: jumlahRekrut,
          ikatan_kerja: draft.detail.ikatanKerja,
          upah_min: draft.detail.upah,
          upah_maks: '',
          siklus_upah: '',
          tgl_mulai: null,
          tgl_onboard: null,
          pendidikan: draft.detail.pendidikan,
          pengalaman: draft.detail.pengalaman,
          deskripsi: htmlDeskripsi,
          kode: `LUN-${Math.floor(Math.random() * 10000)}`,
          kriteria: isSufficientDesc ? [{ _isGenerating: true }] : [],
        });
        invalidate('seleksi');

        if (isSufficientDesc) {
          supabase.functions.invoke('generate-kriteria', {
            body: { seleksiId: dataBaru.id, deskripsi: htmlDeskripsi },
          }).catch(err => console.error('Gagal memanggil generate-kriteria:', err));
        }

        setPublishedSeleksiId(dataBaru.id);
        setPublishedKode(dataBaru.kode);
        setStep('published');
      },
    });
  };

  const retryLastAction = () => retryRef.current?.();
  const goBackFromError = () => setStep(fallbackStepRef.current);

  return {
    step, questionNumber, totalQuestions: TOTAL_QUESTIONS,
    currentQuestion, currentAnswer, hasAnswer, qaHistory,
    draft, publishedSeleksiId, publishedKode, errorMessage,
    fixText, setFixText,
    toggleOption, setText, nextQuestion, restart,
    openFixInput, closeFixInput, regenerate, publishDraft,
    retryLastAction, goBackFromError,
  };
}
