import React, { useState, useEffect, useRef } from 'react';
import BackButton from '../../components/BackButton.jsx';
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

export default function PenggunaAkunProfil({ navigate }) {
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
  });

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
          <BackButton variant="secondary" onClick={() => navigate('pengaturan')} />
          <h1 className="pap-page-title">Akun dan Profil</h1>
        </div>

        <div className="pap-content">

          {/* Detail Perusahaan */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-icon-box">
                <img src={buildingIcon} alt="Building" width="20" height="20" />
              </div>
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Detail Perusahaan</h2>
                <p className="pap-card-subtitle">Informasi perusahaan yang terdaftar di akun Anda.</p>
              </div>
            </div>
            <div className="pap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px' }}>
              <InlineEditRow label="Nama Perusahaan" value={perusahaan.namaPerusahaan} onSave={(val) => handleUpdateCompany('namaPerusahaan', val)} />
              <InlineEditRow label="Industri"        value={perusahaan.industri}       onSave={(val) => handleUpdateCompany('industri', val)} />
              <InlineEditRow label="Ukuran Perusahaan" value={perusahaan.ukuran}         onSave={(val) => handleUpdateCompany('ukuran', val)} />
              <InlineEditRow label="Lokasi"          value={perusahaan.lokasi}         onSave={(val) => handleUpdateCompany('lokasi', val)} type="location" />
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
