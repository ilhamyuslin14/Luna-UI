// ── generateKriteriaOpenAI.js ────────────────────────────────────────────────
// Setara generateKriteria.js (Gemini), tapi lewat OpenAI Responses API.
// Field-field kriteria (kategori, tag, teks, bobot, point) identik dengan
// versi Gemini — satu-satunya beda struktural adalah OpenAI strict mode
// mewajibkan root schema bertipe "object" (tidak boleh array), jadi array
// kriteria dibungkus dalam { kriteria: [...] } lalu di-unwrap lagi di sini
// supaya konsumen (Sandbox-Kriteria.jsx) tetap menerima array biasa.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { isOpenAIReasoningModel } from './openaiModelHelpers';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const OPENAI_KRITERIA_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    kriteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kategori: { type: 'string', description: "Kategori kriteria: gunakan tepat 'Wajib' atau 'Nilai Tambah'" },
          tag: { type: 'string', description: '2-3 kata ringkasan (summary) dari kriteria tersebut' },
          teks: { type: 'string', description: 'Deskripsi tajam dan singkat (maksimal 80 karakter) tanpa basa-basi korporat' },
          bobot: { type: 'string', description: "Tingkat kepentingan: gunakan tepat 'tinggi', 'sedang', atau 'rendah'" },
          point: { type: 'integer', description: 'Skor bobot: 150 (untuk tinggi), 100 (untuk sedang), atau 50 (untuk rendah)' },
        },
        required: ['kategori', 'tag', 'teks', 'bobot', 'point'],
        additionalProperties: false,
      },
    },
  },
  required: ['kriteria'],
  additionalProperties: false,
};

const DEFAULT_PROMPT = `Berdasarkan teks deskripsi pekerjaan berikut, hasilkan Kriteria Penilaian yang komprehensif dan relevan untuk mengevaluasi kandidat. Buat kriteria yang spesifik dan terukur. Pisahkan antara kriteria wajib (must-have) dan nilai tambah (nice-to-have). Sesuaikan bobot berdasarkan tingkat kepentingan kriteria tersebut untuk posisi ini.`;

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

function normalizeItem(item, index) {
  const kategori = (item.kategori || 'Wajib') === 'Nilai Tambah' ? 'Nilai Tambah' : 'Wajib';

  let bobotText = 'sedang';
  const pointNum = Number(item.point || item.Point || item.bobot_angka || 100);

  if (item.bobot && ['tinggi', 'sedang', 'rendah'].includes(item.bobot.toLowerCase())) {
    bobotText = item.bobot.toLowerCase();
  } else {
    if (pointNum >= 150) bobotText = 'tinggi';
    else if (pointNum <= 50) bobotText = 'rendah';
  }

  return {
    id: index + 1,
    kategori,
    tag: String(item.tag || item.Tag || '').trim(),
    teks: String(item.teks || item.Teks || '').trim(),
    bobot: bobotText,
    point: pointNum
  };
}

/**
 * Generate Kriteria Penilaian dari deskripsi pekerjaan via OpenAI Responses API.
 */
export async function generateKriteriaOpenAI({ deskripsi, apiKey, model, prompt, useFlexMode = false, temperature = 0.2, reasoningEffort = 'low' }) {
  const plainText = stripHtml(deskripsi);

  if (!plainText) throw new Error('Deskripsi pekerjaan kosong. Isi form deskripsi terlebih dahulu.');
  if (!apiKey) throw new Error('API Key OpenAI belum dikonfigurasi.');
  if (!model) throw new Error('Model AI (OpenAI) belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;

  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: [{ role: 'user', content: [{ type: 'input_text', text: `Deskripsi Pekerjaan:\n${plainText}` }] }],
      ...(useFlexMode && { service_tier: 'flex' }),
      ...(isOpenAIReasoningModel(model)
        ? { reasoning: { effort: reasoningEffort || 'low' } }
        : { temperature: Number(temperature) }),
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'kriteria_penilaian_result',
          strict: true,
          schema: OPENAI_KRITERIA_RESPONSE_SCHEMA,
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

  let rawJson = contentText.trim();
  if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return { kriteria: [], rawJson: contentText, warning: 'Gagal membaca JSON dari AI.' };
  }

  // Unwrap { kriteria: [...] } — dibungkus karena OpenAI strict mode
  // mewajibkan root schema bertipe object, bukan array seperti versi Gemini.
  const parsedArray = Array.isArray(parsed?.kriteria) ? parsed.kriteria : parsed;

  if (!Array.isArray(parsedArray)) {
    return { kriteria: [], rawJson: contentText, warning: 'Format output AI tidak valid (tidak ditemukan array kriteria).' };
  }

  if (data.usage) {
    const usage = data.usage;
    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Generate Kriteria Penilaian',
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      latency_ms: latency,
      input_text: plainText.substring(0, 5000),
      output_json: parsed,
      is_flex_mode: useFlexMode,
    }]).then(({ error }) => {
      if (error) console.error('Gagal mencatat riwayat AI:', error.message);
    });
  }

  const kriteria = parsedArray
    .filter(item => item && (item.teks || item.Teks))
    .map(normalizeItem);

  return { kriteria, rawJson: contentText };
}
