import useRiwayatUnggah, { getBatchStatusInfo, getDisplaySource, formatTanggal } from '../../hooks/kandidat/useRiwayatUnggah.js';

export default function KandidatRiwayatUnggah({ onView }) {
  const {
    isLoading, batches, filteredBatches,
    filterSumber, setFilterSumber, filterPosisi, setFilterPosisi,
    filterStatus, setFilterStatus, filterDateStart, setFilterDateStart, filterDateEnd, setFilterDateEnd,
    uniqueSources, uniquePosisi, statusOptions, hasActiveFilters, resetFilters,
  } = useRiwayatUnggah();

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

        {hasActiveFilters && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={resetFilters}
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
