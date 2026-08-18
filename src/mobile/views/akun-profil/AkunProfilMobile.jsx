import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { ID_INDUSTRIES } from '../../../components/InlineEditRow.jsx';
import PopupKonfirmasiPassword from '../../../components/PopupKonfirmasiPassword.jsx';
import useAkunProfilData from '../../../hooks/akun-profil/useAkunProfilData.js';
import MobileRichTextEditor from '../../components/MobileRichTextEditor.jsx';
import MobileToast from '../../components/MobileToast.jsx';
import '../../../../css/mobile/akun-profil/akun-profil.css';

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconPencil = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconBuilding = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const IconMapPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
const IconUser = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconShield = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z" /></svg>);
const IconLock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);

const UKURAN_PERUSAHAAN_OPTS = ['1-10 Karyawan', '11-50 Karyawan', '51-200 Karyawan', '201-500 Karyawan', '501-1000 Karyawan', '1000+ Karyawan'];
const JENIS_BADAN_USAHA_OPTS = ['PT', 'CV', 'Firma', 'Koperasi', 'Yayasan', 'BUMN', 'Startup/Perorangan', 'Lainnya'];

// GROUPS mengikuti pola FIELD_META/GROUPS di LowonganDetailMobile — accordion
// kartu, tiap baris field diketuk buka bottom sheet (teks atau daftar
// opsi). `source` menentukan objek data & handler save yang dipakai:
// 'company' → perusahaan/handleUpdateCompany, 'social' → media_sosial/
// handleUpdateSocial, 'profile' → profil/handleUpdateProfile.
const GROUPS = [
  {
    key: 'perusahaan', title: 'Profil Perusahaan', subtitle: 'Tampil di lowongan & laman karier', Icon: IconBuilding,
    fields: [
      { key: 'namaPerusahaan', label: 'Nama Perusahaan', type: 'text', source: 'company' },
      { key: 'industri', label: 'Industri', type: 'select', options: ID_INDUSTRIES, source: 'company' },
      { key: 'ukuran', label: 'Ukuran Perusahaan', type: 'select', options: UKURAN_PERUSAHAAN_OPTS, source: 'company' },
      { key: 'tahun_didirikan', label: 'Tahun Didirikan', type: 'number', source: 'company' },
      { key: 'jenis_badan_usaha', label: 'Jenis Badan Usaha', type: 'select', options: JENIS_BADAN_USAHA_OPTS, source: 'company' },
    ],
  },
  {
    key: 'kontak', title: 'Lokasi & Kontak', subtitle: 'Alamat, situs web, kontak resmi', Icon: IconMapPin,
    fields: [
      { key: 'lokasi', label: 'Lokasi', type: 'text', source: 'company' },
      { key: 'alamat', label: 'Alamat Lengkap', type: 'text', source: 'company' },
      { key: 'website', label: 'Website', type: 'text', source: 'company' },
      { key: 'email_kontak', label: 'Email', type: 'text', source: 'company' },
      { key: 'telepon_kontak', label: 'Nomor Telepon', type: 'tel', source: 'company' },
    ],
  },
  {
    key: 'sosial', title: 'Media Sosial & Video', subtitle: 'Instagram, LinkedIn, TikTok, YouTube', Icon: IconShare,
    fields: [
      { key: 'instagram', label: 'Instagram (Link)', type: 'text', source: 'social' },
      { key: 'linkedin', label: 'LinkedIn (Link)', type: 'text', source: 'social' },
      { key: 'tiktok', label: 'TikTok (Link)', type: 'text', source: 'social' },
      { key: 'video_profil_url', label: 'Video Profil (YouTube)', type: 'text', source: 'company' },
    ],
  },
  {
    key: 'saya', title: 'Profil Saya', subtitle: 'Nama, peran, kontak pribadi Anda', Icon: IconUser,
    fields: [
      { key: 'namaLengkap', label: 'Nama Lengkap', type: 'text', source: 'profile' },
      { key: 'namaTampilan', label: 'Nama Tampilan', type: 'text', source: 'profile' },
      { key: 'peran', label: 'Peran (Role)', type: 'locked-role' },
      { key: 'email', label: 'Alamat Email', type: 'locked-password' },
      { key: 'telepon', label: 'Nomor Telepon', type: 'tel', source: 'profile' },
      { key: 'lokasi', label: 'Lokasi', type: 'text', source: 'profile' },
    ],
  },
];

export default function AkunProfilMobile() {
  const { user, profileName, companyId, companyName, companyDetails, userRole, refreshCompanyData } = useAuth() || {};
  const {
    perusahaan, profil,
    handleUpdateCompany, handleUpdateSocial, handleUpdateProfile, uploadCompanyAsset,
    toast, setToast, showToast,
  } = useAkunProfilData(companyId, companyName, companyDetails, user, refreshCompanyData);

  const [openGroups, setOpenGroups] = useState(new Set(['perusahaan']));
  const [activeField, setActiveField] = useState(null); // { groupKey, fieldKey }
  const [fieldDraft, setFieldDraft] = useState('');
  const [descEditorOpen, setDescEditorOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [keamananOpen, setKeamananOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const descEditorRef = useRef(null);
  const logoInputRef = useRef(null);

  const toggleGroup = (key) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const getFieldMeta = (groupKey, fieldKey) => {
    const group = GROUPS.find(g => g.key === groupKey);
    return { group, field: group?.fields.find(f => f.key === fieldKey) };
  };

  const getFieldValue = (groupKey, fieldKey) => {
    const { field } = getFieldMeta(groupKey, fieldKey);
    if (!field) return '';
    if (fieldKey === 'peran') return userRole || 'Admin';
    if (field.source === 'profile') return profil[fieldKey] || '';
    if (field.source === 'social') return perusahaan.media_sosial?.[fieldKey] || '';
    return perusahaan[fieldKey] || '';
  };

  const openField = (groupKey, fieldKey) => {
    if (fieldKey === 'peran') return;
    if (fieldKey === 'email') { setShowEmailPopup(true); return; }
    setFieldDraft(getFieldValue(groupKey, fieldKey));
    setActiveField({ groupKey, fieldKey });
  };

  const saveField = async (value) => {
    if (!activeField) return;
    const { field } = getFieldMeta(activeField.groupKey, activeField.fieldKey);
    if (field.source === 'profile') await handleUpdateProfile(activeField.fieldKey, value);
    else if (field.source === 'social') await handleUpdateSocial(activeField.fieldKey, value);
    else await handleUpdateCompany(activeField.fieldKey, value);
    setActiveField(null);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadCompanyAsset(file, 'logo');
      await handleUpdateCompany('logo_url', url);
    } catch (err) {
      console.error(err);
      showToast('Gagal', 'Gagal mengunggah logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveDeskripsi = () => {
    if (descEditorRef.current) handleUpdateCompany('deskripsi', descEditorRef.current.innerHTML);
    setDescEditorOpen(false);
  };

  const profileInitial = (profil.namaLengkap || user?.email || '?').charAt(0).toUpperCase();
  const activeMeta = activeField ? getFieldMeta(activeField.groupKey, activeField.fieldKey) : null;

  return (
    <>
      <div className="map001-head">
        <div className="map001-title">Akun dan Profil</div>
      </div>

      <div className="map001-hero">
        <div className="map001-avatar">{profileInitial}</div>
        <div className="map001-hero-text">
          <div className="map001-hero-name">{profil.namaLengkap || 'Belum ada nama'}</div>
          <div className="map001-hero-email">{profil.email}</div>
          <div className="map001-hero-chip"><IconBuilding />{perusahaan.namaPerusahaan || 'Perusahaan Anda'}</div>
        </div>
      </div>

      {GROUPS.map(group => {
        const isOpen = openGroups.has(group.key);
        return (
          <div className={`map001-card${isOpen ? ' open' : ''}`} key={group.key}>
            <button className="map001-card-head" onClick={() => toggleGroup(group.key)}>
              <div className="map001-card-head-left">
                <div className="map001-card-icon"><group.Icon /></div>
                <div>
                  <div className="map001-card-title">{group.title}</div>
                  <div className="map001-card-sub">{group.subtitle}</div>
                </div>
              </div>
              <div className="map001-chevron"><IconChevronDown /></div>
            </button>

            {isOpen && (
              <>
                {group.key === 'perusahaan' && (
                  <div className="map001-logo-row">
                    <div className="map001-logo-box" style={perusahaan.logo_url ? { backgroundImage: `url(${perusahaan.logo_url})` } : undefined}>
                      {!perusahaan.logo_url && 'LOGO'}
                    </div>
                    <button className="map001-logo-upload" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                      <IconUpload />{uploadingLogo ? 'Mengunggah…' : (perusahaan.logo_url ? 'Ubah Logo' : 'Unggah Logo')}
                    </button>
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  </div>
                )}

                <div className="map001-rows">
                  {group.fields.map(f => {
                    const isLocked = f.type.startsWith('locked');
                    const value = getFieldValue(group.key, f.key);
                    return (
                      <button className="map001-row" key={f.key} onClick={() => openField(group.key, f.key)}>
                        <span className="map001-row-label">{f.label}</span>
                        <span className="map001-row-val-wrap">
                          {f.key === 'peran' && <span className="map001-row-default-badge">DEFAULT</span>}
                          <span className={`map001-row-val${!value ? ' muted' : ''}`}>{value || 'Belum diatur'}</span>
                          <span className="map001-row-pencil">{isLocked ? <IconLock /> : <IconPencil />}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {group.key === 'perusahaan' && (
                  <div className="map001-desc-wrap">
                    <div className="map001-desc-box" onClick={() => setDescEditorOpen(true)}>
                      <div className="map001-desc-label">
                        Deskripsi
                        <span className="map001-desc-edit-tag"><IconPencil />Edit</span>
                      </div>
                      <div className={`map001-desc-text${!perusahaan.deskripsi ? ' empty' : ''}`}>
                        {perusahaan.deskripsi
                          ? <span dangerouslySetInnerHTML={{ __html: perusahaan.deskripsi }} />
                          : 'Belum ada deskripsi perusahaan. Ketuk untuk menambahkan…'}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <div className={`map001-card${keamananOpen ? ' open' : ''}`}>
        <button className="map001-card-head" onClick={() => setKeamananOpen(v => !v)}>
          <div className="map001-card-head-left">
            <div className="map001-card-icon"><IconShield /></div>
            <div>
              <div className="map001-card-title">Keamanan Akun</div>
              <div className="map001-card-sub">Perbarui kata sandi akun</div>
            </div>
          </div>
          <div className="map001-chevron"><IconChevronDown /></div>
        </button>
        {keamananOpen && (
          <div className="map001-pw-form">
            <div className="map001-pw-group"><label>Kata Sandi Lama</label><input type="password" placeholder="Masukkan kata sandi lama" /></div>
            <div className="map001-pw-group"><label>Kata Sandi Baru</label><input type="password" placeholder="Masukkan kata sandi baru" /></div>
            <div className="map001-pw-group"><label>Ulangi Kata Sandi Baru</label><input type="password" placeholder="Ketik ulang kata sandi baru" /></div>
            <div className="map001-pw-actions">
              <button className="map001-pw-cancel" onClick={() => setKeamananOpen(false)}>Batal</button>
              <button className="map001-pw-submit" onClick={() => setKeamananOpen(false)}>Ubah Kata Sandi</button>
            </div>
          </div>
        )}
      </div>

      {/* ── sheet: edit field ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${activeField ? ' open' : ''}`} onClick={() => setActiveField(null)} />
          <div className={`msh-sheet${activeField ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {activeMeta?.field && (
              activeMeta.field.type === 'select' ? (
                <>
                  <div className="map001-sheet-label">{activeMeta.group.title}</div>
                  <div className="map001-sheet-title">{activeMeta.field.label}</div>
                  <div className="map001-sheet-list">
                    {activeMeta.field.options.map(opt => (
                      <button key={opt} className="map001-select-opt" onClick={() => saveField(opt)}>
                        <span className="map001-select-opt-label">{opt}</span>
                        {getFieldValue(activeField.groupKey, activeField.fieldKey) === opt && <span className="map001-select-opt-check"><IconCheck /></span>}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="map001-sheet-label">{activeMeta.group.title}</div>
                  <div className="map001-sheet-title">{activeMeta.field.label}</div>
                  <input
                    className="map001-field-input"
                    type={activeMeta.field.type === 'number' ? 'number' : 'text'}
                    value={fieldDraft}
                    onChange={e => setFieldDraft(e.target.value)}
                    placeholder="Tambahkan data"
                  />
                  <button className="map001-sheet-cta" onClick={() => saveField(fieldDraft)}>Simpan Perubahan</button>
                </>
              )
            )}
          </div>
        </>,
        document.body
      )}

      {/* ── full-screen: edit deskripsi perusahaan ── */}
      {createPortal(
        <div className={`msh-fullscreen-panel${descEditorOpen ? ' open' : ''}`}>
          <div className="map001-fs-top">
            <button className="map001-fs-back" onClick={() => setDescEditorOpen(false)}><IconBack /></button>
            <span className="map001-fs-title">Edit Deskripsi Perusahaan</span>
          </div>
          <div className="map001-fs-body">
            <MobileRichTextEditor
              key={String(descEditorOpen)}
              editorRef={descEditorRef}
              initialHtml={perusahaan.deskripsi}
              placeholder="Ceritakan tentang perusahaan Anda…"
            />
            <button className="map001-fs-save" onClick={saveDeskripsi}>Simpan Deskripsi</button>
          </div>
        </div>,
        document.body
      )}

      {showEmailPopup && (
        <PopupKonfirmasiPassword onConfirm={() => setShowEmailPopup(false)} onClose={() => setShowEmailPopup(false)} />
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
