import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useUnggahCv, { getErrorLabel, isRetryableError } from '../../hooks/kandidat/useUnggahCv.js';
import { deriveHistoryFiles } from '../../hooks/kandidat/useRiwayatUnggah.js';

const UploadIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconLockLarge = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="10.5" width="14" height="9" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconBolt = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
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
  <svg className="kt-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-500)" strokeWidth="2.5" strokeLinecap="round">
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


const PortalTooltip = ({ content, children }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);

  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + (rect.width / 2) + 14 + 5, // 14px for arrow offset, 5px for half arrow width
      });
      setShow(true);
    }
  };

  const handleScroll = useCallback(() => {
    if (show) setShow(false);
  }, [show]);

  useEffect(() => {
    if (show) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [show, handleScroll]);

  return (
    <span 
      className="kt-err-tip-wrap" 
      ref={wrapperRef} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && createPortal(
        <div 
          className="kt-err-tooltip" 
          style={{ 
            display: 'block', 
            position: 'fixed',
            top: coords.top, 
            left: coords.left,
            transform: 'translate(-100%, -100%)',
            bottom: 'auto',
            right: 'auto'
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
};

const ErrorLabel = ({ msg }) => {
  const { label, detail } = getErrorLabel(msg);
  return (
    <div className="kt-status-label gagal">
      <IconGagal />
      <span>{label}</span>
      {detail && (
        <PortalTooltip content={detail}>
          <IconInfoTip />
        </PortalTooltip>
      )}
    </div>
  );
};



const FILE_DURATION = 3000;
const TICK_MS = 100;
const FAIL_CHANCE = 0.2;
const FAIL_REASONS = ['Gagal Parsing', 'CV Tidak Sesuai', 'Ukuran Terlalu Besar', 'Format Tidak Didukung', 'Koneksi Terputus'];
const randomFailReason = () => FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)];

export default function KandidatUnggahCV({ navigate, historyData, onUploadMore, initialSeleksiId }) {
  const {
    isFreePlan, phase, files, posisiOptions, posisi, setPosisi,
    addFiles, removeFile, cancelFiles, startUpload, uploadMore, retryGlobalFileById,
    total, doneCount, allDone, overallPct, normalFiles, failedFiles,
  } = useUnggahCv(initialSeleksiId);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPosisi, setShowPosisi] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) addFiles(Array.from(e.target.files));
    // Reset value agar bisa memilih file yang sama lagi jika dihapus
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) addFiles(Array.from(e.dataTransfer.files));
  };

  // ── History static view (selesai, not live) ───────────────────
  if (historyData) {
    const { normalFiles: hNormal, failedFiles: hFailed } = deriveHistoryFiles(historyData.files);
    return (
      <div className="kt-content">
        <div className="kt-upload-card">
          <p className="kt-upload-timestamp">Aktivitas pada {historyData.tanggal}</p>
          <div className="kt-overall-progress">
            <div className="kt-overall-label">
              <span>
                Selesai
                {historyData.total - historyData.berhasil > 0 && (
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                    ({historyData.berhasil} Berhasil, {historyData.total - historyData.berhasil} Gagal)
                  </span>
                )}
              </span>
              <span>({historyData.total}/{historyData.total})</span>
            </div>
            <div className="kt-progress-track">
              <div className="kt-progress-fill" style={{ width: `${(historyData.berhasil / historyData.total) * 100}%` }} />
            </div>
          </div>
          {hNormal.length > 0 && (
            <div className="kt-upload-list-box" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {hNormal.map((f, i) => (
                <div className={`kt-upload-row${i === hNormal.length - 1 ? ' last' : ''}`} key={i}>
                  <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{f.name}</span></div>
                  <div className="kt-upload-row-right" style={{ alignItems: 'center' }}>
                    <div className="kt-upload-slot">
                      {f.kandidatId && (
                        <div
                          className="kt-detail-badge"
                          style={{ cursor: 'pointer', opacity: 1 }}
                          onClick={() => navigate('kandidat-detail_001', { kandidat: f.kandidatId })}
                        >
                          Detail
                        </div>
                      )}
                    </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', marginLeft: '12px' }}>
                        <div className={`kt-status-label ${f.finalStatus}`}>
                          {f.finalStatus === 'berhasil' ? <IconBerhasil /> : <IconWaiting />}
                          <span>{f.statusText}</span>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hFailed.length > 0 && (
            <div className="kt-gagal-section">
              <div className="kt-gagal-header">
                <span className="kt-gagal-title">Terdapat Error</span>
              </div>
              <div className="kt-upload-list-box" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {hFailed.map((f, i) => (
                  <div className={`kt-upload-row${i === hFailed.length - 1 ? ' last' : ''}`} key={i}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{f.name}</span></div>
                    <div className="kt-upload-row-right" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <ErrorLabel msg={f.failReason} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="kt-upload-footer">
            <button className="kt-btn-lihat" onClick={() => navigate('kandidat_001')}>Lihat Kandidat</button>
            <button className="kt-btn-upload-more" onClick={() => onUploadMore ? onUploadMore() : navigate('kandidat-tambah')}>Upload CV Lainnya</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Locked state untuk paket Free (empty-state replacement, bukan dropzone
  // yang di-disable, biar tidak ada elemen yang "kelihatan bisa diklik" padahal
  // sebenarnya tidak bisa) ───────────────────────────────────────────────────
  if (isFreePlan) {
    return (
      <div className="kt-content">
        <div className="kt-upload-card">
          <div className="kt-locked-panel">
            <div className="kt-locked-icon"><IconLockLarge /></div>
            <h3 className="kt-locked-title">Unggah CV Massal butuh paket berlangganan</h3>
            <p className="kt-locked-desc">Paket Free hanya bisa menambah kandidat satu per satu secara manual. Upgrade untuk unggah puluhan CV sekaligus dan biarkan AI yang memberi skor otomatis.</p>
            <div className="kt-locked-features">
              <span><IconCheck /> Skoring AI otomatis</span>
            </div>
            <button className="kt-locked-cta" onClick={() => navigate('paket-langganan')}>
              <IconBolt /> Lihat Paket Berlangganan
            </button>
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
                  <span>Ukuran 10 Mb/file</span>
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
            </div>
            <div className="kt-actions" style={{ justifyContent: 'space-between', width: '100%', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => inputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--luna-orange-500)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--luna-orange-600)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--luna-orange-500)'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Tambah File Lainnya
                </button>

                <div style={{ 
                  fontSize: '13px', 
                  color: '#475569', 
                  fontWeight: 600, 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  padding: '4px 12px', 
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  {files.length} Data
                </div>
              </div>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <button className="kt-btn-cancel" onClick={cancelFiles}>Batal</button>
                <button className="kt-btn-upload" onClick={startUpload}>Unggah</button>
              </div>
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
                <span>
                  {allDone ? 'Selesai' : 'Uploading...'}
                  {allDone && failedFiles.length > 0 && (
                    <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                      ({normalFiles.length} Berhasil, {failedFiles.length} Gagal)
                    </span>
                  )}
                </span>
                <span>({doneCount}/{total})</span>
              </div>
              <div className="kt-progress-track">
                <div className="kt-progress-fill" style={{ width: `${overallPct}%` }} />
              </div>
            </div>

            {normalFiles.length > 0 && (
              <div className="kt-upload-list-box" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {normalFiles.map((fs, idx) => (
                  <div className={`kt-upload-row${idx === normalFiles.length - 1 ? ' last' : ''}`} key={fs.id || idx}>
                    <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                    <div className="kt-upload-row-right">
                      <div className="kt-upload-slot">
                        {fs.finalStatus === 'uploading' && <div className="kt-file-progress-track"><div className="kt-file-progress-fill" style={{ width: `${fs.progress}%` }} /></div>}
                        {fs.finalStatus === 'berhasil' && fs.data && <div className="kt-detail-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('kandidat-detail_001', { kandidat: fs.data })}>Detail</div>}
                      </div>
                      <div className={`kt-status-label ${fs.finalStatus}`}>
                        {fs.finalStatus === 'uploading' && <><IconUploading /><span>{fs.statusText}</span></>}
                        {fs.finalStatus === 'waiting' && <><IconWaiting /><span>Menunggu</span></>}
                        {fs.finalStatus === 'berhasil' && <><IconBerhasil /><span>{fs.statusText}</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {failedFiles.length > 0 && (
              <div className="kt-gagal-section">
                <div className="kt-gagal-header">
                  <span className="kt-gagal-title">Terdapat Error</span>
                </div>
                <div className="kt-upload-list-box" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {failedFiles.map((fs, idx) => (
                    <div className={`kt-upload-row${idx === failedFiles.length - 1 ? ' last' : ''}`} key={fs.id || idx}>
                      <div className="kt-file-left"><DocIcon /><span className="kt-file-name">{fs.name}</span></div>
                      <div className="kt-upload-row-right">
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                          {isRetryableError(fs.failReason) && (
                            <button
                              title="Coba Lagi"
                              onClick={() => retryGlobalFileById(fs.id)}
                              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', color: '#64748b', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b'; }}
                            >
                              <IconRetry />
                            </button>
                          )}
                          <ErrorLabel msg={fs.failReason} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="kt-upload-footer">
              <button className="kt-btn-lihat" onClick={() => navigate('kandidat_001')}>Lihat Kandidat</button>
              {allDone && (
                <button className="kt-btn-upload-more" onClick={uploadMore}>
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
