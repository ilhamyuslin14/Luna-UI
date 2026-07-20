import { supabase } from '../config/supabase.js';

/**
 * Mengambil daftar user (anggota tim) dalam satu company, dipakai untuk
 * dropdown pemilihan PIC. Query dua tahap (bukan embedded join) karena
 * company_users.user_id tidak punya FK ke tabel profiles.
 */
export async function getCompanyUsers(companyId) {
  if (!companyId) return [];

  const { data: members, error } = await supabase
    .from('company_users')
    .select('user_id, role')
    .eq('company_id', companyId);
  if (error) throw error;
  if (!members?.length) return [];

  const userIds = members.map(m => m.user_id);
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, nama_lengkap')
    .in('id', userIds);
  if (profileErr) throw profileErr;

  const nameMap = {};
  (profiles || []).forEach(p => { nameMap[p.id] = p.nama_lengkap; });

  return members.map(m => ({
    id: m.user_id,
    name: nameMap[m.user_id] || 'Tanpa Nama',
  }));
}

/**
 * Versi lengkap untuk halaman Kelola Pengguna — termasuk email, role, dan
 * status (Aktif/Menunggu berdasarkan profiles.must_change_password).
 */
export async function getCompanyTeamMembers(companyId) {
  if (!companyId) return [];

  const { data: members, error } = await supabase
    .from('company_users')
    .select('id, user_id, role, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!members?.length) return [];

  const userIds = members.map(m => m.user_id);
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, nama_lengkap, email, must_change_password')
    .in('id', userIds);
  if (profileErr) throw profileErr;

  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = p; });

  return members.map(m => {
    const profile = profileMap[m.user_id] || {};
    return {
      companyUserId: m.id,
      userId: m.user_id,
      name: profile.nama_lengkap || 'Tanpa Nama',
      email: profile.email || '-',
      role: m.role,
      status: profile.must_change_password ? 'Menunggu' : 'Aktif',
    };
  });
}

/**
 * Mengundang anggota baru (role selalu 'admin') lewat edge function
 * invite-member — wajib server-side karena butuh Admin API Supabase.
 */
export async function inviteCompanyMember({ email, nama, companyId }) {
  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { email, nama, companyId },
  });
  if (error) throw new Error(error.message || 'Gagal mengundang anggota.');
  if (data?.error) throw new Error(data.message || 'Gagal mengundang anggota.');
  return data;
}

/**
 * Menghapus anggota dari company (bukan menghapus akunnya secara global).
 * Dibatasi RLS: cuma Owner yang bisa hapus anggota di company-nya sendiri.
 */
export async function removeCompanyUser(companyUserId) {
  if (!companyUserId) throw new Error('companyUserId diperlukan');
  const { error } = await supabase
    .from('company_users')
    .delete()
    .eq('id', companyUserId);
  if (error) throw error;
}
