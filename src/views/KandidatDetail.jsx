import { useState } from 'react';
import KandidatRingkasan from './Kandidat-Ringkasan.jsx';
import KandidatResume from './Kandidat-Resume.jsx';
import KandidatSeleksi from './Kandidat-Seleksi.jsx';

const KANDIDAT_DEFAULT = {
  nama: 'Aula Maulidatul Mufidah',
  id: 'R78YXRY4R',
  jabatan: 'Freelancer Recruitment',
  perusahaan: 'Duta Generasi Mandiri',
  domisili: 'Jakarta Selatan, Indonesia',
  linkedin: '',
  gender: 'N/A',
  jurusan: 'Psikologi',
  universitas: 'Universitas Mercu Buana',
  pengalaman: '3 tahun',
  email: 'aulamdtlmufidah@gmail.com',
  phone: '6285157707461',
  periode: '2023-09-01 – Sekarang',
};

export default function KandidatDetail({ kandidat = KANDIDAT_DEFAULT, navigate, back }) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [archiveModal, setArchiveModal] = useState(false);

  const k = { ...KANDIDAT_DEFAULT, ...kandidat };

  return (
    <div className="kd-view">
      {/* Title Bar */}
      <div className="kd-title-bar">
        <h1 className="kd-title">{k.nama}</h1>
        <div className="kd-title-actions">
          <button className="kd-btn-primary" onClick={() => alert(`${k.nama} berhasil ditambahkan ke Lowongan!`)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah ke Lowongan
          </button>
          <button className="kd-btn-outline" onClick={() => setArchiveModal(true)}>
            <svg width="11" height="11" viewBox="0 0 8.25 8.60156" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
            </svg>
            Arsipkan
          </button>
          <button className="kd-menu-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="4" r="1.5" fill="#555f71"/>
              <circle cx="10" cy="10" r="1.5" fill="#555f71"/>
              <circle cx="10" cy="16" r="1.5" fill="#555f71"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="kd-subnav">
        <div className="kd-tabs">
          <button className={`kd-tab${activeTab === 'ringkasan' ? ' active' : ''}`} onClick={() => setActiveTab('ringkasan')}>
            Ringkasan
          </button>
          <button className={`kd-tab${activeTab === 'resume' ? ' active' : ''}`} onClick={() => setActiveTab('resume')}>
            Resume
          </button>
          <button className={`kd-tab${activeTab === 'seleksi' ? ' active' : ''}`} onClick={() => setActiveTab('seleksi')}>
            Seleksi
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`kd-content-wrapper${(activeTab === 'resume' || activeTab === 'seleksi') ? ' kd-content-wrapper--viewer' : ''}`}>
        {activeTab === 'ringkasan' && (
          <button className="kd-back-btn" onClick={() => back ? back() : navigate('kandidat')} style={{ marginBottom: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Kembali
          </button>
        )}

        {activeTab === 'ringkasan' && <KandidatRingkasan kandidat={k} />}
        {activeTab === 'resume'    && <KandidatResume kandidat={k} />}
        {activeTab === 'seleksi'   && <KandidatSeleksi back={back} navigate={navigate} kandidat={k} />}
      </div>
      {archiveModal && (
        <div className="dept-modal-overlay" onClick={() => setArchiveModal(false)}>
          <div className="dept-modal dept-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="dept-modal-confirm-text">
              <p className="dept-modal-title" style={{ fontSize: '18px' }}>Arsipkan Kandidat</p>
              <p className="dept-modal-subtitle">Apakah Anda yakin ingin mengarsipkan kandidat ini?</p>
            </div>
            <div className="dept-modal-footer dept-modal-footer-stretch">
              <button className="dept-modal-btn-cancel dept-modal-btn-cancel-lg" onClick={() => setArchiveModal(false)}>Batal</button>
              <button className="dept-modal-btn-primary dept-modal-btn-primary-lg" onClick={() => setArchiveModal(false)}>Arsipkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
