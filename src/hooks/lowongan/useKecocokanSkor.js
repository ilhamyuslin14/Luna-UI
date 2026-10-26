import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import { ikutiHasil, ikutiStatus, kunciSedangDihitung } from '../../services/kecocokanService.js';

// Skor kecocokan CV yang sudah pernah dihitung untuk pelamar yang login, per lowongan
// ({ [job_key]: score }), untuk tag di daftar lowongan. Pengunjung yang belum masuk
// mendapat peta kosong. RLS memastikan hanya baris milik pelamar itu yang terbaca.
export default function useKecocokanSkor() {
  const { user, isPelamar } = useAuth() || {};
  const [skorMap, setSkorMap] = useState({});
  const [siap, setSiap] = useState(false); // skor tersimpan sudah selesai dibaca (sebelum itu jangan menganggap lowongan "belum punya skor")
  const [prosesMap, setProsesMap] = useState({}); // { [job_key]: true } selama perhitungannya berjalan

  useEffect(() => {
    if (!isPelamar || !user?.id) { setSkorMap({}); setSiap(false); return undefined; }
    let active = true;
    supabase
      .from('pelamar_kecocokan')
      .select('job_key, score')
      .eq('pelamar_id', user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setSkorMap(Object.fromEntries(data.map(r => [r.job_key, r.score])));
        setSiap(true);
      });
    return () => { active = false; };
  }, [isPelamar, user?.id]);

  // Dipanggil saat kartu kecocokan di panel detail selesai menghitung, supaya tag di daftar ikut muncul.
  const setSkor = useCallback((jobKey, score) => {
    setSkorMap(prev => (prev[jobKey] === score ? prev : { ...prev, [jobKey]: score }));
  }, []);

  // Hasil yang selesai saat panel detailnya sudah ditutup tetap sampai ke tag skor di daftar.
  useEffect(() => ikutiHasil((jobKey, score) => setSkor(jobKey, score)), [setSkor]);

  // Lowongan yang sedang dihitung (dari panel detail) ditandai di daftar, dan hilang saat selesai atau gagal.
  useEffect(() => {
    if (!user?.id) { setProsesMap({}); return undefined; }
    const baca = () => setProsesMap(Object.fromEntries(kunciSedangDihitung(user.id).map((k) => [k, true])));
    baca();
    return ikutiStatus(baca);
  }, [user?.id]);

  return { skorMap, setSkor, prosesMap, siap };
}
