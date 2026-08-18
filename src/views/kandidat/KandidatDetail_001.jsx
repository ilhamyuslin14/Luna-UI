import { useState, useRef, useEffect } from 'react';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import Toast from '../../components/Toast.jsx';
import KandidatRingkasan from './Kandidat-Ringkasan_001.jsx';
import KandidatResume from './Kandidat-Resume_001.jsx';
import KandidatLowongan_001 from './Kandidat-Lowongan_001.jsx';
import ScoringProgressWidget from '../../components/ScoringProgressWidget.jsx';
import { getKandidatById, createActivityLog, updateActivityLog } from '../../services/kandidatService.js';
import { getSeleksi } from '../../services/seleksiService.js';
import { runScoring, getScoringByKandidat } from '../../services/scoringService.js';
import { useAuth } from '../../context/AuthContext.jsx';

/* ── Tambahkan ke Posisi Modal ─────────────────────────── */
const POSISI_MODAL_EXIT_DURATION = 180;

function TambahkanKePosisiModal({ onClose, kandidatId, scoringJobs, onStartScoring }) {
  const { companyId }             = useAuth();
  const [query, setQuery]         = useState('');
  const [preChecked, setPreChecked] = useState({}); // { [posisiId]: 'done' } — from DB
  const [posisiList, setPosisiList] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [closing, setClosing]       = useState(false);

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, POSISI_MODAL_EXIT_DURATION);
  };

  // Pre-check posisi yang sudah pernah di-scoring dari DB
  useEffect(() => {
    if (!kandidatId) return;
    getScoringByKandidat(kandidatId)
      .then(data => {
        const done = {};
        (data || []).forEach(s => { done[s.seleksi_id] = 'done'; });
        setPreChecked(prev => ({ ...prev, ...done }));
      })
      .catch(() => {});
  }, [kandidatId]);

  // Sync successful jobs to preChecked so they don't reappear when scoringJobs is cleared
  useEffect(() => {
    let changed = false;
    const newDone = { ...preChecked };
    Object.entries(scoringJobs).forEach(([pid, job]) => {
      if (job.status === 'done' && !newDone[pid]) {
        newDone[pid] = 'done';
        changed = true;
      }
    });
    if (changed) setPreChecked(newDone);
  }, [scoringJobs, preChecked]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closing]);

  useEffect(() => {
    async function loadPosisi() {
      if (!companyId) return;
      try {
        const data = await getSeleksi(companyId);
        setPosisiList((data || []).map(s => ({
          id: s.id,
          nama: s.jabatan || '-',
          dept: s.departments?.name || s.departemen || '-',
        })));
      } catch (err) {
        console.error('Error loading posisi:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosisi();
  }, [companyId]);

  // Derive button state: live job from parent takes priority over DB pre-check
  const getState = (posisiId) =>
    scoringJobs[posisiId]?.status || preChecked[posisiId] || 'idle';

  const available = posisiList.filter(p => getState(p.id) !== 'done');
  const allScored = posisiList.length > 0 && available.length === 0;
  const filtered = available.filter(p =>
    p.nama.toLowerCase().includes(query.toLowerCase()) ||
    p.dept.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = (posisiId, posisiNama) => {
    onStartScoring(posisiId, posisiNama);
  };

  return (
    <div className={`kd001-posisi-overlay${closing ? ' kd001-posisi-closing' : ''}`} onClick={dismiss}>
      <div className="kd001-posisi-modal" onClick={e => e.stopPropagation()}>

        <button className="kd001-posisi-close" onClick={dismiss}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13"/>
            <line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>

        <div className="kd001-posisi-body">
          <h3 className="kd001-posisi-title">Tambahkan ke Posisi</h3>

          <div className="kd001-posisi-search-wrap">
            <input
              ref={inputRef}
              className="kd001-posisi-search"
              type="text"
              placeholder="Cari nama posisi atau departemen..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <svg className="kd001-posisi-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#abb2c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <div className="kd001-posisi-results">
            {!isLoading && (
              <p className="kd001-posisi-count">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </p>
            )}

            {isLoading ? (
              <div className="kd001-posisi-empty">Memuat posisi...</div>
            ) : posisiList.length === 0 ? (
              <div className="kd001-posisi-empty">Tidak ada posisi ditemukan</div>
            ) : allScored ? (
              <div className="kd001-posisi-empty">Kandidat sudah dinilai di semua posisi yang tersedia</div>
            ) : filtered.length === 0 ? (
              <div className="kd001-posisi-empty">Tidak ada posisi yang cocok</div>
            ) : (
              <div className="kd001-posisi-list">
                {filtered.map(p => {
                  const st = getState(p.id);
                  return (
                    <div className="kd001-posisi-item" key={p.id}>
                      <div className="kd001-posisi-item-info">
                        <span className="kd001-posisi-item-name">{p.nama}</span>
                        <span className="kd001-posisi-item-dept">{p.dept}</span>
                      </div>
                      <button
                        className={`kd001-posisi-tambah-btn${st === 'done' ? ' kd001-posisi-tambah-done' : st === 'error' ? ' kd001-posisi-tambah-error' : ''}`}
                        onClick={() => handleAdd(p.id, p.nama)}
                        disabled={st === 'loading' || st === 'done'}
                      >
                        {st === 'loading' ? 'Memproses...' : st === 'done' ? 'Ditambahkan' : st === 'error' ? 'Coba Lagi' : 'Tambahkan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
function getWhatsAppUrl(phone) {
  if (!phone) return null;
  let cleaned = String(phone).trim().replace(/[^0-9+]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '0') return null;

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  if (cleaned.length < 8) return null;
  return `https://api.whatsapp.com/send?phone=${cleaned}`;
}

export default function KandidatDetail_001({ kandidat, navigate, back, isPopup = false }) {
  const { companyId }                   = useAuth();
  const [activeTab, setActiveTab]       = useState('ringkasan');
  const [archiveModal, setArchiveModal] = useState(false);
  const [posisiModal, setPosisiModal]   = useState(false);
  const [toast, setToast]               = useState(null);
  const [resolvedData, setResolvedData] = useState(null);
  const [isFetching, setIsFetching]     = useState(false);
  const [scoringJobs, setScoringJobs]   = useState({}); // { [posisiId]: { nama, status, error } }
  const [scoringVersion, setScoringVersion] = useState(0);
  const toastTimer                      = useRef(null);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const handleStartScoring = async (posisiId, posisiNama) => {
    const kandidatId = resolvedData?.id;
    setScoringJobs(prev => ({ ...prev, [posisiId]: { nama: posisiNama, status: 'loading' } }));

    let logId = null;
    try {
      const log = await createActivityLog({
        batch_id: `BATCH-${Date.now()}`,
        company_id: companyId,
        nama_file: resolvedData?.nama ? `${resolvedData.nama} - Penilaian AI` : 'Penilaian AI',
        tipe_aktivitas: 'scoring_only',
        scoring_status: 'menunggu',
        kandidat_id: kandidatId,
        source: 'HR',
        posisi_nama: posisiNama || null,
      });
      logId = log?.id;
    } catch(e) {
      console.error('Gagal membuat log scoring:', e);
    }

    runScoring(kandidatId, posisiId, companyId)
      .then(() => {
        setScoringJobs(prev => ({ ...prev, [posisiId]: { ...prev[posisiId], status: 'done' } }));
        setScoringVersion(v => v + 1);
        if (logId) updateActivityLog(logId, { scoring_status: 'berhasil' }).catch(()=>{});
      })
      .catch(err => {
        setScoringJobs(prev => ({
          ...prev,
          [posisiId]: { ...prev[posisiId], status: 'error', error: err.message || 'Gagal' },
        }));
        if (logId) updateActivityLog(logId, { scoring_status: 'gagal', scoring_fail_reason: err.message }).catch(()=>{});
      });
  };

  useEffect(() => {
    const id = typeof kandidat === 'string' ? kandidat : kandidat?.id;

    if (id) {
      setIsFetching(true);
      getKandidatById(id)
        .then(data => setResolvedData(data || {}))
        .catch(() => setResolvedData(typeof kandidat === 'object' ? kandidat : {}))
        .finally(() => setIsFetching(false));
    } else if (typeof kandidat === 'object' && kandidat?.nama_lengkap) {
      setResolvedData(kandidat);
    } else {
      setResolvedData({});
    }
  }, []);

  const k = { ...(resolvedData || {}) };
  if (!k.nama) k.nama = k.nama_lengkap || '';

  if (isFetching || resolvedData === null) {
    return (
      <div className="kd001-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 14 }}>
        Memuat data kandidat...
      </div>
    );
  }

  return (
    <div className="kd001-view">
      {/* Title Bar */}
      <div className="kd001-title-bar">
        <div className="kd001-profile-header">
          <div className="kd001-profile-info">
            <h1 className="kd001-title">{k.nama}</h1>
            <div className="kd001-role-line">
              <span className="kd001-role-badge">{k.jabatan_saat_ini || 'Belum ada jabatan'}</span>
              {k.perusahaan_saat_ini && k.perusahaan_saat_ini !== '-' ? `di ${k.perusahaan_saat_ini}` : ''}
            </div>
            <div className="kd001-meta-row">
              <span className="kd001-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                {k.pengalaman_tahun ? `${k.pengalaman_tahun} tahun` : '0 tahun'} pengalaman
              </span>
              <span className="kd001-meta-dot" />
              <span className="kd001-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {k.domisili || 'Belum ada domisili'}
              </span>
              {k.sumber === 'public' && (
                <>
                  <span className="kd001-meta-dot" />
                  <span className="kd001-src-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" />
                    </svg>
                    Portal Karier
                    <span className="kd001-src-chip-tip">
                      Melamar mandiri{k.created_at ? ` · ${new Date(k.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </span>
                  </span>
                </>
              )}

              {getWhatsAppUrl(k.phone || k.telepon || k.no_telp || k.no_hp) && (
                <>
                  <span className="kd001-meta-dot" />
                  <a
                    href={getWhatsAppUrl(k.phone || k.telepon || k.no_telp || k.no_hp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kd001-wa-chip"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-4.8 7.6 8.5 8.5 0 0 1-8.9-.9L3 21l1.9-4.3a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.4h.3a8.48 8.48 0 0 1 8.2 8v.5z" />
                    </svg>
                    <span>WhatsApp</span>
                    <span className="kd001-wa-chip-tip">
                      Hubungi kandidat via WhatsApp ({k.phone || k.telepon || k.no_telp || k.no_hp})
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="kd001-title-actions">
          <button className="kd001-btn-primary" onClick={() => setPosisiModal(true)}>
            <span className="kd001-btn-primary-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Tambah ke Posisi
          </button>
          <button className="kd001-btn-outline" onClick={() => setArchiveModal(true)}>
            Arsipkan
          </button>
        </div>
      </div>

      <TabNav
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'resume', label: 'Resume' },
          { id: 'seleksi', label: 'Rekrutmen' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Back button — konsisten di tab Ringkasan & Resume; tab Seleksi punya bar sendiri (Kembali + Urutkan + Filter satu baris) */}
      {activeTab !== 'seleksi' && (
        <div className={`kd001-back-row${activeTab === 'resume' ? ' kd001-back-row--white' : ''}`}>
          <BackButton onClick={() => back ? back() : navigate('kandidat_001')} />
        </div>
      )}

      {/* Content */}
      <div className={`kd001-content-wrapper${(activeTab === 'resume' || activeTab === 'seleksi') ? ' kd001-content-wrapper--viewer' : ''}`}>
        {activeTab === 'ringkasan' && <KandidatRingkasan kandidat={k} onChangeTab={setActiveTab} scoringVersion={scoringVersion} onAddPosisi={() => setPosisiModal(true)} navigate={navigate} />}
        {activeTab === 'resume'    && <KandidatResume kandidat={k} />}
        {activeTab === 'seleksi'   && <KandidatLowongan_001 back={back} navigate={navigate} kandidat={k} />}
      </div>

      {/* Tambahkan ke Posisi Modal */}
      {posisiModal && (
        <TambahkanKePosisiModal
          kandidatId={k.id}
          onClose={() => setPosisiModal(false)}
          scoringJobs={scoringJobs}
          onStartScoring={handleStartScoring}
        />
      )}

      {/* Scoring Progress Widget — persists even when modal is closed */}
      {Object.keys(scoringJobs).length > 0 && (
        <ScoringProgressWidget
          jobs={scoringJobs}
          onDismiss={() => setScoringJobs({})}
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
