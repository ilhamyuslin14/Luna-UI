import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Undang anggota tim (role 'admin') ke company yang sudah ada. Prototype ini
// belum punya SMTP, jadi tidak pakai inviteUserByEmail (yang kirim email
// asli) — sebagai gantinya akun dibuat langsung dengan password default
// '12345678' via Admin API (WAJIB service role, tidak bisa dari browser).
// User baru wajib ganti password di halaman "Terima Undangan" sebelum bisa
// akses halaman lain (dicek lewat kolom profiles.must_change_password).
//
// Sengaja TIDAK mengirim `nama_perusahaan` di user_metadata supaya trigger
// handle_new_user() di database tidak bikin company baru untuk user ini —
// dia harus join ke company milik si pengundang, bukan bikin company sendiri.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const DEFAULT_PASSWORD = '12345678'

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
    const { email, nama, companyId } = await req.json()

    if (!email || !nama || !companyId) {
      return jsonResponse({ error: true, message: 'Email, nama, dan companyId wajib diisi.' }, 400)
    }

    // Otorisasi: pastikan pemanggil beneran Owner dari companyId yang dituju —
    // tanpa ini, siapa pun yang login bisa undang orang ke company mana pun
    // asal tahu ID-nya, karena endpoint ini jalan pakai service role key.
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      return jsonResponse({ error: true, message: 'Tidak terautentikasi.' }, 401)
    }

    const { data: callerData, error: callerErr } = await supabase.auth.getUser(token)
    if (callerErr || !callerData?.user) {
      return jsonResponse({ error: true, message: 'Sesi tidak valid.' }, 401)
    }

    const { data: callerMembership } = await supabase
      .from('company_users')
      .select('role')
      .eq('user_id', callerData.user.id)
      .eq('company_id', companyId)
      .maybeSingle()

    if (callerMembership?.role !== 'owner') {
      return jsonResponse({ error: true, message: 'Cuma Owner yang bisa mengundang anggota baru.' }, 403)
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { nama_lengkap: nama },
    })

    if (createErr) {
      const msg = /already been registered|already exists/i.test(createErr.message)
        ? 'Email ini sudah terdaftar di LUNA.'
        : createErr.message
      return jsonResponse({ error: true, message: msg }, 400)
    }

    const newUserId = created.user.id

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', newUserId)

    if (profileErr) {
      console.error('[invite-member] Gagal set must_change_password:', profileErr)
    }

    const { error: memberErr } = await supabase
      .from('company_users')
      .insert([{ company_id: companyId, user_id: newUserId, role: 'admin' }])

    if (memberErr) {
      // Rollback: hapus auth user supaya tidak jadi akun "nyangkut" tanpa company
      await supabase.auth.admin.deleteUser(newUserId).catch(() => {})
      console.error('[invite-member] Gagal insert company_users:', memberErr)
      return jsonResponse({ error: true, message: 'Gagal menautkan user ke company: ' + memberErr.message }, 500)
    }

    return jsonResponse({ success: true, userId: newUserId })
  } catch (err: any) {
    console.error('[invite-member] Error:', err)
    return jsonResponse({ error: true, message: err.message || 'Terjadi kesalahan internal.' }, 500)
  }
})
