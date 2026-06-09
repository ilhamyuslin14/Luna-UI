import { useState } from 'react';
import SandboxKonfigurasi from './Sandbox-Konfigurasi.jsx';
import SandboxKriteria from './Sandbox-Kriteria.jsx';
import SandboxCVParsing from './Sandbox-CVParsing.jsx';
import SandboxAIScoring from './Sandbox-AIScoring.jsx';
import SandboxRiwayat from './Sandbox-Riwayat.jsx';

export default function Sandbox({ navigate }) {
  const [activeTab, setActiveTab] = useState('konfigurasi');

  return (
    <div className="sb-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <nav className="sb-navbar">
        <div className="sb-nav-left">
          <div className="sb-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="sb-nav-title">
            <h1>Luna AI Sandbox</h1>
            <p>Developer Configuration Environment</p>
          </div>
        </div>
        <button className="sb-btn-exit" onClick={() => window.location.href = '/'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Keluar Sandbox
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="sb-body">
        {/* Sandbox Sidebar */}
        <aside className="sb-sidebar">
          <div className="sb-menu">
            <button 
              className={`sb-menu-item ${activeTab === 'konfigurasi' ? 'active' : ''}`}
              onClick={() => setActiveTab('konfigurasi')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Konfigurasi API</span>
            </button>
            <button 
              className={`sb-menu-item ${activeTab === 'ai_scoring' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai_scoring')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4 4-4-4M12 8v8"/></svg>
              <span>AI Scoring</span>
            </button>
            <button 
              className={`sb-menu-item ${activeTab === 'cv_parsing' ? 'active' : ''}`}
              onClick={() => setActiveTab('cv_parsing')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>CV Parsing</span>
            </button>
            <button 
              className={`sb-menu-item ${activeTab === 'kriteria' ? 'active' : ''}`}
              onClick={() => setActiveTab('kriteria')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Kriteria Penilaian</span>
            </button>
            <button 
              className={`sb-menu-item ${activeTab === 'riwayat' ? 'active' : ''}`}
              onClick={() => setActiveTab('riwayat')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Riwayat AI</span>
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div className="sb-main" style={{ display: activeTab === 'konfigurasi' ? 'block' : 'none', flex: 1, overflowY: 'auto' }}>
            <SandboxKonfigurasi />
          </div>

          <div style={{ display: activeTab === 'ai_scoring' ? 'flex' : 'none', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SandboxAIScoring navigate={navigate} />
          </div>

          <div style={{ display: activeTab === 'cv_parsing' ? 'flex' : 'none', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SandboxCVParsing navigate={navigate} />
          </div>

          <div style={{ display: activeTab === 'kriteria' ? 'flex' : 'none', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SandboxKriteria navigate={navigate} />
          </div>

          <div className="sb-main" style={{ display: activeTab === 'riwayat' ? 'block' : 'none', flex: 1, overflowY: 'auto' }}>
            <SandboxRiwayat />
          </div>

        </main>
      </div>
    </div>
  );
}
