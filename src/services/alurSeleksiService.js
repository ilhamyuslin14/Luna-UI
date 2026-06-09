import { supabase } from '../config/supabase.js';

export const DEFAULT_ALUR = [
  { level: 0,  nama: 'Tidak Sesuai' },
  { level: 1,  nama: 'Kandidat Baru' },
  { level: 2,  nama: 'Terseleksi' },
  { level: 3,  nama: 'Diajukan' },
  { level: 4,  nama: 'Penjadwalan Wawancara' },
  { level: 5,  nama: 'Wawancara HR' },
  { level: 6,  nama: 'Wawancara Akhir' },
  { level: 7,  nama: 'Penawaran Kerja' },
  { level: 8,  nama: 'Diterima' },
  { level: 9,  nama: 'Onboarding' },
  { level: 10, nama: 'Lolos Masa Percobaan' },
];

export function alurNamaByLevel(alurList, level) {
  return alurList.find(a => a.level === level)?.nama ?? '-';
}

export async function getAlurSeleksi(companyId) {
  if (!companyId) return DEFAULT_ALUR;

  const { data, error } = await supabase
    .from('alur_seleksi')
    .select('level, nama')
    .eq('company_id', companyId)
    .order('level', { ascending: true });

  if (error || !data?.length) return DEFAULT_ALUR;
  return data;
}

export async function seedDefaultAlur(companyId) {
  if (!companyId) return;

  const { data: existing } = await supabase
    .from('alur_seleksi')
    .select('id')
    .eq('company_id', companyId)
    .limit(1);

  if (existing?.length) return;

  const rows = DEFAULT_ALUR.map(a => ({ company_id: companyId, level: a.level, nama: a.nama }));
  const { error } = await supabase.from('alur_seleksi').insert(rows);
  if (error) console.error('Seed alur seleksi error:', error);
}
