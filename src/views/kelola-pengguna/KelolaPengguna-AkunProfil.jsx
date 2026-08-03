import React, { useState, useEffect, useRef } from 'react';
import PopupKonfirmasiPassword from '../../components/PopupKonfirmasiPassword.jsx';
import InlineEditRow from '../../components/InlineEditRow.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabase.js';

const buildingIcon     = '/assets/building.svg';
const userProfileIcon  = '/assets/user_profile.svg';
const lockIcon         = '/assets/lock.svg';
const shieldIcon       = '/assets/shield.svg';
const chevronRightIcon = '/assets/chevron_right.svg';

const JENIS_BADAN_USAHA_OPTS = ['PT', 'CV', 'Firma', 'Koperasi', 'Yayasan', 'BUMN', 'Startup/Perorangan', 'Lainnya'];

const UploadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function PenggunaAkunProfil() {
  const { user, companyId, companyName, companyDetails, userRole, refreshCompanyData } = useAuth();
  const [isKeamananExpanded, setIsKeamananExpanded] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const [perusahaan, setPerusahaan] = useState({
    namaPerusahaan: '',
    industri: '',
    ukuran: '',
    lokasi: '',
    logo_url: '',
    banner_url: '',
    tagline: '',
    tahun_didirikan: '',
    jenis_badan_usaha: '',
    alamat: '',
    website: '',
    email_kontak: '',
    telepon_kontak: '',
    deskripsi: '',
    media_sosial: {},
    video_profil_url: '',
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [profil, setProfil] = useState({
    namaLengkap: '',
    namaTampilan: '',
    email: '',
    telepon: '',
    lokasi: '',
  });

  useEffect(() => {
    if (companyDetails || companyName) {
      setPerusahaan({
        namaPerusahaan: companyName || '',
        industri: companyDetails?.industri || '',
        ukuran: companyDetails?.ukuran || '',
        lokasi: companyDetails?.lokasi || '',
        logo_url: companyDetails?.logo_url || '',
        banner_url: companyDetails?.banner_url || '',
        tagline: companyDetails?.tagline || '',
        tahun_didirikan: companyDetails?.tahun_didirikan || '',
        jenis_badan_usaha: companyDetails?.jenis_badan_usaha || '',
        alamat: companyDetails?.alamat || '',
        website: companyDetails?.website || '',
        email_kontak: companyDetails?.email_kontak || '',
        telepon_kontak: companyDetails?.telepon_kontak || '',
        deskripsi: companyDetails?.deskripsi || '',
        media_sosial: companyDetails?.media_sosial || {},
        video_profil_url: companyDetails?.video_profil_url || '',
      });
    }
    if (user) {
      setProfil({
        namaLengkap: user.user_metadata?.nama_lengkap || '',
        namaTampilan: user.user_metadata?.nama_tampilan || '',
        email: user.email || '',
        telepon: user.user_metadata?.telepon || '',
        lokasi: user.user_metadata?.lokasi || '',
      });
    }
  }, [companyDetails, companyName, user]);

  const handleUpdateCompany = async (field, value) => {
    if (!companyId) return;
    const updatePayload = {};
    if (field === 'namaPerusahaan') updatePayload.name = value;
    else updatePayload[field] = value;

    const { error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', companyId);

    if (!error) {
      setPerusahaan(prev => ({ ...prev, [field]: value }));
      if (refreshCompanyData && user?.id) {
        await refreshCompanyData(user.id);
      }
      showToast('Berhasil', 'Data perusahaan berhasil disimpan', 'success');
    } else {
      console.error(error);
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan data perusahaan', 'error');
      throw error;
    }
  };

  const uploadCompanyAsset = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${companyId}/${folder}/${fileName}`;
    const { error } = await supabase.storage.from('company_assets').upload(filePath, file);
    if (error) throw error;
    return `${supabase.supabaseUrl}/storage/v1/object/public/company_assets/${filePath}`;
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

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadCompanyAsset(file, 'banner');
      await handleUpdateCompany('banner_url', url);
    } catch (err) {
      console.error(err);
      showToast('Gagal', 'Gagal mengunggah banner', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUpdateSocial = async (platform, value) => {
    await handleUpdateCompany('media_sosial', { ...(perusahaan.media_sosial || {}), [platform]: value });
  };

  const handleUpdateProfile = async (field, value) => {
    if (!user) return;
    const metadataUpdate = {};
    
    if (field === 'namaLengkap') metadataUpdate.nama_lengkap = value;
    else if (field === 'namaTampilan') metadataUpdate.nama_tampilan = value;
    else if (field === 'telepon') metadataUpdate.telepon = value;
    else if (field === 'lokasi') metadataUpdate.lokasi = value;

    const { error } = await supabase.auth.updateUser({
      data: metadataUpdate
    });

    if (!error) {
      setProfil(prev => ({ ...prev, [field]: value }));
      showToast('Berhasil', 'Data profil berhasil disimpan', 'success');
    } else {
      console.error(error);
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan data profil', 'error');
      throw error;
    }
  };

  return (
    <div className="pap-view">
      <div className="pap-wrapper">

        <div className="pap-header">
          <h1 className="pap-page-title">Akun dan Profil</h1>
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
              <div
                className={`pap-banner-wrap${perusahaan.banner_url ? '' : ' empty'}`}
                style={perusahaan.banner_url ? { backgroundImage: `url(${perusahaan.banner_url})` } : undefined}
              >
                {!perusahaan.banner_url && <span className="pap-banner-empty-text">Belum ada banner perusahaan</span>}
                <button className="pap-banner-upload-btn" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}>
                  <UploadIcon />
                  {uploadingBanner ? 'Mengunggah...' : (perusahaan.banner_url ? 'Ubah Banner' : 'Unggah Banner')}
                </button>
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
              </div>

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

            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
              <InlineEditRow label="Nama Perusahaan" value={perusahaan.namaPerusahaan} onSave={(val) => handleUpdateCompany('namaPerusahaan', val)} />
              <InlineEditRow label="Tagline" value={perusahaan.tagline} onSave={(val) => handleUpdateCompany('tagline', val)} placeholder="Satu kalimat pendek tentang perusahaan Anda" />
              <InlineEditRow label="Industri" value={perusahaan.industri} onSave={(val) => handleUpdateCompany('industri', val)} />
              <InlineEditRow label="Ukuran Perusahaan" value={perusahaan.ukuran} onSave={(val) => handleUpdateCompany('ukuran', val)} />
              <InlineEditRow label="Tahun Didirikan" value={perusahaan.tahun_didirikan} onSave={(val) => handleUpdateCompany('tahun_didirikan', val)} type="number" placeholder="Contoh: 2019" />
              <InlineEditRow label="Jenis Badan Usaha" value={perusahaan.jenis_badan_usaha} onSave={(val) => handleUpdateCompany('jenis_badan_usaha', val)} type="dropdown" options={JENIS_BADAN_USAHA_OPTS} />
              <InlineEditRow label="Lokasi" value={perusahaan.lokasi} onSave={(val) => handleUpdateCompany('lokasi', val)} type="location" />
              <InlineEditRow label="Alamat Lengkap" value={perusahaan.alamat} onSave={(val) => handleUpdateCompany('alamat', val)} placeholder="Jalan, nomor, kecamatan, kota" />
              <InlineEditRow label="Website" value={perusahaan.website} onSave={(val) => handleUpdateCompany('website', val)} placeholder="https://" />
              <InlineEditRow label="Email Kontak" value={perusahaan.email_kontak} onSave={(val) => handleUpdateCompany('email_kontak', val)} placeholder="hr@perusahaan.com" />
              <InlineEditRow label="Telepon Kontak" value={perusahaan.telepon_kontak} onSave={(val) => handleUpdateCompany('telepon_kontak', val)} type="tel" />
              <InlineEditRow label="Deskripsi" value={perusahaan.deskripsi} onSave={(val) => handleUpdateCompany('deskripsi', val)} type="textarea" width="480px" placeholder="Ceritakan tentang perusahaan Anda — misi, budaya, dan keunggulannya" />
            </div>

            <div className="pap-subsection">
              <span className="pap-subsection-title">Media Sosial</span>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
              <InlineEditRow label="Instagram" value={perusahaan.media_sosial?.instagram} onSave={(val) => handleUpdateSocial('instagram', val)} placeholder="@namaperusahaan" />
              <InlineEditRow label="LinkedIn" value={perusahaan.media_sosial?.linkedin} onSave={(val) => handleUpdateSocial('linkedin', val)} placeholder="linkedin.com/company/..." />
              <InlineEditRow label="TikTok" value={perusahaan.media_sosial?.tiktok} onSave={(val) => handleUpdateSocial('tiktok', val)} placeholder="@namaperusahaan" />
            </div>

            <div className="pap-subsection">
              <span className="pap-subsection-title">Video Profil</span>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px', paddingBottom: '18px' }}>
              <InlineEditRow label="Video Profil (YouTube)" value={perusahaan.video_profil_url} onSave={(val) => handleUpdateCompany('video_profil_url', val)} placeholder="https://youtube.com/watch?v=..." width="360px" />
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

    </div>
  );
}
