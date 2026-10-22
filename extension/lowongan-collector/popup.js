import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { buildRecord, resolveJobUrl, EMPLOYMENT_OPTIONS, EMPLOYMENT_NORM, jobIdFromUrl } from './parsers.js';
import { extractJobstreetRaw } from './extractors.js';

const $ = (id) => document.getElementById(id);
const VIEWS = ['loading', 'login', 'empty', 'form'];
const showView = (name) => VIEWS.forEach(v => { $(`view-${v}`).hidden = v !== name; });

// ── Sesi login (Supabase Auth, password grant) ───────────────────────────
async function authRequest(grant, body) {
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

const getSession = async () => (await chrome.storage.local.get('session')).session || null;
const setSession = (session) => chrome.storage.local.set({ session });

async function validSession() {
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

async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const s = await validSession();
  if (!s) throw new Error('Sesi habis. Masuk lagi.');
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

// ── Form ──────────────────────────────────────────────────────────────────
const FIELDS = {
  title: 'f-title', company_name: 'f-company', logo_url: 'f-logo', location: 'f-location', category: 'f-category',
  posted_at: 'f-posted', salary_min: 'f-smin', salary_max: 'f-smax', salary_text: 'f-stext', description: 'f-desc',
};
let currentRecord = null;
let isExisting = false;

const STATUS_LABEL = { aktif: 'aktif', ditutup: 'ditutup', kedaluwarsa: 'kedaluwarsa' };
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

function setExisting(row) {
  isExisting = !!row;
  const note = $('existing-note');
  if (row) {
    note.textContent = `Sudah tersimpan (${row.kode}, status ${STATUS_LABEL[row.status] || row.status}, terakhir diperbarui ${fmtDate(row.updated_at)}). Menyimpan akan memperbarui data yang ada, bukan menambah baru.`;
  }
  note.hidden = !row;
  $('btn-save').textContent = isExisting ? 'Perbarui di Luna' : 'Simpan ke Luna';
}

// Lowongan yang diposting ulang biasanya mendapat ID baru; cocokkan lewat
// perusahaan + judul yang sama (tanpa membedakan huruf besar/kecil).
async function checkSimilar(record) {
  const enc = (s) => encodeURIComponent(String(s).replace(/[%*]/g, ''));
  const rows = await api(
    `lowongan_eksternal?select=kode,status,posted_at&company_name=ilike.${enc(record.company_name)}&title=ilike.${enc(record.title)}&external_id=neq.${record.external_id}&limit=3`
  );
  const note = $('similar-note');
  if (rows && rows.length) {
    note.textContent = `Mirip dengan lowongan yang sudah ada: ${rows.map(r => `${r.kode} (${r.status}, ${fmtDate(r.posted_at)})`).join(', ')}. Bisa jadi ini posting ulang. Cek dulu sebelum menyimpan.`;
    note.hidden = false;
  } else {
    note.hidden = true;
  }
}

function fillForm(rec) {
  currentRecord = rec;
  $('f-emp').innerHTML = EMPLOYMENT_OPTIONS.map(o => `<option value="${o}">${o}</option>`).join('');
  $('f-emp').value = rec.employment_type_raw;
  for (const [key, id] of Object.entries(FIELDS)) $(id).value = rec[key] ?? '';
  $('f-smin').value = rupiah(rec.salary_min);
  $('f-smax').value = rupiah(rec.salary_max);
  $('src-url').textContent = rec.external_url;
  updateLogoPreview();
  $('sal-hint').textContent = rec.salary_raw ? `Terbaca dari halaman: “${rec.salary_raw}”` : 'Baris gaji tidak ditemukan di halaman.';
  $('desc-hint').textContent = `${rec.description.length} karakter terbaca.`;
  markEmpty();
}

function updateLogoPreview() {
  const url = $('f-logo').value.trim();
  $('logo-prev').style.backgroundImage = /^https?:\/\//i.test(url) ? `url("${url.replace(/"/g, '%22')}")` : 'none';
}

function markEmpty() {
  for (const id of ['f-title', 'f-company']) $(id).classList.toggle('empty', !$(id).value.trim());
  $('f-desc').classList.toggle('empty', !$('f-desc').value.trim());
}

const toInt = (v) => {
  const d = String(v ?? '').replace(/[^\d]/g, '');
  return d ? parseInt(d, 10) : null;
};

// Tampilan nominal ("Rp 15.000.000"); yang disimpan tetap angka lewat toInt().
const rupiah = (v) => {
  const n = toInt(v);
  return n == null ? '' : `Rp ${n.toLocaleString('id-ID')}`;
};

function showMsg(el, type, text) {
  el.className = `msg ${type}`;
  el.textContent = text;
  el.hidden = false;
}

async function save() {
  const msg = $('save-msg');
  msg.hidden = true;

  const title = $('f-title').value.trim();
  const company = $('f-company').value.trim();
  if (!title || !company) { showMsg(msg, 'err', 'Judul dan perusahaan wajib diisi.'); return; }
  const smin = toInt($('f-smin').value);
  const smax = toInt($('f-smax').value);
  if (smin != null && smax != null && smin > smax) { showMsg(msg, 'err', 'Gaji min tidak boleh lebih besar dari maks.'); return; }

  const raw = $('f-emp').value;
  const nowIso = new Date().toISOString();
  const record = {
    source: currentRecord.source,
    external_id: currentRecord.external_id,
    kode: currentRecord.kode,
    external_url: currentRecord.external_url,
    title,
    company_name: company,
    logo_url: /^https?:\/\//i.test($('f-logo').value.trim()) ? $('f-logo').value.trim() : null,
    location: $('f-location').value.trim() || null,
    category: $('f-category').value.trim() || null,
    employment_type_raw: raw,
    employment_type: EMPLOYMENT_NORM[raw] ?? null,
    salary_min: smin,
    salary_max: smax,
    salary_text: $('f-stext').value.trim() || null,
    description: $('f-desc').value.trim() || null,
    posted_at: new Date(`${$('f-posted').value}T00:00:00`).toISOString(),
    status: 'aktif',
    last_verified_at: nowIso,
    updated_at: nowIso,
  };

  const btn = $('btn-save');
  btn.disabled = true;
  btn.textContent = 'Menyimpan…';
  try {
    await api('lowongan_eksternal?on_conflict=source,external_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: [record],
    });
    showMsg(msg, 'ok', `${isExisting ? 'Diperbarui' : 'Tersimpan'}: ${title} (${record.kode}).`);
    setExisting({ kode: record.kode, status: 'aktif', updated_at: nowIso });
  } catch (e) {
    showMsg(msg, 'err', e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = isExisting ? 'Perbarui di Luna' : 'Simpan ke Luna';
  }
}

// ── Alur utama ────────────────────────────────────────────────────────────
async function loadPage() {
  showView('loading');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabUrl = tab?.url || '';
  if (!/jobstreet\.com/.test(tabUrl)) { showView('empty'); return; }

  let raw;
  try {
    [{ result: raw }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractJobstreetRaw });
  } catch (e) {
    showView('empty');
    return;
  }

  const url = raw?.title ? resolveJobUrl(tabUrl, raw.hrefs) : null;
  if (!url) { showView('empty'); return; }

  const record = buildRecord(raw, { source: 'jobstreet', url });
  fillForm(record);
  showView('form');

  setExisting(null);
  $('similar-note').hidden = true;
  $('save-msg').hidden = true;
  try {
    const existing = await api(`lowongan_eksternal?select=kode,status,updated_at&source=eq.jobstreet&external_id=eq.${jobIdFromUrl(url)}`);
    if (existing && existing.length) setExisting(existing[0]);
    else await checkSimilar(record);
  } catch { /* cek duplikat hanya info tambahan */ }
}

async function boot() {
  const s = await validSession();
  if (!s) {
    $('who').hidden = true;
    showView('login');
    return;
  }
  $('who-email').textContent = s.email;
  $('who').hidden = false;
  await loadPage();
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('login-error');
  err.hidden = true;
  const btn = $('btn-login');
  btn.disabled = true;
  btn.textContent = 'Masuk…';
  try {
    const s = await authRequest('password', { email: $('login-email').value.trim(), password: $('login-pass').value });
    await setSession(s);
    const isAdmin = await api('rpc/is_luna_admin', { method: 'POST', body: {} });
    if (isAdmin !== true) {
      await setSession(null);
      throw new Error('Akun ini bukan super admin Luna.');
    }
    $('login-pass').value = '';
    await boot();
  } catch (ex) {
    showMsg(err, 'err', ex.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
});

$('btn-logout').addEventListener('click', async () => { await setSession(null); await boot(); });
$('btn-save').addEventListener('click', save);
for (const id of ['f-title', 'f-company', 'f-desc']) $(id).addEventListener('input', markEmpty);
$('f-logo').addEventListener('input', updateLogoPreview);
for (const id of ['f-smin', 'f-smax']) $(id).addEventListener('input', (e) => { e.target.value = rupiah(e.target.value); });

boot();
