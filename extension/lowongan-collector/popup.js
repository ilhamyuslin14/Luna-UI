import { authRequest, setSession, validSession, api } from './api.js';

// Popup hanya untuk masuk/keluar dan saklar on/off. Pengambilan data lowongan
// terjadi di halaman JobStreet lewat content.js.

const $ = (id) => document.getElementById(id);
const VIEWS = ['loading', 'login', 'main'];
const showView = (name) => VIEWS.forEach(v => { $(`view-${v}`).hidden = v !== name; });

const getEnabled = async () => (await chrome.storage.local.get('enabled')).enabled !== false; // default: aktif
const setEnabled = (enabled) => chrome.storage.local.set({ enabled });

function renderSwitch(enabled) {
  $('toggle-enabled').checked = enabled;
  $('switch-state').textContent = enabled ? 'Aktif: tombol muncul di JobStreet' : 'Nonaktif';
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
  renderSwitch(await getEnabled());
  showView('main');
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
    err.textContent = ex.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
});

$('btn-logout').addEventListener('click', async () => { await setSession(null); await boot(); });
$('toggle-enabled').addEventListener('change', async (e) => {
  await setEnabled(e.target.checked);
  renderSwitch(e.target.checked);
});

boot();
