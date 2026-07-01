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

    const plainText = stripHtml(deskripsi);

    const [{ data: configData }, { data: promptData }] = await Promise.all([
      supabase.from('sandbox_configs').select('api_key').order('updated_at', { ascending: false }).limit(1),
      supabase.from('prompt_settings').select('*').eq('type', 'JD').limit(1),
    ])

    const apiKey = configData?.[0]?.api_key;
    const model = promptData?.[0]?.model;
    const prompt = promptData?.[0]?.prompt;
    const useFlexMode = promptData?.[0]?.use_flex || false;
    const temperature = promptData?.[0]?.temperature ?? 0.2;

    if (!apiKey || !model) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: 'API Key atau Model belum disetup.' }] }).eq('id', seleksiId)
      return jsonResponse({ error: true, message: 'API Key atau Model belum disetup.' }, 500)
    }

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
      const errMsg = data.error?.message || `Gemini API error (HTTP ${response.status})`;
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: errMsg }] }).eq('id', seleksiId)
      throw new Error(errMsg);
    }

    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: 'Respon AI kosong. Coba lagi.' }] }).eq('id', seleksiId)
      throw new Error('Respon AI kosong. Coba lagi.');
    }

    let rawJson = contentText.trim();
    if (rawJson.startsWith('\`\`\`')) {
      rawJson = rawJson.replace(/^\`\`\`(json)?\n/, '').replace(/\n\`\`\`$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: 'Gagal membaca JSON dari AI.' }] }).eq('id', seleksiId)
      return jsonResponse({ error: true, message: 'Gagal membaca JSON dari AI.' }, 500)
    }

    let parsedArray = parsed;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.data)) {
      parsedArray = parsed.data;
    }

    if (!Array.isArray(parsedArray)) {
      await supabase.from('seleksi').update({ kriteria: [{ _isError: true, message: 'Format output AI tidak valid (tidak ditemukan array kriteria).' }] }).eq('id', seleksiId)
      return jsonResponse({ error: true, message: 'Format output AI tidak valid (tidak ditemukan array kriteria).' }, 500)
    }

    // Log ke ai_usage_history
    if (data.usageMetadata) {
      const usage = data.usageMetadata;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Generate Kriteria Penilaian',
        input_tokens: usage.promptTokenCount || 0,
        output_tokens: usage.candidatesTokenCount || 0,
        total_tokens: usage.totalTokenCount || 0,
        latency_ms: latency,
        input_text: plainText.substring(0, 5000),
        output_json: parsed,
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
