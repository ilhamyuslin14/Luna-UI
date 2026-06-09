// ── generateKriteria.js ───────────────────────────────────────────────────────
// Generate Kriteria Penilaian dari deskripsi pekerjaan menggunakan Gemini AI.
//
// Usage:
//   import { generateKriteria } from '../../utils/generateKriteria';
//   const { kriteria, rawJson } = await generateKriteria({ deskripsi, apiKey, model, prompt, useFlexMode });
//
// Output:
//   kriteria  — array of { id, kategori, teks, bobot }, kompatibel dengan KriteriaPenilaian component
//   rawJson   — string JSON mentah dari AI, untuk ditampilkan di output box sandbox
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      kategori: {
        type: 'STRING',
        description: "Kategori kriteria: gunakan tepat 'Wajib' atau 'Nilai Tambah'",
      },
      tag: {
        type: 'STRING',
        description: "2-3 kata ringkasan (summary) dari kriteria tersebut",
      },
      teks: {
        type: 'STRING',
        description: "Deskripsi tajam dan singkat (maksimal 80 karakter) tanpa basa-basi korporat",
      },
      bobot: {
        type: 'STRING',
        description: "Tingkat kepentingan: gunakan tepat 'tinggi', 'sedang', atau 'rendah'",
      },
      point: {
        type: 'INTEGER',
        description: "Skor bobot: 150 (untuk tinggi), 100 (untuk sedang), atau 50 (untuk rendah)",
      },
    },
    required: ['kategori', 'tag', 'teks', 'bobot', 'point'],
  },
};

const DEFAULT_PROMPT = `Berdasarkan teks deskripsi pekerjaan berikut, hasilkan Kriteria Penilaian yang komprehensif dan relevan untuk mengevaluasi kandidat. Buat kriteria yang spesifik dan terukur. Pisahkan antara kriteria wajib (must-have) dan nilai tambah (nice-to-have). Sesuaikan bobot berdasarkan tingkat kepentingan kriteria tersebut untuk posisi ini.`;

/**
 * Membersihkan HTML tag dari deskripsi sebelum dikirim ke AI.
 */
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

/**
 * Validasi dan normalisasi satu item kriteria dari output AI.
 */
function normalizeItem(item, index) {
  const kategori = (item.kategori || 'Wajib') === 'Nilai Tambah' ? 'Nilai Tambah' : 'Wajib';
  
  let bobotText = 'sedang';
  const pointNum = Number(item.point || item.Point || item.bobot_angka || 100);
  
  if (item.bobot && ['tinggi', 'sedang', 'rendah'].includes(item.bobot.toLowerCase())) {
    bobotText = item.bobot.toLowerCase();
  } else {
    // Fallback kalau AI lupa ngasih teks bobot
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
 * Generate Kriteria Penilaian dari deskripsi pekerjaan via Gemini API.
 *
 * @param {Object} params
 * @param {string}  params.deskripsi    - Konten deskripsi pekerjaan (HTML atau plain text)
 * @param {string}  params.apiKey       - Gemini API key
 * @param {string}  params.model        - ID model Gemini (e.g. 'models/gemini-2.5-pro')
 * @param {string}  [params.prompt]     - Override system prompt dari Sandbox config
 * @param {boolean} [params.useFlexMode] - Aktifkan Flex Mode (hemat ~50% biaya, latency bervariasi)
 * @param {number}  [params.temperature] - Tingkat kreativitas AI (0.0 - 2.0)
 *
 * @returns {Promise<{ kriteria: Array, rawJson: string }>}
 * @throws  {Error} jika API gagal atau respon kosong
 */
export async function generateKriteria({ deskripsi, apiKey, model, prompt, useFlexMode = false, temperature = 0.2 }) {
  const plainText = stripHtml(deskripsi);

  if (!plainText) throw new Error('Deskripsi pekerjaan kosong. Isi form deskripsi terlebih dahulu.');
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.');
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;

  const modelId = model.startsWith('models/') ? model : `models/${model}`;

  const startTime = Date.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{ parts: [{ text: `Deskripsi Pekerjaan:\n${plainText}` }] }],
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
  const endTime = Date.now();
  const latency = endTime - startTime;

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
    return { kriteria: [], rawJson: contentText, warning: 'Gagal membaca JSON dari AI.' };
  }

  let parsedArray = parsed;
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.data)) {
    parsedArray = parsed.data;
  }

  if (!Array.isArray(parsedArray)) {
    return { kriteria: [], rawJson: contentText, warning: 'Format output AI tidak valid (tidak ditemukan array kriteria).' };
  }

  // Log ke ai_usage_history — fire-and-forget, tidak block flow utama
  if (data.usageMetadata) {
    const usage = data.usageMetadata;
    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Generate Kriteria Penilaian',
      input_tokens: usage.promptTokenCount || 0,
      output_tokens: usage.candidatesTokenCount || 0,
      total_tokens: usage.totalTokenCount || 0,
      latency_ms: latency,
      input_text: plainText.substring(0, 5000), // cap agar tidak terlalu besar
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
