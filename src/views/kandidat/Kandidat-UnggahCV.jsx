import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../context/UploadContext';
import { getSeleksi } from '../../services/seleksiService';

const UploadIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconUploading = () => (
  <svg className="kt-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </svg>
);
const IconWaiting = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconBerhasil = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#089f32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconGagal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" stroke="#fb484b" />
    <line x1="15" y1="9" x2="9" y2="15" stroke="#fb484b" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="#fb484b" />
  </svg>
);
const IconRetry = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#323b4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconInfoTip = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6" cy="6" r="5.4" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="5.4" y="5" width="1.2" height="4" rx="0.6" fill="currentColor"/>
    <circle cx="6" cy="3.5" r="0.7" fill="currentColor"/>
  </svg>
);

function getErrorLabel(msg) {
  if (!msg) return { label: 'Gagal Upload', detail: '' };
  if (/sudah pernah diunggah/i.test(msg))         return { label: 'File Duplikat',       detail: msg };
  if (/bukan cv|lowongan|brosur/i.test(msg))       return { label: 'Bukan CV',            detail: msg };
  if (/konfigurasi ai/i.test(msg))                 return { label: 'Konfigurasi Error',   detail: msg };
  if (/format file/i.test(msg))                    return { label: 'Format Salah',        detail: msg };
  return { label: 'Gagal Proses', detail: msg };
}

const ErrorLabel = ({ msg }) => {
  const { label, detail } = getErrorLabel(msg);
  return (
    <div className="kt-status-label gagal">
      <IconGagal />
      <span>{label}</span>
      {detail && (
        <span className="kt-err-tip-wrap">
          <IconInfoTip />
          <div className="kt-err-tooltip">{detail}</div>
        </span>
      )}
    </div>
  );
};



const FILE_DURATION = 3000;
const TICK_MS = 100;
const FAIL_CHANCE = 0.2;
const FAIL_REASONS = ['Gagal Parsing', 'CV Tidak Sesuai', 'Ukuran Terlalu Besar', 'Format Tidak Didukung', 'Koneksi Terputus'];
const randomFailReason = () => FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)];

export default function KandidatUnggahCV({ navigate, historyData, onUploadMore }) {
  const { companyId } = useAuth();
  const { startGlobalUpload, globalFiles, clearGlobalUploads } = useUpload();
  const [phase, setPhase] = useState(() => globalFiles.length > 0 ? 'uploading' : 'drop');
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPosisi, setShowPosisi] = useState(false);
  const [posisiOptions, setPosisiOptions] = useState([]);
  const [posisi, setPosisi] = useState(null); // { id, jabatan } | null
  const inputRef = useRef(null);

  useEffect(() => {
    async function loadPosisi() {
      if (!companyId) return;
      try {
        const data = await getSeleksi(companyId);
        setPosisiOptions(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadPosisi();
  }, [companyId]);

  // Menghapus useEffect historyLive karena riwayat kini sepenuhnya statis

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

  const startUpload = () => {
    startGlobalUpload(companyId, files, posisi);
    setFiles([]);
    setPhase('uploading'); // Tetap di halaman progress
  };

  // Derived state dari Context untuk phase 'uploading'
  const ctxFiles = globalFiles;
  const doneCount = ctxFiles.filter(s => s.status === 'berhasil' || s.status === 'gagal').length;
  const total = ctxFiles.length;
  const allDone = total > 0 && doneCount === total;
  const overallPct = total > 0 ? (doneCount / total) * 100 : 0;
  const normalFiles = ctxFiles.filter(s => s.status !== 'gagal');
  const failedFiles = ctxFiles.filter(s => s.status === 'gagal');

  // ── History static view (selesai, not live) ───────────────────
  if (historyData) {
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
                      {f.status === 'berhasil' && (
                        <div
                          className="kt-detail-badge"
                          style={{ cursor: f.kandidatId ? 'pointer' : 'default', opacity: f.kandidatId ? 1 : 0.5 }}
                          onClick={() => f.kandidatId && navigate('kandidat-detail', { kandidat: f.kandidatId })}
                        >
                          Detail
                        </div>
                      )}
                    </div>
                    <div className={`kt-status-label ${f.status}`}>
                      {f.status === 'berhasil' && <><IconBerhasil /><span>Berhasil</span></>}
                      {f.status === 'waiting' && <><IconWaiting /><span>Menunggu</span></>}
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
              </div>
              <div className="kt-upload-list-box">
                {hFailed.map((f, i) => (
                  <div className={`kt-upload-row${i === hFailed.length - 1 ? ' last' : ''}`} key={i}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{f.name}</span></div>
                    <div className="kt-upload-row-right">
                      <div className="kt-upload-slot" />
                      <ErrorLabel msg={f.failReason} />
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
    <div className="kt-content" onClick={(e) => { if (!e.target.closest('.kt-field-lowongan')) setShowPosisi(false); }}>
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
                <p className="kt-dropzone-label">Tarik dan Lepas atau <span>Pilih file</span> untuk diunggah</p>
                <div className="kt-dropzone-meta">
                  <span>Tipe file yang didukung: PDF, DOC, DOCX, TXT, MD, JSON</span>
                  <span className="kt-dot" />
                  <span>Maks 25 file dan ukuran 5 Mb/file</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'files' && (
          <div className="kt-files-section">
            <div className="kt-field kt-field-lowongan" style={{ position: 'relative' }}>
              <label className="kt-field-label">Pilih Posisi</label>
              <div className="kt-select-input" onClick={(e) => { e.stopPropagation(); setShowPosisi(!showPosisi); }}>
                <span className={posisi ? 'kt-select-value' : 'kt-select-placeholder'}>{posisi?.jabatan || 'Pilih posisi untuk kandidat'}</span>
                <ChevronIcon />
              </div>
              {showPosisi && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d4d9e6', borderRadius: 8, marginTop: 4, zIndex: 10, padding: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: 200, overflowY: 'auto' }}>
                  {posisiOptions.map(opt => (
                    <div key={opt.id} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: '#323b4d' }} onMouseEnter={e => e.target.style.background = '#f7f8fa'} onMouseLeave={e => e.target.style.background = 'transparent'} onClick={() => { setPosisi({ id: opt.id, jabatan: opt.jabatan }); setShowPosisi(false); }}>{opt.jabatan}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="kt-file-list-box">
              {files.map((file, idx) => (
                <div className="kt-file-row" key={idx}>
                  <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{file.name}</span></div>
                  <button className="kt-file-remove" onClick={() => removeFile(idx)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              <button className="kt-add-more" onClick={() => inputRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Tambah File Lainnya
              </button>
            </div>
            <div className="kt-actions">
              <button className="kt-btn-cancel" onClick={() => { setFiles([]); setPhase('drop'); }}>Batal</button>
              <button className="kt-btn-upload" onClick={startUpload}>Unggah</button>
            </div>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="kt-uploading-section">
            <p className="kt-upload-timestamp">
              {allDone ? 'Selesai' : `Mengunggah ${doneCount}/${total} file...`}
            </p>
            <div className="kt-overall-progress">
              <div className="kt-overall-label">
                <span>{allDone ? 'Selesai' : 'Uploading...'}</span>
                <span>({doneCount}/{total})</span>
              </div>
              <div className="kt-progress-track">
                <div className="kt-progress-fill" style={{ width: `${overallPct}%` }} />
              </div>
            </div>

            {normalFiles.length > 0 && (
              <div className="kt-upload-list-box">
                {normalFiles.map((fs, idx) => (
                  <div className={`kt-upload-row${idx === normalFiles.length - 1 ? ' last' : ''}`} key={fs.id || idx}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                    <div className="kt-upload-row-right">
                      <div className="kt-upload-slot">
                        {fs.status === 'uploading' && <div className="kt-file-progress-track"><div className="kt-file-progress-fill" style={{ width: `${fs.progress}%` }} /></div>}
                        {fs.status === 'berhasil' && <div className="kt-detail-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('kandidat-detail', { kandidat: fs.data })}>Detail</div>}
                      </div>
                      <div className={`kt-status-label ${fs.status}`}>
                        {fs.status === 'uploading' && <><IconUploading /><span>{fs.statusText || 'Proses Upload'}</span></>}
                        {fs.status === 'waiting' && <><IconWaiting /><span>Menunggu</span></>}
                        {fs.status === 'berhasil' && <><IconBerhasil /><span>Berhasil</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {failedFiles.length > 0 && (
              <div className="kt-gagal-section">
                <div className="kt-gagal-header">
                  <span className="kt-gagal-title">Gagal Upload</span>
                </div>
                <div className="kt-upload-list-box">
                  {failedFiles.map((fs, idx) => (
                    <div className={`kt-upload-row${idx === failedFiles.length - 1 ? ' last' : ''}`} key={fs.id || idx}>
                      <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                      <div className="kt-upload-row-right">
                        <div className="kt-upload-slot" />
                        <ErrorLabel msg={fs.failReason} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="kt-upload-footer">
              <button className="kt-btn-lihat" onClick={() => navigate('kandidat')}>Lihat Kandidat</button>
              {allDone && (
                <button className="kt-btn-upload-more" onClick={() => { clearGlobalUploads(); setPhase('drop'); }}>
                  Upload CV Lainnya
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
