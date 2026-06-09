import { useState } from 'react';

const IconSidebar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);

const IconZoomOut = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const IconZoomIn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const IconChevronUp = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconMaximize = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const IconBookmark = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconAttachment = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const IconLayers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);

const IconExpand = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function KandidatResume({ kandidat = {} }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!kandidat.cv_url) {
    return (
      <div className="kr-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        <p>Dokumen CV tidak tersedia.</p>
      </div>
    );
  }

  const cvUrl = kandidat.cv_url;
  const isPdf = cvUrl.toLowerCase().endsWith('.pdf');
  const viewerUrl = isPdf 
    ? cvUrl 
    : `https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`;

  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const ext = cvUrl.split('.').pop().split('?')[0] || 'pdf';
      const safeName = (kandidat.nama || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CV_${safeName}.${ext}`;

      const response = await fetch(cvUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, using fallback', err);
      // Fallback jika kena CORS Supabase
      window.open(cvUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="kr-view">

      {/* ── Toolbar ── */}
      <div className="kr-toolbar">
        <div className="kr-toolbar-left">
          <button className="kr-tb-btn" title="Toggle panel"><IconSidebar /></button>
          <div className="kr-tb-sep" />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#323b4d' }}>Document Viewer</span>
        </div>
        <div className="kr-toolbar-right">
          <button className="kr-tb-btn" title="Layar penuh"><IconMaximize /></button>
        </div>
      </div>

      {/* ── Viewer + Right Sidebar ── */}
      <div className="kr-viewer-area">

        {/* Document viewport */}
        <div className="kr-doc-viewport" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe 
            src={viewerUrl} 
            title="CV Viewer" 
            style={{ width: '100%', height: '100%', border: 'none', background: '#f0f2f5' }}
          />
        </div>

        {/* Right sidebar icons */}
        <div className="kr-viewer-sidebar">
          <div className="kr-sidebar-btn-wrap">
            <button className="kr-sidebar-btn active" title="Anotasi">
              <span className="kr-sidebar-badge">0</span>
              <IconBookmark />
            </button>
          </div>
          <button className="kr-sidebar-btn" title="Lampiran"><IconAttachment /></button>
          <button className="kr-sidebar-btn" title="Outline"><IconLayers /></button>
          <div className="kr-sidebar-sep" />
          <button className="kr-sidebar-btn" title="Layar penuh"><IconExpand /></button>
          <button className="kr-sidebar-btn" title="Unduh" onClick={handleDownload}><IconDownload /></button>
          <button className="kr-sidebar-btn" title="Pengaturan"><IconSettings /></button>
        </div>

      </div>
    </div>
  );
}
