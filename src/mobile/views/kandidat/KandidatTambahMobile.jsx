import { useState } from 'react';
import MobileUnggahCv from './MobileUnggahCv.jsx';
import MobileRiwayatUnggah from './MobileRiwayatUnggah.jsx';
import '../../../../css/mobile/kandidat/kandidat-tambah.css';

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);

// Padanan mobile dari Kandidat-Tambah.jsx (desktop) — pintu masuk dari menu
// Kandidat, jadi cuma 2 tab (Unggah CV, Riwayat). Pintu masuk dari dalam
// sebuah lowongan (3 tab: Pilih Kandidat/Unggah CV/Riwayat, posisi
// terkunci) sengaja belum digarap — Unggah CV & Riwayat di sini dulu,
// sisanya menyusul lewat komponen & hook yang sama.
export default function KandidatTambahMobile({ navigate, back }) {
  const [activeTab, setActiveTab] = useState('unggah');
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
          <div className="mkt001-title">Tambah Kandidat</div>
        </div>
        <div className="mkt001-tabs">
          <button className={`mkt001-tab${activeTab === 'unggah' ? ' active' : ''}`} onClick={() => handleTabChange('unggah')}>Unggah CV</button>
          <button className={`mkt001-tab${activeTab === 'riwayat' ? ' active' : ''}`} onClick={() => handleTabChange('riwayat')}>Riwayat</button>
        </div>
      </div>

      {activeTab === 'unggah' ? (
        <MobileUnggahCv
          navigate={navigate}
          historyData={historyData}
          onUploadMore={historyData ? () => setHistoryData(null) : undefined}
        />
      ) : (
        <MobileRiwayatUnggah onView={handleViewRiwayat} />
      )}
    </>
  );
}
