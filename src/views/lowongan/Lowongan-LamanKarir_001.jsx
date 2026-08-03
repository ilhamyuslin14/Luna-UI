import { useState, useEffect } from 'react';
import { getSeleksiByKode } from '../../services/seleksiService.js';
import { uploadAndExtractCV, updateKandidat, createActivityLog, updateActivityLog } from '../../services/kandidatService.js';
import { runScoring } from '../../services/scoringService.js';
import '../../../css/lowongan-laman-karir_001.css';

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
  if (text.includes('<p>') || text.includes('<ul>') || text.includes('<ol>') || text.includes('<br')) return text;

  const lines = text.split('\n');
  let inList = false;
  let listType = null; // 'ul' | 'ol'
  let html = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      return;
    }

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
    const isNumbered = /^\d+[\.\)]\s*/.test(trimmed);

    if (isBullet) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ul';
        html += '<ul>';
      }
      const content = trimmed.replace(/^[•\-\*]\s*/, '');
      html += `<li>${content}</li>`;
    } else if (isNumbered) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ol';
        html += '<ol>';
      }
      const content = trimmed.replace(/^\d+[\.\)]\s*/, '');
      html += `<li>${content}</li>`;
    } else {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      html += `<p>${trimmed}</p>`;
    }
  });

  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  return html;
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

function stripRupiahPrefix(val) {
  if (!val) return val;
  return String(val).trim().replace(/^rp\.?\s*/i, '');
}

function formatPengalaman(val) {
  if (!val && val !== 0) return null;
  const trimmed = String(val).trim();
  return /^\d+$/.test(trimmed) ? `${trimmed} Tahun` : trimmed;
}

function formatUpah(data) {
  if (!data) return null;
  if (data.upah_min || data.upah_maks) {
    const min = stripRupiahPrefix(data.upah_min) || '-';
    const maks = stripRupiahPrefix(data.upah_maks) || '-';
    return `${min} – ${maks}${data.siklus_upah ? ' / ' + data.siklus_upah : ''}`;
  }
  if (data.gaji) return stripRupiahPrefix(data.gaji);
  return null;
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

export default function LamanKarir_001({ kode }) {
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
  const [showToast, setShowToast] = useState(false);

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
    document.body.style.setProperty('overflow', 'visible', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.documentElement.style.setProperty('overflow', 'visible', 'important');
    document.documentElement.style.setProperty('height', 'auto', 'important');

    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
    };
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

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {}
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
          posisi_nama: seleksiData.jabatan || null,
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
          upload_fail_reason: err.message,
          source: 'Portal Karir',
          posisi_nama: seleksiData?.jabatan || null,
        });
        logId = log?.id;
      } catch (e) {}

      setSubmitErrorMsg(err.message);
      setSubmitState('error');
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--karir-ink-500)', fontSize: '14px' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--karir-primary)" strokeWidth="2.5" style={{ margin: '0 auto 12px auto' }}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <p>Memuat informasi lowongan pekerjaan...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'not-found' || !seleksiData) {
    return (
      <div className="lk-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="lk-section-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--karir-ink-900)', margin: '0 0 8px 0' }}>Lowongan Tidak Ditemukan</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--karir-ink-600)', margin: '0 0 20px 0', lineHeight: '1.5' }}>Lowongan pekerjaan ini mungkin sudah ditutup atau tautan yang Anda buka tidak valid.</p>
          <button className="lk-btn-submit" style={{ margin: '0 auto', maxWidth: '200px' }} onClick={() => window.location.href = '/'}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  const upahStr = formatUpah(seleksiData);
  const companyName = seleksiData.companies?.name || seleksiData.companies?.nama || seleksiData.company_name || null;
  const companySlug = seleksiData.companies?.slug || null;
  const companyLogoUrl = seleksiData.companies?.logo_url || null;
  const companyPageUrl = companySlug ? `/?view=laman-perusahaan&slug=${encodeURIComponent(companySlug)}` : null;
  const pengalamanMin = seleksiData.pengalaman || null;
  const departemenName = seleksiData.departments?.name || null;
  const modelKerjaTipeKerja = [seleksiData.remote, seleksiData.ikatan_kerja].filter(Boolean).join(' · ');

  if (submitState === 'success') {
    return (
      <div className="lk-page-wrapper">
        <header className="lk-header">
          <div className="lk-header-container">
            <div className="lk-brand">
              <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
              <span className="lk-brand-badge">PORTAL KARIR</span>
              {companyName && (
                <div className="lk-header-company-name">
                  <span className="dot"></span>
                  <span>{companyName}</span>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="lk-success-box">
          <div className="lk-success-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="lk-success-title">Lamaran Berhasil Terkirim!</h2>
          <p className="lk-success-desc">
            Terima kasih telah melamar posisi <strong>{seleksiData.jabatan}</strong>{companyName ? <> di <strong>{companyName}</strong></> : ''}. Berkas CV Anda telah kami terima dan tim rekrutmen kami akan segera meninjau kualifikasi Anda.
          </p>
          <button className="lk-btn-submit" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={() => { setSubmitState('idle'); setCvFile(null); setForm({ nama: '', email: '', phone: '', linkedin: '' }); }}>
            Kirim Lamaran Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lk-page-wrapper">
      {/* Toast Alert Feedback */}
      {showToast && (
        <div className="lk-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Link lowongan berhasil disalin!</span>
        </div>
      )}

      {/* Top Clean Professional Header Navbar */}
      <header className="lk-header">
        <div className="lk-header-container">
          <div className="lk-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" className="lk-brand-logo" />
            <span className="lk-brand-badge">PORTAL KARIR</span>
            {companyName && (
              <div className="lk-header-company-name">
                <span className="dot"></span>
                <span>{companyName}</span>
              </div>
            )}
          </div>

          <div className="lk-header-actions">
            <button type="button" className="lk-btn-share" onClick={handleShare}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="lk-breadcrumb-bar">
        {companyPageUrl ? (
          <a href={companyPageUrl}>{companyName}</a>
        ) : (
          <span>{companyName || 'Lowongan Pekerjaan'}</span>
        )}
        <span>/</span>
        <span className="active">{seleksiData.jabatan}</span>
      </div>

      {/* Main 2-Column Layout Container */}
      <div className="lk-main-container">
        {/* Left Column: Job Details & Requirements (65%) */}
        <div className="lk-left-col">
          {/* Ink Glow Premium Hero — Luna's real dark ink + orange glow, matches the "Plus" plan card */}
          <div className="lk-navy-hero-card">
            <div className="lk-navy-hero-info">
              <div className="lk-hero-top-badge-row">
                <span className="lk-active-hiring-badge"><span className="dot"></span>Lowongan Aktif</span>
              </div>

              <h1 className="lk-navy-job-title">{seleksiData.jabatan}</h1>

              <div className="lk-navy-company-row">
                {companyName && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    {companyName}
                  </span>
                )}
                {seleksiData.lokasi && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {seleksiData.lokasi}
                  </span>
                )}
                {modelKerjaTipeKerja && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    {modelKerjaTipeKerja}
                  </span>
                )}
              </div>

              {upahStr && (
                <span className="lk-navy-salary-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  <b>Rp {upahStr}</b>
                </span>
              )}
            </div>

            {companyName && (
              companyPageUrl ? (
                <a href={companyPageUrl} className="lk-navy-company-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  <div className="lk-navy-company-logo-box">
                    {companyLogoUrl ? <img src={companyLogoUrl} alt={companyName} /> : companyName.charAt(0).toUpperCase()}
                  </div>
                  <span className="lk-company-card-name">{companyName}</span>
                  <span className="lk-company-card-link">Lihat Profil →</span>
                </a>
              ) : (
                <div className="lk-navy-company-card">
                  <div className="lk-navy-company-logo-box">
                    {companyLogoUrl ? <img src={companyLogoUrl} alt={companyName} /> : companyName.charAt(0).toUpperCase()}
                  </div>
                  <span className="lk-company-card-name">{companyName}</span>
                </div>
              )
            )}
          </div>

          {/* Modern Professional Non-Flat Detail List Layout */}
          <div className="lk-detail-card">
            <div className="lk-detail-header-row">
              <div className="lk-detail-title-accent"></div>
              <h3 className="lk-detail-title">Detail Pekerjaan</h3>
            </div>

            <div className="lk-detail-list-wrapper">
              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Departemen</span>
                <span className="lk-detail-row-value">{departemenName || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Level Jabatan</span>
                <span className="lk-detail-row-value">{seleksiData.level_jabatan || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Lokasi</span>
                <span className="lk-detail-row-value">{seleksiData.lokasi || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Ikatan Kerja</span>
                <span className="lk-detail-row-value">{seleksiData.ikatan_kerja || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Upah / Gaji</span>
                <span className="lk-detail-row-value">{upahStr ? `Rp ${upahStr}` : '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Min. Pendidikan</span>
                <span className="lk-detail-row-value">{seleksiData.pendidikan || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Min. Pengalaman</span>
                <span className="lk-detail-row-value">{formatPengalaman(pengalamanMin) || '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Jumlah Posisi</span>
                <span className="lk-detail-row-value">{seleksiData.jumlah_rekrut ? `${seleksiData.jumlah_rekrut} Orang` : '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Tanggal Buka</span>
                <span className="lk-detail-row-value">{seleksiData.created_at ? formatTanggal(seleksiData.created_at) : '-'}</span>
              </div>

              <div className="lk-detail-row">
                <span className="lk-detail-row-label">Target On-Boarding</span>
                <span className="lk-detail-row-value">{seleksiData.tgl_onboard ? formatTanggal(seleksiData.tgl_onboard) : '-'}</span>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="lk-section-card">
            <h2 className="lk-section-title">Deskripsi & Tanggung Jawab Pekerjaan</h2>
            <div
              className="lk-rich-content"
              dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.deskripsi) || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }}
            />
          </div>

          {/* Job Requirements Card */}
          {seleksiData.kualifikasi && (
            <div className="lk-section-card">
              <h2 className="lk-section-title">Persyaratan & Kualifikasi Pelamar</h2>
              <div
                className="lk-rich-content"
                dangerouslySetInnerHTML={{ __html: formatDeskripsiToHtml(seleksiData.kualifikasi) }}
              />
            </div>
          )}
        </div>

        {/* Right Column: Floating Sticky Form Sidebar (35%) */}
        <div className="lk-right-col">
          <div className="lk-apply-card">
            <div className="lk-apply-header">
              <h3 className="lk-apply-title">Lamar Posisi Ini</h3>
              <p className="lk-apply-sub">Isi data diri dan unggah CV Anda</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Form Input Fields */}
              <div className="lk-form-group">
                <label className="lk-label">Nama Lengkap <span className="req">*</span></label>
                <input type="text" name="nama" className="lk-input" placeholder="Masukkan nama lengkap Anda" value={form.nama} onChange={handleChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">Email <span className="req">*</span></label>
                <input type="email" name="email" className="lk-input" placeholder="contoh@email.com" value={form.email} onChange={handleChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">Nomor HP <span className="req">*</span></label>
                <input type="text" inputMode="numeric" name="phone" className="lk-input" placeholder="+62 812 3456 7890" value={form.phone} onChange={handlePhoneChange} />
              </div>

              <div className="lk-form-group">
                <label className="lk-label">LinkedIn URL <span className="opt">(opsional)</span></label>
                <input type="text" name="linkedin" className={`lk-input ${linkedinError ? 'error' : ''}`} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={handleChange} />
                {linkedinError && <span className="lk-error-text">Masukkan URL yang valid, contoh: linkedin.com/in/nama</span>}
              </div>

              {/* File Upload Zone */}
              <div className="lk-form-group">
                <label className="lk-label">Upload CV <span className="req">*</span></label>

                {cvFile ? (
                  <div className="lk-file-active">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      <span className="lk-file-name">{cvFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setCvFile(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>×</button>
                  </div>
                ) : (
                  <div
                    className={`lk-drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById('lk-cv-input_001').click()}
                  >
                    <div className="lk-drop-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <span className="lk-drop-title">Seret & lepas file di sini, atau <span style={{ color: 'var(--karir-primary)', textDecoration: 'underline' }}>pilih file</span></span>
                    <span className="lk-drop-sub">PDF, DOC, DOCX • Maks. 10MB • Maks. 1 File</span>
                    <input id="lk-cv-input_001" type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
                  </div>
                )}
                {fileError && <span className="lk-error-text">{fileError}</span>}

                {/* Upload Notes */}
                <div className="lk-upload-notes">
                  <div className="lk-upload-note-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Pastikan CV dalam format teks yang dapat dibaca, bukan hasil scan gambar.</span>
                  </div>
                  <div className="lk-upload-note-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Jika lebih dari 1 file, harap gabungkan menjadi 1 file PDF atau DOC sebelum diunggah (bisa menggunakan <a href="https://www.ilovepdf.com/merge_pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--karir-primary)', textDecoration: 'underline', fontWeight: 600 }}>tools ini</a>).</span>
                  </div>
                </div>
              </div>

              {/* Submit Error Warning */}
              {submitState === 'error' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '700', color: '#991B1B', margin: '0 0 2px 0' }}>
                    {getApplyErrorInfo(submitErrorMsg).title}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#B91C1C', margin: 0, lineHeight: '1.4' }}>
                    {getApplyErrorInfo(submitErrorMsg).desc}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="lk-btn-submit" disabled={submitState === 'uploading' || !cvFile}>
                {submitState === 'uploading' ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
                    <span>{progressText || 'Mengirim Berkas…'}</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span>Kirim Lamaran</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
