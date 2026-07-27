import { useState, useRef, useEffect } from 'react';
import InlineEditRow from '../../components/InlineEditRow.jsx';
import { ID_REGIONS } from '../../utils/idRegions.js';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import Toast from '../../components/Toast.jsx';
import { updateKandidat as updateKandidatRaw } from '../../services/kandidatService.js';
import { getScoringByKandidat } from '../../services/scoringService.js';
import { invalidate } from '../../services/dataCache.js';

// Setiap perubahan detail kandidat di sini mempengaruhi list di halaman Kandidat,
// jadi cache-nya diinvalidasi otomatis lewat wrapper ini alih-alih di tiap call site.
const updateKandidat = async (id, updates) => {
  const result = await updateKandidatRaw(id, updates);
  invalidate('kandidat');
  return result;
};

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M1.5 7.5h15" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M6 1.5v3M12 1.5v3" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const BulletInputs = ({ bullets, onChange, placeholder = "Tulis tanggung jawab atau pencapaian..." }) => (
  <div className="kd001-bullets-wrap">
    {bullets.map((b, i) => (
      <div className="kd001-bullet-row" key={i}>
        <span className="kd001-bullet-dot">•</span>
        <input
          className="kd001-edu-input kd001-bullet-input"
          value={b}
          onChange={e => onChange(setBulletStatic(bullets, i, e.target.value))}
          placeholder={placeholder}
        />
        {bullets.length > 1 && (
          <button type="button" className="kd001-bullet-remove" onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#abb2c1" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        )}
      </div>
    ))}
    <button type="button" className="kd001-bullet-add" onClick={() => onChange([...bullets, ''])}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 1v8M1 5h8" stroke="var(--luna-orange-500)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Tambah poin
    </button>
  </div>
);
function setBulletStatic(arr, i, val) { const n = [...arr]; n[i] = val; return n; }

const DateInputField = ({ value, onChange, label }) => (
  <div className="kd001-date-field">
    <input type="date" className="kd001-date-native" value={value} onChange={onChange} />
    <div className="kd001-date-display">
      <span className={value ? 'kd001-date-val' : 'kd001-date-hint'}>{value || label}</span>
      <CalendarIcon />
    </div>
  </div>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h10M4.5 1.5h3M2 3l.6 7.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8L10 3" />
    <line x1="4.5" y1="5.5" x2="4.5" y2="9" /><line x1="7.5" y1="5.5" x2="7.5" y2="9" />
  </svg>
);

const KATEGORI_FIT_MAP = {
  'Sangat Fit': { fit: 'high', label: 'Tinggi' },
  'Fit': { fit: 'high', label: 'Tinggi' },
  'Cukup Fit': { fit: 'moderate', label: 'Sedang' },
  'Kurang Fit': { fit: 'low', label: 'Rendah' },
};

function scoreLevelFromValue(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 20) return 'low';
  return 'none';
}

function mapScoringToPanel(scoring, kandidatNama) {
  const { fit, label } = KATEGORI_FIT_MAP[scoring.kategori_fit] || { fit: 'low', label: scoring.kategori_fit };

  const aiOutput = scoring.detail_kriteria || [];
  const getAiMatch = (rawTag) => {
    if (!rawTag || aiOutput.length === 0) return null;
    const normTag = rawTag.toLowerCase().trim();
    let match = aiOutput.find(ai => ai.tag && ai.tag.toLowerCase().trim() === normTag);
    if (!match) {
      match = aiOutput.find(ai => {
        if (!ai.tag) return false;
        const t = ai.tag.toLowerCase().trim();
        return t.includes(normTag) || normTag.includes(t);
      });
    }
    return match;
  };

  const toItemFromRaw = rawKrit => {
    const aiMatch = getAiMatch(rawKrit.tag);
    const scoreVal = aiMatch ? (aiMatch.score_evaluate ?? 0) : 0;
    return {
      level: scoreLevelFromValue(scoreVal),
      name: rawKrit.tag || 'Kriteria',
      desc: aiMatch ? (aiMatch.evidence || 'Tidak ada analisis dari AI.') : 'Analisis AI tidak tersedia untuk kriteria ini.',
      req: rawKrit.teks || '',
      bobot: rawKrit.kategori === 'Wajib' ? 'tinggi' : 'rendah',
      score: scoreVal,
    };
  };

  const rawKriteriaList = scoring.raw_kriteria || [];
  const criteriaData = rawKriteriaList.filter(k => k.kategori === 'Wajib').map(toItemFromRaw);
  const prefData = rawKriteriaList.filter(k => k.kategori !== 'Wajib').map(toItemFromRaw);

  return {
    id: scoring.id,
    posisi: scoring.seleksi?.jabatan || '-',
    departemen: scoring.seleksi?.departments?.name || '',
    fit,
    label,
    score: scoring.total_score ?? 0,
    panelData: {
      scoringId: scoring.id,
      kandidatId: scoring.kandidat_id,
      seleksiId: scoring.seleksi_id,
      alur: scoring.alur_proses ?? 1,
      nama: kandidatNama,
      jabatan: scoring.seleksi?.jabatan || '-',
      jabatanDilamar: scoring.seleksi?.jabatan || '-',
      departemen: scoring.seleksi?.departments?.name || '',
      alasan: scoring.alasan_tidak_sesuai || '',
      detail: scoring.alasan_tidak_sesuai_detail || '',
      skor: {
        level: fit,
        score: scoring.total_score ?? 0,
        aiSummary: scoring.ai_summary || '',
        criteriaData,
        prefData,
      },
    },
  };
}

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

const DETAIL_FIELDS = [
  { key: 'nama', label: 'Nama Lengkap', type: 'text', dbCol: 'nama_lengkap' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'text', dbCol: 'linkedin_url' },
  { key: 'portfolio_url', label: 'Portofolio', type: 'text', dbCol: 'portfolio_url' },
  { key: 'id', label: 'ID Kandidat', type: 'readonly' },
  { key: 'gender', label: 'Gender', type: 'dropdown', dbCol: 'gender', options: GENDER_OPTIONS },
  { key: 'jurusan', label: 'Jurusan', type: 'text', dbCol: 'jurusan' },
  { key: 'universitas', label: 'Universitas', type: 'text', dbCol: 'universitas' },
  { key: 'perusahaan', label: 'Perusahaan Saat Ini', type: 'text', dbCol: 'perusahaan_saat_ini' },
  { key: 'jabatan', label: 'Jabatan Saat Ini', type: 'text', dbCol: 'jabatan_saat_ini' },
  { key: 'pengalaman', label: 'Pengalaman Kerja (Tahun)', type: 'number', dbCol: 'pengalaman_tahun' },
  { key: 'tglLahir', label: 'Tanggal Lahir', type: 'date', dbCol: 'tgl_lahir' },
  { key: 'domisili', label: 'Domisili', type: 'text', dbCol: 'domisili' },
  { key: 'email', label: 'Email', type: 'text', dbCol: 'email' },
  { key: 'phone', label: 'No. Telpon', type: 'tel', dbCol: 'phone' },
];

const TAMBAHAN_FIELDS = [
  { key: 'industri', label: 'Bidang Industri', type: 'text', dbCol: 'industri' },
  { key: 'tahun_terakhir_bekerja', label: 'Tahun Terakhir Bekerja', type: 'number', dbCol: 'tahun_terakhir_bekerja' },
  { key: 'harapanUpah', label: 'Harapan Upah', type: 'text', dbCol: 'harapan_upah', format: 'rupiah' },
  { key: 'harapanBenefit', label: 'Harapan Benefit', type: 'text', dbCol: 'harapan_benefit' },
];

const fmtRupiah = (num) => {
  const n = parseInt(String(num).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? '' : 'Rp ' + n.toLocaleString('id-ID');
};

/* ── Domisili autocomplete ── */
function DomisiliInlineRow({ label, value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    const handler = (e) => {
      const inContainer = containerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inContainer && !inDropdown) { setIsEditing(false); setSuggestions([]); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing]);

  const handleChange = (query) => {
    setTempValue(query);
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const results = ID_REGIONS
      .filter(r => r.name.toLowerCase().includes(q))
      .slice(0, 8);
    setSuggestions(results);
  };

  const handleSelect = async (s) => {
    const val = s.type === 'city' && s.province ? `${s.name}, ${s.province}` : s.name;
    setSuggestions([]);
    setTempValue(val);
    setIsSaving(true);
    try { await onSave(val); setIsEditing(false); }
    finally { setIsSaving(false); }
  };

  const handleSave = async () => {
    setSuggestions([]);
    setIsSaving(true);
    try { await onSave(tempValue); setIsEditing(false); }
    finally { setIsSaving(false); }
  };

  if (!isEditing) {
    return (
      <div className="inline-edit-row" ref={containerRef}>
        <div className="inline-edit-label">{label}</div>
        <span
          className={`inline-edit-value ${value ? 'editable' : 'add-data'}`}
          style={{ width: '285px' }}
          onClick={() => { setTempValue(value || ''); setIsEditing(true); }}
          title={value ? 'Klik untuk mengedit' : undefined}
        >
          {value ? (
            <><span className="inline-edit-text">{value}</span>
              <svg className="inline-edit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg></>
          ) : (
            <>Tambahkan data
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="8.5" cy="8.5" r="7.5" stroke="var(--luna-orange-500)" strokeWidth="1" />
                <path d="M8.5 5.5v6M5.5 8.5h6" stroke="var(--luna-orange-500)" strokeWidth="1.2" strokeLinecap="round" />
              </svg></>
          )}
        </span>
      </div>
    );
  }

  const showDropdown = isEditing && tempValue.trim().length >= 1;
  const inputRect = showDropdown && inputRef.current ? inputRef.current.getBoundingClientRect() : null;

  return (
    <div className="inline-edit-row" ref={containerRef}>
      <div className="inline-edit-label">{label}</div>
      <div className="inline-edit-input-group" style={{ width: '285px', flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          className="inline-edit-input"
          style={{ flex: 1, minWidth: 0, height: '32px', margin: 0 }}
          value={tempValue}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
            if (e.key === 'Escape') { setIsEditing(false); setSuggestions([]); }
          }}
          placeholder="Ketik nama kota atau provinsi..."
          autoFocus
          disabled={isSaving}
        />
        <button className="inline-action-btn cancel" onClick={() => { setIsEditing(false); setSuggestions([]); }} title="Batal" disabled={isSaving}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 10.5L10.5 3.5M3.5 3.5l7 7" />
          </svg>
        </button>
        <button className="inline-action-btn save" onClick={handleSave} title="Simpan" disabled={isSaving}>
          {isSaving
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.8 7l2.8 2.8 5.6-5.6" /></svg>
          }
        </button>
      </div>

      {/* Dropdown fixed — selalu tampil saat ada query, tidak terpotong overflow */}
      {showDropdown && inputRect && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: inputRect.bottom + 4,
            left: inputRect.left,
            width: inputRect.width,
            background: '#fff',
            border: '1px solid #d4d9e6',
            borderRadius: 8,
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 13, color: '#abb2c1' }}>
              Tidak ada kota/daerah ditemukan
            </div>
          ) : (
            suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                  color: '#323b4d', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 8,
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f0f2f5' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f4fafe'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{s.name}{s.province ? `, ${s.province}` : ''}</span>
                <span style={{ fontSize: 10, color: '#abb2c1', flexShrink: 0 }}>
                  {s.type === 'city' ? 'Kota/Kab' : 'Provinsi'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Deteksi overflow line-clamp ──
   clientHeight elemen ber-`-webkit-line-clamp` tidak konsisten di semua
   browser (kadang ikut melaporkan tinggi penuh, bukan cuma tinggi ter-clamp),
   jadi scrollHeight-vs-clientHeight bisa salah baca. Sebagai gantinya
   bandingkan scrollHeight terhadap ambang batas independen: line-height × 3. */
function isClampOverflowing(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  let lineHeight = parseFloat(style.lineHeight);
  if (!lineHeight || Number.isNaN(lineHeight)) lineHeight = (parseFloat(style.fontSize) || 12) * 1.5;
  const maxCollapsedHeight = lineHeight * 3 + 2;
  return el.scrollHeight > maxCollapsedHeight;
}

/* ── DB format converters ── */
const toDbExp = e => { const p = (e.periode || '').split(' – '); return { jabatan: e.jabatan, perusahaan: e.perusahaan, start: p[0] || '', end: p[1] || '', deskripsi: e.deskripsi || [] }; };
const toDbEdu = e => { const p = (e.periode || '').split(' – '); return { institusi: e.institusi, jenjang: e.gelar || '', jurusan: e.jurusan || '', gpa: e.gpa || '', start: p[0] || '', end: p[1] || '' }; };
const toDbSert = s => { const p = (s.periode || '').split(' – '); return { nama: s.judul, penerbit: s.penyelenggara, start: p[0] || '', end: p[1] || '', deskripsi: s.deskripsi || [] }; };

export default function KandidatRingkasan_001({ kandidat = {}, onChangeTab, hideAIPanel = false, scoringVersion = 0, onAddPosisi }) {
  const [expandedExp, setExpandedExp] = useState(new Set());
  const [scorePanel, setScorePanel] = useState(null);
  const [aiScores, setAiScores] = useState([]);

  useEffect(() => {
    if (!kandidat.id || hideAIPanel) return;
    getScoringByKandidat(kandidat.id)
      .then(data => setAiScores((data || []).map(s => mapScoringToPanel(s, kandidat.nama_lengkap || kandidat.nama || ''))))
      .catch(() => { });
  }, [kandidat.id, scoringVersion]);

  /* ── Keahlian ── */
  const [skills, setSkills] = useState(() => kandidat.skills || []);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillIdx, setEditingSkillIdx] = useState(null);
  const [editingSkillVal, setEditingSkillVal] = useState('');
  const skillInputRef = useRef(null);

  useEffect(() => { if (addingSkill) skillInputRef.current?.focus(); }, [addingSkill]);

  const saveSkillsToDb = async (newList) => {
    if (!kandidat.id) return;
    try {
      await updateKandidat(kandidat.id, { skills: newList });
      showToast('Keahlian tersimpan', 'Data keahlian berhasil diperbarui');
    } catch {
      showToast('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan keahlian');
    }
  };

  const confirmSkill = async () => {
    const t = newSkill.trim();
    if (!t || skills.includes(t)) { setNewSkill(''); setAddingSkill(false); return; }
    const newList = [...skills, t];
    setSkills(newList);
    setNewSkill(''); setAddingSkill(false);
    await saveSkillsToDb(newList);
  };
  const saveSkillEdit = async (idx) => {
    const t = editingSkillVal.trim();
    if (!t) { setEditingSkillIdx(null); return; }
    const newList = skills.map((s, i) => i === idx ? t : s);
    setSkills(newList);
    setEditingSkillIdx(null);
    await saveSkillsToDb(newList);
  };
  const removeSkill = async (idx) => {
    const newList = skills.filter((_, i) => i !== idx);
    setSkills(newList);
    setDeleteTarget(null);
    await saveSkillsToDb(newList);
  };

  /* ── Pengalaman Kerja ── */
  const [pengalamanList, setPengalamanList] = useState(() => {
    const arr = (kandidat.pengalaman_kerja?.length > 0)
      ? kandidat.pengalaman_kerja.map(e => ({
        jabatan: e.jabatan || '', perusahaan: e.perusahaan || '',
        periode: [e.start, e.end].filter(Boolean).join(' – ') || '',
        deskripsi: e.deskripsi || [],
      }))
      : [];
    return arr.map((e, i) => ({ ...e, id: i }));
  });
  const EMPTY_EXP = { jabatan: '', perusahaan: '', tglMulai: '', tglSelesai: '', bullets: [''] };
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState(EMPTY_EXP);
  const [expMenuOpen, setExpMenuOpen] = useState(null);
  const [editingExpId, setEditingExpId] = useState(null);
  const [editExpData, setEditExpData] = useState({});

  const saveExpToDb = async (list) => {
    if (!kandidat.id) return;
    try {
      await updateKandidat(kandidat.id, { pengalaman_kerja: list.map(toDbExp) });
    } catch {
      showToast('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan pengalaman');
    }
  };
  const confirmExp = async () => {
    if (!newExp.jabatan.trim()) return;
    const periode = [newExp.tglMulai, newExp.tglSelesai].filter(Boolean).join(' – ') || '';
    const newEntry = { jabatan: newExp.jabatan, perusahaan: newExp.perusahaan, periode, deskripsi: newExp.bullets.filter(b => b.trim()), id: Date.now() };
    const newList = [...pengalamanList, newEntry];
    setPengalamanList(newList);
    setNewExp(EMPTY_EXP); setAddingExp(false);
    await saveExpToDb(newList);
    showToast('Pengalaman tersimpan', 'Data pengalaman kerja berhasil ditambahkan');
  };
  const startInlineEditExp = (exp) => {
    const parts = (exp.periode || '').split(' – ');
    setEditExpData({ jabatan: exp.jabatan, perusahaan: exp.perusahaan, tglMulai: parts[0] || '', tglSelesai: parts[1] || '', bullets: exp.deskripsi?.length ? [...exp.deskripsi] : [''] });
    setEditingExpId(exp.id); setExpMenuOpen(null);
  };
  const saveInlineEditExp = async (id) => {
    const periode = [editExpData.tglMulai, editExpData.tglSelesai].filter(Boolean).join(' – ') || '';
    const newList = pengalamanList.map(e => e.id === id ? { ...e, jabatan: editExpData.jabatan, perusahaan: editExpData.perusahaan, periode, deskripsi: editExpData.bullets.filter(b => b.trim()) } : e);
    setPengalamanList(newList);
    setEditingExpId(null);
    await saveExpToDb(newList);
    showToast('Pengalaman tersimpan', 'Data pengalaman kerja berhasil diperbarui');
  };
  const removeExp = async (id) => {
    const newList = pengalamanList.filter(e => e.id !== id);
    setPengalamanList(newList);
    setExpMenuOpen(null); setDeleteTarget(null);
    await saveExpToDb(newList);
    showToast('Pengalaman dihapus', 'Data pengalaman kerja berhasil dihapus');
  };

  /* ── Pendidikan ── */
  const [pendidikanList, setPendidikanList] = useState(() => {
    const arr = (kandidat.pendidikan?.length > 0)
      ? kandidat.pendidikan.map(e => ({ institusi: e.institusi || '', gelar: e.jenjang || '', jurusan: e.jurusan || '', gpa: e.gpa || '', periode: [e.start, e.end].filter(Boolean).join(' – ') || '' }))
      : [];
    return arr.map((e, i) => ({ ...e, id: i }));
  });
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ institusi: '', jenjang: '', jurusan: '', gpa: '', tglMulai: '', tglSelesai: '' });
  const [eduMenuOpen, setEduMenuOpen] = useState(null);
  const [editingEduId, setEditingEduId] = useState(null);
  const [editEduData, setEditEduData] = useState({});

  const saveEduToDb = async (list) => {
    if (!kandidat.id) return;
    try {
      await updateKandidat(kandidat.id, { pendidikan: list.map(toDbEdu) });
    } catch {
      showToast('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan pendidikan');
    }
  };
  const confirmEdu = async () => {
    if (!newEdu.institusi.trim()) return;
    const periode = [newEdu.tglMulai, newEdu.tglSelesai].filter(Boolean).join(' – ') || '';
    const newEntry = { institusi: newEdu.institusi, gelar: newEdu.jenjang, jurusan: newEdu.jurusan, gpa: newEdu.gpa, periode, id: Date.now() };
    const newList = [...pendidikanList, newEntry];
    setPendidikanList(newList);
    setNewEdu({ institusi: '', jenjang: '', jurusan: '', gpa: '', tglMulai: '', tglSelesai: '' }); setAddingEdu(false);
    await saveEduToDb(newList);
    showToast('Pendidikan tersimpan', 'Data riwayat pendidikan berhasil ditambahkan');
  };
  const startInlineEditEdu = (edu) => {
    const parts = (edu.periode || '').split(' – ');
    setEditEduData({ institusi: edu.institusi, jenjang: edu.gelar, jurusan: edu.jurusan || '', gpa: edu.gpa || '', tglMulai: parts[0] || '', tglSelesai: parts[1] || '' });
    setEditingEduId(edu.id); setEduMenuOpen(null);
  };
  const saveInlineEditEdu = async (id) => {
    const periode = [editEduData.tglMulai, editEduData.tglSelesai].filter(Boolean).join(' – ') || '';
    const newList = pendidikanList.map(e => e.id === id ? { ...e, institusi: editEduData.institusi, gelar: editEduData.jenjang, jurusan: editEduData.jurusan, gpa: editEduData.gpa, periode } : e);
    setPendidikanList(newList);
    setEditingEduId(null);
    await saveEduToDb(newList);
    showToast('Pendidikan tersimpan', 'Data riwayat pendidikan berhasil diperbarui');
  };
  const removeEdu = async (id) => {
    const newList = pendidikanList.filter(e => e.id !== id);
    setPendidikanList(newList);
    setEduMenuOpen(null); setDeleteTarget(null);
    await saveEduToDb(newList);
    showToast('Pendidikan dihapus', 'Data riwayat pendidikan berhasil dihapus');
  };

  /* ── Sertifikasi ── */
  const EMPTY_SERT = { judul: '', penyelenggara: '', tglMulai: '', tglSelesai: '', bullets: [''] };
  const [sertifikasiList, setSertifikasiList] = useState(() => {
    const arr = (kandidat.sertifikasi?.length > 0)
      ? kandidat.sertifikasi.map(s => ({ judul: s.nama || '', penyelenggara: s.penerbit || '', periode: [s.start, s.end].filter(Boolean).join(' – ') || '', deskripsi: s.deskripsi || [] }))
      : [];
    return arr.map((s, i) => ({ ...s, id: i }));
  });
  const [addingSert, setAddingSert] = useState(false);
  const [newSert, setNewSert] = useState(EMPTY_SERT);
  const [sertMenuOpen, setSertMenuOpen] = useState(null);
  const [editingSertId, setEditingSertId] = useState(null);
  const [editSertData, setEditSertData] = useState({});
  const [expandedSert, setExpandedSert] = useState(new Set());

  const saveSertToDb = async (list) => {
    if (!kandidat.id) return;
    try {
      await updateKandidat(kandidat.id, { sertifikasi: list.map(toDbSert) });
    } catch {
      showToast('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan sertifikasi');
    }
  };
  const confirmSert = async () => {
    if (!newSert.judul.trim()) return;
    const periode = [newSert.tglMulai, newSert.tglSelesai].filter(Boolean).join(' – ') || '';
    const newEntry = { judul: newSert.judul, penyelenggara: newSert.penyelenggara, periode, deskripsi: newSert.bullets.filter(b => b.trim()), id: Date.now() };
    const newList = [...sertifikasiList, newEntry];
    setSertifikasiList(newList);
    setNewSert(EMPTY_SERT); setAddingSert(false);
    await saveSertToDb(newList);
    showToast('Sertifikasi tersimpan', 'Data sertifikasi berhasil ditambahkan');
  };
  const startInlineEditSert = (sert) => {
    const parts = (sert.periode || '').split(' – ');
    setEditSertData({ judul: sert.judul, penyelenggara: sert.penyelenggara, tglMulai: parts[0] || '', tglSelesai: parts[1] || '', bullets: sert.deskripsi?.length ? [...sert.deskripsi] : [''] });
    setEditingSertId(sert.id); setSertMenuOpen(null);
  };
  const saveInlineEditSert = async (id) => {
    const periode = [editSertData.tglMulai, editSertData.tglSelesai].filter(Boolean).join(' – ') || '';
    const newList = sertifikasiList.map(s => s.id === id ? { ...s, judul: editSertData.judul, penyelenggara: editSertData.penyelenggara, periode, deskripsi: editSertData.bullets.filter(b => b.trim()) } : s);
    setSertifikasiList(newList);
    setEditingSertId(null);
    await saveSertToDb(newList);
    showToast('Sertifikasi tersimpan', 'Data sertifikasi berhasil diperbarui');
  };
  const removeSert = async (id) => {
    const newList = sertifikasiList.filter(s => s.id !== id);
    setSertifikasiList(newList);
    setSertMenuOpen(null); setDeleteTarget(null);
    await saveSertToDb(newList);
    showToast('Sertifikasi dihapus', 'Data sertifikasi berhasil dihapus');
  };
  const toggleSert = (i) => {
    const next = new Set(expandedSert);
    if (next.has(i)) next.delete(i); else next.add(i);
    setExpandedSert(next);
  };

  // Tombol "Lihat Lebih Banyak" cuma muncul kalau teks deskripsi beneran
  // kepotong sama line-clamp:3 — bukan asal ada deskripsi.
  const sertDescRefs = useRef({});
  const [overflowingSert, setOverflowingSert] = useState(new Set());
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOverflowingSert(prev => {
        const next = new Set(prev);
        Object.entries(sertDescRefs.current).forEach(([id, el]) => {
          if (!el) return;
          const numId = Number(id);
          if (expandedSert.has(numId)) return; // sudah expanded, biarkan status lama
          if (isClampOverflowing(el)) next.add(numId);
          else next.delete(numId);
        });
        return next;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [sertifikasiList]);

  /* ── Detail Kandidat ── */
  const [detailData, setDetailData] = useState(() => ({
    nama: kandidat.nama_lengkap ?? kandidat.nama ?? '',
    linkedin_url: kandidat.linkedin_url ?? kandidat.linkedin ?? '',
    portfolio_url: kandidat.portfolio_url ?? '',
    id: kandidat.id ?? '',
    gender: (!kandidat.gender || kandidat.gender === 'N/A') ? '' : kandidat.gender,
    jurusan: kandidat.jurusan ?? '',
    universitas: kandidat.universitas ?? '',
    perusahaan: kandidat.perusahaan_saat_ini ?? kandidat.perusahaan ?? '',
    jabatan: kandidat.jabatan_saat_ini ?? kandidat.jabatan ?? '',
    pengalaman: kandidat.pengalaman_tahun ?? kandidat.pengalaman ?? '',
    tglLahir: kandidat.tgl_lahir ?? kandidat.tglLahir ?? '',
    domisili: kandidat.domisili ?? '',
    email: kandidat.email ?? '',
    phone: kandidat.phone ?? '',
  }));

  /* ── Detail Tambahan ── */
  const [tambahanData, setTambahanData] = useState(() => ({
    industri: kandidat.industri ?? '',
    tahun_terakhir_bekerja: kandidat.tahun_terakhir_bekerja ?? '',
    harapanUpah: kandidat.harapan_upah ?? kandidat.harapanUpah ?? '',
    harapanBenefit: kandidat.harapan_benefit ?? kandidat.harapanBenefit ?? '',
  }));

  const setDetail = (k, v) => setDetailData(prev => ({ ...prev, [k]: v }));
  const setTambahan = (k, v) => setTambahanData(prev => ({ ...prev, [k]: v }));

  /* ── Shared ── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const openPanel = (item) => setScorePanel(item.panelData);
  const toggleExp = (i) => {
    const next = new Set(expandedExp);
    if (next.has(i)) next.delete(i); else next.add(i);
    setExpandedExp(next);
  };

  const expDescRefs = useRef({});
  const [overflowingExp, setOverflowingExp] = useState(new Set());
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOverflowingExp(prev => {
        const next = new Set(prev);
        Object.entries(expDescRefs.current).forEach(([id, el]) => {
          if (!el) return;
          const numId = Number(id);
          if (expandedExp.has(numId)) return;
          if (isClampOverflowing(el)) next.add(numId);
          else next.delete(numId);
        });
        return next;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pengalamanList]);

  /* ══════════════════════════════ JSX ══════════════════════════════ */
  return (
    <div className="kd001-content">
      <div className="kd001-col-left">

        {/* ── Detail Kandidat ── */}
        <div className="kd001-card">
          <div className="kd001-card-header">
            <span className="kd001-card-label">Detail Kandidat</span>
          </div>
          <div className="kd001-detail-rows">
            {DETAIL_FIELDS.map(field => {
              if (field.type === 'readonly') {
                return (
                  <div className="inline-edit-row" key={field.key}>
                    <span className="inline-edit-label">{field.label}</span>
                    <span className="inline-edit-value editable" style={{ width: '285px', cursor: 'default' }}>
                      <span className="inline-edit-text">{detailData[field.key] ?? ''}</span>
                    </span>
                  </div>
                );
              }
              if (field.key === 'domisili') {
                return (
                  <DomisiliInlineRow
                    key="domisili"
                    label={field.label}
                    value={detailData.domisili ?? ''}
                    onSave={async v => {
                      setDetail('domisili', v);
                      if (kandidat.id) {
                        await updateKandidat(kandidat.id, { domisili: v });
                        showToast('Perubahan tersimpan', 'Domisili berhasil diperbarui');
                      }
                    }}
                  />
                );
              }

              return (
                <InlineEditRow
                  key={field.key}
                  label={field.label}
                  value={detailData[field.key] ?? ''}
                  displayValue={field.key === 'pengalaman' && detailData[field.key] ? `${detailData[field.key]} Tahun` : undefined}
                  type={field.type}
                  options={field.options}
                  onSave={async v => {
                    setDetail(field.key, v);
                    if (field.dbCol && kandidat.id) {
                      await updateKandidat(kandidat.id, { [field.dbCol]: v });
                      showToast('Perubahan tersimpan', `${field.label} berhasil diperbarui`);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── Detail Tambahan ── */}
        <div className="kd001-card">
          <div className="kd001-card-header">
            <span className="kd001-card-label">Detail Tambahan</span>
          </div>
          <div className="kd001-detail-rows">
            {TAMBAHAN_FIELDS.map(field => (
              <InlineEditRow
                key={field.key}
                label={field.label}
                value={tambahanData[field.key] ?? ''}
                displayValue={field.format === 'rupiah' && tambahanData[field.key] ? fmtRupiah(tambahanData[field.key]) : undefined}
                type={field.type}
                formatRupiah={field.format === 'rupiah' ? fmtRupiah : undefined}
                onSave={async v => {
                  setTambahan(field.key, v);
                  if (field.dbCol && kandidat.id) {
                    await updateKandidat(kandidat.id, { [field.dbCol]: v });
                    showToast('Perubahan tersimpan', `${field.label} berhasil diperbarui`);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Sertifikasi ── */}
        <div className="kd001-card" onClick={() => setSertMenuOpen(null)}>
          <div className="kd001-card-header">
            <span className="kd001-card-label">Sertifikasi</span>
          </div>

          <div className="kd001-edu-body">
            {sertifikasiList.length === 0 && !addingSert && (
              <div className="kd001-empty-state">
                <p className="kd001-empty-text">Belum ada sertifikasi yang ditambahkan.<br />Lisensi dan sertifikasi profesional kandidat akan tampil di sini.</p>
                <button className="kd001-empty-add-btn" onClick={() => setAddingSert(true)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Tambah Sertifikasi
                </button>
              </div>
            )}

            {addingSert && (
              <div className="kd001-edu-form-card">
                <input className="kd001-edu-input" placeholder="Judul Sertifikasi *" value={newSert.judul} onChange={e => setNewSert(p => ({ ...p, judul: e.target.value }))} />
                <input className="kd001-edu-input" placeholder="Badan Penyelenggara *" value={newSert.penyelenggara} onChange={e => setNewSert(p => ({ ...p, penyelenggara: e.target.value }))} />
                <div className="kd001-entry-date-row">
                  <DateInputField label="Tanggal Diterbitkan" value={newSert.tglMulai} onChange={e => setNewSert(p => ({ ...p, tglMulai: e.target.value }))} />
                  <DateInputField label="Tanggal Berakhir" value={newSert.tglSelesai} onChange={e => setNewSert(p => ({ ...p, tglSelesai: e.target.value }))} />
                </div>
                <BulletInputs bullets={newSert.bullets} onChange={b => setNewSert(p => ({ ...p, bullets: b }))} placeholder="Tulis list kompetensi..." />
                <div className="kd001-entry-row-actions">
                  <button className="sd001-edit-cancel-btn" onClick={() => { setAddingSert(false); setNewSert(EMPTY_SERT); }}>Batal</button>
                  <button className="sd001-edit-save-btn" onClick={confirmSert}>Simpan</button>
                </div>
              </div>
            )}

            {!addingSert && sertifikasiList.length > 0 && (
              <button className="kd001-add-entry-btn" onClick={() => setAddingSert(true)}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Tambah Sertifikasi
              </button>
            )}

            {sertifikasiList.map(sert => (
              <div key={sert.id}>
                {editingSertId === sert.id ? (
                  <div className="kd001-edu-form-card">
                    <input className="kd001-edu-input" placeholder="Judul Sertifikasi *" value={editSertData.judul} onChange={e => setEditSertData(p => ({ ...p, judul: e.target.value }))} />
                    <input className="kd001-edu-input" placeholder="Badan Penyelenggara *" value={editSertData.penyelenggara} onChange={e => setEditSertData(p => ({ ...p, penyelenggara: e.target.value }))} />
                    <div className="kd001-entry-date-row">
                      <DateInputField label="Tanggal Diterbitkan" value={editSertData.tglMulai} onChange={e => setEditSertData(p => ({ ...p, tglMulai: e.target.value }))} />
                      <DateInputField label="Tanggal Berakhir" value={editSertData.tglSelesai} onChange={e => setEditSertData(p => ({ ...p, tglSelesai: e.target.value }))} />
                    </div>
                    <BulletInputs bullets={editSertData.bullets || ['']} onChange={b => setEditSertData(p => ({ ...p, bullets: b }))} placeholder="Tulis list kompetensi..." />
                    <div className="kd001-entry-row-actions">
                      <button className="sd001-edit-cancel-btn" onClick={() => setEditingSertId(null)}>Batal</button>
                      <button className="sd001-edit-save-btn" onClick={() => saveInlineEditSert(sert.id)}>Simpan</button>
                    </div>
                  </div>
                ) : (
                  <div className="kd001-edu-item kd001-exp-item kd001-item-clickable" onClick={() => startInlineEditSert(sert)}>
                    <div className="kd001-edu-item-content">
                      <span className="kd001-edu-item-name">{sert.judul}</span>
                      <span className="kd001-edu-item-sub">{sert.penyelenggara}</span>
                      <span className="kd001-edu-item-sub">{sert.periode}</span>
                      {(sert.deskripsi?.[0]) && (
                        <div className="kd001-exp-desc-display">
                          <div
                            ref={el => { if (el) sertDescRefs.current[sert.id] = el; }}
                            className={`kd001-exp-desc-text${expandedSert.has(sert.id) ? '' : ' kd001-exp-desc-collapsed'}`}
                            dangerouslySetInnerHTML={{ __html: sert.deskripsi.map(d => `• ${d}`).join('<br/>') }} />
                          {overflowingSert.has(sert.id) && (
                            <button className="kd001-read-more" onClick={e => { e.stopPropagation(); toggleSert(sert.id); }}>
                              {expandedSert.has(sert.id) ? 'Lihat Lebih Sedikit' : 'Lihat Lebih Banyak'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="kd001-three-dot-wrap" onClick={e => e.stopPropagation()}>
                      <button className="kd001-three-dot-btn" onClick={() => setSertMenuOpen(prev => prev === sert.id ? null : sert.id)}>
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                          <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                        </svg>
                      </button>
                      {sertMenuOpen === sert.id && (
                        <div className="kd001-three-dot-menu">
                          <button className="kd001-menu-item" onClick={() => startInlineEditSert(sert)}><EditIcon /> Edit</button>
                          <button className="kd001-menu-item kd001-menu-item--danger" onClick={() => setDeleteTarget({ type: 'sert', id: sert.id })}><TrashIcon /> Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="kd001-col-right">

        {/* ── Penilaian AI ── */}
        {!hideAIPanel && (
          <div className="kd001-card">
            <div className="kd001-card-header">
              <span className="kd001-card-label">Penilaian AI</span>
            </div>
            <div className="kd001-ai-list">
              {aiScores.length === 0 ? (
                <div className="kd001-empty-state" style={{ padding: '24px 0' }}>
                  <p className="kd001-empty-text">Belum ada penilaian AI. Tambahkan kandidat ke posisi untuk memulai scoring.</p>
                  <button className="kd001-empty-add-btn" onClick={() => onAddPosisi && onAddPosisi()}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    Tambah Penilaian
                  </button>
                </div>
              ) : (
                aiScores.map(item => (
                  <div className="kd001-ai-row kd001-ai-row--hoverable" key={item.id}>
                    <div className="kd001-ai-row-left">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="kd001-ai-posisi">{item.posisi}</span>
                        {item.departemen && (
                          <span style={{ fontSize: '11px', color: '#7e8799', padding: '2px 8px', background: '#f1f4f8', borderRadius: '12px' }}>
                            {item.departemen}
                          </span>
                        )}
                      </div>
                      <span className={`kd001-fit-badge ${item.fit}`} style={{ cursor: 'pointer' }} onClick={() => openPanel(item)}>
                        <span className="kd001-fit-label">{item.label}</span>
                        <span className={`kd001-fit-score ${item.fit}`}>{item.score}</span>
                      </span>
                    </div>
                    <button className="kd001-detail-penilaian-btn" onClick={() => openPanel(item)}>Detail Penilaian</button>
                  </div>
                ))
              )}
            </div>
            <div className="kd001-card-footer-btn">
              <button className="kd001-lihat-lainnya" onClick={() => onChangeTab && onChangeTab('seleksi')}>Lihat Lainnya</button>
            </div>
          </div>
        )}

        {/* ── Keahlian ── */}
        <div className="kd001-card kd001-keahlian-card">
          <div className="kd001-keahlian-header">
            <span className="kd001-keahlian-title">KEAHLIAN</span>
          </div>
          <div className="kd001-keahlian-body">
            {skills.length === 0 && !addingSkill && (
              <div className="kd001-empty-state">
                <p className="kd001-empty-text">Belum ada keahlian yang ditambahkan.<br />Keterampilan teknis maupun non-teknis kandidat akan tampil di sini.</p>
                <button className="kd001-empty-add-btn" onClick={() => setAddingSkill(true)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Tambah Keahlian
                </button>
              </div>
            )}
            <div className="kd001-keahlian-tags">
              {skills.map((skill, idx) => (
                editingSkillIdx === idx ? (
                  <div className="kd001-skill-tag kd001-skill-tag--editing" key={idx}>
                    <input
                      className="kd001-skill-inline-input"
                      value={editingSkillVal}
                      onChange={e => setEditingSkillVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveSkillEdit(idx);
                        if (e.key === 'Escape') setEditingSkillIdx(null);
                      }}
                      autoFocus
                      maxLength={50}
                    />
                    <button className="inline-action-btn cancel" onClick={() => setEditingSkillIdx(null)} title="Batal">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 10.5L10.5 3.5M3.5 3.5l7 7" />
                      </svg>
                    </button>
                    <button className="inline-action-btn save" onClick={() => saveSkillEdit(idx)} title="Simpan">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.8 7l2.8 2.8 5.6-5.6" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="kd001-skill-tag" key={idx}>
                    <span className="kd001-skill-text" onClick={() => { setEditingSkillIdx(idx); setEditingSkillVal(skill); }} title="Klik untuk edit">
                      {skill}
                    </span>
                    <button className="kd001-skill-remove" onClick={() => setDeleteTarget({ type: 'skill', idx })} title="Hapus">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1L7 7M7 1L1 7" stroke="var(--luna-orange-400)" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )
              ))}

              {(skills.length > 0 || addingSkill) && (
                <div className="kd001-skill-input-group">
                  {addingSkill && (
                    <input
                      ref={skillInputRef}
                      className="kd001-skill-inline-input"
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
                  <button className="kd001-skill-add-btn" onClick={() => setAddingSkill(true)} title="Tambah keahlian">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pengalaman Kerja ── */}
        <div className="kd001-card" onClick={() => setExpMenuOpen(null)}>
          <div className="kd001-card-header">
            <span className="kd001-card-label">Pengalaman Kerja</span>
          </div>

          <div className="kd001-edu-body">
            {pengalamanList.length === 0 && !addingExp && (
              <div className="kd001-empty-state">
                <p className="kd001-empty-text">Belum ada pengalaman kerja yang ditambahkan.<br />Riwayat pekerjaan kandidat akan tampil di sini.</p>
                <button className="kd001-empty-add-btn" onClick={() => setAddingExp(true)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Tambah Pengalaman
                </button>
              </div>
            )}

            {addingExp && (
              <div className="kd001-edu-form-card">
                <input className="kd001-edu-input" placeholder="Nama Jabatan *" value={newExp.jabatan} onChange={e => setNewExp(p => ({ ...p, jabatan: e.target.value }))} />
                <input className="kd001-edu-input" placeholder="Nama Perusahaan *" value={newExp.perusahaan} onChange={e => setNewExp(p => ({ ...p, perusahaan: e.target.value }))} />
                <div className="kd001-entry-date-row">
                  <DateInputField label="Tanggal Mulai" value={newExp.tglMulai} onChange={e => setNewExp(p => ({ ...p, tglMulai: e.target.value }))} />
                  <DateInputField label="Tanggal Selesai" value={newExp.tglSelesai} onChange={e => setNewExp(p => ({ ...p, tglSelesai: e.target.value }))} />
                </div>
                <BulletInputs bullets={newExp.bullets} onChange={b => setNewExp(p => ({ ...p, bullets: b }))} />
                <div className="kd001-entry-row-actions">
                  <button className="sd001-edit-cancel-btn" onClick={() => { setAddingExp(false); setNewExp(EMPTY_EXP); }}>Batal</button>
                  <button className="sd001-edit-save-btn" onClick={confirmExp}>Simpan</button>
                </div>
              </div>
            )}

            {!addingExp && pengalamanList.length > 0 && (
              <button className="kd001-add-entry-btn" onClick={() => setAddingExp(true)}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Tambah Pengalaman
              </button>
            )}

            {pengalamanList.map(exp => (
              <div key={exp.id}>
                {editingExpId === exp.id ? (
                  <div className="kd001-edu-form-card">
                    <input className="kd001-edu-input" placeholder="Nama Jabatan *" value={editExpData.jabatan} onChange={e => setEditExpData(p => ({ ...p, jabatan: e.target.value }))} />
                    <input className="kd001-edu-input" placeholder="Nama Perusahaan *" value={editExpData.perusahaan} onChange={e => setEditExpData(p => ({ ...p, perusahaan: e.target.value }))} />
                    <div className="kd001-entry-date-row">
                      <DateInputField label="Tanggal Mulai" value={editExpData.tglMulai} onChange={e => setEditExpData(p => ({ ...p, tglMulai: e.target.value }))} />
                      <DateInputField label="Tanggal Selesai" value={editExpData.tglSelesai} onChange={e => setEditExpData(p => ({ ...p, tglSelesai: e.target.value }))} />
                    </div>
                    <BulletInputs bullets={editExpData.bullets || ['']} onChange={b => setEditExpData(p => ({ ...p, bullets: b }))} />
                    <div className="kd001-entry-row-actions">
                      <button className="sd001-edit-cancel-btn" onClick={() => setEditingExpId(null)}>Batal</button>
                      <button className="sd001-edit-save-btn" onClick={() => saveInlineEditExp(exp.id)}>Simpan</button>
                    </div>
                  </div>
                ) : (
                  <div className="kd001-edu-item kd001-exp-item kd001-item-clickable" onClick={() => startInlineEditExp(exp)}>
                    <div className="kd001-edu-item-content">
                      <span className="kd001-edu-item-name">{exp.jabatan}</span>
                      <span className="kd001-edu-item-sub">{exp.perusahaan}</span>
                      <span className="kd001-edu-item-sub">{exp.periode}</span>
                      {exp.deskripsi?.[0] && (
                        <div className="kd001-exp-desc-display">
                          <div
                            ref={el => { if (el) expDescRefs.current[exp.id] = el; }}
                            className={`kd001-exp-desc-text${expandedExp.has(exp.id) ? '' : ' kd001-exp-desc-collapsed'}`}
                            dangerouslySetInnerHTML={{ __html: exp.deskripsi.map(d => `• ${d}`).join('<br/>') }} />
                          {overflowingExp.has(exp.id) && (
                            <button className="kd001-read-more" onClick={e => { e.stopPropagation(); toggleExp(exp.id); }}>
                              {expandedExp.has(exp.id) ? 'Lihat Lebih Sedikit' : 'Lihat Lebih Banyak'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="kd001-three-dot-wrap" onClick={e => e.stopPropagation()}>
                      <button className="kd001-three-dot-btn" onClick={() => setExpMenuOpen(prev => prev === exp.id ? null : exp.id)}>
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                          <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                        </svg>
                      </button>
                      {expMenuOpen === exp.id && (
                        <div className="kd001-three-dot-menu">
                          <button className="kd001-menu-item" onClick={() => startInlineEditExp(exp)}><EditIcon /> Edit</button>
                          <button className="kd001-menu-item kd001-menu-item--danger" onClick={() => setDeleteTarget({ type: 'exp', id: exp.id })}><TrashIcon /> Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}


          </div>
        </div>

        {/* ── Pendidikan ── */}
        <div className="kd001-card" onClick={() => setEduMenuOpen(null)}>
          <div className="kd001-card-header">
            <span className="kd001-card-label">Pendidikan</span>
          </div>

          <div className="kd001-edu-body">
            {pendidikanList.length === 0 && !addingEdu && (
              <div className="kd001-empty-state">
                <p className="kd001-empty-text">Belum ada riwayat pendidikan yang ditambahkan.<br />Informasi institusi dan jenjang kandidat akan tampil di sini.</p>
                <button className="kd001-empty-add-btn" onClick={() => setAddingEdu(true)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Tambah Pendidikan
                </button>
              </div>
            )}

            {addingEdu && (
              <div className="kd001-edu-form-card">
                <input className="kd001-edu-input" placeholder="Nama Institusi *" value={newEdu.institusi} onChange={e => setNewEdu(p => ({ ...p, institusi: e.target.value }))} />
                <input className="kd001-edu-input" placeholder="Jenjang / Gelar *" value={newEdu.jenjang} onChange={e => setNewEdu(p => ({ ...p, jenjang: e.target.value }))} />
                <input className="kd001-edu-input" placeholder="Jurusan" value={newEdu.jurusan} onChange={e => setNewEdu(p => ({ ...p, jurusan: e.target.value }))} />
                <input className="kd001-edu-input" placeholder="IPK / GPA" value={newEdu.gpa} onChange={e => setNewEdu(p => ({ ...p, gpa: e.target.value }))} />
                <div className="kd001-entry-date-row">
                  <DateInputField label="Tanggal Masuk" value={newEdu.tglMulai} onChange={e => setNewEdu(p => ({ ...p, tglMulai: e.target.value }))} />
                  <DateInputField label="Tanggal Lulus" value={newEdu.tglSelesai} onChange={e => setNewEdu(p => ({ ...p, tglSelesai: e.target.value }))} />
                </div>
                <div className="kd001-entry-row-actions">
                  <button className="sd001-edit-cancel-btn" onClick={() => { setAddingEdu(false); setNewEdu({ institusi: '', jenjang: '', jurusan: '', gpa: '', tglMulai: '', tglSelesai: '' }); }}>Batal</button>
                  <button className="sd001-edit-save-btn" onClick={confirmEdu}>Simpan</button>
                </div>
              </div>
            )}

            {!addingEdu && pendidikanList.length > 0 && (
              <button className="kd001-add-entry-btn" onClick={() => setAddingEdu(true)}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Tambah Pendidikan
              </button>
            )}

            {pendidikanList.map(edu => (
              <div key={edu.id}>
                {editingEduId === edu.id ? (
                  <div className="kd001-edu-form-card">
                    <input className="kd001-edu-input" placeholder="Nama Institusi *" value={editEduData.institusi} onChange={e => setEditEduData(p => ({ ...p, institusi: e.target.value }))} />
                    <input className="kd001-edu-input" placeholder="Jenjang / Gelar *" value={editEduData.jenjang} onChange={e => setEditEduData(p => ({ ...p, jenjang: e.target.value }))} />
                    <input className="kd001-edu-input" placeholder="Jurusan" value={editEduData.jurusan} onChange={e => setEditEduData(p => ({ ...p, jurusan: e.target.value }))} />
                    <input className="kd001-edu-input" placeholder="IPK / GPA" value={editEduData.gpa} onChange={e => setEditEduData(p => ({ ...p, gpa: e.target.value }))} />
                    <div className="kd001-entry-date-row">
                      <DateInputField label="Tanggal Masuk" value={editEduData.tglMulai} onChange={e => setEditEduData(p => ({ ...p, tglMulai: e.target.value }))} />
                      <DateInputField label="Tanggal Lulus" value={editEduData.tglSelesai} onChange={e => setEditEduData(p => ({ ...p, tglSelesai: e.target.value }))} />
                    </div>
                    <div className="kd001-entry-row-actions">
                      <button className="sd001-edit-cancel-btn" onClick={() => setEditingEduId(null)}>Batal</button>
                      <button className="sd001-edit-save-btn" onClick={() => saveInlineEditEdu(edu.id)}>Simpan</button>
                    </div>
                  </div>
                ) : (
                  <div className="kd001-edu-item kd001-item-clickable" onClick={() => startInlineEditEdu(edu)}>
                    <div className="kd001-edu-item-content">
                      <span className="kd001-edu-item-name">{edu.institusi}</span>
                      <span className="kd001-edu-item-sub">{[edu.gelar, edu.jurusan].filter(Boolean).join(' - ')}</span>
                      <span className="kd001-edu-item-sub">{edu.periode}</span>
                      {edu.gpa && <span className="kd001-edu-item-sub">IPK {edu.gpa}</span>}
                    </div>
                    <div className="kd001-three-dot-wrap" onClick={e => e.stopPropagation()}>
                      <button className="kd001-three-dot-btn" onClick={() => setEduMenuOpen(prev => prev === edu.id ? null : edu.id)}>
                        <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                          <circle cx="1.5" cy="1.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="6.5" r="1.5" fill="#abb2c1" />
                          <circle cx="1.5" cy="11.5" r="1.5" fill="#abb2c1" />
                        </svg>
                      </button>
                      {eduMenuOpen === edu.id && (
                        <div className="kd001-three-dot-menu">
                          <button className="kd001-menu-item" onClick={() => startInlineEditEdu(edu)}><EditIcon /> Edit</button>
                          <button className="kd001-menu-item kd001-menu-item--danger" onClick={() => setDeleteTarget({ type: 'edu', id: edu.id })}><TrashIcon /> Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}


          </div>
        </div>

      </div>

      {scorePanel && (
        <KandidatPenilaian
          kandidat={scorePanel}
          onClose={() => setScorePanel(null)}
          onRescored={() => {
            if (!kandidat.id) return;
            getScoringByKandidat(kandidat.id)
              .then(data => setAiScores((data || []).map(s => mapScoringToPanel(s, kandidat.nama_lengkap || kandidat.nama || ''))))
              .catch(() => { });
          }}
        />
      )}

      {deleteTarget !== null && (
        <PopupKonfirmasi
          title={`Hapus ${{ exp: 'Pengalaman Kerja', edu: 'Pendidikan', sert: 'Sertifikasi', skill: 'Keahlian' }[deleteTarget.type] || 'Data'}`}
          body="Apakah Anda yakin ingin menghapus data ini?"
          confirmLabel="Hapus"
          onConfirm={() => {
            if (deleteTarget.type === 'exp') removeExp(deleteTarget.id);
            if (deleteTarget.type === 'edu') removeEdu(deleteTarget.id);
            if (deleteTarget.type === 'sert') removeSert(deleteTarget.id);
            if (deleteTarget.type === 'skill') removeSkill(deleteTarget.idx);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
