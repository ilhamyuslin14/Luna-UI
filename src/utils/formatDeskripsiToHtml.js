// Dipakai bareng oleh form desktop (Lowongan-SetupPenilaian_001.jsx, isi
// contentEditable dari hasil upload dokumen) dan form mobile
// (useBuatLowonganForm.js, isi textarea polos) — mengubah teks polos jadi
// HTML minimal (paragraf per baris, baris berawalan "•" jadi <ul><li>) supaya
// tersimpan konsisten dengan `deskripsi` yang dirender sebagai HTML di
// halaman detail lowongan.
export function formatDeskripsiToHtml(text) {
  if (!text) return '';
  if (text.includes('<p>') || text.includes('<ul>') || text.includes('<br')) return text;
  return text.split('\n').map(line => {
    if (!line.trim()) return '<p><br/></p>';
    if (line.trim().startsWith('•')) return `<ul><li>${line.substring(1).trim()}</li></ul>`;
    return `<p>${line}</p>`;
  }).join('').replace(/<\/ul><ul>/g, '');
}
