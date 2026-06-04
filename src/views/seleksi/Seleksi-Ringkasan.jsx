import { useState, useRef, useEffect, memo } from 'react';
import KriteriaPenilaian from '../../components/KriteriaPenilaian';

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

// ── Dropdown options ─────────────────────────────────────────────
const DROPDOWN_OPTIONS = {
  dept:   ['Product', 'Tech', 'HR', 'Finance', 'Marketing', 'Operations'],
  status: ['Aktif', 'Rencana', 'Ditahan', 'Selesai', 'Dibatalkan'],
  ikatan: ['Waktu Tidak Tertentu', 'Waktu Tertentu (PKWT)', 'Magang', 'Kontrak'],
  siklus: ['Bulanan', 'Mingguan', 'Harian'],
};

const FIELDS = [
  { key: 'kode',        label: 'Kode Seleksi',                     type: 'readonly'  },
  { key: 'jabatan',     label: 'Nama Jabatan',                      type: 'text'      },
  { key: 'dept',        label: 'Departemen',                        type: 'dropdown'  },
  { key: 'lokasi',      label: 'Lokasi',                            type: 'text'      },
  { key: 'remote',      label: 'Remote',                            type: 'add'       },
  { key: 'status',      label: 'Status Rekrutmen',                  type: 'dropdown'  },
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

export default function SeleksiRingkasan({ jabatan = 'Project Manager' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => ({ ...DEFAULT_VALUES, jabatan }));
  const [isEditingDeskripsi, setIsEditingDeskripsi] = useState(false);
  const [deskripsiHtml, setDeskripsiHtml] = useState(DESKRIPSI_HTML);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [kriteria, setKriteria] = useState(INITIAL_KRITERIA);

  // Inline add state
  const [inlineAddKey, setInlineAddKey] = useState(null);
  const [inlineAddValue, setInlineAddValue] = useState('');

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleCancel = () => {
    setFormData({ ...DEFAULT_VALUES, jabatan });
    setIsEditing(false);
  };

  // Auto-focus + enable defaultParagraphSeparator when entering edit mode
  useEffect(() => {
    if (isEditingDeskripsi && editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [isEditingDeskripsi]);

  const handleSaveDeskripsi = () => {
    if (editorRef.current) setDeskripsiHtml(editorRef.current.innerHTML);
    setIsEditingDeskripsi(false);
  };

  const handleCancelDeskripsi = () => setIsEditingDeskripsi(false);

  const renderValue = (field) => {
    const val = formData[field.key] ?? '';

    if (field.type === 'readonly') {
      return <span className="sd-detail-value">{val}</span>;
    }

    // ── View mode ──
    if (!isEditing) {
      if (inlineAddKey === field.key) {
        return (
          <div style={{ width: '285px', flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type={field.type === 'date' ? 'date' : 'text'}
              className={`sd-detail-input ${field.type === 'date' ? 'sd-detail-input--date' : ''}`}
              value={inlineAddValue}
              onChange={e => setInlineAddValue(e.target.value)}
              placeholder="Tambahkan data"
              autoFocus
              style={{ flex: 1, minWidth: 0, width: '100%', margin: 0, height: '32px' }}
            />
            <button onClick={() => setInlineAddKey(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Batal">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#dc3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 10.5L10.5 3.5M3.5 3.5l7 7"/></svg>
            </button>
            <button onClick={() => { set(field.key, inlineAddValue); setInlineAddKey(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Simpan">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#28a745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.8 7l2.8 2.8 5.6-5.6"/></svg>
            </button>
          </div>
        );
      }

      if (field.type === 'add' && !val) {
        return (
          <span className="sd-detail-value add-data" style={{ cursor: 'pointer' }} onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}>
            Tambahkan data
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" strokeWidth="1"/>
              <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
        );
      }
      if (field.type === 'date') {
        return <span className="sd-detail-value">{formatDateDisplay(val)}</span>;
      }
      return (
        <span className="sd-detail-value">
          {val || (
            <span
              className="sd-detail-value add-data"
              style={{ cursor: 'pointer', gap: 4 }}
              onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}
            >
              Tambahkan data
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ marginLeft: 4 }}>
                <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" strokeWidth="1"/>
                <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </span>
          )}
        </span>
      );
    }

    // ── Edit mode ──
    if (field.type === 'dropdown') {
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
            {FIELDS.map(field => (
              <div className="sd-detail-row" key={field.key}>
                <span className="sd-detail-label">{field.label}</span>
                {renderValue(field)}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={handleCancel}>Batal</button>
              <button className="sd-edit-save-btn" onClick={() => setIsEditing(false)}>Simpan</button>
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
            />
          )}
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="sd-col-right">
        <KriteriaPenilaian kriteria={kriteria} onChange={setKriteria} />
      </div>
    </div>
  );
}
