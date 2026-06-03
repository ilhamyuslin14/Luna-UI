import { useState, useRef } from 'react';
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import Toast from '../../components/Toast.jsx';

const ArchiveSvg = () => (
  <svg width="12" height="12" viewBox="0 0 9 9" fill="none" style={{ marginRight: 4.5, display: 'inline-flex', alignItems: 'center' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const KAN_DATA = [
  { nama: 'Arif Jackberwin', jabatan: 'Junior Human Resources', periode: 'Jan 2024 – Okt 2024', perusahaan: 'PT. Indah Jaya', pengalaman: '10 Tahun', domisili: 'Jakarta Selatan, Indonesia', linkedin: 'linkedin.com/in/aula...' },
  { nama: 'Rofiq Gonzalez', jabatan: 'Senior Frontend Engineer', periode: 'Feb 2020 – Jan 2024', perusahaan: 'Tech Global Corp', pengalaman: '4 Tahun', domisili: 'Bandung, Indonesia', linkedin: 'linkedin.com/in/rofiq...' },
  { nama: 'Dito Arkademi', jabatan: 'Admin Manager', periode: 'Mar 2022 – Sekarang', perusahaan: 'PT Arkademi', pengalaman: '2 Tahun', domisili: 'Tangerang, Indonesia', linkedin: 'linkedin.com/in/dito...' },
  { nama: 'Siti Fatimah', jabatan: 'UX Designer', periode: 'Jun 2021 – Feb 2024', perusahaan: 'Design Studio Inc', pengalaman: '3 Tahun', domisili: 'Jakarta Barat, Indonesia', linkedin: 'linkedin.com/in/siti...' },
  { nama: 'Budi Santoso', jabatan: 'Backend Developer', periode: 'Jan 2019 – Des 2023', perusahaan: 'Bank Central Asia', pengalaman: '5 Tahun', domisili: 'Jakarta Pusat, Indonesia', linkedin: 'linkedin.com/in/budi...' },
];

export default function Kandidat({ navigate }) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [archiveModal, setArchiveModal] = useState(null);
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const toggleFilter = (s) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const selectAll = selectedRows.size === KAN_DATA.length;

  const toggleSelectAll = () => {
    if (selectAll) setSelectedRows(new Set());
    else setSelectedRows(new Set(KAN_DATA.map((_, i) => i)));
  };

  const toggleRow = (i) => {
    const next = new Set(selectedRows);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedRows(next);
  };

  return (
    <div className="kan-view" onClick={(e) => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
    }}>
      <div className="kan-header-container">
        <h1 className="kan-title">Kandidat</h1>
      </div>

      <div className="kan-actions-bar">
        <div className="kan-left-actions">
          <button className="kan-btn-primary" onClick={() => navigate('kandidat-tambah')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg> Tambah Kandidat
          </button>
        </div>
        <div className="kan-right-actions">
          <div className="kan-stats-badge">Jumlah Kandidat : <strong>8</strong></div>
          <div className="kan-divider"></div>
          {selectedRows.size > 0 && (
            <CTABulkAksi
              count={selectedRows.size}
              isOpen={showBulkDropdown}
              onToggle={() => { setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
              actions={[
                {
                  icon: <svg width="9" height="9" viewBox="0 0 9 8.745" fill="none"><path d="M7.875 2.25H6.75V1.6875C6.75 1.06641 6.24609 0.5625 5.625 0.5625H3.375C2.75391 0.5625 2.25 1.06641 2.25 1.6875V2.25H1.125C0.503906 2.25 0 2.75391 0 3.375V7.3125C0 7.93359 0.503906 8.4375 1.125 8.4375H7.875C8.49609 8.4375 9 7.93359 9 7.3125V3.375C9 2.75391 8.49609 2.25 7.875 2.25ZM3 1.6875C3 1.47891 3.16875 1.3125 3.375 1.3125H5.625C5.83125 1.3125 6 1.47891 6 1.6875V2.25H3V1.6875ZM8.25 7.3125C8.25 7.51875 8.08125 7.6875 7.875 7.6875H1.125C0.91875 7.6875 0.75 7.51875 0.75 7.3125V5.25H8.25V7.3125ZM8.25 4.5H0.75V3.375C0.75 3.16875 0.91875 3 1.125 3H7.875C8.08125 3 8.25 3.16875 8.25 3.375V4.5Z" fill="currentColor" /></svg>,
                  label: 'Tambahkan ke Lowongan',
                  onClick: () => { alert(`${selectedRows.size} Kandidat berhasil ditambahkan ke Lowongan!`); setSelectedRows(new Set()); setShowBulkDropdown(false); },
                },
                { type: 'divider' },
                {
                  icon: <ArchiveSvg />,
                  label: 'Arsipkan',
                  onClick: () => { const n = selectedRows.size; setShowBulkDropdown(false); setArchiveModal({ title: 'Arsipkan Kandidat', body: `Apakah Anda yakin ingin mengarsipkan ${n} kandidat yang dipilih?`, onConfirm: () => { setSelectedRows(new Set()); setArchiveModal(null); } }); },
                },
              ]}
            />
          )}
          <FilterDropdown
            groups={[
              { title: 'Status', options: ['Aktif', 'Arsip'] },
              { title: 'Pengalaman', options: ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'] },
              { title: 'Jabatan', options: ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'] },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={() => { setShowBulkDropdown(false); setShowFilterDropdown(v => !v); }}
          />
        </div>
      </div>

      <div className="kan-table-container">
        <table className="kan-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" className="kan-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th width="250">Nama Kandidat</th>
              <th width="200">Jabatan</th>
              <th width="160">Perusahaan</th>
              <th width="110">Pengalaman</th>
              <th width="190">Domisili</th>
              <th width="150">LinkedIn</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {KAN_DATA.map((k, i) => (
              <tr key={i}>
                <td><input type="checkbox" className="kan-checkbox kan-row-checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} /></td>
                <td className="kan-name kan-name-link" onClick={() => navigate('kandidat-detail', { kandidat: { nama: k.nama, jabatan: k.jabatan, perusahaan: k.perusahaan, domisili: k.domisili, linkedin: k.linkedin, pengalaman: k.pengalaman } })}>{k.nama}</td>
                <td>
                  <div className="kan-jabatan-container">
                    <div className="kan-jabatan">{k.jabatan}</div>
                    <div className="kan-periode">{k.periode}</div>
                  </div>
                </td>
                <td>{k.perusahaan}</td>
                <td>{k.pengalaman}</td>
                <td>{k.domisili}</td>
                <td>{k.linkedin}</td>
                <td>
                  <div className="kan-actions">
                    <button className="kan-btn-outline" onClick={() => setArchiveModal({ title: 'Arsipkan Kandidat', body: 'Apakah Anda yakin ingin mengarsipkan kandidat ini?', onConfirm: () => setArchiveModal(null) })}>
                      <img src="/assets/archive.svg" style={{ marginRight: 4.5 }} /> Arsipkan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={() => { archiveModal.onConfirm(); showToast('Berhasil diarsipkan', 'Kandidat telah dipindahkan ke arsip'); }}
          onClose={() => setArchiveModal(null)}
        />
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}

      <Pagination />
    </div>
  );
}
