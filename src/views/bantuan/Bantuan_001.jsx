import { useState } from 'react';

export default function Bantuan_001() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nama: 'Arif Berwin',
    email: 'berwin.arif@example.com',
    whatsapp: '0812-3456-7890',
    perusahaan: 'PT. Teknologi Masa Depan',
    industri: 'Teknologi & SaaS',
    karyawan: '51-200 Orang',
    lokasi: 'Jakarta Selatan, Indonesia'
  });

  return (
    <div className="bantuan001-view">
      <div className="bantuan001-wrapper">
        <div className="bantuan001-header-container">
          {/* Background Shapes as per Figma */}
          <div style={{ position: 'absolute', height: '661.879px', left: '-135px', top: '-115.75px', width: '815px', pointerEvents: 'none' }}>
            <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" style={{ display: 'block' }} viewBox="0 0 815 661.879" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="407.5" cy="330.939" rx="407.5" ry="330.939" fill="var(--luna-orange-600)" />
            </svg>
          </div>
          <div style={{ position: 'absolute', height: '364.097px', left: '232px', top: '-242px', width: '448.328px', pointerEvents: 'none' }}>
            <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" style={{ display: 'block' }} viewBox="0 0 448.328 364.097" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse opacity="0.5" cx="224.164" cy="182.048" rx="224.164" ry="182.048" fill="var(--luna-orange-600)" />
            </svg>
          </div>

          <div className="bh001-content">
            <h1 className="bh001-title">Bantuan dan Dukungan Teknis</h1>
            <p className="bh001-desc">
              Kami senang bisa membantu Anda memaksimalkan potensi LUNA AI.
              Tim kami akan memberikan solusi terbaik untuk kendala rekrutmen Anda.
            </p>
            <button className="bh001-tour-btn" onClick={() => window.startProductTour && window.startProductTour()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Mulai Tur Interaktif
            </button>
          </div>
          <div className="bh001-benefit">
            <h3 className="bh001-benefit-title">Support Benefit</h3>
            <ul className="bh001-benefit-list">
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Respon Cepat & Tanggap
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Panduan Langsung via WA
              </li>
            </ul>
          </div>
        </div>

        <div className="bantuan001-cards-container">
          {/* Kartu Informasi Data Diri */}
          <div className="bantuan001-card bantuan001-user-info-card">
            <div className="bc001-header">
              <div className="bc001-title-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h2 className="bc001-title">Informasi Data Diri</h2>
              </div>
              {!isEditingProfile ? (
                <button className="bc001-edit-btn" onClick={() => setIsEditingProfile(true)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit
                </button>
              ) : (
                <div className="bc001-edit-actions">
                  <button className="bc001-edit-cancel-btn" onClick={() => setIsEditingProfile(false)}>Batal</button>
                  <button className="bc001-edit-save-btn" onClick={() => setIsEditingProfile(false)}>Simpan</button>
                </div>
              )}
            </div>

            <div className="bc001-rows-container">
              <div className="bc001-row">
                <div className="bc001-field">
                  <span className="bc001-label">Nama</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.nama}</span>
                  ) : (
                    <input type="text" className="bc001-edit-input" value={profileData.nama} onChange={e => setProfileData({...profileData, nama: e.target.value})} />
                  )}
                </div>
                <div className="bc001-field">
                  <span className="bc001-label">Alamat Email</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.email}</span>
                  ) : (
                    <input type="email" className="bc001-edit-input" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                  )}
                </div>
              </div>

              <div className="bc001-row">
                <div className="bc001-field">
                  <span className="bc001-label">Nomor Whatsapp</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.whatsapp}</span>
                  ) : (
                    <input type="text" className="bc001-edit-input" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} />
                  )}
                </div>
                <div className="bc001-field">
                  <span className="bc001-label">Nama Perusahaan</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.perusahaan}</span>
                  ) : (
                    <input type="text" className="bc001-edit-input" value={profileData.perusahaan} onChange={e => setProfileData({...profileData, perusahaan: e.target.value})} />
                  )}
                </div>
              </div>

              <div className="bc001-row">
                <div className="bc001-field">
                  <span className="bc001-label">Industri</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.industri}</span>
                  ) : (
                    <div className="bc001-edit-select-wrapper">
                      <select className="bc001-edit-select" value={profileData.industri} onChange={e => setProfileData({...profileData, industri: e.target.value})}>
                        <option>Teknologi & SaaS</option>
                        <option>Keuangan & Perbankan</option>
                        <option>Retail & E-Commerce</option>
                        <option>Manufaktur</option>
                        <option>Kesehatan</option>
                      </select>
                      <svg className="chevron-down" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  )}
                </div>
                <div className="bc001-field">
                  <span className="bc001-label">Jumlah Karyawan</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.karyawan}</span>
                  ) : (
                    <div className="bc001-edit-select-wrapper">
                      <select className="bc001-edit-select" value={profileData.karyawan} onChange={e => setProfileData({...profileData, karyawan: e.target.value})}>
                        <option>1-50 Orang</option>
                        <option>51-200 Orang</option>
                        <option>201-500 Orang</option>
                        <option>500+ Orang</option>
                      </select>
                      <svg className="chevron-down" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="bc001-row">
                <div className="bc001-field" style={{ flex: 'none', width: 'calc(50% - 8px)' }}>
                  <span className="bc001-label">Lokasi</span>
                  {!isEditingProfile ? (
                    <span className="bc001-value">{profileData.lokasi}</span>
                  ) : (
                    <input type="text" className="bc001-edit-input" value={profileData.lokasi} onChange={e => setProfileData({...profileData, lokasi: e.target.value})} />
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Kartu Form Kendala */}
          {!isSubmitted ? (
            <div className="bantuan001-card bantuan001-form-kendala-card">
              <div className="bc001-header bantuan001-form-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--luna-orange-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                </svg>
                <h2 className="bc001-title blue">Ceritakan kendala yang anda alami</h2>
              </div>

              <div className="bc001-form">
                <div className="bcf001-group">
                  <label>Subjek Singkat<span className="text-red">*</span></label>
                  <div className="bcf001-select-wrapper">
                    <select className="bcf001-select" defaultValue="">
                      <option value="" disabled hidden>Contoh : Tidak bisa upload CV.pdf</option>
                      <option value="upload">Kendala Upload File</option>
                      <option value="skoring">Kendala Skoring Kandidat</option>
                      <option value="kriteria">Kendala Membuat Kriteria Penilaian</option>
                      <option value="seleksi">Kendala Kelola Lowongan</option>
                      <option value="other">Lainnya</option>
                    </select>
                    <svg className="chevron-down" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="bcf001-group">
                  <label>Detail Pertanyaan<span className="text-red">*</span></label>
                  <textarea
                    className="bcf001-textarea"
                    placeholder="Jelaskan kendala yang anda alami, atau langkah langkah yang anda lalui ketika mendapatkan kendala"
                  ></textarea>
                </div>

                <button className="bcf001-submit-btn" onClick={() => setIsSubmitted(true)}>Kirim Pertanyaan</button>
              </div>
            </div>
          ) : (
            <div className="bantuan001-card bantuan001-form-kendala-card bantuan001-success-state">
              <div className="bantuan001-success-content">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M35.3125 3.75H4.6875C2.10281 3.75 0 5.85281 0 8.4375V12.3043L17.2024 25.0997C18.0391 25.722 19.0195 26.0331 20 26.0331C20.9805 26.0331 21.9609 25.722 22.7976 25.0997L40 12.3043V8.4375C40 5.85281 37.8972 3.75 35.3125 3.75ZM36.875 10.7341L20.9326 22.5922C20.3748 23.0071 19.6252 23.0071 19.0675 22.5922L3.125 10.7341V8.4375C3.125 7.57594 3.82594 6.875 4.6875 6.875H35.3125C36.1741 6.875 36.875 7.57594 36.875 8.4375V10.7341ZM36.875 18.5234L40 16.199V31.5625C40 34.1472 37.8972 36.25 35.3125 36.25H4.6875C2.10281 36.25 0 34.1472 0 31.5625V16.199L3.125 18.5234V31.5625C3.125 32.4241 3.82594 33.125 4.6875 33.125H35.3125C36.1741 33.125 36.875 32.4241 36.875 31.5625V18.5234Z" fill="var(--luna-orange-500)" />
                </svg>
                <h2 className="bantuan001-success-title">Pesan Terkirim ke Tim Support!</h2>
              </div>

              <p className="bantuan001-success-desc">
                Terima kasih! Kami telah menerima pertanyaan Anda. Harap tunggu Tim Support kami akan menghubungi anda terkait kendala tersebut melalui <strong>Whatsapp</strong>
              </p>

              <p className="bantuan001-success-time">
                Estimasi: Dalam 1 Jam<br />
                09:00 - 18:00 (Senin - Jumat)
              </p>

              <button className="bcf001-submit-btn" onClick={() => setIsSubmitted(false)}>
                Ajukan Pertanyaan Lainnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
