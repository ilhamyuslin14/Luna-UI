import { useState } from 'react';
import { MAKS_PILIHAN } from '../../data/preferensiKerja.js';
import '../../../css/pelamar/pelamar-onboarding_001.css';

// Pilihan ganda berbentuk chip, dengan kolom cari yang sekaligus menambah pilihan baru bila belum ada
// (Enter atau tombol Tambah). Dipakai di onboarding dan di form preferensi Profil Saya, supaya
// pengalamannya sama. `value` = daftar terpilih; pilihan di luar `rekomendasi` otomatis tampil sebagai chip.
const sama = (a, b) => a.toLowerCase() === b.trim().toLowerCase();

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);

export default function PilihanMultiChip({ rekomendasi, value, onChange, placeholder, label, ikonLokasi = false, labelChip, maks = MAKS_PILIHAN }) {
  const [custom, setCustom] = useState([]);
  const [query, setQuery] = useState('');

  const tambahan = [...custom, ...value.filter((v) => !rekomendasi.some((r) => sama(r, v)) && !custom.some((c) => sama(c, v)))];
  const semua = [...tambahan, ...rekomendasi];
  const q = query.trim();
  const tampil = semua.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
  const bisaTambah = q !== '' && !semua.some((x) => sama(x, q));
  const penuh = value.length >= maks;
  const tambahMati = q === '' || (penuh && !value.some((x) => sama(x, q)));

  const toggle = (item) => onChange(value.includes(item) ? value.filter((x) => x !== item) : (value.length < maks ? [...value, item] : value));

  const tambah = () => {
    let raw = q.replace(/\s+/g, ' ');
    if (!raw) return;
    if (raw === raw.toLowerCase()) raw = raw.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    const ada = semua.find((x) => sama(x, raw));
    const nama = ada || raw;
    if (!value.includes(nama) && value.length >= maks) return;
    if (!ada) setCustom((cur) => [...cur, nama]);
    if (!value.includes(nama)) onChange([...value, nama]);
    setQuery('');
  };

  return (
    <>
      <div className="pob001-search">
        <IconSearch />
        <input
          type="text"
          placeholder={placeholder}
          aria-label={label}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); tambah(); } }}
        />
        <button type="button" className="pob001-add" disabled={tambahMati} onClick={tambah}>Tambah</button>
      </div>

      <div className="pob001-chips">
        {tampil.map((item) => {
          const on = value.includes(item);
          return (
            <button type="button" key={item} className={`pob001-chip${on ? ' on' : ''}`} aria-pressed={on} disabled={!on && penuh} onClick={() => toggle(item)}>
              {on ? <IconCheck /> : ikonLokasi && <IconPin />}
              {labelChip ? labelChip(item) : item}
            </button>
          );
        })}
      </div>

      {bisaTambah && (
        <div className="pob001-addrow">
          <button type="button" className="pob001-chip new" disabled={penuh} onClick={tambah}>+ Tambah “{q}”</button>
        </div>
      )}
      <div className="pob001-count">{value.length} dari {maks} dipilih</div>
    </>
  );
}
