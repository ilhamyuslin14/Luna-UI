import { useState } from 'react';
import { slugify } from '../../utils/slug.js';

// Pertanyaan ke-5 (upah harian) sengaja kondisional — cuma relevan kalau
// jawaban pertanyaan gaji (index 3) "Dihitung harian". `showIf` dievaluasi
// ulang tiap render pakai jawaban terkini, jadi total pertanyaan & nomor
// langkah ("X dari Y") ikut menyesuaikan otomatis kalau pertanyaan ini
// di-skip. Ini masih skema dummy (belum tersambung AI beneran, lihat catatan
// di GENERATED_RESULT) — jadi cabangnya sengaja simpel, cukup 1 titik cabang.
export const QUESTIONS = [
  {
    q: 'Apa yang mau kamu capai dengan merekrut orang ini?',
    options: null,
    placeholder: 'Contoh: meningkatkan penjualan restoran, melakukan pencatatan operasional harian, dll. Gunakan bahasamu sendiri.',
  },
  {
    q: 'Di tempat usahamu, orang ini nanti mengerjakan apa saja?',
    options: ['Menggoreng dan menyiapkan pesanan', 'Melayani pembeli dan menerima uang', 'Belanja bahan dan mengecek stok', 'Bersih-bersih dan beres-beres kios', 'Menerima pesanan dari GoFood, GrabFood, ShopeeFood', 'Lainnya'],
    multi: true,
    placeholder: 'Tugas lain...',
  },
  {
    q: 'Jam kerjanya bagaimana?',
    options: ['Satu shift penuh, dari kios buka sampai tutup', 'Dibagi shift, pagi atau sore', 'Hanya jam ramai saja', 'Belum ditentukan', 'Lainnya'],
    multi: false,
    placeholder: 'Pola jam kerja lainnya...',
  },
  {
    q: 'Berapa gaji yang kamu siapkan untuk posisi ini?',
    options: ['Di bawah Rp 2 juta per bulan', 'Rp 2 sampai 3 juta per bulan', 'Rp 3 sampai 4 juta per bulan', 'Dihitung harian', 'Belum ditentukan', 'Lainnya, tulis angkanya'],
    multi: false,
    placeholder: 'Angka lain...',
  },
  {
    q: 'Berapa upah hariannya?',
    options: ['Di bawah Rp 75 ribu', 'Rp 75 sampai 100 ribu', 'Rp 100 sampai 150 ribu', 'Di atas Rp 150 ribu', 'Lainnya, tulis angkanya'],
    multi: false,
    placeholder: 'Angka lain...',
    showIf: (answers) => QUESTIONS[3].options[answers[3]?.selected?.[0]] === 'Dihitung harian',
  },
  {
    q: 'Kandidat seperti apa yang kamu cari?',
    options: ['Sudah pernah kerja di kios makanan atau warung', 'Belum berpengalaman tidak masalah, asal mau belajar', 'Tinggal dekat lokasi kios', 'Bersedia kerja saat akhir pekan dan hari libur', 'Bebas, yang penting rajin dan jujur', 'Lainnya'],
    multi: true,
    placeholder: 'Kriteria lain...',
  },
  {
    q: 'Usahamu ini di mana lokasinya?',
    options: null,
    subnote: 'Sebutkan nama kotanya.',
    
  },
  {
    q: 'Berapa orang yang mau kamu rekrut?',
    options: ['1 orang', '2 orang', '3 orang', 'Lebih dari 3 orang'],
    multi: false,
    placeholder: 'Jumlah lain...',
  },
];

// Dummy — belum tersambung ke AI beneran. `sections` & `detail` (4 field yang
// tidak ditanyakan di QUESTIONS: Level, Ikatan Kerja, Pendidikan, Pengalaman)
// selalu sama terlepas dari jawaban user. 3 field lain di kartu detail
// (Lokasi, Jumlah Rekrut, Upah) DIISI BENERAN dari jawaban — lihat
// `buildDetailFromAnswers` di bawah, dipakai komponen mobile & desktop.
export const GENERATED_RESULT = {
  jobTitle: 'Karyawan Toko',
  detail: {
    levelJabatan: 'Staff/Junior',
    ikatanKerja: 'Waktu Tertentu',
    pendidikan: 'SMP/Sederajat',
    pengalaman: 'Tidak disyaratkan',
  },
  sections: [
    {
      title: 'Tentang Peran',
      type: 'text',
      content: 'Kami mencari karyawan yang akan membantu operasional harian tempat usaha kami, mulai dari melayani pembeli hingga menjaga kelancaran operasional sehari-hari.',
    },
    {
      title: 'Tanggung Jawab',
      type: 'list',
      items: [
        'Melayani pembeli dan memproses transaksi dengan ramah',
        'Menyiapkan dan mengemas pesanan sesuai standar',
        'Menjaga kebersihan dan kerapian tempat usaha',
      ],
    },
    {
      title: 'Kualifikasi',
      type: 'list',
      items: [
        'Tidak disyaratkan pengalaman kerja sebelumnya, asal mau belajar',
        'Jujur, rajin, dan bertanggung jawab',
        'Bersedia bekerja sesuai jam operasional yang ditentukan',
      ],
    },
    {
      title: 'Nilai Tambah',
      type: 'text',
      content: 'Pernah bekerja di tempat usaha sejenis dan tinggal dekat lokasi jadi nilai tambah, meski bukan syarat wajib.',
    },
  ],
};

// Mengambil 3 field yang MEMANG ditanyakan (Lokasi = pertanyaan index 6,
// Jumlah Rekrut = index 7, Upah = index 3 atau 4 tergantung cabang "Dihitung
// harian") dari jawaban asli user — dipakai bareng oleh kartu detail di
// summary mobile & desktop supaya tidak duplikat logic mapping-nya.
export function buildDetailFromAnswers(answers) {
  const lokasi = answers[6]?.text?.trim() || '-';

  const jumlahOpt = QUESTIONS[7].options[answers[7]?.selected?.[0]];
  const jumlahRekrut = jumlahOpt || '-';

  const gajiAns = answers[3];
  const gajiOpt = QUESTIONS[3].options[gajiAns?.selected?.[0]];
  let upah = '-';
  if (gajiOpt === 'Dihitung harian') {
    const hargaAns = answers[4];
    const hargaOpt = QUESTIONS[4].options[hargaAns?.selected?.[0]];
    if (hargaOpt?.toLowerCase().includes('lainnya')) upah = hargaAns?.text?.trim() || '-';
    else if (hargaOpt) upah = `${hargaOpt} per hari`;
  } else if (gajiOpt?.toLowerCase().includes('lainnya')) {
    upah = gajiAns?.text?.trim() || '-';
  } else if (gajiOpt) {
    upah = gajiOpt;
  }

  return { lokasi, jumlahRekrut, upah };
}

// Mode demo (belum tersambung database) jadi tautan lowongan setelah
// "terbit" juga masih tautan tiruan — dibentuk dari nama posisi dummy yang
// sama, bukan kode acak, supaya tetap terasa masuk akal saat ditampilkan.
export function buildMockPublishedUrl() {
  return `lunasys.id/${slugify(GENERATED_RESULT.jobTitle)}`;
}

const emptyAnswers = () => new Array(QUESTIONS.length).fill(null).map(() => ({ selected: [], text: '' }));

export default function useBuatLowonganPanduan() {
  // 'qa' | 'loading-next' | 'loading-summary' | 'summary' | 'fix-input' |
  // 'loading-fix' | 'published'
  const [step, setStep] = useState('qa');
  const [absoluteIndex, setAbsoluteIndex] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [fixText, setFixText] = useState('');

  // Pertanyaan yang "showIf"-nya gagal dilewati sepenuhnya — total & nomor
  // langkah yang ditampilkan ke user (`currentQ`/`total`) berbasis daftar
  // ini, bukan panjang QUESTIONS mentah.
  const visibleIndices = QUESTIONS.map((_, i) => i).filter(i => !QUESTIONS[i].showIf || QUESTIONS[i].showIf(answers));
  const total = visibleIndices.length;
  const currentQ = Math.max(0, visibleIndices.indexOf(absoluteIndex));

  const data = QUESTIONS[absoluteIndex];
  const current = answers[absoluteIndex];
  const hasAnswer = current.selected.length > 0 || current.text.trim().length > 0;

  const toggleOption = (i) => {
    setAnswers(prev => {
      const next = [...prev];
      const entry = next[absoluteIndex];
      let selected = entry.selected.slice();
      if (data.multi) {
        selected = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
      } else {
        selected = selected.includes(i) ? [] : [i];
      }
      next[absoluteIndex] = { ...entry, selected };
      return next;
    });
  };

  const setText = (val) => {
    setAnswers(prev => {
      const next = [...prev];
      next[absoluteIndex] = { ...next[absoluteIndex], text: val };
      return next;
    });
  };

  const prevQuestion = () => {
    if (currentQ <= 0) return;
    setAbsoluteIndex(visibleIndices[currentQ - 1]);
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
      setAbsoluteIndex(visibleIndices[currentQ + 1]);
      setStep('qa');
    }, 700);
  };

  const restart = () => {
    setAnswers(emptyAnswers());
    setAbsoluteIndex(0);
    setFixText('');
    setStep('qa');
  };

  // "Perbaiki" sekarang 2 langkah: buka layar isian dulu (fix-input), baru
  // regenerate beneran jalan setelah user submit teksnya (bukan langsung
  // regenerate begitu tombol "Perbaiki" ditekan seperti sebelumnya).
  const openFixInput = () => setStep('fix-input');
  const closeFixInput = () => setStep('summary');

  const regenerate = (text) => {
    setFixText(text ?? '');
    setStep('loading-fix');
    setTimeout(() => setStep('summary'), 900);
  };

  const publishDraft = () => setStep('published');

  return {
    step, currentQ, total, data, current, answers, hasAnswer,
    fixText, setFixText,
    toggleOption, setText, prevQuestion, nextQuestion, restart,
    openFixInput, closeFixInput, regenerate, publishDraft,
  };
}
