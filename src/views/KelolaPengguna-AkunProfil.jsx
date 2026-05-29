import React, { useState } from 'react';

// Icons
import buildingIcon from '../assets/building.svg';
import backArrowIcon from '../assets/back_arrow.svg';
import userProfileIcon from '../assets/user_profile.svg';
import editPencilIcon from '../assets/edit_pencil.svg';
import lockIcon from '../assets/lock.svg';
import shieldIcon from '../assets/shield.svg';
import chevronRightIcon from '../assets/chevron_right.svg';

export default function PenggunaAkunProfil({ navigate }) {
  const [isKeamananExpanded, setIsKeamananExpanded] = useState(false);

  return (
    <div className="pap-view">
      <div className="pap-wrapper">

        {/* Header Section */}
        <div className="pap-header">
          <button className="pap-back-btn" onClick={() => navigate('pengaturan')}>
            <img src={backArrowIcon} alt="Back" width="15" height="15" />
            <span>Kembali</span>
          </button>
          <h1 className="pap-page-title">Akun dan Profil</h1>
        </div>

        {/* Content Section */}
        <div className="pap-content">

          {/* Detail Perusahaan Card */}
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
              <div className="pap-row">
                <span className="pap-label">Nama Perusahaan</span>
                <span className="pap-value">PT. Inovasi Mandiri</span>
              </div>
              <div className="pap-row">
                <span className="pap-label">Industri</span>
                <span className="pap-value">Industri ABC</span>
              </div>
              <div className="pap-row">
                <span className="pap-label">Ukuran Perusahaan</span>
                <span className="pap-value">Skala ABC</span>
              </div>
              <div className="pap-row no-border">
                <span className="pap-label">Lokasi</span>
                <span className="pap-value">Jakarta Selatan, DKI Jakarta</span>
              </div>
            </div>
          </div>

          {/* Detail Profil Card */}
          <div className="pap-card">
            <div className="pap-card-header">
              <div className="pap-icon-box">
                <img src={userProfileIcon} alt="User" width="20" height="20" />
              </div>
              <div className="pap-card-title-group">
                <h2 className="pap-card-title">Detail Profil</h2>
                <p className="pap-card-subtitle">
                  Kelola profil pengguna dan detail kontak Anda.
                </p>
              </div>
            </div>
            <div className="pap-card-body">
              <div className="pap-row">
                <span className="pap-label">Nama Lengkap</span>
                <span className="pap-value">Dito Arkademi</span>
              </div>
              <div className="pap-row">
                <span className="pap-label">Nama Tampilan</span>
                <div className="pap-editable-value">
                  <span className="pap-value">Dito</span>
                  <button className="pap-edit-btn">
                    <img src={editPencilIcon} alt="Edit" width="9" height="9" />
                  </button>
                </div>
              </div>
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
              <div className="pap-row">
                <span className="pap-label">Alamat Email</span>
                <span className="pap-value">dito.admin@arkademi.com</span>
              </div>
              <div className="pap-row">
                <span className="pap-label">Nomor Telepon</span>
                <span className="pap-value">+62 812 3456 7890</span>
              </div>
              <div className="pap-row no-border">
                <span className="pap-label">Lokasi</span>
                <span className="pap-value">Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Keamanan Akun Card */}
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
                <p className="pap-card-subtitle">
                  Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data rekrutmen perusahaan.
                </p>
              </div>
              <div className="pap-arrow-right" style={{ transform: isKeamananExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <img src={chevronRightIcon} alt="Right Arrow" width="14" height="14" />
              </div>
            </div>

            {isKeamananExpanded && (
              <div className="pap-form-container">
                <div className="pap-form-group">
                  <label>Kata Sandi Lama</label>
                  <input type="password" placeholder="Masukkan kata sandi lama" />
                </div>
                <div className="pap-form-group">
                  <label>Kata Sandi Baru</label>
                  <input type="password" placeholder="Masukkan kata sandi baru" />
                </div>
                <div className="pap-form-group">
                  <label>Ulangi Kata Sandi Baru</label>
                  <input type="password" placeholder="Ketik ulang kata sandi baru" />
                </div>
                <div className="pap-form-actions">
                  <button className="pap-btn-cancel" onClick={() => setIsKeamananExpanded(false)}>Batal</button>
                  <button className="pap-btn-submit" onClick={() => setIsKeamananExpanded(false)}>Ubah Kata Sandi</button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Save Button */}
        <div className="pap-save-section">
          <button className="pap-btn-save">Simpan Pengaturan</button>
        </div>

      </div>
    </div>
  );
}
