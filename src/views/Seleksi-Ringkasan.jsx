import { useState, useRef, useEffect, memo } from 'react';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="#7e8799" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, pointerEvents: 'none' }}>
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

// ── Kriteria edit helpers ────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
    <path d="M1 3.5h12M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5M5.5 7v5M8.5 7v5M2 3.5l.7 9.8a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9L12 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BOBOT_OPTS = [
  { val: 'tinggi', label: 'Tinggi' },
  { val: 'sedang', label: 'Sedang' },
  { val: 'rendah', label: 'Rendah' },
];

const BobotSelect = ({ value, onChange }) => (
  <div className={`sd-bobot-select-wrap ${value}`}>
    <select
      className="sd-bobot-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {BOBOT_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
    <ChevronDown />
  </div>
);

const BOBOT_LABEL = { tinggi: 'Tinggi', sedang: 'Sedang', rendah: 'Rendah' };

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
  const [isEditingKriteria, setIsEditingKriteria] = useState(false);
  const kriteriaSnapshot = useRef(null);
  const nextKriteriaId = useRef(11);

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

  const startEditKriteria = () => { kriteriaSnapshot.current = kriteria; setIsEditingKriteria(true); };
  const cancelKriteria    = () => { setKriteria(kriteriaSnapshot.current); setIsEditingKriteria(false); };
  const saveKriteria      = () => setIsEditingKriteria(false);
  const addKriteria       = () => setKriteria(prev => [...prev, { id: nextKriteriaId.current++, kategori: 'Wajib', teks: '', bobot: 'sedang' }]);
  const deleteKriteria    = (id) => setKriteria(prev => prev.filter(k => k.id !== id));
  const updateKriteria    = (id, field, val) => setKriteria(prev => prev.map(k => k.id === id ? { ...k, [field]: val } : k));

  const renderValue = (field) => {
    const val = formData[field.key] ?? '';

    if (field.type === 'readonly') {
      return <span className="sd-detail-value">{val}</span>;
    }

    // ── View mode ──
    if (!isEditing) {
      if (field.type === 'add' && !val) {
        return (
          <span className="sd-detail-value add-data">
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
      return <span className="sd-detail-value">{val}</span>;
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
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Kriteria Penilaian</span>
            {!isEditingKriteria && (
              <button className="sd-edit-btn" onClick={startEditKriteria}><EditIcon /> Edit</button>
            )}
          </div>

          {isEditingKriteria ? (
            <div className="sd-kriteria-content">
              <div className="sd-kriteria-edit-list">
                {kriteria.map(k => (
                  <div className="sd-kriteria-edit-item" key={k.id}>
                    <div className="sd-kriteria-edit-main">
                      <div className="sd-kriteria-edit-header">
                        <span className="sd-kriteria-edit-label">Kategori</span>
                        <div className="sd-kriteria-edit-label-group">
                          <span className="sd-kriteria-edit-label">Bobot Penilaian</span>
                          <BobotSelect value={k.bobot} onChange={val => updateKriteria(k.id, 'bobot', val)} />
                        </div>
                      </div>
                      <div className="sd-kriteria-edit-fields">
                        <div className="sd-kriteria-kategori-wrap">
                          <select
                            className="sd-kriteria-kategori-select"
                            value={k.kategori}
                            onChange={e => updateKriteria(k.id, 'kategori', e.target.value)}
                          >
                            <option value="Wajib">Wajib</option>
                            <option value="Nilai Tambah">Nilai Tambah</option>
                          </select>
                          <ChevronDown />
                        </div>
                        <input
                          className="sd-kriteria-text-input"
                          value={k.teks}
                          onChange={e => updateKriteria(k.id, 'teks', e.target.value)}
                          placeholder="Masukkan kriteria..."
                        />
                      </div>
                    </div>
                    <button className="sd-kriteria-delete-btn" onClick={() => deleteKriteria(k.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
              <div className="sd-kriteria-edit-footer">
                <button className="sd-kriteria-add-btn" onClick={addKriteria}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Add Criteria
                </button>
                <div className="sd-kriteria-footer-right">
                  <button className="sd-kriteria-cancel-btn" onClick={cancelKriteria}>Batal</button>
                  <button className="sd-edit-save-btn" onClick={saveKriteria}>Simpan</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sd-kriteria-content">
              <div className="sd-ai-badge">
                <div className="sd-ai-icon">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="#0977be"/>
                    <path d="M2 0.5L2.45 2.05L4 2.5L2.45 2.95L2 4.5L1.55 2.95L0 2.5L1.55 2.05L2 0.5Z" fill="#0977be" opacity="0.6"/>
                  </svg>
                </div>
                <div className="sd-ai-text-group">
                  <p className="sd-ai-title">Kriteria Berbasis AI</p>
                  <p className="sd-ai-desc">Untuk membantu akurasi AI telah merangkum kriteria berdasarkan data Job Description.<br />Klik 'Edit' jika ada penyesuaian kriteria.</p>
                </div>
              </div>

              <div className="sd-kriteria-sections">
                {['Wajib', 'Nilai Tambah'].map(kat => {
                  const items = kriteria.filter(k => k.kategori === kat);
                  if (!items.length) return null;
                  return (
                    <div className="sd-kriteria-section" key={kat}>
                      <div className="sd-kriteria-header">
                        <h3 className={`sd-kriteria-section-title ${kat === 'Wajib' ? 'primary' : 'neutral'}`}>{kat}</h3>
                        <span className="sd-kriteria-bobot-label">Bobot Nilai</span>
                      </div>
                      <div className="sd-kriteria-items">
                        {items.map(k => (
                          <div className="sd-kriteria-item" key={k.id}>
                            <ul className="sd-kriteria-list"><li>{k.teks}</li></ul>
                            <span className={`sd-bobot-badge ${k.bobot}`}>{BOBOT_LABEL[k.bobot]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
