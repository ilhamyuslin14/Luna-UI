import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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

// Setara RESPONSE_SCHEMA di atas, tapi dibungkus { kriteria: [...] } karena
// OpenAI Structured Outputs strict mode mewajibkan root schema bertipe
// "object" (bukan array seperti Gemini) — di-unwrap lagi setelah parsing.
// Field-field item (kategori/tag/teks/bobot/point) identik dengan versi Gemini.
const OPENAI_RESPONSE_SCHEMA = {
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
}

const DEFAULT_PROMPT = `Berdasarkan teks deskripsi pekerjaan berikut, hasilkan Kriteria Penilaian yang komprehensif dan relevan untuk mengevaluasi kandidat. Buat kriteria yang spesifik dan terukur. Pisahkan antara kriteria wajib (must-have) dan nilai tambah (nice-to-have). Sesuaikan bobot berdasarkan tingkat kepentingan kriteria tersebut untuk posisi ini.`;

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeItem(item: any, index: number) {
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

async function callGeminiForKriteria({ plainText, apiKey, model, prompt, useFlexMode, temperature }: any) {
  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;
  const modelId = model.startsWith('models/') ? model : `models/${model}`;

  const startTime = Date.now();

  let attempt = 0;
  const maxAttempts = 10;
  const delay = 2500;

  let response: Response | undefined;
  let data: any;

  while (attempt < maxAttempts) {
    attempt++;
    response = await fetch(
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

    data = await response.json();

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 503 || status === 500) {
        if (attempt < maxAttempts) {
          console.log(`[generate-kriteria] Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      const errMsg = data.error?.message || `Gemini API error (HTTP ${response.status})`;
      throw new Error(errMsg);
    }

    break;
  }

  const latency = Date.now() - startTime;

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
    throw new Error('Gagal membaca JSON dari AI.');
  }

  let parsedArray = parsed;
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.data)) {
    parsedArray = parsed.data;
  }

  if (!Array.isArray(parsedArray)) {
    throw new Error('Format output AI tidak valid (tidak ditemukan array kriteria).');
  }

  return {
    parsedArray,
    parsedRaw: parsed,
    usageMetadata: data.usageMetadata ? { ...data.usageMetadata, latency } : null,
  }
}

// Model reasoning OpenAI (gpt-5*, o1, o3) menolak parameter `temperature`
// sama sekali (HTTP 400 "Unsupported parameter"). Model non-reasoning seperti
// gpt-4.1-nano masih menerimanya seperti biasa.
function isOpenAIReasoningModel(model: string) {
  return /^(gpt-5|o1|o3)/i.test(model)
}

// Setara callGeminiForKriteria, tapi lewat OpenAI Responses API. Array
// kriteria dibungkus { kriteria: [...] } karena strict mode OpenAI
// mewajibkan root object, lalu di-unwrap lagi di sini.
async function callOpenAIForKriteria({ plainText, apiKey, model, prompt, useFlexMode, temperature, reasoningEffort }: any) {
  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;

  const payload = {
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
        schema: OPENAI_RESPONSE_SCHEMA,
      },
    },
  }

  const startTime = Date.now();

  let attempt = 0;
  const maxAttempts = 10;
  const delay = 2500;

  let response: Response | undefined;
  let data: any;

  while (attempt < maxAttempts) {
    attempt++;
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    })

    data = await response.json();

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 503) {
        if (attempt < maxAttempts) {
          console.log(`[generate-kriteria] (OpenAI) Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      let errMsg = data.error?.message || `OpenAI API error (HTTP ${response.status})`;
      if (status === 429 || status === 503) {
        errMsg = 'Server AI sedang penuh (High Demand). Silakan coba beberapa saat lagi.';
      }
      throw new Error(errMsg);
    }

    break;
  }

  const latency = Date.now() - startTime;

  const messageItem = (data.output || []).find((o: any) => o.type === 'message');
  const textItem = messageItem?.content?.find((c: any) => c.type === 'output_text');
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
    throw new Error('Gagal membaca JSON dari AI.');
  }

  const parsedArray = Array.isArray(parsed?.kriteria) ? parsed.kriteria : parsed;

  if (!Array.isArray(parsedArray)) {
    throw new Error('Format output AI tidak valid (tidak ditemukan array kriteria).');
  }

  return {
    parsedArray,
    parsedRaw: parsed,
    usageMetadata: data.usage ? {
      promptTokenCount: data.usage.input_tokens || 0,
      candidatesTokenCount: data.usage.output_tokens || 0,
      totalTokenCount: data.usage.total_tokens || 0,
      latency,
    } : null,
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let seleksiId: string | null = null;
  try {
    const body = await req.json()
    seleksiId = body.seleksiId
    const deskripsi = body.deskripsi

    if (!seleksiId || !deskripsi) {
      return jsonResponse({ error: true, message: 'Data seleksiId atau deskripsi kosong.' }, 400)
    }

    // Paket Free tidak termasuk perumusan kriteria otomatis oleh AI. Cek di
    // sini (server-side), bukan cuma di UI, supaya tidak bisa dilewati
    // dengan memanggil edge function ini langsung.
    const { data: seleksiRow } = await supabase.from('seleksi').select('company_id').eq('id', seleksiId).single()
    if (seleksiRow?.company_id) {
      const { data: company } = await supabase.from('companies').select('plan').eq('id', seleksiRow.company_id).single()
      if (company?.plan === 'free') {
        return jsonResponse({ error: true, message: 'Paket Free tidak mendukung perumusan kriteria otomatis oleh AI.' })
      }
    }

    const plainText = stripHtml(deskripsi);

    const [{ data: configData }, { data: promptData }] = await Promise.all([
      supabase.from('sandbox_configs').select('*').order('updated_at', { ascending: false }).limit(1),
      supabase.from('prompt_settings').select('*').eq('type', 'JD').limit(1),
    ])

    const config = configData?.[0]
    const promptSetting = promptData?.[0]
    const activeProvider = config?.active_provider === 'openai' ? 'openai' : 'gemini'
    const providerApiKey = activeProvider === 'openai' ? config?.openai_api_key : config?.api_key
    const providerModel = activeProvider === 'openai' ? promptSetting?.model_openai : promptSetting?.model
    const prompt = promptSetting?.prompt
    const useFlexMode = promptSetting?.use_flex || false
    const temperature = promptSetting?.temperature ?? 0.2
    const reasoningEffort = promptSetting?.reasoning_effort || 'low'

    if (!providerApiKey || !providerModel) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: `API Key atau Model (${activeProvider}) belum disetup.` }] }).eq('id', seleksiId)
      return jsonResponse({ error: true, message: `API Key atau Model (${activeProvider}) belum disetup.` }, 500)
    }

    let parsedArray, parsedRaw, usageMetadata
    try {
      const callFn = activeProvider === 'openai' ? callOpenAIForKriteria : callGeminiForKriteria
      const result = await callFn({ plainText, apiKey: providerApiKey, model: providerModel, prompt, useFlexMode, temperature, reasoningEffort })
      parsedArray = result.parsedArray
      parsedRaw = result.parsedRaw
      usageMetadata = result.usageMetadata
    } catch (err: any) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: err.message }] }).eq('id', seleksiId)
      return jsonResponse({ error: true, message: err.message }, 500)
    }

    // Log ke ai_usage_history
    if (usageMetadata) {
      supabase.from('ai_usage_history').insert([{
        model_used: providerModel,
        function_name: 'Generate Kriteria Penilaian',
        input_tokens: usageMetadata.promptTokenCount || 0,
        output_tokens: usageMetadata.candidatesTokenCount || 0,
        total_tokens: usageMetadata.totalTokenCount || 0,
        latency_ms: usageMetadata.latency || 0,
        input_text: plainText.substring(0, 5000),
        output_json: parsedRaw,
        is_flex_mode: useFlexMode,
      }]).then(({ error }) => {
        if (error) console.error('Gagal mencatat riwayat AI:', error.message);
      });
    }

    const kriteria = parsedArray
      .filter((item: any) => item && (item.teks || item.Teks))
      .map(normalizeItem);

    await supabase.from('seleksi').update({ kriteria: kriteria }).eq('id', seleksiId)

    return jsonResponse({ success: true, kriteria })
  } catch (err: any) {
    console.error('[generate-kriteria] Error:', err)
    if (seleksiId) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: err.message || 'Server AI sedang sibuk' }] }).eq('id', seleksiId)
    }
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal.' }, 500)
  }
})
