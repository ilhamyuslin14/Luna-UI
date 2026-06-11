import { supabase } from '../config/supabase.js';

export async function searchUniversal(companyId, query) {
  if (!companyId || !query || query.length < 2) {
    return { kandidat: [], seleksi: [], departemen: [] };
  }

  const qLike = `%${query}%`;

  // Fetch all related data in parallel
  const [
    { data: kandidatData },
    { data: seleksiData },
    { data: deptData },
    { data: scoringData } // For candidate counts
  ] = await Promise.all([
    supabase
      .from('kandidat')
      .select('id, nama_lengkap, jurusan, domisili, pengalaman_tahun')
      .eq('company_id', companyId)
      .neq('arsip', true)
      .ilike('nama_lengkap', qLike)
      .limit(10),
      
    supabase
      .from('seleksi')
      .select('id, jabatan, status, departments:department_id(name)')
      .eq('company_id', companyId)
      .neq('arsip', true)
      .ilike('jabatan', qLike)
      .limit(10),
      
    supabase
      .from('departments')
      .select('id, name')
      .eq('company_id', companyId)
      .neq('status', 'arsip')
      .ilike('name', qLike)
      .limit(10),
      
    // Fetch all scoring and active seleksi for counts (this might be heavy later, but okay for now)
    supabase
      .from('scoring')
      .select('seleksi_id, kandidat_id, seleksi!inner(department_id, company_id)')
      .eq('seleksi.company_id', companyId)
  ]);

  // Process Kandidat
  const kandidat = (kandidatData || []).map(k => {
    const parts = [
      k.jurusan,
      k.domisili,
      k.pengalaman_tahun ? `${k.pengalaman_tahun} thn pengalaman` : null
    ].filter(Boolean);
    
    return {
      id: k.id,
      initials: (k.nama_lengkap || '').substring(0, 2).toUpperCase(),
      color: '#0977be', // Permintaan User: biru aja
      name: k.nama_lengkap || 'Tanpa Nama',
      sub: parts.length > 0 ? parts.join(' · ') : 'Detail belum lengkap'
    };
  });

  // Process Kandidat Counts per Seleksi and Department
  const countPerSeleksi = {};
  const countPerDept = {};
  
  (scoringData || []).forEach(s => {
    const sId = s.seleksi_id;
    const dId = s.seleksi?.department_id;
    
    if (sId) {
      if (!countPerSeleksi[sId]) countPerSeleksi[sId] = new Set();
      countPerSeleksi[sId].add(s.kandidat_id);
    }
    
    if (dId) {
      if (!countPerDept[dId]) countPerDept[dId] = new Set();
      countPerDept[dId].add(s.kandidat_id);
    }
  });

  // Process Seleksi
  const seleksi = (seleksiData || []).map(s => {
    const deptName = s.departments?.name || 'Tanpa Departemen';
    const cvCount = countPerSeleksi[s.id]?.size || 0;
    
    return {
      id: s.id,
      name: s.jabatan,
      sub: `${deptName} · ${cvCount} CV masuk`,
      status: s.status || 'Rencana'
    };
  });

  // Process Departemen
  // To get active jobs count per department accurately, we should also count seleksi.
  const { data: allSeleksi } = await supabase
    .from('seleksi')
    .select('department_id')
    .eq('company_id', companyId)
    .neq('arsip', true)
    .in('status', ['Aktif']);

  const activeJobsPerDept = {};
  (allSeleksi || []).forEach(s => {
    if (s.department_id) {
      activeJobsPerDept[s.department_id] = (activeJobsPerDept[s.department_id] || 0) + 1;
    }
  });

  const departemen = (deptData || []).map(d => {
    const activeJobs = activeJobsPerDept[d.id] || 0;
    const kandidatCount = countPerDept[d.id]?.size || 0;
    
    return {
      name: d.name,
      sub: `${activeJobs} Lowongan Aktif · ${kandidatCount.toLocaleString('id-ID')} Kandidat`
    };
  });

  return { kandidat, seleksi, departemen };
}
