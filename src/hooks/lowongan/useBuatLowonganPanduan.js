import { useState } from 'react';

export const QUESTIONS = [
  {
    q: 'Untuk posisi apa lowongan ini akan dibuka?',
    options: null,
    placeholder: 'Contoh: UI/UX Designer, Backend Engineer, Sales Executive...',
  },
  {
    q: 'Berapa tahun pengalaman minimal yang dibutuhkan?',
    options: ['Fresh Graduate', '1–3 Tahun', '3–5 Tahun', '5+ Tahun'],
    multi: false,
    placeholder: 'Kriteria pengalaman lain...',
  },
  {
    q: 'Apa 3 tanggung jawab utama posisi ini sehari-hari?',
    options: ['Merancang wireframe & prototype', 'Riset & usability testing', 'Kolaborasi dengan tim Produk/Engineering', 'Membangun & menjaga design system', 'Presentasi desain ke stakeholder'],
    multi: true,
    placeholder: 'Tanggung jawab lain...',
  },
  {
    q: 'Skill atau keahlian apa yang wajib dimiliki kandidat?',
    options: ['Figma', 'Design System', 'Riset Pengguna', 'Prototyping', 'Motion Design'],
    multi: true,
    placeholder: 'Skill lain yang wajib...',
  },
  {
    q: 'Bagaimana pola kerja untuk posisi ini?',
    options: ['Work From Office', 'Hybrid', 'Remote Penuh'],
    multi: false,
    placeholder: 'Pola kerja lainnya...',
  },
  {
    q: 'Ada nilai tambah (nice-to-have) yang ingin disebutkan?',
    options: ['Pengalaman di industri SaaS', 'Pengalaman di startup', 'Portofolio motion design', 'Sertifikasi/pengalaman UX Research'],
    multi: true,
    placeholder: 'Nilai tambah lain...',
  },
];

// Dummy — belum tersambung ke AI beneran, hasil generate selalu sama
// terlepas dari jawaban user (lihat catatan di percakapan: fase ini masih mockup).
export const GENERATED_RESULT = {
  jobTitle: 'UI/UX Designer',
  meta: ['Produk', 'Hybrid', '1–3 Tahun Pengalaman'],
  sections: [
    {
      title: 'Tentang Peran',
      type: 'text',
      content: 'Kami mencari UI/UX Designer yang akan bertanggung jawab merancang pengalaman produk yang intuitif untuk platform rekrutmen kami. Anda akan bekerja erat dengan tim Produk dan Engineering untuk menerjemahkan kebutuhan pengguna menjadi desain yang fungsional dan estetis.',
    },
    {
      title: 'Tanggung Jawab',
      type: 'list',
      items: [
        'Merancang wireframe, prototype, dan UI final untuk fitur-fitur baru',
        'Melakukan riset pengguna dan usability testing secara berkala',
        'Berkolaborasi dengan tim Produk untuk menentukan prioritas desain',
      ],
    },
    {
      title: 'Kualifikasi',
      type: 'list',
      items: [
        'Minimal 1–3 tahun pengalaman sebagai UI/UX Designer',
        'Mahir menggunakan Figma dan familiar dengan design system',
        'Punya portofolio yang menunjukkan proses desain end-to-end',
      ],
    },
    {
      title: 'Nilai Tambah',
      type: 'text',
      content: 'Pengalaman di industri SaaS atau HR-Tech, serta pemahaman dasar tentang motion design.',
    },
  ],
};

const emptyAnswers = () => new Array(QUESTIONS.length).fill(null).map(() => ({ selected: [], text: '' }));

export default function useBuatLowonganPanduan() {
  const [step, setStep] = useState('qa'); // 'qa' | 'loading-next' | 'loading-summary' | 'summary'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);

  const total = QUESTIONS.length;
  const data = QUESTIONS[currentQ];
  const current = answers[currentQ];
  const hasAnswer = current.selected.length > 0 || current.text.trim().length > 0;

  const toggleOption = (i) => {
    setAnswers(prev => {
      const next = [...prev];
      const entry = next[currentQ];
      let selected = entry.selected.slice();
      if (data.multi) {
        selected = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
      } else {
        selected = selected.includes(i) ? [] : [i];
      }
      next[currentQ] = { ...entry, selected };
      return next;
    });
  };

  const setText = (val) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], text: val };
      return next;
    });
  };

  const prevQuestion = () => {
    if (currentQ === 0) return;
    setCurrentQ(q => q - 1);
  };

  const nextQuestion = () => {
    if (!hasAnswer) return;
    if (currentQ === total - 1) {
      setStep('loading-summary');
      setTimeout(() => setStep('summary'), 900);
      return;
    }
    setStep('loading-next');
    setTimeout(() => {
      setCurrentQ(q => q + 1);
      setStep('qa');
    }, 700);
  };

  const restart = () => {
    setAnswers(emptyAnswers());
    setCurrentQ(0);
    setStep('qa');
  };

  const regenerate = () => {
    setStep('loading-summary');
    setTimeout(() => setStep('summary'), 700);
  };

  return {
    step, currentQ, total, data, current, hasAnswer,
    toggleOption, setText, prevQuestion, nextQuestion, restart, regenerate,
  };
}
