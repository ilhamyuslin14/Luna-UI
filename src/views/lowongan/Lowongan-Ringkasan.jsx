import { useState, useRef, useEffect, memo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksiById, updateSeleksi } from '../../services/seleksiService.js';
import { getDepartments } from '../../services/departmentService.js';
import { getCompanyUsers } from '../../services/companyUserService.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import Toast from '../../components/Toast.jsx';
import KriteriaPenilaian from '../../components/KriteriaPenilaian';
import InlineEditRow from '../../components/InlineEditRow.jsx';
import { supabase } from '../../config/supabase.js';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <path d="M1 1L5 5L9 1"/>
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
    className="sd-deskripsi-toolbar-btn"
    title={title}
    onMouseDown={e => {
      e.preventDefault();
      if (onClick) { onClick(); return; }
      document.execCommand(cmd, false, val ?? null);
    }}
  >
    {children}
  </button>
);

// ── Memoized contenteditable — never re-renders after mount so
//    React can't wipe user edits or clobber innerHTML ────────────
const EditableContent = memo(
  ({ htmlRef, initialHtml }) => (
    <div
      ref={htmlRef}
      contentEditable
      suppressContentEditableWarning
      className="sd-deskripsi-content sd-deskripsi-editable"
      style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  ),
  () => true   // always treat props as equal → skip all re-renders
);

// ── Date formatting ──────────────────────────────────────────────
const BULAN_ID = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI_ID  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function formatDateDisplay(val) {
  if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const [y, m, d] = val.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${HARI_ID[dt.getDay()]}, ${d} ${BULAN_ID[m]} ${y}`;
}

const FIELDS = [
  { key: 'kode',        label: 'Kode Seleksi',                     type: 'readonly'  },
  { key: 'jabatan',     label: 'Nama Jabatan',                      type: 'text'      },
  { key: 'dept',        label: 'Departemen',                        type: 'dropdown'  },
  { key: 'lokasi',      label: 'Lokasi',                            type: 'location'  },
  { key: 'remote',      label: 'Remote',                            type: 'add',      tooltip: 'Menandakan apakah posisi pekerjaan ini dapat dilakukan secara remote/WFH' },
  { key: 'status',      label: 'Status Rekrutmen',                  type: 'dropdown', tooltip: 'Ubah status menjadi Aktif agar lowongan ini tampil di Laman Karier publik (akses via tombol di kanan atas).' },
  { key: 'jumlah',      label: 'Jumlah Rekrut (Orang)',             type: 'text'      },
  { key: 'ikatan',      label: 'Ikatan Kerja',                      type: 'dropdown'  },
  { key: 'upahMin',     label: 'Upah Minimal',                      type: 'text'      },
  { key: 'upahMaks',    label: 'Upah Maksimum',                     type: 'text'      },
  { key: 'siklus',      label: 'Siklus Upah',                       type: 'dropdown'  },
  { key: 'tglMulai',    label: 'Tanggal Mulai Rekrutmen',           type: 'date'      },
  { key: 'tglOnboard',  label: 'Tanggal Target On-Boarding',        type: 'date'      },
  { key: 'pendidikan',  label: 'Minimal Pendidikan',                type: 'text'      },
  { key: 'pengalaman',  label: 'Minimal Pengalaman Kerja (Tahun)',  type: 'text'      },
];

const DEFAULT_VALUES = {
  kode:       'JD000001',
  jabatan:    null,
  dept:       'Product',
  lokasi:     'Tebet, Jakarta Selatan',
  remote:     '',
  status:     'Aktif',
  jumlah:     '2',
  ikatan:     'Waktu Tidak Tertentu',
  upahMin:    'Rp 6.000.000',
  upahMaks:   'Rp 8.000.000',
  siklus:     'Bulanan',
  tglMulai:   '2026-02-20',
  tglOnboard: '2026-03-06',
  pendidikan: 'D4/S1 (Sarjana)',
  pengalaman: '3',
};

const INITIAL_KRITERIA = [
  { id: 1, kategori: 'Wajib',       teks: 'Minimum 3 years PM experience in tech or software house', bobot: 'tinggi' },
  { id: 2, kategori: 'Wajib',       teks: 'Expertise in Agile, Scrum, or Kanban methodologies',      bobot: 'tinggi' },
  { id: 3, kategori: 'Wajib',       teks: 'Proficiency in Jira, Trello, Asana, or ClickUp',          bobot: 'sedang' },
  { id: 4, kategori: 'Wajib',       teks: 'Strong analytical thinking and task breakdown skills',     bobot: 'tinggi' },
  { id: 5, kategori: 'Wajib',       teks: 'Proven leadership and team management abilities',          bobot: 'sedang' },
  { id: 6, kategori: 'Wajib',       teks: 'Advanced negotiation and bridge communication skills',     bobot: 'sedang' },
  { id: 7, kategori: 'Wajib',       teks: 'Experience managing timelines, budgets, and resources',   bobot: 'rendah' },
  { id: 8, kategori: 'Wajib',       teks: 'Ability to manage PRD and project documentation',         bobot: 'rendah' },
  { id: 9, kategori: 'Nilai Tambah', teks: 'PMP or CSM certification',                               bobot: 'sedang' },
  { id: 10, kategori: 'Nilai Tambah', teks: 'Technical background as Developer or QA',               bobot: 'rendah' },
];

const DESKRIPSI_HTML = `<h3 class="sd-deskripsi-section-title">Role Overview</h3>
<p class="sd-deskripsi-p">We are looking for a proactive and results-driven Talent Acquisition Specialist to join our HR team. You will be responsible for the full lifecycle of recruitment, from sourcing and interviewing to closing top-tier candidates.</p>
<h4 class="sd-deskripsi-subtitle">Key Responsibilities</h4>
<ul class="sd-deskripsi-list">
<li><strong>End-to-End Recruitment:</strong> Manage the entire hiring process, including job posting, resume screening, initial phone interviews, and coordinating final rounds.</li>
<li><strong>Strategic Sourcing:</strong> Proactively hunt for passive candidates through LinkedIn Recruiter, niche job boards, and professional networks.</li>
<li><strong>Candidate Experience:</strong> Act as the primary point of contact, ensuring every candidate has a positive, transparent, and professional experience.</li>
<li><strong>Stakeholder Management:</strong> Partner with Hiring Managers to understand their specific needs and provide market insights.</li>
<li><strong>Data-Driven Hiring:</strong> Maintain the Applicant Tracking System (ATS) and provide regular reports on hiring metrics.</li>
</ul>
<h4 class="sd-deskripsi-subtitle">Requirements &amp; Qualifications</h4>
<ul class="sd-deskripsi-list">
<li><strong>Experience:</strong> 2–4 years of experience in recruitment (agency or in-house).</li>
<li><strong>Communication:</strong> Exceptional verbal and written communication skills.</li>
<li><strong>Tech-Savvy:</strong> Proficiency with ATS platforms and LinkedIn Recruiter.</li>
<li><strong>Mindset:</strong> A strong hunter mentality with the ability to sell the company vision.</li>
</ul>`;

export default function LowonganRingkasan({ seleksiId, jabatan = 'Project Manager', navigate }) {
  const { companyId, companyPlan } = useAuth();
  const isFreePlan = companyPlan === 'free';
  const statusOptions = isFreePlan
    ? DROPDOWN_OPTIONS.statusRekrutmen.filter(s => s === 'Rencana' || s === 'Aktif')
    : DROPDOWN_OPTIONS.statusRekrutmen;
  const [departments, setDepartments] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [picUserId, setPicUserId] = useState('');
  const [toast, setToast] = useState(null);
  
  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(() => ({ ...DEFAULT_VALUES, jabatan }));
  const [formData, setFormData] = useState(() => ({ ...DEFAULT_VALUES, jabatan }));
  const [isEditingDeskripsi, setIsEditingDeskripsi] = useState(false);
  const [hoveredDeskripsi, setHoveredDeskripsi] = useState(false);
  const [deskripsiHtml, setDeskripsiHtml] = useState('');
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [kriteria, setKriteria] = useState([]);
  const [isGeneratingKriteria, setIsGeneratingKriteria] = useState(false);

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

  const handleEditChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!seleksiId) return;

    getDepartments().then(setDepartments).catch(console.error);
    if (companyId) getCompanyUsers(companyId).then(setCompanyUsers).catch(console.error);

    getSeleksiById(seleksiId).then(data => {
      if (data) {
        const mapped = {
          kode: `SLS-${String(data.id || '').padStart(5, '0').substring(0, 5)}`,
          jabatan: data.jabatan || '',
          dept: data.department_id || '',
          lokasi: data.lokasi || '',
          remote: data.remote || '',
          status: data.status || 'Rencana',
          jumlah: data.jumlah_rekrut || '',
          ikatan: data.ikatan_kerja || '',
          upahMin: data.upah_min || '',
          upahMaks: data.upah_maks || '',
          siklus: data.siklus_upah || '',
          tglMulai: data.tgl_mulai || '',
          tglOnboard: data.tgl_onboard || '',
          pendidikan: data.pendidikan || '',
          pengalaman: data.pengalaman || '',
        };
        
        const formatDeskripsiToHtml = (text) => {
          if (!text) return '';
          if (text.includes('<p>') || text.includes('<ul>') || text.includes('<br')) return text;
          return text.split('\n').map(line => {
            if (line.trim().startsWith('•')) return `<ul><li>${line.substring(1).trim()}</li></ul>`;
            return `<p>${line}</p>`;
          }).join('').replace(/<\/ul><ul>/g, '');
        };

        setFormData(mapped);
        setOriginalData(mapped);
        setPicUserId(data.pic_user_id || '');
        if (data.deskripsi) {
          setDeskripsiHtml(formatDeskripsiToHtml(data.deskripsi));
        }
        if (data.kriteria && Array.isArray(data.kriteria)) {
          if (data.kriteria[0] && data.kriteria[0]._isGenerating) {
            setKriteria([]);
            setIsGeneratingKriteria(true);
          } else {
            setKriteria(data.kriteria);
          }
        }
      }
    }).catch(console.error);

    // Listen to global status updates from Header
    const handleSync = (e) => {
      setFormData(prev => ({ ...prev, status: e.detail }));
      setOriginalData(prev => ({ ...prev, status: e.detail }));
    };
    window.addEventListener('syncSeleksiStatus', handleSync);

    return () => window.removeEventListener('syncSeleksiStatus', handleSync);
  }, [seleksiId, companyId]);

  // Poll Supabase jika sedang generating kriteria
  useEffect(() => {
    if (isGeneratingKriteria && seleksiId) {
      const interval = setInterval(() => {
        getSeleksiById(seleksiId).then(data => {
          if (data && data.kriteria && Array.isArray(data.kriteria)) {
            if (!data.kriteria[0] || !data.kriteria[0]._isGenerating) {
              setKriteria(data.kriteria);
              setIsGeneratingKriteria(false);
              if (data.kriteria.length > 0) {
                showToast('Selesai', 'Kriteria AI berhasil dirumuskan.', 'success');
              }
            }
          }
        }).catch(console.error);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGeneratingKriteria, seleksiId]);

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!seleksiId) {
      setIsEditing(false);
      return;
    }
    try {
      await updateSeleksi(seleksiId, {
        jabatan: formData.jabatan,
        department_id: formData.dept,
        lokasi: formData.lokasi,
        status: formData.status,
        jumlah_rekrut: formData.jumlah,
        ikatan_kerja: formData.ikatan,
        upah_min: formData.upahMin,
        upah_maks: formData.upahMaks,
        siklus_upah: formData.siklus,
        tgl_mulai: formData.tglMulai,
        tgl_onboard: formData.tglOnboard || null,
        pendidikan: formData.pendidikan,
        pengalaman: formData.pengalaman,
      });
      setOriginalData(formData);
      showToast('Berhasil', 'Data detail pekerjaan berhasil disimpan.');
      setIsEditing(false);
      
      // Sync global status just in case it was edited globally
      window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: formData.status }));
    } catch (error) {
      console.error(error);
      setFormData(originalData);
      showToast('Gagal', error.message || 'Gagal menyimpan data.', 'error');
    }
    setIsEditing(false);
  };

  // Auto-focus + enable defaultParagraphSeparator when entering edit mode
  useEffect(() => {
    if (isEditingDeskripsi && editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [isEditingDeskripsi]);

  const handleSaveDeskripsi = async () => {
    const html = editorRef.current?.innerHTML || '';
    setDeskripsiHtml(html);
    setIsEditingDeskripsi(false);
    
    if (seleksiId) {
      try {
        await updateSeleksi(seleksiId, { deskripsi: html });
        showToast('Berhasil', 'Deskripsi berhasil diperbarui.');
      } catch (e) {
        console.error(e);
        showToast('Gagal', 'Gagal menyimpan deskripsi.', 'error');
      }
    }
  };

  const handleCancelDeskripsi = () => setIsEditingDeskripsi(false);

  const renderValue = (field) => {
    const val = formData[field.key] ?? '';

    // ── Edit mode (Global Form) ──
    if (field.type === 'readonly') {
      return <span className="inline-edit-value">{val}</span>;
    }


    // ── Edit mode ──
    if (field.type === 'dropdown') {
      if (field.key === 'dept') {
        return (
          <div className="sd-detail-select-wrap">
            <select
              className="sd-detail-select"
              value={val}
              onChange={e => set(field.key, e.target.value)}
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        );
      }
      return (
        <div className="sd-detail-select-wrap">
          <select
            className="sd-detail-select"
            value={val}
            onChange={e => set(field.key, e.target.value)}
          >
            {(DROPDOWN_OPTIONS[field.key] || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown />
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          className="sd-detail-input sd-detail-input--date"
          value={val}
          onChange={e => set(field.key, e.target.value)}
        />
      );
    }

    if (field.type === 'add') {
      return (
        <input
          className="sd-detail-input"
          value={val}
          onChange={e => set(field.key, e.target.value)}
          placeholder="Tambahkan data"
        />
      );
    }

    return (
      <input
        className="sd-detail-input"
        value={val}
        onChange={e => set(field.key, e.target.value)}
      />
    );
  };

  return (
    <div className="sd-columns">
      {/* Kolom Kiri */}
      <div className="sd-col-left">
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Detail Pekerjaan</span>
            {!isEditing && (
              <button className="sd-edit-btn" onClick={() => setIsEditing(true)}>
                <EditIcon /> Edit
              </button>
            )}
          </div>
          <div className="sd-detail-rows">
            {FIELDS.map(field => {
              if (!isEditing && field.type !== 'readonly') {
                // Determine props for InlineEditRow
                let type = 'text';
                let options = [];
                if (field.key === 'dept') { type = 'dropdown'; options = departments; }
                else if (field.key === 'remote') { type = 'dropdown'; options = DROPDOWN_OPTIONS.remote; }
                else if (field.key === 'pendidikan') { type = 'dropdown'; options = DROPDOWN_OPTIONS.pendidikan; }
                else if (field.key === 'status') { type = 'dropdown'; options = statusOptions; }
                else if (field.key === 'ikatan') { type = 'dropdown'; options = DROPDOWN_OPTIONS.ikatanKerja; }
                else if (field.key === 'siklus') { type = 'dropdown'; options = DROPDOWN_OPTIONS.siklusUpah; }
                else if (field.type === 'dropdown') { type = 'dropdown'; options = DROPDOWN_OPTIONS[field.key]; }
                else if (field.type === 'date') { type = 'date'; }
                else if (field.key === 'jumlah' || field.key === 'pengalaman') { type = 'number'; }
                else if (field.type === 'location') { type = 'location'; }

                const dbKeyMap = {
                  jabatan: 'jabatan', dept: 'department_id', lokasi: 'lokasi', status: 'status',
                  jumlah: 'jumlah_rekrut', ikatan: 'ikatan_kerja', upahMin: 'upah_min', upahMaks: 'upah_maks',
                  siklus: 'siklus_upah', tglMulai: 'tgl_mulai', tglOnboard: 'tgl_onboard',
                  pendidikan: 'pendidikan', pengalaman: 'pengalaman', remote: 'remote'
                };

                const handleInlineSave = async (valToSave) => {
                   const prevVal = formData[field.key];
                   setFormData(prev => ({ ...prev, [field.key]: valToSave }));
                   if (seleksiId && dbKeyMap[field.key]) {
                     const dbCol = dbKeyMap[field.key];
                     const finalVal = field.type === 'date' ? (valToSave || null) : valToSave;
                     try {
                       await updateSeleksi(seleksiId, { [dbCol]: finalVal });
                       showToast('Berhasil', 'Data diperbarui.');

                       // If status changes, sync it to Header
                       if (field.key === 'status') {
                         window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: valToSave }));
                       } else {
                         window.dispatchEvent(new CustomEvent('syncSeleksiData'));
                       }
                     } catch (err) {
                       console.error(err);
                       setFormData(prev => ({ ...prev, [field.key]: prevVal }));
                       showToast('Gagal', err.message || 'Gagal memperbarui data.', 'error');
                     }
                   }
                };

                let displayVal = formData[field.key];
                if (field.type === 'date' && displayVal) displayVal = formatDateDisplay(displayVal);
                if (field.key === 'dept' && displayVal) {
                  const d = departments.find(x => String(x.id) === String(displayVal));
                  if (d) displayVal = d.name;
                }
                if (field.key === 'pengalaman' && displayVal) {
                  displayVal = `${displayVal} Tahun`;
                }

                return (
                  <InlineEditRow
                    key={field.key}
                    label={field.label}
                    tooltip={field.tooltip}
                    value={formData[field.key]}
                    displayValue={displayVal}
                    type={type}
                    options={options}
                    onSave={handleInlineSave}
                    formatRupiah={field.key === 'upahMin' || field.key === 'upahMaks' ? formatRupiah : undefined}
                  />
                );
              }

              return (
                <div className="inline-edit-row" key={field.key}>
                  <span className="inline-edit-label">{field.label}</span>
                  {renderValue(field)}
                </div>
              );
            })}
          </div>
          {isEditing && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={handleCancel}>Batal</button>
              <button className="sd-edit-save-btn" onClick={handleSave}>Simpan</button>
            </div>
          )}
        </div>

        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Deskripsi Pekerjaan</span>
            {!isEditingDeskripsi && (
              <button className="sd-edit-btn" onClick={() => setIsEditingDeskripsi(true)}>
                <EditIcon /> Edit
              </button>
            )}
          </div>

          {isEditingDeskripsi ? (
            <div className="sd-deskripsi-editor">
              <div className="sd-deskripsi-toolbar">
                <select
                  className="sd-deskripsi-style-select"
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
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Bold" cmd="bold"><b>B</b></TBtn>
                <TBtn title="Italic" cmd="italic"><i>I</i></TBtn>
                <TBtn title="Underline" cmd="underline"><u>U</u></TBtn>
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Ordered List" cmd="insertOrderedList"><IcOrderedList /></TBtn>
                <TBtn title="Unordered List" cmd="insertUnorderedList"><IcUnorderedList /></TBtn>
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Align Left" cmd="justifyLeft"><IcAlignLeft /></TBtn>
                <TBtn title="Align Center" cmd="justifyCenter"><IcAlignCenter /></TBtn>
                <TBtn title="Align Right" cmd="justifyRight"><IcAlignRight /></TBtn>
                <TBtn title="Justify" cmd="justifyFull"><IcAlignJustify /></TBtn>
              </div>
              <EditableContent htmlRef={editorRef} initialHtml={deskripsiHtml} />
              <div className="sd-detail-edit-footer">
                <button className="sd-edit-cancel-btn" onClick={handleCancelDeskripsi}>Batal</button>
                <button className="sd-edit-save-btn" onClick={handleSaveDeskripsi}>Simpan</button>
              </div>
            </div>
          ) : (
            <div
              className="sd-deskripsi-content"
              dangerouslySetInnerHTML={{ __html: deskripsiHtml }}
              onClick={() => setIsEditingDeskripsi(true)}
              onMouseEnter={() => setHoveredDeskripsi(true)}
              onMouseLeave={() => setHoveredDeskripsi(false)}
              style={{
                cursor: 'text',
                borderRadius: 6,
                border: `1.5px solid ${hoveredDeskripsi ? '#0977be44' : 'transparent'}`,
                background: hoveredDeskripsi ? '#f0f6ff' : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            />
          )}
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="sd-col-right">
        <KriteriaPenilaian
          kriteria={kriteria}
          isFreePlan={isFreePlan}
          navigate={navigate}
          onChange={(newKriteria) => {
            setKriteria(newKriteria);
            if (seleksiId) {
              updateSeleksi(seleksiId, { kriteria: newKriteria })
                .then(() => showToast('Disimpan', 'Kriteria penilaian berhasil diperbarui', 'success'))
                .catch((err) => {
                  console.error(err);
                  showToast('Gagal', 'Gagal menyimpan perubahan kriteria', 'error');
                });
            }
          }} 
          isGenerating={isGeneratingKriteria} 
          onRefresh={() => {
            if (seleksiId && deskripsiHtml) {
              const plainText = deskripsiHtml.replace(/<[^>]*>/g, '').trim();
              if (plainText.length < 300) {
                showToast('Error AI', 'Deskripsi minimal 300 karakter untuk merumuskan kriteria otomatis.', 'error');
                return;
              }
              setIsGeneratingKriteria(true);
              updateSeleksi(seleksiId, { kriteria: [{ _isGenerating: true }] }).catch(console.error);
              supabase.functions.invoke('generate-kriteria', {
                body: { seleksiId, deskripsi: deskripsiHtml }
              }).catch(err => {
                console.error(err);
                showToast('AI Error', 'Gagal memanggil server.', 'error');
                setIsGeneratingKriteria(false);
              });
            } else {
              showToast('Gagal', 'Deskripsi pekerjaan masih kosong', 'error');
            }
          }}
        />

        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Penanggung Jawab</span>
          </div>
          <div className="sd-detail-rows">
            <InlineEditRow
              label="Nama Rekruter"
              tooltip="HR yang bertanggung jawab atas lowongan ini — dipakai untuk melacak hasil rekrutmen per HR"
              value={picUserId}
              displayValue={companyUsers.find(u => u.id === picUserId)?.name || ''}
              type="dropdown"
              options={companyUsers}
              onSave={async (valToSave) => {
                setPicUserId(valToSave);
                if (seleksiId) {
                  await updateSeleksi(seleksiId, { pic_user_id: valToSave || null });
                  showToast('Berhasil', 'PIC lowongan berhasil diperbarui.');
                }
              }}
            />
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
