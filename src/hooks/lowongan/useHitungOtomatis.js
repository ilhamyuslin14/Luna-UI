import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import { jalankanOtomatis, statusOtomatis, ikutiStatus } from '../../services/kecocokanService.js';

// Saat daftar lowongan dibuka, hitung kecocokan lowongan di halaman yang tampil dan belum punya skor,
// tanpa pelamar membuka detailnya. Mengikuti mode di Sandbox: kalau mode kecocokan "manual", tidak jalan.
// Mengembalikan { berjalan, berhenti } untuk catatan kecil di daftar (berhenti: 'kuota' | 'no-cv' | null).
export default function useHitungOtomatis({ jobs, skorMap, prosesMap, siap }) {
  const { user, isPelamar } = useAuth() || {};
  const [status, setStatus] = useState(statusOtomatis);
  const [memeriksa, setMemeriksa] = useState(false); // sejak halaman dibuka sampai diputuskan apakah ada yang dihitung
  useEffect(() => ikutiStatus(() => setStatus(statusOtomatis())), []);

  // Dipicu oleh halaman yang tampil, bukan oleh perubahan skor: skor yang masuk tidak memicu ulang
  // (dan tidak membaca mode berulang kali).
  const terbaru = useRef({});
  terbaru.current = { jobs, skorMap, prosesMap };
  const halaman = jobs.map(j => j.key).join('|');

  useEffect(() => {
    if (!isPelamar || !user?.id || !siap || !halaman) return undefined;
    let batal = false;
    setMemeriksa(true);
    (async () => {
     try {
      let manual = false;
      try {
        const { data } = await supabase.rpc('get_kecocokan_mode');
        manual = data === 'manual';
      } catch { /* gagal membaca mode = otomatis, seperti di panel detail */ }
      if (batal || manual) return;
      // Batas perhitungan bersamaan diatur dari Sandbox. Gagal membacanya = bawaan (3).
      let maks;
      try {
        const { data } = await supabase.rpc('get_kecocokan_maks_bersamaan');
        if (typeof data === 'number') maks = data;
      } catch { /* pakai bawaan */ }
      if (batal) return;
      const { jobs: j, skorMap: s, prosesMap: p } = terbaru.current;
      const kosong = j.filter(x => s[x.key] == null && !p[x.key]).map(x => x.key);
      if (kosong.length) jalankanOtomatis(user.id, kosong, maks);
     } finally {
      if (!batal) setMemeriksa(false);
     }
    })();
    return () => { batal = true; };
  }, [isPelamar, user?.id, siap, halaman]);

  return { ...status, memeriksa };
}
