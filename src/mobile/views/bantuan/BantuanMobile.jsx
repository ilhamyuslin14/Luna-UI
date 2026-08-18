import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import useBantuanData from '../../../hooks/bantuan/useBantuanData.js';
import '../../../../css/mobile/bantuan/bantuan.css';

const IconPlay = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconInfo = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>);
const IconPencil = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const IconMessage = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="10" x2="15" y2="10" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconWhatsApp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);

const SUBJEK_OPTS = [
  { value: 'upload', label: 'Kendala Upload File' },
  { value: 'skoring', label: 'Kendala Skoring Kandidat' },
  { value: 'kriteria', label: 'Kendala Membuat Kriteria Penilaian' },
  { value: 'seleksi', label: 'Kendala Kelola Lowongan' },
  { value: 'other', label: 'Lainnya' },
];

export default function BantuanMobile() {
  const { user, profileName, companyName, companyDetails, companyId, refreshCompanyData } = useAuth() || {};
  const { profileData, setProfileData, isSaving, handleSaveProfile, waUrl } =
    useBantuanData(user, profileName, companyName, companyDetails, companyId, refreshCompanyData);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const saveAndCloseEdit = async () => {
    await handleSaveProfile();
    setIsEditingProfile(false);
  };

  return (
    <>
      <div className="mbt001-hero">
        <div className="mbt001-hero-title">Bantuan dan Dukungan Teknis</div>
        <p className="mbt001-hero-desc">Kami senang bisa membantu Anda memaksimalkan potensi LUNA AI. Tim kami siap bantu kendala rekrutmen Anda.</p>
        <button className="mbt001-hero-tour" onClick={() => window.startProductTour && window.startProductTour()}>
          <IconPlay />Mulai Tur Interaktif
        </button>
        <div className="mbt001-hero-benefits">
          <div className="mbt001-hero-benefit"><IconCheck />Respon Cepat &amp; Tanggap</div>
          <div className="mbt001-hero-benefit"><IconCheck />Panduan Langsung via WA</div>
        </div>
      </div>

      <div className="mbt001-card">
        <div className="mbt001-card-head">
          <div className="mbt001-card-head-left"><IconInfo /><span className="mbt001-card-title">Informasi Data Diri</span></div>
          {!isEditingProfile ? (
            <button className="mbt001-edit-btn" onClick={() => setIsEditingProfile(true)}><IconPencil />Edit</button>
          ) : (
            <div className="mbt001-edit-actions">
              <button className="mbt001-edit-cancel" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>Batal</button>
              <button className="mbt001-edit-save" onClick={saveAndCloseEdit} disabled={isSaving}>{isSaving ? 'Menyimpan…' : 'Simpan'}</button>
            </div>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="mbt001-rows">
            <div className="mbt001-row"><span className="mbt001-row-label">Nama</span><span className="mbt001-row-val">{profileData.nama || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Alamat Email</span><span className="mbt001-row-val">{profileData.email || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Nomor WhatsApp</span><span className="mbt001-row-val">{profileData.whatsapp || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Nama Perusahaan</span><span className="mbt001-row-val">{profileData.perusahaan || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Industri</span><span className="mbt001-row-val">{profileData.industri || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Jumlah Karyawan</span><span className="mbt001-row-val">{profileData.karyawan || '-'}</span></div>
            <div className="mbt001-row"><span className="mbt001-row-label">Lokasi</span><span className="mbt001-row-val">{profileData.lokasi || '-'}</span></div>
          </div>
        ) : (
          <div className="mbt001-rows">
            <div className="mbt001-field-group"><label>Nama</label><input value={profileData.nama} onChange={e => setProfileData({ ...profileData, nama: e.target.value })} /></div>
            <div className="mbt001-field-group"><label>Alamat Email</label><input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} /></div>
            <div className="mbt001-field-group"><label>Nomor WhatsApp</label><input value={profileData.whatsapp} onChange={e => setProfileData({ ...profileData, whatsapp: e.target.value })} /></div>
            <div className="mbt001-field-group"><label>Nama Perusahaan</label><input value={profileData.perusahaan} onChange={e => setProfileData({ ...profileData, perusahaan: e.target.value })} /></div>
            <div className="mbt001-field-group">
              <label>Industri</label>
              <select value={profileData.industri} onChange={e => setProfileData({ ...profileData, industri: e.target.value })}>
                <option>Teknologi & SaaS</option>
                <option>Keuangan & Perbankan</option>
                <option>Retail & E-Commerce</option>
                <option>Manufaktur</option>
                <option>Kesehatan</option>
              </select>
            </div>
            <div className="mbt001-field-group">
              <label>Jumlah Karyawan</label>
              <select value={profileData.karyawan} onChange={e => setProfileData({ ...profileData, karyawan: e.target.value })}>
                <option>1-10 Karyawan</option>
                <option>11-50 Karyawan</option>
                <option>51-200 Karyawan</option>
                <option>201-500 Karyawan</option>
                <option>501-1000 Karyawan</option>
                <option>1000+ Karyawan</option>
              </select>
            </div>
            <div className="mbt001-field-group"><label>Lokasi</label><input value={profileData.lokasi} onChange={e => setProfileData({ ...profileData, lokasi: e.target.value })} /></div>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <div className="mbt001-card">
          <div className="mbt001-card-head">
            <div className="mbt001-card-head-left"><IconMessage /><span className="mbt001-card-title">Ceritakan Kendala Anda</span></div>
          </div>
          <div className="mbt001-form">
            <div>
              <label>Subjek Singkat<span className="req">*</span></label>
              <div className="mbt001-select-wrap">
                <select defaultValue="">
                  <option value="" disabled hidden>Contoh: Tidak bisa upload CV.pdf</option>
                  {SUBJEK_OPTS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <IconChevronDown />
              </div>
            </div>
            <div>
              <label>Detail Pertanyaan<span className="req">*</span></label>
              <textarea className="mbt001-textarea" placeholder="Jelaskan kendala yang Anda alami, atau langkah-langkah yang Anda lalui ketika mendapatkan kendala" />
            </div>
            <button className="mbt001-submit" onClick={() => setIsSubmitted(true)}>Kirim Pertanyaan</button>
          </div>
        </div>
      ) : (
        <div className="mbt001-card">
          <div className="mbt001-success">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M35.3125 3.75H4.6875C2.10281 3.75 0 5.85281 0 8.4375V12.3043L17.2024 25.0997C18.0391 25.722 19.0195 26.0331 20 26.0331C20.9805 26.0331 21.9609 25.722 22.7976 25.0997L40 12.3043V8.4375C40 5.85281 37.8972 3.75 35.3125 3.75ZM36.875 10.7341L20.9326 22.5922C20.3748 23.0071 19.6252 23.0071 19.0675 22.5922L3.125 10.7341V8.4375C3.125 7.57594 3.82594 6.875 4.6875 6.875H35.3125C36.1741 6.875 36.875 7.57594 36.875 8.4375V10.7341ZM36.875 18.5234L40 16.199V31.5625C40 34.1472 37.8972 36.25 35.3125 36.25H4.6875C2.10281 36.25 0 34.1472 0 31.5625V16.199L3.125 18.5234V31.5625C3.125 32.4241 3.82594 33.125 4.6875 33.125H35.3125C36.1741 33.125 36.875 32.4241 36.875 31.5625V18.5234Z" fill="var(--luna-orange-500)" /></svg>
            <h3>Pesan Terkirim ke Tim Support!</h3>
            <p>Terima kasih! Kami telah menerima pertanyaan Anda. Harap tunggu, Tim Support kami akan menghubungi Anda terkait kendala tersebut melalui <strong>WhatsApp</strong>.</p>
            <div className="mbt001-success-time"><b>Estimasi: Dalam 1 Jam</b>09:00 - 18:00 (Senin - Jumat)</div>
            <button className="mbt001-success-btn" onClick={() => setIsSubmitted(false)}>Ajukan Pertanyaan Lainnya</button>
          </div>
        </div>
      )}

      <a className="mbt001-fab" href={waUrl} target="_blank" rel="noopener noreferrer">
        <IconWhatsApp /><span>WhatsApp</span><span className="mbt001-fab-dot" />
      </a>
    </>
  );
}
