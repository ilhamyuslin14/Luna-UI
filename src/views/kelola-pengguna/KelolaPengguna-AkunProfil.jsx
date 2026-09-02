import React, { useState, useRef, memo } from 'react';
import PopupKonfirmasiPassword from '../../components/PopupKonfirmasiPassword.jsx';
import InlineEditRow from '../../components/InlineEditRow.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useAkunProfilData from '../../hooks/akun-profil/useAkunProfilData.js';

const buildingIcon     = '/assets/building.svg';
const userProfileIcon  = '/assets/user_profile.svg';
const lockIcon         = '/assets/lock.svg';
const shieldIcon       = '/assets/shield.svg';
const chevronRightIcon = '/assets/chevron_right.svg';

const JENIS_BADAN_USAHA_OPTS = ['PT', 'CV', 'Firma', 'Koperasi', 'Yayasan', 'BUMN', 'Startup/Perorangan', 'Lainnya'];
const UKURAN_PERUSAHAAN_OPTS = ['1-10 Karyawan', '11-50 Karyawan', '51-200 Karyawan', '201-500 Karyawan', '501-1000 Karyawan', '1000+ Karyawan'];

const UploadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Toolbar icons for Rich Text Deskripsi Editor ──
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

const TBtn = ({ title, cmd, val, children, onClick }) => (
  <button
    type="button"
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

const EditableContent = memo(
  ({ htmlRef, initialHtml }) => (
    <div
      ref={htmlRef}
      contentEditable
      suppressContentEditableWarning
      className="sd-deskripsi-content sd-deskripsi-editable"
      style={{ minHeight: '160px', padding: '16px', outline: 'none', background: '#fff', fontSize: '13px', lineHeight: '1.6', color: '#1e293b' }}
      dangerouslySetInnerHTML={{ __html: initialHtml || '' }}
    />
  ),
  () => true
);

export default function KelolaPenggunaAkunProfil() {
  const { user, companyId, companyName, companyDetails, userRole, refreshCompanyData } = useAuth();
  const {
    perusahaan, profil,
    handleUpdateCompany, handleUpdateSocial, handleUpdateProfile, uploadCompanyAsset,
    toast, setToast, showToast,
  } = useAkunProfilData(companyId, companyName, companyDetails, user, refreshCompanyData);

  const [isKeamananExpanded, setIsKeamananExpanded] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [cropModal, setCropModal] = useState({
    isOpen: false,
    type: 'logo',
    imageSrc: null,
    file: null,
    zoom: 1,
    offsetX: 50,
    offsetY: 50,
    isDragging: false,
    dragStart: { x: 0, y: 0, initialOffsetX: 50, initialOffsetY: 50 },
  });

  const openCropModal = (file, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCropModal({
          isOpen: true,
          type,
          imageSrc: src,
          file,
          naturalWidth: img.naturalWidth || img.width,
          naturalHeight: img.naturalHeight || img.height,
          zoom: 1,
          offsetX: 50,
          offsetY: 50,
          isDragging: false,
          dragStart: { x: 0, y: 0, initialOffsetX: 50, initialOffsetY: 50 },
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const getPreviewTransform = () => {
    const { naturalWidth: imgW, naturalHeight: imgH, zoom, offsetX, offsetY, type } = cropModal;
    if (!imgW || !imgH) return `translate(-50%, -50%) scale(${zoom})`;

    const isLogo = type === 'logo';
    const targetW = isLogo ? 400 : 1200;
    const targetH = isLogo ? 400 : 350;
    const targetRatio = targetW / targetH;
    const imgRatio = imgW / imgH;

    let baseW, baseH;
    if (imgRatio > targetRatio) {
      baseH = imgH;
      baseW = baseH * targetRatio;
    } else {
      baseW = imgW;
      baseH = baseW / targetRatio;
    }

    const cropW = baseW / zoom;
    const cropH = baseH / zoom;

    const maxCropX = Math.max(0, imgW - cropW);
    const maxCropY = Math.max(0, imgH - cropH);

    const cropX = (maxCropX * offsetX) / 100;
    const cropY = (maxCropY * offsetY) / 100;

    const centerX = cropX + cropW / 2;
    const centerY = cropY + cropH / 2;

    const shiftX = centerX - imgW / 2;
    const shiftY = centerY - imgH / 2;

    const transX = (-shiftX / imgW) * 100 * zoom;
    const transY = (-shiftY / imgH) * 100 * zoom;

    return `translate(-50%, -50%) translate(${transX}%, ${transY}%) scale(${zoom})`;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    openCropModal(file, 'logo');
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    openCropModal(file, 'banner');
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setCropModal(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY, initialOffsetX: prev.offsetX, initialOffsetY: prev.offsetY }
    }));
  };

  const handleMouseMove = (e) => {
    if (!cropModal.isDragging) return;
    const dx = e.clientX - cropModal.dragStart.x;
    const dy = e.clientY - cropModal.dragStart.y;
    const newX = Math.max(0, Math.min(100, cropModal.dragStart.initialOffsetX - (dx / 3.5)));
    const newY = Math.max(0, Math.min(100, cropModal.dragStart.initialOffsetY - (dy / 3.5)));
    setCropModal(prev => ({ ...prev, offsetX: newX, offsetY: newY }));
  };

  const handleMouseUp = () => {
    if (cropModal.isDragging) {
      setCropModal(prev => ({ ...prev, isDragging: false }));
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    setCropModal(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: touch.clientX, y: touch.clientY, initialOffsetX: prev.offsetX, initialOffsetY: prev.offsetY }
    }));
  };

  const handleTouchMove = (e) => {
    if (!cropModal.isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - cropModal.dragStart.x;
    const dy = touch.clientY - cropModal.dragStart.y;
    const newX = Math.max(0, Math.min(100, cropModal.dragStart.initialOffsetX - (dx / 3.5)));
    const newY = Math.max(0, Math.min(100, cropModal.dragStart.initialOffsetY - (dy / 3.5)));
    setCropModal(prev => ({ ...prev, offsetX: newX, offsetY: newY }));
  };

  const handleApplyCrop = async () => {
    if (!cropModal.imageSrc || !cropModal.file) return;
    const isLogo = cropModal.type === 'logo';
    if (isLogo) setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = cropModal.imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const targetW = isLogo ? 400 : 1200;
      const targetH = isLogo ? 400 : 350;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      const targetRatio = targetW / targetH;
      const imgRatio = img.width / img.height;

      let cropW, cropH;
      if (imgRatio > targetRatio) {
        cropH = img.height / cropModal.zoom;
        cropW = cropH * targetRatio;
      } else {
        cropW = img.width / cropModal.zoom;
        cropH = cropW / targetRatio;
      }

      const maxCropX = Math.max(0, img.width - cropW);
      const maxCropY = Math.max(0, img.height - cropH);

      const cropX = Math.max(0, Math.min(maxCropX, (maxCropX * cropModal.offsetX) / 100));
      const cropY = Math.max(0, Math.min(maxCropY, (maxCropY * cropModal.offsetY) / 100));

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      const croppedFile = new File([blob], cropModal.file.name, { type: 'image/jpeg' });

      const url = await uploadCompanyAsset(croppedFile, isLogo ? 'logo' : 'banner');
      await handleUpdateCompany(isLogo ? 'logo_url' : 'banner_url', url);

      setCropModal(prev => ({ ...prev, isOpen: false }));
      showToast('Berhasil', `${isLogo ? 'Logo' : 'Banner'} perusahaan berhasil disesuaikan & diperbarui!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal', `Gagal menyimpan ${isLogo ? 'logo' : 'banner'}`, 'error');
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  return (
    <div className="pap-view">
      <div className="pap-wrapper">

        <div className="pap-header">
          <div className="pap-header-row">
            <h1 className="pap-page-title">Akun dan Profil</h1>
            {companyDetails?.slug && (
              <a
                className="pap-view-laman-btn"
                href={`/?view=laman-perusahaan&slug=${encodeURIComponent(companyDetails.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconEye />
                Lihat Laman Perusahaan
              </a>
            )}
          </div>
        </div>

        <div className="pap-content">

          {/* Profil Perusahaan */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-icon-box">
                <img src={buildingIcon} alt="Building" width="20" height="20" />
              </div>
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Profil Perusahaan</h2>
                <p className="pap-card-subtitle">Informasi ini tampil di lowongan dan laman karier Anda.</p>
              </div>
            </div>

            <div className="pap-card-body" style={{ paddingTop: '16px' }}>
              <div className="pap-logo-row">
                <div className="pap-logo-preview" style={perusahaan.logo_url ? { backgroundImage: `url(${perusahaan.logo_url})` } : undefined}>
                  {!perusahaan.logo_url && 'LOGO'}
                </div>
                <div className="pap-logo-meta">
                  <span className="pap-logo-meta-title">Logo Perusahaan</span>
                  <button className="pap-upload-btn-sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    <UploadIcon />
                    {uploadingLogo ? 'Mengunggah...' : (perusahaan.logo_url ? 'Ubah Logo' : 'Unggah Logo')}
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                </div>
              </div>
            </div>

            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px', paddingBottom: '12px' }}>
              <InlineEditRow label="Nama Perusahaan" value={perusahaan.namaPerusahaan} onSave={(val) => handleUpdateCompany('namaPerusahaan', val)} />
              <InlineEditRow label="Industri" value={perusahaan.industri} onSave={(val) => handleUpdateCompany('industri', val)} type="industry" placeholder="Ketik nama industri (min. 2 huruf)..." />
              <InlineEditRow label="Ukuran Perusahaan" value={perusahaan.ukuran} onSave={(val) => handleUpdateCompany('ukuran', val)} type="dropdown" options={UKURAN_PERUSAHAAN_OPTS} placeholder="Pilih ukuran perusahaan" />
              <InlineEditRow label="Tahun Didirikan" value={perusahaan.tahun_didirikan} onSave={(val) => handleUpdateCompany('tahun_didirikan', val)} type="number" placeholder="Contoh: 2019" />
              <InlineEditRow label="Jenis Badan Usaha" value={perusahaan.jenis_badan_usaha} onSave={(val) => handleUpdateCompany('jenis_badan_usaha', val)} type="dropdown" options={JENIS_BADAN_USAHA_OPTS} />

              {/* Deskripsi Card — Positioned right after Jenis Badan Usaha */}
              <div className="pap-deskripsi-card-wrap" style={{ margin: '10px 0 6px 0' }}>
                <div className="pap-deskripsi-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
                  <div className="pap-deskripsi-card-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      DESKRIPSI
                    </span>
                  </div>

                  {isEditingDesc ? (
                    /* ── Edit Mode (Screenshot 2) ── */
                    <div className="sd-deskripsi-editor">
                      <div className="sd-deskripsi-toolbar" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
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

                      <EditableContent htmlRef={editorRef} initialHtml={perusahaan.deskripsi} />

                      <div className="pap-deskripsi-editor-footer" style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => setIsEditingDesc(false)}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          style={{ background: 'var(--luna-orange-400)', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 141, 33, 0.25)' }}
                          onClick={async () => {
                            const htmlContent = editorRef.current?.innerHTML || '';
                            await handleUpdateCompany('deskripsi', htmlContent);
                            setIsEditingDesc(false);
                          }}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View Mode (Screenshot 1) ── */
                    <div style={{ padding: '12px 16px' }}>
                      <div
                        className="pap-deskripsi-view-box"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          minHeight: '100px',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease-in-out',
                        }}
                        onClick={() => setIsEditingDesc(true)}
                      >
                        {perusahaan.deskripsi ? (
                          <div
                            style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}
                            dangerouslySetInnerHTML={{ __html: perusahaan.deskripsi }}
                          />
                        ) : (
                          <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Belum ada deskripsi perusahaan. Klik di sini untuk menambahkan deskripsi...
                          </div>
                        )}

                        <div
                          className="pap-deskripsi-hover-tooltip"
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '12px',
                            background: '#334155',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            pointerEvents: 'none',
                            opacity: 0.9,
                          }}
                        >
                          Klik untuk mengedit
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi & Kontak */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Lokasi & Kontak</h2>
                <p className="pap-card-subtitle">Alamat resmi, situs web, dan informasi kontak perusahaan Anda.</p>
              </div>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', paddingBottom: '16px' }}>
              <InlineEditRow label="Lokasi" value={perusahaan.lokasi} onSave={(val) => handleUpdateCompany('lokasi', val)} type="location" placeholder="Ketik nama kota atau provinsi..." />
              <InlineEditRow label="Alamat Lengkap" value={perusahaan.alamat} onSave={(val) => handleUpdateCompany('alamat', val)} placeholder="Jalan, nomor, kecamatan, kota" />
              <InlineEditRow label="Website" value={perusahaan.website} onSave={(val) => handleUpdateCompany('website', val)} placeholder="https://" />
              <InlineEditRow label="Email" value={perusahaan.email_kontak} onSave={(val) => handleUpdateCompany('email_kontak', val)} placeholder="hr@perusahaan.com" />
              <InlineEditRow label="Nomor Telepon" value={perusahaan.telepon_kontak} onSave={(val) => handleUpdateCompany('telepon_kontak', val)} type="tel" />
            </div>
          </div>

          {/* Media Sosial */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Media Sosial</h2>
                <p className="pap-card-subtitle">Tautan ke akun media sosial resmi perusahaan Anda.</p>
              </div>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', paddingBottom: '16px' }}>
              <InlineEditRow label="Instagram (Link)" value={perusahaan.media_sosial?.instagram} onSave={(val) => handleUpdateSocial('instagram', val)} placeholder="https://instagram.com/namaperusahaan atau @username" />
              <InlineEditRow label="LinkedIn (Link)" value={perusahaan.media_sosial?.linkedin} onSave={(val) => handleUpdateSocial('linkedin', val)} placeholder="https://linkedin.com/company/namaperusahaan" />
              <InlineEditRow label="TikTok (Link)" value={perusahaan.media_sosial?.tiktok} onSave={(val) => handleUpdateSocial('tiktok', val)} placeholder="https://tiktok.com/@namaperusahaan atau @username" />
            </div>
          </div>

          {/* Video Profil */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Video Profil</h2>
                <p className="pap-card-subtitle">Sematkan tautan video YouTube pengenalan perusahaan.</p>
              </div>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', paddingBottom: '16px' }}>
              <InlineEditRow label="Video Profil (Link YouTube)" value={perusahaan.video_profil_url} onSave={(val) => handleUpdateCompany('video_profil_url', val)} placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>

          {/* Detail Profil */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-icon-box">
                <img src={userProfileIcon} alt="User" width="20" height="20" />
              </div>
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Detail Profil</h2>
                <p className="pap-card-subtitle">Kelola profil pengguna dan detail kontak Anda.</p>
              </div>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px' }}>
              <InlineEditRow label="Nama Lengkap"   value={profil.namaLengkap}  onSave={(val) => handleUpdateProfile('namaLengkap', val)} />
              <InlineEditRow label="Nama Tampilan"  value={profil.namaTampilan} onSave={(val) => handleUpdateProfile('namaTampilan', val)} />

              {/* Peran — locked */}
              <div className="inline-edit-row">
                <div className="inline-edit-label">Peran (Role)</div>
                <div className="inline-edit-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="pap-role-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pap-value-light" style={{textTransform: 'capitalize', color: '#8892a3'}}>{userRole || 'Admin'}</span>
                    <img src={lockIcon} alt="Lock" width="12" height="12" />
                  </div>
                  <span className="pap-badge-default" style={{ fontSize: '10px', background: '#f4f6f9', padding: '2px 6px', borderRadius: '4px', color: '#8892a3', fontWeight: 'bold' }}>DEFAULT</span>
                </div>
              </div>

              {/* Email — locked, but open popup on click */}
              <div className="inline-edit-row" onClick={() => setShowEmailPopup(true)} style={{cursor: 'pointer'}}>
                <div className="inline-edit-label">Alamat Email</div>
                <div className="inline-edit-value">
                  <span className="inline-edit-text">{profil.email}</span>
                </div>
              </div>

              <InlineEditRow label="Nomor Telepon"  value={profil.telepon} onSave={(val) => handleUpdateProfile('telepon', val)} type="tel" />
              <InlineEditRow label="Lokasi"         value={profil.lokasi} onSave={(val) => handleUpdateProfile('lokasi', val)} type="location" />
            </div>
          </div>

          {/* Keamanan Akun */}
          <div className="pap-card">
            <div
              className={`pap-card-header pap-card-clickable ${isKeamananExpanded ? '' : 'no-border'}`}
              onClick={() => setIsKeamananExpanded(!isKeamananExpanded)}
            >
              <div className="pap-icon-box">
                <img src={shieldIcon} alt="Shield" width="18" height="21" />
              </div>
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Keamanan Akun</h2>
                <p className="pap-card-subtitle">Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data rekrutmen perusahaan.</p>
              </div>
              <div className="pap-arrow-right" style={{ transform: isKeamananExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <img src={chevronRightIcon} alt="Right Arrow" width="14" height="14" />
              </div>
            </div>
            {isKeamananExpanded && (
              <div className="pap-form-container">
                <div className="pap-form-group"><label>Kata Sandi Lama</label><input type="password" placeholder="Masukkan kata sandi lama" /></div>
                <div className="pap-form-group"><label>Kata Sandi Baru</label><input type="password" placeholder="Masukkan kata sandi baru" /></div>
                <div className="pap-form-group"><label>Ulangi Kata Sandi Baru</label><input type="password" placeholder="Ketik ulang kata sandi baru" /></div>
                <div className="pap-form-actions">
                  <button className="pap-btn-cancel" onClick={() => setIsKeamananExpanded(false)}>Batal</button>
                  <button className="pap-btn-submit" onClick={() => setIsKeamananExpanded(false)}>Ubah Kata Sandi</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {showEmailPopup && (
        <PopupKonfirmasiPassword
          onConfirm={() => {
            setShowEmailPopup(false);
          }}
          onClose={() => setShowEmailPopup(false)}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          subMessage={toast.subMessage} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Modal Crop & Adjust Posisi Gambar (Logo / Banner) */}
      {cropModal.isOpen && (
        <div className="pap-crop-overlay" onClick={() => setCropModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="pap-crop-card" onClick={e => e.stopPropagation()}>
            <div className="pap-crop-header">
              <div>
                <h3 className="pap-crop-title">
                  Adjust Posisi {cropModal.type === 'logo' ? 'Logo' : 'Banner'} Perusahaan
                </h3>
                <p className="pap-crop-sub">
                  Atur skala zoom dan geser posisi gambar untuk menyesuaikan area yang ingin ditampilkan.
                </p>
              </div>
              <button
                className="pap-crop-close-btn"
                onClick={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
              >
                ×
              </button>
            </div>

            <div className="pap-crop-body">
              <div
                className="pap-crop-viewport-wrap"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <div
                  className={`pap-crop-viewport ${cropModal.type}`}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <img
                    src={cropModal.imageSrc}
                    alt="Preview"
                    className="pap-crop-img-preview"
                    style={{
                      transform: getPreviewTransform(),
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
                <div className="pap-crop-drag-hint">
                  <span>💡 Klik & seret gambar di dalam kotak untuk menggeser posisi</span>
                </div>
              </div>

              {/* Controls */}
              <div className="pap-crop-controls">
                {/* Skala Zoom */}
                <div className="pap-crop-control-row">
                  <span className="pap-crop-label">Skala Zoom</span>
                  <div className="pap-crop-slider-group">
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, zoom: Math.max(0.2, +(p.zoom - 0.1).toFixed(2)) }))}
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="0.2"
                      max="5"
                      step="0.05"
                      value={cropModal.zoom}
                      onChange={e => setCropModal(p => ({ ...p, zoom: parseFloat(e.target.value) }))}
                      className="pap-crop-slider"
                    />
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, zoom: Math.min(5, +(p.zoom + 0.1).toFixed(2)) }))}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', width: '36px' }}>
                      {Math.round(cropModal.zoom * 100)}%
                    </span>
                  </div>
                </div>

                {/* Posisi Vertikal (Y) */}
                <div className="pap-crop-control-row">
                  <span className="pap-crop-label">Posisi Vertikal</span>
                  <div className="pap-crop-preset-btns">
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetY: 0 }))}
                    >
                      Atas
                    </button>
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetY: 50 }))}
                    >
                      Tengah
                    </button>
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetY: 100 }))}
                    >
                      Bawah
                    </button>
                  </div>
                </div>

                {/* Posisi Horizontal (X) */}
                <div className="pap-crop-control-row">
                  <span className="pap-crop-label">Posisi Horizontal</span>
                  <div className="pap-crop-preset-btns">
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetX: 0 }))}
                    >
                      Kiri
                    </button>
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetX: 50 }))}
                    >
                      Tengah
                    </button>
                    <button
                      type="button"
                      className="pap-crop-preset-btn"
                      onClick={() => setCropModal(p => ({ ...p, offsetX: 100 }))}
                    >
                      Kanan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pap-crop-footer">
              <div className="pap-crop-footer-left">
                <button
                  type="button"
                  className="pap-crop-preset-btn"
                  onClick={() => setCropModal(p => ({ ...p, zoom: 1, offsetX: 50, offsetY: 50 }))}
                >
                  Atur Ulang
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="pap-btn-cancel"
                  onClick={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="pap-btn-apply"
                  onClick={handleApplyCrop}
                  disabled={uploadingLogo || uploadingBanner}
                >
                  {(uploadingLogo || uploadingBanner) ? 'Menyimpan...' : 'Simpan & Terapkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
