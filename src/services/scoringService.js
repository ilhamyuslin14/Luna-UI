import { supabase } from '../config/supabase.js';

export async function markTidakSesuai(scoringId, alasan, alasanDetail = '') {
  const { error } = await supabase
    .from('scoring')
    .update({
      alur_proses: 0,
      alasan_tidak_sesuai: alasan,
      alasan_tidak_sesuai_detail: alasanDetail || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scoringId);
  if (error) throw error;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }
}

export async function updateAlurProses(scoringId, alurLevel) {
  const { error } = await supabase
    .from('scoring')
    .update({ alur_proses: alurLevel, updated_at: new Date().toISOString() })
    .eq('id', scoringId);
  if (error) throw error;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }
}

// Nama fungsi ikut konvensi seleksiService.js (lihat komentar di sana)
export async function getScoringBySeleksi(seleksiId) {
  if (!seleksiId) return [];
  const { data, error } = await supabase
    .from('scoring')
    .select(`
      id, kandidat_id, total_score, kategori_fit, alur_proses, alasan_tidak_sesuai, alasan_tidak_sesuai_detail,
      ai_summary, detail_kriteria, raw_kriteria, created_at,
      kandidat:kandidat_id (
        id, nama_lengkap, jabatan_saat_ini, perusahaan_saat_ini,
        pengalaman_tahun, linkedin_url, domisili, arsip, sumber
      ),
      seleksi:seleksi_id(jabatan, departments:department_id(name))
    `)
    .eq('seleksi_id', seleksiId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  // Deduplicate: ambil record terbaru per kandidat
  const latest = {};
  (data || []).forEach(s => {
    if (!latest[s.kandidat_id]) latest[s.kandidat_id] = s;
  });
  return Object.values(latest);
}

export async function getScoringByKandidat(kandidatId) {
  if (!kandidatId) return [];
  const { data, error } = await supabase
    .from('scoring')
    .select('*, seleksi!inner(jabatan, arsip, departments:department_id(name))')
    .eq('kandidat_id', kandidatId)
    .neq('seleksi.arsip', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Scoring AI dijalankan di server (Edge Function `run-scoring`) dengan service
// role — supaya API key & prompt AI tidak pernah terkirim ke browser (penting
// untuk alur publik Laman Karir yang diakses pengunjung anonim).
export async function runScoring(kandidatId, seleksiId, companyId) {
  // Pengecekan duplikat sebelum melakukan request ke AI untuk menghindari pemborosan token
  const { data: existingScoring, error: existingError } = await supabase
    .from('scoring')
    .select('id')
    .eq('kandidat_id', kandidatId)
    .eq('seleksi_id', seleksiId)
    .maybeSingle();

  if (existingError) {
    console.error('[runScoring] Gagal mengecek data scoring sebelumnya:', existingError);
    throw new Error('Gagal memverifikasi data penilaian AI sebelumnya.');
  }

  if (existingScoring) {
    console.log('[runScoring] Scoring sudah ada, mengembalikan ID yang ada tanpa menjalankan AI.');
    return existingScoring;
  }

  const { data, error } = await supabase.functions.invoke('run-scoring', {
    body: { kandidatId, seleksiId, companyId },
  });

  if (error) {
    console.error('[runScoring] Gagal memanggil fungsi:', error);
    throw new Error(error.message || 'Gagal menjalankan scoring.');
  }
  if (data?.error) {
    console.error('[runScoring] Error dari AI/Server:', data.message);
    throw new Error(data.message || 'Gagal menjalankan scoring.');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }

  return data.scoring;
}

export async function runRescore(scoringId, kandidatId, seleksiId, companyId) {
  const { data, error } = await supabase.functions.invoke('run-scoring', {
    body: { kandidatId, seleksiId, companyId, scoringId },
  });

  if (error) {
    console.error('[runRescore] Gagal memanggil fungsi:', error);
    throw new Error(error.message || 'Gagal menjalankan ulang scoring.');
  }
  if (data?.error) {
    console.error('[runRescore] Error dari AI/Server:', data.message);
    throw new Error(data.message || 'Gagal menjalankan ulang scoring.');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }

  return data.scoring;
}
