// Service worker: satu-satunya tempat yang bicara ke Supabase. Content script di
// halaman JobStreet hanya mengirim pesan ke sini.
import { api } from './api.js';

const enc = (s) => encodeURIComponent(String(s).replace(/[%*]/g, ''));

// Sudah ada di Luna (source + external_id sama), atau mirip (perusahaan + judul
// sama, ID beda: biasanya posting ulang).
async function lookup(record) {
  const existing = await api(
    `lowongan_eksternal?select=kode,status,updated_at&source=eq.${enc(record.source)}&external_id=eq.${enc(record.external_id)}`
  );
  if (existing && existing.length) return { existing: existing[0], similar: [] };

  const similar = await api(
    `lowongan_eksternal?select=kode,status,posted_at&company_name=ilike.${enc(record.company_name)}&title=ilike.${enc(record.title)}&external_id=neq.${enc(record.external_id)}&limit=3`
  );
  return { existing: null, similar: similar || [] };
}

async function save(record) {
  const { existing, similar } = await lookup(record);
  await api('lowongan_eksternal?on_conflict=source,external_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: [record],
  });
  return { updated: !!existing, similar };
}

// Pintasan keyboard (manifest.commands) diteruskan ke tab yang sedang aktif.
chrome.commands.onCommand.addListener(async (name) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) chrome.tabs.sendMessage(tab.id, { type: 'command', name }).catch(() => { /* tab bukan JobStreet */ });
});

async function shortcuts() {
  const all = await chrome.commands.getAll();
  return { shortcuts: Object.fromEntries(all.filter(c => c.name && !c.name.startsWith('_')).map(c => [c.name, c.shortcut || ''])) };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const run = msg?.type === 'lookup' ? lookup(msg.record)
    : msg?.type === 'save' ? save(msg.record)
      : msg?.type === 'shortcuts' ? shortcuts()
        : Promise.reject(new Error('Pesan tidak dikenal.'));
  run.then((data) => sendResponse({ ok: true, ...data }))
    .catch((e) => sendResponse({ ok: false, error: e.message || 'Terjadi kesalahan.' }));
  return true; // balasan dikirim asinkron
});
