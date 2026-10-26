import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Lamaran cepat: pelamar yang login melamar ke lowongan Luna memakai data profilnya (nama, kontak, dan
// resume hasil parsing di public.pelamar_resumes), tanpa mengisi form dan tanpa unggah/parsing CV lagi.
//
// Resume pelamar tidak bisa dibaca perusahaan (RLS), jadi datanya DISALIN ke public.kandidat milik perusahaan
// pemilik lowongan saat melamar (snapshot). Lamaran = baris public.scoring (kandidat x lowongan), dan
// scoring.pelamar_id mengaitkannya ke akun pelamar. Penilaian AI memakai edge function run-scoring yang sama
// dengan jalur form. Identitas pelamar SELALU dari JWT, tidak pernah dari body.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

class LamarError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

// Hapus karakter NUL yang ditolak Postgres (sama seperti parse-cv).
function bersihkan<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj).replace(/\\u0000/g, '').replace(/\\u000/g, ''))
}

const telponValid = (t: string) => t.replace(/\D/g, '').length >= 9

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return jsonResponse({ error: true, code: 'sesi', message: 'Sesi tidak valid. Silakan masuk ulang.' }, 401)
    const pelamarId = user.id

    const body = await req.json()
    const seleksiId = typeof body.seleksiId === 'string' ? body.seleksiId : ''
    const phoneBaru = typeof body.phone === 'string' ? body.phone.trim() : ''
    if (!seleksiId) throw new LamarError('data', 'Lowongan tidak diketahui.')
    if (body.setuju !== true) throw new LamarError('persetujuan', 'Setujui pengiriman profil dan CV kamu ke perusahaan dulu.')

    // 1. Profil + resume pelamar
    const { data: profil } = await supabase.from('pelamar_profiles').select('*').eq('id', pelamarId).maybeSingle()
    if (!profil) throw new LamarError('bukan-pelamar', 'Akun ini belum terdaftar sebagai pelamar.')
    const { data: resume } = await supabase.from('pelamar_resumes').select('*').eq('pelamar_id', pelamarId).maybeSingle()
    if (!resume || resume.parsing_status !== 'completed' || !resume.cv_url) {
      throw new LamarError('no-cv', 'Unggah CV di profil kamu terlebih dahulu.')
    }

    // 2. Lowongan masih aktif
    const { data: seleksi } = await supabase
      .from('seleksi')
      .select('id, company_id, jabatan, status, arsip')
      .eq('id', seleksiId)
      .maybeSingle()
    if (!seleksi || seleksi.status !== 'Aktif' || seleksi.arsip) {
      throw new LamarError('lowongan-tidak-ada', 'Lowongan ini sudah tidak menerima lamaran.')
    }
    const companyId = seleksi.company_id

    // 3. Kontak: HP dilengkapi dari isian popup bila di profil masih kosong (dan disimpan ke profil).
    let phone = (profil.phone || '').trim()
    if (!phone) {
      if (!telponValid(phoneBaru)) throw new LamarError('phone', 'Isi nomor HP yang valid untuk melamar.')
      phone = phoneBaru
      await supabase.from('pelamar_profiles').update({ phone }).eq('id', pelamarId)
    }
    const email = (profil.email || '').trim()
    const nama = (profil.nama_lengkap || resume.nama_lengkap || '').trim()
    if (!email || !nama) throw new LamarError('profil', 'Nama dan email di profil kamu belum lengkap.')

    // 4. Cegah lamaran ganda: lewat akun ini, atau lewat form dengan email yang sama.
    const { data: sudahAkun } = await supabase.from('scoring').select('id').eq('seleksi_id', seleksiId).eq('pelamar_id', pelamarId).limit(1)
    if (sudahAkun && sudahAkun.length) throw new LamarError('sudah-melamar', 'Kamu sudah melamar ke lowongan ini.')
    const { data: kandidatEmail } = await supabase.from('kandidat').select('id').eq('company_id', companyId).ilike('email', email)
    if (kandidatEmail && kandidatEmail.length) {
      const { data: sudahEmail } = await supabase.from('scoring').select('id').eq('seleksi_id', seleksiId).in('kandidat_id', kandidatEmail.map((k) => k.id)).limit(1)
      if (sudahEmail && sudahEmail.length) throw new LamarError('sudah-melamar', 'Kamu sudah melamar ke lowongan ini.')
    }

    // 5. Kandidat di perusahaan ini: pakai yang sudah ada (CV yang sama / email yang sama), kalau tidak salin dari resume.
    let kandidatId: string | null = null
    if (resume.file_hash) {
      const { data: ada } = await supabase.from('kandidat').select('id').eq('company_id', companyId).eq('file_hash', resume.file_hash).limit(1)
      if (ada && ada.length) kandidatId = ada[0].id
    }
    if (!kandidatId && kandidatEmail && kandidatEmail.length) kandidatId = kandidatEmail[0].id

    if (!kandidatId) {
      const record = bersihkan({
        company_id: companyId,
        nama_lengkap: nama,
        email,
        phone,
        linkedin_url: resume.linkedin_url || null,
        portfolio_url: resume.portfolio_url || null,
        gender: resume.gender || null,
        tgl_lahir: resume.tgl_lahir || null,
        domisili: resume.domisili || null,
        universitas: resume.universitas || null,
        jurusan: resume.jurusan || null,
        perusahaan_saat_ini: resume.perusahaan_saat_ini || null,
        jabatan_saat_ini: resume.jabatan_saat_ini || null,
        pengalaman_tahun: resume.pengalaman_tahun || null,
        industri: resume.industri || null,
        tahun_terakhir_bekerja: resume.tahun_terakhir_bekerja || null,
        harapan_upah: resume.harapan_upah || null,
        harapan_benefit: resume.harapan_benefit || null,
        skills: resume.skills || [],
        pengalaman_kerja: resume.pengalaman_kerja || [],
        pendidikan: resume.pendidikan || [],
        sertifikasi: resume.sertifikasi || [],
        cv_url: resume.cv_url,
        raw_text: resume.raw_text || '',
        output_ai_raw: resume.output_ai_raw || null,
        file_hash: resume.file_hash || null,
        parsing_status: 'completed',
        sumber: 'public',
      })
      const { data: baru, error: kErr } = await supabase.from('kandidat').insert([record]).select('id').single()
      if (kErr) throw kErr
      kandidatId = baru.id
    }

    // 6. Penilaian AI memakai run-scoring yang sama dengan lamaran lewat form.
    let scoringId: string | null = null
    let scoringStatus = 'gagal'
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/run-scoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
        body: JSON.stringify({ kandidatId, seleksiId, companyId }),
      })
      const hasil = await res.json()
      if (!hasil?.error && hasil?.scoring?.id) { scoringId = hasil.scoring.id; scoringStatus = 'berhasil' }
    } catch (e) {
      console.error('[lamar-dengan-profil] Scoring gagal:', e)
    }

    // Penilaian gagal tidak boleh membatalkan lamaran: buat baris scoring tanpa skor (tampil "belum dinilai"
    // di sisi perusahaan, bisa dinilai ulang), sama seperti jalur paket Free.
    if (!scoringId) {
      const { data: tersambung, error: lErr } = await supabase
        .from('scoring')
        .upsert([{ kandidat_id: kandidatId, seleksi_id: seleksiId, company_id: companyId, total_score: null, kategori_fit: null, alur_proses: 1 }], { onConflict: 'kandidat_id,seleksi_id', ignoreDuplicates: true })
        .select('id')
        .maybeSingle()
      if (lErr) throw lErr
      if (tersambung?.id) scoringId = tersambung.id
      else {
        const { data: lama } = await supabase.from('scoring').select('id').eq('kandidat_id', kandidatId).eq('seleksi_id', seleksiId).maybeSingle()
        scoringId = lama?.id || null
      }
    }
    if (!scoringId) throw new LamarError('internal', 'Lamaran belum bisa dikirim sekarang. Coba lagi sebentar lagi.')

    // 7. Kaitkan lamaran ke akun pelamar (indeks unik seleksi_id+pelamar_id menjaga dari kiriman ganda serentak).
    const { error: linkErr } = await supabase.from('scoring').update({ pelamar_id: pelamarId }).eq('id', scoringId)
    if (linkErr) {
      if (linkErr.code === '23505') throw new LamarError('sudah-melamar', 'Kamu sudah melamar ke lowongan ini.')
      throw linkErr
    }

    // 8. Catatan aktivitas, sama dengan lamaran lewat Laman Karir.
    await supabase.from('activity_logs').insert([{
      batch_id: `pb-${Date.now()}`,
      company_id: companyId,
      nama_file: resume.file_name || 'CV pelamar',
      tipe_aktivitas: 'upload_and_scoring',
      upload_status: 'berhasil',
      scoring_status: scoringStatus,
      source: 'Portal Karir',
      posisi_nama: seleksi.jabatan || null,
      kandidat_id: kandidatId,
    }]).then(({ error }) => { if (error) console.error('Gagal mencatat activity log:', error) })

    return jsonResponse({ ok: true, jabatan: seleksi.jabatan, dinilai: scoringStatus === 'berhasil' })
  } catch (err) {
    if (err instanceof LamarError) return jsonResponse({ error: true, code: err.code, message: err.message })
    console.error('[lamar-dengan-profil] Error:', err)
    return jsonResponse({ error: true, code: 'internal', message: 'Lamaran belum bisa dikirim sekarang. Coba lagi sebentar lagi.' })
  }
})
