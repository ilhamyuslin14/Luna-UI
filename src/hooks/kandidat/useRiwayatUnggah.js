import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getActivityLogs } from '../../services/kandidatService.js';

// Dipakai bareng oleh Kandidat-RiwayatUnggah.jsx (desktop) dan
// MobileRiwayatUnggah.jsx — fetch + pengelompokan baris activity_logs per
// batch_id, derivasi status (berhasil/diproses/gagal), dan filter, semuanya
// logic murni tanpa markup/CSS.
export const getDisplaySource = (s) => s === 'Portal Karir' ? 'Portal Karir' : (s === 'HR' ? 'HR' : s);

export function formatTanggal(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// Status per-batch (berhasil/diproses/gagal + label) — dipisah dari
// komponen supaya bisa dipakai baik buat render kartu/baris maupun buat
// menghitung opsi filter "Status Pengerjaan" yang dinamis dari data.
export function getBatchStatusInfo(item) {
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
}

// Derivasi status per-file untuk replay riwayat (statis, dari activity_logs)
// — dipakai oleh Kandidat-UnggahCV.jsx & MobileUnggahCv.jsx saat menampilkan
// `historyData` (beda dari extendedFiles di useUnggahCv.js yang derivasinya
// dari UploadContext/scoringQueue yang live).
export function deriveHistoryFiles(files) {
  const extended = files.map(f => {
    const isUploadOnly = f.tipe_aktivitas === 'upload_only';
    const isScoringOnly = f.tipe_aktivitas === 'scoring_only';

    let finalStatus = 'waiting';
    let isFailed = false;
    let failReason = null;
    let statusText = '';

    if (isUploadOnly) {
      finalStatus = f.upload_status || 'waiting';
      isFailed = finalStatus === 'gagal';
      failReason = f.upload_fail_reason;
      statusText = finalStatus === 'berhasil' ? 'Unggah Berhasil' : 'Menunggu';
    } else if (isScoringOnly) {
      finalStatus = f.scoring_status || 'waiting';
      isFailed = finalStatus === 'gagal';
      failReason = f.scoring_fail_reason;
      statusText = finalStatus === 'berhasil' ? 'Penilaian AI Berhasil' : 'Menunggu';
    } else {
      const isUploadFailed = f.upload_status === 'gagal';
      const isScoringBerhasil = f.scoring_status === 'berhasil';
      const isScoringFailed = f.scoring_status === 'gagal';

      if (isScoringBerhasil) {
        finalStatus = 'berhasil';
        statusText = 'Penilaian AI Berhasil';
      } else if (isScoringFailed) {
        finalStatus = 'gagal';
        isFailed = true;
        failReason = isUploadFailed ? `Unggah Gagal: ${f.upload_fail_reason} & AI Gagal: ${f.scoring_fail_reason}` : `AI Gagal: ${f.scoring_fail_reason}`;
      } else if (isUploadFailed) {
        finalStatus = 'gagal';
        isFailed = true;
        failReason = f.upload_fail_reason;
      } else {
        finalStatus = 'uploading';
        statusText = 'Proses...';
      }
    }
    return { ...f, finalStatus, isFailed, failReason, statusText, data: f.kandidatId };
  });

  return {
    files: extended,
    normalFiles: extended.filter(f => !f.isFailed),
    failedFiles: extended.filter(f => f.isFailed),
  };
}

export default function useRiwayatUnggah() {
  const { companyId } = useAuth();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
            kandidatId: row.kandidat_id || null,
          });
          b.total += 1;

          if (row.upload_status === 'berhasil') b.upload_berhasil += 1;
          if (row.upload_status === 'gagal') b.upload_gagal += 1;
          if (row.scoring_status === 'berhasil') b.scoring_berhasil += 1;
          if (row.scoring_status === 'gagal') b.scoring_gagal += 1;
        }

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

  const resetFilters = () => {
    setFilterSumber('Semua');
    setFilterPosisi('Semua');
    setFilterStatus('Semua');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  const uniqueSources = ['Semua', ...new Set(batches.map(b => getDisplaySource(b.source)))];
  const uniquePosisi = [
    'Semua',
    ...new Set(batches.map(b => b.posisi_nama).filter(Boolean)),
    ...(batches.some(b => !b.posisi_nama) ? ['Tanpa Posisi'] : []),
  ];
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

  const hasActiveFilters = filterSumber !== 'Semua' || filterPosisi !== 'Semua' || filterStatus !== 'Semua' || !!filterDateStart || !!filterDateEnd;

  return {
    isLoading, batches, filteredBatches, hasActiveFilters,
    filterSumber, setFilterSumber, filterPosisi, setFilterPosisi,
    filterStatus, setFilterStatus, filterDateStart, setFilterDateStart, filterDateEnd, setFilterDateEnd,
    uniqueSources, uniquePosisi, statusOptions, resetFilters,
  };
}
