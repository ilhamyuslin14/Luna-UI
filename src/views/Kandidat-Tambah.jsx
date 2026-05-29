import { useState, useRef, useEffect } from 'react';

const UploadIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
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
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBerhasil = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#089f32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconGagal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fb484b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const IconRetry = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#323b4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.44"/>
  </svg>
);

const TICK_MS = 50;
const FILE_DURATION = 1400;
const FAIL_CHANCE = 0.2;

export default function KandidatTambah({ navigate }) {
  const [phase, setPhase] = useState('drop'); // 'drop' | 'files' | 'uploading'
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]);
  const [uploadedAt, setUploadedAt] = useState('');
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const statusesRef = useRef([]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (!dropped.length) return;
    setFiles(prev => [...prev, ...dropped]);
    setPhase('files');
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setFiles(prev => [...prev, ...selected]);
    setPhase('files');
    e.target.value = '';
  };

  const removeFile = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    if (next.length === 0) setPhase('drop');
  };

  const timestamp = () => {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
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
        statusesRef.current[idx] = {
          ...statusesRef.current[idx],
          status: Math.random() < FAIL_CHANCE ? 'gagal' : 'berhasil',
          progress: 100,
        };
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
      s.status === 'gagal' ? { ...s, status: 'waiting', progress: 0 } : s
    );
    setFileStatuses([...statusesRef.current]);
    processNext();
  };

  const doneCount = fileStatuses.filter(s => s.status === 'berhasil' || s.status === 'gagal').length;
  const total = fileStatuses.length;
  const allDone = total > 0 && doneCount === total;
  const overallPct = total > 0 ? (doneCount / total) * 100 : 0;
  const normalFiles = fileStatuses.filter(s => s.status !== 'gagal');
  const failedFiles = fileStatuses.filter(s => s.status === 'gagal');

  return (
    <div className="kt-view">
      <div className="kt-title-bar">
        <h1 className="kt-title">{phase === 'drop' ? 'Tambah Kandidat' : 'Unggah CV Kandidat'}</h1>
        <button className="kt-btn-close" onClick={() => navigate('kandidat')}>Tutup</button>
      </div>

      <div className="kt-subnav">
        <div className="kt-tabs">
          <button className="kt-tab active">Unggah CV</button>
        </div>
      </div>

      <div className="kt-content">
        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handleFileChange} />

        <div className="kt-upload-card">

          {/* Heading — hanya drop & files */}
          {phase !== 'uploading' && (
            <div className="kt-card-heading">
              <h2 className="kt-card-title">Tambah Kandidat</h2>
              <p className="kt-card-subtitle">
                <strong>Lengkapi Data</strong> <strong>Job Description</strong> sebelum mengunggah CV agar AI dapat langsung melakukan skoring otomatis.
              </p>
            </div>
          )}

          {/* ── DROP ── */}
          {phase === 'drop' && (
            <div
              className={`kt-dropzone${isDragOver ? ' drag-over' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
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

          {/* ── FILES SELECTED ── */}
          {phase === 'files' && (
            <div className="kt-files-section">
              <div className="kt-field">
                <label className="kt-field-label">Pilih Lowongan</label>
                <div className="kt-select-input">
                  <span className="kt-select-placeholder">Pilih Lowongan Untuk Kandidat</span>
                  <ChevronIcon />
                </div>
              </div>
              <div className="kt-file-list-box">
                {files.map((file, idx) => (
                  <div className="kt-file-row" key={idx}>
                    <div className="kt-file-left">
                      <DocIcon />
                      <span className="kt-file-name">{file.name}</span>
                    </div>
                    <button className="kt-file-remove" onClick={() => removeFile(idx)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
                <button className="kt-add-more" onClick={() => inputRef.current?.click()}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Add More Files
                </button>
              </div>
              <div className="kt-actions">
                <button className="kt-btn-cancel" onClick={() => { setFiles([]); setPhase('drop'); }}>Cancel</button>
                <button className="kt-btn-upload" onClick={startUpload}>Upload</button>
              </div>
            </div>
          )}

          {/* ── UPLOADING ── */}
          {phase === 'uploading' && (
            <div className="kt-uploading-section">
              <p className="kt-upload-timestamp">Uploaded {uploadedAt}</p>

              {/* Overall progress */}
              <div className="kt-overall-progress">
                <div className="kt-overall-label">
                  <span>{allDone ? 'Selesai' : 'Uploading...'}</span>
                  <span>({doneCount}/{total})</span>
                </div>
                <div className="kt-progress-track">
                  <div className="kt-progress-fill" style={{ width: `${overallPct}%` }} />
                </div>
              </div>

              {/* File list — normal (uploading / waiting / berhasil) */}
              {normalFiles.length > 0 && (
                <div className="kt-upload-list-box">
                  {normalFiles.map((fs, idx) => (
                    <div className={`kt-upload-row${idx === normalFiles.length - 1 ? ' last' : ''}`} key={idx}>
                      <div className="kt-file-left">
                        <DocIcon />
                        <span className="kt-file-name">{fs.name}</span>
                      </div>
                      <div className="kt-upload-row-right">
                        <div className="kt-upload-slot">
                          {fs.status === 'uploading' && (
                            <div className="kt-file-progress-track">
                              <div className="kt-file-progress-fill" style={{ width: `${fs.progress}%` }} />
                            </div>
                          )}
                          {fs.status === 'berhasil' && (
                            <div className="kt-detail-badge">Detail</div>
                          )}
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

              {/* Gagal section */}
              {failedFiles.length > 0 && (
                <div className="kt-gagal-section">
                  <div className="kt-gagal-header">
                    <span className="kt-gagal-title">Gagal Upload</span>
                    <button className="kt-btn-retry" onClick={retryFailed}>
                      <IconRetry />
                      Coba Lagi
                    </button>
                  </div>
                  <div className="kt-upload-list-box">
                    {failedFiles.map((fs, idx) => (
                      <div className={`kt-upload-row${idx === failedFiles.length - 1 ? ' last' : ''}`} key={idx}>
                        <div className="kt-file-left">
                          <DocIcon />
                          <span className="kt-file-name">{fs.name}</span>
                        </div>
                        <div className="kt-upload-row-right">
                          <div className="kt-upload-slot" />
                          <div className="kt-status-label gagal">
                            <IconGagal /><span>Gagal Upload</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="kt-upload-footer">
                <button className="kt-btn-lihat" onClick={() => navigate('kandidat')}>Lihat Kandidat</button>
                <button className="kt-btn-upload-more" onClick={() => { setFiles([]); setFileStatuses([]); setPhase('drop'); }}>
                  Upload CV Lainnya
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
