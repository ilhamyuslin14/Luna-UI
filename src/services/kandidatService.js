import { supabase } from '../config/supabase.js';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';

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

// Helper untuk ekstrak teks dari CV di frontend
async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return await pdfToText(file);
  } else if (ext === 'docx') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          resolve(result.value);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  } else if (ext === 'txt' || ext === 'doc') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  throw new Error('Format file tidak didukung. Harap unggah PDF, DOCX, atau TXT.');
}

// Helper untuk menghitung hash SHA-256 dari file
async function computeFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function uploadAndExtractCV(companyId, file, posisi, onProgress, sumber = 'hr_dashboard') {
  if (!companyId) throw new Error('Company ID diperlukan');

  if (onProgress) onProgress(10, 'Mengekstrak Teks...');
  const fileHash = await computeFileHash(file);
  let rawText = '';
  try {
    rawText = await extractTextFromFile(file);
  } catch (err) {
    console.warn('Gagal ekstrak teks lokal, akan mencoba fallback OCR AI di server:', err);
  }

  if (onProgress) onProgress(40, 'Mengunggah File...');

  // Upload ke Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${companyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('cv_documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const cv_url = `${supabase.supabaseUrl}/storage/v1/object/public/cv_documents/${filePath}`;

  if (onProgress) onProgress(60, 'Memproses dengan AI...');

  // Cek duplikat, parsing AI, dan penyimpanan dijalankan di server (Edge
  // Function) dengan service role — supaya API key & prompt AI tidak pernah
  // terkirim ke browser (penting untuk alur publik Laman Karir yang diakses
  // pengunjung anonim).
  const { data, error } = await supabase.functions.invoke('parse-cv', {
    body: { companyId, fileHash, rawText, fileName: file.name, cvUrl: cv_url, posisi, sumber },
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

  if (onProgress) onProgress(95, 'Menyimpan Data...');

  return data.kandidat;
}

export async function saveUploadLog(logData) {
  const { data, error } = await supabase
    .from('upload_logs')
    .insert([logData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUploadLogsBatches(companyId) {
  if (!companyId) return [];
  const { data, error } = await supabase
    .from('upload_logs')
    .select('batch_id, created_at, status, fail_reason, nama_file, kandidat_id')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
