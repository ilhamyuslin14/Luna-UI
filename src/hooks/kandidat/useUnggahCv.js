import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getSeleksi } from '../../services/seleksiService.js';

// Dipakai bareng oleh Kandidat-UnggahCV.jsx (desktop) dan
// MobileUnggahCv.jsx — logic murni (state file yang di-stage, pilih posisi,
// derivasi status per-file dari UploadContext) dipisah dari markup/CSS yang
// beda total. `phase` SENGAJA diinisialisasi dari `globalFiles` (context
// global, bukan local state) — supaya kalau user pindah halaman lalu balik
// lagi ke sini, prosesnya tidak "hilang" secara UI: langsung lanjut nampilin
// progress yang sebenarnya masih berjalan di background, bukan reset ke
// dropzone kosong.
export function getErrorLabel(msg) {
  if (!msg) return { label: 'Gagal Unggah', detail: '' };
  if (/sudah pernah diunggah/i.test(msg)) return { label: 'File Duplikat', detail: msg };
  if (/bukan cv|lowongan|brosur/i.test(msg)) return { label: 'Bukan CV', detail: msg };
  if (/konfigurasi ai/i.test(msg)) return { label: 'Konfigurasi Error', detail: msg };
  if (/format file/i.test(msg)) return { label: 'Format Salah', detail: msg };
  if (/Ekstrak CV Sibuk/i.test(msg)) return { label: 'Gagal Ekstrak', detail: msg };
  if (/AI Scoring Sibuk/i.test(msg)) return { label: 'Gagal Scoring', detail: msg };
  return { label: 'Gagal Proses', detail: msg };
}

export function isRetryableError(msg) {
  if (!msg) return true;
  if (/sudah pernah diunggah/i.test(msg)) return false;
  if (/bukan cv|lowongan|brosur/i.test(msg)) return false;
  if (/format/i.test(msg)) return false;
  return true;
}

export default function useUnggahCv(initialSeleksiId) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const { startGlobalUpload, globalFiles, clearGlobalUploads, retryGlobalFileById, scoringQueue } = useUpload();

  const [phase, setPhase] = useState(() => globalFiles.length > 0 ? 'uploading' : 'drop');
  const [files, setFiles] = useState([]);
  const [posisiOptions, setPosisiOptions] = useState([]);
  const [posisi, setPosisi] = useState(null); // { id, jabatan } | null

  useEffect(() => {
    async function loadPosisi() {
      if (!companyId) return;
      try {
        const data = await getSeleksi(companyId);
        setPosisiOptions(data || []);
        if (initialSeleksiId && data) {
          const match = data.find(d => d.id === initialSeleksiId);
          if (match) setPosisi({ id: match.id, jabatan: match.jabatan });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPosisi();
  }, [companyId, initialSeleksiId]);

  const addFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    setFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}-${f.size}`));
      const unique = Array.from(newFiles).filter(f => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
    setPhase('files');
  };

  const removeFile = (idx) => {
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setPhase('drop');
      return next;
    });
  };

  const cancelFiles = () => { setFiles([]); setPhase('drop'); };

  const startUpload = () => {
    startGlobalUpload(companyId, files, posisi);
    setFiles([]);
    setPhase('uploading'); // Tetap di halaman progress
  };

  const uploadMore = () => {
    clearGlobalUploads();
    setPhase('drop');
  };

  // Derived state dari UploadContext untuk phase 'uploading' — sama persis
  // logic-nya baik file diunggah tanpa posisi (upload_only) maupun dengan
  // posisi (upload_and_scoring, dua tahap: unggah lalu skoring AI).
  const extendedFiles = globalFiles.map(f => {
    const isUploadAndScoring = !!f.posisi;
    const scoringJob = isUploadAndScoring ? scoringQueue.find(sq => sq.namaFile === f.name) : null;

    let finalStatus = 'waiting';
    let isFinished = false;
    let isFailed = false;
    let failReason = null;
    let statusText = f.statusText || 'Proses Unggah';

    if (!isUploadAndScoring) {
      isFinished = f.status === 'berhasil' || f.status === 'gagal';
      finalStatus = f.status;
      isFailed = f.status === 'gagal';
      failReason = f.failReason;
      statusText = finalStatus === 'berhasil' ? 'Unggah Berhasil' : statusText;
    } else {
      const uploadFinished = f.status === 'berhasil' || f.status === 'gagal';
      if (!uploadFinished) {
        finalStatus = f.status;
      } else if (f.scoringEnqueued) {
        if (scoringJob) {
          if (scoringJob.status === 'done') {
            isFinished = true;
            finalStatus = 'berhasil';
            statusText = 'Penilaian AI Berhasil';
            f.progress = 100;
          } else if (scoringJob.status === 'error') {
            isFinished = true;
            finalStatus = 'gagal';
            isFailed = true;
            failReason = f.status === 'gagal' ? `Unggah Gagal: ${f.failReason} & AI Gagal: ${scoringJob.error}` : `AI Gagal: ${scoringJob.error}`;
          } else {
            finalStatus = 'uploading';
            statusText = 'Proses Penilaian AI...';
            f.progress = 85;
          }
        } else {
          finalStatus = 'uploading';
          statusText = 'Menunggu AI...';
          f.progress = 60;
        }
      } else {
        isFinished = true;
        finalStatus = f.status;
        isFailed = f.status === 'gagal';
        failReason = f.failReason;
      }
    }
    return { ...f, finalStatus, isFinished, isFailed, failReason, statusText };
  });

  const total = extendedFiles.length;
  const doneCount = extendedFiles.filter(s => s.isFinished).length;
  const allDone = total > 0 && doneCount === total;
  const overallPct = total > 0 ? (doneCount / total) * 100 : 0;
  const normalFiles = extendedFiles.filter(s => !s.isFailed);
  const failedFiles = extendedFiles.filter(s => s.isFailed);

  return {
    isFreePlan,
    phase, files, posisiOptions, posisi, setPosisi,
    addFiles, removeFile, cancelFiles, startUpload, uploadMore, retryGlobalFileById,
    extendedFiles, total, doneCount, allDone, overallPct, normalFiles, failedFiles,
  };
}
