import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { createSeleksi } from '../../services/seleksiService.js';
import { getDepartments, createDepartment } from '../../services/departmentService.js';
import { invalidate } from '../../services/dataCache.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { ID_REGIONS } from '../../utils/idRegions.js';
import Toast from '../../components/Toast.jsx';
import { supabase } from '../../config/supabase.js';
import { parseJobDescManual } from '../../utils/parseJobDescManual';
import { extractTextFromFile } from '../../utils/extractTextFromFile';

const SP001_DRAFT_KEY = 'sp001-draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(SP001_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try { sessionStorage.removeItem(SP001_DRAFT_KEY); } catch {}
}

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M1.5 7.5h15" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M6 1.5v3M12 1.5v3" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2.5V4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 9.5V11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M2.5 7H4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 7H11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.1 4.1L5.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.5 8.5L9.9 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.9 4.1L8.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M5.5 8.5L4.1 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Toolbar icon helpers ────────────────────────────────────────
const IcOrderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="0.5" y="0.5" width="2.5" height="4" rx="0.4" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M0.5 8.5h1.5c.55 0 1 .45 1 1s-.45 1-1 1H0.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcUnorderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <circle cx="1.5" cy="2.5" r="1.3" fill="currentColor"/>
    <circle cx="1.5" cy="8.5" r="1.3" fill="currentColor"/>
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignLeft = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignCenter = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="4" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="10" x2="10.5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignRight = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignJustify = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Toolbar button component ─────────────────────────────────────
const TBtn = ({ title, cmd, val, children, onClick }) => (
  <button
    className="sd001-deskripsi-toolbar-btn"
    title={title}
    type="button"
    onMouseDown={e => {
      e.preventDefault();
      if (onClick) { onClick(); return; }
      document.execCommand(cmd, false, val ?? null);
    }}
  >
    {children}
  </button>
);

// ── Memoized contenteditable ─────────────────────────────────────
const EditableContent = React.memo(
  ({ htmlRef, initialHtml }) => (
    <div
      ref={htmlRef}
      contentEditable
      suppressContentEditableWarning
      className="sp001-editor-area"
      style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  ),
  () => true
);

export default function LowonganSetupPenilaian_001({ navigate }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const statusOptions = isFreePlan
    ? DROPDOWN_OPTIONS.statusRekrutmen.filter(s => s === 'Rencana' || s === 'Aktif')
    : DROPDOWN_OPTIONS.statusRekrutmen;
  const draftRef = useRef(loadDraft());
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(() => draftRef.current?.fileName || '');
  const [uploadStatus, setUploadStatus] = useState(() => draftRef.current?.uploadStatus || 'idle'); // 'idle' | 'uploading' | 'done'
  const [uploadProgress, setUploadProgress] = useState(0);

  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getDepartments().then(data => setDepartments(data || [])).catch(console.error);
  }, []);

  const [form, setForm] = useState(() => ({
    jabatan: '', levelJabatan: '', departemen: '', lokasi: '', statusRekrutmen: 'Aktif', jumlahRekrut: '', ikatanKerja: '', upahMin: '', upahMax: '', siklusUpah: '', tglMulai: '', tglOnboarding: '', pendidikan: '', pengalaman: '', deskripsi: '',
    ...(draftRef.current?.form || {}),
  }));

  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lokasiInputContainerRef = useRef(null);
  const discardedRef = useRef(false);

  // Simpan draft form ke sessionStorage tiap kali berubah, biar tetap ada
  // kalau user pindah halaman lalu balik lagi. Hanya dihapus saat Simpan/Batal.
  useEffect(() => {
    if (discardedRef.current) return;
    try {
      sessionStorage.setItem(SP001_DRAFT_KEY, JSON.stringify({ form, fileName, uploadStatus }));
    } catch {}
  }, [form, fileName, uploadStatus]);

  // Deskripsi ada di contentEditable (bukan state) supaya caret tidak lompat;
  // tangkap isinya sesaat sebelum halaman ini unmount (user pindah menu).
  useEffect(() => {
    return () => {
      if (discardedRef.current) return;
      try {
        const liveDeskripsi = editorRef.current ? editorRef.current.innerHTML : undefined;
        const raw = sessionStorage.getItem(SP001_DRAFT_KEY);
        const prev = raw ? JSON.parse(raw) : { form, fileName, uploadStatus };
        sessionStorage.setItem(SP001_DRAFT_KEY, JSON.stringify({
          ...prev,
          form: { ...prev.form, deskripsi: liveDeskripsi ?? prev.form?.deskripsi },
        }));
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [lokasiSuggestions, setLokasiSuggestions] = useState([]);
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (lokasiInputContainerRef.current && !lokasiInputContainerRef.current.contains(e.target)) {
        setShowLokasiDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleLokasiChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, lokasi: val }));
    if (!val.trim()) {
      setLokasiSuggestions([]);
      setShowLokasiDropdown(false);
      return;
    }
    const q = val.toLowerCase();
    setLokasiSuggestions(ID_REGIONS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 8));
    setShowLokasiDropdown(true);
  };

  const handleLokasiSelect = (s) => {
    const val = s.type === 'city' && s.province ? `${s.name}, ${s.province}` : s.name;
    setForm(prev => ({ ...prev, lokasi: val }));
    setShowLokasiDropdown(false);
  };

  const handleDepartemenChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowDeptModal(true);
      setNewDeptName('');
    } else {
      setForm(prev => ({ ...prev, departemen: val }));
    }
  };

  const submitNewDept = async () => {
    if (!newDeptName.trim() || !companyId) return;
    setIsCreatingDept(true);
    try {
      const newDept = await createDepartment(companyId, { name: newDeptName.trim(), description: newDeptDesc.trim() });
      invalidate('departemen');
      setDepartments(prev => [newDept, ...prev]);
      setForm(prev => ({ ...prev, departemen: newDept.id }));
      setShowDeptModal(false);
      showToast('Berhasil', `Departemen ${newDept.name} ditambahkan.`);
    } catch (err) {
      showToast('Gagal', 'Tidak dapat menambahkan departemen.', 'error');
    } finally {
      setIsCreatingDept(false);
    }
  };

  const formatRupiah = (value) => {
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? `Rp. ${rupiah}` : '';
  };

  const handleUpah = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: formatRupiah(e.target.value) }));
  };

  const formatDeskripsiToHtml = (text) => {
    if (!text) return '';
    if (text.includes('<p>') || text.includes('<ul>') || text.includes('<br')) return text;
    return text.split('\n').map(line => {
      if (!line.trim()) return '<p><br/></p>';
      if (line.trim().startsWith('•')) return `<ul><li>${line.substring(1).trim()}</li></ul>`;
      return `<p>${line}</p>`;
    }).join('').replace(/<\/ul><ul>/g, '');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(20);
    try {
      const rawText = await extractTextFromFile(file);
      setUploadProgress(60);
      const parsedData = parseJobDescManual(rawText);
      
      if (parsedData.upahMin) parsedData.upahMin = formatRupiah(parsedData.upahMin);
      if (parsedData.upahMax) parsedData.upahMax = formatRupiah(parsedData.upahMax);

      const htmlDeskripsi = formatDeskripsiToHtml(parsedData.deskripsi);
      parsedData.deskripsi = htmlDeskripsi;
      
      // Remap namaJabatan to jabatan for state
      if (parsedData.namaJabatan) parsedData.jabatan = parsedData.namaJabatan;
      delete parsedData.namaJabatan;

      setForm(prev => ({ ...prev, ...parsedData }));
      
      if (editorRef.current && htmlDeskripsi) {
        editorRef.current.innerHTML = htmlDeskripsi;
      }
      setUploadProgress(100);
      setTimeout(() => {
        setUploadStatus('done');
        showToast('Berhasil', 'Isi dokumen telah diurai ke dalam form.');
      }, 500);
    } catch (err) {
      console.error(err);
      setUploadStatus('idle');
      setUploadProgress(0);
      showToast('Gagal', err.message || 'Gagal mengekstrak dokumen.', 'error');
    }
    e.target.value = '';
  };

  const handleSimpan = async () => {
    if (!companyId) return;
    const htmlDeskripsi = editorRef.current ? editorRef.current.innerHTML : form.deskripsi;
    if (!form.jabatan || !form.statusRekrutmen || !htmlDeskripsi) {
      showToast('Lengkapi Form', 'Harap isi semua field wajib (*)', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const plainText = htmlDeskripsi.replace(/<[^>]*>/g, '').trim();
      const meetsDescLength = plainText.length >= 300;
      // Paket Free tidak termasuk perumusan kriteria otomatis oleh AI — cuma
      // simpan data lowongan-nya, kriteria dibiarkan kosong (state terkunci
      // ditangani di Seleksi-Ringkasan/KriteriaPenilaian).
      const isSufficientDesc = !isFreePlan && meetsDescLength;

      const dataBaru = await createSeleksi(companyId, {
        department_id: form.departemen || null,
        jabatan: form.jabatan,
        level_jabatan: form.levelJabatan,
        lokasi: form.lokasi,
        status: form.statusRekrutmen,
        jumlah_rekrut: parseInt(form.jumlahRekrut) || null,
        ikatan_kerja: form.ikatanKerja,
        upah_min: form.upahMin,
        upah_maks: form.upahMax,
        siklus_upah: form.siklusUpah,
        tgl_mulai: form.tglMulai || null,
        tgl_onboard: form.tglOnboarding || null,
        pendidikan: form.pendidikan,
        pengalaman: form.pengalaman,
        deskripsi: htmlDeskripsi,
        kode: `LUN-${Math.floor(Math.random() * 10000)}`,
        kriteria: isSufficientDesc ? [{ _isGenerating: true }] : []
      });
      invalidate('seleksi');

      // Panggil serverless function untuk merumuskan kriteria secara asinkron (fire and forget)
      if (isSufficientDesc) {
        supabase.functions.invoke('generate-kriteria', {
          body: { seleksiId: dataBaru.id, deskripsi: htmlDeskripsi }
        }).catch(err => console.error('Gagal memanggil generate-kriteria:', err));
      } else if (!isFreePlan && !meetsDescLength) {
        showToast('Info', 'Deskripsi kurang dari 300 karakter. Kriteria AI tidak dirumuskan.', 'warning');
      }

      discardedRef.current = true;
      clearDraft();
      navigate('lowongan-detail_001', { seleksiId: dataBaru.id, jabatan: form.jabatan, activeTab: 'ringkasan' });
    } catch (err) {
      showToast('Gagal', err.message || 'Terjadi kesalahan saat menyimpan lowongan seleksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sp001-view">
      {/* Header Bar */}
      <div className="sp001-header">
        <div className="sp001-header-left">
          <div className="sp001-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="var(--luna-orange-500)" strokeWidth="1.8" />
              <path d="M8 7h8M8 11h8M8 15h5" stroke="var(--luna-orange-500)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sp001-header-text">
            <h1 className="sp001-header-title">Buat Lowongan Pekerjaan</h1>
            <p className="sp001-header-subtitle">Mulai buat lowongan pekerjaan baru. Luna akan membaca Deskripsi Pekerjaan Anda dan menyiapkan kriteria kualifikasi AI secara otomatis.</p>
          </div>
        </div>
        <div className="sp001-header-actions">
          <button className="sp001-btn-cancel" onClick={() => { discardedRef.current = true; clearDraft(); navigate('lowongan_001'); }}>Batal</button>
          <button className="sp001-btn-primary" onClick={handleSimpan}>Terbitkan Lowongan</button>
        </div>
      </div>

      {/* Body */}
      <div className="sp001-body">
        {/* Left Column */}
        <div className="sp001-col">
          {/* Upload Card */}
          <div className="sp001-upload-card">
            <p className="sp001-upload-title">Unggah deskripsi pekerjaan untuk mengisi form secara otomatis</p>
            <div className="sp001-upload-inner">
              <div className="sp001-upload-row">
                <button
                  className={`sp001-upload-btn${uploadStatus === 'uploading' ? ' sp001-upload-btn-disabled' : ''}`}
                  onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                >
                  Unggah Data
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />

                {uploadStatus === 'idle' && (
                  <span className="sp001-upload-empty-text">Belum ada file terpilih</span>
                )}
                {uploadStatus === 'uploading' && (
                  <div className="sp001-upload-progress-wrapper">
                    <span className="sp001-upload-progress-label">Mengunggah...</span>
                    <div className="sp001-upload-progress-track">
                      <div className="sp001-upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {uploadStatus === 'done' && (
                  <div className="sp001-upload-file-pill">
                    <span className="sp001-upload-file-name">{fileName}</span>
                  </div>
                )}
              </div>
              <div className="sp001-upload-hint-row">
                <p className="sp001-upload-hint">Mendukung file : PDF, DOC, DOCX, TXT</p>
                <div className="sp001-upload-hint-dot" />
                <p className="sp001-upload-hint">Ukuran file maksimal 10 Mb</p>
              </div>
            </div>
          </div>

          <p className="sp001-section-title">Detail Posisi</p>

          {/* Nama Jabatan + Level Jabatan */}
          <div className="sp001-row">
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Nama Jabatan <span className="sp001-req">*</span></label>
              <input className="sp001-input" placeholder="Isi Nama Jabatan" value={form.jabatan} onChange={set('jabatan')} />
            </div>
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Level Jabatan</label>
              <div className="sp001-select-wrapper">
                <select className="sp001-select" style={{ color: form.levelJabatan ? '#171e2c' : '#abb2c1' }} value={form.levelJabatan} onChange={set('levelJabatan')}>
                  <option value="" disabled>Pilih Level</option>
                  {DROPDOWN_OPTIONS.levelJabatan.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <span className="sp001-select-icon"><ChevronIcon /></span>
              </div>
            </div>
          </div>

          {/* Departemen */}
          <div className="sp001-field">
            <label className="sp001-label">Departemen <span style={{ color: '#9aa3b0', fontWeight: 400, marginLeft: 4 }}>(Opsional)</span></label>
            <div className="sp001-select-wrapper">
              <select className="sp001-select" style={{ color: form.departemen ? '#171e2c' : '#abb2c1' }} value={form.departemen} onChange={handleDepartemenChange}>
                <option value="" disabled>Pilih Departemen</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="new">+ Buat Departemen Baru</option>
              </select>
              <span className="sp001-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Lokasi */}
          <div className="sp001-field">
            <label className="sp001-label">Lokasi <span className="sp001-req">*</span></label>
            <div style={{ position: 'relative' }} ref={lokasiInputContainerRef}>
              <input 
                className="sp001-input" 
                placeholder="Lokasi Penempatan Kerja" 
                value={form.lokasi} 
                onChange={handleLokasiChange}
                onFocus={() => { if (form.lokasi.trim().length > 0) setShowLokasiDropdown(true); }}
              />
              {showLokasiDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #d4d9e6',
                  borderRadius: 8,
                  zIndex: 999,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  maxHeight: 220,
                  overflowY: 'auto'
                }}>
                  {lokasiSuggestions.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: 13, color: '#abb2c1' }}>Tidak ada kota/daerah ditemukan</div>
                  ) : lokasiSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onMouseDown={e => { e.preventDefault(); handleLokasiSelect(s); }}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#323b4d',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        borderBottom: i < lokasiSuggestions.length - 1 ? '1px solid #f0f2f5' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f4fafe'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{s.name}{s.province ? `, ${s.province}` : ''}</span>
                      <span style={{ fontSize: 10, color: '#abb2c1', flexShrink: 0 }}>
                        {s.type === 'city' ? 'Kota/Kab' : 'Provinsi'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status + Jumlah Rekrut */}
          <div className="sp001-row">
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Status Rekrutmen <span className="sp001-req">*</span></label>
              <div className="sp001-select-wrapper">
                <select className="sp001-select" style={{ color: form.statusRekrutmen ? '#171e2c' : '#abb2c1' }} value={form.statusRekrutmen} onChange={set('statusRekrutmen')}>
                  <option value="" disabled>Pilih Status</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="sp001-select-icon"><ChevronIcon /></span>
              </div>
            </div>
            <div className="sp001-field sp001-field-160">
              <label className="sp001-label">Jumlah Rekrut (Orang) <span className="sp001-req">*</span></label>
              <div className="sp001-spinner-wrapper">
                <input className="sp001-input" type="number" min="1" placeholder="—" value={form.jumlahRekrut} onChange={set('jumlahRekrut')} />
              </div>
            </div>
          </div>

          {/* Ikatan Kerja */}
          <div className="sp001-field">
            <label className="sp001-label">Ikatan Kerja <span className="sp001-req">*</span></label>
            <div className="sp001-select-wrapper">
              <select className="sp001-select" style={{ color: form.ikatanKerja ? '#171e2c' : '#abb2c1' }} value={form.ikatanKerja} onChange={set('ikatanKerja')}>
                <option value="" disabled>Pilih Ikatan Kerja</option>
                {DROPDOWN_OPTIONS.ikatanKerja.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp001-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Upah Min + Max */}
          <div className="sp001-row">
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Upah Minimum</label>
              <input className="sp001-input" placeholder="Masukan Nominal" value={form.upahMin} onChange={handleUpah('upahMin')} />
            </div>
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Upah Maksimum</label>
              <input className="sp001-input" placeholder="Masukan Nominal" value={form.upahMax} onChange={handleUpah('upahMax')} />
            </div>
          </div>

          {/* Siklus Upah */}
          <div className="sp001-field">
            <label className="sp001-label">Siklus Upah <span className="sp001-req">*</span></label>
            <div className="sp001-select-wrapper">
              <select className="sp001-select" style={{ color: form.siklusUpah ? '#171e2c' : '#abb2c1' }} value={form.siklusUpah} onChange={set('siklusUpah')}>
                <option value="" disabled>Pilih Siklus Upah</option>
                {DROPDOWN_OPTIONS.siklusUpah.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp001-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Tanggal */}
          <div className="sp001-row">
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Tanggal Mulai Rekrutmen</label>
              <div className="sp001-date-wrapper">
                <input type="date" className="sp001-input sp001-input-date" placeholder="Pilih Tanggal" value={form.tglMulai} onChange={set('tglMulai')} />
                <span className="sp001-date-icon"><CalendarIcon /></span>
              </div>
            </div>
            <div className="sp001-field sp001-field-flex">
              <label className="sp001-label">Tanggal Target On-boarding</label>
              <div className="sp001-date-wrapper">
                <input type="date" className="sp001-input sp001-input-date" placeholder="Pilih Tanggal" value={form.tglOnboarding} onChange={set('tglOnboarding')} />
                <span className="sp001-date-icon"><CalendarIcon /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="sp001-divider" />

        {/* Right Column */}
        <div className="sp001-col">
          <p className="sp001-section-title">Kualifikasi dan Deskripsi Pekerjaan</p>

          {/* Minimal Pendidikan */}
          <div className="sp001-field">
            <label className="sp001-label">Minimal Pendidikan <span className="sp001-req">*</span></label>
            <div className="sp001-select-wrapper">
              <select className="sp001-select" style={{ color: form.pendidikan ? '#171e2c' : '#abb2c1' }} value={form.pendidikan} onChange={set('pendidikan')}>
                <option value="" disabled>Pilih Jenjang Minimal</option>
                {DROPDOWN_OPTIONS.pendidikan.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp001-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Minimal Pengalaman */}
          <div className="sp001-field">
            <label className="sp001-label">Minimal Pengalaman Kerja (Tahun) <span className="sp001-req">*</span></label>
            <div className="sp001-spinner-wrapper">
              <input className="sp001-input" type="number" min="0" placeholder="—" value={form.pengalaman} onChange={set('pengalaman')} />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="sp001-field sp001-field-grow">
            <label className="sp001-label">Deskripsi Pekerjaan dan Rincian Syarat &amp; Kualifikasi <span className="sp001-req">*</span></label>
            <div className="sp001-editor">
              <div className="sd001-deskripsi-toolbar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #d1d5dc', borderBottom: 'none' }}>
                <select 
                  className="sd001-deskripsi-style-select" 
                  defaultValue="p"
                  onMouseDown={() => {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                  }}
                  onChange={e => {
                    if (savedRangeRef.current) {
                      const sel = window.getSelection();
                      sel.removeAllRanges();
                      sel.addRange(savedRangeRef.current);
                      savedRangeRef.current = null;
                    }
                    editorRef.current?.focus();
                    document.execCommand('formatBlock', false, e.target.value);
                  }}
                >
                  <option value="p">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
                <span className="sd001-deskripsi-toolbar-sep" />
                <TBtn title="Bold" cmd="bold"><b>B</b></TBtn>
                <TBtn title="Italic" cmd="italic"><i>I</i></TBtn>
                <TBtn title="Underline" cmd="underline"><u>U</u></TBtn>
                <span className="sd001-deskripsi-toolbar-sep" />
                <TBtn title="Ordered List" cmd="insertOrderedList"><IcOrderedList /></TBtn>
                <TBtn title="Unordered List" cmd="insertUnorderedList"><IcUnorderedList /></TBtn>
                <span className="sd001-deskripsi-toolbar-sep" />
                <TBtn title="Align Left" cmd="justifyLeft"><IcAlignLeft /></TBtn>
                <TBtn title="Align Center" cmd="justifyCenter"><IcAlignCenter /></TBtn>
                <TBtn title="Align Right" cmd="justifyRight"><IcAlignRight /></TBtn>
                <TBtn title="Justify" cmd="justifyFull"><IcAlignJustify /></TBtn>
              </div>
              <div style={{ border: '1px solid #d1d5dc', borderRadius: '0 0 10px 10px' }}>
                <EditableContent htmlRef={editorRef} initialHtml={form.deskripsi} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
      
      {/* Modal Departemen Baru */}
      {showDeptModal && (
        <div className="dept001-modal-overlay" onClick={() => !isCreatingDept && setShowDeptModal(false)}>
          <div className="dept001-modal dept001-modal-add" onClick={e => e.stopPropagation()}>
            <p className="dept001-modal-title">Tambah Departemen</p>
            <div className="dept001-modal-form">
              <div className="dept001-modal-field">
                <div className="dept001-modal-label-group">
                  <p className="dept001-modal-label">Nama Departemen <span style={{ color: '#ef4444' }}>*</span></p>
                  <p className="dept001-modal-hint">Pastikan jabatan telah sesuai. Contoh: Marketing, Accountant, dll</p>
                </div>
                <input
                  className="dept001-modal-input"
                  placeholder="Isi Nama Departemen"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitNewDept();
                    if (e.key === 'Escape') setShowDeptModal(false);
                  }}
                />
              </div>
              <div className="dept001-modal-field">
                <div className="dept001-modal-label-group">
                  <p className="dept001-modal-label">Deskripsi <span style={{ color: '#9aa3b0', fontWeight: 400, marginLeft: 4 }}>(Opsional)</span></p>
                </div>
                <textarea
                  className="dept001-modal-textarea"
                  placeholder="Masukan Deskripsi Singkat"
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="dept001-modal-footer dept001-modal-footer-end">
              <button className="dept001-modal-btn-cancel" onClick={() => setShowDeptModal(false)} disabled={isCreatingDept}>Batal</button>
              <button className="dept001-modal-btn-primary" onClick={submitNewDept} disabled={!newDeptName.trim() || isCreatingDept}>
                {isCreatingDept ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
