import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useKandidatDetailData from '../../../hooks/kandidat/useKandidatDetailData.js';
import PopupKonfirmasi from '../../../components/PopupKonfirmasi.jsx';
import PopupTidakSesuai from '../../../components/PopupTidakSesuai.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import MobileScoreDetailSheet from '../../components/MobileScoreDetailSheet.jsx';
import KandidatResumeTab from './KandidatResumeTab.jsx';
import KandidatRekrutmenTab from './KandidatRekrutmenTab.jsx';
import { cvFileName, downloadFile } from '../../../utils/cvFile.js';
import '../../../../css/mobile/kandidat/kandidat-detail.css';

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);
const IconKebab = () => (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconPencil = () => (<svg viewBox="0 0 9 9" fill="none"><path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="currentColor" strokeWidth="1" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconClose = () => (<svg viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" strokeWidth="1.5" stroke="currentColor" /></svg>);
const IconTrash = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconContact = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const IconLink = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const IconMoney = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
const IconClock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
const IconPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" /></svg>);
const IconArchive = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconDownload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

function getWhatsAppUrl(phone) {
  if (!phone) return null;
  let cleaned = String(phone).trim().replace(/[^0-9+]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '0') return null;
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  else if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
  else if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
  if (cleaned.length < 8) return null;
  return `https://api.whatsapp.com/send?phone=${cleaned}`;
}

function fmtRupiah(value) {
  const n = parseInt(String(value ?? '').replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? '' : 'Rp ' + n.toLocaleString('id-ID');
}

const FIELD_META = {
  nama: { label: 'Nama Lengkap', type: 'text' },
  gender: { label: 'Gender', type: 'select', options: GENDER_OPTIONS },
  tglLahir: { label: 'Tanggal Lahir', type: 'date' },
  domisili: { label: 'Domisili', type: 'text' },
  email: { label: 'Email', type: 'text' },
  phone: { label: 'No. Telpon', type: 'text' },
  jurusan: { label: 'Jurusan', type: 'text' },
  universitas: { label: 'Universitas', type: 'text' },
  perusahaan: { label: 'Perusahaan Saat Ini', type: 'text' },
  jabatan: { label: 'Jabatan Saat Ini', type: 'text' },
  pengalaman: { label: 'Pengalaman Kerja (Tahun)', type: 'number' },
  industri: { label: 'Bidang Industri', type: 'text' },
  tahun_terakhir_bekerja: { label: 'Tahun Terakhir Bekerja', type: 'number' },
  linkedin_url: { label: 'LinkedIn', type: 'text' },
  portfolio_url: { label: 'Portofolio', type: 'text' },
  id: { label: 'ID Kandidat', type: 'readonly' },
  harapanUpah: { label: 'Harapan Upah', type: 'currency' },
  harapanBenefit: { label: 'Harapan Benefit', type: 'text' },
};

const GROUPS = [
  { key: 'kontak', title: 'Kontak & Identitas', Icon: IconContact, fields: ['nama', 'gender', 'tglLahir', 'domisili', 'email', 'phone'] },
  { key: 'profesional', title: 'Profil Profesional', Icon: IconBriefcase, fields: ['jurusan', 'universitas', 'perusahaan', 'jabatan', 'pengalaman', 'industri', 'tahun_terakhir_bekerja'] },
  { key: 'tautan', title: 'Tautan', Icon: IconLink, fields: ['linkedin_url', 'portfolio_url', 'id'] },
  { key: 'preferensi', title: 'Preferensi', Icon: IconMoney, fields: ['harapanUpah', 'harapanBenefit'] },
];

function displayValue(key, data) {
  const val = data[key];
  if (key === 'pengalaman') return val || val === 0 ? `${val} Tahun` : null;
  if (key === 'tglLahir') return val || null;
  if (key === 'harapanUpah') return val ? fmtRupiah(val) : null;
  return val || null;
}

const ENTRY_META = {
  pengalaman: { title: 'Pengalaman Kerja', titleField: 'jabatan', subField: 'perusahaan', titleLabel: 'Jabatan', subLabel: 'Perusahaan', hasBullets: true, bulletHint: 'Tanggung Jawab & Pencapaian' },
  pendidikan: { title: 'Pendidikan', titleField: 'institusi', subField: null, titleLabel: 'Institusi', subLabel: null, hasBullets: false },
  sertifikasi: { title: 'Sertifikasi', titleField: 'judul', subField: 'penyelenggara', titleLabel: 'Judul Sertifikasi', subLabel: 'Badan Penyelenggara', hasBullets: true, bulletHint: 'Kompetensi' },
};

const EMPTY_ENTRY = {
  pengalaman: { jabatan: '', perusahaan: '', tglMulai: '', tglSelesai: '', bullets: [''] },
  pendidikan: { institusi: '', gelar: '', jurusan: '', gpa: '', tglMulai: '', tglSelesai: '' },
  sertifikasi: { judul: '', penyelenggara: '', tglMulai: '', tglSelesai: '', bullets: [''] },
};

function entryToDraft(kind, entry) {
  const parts = (entry.periode || '').split(' – ');
  if (kind === 'pengalaman') return { id: entry.id, jabatan: entry.jabatan, perusahaan: entry.perusahaan, tglMulai: parts[0] || '', tglSelesai: parts[1] || '', bullets: entry.deskripsi?.length ? [...entry.deskripsi] : [''] };
  if (kind === 'pendidikan') return { id: entry.id, institusi: entry.institusi, gelar: entry.gelar, jurusan: entry.jurusan, gpa: entry.gpa, tglMulai: parts[0] || '', tglSelesai: parts[1] || '' };
  return { id: entry.id, judul: entry.judul, penyelenggara: entry.penyelenggara, tglMulai: parts[0] || '', tglSelesai: parts[1] || '', bullets: entry.deskripsi?.length ? [...entry.deskripsi] : [''] };
}

function draftToEntry(kind, draft) {
  const periode = [draft.tglMulai, draft.tglSelesai].filter(Boolean).join(' – ') || '';
  if (kind === 'pengalaman') return { id: draft.id, jabatan: draft.jabatan, perusahaan: draft.perusahaan, periode, deskripsi: (draft.bullets || []).filter(b => b.trim()) };
  if (kind === 'pendidikan') return { id: draft.id, institusi: draft.institusi, gelar: draft.gelar, jurusan: draft.jurusan, gpa: draft.gpa, periode };
  return { id: draft.id, judul: draft.judul, penyelenggara: draft.penyelenggara, periode, deskripsi: (draft.bullets || []).filter(b => b.trim()) };
}

export default function KandidatDetailMobile({ kandidat, navigate, back, overlay }) {
  const { companyId, companyPlan } = useAuth() || {};
  const isFreePlan = companyPlan === 'free';
  const kandidatId = typeof kandidat === 'string' ? kandidat : kandidat?.id;
  const initialNama = typeof kandidat === 'object' ? (kandidat?.nama || kandidat?.nama_lengkap || '') : '';

  const {
    isLoading, data, raw,
    pengalamanList, pendidikanList, sertifikasiList, saveEntry, deleteEntry,
    skills, addSkill, editSkill, removeSkill,
    aiScores, isLoadingScores, rescore, reject, alurList, changeAlur,
    seleksiListForAdd, isLoadingSeleksi, loadSeleksiForAdd, scoringJobs, startScoring,
    updateField, doArchive,
    toast, setToast, showToast,
  } = useKandidatDetailData(kandidatId, companyId);

  // Kartu "Penilaian AI" cuma nampilin posisi yang masih aktif diikuti —
  // yang sudah ditandai "Tidak Sesuai" (alur 0) dipindah tampilannya ke tab
  // Rekrutmen (riwayat lengkap), bukan hilang, cuma tidak dobel di sini.
  const visibleAiScores = aiScores.filter(s => s.alur !== 0);

  const [activeTab, setActiveTab] = useState('ringkasan');
  // Ganti tab menukar isi .msh-content (container scroll bersama di
  // MobileApp) tanpa remount div-nya sendiri, jadi scrollTop tab sebelumnya
  // kebawa terus kalau tidak di-reset manual.
  useEffect(() => {
    document.querySelector('.msh-content')?.scrollTo(0, 0);
  }, [activeTab]);
  const [openGroups, setOpenGroups] = useState(new Set(['kontak']));
  const [activeField, setActiveField] = useState(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [entryDraft, setEntryDraft] = useState(null); // { kind, ...draftFields }
  // Sheet ini dibuka lewat history entry baru (bukan local open/close state)
  // supaya gesture "swipe back" native menutup sheet & kembali ke laman
  // detail kandidat — bukan lompat ke daftar Kandidat seperti sebelumnya.
  // Isi (posisi/skor yang di-tap) tetap local state karena tidak perlu ikut
  // history — cuma visibilitasnya yang digerakkan oleh `overlay`.
  const [fitDetailItem, setFitDetailItem] = useState(null);
  const fitDetailOpen = overlay === 'penilaian';
  const openFitDetail = (item) => { setFitDetailItem(item); navigate('kandidat-detail_001', { kandidat, overlay: 'penilaian' }); };
  const closeFitDetail = () => back();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isDownloadingCv, setIsDownloadingCv] = useState(false);
  const [posisiModalOpen, setPosisiModalOpen] = useState(false);
  const [posisiQuery, setPosisiQuery] = useState('');
  const [skillDraft, setSkillDraft] = useState(null); // { idx } for edit, or 'new'
  const [skillInput, setSkillInput] = useState('');

  const nama = data.nama || initialNama;
  const waUrl = getWhatsAppUrl(data.phone);

  const handleDownloadCv = async () => {
    if (isDownloadingCv || !raw?.cv_url) return;
    setKebabOpen(false);
    setIsDownloadingCv(true);
    await downloadFile(raw.cv_url, cvFileName(raw.cv_url, nama));
    setIsDownloadingCv(false);
  };

  const toggleGroup = (key) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const openField = (key) => {
    setFieldDraft(data[key] != null ? String(data[key]) : '');
    setActiveField(key);
  };
  const saveField = () => {
    const meta = FIELD_META[activeField];
    const val = meta.type === 'currency' ? fieldDraft.replace(/[^0-9]/g, '') : fieldDraft;
    updateField(activeField, val);
    setActiveField(null);
  };
  const selectFieldOption = (value) => { updateField(activeField, value); setActiveField(null); };

  const openAddEntry = (kind) => setEntryDraft({ kind, ...EMPTY_ENTRY[kind] });
  const openEditEntry = (kind, entry) => setEntryDraft({ kind, ...entryToDraft(kind, entry) });
  const closeEntryDraft = () => setEntryDraft(null);
  const saveEntryDraft = () => {
    const { kind, ...draft } = entryDraft;
    saveEntry(kind, draftToEntry(kind, draft));
    closeEntryDraft();
  };
  const deleteEntryDraft = () => {
    const { kind, id } = entryDraft;
    deleteEntry(kind, id);
    closeEntryDraft();
  };
  const updateBullet = (idx, val) => setEntryDraft(d => ({ ...d, bullets: d.bullets.map((b, i) => i === idx ? val : b) }));
  const addBullet = () => setEntryDraft(d => ({ ...d, bullets: [...d.bullets, ''] }));
  const removeBullet = (idx) => setEntryDraft(d => ({ ...d, bullets: d.bullets.filter((_, i) => i !== idx) }));

  const openPosisiModal = () => {
    setKebabOpen(false);
    setPosisiModalOpen(true);
    loadSeleksiForAdd();
  };

  const getPosisiState = (posisiId) => scoringJobs[posisiId]?.status ||
    (aiScores.find(s => s.seleksiId === posisiId) ? 'done' : 'idle');

  const handleTambahPosisi = (p) => {
    startScoring(p.id, p.nama);
    showToast(`${p.nama} ditambahkan`, 'Sedang antre penilaian AI untuk posisi ini.');
  };

  // Posisi yang baru ditambahkan langsung hilang dari daftar (tidak
  // nunggu skor selesai) — sama seperti tab "Pilih Kandidat" di
  // Lowongan-detail: begitu ditekan, baris langsung hilang + toast
  // konfirmasi, progress lanjutannya dipantau lewat widget global.
  const availablePosisi = seleksiListForAdd.filter(p => getPosisiState(p.id) === 'idle');
  const allScored = seleksiListForAdd.length > 0 && availablePosisi.length === 0;
  const filteredPosisi = availablePosisi.filter(p =>
    p.nama.toLowerCase().includes(posisiQuery.toLowerCase()) || p.dept.toLowerCase().includes(posisiQuery.toLowerCase())
  );

  return (
    <>
      <div className="mkd001-head">
        <div className="mkd001-head-row">
          <button className="mkd001-back" onClick={() => navigate('kandidat_001')}><IconBack /></button>
          <button className="mkd001-kebab" onClick={() => setKebabOpen(true)}><IconKebab /></button>
        </div>
        <div className="mkd001-profile">
          <div className="mkd001-avatar">{(nama || '?').charAt(0).toUpperCase()}</div>
          <div>
            <div className="mkd001-name">{nama || 'Memuat…'}</div>
            <div className="mkd001-role"><b>{data.jabatan || 'Belum ada jabatan'}</b>{data.perusahaan ? ` di ${data.perusahaan}` : ''}</div>
          </div>
        </div>
        <div className="mkd001-chiprow">
          <span className="mkd001-meta-chip"><IconClock />{data.pengalaman || data.pengalaman === 0 ? `${data.pengalaman} tahun` : '0 tahun'} pengalaman</span>
          <span className="mkd001-meta-chip"><IconPin />{data.domisili || 'Belum ada domisili'}</span>
          {data.sumber === 'public' && <span className="mkd001-meta-chip src"><IconGlobe />Portal Karier</span>}
          {waUrl && (
            <a className="mkd001-meta-chip wa" href={waUrl} target="_blank" rel="noopener noreferrer"><IconWhatsApp />WhatsApp</a>
          )}
        </div>
        <button className="mkd001-cta" onClick={openPosisiModal}><IconPlus />Tambah ke Posisi</button>
        <div className="mkd001-tabs">
          <button className={`mkd001-tab${activeTab === 'ringkasan' ? ' active' : ''}`} onClick={() => setActiveTab('ringkasan')}>Ringkasan</button>
          <button className={`mkd001-tab${activeTab === 'resume' ? ' active' : ''}`} onClick={() => setActiveTab('resume')}>Resume</button>
          <button className={`mkd001-tab${activeTab === 'rekrutmen' ? ' active' : ''}`} onClick={() => setActiveTab('rekrutmen')}>Rekrutmen</button>
        </div>
      </div>

      {activeTab === 'resume' ? (
        <KandidatResumeTab cvUrl={raw?.cv_url} nama={nama} />
      ) : activeTab === 'rekrutmen' ? (
        <KandidatRekrutmenTab
          aiScores={aiScores}
          isLoadingScores={isLoadingScores}
          alurList={alurList}
          navigate={navigate}
          onOpenItem={openFitDetail}
        />
      ) : isLoading ? (
        <div className="mkd001-body">
          <div className="msh-skel" style={{ height: 180 }} />
          <div className="msh-skel" style={{ height: 220 }} />
        </div>
      ) : (
        <div className="mkd001-body">
          <div className="mkd001-card">
            <div className="mkd001-card-head"><span className="mkd001-card-title">Penilaian AI</span></div>
            {isLoadingScores ? (
              <div className="mkd001-empty">Memuat penilaian…</div>
            ) : visibleAiScores.length === 0 ? (
              <div className="mkd001-empty">Belum ada penilaian AI. Tambahkan kandidat ke posisi untuk memulai scoring.</div>
            ) : (
              <div className="mkd001-ai-list">
                {visibleAiScores.map(item => {
                  const fitKey = item.belumDinilai ? 'none' : item.fit;
                  return (
                    <button className="mkd001-ai-row" key={item.id} onClick={() => openFitDetail(item)}>
                      <div className={`mkd001-fit-score-lg ${fitKey}`}>{item.belumDinilai ? '—' : item.score}</div>
                      <div className="mkd001-ai-mid">
                        <div className="mkd001-ai-posisi-row">
                          <span className="mkd001-ai-posisi">{item.posisi}</span>
                          {item.departemen && <span className="mkd001-ai-dept">{item.departemen}</span>}
                        </div>
                        <div className={`mkd001-ai-fitlabel ${fitKey}`}>{item.belumDinilai ? 'Belum Dinilai' : `Kecocokan ${item.label}`}</div>
                      </div>
                      <div className="mkd001-fit-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg></div>
                    </button>
                  );
                })}
              </div>
            )}
            <button className="mkd001-ai-add" onClick={openPosisiModal}><IconPlus />Tambah Penilaian</button>
          </div>

          <div className="mkd001-card">
            <div className="mkd001-card-head"><span className="mkd001-card-title">Detail Kandidat</span></div>
            {GROUPS.map(group => {
              const isOpen = openGroups.has(group.key);
              return (
                <div className={`mkd001-group${isOpen ? ' open' : ''}`} key={group.key}>
                  <button className="mkd001-group-head" onClick={() => toggleGroup(group.key)}>
                    <div className="mkd001-group-head-left">
                      <div className="mkd001-group-icon"><group.Icon /></div>
                      <div>
                        <div className="mkd001-group-title">{group.title}</div>
                        <div className="mkd001-group-sub">{group.fields.length} field</div>
                      </div>
                    </div>
                    <div className="mkd001-group-chevron"><IconChevronDown /></div>
                  </button>
                  {isOpen && (
                    <div className="mkd001-rows">
                      {group.fields.map(key => {
                        const meta = FIELD_META[key];
                        const val = displayValue(key, data);
                        return (
                          <button className="mkd001-row" key={key} onClick={() => meta.type !== 'readonly' && openField(key)}>
                            <span className="mkd001-row-label">{meta.label}</span>
                            <div className="mkd001-row-val-wrap">
                              <span className={`mkd001-row-val${!val ? ' muted' : ''}`}>{val || 'Belum diisi'}</span>
                              {meta.type !== 'readonly' && <span className="mkd001-row-pencil"><IconPencil /></span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {['pengalaman', 'pendidikan', 'sertifikasi'].map(kind => {
            const list = kind === 'pengalaman' ? pengalamanList : kind === 'pendidikan' ? pendidikanList : sertifikasiList;
            const meta = ENTRY_META[kind];
            return (
              <div className="mkd001-card" key={kind}>
                <div className="mkd001-card-head">
                  <span className="mkd001-card-title">{meta.title}</span>
                  <button className="mkd001-card-add" onClick={() => openAddEntry(kind)}><IconPlus />Tambah</button>
                </div>
                {list.length === 0 ? (
                  <div className="mkd001-empty">
                    Belum ada {meta.title.toLowerCase()} yang ditambahkan.
                    <br />
                    <button className="mkd001-empty-add" onClick={() => openAddEntry(kind)}><IconPlus />Tambah {meta.title}</button>
                  </div>
                ) : (
                  <div className="mkd001-entries">
                    {list.map(entry => (
                      <button className="mkd001-entry" key={entry.id} onClick={() => openEditEntry(kind, entry)}>
                        <div className="mkd001-entry-top">
                          <div>
                            <div className="mkd001-entry-title">{entry[meta.titleField]}</div>
                            {meta.subField && entry[meta.subField] && <div className="mkd001-entry-sub">{entry[meta.subField]}</div>}
                            {kind === 'pendidikan' && (entry.gelar || entry.jurusan || entry.gpa) && (
                              <div className="mkd001-entry-sub">{[entry.gelar, entry.jurusan].filter(Boolean).join(' ')}{entry.gpa ? ` · IPK ${entry.gpa}` : ''}</div>
                            )}
                            {entry.periode && <div className="mkd001-entry-period">{entry.periode}</div>}
                          </div>
                          <span className="mkd001-entry-pencil"><IconPencil /></span>
                        </div>
                        {meta.hasBullets && entry.deskripsi?.length > 0 && (
                          <div className="mkd001-entry-desc">
                            {entry.deskripsi.map((d, i) => <div key={i}>• {d}</div>)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mkd001-card">
            <div className="mkd001-card-head"><span className="mkd001-card-title">Keahlian</span></div>
            <div className="mkd001-skills">
              {skills.map((skill, idx) => (
                skillDraft?.idx === idx ? (
                  <input
                    key={idx}
                    className="mkd001-skill-input"
                    value={skillInput}
                    autoFocus
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { editSkill(idx, skillInput); setSkillDraft(null); } if (e.key === 'Escape') setSkillDraft(null); }}
                    onBlur={() => { if (skillInput.trim()) editSkill(idx, skillInput); setSkillDraft(null); }}
                  />
                ) : (
                  <div className="mkd001-skill-tag" key={idx}>
                    <span onClick={() => { setSkillDraft({ idx }); setSkillInput(skill); }}>{skill}</span>
                    <button onClick={() => removeSkill(idx)}><IconClose /></button>
                  </div>
                )
              ))}
              {skillDraft === 'new' ? (
                <input
                  className="mkd001-skill-input"
                  value={skillInput}
                  autoFocus
                  placeholder="Ketik lalu Enter…"
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { addSkill(skillInput); setSkillInput(''); setSkillDraft(null); } if (e.key === 'Escape') setSkillDraft(null); }}
                  onBlur={() => { if (skillInput.trim()) addSkill(skillInput); setSkillInput(''); setSkillDraft(null); }}
                />
              ) : (
                <button className="mkd001-skill-add" onClick={() => { setSkillDraft('new'); setSkillInput(''); }}><IconPlus />Tambah</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── sheet: edit 1 field ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${activeField ? ' open' : ''}`} onClick={() => setActiveField(null)} />
          <div className={`msh-sheet${activeField ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {activeField && (() => {
              const meta = FIELD_META[activeField];
              const group = GROUPS.find(g => g.fields.includes(activeField));
              if (meta.type === 'select') {
                return (
                  <>
                    <div className="mkd001-sheet-label first">{group?.title}</div>
                    <div className="mkd001-sheet-title">{meta.label}</div>
                    {meta.options.map(opt => (
                      <button key={opt} className="mkd001-select-opt" onClick={() => selectFieldOption(opt)}>
                        <span className="mkd001-select-opt-label">{opt}</span>
                        {data[activeField] === opt && <span className="mkd001-select-opt-check"><IconCheck /></span>}
                      </button>
                    ))}
                  </>
                );
              }
              return (
                <>
                  <div className="mkd001-sheet-label first">{group?.title}</div>
                  <div className="mkd001-sheet-title">{meta.label}</div>
                  <input
                    className="mkd001-field-input"
                    style={{ marginTop: 12 }}
                    type={meta.type === 'date' ? 'date' : meta.type === 'number' ? 'number' : 'text'}
                    value={fieldDraft}
                    onChange={e => setFieldDraft(e.target.value)}
                    placeholder="Tambahkan data"
                  />
                  <button className="mkd001-sheet-cta" onClick={saveField}>Simpan Perubahan</button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: tambah/edit riwayat ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${entryDraft ? ' open' : ''}`} onClick={closeEntryDraft} />
          <div className={`msh-sheet mkd001-entry-sheet${entryDraft ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {entryDraft && (() => {
              const meta = ENTRY_META[entryDraft.kind];
              return (
                <>
                  <div className="mkd001-sheet-title">{entryDraft.id ? `Edit ${meta.title}` : `Tambah ${meta.title}`}</div>
                  <div className="mkd001-sheet-label">Detail</div>
                  {entryDraft.kind === 'pendidikan' ? (
                    <>
                      <input className="mkd001-field-input" placeholder="Institusi" value={entryDraft.institusi} onChange={e => setEntryDraft(d => ({ ...d, institusi: e.target.value }))} />
                      <input className="mkd001-field-input" placeholder="Jenjang (mis. S1)" value={entryDraft.gelar} onChange={e => setEntryDraft(d => ({ ...d, gelar: e.target.value }))} />
                      <input className="mkd001-field-input" placeholder="Jurusan" value={entryDraft.jurusan} onChange={e => setEntryDraft(d => ({ ...d, jurusan: e.target.value }))} />
                      <input className="mkd001-field-input" placeholder="IPK" value={entryDraft.gpa} onChange={e => setEntryDraft(d => ({ ...d, gpa: e.target.value }))} />
                    </>
                  ) : (
                    <>
                      <input className="mkd001-field-input" placeholder={meta.titleLabel} value={entryDraft[meta.titleField]} onChange={e => setEntryDraft(d => ({ ...d, [meta.titleField]: e.target.value }))} />
                      <input className="mkd001-field-input" placeholder={meta.subLabel} value={entryDraft[meta.subField]} onChange={e => setEntryDraft(d => ({ ...d, [meta.subField]: e.target.value }))} />
                    </>
                  )}
                  <div className="mkd001-field-row2">
                    <input className="mkd001-field-input" type="date" placeholder="Mulai" value={entryDraft.tglMulai} onChange={e => setEntryDraft(d => ({ ...d, tglMulai: e.target.value }))} />
                    <input className="mkd001-field-input" type="date" placeholder="Selesai" value={entryDraft.tglSelesai} onChange={e => setEntryDraft(d => ({ ...d, tglSelesai: e.target.value }))} />
                  </div>

                  {meta.hasBullets && (
                    <>
                      <div className="mkd001-sheet-label">{meta.bulletHint}</div>
                      {entryDraft.bullets.map((b, i) => (
                        <div className="mkd001-bullet-row" key={i}>
                          <span className="mkd001-bullet-dot">•</span>
                          <input className="mkd001-bullet-input" value={b} onChange={e => updateBullet(i, e.target.value)} placeholder="Tulis poin…" />
                          {entryDraft.bullets.length > 1 && (
                            <button className="mkd001-bullet-remove" onClick={() => removeBullet(i)}><IconClose /></button>
                          )}
                        </div>
                      ))}
                      <button className="mkd001-bullet-add" onClick={addBullet}><IconPlus />Tambah poin</button>
                    </>
                  )}

                  <button className="mkd001-sheet-cta" onClick={saveEntryDraft}>{entryDraft.id ? 'Simpan Perubahan' : `Tambah ${meta.title}`}</button>
                  {entryDraft.id != null && (
                    <button className="mkd001-sheet-delete" onClick={deleteEntryDraft}><IconTrash />Hapus {meta.title}</button>
                  )}
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}

      <MobileScoreDetailSheet
        open={fitDetailOpen}
        item={fitDetailItem}
        alurList={alurList}
        isFreePlan={isFreePlan}
        onClose={closeFitDetail}
        onRescore={async () => {
          const updated = await rescore(fitDetailItem);
          if (updated) setFitDetailItem(updated);
        }}
        onReject={() => { setRejectTarget(fitDetailItem); closeFitDetail(); }}
        onChangeAlur={(level) => {
          changeAlur(fitDetailItem, level);
          setFitDetailItem(item => item ? { ...item, alur: level } : item);
        }}
        onUpgrade={() => navigate('paket-langganan')}
      />

      {/* ── sheet: tambah ke posisi ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${posisiModalOpen ? ' open' : ''}`} onClick={() => setPosisiModalOpen(false)} />
          <div className={`msh-sheet${posisiModalOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mkd001-sheet-title">Tambahkan ke Posisi</div>
            <div className="mkd001-posisi-search">
              <IconSearch />
              <input placeholder="Cari nama posisi atau departemen…" value={posisiQuery} onChange={e => setPosisiQuery(e.target.value)} />
            </div>
            <div className="mkd001-posisi-list">
              {isLoadingSeleksi ? (
                <div className="mkd001-posisi-empty">Memuat posisi...</div>
              ) : seleksiListForAdd.length === 0 ? (
                <div className="mkd001-posisi-empty">Tidak ada posisi ditemukan</div>
              ) : allScored ? (
                <div className="mkd001-posisi-empty">Kandidat sudah dinilai di semua posisi yang tersedia</div>
              ) : filteredPosisi.length === 0 ? (
                <div className="mkd001-posisi-empty">Tidak ada posisi yang cocok</div>
              ) : (
                filteredPosisi.map(p => (
                  <div className="mkd001-posisi-item" key={p.id}>
                    <div>
                      <div className="mkd001-posisi-name">{p.nama}</div>
                      <div className="mkd001-posisi-dept">{p.dept}</div>
                    </div>
                    <button className="mkd001-posisi-add" onClick={() => handleTambahPosisi(p)}>
                      Tambahkan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: kebab (arsipkan) ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${kebabOpen ? ' open' : ''}`} onClick={() => setKebabOpen(false)} />
          <div className={`msh-sheet${kebabOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {raw?.cv_url && (
              <button className="mkd001-kebab-item" disabled={isDownloadingCv} onClick={handleDownloadCv}>
                <IconDownload />Unduh CV
              </button>
            )}
            <button className="mkd001-kebab-item danger" onClick={() => { setKebabOpen(false); setShowArchiveConfirm(true); }}>
              <IconArchive />Arsipkan Kandidat
            </button>
          </div>
        </>,
        document.body
      )}

      {showArchiveConfirm && (
        <PopupKonfirmasi
          title="Arsipkan Kandidat"
          body="Apakah Anda yakin ingin mengarsipkan kandidat ini?"
          confirmLabel="Arsipkan"
          onConfirm={async () => { setShowArchiveConfirm(false); const ok = await doArchive(); if (ok) navigate('kandidat_001'); }}
          onClose={() => setShowArchiveConfirm(false)}
        />
      )}

      {rejectTarget && (
        <PopupTidakSesuai
          targetText={`kandidat untuk posisi "${rejectTarget.posisi}"`}
          onConfirm={(reason, details) => { reject(rejectTarget, reason, details); setRejectTarget(null); }}
          onClose={() => setRejectTarget(null)}
        />
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
