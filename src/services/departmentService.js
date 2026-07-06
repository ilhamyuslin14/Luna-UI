import { supabase } from '../config/supabase.js';

/**
 * Mengambil daftar departemen untuk perusahaan user saat ini
 * (RLS otomatis memfilter berdasarkan company_id dari company_users)
 */
export async function getDepartments({ showArchived = false, showAll = false } = {}) {
  const query = supabase.from('departments').select('*').order('created_at', { ascending: false });
  if (!showAll) {
    if (showArchived) query.eq('status', 'arsip');
    else query.neq('status', 'arsip');
  }

  const [{ data: depts, error }, { data: seleksiRows }] = await Promise.all([
    query,
    supabase.from('seleksi').select('department_id').neq('arsip', true),
  ]);

  if (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }

  const countMap = {};
  (seleksiRows || []).forEach(s => {
    if (s.department_id) countMap[s.department_id] = (countMap[s.department_id] || 0) + 1;
  });

  return (depts || []).map(d => ({ ...d, totalPosisi: countMap[d.id] || 0 }));
}

/**
 * Menambahkan departemen baru
 * @param {string} companyId - ID perusahaan user
 * @param {Object} departmentData - Data departemen { name, website, industry, description }
 */
export async function createDepartment(companyId, departmentData) {
  if (!companyId) throw new Error('company_id is required to create a department');

  const { data, error } = await supabase
    .from('departments')
    .insert([
      {
        company_id: companyId,
        ...departmentData,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating department:', error);
    throw error;
  }
  return data;
}

/**
 * Mengupdate data departemen
 * @param {string} id - ID departemen
 * @param {Object} updates - Data yang diubah { name, website, industry, description }
 */
export async function updateDepartment(id, updates) {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating department:', error);
    throw error;
  }
  return data;
}

export async function archiveDepartment(id) {
  const { error } = await supabase.from('departments').update({ status: 'arsip' }).eq('id', id);
  if (error) throw error;
}

export async function unarchiveDepartment(id) {
  const { error } = await supabase.from('departments').update({ status: 'aktif' }).eq('id', id);
  if (error) throw error;
}
