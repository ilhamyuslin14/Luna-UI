import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import { ikutiHasil } from '../../services/kecocokanService.js';

// Skor kecocokan CV yang sudah pernah dihitung untuk pelamar yang login, per lowongan
// ({ [job_key]: score }), untuk tag di daftar lowongan. Pengunjung yang belum masuk
// mendapat peta kosong. RLS memastikan hanya baris milik pelamar itu yang terbaca.
export default function useKecocokanSkor() {
  const { user, isPelamar } = useAuth() || {};
  const [skorMap, setSkorMap] = useState({});

  useEffect(() => {
    if (!isPelamar || !user?.id) { setSkorMap({}); return undefined; }
    let active = true;
    supabase
      .from('pelamar_kecocokan')
      .select('job_key, score')
      .eq('pelamar_id', user.id)
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setSkorMap(Object.fromEntries(data.map(r => [r.job_key, r.score])));
      });
    return () => { active = false; };
  }, [isPelamar, user?.id]);

  // Dipanggil saat kartu kecocokan di panel detail selesai menghitung, supaya tag di daftar ikut muncul.
  const setSkor = useCallback((jobKey, score) => {
    setSkorMap(prev => (prev[jobKey] === score ? prev : { ...prev, [jobKey]: score }));
  }, []);

  // Hasil yang selesai saat panel detailnya sudah ditutup tetap sampai ke tag skor di daftar.
  useEffect(() => ikutiHasil((jobKey, score) => setSkor(jobKey, score)), [setSkor]);

  return { skorMap, setSkor };
}
