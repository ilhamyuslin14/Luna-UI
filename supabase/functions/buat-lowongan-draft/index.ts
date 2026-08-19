import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Server-side "Buat Lowongan dengan Bantuan Luna" — generate/revisi draf
// lowongan lengkap dari riwayat tanya-jawab wizard. Sama seperti
// generate-kriteria/run-scoring: dijalankan pakai service role key supaya
// API key provider AI (sandbox_configs) tidak pernah sampai ke browser user.
//
// Kirim `previousDraft` + `revisionNote` untuk merevisi draf yang sudah ada
// (dipakai tombol "Perbaiki") — kalau tidak, draf baru disusun dari nol.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    judul_pekerjaan: { type: 'STRING', description: 'Judul posisi/jabatan yang direkrut' },
    level_jabatan: { type: 'STRING', description: "Level posisi, mis. 'Staff/Junior', 'Supervisor'" },
    ikatan_kerja: { type: 'STRING', description: "Jenis ikatan kerja, mis. 'Waktu Tertentu', 'Waktu Tidak Tertentu', 'Paruh Waktu'" },
    lokasi: { type: 'STRING', description: 'Lokasi/kota tempat bekerja, diekstrak dari jawaban' },
    jumlah_rekrut: { type: 'STRING', description: 'Jumlah orang yang mau direkrut, diekstrak dari jawaban' },
    upah: { type: 'STRING', description: 'Ringkasan upah/gaji yang ditawarkan (mis. "Rp 3.000.000 - 4.000.000 per bulan"), diekstrak dari jawaban' },
    pendidikan_minimal: { type: 'STRING', description: 'Pendidikan minimal yang disyaratkan' },
    pengalaman_minimal: { type: 'STRING', description: 'Pengalaman minimal yang disyaratkan' },
    tentang_peran: { type: 'STRING', description: 'Paragraf singkat menjelaskan gambaran umum peran ini' },
    tanggung_jawab: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Daftar poin tanggung jawab sehari-hari' },
    kualifikasi: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Daftar poin kualifikasi/kriteria kandidat' },
    nilai_tambah: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Daftar poin nilai tambah (nice-to-have), array kosong jika tidak ada' },
    catatan_luna: {
      type: 'STRING',
      description: 'Satu tips praktis dan singkat untuk pemilik usaha terkait posisi ini — gaya hangat seperti rekruter senior berbagi insight (mis. hal yang sering ditanyakan pelamar untuk jenis peran ini, atau cara menaikkan jumlah pelamar). Jangan mengulang isi draf, ini catatan tambahan di luar draf.',
    },
  },
  required: [
    'judul_pekerjaan', 'level_jabatan', 'ikatan_kerja', 'lokasi', 'jumlah_rekrut', 'upah',
    'pendidikan_minimal', 'pengalaman_minimal', 'tentang_peran', 'tanggung_jawab', 'kualifikasi', 'nilai_tambah',
    'catatan_luna',
  ],
}

const OPENAI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    judul_pekerjaan: { type: 'string', description: 'Judul posisi/jabatan yang direkrut' },
    level_jabatan: { type: 'string', description: "Level posisi, mis. 'Staff/Junior', 'Supervisor'" },
    ikatan_kerja: { type: 'string', description: "Jenis ikatan kerja, mis. 'Waktu Tertentu', 'Waktu Tidak Tertentu', 'Paruh Waktu'" },
    lokasi: { type: 'string', description: 'Lokasi/kota tempat bekerja, diekstrak dari jawaban' },
    jumlah_rekrut: { type: 'string', description: 'Jumlah orang yang mau direkrut, diekstrak dari jawaban' },
    upah: { type: 'string', description: 'Ringkasan upah/gaji yang ditawarkan, diekstrak dari jawaban' },
    pendidikan_minimal: { type: 'string', description: 'Pendidikan minimal yang disyaratkan' },
    pengalaman_minimal: { type: 'string', description: 'Pengalaman minimal yang disyaratkan' },
    tentang_peran: { type: 'string', description: 'Paragraf singkat menjelaskan gambaran umum peran ini' },
    tanggung_jawab: { type: 'array', items: { type: 'string' }, description: 'Daftar poin tanggung jawab sehari-hari' },
    kualifikasi: { type: 'array', items: { type: 'string' }, description: 'Daftar poin kualifikasi/kriteria kandidat' },
    nilai_tambah: { type: 'array', items: { type: 'string' }, description: 'Daftar poin nilai tambah (nice-to-have), array kosong jika tidak ada' },
    catatan_luna: {
      type: 'string',
      description: 'Satu tips praktis dan singkat untuk pemilik usaha terkait posisi ini — gaya hangat seperti rekruter senior berbagi insight. Jangan mengulang isi draf.',
    },
  },
  required: [
    'judul_pekerjaan', 'level_jabatan', 'ikatan_kerja', 'lokasi', 'jumlah_rekrut', 'upah',
    'pendidikan_minimal', 'pengalaman_minimal', 'tentang_peran', 'tanggung_jawab', 'kualifikasi', 'nilai_tambah',
    'catatan_luna',
  ],
  additionalProperties: false,
}

const DEFAULT_PROMPT = `Berdasarkan seluruh riwayat jawaban pengguna atas pertanyaan panduan, susun draf lowongan pekerjaan yang lengkap dan rapi: judul posisi, detail (level jabatan, ikatan kerja, lokasi, jumlah rekrut, upah, pendidikan minimal, pengalaman minimal), deskripsi peran, tanggung jawab, kualifikasi, dan nilai tambah (dalam bentuk poin-poin). Tulis dengan bahasa Indonesia yang sederhana dan jujur, sesuai jawaban yang diberikan — jangan mengarang detail yang tidak disebutkan. Sertakan juga satu "catatan dari Luna": tips praktis dan singkat terkait posisi ini, berdasarkan pola umum perekrutan untuk peran sejenis.`

function serializeHistory(history: any[]) {
  if (!history?.length) return '(belum ada jawaban)'
  return history
    .map((h: any, i: number) => `Pertanyaan ${i + 1}: ${h.pertanyaan}\nJawaban: ${(h.jawaban || '').trim() || '(tidak dijawab)'}`)
    .join('\n\n')
}

function normalizeDraft(parsed: any) {
  const jobTitle = String(parsed.judul_pekerjaan || '').trim()
  if (!jobTitle) throw new Error('AI tidak mengembalikan judul lowongan yang valid. Coba lagi.')

  return {
    jobTitle,
    detail: {
      levelJabatan: String(parsed.level_jabatan || '').trim(),
      ikatanKerja: String(parsed.ikatan_kerja || '').trim(),
      lokasi: String(parsed.lokasi || '').trim(),
      jumlahRekrut: String(parsed.jumlah_rekrut || '').trim(),
      upah: String(parsed.upah || '').trim(),
      pendidikan: String(parsed.pendidikan_minimal || '').trim(),
      pengalaman: String(parsed.pengalaman_minimal || '').trim(),
    },
    sections: [
      { title: 'Tentang Peran', type: 'text', content: String(parsed.tentang_peran || '').trim() },
      { title: 'Tanggung Jawab', type: 'list', items: Array.isArray(parsed.tanggung_jawab) ? parsed.tanggung_jawab.map((s: any) => String(s).trim()).filter(Boolean) : [] },
      { title: 'Kualifikasi', type: 'list', items: Array.isArray(parsed.kualifikasi) ? parsed.kualifikasi.map((s: any) => String(s).trim()).filter(Boolean) : [] },
      { title: 'Nilai Tambah', type: 'list', items: Array.isArray(parsed.nilai_tambah) ? parsed.nilai_tambah.map((s: any) => String(s).trim()).filter(Boolean) : [] },
    ],
    catatanLuna: String(parsed.catatan_luna || '').trim(),
  }
}

async function callGeminiForDraft({ userText, apiKey, model, prompt, useFlexMode, temperature }: any) {
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
        console.log(`[buat-lowongan-draft] Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`)
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

async function callOpenAIForDraft({ userText, apiKey, model, prompt, useFlexMode, temperature, reasoningEffort }: any) {
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
        name: 'buat_lowongan_draft_result',
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
        console.log(`[buat-lowongan-draft] (OpenAI) Percobaan ${attempt} gagal (${status}). Menunggu ${delay}ms...`)
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
    const previousDraft = body.previousDraft
    const revisionNote = body.revisionNote

    if (!Array.isArray(history) || history.length === 0) {
      return jsonResponse({ error: true, message: 'Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.' }, 400)
    }

    const [{ data: configData }, { data: promptData }] = await Promise.all([
      supabase.from('sandbox_configs').select('*').order('updated_at', { ascending: false }).limit(1),
      supabase.from('prompt_settings').select('*').eq('type', 'BuatLowonganDraft').limit(1),
    ])

    const config = configData?.[0]
    const promptSetting = promptData?.[0]
    const activeProvider = config?.active_provider === 'openai' ? 'openai' : 'gemini'
    const providerApiKey = activeProvider === 'openai' ? config?.openai_api_key : config?.api_key
    const providerModel = activeProvider === 'openai' ? promptSetting?.model_openai : promptSetting?.model

    if (!providerApiKey || !providerModel) {
      return jsonResponse({ error: true, message: `API Key atau Model AI (${activeProvider}) untuk "Susun Draf Lowongan" belum dikonfigurasi.` }, 500)
    }

    const prompt = promptSetting?.prompt
    const useFlexMode = promptSetting?.use_flex || false
    const temperature = promptSetting?.temperature ?? 0.2
    const reasoningEffort = promptSetting?.reasoning_effort || 'low'

    const historyText = serializeHistory(history)
    const userText = previousDraft
      ? `Riwayat tanya-jawab lengkap:\n${historyText}\n\nDraf sebelumnya (JSON):\n${JSON.stringify(previousDraft)}\n\nInstruksi perbaikan dari pengguna:\n${(revisionNote || '').trim() || '(tidak ada catatan spesifik)'}\n\nPerbaiki draf di atas sesuai instruksi ini. Tetap konsisten dengan jawaban riwayat, jangan mengubah bagian yang tidak diminta.`
      : `Riwayat tanya-jawab lengkap:\n${historyText}\n\nSusun draf lowongan lengkap berdasarkan seluruh jawaban di atas.`

    const callFn = activeProvider === 'openai' ? callOpenAIForDraft : callGeminiForDraft
    const { parsed, usageMetadata } = await callFn({ userText, apiKey: providerApiKey, model: providerModel, prompt, useFlexMode, temperature, reasoningEffort })

    if (usageMetadata) {
      supabase.from('ai_usage_history').insert([{
        model_used: providerModel,
        function_name: 'Buat Lowongan - Susun Draf',
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

    return jsonResponse({ draft: normalizeDraft(parsed), rawParsed: parsed })
  } catch (err: any) {
    console.error('[buat-lowongan-draft] Error:', err)
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal saat menyusun draf.' }, 500)
  }
})
