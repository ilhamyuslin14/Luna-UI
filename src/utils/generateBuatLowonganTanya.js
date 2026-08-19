// ── generateBuatLowonganTanya.js ────────────────────────────────────────────
// Generate SATU pertanyaan wizard "Buat Lowongan dengan Bantuan Luna" berikutnya,
// berdasarkan riwayat tanya-jawab sejauh ini, menggunakan Gemini AI.
//
// Usage:
//   import { generateBuatLowonganTanya } from '../../utils/generateBuatLowonganTanya';
//   const { question, rawJson } = await generateBuatLowonganTanya({
//     history, questionNumber, totalQuestions, apiKey, model, prompt, useFlexMode, temperature
//   });
//
// `history` — array of { pertanyaan, jawaban } (termasuk pertanyaan template
// pertama + jawabannya, dan seluruh pertanyaan AI + jawaban sebelumnya).
//
// Output:
//   question — { q, subnote, options, multi, placeholder }, bentuknya identik
//              dengan item statis di QUESTIONS milik wizard dummy, jadi
//              komponen wizard bisa merender apa adanya tanpa perubahan.
//   rawJson  — string JSON mentah dari AI, untuk ditampilkan di output box sandbox
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pertanyaan: {
      type: 'STRING',
      description: 'Pertanyaan singkat berikutnya, dalam bahasa Indonesia sehari-hari (bukan bahasa korporat)',
    },
    catatan: {
      type: 'STRING',
      description: 'Subnote singkat opsional di bawah pertanyaan (mis. "Sebutkan nama kotanya"). String kosong jika tidak perlu.',
    },
    tipe: {
      type: 'STRING',
      description: "Gunakan tepat 'pilihan' jika user memilih dari daftar opsi, atau 'bebas' jika jawabannya murni teks",
    },
    opsi: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: "Daftar 3-6 opsi jawaban singkat jika tipe='pilihan'. Array kosong jika tipe='bebas'.",
    },
    multi_pilihan: {
      type: 'BOOLEAN',
      description: 'true jika user boleh pilih lebih dari satu opsi sekaligus, false jika hanya boleh satu',
    },
    placeholder: {
      type: 'STRING',
      description: 'Contoh singkat jawaban bebas / opsi lain, ditampilkan sebagai hint di atas kotak teks bebas',
    },
  },
  required: ['pertanyaan', 'catatan', 'tipe', 'opsi', 'multi_pilihan', 'placeholder'],
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
 * Generate satu pertanyaan wizard berikutnya via Gemini API.
 *
 * @param {Object} params
 * @param {Array}   params.history         - Riwayat [{ pertanyaan, jawaban }] sejauh ini
 * @param {number}  params.questionNumber  - Nomor pertanyaan yang mau digenerate (2..totalQuestions)
 * @param {number}  [params.totalQuestions=7] - Total pertanyaan dalam satu sesi wizard
 * @param {string}  params.apiKey          - Gemini API key
 * @param {string}  params.model           - ID model Gemini (e.g. 'models/gemini-2.5-flash-lite')
 * @param {string}  [params.prompt]        - Override system prompt dari Sandbox config
 * @param {boolean} [params.useFlexMode]   - Aktifkan Flex Mode (hemat ~50% biaya, latency bervariasi)
 * @param {number}  [params.temperature]   - Tingkat kreativitas AI (0.0 - 2.0)
 *
 * @returns {Promise<{ question: Object, rawJson: string }>}
 * @throws  {Error} jika API gagal atau respon kosong/tidak valid
 */
export async function generateBuatLowonganTanya({
  history,
  questionNumber,
  totalQuestions = 8,
  apiKey,
  model,
  prompt,
  useFlexMode = false,
  temperature = 0.2,
}) {
  if (!history?.length) throw new Error('Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.');
  if (!questionNumber) throw new Error('Nomor pertanyaan tidak valid.');
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.');
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;
  const modelId = model.startsWith('models/') ? model : `models/${model}`;

  const userText = `Riwayat tanya-jawab sejauh ini:\n${serializeHistory(history)}\n\nSekarang buatkan HANYA pertanyaan ke-${questionNumber} dari total ${totalQuestions} pertanyaan. Jangan mengulang topik yang sudah ditanyakan.`;

  const startTime = Date.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userText }] }],
        ...(useFlexMode && { service_tier: 'flex' }),
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: Number(temperature),
        },
      }),
    }
  );

  const data = await response.json();
  const latency = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error (HTTP ${response.status})`);
  }

  const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
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

  // Log ke ai_usage_history — fire-and-forget, tidak block flow utama
  if (data.usageMetadata) {
    const usage = data.usageMetadata;
    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Buat Lowongan - Ajukan Pertanyaan',
      input_tokens: usage.promptTokenCount || 0,
      output_tokens: usage.candidatesTokenCount || 0,
      total_tokens: usage.totalTokenCount || 0,
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
