// Personalisasi urutan daftar lowongan dari preferensi jabatan pelamar (kolom pref_posisi / pref_lokasi).
// Dipakai sebelum pelamar punya skor kecocokan: lowongan yang judul/deskripsinya sejalan dengan posisi
// yang dicari naik lebih dulu. Murni pencocokan kata kunci, tidak memahami padanan bahasa
// ("Analis Bisnis" vs "Business Analyst"); itu nanti ditutup oleh skor kecocokan AI.

// Kata umum yang tidak boleh jadi dasar kecocokan (hampir semua judul lowongan memuatnya).
const KATA_UMUM = new Set(['staf', 'staff', 'senior', 'junior', 'jr', 'sr', 'lead', 'head', 'manager', 'manajer', 'officer', 'executive', 'asisten', 'assistant', 'dan', 'and', 'di', 'untuk', 'the', 'of']);

const rapikan = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const buangHtml = (s) => rapikan(String(s || '').replace(/<[^>]*>/g, ' '));
const kataInti = (frasa) => rapikan(frasa).split(/[^a-z0-9+#.]+/).filter((k) => k.length > 1 && !KATA_UMUM.has(k));

// 3 = seluruh frasa ada di judul, 2 = semua kata inti ada di judul, 1 = frasa ada di deskripsi, 0 = tidak cocok.
export function relevansiPosisi(job, posisi) {
  if (!posisi?.length) return 0;
  const judul = rapikan(job.title);
  const deskripsi = buangHtml(job.is_external ? job.description : job.deskripsi);
  let terbaik = 0;
  for (const p of posisi) {
    const frasa = rapikan(p);
    if (!frasa) continue;
    if (judul.includes(frasa)) return 3;
    const inti = kataInti(frasa);
    if (inti.length && inti.every((k) => judul.includes(k))) terbaik = Math.max(terbaik, 2);
    else if (deskripsi.includes(frasa)) terbaik = Math.max(terbaik, 1);
  }
  return terbaik;
}

// Penentu tambahan kecil: lokasi lowongan memuat salah satu lokasi yang diharapkan (atau "Remote").
export function cocokLokasi(job, lokasi) {
  if (!lokasi?.length) return false;
  const l = rapikan(job.location);
  return lokasi.some((x) => {
    const k = rapikan(x);
    return k && (l.includes(k) || (k === 'remote' && /remote|hybrid|hibrid/.test(l)));
  });
}
