// Nomor halaman yang ringkas untuk kontrol paginasi: halaman pertama dan terakhir selalu ada, ditambah halaman
// aktif dengan tetangganya, dan "…" untuk bagian yang dilewati. 3000 halaman tetap tampil sebagai sekitar 7 tombol.
// Contoh (halaman aktif 1 dari 18): 1 2 3 4 5 … 18; aktif 9: 1 … 8 9 10 … 18; aktif 18: 1 … 14 15 16 17 18.
export const ELIPSIS = '…';

const rentang = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export function halamanRingkas(halaman, total, tetangga = 1) {
  const maksSlot = 5 + tetangga * 2;
  if (total <= maksSlot) return rentang(1, Math.max(1, total));
  const kiri = Math.max(halaman - tetangga, 1);
  const kanan = Math.min(halaman + tetangga, total);
  const elipsKiri = kiri > 2;
  const elipsKanan = kanan < total - 1;
  const blok = 3 + tetangga * 2;
  if (!elipsKiri && elipsKanan) return [...rentang(1, blok), ELIPSIS, total];
  if (elipsKiri && !elipsKanan) return [1, ELIPSIS, ...rentang(total - blok + 1, total)];
  return [1, ELIPSIS, ...rentang(kiri, kanan), ELIPSIS, total];
}
