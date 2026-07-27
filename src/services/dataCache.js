// In-memory, per-session data cache. Lets pages serve list data instantly on
// remount instead of refetching every time a menu is opened, while still
// getting fresh data right after something actually changes (mutations call
// invalidate() so the next read is forced to refetch).
//
// Not persisted across page reloads, and doesn't know about changes made by
// other users/tabs — this only tracks what the current session itself did.

const cache = new Map();
const inflight = new Map();

export async function getCached(key, fetchFn) {
  if (cache.has(key)) return cache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const promise = fetchFn()
    .then(data => {
      cache.set(key, data);
      inflight.delete(key);
      return data;
    })
    .catch(err => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

function clearPrefix(prefix) {
  for (const key of cache.keys()) {
    if (key === prefix || key.startsWith(prefix + ':')) cache.delete(key);
  }
}

export function invalidate(prefix) {
  clearPrefix(prefix);
  // Beranda adalah dashboard agregat dari semua resource lain (kandidat,
  // seleksi, karyawan, departemen, dst) — jadi setiap kali resource apapun
  // di-invalidate, cache dashboard ikut direset supaya statistiknya segar
  // tanpa perlu nambah invalidate('beranda') manual di tiap call site.
  if (prefix !== 'beranda') clearPrefix('beranda');
}
