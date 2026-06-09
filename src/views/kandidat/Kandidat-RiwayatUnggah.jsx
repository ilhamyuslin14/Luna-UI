import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUploadLogsBatches } from '../../services/kandidatService';

export default function KandidatRiwayatUnggah({ onView }) {
  const { companyId } = useAuth();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      if (!companyId) return;
      try {
        setIsLoading(true);
        const rows = await getUploadLogsBatches(companyId);

        // Grupkan baris flat dari DB berdasarkan batch_id
        const batchMap = new Map();
        for (const row of rows) {
          if (!batchMap.has(row.batch_id)) {
            batchMap.set(row.batch_id, {
              batch_id: row.batch_id,
              tanggal: row.created_at,
              files: [],
              total: 0,
              berhasil: 0,
              gagal: 0,
            });
          }
          const b = batchMap.get(row.batch_id);
          b.files.push({ name: row.nama_file, status: row.status, failReason: row.fail_reason, kandidatId: row.kandidat_id || null });
          b.total += 1;
          if (row.status === 'berhasil') b.berhasil += 1;
          if (row.status === 'gagal') b.gagal += 1;
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
          Belum ada riwayat unggah CV.
        </div>
      </div>
    );
  }

  return (
    <div className="ktr-table-wrap">
      {/* Header */}
      <div className="ktr-table-header">
        <div className="ktr-col-name">Sesi Unggah</div>
        <div className="ktr-col-count">Total File</div>
        <div className="ktr-col-status">Status</div>
        <div className="ktr-col-berhasil">Berhasil</div>
        <div className="ktr-col-gagal">Gagal</div>
      </div>

      {/* Rows */}
      {batches.map((item, idx) => (
        <div
          key={item.batch_id}
          className={`ktr-table-row${idx % 2 === 1 ? ' ktr-row-alt' : ''}`}
          onClick={() => onView?.({
            id: item.batch_id,
            tanggal: formatTanggal(item.tanggal),
            total: item.total,
            berhasil: item.berhasil,
            gagal: item.gagal,
            status: 'selesai',
            files: item.files,
          })}
          style={{ cursor: 'pointer' }}
        >
          <div className="ktr-col-name">
            <span className="ktr-import-name">Uploaded {formatTanggal(item.tanggal)}</span>
          </div>
          <div className="ktr-col-count">{item.total}</div>
          <div className="ktr-col-status">
            <span className="ktr-status-badge ktr-status-badge--selesai">Selesai</span>
          </div>
          <div className="ktr-col-berhasil">{item.berhasil}</div>
          <div className="ktr-col-gagal">{item.gagal}</div>
        </div>
      ))}
    </div>
  );
}
