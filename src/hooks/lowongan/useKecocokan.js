import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';
import { getPelamarResume } from '../../services/pelamarResumeService.js';
import { mulaiHitung, sedangDihitung } from '../../services/kecocokanService.js';
import { STEPS, dummyResult } from './useKecocokanDummy.js';

// Kecocokan CV pelamar dengan satu lowongan. Hasil dihitung edge function
// `hitung-kecocokan` dan disimpan di public.pelamar_kecocokan; hook ini hanya
// membaca hasil tersimpan (lewat RLS) atau meminta fungsi menghitungnya.
// Permintaan yang sedang berjalan dicatat di kecocokanService, jadi komponen yang
// dipasang ulang (mis. panel detail ditutup lalu dibuka lagi) menyambung ke prosesnya.
//
// Untuk pratinjau tampilan tanpa data sungguhan, query URL tetap didukung:
//   ?kecocokan=guest | no-cv | ready | processing | done | error | limit

const STEP_MS = 1100;
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // lebih lama dari ini dihitung ulang (lowongan bisa berubah)

function rowToResult(row) {
  return {
    score: row.score,
    label: row.label,
    pros: row.pros || [],
    cons: row.cons || [],
    aspek: row.aspek || {},
    createdAt: row.updated_at || row.created_at,
  };
}

export default function useKecocokan({ jobKey, jobTitle, tundaOtomatis = 0 }) {
  const { user, isPelamar } = useAuth() || {};
  const demo = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('kecocokan') : null;

  const [state, setState] = useState('checking'); // checking | guest | no-cv | ready | processing | done | error | limit
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const timers = useRef([]);
  const runId = useRef(0);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Animasi langkah berjalan sambil menunggu AI, tapi berhenti di langkah terakhir
  // sampai hasilnya benar-benar datang (tidak pernah menampilkan "selesai" duluan).
  // `elapsed` = sudah berapa lama prosesnya berjalan, supaya yang disambung tidak mulai dari nol.
  const startSteps = (id, elapsed = 0) => {
    const mulai = Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_MS));
    setStep(mulai);
    for (let i = mulai + 1; i < STEPS.length; i++) {
      timers.current.push(setTimeout(() => { if (runId.current === id) setStep(i); }, Math.max(0, STEP_MS * i - elapsed)));
    }
  };

  // Menunggu hasil sebuah permintaan (baru, atau yang sudah berjalan sebelumnya).
  const tunggu = useCallback(async (job, id) => {
    try {
      const { data, error } = await job.promise;
      if (runId.current !== id) return;
      clearTimers();
      if (error) throw new Error(error.message || 'Gagal menghubungi server.');
      if (data?.error) {
        if (data.code === 'no-cv') { setState('no-cv'); return; }
        setMessage(data.message || '');
        setState(data.code === 'kuota' ? 'limit' : 'error');
        return;
      }
      setResult(data.result);
      setState('done');
    } catch (err) {
      if (runId.current !== id) return;
      console.error('Gagal menghitung kecocokan:', err);
      clearTimers();
      setState('error');
    }
  }, []);

  const hitung = useCallback((force) => {
    clearTimers();
    const id = ++runId.current;
    setResult(null);
    setMessage('');
    setState('processing');
    const job = mulaiHitung(user?.id, jobKey, force);
    startSteps(id, Date.now() - job.mulai);
    return tunggu(job, id);
  }, [jobKey, user?.id, tunggu]);

  useEffect(() => {
    let active = true;
    clearTimers();

    if (demo === 'guest') { setState('guest'); return undefined; }
    if (demo === 'no-cv') { setState('no-cv'); return undefined; }
    if (demo === 'ready') { setState('ready'); return undefined; }
    if (demo === 'error') { setState('error'); return undefined; }
    if (demo === 'limit') { setMessage('Batas 20 pengecekan kecocokan hari ini sudah tercapai. Coba lagi besok.'); setState('limit'); return undefined; }
    if (demo === 'done') { setResult(dummyResult(jobKey, jobTitle)); setState('done'); return undefined; }
    if (demo === 'processing') {
      const id = ++runId.current;
      setState('processing');
      startSteps(id);
      return () => { active = false; clearTimers(); };
    }

    if (!isPelamar || !user?.id) { setState('guest'); return undefined; }

    // Proses untuk lowongan ini masih berjalan (mis. panel ditutup lalu dibuka lagi):
    // langsung tampilkan "sedang diproses" dan sambung, jangan mulai dari keadaan awal.
    const berjalan = sedangDihitung(user.id, jobKey);
    if (berjalan) {
      const id = ++runId.current;
      setResult(null);
      setMessage('');
      setState('processing');
      startSteps(id, Date.now() - berjalan.mulai);
      tunggu(berjalan, id);
      return () => { active = false; clearTimers(); };
    }

    setState('checking');
    (async () => {
      try {
        const resume = await getPelamarResume(user.id);
        if (!active) return;
        if (!resume) { setState('no-cv'); return; }

        const { data: row, error } = await supabase
          .from('pelamar_kecocokan')
          .select('*')
          .eq('pelamar_id', user.id)
          .eq('job_key', jobKey)
          .maybeSingle();
        if (!active) return;

        const fresh = row
          && !error
          && row.resume_hash === (resume.file_hash || null)
          && Date.now() - new Date(row.updated_at || row.created_at).getTime() < CACHE_MAX_AGE_MS;
        if (fresh) { setResult(rowToResult(row)); setState('done'); return; }

        // Mode (otomatis/manual) diatur dari Sandbox. Gagal membacanya = otomatis, seperti semula.
        let manual = false;
        try {
          const { data: mode } = await supabase.rpc('get_kecocokan_mode');
          manual = mode === 'manual';
        } catch { /* pakai otomatis */ }
        if (!active) return;
        if (manual) { setState('ready'); return; }

        // Jeda opsional (panel detail di daftar lowongan): lowongan yang hanya dilewati saat
        // menelusuri cepat tidak memicu perhitungan AI.
        if (tundaOtomatis > 0) {
          timers.current.push(setTimeout(() => { if (active) hitung(false); }, tundaOtomatis));
          return;
        }
        hitung(false);
      } catch (err) {
        console.error('Gagal memuat kecocokan:', err);
        if (active) setState('error');
      }
    })();

    return () => { active = false; clearTimers(); };
  }, [demo, isPelamar, user?.id, jobKey, jobTitle, hitung, tunggu, tundaOtomatis]);

  const retry = useCallback(() => hitung(false), [hitung]);
  // Mode manual: dijalankan saat pelamar menekan "Cek kecocokan".
  const generate = useCallback(() => hitung(false), [hitung]);
  // Prototipe: hitung ulang paksa (abaikan cache). Tetap memakai kuota harian.
  const regenerate = useCallback(() => hitung(true), [hitung]);

  return { state, step, result, message, retry, generate, regenerate, isDemoParam: !!demo };
}
