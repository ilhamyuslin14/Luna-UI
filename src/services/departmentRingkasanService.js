import { supabase } from '../config/supabase.js';

/**
 * Mengambil detail satu departemen berdasarkan namanya (untuk company yang sedang login)
 * @param {string} companyId - ID Perusahaan user
 * @param {string} departmentName - Nama departemen (dari URL/navigate state)
 */
export async function getDepartmentByName(companyId, departmentName) {
  if (!companyId || !departmentName) return null;

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('company_id', companyId)
    .ilike('name', departmentName)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = No rows found (bisa terjadi jika belum dibuat)
    console.error('Error fetching department details:', error);
    throw error;
  }
  
  return data || null;
}

/**
 * Mengambil detail satu departemen berdasarkan ID uniknya (menghindari ambiguitas
 * kalau ada beberapa departemen dengan nama yang sama, misal setelah arsip+buat ulang)
 * @param {string} departmentId - ID UUID departemen
 */
export async function getDepartmentById(departmentId) {
  if (!departmentId) return null;

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', departmentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching department details:', error);
    throw error;
  }

  return data || null;
}

/**
 * Mengupdate field spesifik dari suatu departemen
 * @param {string} id - ID UUID departemen
 * @param {Object} updates - Data yang diubah { website, industry, location, address, contact, description }
 */
export async function updateDepartmentDetails(id, updates) {
  if (!id) throw new Error('Department ID is missing');

  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating department details:', error);
    throw error;
  }
  return data;
}
