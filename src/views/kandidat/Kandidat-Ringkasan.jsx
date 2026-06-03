import { useState, useRef, useEffect, memo } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import Toast from '../../components/Toast.jsx';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AddIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" strokeWidth="1" />
    <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* Calendar date input dengan icon — sesuai Figma */
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M1.5 7.5h15" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M6 1.5v3M12 1.5v3" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* Bullet-point input list */
const BulletInputs = ({ bullets, onChange }) => (
  <div className="kd-bullets-wrap">
    {bullets.map((b, i) => (
      <div className="kd-bullet-row" key={i}>
        <span className="kd-bullet-dot">•</span>
        <input
          className="kd-edu-input kd-bullet-input"
          value={b}
          onChange={e => onChange(setBulletStatic(bullets, i, e.target.value))}
          placeholder="Tulis tanggung jawab atau pencapaian..."
        />
        {bullets.length > 1 && (
          <button
            type="button"
            className="kd-bullet-remove"
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        )}
      </div>
    ))}
    <button
      type="button"
      className="kd-bullet-add"
      onClick={() => onChange([...bullets, ''])}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 1v8M1 5h8" stroke="#0977be" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Tambah poin
    </button>
  </div>
);
// static helper for BulletInputs (outside component to avoid closure issues)
function setBulletStatic(arr, i, val) { const n = [...arr]; n[i] = val; return n; }

const DateInputField = ({ value, onChange, label }) => (
  <div className="kd-date-field">
    {/* Native input invisible — handles date picker */}
    <input
      type="date"
      className="kd-date-native"
      value={value}
      onChange={onChange}
    />
    {/* Visual layer: label/value + icon inside the box */}
    <div className="kd-date-display">
      <span className={value ? 'kd-date-val' : 'kd-date-hint'}>
        {value || label}
      </span>
      <CalendarIcon />
    </div>
  </div>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h10M4.5 1.5h3M2 3l.6 7.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8L10 3" />
    <line x1="4.5" y1="5.5" x2="4.5" y2="9" />
    <line x1="7.5" y1="5.5" x2="7.5" y2="9" />
  </svg>
);

/* ── Rich text editor pieces (identik Seleksi-Ringkasan) ── */
const IcOL = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="0.5" y="0.5" width="2.5" height="4" rx="0.4" stroke="currentColor" strokeWidth="0.8" />
    <path d="M0.5 8.5h1.5c.55 0 1 .45 1 1s-.45 1-1 1H0.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcUL = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <circle cx="1.5" cy="2.5" r="1.3" fill="currentColor" />
    <circle cx="1.5" cy="8.5" r="1.3" fill="currentColor" />
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const TBtn = ({ title, cmd, val, children }) => (
  <button className="sd-deskripsi-toolbar-btn" title={title}
    onMouseDown={e => { e.preventDefault(); document.execCommand(cmd, false, val ?? null); }}>
    {children}
  </button>
);
const EditableDesc = memo(({ htmlRef, initialHtml }) => (
  <div ref={htmlRef} contentEditable suppressContentEditableWarning
    className="sd-deskripsi-content sd-deskripsi-editable kd-exp-desc-editor"
    dangerouslySetInnerHTML={{ __html: initialHtml }} />
), () => true);

const PENGALAMAN = [
  {
    jabatan: 'Freelancer Recruitment',
    perusahaan: 'Duta Generasi Mandiri',
    periode: '2023-09-01 – Sekarang',
    deskripsi: [
      'Memposting lowongan pekerjaan pada platform.',
      'Melakukan screening CV pelamar.',
      'Mengatur jadwal interview.',
      'Menyusun materi rekrutmen dan employer branding.',
      'Berkoordinasi dengan user terkait kebutuhan tim.',
    ],
  },
  {
    jabatan: 'HR Assistant',
    perusahaan: 'PT Indah Nusantara',
    periode: '2021-03-01 – 2023-08-01',
    deskripsi: [
      'Membantu proses rekrutmen end-to-end.',
      'Mengelola database kandidat.',
      'Menyusun laporan aktivitas HR bulanan.',
    ],
  },
];

const PENDIDIKAN = [
  {
    institusi: 'Universitas Mercu Buana',
    gelar: 'S1 – Psikologi',
    periode: '2018-01-01 – 2022-01-01',
  },
];

const AI_SCORES = [
  { posisi: 'Backend Engineer', fit: 'moderate', label: 'Sedang', score: 75 },
  { posisi: 'Frontend Engineer', fit: 'high', label: 'Tinggi', score: 90 },
  { posisi: 'Cloud Engineer', fit: 'high', label: 'Tinggi', score: 90 },
];

/* ── Field definitions ──────────────────────────────── */
const DETAIL_FIELDS = [
  { key: 'nama', label: 'Nama Lengkap', type: 'text' },
  { key: 'linkedin', label: 'LinkedIn', type: 'add' },
  { key: 'id', label: 'ID Kandidat', type: 'readonly' },
  { key: 'gender', label: 'Gender', type: 'add' },
  { key: 'jurusan', label: 'Jurusan', type: 'text' },
  { key: 'universitas', label: 'Universitas', type: 'text' },
  { key: 'perusahaan', label: 'Perusahaan Saat Ini', type: 'text' },
  { key: 'jabatan', label: 'Jabatan Saat Ini', type: 'text' },
  { key: 'pengalaman', label: 'Pengalaman Kerja (Tahun)', type: 'text' },
  { key: 'tglLahir', label: 'Tanggal Lahir', type: 'date' },
  { key: 'domisili', label: 'Domisili', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'No. Telpon', type: 'text' },
];

const TAMBAHAN_FIELDS = [
  { key: 'industri', label: 'Bidang Industri', type: 'add' },
  { key: 'tahunLulus', label: 'Tahun Kelulusan', type: 'add' },
  { key: 'harapanUpah', label: 'Harapan Upah', type: 'add' },
  { key: 'harapanBenefit', label: 'Harapan Benefit', type: 'add' },
];

export default function KandidatRingkasan({ kandidat = {}, onChangeTab }) {
  const [expandedExp, setExpandedExp] = useState(new Set());
  const [scorePanel, setScorePanel] = useState(null);

  /* ── Keahlian state ── */
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skills, setSkills] = useState(['Microsoft Office', 'Komunikasi', 'Sourcing', 'Proses Rekrutmen end to end', 'Bernegosiasi']);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const skillInputRef = useRef(null);
  const skillsSnap = useRef(null);

  useEffect(() => {
    if (addingSkill) skillInputRef.current?.focus();
  }, [addingSkill]);

  const removeSkill = (idx) => setSkills(prev => prev.filter((_, i) => i !== idx));
  const startEditSkills = () => { skillsSnap.current = [...skills]; setIsEditingSkills(true); };
  const cancelSkills = () => { setSkills(skillsSnap.current); setAddingSkill(false); setNewSkill(''); setIsEditingSkills(false); };
  const saveSkills = () => { setAddingSkill(false); setNewSkill(''); setIsEditingSkills(false); };

  const confirmSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills(prev => [...prev, trimmed]);
    setNewSkill('');
    setAddingSkill(false);
  };

  /* ── Pengalaman Kerja state ── */
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [pengalamanList, setPengalamanList] = useState(PENGALAMAN.map((e, i) => ({ ...e, id: i })));
  const pengalamanSnap = useRef(null);
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ jabatan: '', perusahaan: '', tglMulai: '', tglSelesai: '', bullets: [''] });

  const startEditExp = () => { pengalamanSnap.current = pengalamanList.map(e => ({ ...e })); setIsEditingExp(true); };
  const EMPTY_EXP = { jabatan: '', perusahaan: '', tglMulai: '', tglSelesai: '', bullets: [''] };
  const cancelExp = () => { setPengalamanList(pengalamanSnap.current); setAddingExp(false); setNewExp(EMPTY_EXP); setEditingExpId(null); setIsEditingExp(false); };
  const saveExp = () => { setAddingExp(false); setIsEditingExp(false); };
  const removeExp = (id) => { setPengalamanList(prev => prev.filter(e => e.id !== id)); setExpMenuOpen(null); setDeleteTarget(null); };
  const confirmExp = () => {
    if (!newExp.jabatan.trim()) return;
    const periode = [newExp.tglMulai, newExp.tglSelesai].filter(Boolean).join(' – ') || '';
    const deskripsi = newExp.bullets.filter(b => b.trim());
    setPengalamanList(prev => [...prev, { jabatan: newExp.jabatan, perusahaan: newExp.perusahaan, periode, id: Date.now(), deskripsi }]);
    setNewExp(EMPTY_EXP);
    setAddingExp(false);
  };
  // helpers for bullet lists
  const setBullet = (arr, i, val) => { const n = [...arr]; n[i] = val; return n; };
  const addBullet = (arr) => [...arr, ''];
  const removeBullet = (arr, i) => arr.filter((_, idx) => idx !== i);
  // 3-dot menu + inline edit state
  const [expMenuOpen, setExpMenuOpen] = useState(null);
  const [editingExpId, setEditingExpId] = useState(null);
  const [editExpData, setEditExpData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'exp' | 'edu', id }
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const startInlineEditExp = (exp) => {
    const parts = (exp.periode || '').split(' – ');
    setEditExpData({
      jabatan: exp.jabatan, perusahaan: exp.perusahaan,
      tglMulai: parts[0] || '', tglSelesai: parts[1] || '',
      bullets: exp.deskripsi?.length ? [...exp.deskripsi] : [''],
    });
    setEditingExpId(exp.id);
    setExpMenuOpen(null);
  };
  const saveInlineEditExp = (id) => {
    const periode = [editExpData.tglMulai, editExpData.tglSelesai].filter(Boolean).join(' – ') || '';
    const deskripsi = editExpData.bullets.filter(b => b.trim());
    setPengalamanList(prev => prev.map(e => e.id === id ? { ...e, jabatan: editExpData.jabatan, perusahaan: editExpData.perusahaan, periode, deskripsi } : e));
    setEditingExpId(null);
  };

  /* ── Pendidikan state ── */
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [pendidikanList, setPendidikanList] = useState(PENDIDIKAN.map((e, i) => ({ ...e, id: i })));
  const pendidikanSnap = useRef(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ institusi: '', jenjang: '', tglMulai: '', tglSelesai: '' });
  // 3-dot menu + inline edit state
  const [eduMenuOpen, setEduMenuOpen] = useState(null);   // id of open menu
  const [editingEduId, setEditingEduId] = useState(null); // id of item in edit mode
  const [editEduData, setEditEduData] = useState({});

  const startEditEdu = () => { pendidikanSnap.current = pendidikanList.map(e => ({ ...e })); setIsEditingEdu(true); };
  const cancelEdu = () => { setPendidikanList(pendidikanSnap.current); setAddingEdu(false); setNewEdu({ institusi: '', jenjang: '', tglMulai: '', tglSelesai: '' }); setEditingEduId(null); setIsEditingEdu(false); };
  const saveEdu = () => { setAddingEdu(false); setEditingEduId(null); setIsEditingEdu(false); };
  const removeEdu = (id) => { setPendidikanList(prev => prev.filter(e => e.id !== id)); setEduMenuOpen(null); setDeleteTarget(null); };
  const confirmEdu = () => {
    if (!newEdu.institusi.trim()) return;
    const periode = [newEdu.tglMulai, newEdu.tglSelesai].filter(Boolean).join(' – ') || '';
    setPendidikanList(prev => [...prev, { institusi: newEdu.institusi, gelar: newEdu.jenjang, periode, id: Date.now() }]);
    setNewEdu({ institusi: '', jenjang: '', tglMulai: '', tglSelesai: '' });
    setAddingEdu(false);
  };
  const startInlineEditEdu = (edu) => {
    // parse periode back to tglMulai/tglSelesai
    const parts = (edu.periode || '').split(' – ');
    setEditEduData({ institusi: edu.institusi, jenjang: edu.gelar || '', tglMulai: parts[0] || '', tglSelesai: parts[1] || '' });
    setEditingEduId(edu.id);
    setEduMenuOpen(null);
  };
  const saveInlineEditEdu = (id) => {
    const periode = [editEduData.tglMulai, editEduData.tglSelesai].filter(Boolean).join(' – ') || '';
    setPendidikanList(prev => prev.map(e => e.id === id ? { ...e, institusi: editEduData.institusi, gelar: editEduData.jenjang, periode } : e));
    setEditingEduId(null);
  };

  /* ── Detail Kandidat edit state ── */
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [detailData, setDetailData] = useState(() => ({
    nama: kandidat.nama ?? '',
    linkedin: kandidat.linkedin ?? '',
    id: kandidat.id ?? '',
    gender: (!kandidat.gender || kandidat.gender === 'N/A') ? '' : kandidat.gender,
    jurusan: kandidat.jurusan ?? '',
    universitas: kandidat.universitas ?? '',
    perusahaan: kandidat.perusahaan ?? '',
    jabatan: kandidat.jabatan ?? '',
    pengalaman: kandidat.pengalaman ?? '',
    tglLahir: kandidat.tglLahir ?? '',
    domisili: kandidat.domisili ?? '',
    email: kandidat.email ?? '',
    phone: kandidat.phone ?? '',
  }));
  const detailSnap = useRef(null);

  /* ── Informasi Tambahan edit state ── */
  const [isEditingTambahan, setIsEditingTambahan] = useState(false);
  const [tambahanData, setTambahanData] = useState(() => ({
    industri: kandidat.industri ?? '',
    tahunLulus: kandidat.tahunLulus ?? '',
    harapanUpah: kandidat.harapanUpah ?? '',
    harapanBenefit: kandidat.harapanBenefit ?? '',
  }));
  const tambahanSnap = useRef(null);
  
  /* ── Inline Add state ── */
  const [inlineAddKey, setInlineAddKey] = useState(null);
  const [inlineAddValue, setInlineAddValue] = useState('');

  /* ── Handlers ── */
  const setDetail = (k, v) => setDetailData(prev => ({ ...prev, [k]: v }));
  const setTambahan = (k, v) => setTambahanData(prev => ({ ...prev, [k]: v }));

  const startEditDetail = () => { detailSnap.current = { ...detailData }; setIsEditingDetail(true); };
  const cancelDetail = () => { setDetailData(detailSnap.current); setIsEditingDetail(false); };
  const saveDetail = () => setIsEditingDetail(false);

  const startEditTambahan = () => { tambahanSnap.current = { ...tambahanData }; setIsEditingTambahan(true); };
  const cancelTambahan = () => { setTambahanData(tambahanSnap.current); setIsEditingTambahan(false); };
  const saveTambahan = () => setIsEditingTambahan(false);

  const openPanel = (item) => setScorePanel({
    nama: kandidat.nama || item.posisi,
    skor: { level: item.fit, score: item.score },
  });

  const toggleExp = (i) => {
    const next = new Set(expandedExp);
    if (next.has(i)) next.delete(i); else next.add(i);
    setExpandedExp(next);
  };

  /* ── Render helpers ── */
  const renderDetailValue = (field, data, setFn, editing) => {
    const val = data[field.key] ?? '';

    if (field.type === 'readonly') {
      return <span className="kd-detail-value">{val}</span>;
    }

    if (!editing) {
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
            <button onClick={() => { setFn(field.key, inlineAddValue); setInlineAddKey(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Simpan">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#28a745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.8 7l2.8 2.8 5.6-5.6"/></svg>
            </button>
          </div>
        );
      }

      if ((field.type === 'add' || field.type === 'date') && !val) {
        return (
          <span className="kd-detail-add" style={{ cursor: 'pointer' }} onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}>
            Tambahkan data <AddIcon />
          </span>
        );
      }
      return (
        <span className="kd-detail-value">
          {val || (
            <span
              className="kd-detail-add"
              style={{ gap: 4, cursor: 'pointer' }}
              onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}
            >
              Tambahkan data <AddIcon />
            </span>
          )}
        </span>
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          className="sd-detail-input sd-detail-input--date"
          value={val}
          onChange={e => setFn(field.key, e.target.value)}
        />
      );
    }

    return (
      <input
        className="sd-detail-input"
        value={val}
        onChange={e => setFn(field.key, e.target.value)}
        placeholder={field.type === 'add' ? 'Tambahkan data' : field.label}
      />
    );
  };

  return (
    <div className="kd-content">
      <div className="kd-col-left">

        {/* ── Detail Kandidat ── */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Detail Kandidat</span>
            {!isEditingDetail && (
              <button className="kd-edit-btn" onClick={startEditDetail}>
                <EditIcon /> Edit
              </button>
            )}
          </div>
          <div className="kd-detail-rows">
            {DETAIL_FIELDS.map(field => (
              <div className="kd-detail-row" key={field.key}>
                <span className="kd-detail-label">{field.label}</span>
                {renderDetailValue(field, detailData, setDetail, isEditingDetail)}
              </div>
            ))}
          </div>
          {isEditingDetail && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelDetail}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveDetail}>Simpan</button>
            </div>
          )}
        </div>

        {/* ── Detail Tambahan ── */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Detail Tambahan</span>
            {!isEditingTambahan && (
              <button className="kd-edit-btn" onClick={startEditTambahan}>
                <EditIcon /> Edit
              </button>
            )}
          </div>
          <div className="kd-detail-rows">
            {TAMBAHAN_FIELDS.map(field => (
              <div className="kd-detail-row" key={field.key}>
                <span className="kd-detail-label">{field.label}</span>
                {renderDetailValue(field, tambahanData, setTambahan, isEditingTambahan)}
              </div>
            ))}
          </div>
          {isEditingTambahan && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelTambahan}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveTambahan}>Simpan</button>
            </div>
          )}
        </div>

      </div>

      <div className="kd-col-right">

        {/* Penilaian AI */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Penilaian AI</span>
          </div>
          <div className="kd-ai-list">
            {AI_SCORES.map((item) => (
              <div className="kd-ai-row kd-ai-row--hoverable" key={item.posisi}>
                <div className="kd-ai-row-left">
                  <span className="kd-ai-posisi">{item.posisi}</span>
                  <span
                    className={`kd-fit-badge ${item.fit}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openPanel(item)}
                  >
                    <span className="kd-fit-label">{item.label}</span>
                    <span className={`kd-fit-score ${item.fit}`}>{item.score}</span>
                  </span>
                </div>
                <button className="kd-detail-penilaian-btn" onClick={() => openPanel(item)}>Detail Penilaian</button>
              </div>
            ))}
          </div>
          <div className="kd-card-footer-btn">
            <button className="kd-lihat-lainnya" onClick={() => onChangeTab && onChangeTab('seleksi')}>Lihat Lainnya</button>
          </div>
        </div>

        {/* ── Keahlian ── */}
        <div className="kd-card kd-keahlian-card">
          <div className="kd-keahlian-header">
            <span className="kd-keahlian-title">KEAHLIAN</span>
            {!isEditingSkills && (
              <button className="kd-edit-btn" onClick={startEditSkills}>
                <EditIcon /> Edit
              </button>
            )}
          </div>
          <div className="kd-keahlian-body">
            <div className="kd-keahlian-tags">
              {skills.map((skill, idx) => (
                <div className="kd-skill-tag" key={idx}>
                  <span className="kd-skill-text">{skill}</span>
                  {/* × hanya muncul saat edit */}
                  {isEditingSkills && (
                    <button className="kd-skill-remove" onClick={() => removeSkill(idx)} title="Hapus">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1L7 7M7 1L1 7" stroke="#0466a6" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {/* Input + button dalam satu wrapper agar tidak terpisah baris */}
              {isEditingSkills && (
                <div className="kd-skill-input-group">
                  {addingSkill && (
                    <input
                      ref={skillInputRef}
                      className="kd-skill-inline-input"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') confirmSkill();
                        if (e.key === 'Escape') { setNewSkill(''); setAddingSkill(false); }
                      }}
                      onBlur={() => { if (!newSkill.trim()) setAddingSkill(false); }}
                      placeholder="Ketik dan tekan enter..."
                      maxLength={50}
                    />
                  )}
                  <button className="kd-skill-add-btn" onClick={() => setAddingSkill(true)} title="Tambah keahlian">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {isEditingSkills && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelSkills}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveSkills}>Simpan</button>
            </div>
          )}
        </div>

        {/* ── Pengalaman Kerja ── */}
        <div className="kd-card" onClick={() => setExpMenuOpen(null)}>
          <div className="kd-card-header">
            <span className="kd-card-label">Pengalaman Kerja</span>
            {!isEditingExp && (
              <button className="kd-edit-btn" onClick={startEditExp}><EditIcon /> Edit</button>
            )}
          </div>

          <div className="kd-edu-body">
            {/* Form tambah di ATAS */}
            {isEditingExp && addingExp && (
              <div className="kd-edu-form-card">
                <input className="kd-edu-input" placeholder="Nama Jabatan *" value={newExp.jabatan} onChange={e => setNewExp(p => ({ ...p, jabatan: e.target.value }))} />
                <div className="kd-edu-select-wrap">
                  <input className="kd-edu-input" placeholder="Nama Perusahaan *" value={newExp.perusahaan} onChange={e => setNewExp(p => ({ ...p, perusahaan: e.target.value }))} />
                  <svg className="kd-edu-select-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" />
                  </svg>
                </div>
                <div className="kd-entry-date-row">
                  <DateInputField label="Tanggal Mulai" value={newExp.tglMulai} onChange={e => setNewExp(p => ({ ...p, tglMulai: e.target.value }))} />
                  <DateInputField label="Tanggal Selesai" value={newExp.tglSelesai} onChange={e => setNewExp(p => ({ ...p, tglSelesai: e.target.value }))} />
                </div>
                <BulletInputs
                  bullets={newExp.bullets}
                  onChange={b => setNewExp(p => ({ ...p, bullets: b }))}
                />
                <div className="kd-entry-row-actions">
                  <button className="sd-edit-cancel-btn" onClick={() => { setAddingExp(false); setNewExp(EMPTY_EXP); }}>Batal</button>
                  <button className="sd-edit-save-btn" onClick={confirmExp}>Simpan</button>
                </div>
              </div>
            )}

            {/* List item pengalaman */}
            {pengalamanList.map((exp) => (
              <div key={exp.id}>
                {editingExpId === exp.id ? (
                  /* ── Inline edit form ── */
                  <div className="kd-edu-form-card">
                    <input className="kd-edu-input" placeholder="Nama Jabatan *" value={editExpData.jabatan} onChange={e => setEditExpData(p => ({ ...p, jabatan: e.target.value }))} />
                    <div className="kd-edu-select-wrap">
                      <input className="kd-edu-input" placeholder="Nama Perusahaan *" value={editExpData.perusahaan} onChange={e => setEditExpData(p => ({ ...p, perusahaan: e.target.value }))} />
                      <svg className="kd-edu-select-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 5.25L7 8.75L10.5 5.25" />
                      </svg>
                    </div>
                    <div className="kd-entry-date-row">
                      <DateInputField label="Tanggal Mulai" value={editExpData.tglMulai} onChange={e => setEditExpData(p => ({ ...p, tglMulai: e.target.value }))} />
                      <DateInputField label="Tanggal Selesai" value={editExpData.tglSelesai} onChange={e => setEditExpData(p => ({ ...p, tglSelesai: e.target.value }))} />
                    </div>
                    <BulletInputs
                      bullets={editExpData.bullets || ['']}
                      onChange={b => setEditExpData(p => ({ ...p, bullets: b }))}
                    />
                    <div className="kd-entry-row-actions">
                      <button className="sd-edit-cancel-btn" onClick={() => setEditingExpId(null)}>Batal</button>
                      <button className="sd-edit-save-btn" onClick={() => saveInlineEditExp(exp.id)}>Simpan</button>
                    </div>
                  </div>
                ) : (
                  /* ── Display item ── */
                  <div className="kd-edu-item kd-exp-item">
                    <div className="kd-edu-item-content">
                      <span className="kd-edu-item-name">{exp.jabatan}</span>
                      <span className="kd-edu-item-sub">{exp.perusahaan}</span>
                      <span className="kd-edu-item-sub">{exp.periode}</span>
                      {/* Description */}
                      {(exp.deskripsiHtml || exp.deskripsi?.[0]) && (
                        <div className="kd-exp-desc-display">
                          <div
                            className={`kd-exp-desc-text${expandedExp.has(exp.id) ? '' : ' kd-exp-desc-collapsed'}`}
                            dangerouslySetInnerHTML={{ __html: exp.deskripsiHtml || exp.deskripsi?.join('<br/>') || '' }}
                          />
                          <button className="kd-read-more" onClick={(e) => { e.stopPropagation(); toggleExp(exp.id); }}>
                            {expandedExp.has(exp.id) ? 'Lihat Lebih Sedikit' : 'Lihat Lebih Banyak'}
                          </button>
                        </div>
                      )}
                    </div>
                    {/* 3-dot menu */}
                    <div className="kd-three-dot-wrap" onClick={e => e.stopPropagation()}>
                      <button className="kd-three-dot-btn" onClick={() => setExpMenuOpen(prev => prev === exp.id ? null : exp.id)}>
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                          <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                        </svg>
                      </button>
                      {expMenuOpen === exp.id && (
                        <div className="kd-three-dot-menu">
                          <button className="kd-menu-item" onClick={() => startInlineEditExp(exp)}>
                            <EditIcon /> Edit
                          </button>
                          <button className="kd-menu-item kd-menu-item--danger" onClick={() => setDeleteTarget({ type: 'exp', id: exp.id })}>
                            <TrashIcon /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Tombol tambah */}
            {isEditingExp && !addingExp && (
              <button className="kd-add-entry-btn" onClick={() => setAddingExp(true)}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Tambah Pengalaman
              </button>
            )}
          </div>

          {isEditingExp && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelExp}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveExp}>Simpan</button>
            </div>
          )}
        </div>

        {/* Pendidikan */}
        {/* ── Pendidikan ── */}
        <div className="kd-card" onClick={() => setEduMenuOpen(null)}>
          <div className="kd-card-header">
            <span className="kd-card-label">Pendidikan</span>
            {!isEditingEdu && (
              <button className="kd-edit-btn" onClick={startEditEdu}><EditIcon /> Edit</button>
            )}
          </div>

          <div className="kd-edu-body">
            {/* Form tambah di ATAS — sesuai Figma */}
            {isEditingEdu && addingEdu && (
              <div className="kd-edu-form-card">
                <input className="kd-edu-input" placeholder="Nama Institusi *" value={newEdu.institusi} onChange={e => setNewEdu(p => ({ ...p, institusi: e.target.value }))} />
                <div className="kd-edu-select-wrap">
                  <input className="kd-edu-input" placeholder="Jenjang / Gelar *" value={newEdu.jenjang} onChange={e => setNewEdu(p => ({ ...p, jenjang: e.target.value }))} />
                  <svg className="kd-edu-select-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" />
                  </svg>
                </div>
                <div className="kd-entry-date-row">
                  <DateInputField label="Tanggal Masuk" value={newEdu.tglMulai} onChange={e => setNewEdu(p => ({ ...p, tglMulai: e.target.value }))} />
                  <DateInputField label="Tanggal Lulus" value={newEdu.tglSelesai} onChange={e => setNewEdu(p => ({ ...p, tglSelesai: e.target.value }))} />
                </div>
                <div className="kd-entry-row-actions">
                  <button className="sd-edit-cancel-btn" onClick={() => { setAddingEdu(false); setNewEdu({ institusi: '', jenjang: '', tglMulai: '', tglSelesai: '' }); }}>Batal</button>
                  <button className="sd-edit-save-btn" onClick={confirmEdu}>Simpan</button>
                </div>
              </div>
            )}

            {/* List item pendidikan */}
            {pendidikanList.map((edu) => (
              <div key={edu.id}>
                {editingEduId === edu.id ? (
                  /* ── Inline edit form ── */
                  <div className="kd-edu-form-card">
                    <input className="kd-edu-input" placeholder="Nama Institusi *" value={editEduData.institusi} onChange={e => setEditEduData(p => ({ ...p, institusi: e.target.value }))} />
                    <div className="kd-edu-select-wrap">
                      <input className="kd-edu-input" placeholder="Jenjang / Gelar *" value={editEduData.jenjang} onChange={e => setEditEduData(p => ({ ...p, jenjang: e.target.value }))} />
                      <svg className="kd-edu-select-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 5.25L7 8.75L10.5 5.25" />
                      </svg>
                    </div>
                    <div className="kd-entry-date-row">
                      <DateInputField label="Tanggal Masuk" value={editEduData.tglMulai} onChange={e => setEditEduData(p => ({ ...p, tglMulai: e.target.value }))} />
                      <DateInputField label="Tanggal Lulus" value={editEduData.tglSelesai} onChange={e => setEditEduData(p => ({ ...p, tglSelesai: e.target.value }))} />
                    </div>
                    <div className="kd-entry-row-actions">
                      <button className="sd-edit-cancel-btn" onClick={() => setEditingEduId(null)}>Batal</button>
                      <button className="sd-edit-save-btn" onClick={() => saveInlineEditEdu(edu.id)}>Simpan</button>
                    </div>
                  </div>
                ) : (
                  /* ── Display item ── */
                  <div className="kd-edu-item">
                    <div className="kd-edu-item-content">
                      <span className="kd-edu-item-name">{edu.institusi}</span>
                      <span className="kd-edu-item-sub">{edu.gelar}</span>
                      <span className="kd-edu-item-sub">{edu.periode}</span>
                    </div>
                    {/* 3-dot menu — selalu tampil (bukan hanya saat edit) */}
                    <div className="kd-three-dot-wrap" onClick={e => e.stopPropagation()}>
                      <button className="kd-three-dot-btn" onClick={() => setEduMenuOpen(prev => prev === edu.id ? null : edu.id)}>
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                          <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                        </svg>
                      </button>
                      {eduMenuOpen === edu.id && (
                        <div className="kd-three-dot-menu">
                          <button className="kd-menu-item" onClick={() => startInlineEditEdu(edu)}>
                            <EditIcon /> Edit
                          </button>
                          <button className="kd-menu-item kd-menu-item--danger" onClick={() => setDeleteTarget({ type: 'edu', id: edu.id })}>
                            <TrashIcon /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Tombol tambah */}
            {isEditingEdu && !addingEdu && (
              <button className="kd-add-entry-btn" onClick={() => setAddingEdu(true)}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Tambah Pendidikan
              </button>
            )}
          </div>

          {isEditingEdu && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelEdu}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveEdu}>Simpan</button>
            </div>
          )}
        </div>

      </div>
      {scorePanel && <KandidatPenilaian kandidat={scorePanel} onClose={() => setScorePanel(null)} />}

      {deleteTarget !== null && (
        <PopupKonfirmasi
          title={`Hapus ${deleteTarget.type === 'exp' ? 'Pengalaman Kerja' : 'Pendidikan'}`}
          body="Apakah Anda yakin ingin menghapus data ini?"
          confirmLabel="Hapus"
          onConfirm={() => {
            const label = deleteTarget.type === 'exp' ? 'Pengalaman Kerja' : 'Pendidikan';
            if (deleteTarget.type === 'exp') removeExp(deleteTarget.id);
            if (deleteTarget.type === 'edu') removeEdu(deleteTarget.id);
            setDeleteTarget(null);
            showToast(`${label} berhasil dihapus`, 'Data telah dihapus secara permanen');
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
