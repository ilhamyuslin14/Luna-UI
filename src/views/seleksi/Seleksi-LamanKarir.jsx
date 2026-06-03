import { useState, useEffect } from 'react';

const BENEFITS = [
  { icon: '🏥', label: 'Asuransi Kesehatan' },
  { icon: '📈', label: 'Pengembangan Karir' },
  { icon: '💻', label: 'Laptop Disediakan' },
  { icon: '🕐', label: 'Jam Kerja Fleksibel' },
  { icon: '🎯', label: 'Bonus Performa' },
  { icon: '🏡', label: 'Opsi Hybrid/WFH' },
];

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];

function isValidUrl(str) {
  if (!str) return true;
  try {
    new URL(str.startsWith('http') ? str : 'https://' + str);
    return str.includes('.');
  } catch {
    return false;
  }
}

export default function LamanKarir({ jabatan = 'Project Manager' }) {
  const [form, setForm] = useState({ nama: '', email: '', phone: '', linkedin: '' });
  const [cvFile, setCvFile] = useState(null);
  const [submitState, setSubmitState] = useState('idle'); // idle | uploading | success | error
  const [dragOver, setDragOver] = useState(false);
  const [linkedinError, setLinkedinError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('deskripsi');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);

      const sections = ['deskripsi', 'detail', 'form'];
      let current = 'deskripsi';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Gunakan threshold yang lebih lebar agar state berpindah dengan lebih tepat
          if (rect.top <= 250) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'linkedin') setLinkedinError(value ? !isValidUrl(value) : false);
  };

  const handlePhoneChange = (e) => {
    const filtered = e.target.value.replace(/[^0-9+\-\s]/g, '');
    if (filtered.replace(/[^0-9]/g, '').length <= 14) {
      setForm(f => ({ ...f, phone: filtered }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setCvFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) setCvFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (linkedinError) return;
    setSubmitState('uploading');
    setTimeout(() => {
      setSubmitState(IMAGE_TYPES.includes(cvFile?.type) ? 'error' : 'success');
    }, 2200);
  };

  const handleRetry = () => {
    setCvFile(null);
    setSubmitState('idle');
  };

  const phoneDigits = form.phone.replace(/[^0-9]/g, '').length;
  const isValid = form.nama && form.email && phoneDigits >= 10 && cvFile && !linkedinError;

  return (
    <div className="lk-page">

      {/* Top Bar */}
      <header className="lk-topbar">
        <div className="lk-topbar-brand">
          <img src="/assets/logos/logo-wordmark.png" alt="LUNA" className="lk-topbar-logo" />
        </div>
        <div className="lk-topbar-right">
          <span className="lk-topbar-company-label">Diposting oleh</span>
          <span className="lk-topbar-company">PT Arkademi</span>
        </div>
      </header>

      {/* Compact Sticky Nav */}
      <div className={`lk-compact-nav ${isScrolled ? 'lk-compact-nav--visible' : ''}`}>
        <div className="lk-compact-nav-inner">
          <h2 className="lk-compact-title">{jabatan}</h2>
          <div className="lk-compact-menu">
            <button className={`lk-compact-link ${activeSection === 'deskripsi' ? 'lk-compact-link--active' : ''}`} onClick={() => scrollTo('deskripsi')}>
              Deskripsi<span className="lk-desktop-only"> Pekerjaan</span>
            </button>
            <button className={`lk-compact-link ${activeSection === 'detail' ? 'lk-compact-link--active' : ''}`} onClick={() => scrollTo('detail')}>
              Detail<span className="lk-desktop-only"> Pekerjaan</span>
            </button>
            <button className={`lk-compact-link ${activeSection === 'form' ? 'lk-compact-link--active' : ''}`} onClick={() => scrollTo('form')}>
              Lamar<span className="lk-desktop-only"> Posisi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="lk-hero">
        <div className="lk-hero-bg"></div>
        <div className="lk-hero-inner">
          <div className="lk-hero-content">
            <div className="lk-hero-top-row">
              <div className="lk-hero-badge">Lowongan Aktif</div>
            </div>
            <h1 className="lk-hero-title">{jabatan}</h1>
            <div className="lk-hero-meta">
              <span className="lk-meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Tebet, Jakarta Selatan
              </span>
              <span className="lk-meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Waktu Tidak Tertentu
              </span>
              <span className="lk-meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Rp 6.000.000 – Rp 8.000.000 / Bulan
              </span>
              <span className="lk-meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Min. 3 Tahun Pengalaman
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lk-main">

        {/* Description */}
          <div className="lk-card" id="deskripsi">
            <h2 className="lk-card-title">Deskripsi Pekerjaan</h2>
            <div className="lk-desc-content">
              <h3 className="lk-desc-section">Role Overview</h3>
              <p className="lk-desc-p">We are looking for a proactive and results-driven {jabatan} to join our team. You will be responsible for the full lifecycle of the role, from planning and execution to delivering measurable outcomes.</p>

              <h4 className="lk-desc-sub">Key Responsibilities</h4>
              <ul className="lk-desc-list">
                <li><strong>End-to-End Management:</strong> Manage the entire process, including planning, execution, and reporting.</li>
                <li><strong>Strategic Thinking:</strong> Proactively identify opportunities and propose solutions.</li>
                <li><strong>Stakeholder Management:</strong> Partner with team leads to understand specific needs and provide market insights.</li>
                <li><strong>Data-Driven Approach:</strong> Maintain tracking systems and provide regular reports on key metrics.</li>
                <li><strong>Team Collaboration:</strong> Work closely with cross-functional teams to achieve shared objectives.</li>
              </ul>

              <h4 className="lk-desc-sub">Requirements &amp; Qualifications</h4>
              <ul className="lk-desc-list">
                <li><strong>Experience:</strong> Minimum 3 years of relevant experience.</li>
                <li><strong>Education:</strong> D4/S1 degree in a related field.</li>
                <li><strong>Communication:</strong> Exceptional verbal and written communication skills.</li>
                <li><strong>Tech-Savvy:</strong> Proficiency with relevant tools and platforms.</li>
                <li><strong>Mindset:</strong> A strong ownership mentality with the ability to work independently.</li>
              </ul>
            </div>
          </div>

          {/* Detail */}
          <div className="lk-card" id="detail">
            <h2 className="lk-card-title">Detail Pekerjaan</h2>
            <div className="lk-detail-grid">
              {[
                ['Departemen',          'Product'],
                ['Lokasi',              'Tebet, Jakarta Selatan'],
                ['Ikatan Kerja',        'Waktu Tidak Tertentu'],
                ['Upah',                'Rp 6.000.000 – Rp 8.000.000 / Bulan'],
                ['Min. Pendidikan',     'D4/S1 (Sarjana)'],
                ['Min. Pengalaman',     '3 Tahun'],
                ['Jumlah Posisi',       '2 Orang'],
                ['Tanggal Buka',        'Jumat, 20 Februari 2026'],
                ['Target On-Boarding',  'Jumat, 6 Maret 2026'],
              ].map(([label, value]) => (
                <div className="lk-detail-row" key={label}>
                  <span className="lk-detail-label">{label}</span>
                  <span className="lk-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

        {/* Application Form */}
        <div className="lk-form-card" id="form">

            {submitState === 'uploading' && (
              <div className="lk-uploading">
                <div className="lk-spinner" />
                <p className="lk-uploading-title">Mengirim Lamaran…</p>
                <p className="lk-uploading-sub">Mohon tunggu, kami sedang memproses lamaran Anda.</p>
                <div className="lk-progress-bar">
                  <div className="lk-progress-fill" />
                </div>
              </div>
            )}

            {submitState === 'success' && (
              <div className="lk-result lk-result--success">
                <div className="lk-result-icon lk-result-icon--success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="lk-result-title">Lamaran Terkirim!</h3>
                <p className="lk-result-desc">Terima kasih, <strong>{form.nama}</strong>! Lamaran Anda telah kami terima dan sedang dalam proses peninjauan. Kami akan menghubungi Anda apabila ada informasi lebih lanjut.</p>
               
              </div>
            )}

            {submitState === 'error' && (
              <div className="lk-result lk-result--error">
                <div className="lk-result-icon lk-result-icon--error">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <h3 className="lk-result-title">Format File Tidak Didukung</h3>
                <p className="lk-result-desc">File yang Anda unggah berupa gambar dan tidak dapat dibaca sistem kami. Silakan gunakan file <strong>PDF atau DOC/DOCX</strong> yang berisi teks CV Anda.</p>
                <button className="lk-retry-btn" onClick={handleRetry}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>
                  Coba Lagi
                </button>
              </div>
            )}

            {submitState === 'idle' && (
              <>
                <div className="lk-form-header">
                  <div>
                    <h2 className="lk-form-title">Lamar Posisi Ini</h2>
                    <p className="lk-form-sub">Isi data diri dan unggah CV Anda</p>
                  </div>
                </div>

                <form className="lk-form" onSubmit={handleSubmit}>
                  <div className="lk-field">
                    <label className="lk-label">Nama Lengkap <span className="lk-required">*</span></label>
                    <input
                      className="lk-input"
                      type="text"
                      name="nama"
                      placeholder="Masukkan nama lengkap Anda"
                      value={form.nama}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="lk-field">
                    <label className="lk-label">Email <span className="lk-required">*</span></label>
                    <input
                      className="lk-input"
                      type="email"
                      name="email"
                      placeholder="contoh@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="lk-field">
                    <label className="lk-label">Nomor HP <span className="lk-required">*</span></label>
                    <input
                      className="lk-input"
                      type="text"
                      inputMode="numeric"
                      name="phone"
                      placeholder="+62 812 3456 7890"
                      value={form.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                  <div className="lk-field">
                    <label className="lk-label">LinkedIn URL <span className="lk-optional">(opsional)</span></label>
                    <input
                      className={`lk-input${linkedinError ? ' lk-input--error' : ''}`}
                      type="text"
                      name="linkedin"
                      placeholder="linkedin.com/in/username"
                      value={form.linkedin}
                      onChange={handleChange}
                    />
                    {linkedinError && (
                      <span className="lk-field-error">Masukkan URL yang valid, contoh: linkedin.com/in/nama</span>
                    )}
                  </div>
                  <div className="lk-field">
                    <label className="lk-label">Upload CV <span className="lk-required">*</span></label>
                    <div
                      className={`lk-upload-zone${dragOver ? ' drag-over' : ''}${cvFile ? ' has-file' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => document.getElementById('lk-cv-input').click()}
                    >
                      <input
                        id="lk-cv-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={handleFileInput}
                      />
                      {cvFile ? (
                        <div className="lk-file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0977be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="lk-file-name">{cvFile.name}</span>
                          <button type="button" className="lk-file-remove" onClick={(e) => { e.stopPropagation(); setCvFile(null); }}>×</button>
                        </div>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <p className="lk-upload-text">Seret &amp; lepas file di sini, atau <span className="lk-upload-link">pilih file</span></p>
                          <p className="lk-upload-hint">PDF, DOC, DOCX • Maks. 10MB • Maks. 1 File</p>
                        </>
                      )}
                    </div>
                    <div className="lk-upload-notes">
                      <div className="lk-upload-note-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Pastikan CV dalam format teks yang dapat dibaca, bukan hasil scan gambar.
                      </div>
                      <div className="lk-upload-note-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>
                          Jika lebih dari 1 file, harap gabungkan menjadi 1 file PDF atau DOC sebelum diunggah (bisa menggunakan <a href="https://www.ilovepdf.com/merge_pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 500 }}>tools ini</a>).
                        </span>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="lk-submit-btn" disabled={!isValid}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Kirim Lamaran
                  </button>
                </form>
              </>
            )}
          </div>
      </div>

      {/* Footer */}
      <footer className="lk-footer">
        <span>Powered by <strong>LUNA</strong> @2026</span>
      </footer>
    </div>
  );
}
