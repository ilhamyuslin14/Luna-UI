// ── generateBuatLowonganDraft.js ────────────────────────────────────────────
// Generate draf lowongan lengkap dari seluruh riwayat tanya-jawab wizard
// "Buat Lowongan dengan Bantuan Luna", menggunakan Gemini AI.
//
// Fungsi yang sama juga dipakai untuk tombol "Perbaiki" — kirim `previousDraft`
// + `revisionNote` supaya AI merevisi draf yang sudah ada, bukan membuat dari
// nol lagi.
//
// Usage:
//   import { generateBuatLowonganDraft } from '../../utils/generateBuatLowonganDraft';
//   const { draft, rawJson } = await generateBuatLowonganDraft({
//     history, apiKey, model, prompt, useFlexMode, temperature
//   });
//
// Output:
//   draft — { jobTitle, detail: { levelJabatan, ikatanKerja, lokasi,
//            jumlahRekrut, upah, pendidikan, pengalaman }, sections: [...] },
//            bentuknya identik dengan GENERATED_RESULT milik wizard dummy,
//            jadi komponen wizard bisa merender apa adanya tanpa perubahan.
//   rawJson — string JSON mentah dari AI, untuk ditampilkan di output box sandbox
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qxmkwfncpxcibjnwnmup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94'
);

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
};

const DEFAULT_PROMPT = `Berdasarkan seluruh riwayat jawaban pengguna atas pertanyaan panduan, susun draf lowongan pekerjaan yang lengkap dan rapi: judul posisi, detail (level jabatan, ikatan kerja, lokasi, jumlah rekrut, upah, pendidikan minimal, pengalaman minimal), deskripsi peran, tanggung jawab, kualifikasi, dan nilai tambah (dalam bentuk poin-poin). Tulis dengan bahasa Indonesia yang sederhana dan jujur, sesuai jawaban yang diberikan — jangan mengarang detail yang tidak disebutkan. Sertakan juga satu "catatan dari Luna": tips praktis dan singkat terkait posisi ini, berdasarkan pola umum perekrutan untuk peran sejenis.`;

function serializeHistory(history) {
  if (!history?.length) return '(belum ada jawaban)';
  return history
    .map((h, i) => `Pertanyaan ${i + 1}: ${h.pertanyaan}\nJawaban: ${h.jawaban?.trim() || '(tidak dijawab)'}`)
    .join('\n\n');
}

function normalizeDraft(parsed) {
  const jobTitle = String(parsed.judul_pekerjaan || '').trim();
  if (!jobTitle) throw new Error('AI tidak mengembalikan judul lowongan yang valid. Coba lagi.');

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
      { title: 'Tanggung Jawab', type: 'list', items: Array.isArray(parsed.tanggung_jawab) ? parsed.tanggung_jawab.map(s => String(s).trim()).filter(Boolean) : [] },
      { title: 'Kualifikasi', type: 'list', items: Array.isArray(parsed.kualifikasi) ? parsed.kualifikasi.map(s => String(s).trim()).filter(Boolean) : [] },
      { title: 'Nilai Tambah', type: 'list', items: Array.isArray(parsed.nilai_tambah) ? parsed.nilai_tambah.map(s => String(s).trim()).filter(Boolean) : [] },
    ],
    catatanLuna: String(parsed.catatan_luna || '').trim(),
  };
}

/**
 * Generate (atau revisi) draf lowongan lengkap via Gemini API.
 *
 * @param {Object} params
 * @param {Array}   params.history        - Riwayat [{ pertanyaan, jawaban }] lengkap dari sesi wizard
 * @param {Object}  [params.previousDraft] - Draf sebelumnya (bentuk mentah hasil parse AI), dikirim saat "Perbaiki"
 * @param {string}  [params.revisionNote]  - Instruksi perbaikan dari pengguna, dikirim saat "Perbaiki"
 * @param {string}  params.apiKey         - Gemini API key
 * @param {string}  params.model          - ID model Gemini
 * @param {string}  [params.prompt]       - Override system prompt dari Sandbox config
 * @param {boolean} [params.useFlexMode]  - Aktifkan Flex Mode
 * @param {number}  [params.temperature]  - Tingkat kreativitas AI (0.0 - 2.0)
 *
 * @returns {Promise<{ draft: Object, rawParsed: Object, rawJson: string }>}
 * @throws  {Error} jika API gagal atau respon kosong/tidak valid
 */
export async function generateBuatLowonganDraft({
  history,
  previousDraft,
  revisionNote,
  apiKey,
  model,
  prompt,
  useFlexMode = false,
  temperature = 0.2,
}) {
  if (!history?.length) throw new Error('Riwayat jawaban kosong. Minimal ada 1 pertanyaan yang sudah dijawab.');
  if (!apiKey) throw new Error('API Key belum dikonfigurasi.');
  if (!model) throw new Error('Model AI belum dipilih. Cek tab Konfigurasi API.');

  const systemPrompt = (prompt && prompt.trim()) ? prompt.trim() : DEFAULT_PROMPT;
  const modelId = model.startsWith('models/') ? model : `models/${model}`;

  const historyText = serializeHistory(history);
  const userText = previousDraft
    ? `Riwayat tanya-jawab lengkap:\n${historyText}\n\nDraf sebelumnya (JSON):\n${JSON.stringify(previousDraft)}\n\nInstruksi perbaikan dari pengguna:\n${revisionNote?.trim() || '(tidak ada catatan spesifik)'}\n\nPerbaiki draf di atas sesuai instruksi ini. Tetap konsisten dengan jawaban riwayat, jangan mengubah bagian yang tidak diminta.`
    : `Riwayat tanya-jawab lengkap:\n${historyText}\n\nSusun draf lowongan lengkap berdasarkan seluruh jawaban di atas.`;

  const startTime = Date.now();

  const response = await fetch(
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
  );

  const data = await response.json();
  const latency = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error (HTTP ${response.status})`);
  }

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
    throw new Error('Gagal membaca format JSON dari AI. Coba lagi.');
  }

  if (data.usageMetadata) {
    const usage = data.usageMetadata;
    supabase.from('ai_usage_history').insert([{
      model_used: model,
      function_name: 'Buat Lowongan - Susun Draf',
      input_tokens: usage.promptTokenCount || 0,
      output_tokens: usage.candidatesTokenCount || 0,
      total_tokens: usage.totalTokenCount || 0,
      latency_ms: latency,
      input_text: userText.substring(0, 5000),
      output_json: parsed,
      is_flex_mode: useFlexMode,
    }]).then(({ error }) => {
      if (error) console.error('Gagal mencatat riwayat AI:', error.message);
    });
  }

  return { draft: normalizeDraft(parsed), rawParsed: parsed, rawJson: contentText };
}
