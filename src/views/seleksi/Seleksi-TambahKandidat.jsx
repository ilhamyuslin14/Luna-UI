import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import KandidatUnggahCV from '../kandidat/Kandidat-UnggahCV.jsx';
import KandidatRiwayatUnggah from '../kandidat/Kandidat-RiwayatUnggah.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getKandidat } from '../../services/kandidatService.js';
import { getSeleksiByJabatan } from '../../services/seleksiService.js';
import { getScoringBySeleksi } from '../../services/scoringService.js';

const AVATAR_COLORS = ['#f042a1', '#0977be', '#089f32', '#f8aa01', '#fb484b', '#8b5cf6', '#06b6d4'];

const getInisial = (nama) => {
  const parts = (nama || '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

function PilihKandidatTab({ seleksiId, companyId, jabatan }) {
  const { enqueueScoringJob } = useUpload();
  const [kandidatList, setKandidatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [added, setAdded] = useState(new Set());

  useEffect(() => {
    if (!companyId) return;
    getKandidat(companyId)
      .then(rows => setKandidatList(rows || []))
      .catch(() => setKandidatList([]))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  // Pre-mark kandidat yang sudah ada scoring di posisi ini
  useEffect(() => {
    if (!seleksiId) return;
    getScoringBySeleksi(seleksiId)
      .then(rows => {
        const ids = new Set((rows || []).map(s => s.kandidat?.id || s.kandidat_id).filter(Boolean));
        setAdded(ids);
      })
      .catch(() => {});
  }, [seleksiId]);

  const handleTambah = (k) => {
    setAdded(prev => new Set([...prev, k.id]));
    if (seleksiId && k.id && companyId) {
      enqueueScoringJob(k.id, seleksiId, jabatan, k.nama_lengkap || '', companyId);
    }
  };

  if (isLoading) {
    return (
      <div className="stk-pilih-content" style={{ padding: 40, color: '#888', textAlign: 'center', fontSize: 14 }}>
        Memuat kandidat...
      </div>
    );
  }

  if (kandidatList.length === 0) {
    return (
      <div className="stk-pilih-content" style={{ padding: 40, color: '#888', textAlign: 'center', fontSize: 14 }}>
        Belum ada kandidat di sistem. Unggah CV terlebih dahulu.
      </div>
    );
  }

  const availableList = kandidatList.filter(k => !added.has(k.id) && !k.arsip);

  if (availableList.length === 0) {
    return (
      <div className="stk-pilih-content" style={{ padding: 40, color: '#888', textAlign: 'center', fontSize: 14 }}>
        Semua kandidat sudah ditambahkan ke posisi ini.
      </div>
    );
  }

  return (
    <div className="stk-pilih-content">
      {availableList.map((k, i) => (
        <div className="stk-kandidat-row" key={k.id}>
          <div className="stk-kandidat-info">
            <div className="stk-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
              {getInisial(k.nama_lengkap)}
            </div>
            <div className="stk-kandidat-meta">
              <span className="stk-kandidat-nama">{k.nama_lengkap || '-'}</span>
              <span className="stk-kandidat-sub">
                {k.jabatan_saat_ini
                  ? `${k.jabatan_saat_ini}${k.perusahaan_saat_ini ? ` at ${k.perusahaan_saat_ini}` : ''}`
                  : '-'}
              </span>
            </div>
          </div>
          <button className="stk-btn-tambahkan" onClick={() => handleTambah(k)}>
            Tambahkan
          </button>
        </div>
      ))}
    </div>
  );
}

export default function SeleksiTambahKandidat({ navigate, back, jabatan }) {
  const { companyId } = useAuth();
  const [seleksiId, setSeleksiId] = useState(null);
  const [activeTab, setActiveTab] = useState('pilih');
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (!companyId || !jabatan) return;
    getSeleksiByJabatan(companyId, jabatan)
      .then(s => setSeleksiId(s?.id || null))
      .catch(() => {});
  }, [companyId, jabatan]);

  const handleViewRiwayat = (item) => {
    setHistoryData(item);
    setActiveTab('unggah');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'unggah') setHistoryData(null);
  };

  return (
    <div className="stk-view">
      <div className="stk-title-bar">
        <BackButton onClick={() => back ? back() : navigate('seleksi')} />
        <h1 className="stk-title">Tambah Kandidat{jabatan ? ` — ${jabatan}` : ''}</h1>
      </div>

      <TabNav
        tabs={[
          { id: 'pilih',   label: 'Pilih Kandidat' },
          { id: 'unggah',  label: 'Unggah CV'       },
          { id: 'riwayat', label: 'Riwayat'         },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {activeTab === 'pilih' && (
        <PilihKandidatTab
          jabatan={jabatan}
          seleksiId={seleksiId}
          companyId={companyId}
        />
      )}

      {activeTab === 'unggah' && (
        <div className="stk-unggah-wrap">
          <KandidatUnggahCV
            navigate={navigate}
            historyData={historyData}
            onUploadMore={historyData ? () => { setHistoryData(null); } : undefined}
          />
        </div>
      )}

      {activeTab === 'riwayat' && <KandidatRiwayatUnggah onView={handleViewRiwayat} />}
    </div>
  );
}
