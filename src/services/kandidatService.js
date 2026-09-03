import { supabase } from '../config/supabase.js';
import { extractTextFromFile } from '../utils/extractTextFromFile.js';

export async function getKandidatById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('kandidat')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateKandidat(id, updates) {
  if (!id) throw new Error('Kandidat ID diperlukan');
  const { data, error } = await supabase
    .from('kandidat')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('Error updating kandidat:', error); throw error; }
  return data;
}

export async function getKandidat(companyId) {
  if (!companyId) return [];
  const { data, error } = await supabase
    .from('kandidat')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching kandidat:', error); throw error; }
  return data;
}

export async function unarchiveKandidat(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const { error } = await supabase.from('kandidat').update({ arsip: false }).in('id', idArray);
  if (error) throw error;
}

export async function archiveKandidat(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const { error } = await supabase.from('kandidat').update({ arsip: true }).in('id', idArray);
  if (error) throw error;
}

function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

// Implementasi SHA-256 murni JS (FIPS 180-4), tanpa Web Crypto — dipakai
// sebagai fallback saat crypto.subtle tidak tersedia (lihat komentar di
// computeFileHash). SENGAJA algoritma yang SAMA (SHA-256), bukan hash lain
// yang lebih ringan — supaya hash file yang dihasilkan identik baik lewat
// crypto.subtle maupun fallback ini, jadi deteksi duplikat tetap konsisten
// walau upload pertama & kedua dilakukan lewat konteks (secure/insecure)
// yang berbeda. Sudah diverifikasi cocok dengan Node crypto (SHA-256) untuk
// berbagai ukuran termasuk batas 10 Mb file yang diizinkan aplikasi ini.
function sha256Fallback(bytes) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const l = bytes.length;
  const padLen = ((l + 1 + 8 + 63) & ~63);
  const msg = new Uint8Array(padLen);
  msg.set(bytes);
  msg[l] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setUint32(padLen - 8, Math.floor((l * 8) / 0x100000000));
  dv.setUint32(padLen - 4, (l * 8) >>> 0);

  const w = new Uint32Array(64);
  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

// Helper untuk menghitung hash dari file (dipakai buat deteksi duplikat CV).
// crypto.subtle cuma tersedia di secure context (HTTPS atau localhost) —
// begitu dev server mobile dibuka dari HP lewat IP lokal (http://192.168.x.x),
// browser menganggapnya insecure context dan crypto.subtle jadi undefined.
// Fallback ke implementasi SHA-256 sendiri (bukan algoritma lain) supaya
// hasil hash-nya tetap sama persis dengan crypto.subtle di context lain.
async function computeFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  if (window.crypto?.subtle?.digest) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn('crypto.subtle.digest gagal, pakai fallback hash:', err);
    }
  }
  return sha256Fallback(new Uint8Array(arrayBuffer));
}

export async function uploadAndExtractCV(companyId, file, posisi, onProgress, sumber = 'hr_dashboard', isUploadAndScoring = false, contactOverrides = null) {
  if (!companyId) throw new Error('Company ID diperlukan');

  if (onProgress) onProgress(5, 'Memulai...');
  if (onProgress) onProgress(10, 'Mengekstrak Teks...');
  const fileHash = await computeFileHash(file);
  let rawText = '';
  try {
    rawText = await extractTextFromFile(file);
  } catch (err) {
    console.warn('Gagal ekstrak teks lokal, akan mencoba fallback OCR AI di server:', err);
  }

  if (onProgress) {
    onProgress(isUploadAndScoring ? 30 : 40, 'Mengunggah File...');
  }

  // Upload ke Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${companyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('cv_documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const cv_url = `${supabase.supabaseUrl}/storage/v1/object/public/cv_documents/${filePath}`;

  if (onProgress) {
    onProgress(isUploadAndScoring ? 40 : 60, 'Parsing Data...');
  }

  // Cek duplikat, parsing AI, dan penyimpanan dijalankan di server (Edge
  // Function) dengan service role — supaya API key & prompt AI tidak pernah
  // terkirim ke browser (penting untuk alur publik Laman Karir yang diakses
  // pengunjung anonim).
  const { data, error } = await supabase.functions.invoke('parse-cv', {
    body: { companyId, fileHash, rawText, fileName: file.name, cvUrl: cv_url, posisi, sumber, contactOverrides },
  });

  if (error) throw new Error(error.message || 'Gagal memproses CV.');

  if (data?.duplicate) {
    const err = new Error('File CV ini sudah pernah diunggah sebelumnya.');
    err.existingKandidatId = data.existingKandidatId;
    throw err;
  }

  if (data?.error) {
    throw new Error(data.message || 'Gagal memproses dokumen dengan AI.');
  }

  if (onProgress) {
    onProgress(isUploadAndScoring ? 50 : 95, 'Menyimpan Data...');
  }

  return data.kandidat;
}

export async function createActivityLog(logData) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([logData])
    .select()
    .single();
  if (error) throw error;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }
  return data;
}

export async function updateActivityLog(id, updateData) {
  const { data, error } = await supabase
    .from('activity_logs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('luna:activity_updated'));
  }
  return data;
}

export async function getActivityLogs(companyId) {
  if (!companyId) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, batch_id, created_at, tipe_aktivitas, upload_status, upload_fail_reason, scoring_status, scoring_fail_reason, source, nama_file, kandidat_id, posisi_nama')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;

  // Kumpulkan semua source yang berupa UUID
  const uuidSources = [...new Set(data.map(d => d.source).filter(s => s && s.length === 36 && s.includes('-')))];

  if (uuidSources.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nama_lengkap')
      .in('id', uuidSources);

    if (profiles) {
      const profileMap = {};
      profiles.forEach(p => {
        profileMap[p.id] = p.nama_lengkap;
      });

      // Ganti nilai source dengan nama lengkap
      data.forEach(d => {
        if (profileMap[d.source]) {
          d.source = profileMap[d.source];
        }
      });
    }
  }

  return data;
}

export async function getDirekrutKandidat(companyId) {
  if (!companyId) return [];
  const { data: scoringData, error } = await supabase
    .from('scoring')
    .select('kandidat_id, seleksi!inner(company_id)')
    .eq('seleksi.company_id', companyId)
    .gte('alur_proses', 8);

  if (error || !scoringData) return [];
  const kandidatIds = [...new Set(scoringData.map(s => s.kandidat_id))];
  if (kandidatIds.length === 0) return [];

  const { data, error: kError } = await supabase
    .from('kandidat')
    .select('*')
    .in('id', kandidatIds)
    .order('created_at', { ascending: false });

  if (kError) throw kError;
  return data || [];
}
