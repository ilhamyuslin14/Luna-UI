import { useState, useRef } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import KandidatUnggahCV from '../kandidat/Kandidat-UnggahCV.jsx';
import Toast from '../../components/Toast.jsx';

const AVATAR_COLORS = ['#f042a1', '#0977be', '#089f32', '#f8aa01', '#fb484b', '#8b5cf6', '#06b6d4'];

const KANDIDAT_LIST = [
  { id: 1, nama: 'Aula Maulidatul Mufidah', sub: 'Junior Human Resources at Prima Print (3 years)',   inisial: 'AM', color: 0 },
  { id: 2, nama: 'Rofiq Gonzalez',          sub: 'Senior Frontend Engineer at Tech Global Corp (4 years)', inisial: 'RG', color: 1 },
  { id: 3, nama: 'Dito Arkademi',           sub: 'Admin Manager at PT Arkademi (2 years)',            inisial: 'DA', color: 2 },
  { id: 4, nama: 'Siti Fatimah',            sub: 'UX Designer at Design Studio Inc (3 years)',        inisial: 'SF', color: 3 },
  { id: 5, nama: 'Budi Santoso',            sub: 'Backend Developer at Bank Central Asia (5 years)',  inisial: 'BS', color: 4 },
  { id: 6, nama: 'Rina Wulandari',          sub: 'HR Specialist at PT Maju Jaya (2 years)',           inisial: 'RW', color: 5 },
  { id: 7, nama: 'Ahmad Fauzi',             sub: 'Product Manager at Startup Nusantara (4 years)',    inisial: 'AF', color: 6 },
];

function PilihKandidatTab({ jabatan, onTambah }) {
  const [added, setAdded] = useState(new Set());

  const handleTambah = (id) => {
    setAdded(prev => new Set([...prev, id]));
    onTambah?.();
  };

  return (
    <div className="stk-pilih-content">
      {KANDIDAT_LIST.map(k => (
        <div className="stk-kandidat-row" key={k.id}>
          <div className="stk-kandidat-info">
            <div className="stk-avatar" style={{ background: AVATAR_COLORS[k.color] }}>
              {k.inisial}
            </div>
            <div className="stk-kandidat-meta">
              <span className="stk-kandidat-nama">{k.nama}</span>
              <span className="stk-kandidat-sub">{k.sub}</span>
            </div>
          </div>
          <button
            className={`stk-btn-tambahkan${added.has(k.id) ? ' stk-added' : ''}`}
            onClick={() => handleTambah(k.id)}
            disabled={added.has(k.id)}
          >
            {added.has(k.id) ? 'Ditambahkan' : 'Tambahkan'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function SeleksiTambahKandidat({ navigate, back, jabatan }) {
  const [activeTab, setActiveTab] = useState('pilih');
  const [toast, setToast]         = useState(false);
  const toastTimer                = useRef(null);

  const showToast = () => {
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 4000);
  };

  return (
    <div className="stk-view">
      <div className="stk-title-bar">
        <BackButton onClick={() => back ? back() : navigate('seleksi')} />
        <h1 className="stk-title">Tambah Kandidat</h1>
      </div>

      <TabNav
        tabs={[
          { id: 'pilih',  label: 'Pilih Kandidat' },
          { id: 'unggah', label: 'Unggah CV'       },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'pilih' && <PilihKandidatTab jabatan={jabatan} onTambah={showToast} />}

      {toast && (
        <Toast
          message="Kandidat berhasil ditambahkan ke posisi"
          subMessage="Harap tunggu, proses penilaian sedang berlangsung"
          onClose={() => setToast(false)}
        />
      )}

      {activeTab === 'unggah' && (
        <div className="stk-unggah-wrap">
          <KandidatUnggahCV navigate={navigate} />
        </div>
      )}
    </div>
  );
}
