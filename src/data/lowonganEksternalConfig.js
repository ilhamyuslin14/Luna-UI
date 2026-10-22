// Konfigurasi tampilan lowongan eksternal (agregator). Datanya sendiri ada di
// tabel `lowongan_eksternal`.

export const SUMBER_EKSTERNAL = {
  jobstreet: { label: 'JobStreet' },
  glints: { label: 'Glints' },
  kalibrr: { label: 'Kalibrr' },
};

export const ALASAN_LAPORAN = [
  { value: 'ditutup', label: 'Lowongan sudah ditutup' },
  { value: 'link-rusak', label: 'Link tidak bisa dibuka' },
  { value: 'tidak-sesuai', label: 'Informasi tidak sesuai dengan halaman asli' },
  { value: 'lainnya', label: 'Lainnya' },
];
