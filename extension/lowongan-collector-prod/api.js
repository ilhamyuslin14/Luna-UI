// Akses REST Supabase production tanpa login: anon key dipakai sebagai kunci akses.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Permintaan gagal (HTTP ${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
