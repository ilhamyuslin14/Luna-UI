import { supabase } from '../config/supabase.js';

// Perhitungan kecocokan CV berjalan di server (edge function) dan bisa makan beberapa detik.
// Permintaan yang sedang berjalan dicatat di sini, di luar komponen, supaya:
//  - menutup lalu membuka lagi panel detail saat proses berjalan tetap menampilkan "sedang
//    diproses" (bukan keadaan awal), dan menyambung ke permintaan yang sama;
//  - membuka lowongan itu lagi tidak memicu perhitungan kedua (dan tidak memakai jatah dua kali);
//  - hasil yang selesai saat panelnya sudah ditutup tetap sampai ke daftar (tag skor).
const pending = new Map(); // `${pelamarId}:${jobKey}` -> { promise, mulai }
const listeners = new Set();

const keyOf = (pelamarId, jobKey) => `${pelamarId}:${jobKey}`;

// Mulai perhitungan, atau sambung ke yang sudah berjalan untuk lowongan yang sama.
export function mulaiHitung(pelamarId, jobKey, force = false) {
  const key = keyOf(pelamarId, jobKey);
  const berjalan = pending.get(key);
  if (berjalan) return berjalan;

  const job = { mulai: Date.now() };
  job.promise = supabase.functions
    .invoke('hitung-kecocokan', { body: { jobKey, force: !!force } })
    .catch((err) => ({ data: null, error: err }))
    .then((res) => {
      pending.delete(key);
      const score = res?.data?.result?.score;
      if (!res?.error && !res?.data?.error && typeof score === 'number') {
        listeners.forEach((fn) => fn(jobKey, score));
      }
      return res;
    });
  pending.set(key, job);
  return job;
}

// Perhitungan yang sedang berjalan untuk lowongan ini (atau undefined).
export function sedangDihitung(pelamarId, jobKey) {
  return pending.get(keyOf(pelamarId, jobKey));
}

// Dipanggil setiap ada hasil baru: fn(jobKey, score). Mengembalikan fungsi berhenti-mengikuti.
export function ikutiHasil(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
