import { useState } from 'react';
import { createPortal } from 'react-dom';
import useRiwayatUnggah, { getBatchStatusInfo, getDisplaySource, formatTanggal } from '../../../hooks/kandidat/useRiwayatUnggah.js';

const IconFilter = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" /></svg>);
const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconScoring = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconX = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconHistory = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);

const QUICK_STATUS = ['Berhasil', 'Sedang Diproses', 'Gagal'];

// Chip cepat cocokin ke finalStatusText yang sebenarnya dinamis dari data —
// "Berhasil"/"Gagal" di sini cuma penanda kategori kasar (bukan pencarian
// string persis), makanya dicek beda dari filter penuh di sheet.
function matchesQuickStatus(finalStatusText, quick) {
  if (quick === 'Sedang Diproses') return finalStatusText === 'Sedang Diproses';
  if (quick === 'Gagal') return finalStatusText.includes('Gagal');
  if (quick === 'Berhasil') return finalStatusText.includes('Berhasil');
  return true;
}

// Padanan mobile dari Kandidat-RiwayatUnggah.jsx — pakai hook
// `useRiwayatUnggah` yang sama persis dengan desktop, tabel 8 kolom + 5
// filter dropdown disusun ulang jadi kartu + sheet filter.
export default function MobileRiwayatUnggah({ onView }) {
  const {
    isLoading, batches, filteredBatches, hasActiveFilters,
    filterSumber, setFilterSumber, filterPosisi, setFilterPosisi,
    filterStatus, setFilterStatus, filterDateStart, setFilterDateStart, filterDateEnd, setFilterDateEnd,
    uniqueSources, uniquePosisi, statusOptions, resetFilters,
  } = useRiwayatUnggah();

  const [quickStatus, setQuickStatus] = useState(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const quickFiltered = quickStatus
    ? filteredBatches.filter(b => matchesQuickStatus(getBatchStatusInfo(b).finalStatusText, quickStatus))
    : filteredBatches;

  const handleCardClick = (item, info) => {
    onView?.({
      id: item.batch_id,
      tanggal: formatTanggal(item.tanggal),
      tipe: info.labelAktivitas,
      sumber: item.source,
      total: item.total,
      berhasil: item.upload_berhasil,
      gagal: item.upload_gagal,
      status: 'selesai',
      files: item.files,
    });
  };

  const statusPillClass = (item, info) => {
    if (info.hasError) return 'error';
    if (info.isProcessing) return 'processing';
    if (info.statusBerhasilText === 'Unggah CV Berhasil') return 'ok-upload';
    if (info.statusBerhasilText === 'Penilaian AI Berhasil') return 'ok-scoring';
    return 'ok';
  };

  if (isLoading) {
    return (
      <div className="mkt001-body">
        <div className="msh-skel" style={{ height: 100, marginBottom: 10 }} />
        <div className="msh-skel" style={{ height: 100 }} />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="mkt001-soon">
        <div className="mkt001-soon-icon"><IconHistory /></div>
        <p>Belum ada riwayat aktivitas.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mkr001-toolbar">
        <span className="mkr001-count">{quickFiltered.length} sesi aktivitas</span>
        <button className="mkr001-filter-btn" onClick={() => setFilterSheetOpen(true)}>
          <IconFilter />Filter
          {hasActiveFilters && <span className="mkr001-filter-dot" />}
        </button>
      </div>
      <div className="mkr001-chiprow">
        <button className={`mkr001-chip${!quickStatus ? ' active' : ''}`} onClick={() => setQuickStatus(null)}>Semua</button>
        {QUICK_STATUS.map(s => (
          <button key={s} className={`mkr001-chip${quickStatus === s ? ' active' : ''}`} onClick={() => setQuickStatus(quickStatus === s ? null : s)}>{s}</button>
        ))}
      </div>

      <div className="mkr001-list">
        {quickFiltered.length === 0 ? (
          <div className="mkt001-soon" style={{ margin: '20px 0' }}>
            <p>Tidak ada sesi yang cocok dengan filter.</p>
          </div>
        ) : (
          quickFiltered.map(item => {
            const info = getBatchStatusInfo(item);
            const isScoring = item.tipe_aktivitas === 'scoring_only';
            return (
              <button className="mkr001-card" key={item.batch_id} onClick={() => handleCardClick(item, info)}>
                <div className="mkr001-card-top">
                  <div className={`mkr001-card-icon${isScoring ? ' scoring' : ''}`}>{isScoring ? <IconScoring /> : <IconUpload />}</div>
                  <div className="mkr001-card-title-wrap">
                    <div className="mkr001-card-label">{info.labelAktivitas}</div>
                    <div className="mkr001-card-date">{formatTanggal(item.tanggal)}</div>
                  </div>
                  <div className="mkr001-chev"><IconChevronRight /></div>
                </div>
                <div className="mkr001-badge-row">
                  <span className={`mkr001-posisi-badge${!item.posisi_nama ? ' muted' : ''}`}>{item.posisi_nama || 'Tanpa Posisi'}</span>
                  <span className={`mkr001-source-badge${getDisplaySource(item.source) === 'Portal Karir' ? ' portal' : ' hr'}`}>{getDisplaySource(item.source)}</span>
                </div>
                <div className="mkr001-card-foot">
                  <div className="mkr001-stats">
                    {item.tipe_aktivitas !== 'scoring_only' && (item.upload_berhasil > 0 || item.upload_gagal > 0) && (
                      <span className={item.upload_gagal > 0 && item.upload_berhasil === 0 ? 'fail' : 'ok'}>
                        {item.upload_berhasil > 0 ? <IconCheck /> : <IconX />}{item.upload_berhasil}{item.upload_gagal > 0 ? `/${item.upload_gagal} gagal` : ''} Unggah
                      </span>
                    )}
                    {item.tipe_aktivitas !== 'upload_only' && (item.scoring_berhasil > 0 || item.scoring_gagal > 0) && (
                      <span className={item.scoring_gagal > 0 && item.scoring_berhasil === 0 ? 'fail' : 'ok'}>
                        {item.scoring_berhasil > 0 ? <IconCheck /> : <IconX />}{item.scoring_berhasil}{item.scoring_gagal > 0 ? `/${item.scoring_gagal} gagal` : ''} Skor
                      </span>
                    )}
                  </div>
                  <span className={`mkr001-status-pill ${statusPillClass(item, info)}`}>{info.finalStatusText}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {createPortal(
        <>
          <div className={`msh-sheet-overlay${filterSheetOpen ? ' open' : ''}`} onClick={() => setFilterSheetOpen(false)} />
          <div className={`msh-sheet${filterSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="mkt001-sheet-title">Filter &amp; Urutkan</div>

            <div>
              <div className="mkr001-sheet-label">Sumber Aktivitas</div>
              <div className="mkr001-filter-grid">
                {uniqueSources.map(s => (
                  <button key={s} className={`mkr001-filter-opt${filterSumber === s ? ' sel' : ''}`} onClick={() => setFilterSumber(s)}>{s}</button>
                ))}
              </div>

              <div className="mkr001-sheet-label">Status Pengerjaan</div>
              <div className="mkr001-filter-grid">
                {statusOptions.map(s => (
                  <button key={s} className={`mkr001-filter-opt${filterStatus === s ? ' sel' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
                ))}
              </div>

              <div className="mkr001-sheet-label">Nama Posisi</div>
              <div className="mkr001-filter-grid">
                {uniquePosisi.map(p => (
                  <button key={p} className={`mkr001-filter-opt${filterPosisi === p ? ' sel' : ''}`} onClick={() => setFilterPosisi(p)}>{p}</button>
                ))}
              </div>

              <div className="mkr001-sheet-label">Rentang Tanggal</div>
              <div className="mkr001-date-row">
                <div className="mkr001-date-field">
                  <label>Dari</label>
                  <input className="mkr001-date-input" type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                </div>
                <div className="mkr001-date-field">
                  <label>Sampai</label>
                  <input className="mkr001-date-input" type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                </div>
              </div>

              <div className="mkr001-sheet-actions">
                <button className="mkr001-sheet-reset" onClick={resetFilters}>Reset</button>
                <button className="mkr001-sheet-apply" onClick={() => setFilterSheetOpen(false)}>Terapkan</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
