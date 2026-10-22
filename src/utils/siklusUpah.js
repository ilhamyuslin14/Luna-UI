// Penulisan periode gaji yang seragam di seluruh tampilan ("/ Bulan", bukan
// "/ Bulanan" atau "/ bulan"). Hanya untuk tampilan: nilai di database
// (mis. siklus_upah = 'Bulanan') tidak diubah.
const LABEL = {
  jam: 'Jam',
  harian: 'Hari', hari: 'Hari',
  mingguan: 'Minggu', minggu: 'Minggu',
  bulanan: 'Bulan', bulan: 'Bulan', month: 'Bulan', monthly: 'Bulan',
  kwartal: 'Kwartal', kuartal: 'Kwartal', triwulan: 'Kwartal',
  tahunan: 'Tahun', tahun: 'Tahun', year: 'Tahun', yearly: 'Tahun',
};

// Teks bawaan kalau lowongan (Luna maupun eksternal) tidak mencantumkan gaji.
export const GAJI_TIDAK_DITAMPILKAN = 'Gaji tidak ditampilkan';

export function formatSiklusLabel(siklus) {
  const raw = String(siklus || '').trim();
  if (!raw) return '';
  return LABEL[raw.toLowerCase()] || raw.charAt(0).toUpperCase() + raw.slice(1);
}
