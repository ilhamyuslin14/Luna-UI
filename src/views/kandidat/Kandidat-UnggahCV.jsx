import { useState, useRef, useEffect } from 'react';

const UploadIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconUploading = () => (
  <svg className="kt-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
  </svg>
);
const IconWaiting = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconBerhasil = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#089f32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconGagal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" stroke="#fb484b"/>
    <line x1="15" y1="9" x2="9" y2="15" stroke="#fb484b"/>
    <line x1="9" y1="9" x2="15" y2="15" stroke="#fb484b"/>
  </svg>
);
const IconRetry = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#323b4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const LOWONGAN_OPTIONS = [
  'Project Manager', 'Frontend Developer', 'Backend Developer',
  'UI/UX Designer', 'Product Manager', 'QA Engineer',
];

const FILE_DURATION = 3000;
const TICK_MS       = 100;
const FAIL_CHANCE   = 0.2;
const FAIL_REASONS  = ['Gagal Parsing', 'CV Tidak Sesuai', 'Ukuran Terlalu Besar', 'Format Tidak Didukung', 'Koneksi Terputus'];
const randomFailReason = () => FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)];

export default function KandidatUnggahCV({ navigate, historyData, onUploadMore }) {
  const [phase, setPhase]               = useState('drop');
  const [files, setFiles]               = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]);
  const [uploadedAt, setUploadedAt]     = useState('');
  const [isDragOver, setIsDragOver]     = useState(false);
  const [showLowongan, setShowLowongan] = useState(false);
  const [lowongan, setLowongan]         = useState('');
  const [historyLive, setHistoryLive]   = useState(false);
  const inputRef       = useRef(null);
  const statusesRef    = useRef([]);
  const intervalRef    = useRef(null);
  const startTimerRef  = useRef(null); // guards against Strict Mode double-invoke

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearTimeout(startTimerRef.current);
  }, []);

  // Auto-start live animation for "processing" history items
  useEffect(() => {
    if (!historyData) { setHistoryLive(false); return; }
    if (historyData.status === 'processing') {
      startHistoryLive(historyData);
    } else {
      setHistoryLive(false);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(startTimerRef.current);
    };
  }, [historyData?.id]); // eslint-disable-line

  const startHistoryLive = (data, isRetry = false) => {
    clearInterval(intervalRef.current);
    clearTimeout(startTimerRef.current);
    const initial = data.files.map(f => ({
      name:      f.name,
      status:    f.status === 'berhasil' ? 'berhasil' : 'waiting',
      progress:  f.status === 'berhasil' ? 100 : 0,
      // kalau dari Coba Lagi: file yang diretry masuk retrySection (retrying: true)
      // kalau auto-start processing: semua tampil di normalSection (retrying: false)
      retrying:  isRetry && f.status !== 'berhasil',
    }));
    statusesRef.current = initial;
    setFileStatuses([...initial]);
    setUploadedAt(data.tanggal);
    setPhase('uploading');
    setHistoryLive(true);
    startTimerRef.current = setTimeout(() => processNext(), 300);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
      setPhase('files');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      setPhase('files');
    }
  };

  const removeFile = (idx) => {
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setPhase('drop');
      return next;
    });
  };

  const timestamp = () => {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };

  const processNext = () => {
    const idx = statusesRef.current.findIndex(s => s.status === 'waiting');
    if (idx !== -1) processFile(idx);
  };

  const processFile = (idx) => {
    statusesRef.current[idx] = { ...statusesRef.current[idx], status: 'uploading', progress: 0 };
    setFileStatuses([...statusesRef.current]);
    let progress = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      progress = Math.min(100, progress + (TICK_MS / FILE_DURATION) * 100);
      statusesRef.current[idx] = { ...statusesRef.current[idx], progress };
      setFileStatuses([...statusesRef.current]);
      if (progress >= 100) {
        clearInterval(intervalRef.current);
        const isFail = Math.random() < FAIL_CHANCE;
        statusesRef.current[idx] = { ...statusesRef.current[idx], status: isFail ? 'gagal' : 'berhasil', failReason: isFail ? randomFailReason() : undefined, progress: 100, retrying: false };
        setFileStatuses([...statusesRef.current]);
        setTimeout(processNext, 250);
      }
    }, TICK_MS);
  };

  const startUpload = () => {
    const initial = files.map(f => ({ name: f.name, status: 'waiting', progress: 0 }));
    statusesRef.current = initial;
    setFileStatuses([...initial]);
    setUploadedAt(timestamp());
    setPhase('uploading');
    processNext();
  };

  const retryFailed = () => {
    statusesRef.current = statusesRef.current.map(s =>
      s.status === 'gagal' ? { ...s, status: 'waiting', progress: 0, failReason: undefined, retrying: true } : s
    );
    setFileStatuses([...statusesRef.current]);
    processNext();
  };

  const doneCount    = fileStatuses.filter(s => s.status === 'berhasil' || s.status === 'gagal').length;
  const total        = fileStatuses.length;
  const allDone      = total > 0 && doneCount === total;
  const overallPct   = total > 0 ? (doneCount / total) * 100 : 0;
  // normalFiles: not retrying AND not permanently failed
  const normalFiles  = fileStatuses.filter(s => !s.retrying && s.status !== 'gagal');
  // retrySection: files currently retrying (any status) OR permanently failed
  const retrySection = fileStatuses.filter(s => s.retrying || s.status === 'gagal');
  const failedFiles  = retrySection.filter(s => !s.retrying && s.status === 'gagal');

  // ── History static view (selesai, not live) ───────────────────
  if (historyData && !historyLive) {
    const hNormal = historyData.files.filter(f => f.status !== 'gagal');
    const hFailed = historyData.files.filter(f => f.status === 'gagal');
    return (
      <div className="kt-content">
        <div className="kt-upload-card">
          <p className="kt-upload-timestamp">Uploaded {historyData.tanggal}</p>
          <div className="kt-overall-progress">
            <div className="kt-overall-label">
              <span>Selesai</span>
              <span>({historyData.berhasil}/{historyData.total})</span>
            </div>
            <div className="kt-progress-track">
              <div className="kt-progress-fill" style={{ width: `${(historyData.berhasil / historyData.total) * 100}%` }} />
            </div>
          </div>
          {hNormal.length > 0 && (
            <div className="kt-upload-list-box">
              {hNormal.map((f, i) => (
                <div className={`kt-upload-row${i === hNormal.length - 1 ? ' last' : ''}`} key={i}>
                  <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{f.name}</span></div>
                  <div className="kt-upload-row-right">
                    <div className="kt-upload-slot">
                      {f.status === 'berhasil' && <div className="kt-detail-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('kandidat-detail')}>Detail</div>}
                    </div>
                    <div className={`kt-status-label ${f.status}`}>
                      {f.status === 'berhasil' && <><IconBerhasil /><span>Berhasil</span></>}
                      {f.status === 'waiting'   && <><IconWaiting /><span>Menunggu</span></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hFailed.length > 0 && (
            <div className="kt-gagal-section">
              <div className="kt-gagal-header">
                <span className="kt-gagal-title">Gagal Upload</span>
                <button className="kt-btn-retry" onClick={() => startHistoryLive(historyData, true)}>
                  <IconRetry /> Coba Lagi
                </button>
              </div>
              <div className="kt-upload-list-box">
                {hFailed.map((f, i) => (
                  <div className={`kt-upload-row${i === hFailed.length - 1 ? ' last' : ''}`} key={i}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{f.name}</span></div>
                    <div className="kt-upload-row-right">
                      <div className="kt-upload-slot" />
                      <div className="kt-status-label gagal"><IconGagal /><span>{f.failReason || 'Gagal Upload'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="kt-upload-footer">
            <button className="kt-btn-lihat" onClick={() => navigate('kandidat')}>Lihat Kandidat</button>
            <button className="kt-btn-upload-more" onClick={() => onUploadMore ? onUploadMore() : navigate('kandidat-tambah')}>Upload CV Lainnya</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kt-content" onClick={(e) => { if (!e.target.closest('.kt-field-lowongan')) setShowLowongan(false); }}>
      <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handleFileChange} />

      <div className="kt-upload-card">
        {phase !== 'uploading' && (
          <div className="kt-card-heading">
            <h2 className="kt-card-title">Tambah Kandidat</h2>
            <p className="kt-card-subtitle"><strong>Lengkapi Data</strong> <strong>Job Description</strong> sebelum mengunggah CV agar AI dapat langsung melakukan skoring otomatis.</p>
          </div>
        )}

        {phase === 'drop' && (
          <div className={`kt-dropzone${isDragOver ? ' drag-over' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}>
            <div className="kt-dropzone-inner">
              <div className="kt-dropzone-icon"><UploadIcon /></div>
              <div className="kt-dropzone-text">
                <p className="kt-dropzone-label">Drag and Drop or <span>Choose file</span> to upload</p>
                <div className="kt-dropzone-meta">
                  <span>Supported file types: PDF, DOC, DOCX, TXT, MD, JSON</span>
                  <span className="kt-dot" />
                  <span>Max 25 files and 5 Mb file size/file</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'files' && (
          <div className="kt-files-section">
            <div className="kt-field kt-field-lowongan" style={{ position: 'relative' }}>
              <label className="kt-field-label">Pilih Lowongan</label>
              <div className="kt-select-input" onClick={(e) => { e.stopPropagation(); setShowLowongan(!showLowongan); }}>
                <span className={lowongan ? 'kt-select-value' : 'kt-select-placeholder'}>{lowongan || 'Pilih Lowongan Untuk Kandidat'}</span>
                <ChevronIcon />
              </div>
              {showLowongan && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d4d9e6', borderRadius: 8, marginTop: 4, zIndex: 10, padding: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: 200, overflowY: 'auto' }}>
                  {LOWONGAN_OPTIONS.map(opt => (
                    <div key={opt} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: '#323b4d' }} onMouseEnter={e => e.target.style.background = '#f7f8fa'} onMouseLeave={e => e.target.style.background = 'transparent'} onClick={() => { setLowongan(opt); setShowLowongan(false); }}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="kt-file-list-box">
              {files.map((file, idx) => (
                <div className="kt-file-row" key={idx}>
                  <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{file.name}</span></div>
                  <button className="kt-file-remove" onClick={() => removeFile(idx)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <button className="kt-add-more" onClick={() => inputRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add More Files
              </button>
            </div>
            <div className="kt-actions">
              <button className="kt-btn-cancel" onClick={() => { setFiles([]); setPhase('drop'); }}>Cancel</button>
              <button className="kt-btn-upload" onClick={startUpload} disabled={!lowongan} style={{ opacity: !lowongan ? 0.5 : 1, cursor: !lowongan ? 'not-allowed' : 'pointer' }}>Upload</button>
            </div>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="kt-uploading-section">
            <p className="kt-upload-timestamp">Uploaded {uploadedAt}</p>
            <div className="kt-overall-progress">
              <div className="kt-overall-label"><span>{allDone ? 'Selesai' : 'Uploading...'}</span><span>({doneCount}/{total})</span></div>
              <div className="kt-progress-track"><div className="kt-progress-fill" style={{ width: `${overallPct}%` }} /></div>
            </div>
            {normalFiles.length > 0 && (
              <div className="kt-upload-list-box">
                {normalFiles.map((fs, idx) => (
                  <div className={`kt-upload-row${idx === normalFiles.length - 1 ? ' last' : ''}`} key={idx}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                    <div className="kt-upload-row-right">
                      <div className="kt-upload-slot">
                        {fs.status === 'uploading' && <div className="kt-file-progress-track"><div className="kt-file-progress-fill" style={{ width: `${fs.progress}%` }} /></div>}
                        {fs.status === 'berhasil' && <div className="kt-detail-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('kandidat-detail')}>Detail</div>}
                      </div>
                      <div className={`kt-status-label ${fs.status}`}>
                        {fs.status === 'uploading' && <><IconUploading /><span>Proses Upload</span></>}
                        {fs.status === 'waiting'   && <><IconWaiting /><span>Menunggu</span></>}
                        {fs.status === 'berhasil'  && <><IconBerhasil /><span>Berhasil</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {retrySection.length > 0 && (
              <div className="kt-gagal-section">
                <div className="kt-gagal-header">
                  <span className="kt-gagal-title">Gagal Upload</span>
                  {!retrySection.some(s => s.retrying) && (
                    <button className="kt-btn-retry" onClick={retryFailed}>
                      <IconRetry /> Coba Lagi
                    </button>
                  )}
                </div>
                <div className="kt-upload-list-box">
                  {retrySection.map((fs, idx) => (
                    <div className={`kt-upload-row${idx === retrySection.length - 1 ? ' last' : ''}`} key={idx}>
                      <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                      <div className="kt-upload-row-right">
                        <div className="kt-upload-slot">
                          {fs.status === 'uploading' && <div className="kt-file-progress-track"><div className="kt-file-progress-fill" style={{ width: `${fs.progress}%` }} /></div>}
                        </div>
                        <div className={`kt-status-label ${fs.status}`}>
                          {fs.status === 'uploading' && <><IconUploading /><span>Proses Upload</span></>}
                          {fs.status === 'waiting'   && <><IconWaiting /><span>Menunggu</span></>}
                          {fs.status === 'gagal'     && <><IconGagal /><span>{fs.failReason || 'Gagal Upload'}</span></>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="kt-upload-footer">
              <button className="kt-btn-lihat" onClick={() => navigate('kandidat')}>Lihat Kandidat</button>
              <button className="kt-btn-upload-more" onClick={() => { setFiles([]); setFileStatuses([]); setPhase('drop'); }}>Upload CV Lainnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
