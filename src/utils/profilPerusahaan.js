// Ringkasan profil perusahaan dari lowongan eksternal (JobStreet): bidang dan jumlah karyawan.

// "101-1,000 employees" -> "101-1.000 karyawan" (kata dan pemisah ribuan mengikuti bahasa Indonesia).
export function formatUkuranPerusahaan(teks) {
  if (!teks) return null;
  return String(teks)
    .replace(/(\d),(?=\d{3}\b)/g, '$1.')
    .replace(/\bemployees?\b/i, 'karyawan')
    .trim();
}

// Item untuk LowonganHeader (companyInfo); kosong bila tidak ada datanya.
export function itemProfilPerusahaan(job) {
  return [
    job?.company_industry && { icon: 'building', text: job.company_industry },
    job?.company_size && { icon: 'users', text: formatUkuranPerusahaan(job.company_size) },
  ].filter(Boolean);
}
