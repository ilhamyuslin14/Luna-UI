// Modul kecil yang "mengingat" error terakhir yang kejadian di sesi ini —
// dipakai oleh tombol Laporkan Kendala (floating) supaya laporan bisa
// otomatis kebawa konteks halaman + pesan error walau toast-nya sendiri
// sudah tertutup/kelewat. Cukup satu entri (bukan riwayat), dan otomatis
// dianggap basi setelah LAST_ERROR_TTL_MS supaya tombol tidak nyangkut di
// mode "alert" selamanya kalau lama gak dibuka.
const LAST_ERROR_TTL_MS = 2 * 60 * 1000;

let lastError = null; // { halaman, pesan, at }
const listeners = new Set();

export function reportLastError(halaman, pesan) {
  lastError = { halaman, pesan, at: Date.now() };
  listeners.forEach((cb) => cb());
}

export function getLastError() {
  if (lastError && Date.now() - lastError.at > LAST_ERROR_TTL_MS) {
    lastError = null;
  }
  return lastError;
}

export function clearLastError() {
  lastError = null;
  listeners.forEach((cb) => cb());
}

export function subscribeLastError(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
