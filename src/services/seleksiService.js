import { supabase } from '../config/supabase.js';

export async function getSeleksi(companyId, { showArchived = false, showAll = false } = {}) {
  if (!companyId) return [];

  let query = supabase
    .from('seleksi')
    .select(`*, departments:department_id ( name )`)
    .order('created_at', { ascending: false });

  if (!showAll) {
    if (showArchived) query = query.eq('arsip', true);
    else query = query.neq('arsip', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching seleksi:', error);
    throw error;
  }
  return data;
}

export async function archiveSeleksi(id) {
  const { error } = await supabase.from('seleksi').update({ arsip: true }).eq('id', id);
  if (error) throw error;
}

export async function unarchiveSeleksi(id) {
  const { error } = await supabase.from('seleksi').update({ arsip: false }).eq('id', id);
  if (error) throw error;
}

export async function getMaxAlurBySeleksi(companyId) {
  if (!companyId) return {};
  const { data } = await supabase
    .from('scoring')
    .select('seleksi_id, alur_proses')
    .eq('company_id', companyId);

  const maxMap = {};
  (data || []).forEach(s => {
    if (s.alur_proses != null) {
      if (maxMap[s.seleksi_id] == null || s.alur_proses > maxMap[s.seleksi_id]) {
        maxMap[s.seleksi_id] = s.alur_proses;
      }
    }
  });
  return maxMap;
}

export async function createSeleksi(companyId, data) {
  if (!companyId) throw new Error('company_id is required');

  const { data: result, error } = await supabase
    .from('seleksi')
    .insert([
      {
        company_id: companyId,
        ...data
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating seleksi:', error);
    throw error;
  }
  return result;
}

export async function deleteSeleksi(id) {
  const { error } = await supabase
    .from('seleksi')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting seleksi:', error);
    throw error;
  }
  return true;
}

export async function getSeleksiById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from('seleksi')
    .select(`
      *,
      departments:department_id ( name )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching seleksi by id:', error);
    throw error;
  }
  return data;
}

export async function getSeleksiByJabatan(companyId, jabatan) {
  if (!companyId || !jabatan) return null;

  const { data, error } = await supabase
    .from('seleksi')
    .select(`
      *,
      departments:department_id ( name ),
      companies:company_id ( name )
    `)
    .eq('company_id', companyId)
    .ilike('jabatan', jabatan)
    .limit(1);

  if (error) {
    console.error('Error fetching seleksi by jabatan:', error);
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function getSeleksiByKode(kode) {
  if (!kode) return null;

  const { data, error } = await supabase
    .from('seleksi')
    .select(`
      *,
      departments:department_id ( name ),
      companies:company_id ( name )
    `)
    .eq('kode', kode)
    .limit(1);

  if (error) {
    console.error('Error fetching seleksi by kode:', error);
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function updateSeleksiStatus(id, statusRekrutmen) {
  if (!id) throw new Error('Seleksi ID is missing');
  const { error } = await supabase
    .from('seleksi')
    .update({ status: statusRekrutmen })
    .eq('id', id);
  if (error) throw error;
}

export async function getKandidatCountBySeleksi(companyId) {
  if (!companyId) return {};
  const { data } = await supabase
    .from('scoring')
    .select('seleksi_id, kandidat_id, kandidat:kandidat_id(arsip), seleksi!inner(company_id)')
    .eq('seleksi.company_id', companyId);

  const countMap = {};
  (data || []).forEach(s => {
    if (s.kandidat?.arsip) return;
    if (!countMap[s.seleksi_id]) countMap[s.seleksi_id] = new Set();
    countMap[s.seleksi_id].add(s.kandidat_id);
  });
  const result = {};
  Object.entries(countMap).forEach(([k, v]) => { result[k] = v.size; });
  return result;
}

export async function updateSeleksi(id, updates) {
  if (!id) throw new Error('Seleksi ID is missing');

  const { data, error } = await supabase
    .from('seleksi')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating seleksi:', error);
    throw error;
  }
  return data;
}
