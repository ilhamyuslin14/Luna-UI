import { supabase } from '../config/supabase.js';

// Lamaran cepat: melamar lowongan Luna memakai data profil dan CV pelamar yang sudah tersimpan
// (edge function lamar-dengan-profil). Lihat catatan di supabase/functions/lamar-dengan-profil.

// Apakah akun yang login sudah melamar ke lowongan ini (lewat akun, atau lewat form dengan email yang sama).
export async function sudahMelamar(seleksiId) {
  const { data, error } = await supabase.rpc('sudah_melamar', { p_seleksi: seleksiId });
  if (error) throw error;
  return !!data;
}

// Permintaan yang sedang berjalan dicatat di sini, di luar komponen: menutup popup saat lamaran dikirim tidak
// menghentikan prosesnya (server tetap menyelesaikannya), dan membuka popup yang sama lagi menyambung ke
// permintaan itu, bukan menampilkan tombol kirim lagi (yang bisa memicu kiriman kedua).
const berjalan = new Map(); // seleksiId -> promise

export function sedangMengirim(seleksiId) {
  return berjalan.get(seleksiId) || null;
}

// Mengirim lamaran. Melempar Error dengan properti code (mis. 'sudah-melamar', 'no-cv', 'phone') bila ditolak.
export function kirimLamaranProfil({ seleksiId, phone }) {
  const ada = berjalan.get(seleksiId);
  if (ada) return ada;
  const p = (async () => {
    const { data, error } = await supabase.functions.invoke('lamar-dengan-profil', {
      body: { seleksiId, phone: phone || '', setuju: true },
    });
    if (error) throw new Error(error.message || 'Lamaran belum bisa dikirim sekarang.');
    if (data?.error) {
      const err = new Error(data.message || 'Lamaran belum bisa dikirim sekarang.');
      err.code = data.code;
      throw err;
    }
    return data;
  })().finally(() => berjalan.delete(seleksiId));
  berjalan.set(seleksiId, p);
  return p;
}
