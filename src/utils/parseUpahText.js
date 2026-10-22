// Memecah teks gaji bebas dari AI ("Rp 15.000.000 - Rp 25.000.000 per bulan",
// "3-5 juta", "Rp 2,5 jt") menjadi tiga kolom seperti isian form manual:
// upah_min, upah_maks, siklus_upah. Siklus yang tidak disebut diisi 'Bulanan'.
// Teks tanpa angka (mis. "Negosiasi") disimpan apa adanya di upah_min.

import { formatSiklusLabel } from './siklusUpah.js';

const SIKLUS_RULES = [
  [/per\s*jam|\/\s*jam|perjam|jam-?jaman/i, 'Jam'],
  [/per\s*hari|\/\s*hari|harian/i, 'Harian'],
  [/per\s*minggu|\/\s*minggu|mingguan/i, 'Mingguan'],
  [/kwartal|kuartal|triwulan/i, 'Kwartal'],
  [/per\s*tahun|\/\s*tahun|tahunan/i, 'Tahunan'],
  [/per\s*bulan|\/\s*bulan|bulanan|perbulan/i, 'Bulanan'],
];

const UNIT = { juta: 1e6, jt: 1e6, ribu: 1e3, rb: 1e3, k: 1e3 };

function formatRp(n) {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}

function extractAmounts(text) {
  const tokens = [];
  const re = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?(?![a-z])/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1];
    const unit = m[2] ? UNIT[m[2].toLowerCase()] : null;
    const isThousands = /^\d{1,3}([.,]\d{3})+$/.test(raw);
    const value = isThousands ? parseInt(raw.replace(/[.,]/g, ''), 10) : parseFloat(raw.replace(',', '.'));
    tokens.push({ value, unit });
  }
  // "5 - 7 juta": angka tanpa satuan ikut satuan angka lain di teks yang sama.
  const sharedUnit = tokens.find(t => t.unit)?.unit || null;
  return tokens
    .map(t => {
      if (t.unit) return t.value * t.unit;
      if (sharedUnit && t.value < 1000) return t.value * sharedUnit;
      return t.value;
    })
    .filter(n => Number.isFinite(n) && n > 0);
}

// Teks gaji untuk layar pratinjau draf, dengan format yang sama seperti
// lowongan tersimpan di laman karir ("Rp 15.000.000 – 25.000.000 / Bulanan").
export function formatUpahDraft(text) {
  const p = parseUpahText(text);
  if (!p.siklus_upah) return p.upah_min;
  const strip = s => s.replace(/^Rp\s*/, '');
  const nominal = p.upah_maks ? `${strip(p.upah_min)} – ${strip(p.upah_maks)}` : strip(p.upah_min);
  return `Rp ${nominal} / ${formatSiklusLabel(p.siklus_upah)}`;
}

export function parseUpahText(text) {
  const raw = String(text || '').trim();
  if (!raw) return { upah_min: '', upah_maks: '', siklus_upah: '' };

  const amounts = extractAmounts(raw);
  if (amounts.length === 0) return { upah_min: raw, upah_maks: '', siklus_upah: '' };

  const siklus = SIKLUS_RULES.find(([re]) => re.test(raw))?.[1] || 'Bulanan';
  const [a, b] = amounts;
  if (b == null) return { upah_min: formatRp(a), upah_maks: '', siklus_upah: siklus };
  return { upah_min: formatRp(Math.min(a, b)), upah_maks: formatRp(Math.max(a, b)), siklus_upah: siklus };
}
