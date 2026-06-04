import { useState } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import KandidatUnggahCV from './Kandidat-UnggahCV.jsx';
import KandidatRiwayatUnggah from './Kandidat-RiwayatUnggah.jsx';

export default function KandidatTambah({ navigate }) {
  const [activeTab,    setActiveTab]    = useState('unggah');
  const [historyData,  setHistoryData]  = useState(null);

  const handleViewRiwayat = (item) => {
    setHistoryData(item);
    setActiveTab('unggah');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'unggah') setHistoryData(null);
  };

  return (
    <div className="kt-view">
      <div className="kt-title-bar">
        <BackButton onClick={() => navigate('kandidat')} />
        <h1 className="kt-title">Tambah Kandidat</h1>
      </div>

      <TabNav
        tabs={[
          { id: 'unggah',  label: 'Unggah CV' },
          { id: 'riwayat', label: 'Riwayat'   },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {activeTab === 'unggah'  && (
        <KandidatUnggahCV
          navigate={navigate}
          historyData={historyData}
          onUploadMore={historyData ? () => { setHistoryData(null); } : undefined}
        />
      )}
      {activeTab === 'riwayat' && <KandidatRiwayatUnggah onView={handleViewRiwayat} />}
    </div>
  );
}
