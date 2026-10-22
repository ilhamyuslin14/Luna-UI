import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../config/supabase.js';
import { SUMBER_EKSTERNAL } from '../../data/lowonganEksternalConfig.js';

// Menu input lowongan agregat (JobStreet, Glints, dst) ke tabel
// `lowongan_eksternal`. Hanya super admin Luna yang bisa menulis (RLS).

const KODE_PREFIX = { jobstreet: 'JS', glints: 'GL', kalibrr: 'KB' };

// raw = teks yang tampil ke pelamar; norm = nilai baku untuk filter Tipe
// Pekerjaan (null = tidak ada padanan, jadi tidak ikut terfilter).
const EMPLOYMENT_OPTIONS = [
  { raw: 'Full time', norm: null },
  { raw: 'Part time', norm: 'Part Time' },
  { raw: 'Kontrak', norm: 'Waktu Tertentu' },
  { raw: 'Magang', norm: 'Magang' },
  { raw: 'Freelance', norm: 'Freelance' },
  { raw: 'Temporer', norm: 'Temporer' },
];

const STATUS_OPTIONS = [
  { value: 'aktif', label: 'Aktif', cls: 'bg-emerald-50 text-emerald-700' },
  { value: 'ditutup', label: 'Ditutup', cls: 'bg-slate-100 text-slate-600' },
  { value: 'kedaluwarsa', label: 'Kedaluwarsa', cls: 'bg-amber-50 text-amber-700' },
];

const todayStr = () => new Date().toLocaleDateString('sv-SE');
const dateStr = (iso) => (iso ? new Date(iso).toLocaleDateString('sv-SE') : '');
const toInt = (v) => {
  const d = String(v ?? '').replace(/[^\d]/g, '');
  return d ? parseInt(d, 10) : null;
};
// Tampilan nominal ("Rp 15.000.000"); yang disimpan tetap angka lewat toInt().
const rupiah = (v) => {
  const n = toInt(v);
  return n == null ? '' : `Rp ${n.toLocaleString('id-ID')}`;
};
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

const EMPTY_FORM = {
  source: 'jobstreet', external_url: '', external_id: '',
  title: '', company_name: '', logo_url: '', location: '', category: '',
  employment_type_raw: 'Full time',
  salary_min: '', salary_max: '', salary_text: '',
  description: '', posted_at: todayStr(), expires_at: '', status: 'aktif',
};

const DRAFT_KEY = 'luna_sandbox_lowongan_eksternal_draft';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_FORM, ...JSON.parse(raw) } : null;
  } catch { return null; }
}
function saveDraft(form) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* storage penuh/diblok */ }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
}

function rowToForm(row) {
  return {
    source: row.source, external_url: row.external_url || '', external_id: row.external_id || '',
    title: row.title || '', company_name: row.company_name || '', logo_url: row.logo_url || '', location: row.location || '', category: row.category || '',
    employment_type_raw: row.employment_type_raw || 'Full time',
    salary_min: rupiah(row.salary_min),
    salary_max: rupiah(row.salary_max),
    salary_text: row.salary_text || '',
    description: row.description || '',
    posted_at: dateStr(row.posted_at) || todayStr(),
    expires_at: dateStr(row.expires_at),
    status: row.status,
  };
}

// ID lowongan hanya diambil dari pola yang pasti (/job/ID atau ?jobId=ID);
// menebak angka sembarang dari link pernah salah mengambil potongan di #sol=….
function guessExternalId(url) {
  const s = String(url || '');
  const m = s.match(/\/job\/(\d+)/) || s.match(/[?&]jobId=(\d+)/);
  return m ? m[1] : '';
}

// Link halaman detail dibersihkan dari parameter pelacakan (?ref=…#sol=…).
function cleanJobUrl(url) {
  const s = String(url || '').trim();
  if (!/\/job\/\d+/.test(s)) return s;
  try {
    const u = new URL(s);
    return u.origin + u.pathname.replace(/\/+$/, '');
  } catch { return s; }
}

const inputCls = 'w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

function Field({ label, required, hint, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-orange-600"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-slate-400 leading-snug">{hint}</span>}
    </label>
  );
}

export default function SandboxLowonganEksternal() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null); // { type: 'ok' | 'err', text }

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterSource, setFilterSource] = useState('semua');

  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Draf form "tambah baru" tersimpan otomatis supaya tidak hilang kalau form
  // tertutup/di-refresh sebelum sempat disimpan.
  useEffect(() => {
    if (editing === 'new') saveDraft(form);
  }, [form, editing]);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('lowongan_eksternal')
      .select('*')
      .order('posted_at', { ascending: false, nullsFirst: false });
    if (error) setLoadError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
      if (filterSource !== 'semua' && r.source !== filterSource) return false;
      if (!q) return true;
      return [r.title, r.company_name, r.location, r.kode].some(v => (v || '').toLowerCase().includes(q));
    });
  }, [rows, search, filterStatus, filterSource]);

  const openNew = () => {
    const draft = loadDraft();
    setForm(draft || { ...EMPTY_FORM, posted_at: todayStr() });
    setDraftRestored(!!draft);
    setFormError('');
    setEditing('new');
  };
  const resetDraft = () => {
    clearDraft();
    setForm({ ...EMPTY_FORM, posted_at: todayStr() });
    setDraftRestored(false);
    setFormError('');
  };
  const openEdit = (row) => {
    setForm(rowToForm(row));
    setFormError('');
    setEditing(row);
  };
  const closeForm = () => { if (!saving) setEditing(null); };
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setRupiah = (key) => (e) => setForm(f => ({ ...f, [key]: rupiah(e.target.value) }));

  const handleUrlBlur = () => {
    setForm(f => ({
      ...f,
      external_url: cleanJobUrl(f.external_url),
      external_id: f.external_id.trim() || guessExternalId(f.external_url),
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return 'Judul lowongan wajib diisi.';
    if (!form.company_name.trim()) return 'Nama perusahaan wajib diisi.';
    if (!/^https?:\/\/\S+$/i.test(form.external_url.trim())) return 'Link lowongan harus diawali http:// atau https://';
    const min = toInt(form.salary_min);
    const max = toInt(form.salary_max);
    if (min != null && max != null && min > max) return 'Gaji minimum tidak boleh lebih besar dari maksimum.';
    if (form.expires_at && form.posted_at && form.expires_at < form.posted_at) return 'Tanggal kedaluwarsa tidak boleh sebelum tanggal posting.';
    return '';
  };

  const save = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError('');

    const isNew = editing === 'new';
    const emp = EMPLOYMENT_OPTIONS.find(o => o.raw === form.employment_type_raw);
    const externalId = form.external_id.trim() || null;
    const nowIso = new Date().toISOString();

    const payload = {
      source: form.source,
      external_id: externalId,
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      logo_url: /^https?:\/\//i.test(form.logo_url.trim()) ? form.logo_url.trim() : null,
      location: form.location.trim() || null,
      category: form.category.trim() || null,
      employment_type_raw: form.employment_type_raw,
      employment_type: emp?.norm ?? null,
      salary_min: toInt(form.salary_min),
      salary_max: toInt(form.salary_max),
      salary_text: form.salary_text.trim() || null,
      description: form.description.trim() || null,
      external_url: form.external_url.trim(),
      posted_at: new Date(`${form.posted_at || todayStr()}T00:00:00`).toISOString(),
      expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null,
      status: form.status,
      last_verified_at: nowIso,
      updated_at: nowIso,
    };

    let error;
    if (isNew) {
      const suffix = externalId || String(Math.floor(Math.random() * 900000) + 100000);
      payload.kode = `EXT-${KODE_PREFIX[form.source] || 'XX'}-${suffix}`;
      ({ error } = await supabase.from('lowongan_eksternal').insert([payload]));
    } else {
      ({ error } = await supabase.from('lowongan_eksternal').update(payload).eq('id', editing.id));
    }

    setSaving(false);
    if (error) {
      const dup = error.code === '23505';
      setFormError(dup
        ? 'Lowongan dengan sumber dan ID eksternal yang sama sudah ada. Cari di daftar lalu ubah yang lama.'
        : `Gagal menyimpan: ${error.message}`);
      return;
    }
    if (isNew) clearDraft();
    setEditing(null);
    setNotice({ type: 'ok', text: isNew ? `Lowongan "${payload.title}" ditambahkan.` : `Lowongan "${payload.title}" diperbarui.` });
    load();
  };

  const toggleStatus = async (row) => {
    const next = row.status === 'aktif' ? 'ditutup' : 'aktif';
    const { error } = await supabase
      .from('lowongan_eksternal')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) { setNotice({ type: 'err', text: `Gagal mengubah status: ${error.message}` }); return; }
    setNotice({ type: 'ok', text: `"${row.title}" ${next === 'aktif' ? 'diaktifkan kembali' : 'ditutup'}.` });
    load();
  };

  const counts = useMemo(() => ({
    aktif: rows.filter(r => r.status === 'aktif').length,
    total: rows.length,
  }), [rows]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lowongan Eksternal</h2>
          <p className="text-sm text-slate-500 mt-1">
            Lowongan dari situs lain yang tampil di Semua Lowongan. {counts.aktif} aktif dari {counts.total} total.
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors"
        >
          + Tambah Lowongan
        </button>
      </div>

      {notice && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 text-sm rounded-lg border ${notice.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-semibold opacity-70 hover:opacity-100">Tutup</button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Cari judul, perusahaan, lokasi, kode…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={`${inputCls} w-auto`} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="semua">Semua status</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className={`${inputCls} w-auto`} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="semua">Semua sumber</option>
          {Object.entries(SUMBER_EKSTERNAL).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
        </select>
      </div>

      {loadError && <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">Gagal memuat data: {loadError}</div>}

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Lowongan</th>
                <th className="px-4 py-3">Sumber</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Diposting</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Memuat…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Belum ada lowongan yang cocok.</td></tr>
              ) : filtered.map(row => {
                const st = STATUS_OPTIONS.find(s => s.value === row.status);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{row.title}</div>
                      <div className="text-xs text-slate-500">{row.company_name}{row.location ? ` · ${row.location}` : ''}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{row.kode}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{SUMBER_EKSTERNAL[row.source]?.label || row.source}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-full ${st?.cls || 'bg-slate-100 text-slate-600'}`}>{st?.label || row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(row.posted_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <a
                          href={`/?view=laman-karir-eksternal&kode=${encodeURIComponent(row.kode)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                        >Lihat</a>
                        <button onClick={() => openEdit(row)} className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Ubah</button>
                        <button
                          onClick={() => toggleStatus(row)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border ${row.status === 'aktif' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                        >{row.status === 'aktif' ? 'Tutup' : 'Aktifkan'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{editing === 'new' ? 'Tambah Lowongan Eksternal' : 'Ubah Lowongan Eksternal'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 text-xl leading-none" aria-label="Tutup">×</button>
            </div>

            {editing === 'new' && draftRestored && (
              <div className="mx-6 mt-4 flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-lg">
                <span>Draf terakhir dipulihkan. Isian tersimpan otomatis sampai kamu menekan Simpan.</span>
                <button onClick={resetDraft} className="font-semibold underline whitespace-nowrap">Mulai dari kosong</button>
              </div>
            )}

            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <Field label="Sumber" required>
                <select className={inputCls} value={form.source} onChange={set('source')} disabled={editing !== 'new'}>
                  {Object.entries(SUMBER_EKSTERNAL).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="ID di sumber" hint="Terisi otomatis dari link; dipakai untuk mencegah duplikat.">
                <input className={inputCls} value={form.external_id} onChange={set('external_id')} placeholder="mis. 95116918" disabled={editing !== 'new'} />
              </Field>

              <Field label="Link lowongan asli" required className="col-span-2">
                <input className={inputCls} value={form.external_url} onChange={set('external_url')} onBlur={handleUrlBlur} placeholder="https://id.jobstreet.com/id/job/95116918" />
              </Field>

              <Field label="Judul lowongan" required className="col-span-2">
                <input className={inputCls} value={form.title} onChange={set('title')} />
              </Field>
              <Field label="Nama perusahaan" required>
                <input className={inputCls} value={form.company_name} onChange={set('company_name')} />
              </Field>
              <Field label="Link logo perusahaan" hint="Opsional. Alamat gambar (https://…); kalau kosong atau gagal dimuat, tampil inisial." className="col-span-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 bg-center bg-contain bg-no-repeat"
                    style={{ backgroundImage: /^https?:\/\//i.test(form.logo_url.trim()) ? `url("${form.logo_url.trim().replace(/"/g, '%22')}")` : 'none' }}
                    aria-hidden="true"
                  />
                  <input className={inputCls} value={form.logo_url} onChange={set('logo_url')} placeholder="https://…" />
                </div>
              </Field>
              <Field label="Lokasi">
                <input className={inputCls} value={form.location} onChange={set('location')} placeholder="Jakarta Timur, Jakarta Raya" />
              </Field>
              <Field label="Kategori">
                <input className={inputCls} value={form.category} onChange={set('category')} placeholder="Developer/Programmer (TIK)" />
              </Field>
              <Field label="Ikatan kerja" hint="Full time tidak ikut filter Tipe Pekerjaan.">
                <select className={inputCls} value={form.employment_type_raw} onChange={set('employment_type_raw')}>
                  {EMPLOYMENT_OPTIONS.map(o => <option key={o.raw} value={o.raw}>{o.raw}</option>)}
                </select>
              </Field>

              <Field label="Gaji minimum / bulan">
                <input className={inputCls} inputMode="numeric" value={form.salary_min} onChange={setRupiah('salary_min')} placeholder="Rp 4.500.000" />
              </Field>
              <Field label="Gaji maksimum / bulan">
                <input className={inputCls} inputMode="numeric" value={form.salary_max} onChange={setRupiah('salary_max')} placeholder="Rp 5.500.000" />
              </Field>
              <Field label="Gaji dalam teks" hint="Dipakai kalau tidak ada angka, mis. “Gaji sesuai ekspektasi”, “Negosiasi”." className="col-span-2">
                <input className={inputCls} value={form.salary_text} onChange={set('salary_text')} />
              </Field>

              <Field label="Deskripsi & tanggung jawab" hint="Teks biasa. Awali baris dengan “- ” untuk poin; baris kosong memisahkan paragraf." className="col-span-2">
                <textarea className={`${inputCls} min-h-[180px] font-mono text-[13px] leading-relaxed`} value={form.description} onChange={set('description')} />
              </Field>

              <Field label="Tanggal posting" required>
                <input type="date" className={inputCls} value={form.posted_at} onChange={set('posted_at')} />
              </Field>
              <Field label="Kedaluwarsa pada" hint="Opsional. Kosongkan kalau tidak diketahui.">
                <input type="date" className={inputCls} value={form.expires_at} onChange={set('expires_at')} />
              </Field>

              {editing !== 'new' && (
                <Field label="Status" className="col-span-2">
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              )}
            </div>

            {formError && (
              <div className="mx-6 mb-2 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{formError}</div>
            )}

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={closeForm} disabled={saving} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50">Batal</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-60">
                {saving ? 'Menyimpan…' : (editing === 'new' ? 'Simpan Lowongan' : 'Simpan Perubahan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
