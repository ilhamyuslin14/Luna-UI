import { useState } from 'react';
import { cvFileName, downloadFile } from '../../../utils/cvFile.js';
import '../../../../css/mobile/kandidat/kandidat-resume.css';

const IconFile = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const IconDownload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const IconDocEmpty = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>);

// Padanan mobile dari Kandidat-Resume_001.jsx (desktop) — disederhanakan:
// sidebar anotasi/outline/attachment desktop dibuang (bukan alur kerja utama
// di layar sentuh), tapi logic unduh (fetch blob → save-as, fallback
// window.open kalau kena CORS) dipertahankan identik dengan desktop.
export default function KandidatResumeTab({ cvUrl, nama }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!cvUrl) {
    return (
      <div className="res-empty">
        <div className="res-empty-ic"><IconDocEmpty /></div>
        <p>Dokumen CV tidak tersedia.</p>
      </div>
    );
  }

  // Selalu lewat Google Docs Viewer (bukan cuma untuk non-PDF seperti di
  // desktop) — browser mobile umumnya tidak punya plugin PDF inline di
  // dalam <iframe>, jadi src=cvUrl langsung cuma nampilin link "Open" bawaan
  // browser alih-alih benar-benar merender dokumennya.
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`;
  const fileLabel = cvFileName(cvUrl, nama);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    await downloadFile(cvUrl, fileLabel);
    setIsDownloading(false);
  };

  return (
    <div className="res-view">
      <div className="res-toolbar">
        <div className="res-file-ic"><IconFile /></div>
        <div className="res-file-meta">
          <div className="res-file-name">{fileLabel}</div>
          <div className="res-file-sub">Dokumen CV</div>
        </div>
        <div className="res-actions">
          <button className="res-act-btn primary" title="Unduh" disabled={isDownloading} onClick={handleDownload}>
            <IconDownload />
          </button>
        </div>
      </div>
      <div className="res-canvas">
        <iframe src={viewerUrl} title="CV Viewer" className="res-iframe" />
      </div>
    </div>
  );
}
