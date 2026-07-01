import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase.js';
import { uploadAndExtractCV, createActivityLog, updateActivityLog } from '../services/kandidatService.js';
import { runScoring } from '../services/scoringService.js';
import { useAuth } from './AuthContext.jsx';

const UploadContext = createContext();

export function useUpload() {
  return useContext(UploadContext);
}

export function UploadProvider({ children }) {
  const { user } = useAuth();
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

  const enqueueScoringJob = async (kandidatId, seleksiId, seleksiNama, namaFile, companyId, existingLogId = null) => {
    const job = {
      id: `SC-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      kandidatId,
      seleksiId,
      seleksiNama,
      namaFile,
      companyId,
      status: 'queued',
      error: null,
      logId: existingLogId,
    };
    scoringQueueRef.current = [...scoringQueueRef.current, job];
    setScoringQueue([...scoringQueueRef.current]);

    let logId = existingLogId;
    if (!logId) {
      try {
        const log = await createActivityLog({
          batch_id: `RE-${Date.now()}`,
          company_id: companyId,
          nama_file: namaFile,
          tipe_aktivitas: 'scoring_only',
          upload_status: null,
          scoring_status: 'menunggu',
          kandidat_id: kandidatId,
          source: 'HR'
        });
        logId = log.id;
        
        // Update job with actual logId
        const jobIdx = scoringQueueRef.current.findIndex(j => j.id === job.id);
        if (jobIdx !== -1) {
          scoringQueueRef.current[jobIdx].logId = logId;
        }
      } catch (e) { console.error(e); }
    } else {
      await updateActivityLog(logId, { scoring_status: 'menunggu' }).catch(()=>{});
    }

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

    if (job.logId) {
      await updateActivityLog(job.logId, { scoring_status: 'proses' }).catch(()=>{});
    }

    try {
      await runScoring(job.kandidatId, job.seleksiId, job.companyId);
      scoringQueueRef.current[idx] = { ...scoringQueueRef.current[idx], status: 'done' };
      if (job.logId) {
        await updateActivityLog(job.logId, { scoring_status: 'berhasil' }).catch(()=>{});
      }
    } catch (err) {
      let finalErrMsg = err.message || 'Gagal scoring';
      if (finalErrMsg.includes('High Demand')) {
        finalErrMsg = 'AI Scoring Sibuk: ' + finalErrMsg;
      }
      scoringQueueRef.current[idx] = {
        ...scoringQueueRef.current[idx],
        status: 'error',
        error: finalErrMsg,
      };
      if (job.logId) {
        await updateActivityLog(job.logId, { scoring_status: 'gagal', scoring_fail_reason: finalErrMsg }).catch(()=>{});
      }
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
    statusesRef.current[idx] = { ...target, status: 'uploading', progress: 5, statusText: 'Memulai...' };
    setGlobalFiles([...statusesRef.current]);

    let logId = null;
    const tipe_aktivitas = target.posisi?.id ? 'upload_and_scoring' : 'upload_only';
    try {
      const log = await createActivityLog({
        batch_id: target.batchId,
        company_id: target.companyId,
        nama_file: target.name,
        tipe_aktivitas,
        upload_status: 'proses',
        scoring_status: target.posisi?.id ? 'menunggu' : null,
        source: user?.id || 'HR'
      });
      logId = log.id;
      statusesRef.current[idx] = { ...statusesRef.current[idx], logId };
    } catch (e) { console.error('Failed to create initial log', e); }

    try {
      const onProgress = (prog, text) => {
        statusesRef.current[idx] = { ...statusesRef.current[idx], progress: prog, statusText: text };
        setGlobalFiles([...statusesRef.current]);
      };

      const data = await uploadAndExtractCV(
        target.companyId, 
        target.file, 
        target.posisi?.jabatan || null, 
        onProgress, 
        user?.id || 'HR',
        target.posisi?.id ? true : false
      );

      if (logId) {
        await updateActivityLog(logId, {
          upload_status: 'berhasil',
          kandidat_id: data?.id || null,
        }).catch(()=>{});
      }

      // Enqueue scoring jika posisi dipilih dan upload berhasil
      if (target.posisi?.id && data?.id) {
        enqueueScoringJob(data.id, target.posisi.id, target.posisi.jabatan, target.name, target.companyId, logId);
        statusesRef.current[idx] = { ...statusesRef.current[idx], status: 'berhasil', scoringEnqueued: true, progress: 60, data: data.id };
        setGlobalFiles([...statusesRef.current]);
      } else {
        statusesRef.current[idx] = { ...statusesRef.current[idx], status: 'berhasil', progress: 100, data: data?.id || data };
        setGlobalFiles([...statusesRef.current]);
      }

    } catch (error) {
      let finalErrMsg = error.message || 'Gagal Ekstraksi';
      if (finalErrMsg.includes('High Demand')) {
        finalErrMsg = 'Ekstrak CV Sibuk: ' + finalErrMsg;
      }
      statusesRef.current[idx] = {
        ...statusesRef.current[idx],
        status: 'gagal',
        failReason: finalErrMsg,
        progress: 100,
      };
      setGlobalFiles([...statusesRef.current]);

      if (logId) {
        await updateActivityLog(logId, {
          upload_status: 'gagal',
          upload_fail_reason: finalErrMsg,
          kandidat_id: error.existingKandidatId || null,
        }).catch(() => {});
      }

      // Duplikat + posisi dipilih → tetap enqueue scoring dengan kandidat yang sudah ada
      if (error.existingKandidatId && target.posisi?.id) {
        enqueueScoringJob(error.existingKandidatId, target.posisi.id, target.posisi.jabatan, target.name, target.companyId, logId);
        statusesRef.current[idx] = { ...statusesRef.current[idx], scoringEnqueued: true, data: error.existingKandidatId };
        setGlobalFiles([...statusesRef.current]);
      }

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

  const retryGlobalFileById = (id) => {
    const idx = statusesRef.current.findIndex(s => s.id === id);
    if (idx !== -1) {
      const fileStatus = statusesRef.current[idx];
      
      // Jika upload sudah berhasil (termasuk kasus duplikat) tapi scoring gagal, retry scoring saja
      if ((fileStatus.status === 'berhasil' || fileStatus.scoringEnqueued) && fileStatus.data && fileStatus.posisi?.id) {
        enqueueScoringJob(fileStatus.data, fileStatus.posisi.id, fileStatus.posisi.jabatan, fileStatus.name, fileStatus.companyId, fileStatus.logId);
        // Hapus antrean error lama untuk UI
        scoringQueueRef.current = scoringQueueRef.current.filter(j => j.namaFile !== fileStatus.name || j.status !== 'error');
        setScoringQueue([...scoringQueueRef.current]);
        return;
      }

      statusesRef.current[idx] = { ...statusesRef.current[idx], status: 'waiting', progress: 0, failReason: null };
      setGlobalFiles([...statusesRef.current]);
      processNextGlobal();
    }
  };

  const value = {
    globalFiles,
    isUploading,
    isWidgetMinimized,
    setIsWidgetMinimized,
    startGlobalUpload,
    clearGlobalUploads,
    retryGlobalFileById,
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
