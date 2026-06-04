import { useState } from 'react';
import BackButton from '../../components/BackButton.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import Pagination from '../../components/Pagination.jsx';

const INITIAL_SELEKSI_ROWS = [
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'rencana' },
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'aktif' },
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'ditahan' },
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'selesai' },
  { posisi: 'Backend Engineer', dept: 'Tech', lokasi: 'Jakarta Selatan', alur: 'Tanpa Kandidat', kandidat: 86, upahMin: 'Rp. 6.000.000', upahMaks: 'Rp. 8.000.000', tanggal: '19 Feb 2026', status: 'dibatalkan' },
];

const STATUS_CONFIG = {
  rencana: { icon: '/assets/status/status_rencana.svg', label: 'Rencana' },
  aktif: { icon: '/assets/status/status_aktif.svg', label: 'Aktif' },
  ditahan: { icon: '/assets/status/status_ditahan.svg', label: 'Ditahan' },
  selesai: { icon: '/assets/status/status_selesai.svg', label: 'Selesai' },
  dibatalkan: { icon: '/assets/status/status_dibatalkan.svg', label: 'Dibatalkan' },
};


export default function DepartemenSeleksi({ navigate, onBack }) {
  const [rows, setRows] = useState(INITIAL_SELEKSI_ROWS);
  const [openStatusIdx, setOpenStatusIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const selectAll = selectedRows.size === rows.length;

  const toggleSelectAll = () => {
    if (selectAll) setSelectedRows(new Set());
    else setSelectedRows(new Set(rows.map((_, i) => i)));
  };

  const toggleRow = (i) => {
    const next = new Set(selectedRows);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedRows(next);
  };

  const updateStatus = (rowIdx, newStatus) => {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, status: newStatus } : r));
    setOpenStatusIdx(null);
  };


  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      onClick={(e) => {
        if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
        if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
        if (!e.target.closest('.lw-status-wrapper')) setOpenStatusIdx(null);
      }}
    >
      {/* Actions Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e5ec', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '64px', flexShrink: 0 }}>
        {onBack && (
          <BackButton onClick={onBack} />
        )}
        <div className="lw-right-actions">
          <div className="lw-stats-badge">Jumlah Posisi : <strong>{rows.length}</strong></div>
          <div className="lw-divider" />
          {selectedRows.size > 0 && (
            <CTABulkAksi
              count={selectedRows.size}
              isOpen={showBulkDropdown}
              onToggle={(e) => { e?.stopPropagation(); setShowBulkDropdown(v => !v); }}
              actions={[
                {
                  icon: <svg width="9" height="9" viewBox="0 0 8.25 8.60156" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" /></svg>,
                  label: 'Arsipkan',
                  onClick: () => { alert(`${selectedRows.size} Posisi berhasil diarsipkan!`); setSelectedRows(new Set()); setShowBulkDropdown(false); },
                },
              ]}
            />
          )}
          <FilterDropdown
            groups={[
              { title: 'Alur Seleksi', options: ['Kandidat Baru', 'Terseleksi', 'Diajukan', 'Penjadwalan Wawancara', 'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja', 'Diterima'] },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={(e) => { e?.stopPropagation(); setShowFilterDropdown(v => !v); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="lw-table-container" style={{ flex: 1 }}>
        <table className="lw-table">
          <thead>
            <tr>
              <th width="24"><input type="checkbox" className="lw-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th width="184">Posisi</th>
              <th width="130">Departemen</th>
              <th width="120">Lokasi</th>
              <th width="145">Status</th>
              <th width="124">Alur Seleksi</th>
              <th width="134">Jumlah Kandidat</th>
              <th width="108">Upah Min</th>
              <th width="100">Upah Maks</th>
              <th width="106">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const cfg = STATUS_CONFIG[row.status];
              return (
                <tr key={i}>
                  <td><input type="checkbox" className="lw-checkbox lw-row-checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} /></td>
                  <td className="lw-posisi clickable" onClick={() => navigate('seleksi-detail', { jabatan: row.posisi })}>{row.posisi}</td>
                  <td>{row.dept}</td>
                  <td>{row.lokasi}</td>
                  <td>
                    <div className="lw-status-wrapper" onClick={(e) => { e.stopPropagation(); setOpenStatusIdx(openStatusIdx === i ? null : i); }}>
                      <div className={`lw-status-bubble ${row.status}`}>
                        <div className="lw-status-content">
                          <div className="lw-icon-wrapper"><img src={cfg.icon} /></div>
                          <span className="lw-status-text">{cfg.label}</span>
                        </div>
                        <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1L5 5L9 1" stroke="#323b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {openStatusIdx === i && (
                        <div className="lw-status-dropdown active">
                          {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                            <div key={key} className="lw-status-dropdown-item" data-status={key} onClick={(e) => { e.stopPropagation(); updateStatus(i, key); }}>
                              <div className="lw-icon-wrapper"><img src={s.icon} /></div> {s.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{row.alur}</td>
                  <td><div className="lw-kandidat-badge">{row.kandidat}</div></td>
                  <td>{row.upahMin}</td>
                  <td>{row.upahMaks}</td>
                  <td>{row.tanggal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination 
        page={1} 
        total={3} 
        perPage={10} 
      />
    </div>
  );
}
