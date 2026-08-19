import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Server-side "Buat Lowongan dengan Bantuan Luna" — generate pertanyaan
// berikutnya. Sama seperti generate-kriteria/run-scoring: dijalankan pakai
// service role key supaya API key provider AI (sandbox_configs) tidak pernah
// sampai ke browser user perusahaan.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
}

const OPENAI_RESPONSE_SCHEMA = {
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
}

const DEFAULT_PROMPT = `Kamu adalah Luna, pewawancara yang membantu pemilik usaha kecil menyusun lowongan pekerjaan lewat obrolan singkat. Berdasarkan riwayat jawaban sejauh ini, ajukan SATU pertanyaan berikutnya yang paling relevan untuk melengkapi gambaran posisi yang mau direkrut (tugas harian, jam kerja, gaji, kriteria kandidat, lokasi usaha, jumlah yang direkrut, dsb). Pertanyaan harus singkat, memakai bahasa Indonesia sehari-hari, dan tidak mengulang topik yang sudah ditanyakan.`

function serializeHistory(history: any[]) {
  if (!history?.length) return '(belum ada jawaban sebelumnya)'
  return history
    .map((h: any, i: number) => `Pertanyaan ${i + 1}: ${h.pertanyaan}\nJawaban: ${(h.jawaban || '').trim() || '(tidak dijawab)'}`)
    .join('\n\n')
}

function normalizeQuestion(parsed: any) {
  const pertanyaan = String(parsed.pertanyaan || '').trim()
  if (!pertanyaan) throw new Error('AI tidak mengembalikan teks pertanyaan yang valid. Coba lagi.')

  const tipe = String(parsed.tipe || '').trim().toLowerCase() === 'pilihan' ? 'pilihan' : 'bebas'
  const opsi = Array.isArray(parsed.opsi) ? parsed.opsi.map((o: any) => String(o).trim()).filter(Boolean) : []

  return {
    q: pertanyaan,
    subnote: parsed.catatan ? String(parsed.catatan).trim() : '',
    options: tipe === 'pilihan' && opsi.length > 0 ? opsi : null,
    multi: !!parsed.multi_pilihan,
    placeholder: parsed.placeholder ? String(parsed.placeholder).trim() : '',
  }
}

async function callGeminiForTanya({ userText, apiKey, model, prompt, useFlexMode, temperature }: any) {
  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT
  const modelId = model.startsWith('models/') ? model : `models/${model}`

  const startTime = Date.now()
  let attempt = 0
  const maxAttempts = 10
  const delay = 2500

  let response: Response | undefined
  let data: any

  while (attempt < maxAttempts) {
    attempt++
    response = await fetch(
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
    )

    data = await response.json()

    if (!response.ok) {
      const status = response.status
      if ((status === 429 || status === 503 || status === 500) && attempt < maxAttempts) {
        console.log(`[buat-lowongan-tanya] Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw new Error(data.error?.message || `Gemini API error (HTTP ${response.status})`)
    }

    break
  }

  const latency = Date.now() - startTime

  const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!contentText) throw new Error('Respon AI kosong. Coba lagi.')

  let rawJson = contentText.trim()
  if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '')
  }

  let parsed
  try {
    parsed = JSON.parse(rawJson)
  } catch (e) {
    throw new Error('Gagal membaca format JSON dari AI. Coba lagi.')
  }

  return { parsed, usageMetadata: data.usageMetadata ? { ...data.usageMetadata, latency } : null }
}

function isOpenAIReasoningModel(model: string) {
  return /^(gpt-5|o1|o3)/i.test(model)
}

async function callOpenAIForTanya({ userText, apiKey, model, prompt, useFlexMode, temperature, reasoningEffort }: any) {
  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT

  const payload = {
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
        schema: OPENAI_RESPONSE_SCHEMA,
      },
    },
  }

  const startTime = Date.now()
  let attempt = 0
  const maxAttempts = 10
  const delay = 2500

  let response: Response | undefined
  let data: any

  while (attempt < maxAttempts) {
    attempt++
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    })

    data = await response.json()

    if (!response.ok) {
      const status = response.status
      if ((status === 429 || status === 503) && attempt < maxAttempts) {
        console.log(`[buat-lowongan-tanya] (OpenAI) Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      let errMsg = data.error?.message || `OpenAI API error (HTTP ${response.status})`
      if (status === 429 || status === 503) errMsg = 'Server AI sedang penuh (High Demand). Silakan coba beberapa saat lagi.'
      throw new Error(errMsg)
    }

    break
  }

  const latency = Date.now() - startTime

  const messageItem = (data.output || []).find((o: any) => o.type === 'message')
  const textItem = messageItem?.content?.find((c: any) => c.type === 'output_text')
  const contentText = textItem?.text
  if (!contentText) throw new Error('Respon AI kosong. Coba lagi.')

  let rawJson = contentText.trim()
  if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```(json)?\n/, '').replace(/\n```$/, '')
  }

  let parsed
  try {
    parsed = JSON.parse(rawJson)
  } catch (e) {
    throw new Error('Gagal membaca format JSON dari AI. Coba lagi.')
  }

  return {
    parsed,
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

  try {
    const body = await req.json()
    const history = body.history
    const questionNumber = body.questionNumber
    const totalQuestions = body.totalQuestions || 8

    if (!Array.isArray(history) || history.length === 0) {
      return jsonResponse({ error: true, message: 'Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.' }, 400)
    }
    if (!questionNumber) {
      return jsonResponse({ error: true, message: 'Nomor pertanyaan tidak valid.' }, 400)
    }

    const [{ data: configData }, { data: promptData }] = await Promise.all([
      supabase.from('sandbox_configs').select('*').order('updated_at', { ascending: false }).limit(1),
      supabase.from('prompt_settings').select('*').eq('type', 'BuatLowonganTanya').limit(1),
    ])

    const config = configData?.[0]
    const promptSetting = promptData?.[0]
    const activeProvider = config?.active_provider === 'openai' ? 'openai' : 'gemini'
    const providerApiKey = activeProvider === 'openai' ? config?.openai_api_key : config?.api_key
    const providerModel = activeProvider === 'openai' ? promptSetting?.model_openai : promptSetting?.model

    if (!providerApiKey || !providerModel) {
      return jsonResponse({ error: true, message: `API Key atau Model AI (${activeProvider}) untuk "Ajukan Pertanyaan" belum dikonfigurasi.` }, 500)
    }

    const prompt = promptSetting?.prompt
    const useFlexMode = promptSetting?.use_flex || false
    const temperature = promptSetting?.temperature ?? 0.2
    const reasoningEffort = promptSetting?.reasoning_effort || 'low'

    const userText = `Riwayat tanya-jawab sejauh ini:\n${serializeHistory(history)}\n\nSekarang buatkan HANYA pertanyaan ke-${questionNumber} dari total ${totalQuestions} pertanyaan. Jangan mengulang topik yang sudah ditanyakan.`

    const callFn = activeProvider === 'openai' ? callOpenAIForTanya : callGeminiForTanya
    const { parsed, usageMetadata } = await callFn({ userText, apiKey: providerApiKey, model: providerModel, prompt, useFlexMode, temperature, reasoningEffort })

    if (usageMetadata) {
      supabase.from('ai_usage_history').insert([{
        model_used: providerModel,
        function_name: 'Buat Lowongan - Ajukan Pertanyaan',
        input_tokens: usageMetadata.promptTokenCount || 0,
        output_tokens: usageMetadata.candidatesTokenCount || 0,
        total_tokens: usageMetadata.totalTokenCount || 0,
        latency_ms: usageMetadata.latency || 0,
        input_text: userText.substring(0, 5000),
        output_json: parsed,
        is_flex_mode: useFlexMode,
      }]).then(({ error }: any) => {
        if (error) console.error('Gagal mencatat riwayat AI:', error.message)
      })
    }

    return jsonResponse({ question: normalizeQuestion(parsed) })
  } catch (err: any) {
    console.error('[buat-lowongan-tanya] Error:', err)
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal saat membuat pertanyaan.' }, 500)
  }
})
