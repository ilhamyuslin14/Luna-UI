import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

// Server-side CV parsing. Runs with the service role key so the AI provider
// API key (sandbox_configs.api_key) and prompt templates never reach the
// browser — required so anonymous visitors on the public Laman Karir page
// can submit applications without exposing those secrets.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const CV_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_valid_cv: { type: 'BOOLEAN' },
    reason_not_valid: { type: 'STRING', nullable: true },
    detail_kandidat: {
      type: 'OBJECT',
      properties: {
        nama_lengkap: { type: 'STRING', nullable: true },
        linkedin: { type: 'STRING', nullable: true },
        gender: { type: 'STRING', nullable: true },
        tanggal_lahir: { type: 'STRING', nullable: true },
        domisili: { type: 'STRING', nullable: true },
        email: { type: 'STRING', nullable: true },
        no_telpon: { type: 'STRING', nullable: true },
        jurusan: { type: 'STRING', nullable: true },
        universitas: { type: 'STRING', nullable: true },
        perusahaan_saat_ini: { type: 'STRING', nullable: true },
        jabatan_saat_ini: { type: 'STRING', nullable: true },
      },
    },
    detail_tambahan: {
      type: 'OBJECT',
      properties: {
        bidang_industri: { type: 'STRING', nullable: true },
        tahun_terakhir_bekerja: { type: 'INTEGER', nullable: true },
        harapan_upah: { type: 'INTEGER', nullable: true },
        harapan_benefit: { type: 'STRING', nullable: true },
      },
    },
    keahlian: { type: 'ARRAY', items: { type: 'STRING' } },
    pengalaman_kerja: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          jabatan: { type: 'STRING' },
          perusahaan: { type: 'STRING' },
          start: { type: 'STRING' },
          end: { type: 'STRING', nullable: true },
          deskripsi: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
    pendidikan: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          institusi: { type: 'STRING' },
          jenjang: { type: 'STRING' },
          jurusan: { type: 'STRING' },
          start: { type: 'STRING' },
          end: { type: 'STRING', nullable: true },
          gpa: { type: 'STRING', nullable: true },
        },
      },
    },
    sertifikasi: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nama: { type: 'STRING' },
          penerbit: { type: 'STRING', nullable: true },
          start: { type: 'STRING', nullable: true },
          end: { type: 'STRING', nullable: true },
          deskripsi: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
    ai_signal_insight: { type: 'STRING', nullable: true },
  },
  required: ['is_valid_cv'],
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

function calculateTotalExperience(pengalaman) {
  if (!pengalaman || !Array.isArray(pengalaman)) return 0

  const parseDate = (dateStr) => {
    if (!dateStr || ['present', 'sekarang', 'saat ini'].includes(dateStr.toLowerCase())) {
      return new Date()
    }
    if (/^\d{4}$/.test(dateStr.trim())) {
      return new Date(parseInt(dateStr.trim(), 10), 0, 1)
    }
    const monthMap = {
      jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2,
      apr: 3, april: 3, mei: 4, may: 4, jun: 5, juni: 5,
      jul: 6, juli: 6, agu: 7, agustus: 7, aug: 7, august: 7,
      sep: 8, september: 8, okt: 9, oktober: 9, oct: 9, october: 9,
      nov: 10, november: 10, des: 11, desember: 11, dec: 11, december: 11,
    }
    const parts = dateStr.trim().toLowerCase().split(/[\s-]+/)
    let month = 0
    let year = new Date().getFullYear()
    parts.forEach((part) => {
      if (/^\d{4}$/.test(part)) year = parseInt(part, 10)
      else if (monthMap[part] !== undefined) month = monthMap[part]
    })
    return new Date(year, month, 1)
  }

  let totalMonths = 0
  pengalaman.forEach((job) => {
    if (job.start) {
      const startDate = parseDate(job.start)
      const endDate = parseDate(job.end)
      let diff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
      if (diff < 0) diff = 0
      totalMonths += diff
    }
  })
  return parseFloat((totalMonths / 12).toFixed(1))
}

async function callGeminiForParsing({ cvText, fileBase64, fileMimeType, apiKey, model, prompt, useFlexMode, temperature }) {
  const plainText = stripHtml(cvText)
  if (!plainText && !fileBase64) throw new Error('Teks CV dan Dokumen kosong.')
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.')
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.')

  let systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Extract candidate info into JSON.'
  systemPrompt += '\n\nCRITICAL RULE: Determine if the document is a valid CV/Resume belonging to an individual candidate. A valid CV MUST contain specific personal identity (e.g. name, contact info, personal profile). If the document is a Job Vacancy (Lowongan Pekerjaan), Job Description (which lists job requirements/duties but lacks a specific applicant\'s personal identity), brochure, menu, or random article, it is NOT a valid CV. If it is NOT a valid CV, set is_valid_cv to false, provide the reason in reason_not_valid USING INDONESIAN LANGUAGE (Bahasa Indonesia) IN MAXIMUM 8 WORDS (e.g. "Bukan CV, melainkan deskripsi lowongan pekerjaan"), and leave all other fields empty/null. If it is a valid CV of a person, set is_valid_cv to true and extract the information.'
  systemPrompt += '\n\nIMPORTANT DATE RULE: For ALL date fields (e.g. tanggal_lahir, start, end), always use the ISO format YYYY-MM-DD (e.g. "2001-11-19"). If exact day is unknown, use "YYYY-MM-01". If only year is known, use "YYYY-01-01". However, if an end date (for education, experience, etc.) is explicitly described as "Present", "Sekarang", "Saat ini", or similar, return the exact string "Sekarang". If a date is genuinely missing or not mentioned, return null.'
  const modelId = model.startsWith('models/') ? model : `models/${model}`

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [],
    ...(useFlexMode && { service_tier: 'flex' }),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: CV_RESPONSE_SCHEMA,
      temperature: Number(temperature),
    },
  }

  if (fileBase64 && fileMimeType) {
    payload.contents = [{
      parts: [
        { inlineData: { mimeType: fileMimeType, data: fileBase64 } },
        { text: "Berikut adalah file dokumen CV. Tolong analisis dan ekstrak informasinya sesuai format yang diminta." }
      ]
    }]
  } else {
    payload.contents = [{ parts: [{ text: `Dokumen CV:\n${plainText}` }] }]
  }

  const startTime = Date.now()
  let response;
  let data;
  let attempts = 0;
  const maxAttempts = 10; // 1 initial + 9 retries

  while (attempts < maxAttempts) {
    attempts++;
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    
    data = await response.json()
    
    if (response.ok) {
      break; // Berhasil, keluar dari loop
    } else {
      // Jika error karena High Demand (429) atau Server Sibuk (503) dan masih ada kuota retry
      if ((response.status === 429 || response.status === 503) && attempts < maxAttempts) {
        console.warn(`[Gemini API] Server sibuk (HTTP ${response.status}). Mencoba lagi dalam 2.5 detik... (Percobaan ${attempts})`);
        await new Promise(resolve => setTimeout(resolve, 2500)); // Jeda 2.5 detik sebelum retry
      } else {
        // Jika error lain atau sudah melewati batas retry
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
  
  // SANITIZER: Hilangkan karakter null byte (\u0000) dan escaped null byte (\\u0000) yang ditolak PostgreSQL
  rawJson = rawJson.replace(/\0/g, '').replace(/\\u0000/g, '')

  const parsed = JSON.parse(rawJson)

  if (parsed.detail_kandidat && Array.isArray(parsed.pengalaman_kerja)) {
    parsed.detail_kandidat.pengalaman_kerja_tahun = calculateTotalExperience(parsed.pengalaman_kerja)
  }

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

async function removeStorageFile(cvUrl) {
  if (!cvUrl) return
  const parts = cvUrl.split('/cv_documents/')
  if (parts.length > 1) {
    await supabase.storage.from('cv_documents').remove([parts[1]])
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { companyId, fileHash, fileName, cvUrl, posisi, sumber } = body
    // CEGAT NULL BYTE DARI FRONTEND: Bersihkan rawText sebelum masuk sistem
    const rawText = typeof body.rawText === 'string' ? body.rawText.replace(/\0/g, '') : ''

    if (!companyId || !fileHash || !cvUrl) {
      return jsonResponse({ error: true, message: 'Data tidak lengkap untuk memproses CV.' })
    }

    // 1. Cek duplikat (hanya untuk perusahaan yang sama)
    const { data: existing } = await supabase
      .from('kandidat')
      .select('id, nama_lengkap')
      .eq('file_hash', fileHash)
      .eq('company_id', companyId)
      .limit(1)
      .single()

    if (existing) {
      await removeStorageFile(cvUrl)
      return jsonResponse({ duplicate: true, existingKandidatId: existing.id, namaLengkap: existing.nama_lengkap })
    }

    // 2. Ambil konfigurasi AI (server-side only — tidak pernah dikirim ke browser)
    const [{ data: configData }, { data: promptData }] = await Promise.all([
      supabase.from('sandbox_configs').select('*').limit(1).single(),
      supabase.from('prompt_settings').select('*').eq('type', 'CV').limit(1).single(),
    ])

    if (!configData?.api_key || !promptData) {
      await removeStorageFile(cvUrl)
      return jsonResponse({ error: true, message: 'Konfigurasi AI belum lengkap. Harap isi API Key dan Prompt Settings di halaman Konfigurasi.' })
    }

    // 3. Fallback Fetch PDF if rawText is empty
    let finalPlainText = stripHtml(rawText || '')
    let fileBase64 = null
    let fileMimeType = null

    if (!finalPlainText) {
      try {
        const fileRes = await fetch(cvUrl)
        if (fileRes.ok) {
          const arrayBuffer = await fileRes.arrayBuffer()
          fileBase64 = encode(new Uint8Array(arrayBuffer))
          const ext = fileName?.split('.').pop()?.toLowerCase() || ''
          if (ext === 'pdf') fileMimeType = 'application/pdf'
          else if (['jpg', 'jpeg'].includes(ext)) fileMimeType = 'image/jpeg'
          else if (ext === 'png') fileMimeType = 'image/png'
        }
      } catch (e) {
        console.error('[parse-cv] Gagal fetch fallback CV:', e)
      }

      if (!fileBase64 || !fileMimeType) {
        await removeStorageFile(cvUrl)
        return jsonResponse({ error: true, message: 'Teks CV gagal diekstrak dan format dokumen tidak didukung untuk AI OCR.' })
      }
    }

    // 4. Panggil AI Parsing
    let parsedData, rawJson, usageMetadata
    try {
      const result = await callGeminiForParsing({
        cvText: rawText,
        fileBase64,
        fileMimeType,
        apiKey: configData.api_key,
        model: promptData.model || 'gemini-1.5-pro',
        prompt: promptData.prompt,
        useFlexMode: promptData.use_flex,
        temperature: promptData.temperature || 0.2,
      })
      parsedData = result.parsedData
      rawJson = result.rawJson
      usageMetadata = result.usageMetadata
    } catch (err) {
      await removeStorageFile(cvUrl)
      return jsonResponse({ error: true, message: err.message || 'Gagal memproses dokumen dengan AI.' })
    }

    // Catat log usage AI (best-effort) - Pindahkan ke atas agar tercatat walau dokumen invalid
    if (usageMetadata) {
      supabase.from('ai_usage_history').insert([{
        model_used: promptData.model || 'gemini-1.5-pro',
        function_name: 'Generate CV Parsing',
        input_tokens: usageMetadata.promptTokenCount || 0,
        output_tokens: usageMetadata.candidatesTokenCount || 0,
        total_tokens: usageMetadata.totalTokenCount || 0,
        latency_ms: usageMetadata.latency || 0,
        input_text: stripHtml(rawText).substring(0, 5000),
        output_json: parsedData,
        is_flex_mode: !!promptData.use_flex,
      }]).then(({ error }) => { if (error) console.error('Gagal mencatat log usage CV Parsing:', error) })
    }

    if (parsedData?.is_valid_cv === false) {
      await removeStorageFile(cvUrl)
      return jsonResponse({ error: true, message: parsedData.reason_not_valid || 'Dokumen bukan CV yang valid.' })
    }

    // 4. Simpan ke database
    const dk = parsedData?.detail_kandidat || {}
    const dt = parsedData?.detail_tambahan || {}

    const kandidatRecord = {
      company_id: companyId,
      nama_lengkap: dk.nama_lengkap || `CV Baru (${fileName || 'tanpa nama'})`,
      cv_url: cvUrl,
      parsing_status: 'completed',
      raw_text: rawText,
      output_ai_raw: rawJson,

      email: dk.email || null,
      phone: dk.no_telpon || null,
      linkedin_url: dk.linkedin || null,
      gender: dk.gender || null,
      tgl_lahir: dk.tanggal_lahir || null,
      domisili: dk.domisili || null,
      universitas: dk.universitas || null,
      jurusan: dk.jurusan || null,
      perusahaan_saat_ini: dk.perusahaan_saat_ini || null,
      jabatan_saat_ini: dk.jabatan_saat_ini || null,
      pengalaman_tahun: dk.pengalaman_kerja_tahun != null ? String(dk.pengalaman_kerja_tahun) : null,

      industri: dt.bidang_industri || null,
      tahun_terakhir_bekerja: dt.tahun_terakhir_bekerja != null ? String(dt.tahun_terakhir_bekerja) : null,
      harapan_upah: dt.harapan_upah != null ? String(dt.harapan_upah) : null,
      harapan_benefit: dt.harapan_benefit || null,

      skills: parsedData?.keahlian || [],
      pengalaman_kerja: parsedData?.pengalaman_kerja || [],
      pendidikan: parsedData?.pendidikan || [],
      sertifikasi: parsedData?.sertifikasi || [],
      file_hash: fileHash,
      sumber: sumber || 'hr_dashboard',
    }

    // DEEP SANITIZER BULLETPROOF:
    // Kadang karakter \u0000 bersembunyi jauh di dalam array/object bersarang.
    // Cara paling aman adalah ubah object jadi string, hapus \u0000, lalu kembalikan ke object.
    const safeInsertDataString = JSON.stringify(kandidatRecord).replace(/\\u0000/g, '').replace(/\\u000/g, '')
    const safeInsertData = JSON.parse(safeInsertDataString)

    const { data: savedKandidat, error: saveErr } = await supabase
      .from('kandidat')
      .insert([safeInsertData])
      .select()
      .single()

    if (saveErr) {
      console.error('[parse-cv] Error saat menyimpan data ke tabel kandidat:', saveErr)
      console.error('[parse-cv] PAYLOAD INSERT GAGAL (kandidat):', safeInsertDataString)
      return jsonResponse({ error: true, message: `Gagal menyimpan data ke database: ${saveErr.message}. Buka Logs Supabase untuk detailnya.` })
    }

    // 6. Simpan Raw Data (Gunakan Deep Sanitizer juga untuk memastikan aman)
    const safeParsedDataString = JSON.stringify(parsedData).replace(/\\u0000/g, '').replace(/\\u000/g, '')
    const safeParsedData = JSON.parse(safeParsedDataString)

    const { error: rawSaveErr } = await supabase.from('kandidat_raw_data').insert([{
      kandidat_id: savedKandidat.id,
      ai_response_json: safeParsedData,
      raw_text: rawText || '',
    }])

    if (rawSaveErr) {
      console.error('[parse-cv] Error saat menyimpan data ke tabel kandidat_raw_data:', rawSaveErr)
      console.error('[parse-cv] PAYLOAD INSERT GAGAL (kandidat_raw_data):', safeParsedDataString)
    }

    return jsonResponse({ kandidat: savedKandidat })
  } catch (err) {
    console.error('[parse-cv] Error:', err)
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal saat memproses CV.' })
  }
})
