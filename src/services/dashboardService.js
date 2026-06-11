import { supabase } from '../config/supabase.js';

export async function getDashboardMetrics(companyId) {
  if (!companyId) return { totalKandidat: 0, lowonganAktif: 0, direkrut: 0, rataKecocokan: 0 };

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthIso = startOfMonth.toISOString();

    // 1. Total Talenta (kandidat)
    const { count: totalKandidat } = await supabase
      .from('kandidat')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('arsip', false);

    const { count: kandidatBulanIni } = await supabase
      .from('kandidat')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('arsip', false)
      .gte('created_at', startOfMonthIso);

    const { count: kandidatPublic } = await supabase
      .from('kandidat')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('arsip', false)
      .eq('sumber', 'public');

    // 2. Lowongan Aktif (seleksi)
    const { count: lowonganAktif } = await supabase
      .from('seleksi')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'Aktif')
      .eq('arsip', false);

    const { count: lowonganBulanIni } = await supabase
      .from('seleksi')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('arsip', false)
      .gte('created_at', startOfMonthIso);

    // 3. Karyawan Direkrut (scoring alur_proses >= 8)
    const { count: direkrut } = await supabase
      .from('scoring')
      .select('*, seleksi!inner(company_id)', { count: 'exact', head: true })
      .eq('seleksi.company_id', companyId)
      .gte('alur_proses', 8);

    const { count: direkrutBulanIni } = await supabase
      .from('scoring')
      .select('*, seleksi!inner(company_id)', { count: 'exact', head: true })
      .eq('seleksi.company_id', companyId)
      .gte('alur_proses', 8)
      .gte('updated_at', startOfMonthIso);

    // 4. Rata-rata Kecocokan AI (average of total_score)
    // We fetch all scores and calculate manually, or use an RPC if available.
    // Fetching is fine if the data is small, but let's just fetch total_score.
    const { data: scores } = await supabase
      .from('scoring')
      .select('total_score, seleksi!inner(company_id)')
      .eq('seleksi.company_id', companyId)
      .not('total_score', 'is', null);

    let rataKecocokan = 0;
    if (scores && scores.length > 0) {
      const sum = scores.reduce((acc, curr) => {
        let val = curr.total_score;
        if (typeof val === 'string') val = parseFloat(val);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      rataKecocokan = Math.round(sum / scores.length);
    }

    return {
      totalKandidat: totalKandidat || 0,
      lowonganAktif: lowonganAktif || 0,
      direkrut: direkrut || 0,
      rataKecocokan: rataKecocokan || 0,
      trends: {
        kandidat: kandidatBulanIni || 0,
        kandidatPublic: kandidatPublic || 0,
        lowongan: lowonganBulanIni || 0,
        direkrut: direkrutBulanIni || 0
      }
    };
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return { totalKandidat: 0, lowonganAktif: 0, direkrut: 0, rataKecocokan: 0 };
  }
}

export async function getRecentJobs(companyId) {
  if (!companyId) return [];
  try {
    const { data: seleksi } = await supabase
      .from('seleksi')
      .select('id, jabatan, status, created_at, arsip, departments:department_id(name)')
      .eq('company_id', companyId)
      .eq('arsip', false)
      .order('created_at', { ascending: false })
      .limit(4);

    if (!seleksi || seleksi.length === 0) return [];

    // Get CV counts for these specific seleksi records
    const { data: scoringData } = await supabase
      .from('scoring')
      .select('seleksi_id, kandidat_id, kandidat:kandidat_id(arsip)')
      .in('seleksi_id', seleksi.map(s => s.id));

    const countMap = {};
    (scoringData || []).forEach(s => {
      if (s.kandidat?.arsip) return;
      if (!countMap[s.seleksi_id]) countMap[s.seleksi_id] = new Set();
      countMap[s.seleksi_id].add(s.kandidat_id);
    });

    return seleksi.map(s => ({
      id: s.id,
      posisi: s.jabatan,
      dept: s.departments?.name || '-',
      status: s.status,
      kandidatCount: countMap[s.id]?.size || 0,
      createdAt: s.created_at
    }));
  } catch (err) {
    console.error('Error fetching recent jobs:', err);
    return [];
  }
}

export async function getRecentActivities(companyId) {
  if (!companyId) return [];
  try {
    const activities = [];

    // 1. Recent Seleksi (Lowongan dipublikasikan)
    const { data: seleksi } = await supabase
      .from('seleksi')
      .select('id, jabatan, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    (seleksi || []).forEach(s => {
      activities.push({
        type: 'seleksi',
        timestamp: new Date(s.created_at).getTime(),
        dateStr: s.created_at,
        text: `Lowongan '${s.jabatan}' dipublikasikan.`,
        icon: '/assets/fi8799819.svg',
        bg: '#ffedff'
      });
    });

    // 2. Recent Kandidat (Kandidat ditambahkan)
    const { data: kandidat } = await supabase
      .from('kandidat')
      .select('id, nama_lengkap, created_at, sumber')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    (kandidat || []).forEach(k => {
      const isPublic = k.sumber === 'public';
      activities.push({
        type: 'kandidat',
        timestamp: new Date(k.created_at).getTime(),
        dateStr: k.created_at,
        text: isPublic 
          ? `Kandidat '${k.nama_lengkap}' mendaftar via laman karier.`
          : `Kandidat '${k.nama_lengkap}' ditambahkan ke dalam database.`,
        icon: '/assets/fi_16116710.svg',
        bg: '#eef7fd'
      });
    });

    // 3. Recent Scoring Updates (Status kandidat diubah / Kandidat diproses)
    const { data: scoring } = await supabase
      .from('scoring')
      .select('id, alur_proses, updated_at, created_at, kandidat:kandidat_id(nama_lengkap), seleksi!inner(company_id, jabatan)')
      .eq('seleksi.company_id', companyId)
      .order('updated_at', { ascending: false })
      .limit(5);

    // Map alur_proses to name
    const alurNames = [
      'Tidak Sesuai', 'Kandidat Baru', 'Terseleksi', 'Diajukan', 'Penjadwalan Wawancara', 
      'Wawancara HR', 'Wawancara Akhir', 'Penawaran Kerja', 'Diterima', 'Onboarding', 'Lolos Masa Percobaan'
    ];

    (scoring || []).forEach(sc => {
      const namaKandidat = sc.kandidat?.nama_lengkap || 'Kandidat';
      const alurName = alurNames[sc.alur_proses] || 'Tahap Lanjutan';
      const namaPosisi = sc.seleksi?.jabatan || 'Posisi';
      
      let text = '';
      let bg = '';
      let icon = '';

      if (sc.alur_proses === 1) {
        text = `Kandidat '${namaKandidat}' dinilai & diproses untuk posisi '${namaPosisi}'.`;
        bg = '#e1fce7';
        icon = '/assets/fi1004765.svg';
      } else {
        text = `Kandidat '${namaKandidat}' diubah statusnya menjadi ${alurName} pada posisi '${namaPosisi}'.`;
        bg = '#fff4e5';
        icon = '/assets/fi3114812.svg';
      }

      activities.push({
        type: 'scoring',
        timestamp: new Date(sc.updated_at).getTime(),
        dateStr: sc.updated_at,
        text,
        icon,
        bg
      });
    });

    // 4. Recent Bulk Uploads
    const { data: uploads } = await supabase
      .from('activity_logs')
      .select('batch_id, upload_status, created_at')
      .eq('company_id', companyId)
      .eq('upload_status', 'berhasil')
      .order('created_at', { ascending: false })
      .limit(20); // fetch more to group by batch

    const batchCount = {};
    const batchTime = {};
    (uploads || []).forEach(u => {
      if (!u.batch_id) return;
      if (!batchCount[u.batch_id]) {
        batchCount[u.batch_id] = 0;
        batchTime[u.batch_id] = u.created_at;
      }
      batchCount[u.batch_id]++;
    });

    // We take up to 3 recent batches
    Object.entries(batchCount).slice(0, 3).forEach(([batchId, count]) => {
      activities.push({
        type: 'upload',
        timestamp: new Date(batchTime[batchId]).getTime(),
        dateStr: batchTime[batchId],
        text: `${count} CV diimpor massal ke dalam Candidate Warehouse.`,
        icon: '/assets/fi_16116710.svg', // Same icon as kandidat/add
        bg: '#eef7fd'
      });
    });

    // Sort by descending timestamp and take top 5
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const top5 = activities.slice(0, 5);

    // Format human-readable time
    const now = new Date().getTime();
    return top5.map(act => {
      const diffMin = Math.round((now - act.timestamp) / 60000);
      let timeLabel = '';
      if (diffMin < 5) timeLabel = 'Baru saja';
      else if (diffMin < 60) timeLabel = `${diffMin} menit yang lalu`;
      else if (diffMin < 1440) timeLabel = `${Math.round(diffMin / 60)} jam yang lalu`;
      else {
        const d = new Date(act.timestamp);
        timeLabel = `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
      }

      return {
        text: act.text,
        time: timeLabel,
        icon: act.icon,
        bg: act.bg
      };
    });

  } catch (err) {
    console.error('Error fetching recent activities:', err);
    return [];
  }
}

export async function getAdvancedDashboardMetrics(companyId) {
  if (!companyId) return null;
  try {
    // 1. Funnel & Kategori Fit (dari scoring)
    const { data: scoringData } = await supabase
      .from('scoring')
      .select('alur_proses, kategori_fit, seleksi_id, seleksi!inner(company_id, jabatan)')
      .eq('seleksi.company_id', companyId);

    // 2. Demografi Talenta (dari kandidat)
    const { data: kandidatData } = await supabase
      .from('kandidat')
      .select('gender, sumber')
      .eq('company_id', companyId)
      .eq('arsip', false);

    const metrics = {
      funnel: [
        { name: 'Sourced (Baru)', value: 0 },
        { name: 'Disaring AI', value: 0 },
        { name: 'Wawancara', value: 0 },
        { name: 'Penawaran', value: 0 },
        { name: 'Direkrut', value: 0 }
      ],
      aiAcceptance: { sangatCocok: 0, cocok: 0, kurangCocok: 0 },
      sumber: {},
      gender: { 'Laki-laki': 0, 'Perempuan': 0, 'Tidak Diketahui': 0 },
      topJobs: {}
    };

    if (scoringData) {
      scoringData.forEach(s => {
        // Funnel logic
        const alur = s.alur_proses || 1;
        if (alur >= 1) metrics.funnel[0].value++; // Sourced
        if (alur >= 2) metrics.funnel[1].value++; // Disaring
        if (alur >= 4 && alur <= 6) metrics.funnel[2].value++; // Wawancara
        if (alur === 7) metrics.funnel[3].value++; // Penawaran
        if (alur >= 8) metrics.funnel[4].value++; // Direkrut (8, 9, 10)

        // AI Acceptance
        if (s.kategori_fit === 'Sangat Cocok') metrics.aiAcceptance.sangatCocok++;
        else if (s.kategori_fit === 'Cocok') metrics.aiAcceptance.cocok++;
        else metrics.aiAcceptance.kurangCocok++;

        // Top Jobs
        const jabatan = s.seleksi?.jabatan || 'Unknown';
        if (!metrics.topJobs[jabatan]) metrics.topJobs[jabatan] = 0;
        metrics.topJobs[jabatan]++;
      });
    }

    if (kandidatData) {
      kandidatData.forEach(k => {
        // Gender
        if (k.gender === 'Laki-laki') metrics.gender['Laki-laki']++;
        else if (k.gender === 'Perempuan') metrics.gender['Perempuan']++;
        else metrics.gender['Tidak Diketahui']++;

        // Sumber
        const source = k.sumber === 'public' ? 'Portal Karier' : 'Upload Manual';
        if (!metrics.sumber[source]) metrics.sumber[source] = 0;
        metrics.sumber[source]++;
      });
    }

    // Sort Top Jobs
    metrics.topJobsArr = Object.entries(metrics.topJobs)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format Sumber to array for PieChart
    metrics.sumberArr = Object.entries(metrics.sumber)
      .map(([name, value]) => ({ name, value }));

    return metrics;
  } catch (err) {
    console.error('Error fetching advanced metrics:', err);
    throw err;
  }
}
