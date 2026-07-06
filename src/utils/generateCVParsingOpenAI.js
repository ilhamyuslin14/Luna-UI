import { createClient } from '@supabase/supabase-js';
import { isOpenAIReasoningModel } from './openaiModelHelpers';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

// Skema yang sama persis dengan generateCVParsing.js (Gemini), tapi ditulis ulang
// dalam format JSON Schema standar (huruf kecil, nullable via union type, dan
// additionalProperties:false + required lengkap di semua level) — wajib untuk
// mode "strict" Structured Outputs milik OpenAI. Identik dengan skema di
// supabase/functions/parse-cv/index.ts (callOpenAIForParsing).
const OAI_STRING = { type: 'string' };
const OAI_STRING_N = { type: ['string', 'null'] };
const OAI_INTEGER_N = { type: ['integer', 'null'] };

const OAI_DETAIL_KANDIDAT = {
  type: 'object',
  properties: {
    nama_lengkap: OAI_STRING_N,
    linkedin: OAI_STRING_N,
    gender: OAI_STRING_N,
    tanggal_lahir: OAI_STRING_N,
    domisili: OAI_STRING_N,
    email: OAI_STRING_N,
    no_telpon: OAI_STRING_N,
    jurusan: OAI_STRING_N,
    universitas: OAI_STRING_N,
    perusahaan_saat_ini: OAI_STRING_N,
    jabatan_saat_ini: OAI_STRING_N,
  },
  required: ['nama_lengkap', 'linkedin', 'gender', 'tanggal_lahir', 'domisili', 'email', 'no_telpon', 'jurusan', 'universitas', 'perusahaan_saat_ini', 'jabatan_saat_ini'],
  additionalProperties: false,
};

const OAI_DETAIL_TAMBAHAN = {
  type: 'object',
  properties: {
    bidang_industri: OAI_STRING_N,
    tahun_terakhir_bekerja: OAI_INTEGER_N,
    harapan_upah: OAI_INTEGER_N,
    harapan_benefit: OAI_STRING_N,
  },
  required: ['bidang_industri', 'tahun_terakhir_bekerja', 'harapan_upah', 'harapan_benefit'],
  additionalProperties: false,
};

const OAI_PENGALAMAN_ITEM = {
  type: 'object',
  properties: {
    jabatan: OAI_STRING,
    perusahaan: OAI_STRING,
    start: OAI_STRING,
    end: OAI_STRING_N,
    deskripsi: { type: 'array', items: OAI_STRING },
  },
  required: ['jabatan', 'perusahaan', 'start', 'end', 'deskripsi'],
  additionalProperties: false,
};

const OAI_PENDIDIKAN_ITEM = {
  type: 'object',
  properties: {
    institusi: OAI_STRING,
    jenjang: OAI_STRING,
    jurusan: OAI_STRING,
    start: OAI_STRING,
    end: OAI_STRING_N,
    gpa: OAI_STRING_N,
  },
  required: ['institusi', 'jenjang', 'jurusan', 'start', 'end', 'gpa'],
  additionalProperties: false,
};

const OAI_SERTIFIKASI_ITEM = {
  type: 'object',
  properties: {
    nama: OAI_STRING,
    penerbit: OAI_STRING_N,
    start: OAI_STRING_N,
    end: OAI_STRING_N,
    deskripsi: { type: 'array', items: OAI_STRING },
  },
  required: ['nama', 'penerbit', 'start', 'end', 'deskripsi'],
  additionalProperties: false,
};

const OPENAI_CV_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    is_valid_cv: { type: 'boolean' },
    reason_not_valid: OAI_STRING_N,
    detail_kandidat: OAI_DETAIL_KANDIDAT,
    detail_tambahan: OAI_DETAIL_TAMBAHAN,
    keahlian: { type: 'array', items: OAI_STRING },
    pengalaman_kerja: { type: 'array', items: OAI_PENGALAMAN_ITEM },
    pendidikan: { type: 'array', items: OAI_PENDIDIKAN_ITEM },
    sertifikasi: { type: 'array', items: OAI_SERTIFIKASI_ITEM },
    ai_signal_insight: OAI_STRING_N,
  },
  required: ['is_valid_cv', 'reason_not_valid', 'detail_kandidat', 'detail_tambahan', 'keahlian', 'pengalaman_kerja', 'pendidikan', 'sertifikasi', 'ai_signal_insight'],
  additionalProperties: false,
};

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateTotalExperience(pengalaman) {
  if (!pengalaman || !Array.isArray(pengalaman)) return 0;

  const parseDate = (dateStr) => {
    if (!dateStr || ['present', 'sekarang', 'saat ini'].includes(dateStr.toLowerCase())) {
      return new Date();
    }
    if (/^\d{4}$/.test(dateStr.trim())) {
      return new Date(parseInt(dateStr.trim(), 10), 0, 1);
    }
    const monthMap = {
      jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2,
      apr: 3, april: 3, mei: 4, may: 4, jun: 5, juni: 5,
      jul: 6, juli: 6, agu: 7, agustus: 7, aug: 7, august: 7,
      sep: 8, september: 8, okt: 9, oktober: 9, oct: 9, october: 9,
      nov: 10, november: 10, des: 11, desember: 11, dec: 11, december: 11,
    };
    const parts = dateStr.trim().toLowerCase().split(/[\s-]+/);
    let month = 0;
    let year = new Date().getFullYear();
    parts.forEach((part) => {
      if (/^\d{4}$/.test(part)) year = parseInt(part, 10);
      else if (monthMap[part] !== undefined) month = monthMap[part];
    });
    return new Date(year, month, 1);
  };

  let totalMonths = 0;
  pengalaman.forEach((job) => {
    if (job.start) {
      const startDate = parseDate(job.start);
      const endDate = parseDate(job.end);
      let diff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      if (diff < 0) diff = 0;
      totalMonths += diff;
    }
  });
  return parseFloat((totalMonths / 12).toFixed(1));
}

/**
 * Setara generateCVParsing.js (Gemini), tapi lewat OpenAI Responses API.
 * Dipakai oleh Sandbox CV Parsing test tool saat provider aktif = OpenAI,
 * supaya tool testing ini benar-benar merefleksikan provider yang dipilih
 * di halaman Konfigurasi (sebelumnya selalu memanggil Gemini apapun provider-nya).
 */
export async function generateCVParsingOpenAI({ cvText, apiKey, model, prompt, useFlexMode = false, temperature = 0.2, reasoningEffort = 'low' }) {
  const plainText = stripHtml(cvText);

  if (!plainText) throw new Error('Teks CV kosong. Unggah atau tempel CV terlebih dahulu.');
  if (!apiKey) throw new Error('API Key OpenAI belum dikonfigurasi.');
  if (!model) throw new Error('Model AI (OpenAI) belum dipilih. Cek tab Konfigurasi API.');

  let systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Extract candidate info into JSON.';
  systemPrompt += '\n\nCRITICAL RULE: Determine if the document is a valid CV/Resume belonging to an individual candidate. A valid CV MUST contain specific personal identity (e.g. name, contact info, personal profile). If the document is a Job Vacancy (Lowongan Pekerjaan), Job Description (which lists job requirements/duties but lacks a specific applicant\'s personal identity), brochure, menu, or random article, it is NOT a valid CV. If it is NOT a valid CV, set is_valid_cv to false, provide the reason in reason_not_valid USING INDONESIAN LANGUAGE (Bahasa Indonesia) IN MAXIMUM 8 WORDS (e.g. "Bukan CV, melainkan deskripsi lowongan pekerjaan"), and leave all other fields empty/null. If it is a valid CV of a person, set is_valid_cv to true and extract the information.';
  systemPrompt += '\n\nIMPORTANT DATE RULE: For ALL date fields (e.g. tanggal_lahir, start, end), always use the ISO format YYYY-MM-DD (e.g. "2001-11-19"). If exact day is unknown, use "YYYY-MM-01". If only year is known, use "YYYY-01-01". However, if an end date (for education, experience, etc.) is explicitly described as "Present", "Sekarang", "Saat ini", or similar, return the exact string "Sekarang". If a date is genuinely missing or not mentioned, return null.';

  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: [{ role: 'user', content: [{ type: 'input_text', text: `Dokumen CV:\n${plainText}` }] }],
      ...(useFlexMode && { service_tier: 'flex' }),
      ...(isOpenAIReasoningModel(model)
        ? { reasoning: { effort: reasoningEffort || 'low' } }
        : { temperature: Number(temperature) }),
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'cv_parsing_result',
          strict: true,
          schema: OPENAI_CV_RESPONSE_SCHEMA,
        },
      },
    }),
  });

  const data = await response.json();
  const endTime = Date.now();
  const latency = endTime - startTime;

  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI API error (HTTP ${response.status})`);
  }

  const messageItem = (data.output || []).find(o => o.type === 'message');
  const textItem = messageItem?.content?.find(c => c.type === 'output_text');
  const contentText = textItem?.text;
  if (!contentText) throw new Error('Respon AI kosong. Coba lagi.');

  try {
    let rawJson = contentText.trim();
    if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    const parsed = JSON.parse(rawJson);

    if (parsed.detail_kandidat && Array.isArray(parsed.pengalaman_kerja)) {
      parsed.detail_kandidat.pengalaman_kerja_tahun = calculateTotalExperience(parsed.pengalaman_kerja);
    }

    if (data.usage) {
      const usage = data.usage;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Generate CV Parsing',
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        total_tokens: usage.total_tokens || 0,
        latency_ms: latency,
        input_text: plainText.substring(0, 5000),
        output_json: parsed,
        is_flex_mode: useFlexMode
      }]).then(({ error }) => {
        if (error) console.error('Gagal mencatat log usage CV Parsing:', error);
      });
    }

    return {
      parsedData: parsed,
      rawJson: JSON.stringify(parsed, null, 2)
    };
  } catch (err) {
    throw new Error('Gagal mem-parsing output JSON dari AI: ' + err.message + '\n\nOutput AI: ' + contentText);
  }
}
