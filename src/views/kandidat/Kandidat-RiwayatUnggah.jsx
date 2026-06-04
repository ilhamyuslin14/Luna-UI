export const RIWAYAT_DATA = [
  {
    id: 1,
    tanggal: '2026-06-03 14:04:04',
    total: 8, berhasil: 7, gagal: 1,
    status: 'selesai',
    files: [
      { name: 'CV_Aula_Maulidatul.pdf',   status: 'berhasil' },
      { name: 'CV_Rofiq_Gonzalez.pdf',    status: 'berhasil' },
      { name: 'CV_Dito_Arkademi.pdf',     status: 'berhasil' },
      { name: 'CV_Siti_Fatimah.pdf',      status: 'berhasil' },
      { name: 'CV_Budi_Santoso.pdf',      status: 'berhasil' },
      { name: 'CV_Rina_Wulandari.pdf',    status: 'berhasil' },
      { name: 'CV_Ahmad_Fauzi.pdf',       status: 'berhasil' },
      { name: 'Invalid_file.txt',         status: 'gagal',   failReason: 'Format Tidak Didukung' },
    ],
  },
  {
    id: 2,
    tanggal: '2026-06-02 09:15:33',
    total: 6, berhasil: 6, gagal: 0,
    status: 'selesai',
    files: [
      { name: 'Kandidat_PM_01.pdf', status: 'berhasil' },
      { name: 'Kandidat_PM_02.pdf', status: 'berhasil' },
      { name: 'Kandidat_PM_03.pdf', status: 'berhasil' },
      { name: 'Kandidat_PM_04.pdf', status: 'berhasil' },
      { name: 'Kandidat_PM_05.pdf', status: 'berhasil' },
      { name: 'Kandidat_PM_06.pdf', status: 'berhasil' },
    ],
  },
  {
    id: 3,
    tanggal: '2026-06-01 16:48:12',
    total: 8, berhasil: 8, gagal: 0,
    status: 'selesai',
    files: [
      { name: 'Dev_Backend_01.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_02.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_03.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_04.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_05.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_06.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_07.pdf', status: 'berhasil' },
      { name: 'Dev_Backend_08.pdf', status: 'berhasil' },
    ],
  },
  {
    id: 4,
    tanggal: '2026-05-30 11:20:07',
    total: 7, berhasil: 1, gagal: 4,
    status: 'processing',
    files: [
      { name: 'Import_01.pdf', status: 'berhasil' },
      { name: 'Import_02.pdf', status: 'gagal',  failReason: 'Gagal Parsing'         },
      { name: 'Import_03.pdf', status: 'gagal',  failReason: 'CV Tidak Sesuai'       },
      { name: 'Import_04.pdf', status: 'gagal',  failReason: 'Ukuran Terlalu Besar'  },
      { name: 'Import_05.pdf', status: 'gagal',  failReason: 'Koneksi Terputus'      },
      { name: 'Import_06.pdf', status: 'waiting' },
      { name: 'Import_07.pdf', status: 'waiting' },
    ],
  },
  {
    id: 5,
    tanggal: '2026-05-29 08:55:44',
    total: 10, berhasil: 10, gagal: 0,
    status: 'selesai',
    files: Array.from({ length: 10 }, (_, i) => ({ name: `Batch_05_${String(i+1).padStart(2,'0')}.pdf`, status: 'berhasil' }))  ,
  },
];

export default function KandidatRiwayatUnggah({ onView }) {
  return (
    <div className="ktr-table-wrap">
      {/* Header */}
      <div className="ktr-table-header">
        <div className="ktr-col-name">Import Name</div>
        <div className="ktr-col-count">File Count</div>
        <div className="ktr-col-status">Status</div>
        <div className="ktr-col-berhasil">Berhasil Diupload</div>
        <div className="ktr-col-gagal">Gagal Diupload</div>
      </div>

      {/* Rows */}
      {RIWAYAT_DATA.map((item, idx) => (
        <div
          key={item.id}
          className={`ktr-table-row${idx % 2 === 1 ? ' ktr-row-alt' : ''}`}
          onClick={() => onView?.(item)}
        >
          <div className="ktr-col-name">
            <span className="ktr-import-name">Uploaded {item.tanggal}</span>
          </div>
          <div className="ktr-col-count">{item.total}</div>
          <div className="ktr-col-status">
            <span className={`ktr-status-badge ktr-status-badge--${item.status}`}>
              {item.status === 'selesai' ? 'Selesai' : 'Processing'}
            </span>
          </div>
          <div className="ktr-col-berhasil">{item.berhasil}</div>
          <div className="ktr-col-gagal">{item.gagal}</div>
        </div>
      ))}
    </div>
  );
}
