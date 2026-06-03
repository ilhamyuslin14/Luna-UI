import React, { useState, useRef, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import PopupKonfirmasiPassword from '../../components/PopupKonfirmasiPassword.jsx';

const buildingIcon     = '/assets/building.svg';
const userProfileIcon  = '/assets/user_profile.svg';
const lockIcon         = '/assets/lock.svg';
const shieldIcon       = '/assets/shield.svg';
const chevronRightIcon = '/assets/chevron_right.svg';

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PencilIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

function EditableRow({ label, fieldKey, value, editingField, tempValue, onStartEdit, onSave, onCancel, onTempChange, noBorder }) {
  const isEditing = editingField === fieldKey;
  const inputRef  = useRef(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div
      className={`pap-row pap-row--editable${noBorder ? ' no-border' : ''}`}
      onClick={!isEditing ? () => onStartEdit(fieldKey, value) : undefined}
    >
      <span className="pap-label">{label}</span>
      {isEditing ? (
        <div className="pap-edit-wrap" onClick={e => e.stopPropagation()}>
          <input
            ref={inputRef}
            className="pap-edit-input"
            value={tempValue}
            onChange={e => onTempChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  onSave(fieldKey, tempValue);
              if (e.key === 'Escape') onCancel();
            }}
          />
          <div className="pap-edit-actions">
            <button className="pap-edit-save-btn" onClick={() => onSave(fieldKey, tempValue)} title="Simpan">
              <CheckIcon />
            </button>
            <button className="pap-edit-cancel-btn" onClick={onCancel} title="Batal">
              <XIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="pap-value-wrap">
          <span className="pap-value">{value}</span>
          <div className="pap-pencil-btn">
            <PencilIcon />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PenggunaAkunProfil({ navigate }) {
  const [isKeamananExpanded, setIsKeamananExpanded] = useState(false);
  const [editingField,  setEditingField]  = useState(null);
  const [tempValue,     setTempValue]     = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const [perusahaan, setPerusahaan] = useState({
    namaPerusahaan: 'PT. Inovasi Mandiri',
    industri:       'Industri ABC',
    ukuran:         'Skala ABC',
    lokasi:         'Jakarta Selatan, DKI Jakarta',
  });

  const [profil, setProfil] = useState({
    namaLengkap:   'Dito Arkademi',
    namaTampilan:  'Dito',
    email:         'dito.admin@arkademi.com',
    telepon:       '+62 812 3456 7890',
    lokasi:        'Jakarta, Indonesia',
  });

  const startEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const saveEdit = (field, value) => {
    if (field in perusahaan)
      setPerusahaan(prev => ({ ...prev, [field]: value }));
    else
      setProfil(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const editProps = { editingField, tempValue, onStartEdit: startEdit, onSave: saveEdit, onCancel: cancelEdit, onTempChange: setTempValue };

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
            <div className="pap-card-body">
              <EditableRow label="Nama Perusahaan" fieldKey="namaPerusahaan" value={perusahaan.namaPerusahaan} {...editProps} />
              <EditableRow label="Industri"        fieldKey="industri"       value={perusahaan.industri}       {...editProps} />
              <EditableRow label="Ukuran Perusahaan" fieldKey="ukuran"       value={perusahaan.ukuran}         {...editProps} />
              <EditableRow label="Lokasi"          fieldKey="lokasi"         value={perusahaan.lokasi}         {...editProps} noBorder />
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
            <div className="pap-card-body">
              <EditableRow label="Nama Lengkap"   fieldKey="namaLengkap"  value={profil.namaLengkap}  {...editProps} />
              <EditableRow label="Nama Tampilan"  fieldKey="namaTampilan" value={profil.namaTampilan} {...editProps} />

              {/* Peran — locked */}
              <div className="pap-row">
                <span className="pap-label">Peran (Role)</span>
                <div className="pap-role-value">
                  <div className="pap-role-name">
                    <span className="pap-value-light">Admin</span>
                    <img src={lockIcon} alt="Lock" width="12" height="12" />
                  </div>
                  <span className="pap-badge-default">DEFAULT</span>
                </div>
              </div>

              {/* Email — konfirmasi password dulu */}
              <div
                className="pap-row pap-row--editable"
                onClick={() => setShowEmailPopup(true)}
              >
                <span className="pap-label">Alamat Email</span>
                <div className="pap-value-wrap">
                  <span className="pap-value">{profil.email}</span>
                  <div className="pap-pencil-btn"><PencilIcon /></div>
                </div>
              </div>
              <EditableRow label="Nomor Telepon"  fieldKey="telepon" value={profil.telepon} {...editProps} />
              <EditableRow label="Lokasi"         fieldKey="profilLokasi" value={profil.lokasi} {...editProps} noBorder />
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

        <div className="pap-save-section">
          <button className="pap-btn-save">Simpan Pengaturan</button>
        </div>

      </div>

      {showEmailPopup && (
        <PopupKonfirmasiPassword
          onConfirm={() => {
            setShowEmailPopup(false);
            setEditingField('email');
            setTempValue(profil.email);
          }}
          onClose={() => setShowEmailPopup(false)}
        />
      )}

    </div>
  );
}
