import { useState, useEffect } from 'react';
import { getSeleksiByKode } from '../../services/seleksiService.js';
import { uploadAndExtractCV, updateKandidat, createActivityLog, updateActivityLog } from '../../services/kandidatService.js';
import { runScoring } from '../../services/scoringService.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;

function isValidUrl(str) {
  if (!str) return true;
  try {
    new URL(str.startsWith('http') ? str : 'https://' + str);
    return str.includes('.');
  } catch {
    return false;
  }
}

function formatDeskripsiToHtml(text) {
  if (!text) return '';
  if (text.includes('<p>') || text.includes('<ul>') || text.includes('<br')) return text;
  return text.split('\n').map(line => {
    if (line.trim().startsWith('•')) return `<ul><li>${line.substring(1).trim()}</li></ul>`;
    return `<p>${line}</p>`;
  }).join('').replace(/<\/ul><ul>/g, '');
}

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '-';
  }
}

function formatUpah(data) {
  if (!data.upah_min && !data.upah_maks) return null;
  const min = data.upah_min || '-';
  const maks = data.upah_maks || '-';
  return `${min} – ${maks}${data.siklus_upah ? ' / ' + data.siklus_upah : ''}`;
}

function getApplyErrorInfo(msg) {
  if (!msg) return { title: 'Gagal Mengirim Lamaran', desc: 'Terjadi kesalahan saat memproses lamaran Anda. Silakan coba lagi.' };
  if (/sudah pernah diunggah/i.test(msg)) {
    return { title: 'CV Sudah Pernah Dikirim', desc: 'CV dengan isi yang sama pernah dikirim sebelumnya. Lamaran Anda tetap akan kami proses pada posisi ini.' };
  }
  if (/bukan cv|lowongan|brosur/i.test(msg)) {
    return { title: 'Dokumen Bukan CV', desc: 'File yang Anda unggah terdeteksi bukan merupakan CV/resume. Silakan unggah dokumen CV yang sesuai.' };
  }
  if (/konfigurasi ai/i.test(msg)) {
    return { title: 'Sistem Sedang Bermasalah', desc: 'Sistem kami sedang mengalami gangguan. Silakan coba beberapa saat lagi.' };
  }
  if (/format file/i.test(msg)) {
    return { title: 'Format File Tidak Didukung', desc: 'File yang Anda unggah berupa gambar atau format lain yang tidak dapat dibaca sistem kami. Silakan gunakan file PDF, DOC, atau DOCX yang berisi teks CV Anda.' };
  }
  return { title: 'Gagal Mengirim Lamaran', desc: msg };
}

export default function LamanKarir({ kode }) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [seleksiData, setSeleksiData] = useState(null);

  const [form, setForm] = useState({ nama: '', email: '', phone: '', linkedin: '' });
  const [cvFile, setCvFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitState, setSubmitState] = useState('idle'); // idle | uploading | success | error
  const [submitErrorMsg, setSubmitErrorMsg] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [linkedinError, setLinkedinError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('deskripsi');

  useEffect(() => {
    let active = true;
    if (!kode) {
      setPageState('not-found');
      return;
    }
    getSeleksiByKode(kode).then(data => {
      if (!active) return;
      if (!data || (data.status || '').trim().toLowerCase() !== 'aktif') {
        setPageState('not-found');
        return;
      }
      setSeleksiData(data);
      setPageState('ready');
    }).catch(() => {
      if (active) setPageState('not-found');
    });
    return () => { active = false; };
  }, [kode]);

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

  const acceptFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setFileError('');
    setCvFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleFileInput = (e) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (linkedinError || fileError || !cvFile || !seleksiData) return;

    setSubmitState('uploading');
    setSubmitErrorMsg(null);
    setProgressText('Mempersiapkan berkas…');

    const batchId = `pb-${Date.now()}`;

    try {
      const onProgress = (_progress, text) => setProgressText(text || '');
      const kandidat = await uploadAndExtractCV(seleksiData.company_id, cvFile, seleksiData.jabatan, onProgress, 'public');

      const contactUpdates = {};
      if (form.nama) contactUpdates.nama_lengkap = form.nama;
      if (form.email) contactUpdates.email = form.email;
      if (form.phone) contactUpdates.phone = form.phone;
      if (form.linkedin) contactUpdates.linkedin_url = form.linkedin;
      if (kandidat?.id && Object.keys(contactUpdates).length > 0) {
        await updateKandidat(kandidat.id, contactUpdates).catch(() => {});
      }

      let logId = null;
      try {
        const log = await createActivityLog({
          batch_id: batchId,
          company_id: seleksiData.company_id,
          nama_file: cvFile.name,
          tipe_aktivitas: 'upload_and_scoring',
          upload_status: 'berhasil',
          scoring_status: 'menunggu',
          kandidat_id: kandidat?.id || null,
          source: 'Portal Karir',
        });
        logId = log?.id;
      } catch (e) {}

      if (kandidat?.id && seleksiData?.id) {
        runScoring(kandidat.id, seleksiData.id, seleksiData.company_id).then(() => {
          if (logId) updateActivityLog(logId, { scoring_status: 'berhasil' }).catch(()=>{});
        }).catch((err) => {
          if (logId) updateActivityLog(logId, { scoring_status: 'gagal', scoring_fail_reason: err.message }).catch(()=>{});
        });
      }

      setSubmitState('success');
    } catch (err) {
      let logId = null;
      try {
        const log = await createActivityLog({
          batch_id: batchId,
          company_id: seleksiData.company_id,
          nama_file: cvFile.name,
          tipe_aktivitas: 'upload_and_scoring',
          upload_status: 'gagal',
          upload_fail_reason: err?.message || 'Gagal',
          scoring_status: err?.existingKandidatId ? 'menunggu' : 'gagal',
          kandidat_id: err?.existingKandidatId || null,
          source: 'Portal Karir',
        });
        logId = log?.id;
      } catch (e) {}

      if (err?.existingKandidatId && seleksiData?.id) {
        runScoring(err.existingKandidatId, seleksiData.id, seleksiData.company_id).then(() => {
          if (logId) updateActivityLog(logId, { scoring_status: 'berhasil' }).catch(()=>{});
        }).catch((scoreErr) => {
          if (logId) updateActivityLog(logId, { scoring_status: 'gagal', scoring_fail_reason: scoreErr.message }).catch(()=>{});
        });
      }

      if (/sudah pernah diunggah/i.test(err?.message)) {
        setSubmitState('duplicate');
      } else {
        setSubmitErrorMsg(err?.message || '');
        setSubmitState('error');
      }
    }
  };

  const handleRetry = () => {
    setCvFile(null);
    setFileError('');
    setSubmitErrorMsg(null);
    setSubmitState('idle');
  };

  const phoneDigits = form.phone.replace(/[^0-9]/g, '').length;
  const isValid = form.nama && form.email && phoneDigits >= 10 && cvFile && !linkedinError && !fileError;

  if (pageState === 'loading') {
    return (
      <div className="lk-page lk-status-page">
        <div className="lk-spinner" />
        <p className="lk-uploading-title">Memuat halaman lowongan…</p>
      </div>
    );
  }

  if (pageState === 'not-found') {
    return (
      <div className="lk-page lk-status-page">
        <h2 className="lk-uploading-title">Lowongan Tidak Ditemukan</h2>
        <p className="lk-uploading-sub">Tautan ini tidak valid atau lowongan sudah tidak tersedia lagi. Silakan hubungi pihak perusahaan untuk informasi lebih lanjut.</p>
      </div>
    );
  }

  const data = seleksiData;
  const jabatan = data.jabatan || '-';
  const upah = formatUpah(data);
  const errorInfo = submitState === 'error' ? getApplyErrorInfo(submitErrorMsg) : null;

  const metaChips = [
    data.lokasi && {
      key: 'lokasi',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      text: data.lokasi,
    },
    data.ikatan_kerja && {
      key: 'ikatan',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      text: data.ikatan_kerja,
    },
    upah && {
      key: 'upah',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      text: upah,
    },
    data.pengalaman && {
      key: 'pengalaman',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      text: `Min. ${data.pengalaman} Tahun Pengalaman`,
    },
  ].filter(Boolean);

  const detailRows = [
    ['Departemen', data.departments?.name || '-'],
    ['Lokasi', data.lokasi || '-'],
    ['Ikatan Kerja', data.ikatan_kerja || '-'],
    ['Upah', upah || '-'],
    ['Min. Pendidikan', data.pendidikan || '-'],
    ['Min. Pengalaman', data.pengalaman ? `${data.pengalaman} Tahun` : '-'],
    ['Jumlah Posisi', data.jumlah_rekrut ? `${data.jumlah_rekrut} Orang` : '-'],
    ['Tanggal Buka', formatTanggal(data.tgl_mulai)],
    ['Target On-Boarding', formatTanggal(data.tgl_onboard)],
  ];

  return (
    <div className="lk-page">

      {/* Top Bar */}
      <header className="lk-topbar">
        <div className="lk-topbar-brand">
          <img src="/assets/logos/luna-logo-clean.png" alt="LUNA" className="lk-topbar-logo" style={{ borderRadius: '6px' }} />
        </div>
        <div className="lk-topbar-right">
          <span className="lk-topbar-company-label">Diposting oleh</span>
          <span className="lk-topbar-company">{data.companies?.name || '-'}</span>
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
            {metaChips.length > 0 && (
              <div className="lk-hero-meta">
                {metaChips.map(chip => (
                  <span className="lk-meta-chip" key={chip.key}>
                    {chip.icon}
                    {chip.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lk-main">

        {/* Description */}
          <div className="lk-card" id="deskripsi">
            <h2 className="lk-card-title">Deskripsi Pekerjaan</h2>
            {data.deskripsi ? (
              <div className="lk-desc-content" dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(data.deskripsi) }} />
            ) : (
              <p className="lk-desc-p" style={{ color: '#64748b' }}>Belum ada deskripsi pekerjaan untuk posisi ini.</p>
            )}
          </div>

          {/* Detail */}
          <div className="lk-card" id="detail">
            <h2 className="lk-card-title">Detail Pekerjaan</h2>
            <div className="lk-detail-grid">
              {detailRows.map(([label, value]) => (
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
                <p className="lk-uploading-sub">{progressText || 'Mohon tunggu, kami sedang memproses lamaran Anda.'}</p>
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

            {submitState === 'duplicate' && (
              <div className="lk-result lk-result--success">
                <div className="lk-result-icon lk-result-icon--success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="lk-result-title">Lamaran Berhasil Diproses!</h3>
                <p className="lk-result-desc">Terima kasih, <strong>{form.nama}</strong>! Sistem kami mendeteksi bahwa CV Anda sudah pernah diunggah sebelumnya. Lamaran Anda <strong>tetap berhasil didaftarkan</strong> untuk posisi ini dan akan segera kami tinjau.</p>
              </div>
            )}

            {submitState === 'error' && (
              <div className="lk-result lk-result--error">
                <div className="lk-result-icon lk-result-icon--error">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <h3 className="lk-result-title">{errorInfo.title}</h3>
                <p className="lk-result-desc">{errorInfo.desc}</p>
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
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={handleFileInput}
                      />
                      {cvFile ? (
                        <div className="lk-file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="lk-file-name">{cvFile.name}</span>
                          <button type="button" className="lk-file-remove" onClick={(e) => { e.stopPropagation(); setCvFile(null); setFileError(''); }}>×</button>
                        </div>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <p className="lk-upload-text">Seret &amp; lepas file di sini, atau <span className="lk-upload-link">pilih file</span></p>
                          <p className="lk-upload-hint">PDF, DOC, DOCX • Maks. 10MB • Maks. 1 File</p>
                        </>
                      )}
                    </div>
                    {fileError && (
                      <span className="lk-field-error">{fileError}</span>
                    )}
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
                          Jika lebih dari 1 file, harap gabungkan menjadi 1 file PDF atau DOC sebelum diunggah (bisa menggunakan <a href="https://www.ilovepdf.com/merge_pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--luna-orange-600)', textDecoration: 'underline', fontWeight: 500 }}>tools ini</a>).
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
