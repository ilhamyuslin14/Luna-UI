import { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getKandidat, getDirekrutKandidat, archiveKandidat, unarchiveKandidat } from '../../services/kandidatService.js';
import { getSeleksi } from '../../services/seleksiService.js';
import { getCached, invalidate } from '../../services/dataCache.js';
import Pagination from '../../components/Pagination.jsx';
import PopupKonfirmasi from '../../components/PopupKonfirmasi.jsx';
import CTABulkAksi from '../../components/CTABulkAksi.jsx';
import FilterDropdown from '../../components/FilterDropdown.jsx';
import SortDropdown from '../../components/SortDropdown.jsx';
import Toast from '../../components/Toast.jsx';

const ArchiveSvg = ({ style } = {}) => (
  <svg width="12" height="12" viewBox="0 0 9 9" fill="none" style={{ marginRight: 4.5, display: 'inline-flex', alignItems: 'center', ...style }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.25C0 2.19776 0.01068 2.14802 0.0299775 2.10284L0.58824 0.707186C0.759086 0.280069 1.17276 0 1.63278 0H6.61721C7.07723 0 7.49093 0.280069 7.66178 0.707186L8.22004 2.10283C8.23931 2.14802 8.25 2.19776 8.25 2.25V7.47656C8.25 8.0979 7.74634 8.60156 7.125 8.60156H1.125C0.503681 8.60156 0 8.0979 0 7.47656L0 2.25ZM7.32113 1.875H0.928886L1.2846 0.985729C1.34154 0.843356 1.47944 0.75 1.63278 0.75H6.61721C6.77055 0.75 6.90844 0.843356 6.9654 0.985729L7.32113 1.875ZM0.75 2.625V7.47656C0.75 7.68368 0.917895 7.85156 1.125 7.85156H7.125C7.33211 7.85156 7.5 7.68368 7.5 7.47656V2.625H0.75ZM4.125 3.375C4.33211 3.375 4.5 3.54289 4.5 3.75V5.46968L4.98484 4.98484C5.13128 4.8384 5.36872 4.8384 5.51516 4.98484C5.6616 5.13128 5.6616 5.36872 5.51516 5.51516L4.39016 6.64016C4.24372 6.7866 4.00628 6.7866 3.85984 6.64016L2.73483 5.51516C2.58839 5.36872 2.58839 5.13128 2.73483 4.98484C2.88128 4.8384 3.11872 4.8384 3.26517 4.98484L3.75 5.46968V3.75C3.75 3.54289 3.91789 3.375 4.125 3.375Z" fill="currentColor" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="lw001-iaction-spinner">
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </svg>
);

const IconDownloadSmall = ({ spinning } = {}) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'lw001-iaction-spinner' : undefined}>
    {spinning
      ? <path d="M21 12a9 9 0 1 1-6.22-8.56" />
      : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>}
  </svg>
);

const getPeriodeText = (k) => {
  try {
    let exps = [];
    if (Array.isArray(k.pengalaman_kerja)) {
      exps = k.pengalaman_kerja;
    } else if (typeof k.pengalaman_kerja === 'string' && k.pengalaman_kerja.trim().startsWith('[')) {
      exps = JSON.parse(k.pengalaman_kerja);
    }
    
    if (exps && exps.length > 0) {
      // Find the most recent or matching current job, or just first
      const exp = exps[0];
      const formatDate = (ds) => {
        if (!ds || ds === 'Present') return ds === 'Present' ? 'Sekarang' : '';
        const d = new Date(ds);
        if (isNaN(d.getTime())) return ds;
        return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      };
      const start = formatDate(exp.start);
      const end = formatDate(exp.end);
      if (start && end) return `${start} – ${end}`;
      if (start) return `${start} – Sekarang`;
    }
  } catch(e) {}
  return k.periode || '-';
};

export default function Kandidat_001({ navigate, searchQuery = '', filter = '' }) {
  const { companyId } = useAuth();
  const { enqueueScoringJob } = useUpload();

  const [kandidatData, setKandidatData]     = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selectedRows, setSelectedRows]     = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown]     = useState(false);
  const [activeFilters, setActiveFilters]   = useState(new Set());
  const [activeSort, setActiveSort]         = useState('nama_asc');
  const [showBulkDropdown, setShowBulkDropdown]     = useState(false);
  const [archiveModal, setArchiveModal]     = useState(null);
  const [unarchiveModal, setUnarchiveModal] = useState(null);
  const [lowonganModal, setLowonganModal]   = useState(false);
  const [lowonganSearchQuery, setLowonganSearchQuery] = useState('');
  const [seleksiList, setSeleksiList]       = useState([]);
  const [selectedSeleksi, setSelectedSeleksi] = useState(null);
  const [isLoadingSeleksi, setIsLoadingSeleksi] = useState(false);
  const [toast, setToast]                   = useState(null);
  const toastTimer                          = useRef(null);
  const [downloadingId, setDownloadingId]   = useState(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [page, setPage]                     = useState(1);
  const [perPage, setPerPage]               = useState(25);

  useEffect(() => {
    let mounted = true;
    const cacheKey = filter === 'direkrut' ? `kandidat:direkrut:${companyId}` : `kandidat:${companyId}`;
    const fetchFn = filter === 'direkrut' ? () => getDirekrutKandidat(companyId) : () => getKandidat(companyId);
    setIsLoading(true);
    getCached(cacheKey, fetchFn)
      .then(data => { if (mounted) setKandidatData(data || []); })
      .catch(err => { if (mounted) console.error(err); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [companyId, filter]);

  useEffect(() => { setPage(1); }, [activeFilters]);

  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const PENGALAMAN_OPTS = ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'];
  const JABATAN_OPTS    = ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'];

  const filteredData = useMemo(() => {
    let result = kandidatData;

    const statusActive = ['Aktif', 'Arsip'].filter(f => activeFilters.has(f));
    if (statusActive.length === 1) {
      if (statusActive[0] === 'Arsip') result = result.filter(k => k.arsip === true);
      else result = result.filter(k => !k.arsip);
    } else if (statusActive.length === 0) {
      result = result.filter(k => !k.arsip);
    }

    if (activeFilters.has('Portal Karier')) {
      result = result.filter(k => k.sumber === 'public');
    }

    const pengalamanActive = PENGALAMAN_OPTS.filter(f => activeFilters.has(f));
    if (pengalamanActive.length > 0) {
      result = result.filter(k => {
        const tahun = parseFloat(k.pengalaman_tahun) || 0;
        return pengalamanActive.some(f => {
          if (f === '0-2 Tahun')  return tahun >= 0 && tahun <= 2;
          if (f === '2-5 tahun')  return tahun > 2  && tahun <= 5;
          if (f === '5-10 tahun') return tahun > 5  && tahun <= 10;
          if (f === '>10 tahun')  return tahun > 10;
          return false;
        });
      });
    }

    const jabatanActive = JABATAN_OPTS.filter(f => activeFilters.has(f));
    if (jabatanActive.length > 0) {
      result = result.filter(k => {
        const jabatan = (k.jabatan_saat_ini || '').toLowerCase();
        return jabatanActive.some(f => jabatan.includes(f.toLowerCase()));
      });
    }

    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      result = result.filter(k => 
        (k.nama_lengkap || '').toLowerCase().includes(sq) ||
        (k.jurusan || '').toLowerCase().includes(sq) ||
        (k.domisili || '').toLowerCase().includes(sq)
      );
    }

    // Apply Sorting
    result = [...result].sort((a, b) => {
      switch (activeSort) {
        case 'nama_asc':
          return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
        case 'nama_desc':
          return (b.nama_lengkap || '').localeCompare(a.nama_lengkap || '');
        case 'date_desc':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'date_asc':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [kandidatData, activeFilters, searchQuery, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pagedData  = filteredData.slice((page - 1) * perPage, page * perPage);

  const selectAll = pagedData.length > 0 && pagedData.every(k => selectedRows.has(k.id));
  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (selectAll) pagedData.forEach(k => next.delete(k.id));
    else pagedData.forEach(k => next.add(k.id));
    setSelectedRows(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  /* ── Archive ──────────────────────────────────────────────── */
  const doArchive = async (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    await archiveKandidat(idArr);
    invalidate('kandidat');
    setKandidatData(prev => prev.map(k => idArr.includes(k.id) ? { ...k, arsip: true } : k));
    setSelectedRows(prev => { const n = new Set(prev); idArr.forEach(id => n.delete(id)); return n; });
    showToast('Berhasil diarsipkan', `${idArr.length} kandidat dipindahkan ke arsip`);
  };

  const openArchiveModal = (ids) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    setArchiveModal({
      title: 'Arsipkan Kandidat',
      body: idArr.length === 1
        ? 'Apakah Anda yakin ingin mengarsipkan kandidat ini?'
        : `Apakah Anda yakin ingin mengarsipkan ${idArr.length} kandidat yang dipilih?`,
      ids: idArr,
    });
  };

  /* ── Unduh CV ─────────────────────────────────────────────── */
  const handleDownloadCv = async (k) => {
    if (!k.cv_url || downloadingId) return;
    setDownloadingId(k.id);
    try {
      const ext = k.cv_url.split('.').pop().split('?')[0] || 'pdf';
      const safeName = (k.nama_lengkap || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CV_${safeName}.${ext}`;

      const response = await fetch(k.cv_url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, using fallback', err);
      window.open(k.cv_url, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  /* ── Unduh CV (bulk, dikemas jadi satu .zip) ─────────────────── */
  const handleBulkDownloadCv = async (ids) => {
    if (isBulkDownloading) return;
    const targets = kandidatData.filter(k => ids.includes(k.id) && k.cv_url);

    if (targets.length === 0) {
      showToast('Belum ada CV', 'Kandidat yang dipilih belum punya CV yang diunggah');
      return;
    }

    setIsBulkDownloading(true);
    try {
      const zip = new JSZip();
      const usedNames = new Set();
      let failCount = 0;

      await Promise.all(targets.map(async (k) => {
        try {
          const response = await fetch(k.cv_url);
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();

          const ext = k.cv_url.split('.').pop().split('?')[0] || 'pdf';
          const safeName = (k.nama_lengkap || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
          let filename = `${safeName}.${ext}`;
          let suffix = 2;
          while (usedNames.has(filename)) {
            filename = `${safeName}_${suffix}.${ext}`;
            suffix += 1;
          }
          usedNames.add(filename);
          zip.file(filename, blob);
        } catch (err) {
          console.error(`Gagal mengunduh CV ${k.nama_lengkap}:`, err);
          failCount += 1;
        }
      }));

      const successCount = targets.length - failCount;
      if (successCount === 0) {
        showToast('Gagal mengunduh', 'Semua CV gagal diambil, coba lagi');
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const dateStr = new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `CV_Kandidat_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        'CV berhasil diunduh',
        failCount > 0
          ? `${successCount} CV dikemas dalam satu ZIP, ${failCount} gagal diambil`
          : `${successCount} CV dikemas dalam satu file ZIP`
      );
      setSelectedRows(new Set());
    } catch (err) {
      console.error('Bulk download failed', err);
      showToast('Gagal mengunduh', 'Terjadi kesalahan saat mengemas file CV');
    } finally {
      setIsBulkDownloading(false);
    }
  };

  /* ── Tambahkan ke Lowongan ────────────────────────────────── */
  const openLowonganModal = () => {
    setShowBulkDropdown(false);
    setSelectedSeleksi(null);
    setLowonganModal(true);
    setIsLoadingSeleksi(true);
    getSeleksi(companyId)
      .then(rows => setSeleksiList((rows || []).filter(s => !s.arsip)))
      .catch(() => showToast('Gagal memuat', 'Gagal memuat daftar lowongan'))
      .finally(() => setIsLoadingSeleksi(false));
  };

  const handleTambahkanKeLowongan = (seleksi) => {
    if (!seleksi) return;
    const ids = [...selectedRows];
    ids.forEach(kandidatId => {
      const k = kandidatData.find(c => c.id === kandidatId);
      enqueueScoringJob(kandidatId, seleksi.id, seleksi.jabatan, k?.nama_lengkap || '', companyId);
    });
    setLowonganModal(false);
    setSelectedRows(new Set());
    setLowonganSearchQuery('');
    showToast('Kandidat ditambahkan', `${ids.length} kandidat sedang dinilai untuk ${seleksi.jabatan}`);
  };

  const filteredSeleksiList = seleksiList.filter(s => 
    (s.jabatan || '').toLowerCase().includes(lowonganSearchQuery.toLowerCase()) ||
    (s.departments?.name || s.departemen || '').toLowerCase().includes(lowonganSearchQuery.toLowerCase())
  );

  return (
    <div className="kan001-view" onClick={e => {
      if (!e.target.closest('.filter-dropdown-container')) setShowFilterDropdown(false);
      if (!e.target.closest('.bulk-aksi-container')) setShowBulkDropdown(false);
    }}>
      <div className="kan001-toolbar-row">
        <div className="kan001-title-group">
          <h1 className="kan001-title">Kandidat</h1>
          <span className="kan001-count-text">{filteredData.length} kandidat</span>
        </div>
        <div className="kan001-toolbar-spacer"></div>
        <div className="kan001-right-actions">
          {selectedRows.size > 0 && (
            <CTABulkAksi
              count={selectedRows.size}
              isOpen={showBulkDropdown}
              onToggle={() => { setShowFilterDropdown(false); setShowBulkDropdown(v => !v); }}
              actions={
                activeFilters.has('Arsip') ? [
                  {
                    icon: <IconDownloadSmall spinning={isBulkDownloading} />,
                    label: isBulkDownloading ? 'Mengemas CV...' : 'Unduh CV Terpilih',
                    onClick: () => { setShowBulkDropdown(false); handleBulkDownloadCv([...selectedRows]); },
                  },
                  { type: 'divider' },
                  {
                    icon: <ArchiveSvg style={{ transform: 'rotate(180deg)' }} />,
                    label: 'Tampilkan',
                    onClick: () => { setShowBulkDropdown(false); setUnarchiveModal({ isBulk: true }); },
                  },
                ] : [
                  {
                    icon: <svg width="9" height="9" viewBox="0 0 9 8.745" fill="none"><path d="M7.875 2.25H6.75V1.6875C6.75 1.06641 6.24609 0.5625 5.625 0.5625H3.375C2.75391 0.5625 2.25 1.06641 2.25 1.6875V2.25H1.125C0.503906 2.25 0 2.75391 0 3.375V7.3125C0 7.93359 0.503906 8.4375 1.125 8.4375H7.875C8.49609 8.4375 9 7.93359 9 7.3125V3.375C9 2.75391 8.49609 2.25 7.875 2.25ZM3 1.6875C3 1.47891 3.16875 1.3125 3.375 1.3125H5.625C5.83125 1.3125 6 1.47891 6 1.6875V2.25H3V1.6875ZM8.25 7.3125C8.25 7.51875 8.08125 7.6875 7.875 7.6875H1.125C0.91875 7.6875 0.75 7.51875 0.75 7.3125V5.25H8.25V7.3125ZM8.25 4.5H0.75V3.375C0.75 3.16875 0.91875 3 1.125 3H7.875C8.08125 3 8.25 3.16875 8.25 3.375V4.5Z" fill="currentColor" /></svg>,
                    label: 'Tambahkan ke Lowongan',
                    onClick: openLowonganModal,
                  },
                  { type: 'divider' },
                  {
                    icon: <IconDownloadSmall spinning={isBulkDownloading} />,
                    label: isBulkDownloading ? 'Mengemas CV...' : 'Unduh CV Terpilih',
                    onClick: () => { setShowBulkDropdown(false); handleBulkDownloadCv([...selectedRows]); },
                  },
                  { type: 'divider' },
                  {
                    icon: <ArchiveSvg />,
                    label: 'Arsipkan',
                    onClick: () => { setShowBulkDropdown(false); openArchiveModal([...selectedRows]); },
                  },
                ]
              }
            />
          )}
          <SortDropdown
            options={[
              { label: 'Nama (A-Z)', value: 'nama_asc' },
              { label: 'Nama (Z-A)', value: 'nama_desc' },
              { label: 'Terbaru', value: 'date_desc' },
              { label: 'Terlama', value: 'date_asc' }
            ]}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            isOpen={showSortDropdown}
            onToggleOpen={() => { setShowBulkDropdown(false); setShowFilterDropdown(false); setShowSortDropdown(v => !v); }}
          />
          <FilterDropdown
            groups={[
              { title: 'Status', options: ['Arsip'] },
              { title: 'Sumber', options: ['Portal Karier'] },
              { title: 'Pengalaman', options: ['0-2 Tahun', '2-5 tahun', '5-10 tahun', '>10 tahun'] },
              { title: 'Jabatan', options: ['Intern', 'Junior', 'Staff', 'Senior', 'Supervisor', 'Manager', 'Head of', 'General Manager', 'Advisor'] },
            ]}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            isOpen={showFilterDropdown}
            onToggleOpen={() => { setShowBulkDropdown(false); setShowSortDropdown(false); setShowFilterDropdown(v => !v); }}
          />
          <button className="kan001-btn-primary" onClick={() => navigate('kandidat-tambah')}>
            <span className="kan001-btn-primary-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Kandidat
          </button>
        </div>
      </div>

      <div className="kan001-table-container">
        <table className="kan001-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" className="kan001-checkbox-all" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th width="250">Nama Kandidat</th>
              <th width="200">Jabatan</th>
              <th width="160">Perusahaan</th>
              <th width="110">Pengalaman</th>
              <th width="190">Domisili</th>
              <th width="150">LinkedIn</th>
              <th width="128">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Memuat data kandidat...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                {kandidatData.filter(k => !k.arsip).length === 0 ? 'Belum ada kandidat.' : 'Tidak ada kandidat yang sesuai filter.'}
              </td></tr>
            ) : (
              pagedData.map(k => (
                <tr key={k.id}>
                  <td><input type="checkbox" className="kan001-checkbox kan001-row-checkbox" checked={selectedRows.has(k.id)} onChange={() => toggleRow(k.id)} /></td>
                  <td
                    className={`kan001-name${k.arsip ? '' : ' kan001-name-link'}`}
                    onClick={k.arsip ? undefined : () => navigate('kandidat-detail_001', { kandidat: { ...k, nama: k.nama_lengkap } })}
                    style={{ maxWidth: 250, ...(k.arsip ? { cursor: 'default', opacity: 0.5 } : {}) }}
                  >
                    <span className="kan001-name-cell">
                      <span className="kan001-name-text">{k.nama_lengkap || 'Belum ada nama'}</span>
                      {k.sumber === 'public' && (
                        <span className="kan001-src-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.7 3.6 6 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-6-3.6-9s1.2-6.3 3.6-9z" />
                          </svg>
                          <span className="kan001-src-badge-tip">Melamar mandiri via Portal Karier</span>
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={{ maxWidth: 250 }}>
                    <div className="kan001-jabatan-container">
                      <div className="kan001-jabatan" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.jabatan_saat_ini || '-'}</div>
                      <div className="kan001-periode" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getPeriodeText(k)}</div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.perusahaan_saat_ini || '-'}</td>
                  <td>{k.pengalaman_tahun ? `${k.pengalaman_tahun} Tahun` : '-'}</td>
                  <td style={{ maxWidth: 190, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.domisili || '-'}</td>
                  <td style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {k.linkedin_url ? (
                      <a href={k.linkedin_url.startsWith('http') ? k.linkedin_url : `https://${k.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--luna-orange-500)', textDecoration: 'none' }}>
                        {k.linkedin_url}
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    {k.arsip ? (
                      <div className="kan001-actions">
                        <button className="lw001-btn-outline btn-show" onClick={() => setUnarchiveModal({ id: k.id, nama: k.nama_lengkap })}>
                          Tampilkan
                        </button>
                      </div>
                    ) : (
                      <div className="lw001-icon-actions">
                        <button
                          className="lw001-iaction-btn"
                          onClick={() => navigate('kandidat-detail_001', { kandidat: { ...k, nama: k.nama_lengkap } })}
                        >
                          <span className="lw001-iaction-tip">Lihat Profil Kandidat</span>
                          <IconEye />
                        </button>

                        <button
                          className="lw001-iaction-btn"
                          disabled={!k.cv_url || downloadingId === k.id}
                          onClick={() => handleDownloadCv(k)}
                        >
                          <span className="lw001-iaction-tip">
                            {k.cv_url ? 'Unduh CV' : 'CV belum diunggah'}
                          </span>
                          {downloadingId === k.id ? <IconSpinner /> : <IconDownload />}
                        </button>

                        <button className="lw001-iaction-btn danger" onClick={() => openArchiveModal(k.id)}>
                          <span className="lw001-iaction-tip">Arsipkan Kandidat</span>
                          <ArchiveSvg style={{ marginRight: 0, width: 14, height: 14 }} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
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

      {/* Archive confirmation */}
      {archiveModal && (
        <PopupKonfirmasi
          title={archiveModal.title}
          body={archiveModal.body}
          confirmLabel="Arsipkan"
          onConfirm={async () => {
            setArchiveModal(null);
            try { await doArchive(archiveModal.ids); }
            catch { showToast('Gagal mengarsipkan', 'Terjadi kesalahan, coba lagi'); }
          }}
          onClose={() => setArchiveModal(null)}
        />
      )}

      {unarchiveModal && (
        <PopupKonfirmasi
          title="Tampilkan Kandidat"
          body={unarchiveModal.isBulk
            ? `Apakah Anda yakin ingin menampilkan ${selectedRows.size} kandidat yang dipilih?`
            : `Tampilkan kembali "${unarchiveModal.nama}"? Kandidat akan kembali aktif.`}
          confirmLabel="Tampilkan"
          onConfirm={async () => {
            if (unarchiveModal.isBulk) {
              const ids = [...selectedRows];
              setUnarchiveModal(null);
              try {
                await Promise.all(ids.map(id => unarchiveKandidat(id)));
                invalidate('kandidat');
                setKandidatData(prev => prev.map(k => ids.includes(k.id) ? { ...k, arsip: false } : k));
                setSelectedRows(new Set());
                showToast('Kandidat ditampilkan', `${ids.length} kandidat kembali aktif`);
              } catch {
                showToast('Gagal', 'Tidak dapat menampilkan kandidat');
              }
            } else {
              const { id, nama } = unarchiveModal;
              setUnarchiveModal(null);
              try {
                await unarchiveKandidat(id);
                invalidate('kandidat');
                setKandidatData(prev => prev.map(k => k.id === id ? { ...k, arsip: false } : k));
                showToast('Kandidat ditampilkan', `${nama} kembali aktif`);
              } catch {
                showToast('Gagal', 'Tidak dapat menampilkan kandidat');
              }
            }
          }}
          onClose={() => setUnarchiveModal(null)}
        />
      )}

      {/* Tambahkan ke Lowongan modal */}
      {lowonganModal && (
        <div className="kd001-posisi-overlay" onClick={() => setLowonganModal(false)}>
          <div className="kd001-posisi-modal" onClick={e => e.stopPropagation()}>
            <button className="kd001-posisi-close" onClick={() => setLowonganModal(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555f71" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/>
                <line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>

            <div className="kd001-posisi-body">
              <h3 className="kd001-posisi-title">Tambahkan ke Lowongan</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 16 }}>Pilih posisi untuk {selectedRows.size} kandidat yang dipilih</p>

              <div className="kd001-posisi-search-wrap">
                <input
                  className="kd001-posisi-search"
                  type="text"
                  placeholder="Cari nama posisi atau departemen..."
                  value={lowonganSearchQuery}
                  onChange={e => setLowonganSearchQuery(e.target.value)}
                  autoFocus
                />
                <svg className="kd001-posisi-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#abb2c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>

              <div className="kd001-posisi-results">
                {!isLoadingSeleksi && (
                  <p className="kd001-posisi-count">
                    {filteredSeleksiList.length} {filteredSeleksiList.length === 1 ? 'result' : 'results'}
                  </p>
                )}

                {isLoadingSeleksi ? (
                  <div className="kd001-posisi-empty">Memuat daftar lowongan...</div>
                ) : seleksiList.length === 0 ? (
                  <div className="kd001-posisi-empty">Tidak ada lowongan aktif</div>
                ) : filteredSeleksiList.length === 0 ? (
                  <div className="kd001-posisi-empty">Tidak ada posisi yang cocok</div>
                ) : (
                  <div className="kd001-posisi-list">
                    {filteredSeleksiList.map(s => (
                      <div className="kd001-posisi-item" key={s.id}>
                        <div className="kd001-posisi-item-info">
                          <span className="kd001-posisi-item-name">{s.jabatan}</span>
                          <span className="kd001-posisi-item-dept">{s.departments?.name || s.departemen || '-'}</span>
                        </div>
                        <button
                          className="kd001-posisi-tambah-btn"
                          onClick={() => handleTambahkanKeLowongan(s)}
                        >
                          Tambahkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
