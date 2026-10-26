// Dijalankan di halaman JobStreet. Menampilkan tombol mengambang di sisi kiri
// (Lihat Detail / Simpan) selama extension dinyalakan dan sudah masuk. Tampilan
// ada di shadow DOM supaya tidak bentrok dengan gaya JobStreet. Semua panggilan
// ke Supabase lewat background.js.
(async () => {
  if (window.__lunaCollectorLoaded) return;
  window.__lunaCollectorLoaded = true;

  const log = (...a) => console.info('[Luna Collector]', ...a);
  const url = (file) => chrome.runtime.getURL(file);
  let buildRecord, resolveJobUrl, EMPLOYMENT_OPTIONS, EMPLOYMENT_NORM, extractJobstreetRaw;
  try {
    ({ buildRecord, resolveJobUrl, EMPLOYMENT_OPTIONS, EMPLOYMENT_NORM } = await import(url('parsers.js')));
    ({ extractJobstreetRaw } = await import(url('extractors.js')));
  } catch (e) {
    console.error('[Luna Collector] Gagal memuat modul extension:', e);
    return;
  }
  log('content script dimuat');

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
    [hidden] { display: none !important; }

    .dock { position: fixed; left: 16px; top: 96px; z-index: 2147483646; width: 288px; color: #0f172a; font-size: 13px; line-height: 1.4; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 18px 44px rgba(15,23,42,.18); overflow: hidden; }
    .d-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #eef2f7; }
    .d-brand { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
    .d-logo { width: 22px; height: 22px; border-radius: 7px; background: #0f172a; color: #ff8d21; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .d-right { display: flex; align-items: center; gap: 8px; }
    .pill-on { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #15803d; background: #ecfdf3; padding: 3px 9px; border-radius: 999px; }
    .pill-on i { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
    .collapse { width: 26px; height: 26px; border: 0; border-radius: 8px; background: #f1f5f9; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .18s ease; }
    .collapse:hover { background: #e2e8f0; }
    .card.min .collapse { transform: rotate(180deg); }
    .card.min .d-head { border-bottom: 0; }

    .d-data { padding: 14px; background: #f8fafc; border-bottom: 1px solid #eef2f7; display: flex; flex-direction: column; gap: 10px; }
    .d-label { font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #64748b; }
    .d-empty { font-size: 12.5px; color: #64748b; line-height: 1.45; }
    .d-job { display: flex; gap: 10px; align-items: center; }
    .d-avatar { width: 40px; height: 40px; border-radius: 10px; background: #fff center / contain no-repeat; border: 1px solid #e2e8f0; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
    .d-title { font-size: 14px; font-weight: 700; line-height: 1.25; word-break: break-word; }
    .d-sub { font-size: 12px; color: #64748b; margin-top: 1px; word-break: break-word; }
    .d-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .chip { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: #e2e8f0; color: #334155; }
    .chip.ok { background: #ecfdf3; color: #15803d; }
    .chip.warn { background: #fffbeb; color: #92400e; }

    .d-actions { padding: 12px 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .act { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 11px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; color: #0f172a; cursor: pointer; text-align: left; font: inherit; transition: background .15s ease, border-color .15s ease; }
    .act:hover:not(:disabled) { border-color: #cbd5e1; background: #f8fafc; }
    .act.active { border-color: #ff8d21; background: #fff7ed; }
    .act:disabled, .save:disabled { opacity: .6; cursor: not-allowed; }
    .act .t { font-size: 12.5px; font-weight: 700; }
    kbd { font: 600 10px/1 system-ui, sans-serif; color: #64748b; background: #f1f5f9; padding: 3px 5px; border-radius: 5px; white-space: nowrap; }
    kbd:empty { display: none; }
    .save { grid-column: 1 / -1; display: flex; align-items: center; gap: 10px; padding: 11px 14px; border: 0; border-radius: 12px; background: #ff8d21; color: #fff; cursor: pointer; text-align: left; font: inherit; transition: background .15s ease; }
    .save:hover:not(:disabled) { background: #e87a13; }
    .save .t { flex: 1; font-size: 13px; font-weight: 700; }
    .save kbd { background: rgba(0,0,0,.16); color: #fff; font-weight: 700; }

    .d-auto { padding: 0 14px 12px; display: flex; flex-direction: column; gap: 8px; }
    .d-auto .d-label { padding-top: 2px; }
    .a-row { display: grid; grid-template-columns: 1fr 1.6fr; gap: 8px; }
    .a-row label { margin: 0; font-size: 10.5px; }
    .a-pair { display: flex; align-items: center; gap: 5px; }
    .a-pair span { color: #94a3b8; }
    .d-auto input { padding: 5px 7px; font-size: 12px; text-align: center; }
    .d-auto input:disabled { background: #f1f5f9; color: #94a3b8; }
    .b-auto { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px 12px; border: 1.5px solid #ff8d21; border-radius: 12px; background: #fff7ed; color: #c2410c; font: inherit; font-weight: 700; font-size: 12.5px; cursor: pointer; transition: background .15s ease; }
    .b-auto:hover { background: #ffedd5; }
    .b-auto.stop { background: #dc2626; border-color: #dc2626; color: #fff; }
    .b-auto.stop:hover { background: #b91c1c; }
    .b-auto kbd { background: rgba(0,0,0,.08); }
    .b-auto.stop kbd { background: rgba(0,0,0,.2); color: #fff; }
    .a-line { font-size: 12px; font-weight: 700; color: #0f172a; }
    .a-sub { font-size: 11.5px; color: #64748b; margin-top: 2px; word-break: break-word; }
    .d-log { padding: 2px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
    .d-log .d-label { padding: 8px 0 2px; }
    .d-log-empty { font-size: 12px; color: #64748b; padding: 2px 0 4px; }
    .ev { display: flex; gap: 10px; align-items: flex-start; padding: 9px 11px; border-radius: 11px; border: 1px solid #eef2f7; animation: in .18s ease-out; }
    .ev.first.ok { background: #ecfdf3; border-color: #bbf7d0; }
    .ev.first.err { background: #fef2f2; border-color: #fecaca; }
    .ev.first.info { background: #eff6ff; border-color: #bfdbfe; }
    .ev-ico { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .ev.ok .ev-ico { background: #16a34a; color: #fff; }
    .ev.info .ev-ico { background: #dbeafe; color: #2563eb; }
    .ev.err .ev-ico { background: #dc2626; color: #fff; }
    .ev-t { font-size: 12.5px; font-weight: 700; }
    .ev-d { font-size: 11.5px; color: #475569; word-break: break-word; }
    @keyframes in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

    .b { width: 100%; padding: 9px 10px; border: 0; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: background .15s ease, opacity .15s ease; }
    .b:disabled { opacity: .6; cursor: not-allowed; }
    .b.primary { background: #ff8d21; color: #fff; }
    .b.primary:hover:not(:disabled) { background: #e87a13; }

    .panel { position: fixed; top: 0; right: 0; height: 100vh; width: min(440px, 100vw); z-index: 2147483647; background: #fff; color: #1e293b; display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(15,23,42,.28); transform: translateX(105%); transition: transform .22s ease; font-size: 13px; line-height: 1.45; }
    .panel.open { transform: none; }
    .p-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 16px; background: #0f172a; color: #fff; }
    .p-head h2 { margin: 0; font-size: 14px; font-weight: 700; }
    .p-head h2 span { color: #ff8d21; }
    .p-actions { display: flex; align-items: center; gap: 6px; }
    .reload { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border: 0; border-radius: 8px; background: #ff8d21; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .reload:hover { background: #e87a13; }
    .link { background: none; border: 0; color: #fdba74; font-size: 12px; cursor: pointer; text-decoration: underline; padding: 4px 6px; }
    .x { width: 28px; height: 28px; border: 0; border-radius: 8px; background: rgba(255,255,255,.1); color: #fff; font-size: 16px; line-height: 1; cursor: pointer; }
    .x:hover { background: rgba(255,255,255,.2); }
    .p-body { flex: 1; overflow-y: auto; padding: 14px 16px 18px; overscroll-behavior: contain; }
    .p-foot { padding: 12px 16px; border-top: 1px solid #e2e8f0; background: #fff; }
    .p-foot .b { padding: 11px; font-size: 13px; }

    label { display: block; font-size: 11px; font-weight: 600; color: #475569; margin: 10px 0 4px; }
    input, select, textarea { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 7px; font: inherit; color: #0f172a; background: #fff; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #ff8d21; box-shadow: 0 0 0 3px #ffedd5; }
    input.empty, textarea.empty { border-color: #f87171; background: #fef2f2; }
    textarea { min-height: 150px; resize: vertical; font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .hint { font-size: 11px; color: #94a3b8; margin-top: 3px; }
    .src { font-size: 11px; color: #64748b; word-break: break-all; margin-bottom: 2px; }
    .logo-row { display: flex; gap: 10px; align-items: center; }
    .logo-prev { width: 40px; height: 40px; flex-shrink: 0; border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc center / contain no-repeat; }
    .note { margin: 0 0 10px; padding: 9px 11px; border-radius: 8px; font-size: 12px; }
    .note.warn { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .note.info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  `;

  const MARKUP = `
    <div class="dock">
      <div class="card" id="d-card">
        <div class="d-head">
          <div class="d-brand"><span class="d-logo">L</span>Luna Collector</div>
          <div class="d-right">
            <span class="pill-on"><i></i>Aktif</span>
            <button class="collapse" id="b-collapse" type="button" aria-label="Ciutkan atau perluas" aria-expanded="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
          </div>
        </div>
        <div id="d-body">
          <div class="d-data">
            <div class="d-label">Data dimuat</div>
            <div class="d-empty" id="d-empty">Belum ada data. Buka satu lowongan, lalu tekan Refresh Data.</div>
            <div id="d-job" hidden>
              <div class="d-job">
                <div class="d-avatar" id="d-avatar"></div>
                <div style="min-width:0"><div class="d-title" id="d-title"></div><div class="d-sub" id="d-sub"></div></div>
              </div>
              <div class="d-chips" id="d-chips" style="margin-top:10px"></div>
            </div>
          </div>
          <div class="d-actions">
            <button class="act" id="b-detail" type="button">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              <span class="t">Lihat Detail</span><kbd id="k-toggle-detail"></kbd>
            </button>
            <button class="act" id="b-refresh" type="button">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
              <span class="t">Refresh Data</span><kbd id="k-refresh-job"></kbd>
            </button>
            <button class="save" id="b-save" type="button">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span class="t">Simpan ke Luna</span><kbd id="k-save-job"></kbd>
            </button>
          </div>
          <div class="d-auto">
            <div class="d-label">Otomatis</div>
            <div class="a-row">
              <div><label for="a-batas">Maks. lowongan</label><input id="a-batas" type="number" min="1" max="1000" inputmode="numeric"></div>
              <div><label for="a-jmin">Jeda antar lowongan (detik)</label>
                <div class="a-pair"><input id="a-jmin" type="number" min="1" max="120" inputmode="numeric"><span>–</span><input id="a-jmaks" type="number" min="1" max="180" inputmode="numeric"></div>
              </div>
            </div>
            <button class="b-auto" id="b-auto" type="button"><span class="t">Mulai otomatis</span><kbd id="k-toggle-auto"></kbd></button>
            <div id="a-stat" aria-live="polite"></div>
          </div>
          <div class="d-log">
            <div class="d-label">Aktivitas</div>
            <div id="d-events" aria-live="polite"></div>
          </div>
        </div>
      </div>
    </div>

    <aside class="panel" id="panel" aria-hidden="true">
      <div class="p-head">
        <h2>Luna <span>Collector</span></h2>
        <div class="p-actions">
          <button class="reload" id="p-reload" type="button" title="Baca ulang lowongan yang sedang terbuka di halaman">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
            Muat ulang data
          </button>
          <button class="x" id="p-close" type="button" aria-label="Tutup">&times;</button>
        </div>
      </div>
      <div class="p-body">
        <div class="note warn" id="existing-note" hidden></div>
        <div class="note info" id="similar-note" hidden></div>
        <div class="src" id="src-url"></div>

        <label for="f-title">Judul lowongan *</label>
        <input id="f-title" />
        <label for="f-company">Perusahaan *</label>
        <input id="f-company" />
        <label for="f-logo">Link logo perusahaan</label>
        <div class="logo-row">
          <div class="logo-prev" id="logo-prev" aria-hidden="true"></div>
          <input id="f-logo" placeholder="Kosong kalau logo tidak ditemukan" />
        </div>
        <label for="f-location">Lokasi</label>
        <input id="f-location" />
        <label for="f-category">Kategori</label>
        <input id="f-category" />

        <div class="row">
          <div><label for="f-industry">Bidang perusahaan</label><input id="f-industry" /></div>
          <div><label for="f-size">Jumlah karyawan</label><input id="f-size" /></div>
        </div>

        <div class="row">
          <div><label for="f-emp">Ikatan kerja</label><select id="f-emp"></select></div>
          <div><label for="f-posted">Tanggal posting</label><input id="f-posted" type="date" /></div>
        </div>
        <div class="row">
          <div><label for="f-smin">Gaji minimum / bulan</label><input id="f-smin" inputmode="numeric" placeholder="Rp 0" /></div>
          <div><label for="f-smax">Gaji maksimum / bulan</label><input id="f-smax" inputmode="numeric" placeholder="Rp 0" /></div>
        </div>
        <label for="f-stext">Gaji dalam teks</label>
        <input id="f-stext" placeholder="Kosong kalau gaji tidak ditampilkan" />
        <div class="hint" id="sal-hint"></div>

        <label for="f-desc">Deskripsi &amp; tanggung jawab</label>
        <textarea id="f-desc"></textarea>
        <div class="hint" id="desc-hint"></div>
      </div>
      <div class="p-foot">
        <button class="b primary" id="p-save" type="button">Simpan ke Luna</button>
      </div>
    </aside>
  `;

  let host = null;
  let root = null;
  let currentRecord = null;
  let isExisting = false;
  const $ = (id) => root.getElementById(id);

  // ── Util ───────────────────────────────────────────────────────────────
  const toInt = (v) => {
    const d = String(v ?? '').replace(/[^\d]/g, '');
    return d ? parseInt(d, 10) : null;
  };
  const rupiah = (v) => {
    const n = toInt(v);
    return n == null ? '' : `Rp ${n.toLocaleString('id-ID')}`;
  };
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

  // ── Aktivitas & Data dimuat (dock) ─────────────────────────────────────
  const EV_ICONS = {
    ok: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
    err: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };
  const MAX_EVENTS = 1; // hanya kejadian terakhir yang ditampilkan
  let events = [];
  let agoTimer = null;
  let loadedRecord = null;

  function timeAgo(at) {
    const sec = Math.max(0, Math.round((Date.now() - at) / 1000));
    if (sec < 5) return 'baru saja';
    if (sec < 60) return `${sec} detik lalu`;
    return `${Math.floor(sec / 60)} menit lalu`;
  }

  function renderEvents() {
    const box = $('d-events');
    if (!box) return;
    box.textContent = '';
    if (!events.length) {
      const e = document.createElement('div');
      e.className = 'd-log-empty';
      e.textContent = 'Belum ada aktivitas.';
      box.appendChild(e);
      return;
    }
    box.style.cssText = 'display:flex;flex-direction:column;gap:6px';
    events.forEach((ev, i) => {
      const row = document.createElement('div');
      row.className = `ev ${ev.type}${i === 0 ? ' first' : ''}`;
      const ico = document.createElement('span');
      ico.className = 'ev-ico';
      ico.innerHTML = EV_ICONS[ev.type] || EV_ICONS.info; // ikon statis milik kita sendiri
      const body = document.createElement('div');
      body.style.minWidth = '0';
      const t = document.createElement('div');
      t.className = 'ev-t';
      t.textContent = ev.title;
      const d = document.createElement('div');
      d.className = 'ev-d';
      d.textContent = [ev.text, timeAgo(ev.at)].filter(Boolean).join(' · ');
      body.append(t, d);
      row.append(ico, body);
      box.appendChild(row);
    });
  }

  // Dulu berupa toast sementara; sekarang masuk daftar Aktivitas di dock (terbaru di atas).
  function toast(type, title, text) {
    if (!root) return;
    events = [{ type, title, text, at: Date.now() }, ...events].slice(0, MAX_EVENTS);
    renderEvents();
  }

  function showLoaded(rec, status, res) {
    loadedRecord = rec;
    $('d-empty').hidden = true;
    $('d-job').hidden = false;
    const av = $('d-avatar');
    const logoOk = /^https?:\/\//i.test(rec.logo_url || '');
    av.style.backgroundImage = logoOk ? `url("${rec.logo_url.replace(/"/g, '%22')}")` : 'none';
    av.textContent = logoOk ? '' : (rec.company_name || rec.title || '?').trim().charAt(0).toUpperCase();
    $('d-title').textContent = rec.title;
    $('d-sub').textContent = [rec.company_name, rec.location].filter(Boolean).join(' · ');
    const chips = $('d-chips');
    chips.textContent = '';
    const add = (cls, text) => {
      const c = document.createElement('span');
      c.className = `chip ${cls}`.trim();
      c.textContent = text;
      chips.appendChild(c);
    };
    add('', `ID ${rec.external_id}`);
    if (status === 'checking') add('', 'Memeriksa…');
    else if (status === 'existing') add('ok', 'Sudah di Luna');
    else if (status === 'similar') add('warn', `Mirip ${res?.similar?.[0]?.kode || ''}`.trim());
    else if (status === 'new') add('warn', 'Belum tersimpan');
  }

  // Tampilkan lowongan yang dibaca di bagian "Data dimuat", lalu periksa statusnya di Luna.
  function trackLoaded(record) {
    showLoaded(record, 'checking');
    return send({ type: 'lookup', record })
      .then((res) => {
        if (loadedRecord === record) showLoaded(record, res.existing ? 'existing' : res.similar?.length ? 'similar' : 'new', res);
        return res;
      })
      .catch(() => {
        if (loadedRecord === record) showLoaded(record, 'unknown');
        return null;
      });
  }

  // Pesan ke background. Setelah extension di-reload, halaman lama kehilangan
  // koneksinya (context invalidated); beri petunjuk yang jelas.
  async function send(message) {
    try {
      const res = await chrome.runtime.sendMessage(message);
      if (!res) throw new Error('Tidak ada balasan dari extension.');
      if (!res.ok) throw new Error(res.error || 'Terjadi kesalahan.');
      return res;
    } catch (e) {
      if (/context invalidated|Extension context/i.test(e.message)) {
        throw new Error('Extension baru diperbarui. Muat ulang halaman ini (F5).');
      }
      throw e;
    }
  }

  // Baca lowongan yang sedang terbuka di halaman (halaman detail atau panel samping).
  function readPage() {
    const raw = extractJobstreetRaw();
    const jobUrl = raw?.title ? resolveJobUrl(location.href, raw.hrefs) : null;
    if (!jobUrl) return null;
    return buildRecord(raw, { source: 'jobstreet', url: jobUrl });
  }

  // Dari nilai form/record → baris tabel lowongan_eksternal.
  function toDb(v, base) {
    const raw = v.employment_type_raw;
    const nowIso = new Date().toISOString();
    return {
      source: base.source,
      external_id: base.external_id,
      kode: base.kode,
      external_url: base.external_url,
      title: v.title,
      company_name: v.company_name,
      logo_url: /^https?:\/\//i.test(v.logo_url || '') ? v.logo_url : null,
      location: v.location || null,
      category: v.category || null,
      company_industry: v.company_industry || null,
      company_size: v.company_size || null,
      employment_type_raw: raw,
      employment_type: EMPLOYMENT_NORM[raw] ?? null,
      salary_min: v.salary_min,
      salary_max: v.salary_max,
      salary_text: v.salary_text || null,
      description: v.description || null,
      posted_at: new Date(`${v.posted_at}T00:00:00`).toISOString(),
      status: 'aktif',
      last_verified_at: nowIso,
      updated_at: nowIso,
    };
  }

  function saveToast(res, record) {
    const lead = res.updated ? 'Diperbarui' : 'Tersimpan';
    const similar = res.similar?.length ? `mirip dengan ${res.similar.map(r => r.kode).join(', ')}, bisa jadi posting ulang` : '';
    toast('ok', `${lead} di Luna`, [record.title, similar].filter(Boolean).join(' · '));
    if (loadedRecord && loadedRecord.external_id === record.external_id) showLoaded(loadedRecord, 'existing');
  }

  const setLabel = (btn, text) => { btn.querySelector('.t').textContent = text; };

  // ── Simpan cepat (tombol di dock) ──────────────────────────────────────
  async function quickSave() {
    const btn = $('b-save');
    const record = readPage();
    if (!record) {
      toast('err', 'Belum ada lowongan terbuka', 'Klik satu lowongan dulu, lalu coba lagi.');
      return;
    }
    if (!record.title || !record.company_name) {
      toast('err', 'Data belum lengkap', 'Judul atau perusahaan tidak terbaca. Buka Lihat Detail untuk melengkapi.');
      return;
    }
    showLoaded(record, 'checking');
    btn.disabled = true;
    setLabel(btn, 'Menyimpan…');
    try {
      const res = await send({ type: 'save', record: toDb(record, record) });
      saveToast(res, record);
    } catch (e) {
      toast('err', 'Gagal menyimpan', e.message);
      showLoaded(record, 'unknown');
    } finally {
      btn.disabled = false;
      setLabel(btn, 'Simpan ke Luna');
    }
  }

  // ── Panel detail (form dari sisi kanan) ────────────────────────────────
  const FIELDS = {
    title: 'f-title', company_name: 'f-company', logo_url: 'f-logo', location: 'f-location', category: 'f-category',
    company_industry: 'f-industry', company_size: 'f-size',
    posted_at: 'f-posted', salary_text: 'f-stext', description: 'f-desc',
  };

  function setExisting(row) {
    isExisting = !!row;
    const note = $('existing-note');
    if (row) {
      note.textContent = `Sudah tersimpan (${row.kode}, status ${row.status}, terakhir diperbarui ${fmtDate(row.updated_at)}). Menyimpan akan memperbarui data yang ada, bukan menambah baru.`;
    }
    note.hidden = !row;
    $('p-save').textContent = isExisting ? 'Perbarui di Luna' : 'Simpan ke Luna';
  }

  function updateLogoPreview() {
    const u = $('f-logo').value.trim();
    $('logo-prev').style.backgroundImage = /^https?:\/\//i.test(u) ? `url("${u.replace(/"/g, '%22')}")` : 'none';
  }

  function markEmpty() {
    for (const id of ['f-title', 'f-company', 'f-desc']) $(id).classList.toggle('empty', !$(id).value.trim());
  }

  function fillForm(rec) {
    currentRecord = rec;
    for (const [key, id] of Object.entries(FIELDS)) $(id).value = rec[key] ?? '';
    $('f-emp').value = rec.employment_type_raw;
    $('f-smin').value = rupiah(rec.salary_min);
    $('f-smax').value = rupiah(rec.salary_max);
    $('src-url').textContent = rec.external_url;
    updateLogoPreview();
    $('sal-hint').textContent = rec.salary_raw ? `Terbaca dari halaman: “${rec.salary_raw}”` : 'Baris gaji tidak ditemukan di halaman.';
    $('desc-hint').textContent = `${rec.description.length} karakter terbaca.`;
    markEmpty();
  }

  async function loadPanelData() {
    const record = readPage();
    if (!record) {
      toast('err', 'Belum ada lowongan terbuka', 'Klik satu lowongan dulu, lalu coba lagi.');
      return false;
    }
    fillForm(record);
    setExisting(null);
    $('similar-note').hidden = true;
    trackLoaded(record)
      .then((res) => {
        if (!res || currentRecord !== record) return; // gagal, atau sudah ganti lowongan
        if (res.existing) setExisting(res.existing);
        else if (res.similar?.length) {
          const n = $('similar-note');
          n.textContent = `Mirip dengan lowongan yang sudah ada: ${res.similar.map(r => `${r.kode} (${r.status}, ${fmtDate(r.posted_at)})`).join(', ')}. Bisa jadi ini posting ulang. Cek dulu sebelum menyimpan.`;
          n.hidden = false;
        }
      })
      .catch(() => { /* cek duplikat hanya info tambahan */ });
    return true;
  }

  const panelOpen = () => !!root && $('panel').classList.contains('open');

  function setPanelOpen(open) {
    $('panel').classList.toggle('open', open);
    $('panel').setAttribute('aria-hidden', open ? 'false' : 'true');
    $('b-detail').classList.toggle('active', open);
  }

  async function openPanel() {
    if (await loadPanelData()) setPanelOpen(true);
  }
  const closePanel = () => setPanelOpen(false);

  // Lihat Detail: buka form (data terbaru dari halaman) atau tutup kalau sudah terbuka.
  function toggleDetail() {
    if (panelOpen()) { closePanel(); return Promise.resolve(); }
    return openPanel();
  }

  // Refresh Data: baca ulang lowongan yang sedang dibuka di halaman. Kalau form
  // sedang terbuka, isinya diganti; kalau tertutup, hasil bacaannya dikabarkan lewat toast.
  async function refreshData() {
    if (panelOpen()) {
      if (await loadPanelData()) toast('info', 'Data dimuat ulang', currentRecord.title);
      return;
    }
    const rec = readPage();
    if (rec) {
      trackLoaded(rec);
      toast('info', 'Data dimuat ulang', rec.title);
    } else {
      toast('err', 'Belum ada lowongan terbuka', 'Klik satu lowongan dulu, lalu coba lagi.');
    }
  }

  // Simpan: kalau form terbuka, yang disimpan adalah isi form (termasuk editanmu);
  // kalau tertutup, langsung dari halaman.
  function saveAction() {
    return panelOpen() ? panelSave() : quickSave();
  }

  async function panelSave() {
    const title = $('f-title').value.trim();
    const company = $('f-company').value.trim();
    if (!title || !company) { toast('err', 'Data belum lengkap', 'Judul dan perusahaan wajib diisi.'); return; }
    const smin = toInt($('f-smin').value);
    const smax = toInt($('f-smax').value);
    if (smin != null && smax != null && smin > smax) { toast('err', 'Gaji tidak valid', 'Gaji minimum tidak boleh lebih besar dari maksimum.'); return; }
    if (!$('f-posted').value) { toast('err', 'Data belum lengkap', 'Tanggal posting wajib diisi.'); return; }

    const record = toDb({
      title,
      company_name: company,
      logo_url: $('f-logo').value.trim(),
      location: $('f-location').value.trim(),
      category: $('f-category').value.trim(),
      company_industry: $('f-industry').value.trim(),
      company_size: $('f-size').value.trim(),
      employment_type_raw: $('f-emp').value,
      salary_min: smin,
      salary_max: smax,
      salary_text: $('f-stext').value.trim(),
      description: $('f-desc').value.trim(),
      posted_at: $('f-posted').value,
    }, currentRecord);

    const btn = $('p-save');
    btn.disabled = true;
    btn.textContent = 'Menyimpan…';
    try {
      const res = await send({ type: 'save', record });
      saveToast(res, record);
      setExisting({ kode: record.kode, status: 'aktif', updated_at: record.updated_at });
    } catch (e) {
      toast('err', 'Gagal menyimpan', e.message);
      btn.textContent = isExisting ? 'Perbarui di Luna' : 'Simpan ke Luna';
    } finally {
      btn.disabled = false;
    }
  }

  // ── Otomatis: klik lowongan satu per satu, baca, simpan ─────────────────
  // Mengulang pekerjaan yang biasa dilakukan tangan: klik kartu di daftar kiri, tunggu panel kanan
  // berganti ke lowongan itu, baca dan simpan lewat jalur yang sama dengan tombol "Simpan ke Luna",
  // lalu kartu berikutnya. Berjalan hanya setelah dinyalakan dari dock, dengan tab JobStreet terbuka.
  // Pengaman: jeda acak antar lowongan, batas per jalan dan per hari, tombol/pintasan berhenti,
  // dan berhenti sendiri bila halaman menampilkan pemeriksaan keamanan atau gagal beruntun.
  const AUTO_DEFAULT = { batas: 300, jedaMin: 3, jedaMaks: 7, batasHari: 600 };
  const AUTO_GAGAL_BERUNTUN = 3;
  const CARD_SELECTOR = 'a[data-automation="job-list-item-link-overlay"]';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const acak = (a, b) => a + Math.random() * Math.max(0, b - a);
  const idDariHref = (h) => (String(h || '').match(/\/job\/(\d+)/) || [])[1] || null;
  const hariIni = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, zona waktu lokal

  const auto = { aktif: false, henti: false, stats: null, batas: 0, status: '', sudah: new Set() };
  const kosongStats = () => ({ diproses: 0, tersimpan: 0, diperbarui: 0, dilewati: 0, gagal: 0 });

  function kartuTampak() {
    const hasil = [];
    const lihat = new Set();
    document.querySelectorAll(CARD_SELECTOR).forEach((el) => {
      const id = idDariHref(el.getAttribute('href'));
      if (id && !lihat.has(id)) { lihat.add(id); hasil.push({ id, el }); }
    });
    return hasil;
  }

  // Pemeriksaan keamanan / penolakan akses: berhenti, jangan dilawan.
  function anomali() {
    const t = (document.title || '').toLowerCase();
    if (/access denied|just a moment|attention required|captcha|are you human|too many requests|akses ditolak/.test(t)) {
      return 'Halaman menampilkan pemeriksaan keamanan atau penolakan akses.';
    }
    // Hanya tantangan yang benar-benar tampil di layar. JobStreet memasang iframe captcha tak kasatmata (lencana
    // reCAPTCHA kecil) di setiap halaman, jadi keberadaan iframe saja bukan tanda ada pemeriksaan.
    const terlihat = (f) => {
      const r = f.getBoundingClientRect();
      const cs = getComputedStyle(f);
      return r.width >= 280 && r.height >= 250 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0.1
        && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    };
    if ([...document.querySelectorAll('iframe[src*="captcha" i], iframe[src*="recaptcha" i], iframe[src*="hcaptcha" i]')].some(terlihat)) {
      return 'Halaman meminta verifikasi (captcha).';
    }
    return null;
  }

  function klikKartu(el, penuh) {
    if (!penuh) { el.click(); return; }
    // Cadangan: urutan peristiwa mouse lengkap, untuk halaman yang mendengarkan lebih dari "click".
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
  }

  // Tunggu panel kanan memuat lowongan dengan ID yang diklik (dan deskripsinya sudah terisi).
  async function tungguPanel(id, batasMs) {
    const mulai = Date.now();
    while (Date.now() - mulai < batasMs) {
      if (auto.henti) return null;
      const rec = readPage();
      if (rec && String(rec.external_id) === String(id) && rec.title && rec.description && rec.description.length > 30) return rec;
      await sleep(250);
    }
    return null;
  }

  async function simpanSetelan(set) { try { await chrome.storage.local.set({ autoSet: set }); } catch { /* abaikan */ } }
  async function bacaSetelan() {
    try { const { autoSet } = await chrome.storage.local.get('autoSet'); return { ...AUTO_DEFAULT, ...(autoSet || {}) }; } catch { return { ...AUTO_DEFAULT }; }
  }
  const nilaiInput = (id, def, min, max) => {
    const n = parseInt($(id)?.value, 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };
  function setelanDariUi() {
    const jedaMin = nilaiInput('a-jmin', AUTO_DEFAULT.jedaMin, 1, 120);
    const jedaMaks = Math.max(jedaMin, nilaiInput('a-jmaks', AUTO_DEFAULT.jedaMaks, 1, 180));
    return { batas: nilaiInput('a-batas', AUTO_DEFAULT.batas, 1, 1000), jedaMin, jedaMaks, batasHari: AUTO_DEFAULT.batasHari };
  }

  async function jumlahHariIni() {
    try { const { autoHari } = await chrome.storage.local.get('autoHari'); return autoHari?.tgl === hariIni() ? autoHari.n : 0; } catch { return 0; }
  }
  async function tambahHariIni() {
    try { const n = (await jumlahHariIni()) + 1; await chrome.storage.local.set({ autoHari: { tgl: hariIni(), n } }); return n; } catch { return 0; }
  }
  async function simpanJalan(set) {
    try {
      await chrome.storage.local.set({ autoRun: { aktif: auto.aktif, stats: auto.stats, set, sudah: [...auto.sudah].slice(-400), ts: Date.now() } });
    } catch { /* abaikan */ }
  }

  function renderAuto() {
    if (!root) return;
    const btn = $('b-auto');
    btn.classList.toggle('stop', auto.aktif);
    btn.querySelector('.t').textContent = auto.aktif ? 'Berhenti' : 'Mulai otomatis';
    for (const id of ['a-batas', 'a-jmin', 'a-jmaks']) $(id).disabled = auto.aktif;
    const s = auto.stats;
    const st = $('a-stat');
    if (!s) { st.textContent = ''; return; }
    st.textContent = '';
    const baris1 = document.createElement('div');
    baris1.className = 'a-line';
    baris1.textContent = `Hal. ${halamanSekarang()} · ${s.diproses}/${auto.batas} · tersimpan ${s.tersimpan} · dilewati ${s.dilewati} · gagal ${s.gagal}`;
    st.appendChild(baris1);
    if (auto.status) {
      const baris2 = document.createElement('div');
      baris2.className = 'a-sub';
      baris2.textContent = auto.status;
      st.appendChild(baris2);
    }
  }
  const setStatus = (t) => { auto.status = t; renderAuto(); };

  // Nomor halaman hasil pencarian yang sedang dibuka (dari penanda halaman aktif, atau ?page=).
  function halamanSekarang() {
    const aktif = document.querySelector('[aria-current="page"]');
    const n = parseInt(aktif?.textContent, 10);
    if (Number.isFinite(n)) return n;
    try { return parseInt(new URL(location.href).searchParams.get('page') || '1', 10) || 1; } catch { return 1; }
  }

  // Tombol "Selanjutnya": utamakan penanda khusus, lalu tombol bertuliskan Selanjutnya/Berikutnya/Next, lalu tautan angka
  // halaman berikutnya (mis. 2 saat di halaman 1). Yang dinonaktifkan atau tersembunyi tidak dihitung.
  function cariTombolNext() {
    const bisa = (el) => el && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null;
    const khusus = document.querySelector('a[data-automation="page-next"], [data-automation*="pagination" i] a[aria-label*="next" i], a[aria-label*="berikut" i], a[aria-label*="selanjut" i], a[aria-label*="next" i], button[aria-label*="next" i]');
    if (bisa(khusus)) return khusus;
    const semua = [...document.querySelectorAll('a, button')];
    const teks = semua.find((el) => /^(selanjutnya|berikutnya|next)$/i.test((el.textContent || '').trim()) && bisa(el));
    if (teks) return teks;
    const angka = String(halamanSekarang() + 1);
    return semua.find((el) => (el.textContent || '').trim() === angka && bisa(el) && el.closest('nav, ul, [data-automation*="pagination" i]')) || null;
  }

  // Pindah ke kumpulan lowongan berikutnya: gulir daftar (muat lebih banyak), tombol halaman berikutnya, atau ?page=.
  // Mengembalikan 'baru' (ada kartu baru), 'navigasi' (halaman dimuat ulang; jalan dilanjutkan oleh script baru), atau null (habis).
  async function lanjutKumpulan(set) {
    const belumDiproses = () => kartuTampak().some((k) => !auto.sudah.has(k.id));
    // Daftar bisa baru dimuat (setelah pindah halaman): beri waktu muncul. Kalau tetap kosong, berarti habis.
    for (let i = 0; i < 16 && !kartuTampak().length; i++) await sleep(500);
    const kartu = kartuTampak();
    if (!kartu.length) return null;
    if (kartu.length) {
      kartu[kartu.length - 1].el.scrollIntoView({ block: 'end' });
      await sleep(1800);
      if (belumDiproses()) return 'baru';
    }
    const next = cariTombolNext();
    if (next) {
      setStatus(`Halaman ${halamanSekarang()} selesai, pindah ke halaman berikutnya…`);
      next.scrollIntoView({ block: 'center' });
      await sleep(400);
      await simpanJalan(set);
      next.click();
      // Halaman diganti tanpa memuat ulang: tunggu kartu baru. Kalau dimuat ulang, script ini berhenti di sini dan script baru melanjutkan.
      await sleep(1500);
      for (let i = 0; i < 14 && !belumDiproses(); i++) await sleep(500);
      return belumDiproses() ? 'baru' : null;
    }
    try {
      const u = new URL(location.href);
      const halaman = parseInt(u.searchParams.get('page') || '1', 10) || 1;
      u.searchParams.set('page', String(halaman + 1));
      await simpanJalan(set);
      location.assign(u.toString());
      return 'navigasi';
    } catch { return null; }
  }

  async function autoJalan(set, lanjut) {
    auto.aktif = true;
    auto.henti = false;
    auto.batas = set.batas;
    if (!lanjut || !auto.stats) auto.stats = kosongStats();
    if (!lanjut) auto.sudah = new Set();
    setPanelOpen(false);
    renderAuto();
    await simpanJalan(set);
    let gagalBeruntun = 0;
    let alasan = '';

    try {
      while (!auto.henti) {
        if (!root) { alasan = 'Extension dimatikan.'; break; }
        const masalah = anomali();
        if (masalah) { alasan = masalah; break; }
        if (auto.stats.diproses >= set.batas) { alasan = `Mencapai batas ${set.batas} lowongan.`; break; }
        if ((await jumlahHariIni()) >= set.batasHari) { alasan = `Mencapai batas harian ${set.batasHari}.`; break; }

        let kartu = kartuTampak().filter((k) => !auto.sudah.has(k.id));
        if (!kartu.length) {
          setStatus('Mencari lowongan berikutnya…');
          const hasil = await lanjutKumpulan(set);
          if (hasil === 'navigasi') { return; } // halaman dimuat ulang; script baru melanjutkan dari penyimpanan
          if (!hasil) { alasan = 'Tidak ada lowongan lagi di hasil pencarian ini.'; break; }
          kartu = kartuTampak().filter((k) => !auto.sudah.has(k.id));
          if (!kartu.length) { alasan = 'Tidak ada lowongan lagi di hasil pencarian ini.'; break; }
        }

        // Periksa sekaligus mana yang sudah ada di Luna, supaya tidak perlu diklik.
        const idKartu = kartu.map((k) => k.id);
        let sudahAda = new Set();
        try { sudahAda = new Set((await send({ type: 'exists', source: 'jobstreet', ids: idKartu })).ids || []); } catch { /* lanjut tanpa pemeriksaan awal */ }

        for (const k of kartu) {
          if (auto.henti) break;
          auto.sudah.add(k.id);
          if (sudahAda.has(k.id)) { auto.stats.dilewati += 1; auto.stats.diproses += 1; renderAuto(); continue; }
          if (auto.stats.diproses >= set.batas) break;

          setStatus('Membuka lowongan…');
          k.el.scrollIntoView({ block: 'center' });
          await sleep(acak(300, 700));
          klikKartu(k.el, false);
          let rec = await tungguPanel(k.id, 4500);
          if (!rec && !auto.henti) { klikKartu(k.el, true); rec = await tungguPanel(k.id, 6000); }
          auto.stats.diproses += 1;

          if (!rec) {
            if (auto.henti) break;
            auto.stats.gagal += 1;
            gagalBeruntun += 1;
            setStatus('Panel tidak berganti, lowongan dilewati.');
          } else if (!rec.company_name) {
            auto.stats.gagal += 1;
            gagalBeruntun += 1;
            setStatus(`Perusahaan tidak terbaca: ${rec.title}`);
          } else {
            try {
              const res = await send({ type: 'save', record: toDb(rec, rec) });
              if (res.updated) auto.stats.diperbarui += 1; else auto.stats.tersimpan += 1;
              gagalBeruntun = 0;
              await tambahHariIni();
              showLoaded(rec, 'existing');
              setStatus(`Tersimpan: ${rec.title}`);
            } catch (e) {
              auto.stats.gagal += 1;
              gagalBeruntun += 1;
              setStatus(`Gagal menyimpan: ${e.message}`);
            }
          }
          renderAuto();
          await simpanJalan(set);
          if (gagalBeruntun >= AUTO_GAGAL_BERUNTUN) { alasan = `${AUTO_GAGAL_BERUNTUN} lowongan gagal berturut-turut.`; break; }
          if (anomali()) break;

          const jeda = acak(set.jedaMin, set.jedaMaks) * 1000;
          const akhir = Date.now() + jeda;
          while (Date.now() < akhir && !auto.henti) await sleep(200);

          // Di jendela sempit lowongan terbuka sebagai halaman penuh, bukan panel: kembali ke daftar, lalu susun ulang kartu.
          if (/\/job\/\d+/.test(location.pathname)) {
            history.back();
            for (let i = 0; i < 25 && !kartuTampak().length; i++) await sleep(300);
            break;
          }
        }
        if (gagalBeruntun >= AUTO_GAGAL_BERUNTUN) break;
      }
    } catch (e) {
      console.error('[Luna Collector] otomatis berhenti karena galat:', e);
      alasan = `Galat: ${e.message}`;
    }

    auto.aktif = false;
    const s = auto.stats;
    const ringkas = `${s.diproses} diproses · ${s.tersimpan} tersimpan · ${s.dilewati} dilewati · ${s.gagal} gagal`;
    setStatus(auto.henti ? 'Dihentikan.' : alasan);
    try { await chrome.storage.local.remove('autoRun'); } catch { /* abaikan */ }
    renderAuto();
    toast(s.gagal && !s.tersimpan ? 'err' : 'ok', auto.henti ? 'Otomatis dihentikan' : 'Otomatis selesai', [alasan, ringkas].filter(Boolean).join(' · '));
  }

  async function autoToggle() {
    if (auto.aktif) { auto.henti = true; setStatus('Menghentikan…'); return; }
    const set = setelanDariUi();
    await simpanSetelan(set);
    autoJalan(set, false);
  }

  // Setelah halaman dimuat ulang saat otomatis berjalan (mis. pindah halaman hasil), lanjutkan bila
  // barusan aktif; jalan yang sudah lama ditinggalkan tidak dilanjutkan sendiri.
  async function autoLanjutkanBilaPerlu() {
    try {
      const { autoRun } = await chrome.storage.local.get('autoRun');
      if (!autoRun?.aktif || Date.now() - (autoRun.ts || 0) > 90000) { await chrome.storage.local.remove('autoRun'); return; }
      auto.stats = autoRun.stats || kosongStats();
      auto.sudah = new Set(autoRun.sudah || []);
      await sleep(2500); // beri waktu halaman memuat daftar
      autoJalan({ ...AUTO_DEFAULT, ...(autoRun.set || {}) }, true);
    } catch { /* abaikan */ }
  }

  // ── Pasang / lepas ─────────────────────────────────────────────────────
  function mount() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'luna-collector-root';
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>${MARKUP}`;
    // Cegah pintasan keyboard JobStreet ikut terpicu saat mengetik di form.
    for (const ev of ['keydown', 'keyup', 'keypress']) host.addEventListener(ev, (e) => e.stopPropagation());
    document.documentElement.appendChild(host);

    $('f-emp').innerHTML = EMPLOYMENT_OPTIONS.map(o => `<option value="${o}">${o}</option>`).join('');
    $('b-detail').addEventListener('click', () => COMMANDS['toggle-detail']());
    $('b-refresh').addEventListener('click', () => COMMANDS['refresh-job']());
    $('b-save').addEventListener('click', () => COMMANDS['save-job']());
    $('p-close').addEventListener('click', closePanel);
    $('p-reload').addEventListener('click', () => COMMANDS['refresh-job']());
    $('p-save').addEventListener('click', () => COMMANDS['save-job']());
    for (const id of ['f-title', 'f-company', 'f-desc']) $(id).addEventListener('input', markEmpty);
    $('f-logo').addEventListener('input', updateLogoPreview);
    for (const id of ['f-smin', 'f-smax']) $(id).addEventListener('input', (e) => { e.target.value = rupiah(e.target.value); });
    $('b-collapse').addEventListener('click', () => {
      const minimized = $('d-card').classList.toggle('min');
      $('d-body').hidden = minimized;
      $('b-collapse').setAttribute('aria-expanded', String(!minimized));
    });
    $('b-auto').addEventListener('click', () => COMMANDS['toggle-auto']());
    bacaSetelan().then((set) => {
      if (!root) return;
      $('a-batas').value = set.batas;
      $('a-jmin').value = set.jedaMin;
      $('a-jmaks').value = set.jedaMaks;
    });
    renderAuto();
    renderEvents();
    agoTimer = setInterval(renderEvents, 5000);
    showShortcutHints();
    // Kalau sudah ada lowongan terbuka saat tombol dipasang, langsung tampilkan.
    const first = readPage();
    if (first) trackLoaded(first);
    autoLanjutkanBilaPerlu();
  }

  function unmount() {
    if (!host) return;
    auto.henti = true; // extension dimatikan: otomatis ikut berhenti
    clearInterval(agoTimer);
    events = [];
    loadedRecord = null;
    host.remove();
    host = null;
    root = null;
    currentRecord = null;
  }

  // Pintasan keyboard punya dua jalur supaya tetap jalan walau salah satunya tidak sampai:
  // 1) chrome.commands (manifest, bisa diubah di chrome://extensions/shortcuts), diteruskan
  //    background ke tab aktif; 2) keydown langsung di halaman dengan kombinasi bawaan.
  // Kalau Chrome sudah menelan tombolnya, halaman tidak menerima keydown, jadi tidak dobel.
  // Satu pemicu = satu aksi. Selama sebuah aksi masih berjalan, pemicu yang sama diabaikan
  // (klik beruntun, tombol hotkey ditahan, atau hotkey yang masuk lewat dua jalur).
  const busy = {};
  const guarded = (name, fn) => () => {
    if (busy[name]) return;
    busy[name] = true;
    Promise.resolve()
      .then(fn)
      .catch((e) => console.error('[Luna Collector] aksi gagal:', name, e))
      .finally(() => { busy[name] = false; });
  };
  // Selama otomatis berjalan, aksi manual dimatikan (membaca/menyimpan sendiri bisa bertabrakan dengan yang sedang diproses).
  const manual = (fn) => () => (auto.aktif ? undefined : fn());
  const COMMANDS = {
    'toggle-detail': guarded('toggle-detail', manual(toggleDetail)),
    'refresh-job': guarded('refresh-job', manual(refreshData)),
    'save-job': guarded('save-job', manual(saveAction)),
    'toggle-auto': guarded('toggle-auto', autoToggle),
  };
  const DEFAULT_KEYS = { 'toggle-detail': 'Alt+Shift+D', 'refresh-job': 'Alt+Shift+A', 'save-job': 'Alt+Shift+S', 'toggle-auto': 'Alt+Shift+X' };
  const KEY_CODES = { KeyD: 'toggle-detail', KeyA: 'refresh-job', KeyS: 'save-job', KeyX: 'toggle-auto' };
  const lastRun = {};

  function runCommand(name, via) {
    if (!root || !COMMANDS[name]) return;
    const now = Date.now();
    if (now - (lastRun[name] || 0) < 600) return; // cegah dobel dari dua jalur
    lastRun[name] = now;
    log('pintasan diterima:', name, `(${via})`);
    COMMANDS[name]();
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'command') runCommand(msg.name, 'chrome');
  });

  window.addEventListener('keydown', (e) => {
    if (!root || !e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
    const name = KEY_CODES[e.code];
    if (!name) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.repeat) return; // tombol ditahan: hanya ketukan pertama yang dihitung
    runCommand(name, 'halaman');
  }, true);

  async function showShortcutHints() {
    let assigned = {};
    try { assigned = (await send({ type: 'shortcuts' })).shortcuts || {}; } catch { /* pakai bawaan */ }
    for (const [name, def] of Object.entries(DEFAULT_KEYS)) {
      const el = root?.getElementById(`k-${name}`);
      if (el) el.textContent = assigned[name] || def;
    }
  }

  async function sync() {
    try {
      const { enabled, session } = await chrome.storage.local.get(['enabled', 'session']);
      if (enabled !== false && session) { mount(); log('tombol dipasang'); }
      else {
        unmount();
        log(`tombol tidak dipasang: ${!session ? 'belum masuk (login lewat ikon extension)' : 'saklar nonaktif'}`);
      }
    } catch { /* extension di-reload: halaman ini perlu dimuat ulang */ }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.enabled || changes.session)) sync();
  });
  sync();
})();
