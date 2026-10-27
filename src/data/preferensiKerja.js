// Pilihan dan batas untuk preferensi pekerjaan pelamar, dipakai bersama oleh onboarding dan Profil Saya
// (disimpan di kolom pref_* pada public.pelamar_profiles).
export const MAKS_PILIHAN = 5;
export const GAJI_MIN = 2_000_000;
export const GAJI_MAX = 20_000_000;

export const POSISI_REKOMENDASI = ['Content Writer', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Desainer Grafis', 'Digital Marketing', 'Social Media Specialist', 'Admin Operasional', 'Customer Service', 'Staf HR', 'Akuntan', 'Sales Executive', 'Data Analyst', 'Staf Gudang', 'Kasir'];
export const LOKASI_REKOMENDASI = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Malang', 'Denpasar', 'Makassar', 'Remote'];

export const KETERSEDIAAN_OPSI = ['Tersedia Segera (Immediately Available)', '2 Minggu Pemberitahuan (2 Weeks Notice)', '1 Bulan Pemberitahuan (1 Month Notice)', '2 Bulan Pemberitahuan (2 Months Notice)', 'Belum Menentukan Tanggal'];
export const STATUS_PENCARIAN_OPSI = ['Aktif Menjelajah Peluang', 'Terbuka untuk Tawaran Menarik', 'Tidak Sedang Mencari Kerja'];
export const TIPE_KERJA_OPSI = ['Penuh Waktu (Full-time)', 'Kontrak / Proyek', 'Paruh Waktu (Part-time)', 'Freelance / Lepas'];
export const MODEL_KERJA_OPSI = [
  { value: 'Hybrid / Remote Diutamakan', label: 'Hybrid / Remote Diutamakan' },
  { value: 'Remote Penuh (Work From Anywhere)', label: 'Remote Penuh (WFA)' },
  { value: 'Hybrid Saja', label: 'Hybrid Saja' },
  { value: 'On-site / Di Kantor', label: 'On-site / Di Kantor' },
];

export const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

// Baris pelamar_profiles <-> bentuk yang dipakai layar.
export function prefDariBaris(row) {
  return {
    posisi: row?.pref_posisi || [],
    lokasi: row?.pref_lokasi || [],
    gajiMin: row?.pref_gaji_min ?? null,
    gajiNego: !!row?.pref_gaji_nego,
    ketersediaan: row?.pref_ketersediaan || '',
    tipeKerja: row?.pref_tipe_kerja || [],
    modelKerja: row?.pref_model_kerja || '',
    statusPencarian: row?.pref_status_pencarian || '',
    akunPortal: row?.pref_akun_portal || [],
  };
}

// Hanya kolom yang ada di objek pref yang ditulis, jadi onboarding (yang hanya mengisi sebagian) tidak menghapus
// ketersediaan, jenis kerja, dll. yang sudah diisi di Profil Saya.
export function prefKeBaris(pref) {
  const baris = {};
  if (pref.posisi !== undefined) baris.pref_posisi = pref.posisi;
  if (pref.lokasi !== undefined) baris.pref_lokasi = pref.lokasi;
  if (pref.gajiMin !== undefined) baris.pref_gaji_min = pref.gajiMin || null;
  if (pref.gajiNego !== undefined) baris.pref_gaji_nego = !!pref.gajiNego;
  if (pref.ketersediaan !== undefined) baris.pref_ketersediaan = pref.ketersediaan || null;
  if (pref.tipeKerja !== undefined) baris.pref_tipe_kerja = pref.tipeKerja;
  if (pref.akunPortal !== undefined) baris.pref_akun_portal = pref.akunPortal;
  if (pref.modelKerja !== undefined) baris.pref_model_kerja = pref.modelKerja || null;
  if (pref.statusPencarian !== undefined) baris.pref_status_pencarian = pref.statusPencarian || null;
  return baris;
}

// Situs lowongan lain yang mungkin sudah dipakai pelamar (pertanyaan terakhir saat melengkapi profil).
export const PORTAL_LOWONGAN_REKOMENDASI = ['JobStreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Indeed', 'Karir.com', 'Jobs.id', 'Urbanhire', 'Loker.id'];
