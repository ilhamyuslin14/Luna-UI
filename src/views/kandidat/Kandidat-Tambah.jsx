import KandidatUnggahCV from './Kandidat-UnggahCV.jsx';

export default function KandidatTambah({ navigate }) {
  return (
    <div className="kt-view">
      <div className="kt-title-bar">
        <h1 className="kt-title">Tambah Kandidat</h1>
        <button className="kt-btn-close" onClick={() => navigate('kandidat')}>Tutup</button>
      </div>
      <div className="kt-subnav">
        <div className="kt-tabs">
          <button className="kt-tab active">Unggah CV</button>
        </div>
      </div>
      <KandidatUnggahCV navigate={navigate} />
    </div>
  );
}
