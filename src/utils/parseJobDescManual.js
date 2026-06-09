// ── parseJobDescManual.js ─────────────────────────────────────────────────────
// Parsing Job Description teks mentah → object form kriteria penilaian.
// Dirancang sebagai shared utility: bisa dipakai di Sandbox maupun halaman
// produksi tanpa modifikasi.
//
// Usage:
//   import { parseJobDescManual } from '../../utils/parseJobDescManual';
//   const result = parseJobDescManual(rawText);
//   setForm(prev => ({ ...prev, ...result }));
//
// Catatan:
//   - Field yang tidak ditemukan dikembalikan '' (tidak menimpa nilai existing)
//   - upahMin / upahMax dikembalikan sebagai string angka murni (tanpa format Rp)
//     → format Rupiah tetap dihandle di komponen agar konsisten dengan flow AI parse
// ─────────────────────────────────────────────────────────────────────────────

// ── Text Normalization ────────────────────────────────────────────────────────

/**
 * Normalisasi teks mentah hasil ekstraksi PDF/DOCX sebelum di-parse.
 * Menangani artefak umum ekstraksi: emoji, spasi ganda sebagai line-break,
 * bullet chars non-standar, dan orphaned bullet markers.
 *
 * Juga di-export agar bisa dipakai di komponen untuk normalize tampilan
 * raw text box sebelum ditampilkan ke user.
 */
export function normalizeRawText(text) {
  if (!text) return '';

  return text
    // 1. Hapus emoji dan simbol dekoratif Unicode
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '')
    // 2. Hapus Unicode replacement char (U+FFFD) — artefak ligature font PDF yang gagal di-decode
    //    Contoh: "teliti" → "teli�", "cuti" → "cu�"
    //    Kata jadi sedikit terpotong, tapi jauh lebih bersih dari menampilkan karakter aneh
    .replace(/�/g, '')
    // 3. Fix broken hyphenated words: "e- signature" / "e - signature" → "e-signature"
    //    Terjadi saat PDF memformat kata majemuk dengan spasi di sekitar tanda hubung
    .replace(/(\w)\s*-\s+(\w)/g, '$1-$2')
    // 4. Fix spasi sebelum tanda baca: "interview ," → "interview,"
    .replace(/\s+([,.:;!?])/g, '$1')
    // 5. Normalize semua varian bullet ke •
    .replace(/[●▪▸►◆◇■□▶◉➤→]/g, '•')
    // 6. 2+ spasi/tab → newline (artefak PDF satu baris panjang)
    .replace(/[ \t]{2,}/g, '\n')
    // 7. Trim per baris, buang baris kosong
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    // 8. Pindah trailing bullet ke awal baris berikutnya: "tahunan.•" → "tahunan." + "•"
    //    dan rejoin orphaned "•" dengan baris setelahnya
    .reduce((acc, line) => {
      if (line.endsWith('•')) {
        acc.push(line.slice(0, -1).trim()); // buang trailing bullet
        acc.push('•');                       // orphan bullet, akan digabung iterasi berikutnya
      } else if (acc.length > 0 && acc[acc.length - 1] === '•') {
        acc[acc.length - 1] = `• ${line}`;
      } else {
        acc.push(line);
      }
      return acc;
    }, [])
    // 9. Buang baris kosong yang tersisa akibat trailing bullet removal
    .filter(l => l.length > 0)
    // 10. Normalize prefix bullet: "•Teks" → "• Teks"
    .map(l => l.replace(/^•\s*/, '• '))
    .join('\n')
    // 11. Max 2 newline berturut-turut
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function firstCapture(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim().split('\n')[0].trim();
      if (result) return result;
    }
  }
  return '';
}

// ── Per-field parsers ─────────────────────────────────────────────────────────

function parseNamaJabatan(text) {
  const trimFiller = (s) => s.replace(/\s+(?:yang\b|untuk\b|dengan\b|dan\b|the\b|a\b|an\b).*/i, '').trim();
  const lines = text.split('\n').map(l => l.trim());

  // Pattern 1: "Nama Posisi" / "Nama Jabatan" sebagai label standalone → ambil baris berikutnya
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^nama\s+(?:posisi|jabatan)$/i.test(lines[i])) {
      const next = lines[i + 1];
      if (next && next.length > 2 && next.length < 100) return next;
    }
  }

  // Pattern 2: "Posisi: X" / "Jabatan: X" pada baris yang sama
  const sameLineMatch = firstCapture(text, [
    /(?:posisi|jabatan|position|role|title|lowongan|vacancy|dibutuhkan)\s*:\s*(.+)/i,
    /(?:rekrutmen untuk|rekrutmen)\s*[:\-]\s*(.+)/i,
  ]);
  if (sameLineMatch) {
    const clean = trimFiller(sameLineMatch);
    if (clean.length <= 100) return clean;
  }

  // Pattern 3: "Kami sedang mencari..." — hanya cari di 10 baris pertama
  // Sengaja dibatasi agar tidak match "Mencari klien" di bagian Tanggung Jawab
  const earlyText = lines.slice(0, 10).join('\n');
  const hiringMatch = firstCapture(earlyText, [
    /(?:kami\s+(?:sedang\s+)?mencari|we are looking for|we.re hiring)\s+(?:seorang?\s+)?(.+)/i,
  ]);
  if (hiringMatch) {
    const clean = trimFiller(hiringMatch);
    if (clean.length <= 100) return clean;
  }

  // Fallback: baris pertama yang sesuai (skip baris yang terlihat seperti label/header)
  const candidates = lines.filter(l => l.length > 3 && l.length < 80 && /[a-zA-Z]/.test(l) && !/^nama\s+/i.test(l) && !l.endsWith(':'));
  return candidates[0] || '';
}

function parseDepartemen() {
  // Deteksi departemen dinonaktifkan — terlalu error-prone dan user prefer isi manual
  return '';
}

function parseLokasi(text) {
  const result = firstCapture(text, [
    /(?:lokasi|penempatan|location|wilayah|domisili|area)\s*[:\-]\s*(.+)/i,
    /(?:berkedudukan di|berdomisili di|berlokasi di|ditempatkan di)\s+(.+)/i,
    /(?:work location|office location)\s*[:\-]\s*(.+)/i,
  ]);

  if (result) {
    // Ambil sebelum em-dash atau tanda kurung (biasanya trailing keterangan seperti "(Hybrid)")
    const cleaned = result.split(/\s*[—–(]/)[0].trim();
    return cleaned.substring(0, 80);
  }

  // Fallback: deteksi nama kota umum di Indonesia
  const cities = [
    'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat',
    'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Denpasar',
    'Bali', 'Makassar', 'Palembang', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Malang',
    'Batam', 'Pekanbaru', 'Balikpapan', 'Samarinda', 'Manado', 'Pontianak', 'Banjarmasin',
  ];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }

  return '';
}

function parseStatusRekrutmen(text) {
  const lower = text.toLowerCase();
  // Pakai word boundary / frasa spesifik untuk hindari false positive seperti "memprioritaskan"
  if (/\bsegera\b|\burgent\b|immediately|\basap\b|secepatnya|\bmendesak\b|dibutuhkan segera/.test(lower)) return 'Aktif';
  return 'Rencana';
}

function parseJumlahRekrut(text) {
  const result = firstCapture(text, [
    /(?:jumlah|dibutuhkan|membutuhkan|dicari|require)\s*[:\-]?\s*(\d+)\s*(?:orang|posisi|kandidat|person|people)/i,
    /(\d+)\s*(?:orang|posisi)\s*(?:yang )?(?:dibutuhkan|dicari|diperlukan)/i,
    /(\d+)\s*(?:vacancy|vacancies|opening|openings)/i,
    /sebanyak\s*(\d+)\s*(?:orang|posisi)/i,
  ]);
  return result || '1';
}

function parseIkatanKerja(text) {
  const lower = text.toLowerCase();

  // Urutan: yang paling niche/spesifik dulu
  if (/\bmagang\b|internship|\bintern\b/.test(lower)) return 'Magang';
  if (/part.?time|paruh waktu/.test(lower)) return 'Part Time';
  if (/\bfreelance\b|tenaga lepas/.test(lower)) return 'Freelance';
  if (/temporer|temporary|\bsementara\b/.test(lower)) return 'Temporer';
  // "kontrak" saja terlalu luas (bisa "dokumen kontrak") — butuh konteks lebih spesifik
  if (/\bpkwt\b|\bkontrak\s+(?:kerja|terbatas)\b|(?:tipe|jenis|status)\s*:?\s*kontrak|\bcontract\b/.test(lower)) return 'Waktu Tertentu';
  if (/\bpkwtt\b|\btetap\b|\bpermanen\b|permanent|full.?time/.test(lower)) return 'Waktu Tidak Tertentu';

  return '';
}

function parseUpah(text) {
  // Normalisasi: hapus titik ribuan dulu agar tidak ganggu regex
  const clean = text.replace(/Rp\.?\s*/gi, 'Rp ');

  // Range: Rp X – Rp Y
  const rangeRp = clean.match(/Rp\s*([\d.,]+)\s*[-–]\s*Rp\s*([\d.,]+)/i);
  if (rangeRp) {
    return {
      min: rangeRp[1].replace(/[.,]/g, '').replace(/000000$/, '000000'),
      max: rangeRp[2].replace(/[.,]/g, '').replace(/000000$/, '000000'),
    };
  }

  // Range: X juta – Y juta
  const rangeJuta = text.match(/(\d+(?:[.,]\d+)?)\s*juta\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*juta/i);
  if (rangeJuta) {
    return {
      min: String(Math.round(parseFloat(rangeJuta[1].replace(',', '.')) * 1_000_000)),
      max: String(Math.round(parseFloat(rangeJuta[2].replace(',', '.')) * 1_000_000)),
    };
  }

  // Single Rp
  const singleRp = clean.match(/Rp\s*([\d.,]+)/i);
  if (singleRp) {
    return { min: singleRp[1].replace(/[.,]/g, ''), max: '' };
  }

  // Single X juta
  const singleJuta = text.match(/(\d+(?:[.,]\d+)?)\s*juta/i);
  if (singleJuta) {
    return {
      min: String(Math.round(parseFloat(singleJuta[1].replace(',', '.')) * 1_000_000)),
      max: '',
    };
  }

  return { min: '', max: '' };
}

function parseSiklusUpah(text) {
  // Hanya cek siklus pada baris yang mengandung nominal Rp
  // Ini mencegah false positive dari kalimat lain yang kebetulan ada "per tahun",
  // misalnya "Learning budget Rp 10jt per tahun" yang bukan siklus gaji
  const lines = text.split('\n');
  for (const line of lines) {
    if (!/\bRp\b/i.test(line)) continue;
    const lower = line.toLowerCase();
    if (/\/bulan|per bulan|\bbulan\b|bulanan|monthly/.test(lower)) return 'Bulanan';
    if (/\/tahun|per tahun|\btahun\b|tahunan|annual|yearly/.test(lower)) return 'Tahunan';
    if (/\/minggu|per minggu|mingguan|weekly/.test(lower)) return 'Mingguan';
    if (/\/hari|per hari|harian|daily/.test(lower)) return 'Harian';
    if (/\/jam|per jam|hourly/.test(lower)) return 'Jam';
    if (/\/kwartal|per kwartal|quarterly/.test(lower)) return 'Kwartal';
  }
  return 'Bulanan';
}

function parsePendidikan(text) {
  const lower = text.toLowerCase();

  if (/\bs3\b|doktor|doctorate|\bphd\b|ph\.d/.test(lower)) return 'S3 (Doktor)';
  // "master" sengaja dihapus — terlalu luas (bisa "master data", "master class")
  if (/\bs2\b|\bmagister\b|\bpascasarjana\b|post.?grad/.test(lower)) return 'S2 (Magister)';
  if (/\bs1\b|\bd4\b|sarjana|bachelor|strata.?1/.test(lower)) return 'D4/S1 (Sarjana)';
  if (/\bd3\b|\bd2\b|\bd1\b|\bdiploma\b/.test(lower)) return 'DI/DII/DIII (Diploma)';
  if (/\bsma\b|\bsmk\b|sederajat|sma\/smk/.test(lower)) return 'SMA/SMK/Sederajat';
  if (/\bsmp\b/.test(lower)) return 'SMP/Sederajat';
  if (/\bsd\b/.test(lower)) return 'SD/Sederajat';

  return '';
}

function parsePengalaman(text) {
  // Pola kontekstual: "pengalaman X tahun" atau "min X tahun"
  const contextual = text.match(
    /(?:pengalaman|experience|min\.?|minimal|minimum|at least)\s*(?:kerja|work|bekerja|selama)?\s*(\d+)\s*[-–+]?\s*(?:tahun|year|thn)/i
  );
  if (contextual) return contextual[1];

  // Pola terbalik: "X tahun pengalaman"
  const reversed = text.match(/(\d+)\s*(?:tahun|year|thn)\s*(?:pengalaman|experience)/i);
  if (reversed) return reversed[1];

  return '';
}

// ── Deskripsi → Plain Text ────────────────────────────────────────────────────
// Output plain text (bukan HTML) agar textarea menampilkan konten yang bersih.
// Bullet • digunakan untuk list items. HTML conversion ke <ul>/<li> dilakukan
// di layer render jika diperlukan (produksi), bukan di sini.

const SKIP_SECTIONS = [
  'tentang perusahaan', 'about the company', 'about us', 'company overview', 'company profile',
  'informasi posisi', 'job information', 'detail posisi', 'position information',
  'cara melamar', 'how to apply', 'application process', 'proses seleksi', 'proses rekrutmen',
];

const LIST_SECTIONS = [
  'tugas', 'tanggung jawab', 'responsibilities', 'kualifikasi',
  'qualification', 'requirements', 'persyaratan', 'nilai tambah', 'nilai plus',
  'nice to have', 'preferred', 'benefit', 'fasilitas', 'perks', 'what we offer',
  'kamu lakuin', 'kamu cari', 'kamu dapetin', 'yang kami cari',
  'target kpi', 'kpi', 'hard skills', 'soft skills', 'tools',
];

const START_SECTIONS = [
  'deskripsi pekerjaan', 'job description', 'about the role', 'about this role',
  'tentang peran', 'tentang posisi', 'tentang lowongan', 'tentang role',
  'ringkasan posisi', 'ringkasan', 'summary', 'overview',
];

// Kata-kata section yang berdiri sendiri (pendek, tidak selalu ALL CAPS atau berakhir ":")
// Contoh: "Tanggung Jawab", "Kualifikasi", "Benefit"
const STANDALONE_HEADERS = [
  'tanggung jawab', 'kualifikasi', 'persyaratan', 'benefit', 'fasilitas',
  'tentang peran', 'tentang posisi', 'tentang role', 'deskripsi',
  'responsibilities', 'requirements', 'about the role', 'qualifications',
  'perks', 'what we offer',
  // Section kualifikasi detail
  'target kpi', 'kpi', 'hard skills', 'soft skills', 'tools yang digunakan',
  'pengalaman kerja', 'pendidikan terakhir', 'sertifikasi', 'serfikasi',
  'ringkasan posisi', 'ringkasan',
  // Skip-able sections — perlu dideteksi sebagai header agar bisa di-skip
  'cara melamar', 'how to apply', 'tentang perusahaan', 'about the company',
  'informasi posisi', 'about us',
];

function isSectionHeader(line) {
  if (!line || line.length > 100) return false;
  // Bullet lines BUKAN section header meskipun berakhir ":"
  if (line.startsWith('•')) return false;
  // Formal: ALL CAPS ("DESKRIPSI PEKERJAAN", "KUALIFIKASI")
  if (line === line.toUpperCase() && /[A-Z]{2,}/.test(line)) return true;
  // Informal dengan titik dua ("Tentang Peran Ini:", "Kualifikasi yang Kami Cari:")
  if (line.trimEnd().endsWith(':') && line.length <= 100) return true;
  // Standalone keyword — baris pendek yang persis atau diawali kata section dikenal
  if (line.length <= 60) {
    const lower = line.toLowerCase();
    if (STANDALONE_HEADERS.some(h => lower === h || lower.startsWith(h + ' ') || lower.endsWith(' ' + h))) return true;
  }
  return false;
}

function matchesKeywords(line, keywords) {
  const lower = line.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function parseDeskripsi(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Cari titik awal: lewati pembuka company intro jika ada
  // Kalau tidak ditemukan, startIdx = 0 → pakai seluruh teks (aman untuk dokumen informal)
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (isSectionHeader(lines[i]) && matchesKeywords(lines[i], START_SECTIONS)) {
      startIdx = i;
      break;
    }
  }

  const result = [];
  let isListSection = false;
  let isSkipped = false;
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];

    if (isSectionHeader(line)) {
      isSkipped = matchesKeywords(line, SKIP_SECTIONS);
      isListSection = matchesKeywords(line, LIST_SECTIONS);

      if (!isSkipped) {
        if (result.length > 0) result.push('');
        result.push(line);
      }
      i++;
      continue;
    }

    if (isSkipped) { i++; continue; }

    const hasBullet = line.startsWith('•');

    if (hasBullet) {
      // Kumpulkan baris lanjutan sampai bullet berikutnya atau section header
      // Ini menangani kasus PDF di mana kata-kata bold ter-split jadi baris terpisah
      let content = line.substring(2).trim();
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (!next || next.startsWith('•') || isSectionHeader(next)) break;
        content += ' ' + next;
        i++;
      }
      result.push(`• ${content}`);
    } else if (isListSection) {
      // List section tanpa bullet eksplisit: setiap baris = item tersendiri (tidak digabung)
      result.push(`• ${line}`);
    } else {
      // Paragraf biasa: kumpulkan baris lanjutan
      let content = line;
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (!next || next.startsWith('•') || isSectionHeader(next)) break;
        content += ' ' + next;
        i++;
      }
      result.push(content);
    }

    i++;
  }

  return result
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parse teks mentah Job Description menjadi object yang kompatibel
 * dengan form state di Seleksi-SetupPenilaian / Sandbox-Kriteria.
 *
 * Field yang tidak ditemukan dikembalikan '' agar tidak menimpa
 * nilai existing di form.
 *
 * upahMin / upahMax: string angka murni tanpa format → format Rupiah
 * dilakukan di komponen (konsisten dengan flow AI parse).
 */
export function parseJobDescManual(rawText) {
  if (!rawText || !rawText.trim()) return {};

  // Normalize dulu sebelum di-parse agar semua parsers dapat input yang konsisten
  const text = normalizeRawText(rawText);
  const upah = parseUpah(text);

  return {
    namaJabatan:     parseNamaJabatan(text),
    departemen:      parseDepartemen(text),
    lokasi:          parseLokasi(text),
    statusRekrutmen: parseStatusRekrutmen(text),
    jumlahRekrut:    parseJumlahRekrut(text),
    ikatanKerja:     parseIkatanKerja(text),
    upahMin:         upah.min,
    upahMax:         upah.max,
    // Siklus hanya di-parse jika ada nominal gaji ditemukan
    siklusUpah:      (upah.min || upah.max) ? parseSiklusUpah(text) : '',
    tglMulai:        '',
    tglOnboarding:   '',
    pendidikan:      parsePendidikan(text),
    pengalaman:      parsePengalaman(text),
    deskripsi:       parseDeskripsi(text),
  };
}
