import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getEmployees } from '../../services/employeeService.js';
import { getAlurSeleksi, alurNamaByLevel } from '../../services/alurSeleksiService.js';
import Pagination from '../../components/Pagination.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';

function formatTanggal(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_STYLE = {
  8: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },   // Diterima
  9: { bg: '#fff5eb', text: '#c2540c', border: '#ffac4e' },   // Onboarding
  10: { bg: '#edfcf2', text: '#089f32', border: '#bbf7d0' },  // Lolos Masa Percobaan
};

export default function Karyawan({ navigate, searchQuery = '' }) {
  const { companyId } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [alurList, setAlurList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [activeSort, setActiveSort] = useState('nama_asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    Promise.all([getEmployees(companyId), getAlurSeleksi(companyId)])
      .then(([emp, alur]) => { setEmployees(emp); setAlurList(alur); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [companyId]);

  useEffect(() => { setPage(1); }, [searchQuery, activeFilters, activeSort]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  // Nama status diambil dinamis dari alur_seleksi (bisa custom per company),
  // bukan di-hardcode, supaya filter selalu cocok dengan label yang ditampilkan.
  const statusOptions = useMemo(
    () => [8, 9, 10].map(level => alurNamaByLevel(alurList, level)),
    [alurList]
  );

  const filteredData = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    let list = employees;

    if (q) {
      list = list.filter(e =>
        (e.kandidat?.nama_lengkap || '').toLowerCase().includes(q) ||
        (e.posisi || '').toLowerCase().includes(q) ||
        (e.departemen || '').toLowerCase().includes(q)
      );
    }

    if (activeFilters.size > 0) {
      list = list.filter(e => activeFilters.has(alurNamaByLevel(alurList, e.alurProses)));
    }

    const sorted = [...list];
    switch (activeSort) {
      case 'nama_asc': sorted.sort((a, b) => (a.kandidat?.nama_lengkap || '').localeCompare(b.kandidat?.nama_lengkap || '')); break;
      case 'nama_desc': sorted.sort((a, b) => (b.kandidat?.nama_lengkap || '').localeCompare(a.kandidat?.nama_lengkap || '')); break;
      case 'date_asc': sorted.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)); break;
      case 'date_desc': default: sorted.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)); break;
    }
    return sorted;
  }, [employees, searchQuery, activeFilters, activeSort, alurList]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pagedData = filteredData.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="kan001-view" onClick={e => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
    }}>
      <div className="kan001-toolbar-row">
        <div className="kan001-title-group">
          <h1 className="kan001-title">Karyawan</h1>
          <span className="kan001-count-text">{filteredData.length} karyawan</span>
        </div>
        <div className="kan001-toolbar-spacer"></div>
        <div className="kan001-right-actions">
          <SortDropdown
            options={[
              { label: 'Nama (A-Z)', value: 'nama_asc' },
              { label: 'Nama (Z-A)', value: 'nama_desc' },
              { label: 'Terbaru', value: 'date_desc' },
              { label: 'Terlama', value: 'date_asc' },
            ]}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            isOpen={showSortDropdown}
            onToggleOpen={() => { setShowFilterDropdown(false); setShowSortDropdown(v => !v); }}
          />
          <FilterDropdown
            groups={[{ title: 'Status', options: statusOptions }]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={() => { setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
          />
        </div>
      </div>

      <div className="kan001-table-container">
        <table className="kan001-table">
          <thead>
            <tr>
              <th width="230">Nama</th>
              <th width="190">Posisi</th>
              <th width="160">Departemen</th>
              <th width="160">Status</th>
              <th width="190">Alamat</th>
              <th width="130">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Memuat data karyawan...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                {employees.length === 0 ? 'Belum ada karyawan.' : 'Tidak ada karyawan yang sesuai filter.'}
              </td></tr>
            ) : (
              pagedData.map(e => {
                const style = STATUS_STYLE[e.alurProses] || STATUS_STYLE[8];
                return (
                  <tr key={e.scoringId}>
                    <td
                      className="kan001-name kan001-name-link"
                      onClick={() => navigate('kandidat-detail_001', { kandidat: { ...e.kandidat, nama: e.kandidat.nama_lengkap } })}
                      style={{ maxWidth: 230, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >{e.kandidat?.nama_lengkap || 'Belum ada nama'}</td>
                    <td style={{ maxWidth: 190, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.posisi}</td>
                    <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.departemen}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                        {alurNamaByLevel(alurList, e.alurProses)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 190, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.kandidat?.domisili || '-'}</td>
                    <td>{formatTanggal(e.updatedAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={totalPages}
        perPage={perPage}
        onPageChange={p => setPage(Math.min(Math.max(1, p), totalPages))}
        onPerPageChange={n => { setPerPage(n); setPage(1); }}
      />
    </div>
  );
}
