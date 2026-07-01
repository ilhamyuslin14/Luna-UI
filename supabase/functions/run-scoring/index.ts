import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Server-side AI scoring. Runs with the service role key so the AI provider
// API key (sandbox_configs.api_key) and prompt templates never reach the
// browser — required so anonymous visitors on the public Laman Karir page
// can trigger scoring without exposing those secrets.
//
// Pass `scoringId` to update an existing scoring record (rescore); omit it
// to insert a new one.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
          score_evaluate: { type: 'INTEGER' },
          weight: { type: 'INTEGER' },
        },
        required: ['tag', 'kategori', 'evidence', 'score_evaluate', 'weight'],
      },
    },
    summary: { type: 'STRING' },
  },
  required: ['scores', 'summary'],
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function serializeKriteria(kriteria) {
  if (!kriteria) return ''
  if (typeof kriteria === 'string') return kriteria
  if (Array.isArray(kriteria)) {
    return kriteria.map((k, i) => {
      const lines = [`${i + 1}. [${k.kategori || 'Wajib'}] ${k.tag}`]
      if (k.teks) lines.push(`   Deskripsi: ${k.teks}`)
      if (k.bobot) lines.push(`   Bobot: ${k.bobot} (${k.point || 0} poin)`)
      return lines.join('\n')
    }).join('\n\n')
  }
  return JSON.stringify(kriteria, null, 2)
}

function calcTotalScore(scores) {
  if (!scores?.length) return 0
  const totalWeight = scores.reduce((sum, s) => sum + (s.weight || 0), 0)
  if (!totalWeight) return 0
  const weighted = scores.reduce((sum, s) => sum + (s.score_evaluate || 0) * (s.weight || 0), 0)
  return Math.round(weighted / totalWeight)
}

function getKategoriFit(score) {
  if (score >= 80) return 'Sangat Fit'
  if (score >= 60) return 'Fit'
  if (score >= 40) return 'Cukup Fit'
  return 'Kurang Fit'
}

async function callGeminiForScoring({ cvText, kriteriaText, apiKey, model, prompt, useFlexMode, temperature }) {
  const plainCv = stripHtml(cvText)
  const plainKriteria = stripHtml(kriteriaText)

  if (!plainCv) throw new Error('Teks CV kosong. Unggah atau tempel CV terlebih dahulu.')
  if (!plainKriteria) throw new Error('Teks Kriteria Penilaian kosong. Masukkan kriteria terlebih dahulu.')
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.')
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.')

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Evaluate candidate based on requirements.'
  const modelId = model.startsWith('models/') ? model : `models/${model}`

  let currentPayload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: `Kriteria Penilaian:\n${plainKriteria}\n\nData CV Kandidat:\n${plainCv}` }] }],
    ...(useFlexMode && { service_tier: 'flex' }),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SCORING_RESPONSE_SCHEMA,
      temperature: Number(temperature),
    },
  };

  const startTime = Date.now()
  let response;
  let data;
  let attempts = 0;
  const maxAttempts = 2; // 1 initial + 1 retry

  while (attempts < maxAttempts) {
    attempts++;
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPayload),
      }
    )

    data = await response.json()

    if (response.ok) {
      break; // Berhasil
    } else {
      if ((response.status === 429 || response.status === 503) && attempts < maxAttempts) {
        console.warn(`[Gemini API Scoring] Server sibuk (HTTP ${response.status}). Mencoba lagi dalam 3 detik... (Percobaan ${attempts})`);
        
        // Fallback: Matikan mode flex untuk percobaan selanjutnya agar masuk ke tier standar (on-demand)
        if (currentPayload.service_tier === 'flex') {
          delete currentPayload.service_tier;
          console.warn(`[Gemini API Scoring] Mematikan mode Flex untuk percobaan selanjutnya.`);
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        let errMsg = data.error?.message || `Gemini API error (HTTP ${response.status})`
        if (response.status === 429 || response.status === 503) {
           errMsg = "Server AI sedang penuh (High Demand). Silakan coba beberapa saat lagi.";
        }
        throw new Error(errMsg)
      }
    }
  }

  const latency = Date.now() - startTime

  const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!contentText) throw new Error('Respon AI kosong. Coba lagi.')

  let rawJson = contentText.trim()
  if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '')
  }
  const parsed = JSON.parse(rawJson)

  return {
    parsedData: parsed,
    rawJson: JSON.stringify(parsed, null, 2),
    usageMetadata: data.usageMetadata ? { ...data.usageMetadata, latency } : null,
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { kandidatId, seleksiId, companyId, scoringId } = await req.json()

    if (!kandidatId || !seleksiId || !companyId) {
      return jsonResponse({ error: true, message: 'Data tidak lengkap untuk menjalankan scoring.' })
    }

    const [{ data: kandidat, error: kErr }, { data: seleksi, error: sErr }, { data: config }, { data: promptSetting }] =
      await Promise.all([
        supabase.from('kandidat').select('raw_text, output_ai_raw').eq('id', kandidatId).single(),
        supabase.from('seleksi').select('kriteria, jabatan').eq('id', seleksiId).single(),
        supabase.from('sandbox_configs').select('*').limit(1).single(),
        supabase.from('prompt_settings').select('*').eq('type', 'Scoring').limit(1).single(),
      ])

    if (kErr || (!kandidat?.raw_text && !kandidat?.output_ai_raw))
      return jsonResponse({ error: true, message: 'Data CV kandidat tidak ditemukan. Pastikan CV sudah diunggah.' })
    if (sErr || !seleksi?.kriteria)
      return jsonResponse({ error: true, message: 'Kriteria penilaian pada posisi ini belum diisi.' })
    if (!config?.api_key)
      return jsonResponse({ error: true, message: 'API Key belum dikonfigurasi di Sandbox.' })
    if (!promptSetting)
      return jsonResponse({ error: true, message: 'Prompt Scoring belum dikonfigurasi di Prompt Settings.' })

    const kriteriaText = serializeKriteria(seleksi.kriteria)
    
    // Gunakan raw_text jika ada, jika tidak ada (karena fallback OCR langsung dari PDF), gunakan output_ai_raw
    let cvInputText = kandidat.raw_text
    if (!cvInputText && kandidat.output_ai_raw) {
      cvInputText = typeof kandidat.output_ai_raw === 'string' ? kandidat.output_ai_raw : JSON.stringify(kandidat.output_ai_raw)
    }

    const { parsedData, rawJson, usageMetadata } = await callGeminiForScoring({
      cvText: cvInputText,
      kriteriaText,
      apiKey: config.api_key,
      model: promptSetting.model,
      prompt: promptSetting.prompt,
      useFlexMode: promptSetting.use_flex ?? false,
      temperature: promptSetting.temperature ?? 0.2,
    })

    const totalScore = calcTotalScore((parsedData.scores || []).filter((s) => s.kategori === 'Wajib'))

    let scored, dbErr
    if (scoringId) {
      ({ data: scored, error: dbErr } = await supabase
        .from('scoring')
        .update({
          total_score: totalScore,
          kategori_fit: getKategoriFit(totalScore),
          ai_summary: parsedData.summary || '',
          detail_kriteria: parsedData.scores || [],
          output_ai_raw: rawJson || null,
          raw_kandidat_text: cvInputText || null,
          raw_kriteria: seleksi.kriteria || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scoringId)
        .select()
        .single())
    } else {
      ({ data: scored, error: dbErr } = await supabase
        .from('scoring')
        .insert([{
          kandidat_id: kandidatId,
          seleksi_id: seleksiId,
          company_id: companyId,
          total_score: totalScore,
          kategori_fit: getKategoriFit(totalScore),
          ai_summary: parsedData.summary || '',
          detail_kriteria: parsedData.scores || [],
          output_ai_raw: rawJson || null,
          raw_kandidat_text: cvInputText || null,
          raw_kriteria: seleksi.kriteria || null,
          alur_proses: 1,
        }])
        .select()
        .single())
    }

    if (dbErr) throw dbErr

    if (usageMetadata) {
      supabase.from('ai_usage_history').insert([{
        model_used: promptSetting.model,
        function_name: 'Generate AI Scoring',
        input_tokens: usageMetadata.promptTokenCount || 0,
        output_tokens: usageMetadata.candidatesTokenCount || 0,
        total_tokens: usageMetadata.totalTokenCount || 0,
        latency_ms: usageMetadata.latency || 0,
        input_text: `[KRITERIA LENGTH: ${stripHtml(kriteriaText).length}] [CV LENGTH: ${stripHtml(cvInputText).length}]`.substring(0, 5000),
        output_json: parsedData,
        is_flex_mode: !!promptSetting.use_flex,
      }]).then(({ error }) => { if (error) console.error('Gagal mencatat log usage AI Scoring:', error) })
    }

    return jsonResponse({ scoring: scored })
  } catch (err) {
    console.error('[run-scoring] Error:', err)
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal saat menjalankan scoring.' })
  }
})
