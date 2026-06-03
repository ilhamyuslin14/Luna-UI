import { useState, useRef, useEffect } from 'react';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import Toast from '../../components/Toast.jsx';
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

const POSISI_LIST = [
  { id: 1, nama: 'Project Manager',       dept: 'Tech'      },
  { id: 2, nama: 'Backend Engineer',      dept: 'Tech'      },
  { id: 3, nama: 'UI/UX Designer',        dept: 'Design'    },
  { id: 4, nama: 'Data Analyst',          dept: 'Tech'      },
  { id: 5, nama: 'Frontend Engineer',     dept: 'Tech'      },
  { id: 6, nama: 'HR Specialist',         dept: 'HR'        },
  { id: 7, nama: 'Product Marketing Manager', dept: 'Marketing' },
  { id: 8, nama: 'VP of Finance',         dept: 'Finance'   },
];

/* ── Tambahkan ke Posisi Modal ─────────────────────────── */
function TambahkanKePosisiModal({ onClose, kandidatNama, onAdded }) {
  const [query, setQuery]       = useState('');
  const [added, setAdded]       = useState(new Set());
  const inputRef                = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = POSISI_LIST.filter(p =>
    p.nama.toLowerCase().includes(query.toLowerCase()) ||
    p.dept.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = (id) => {
    setAdded(prev => new Set([...prev, id]));
    onAdded?.(); // hanya trigger toast, modal tetap terbuka
  };

  return (
    <div className="kd-posisi-overlay" onClick={onClose}>
      <div className="kd-posisi-modal" onClick={e => e.stopPropagation()}>

        {/* Close button — × rotated from + icon */}
        <button className="kd-posisi-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13"/>
            <line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>

        <div className="kd-posisi-body">
          {/* Title */}
          <h3 className="kd-posisi-title">Tambahkan ke Posisi</h3>

          {/* Search */}
          <div className="kd-posisi-search-wrap">
            <input
              ref={inputRef}
              className="kd-posisi-search"
              type="text"
              placeholder="Cari nama posisi atau departemen..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <svg className="kd-posisi-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#abb2c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          {/* Results */}
          <div className="kd-posisi-results">
            <p className="kd-posisi-count">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </p>

            {filtered.length === 0 ? (
              <div className="kd-posisi-empty">Tidak ada posisi ditemukan</div>
            ) : (
              <div className="kd-posisi-list">
                {filtered.map(p => (
                  <div className="kd-posisi-item" key={p.id}>
                    <div className="kd-posisi-item-info">
                      <span className="kd-posisi-item-name">{p.nama}</span>
                      <span className="kd-posisi-item-dept">{p.dept}</span>
                    </div>
                    <button
                      className={`kd-posisi-tambah-btn${added.has(p.id) ? ' kd-posisi-tambah-done' : ''}`}
                      onClick={() => handleAdd(p.id)}
                      disabled={added.has(p.id)}
                    >
                      {added.has(p.id) ? 'Ditambahkan' : 'Tambahkan'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function KandidatDetail({ kandidat = KANDIDAT_DEFAULT, navigate, back }) {
  const [activeTab, setActiveTab]       = useState('ringkasan');
  const [archiveModal, setArchiveModal] = useState(false);
  const [posisiModal, setPosisiModal]   = useState(false);
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const k = { ...KANDIDAT_DEFAULT, ...kandidat };

  return (
    <div className="kd-view">
      {/* Title Bar */}
      <div className="kd-title-bar">
        <h1 className="kd-title">{k.nama}</h1>
        <div className="kd-title-actions">
          <button className="kd-btn-primary" onClick={() => setPosisiModal(true)}>
            Tambah ke Posisi
          </button>
          <button className="kd-btn-outline" onClick={() => setArchiveModal(true)}>
            <svg width="11" height="11" viewBox="0 0 8.25 8.60156" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor"/>
            </svg>
            Arsipkan
          </button>
        </div>
      </div>

      <TabNav
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'resume', label: 'Resume' },
          { id: 'seleksi', label: 'Seleksi' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      <div className={`kd-content-wrapper${(activeTab === 'resume' || activeTab === 'seleksi') ? ' kd-content-wrapper--viewer' : ''}`}>
        {activeTab === 'ringkasan' && (
          <div style={{ margin: '-20px -20px 0', padding: '8px 20px', display: 'flex', alignItems: 'center' }}>
            <BackButton onClick={() => back ? back() : navigate('kandidat')} />
            <div style={{ height: 40 }} />
          </div>
        )}
        {activeTab === 'ringkasan' && <KandidatRingkasan kandidat={k} onChangeTab={setActiveTab} />}
        {activeTab === 'resume'    && <KandidatResume kandidat={k} />}
        {activeTab === 'seleksi'   && <KandidatSeleksi back={back} navigate={navigate} kandidat={k} />}
      </div>

      {/* Tambahkan ke Posisi Modal */}
      {posisiModal && (
        <TambahkanKePosisiModal
          kandidatNama={k.nama}
          onClose={() => setPosisiModal(false)}
          onAdded={() => showToast('Kandidat berhasil ditambahkan ke posisi', 'Harap tunggu, proses penilaian sedang berlangsung')}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}

      {archiveModal && (
        <PopupKonfirmasi
          title="Arsipkan Kandidat"
          body="Apakah Anda yakin ingin mengarsipkan kandidat ini?"
          confirmLabel="Arsipkan"
          onConfirm={() => { setArchiveModal(false); showToast('Kandidat berhasil diarsipkan', 'Data telah dipindahkan ke arsip'); }}
          onClose={() => setArchiveModal(false)}
        />
      )}
    </div>
  );
}
