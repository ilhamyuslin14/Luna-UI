// Sesi login dan akses REST Supabase. Dipakai popup (login/logout) dan background
// (menyimpan lowongan). Token disimpan di chrome.storage.local, tidak pernah
// diberikan ke halaman JobStreet.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export async function authRequest(grant, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Gagal masuk');
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    email: data.user?.email || body.email,
  };
}

export const getSession = async () => (await chrome.storage.local.get('session')).session || null;
export const setSession = (session) => chrome.storage.local.set({ session });

export async function validSession() {
  let s = await getSession();
  if (!s) return null;
  if (s.expires_at - 60 < Date.now() / 1000) {
    try {
      s = await authRequest('refresh_token', { refresh_token: s.refresh_token });
      await setSession(s);
    } catch {
      await setSession(null);
      return null;
    }
  }
  return s;
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const s = await validSession();
  if (!s) throw new Error('Sesi habis. Masuk lagi lewat ikon extension.');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${s.access_token}`,
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
