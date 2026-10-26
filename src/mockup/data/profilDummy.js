// Profil contoh untuk halaman "Profil Saya" di mockup. Bentuknya sama dengan state `profile` di
// ProfilPelamar_001 (sudah dalam bentuk kartu, bukan mentah dari hasil parsing CV), supaya semua
// bagian halaman terisi lengkap. Latar belakangnya dibuat nyambung dengan skor kecocokan di lowonganDummy.js.
const pengalaman = (id, jabatan, perusahaan, tipe, [sm, sy], akhir, lokasi, deskripsi) => ({
  id, jabatan, perusahaan, tipe, lokasi, deskripsi,
  startMonth: sm, startYear: sy,
  isCurrent: akhir === 'Sekarang',
  endMonth: akhir === 'Sekarang' ? 'Des' : akhir[0],
  endYear: akhir === 'Sekarang' ? '' : akhir[1],
  periode: `${sm} ${sy} – ${akhir === 'Sekarang' ? 'Sekarang' : `${akhir[0]} ${akhir[1]}`}`,
});

export const PROFIL_DUMMY = {
  nama: 'Dina Pratama',
  headline: 'Business Analyst · Sistem Informasi',
  lokasi: 'Jakarta Selatan, DKI Jakarta',
  email: 'dina.pratama@email.com',
  telepon: '0812-3456-7890',
  linkedinUrl: 'https://www.linkedin.com/in/dina-pratama',
  websiteUrl: 'https://dinapratama.id',
  avatarUrl: null,
  ringkasan:
    'Lulusan Sistem Informasi dengan pengalaman 2 tahun sebagai analis bisnis di perusahaan perangkat lunak. ' +
    'Terbiasa menjembatani kebutuhan pengguna dan tim pengembang: menggali kebutuhan, menyusun dokumen desain, ' +
    'menulis skenario uji, dan menyiapkan materi pelatihan. Nyaman dengan SQL dan analisis data, serta senang ' +
    'bekerja lintas tim dalam proyek yang bergerak cepat.',
  pengalaman: [
    pengalaman('exp-1', 'Business Analyst', 'PT Solusi Digital Nusantara', 'Penuh Waktu · Hybrid', ['Agu', '2024'], 'Sekarang', 'Jakarta Selatan',
      'Memimpin sesi pengumpulan kebutuhan bersama pengguna bisnis dan project manager, lalu menerjemahkannya menjadi dokumen desain perangkat lunak untuk tim pengembang. Menyusun skenario uji, panduan pengguna, dan materi pelatihan untuk 4 proyek ERP skala menengah. Menulis kueri SQL untuk validasi data dan laporan ad hoc.'),
    pengalaman('exp-2', 'Junior Business Analyst', 'PT Teknologi Karya Mandiri', 'Penuh Waktu · On-site', ['Jul', '2023'], ['Jul', '2024'], 'Jakarta Pusat',
      'Membantu analis senior mendokumentasikan alur proses bisnis dan kebutuhan fungsional. Terlibat dalam pengujian aplikasi (UAT), mencatat temuan bug, dan memastikan perbaikannya terverifikasi sebelum rilis.'),
    pengalaman('exp-3', 'Magang Analis Sistem', 'PT Mitra Data Indonesia', 'Magang', ['Feb', '2023'], ['Jun', '2023'], 'Depok',
      'Membuat diagram alur dan entity relationship untuk modul inventaris, serta merapikan dokumentasi basis data internal.'),
  ],
  pendidikan: [
    { id: 'edu-1', institusi: 'Universitas Gunadarma', gelar: 'D4/S1 (Sarjana)', jurusan: 'Sistem Informasi', startYear: '2019', endYear: '2023', ipk: '3.62', periode: '2019 – 2023' },
    { id: 'edu-2', institusi: 'SMA Negeri 8 Jakarta', gelar: 'SMA/SMK/Sederajat', jurusan: 'Ilmu Pengetahuan Alam', startYear: '2016', endYear: '2019', ipk: '', periode: '2016 – 2019' },
  ],
  sertifikasi: [
    { id: 'cert-1', nama: 'Certified Business Analysis Professional (Level 1)', penerbit: 'IIBA Indonesia', terbitMonth: 'Nov', terbitYear: '2024', terbit: 'Nov 2024', kredensial: 'IIBA-ID-48213' },
    { id: 'cert-2', nama: 'SQL for Data Analysis', penerbit: 'Dicoding Indonesia', terbitMonth: 'Mar', terbitYear: '2024', terbit: 'Mar 2024', kredensial: '' },
    { id: 'cert-3', nama: 'Agile Project Management Foundations', penerbit: 'LinkedIn Learning', terbitMonth: 'Sep', terbitYear: '2023', terbit: 'Sep 2023', kredensial: '' },
  ],
  keahlian: [
    { nama: 'Business Analysis', level: 'Tingkat Lanjut' },
    { nama: 'SQL', level: 'Menengah' },
    { nama: 'Dokumentasi Teknis', level: 'Tingkat Lanjut' },
    { nama: 'UAT & Skenario Uji', level: 'Menengah' },
    { nama: 'Microsoft Excel', level: 'Tingkat Lanjut' },
    { nama: 'Power BI', level: 'Pemula' },
    { nama: 'Jira', level: 'Menengah' },
    { nama: 'Komunikasi Pemangku Kepentingan', level: 'Menengah' },
  ],
  bahasa: [
    { bahasa: 'Bahasa Indonesia', level: 'Penutur Asli / Fasih Penuh', kefasihan: 'Penutur Asli / Fasih Penuh' },
    { bahasa: 'Bahasa Inggris', level: 'Kemampuan Kerja Profesional', kefasihan: 'Kemampuan Kerja Profesional' },
  ],
  preferensi: {
    posisi: ['Business Analyst', 'Data Analyst', 'Product Analyst'],
    lokasi: ['Jakarta', 'Tangerang Selatan', 'Remote'],
    gajiMin: 8000000,
    gajiNego: true,
    ketersediaan: '1 Bulan Pemberitahuan (1 Month Notice)',
    tipeKerja: ['Penuh Waktu (Full-time)', 'Kontrak / Proyek'],
    modelKerja: 'Hybrid / Remote Diutamakan',
    statusPencarian: 'Aktif Menjelajah Peluang',
  },
};

// Baris resume utama (kartu "Berkas CV Utama"). Tidak ada cv_url, jadi tombol unduh tidak membuka apa pun.
export const RESUME_DUMMY_ROW = {
  file_name: 'CV_Dina_Pratama.pdf',
  file_size: 482 * 1024,
  updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  cv_url: null,
};
