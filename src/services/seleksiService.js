import { supabase } from '../config/supabase.js';

// Paket Free cuma boleh punya status Rencana/Aktif, dan maksimal 1 lowongan
// Aktif dalam satu waktu (status "Aktif" = lowongan itu tampil di Laman
// Karier publik, jadi ini juga menjaga cuma 1 lowongan yang published).
// Dipanggil dari createSeleksi/updateSeleksi/updateSeleksiStatus supaya
// aturannya berlaku sama persis dari surface manapun status diubah
// (Setup Penilaian, Kanban, dropdown detail, dst).
const FREE_PLAN_ALLOWED_STATUSES = ['Rencana', 'Aktif'];

async function assertStatusAllowedForPlan(companyId, status, { excludeSeleksiId } = {}) {
  if (!status || !companyId) return;

  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .select('plan')
    .eq('id', companyId)
    .single();
  if (companyErr) throw companyErr;
  if (company?.plan !== 'free') return;

  if (!FREE_PLAN_ALLOWED_STATUSES.includes(status)) {
    throw new Error(`Paket Free hanya mendukung status "Rencana" dan "Aktif". Upgrade paket untuk menggunakan status "${status}".`);
  }

  if (status === 'Aktif') {
    let query = supabase
      .from('seleksi')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'Aktif');
    if (excludeSeleksiId) query = query.neq('id', excludeSeleksiId);
    const { count, error } = await query;
    if (error) throw error;
    if ((count || 0) > 0) {
      throw new Error('Paket Free hanya bisa memiliki 1 lowongan aktif. Nonaktifkan lowongan lain terlebih dahulu sebelum mengaktifkan yang ini.');
    }
  }
}

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

  await assertStatusAllowedForPlan(companyId, data?.status);

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

/**
 * Duplikat sebuah seleksi — semua data pekerjaan & kriteria penilaian
 * di-copy apa adanya, KECUALI: kode (dibuat baru), status (direset ke
 * 'Rencana'), arsip (direset ke false), dan pic_user_id (dikosongkan agar
 * PIC baru bisa ditentukan). Kandidat/scoring tidak ikut ter-copy karena
 * itu terhubung lewat seleksi_id yang baru — seleksi hasil duplikat
 * otomatis mulai tanpa kandidat.
 */
export async function duplicateSeleksi(seleksiId) {
  if (!seleksiId) throw new Error('seleksiId is required');

  const { data: source, error: fetchErr } = await supabase
    .from('seleksi')
    .select('*')
    .eq('id', seleksiId)
    .single();
  if (fetchErr) throw fetchErr;

  const duplicateData = {
    department_id: source.department_id,
    jabatan: source.jabatan,
    level_jabatan: source.level_jabatan,
    lokasi: source.lokasi,
    remote: source.remote,
    jumlah_rekrut: source.jumlah_rekrut,
    ikatan_kerja: source.ikatan_kerja,
    upah_min: source.upah_min,
    upah_maks: source.upah_maks,
    siklus_upah: source.siklus_upah,
    tgl_mulai: source.tgl_mulai,
    tgl_onboard: source.tgl_onboard,
    pendidikan: source.pendidikan,
    pengalaman: source.pengalaman,
    deskripsi: source.deskripsi,
    kriteria: source.kriteria,
    status: 'Rencana',
    arsip: false,
    pic_user_id: null,
    kode: `LUN-${Math.floor(Math.random() * 10000)}`,
  };

  return createSeleksi(source.company_id, duplicateData);
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
      companies:company_id ( name, slug, logo_url, tagline, deskripsi )
    `)
    .eq('kode', kode)
    .limit(1);

  if (error) {
    console.error('Error fetching seleksi by kode:', error);
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

// Halaman publik perusahaan (dibuka dari breadcrumb Laman Karir) — RLS anon
// cuma izinkan lihat company yang punya minimal 1 seleksi Aktif & tidak arsip.
export async function getCompanyBySlug(slug) {
  if (!slug) return null;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (error) {
    console.error('Error fetching company by slug:', error);
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function getActiveSeleksiByCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabase
    .from('seleksi')
    .select('id, kode, jabatan, lokasi, remote, ikatan_kerja, level_jabatan, departments:department_id ( name )')
    .eq('company_id', companyId)
    .eq('arsip', false)
    .ilike('status', 'aktif')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active seleksi by company:', error);
    throw error;
  }
  return data || [];
}

export async function updateSeleksiStatus(id, statusRekrutmen) {
  if (!id) throw new Error('Seleksi ID is missing');

  const { data: existing, error: fetchErr } = await supabase
    .from('seleksi')
    .select('company_id')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;
  await assertStatusAllowedForPlan(existing.company_id, statusRekrutmen, { excludeSeleksiId: id });

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

  if (updates?.status) {
    const { data: existing, error: fetchErr } = await supabase
      .from('seleksi')
      .select('company_id')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;
    await assertStatusAllowedForPlan(existing.company_id, updates.status, { excludeSeleksiId: id });
  }

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
