import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase.js';
import { uploadAndExtractCV, saveUploadLog } from '../services/kandidatService.js';
import { runScoring } from '../services/scoringService.js';

const UploadContext = createContext();

export function useUpload() {
  return useContext(UploadContext);
}

export function UploadProvider({ children }) {
  const [globalFiles, setGlobalFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [scoringQueue, setScoringQueue] = useState([]); // [{ id, kandidatId, seleksiId, seleksiNama, namaFile, companyId, status, error }]

  const statusesRef       = useRef([]);
  const activeUploadsRef  = useRef(0);
  const concurrentLimitRef = useRef(5);
  const scoringQueueRef   = useRef([]);
  const activeScoringRef  = useRef(0);

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await supabase.from('sandbox_configs').select('concurrent_limit').limit(1).single();
        if (data?.concurrent_limit) concurrentLimitRef.current = data.concurrent_limit;
      } catch (_) {}
    }
    loadConfig();
  }, []);

  /* ── Scoring queue ─────────────────────────────────────── */

  const enqueueScoringJob = (kandidatId, seleksiId, seleksiNama, namaFile, companyId) => {
    const job = {
      id: `SC-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      kandidatId,
      seleksiId,
      seleksiNama,
      namaFile,
      companyId,
      status: 'queued',
      error: null,
    };
    scoringQueueRef.current = [...scoringQueueRef.current, job];
    setScoringQueue([...scoringQueueRef.current]);
    processNextScoring();
  };

  const processNextScoring = () => {
    while (activeScoringRef.current < concurrentLimitRef.current) {
      const idx = scoringQueueRef.current.findIndex(j => j.status === 'queued');
      if (idx === -1) break;
      activeScoringRef.current += 1;
      processScoringJob(idx);
    }
  };

  const processScoringJob = async (idx) => {
    const job = scoringQueueRef.current[idx];
    scoringQueueRef.current[idx] = { ...job, status: 'processing' };
    setScoringQueue([...scoringQueueRef.current]);

    try {
      await runScoring(job.kandidatId, job.seleksiId, job.companyId);
      scoringQueueRef.current[idx] = { ...scoringQueueRef.current[idx], status: 'done' };
    } catch (err) {
      scoringQueueRef.current[idx] = {
        ...scoringQueueRef.current[idx],
        status: 'error',
        error: err.message || 'Gagal scoring',
      };
    } finally {
      activeScoringRef.current -= 1;
      setScoringQueue([...scoringQueueRef.current]);
      setTimeout(processNextScoring, 250);
    }
  };

  /* ── Upload queue ──────────────────────────────────────── */

  const startGlobalUpload = (companyId, filesArray, posisi) => {
    const batchId = `BATCH-${Date.now()}`;
    const initial = filesArray.map((f, i) => ({
      id: `${batchId}-${i}`,
      batchId,
      companyId,
      posisi, // { id, jabatan } | null
      file: f,
      name: f.name,
      status: 'waiting',
      progress: 0,
    }));

    statusesRef.current = [...initial];
    scoringQueueRef.current = [];
    setScoringQueue([]);
    setGlobalFiles([...statusesRef.current]);
    setIsUploading(true);
    setIsWidgetMinimized(false);

    processNextGlobal();
  };

  const processNextGlobal = () => {
    while (activeUploadsRef.current < concurrentLimitRef.current) {
      const idx = statusesRef.current.findIndex(s => s.status === 'waiting');
      if (idx === -1) break;
      activeUploadsRef.current += 1;
      processGlobalFile(idx);
    }
  };

  const processGlobalFile = async (idx) => {
    const target = statusesRef.current[idx];
    statusesRef.current[idx] = { ...target, status: 'uploading', progress: 10, statusText: 'Memulai...' };
    setGlobalFiles([...statusesRef.current]);

    try {
      const onProgress = (prog, text) => {
        statusesRef.current[idx] = { ...statusesRef.current[idx], progress: prog, statusText: text };
        setGlobalFiles([...statusesRef.current]);
      };

      const data = await uploadAndExtractCV(target.companyId, target.file, target.posisi?.jabatan || null, onProgress);

      statusesRef.current[idx] = { ...statusesRef.current[idx], status: 'berhasil', progress: 100, data };
      setGlobalFiles([...statusesRef.current]);

      // Enqueue scoring jika posisi dipilih dan upload berhasil
      if (target.posisi?.id && data?.id) {
        enqueueScoringJob(data.id, target.posisi.id, target.posisi.jabatan, target.name, target.companyId);
      }

      await saveUploadLog({
        batch_id: target.batchId,
        company_id: target.companyId,
        nama_file: target.name,
        status: 'berhasil',
        kandidat_id: data?.id || null,
      });

    } catch (error) {
      statusesRef.current[idx] = {
        ...statusesRef.current[idx],
        status: 'gagal',
        failReason: error.message || 'Gagal Ekstraksi',
        progress: 100,
      };
      setGlobalFiles([...statusesRef.current]);

      // Duplikat + posisi dipilih → tetap enqueue scoring dengan kandidat yang sudah ada
      if (error.existingKandidatId && target.posisi?.id) {
        enqueueScoringJob(error.existingKandidatId, target.posisi.id, target.posisi.jabatan, target.name, target.companyId);
      }

      await saveUploadLog({
        batch_id: target.batchId,
        company_id: target.companyId,
        nama_file: target.name,
        status: 'gagal',
        fail_reason: error.message || 'Gagal Ekstraksi',
      }).catch(() => {});

    } finally {
      activeUploadsRef.current -= 1;
      setTimeout(processNextGlobal, 250);
    }
  };

  const clearGlobalUploads = () => {
    statusesRef.current = [];
    scoringQueueRef.current = [];
    setGlobalFiles([]);
    setScoringQueue([]);
    setIsUploading(false);
  };

  const clearScoringQueue = () => {
    scoringQueueRef.current = [];
    setScoringQueue([]);
  };

  const value = {
    globalFiles,
    isUploading,
    isWidgetMinimized,
    setIsWidgetMinimized,
    startGlobalUpload,
    clearGlobalUploads,
    scoringQueue,
    enqueueScoringJob,
    clearScoringQueue,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
}
