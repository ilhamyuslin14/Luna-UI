// Waktu posting lowongan dalam dua bentuk dari satu data (tanggal absolut):
//   formatWaktuPosting   → relatif, ringkas: "Diposting 3 hari lalu"
//   formatTanggalPosting → absolut, lengkap: "21 Oktober 2026"
export function formatWaktuPosting(iso) {
  if (!iso) return null;
  const posted = new Date(iso);
  if (isNaN(posted.getTime())) return null;
  const days = Math.floor((Date.now() - posted.getTime()) / 86_400_000);
  if (days <= 0) return 'Diposting hari ini';
  if (days === 1) return 'Diposting kemarin';
  if (days < 30) return `Diposting ${days} hari lalu`;
  return `Diposting ${Math.floor(days / 30)} bulan lalu`;
}

export function formatTanggalPosting(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
