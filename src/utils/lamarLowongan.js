// Tujuan tombol "Lamar Sekarang" di daftar dan panel detail lowongan.
// Lowongan eksternal: langsung ke halaman lowongan asli. Lowongan Luna: ke laman karir
// lowongan itu, karena formulir lamarnya ada di sana.
export function urlLamar(job) {
  if (!job) return null;
  if (job.is_external) return job.external_url || null;
  return job.kode
    ? `/?view=laman-karir&kode=${encodeURIComponent(job.kode)}`
    : `/?view=laman-karir&jabatan=${encodeURIComponent(job.title)}`;
}

// Halaman detail penuh lowongan (laman karir): untuk eksternal, halaman detail Luna-nya
// (bukan tautan ke situs asal), untuk Luna, laman karir dengan formulir lamar.
export function urlDetail(job) {
  if (!job) return null;
  const view = job.is_external ? 'laman-karir-eksternal' : 'laman-karir';
  return job.kode
    ? `/?view=${view}&kode=${encodeURIComponent(job.kode)}`
    : `/?view=${view}&jabatan=${encodeURIComponent(job.title)}`;
}

export function bukaDetail(job) {
  const url = urlDetail(job);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

// Selalu di tab baru supaya daftar lowongan yang sedang dijelajahi tidak hilang.
export function bukaLamar(job) {
  const url = urlLamar(job);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}
