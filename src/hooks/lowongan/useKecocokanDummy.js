import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPelamarResume } from '../../services/pelamarResumeService.js';

// MOCKUP — simulasi alur "kecocokan CV dengan lowongan". Belum ada AI maupun
// tabel di database: hasilnya dihasilkan dari hash kunci lowongan, dan "cache"
// per lowongan disimulasikan lewat localStorage. Nanti isi runMatch() diganti
// panggilan edge function; state dan komponen UI tidak berubah.
//
// Pratinjau state tanpa harus login/ganti data, lewat query URL:
//   ?kecocokan=guest | no-cv | processing | done | error

export const STEPS = [
  'Membaca CV kamu',
  'Memahami deskripsi lowongan',
  'Mencocokkan keahlian dan pengalaman',
  'Menyusun hasil',
];
const STEP_MS = 1100;

const PROS = [
  (t) => `Pengalaman kerja kamu relevan dengan peran ${t}`,
  () => 'Keahlian utama di CV sejalan dengan kebutuhan lowongan',
  () => 'Pendidikan memenuhi kualifikasi minimum yang diminta',
  () => 'Ada pengalaman menangani pekerjaan sejenis dengan tanggung jawab serupa',
  () => 'Kemampuan komunikasi dan kerja sama tim tercantum jelas',
];
const CONS = [
  () => 'Belum terlihat pengalaman dengan alat atau teknologi yang disebut di deskripsi',
  () => 'Durasi pengalaman sedikit di bawah yang diharapkan',
  () => 'Sertifikasi yang disebut di lowongan belum ada di CV',
  () => 'Belum ada contoh hasil kerja yang terukur (angka atau capaian)',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function labelFor(score) {
  if (score >= 71) return 'Tinggi';
  if (score >= 31) return 'Sedang';
  return 'Rendah';
}

export function dummyResult(jobKey, jobTitle) {
  const h = hash(jobKey || 'x');
  const score = 15 + (h % 78); // 15–92
  const nPros = score < 50 ? 2 : 3;
  const nCons = score < 50 ? 3 : 2;
  const pick = (pool, n, offset) => Array.from({ length: n }, (_, i) => pool[(offset + i) % pool.length](jobTitle));
  return {
    score,
    label: labelFor(score),
    pros: pick(PROS, nPros, h % PROS.length),
    // >>> (bukan >>): h bisa melebihi 2^31 dan >> akan menghasilkan angka negatif,
    // yang membuat indeks daftar poin undefined dan hasil tidak pernah muncul.
    cons: pick(CONS, nCons, (h >>> 3) % CONS.length),
    createdAt: new Date().toISOString(),
  };
}

const cacheKey = (userId, jobKey) => `luna_kecocokan_demo:${userId}:${jobKey}`;
const readCache = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const writeCache = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* abaikan */ } };

export default function useKecocokanDummy({ jobKey, jobTitle }) {
  const { user, isPelamar } = useAuth() || {};
  const demo = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('kecocokan') : null;

  const [state, setState] = useState('checking'); // checking | guest | no-cv | processing | done | error
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const timers = useRef([]);
  const runId = useRef(0);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const runMatch = useCallback((useCache) => {
    clearTimers();
    const id = ++runId.current;
    const key = cacheKey(user?.id || 'anon', jobKey);
    const cached = useCache ? readCache(key) : null;
    if (cached) { setResult(cached); setState('done'); return; }

    setResult(null);
    setStep(0);
    setState('processing');
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => { if (runId.current === id) setStep(i + 1); }, STEP_MS * (i + 1)));
    });
    timers.current.push(setTimeout(() => {
      if (runId.current !== id) return;
      try {
        const res = dummyResult(jobKey, jobTitle);
        if (!demo) writeCache(key, res);
        setResult(res);
        setState('done');
      } catch (err) {
        console.error('Gagal menyusun hasil kecocokan:', err);
        setState('error');
      }
    }, STEP_MS * STEPS.length + 400));
  }, [user?.id, jobKey, jobTitle, demo]);

  useEffect(() => {
    let active = true;
    clearTimers();

    if (demo === 'guest') { setState('guest'); return undefined; }
    if (demo === 'no-cv') { setState('no-cv'); return undefined; }
    if (demo === 'error') { setState('error'); return undefined; }
    if (demo === 'done') { setResult(dummyResult(jobKey, jobTitle)); setState('done'); return undefined; }
    if (demo === 'processing') { runMatch(false); return () => { active = false; clearTimers(); }; }

    if (!isPelamar || !user?.id) { setState('guest'); return undefined; }

    setState('checking');
    getPelamarResume(user.id)
      .then(resume => {
        if (!active) return;
        if (!resume) setState('no-cv');
        else runMatch(true);
      })
      .catch(() => { if (active) setState('error'); });

    return () => { active = false; clearTimers(); };
  }, [demo, isPelamar, user?.id, jobKey, jobTitle, runMatch]);

  const retry = useCallback(() => runMatch(false), [runMatch]);

  return { state, step, result, retry, isDemoParam: !!demo };
}
