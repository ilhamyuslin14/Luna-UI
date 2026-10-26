import { supabase } from '../config/supabase.js';

// Perhitungan kecocokan CV berjalan di server (edge function) dan bisa makan beberapa detik.
// Permintaan yang sedang berjalan dicatat di sini, di luar komponen, supaya:
//  - menutup lalu membuka lagi panel detail saat proses berjalan tetap menampilkan "sedang
//    diproses" (bukan keadaan awal), dan menyambung ke permintaan yang sama;
//  - membuka lowongan itu lagi tidak memicu perhitungan kedua (dan tidak memakai jatah dua kali);
//  - hasil yang selesai saat panelnya sudah ditutup tetap sampai ke daftar (tag skor).
const pending = new Map(); // `${pelamarId}:${jobKey}` -> { promise, mulai }
const listeners = new Set();
const statusListeners = new Set(); // dipanggil tiap ada proses mulai/selesai (untuk tag "memproses" di daftar)
const kabariStatus = () => statusListeners.forEach((fn) => fn());

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
      kabariStatus();
      const score = res?.data?.result?.score;
      if (!res?.error && !res?.data?.error && typeof score === 'number') {
        listeners.forEach((fn) => fn(jobKey, score));
      }
      return res;
    });
  pending.set(key, job);
  kabariStatus();
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

// Kunci lowongan yang sedang dihitung untuk pelamar ini, mis. ['jobstreet:abc'].
export function kunciSedangDihitung(pelamarId) {
  const awal = `${pelamarId}:`;
  const berjalan = [...pending.keys()].filter((k) => k.startsWith(awal)).map((k) => k.slice(awal.length));
  // Yang masih menunggu giliran di antrean otomatis juga ditandai "memproses", bukan "belum dicek".
  return pelamarAntre === pelamarId ? [...berjalan, ...antre] : berjalan;
}

// Dipanggil setiap ada proses yang mulai atau selesai. Mengembalikan fungsi berhenti-mengikuti.
export function ikutiStatus(fn) {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

// ── Hitung otomatis untuk daftar lowongan ─────────────────────────────────
// Lowongan di halaman daftar yang belum punya skor dihitung lewat antrean kecil (bukan serentak),
// supaya tidak menabrak batas laju penyedia AI. Berhenti total saat kuota harian habis atau pelamar
// belum punya CV, dan tiap lowongan hanya dicoba sekali per sesi (tidak diulang kalau gagal).
const MAKS_BERSAMAAN_DEFAULT = 3; // dipakai bila pengaturan Sandbox gagal dibaca
let maksBersamaan = MAKS_BERSAMAAN_DEFAULT;
const sudahDicoba = new Set(); // `${pelamarId}:${jobKey}`
let antre = [];
let aktif = 0;
let berhenti = null; // null | 'kuota' | 'no-cv'
let pelamarAntre = null;

// { berjalan: masih ada yang dihitung/menunggu, berhenti: alasan antrean dihentikan }
export function statusOtomatis() {
  return { berjalan: aktif > 0 || antre.length > 0, berhenti };
}

function pompa(pelamarId) {
  while (!berhenti && aktif < maksBersamaan && antre.length) {
    const jobKey = antre.shift();
    aktif += 1;
    mulaiHitung(pelamarId, jobKey).promise.then((res) => {
      aktif -= 1;
      const code = res?.data?.error ? res.data.code : null;
      if (code === 'kuota' || code === 'no-cv') {
        berhenti = code;
        antre = [];
        if (code === 'no-cv') sudahDicoba.delete(keyOf(pelamarId, jobKey));
      }
      pompa(pelamarId);
    });
  }
  kabariStatus();
}

// `maks` = batas perhitungan bersamaan dari Sandbox (prompt_settings.maks_bersamaan).
export function jalankanOtomatis(pelamarId, jobKeys, maks = MAKS_BERSAMAAN_DEFAULT) {
  maksBersamaan = Math.max(1, Math.round(Number(maks)) || MAKS_BERSAMAAN_DEFAULT);
  if (pelamarAntre !== pelamarId) { pelamarAntre = pelamarId; berhenti = null; antre = []; }
  if (berhenti === 'no-cv') berhenti = null; // CV bisa saja baru diunggah
  jobKeys.forEach((jobKey) => {
    const k = keyOf(pelamarId, jobKey);
    if (sudahDicoba.has(k) || pending.has(k)) return;
    sudahDicoba.add(k);
    antre.push(jobKey);
  });
  pompa(pelamarId);
}
