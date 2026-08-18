import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useUnggahCv, { getErrorLabel, isRetryableError } from '../../../hooks/kandidat/useUnggahCv.js';
import { deriveHistoryFiles } from '../../../hooks/kandidat/useRiwayatUnggah.js';

const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>);
const IconFile = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconDoc = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const IconClose = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconSpinner = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mkt001-spin"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);
const IconWaiting = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const IconRetry = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>);
const IconLock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="9" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>);
const IconBolt = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>);
const IconAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const IconInfo = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>);

// Padanan mobile dari Kandidat-UnggahCV.jsx — pakai hook `useUnggahCv` yang
// sama persis dengan desktop (lewat UploadContext global), jadi kalau user
// pindah halaman lalu balik lagi ke sini, `phase` langsung terisi ulang dari
// antrean yang masih berjalan di context (bukan reset ke dropzone kosong) —
// proses unggah/skoring AI tetap kelihatan lanjut, bukan "hilang" secara UI.
export default function MobileUnggahCv({ navigate, initialSeleksiId, historyData, onUploadMore }) {
  const {
    isFreePlan, phase, files, posisiOptions, posisi, setPosisi,
    addFiles, removeFile, cancelFiles, startUpload, uploadMore, retryGlobalFileById,
    total, doneCount, allDone, overallPct, normalFiles, failedFiles,
  } = useUnggahCv(initialSeleksiId);

  const [posisiSheetOpen, setPosisiSheetOpen] = useState(false);
  const [expandedError, setExpandedError] = useState(null); // id file yang detail error-nya lagi dibuka
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) addFiles(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Replay statis dari tab Riwayat (bukan proses live) ──
  if (historyData) {
    const { normalFiles: hNormal, failedFiles: hFailed } = deriveHistoryFiles(historyData.files);
    const pct = historyData.total > 0 ? (historyData.berhasil / historyData.total) * 100 : 0;
    return (
      <>
        <div className="mkt001-body">
          <div className="mkt001-up-top">
            <span className="mkt001-up-status">
              Selesai
              {historyData.total - historyData.berhasil > 0 && (
                <span className="muted">{historyData.berhasil} Berhasil, {historyData.total - historyData.berhasil} Gagal</span>
              )}
            </span>
            <span className="mkt001-up-count">{historyData.total}/{historyData.total}</span>
          </div>
          <div className="mkt001-progress-track"><div className="mkt001-progress-fill" style={{ width: `${pct}%` }} /></div>

          {hNormal.length > 0 && (
            <div>
              {hNormal.map((f, i) => (
                <div className="mkt001-up-row" key={f.id || i}>
                  <div className="mkt001-file-icon"><IconDoc /></div>
                  <span className="mkt001-file-name">{f.name}</span>
                  <div className="mkt001-up-row-right">
                    {f.kandidatId && <span className="mkt001-detail-badge" onClick={() => navigate('kandidat-detail_001', { kandidat: f.kandidatId })}>Detail</span>}
                    <span className={`mkt001-status-label ${f.finalStatus}`}>
                      {f.finalStatus === 'berhasil' ? <IconCheck /> : <IconWaiting />}
                      {f.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hFailed.length > 0 && (
            <div className="mkt001-gagal-section">
              <div className="mkt001-gagal-title"><IconAlert />Terdapat Error</div>
              {hFailed.map((f, i) => {
                const { label, detail } = getErrorLabel(f.failReason);
                const isOpen = expandedError === (f.id || i);
                return (
                  <div className="mkt001-gagal-item" key={f.id || i}>
                    <div className="mkt001-gagal-row">
                      <div className="mkt001-gagal-name">
                        <span className="mkt001-gagal-file">{f.name}</span>
                        <span className="mkt001-gagal-chip">{label}</span>
                      </div>
                      {detail && (
                        <button className="mkt001-info-btn" aria-label="Lihat detail error" onClick={() => setExpandedError(isOpen ? null : (f.id || i))}>
                          <IconInfo />
                        </button>
                      )}
                    </div>
                    {isOpen && detail && <p className="mkt001-gagal-detail">{detail}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mkt001-footer">
          <button className="mkt001-btn-secondary" onClick={() => navigate('kandidat_001')}>Lihat Kandidat</button>
          <button className="mkt001-btn-primary" onClick={() => onUploadMore ? onUploadMore() : navigate('kandidat-tambah')}>Unggah CV Lainnya</button>
        </div>
      </>
    );
  }

  if (isFreePlan) {
    return (
      <div className="mkt001-body">
        <div className="mkt001-locked">
          <div className="mkt001-locked-icon"><IconLock /></div>
          <h3>Unggah CV Massal butuh paket berlangganan</h3>
          <p>Paket Free hanya bisa menambah kandidat satu per satu secara manual. Upgrade untuk unggah puluhan CV sekaligus dan biarkan AI yang memberi skor otomatis.</p>
          <span className="mkt001-locked-feature"><IconCheck />Skoring AI otomatis</span>
          <button className="mkt001-locked-cta" onClick={() => navigate('paket-langganan')}><IconBolt />Lihat Paket Berlangganan</button>
        </div>
      </div>
    );
  }

  const inProgress = normalFiles.filter(f => f.finalStatus !== 'berhasil');
  const finished = normalFiles.filter(f => f.finalStatus === 'berhasil');

  return (
    <>
      <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handleFileChange} />

      <div className="mkt001-body">
        {phase === 'drop' && (
          <>
            <div className="mkt001-heading">
              <h2>Tambah Kandidat</h2>
              <p>Lengkapi <b>Data Job Description</b> sebelum mengunggah CV agar AI dapat langsung melakukan skoring otomatis.</p>
            </div>
            <div className="mkt001-dropzone" onClick={() => inputRef.current?.click()}>
              <div className="mkt001-dropzone-icon"><IconUpload /></div>
              <p className="mkt001-dropzone-label">Ketuk untuk <span>pilih file CV</span></p>
              <p className="mkt001-dropzone-sub">Bisa pilih beberapa file sekaligus</p>
              <button className="mkt001-dropzone-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}><IconFile />Pilih File</button>
            </div>
            <div className="mkt001-meta-row">
              <span>PDF, DOC, DOCX, TXT, MD, JSON</span><span className="mkt001-meta-dot" /><span>Maks. 10 Mb/file</span>
            </div>
          </>
        )}

        {phase === 'files' && (
          <>
            <span className="mkt001-field-label">Pilih Posisi</span>
            <button className="mkt001-select-input" onClick={() => setPosisiSheetOpen(true)}>
              <span className={posisi ? 'mkt001-select-value' : 'mkt001-select-placeholder'}>{posisi?.jabatan || 'Pilih posisi untuk kandidat'}</span>
              <IconChevronDown />
            </button>

            <div className="mkt001-file-list">
              {files.map((file, idx) => (
                <div className="mkt001-file-row" key={idx}>
                  <div className="mkt001-file-icon"><IconDoc /></div>
                  <span className="mkt001-file-name">{file.name}</span>
                  <button className="mkt001-file-remove" onClick={() => removeFile(idx)}><IconClose /></button>
                </div>
              ))}
            </div>

            <div className="mkt001-add-more-row">
              <button className="mkt001-add-more" onClick={() => inputRef.current?.click()}><IconPlus />Tambah File</button>
              <span className="mkt001-count-badge"><IconFile />{files.length} Data</span>
            </div>
          </>
        )}

        {phase === 'uploading' && (
          <>
            <div className="mkt001-up-top">
              <span className="mkt001-up-status">
                {allDone ? 'Selesai' : 'Mengunggah…'}
                {allDone && failedFiles.length > 0 ? (
                  <span className="muted">{normalFiles.length} Berhasil, {failedFiles.length} Gagal</span>
                ) : !allDone ? (
                  <span className="muted">{doneCount}/{total} file</span>
                ) : null}
              </span>
              <span className="mkt001-up-count">{Math.round(overallPct)}%</span>
            </div>
            <div className="mkt001-progress-track"><div className="mkt001-progress-fill" style={{ width: `${overallPct}%` }} /></div>

            {inProgress.length > 0 && (
              <>
                <div className="mkt001-up-section-label">Berlangsung</div>
                <div>
                  {inProgress.map(fs => (
                    <div className="mkt001-up-row" key={fs.id}>
                      <div className="mkt001-file-icon"><IconDoc /></div>
                      <span className="mkt001-file-name">{fs.name}</span>
                      <div className="mkt001-up-row-right">
                        {fs.finalStatus === 'uploading' && (
                          <div className="mkt001-file-progress-track"><div className="mkt001-file-progress-fill" style={{ width: `${fs.progress}%` }} /></div>
                        )}
                        <span className={`mkt001-status-label ${fs.finalStatus}`}>
                          {fs.finalStatus === 'uploading' ? <IconSpinner /> : <IconWaiting />}
                          {fs.finalStatus === 'uploading' ? fs.statusText : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {finished.length > 0 && (
              <>
                <div className="mkt001-up-section-label" style={{ marginTop: inProgress.length > 0 ? 16 : 4 }}>Selesai</div>
                <div>
                  {finished.map(fs => (
                    <div className="mkt001-up-row" key={fs.id}>
                      <div className="mkt001-file-icon"><IconDoc /></div>
                      <span className="mkt001-file-name">{fs.name}</span>
                      <div className="mkt001-up-row-right">
                        {fs.data && <span className="mkt001-detail-badge" onClick={() => navigate('kandidat-detail_001', { kandidat: fs.data })}>Detail</span>}
                        <span className="mkt001-status-label berhasil"><IconCheck />{fs.statusText}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {failedFiles.length > 0 && (
              <div className="mkt001-gagal-section">
                <div className="mkt001-gagal-title"><IconAlert />Terdapat Error</div>
                {failedFiles.map(fs => {
                  const { label, detail } = getErrorLabel(fs.failReason);
                  const isOpen = expandedError === fs.id;
                  return (
                    <div className="mkt001-gagal-item" key={fs.id}>
                      <div className="mkt001-gagal-row">
                        <div className="mkt001-gagal-name">
                          <span className="mkt001-gagal-file">{fs.name}</span>
                          <span className="mkt001-gagal-chip">{label}</span>
                        </div>
                        {detail && (
                          <button
                            className="mkt001-info-btn"
                            aria-label="Lihat detail error"
                            onClick={() => setExpandedError(isOpen ? null : fs.id)}
                          >
                            <IconInfo />
                          </button>
                        )}
                        {isRetryableError(fs.failReason) && (
                          <button className="mkt001-retry-btn" onClick={() => retryGlobalFileById(fs.id)}><IconRetry /></button>
                        )}
                      </div>
                      {isOpen && detail && <p className="mkt001-gagal-detail">{detail}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {phase === 'files' && (
        <div className="mkt001-footer">
          <button className="mkt001-btn-cancel" onClick={cancelFiles}>Batal</button>
          <button className="mkt001-btn-primary" onClick={startUpload}>Unggah {files.length} File</button>
        </div>
      )}
      {phase === 'uploading' && (
        <div className="mkt001-footer">
          <button className="mkt001-btn-secondary" onClick={() => navigate('kandidat_001')}>Lihat Kandidat</button>
          {allDone && <button className="mkt001-btn-primary" onClick={uploadMore}>Unggah Lagi</button>}
        </div>
      )}

      {createPortal(
        <>
          <div className={`msh-sheet-overlay${posisiSheetOpen ? ' open' : ''}`} onClick={() => setPosisiSheetOpen(false)} />
          <div className={`msh-sheet${posisiSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mkt001-sheet-title">Pilih Posisi</div>
            <div className="mkt001-sheet-list">
              {posisiOptions.map(opt => (
                <button key={opt.id} className="mkt001-sheet-opt" onClick={() => { setPosisi({ id: opt.id, jabatan: opt.jabatan }); setPosisiSheetOpen(false); }}>
                  <span className="mkt001-sheet-opt-label">{opt.jabatan}</span>
                  {posisi?.id === opt.id && <span className="mkt001-sheet-opt-check"><IconCheck /></span>}
                </button>
              ))}
              <button className="mkt001-sheet-opt" onClick={() => { setPosisi(null); setPosisiSheetOpen(false); }}>
                <span className="mkt001-sheet-opt-label muted">Tanpa posisi (unggah saja)</span>
                {!posisi && <span className="mkt001-sheet-opt-check"><IconCheck /></span>}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
