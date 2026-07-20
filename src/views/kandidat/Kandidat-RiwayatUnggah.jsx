import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActivityLogs } from '../../services/kandidatService';

export default function KandidatRiwayatUnggah({ onView }) {
  const { companyId } = useAuth();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk Filter
  const [filterSumber, setFilterSumber] = useState('Semua');
  const [filterPosisi, setFilterPosisi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  useEffect(() => {
    async function loadBatches() {
      if (!companyId) return;
      try {
        setIsLoading(true);
        const rows = await getActivityLogs(companyId);

        // Grupkan baris flat dari DB berdasarkan batch_id
        const batchMap = new Map();
        for (const row of rows) {
          if (!batchMap.has(row.batch_id)) {
            batchMap.set(row.batch_id, {
              batch_id: row.batch_id,
              tanggal: row.created_at,
              tipe_aktivitas: row.tipe_aktivitas,
              source: row.source,
              posisi_nama: row.posisi_nama || null,
              files: [],
              total: 0,
              upload_berhasil: 0,
              upload_gagal: 0,
              scoring_berhasil: 0,
              scoring_gagal: 0,
            });
          }
          const b = batchMap.get(row.batch_id);
          
          b.files.push({ 
            id: row.id,
            name: row.nama_file, 
            tipe_aktivitas: row.tipe_aktivitas,
            upload_status: row.upload_status, 
            upload_fail_reason: row.upload_fail_reason, 
            scoring_status: row.scoring_status,
            scoring_fail_reason: row.scoring_fail_reason,
            kandidatId: row.kandidat_id || null 
          });
          b.total += 1;
          
          if (row.upload_status === 'berhasil') b.upload_berhasil += 1;
          if (row.upload_status === 'gagal') b.upload_gagal += 1;
          if (row.scoring_status === 'berhasil') b.scoring_berhasil += 1;
          if (row.scoring_status === 'gagal') b.scoring_gagal += 1;
        }

        // Urutkan batch berdasarkan tanggal terbaru
        const sorted = Array.from(batchMap.values()).sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
        );
        setBatches(sorted);
      } catch (err) {
        console.error('Gagal memuat riwayat unggah:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBatches();
  }, [companyId]);

  const formatTanggal = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="ktr-table-wrap">
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          Memuat riwayat...
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="ktr-table-wrap">
        <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          Belum ada riwayat aktivitas.
        </div>
      </div>
    );
  }

  // --- Helper Status ---
  const getBatchStatusInfo = (item) => {
    let labelAktivitas = 'Unggah CV & Penilaian AI';
    if (item.tipe_aktivitas === 'upload_only') labelAktivitas = 'Unggah CV';
    if (item.tipe_aktivitas === 'scoring_only') labelAktivitas = 'Penilaian AI';
    
    let hasError = false;
    if (item.tipe_aktivitas === 'upload_only') {
      hasError = item.upload_gagal > 0;
    } else if (item.tipe_aktivitas === 'scoring_only') {
      hasError = item.scoring_gagal > 0;
    } else {
      hasError = item.files.some(f => {
        if (f.scoring_status === 'gagal') return true;
        if (f.upload_status === 'gagal' && f.scoring_status !== 'berhasil') return true;
        return false;
      });
    }
    
    let isProcessing = false;
    if (item.tipe_aktivitas === 'upload_only') {
      if (item.upload_berhasil + item.upload_gagal < item.total) isProcessing = true;
    } else if (item.tipe_aktivitas === 'scoring_only') {
      if (item.scoring_berhasil + item.scoring_gagal < item.total) isProcessing = true;
    } else {
      if (item.upload_berhasil + item.upload_gagal < item.total || item.scoring_berhasil + item.scoring_gagal < item.upload_berhasil) isProcessing = true;
    }
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    if (isProcessing && new Date(item.tanggal) < twoHoursAgo) {
      isProcessing = false;
      hasError = true;
    }

    let statusBerhasilText = `${labelAktivitas} Berhasil`;
    if (item.tipe_aktivitas === 'upload_and_scoring') {
      if (item.upload_berhasil === 0 && item.scoring_berhasil > 0) statusBerhasilText = 'Penilaian AI Berhasil';
      else if (item.scoring_berhasil === 0 && item.upload_berhasil > 0) statusBerhasilText = 'Unggah CV Berhasil';
    }

    let finalStatusText = '';
    if (hasError) {
      if (item.tipe_aktivitas === 'upload_and_scoring' && item.upload_gagal > 0 && item.scoring_berhasil > 0 && item.scoring_gagal > 0) {
        finalStatusText = 'Sebagian Gagal';
      } else {
        finalStatusText = `${labelAktivitas} Gagal`;
      }
    } else if (isProcessing) {
      finalStatusText = 'Sedang Diproses';
    } else {
      finalStatusText = statusBerhasilText;
    }

    return { labelAktivitas, hasError, isProcessing, statusBerhasilText, finalStatusText };
  };

  // --- Filtering Logic ---
  const getDisplaySource = (s) => s === 'Portal Karir' ? 'Portal Karir' : (s === 'HR' ? 'HR' : s);
  const uniqueSources = ['Semua', ...new Set(batches.map(b => getDisplaySource(b.source)))];

  const uniquePosisi = [
    'Semua',
    ...new Set(batches.map(b => b.posisi_nama).filter(Boolean)),
    ...(batches.some(b => !b.posisi_nama) ? ['Tanpa Posisi'] : []),
  ];

  // Cuma tampilkan status yang benar-benar muncul di data, bukan daftar statis
  const statusOptions = ['Semua', ...new Set(batches.map(b => getBatchStatusInfo(b).finalStatusText))];

  const filteredBatches = batches.filter(item => {
    const info = getBatchStatusInfo(item);
    const displaySource = getDisplaySource(item.source);

    if (filterSumber !== 'Semua' && displaySource !== filterSumber) return false;
    if (filterPosisi !== 'Semua') {
      if (filterPosisi === 'Tanpa Posisi') {
        if (item.posisi_nama) return false;
      } else if (item.posisi_nama !== filterPosisi) return false;
    }
    if (filterStatus !== 'Semua' && info.finalStatusText !== filterStatus) return false;

    if (filterDateStart || filterDateEnd) {
      const itemDate = new Date(item.tanggal);
      itemDate.setHours(0, 0, 0, 0);
      
      if (filterDateStart) {
        const start = new Date(filterDateStart);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }
      if (filterDateEnd) {
        const end = new Date(filterDateEnd);
        end.setHours(0, 0, 0, 0);
        if (itemDate > end) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="ktr-table-wrap">
      {/* Filter Section */}
      <div style={{ padding: '20px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px' }}>Sumber Aktivitas</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={filterSumber} 
              onChange={e => setFilterSumber(e.target.value)} 
              style={{ appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', minWidth: '180px', color: '#1e293b', transition: 'all 0.2s', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f8fafc'; }}
            >
              {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px' }}>Nama Posisi</label>
          <div style={{ position: 'relative' }}>
            <select
              value={filterPosisi}
              onChange={e => setFilterPosisi(e.target.value)}
              style={{ appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', minWidth: '200px', color: '#1e293b', transition: 'all 0.2s', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f8fafc'; }}
            >
              {uniquePosisi.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px' }}>Status Pengerjaan</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              style={{ appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', minWidth: '240px', color: '#1e293b', transition: 'all 0.2s', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f8fafc'; }}
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px' }}>Dari Tanggal</label>
          <input 
            type="date" 
            value={filterDateStart} 
            onChange={e => setFilterDateStart(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', width: '150px', color: '#1e293b', transition: 'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f8fafc'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px' }}>Sampai Tanggal</label>
          <input 
            type="date" 
            value={filterDateEnd} 
            onChange={e => setFilterDateEnd(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', width: '150px', color: '#1e293b', transition: 'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f8fafc'; }}
          />
        </div>

        {(filterSumber !== 'Semua' || filterPosisi !== 'Semua' || filterStatus !== 'Semua' || filterDateStart || filterDateEnd) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { setFilterSumber('Semua'); setFilterPosisi('Semua'); setFilterStatus('Semua'); setFilterDateStart(''); setFilterDateEnd(''); }}
              style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fecaca'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="ktr-table-header" style={{ alignItems: 'stretch', padding: '0 20px' }}>
        <div className="ktr-col-name" style={{ flex: 1.1, display: 'flex', alignItems: 'center' }}>Sesi Aktivitas</div>
        <div className="ktr-col-count" style={{ flex: 1.0, display: 'flex', alignItems: 'center' }}>Nama Posisi</div>
        <div className="ktr-col-count" style={{ flex: 1.0, display: 'flex', alignItems: 'center' }}>Sumber</div>
        <div className="ktr-col-count" style={{ flex: 0.6, display: 'flex', alignItems: 'center' }}>Total File</div>
        <div className="ktr-col-status" style={{ flex: 1.4, display: 'flex', alignItems: 'center' }}>Status</div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ padding: '8px 0', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600 }}>Unggah CV</div>
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b' }}>Berhasil</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b', borderLeft: '1px solid #e2e8f0' }}>Gagal</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ padding: '8px 0', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600 }}>Penilaian AI</div>
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b' }}>Berhasil</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b', borderLeft: '1px solid #e2e8f0' }}>Gagal</div>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredBatches.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Tidak ada data yang cocok dengan filter.
          </div>
        ) : filteredBatches.map((item, idx) => {
        const { labelAktivitas, hasError, isProcessing, statusBerhasilText, finalStatusText } = getBatchStatusInfo(item);

        let berhasilStyle = {};
        if (statusBerhasilText === 'Unggah CV Berhasil') {
          berhasilStyle = { backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fde047' }; // yellow
        } else if (statusBerhasilText === 'Penilaian AI Berhasil') {
          berhasilStyle = { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }; // blue
        } else {
          berhasilStyle = { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }; // green
        }
        
        return (
        <div
          key={item.batch_id}
          className={`ktr-table-row${idx % 2 === 1 ? ' ktr-row-alt' : ''}`}
          onClick={() => onView?.({
            id: item.batch_id,
            tanggal: formatTanggal(item.tanggal),
            tipe: labelAktivitas,
            sumber: item.source,
            total: item.total,
            berhasil: item.upload_berhasil, // using upload as primary for detail modal progress bar
            gagal: item.upload_gagal,
            status: 'selesai',
            files: item.files,
          })}
          style={{ cursor: 'pointer' }}
        >
          <div className="ktr-col-name" style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="ktr-import-name" style={{ fontWeight: 600 }}>{labelAktivitas}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{formatTanggal(item.tanggal)}</span>
          </div>
          <div className="ktr-col-count" style={{ flex: 1.0, fontSize: '12px', color: item.posisi_nama ? '#171e2c' : '#94a3b8' }}>
            {item.posisi_nama || '-'}
          </div>
          <div className="ktr-col-count" style={{ flex: 1.0 }}>
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              wordBreak: 'break-all',
              backgroundColor: 'transparent',
              border: item.source === 'Portal Karir' ? '1px solid #94a3b8' : '1px solid #3b82f6',
              color: item.source === 'Portal Karir' ? '#64748b' : '#3b82f6'
            }}>
              {item.source === 'Portal Karir' ? 'Portal Karir' : (item.source === 'HR' ? 'HR' : item.source)}
            </span>
          </div>
          <div className="ktr-col-count" style={{ flex: 0.6 }}>{item.total}</div>
          <div className="ktr-col-status" style={{ flex: 1.4 }}>
            {hasError ? (
              <span className="ktr-status-badge ktr-status-badge--error">
                {finalStatusText}
              </span>
            ) : isProcessing ? (
              <span className="ktr-status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' }}>Sedang Diproses</span>
            ) : (
              <span className="ktr-status-badge" style={berhasilStyle}>
                {finalStatusText}
              </span>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', color: '#171e2c', fontSize: '12px' }}>{item.tipe_aktivitas !== 'scoring_only' && item.upload_berhasil > 0 ? item.upload_berhasil : '-'}</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#171e2c', fontSize: '12px' }}>{item.tipe_aktivitas !== 'scoring_only' && item.upload_gagal > 0 ? item.upload_gagal : '-'}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', color: '#171e2c', fontSize: '12px' }}>{item.tipe_aktivitas !== 'upload_only' && item.scoring_berhasil > 0 ? item.scoring_berhasil : '-'}</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#171e2c', fontSize: '12px' }}>{item.tipe_aktivitas !== 'upload_only' && item.scoring_gagal > 0 ? item.scoring_gagal : '-'}</div>
          </div>
        </div>
      )})}
      </div>
    </div>
  );
}
