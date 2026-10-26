import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Kartu "Kecocokan dengan CV kamu" di laman detail lowongan (sisi pelamar).
// Membandingkan resume pelamar yang login (public.pelamar_resumes) dengan satu
// lowongan (Luna: public.seleksi, atau eksternal: public.lowongan_eksternal),
// lalu menyimpan hasilnya di public.pelamar_kecocokan.
//
// Pembagian tugas: AI hanya menilai tiap aspek (0-100) dan menulis poin
// "yang sudah cocok" / "yang bisa dilengkapi". Skor total dan label dihitung di
// sini (bobot tetap), supaya konsisten dan tidak bergantung pada tebakan model.
//
// Identitas pelamar SELALU dari JWT, tidak pernah dari body. Prompt, model, dan
// API key AI dibaca server-side (prompt_settings tipe 'KecocokanCV' dan
// sandbox_configs) sehingga tidak pernah sampai ke browser.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Batas perhitungan AI baru per pelamar per hari dibaca dari prompt_settings.batas_harian (cache tidak dihitung).
const BOBOT = { keahlian: 35, pengalaman: 30, kualifikasi: 20, pendidikan: 15 } as const
const ASPEK = Object.keys(BOBOT) as Array<keyof typeof BOBOT>
const BATAS_ATAS_DARI_INTI = 10 // skor total <= rata-rata (keahlian, pengalaman) + angka ini
const MAKS_POIN = 4
const MAKS_PANJANG_POIN = 160
const MAKS_PANJANG_CATATAN = 200

// Tingkat kecocokan: 0-30 Rendah, 31-70 Sedang, 71-100 Tinggi (selaras dengan labelFor di frontend).
function labelFor(score: number) {
  if (score >= 71) return 'Tinggi'
  if (score >= 31) return 'Sedang'
  return 'Rendah'
}

// ── Skema keluaran AI ─────────────────────────────────────────────────────

const GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    aspek: {
      type: 'OBJECT',
      properties: Object.fromEntries(ASPEK.map((a) => [a, {
        type: 'OBJECT',
        properties: {
          skor: { type: 'INTEGER', nullable: true, minimum: 0, maximum: 100 },
          catatan: { type: 'STRING' },
        },
        required: ['skor', 'catatan'],
      }])),
      required: ASPEK,
    },
    yang_sudah_cocok: { type: 'ARRAY', items: { type: 'STRING' } },
    yang_bisa_dilengkapi: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['aspek', 'yang_sudah_cocok', 'yang_bisa_dilengkapi'],
}

const OPENAI_SCHEMA = {
  type: 'object',
  properties: {
    aspek: {
      type: 'object',
      properties: Object.fromEntries(ASPEK.map((a) => [a, {
        type: 'object',
        properties: {
          skor: { type: ['integer', 'null'] },
          catatan: { type: 'string' },
        },
        required: ['skor', 'catatan'],
        additionalProperties: false,
      }])),
      required: ASPEK,
      additionalProperties: false,
    },
    yang_sudah_cocok: { type: 'array', items: { type: 'string' } },
    yang_bisa_dilengkapi: { type: 'array', items: { type: 'string' } },
  },
  required: ['aspek', 'yang_sudah_cocok', 'yang_bisa_dilengkapi'],
  additionalProperties: false,
}

// ── Util ──────────────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined) {
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

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Model reasoning OpenAI menolak parameter `temperature`.
function isOpenAIReasoningModel(model: string) {
  return /^(gpt-[5-9]|o[1-9])/i.test(model)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

class KecocokanError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

// ── Data lowongan & resume ────────────────────────────────────────────────

function serializeKriteria(kriteria: unknown) {
  if (!Array.isArray(kriteria)) return ''
  return kriteria.map((k: any, i: number) => {
    const baris = [`${i + 1}. [${k.kategori || 'Wajib'}] ${k.tag || ''}`]
    if (k.teks) baris.push(`   ${stripHtml(k.teks)}`)
    return baris.join('\n')
  }).join('\n')
}

async function muatLowongan(jobKey: string) {
  const sep = jobKey.indexOf(':')
  if (sep < 1) throw new KecocokanError('lowongan-tidak-ada', 'Lowongan tidak ditemukan atau sudah tidak aktif.')
  const source = jobKey.slice(0, sep)
  const id = jobKey.slice(sep + 1)

  if (source === 'luna') {
    const { data, error } = await supabase
      .from('seleksi')
      .select('jabatan, lokasi, ikatan_kerja, level_jabatan, pendidikan, pengalaman, deskripsi, kriteria, status, arsip, companies(name)')
      .eq('id', id)
      .maybeSingle()
    if (error || !data || data.status !== 'Aktif' || data.arsip) throw new KecocokanError('lowongan-tidak-ada', 'Lowongan tidak ditemukan atau sudah tidak aktif.')
    const teks = [
      `Judul: ${data.jabatan}`,
      `Perusahaan: ${(data as any).companies?.name || '-'}`,
      data.level_jabatan && `Level jabatan: ${data.level_jabatan}`,
      data.lokasi && `Lokasi: ${data.lokasi}`,
      data.ikatan_kerja && `Ikatan kerja: ${data.ikatan_kerja}`,
      data.pendidikan && `Pendidikan minimal: ${data.pendidikan}`,
      data.pengalaman && `Pengalaman minimal: ${data.pengalaman} tahun`,
      data.deskripsi && `Deskripsi:\n${stripHtml(data.deskripsi)}`,
      serializeKriteria(data.kriteria) && `Kriteria:\n${serializeKriteria(data.kriteria)}`,
    ].filter(Boolean).join('\n')
    return { teks: teks.slice(0, 8000), judul: data.jabatan as string }
  }

  const { data, error } = await supabase
    .from('lowongan_eksternal')
    .select('title, company_name, location, category, employment_type_raw, description, status')
    .eq('id', id)
    .eq('source', source)
    .maybeSingle()
  if (error || !data || data.status !== 'aktif') throw new KecocokanError('lowongan-tidak-ada', 'Lowongan tidak ditemukan atau sudah tidak aktif.')
  const teks = [
    `Judul: ${data.title}`,
    `Perusahaan: ${data.company_name || '-'}`,
    data.location && `Lokasi: ${data.location}`,
    data.category && `Kategori: ${data.category}`,
    data.employment_type_raw && `Ikatan kerja: ${data.employment_type_raw}`,
    data.description && `Deskripsi:\n${stripHtml(data.description)}`,
  ].filter(Boolean).join('\n')
  return { teks: teks.slice(0, 8000), judul: data.title as string }
}

// Hanya data profesional. Sengaja tanpa nama, kontak, gender, dan tanggal lahir:
// tidak dibutuhkan untuk menilai kecocokan dan mengurangi risiko bias.
function resumeUntukAI(r: any) {
  return JSON.stringify({
    jabatan_saat_ini: r.jabatan_saat_ini,
    perusahaan_saat_ini: r.perusahaan_saat_ini,
    total_pengalaman_tahun: r.pengalaman_tahun,
    industri: r.industri,
    domisili: r.domisili,
    keahlian: r.skills,
    pengalaman_kerja: r.pengalaman_kerja,
    pendidikan: r.pendidikan,
    sertifikasi: r.sertifikasi,
  }).slice(0, 12000)
}

// ── Panggilan AI ──────────────────────────────────────────────────────────

async function panggilAI(opts: {
  provider: 'openai' | 'gemini'
  apiKey: string
  model: string
  prompt: string
  useFlex: boolean
  temperature: number
  reasoningEffort: string
  userText: string
}) {
  const { provider, apiKey, model, prompt, useFlex, temperature, reasoningEffort, userText } = opts
  const startTime = Date.now()
  let response: Response
  let data: any
  let attempts = 0
  const maxAttempts = 6

  while (true) {
    attempts++
    if (provider === 'openai') {
      const payload = {
        model,
        instructions: prompt,
        input: [{ role: 'user', content: [{ type: 'input_text', text: userText }] }],
        ...(useFlex && { service_tier: 'flex' }),
        ...(isOpenAIReasoningModel(model)
          ? { reasoning: { effort: reasoningEffort || 'low' } }
          : { temperature }),
        text: { verbosity: 'low', format: { type: 'json_schema', name: 'kecocokan_cv', strict: true, schema: OPENAI_SCHEMA } },
      }
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      })
    } else {
      const modelId = model.startsWith('models/') ? model : `models/${model}`
      const payload = {
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [{ parts: [{ text: userText }] }],
        ...(useFlex && { service_tier: 'flex' }),
        generationConfig: { responseMimeType: 'application/json', responseSchema: GEMINI_SCHEMA, temperature },
      }
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    data = await response.json()
    if (response.ok) break
    if ((response.status === 429 || response.status === 503) && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2500))
      continue
    }
    console.error('[hitung-kecocokan] Error dari penyedia AI:', response.status, data?.error?.message)
    throw new KecocokanError('ai-gagal', 'Kecocokan belum bisa dihitung sekarang. Coba lagi sebentar lagi.')
  }

  const latency = Date.now() - startTime
  let contentText: string | undefined
  let usage: { input: number; output: number; total: number }
  if (provider === 'openai') {
    const messageItem = (data.output || []).find((o: any) => o.type === 'message')
    contentText = messageItem?.content?.find((c: any) => c.type === 'output_text')?.text
    usage = { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0, total: data.usage?.total_tokens || 0 }
  } else {
    contentText = data.candidates?.[0]?.content?.parts?.[0]?.text
    usage = { input: data.usageMetadata?.promptTokenCount || 0, output: data.usageMetadata?.candidatesTokenCount || 0, total: data.usageMetadata?.totalTokenCount || 0 }
  }
  if (!contentText) throw new KecocokanError('ai-gagal', 'Respon AI kosong. Coba lagi.')

  let raw = contentText.trim()
  if (raw.startsWith('```')) raw = raw.replace(/^```(json)?\n/, '').replace(/\n```$/, '')
  return { parsed: JSON.parse(raw), usage, latency }
}

// ── Pembersihan & penghitungan ────────────────────────────────────────────

function bersihkanPoin(arr: unknown) {
  if (!Array.isArray(arr)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of arr) {
    if (typeof item !== 'string') continue
    const t = item.replace(/\s+/g, ' ').trim().slice(0, MAKS_PANJANG_POIN)
    const k = t.toLowerCase()
    if (!t || seen.has(k)) continue
    seen.add(k)
    out.push(t)
    if (out.length >= MAKS_POIN) break
  }
  return out
}

function hitungSkor(aspek: any) {
  let jumlahBobot = 0
  let jumlah = 0
  const rapi: Record<string, { skor: number | null; catatan: string }> = {}
  for (const a of ASPEK) {
    const skorMentah = aspek?.[a]?.skor
    const skor = Number.isFinite(skorMentah) ? Math.max(0, Math.min(100, Math.round(skorMentah))) : null
    rapi[a] = { skor, catatan: String(aspek?.[a]?.catatan || '').slice(0, MAKS_PANJANG_CATATAN) }
    if (skor !== null) {
      jumlah += skor * BOBOT[a]
      jumlahBobot += BOBOT[a]
    }
  }
  // Aspek tanpa syarat di lowongan (skor null) dikeluarkan, bobotnya dinormalisasi ulang.
  if (!jumlahBobot) return null
  let score = Math.round(jumlah / jumlahBobot)

  // Pagar inti: kalau keahlian dan pengalaman (inti kecocokan) rendah, aspek lain
  // (misalnya pendidikan atau kualifikasi umum) tidak boleh mengangkat skor total
  // jauh di atasnya. Model kecil sering terlalu murah hati di aspek "pendamping".
  const inti = (['keahlian', 'pengalaman'] as const).map((a) => rapi[a].skor).filter((s): s is number => s !== null)
  if (inti.length) {
    const rataInti = inti.reduce((x, y) => x + y, 0) / inti.length
    score = Math.min(score, Math.round(rataInti + BATAS_ATAS_DARI_INTI))
  }
  return { score, aspek: rapi }
}

// ── Handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let pelamarId: string | null = null
  let kuotaDiambil = false

  try {
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return jsonResponse({ error: true, code: 'sesi', message: 'Sesi tidak valid. Silakan masuk ulang.' }, 401)
    pelamarId = user.id

    const body = await req.json()
    const jobKey = typeof body.jobKey === 'string' ? body.jobKey.trim() : ''
    const force = body.force === true
    if (!jobKey) return jsonResponse({ error: true, code: 'data', message: 'Lowongan tidak diketahui.' })

    const { data: resume } = await supabase.from('pelamar_resumes').select('*').eq('pelamar_id', pelamarId).maybeSingle()
    if (!resume || resume.parsing_status !== 'completed') {
      return jsonResponse({ error: true, code: 'no-cv', message: 'Unggah CV di profil kamu terlebih dahulu.' })
    }

    const lowongan = await muatLowongan(jobKey)

    const [{ data: config }, { data: setting }] = await Promise.all([
      supabase.from('sandbox_configs').select('*').limit(1).single(),
      supabase.from('prompt_settings').select('*').eq('type', 'KecocokanCV').limit(1).single(),
    ])
    if (!setting?.prompt) return jsonResponse({ error: true, code: 'konfigurasi', message: 'Fitur kecocokan belum dikonfigurasi.' })

    const provider = config?.active_provider === 'openai' ? 'openai' : 'gemini'
    const apiKey = provider === 'openai' ? config?.openai_api_key : config?.api_key
    const model = provider === 'openai' ? setting.model_openai : setting.model
    if (!apiKey || !model) return jsonResponse({ error: true, code: 'konfigurasi', message: 'Fitur kecocokan belum dikonfigurasi.' })

    const resumeTeks = resumeUntukAI(resume)
    const inputHash = await sha256([resume.file_hash || '', resumeTeks, lowongan.teks, setting.prompt, model].join('|'))

    // Cache: input yang sama persis tidak dihitung ulang dan tidak memakai kuota.
    const { data: ada } = await supabase.from('pelamar_kecocokan').select('*').eq('pelamar_id', pelamarId).eq('job_key', jobKey).maybeSingle()
    if (ada && ada.input_hash === inputHash && !force) {
      return jsonResponse({ cached: true, result: formatHasil(ada) })
    }

    // Batas harian diatur dari Sandbox (prompt_settings.batas_harian); kosong = tanpa batas.
    const batas = setting.batas_harian
    if (batas != null) {
      const { data: diberi, error: kuotaErr } = await supabase.rpc('klaim_kuota_kecocokan', { p_pelamar: pelamarId, p_batas: Number(batas) })
      if (kuotaErr) throw kuotaErr
      if (!diberi) {
        return jsonResponse({ error: true, code: 'kuota', message: `Batas ${batas} pengecekan kecocokan hari ini sudah tercapai. Coba lagi besok.` })
      }
      kuotaDiambil = true
    }

    const { parsed, usage, latency } = await panggilAI({
      provider,
      apiKey,
      model,
      prompt: setting.prompt.trim(),
      useFlex: !!setting.use_flex,
      temperature: Number(setting.temperature ?? 0.2),
      reasoningEffort: setting.reasoning_effort || 'low',
      userText: `Lowongan:\n${lowongan.teks}\n\nCV Pelamar (data hasil parsing):\n${resumeTeks}`,
    })

    const hitung = hitungSkor(parsed.aspek)
    if (!hitung) {
      throw new KecocokanError('tidak-bisa-dinilai', 'Lowongan ini belum memuat syarat yang cukup untuk dinilai.')
    }

    const pros = bersihkanPoin(parsed.yang_sudah_cocok)
    const cons = bersihkanPoin(parsed.yang_bisa_dilengkapi)
    const now = new Date().toISOString()

    const { data: tersimpan, error: simpanErr } = await supabase
      .from('pelamar_kecocokan')
      .upsert([{
        pelamar_id: pelamarId,
        job_key: jobKey,
        score: hitung.score,
        label: labelFor(hitung.score),
        aspek: hitung.aspek,
        pros,
        cons,
        resume_hash: resume.file_hash || null,
        input_hash: inputHash,
        model_used: model,
        updated_at: now,
      }], { onConflict: 'pelamar_id,job_key' })
      .select()
      .single()
    if (simpanErr) throw simpanErr

    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Generate Kecocokan CV (Pelamar)',
      input_tokens: usage.input,
      output_tokens: usage.output,
      total_tokens: usage.total,
      latency_ms: latency,
      input_text: `[LOWONGAN: ${jobKey}] [LENGTH: ${lowongan.teks.length}] [CV LENGTH: ${resumeTeks.length}]`,
      output_json: parsed,
      is_flex_mode: !!setting.use_flex,
    }]).then(({ error }) => { if (error) console.error('Gagal mencatat log usage Kecocokan CV:', error) })

    return jsonResponse({ cached: false, result: formatHasil(tersimpan) })
  } catch (err) {
    // Jatah dikembalikan bila gagal sebelum hasil tersimpan.
    if (kuotaDiambil && pelamarId) {
      await supabase.rpc('kembalikan_kuota_kecocokan', { p_pelamar: pelamarId }).then(() => {}, () => {})
    }
    if (err instanceof KecocokanError) return jsonResponse({ error: true, code: err.code, message: err.message })
    console.error('[hitung-kecocokan] Error:', err)
    return jsonResponse({ error: true, code: 'internal', message: 'Kecocokan belum bisa dihitung sekarang. Coba lagi sebentar lagi.' })
  }
})

function formatHasil(row: any) {
  return {
    score: row.score,
    label: row.label,
    pros: row.pros || [],
    cons: row.cons || [],
    aspek: row.aspek || {},
    createdAt: row.updated_at || row.created_at,
  }
}
