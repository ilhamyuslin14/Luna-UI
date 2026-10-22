import { supabase } from '../config/supabase.js';
import { extractTextFromFile } from '../utils/extractTextFromFile.js';
import { computeFileHash } from './kandidatService.js';

// Resume pelamar — disimpan ke public.pelamar_resumes (bukan public.kandidat;
// lihat migration create_pelamar_resumes + edge function parse-cv-pelamar
// untuk alasan kenapa keduanya sengaja dipisah). Satu pelamar = satu baris
// resume aktif; unggah ulang meng-upsert baris yang sama.

export async function getPelamarResume(pelamarId) {
  if (!pelamarId) return null;
  const { data, error } = await supabase
    .from('pelamar_resumes')
    .select('*')
    .eq('pelamar_id', pelamarId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function uploadAndParseResume(pelamarId, file, onProgress) {
  if (!pelamarId) throw new Error('Sesi pelamar tidak ditemukan.');

  if (onProgress) onProgress(5, 'Memulai...');
  if (onProgress) onProgress(10, 'Mengekstrak teks...');
  const fileHash = await computeFileHash(file);
  let rawText = '';
  try {
    rawText = await extractTextFromFile(file);
  } catch (err) {
    console.warn('Gagal ekstrak teks lokal, akan mencoba fallback OCR AI di server:', err);
  }

  if (onProgress) onProgress(40, 'Mengunggah file...');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  // Prefix "pelamar/" supaya tidak pernah tabrakan dengan path sisi HR yang
  // pakai companyId sebagai folder (lihat uploadAndExtractCV di kandidatService.js).
  const filePath = `pelamar/${pelamarId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('cv_documents')
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const cvUrl = `${supabase.supabaseUrl}/storage/v1/object/public/cv_documents/${filePath}`;

  if (onProgress) onProgress(60, 'Parsing data dengan AI...');

  const { data, error } = await supabase.functions.invoke('parse-cv-pelamar', {
    body: { fileHash, rawText, fileName: file.name, fileSize: file.size, cvUrl },
  });

  if (error) throw new Error(error.message || 'Gagal memproses CV.');
  if (data?.error) throw new Error(data.message || 'Gagal memproses dokumen dengan AI.');

  if (onProgress) onProgress(95, 'Menyimpan data...');

  return { resume: data.resume, duplicate: !!data.duplicate };
}

export async function deletePelamarResume(resume) {
  if (!resume) return;
  if (resume.cv_url) {
    const parts = resume.cv_url.split('/cv_documents/');
    if (parts.length > 1) {
      await supabase.storage.from('cv_documents').remove([parts[1]]);
    }
  }
  const { error } = await supabase.from('pelamar_resumes').delete().eq('id', resume.id);
  if (error) throw error;
}
