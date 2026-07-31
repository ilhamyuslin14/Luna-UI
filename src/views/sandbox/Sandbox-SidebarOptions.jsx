import React, { useState } from 'react';

export default function SandboxSidebarOptions() {
  const [selectedOption, setSelectedOption] = useState('option1');
  const [activeMenu, setActiveMenu] = useState('lowongan');
  const [expandedSubmenu, setExpandedSubmenu] = useState(true);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 flex flex-col gap-6 font-sans">
      {/* Header Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎨</span> Alternatives Showcase: Sidebar Revamp Luna Job Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih konsep di bawah untuk mencoba interaksi hover, animasi aktif, dan layout secara live.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedOption('option1')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${selectedOption === 'option1' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Opsi 1: Clean Pill & Floating
          </button>
          <button
            onClick={() => setSelectedOption('option2')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${selectedOption === 'option2' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Opsi 2: Dark Neon Ambient
          </button>
          <button
            onClick={() => setSelectedOption('option3')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${selectedOption === 'option3' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Opsi 3: Sub-menu Accordion
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="flex gap-8 items-start justify-center flex-1 py-4">
        
        {/* OPSI 1: Light Floating Pill */}
        {selectedOption === 'option1' && (
          <div className="w-[280px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 text-slate-800 flex flex-col justify-between h-[680px] transition-all">
            <div className="flex flex-col gap-6">
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-orange-50/60 border border-orange-100/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center font-bold text-white shadow-md">
                  AR
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Alya Rahman</h4>
                  <p className="text-[11px] text-orange-600 font-bold truncate">PT Nusantara Tech</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">Menu Utama</span>
                {[
                  { id: 'beranda', label: 'Beranda', badge: null, icon: '🏠' },
                  { id: 'lowongan', label: 'Lowongan', badge: '12', icon: '💼' },
                  { id: 'kandidat', label: 'Kandidat', badge: '148', icon: '👥' },
                ].map(item => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">Pengaturan</span>
                <button
                  onClick={() => setActiveMenu('pengaturan')}
                  className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    activeMenu === 'pengaturan'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">⚙️</span>
                    <span>Kelola Pengguna</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Stats Summary Card (Free Apps) */}
            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100/60 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ringkasan Data</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col">
                  <span className="text-sm font-bold text-orange-500">12</span>
                  <span className="text-[10px] text-slate-500 font-medium">Lowongan</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col">
                  <span className="text-sm font-bold text-orange-500">148</span>
                  <span className="text-[10px] text-slate-500 font-medium">Kandidat</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPSI 2: Dark Neon Ambient */}
        {selectedOption === 'option2' && (
          <div className="w-[280px] bg-[#0E0D0B] rounded-3xl p-5 border border-white/10 text-slate-200 flex flex-col justify-between h-[680px] shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col gap-6 relative z-10">
              {/* Brand Logo */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-orange-500/20">
                  🌙
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-wider">LUNA</h3>
                  <p className="text-[10px] text-orange-400 uppercase tracking-widest font-semibold">Job Portal</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3">Menu Utama</span>
                {[
                  { id: 'beranda', label: 'Beranda', icon: '⚡' },
                  { id: 'lowongan', label: 'Lowongan', icon: '💼' },
                  { id: 'kandidat', label: 'Kandidat', icon: '👤' },
                ].map(item => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'text-orange-400 bg-white/5 border border-orange-500/40 shadow-[0_0_20px_rgba(255,141,33,0.15)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-orange-500 shadow-[0_0_12px_#FF8D21]"></span>}
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3">Sistem</span>
                <button
                  onClick={() => setActiveMenu('pengaturan')}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    activeMenu === 'pengaturan'
                      ? 'text-orange-400 bg-white/5 border border-orange-500/40 shadow-[0_0_20px_rgba(255,141,33,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-base">🛡️</span>
                  <span>Kelola Pengguna</span>
                </button>
              </div>
            </div>

            {/* Neon Footer User Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-orange-400">
                  AR
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Alya Rahman</p>
                  <p className="text-[10px] text-slate-400 truncate">HR Manager</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-rose-400 transition-colors p-1">
                🚪
              </button>
            </div>
          </div>
        )}

        {/* OPSI 3: Sub-menu Accordion */}
        {selectedOption === 'option3' && (
          <div className="w-[290px] bg-[#FFFBF7] rounded-3xl p-5 border border-orange-100 text-slate-800 flex flex-col justify-between h-[680px] shadow-2xl">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    L
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">LUNA PORTAL</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Workspace Pro</p>
                  </div>
                </div>
              </div>

              {/* Grouped Accordion Menu */}
              <div className="flex flex-col gap-3">
                {/* Navigation 1: Beranda */}
                <button
                  onClick={() => setActiveMenu('beranda')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeMenu === 'beranda' ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>📊</span>
                    <span>Beranda</span>
                  </div>
                </button>

                {/* Navigation 2: Lowongan (Accordion Expandable) */}
                <div className="flex flex-col rounded-2xl bg-white border border-orange-100 p-2 shadow-xs">
                  <button
                    onClick={() => setExpandedSubmenu(!expandedSubmenu)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-orange-50 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>💼</span>
                      <span>Lowongan</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{expandedSubmenu ? '▲' : '▼'}</span>
                  </button>

                  {expandedSubmenu && (
                    <div className="flex flex-col gap-1 mt-1 pl-7 border-l-2 border-orange-200 ml-4 py-1">
                      <button
                        onClick={() => setActiveMenu('lowongan')}
                        className={`text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeMenu === 'lowongan' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-orange-600'
                        }`}
                      >
                        Semua Lowongan (12)
                      </button>
                      <button
                        onClick={() => setActiveMenu('buat-lowongan')}
                        className={`text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeMenu === 'buat-lowongan' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-orange-600'
                        }`}
                      >
                        + Buat Lowongan
                      </button>
                      <button
                        onClick={() => setActiveMenu('draft-lowongan')}
                        className="text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-orange-600"
                      >
                        Draft (3)
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation 3: Kandidat */}
                <button
                  onClick={() => setActiveMenu('kandidat')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeMenu === 'kandidat' ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>👥</span>
                    <span>Kandidat</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full font-extrabold">148</span>
                </button>
              </div>
            </div>

            {/* Support Footer */}
            <div className="pt-4 border-t border-orange-100 flex flex-col gap-2">
              <button className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                <span>💬</span>
                <span>Pusat Bantuan</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
