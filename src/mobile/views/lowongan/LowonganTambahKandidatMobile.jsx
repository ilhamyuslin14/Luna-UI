import { useState } from 'react';
import MobilePilihKandidat from './MobilePilihKandidat.jsx';
import MobileUnggahCv from '../kandidat/MobileUnggahCv.jsx';
import MobileRiwayatUnggah from '../kandidat/MobileRiwayatUnggah.jsx';
import '../../../../css/mobile/kandidat/kandidat-tambah.css';

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);

// Padanan mobile dari Lowongan-TambahKandidat.jsx (desktop) — pintu masuk
// dari dalam sebuah lowongan (tab Kandidat), jadi 3 tab: Pilih Kandidat,
// Unggah CV, Riwayat. Unggah CV & Riwayat reuse komponen+hook yang sama
// dengan pintu masuk menu Kandidat (KandidatTambahMobile.jsx) — bedanya di
// sini posisi sudah otomatis terkunci lewat `initialSeleksiId`.
export default function LowonganTambahKandidatMobile({ navigate, back, seleksiId, jabatan }) {
  const [activeTab, setActiveTab] = useState('pilih');
  const [historyData, setHistoryData] = useState(null);

  const handleViewRiwayat = (item) => {
    setHistoryData(item);
    setActiveTab('unggah');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'unggah') setHistoryData(null);
  };

  return (
    <>
      <div className="mkt001-head">
        <div className="mkt001-head-row">
          <button className="mkt001-back" onClick={back}><IconBack /></button>
          <div className="mkt001-title">Tambah Kandidat{jabatan ? ` — ${jabatan}` : ''}</div>
        </div>
        <div className="mkt001-tabs">
          <button className={`mkt001-tab${activeTab === 'pilih' ? ' active' : ''}`} onClick={() => handleTabChange('pilih')}>Pilih Kandidat</button>
          <button className={`mkt001-tab${activeTab === 'unggah' ? ' active' : ''}`} onClick={() => handleTabChange('unggah')}>Unggah CV</button>
          <button className={`mkt001-tab${activeTab === 'riwayat' ? ' active' : ''}`} onClick={() => handleTabChange('riwayat')}>Riwayat</button>
        </div>
      </div>

      {activeTab === 'pilih' ? (
        <MobilePilihKandidat seleksiId={seleksiId} jabatan={jabatan} />
      ) : activeTab === 'unggah' ? (
        <MobileUnggahCv
          navigate={navigate}
          initialSeleksiId={seleksiId}
          historyData={historyData}
          onUploadMore={historyData ? () => setHistoryData(null) : undefined}
        />
      ) : (
        <MobileRiwayatUnggah onView={handleViewRiwayat} />
      )}
    </>
  );
}
