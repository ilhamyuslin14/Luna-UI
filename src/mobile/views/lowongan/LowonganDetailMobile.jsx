import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useLowonganDetailData from '../../../hooks/lowongan/useLowonganDetailData.js';
import { DROPDOWN_OPTIONS } from '../../../utils/dropdownOptions.js';
import PopupKonfirmasi from '../../../components/PopupKonfirmasi.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import MobileRichTextEditor from '../../components/MobileRichTextEditor.jsx';
import LowonganKandidatTab from './LowonganKandidatTab.jsx';
import '../../../../css/mobile/lowongan/lowongan-detail.css';

const STATUS_DOT = { rencana: '#7E8799', aktif: '#0977BE', ditahan: '#FD800C', selesai: '#089F32', dibatalkan: '#FB484B' };
const STATUS_TINT = { rencana: '#F1F2F5', aktif: '#E7F3FC', ditahan: '#FFF1E5', selesai: '#E9F9EE', dibatalkan: '#FDEBEC' };

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);
const IconKebab = () => (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconPencil = () => (<svg viewBox="0 0 9 9" fill="none"><path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="currentColor" strokeWidth="1" /></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconQr = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17h.01M17 14h.01" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>);
const IconMoney = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
const IconCalendar = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const IconGrad = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" /></svg>);
const IconRefresh = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
const IconCopy = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const IconArchive = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconTrash = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconLink = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17H7A5 5 0 017 7h2" /><path d="M15 7h2a5 5 0 010 10h-2" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const IconDownload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconLinkedIn = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
const IconInstagram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>);
const IconTelegram = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const IconFacebook = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const IconX = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);

const SHARE_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { key: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { key: 'instagram', label: 'Instagram', Icon: IconInstagram },
  { key: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { key: 'x', label: 'X', Icon: IconX },
  { key: 'telegram', label: 'Telegram', Icon: IconTelegram },
];

const BULAN_ID = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
function formatDateDisplay(val) {
  if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const [y, m, d] = val.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${HARI_ID[dt.getDay()]}, ${d} ${BULAN_ID[m]} ${y}`;
}

function formatRupiah(value) {
  const numberString = String(value ?? '').replace(/[^,\d]/g, '');
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
}

const FIELD_META = {
  kode: { label: 'Kode Seleksi', type: 'readonly' },
  jabatan: { label: 'Nama Jabatan', type: 'text' },
  levelJabatan: { label: 'Level Jabatan', type: 'select', options: DROPDOWN_OPTIONS.levelJabatan },
  dept: { label: 'Departemen', type: 'dept' },
  lokasi: { label: 'Lokasi', type: 'text' },
  remote: { label: 'Remote', type: 'select', options: DROPDOWN_OPTIONS.remote },
  ikatan: { label: 'Ikatan Kerja', type: 'select', options: DROPDOWN_OPTIONS.ikatanKerja },
  jumlah: { label: 'Jumlah Rekrut (Orang)', type: 'number' },
  upahMin: { label: 'Upah Minimal', type: 'currency' },
  upahMaks: { label: 'Upah Maksimum', type: 'currency' },
  siklus: { label: 'Siklus Upah', type: 'select', options: DROPDOWN_OPTIONS.siklusUpah },
  tglMulai: { label: 'Tanggal Mulai Rekrutmen', type: 'date' },
  tglOnboard: { label: 'Tanggal Target On-Boarding', type: 'date' },
  pendidikan: { label: 'Minimal Pendidikan', type: 'select', options: DROPDOWN_OPTIONS.pendidikan },
  pengalaman: { label: 'Minimal Pengalaman Kerja (Tahun)', type: 'number' },
};

const GROUPS = [
  { key: 'posisi', title: 'Informasi Posisi', Icon: IconBriefcase, fields: ['kode', 'jabatan', 'levelJabatan', 'dept', 'lokasi', 'remote', 'ikatan', 'jumlah'] },
  { key: 'kompensasi', title: 'Kompensasi', Icon: IconMoney, fields: ['upahMin', 'upahMaks', 'siklus'] },
  { key: 'jadwal', title: 'Jadwal Rekrutmen', Icon: IconCalendar, fields: ['status', 'tglMulai', 'tglOnboard'] },
  { key: 'kualifikasi', title: 'Kualifikasi', Icon: IconGrad, fields: ['pendidikan', 'pengalaman'] },
];

function displayValue(key, data, departmentName) {
  if (key === 'kode') return data.kode || null;
  if (key === 'dept') return departmentName;
  if (key === 'status') return data.status || 'Rencana';
  if (key === 'tglMulai' || key === 'tglOnboard') return data[key] ? formatDateDisplay(data[key]) : null;
  if (key === 'pengalaman') return data.pengalaman ? `${data.pengalaman} Tahun` : null;
  if (key === 'jumlah') return data.jumlah ? `${data.jumlah} Orang` : null;
  return data[key] || null;
}

export default function LowonganDetailMobile({ seleksiId, jabatan: initialJabatan = '', navigate, back, activeTab: initialTab = 'ringkasan', overlay = null }) {
  const { companyId, companyPlan, companyName } = useAuth() || {};
  const {
    isLoading, isFreePlan, statusOptions,
    data, departments, departmentName, companyUsers, picUserId, picUser,
    deskripsiHtml, kriteria, isGeneratingKriteria,
    buildKaririUrl, karilEnabled, tahapTertinggi,
    toast, setToast,
    updateField, handleStatusChange, handleShareAction,
    handleDuplicate, handleArchive, saveDeskripsi, handleRefreshKriteria, updateKriteria, handlePicSave,
  } = useLowonganDetailData(seleksiId, companyId, companyPlan);

  const [activeTab, setActiveTab] = useState(initialTab || 'ringkasan');
  // Ganti tab menukar isi .msh-content (container scroll bersama di
  // MobileApp) tanpa remount div-nya sendiri, jadi scrollTop tab sebelumnya
  // kebawa terus kalau tidak di-reset manual.
  useEffect(() => {
    document.querySelector('.msh-content')?.scrollTo(0, 0);
  }, [activeTab]);
  const [openGroups, setOpenGroups] = useState(new Set(['posisi']));
  const [activeField, setActiveField] = useState(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [picSheetOpen, setPicSheetOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [kritExpanded, setKritExpanded] = useState(false);
  const [kritDraft, setKritDraft] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // QR di-buka lewat history entry baru (bukan local state) supaya gesture
  // "swipe back" native (yang men-trigger popstate, sama seperti tombol back
  // fisik) menutup panel ini dan kembali ke laman detail — bukan lompat lebih
  // jauh ke daftar Lowongan seperti sebelumnya.
  const qrOpen = overlay === 'qr';
  const openQr = () => karilEnabled && navigate('lowongan-detail_001', { seleksiId, jabatan, activeTab, overlay: 'qr' });
  const closeQr = () => back();

  const descEditorOpen = overlay === 'deskripsi';
  const descEditorRef = useRef(null);
  const openDescEditor = () => navigate('lowongan-detail_001', { seleksiId, jabatan, activeTab, overlay: 'deskripsi' });
  const closeDescEditor = () => back();
  const saveDescDraft = () => {
    if (descEditorRef.current) saveDeskripsi(descEditorRef.current.innerHTML);
    closeDescEditor();
  };

  const jabatan = data.jabatan || initialJabatan;
  const statusKey = (data.status || 'rencana').toLowerCase();
  const kaririUrl = buildKaririUrl(companyName);

  const toggleGroup = (key) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const openField = (key) => {
    if (key === 'status') { setStatusSheetOpen(true); return; }
    setFieldDraft(data[key] != null ? String(data[key]) : '');
    setActiveField(key);
  };

  const saveField = () => {
    const meta = FIELD_META[activeField];
    const val = meta.type === 'currency' ? formatRupiah(fieldDraft) : fieldDraft;
    updateField(activeField, val);
    setActiveField(null);
  };

  const selectFieldOption = (value) => {
    updateField(activeField, value);
    setActiveField(null);
  };

  const saveKritDraft = () => {
    if (!kritDraft.teks.trim()) {
      setToast({ message: 'Teks kriteria kosong', subMessage: 'Isi teks kriteria terlebih dahulu.', type: 'error' });
      return;
    }
    let newList;
    if (kritDraft.id) {
      newList = kriteria.map(k => k.id === kritDraft.id ? kritDraft : k);
    } else {
      const nextId = kriteria.length ? Math.max(...kriteria.map(k => k.id)) + 1 : 1;
      newList = [...kriteria, { ...kritDraft, id: nextId }];
    }
    updateKriteria(newList);
    setKritDraft(null);
  };

  const deleteKritDraft = () => {
    updateKriteria(kriteria.filter(k => k.id !== kritDraft.id));
    setKritDraft(null);
  };

  const wajibList = kriteria.filter(k => k.kategori === 'Wajib');
  const nilaiList = kriteria.filter(k => k.kategori === 'Nilai Tambah');
  const previewCount = 3;
  const hiddenCount = Math.max(0, wajibList.length - previewCount) + Math.max(0, nilaiList.length - previewCount);
  const shownWajib = kritExpanded ? wajibList : wajibList.slice(0, previewCount);
  const shownNilai = kritExpanded ? nilaiList : nilaiList.slice(0, previewCount);

  return (
    <>
      <div className="mld001-head">
        <div className="mld001-head-row">
          <button className="mld001-back" onClick={() => navigate('lowongan_001')}><IconBack /></button>
          <button className="mld001-back" onClick={() => setKebabOpen(true)}><IconKebab /></button>
        </div>
        <div className="mld001-title">{jabatan || 'Memuat…'}</div>
        <div className="mld001-status-row">
          <button
            className="mld001-status-pill"
            style={{ background: STATUS_TINT[statusKey], color: STATUS_DOT[statusKey] }}
            onClick={() => setStatusSheetOpen(true)}
          >
            <span className="mld001-status-dot" style={{ background: STATUS_DOT[statusKey] }} />
            {data.status || 'Rencana'}
            <IconChevronDown />
          </button>
          {tahapTertinggi && <span className="mld001-tahap-badge">{tahapTertinggi}</span>}
        </div>
        <div className="mld001-meta">
          {departmentName || 'Belum ada departemen'}
          {data.lokasi && <><span className="mld001-meta-dot" />{data.lokasi}</>}
        </div>

        <div className="mld001-actions-row">
          <button className={`mld001-action-btn${!karilEnabled ? ' disabled' : ''}`} onClick={() => karilEnabled && window.open(kaririUrl, '_blank', 'noopener,noreferrer')}>
            <IconEye /><span>Buka Halaman</span>
          </button>
          <button className={`mld001-action-icon-btn${!karilEnabled ? ' disabled' : ''}`} onClick={() => karilEnabled && setShareOpen(true)}>
            <IconShare />
          </button>
          <button className={`mld001-action-icon-btn${!karilEnabled ? ' disabled' : ''}`} onClick={openQr}>
            <IconQr />
          </button>
        </div>

        <button className="mld001-cta" onClick={() => navigate('lowongan-tambah-kandidat', { seleksiId, jabatan })}>
          <IconPlus />Tambah Kandidat
        </button>

        <div className="mld001-tabs">
          <button className={`mld001-tab${activeTab === 'ringkasan' ? ' active' : ''}`} onClick={() => setActiveTab('ringkasan')}>Ringkasan</button>
          <button className={`mld001-tab${activeTab === 'kandidat' ? ' active' : ''}`} onClick={() => setActiveTab('kandidat')}>Kandidat</button>
        </div>
      </div>

      {activeTab === 'kandidat' ? (
        <LowonganKandidatTab seleksiId={seleksiId} jabatan={jabatan} navigate={navigate} back={back} overlay={overlay} />
      ) : isLoading ? (
        <div className="mld001-body">
          <div className="msh-skel" style={{ height: 220 }} />
          <div className="msh-skel" style={{ height: 120 }} />
        </div>
      ) : (
        <div className="mld001-body">
          <div className="mld001-card">
            <div className="mld001-card-head"><span className="mld001-card-title">Detail Pekerjaan</span></div>
            {GROUPS.map(group => {
              const isOpen = openGroups.has(group.key);
              return (
                <div className={`mld001-group${isOpen ? ' open' : ''}`} key={group.key}>
                  <button className="mld001-group-head" onClick={() => toggleGroup(group.key)}>
                    <div className="mld001-group-head-left">
                      <div className="mld001-group-icon"><group.Icon /></div>
                      <div>
                        <div className="mld001-group-title">{group.title}</div>
                        <div className="mld001-group-sub">{group.fields.length} field</div>
                      </div>
                    </div>
                    <div className="mld001-group-chevron"><IconChevronDown /></div>
                  </button>
                  {isOpen && (
                    <div className="mld001-rows">
                      {group.fields.map(key => {
                        const meta = FIELD_META[key] || { label: 'Status Rekrutmen', type: 'status' };
                        const val = displayValue(key, data, departmentName);
                        return (
                          <button className="mld001-row" key={key} onClick={() => meta.type !== 'readonly' && openField(key)}>
                            <span className="mld001-row-label">{meta.label}</span>
                            <div className="mld001-row-val-wrap">
                              <span className={`mld001-row-val${!val ? ' muted' : ''}`}>{val || 'Belum diisi'}</span>
                              {meta.type !== 'readonly' && <span className="mld001-row-pencil"><IconPencil /></span>}
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

          <div className="mld001-card">
            <div className="mld001-card-head">
              <span className="mld001-card-title">Deskripsi Pekerjaan</span>
              <button className="mld001-card-edit" onClick={openDescEditor}><IconPencil />Edit</button>
            </div>
            {deskripsiHtml ? (
              <>
                <div className={`mld001-desc-fade${!descExpanded ? ' clamped' : ''}`}>
                  <div className="mld001-desc-text" dangerouslySetInnerHTML={{ __html: deskripsiHtml }} />
                </div>
                <button className="mld001-desc-more" onClick={() => setDescExpanded(v => !v)}>
                  {descExpanded ? 'Sembunyikan' : 'Lihat Deskripsi Lengkap'}
                </button>
              </>
            ) : (
              <button className="mld001-desc-empty mld001-desc-empty-btn" onClick={openDescEditor}>
                Deskripsi belum diisi. Ketuk untuk menambahkan.
              </button>
            )}
          </div>

          <div className="mld001-card">
            <div className="mld001-card-head">
              <span className="mld001-card-title">Kriteria Penilaian</span>
              <button
                className={`mld001-krit-refresh${isGeneratingKriteria ? ' busy' : ''}`}
                onClick={handleRefreshKriteria}
              >
                <IconRefresh />{isGeneratingKriteria ? 'Merumuskan…' : 'Rumuskan Ulang'}
              </button>
            </div>
            {isGeneratingKriteria ? (
              <div className="mld001-krit-empty">Sedang merumuskan kriteria dari deskripsi pekerjaan…</div>
            ) : kriteria.length === 0 ? (
              <div className="mld001-krit-empty">Belum ada kriteria penilaian. Tekan "Rumuskan Ulang" untuk merumuskan otomatis dari deskripsi pekerjaan, atau tambahkan manual di bawah.</div>
            ) : (
              <>
                {wajibList.length > 0 && (
                  <>
                    <div className="mld001-krit-sub"><span className="mld001-krit-sub-title">Kualifikasi Wajib</span><span className="mld001-krit-sub-count">{wajibList.length} kriteria</span></div>
                    <div className="mld001-krit-list">
                      {shownWajib.map(k => (
                        <button className="mld001-krit-item" key={k.id} onClick={() => setKritDraft({ ...k })}>
                          <span className="mld001-krit-bullet" /><span style={{ flex: 1 }}>{k.teks}</span>
                          <span className={`mld001-krit-bobot mld001-bobot-${k.bobot}`}>{k.bobot}</span>
                          <span className="mld001-krit-pencil"><IconPencil /></span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {nilaiList.length > 0 && (
                  <>
                    <div className="mld001-krit-sub"><span className="mld001-krit-sub-title">Nilai Tambah</span><span className="mld001-krit-sub-count">{nilaiList.length} kriteria</span></div>
                    <div className="mld001-krit-list">
                      {shownNilai.map(k => (
                        <button className="mld001-krit-item" key={k.id} onClick={() => setKritDraft({ ...k })}>
                          <span className="mld001-krit-bullet" /><span style={{ flex: 1 }}>{k.teks}</span>
                          <span className={`mld001-krit-bobot mld001-bobot-${k.bobot}`}>{k.bobot}</span>
                          <span className="mld001-krit-pencil"><IconPencil /></span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {hiddenCount > 0 && (
                  <button className="mld001-krit-more" onClick={() => setKritExpanded(v => !v)}>
                    {kritExpanded ? 'Sembunyikan' : `Lihat ${hiddenCount} Kriteria Lainnya`}
                  </button>
                )}
              </>
            )}
            <button
              className="mld001-krit-add"
              onClick={() => setKritDraft({ id: null, teks: '', kategori: 'Wajib', bobot: 'sedang' })}
            >
              <IconPlus />Tambah Kriteria
            </button>
          </div>

          <div className="mld001-card">
            <div className="mld001-card-head"><span className="mld001-card-title">Penanggung Jawab</span></div>
            <div className="mld001-pic-row">
              <div className="mld001-pic-avatar">{(picUser?.name || '?').charAt(0).toUpperCase()}</div>
              <div className="mld001-pic-body">
                <div className={`mld001-pic-name${!picUser ? ' muted' : ''}`}>{picUser?.name || 'Belum diisi'}</div>
                <div className="mld001-pic-role">Rekruter</div>
              </div>
              <button className="mld001-pic-change" onClick={() => setPicSheetOpen(true)}>Ganti</button>
            </div>
          </div>
        </div>
      )}

      {/* ── sheet: edit 1 field (teks/angka/tanggal/pilihan/departemen) ── */}
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
                    <div className="mld001-sheet-label">{group?.title}</div>
                    <div className="mld001-sheet-title">{meta.label}</div>
                    <div className="mld001-sheet-list">
                      {meta.options.map(opt => (
                        <button key={opt} className="mld001-select-opt" onClick={() => selectFieldOption(opt)}>
                          <span className="mld001-select-opt-label">{opt}</span>
                          {data[activeField] === opt && <span className="mld001-select-opt-check"><IconCheck /></span>}
                        </button>
                      ))}
                    </div>
                  </>
                );
              }
              if (meta.type === 'dept') {
                return (
                  <>
                    <div className="mld001-sheet-label">{group?.title}</div>
                    <div className="mld001-sheet-title">{meta.label}</div>
                    <div className="mld001-sheet-list">
                      {departments.map(d => (
                        <button key={d.id} className="mld001-select-opt" onClick={() => selectFieldOption(d.id)}>
                          <span className="mld001-select-opt-label">{d.name}</span>
                          {String(data.dept) === String(d.id) && <span className="mld001-select-opt-check"><IconCheck /></span>}
                        </button>
                      ))}
                    </div>
                  </>
                );
              }
              return (
                <>
                  <div className="mld001-sheet-label">{group?.title}</div>
                  <div className="mld001-sheet-title">{meta.label}</div>
                  <input
                    className="mld001-field-input"
                    type={meta.type === 'date' ? 'date' : meta.type === 'number' ? 'number' : 'text'}
                    value={fieldDraft}
                    onChange={e => setFieldDraft(e.target.value)}
                    placeholder="Tambahkan data"
                  />
                  <button className="mld001-sheet-cta" onClick={saveField}>Simpan Perubahan</button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: status ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${statusSheetOpen ? ' open' : ''}`} onClick={() => setStatusSheetOpen(false)} />
          <div className={`msh-sheet${statusSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mld001-sheet-label">Jadwal Rekrutmen</div>
            <div className="mld001-sheet-title">Ubah Status Lowongan</div>
            {DROPDOWN_OPTIONS.statusRekrutmen.map(label => {
              const key = label.toLowerCase();
              const locked = isFreePlan && !statusOptions.includes(label);
              return (
                <button
                  key={label}
                  className={`mld001-status-opt${locked ? ' locked' : ''}`}
                  onClick={() => {
                    if (locked) { setToast({ message: 'Perlu paket berlangganan', subMessage: `Status "${label}" hanya tersedia di paket berbayar.`, type: 'error' }); return; }
                    handleStatusChange(label);
                    setStatusSheetOpen(false);
                  }}
                >
                  <span className="mld001-status-opt-dot" style={{ background: STATUS_DOT[key] }} />
                  <span className="mld001-status-opt-label">{label}</span>
                  {locked ? <span className="mld001-status-lock">Berbayar</span>
                    : data.status === label ? <span className="mld001-status-opt-check"><IconCheck /></span> : null}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: tambah/edit kriteria penilaian ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${kritDraft ? ' open' : ''}`} onClick={() => setKritDraft(null)} />
          <div className={`msh-sheet${kritDraft ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {kritDraft && (
              <>
                <div className="mld001-sheet-title">{kritDraft.id ? 'Edit Kriteria' : 'Tambah Kriteria'}</div>
                <textarea
                  className="mld001-field-textarea"
                  value={kritDraft.teks}
                  onChange={e => setKritDraft(d => ({ ...d, teks: e.target.value }))}
                  placeholder="Tulis kriteria penilaian…"
                  rows={3}
                />
                <div className="mld001-sheet-label" style={{ marginTop: 16 }}>Kategori</div>
                <div className="mld001-seg-row">
                  {['Wajib', 'Nilai Tambah'].map(kat => (
                    <button
                      key={kat}
                      className={`mld001-seg-btn${kritDraft.kategori === kat ? ' active' : ''}`}
                      onClick={() => setKritDraft(d => ({ ...d, kategori: kat }))}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
                <div className="mld001-sheet-label">Bobot</div>
                <div className="mld001-seg-row">
                  {['rendah', 'sedang', 'tinggi'].map(b => (
                    <button
                      key={b}
                      className={`mld001-seg-btn${kritDraft.bobot === b ? ' active' : ''}`}
                      onClick={() => setKritDraft(d => ({ ...d, bobot: b }))}
                    >
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mld001-sheet-cta" onClick={saveKritDraft}>
                  {kritDraft.id ? 'Simpan Perubahan' : 'Tambah Kriteria'}
                </button>
                {kritDraft.id && (
                  <button className="mld001-sheet-delete" onClick={deleteKritDraft}>
                    <IconTrash />Hapus Kriteria
                  </button>
                )}
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: penanggung jawab ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${picSheetOpen ? ' open' : ''}`} onClick={() => setPicSheetOpen(false)} />
          <div className={`msh-sheet${picSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mld001-sheet-title">Ganti Penanggung Jawab</div>
            <div className="mld001-sheet-list">
              {companyUsers.map(u => (
                <button key={u.id} className="mld001-select-opt" onClick={() => { handlePicSave(u.id); setPicSheetOpen(false); }}>
                  <span className="mld001-select-opt-label">{u.name}</span>
                  {picUserId === u.id && <span className="mld001-select-opt-check"><IconCheck /></span>}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: menu titik-tiga (persis sama dengan menu "..." desktop) ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${kebabOpen ? ' open' : ''}`} onClick={() => setKebabOpen(false)} />
          <div className={`msh-sheet${kebabOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <button
              className={`mld001-kebab-item${isDuplicating ? ' busy' : ''}`}
              onClick={() => {
                setIsDuplicating(true);
                handleDuplicate((dup) => {
                  setIsDuplicating(false);
                  setKebabOpen(false);
                  navigate('lowongan-detail_001', { seleksiId: dup.id, jabatan: dup.jabatan, activeTab: 'ringkasan' });
                });
              }}
            >
              <IconCopy />{isDuplicating ? 'Menduplikat…' : 'Duplikat Lowongan'}
            </button>
            <div className="mld001-kebab-divider" />
            <button className="mld001-kebab-item" onClick={() => { setKebabOpen(false); setShowArchiveConfirm(true); }}>
              <IconArchive />Arsipkan
            </button>
          </div>
        </>,
        document.body
      )}

      {/* ── sheet: bagikan laman karier ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${shareOpen ? ' open' : ''}`} onClick={() => setShareOpen(false)} />
          <div className={`msh-sheet${shareOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mld001-sheet-title" style={{ marginBottom: 12 }}>Bagikan Laman Karier</div>
            <div className="mld001-share-link">
              <span>{kaririUrl}</span>
              <button className="mld001-share-copy" onClick={() => { handleShareAction('copy', companyName); setShareOpen(false); }}>Salin</button>
            </div>
            <div className="mld001-share-grid">
              {SHARE_PLATFORMS.map(({ key, label, Icon }) => (
                <button key={key} className="mld001-share-item" onClick={() => { handleShareAction(key, companyName); setShareOpen(false); }}>
                  <span className="mld001-share-icon"><Icon /></span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── full-screen: QR code ── */}
      {createPortal(
        <div className={`msh-fullscreen-panel${qrOpen ? ' open' : ''}`}>
          <div className="mld001-fs-top">
            <button className="mld001-fs-back" onClick={closeQr}><IconBack /></button>
            <span className="mld001-fs-title">QR Code Laman Karier</span>
          </div>
          <div className="mld001-fs-body">
            <div className="mld001-qr-hint">Pindai kode ini untuk membuka laman karier <strong>{jabatan}</strong> langsung dari ponsel.</div>
            <div className="mld001-qr-img-box">
              <img className="mld001-qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(kaririUrl)}`} alt="QR Code Laman Karir" />
            </div>
            <div className="mld001-qr-url-row">
              <span className="mld001-qr-url-icon"><IconLink /></span>
              <span>{kaririUrl}</span>
              <button className="mld001-share-copy" onClick={() => handleShareAction('copy', companyName)}>Salin</button>
            </div>
            <button
              className="mld001-qr-download"
              onClick={() => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(kaririUrl)}`;
                fetch(qrUrl).then(res => res.blob()).then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const safeName = (jabatan || 'Karir').replace(/[^a-zA-Z0-9]/g, '_');
                  a.download = `QRCode-LamanKarir-${safeName}.png`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                }).catch(() => window.open(qrUrl, '_blank'));
              }}
            >
              <IconDownload />Unduh Gambar QR Code
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── full-screen: edit deskripsi pekerjaan ── */}
      {createPortal(
        <div className={`msh-fullscreen-panel${descEditorOpen ? ' open' : ''}`}>
          <div className="mld001-fs-top">
            <button className="mld001-fs-back" onClick={closeDescEditor}><IconBack /></button>
            <span className="mld001-fs-title">Edit Deskripsi Pekerjaan</span>
          </div>
          <div className="mld001-fs-body">
            {/* key berubah tiap overlay ini dibuka/ditutup — editor uncontrolled
                (seed sekali dari initialHtml), jadi harus remount tiap sesi
                edit baru supaya kontennya sinkron ulang dengan deskripsiHtml
                terkini alih-alih nyangkut di isi pertama kali komponen mount. */}
            <MobileRichTextEditor
              key={String(descEditorOpen)}
              editorRef={descEditorRef}
              initialHtml={deskripsiHtml}
              placeholder="Tulis deskripsi pekerjaan…"
            />
            <button className="mld001-sheet-cta" onClick={saveDescDraft}>Simpan Deskripsi</button>
          </div>
        </div>,
        document.body
      )}

      {showArchiveConfirm && (
        <PopupKonfirmasi
          title="Arsipkan Lowongan"
          body={`Apakah Anda yakin ingin mengarsipkan lowongan "${jabatan}"? Lowongan yang diarsipkan tidak akan tampil di daftar lowongan aktif.`}
          confirmLabel="Arsipkan"
          onConfirm={() => handleArchive(() => navigate('lowongan_001'))}
          onClose={() => setShowArchiveConfirm(false)}
        />
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
