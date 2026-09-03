import { supabase } from '../config/supabase.js';

export async function submitLaporanMasalah({ companyId, userId, halaman, pesanError, catatanUser }) {
  const { error } = await supabase.from('laporan_masalah').insert([{
    company_id: companyId || null,
    user_id: userId || null,
    halaman: halaman || null,
    pesan_error: pesanError || null,
    catatan_user: catatanUser?.trim() || null,
  }]);
  if (error) throw error;
}
