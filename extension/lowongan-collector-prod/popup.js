import { SUPABASE_URL, TABLE_NAME, ENV_LABEL } from './config.js';

// Popup hanya saklar on/off dan penanda tujuan data. Tanpa login.
const $ = (id) => document.getElementById(id);
const getEnabled = async () => (await chrome.storage.local.get('enabled')).enabled !== false; // default: aktif

function renderSwitch(enabled) {
  $('toggle-enabled').checked = enabled;
  $('switch-state').textContent = enabled ? 'Aktif: panel muncul di JobStreet' : 'Nonaktif';
}

$('env').textContent = ENV_LABEL;
$('target').textContent = `Data disimpan ke: ${SUPABASE_URL.replace(/^https?:\/\//, '')} · tabel ${TABLE_NAME}`;
$('toggle-enabled').addEventListener('change', async (e) => {
  await chrome.storage.local.set({ enabled: e.target.checked });
  renderSwitch(e.target.checked);
});
getEnabled().then(renderSwitch);
