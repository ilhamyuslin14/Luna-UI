import { useState, useEffect, useRef } from 'react';
import '../../../css/sandbox/sandbox-scroll.css';
import { supabase } from '../../config/supabase.js';
import SandboxKonfigurasi, { KONFIGURASI_SECTIONS } from './Sandbox-Konfigurasi.jsx';
import SandboxKriteria from './Sandbox-Kriteria.jsx';
import SandboxCVParsing from './Sandbox-CVParsing.jsx';
import SandboxAIScoring from './Sandbox-AIScoring.jsx';
import SandboxBuatLowongan from './Sandbox-BuatLowongan.jsx';
import SandboxRiwayat from './Sandbox-Riwayat.jsx';
import SandboxLowonganEksternal from './Sandbox-LowonganEksternal.jsx';
import SandboxLabs from './Sandbox-Labs.jsx';

// Sandbox khusus super admin Luna (tabel luna_admins). Pengamannya policy RLS
// di database; pengecekan ini hanya supaya yang bukan admin tidak melihat
// halaman kosong/error.
export default function Sandbox(props) {
  const [access, setAccess] = useState('checking'); // checking | allowed | denied

  useEffect(() => {
    let active = true;
    supabase.rpc('is_luna_admin').then(({ data, error }) => {
      if (active) setAccess(!error && data === true ? 'allowed' : 'denied');
    });
    return () => { active = false; };
  }, []);

  if (access === 'checking') {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">Memeriksa akses…</div>;
  }
  if (access === 'denied') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <h1 className="text-lg font-bold text-slate-900">Akses ditolak</h1>
        <p className="text-sm text-slate-500 max-w-sm">Sandbox hanya bisa dibuka oleh super admin Luna. Masuk dengan akun admin untuk melanjutkan.</p>
        <button
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          onClick={() => { window.location.href = '/'; }}
        >
          Kembali ke beranda
        </button>
      </div>
    );
  }
  return <SandboxContent {...props} />;
}

function SandboxContent({ navigate }) {
  const [activeTab, setActiveTab] = useState('konfigurasi');
  const [activeSection, setActiveSection] = useState(KONFIGURASI_SECTIONS[0].id);

  // Scroll tidak menggelembung, jadi ditangkap di fase capture lalu elemen yang
  // sedang digulir diberi kelas .is-scrolling selama sesaat (lihat sandbox-scroll.css).
  const scrollTimers = useRef(new WeakMap());
  // Submenu Konfigurasi mengikuti bagian yang sedang terlihat. Setelah klik submenu,
  // pembaruan otomatis ditahan sebentar supaya tidak melompat-lompat selama animasi gulir.
  const sectionLockUntil = useRef(0);
  const syncActiveSection = (container) => {
    if (Date.now() < sectionLockUntil.current) return;
    const top = container.getBoundingClientRect().top;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 4;
    let current = KONFIGURASI_SECTIONS[0].id;
    if (atBottom) {
      current = KONFIGURASI_SECTIONS[KONFIGURASI_SECTIONS.length - 1].id;
    } else {
      for (const sec of KONFIGURASI_SECTIONS) {
        const node = document.getElementById(`kfg-${sec.id}`);
        if (node && node.getBoundingClientRect().top - top <= 120) current = sec.id;
      }
    }
    setActiveSection(current);
  };

  const handleScrollCapture = (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.hasAttribute('data-kfg-scroll')) syncActiveSection(el);
    el.classList.add('is-scrolling');
    clearTimeout(scrollTimers.current.get(el));
    scrollTimers.current.set(el, setTimeout(() => el.classList.remove('is-scrolling'), 800));
  };

  return (
    <div onScrollCapture={handleScrollCapture} className="sbx-root h-screen w-screen overflow-hidden flex flex-col bg-slate-50 relative font-sans">
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
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Pengaturan</span>
              {[
                { id: 'konfigurasi', label: 'Konfigurasi AI', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
                { id: 'kriteria', label: 'Kriteria Penilaian', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon> },
                { id: 'cv_parsing', label: 'CV Parsing', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></> },
                { id: 'ai_scoring', label: 'AI Scoring', icon: <><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4 4-4-4M12 8v8"/></> },
                { id: 'buat_lowongan', label: 'Buat Lowongan', icon: <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path> },
              ].map(item => {
                const active = activeTab === item.id;
                return (
                  <div key={item.id} className="flex flex-col gap-1">
                    {/* Pemisah: dari sini ke bawah adalah fungsi yang benar-benar diuji, bukan pengaturan */}
                    {item.id === 'kriteria' && (
                      <div className="mt-3 pt-4 border-t border-slate-200">
                        <span className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Uji Coba Fungsi</span>
                      </div>
                    )}
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-orange-500"></span>}
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${active ? 'bg-white/10 text-orange-400' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                      </span>
                      <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                    </button>

                    {/* Submenu: lompat ke bagian di halaman Konfigurasi */}
                    {item.id === 'konfigurasi' && active && (
                      <div className="ml-7 pl-3 border-l border-slate-200 flex flex-col gap-0.5 mb-1">
                        {KONFIGURASI_SECTIONS.map(sec => {
                          const secActive = activeSection === sec.id;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => {
                                setActiveSection(sec.id);
                                sectionLockUntil.current = Date.now() + 800;
                                document.getElementById(`kfg-${sec.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              className={`text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${secActive ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                            >
                              {sec.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Agregator</span>
              <button
                onClick={() => setActiveTab('lowongan_eksternal')}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${activeTab === 'lowongan_eksternal' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {activeTab === 'lowongan_eksternal' && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-orange-500"></span>}
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${activeTab === 'lowongan_eksternal' ? 'bg-white/10 text-orange-400' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </span>
                <span className={activeTab === 'lowongan_eksternal' ? 'font-semibold' : ''}>Lowongan Eksternal</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Pintasan</span>
              {[
                { href: '/docs', label: 'Dokumentasi', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></> },
                { href: '/analytic', label: 'Luna Analytic', icon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></> },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-150"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-slate-100 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{link.icon}</svg>
                  </span>
                  <span className="flex-1">{link.label}</span>
                  <svg className="text-slate-300 group-hover:text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              ))}
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

          <div data-kfg-scroll className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ display: activeTab === 'konfigurasi' ? 'block' : 'none' }}>
            <div className="p-8">
              <SandboxKonfigurasi />
            </div>
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'ai_scoring' ? 'flex' : 'none' }}>
            <SandboxAIScoring navigate={navigate} />
          </div>

          <div className="w-full h-full flex flex-col" style={{ display: activeTab === 'buat_lowongan' ? 'flex' : 'none' }}>
            <SandboxBuatLowongan navigate={navigate} />
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

          <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ display: activeTab === 'lowongan_eksternal' ? 'block' : 'none' }}>
            <div className="p-8">
              <SandboxLowonganEksternal />
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
