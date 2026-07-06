// ── aiPricing.js ──────────────────────────────────────────────────────────
// Helper bersama untuk menghitung estimasi biaya AI di tabel Riwayat Sandbox
// (CV Parsing, AI Scoring, Kriteria Penilaian), berdasarkan tabel `api_prices`
// (harga per 1 juta token, dalam USD) dan kurs tetap ke Rupiah.
// ────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const USD_TO_IDR = 17900;

/**
 * Ambil semua baris `api_prices` dan susun jadi map { model_name: row }.
 */
export async function fetchPriceMap() {
  try {
    const { data, error } = await supabase.from('api_prices').select('*');
    if (error) throw error;
    const map = {};
    (data || []).forEach(p => { map[p.model_name] = p; });
    return map;
  } catch (err) {
    console.error('Gagal mengambil data harga model (api_prices):', err);
    return {};
  }
}

/**
 * Hitung estimasi biaya (dalam Rupiah) satu baris ai_usage_history, berdasarkan
 * input_tokens/output_tokens x harga per model (standard atau flex tergantung
 * is_flex_mode) x kurs USD_TO_IDR. Return null kalau model tidak ada di
 * api_prices (belum dilengkapi harganya).
 */
export function estimateCostIDR(row, priceMap) {
  const modelKey = (row.model_used || '').replace('models/', '');
  const price = priceMap[modelKey];
  if (!price) return null;

  const inputPrice = row.is_flex_mode ? price.flex_input_price : price.standard_input_price;
  const outputPrice = row.is_flex_mode ? price.flex_output_price : price.standard_output_price;

  const usd = ((row.input_tokens || 0) / 1_000_000) * Number(inputPrice)
    + ((row.output_tokens || 0) / 1_000_000) * Number(outputPrice);

  return usd * USD_TO_IDR;
}

export function formatRupiah(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLatencySeconds(ms) {
  if (ms === null || ms === undefined) return '-';
  return `${(ms / 1000).toFixed(1)} s`;
}
