import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

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
        jabatan_saat_ini: { type: 'STRING', nullable: true }
      }
    },
    detail_tambahan: {
      type: 'OBJECT',
      properties: {
        bidang_industri: { type: 'STRING', nullable: true },
        tahun_terakhir_bekerja: { type: 'INTEGER', nullable: true },
        harapan_upah: { type: 'INTEGER', nullable: true },
        harapan_benefit: { type: 'STRING', nullable: true }
      }
    },
    keahlian: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    pengalaman_kerja: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          jabatan: { type: 'STRING' },
          perusahaan: { type: 'STRING' },
          start: { type: 'STRING' },
          end: { type: 'STRING', nullable: true },
          deskripsi: { type: 'ARRAY', items: { type: 'STRING' } }
        }
      }
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
          gpa: { type: 'STRING', nullable: true }
        }
      }
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
          deskripsi: { type: 'ARRAY', items: { type: 'STRING' } }
        }
      }
    },
    ai_signal_insight: { type: 'STRING', nullable: true }
  },
  required: ["is_valid_cv"]
};

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
 * Menghitung total pengalaman kerja dalam tahun berdasarkan array pengalaman.
 * Menangani format string seperti "Januari 2022", "Agustus 2021", "Present", "Sekarang", "2021".
 */
function calculateTotalExperience(pengalaman) {
  if (!pengalaman || !Array.isArray(pengalaman)) return 0;
  
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'sekarang' || dateStr.toLowerCase() === 'saat ini') {
      return new Date();
    }
    // Jika hanya tahun (misal "2022")
    if (/^\d{4}$/.test(dateStr.trim())) {
      return new Date(parseInt(dateStr.trim(), 10), 0, 1);
    }
    // Map bulan bahasa indonesia/inggris ke angka
    const monthMap = {
      'jan': 0, 'januari': 0, 'feb': 1, 'februari': 1, 'mar': 2, 'maret': 2,
      'apr': 3, 'april': 3, 'mei': 4, 'may': 4, 'jun': 5, 'juni': 5,
      'jul': 6, 'juli': 6, 'agu': 7, 'agustus': 7, 'aug': 7, 'august': 7,
      'sep': 8, 'september': 8, 'okt': 9, 'oktober': 9, 'oct': 9, 'october': 9,
      'nov': 10, 'november': 10, 'des': 11, 'desember': 11, 'dec': 11, 'december': 11
    };
    
    const parts = dateStr.trim().toLowerCase().split(/[\s-]+/);
    let month = 0;
    let year = new Date().getFullYear();
    
    parts.forEach(part => {
      if (/^\d{4}$/.test(part)) year = parseInt(part, 10);
      else if (monthMap[part] !== undefined) month = monthMap[part];
    });
    
    return new Date(year, month, 1);
  };

  let totalMonths = 0;
  
  pengalaman.forEach(job => {
    if (job.start) {
      const startDate = parseDate(job.start);
      const endDate = parseDate(job.end);
      
      let diff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      if (diff < 0) diff = 0;
      totalMonths += diff;
    }
  });

  return parseFloat((totalMonths / 12).toFixed(1));
}

/**
 * Memanggil Gemini API untuk memparsing CV menjadi JSON terstruktur
 */
export async function generateCVParsing({ cvText, apiKey, model, prompt, useFlexMode = false, temperature = 0.2 }) {
  const plainText = stripHtml(cvText);

  if (!plainText) throw new Error('Teks CV kosong. Unggah atau tempel CV terlebih dahulu.');
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.');
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.');

  let systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : 'Extract candidate info into JSON.';
  systemPrompt += '\n\nCRITICAL RULE: Determine if the document is a valid CV/Resume belonging to an individual candidate. A valid CV MUST contain specific personal identity (e.g. name, contact info, personal profile). If the document is a Job Vacancy (Lowongan Pekerjaan), Job Description (which lists job requirements/duties but lacks a specific applicant\'s personal identity), brochure, menu, or random article, it is NOT a valid CV. If it is NOT a valid CV, set is_valid_cv to false, provide the reason in reason_not_valid USING INDONESIAN LANGUAGE (Bahasa Indonesia) IN MAXIMUM 8 WORDS (e.g. "Bukan CV, melainkan deskripsi lowongan pekerjaan"), and leave all other fields empty/null. If it is a valid CV of a person, set is_valid_cv to true and extract the information.';
  systemPrompt += '\n\nIMPORTANT DATE RULE: For ALL date fields (e.g. tanggal_lahir, start, end), always use the ISO format YYYY-MM-DD (e.g. "2001-11-19"). If exact day is unknown, use "YYYY-MM-01". If only year is known, use "YYYY-01-01". However, if an end date (for education, experience, etc.) is explicitly described as "Present", "Sekarang", "Saat ini", or similar, return the exact string "Sekarang". If a date is genuinely missing or not mentioned, return null.';
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
        contents: [{ parts: [{ text: `Dokumen CV:\n${plainText}` }] }],
        ...(useFlexMode && { service_tier: 'flex' }),
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: CV_RESPONSE_SCHEMA,
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
    
    // Injeksi hasil kalkulasi pengalaman kerja secara manual
    if (parsed.detail_kandidat && Array.isArray(parsed.pengalaman_kerja)) {
      parsed.detail_kandidat.pengalaman_kerja_tahun = calculateTotalExperience(parsed.pengalaman_kerja);
    }

    // Log ke ai_usage_history
    if (data.usageMetadata) {
      const usage = data.usageMetadata;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Generate CV Parsing',
        input_tokens: usage.promptTokenCount || 0,
        output_tokens: usage.candidatesTokenCount || 0,
        total_tokens: usage.totalTokenCount || 0,
        latency_ms: latency,
        input_text: plainText.substring(0, 5000),
        output_json: parsed,
        is_flex_mode: useFlexMode
      }]).then(({ error }) => {
        if (error) console.error('Gagal mencatat log usage CV Parsing:', error);
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
