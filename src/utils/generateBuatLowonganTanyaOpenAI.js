// ── generateBuatLowonganTanyaOpenAI.js ──────────────────────────────────────
// Setara generateBuatLowonganTanya.js (Gemini), tapi lewat OpenAI Responses
// API. Field-field pertanyaan (pertanyaan, catatan, tipe, opsi, multi_pilihan,
// placeholder) identik dengan versi Gemini.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { isOpenAIReasoningModel } from './openaiModelHelpers';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const OPENAI_TANYA_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    pertanyaan: { type: 'string', description: 'Pertanyaan singkat berikutnya, dalam bahasa Indonesia sehari-hari (bukan bahasa korporat)' },
    catatan: { type: 'string', description: 'Subnote singkat opsional di bawah pertanyaan. String kosong jika tidak perlu.' },
    tipe: { type: 'string', description: "Gunakan tepat 'pilihan' jika user memilih dari daftar opsi, atau 'bebas' jika jawabannya murni teks" },
    opsi: { type: 'array', items: { type: 'string' }, description: "Daftar 3-6 opsi jawaban singkat jika tipe='pilihan'. Array kosong jika tipe='bebas'." },
    multi_pilihan: { type: 'boolean', description: 'true jika user boleh pilih lebih dari satu opsi sekaligus, false jika hanya boleh satu' },
    placeholder: { type: 'string', description: 'Contoh singkat jawaban bebas / opsi lain, ditampilkan sebagai hint di atas kotak teks bebas' },
  },
  required: ['pertanyaan', 'catatan', 'tipe', 'opsi', 'multi_pilihan', 'placeholder'],
  additionalProperties: false,
};

const DEFAULT_PROMPT = `Kamu adalah Luna, pewawancara yang membantu pemilik usaha kecil menyusun lowongan pekerjaan lewat obrolan singkat. Berdasarkan riwayat jawaban sejauh ini, ajukan SATU pertanyaan berikutnya yang paling relevan untuk melengkapi gambaran posisi yang mau direkrut (tugas harian, jam kerja, gaji, kriteria kandidat, lokasi usaha, jumlah yang direkrut, dsb). Pertanyaan harus singkat, memakai bahasa Indonesia sehari-hari, dan tidak mengulang topik yang sudah ditanyakan.`;

function serializeHistory(history) {
  if (!history?.length) return '(belum ada jawaban sebelumnya)';
  return history
    .map((h, i) => `Pertanyaan ${i + 1}: ${h.pertanyaan}\nJawaban: ${h.jawaban?.trim() || '(tidak dijawab)'}`)
    .join('\n\n');
}

function normalizeQuestion(parsed) {
  const pertanyaan = String(parsed.pertanyaan || '').trim();
  if (!pertanyaan) throw new Error('AI tidak mengembalikan teks pertanyaan yang valid. Coba lagi.');

  const tipe = String(parsed.tipe || '').trim().toLowerCase() === 'pilihan' ? 'pilihan' : 'bebas';
  const opsi = Array.isArray(parsed.opsi) ? parsed.opsi.map(o => String(o).trim()).filter(Boolean) : [];

  return {
    q: pertanyaan,
    subnote: parsed.catatan ? String(parsed.catatan).trim() : '',
    options: tipe === 'pilihan' && opsi.length > 0 ? opsi : null,
    multi: !!parsed.multi_pilihan,
    placeholder: parsed.placeholder ? String(parsed.placeholder).trim() : '',
  };
}

/**
 * Generate satu pertanyaan wizard berikutnya via OpenAI Responses API.
 */
export async function generateBuatLowonganTanyaOpenAI({
  history,
  questionNumber,
  totalQuestions = 8,
  apiKey,
  model,
  prompt,
  useFlexMode = false,
  temperature = 0.2,
  reasoningEffort = 'low',
}) {
  if (!history?.length) throw new Error('Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.');
  if (!questionNumber) throw new Error('Nomor pertanyaan tidak valid.');
  if (!apiKey) throw new Error('API Key OpenAI belum dikonfigurasi.');
  if (!model) throw new Error('Model AI (OpenAI) belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;
  const userText = `Riwayat tanya-jawab sejauh ini:\n${serializeHistory(history)}\n\nSekarang buatkan HANYA pertanyaan ke-${questionNumber} dari total ${totalQuestions} pertanyaan. Jangan mengulang topik yang sudah ditanyakan.`;

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
          name: 'buat_lowongan_pertanyaan_result',
          strict: true,
          schema: OPENAI_TANYA_RESPONSE_SCHEMA,
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
      function_name: 'Buat Lowongan - Ajukan Pertanyaan',
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

  return { question: normalizeQuestion(parsed), rawJson: contentText };
}
