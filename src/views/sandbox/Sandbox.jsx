import { useState } from 'react';
import SandboxKonfigurasi from './Sandbox-Konfigurasi.jsx';
import SandboxKriteria from './Sandbox-Kriteria.jsx';
import SandboxCVParsing from './Sandbox-CVParsing.jsx';
import SandboxAIScoring from './Sandbox-AIScoring.jsx';
import SandboxRiwayat from './Sandbox-Riwayat.jsx';
import SandboxLabs from './Sandbox-Labs.jsx';

export default function Sandbox({ navigate }) {
  const [activeTab, setActiveTab] = useState('konfigurasi');

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 relative font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Luna AI Sandbox</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Dev Environment
            </span>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <button
            className="flex items-center gap-2 shrink-0 pl-3.5 pr-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition-colors duration-150"
            onClick={() => window.location.href = '/'}
          >
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Keluar Sandbox</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 relative z-10">
        {/* Sidebar */}
        <aside className="w-[268px] shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">AI Engine</span>
              {[
                { id: 'konfigurasi', label: 'Konfigurasi API', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
                { id: 'ai_scoring', label: 'AI Scoring', icon: <><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4 4-4-4M12 8v8"/></> },
                { id: 'cv_parsing', label: 'CV Parsing', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></> },
                { id: 'kriteria', label: 'Kriteria Penilaian', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon> },
              ].map(item => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-orange-500"></span>}
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${active ? 'bg-white/10 text-orange-400' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                    </span>
                    <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Riwayat</span>
              <button
                onClick={() => setActiveTab('riwayat')}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${activeTab === 'riwayat' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {activeTab === 'riwayat' && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-orange-500"></span>}
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${activeTab === 'riwayat' ? 'bg-white/10 text-orange-400' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
                <span className={activeTab === 'riwayat' ? 'font-semibold' : ''}>Riwayat AI</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Analisis</span>
              <button
                onClick={() => setActiveTab('labs')}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${activeTab === 'labs' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {activeTab === 'labs' && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-orange-500"></span>}
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${activeTab === 'labs' ? 'bg-white/10 text-orange-400' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v6L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2l-6-12V2"></path><path d="M8 2h8"></path></svg>
                </span>
                <span className={activeTab === 'labs' ? 'font-semibold' : ''}>Labs</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 leading-tight">Sandbox Mode</p>
                <p className="text-[11px] text-slate-400 leading-tight">Terisolasi dari data utama</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden relative">
          
          {/* Decorative Top Accent for active tab */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-400"></div>

          <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ display: activeTab === 'konfigurasi' ? 'block' : 'none' }}>
            <div className="p-8">
              <SandboxKonfigurasi />
            </div>
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'ai_scoring' ? 'flex' : 'none' }}>
            <SandboxAIScoring navigate={navigate} />
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'cv_parsing' ? 'flex' : 'none' }}>
            <SandboxCVParsing navigate={navigate} />
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'kriteria' ? 'flex' : 'none' }}>
            <SandboxKriteria navigate={navigate} />
          </div>

          <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ display: activeTab === 'riwayat' ? 'block' : 'none' }}>
            <div className="p-8">
              <SandboxRiwayat />
            </div>
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'labs' ? 'flex' : 'none' }}>
            <SandboxLabs />
          </div>

        </main>
      </div>
    </div>
  );
}
