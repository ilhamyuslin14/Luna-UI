// ── generateBuatLowonganDraftOpenAI.js ──────────────────────────────────────
// Setara generateBuatLowonganDraft.js (Gemini), tapi lewat OpenAI Responses
// API. Field-field draf identik dengan versi Gemini. Fungsi ini juga dipakai
// untuk tombol "Perbaiki" — kirim `previousDraft` + `revisionNote`.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { isOpenAIReasoningModel } from './openaiModelHelpers';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const OPENAI_DRAFT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    judul_pekerjaan: { type: 'string', description: 'Judul posisi/jabatan yang direkrut' },
    level_jabatan: { type: 'string', description: "Level posisi, mis. 'Staff/Junior', 'Supervisor'" },
    ikatan_kerja: { type: 'string', description: "Jenis ikatan kerja, mis. 'Waktu Tertentu', 'Waktu Tidak Tertentu', 'Paruh Waktu'" },
    lokasi: { type: 'string', description: 'Lokasi/kota tempat bekerja, diekstrak dari jawaban' },
    jumlah_rekrut: { type: 'string', description: 'Jumlah orang yang mau direkrut, diekstrak dari jawaban' },
    upah: { type: 'string', description: 'Ringkasan upah/gaji yang ditawarkan, diekstrak dari jawaban' },
    pendidikan_minimal: { type: 'string', description: 'Pendidikan minimal yang disyaratkan' },
    pengalaman_minimal: { type: 'string', description: 'Pengalaman minimal yang disyaratkan' },
    tentang_peran: { type: 'string', description: 'Paragraf singkat menjelaskan gambaran umum peran ini' },
    tanggung_jawab: { type: 'array', items: { type: 'string' }, description: 'Daftar poin tanggung jawab sehari-hari' },
    kualifikasi: { type: 'array', items: { type: 'string' }, description: 'Daftar poin kualifikasi/kriteria kandidat' },
    nilai_tambah: { type: 'array', items: { type: 'string' }, description: 'Daftar poin nilai tambah (nice-to-have), array kosong jika tidak ada' },
    catatan_luna: {
      type: 'string',
      description: 'Satu tips praktis dan singkat untuk pemilik usaha terkait posisi ini — gaya hangat seperti rekruter senior berbagi insight (mis. hal yang sering ditanyakan pelamar untuk jenis peran ini, atau cara menaikkan jumlah pelamar). Jangan mengulang isi draf, ini catatan tambahan di luar draf.',
    },
  },
  required: [
    'judul_pekerjaan', 'level_jabatan', 'ikatan_kerja', 'lokasi', 'jumlah_rekrut', 'upah',
    'pendidikan_minimal', 'pengalaman_minimal', 'tentang_peran', 'tanggung_jawab', 'kualifikasi', 'nilai_tambah',
    'catatan_luna',
  ],
  additionalProperties: false,
};

const DEFAULT_PROMPT = `Berdasarkan seluruh riwayat jawaban pengguna atas pertanyaan panduan, susun draf lowongan pekerjaan yang lengkap dan rapi: judul posisi, detail (level jabatan, ikatan kerja, lokasi, jumlah rekrut, upah, pendidikan minimal, pengalaman minimal), deskripsi peran, tanggung jawab, kualifikasi, dan nilai tambah (dalam bentuk poin-poin). Tulis dengan bahasa Indonesia yang sederhana dan jujur, sesuai jawaban yang diberikan — jangan mengarang detail yang tidak disebutkan. Sertakan juga satu "catatan dari Luna": tips praktis dan singkat terkait posisi ini, berdasarkan pola umum perekrutan untuk peran sejenis.`;

function serializeHistory(history) {
  if (!history?.length) return '(belum ada jawaban)';
  return history
    .map((h, i) => `Pertanyaan ${i + 1}: ${h.pertanyaan}\nJawaban: ${h.jawaban?.trim() || '(tidak dijawab)'}`)
    .join('\n\n');
}

function normalizeDraft(parsed) {
  const jobTitle = String(parsed.judul_pekerjaan || '').trim();
  if (!jobTitle) throw new Error('AI tidak mengembalikan judul lowongan yang valid. Coba lagi.');

  return {
    jobTitle,
    detail: {
      levelJabatan: String(parsed.level_jabatan || '').trim(),
      ikatanKerja: String(parsed.ikatan_kerja || '').trim(),
      lokasi: String(parsed.lokasi || '').trim(),
      jumlahRekrut: String(parsed.jumlah_rekrut || '').trim(),
      upah: String(parsed.upah || '').trim(),
      pendidikan: String(parsed.pendidikan_minimal || '').trim(),
      pengalaman: String(parsed.pengalaman_minimal || '').trim(),
    },
    sections: [
      { title: 'Tentang Peran', type: 'text', content: String(parsed.tentang_peran || '').trim() },
      { title: 'Tanggung Jawab', type: 'list', items: Array.isArray(parsed.tanggung_jawab) ? parsed.tanggung_jawab.map(s => String(s).trim()).filter(Boolean) : [] },
      { title: 'Kualifikasi', type: 'list', items: Array.isArray(parsed.kualifikasi) ? parsed.kualifikasi.map(s => String(s).trim()).filter(Boolean) : [] },
      { title: 'Nilai Tambah', type: 'list', items: Array.isArray(parsed.nilai_tambah) ? parsed.nilai_tambah.map(s => String(s).trim()).filter(Boolean) : [] },
    ],
    catatanLuna: String(parsed.catatan_luna || '').trim(),
  };
}

/**
 * Generate (atau revisi) draf lowongan lengkap via OpenAI Responses API.
 */
export async function generateBuatLowonganDraftOpenAI({
  history,
  previousDraft,
  revisionNote,
  apiKey,
  model,
  prompt,
  useFlexMode = false,
  temperature = 0.2,
  reasoningEffort = 'low',
}) {
  if (!history?.length) throw new Error('Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.');
  if (!apiKey) throw new Error('API Key OpenAI belum dikonfigurasi.');
  if (!model) throw new Error('Model AI (OpenAI) belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;
  const historyText = serializeHistory(history);
  const userText = previousDraft
    ? `Riwayat tanya-jawab lengkap:\n${historyText}\n\nDraf sebelumnya (JSON):\n${JSON.stringify(previousDraft)}\n\nInstruksi perbaikan dari pengguna:\n${revisionNote?.trim() || '(tidak ada catatan spesifik)'}\n\nPerbaiki draf di atas sesuai instruksi ini. Tetap konsisten dengan jawaban riwayat, jangan mengubah bagian yang tidak diminta.`
    : `Riwayat tanya-jawab lengkap:\n${historyText}\n\nSusun draf lowongan lengkap berdasarkan seluruh jawaban di atas.`;

  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: [{ role: 'user', content: [{ type: 'input_text', text: userText }] }],
      ...(useFlexMode && { service_tier: 'flex' }),
      ...(isOpenAIReasoningModel(model)
        ? { reasoning: { effort: reasoningEffort || 'low' } }
        : { temperature: Number(temperature) }),
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'buat_lowongan_draft_result',
          strict: true,
          schema: OPENAI_DRAFT_RESPONSE_SCHEMA,
        },
      },
    }),
  });

  const data = await response.json();
  const latency = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI API error (HTTP ${response.status})`);
  }

  const messageItem = (data.output || []).find(o => o.type === 'message');
  const textItem = messageItem?.content?.find(c => c.type === 'output_text');
  const contentText = textItem?.text;
  if (!contentText) throw new Error('Respon AI kosong. Coba lagi.');

  let rawJson = contentText.trim();
  if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    throw new Error('Gagal membaca format JSON dari AI. Coba lagi.');
  }

  if (data.usage) {
    const usage = data.usage;
    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Buat Lowongan - Susun Draf',
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      latency_ms: latency,
      input_text: userText.substring(0, 5000),
      output_json: parsed,
      is_flex_mode: useFlexMode,
    }]).then(({ error }) => {
      if (error) console.error('Gagal mencatat riwayat AI:', error.message);
    });
  }

  return { draft: normalizeDraft(parsed), rawParsed: parsed, rawJson: contentText };
}
