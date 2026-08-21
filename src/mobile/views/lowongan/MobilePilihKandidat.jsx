import { useState, useRef } from 'react';
import usePilihKandidat, { getInisial } from '../../../hooks/lowongan/usePilihKandidat.js';
import MobileToast from '../../components/MobileToast.jsx';

const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconUsers = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);

// Padanan mobile dari PilihKandidatTab (Lowongan-TambahKandidat.jsx desktop)
// — pakai hook `usePilihKandidat` yang sama persis. Tambahan di mobile:
// kotak cari (desktop tidak punya) dan toast konfirmasi singkat setelah
// menambahkan kandidat, karena desktop hanya menghilangkan baris tanpa
// feedback eksplisit.
export default function MobilePilihKandidat({ seleksiId, jabatan }) {
  const { isLoading, kandidatList, availableList, totalAvailable, query, setQuery, handleTambah } = usePilihKandidat(seleksiId, jabatan);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const onTambah = (k) => {
    handleTambah(k);
    setToast({
      message: `${k.nama_lengkap || 'Kandidat'} ditambahkan`,
      subMessage: `Sedang antre penilaian AI untuk posisi ${jabatan || 'ini'}`,
      type: 'success',
    });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="mkt001-body">
        <div className="msh-skel" style={{ height: 64, marginBottom: 8 }} />
        <div className="msh-skel" style={{ height: 64, marginBottom: 8 }} />
        <div className="msh-skel" style={{ height: 64 }} />
      </div>
    );
  }

  if (kandidatList.length === 0) {
    return (
      <div className="mkt001-soon">
        <div className="mkt001-soon-icon"><IconUsers /></div>
        <p>Belum ada kandidat di sistem. Unggah CV terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <>
      <div className="pk-search">
        <IconSearch />
        <input
          placeholder="Cari nama atau jabatan kandidat…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="pk-count">{availableList.length} kandidat tersedia</div>

      {availableList.length === 0 ? (
        <div className="mkt001-soon" style={{ margin: '20px 16px' }}>
          <p>{totalAvailable === 0 ? 'Semua kandidat sudah ditambahkan ke posisi ini.' : 'Tidak ada kandidat yang cocok dengan pencarian.'}</p>
        </div>
      ) : (
        <div className="pk-list">
          {availableList.map(k => (
            <div className="pk-row" key={k.id}>
              <div className="pk-avatar">{getInisial(k.nama_lengkap)}</div>
              <div className="pk-meta">
                <div className="pk-nama">{k.nama_lengkap || '-'}</div>
                <div className="pk-sub">
                  {k.jabatan_saat_ini
                    ? `${k.jabatan_saat_ini}${k.perusahaan_saat_ini ? ` di ${k.perusahaan_saat_ini}` : ''}`
                    : 'Belum ada data jabatan'}
                  {' • '}
                  {k.pengalaman_tahun ? `${k.pengalaman_tahun} Tahun Pengalaman` : '0 Tahun Pengalaman'}
                </div>
              </div>
              <button className="pk-btn-add" onClick={() => onTambah(k)}><IconPlus />Tambah</button>
            </div>
          ))}
        </div>
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
