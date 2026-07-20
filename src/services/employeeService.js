import { supabase } from '../config/supabase.js';

/**
 * Mengambil daftar "karyawan" — kandidat yang alur_proses-nya sudah masuk
 * tahap Diterima/Onboarding/Lolos Masa Percobaan (level 8-10), lengkap
 * dengan posisi & departemen yang bersangkutan.
 *
 * Satu baris = satu pasangan (kandidat, seleksi) yang statusnya >= 8 — kalau
 * seorang kandidat kebetulan diterima di lebih dari satu posisi (jarang,
 * tapi mungkin), dia akan muncul sebagai baris terpisah per posisi.
 */
export async function getEmployees(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabase
    .from('scoring')
    .select(`
      id, kandidat_id, seleksi_id, alur_proses, updated_at,
      kandidat:kandidat_id ( id, nama_lengkap, email, phone, linkedin_url, domisili, arsip ),
      seleksi:seleksi_id ( id, jabatan, department_id, departments:department_id ( name ) )
    `)
    .eq('company_id', companyId)
    .gte('alur_proses', 8)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || [])
    .filter(row => row.kandidat && !row.kandidat.arsip)
    .map(row => ({
      scoringId: row.id,
      kandidatId: row.kandidat_id,
      seleksiId: row.seleksi_id,
      alurProses: row.alur_proses,
      updatedAt: row.updated_at,
      kandidat: row.kandidat,
      posisi: row.seleksi?.jabatan || '-',
      departemen: row.seleksi?.departments?.name || '-',
    }));
}
