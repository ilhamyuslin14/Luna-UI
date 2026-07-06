import { createClient } from '@supabase/supabase-js';
import { isOpenAIReasoningModel } from './openaiModelHelpers';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

// Setara SCORING_RESPONSE_SCHEMA di generateAIScoring.js (Gemini) — root sudah
// bertipe object di kedua provider, jadi tidak perlu wrapper seperti kriteria.
// Field-field (tag, kategori, evidence, score_evaluate, weight, summary)
// identik; hanya konvensi tipe (lowercase) + additionalProperties:false yang
// wajib untuk mode strict Structured Outputs milik OpenAI.
const OPENAI_SCORING_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          kategori: { type: 'string', description: "Kategori kriteria: 'Wajib' atau 'Nilai Tambah'" },
          evidence: { type: 'string' },
          score_evaluate: { type: 'integer', minimum: 0, maximum: 100 },
          weight: { type: 'integer' },
        },
        required: ['tag', 'kategori', 'evidence', 'score_evaluate', 'weight'],
        additionalProperties: false,
      },
    },
    summary: { type: 'string' },
  },
  required: ['scores', 'summary'],
  additionalProperties: false,
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
 * Setara generateAIScoring.js (Gemini), tapi lewat OpenAI Responses API.
 */
export async function generateAIScoringOpenAI({ cvText, kriteriaText, apiKey, model, prompt, useFlexMode = false, temperature = 0.2, reasoningEffort = 'low' }) {
  const plainCv = stripHtml(cvText);
  const plainKriteria = stripHtml(kriteriaText);

  if (!plainCv) throw new Error('Teks CV kosong. Unggah atau tempel CV terlebih dahulu.');
  if (!plainKriteria) throw new Error('Teks Kriteria Penilaian kosong. Masukkan kriteria terlebih dahulu.');
  if (!apiKey) throw new Error('API Key OpenAI belum dikonfigurasi.');
  if (!model) throw new Error('Model AI (OpenAI) belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Evaluate candidate based on requirements.';

  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: [{ role: 'user', content: [{ type: 'input_text', text: `Kriteria Penilaian:\n${plainKriteria}\n\nData CV Kandidat:\n${plainCv}` }] }],
      ...(useFlexMode && { service_tier: 'flex' }),
      ...(isOpenAIReasoningModel(model)
        ? { reasoning: { effort: reasoningEffort || 'low' } }
        : { temperature: Number(temperature) }),
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'ai_scoring_result',
          strict: true,
          schema: OPENAI_SCORING_RESPONSE_SCHEMA,
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

    if (data.usage) {
      const usage = data.usage;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Generate AI Scoring',
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        total_tokens: usage.total_tokens || 0,
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
