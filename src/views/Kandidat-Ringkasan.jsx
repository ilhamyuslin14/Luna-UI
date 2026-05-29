import { useState } from 'react';
import KandidatPenilaian from './Kandidat-Penilaian.jsx';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" strokeWidth="1"/>
    <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const PENGALAMAN = [
  {
    jabatan: 'Freelancer Recruitment',
    perusahaan: 'Duta Generasi Mandiri',
    periode: '2023-09-01 – Sekarang',
    deskripsi: [
      'Memposting lowongan pekerjaan pada platform.',
      'Melakukan screening CV pelamar.',
      'Mengatur jadwal interview.',
    ],
  },
  {
    jabatan: 'HR Assistant',
    perusahaan: 'PT Indah Nusantara',
    periode: '2021-03-01 – 2023-08-01',
    deskripsi: [
      'Membantu proses rekrutmen end-to-end.',
      'Mengelola database kandidat.',
      'Menyusun laporan aktivitas HR bulanan.',
    ],
  },
];

const PENDIDIKAN = [
  {
    institusi: 'Universitas Mercu Buana',
    gelar: 'S1 – Psikologi',
    periode: '2018-01-01 – 2022-01-01',
  },
];

const AI_SCORES = [
  { posisi: 'Backend Engineer',  fit: 'moderate', label: 'Moderate Fit', score: 75 },
  { posisi: 'Frontend Engineer', fit: 'high',     label: 'High Fit',     score: 90 },
  { posisi: 'Cloud Engineer',    fit: 'high',     label: 'High Fit',     score: 90 },
];

export default function KandidatRingkasan({ kandidat = {} }) {
  const [expandedExp, setExpandedExp] = useState(new Set());
  const [scorePanel, setScorePanel]   = useState(null);

  const openPanel = (item) => setScorePanel({
    nama: kandidat.nama || item.posisi,
    skor: { level: item.fit, score: item.score },
  });

  const toggleExp = (i) => {
    const next = new Set(expandedExp);
    if (next.has(i)) next.delete(i); else next.add(i);
    setExpandedExp(next);
  };

  const k = kandidat;

  return (
    <div className="kd-content">
      <div className="kd-col-left">

        {/* Detail Kandidat */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Detail Kandidat</span>
            <button className="kd-edit-btn"><EditIcon /> Edit</button>
          </div>
          <div className="kd-detail-rows">
            {[
              ['Nama Lengkap',            k.nama],
              ['LinkedIn',                k.linkedin || null],
              ['ID Kandidat',             k.id],
              ['Gender',                  k.gender],
              ['Jurusan',                 k.jurusan],
              ['Universitas',             k.universitas],
              ['Perusahaan Saat Ini',     k.perusahaan],
              ['Jabatan Saat Ini',        k.jabatan],
              ['Pengalaman Kerja (Tahun)',k.pengalaman],
              ['Tanggal Lahir',           null],
              ['Domisili',                k.domisili],
              ['Email',                   k.email],
              ['No. Telpon',              k.phone],
            ].map(([label, value]) => (
              <div className="kd-detail-row" key={label}>
                <span className="kd-detail-label">{label}</span>
                {value ? (
                  <span className="kd-detail-value">{value}</span>
                ) : (
                  <span className="kd-detail-add">
                    Tambahkan data <AddIcon />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Tambahan */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Detail Tambahan</span>
            <button className="kd-edit-btn"><EditIcon /> Edit</button>
          </div>
          <div className="kd-detail-rows">
            {['Bidang Industri', 'Tahun Kelulusan', 'Harapan Upah', 'Harapan Benefit'].map(label => (
              <div className="kd-detail-row" key={label}>
                <span className="kd-detail-label">{label}</span>
                <span className="kd-detail-add">Tambahkan data <AddIcon /></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="kd-col-right">

        {/* Penilaian AI */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Penilaian AI</span>
          </div>
          <div className="kd-ai-list">
            {AI_SCORES.map((item) => (
              <div className="kd-ai-row" key={item.posisi}>
                <div className="kd-ai-row-left">
                  <span className="kd-ai-posisi">{item.posisi}</span>
                  <span
                    className={`kd-fit-badge ${item.fit}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openPanel(item)}
                  >
                    <span className="kd-fit-label">{item.label}</span>
                    <span className={`kd-fit-score ${item.fit}`}>{item.score}</span>
                  </span>
                </div>
                <button className="kd-detail-penilaian-btn" onClick={() => openPanel(item)}>Detail Penilaian</button>
              </div>
            ))}
          </div>
          <div className="kd-card-footer-btn">
            <button className="kd-lihat-lainnya">Lihat Lainnya</button>
          </div>
        </div>

        {/* Pengalaman Kerja */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Pengalaman Kerja</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="kd-edit-btn"><EditIcon /> Edit</button>
              <button className="kd-add-circle-btn">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6.5" fill="url(#kd-add-grad)"/>
                  <path d="M6.5 3.5v6M3.5 6.5h6" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="kd-add-grad" x1="13" y1="2.12" x2="2.12" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1d8fd8"/>
                      <stop offset="1" stopColor="#0977be"/>
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
          <div className="kd-exp-list">
            {PENGALAMAN.map((exp, i) => (
              <div className="kd-exp-card" key={i}>
                <div className="kd-exp-header">
                  <div className="kd-exp-header-left">
                    <span className="kd-exp-title">{exp.jabatan}</span>
                    <span className="kd-exp-three-dot">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="2" r="1" fill="#555f71"/>
                        <circle cx="6" cy="6" r="1" fill="#555f71"/>
                        <circle cx="6" cy="10" r="1" fill="#555f71"/>
                      </svg>
                    </span>
                  </div>
                  <span className="kd-exp-company">{exp.perusahaan}</span>
                  <span className="kd-exp-period">{exp.periode}</span>
                </div>
                <div className="kd-exp-body">
                  {(expandedExp.has(i) ? exp.deskripsi : exp.deskripsi.slice(0, 2)).map((d, j) => (
                    <p key={j} className="kd-exp-desc">{d}</p>
                  ))}
                  {exp.deskripsi.length > 2 && (
                    <button className="kd-read-more" onClick={() => toggleExp(i)}>
                      {expandedExp.has(i) ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pendidikan */}
        <div className="kd-card">
          <div className="kd-card-header">
            <span className="kd-card-label">Pendidikan</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="kd-edit-btn"><EditIcon /> Edit</button>
              <button className="kd-add-circle-btn">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6.5" fill="url(#kd-add-grad2)"/>
                  <path d="M6.5 3.5v6M3.5 6.5h6" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="kd-add-grad2" x1="13" y1="2.12" x2="2.12" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1d8fd8"/>
                      <stop offset="1" stopColor="#0977be"/>
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
          <div className="kd-exp-list">
            {PENDIDIKAN.map((edu, i) => (
              <div className="kd-exp-card" key={i}>
                <div className="kd-exp-header">
                  <div className="kd-exp-header-left">
                    <span className="kd-exp-title">{edu.institusi}</span>
                    <span className="kd-exp-three-dot">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="2" r="1" fill="#555f71"/>
                        <circle cx="6" cy="6" r="1" fill="#555f71"/>
                        <circle cx="6" cy="10" r="1" fill="#555f71"/>
                      </svg>
                    </span>
                  </div>
                  <span className="kd-exp-company">{edu.gelar}</span>
                  <span className="kd-exp-period">{edu.periode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      {scorePanel && <KandidatPenilaian kandidat={scorePanel} onClose={() => setScorePanel(null)} />}
    </div>
  );
}
