import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const SCORING_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    scores: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          tag: { type: 'STRING' },
          kategori: { type: 'STRING', description: "Kategori kriteria: 'Wajib' atau 'Nilai Tambah'" },
          evidence: { type: 'STRING' },
          score_evaluate: { type: 'INTEGER', minimum: 0, maximum: 100 },
          weight: { type: 'INTEGER' }
        },
        required: ["tag", "kategori", "evidence", "score_evaluate", "weight"]
      }
    },
    summary: { type: 'STRING' }
  },
  required: ["scores", "summary"]
};

function stripHtml(html) {
  if (!html) return '';
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
 * Memanggil Gemini API untuk melakukan AI Scoring terhadap CV berdasarkan Kriteria Penilaian
 */
export async function generateAIScoring({ cvText, kriteriaText, apiKey, model, prompt, useFlexMode = false, temperature = 0.2 }) {
  const plainCv = stripHtml(cvText);
  const plainKriteria = stripHtml(kriteriaText);

  if (!plainCv) throw new Error('Teks CV kosong. Unggah atau tempel CV terlebih dahulu.');
  if (!plainKriteria) throw new Error('Teks Kriteria Penilaian kosong. Masukkan kriteria terlebih dahulu.');
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.');
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Evaluate candidate based on requirements.';
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
        contents: [
          { parts: [{ text: `Kriteria Penilaian:\n${plainKriteria}\n\nData CV Kandidat:\n${plainCv}` }] }
        ],
        ...(useFlexMode && { service_tier: 'flex' }),
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SCORING_RESPONSE_SCHEMA,
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

  try {
    let rawJson = contentText.trim();
    if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    const parsed = JSON.parse(rawJson);

    // Log ke ai_usage_history
    if (data.usageMetadata) {
      const usage = data.usageMetadata;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Generate AI Scoring',
        input_tokens: usage.promptTokenCount || 0,
        output_tokens: usage.candidatesTokenCount || 0,
        total_tokens: usage.totalTokenCount || 0,
        latency_ms: latency,
        input_text: `[KRITERIA LENGTH: ${plainKriteria.length}] [CV LENGTH: ${plainCv.length}]`.substring(0, 5000),
        output_json: parsed,
        is_flex_mode: useFlexMode
      }]).then(({ error }) => {
        if (error) console.error('Gagal mencatat log usage AI Scoring:', error);
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
