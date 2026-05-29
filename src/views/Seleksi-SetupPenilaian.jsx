import { useState, useRef } from 'react';

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke="#abb2c1" strokeWidth="1.2"/>
    <path d="M1.5 7.5h15" stroke="#abb2c1" strokeWidth="1.2"/>
    <path d="M6 1.5v3M12 1.5v3" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2.5V4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M7 9.5V11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M2.5 7H4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M9.5 7H11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.1 4.1L5.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M8.5 8.5L9.9 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M9.9 4.1L8.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5.5 8.5L4.1 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const TOOLBAR_ITEMS = [
  { title: 'Bold', icon: <strong style={{ fontSize: 13, fontFamily: 'Georgia, serif' }}>B</strong> },
  { title: 'Italic', icon: <em style={{ fontSize: 13, fontFamily: 'Georgia, serif' }}>I</em> },
  { title: 'Underline', icon: <span style={{ textDecoration: 'underline', fontSize: 12 }}>U</span> },
  { title: 'Code', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )},
  { title: 'Heading', icon: <span style={{ fontSize: 11, fontWeight: 700 }}>H1</span> },
  { title: 'Quote', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  )},
  { title: 'Ordered List', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
      <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
    </svg>
  )},
  { title: 'Bullet List', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )},
  { title: 'Align Left', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
    </svg>
  )},
  { title: 'Align Center', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>
    </svg>
  )},
  { title: 'Align Right', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>
    </svg>
  )},
  { title: 'Justify', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>
    </svg>
  )},
];


export default function SetupPenilaian({ navigate }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'done'
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    namaJabatan: '',
    departemen: '',
    lokasi: '',
    statusRekrutmen: '',
    jumlahRekrut: '',
    ikatanKerja: '',
    upahMin: '',
    upahMax: '',
    siklusUpah: '',
    tglMulai: '',
    tglOnboarding: '',
    pendidikan: '',
    pengalaman: '',
    deskripsi: '',
  });

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleFileChange = (e) => {
    if (!e.target.files[0]) return;
    const name = e.target.files[0].name;
    setUploadStatus('uploading');
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        setUploadProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setFileName(name);
          setUploadStatus('done');
        }, 300);
      } else {
        setUploadProgress(progress);
      }
    }, 120);
  };

  const handleSimpan = () => {
    navigate('seleksi');
  };

  return (
    <div className="sp-view">
      {/* Header Bar */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="#0977be" strokeWidth="1.8"/>
              <path d="M8 7h8M8 11h8M8 15h5" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="sp-header-text">
            <h1 className="sp-header-title">Setup Penilaian</h1>
            <p className="sp-header-subtitle">Mulai setup penilaian AI untuk role baru. Luna akan membaca Deskripsi Pekerjaan kamu dan menyiapkan kriteria seleksi otomatis.</p>
          </div>
        </div>
        <div className="sp-header-actions">
          <button className="sp-btn-cancel" onClick={() => navigate('seleksi')}>Batal</button>
          <button className="sp-btn-primary" onClick={handleSimpan}>Simpan</button>
        </div>
      </div>

      {/* Body */}
      <div className="sp-body">
        {/* Left Column */}
        <div className="sp-col">
          {/* Upload Card */}
          <div className="sp-upload-card">
            <p className="sp-upload-title">Unggah deskripsi pekerjaan untuk mengisi form secara otomatis</p>
            <div className="sp-upload-inner">
              <div className="sp-upload-row">
                <button
                  className={`sp-upload-btn${uploadStatus === 'uploading' ? ' sp-upload-btn-disabled' : ''}`}
                  onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                >
                  Unggah Data
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />

                {uploadStatus === 'idle' && (
                  <span className="sp-upload-empty-text">Belum ada file terpilih</span>
                )}
                {uploadStatus === 'uploading' && (
                  <div className="sp-upload-progress-wrapper">
                    <span className="sp-upload-progress-label">Mengunggah...</span>
                    <div className="sp-upload-progress-track">
                      <div className="sp-upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {uploadStatus === 'done' && (
                  <div className="sp-upload-file-pill">
                    <span className="sp-upload-file-name">{fileName}</span>
                  </div>
                )}
              </div>
              <div className="sp-upload-hint-row">
                <p className="sp-upload-hint">Mendukung file : PDF, DOC, DOCX, TXT</p>
                <div className="sp-upload-hint-dot" />
                <p className="sp-upload-hint">Ukuran file maksimal 10 Mb</p>
              </div>
            </div>
          </div>

          <p className="sp-section-title">Detail Posisi</p>

          {/* Nama Jabatan */}
          <div className="sp-field">
            <label className="sp-label">Nama Jabatan <span className="sp-req">*</span></label>
            <input className="sp-input" placeholder="Isi Nama Jabatan" value={form.namaJabatan} onChange={set('namaJabatan')} />
          </div>

          {/* Departemen */}
          <div className="sp-field">
            <label className="sp-label">Departemen <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.departemen ? '#171e2c' : '#abb2c1' }} value={form.departemen} onChange={set('departemen')}>
                <option value="" disabled>Pilih Departemen</option>
                {['Product', 'Tech', 'HR', 'Engineering', 'Marketing', 'Finance'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Lokasi */}
          <div className="sp-field">
            <label className="sp-label">Lokasi <span className="sp-req">*</span></label>
            <input className="sp-input" placeholder="Lokasi Penempatan Kerja" value={form.lokasi} onChange={set('lokasi')} />
          </div>

          {/* Status + Jumlah Rekrut */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Status Rekrutmen <span className="sp-req">*</span></label>
              <div className="sp-select-wrapper">
                <select className="sp-select" style={{ color: form.statusRekrutmen ? '#171e2c' : '#abb2c1' }} value={form.statusRekrutmen} onChange={set('statusRekrutmen')}>
                  <option value="" disabled>Pilih Status Rekrutmen</option>
                  {['Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="sp-select-icon"><ChevronIcon /></span>
              </div>
            </div>
            <div className="sp-field sp-field-160">
              <label className="sp-label">Jumlah Rekrut (Orang) <span className="sp-req">*</span></label>
              <div className="sp-spinner-wrapper">
                <input className="sp-input sp-input-center" type="number" min="1" placeholder="—" value={form.jumlahRekrut} onChange={set('jumlahRekrut')} />
                <span className="sp-spinner-icon"><SpinnerIcon /></span>
              </div>
            </div>
          </div>

          {/* Ikatan Kerja */}
          <div className="sp-field">
            <label className="sp-label">Ikatan Kerja <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.ikatanKerja ? '#171e2c' : '#abb2c1' }} value={form.ikatanKerja} onChange={set('ikatanKerja')}>
                <option value="" disabled>Pilih Ikatan Kerja</option>
                {['Waktu Tidak Tertentu', 'Waktu Tertentu', 'Freelance'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Upah Min + Max */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Upah Minimum</label>
              <input className="sp-input" placeholder="Masukan Nominal" value={form.upahMin} onChange={set('upahMin')} />
            </div>
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Upah Maksimum</label>
              <input className="sp-input" placeholder="Masukan Nominal" value={form.upahMax} onChange={set('upahMax')} />
            </div>
          </div>

          {/* Siklus Upah */}
          <div className="sp-field">
            <label className="sp-label">Siklus Upah <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.siklusUpah ? '#171e2c' : '#abb2c1' }} value={form.siklusUpah} onChange={set('siklusUpah')}>
                <option value="" disabled>Pilih Siklus Upah</option>
                {['Bulanan', 'Mingguan', 'Harian'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Tanggal */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Tanggal Mulai Rekrutmen</label>
              <div className="sp-date-wrapper">
                <input className="sp-input sp-input-date" placeholder="Pilih Tanggal" value={form.tglMulai} onChange={set('tglMulai')} />
                <span className="sp-date-icon"><CalendarIcon /></span>
              </div>
            </div>
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Tanggal Target On-boarding</label>
              <div className="sp-date-wrapper">
                <input className="sp-input sp-input-date" placeholder="Pilih Tanggal" value={form.tglOnboarding} onChange={set('tglOnboarding')} />
                <span className="sp-date-icon"><CalendarIcon /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="sp-divider" />

        {/* Right Column */}
        <div className="sp-col">
          <p className="sp-section-title">Kualifikasi dan Deskripsi Pekerjaan</p>

          {/* Minimal Pendidikan */}
          <div className="sp-field">
            <label className="sp-label">Minimal Pendidikan <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.pendidikan ? '#171e2c' : '#abb2c1' }} value={form.pendidikan} onChange={set('pendidikan')}>
                <option value="" disabled>Pilih Jenjang Minimal</option>
                {['SMA/SMK', 'D3 (Diploma)', 'D4/S1 (Sarjana)', 'S2 (Magister)', 'S3 (Doktor)'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Minimal Pengalaman */}
          <div className="sp-field">
            <label className="sp-label">Minimal Pengalaman Kerja (Tahun) <span className="sp-req">*</span></label>
            <div className="sp-spinner-wrapper">
              <input className="sp-input sp-input-center" type="number" min="0" placeholder="—" value={form.pengalaman} onChange={set('pengalaman')} />
              <span className="sp-spinner-icon"><SpinnerIcon /></span>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="sp-field sp-field-grow">
            <label className="sp-label">Deskripsi Pekerjaan dan Rincian Syarat &amp; Kualifikasi <span className="sp-req">*</span></label>
            <div className="sp-editor">
              <div className="sp-toolbar">
                {TOOLBAR_ITEMS.map((item) => (
                  <button key={item.title} className="sp-toolbar-btn" title={item.title} type="button">
                    {item.icon}
                  </button>
                ))}
              </div>
              <textarea
                className="sp-editor-area"
                placeholder="Masukan deskripsi pekerjaan dan Rincian Kualifikasi disini"
                value={form.deskripsi}
                onChange={set('deskripsi')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
