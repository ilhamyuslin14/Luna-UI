import React, { useState, useEffect, useMemo } from 'react';
import { supabaseProd } from '../../config/supabaseProduction.js';
import '../../../css/analytic/analytic.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function LunaAnalytic({ navigate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [selectedRetention, setSelectedRetention] = useState('ALL');
  const [datePreset, setDatePreset] = useState('first_release'); // 'all', 'first_release', 'today', 'this_week', 'this_month', 'custom'
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'jobs_desc', 'candidates_desc', 'active_first'
  const [sortColumn, setSortColumn] = useState('tanggal_daftar');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [userCandidates, setUserCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateFilter, setCandidateFilter] = useState('real'); // 'real', 'all', 'contoh'

  // Advanced Query Builder Filter States (GA4 / SQL style)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterConjunction, setFilterConjunction] = useState('AND'); // 'AND' | 'OR'
  const [customRules, setCustomRules] = useState([]);
  const [applyToCharts, setApplyToCharts] = useState(true);

  // Available Dimensions / Columns for Advanced Query Filter
  const FILTER_COLUMNS = [
    { key: 'nama_pengguna', label: 'Nama Pengguna', type: 'text' },
    { key: 'nama_perusahaan', label: 'Nama Perusahaan', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'no_kontak', label: 'Nomor WhatsApp / HP', type: 'text' },
    { key: 'kota', label: 'Domisili / Kota', type: 'text' },
    { key: 'industri', label: 'Sektor Industri', type: 'text' },
    { key: 'jabatan', label: 'Jabatan Recruiter', type: 'text' },
    { key: 'channel_akuisisi', label: 'Channel Akuisisi (UTM)', type: 'text' },
    { key: 'kategori_perangkat', label: 'Kategori Perangkat', type: 'text' },
    { key: 'sistem_operasi', label: 'Sistem Operasi', type: 'text' },
    { key: 'segmen_retensi', label: 'Status Retensi', type: 'text' },
    { key: 'total_lowongan_asli', label: 'Total Lowongan Asli', type: 'number' },
    { key: 'lowongan_terbit_asli', label: 'Lowongan Terbit Asli', type: 'number' },
    { key: 'total_kandidat', label: 'Total Kandidat Riil', type: 'number' },
    { key: 'hari_aktif', label: 'Hari Aktif (Buka Apps)', type: 'number' },
    { key: 'umur_akun_hari', label: 'Umur Akun (Hari)', type: 'number' }
  ];

  const TEXT_OPERATORS = [
    { key: 'contains', label: 'Berisi (Contains)' },
    { key: 'not_contains', label: 'Tidak Berisi (Does not contain)' },
    { key: 'equals', label: 'Sama Persis (Exact match)' },
    { key: 'not_equals', label: 'Tidak Sama Dengan (!=)' },
    { key: 'starts_with', label: 'Diawali Dengan (Starts with)' },
    { key: 'ends_with', label: 'Diakhiri Dengan (Ends with)' },
    { key: 'is_empty', label: 'Kosong / Belum Diisi (Is empty)' },
    { key: 'is_not_empty', label: 'Ada Isinya (Is not empty)' }
  ];

  const NUMBER_OPERATORS = [
    { key: 'equals', label: '= Sama Dengan' },
    { key: 'not_equals', label: '!= Tidak Sama Dengan' },
    { key: 'greater_than', label: '> Lebih Dari' },
    { key: 'greater_or_equal', label: '>= Lebih Dari Sama Dengan' },
    { key: 'less_than', label: '< Kurang Dari' },
    { key: 'less_or_equal', label: '<= Kurang Dari Sama Dengan' },
    { key: 'is_zero', label: '= 0 (Nol / Belum Ada)' },
    { key: 'is_not_zero', label: '> 0 (Ada Data)' }
  ];

  // Helper to evaluate a single rule on an item
  const evaluateCustomRule = (item, rule) => {
    const colDef = FILTER_COLUMNS.find((c) => c.key === rule.column) || { type: 'text' };
    const rawVal = item[rule.column];

    if (colDef.type === 'number') {
      const numVal = Number(rawVal) || 0;
      const targetNum = Number(rule.value) || 0;

      switch (rule.operator) {
        case 'equals': return numVal === targetNum;
        case 'not_equals': return numVal !== targetNum;
        case 'greater_than': return numVal > targetNum;
        case 'greater_or_equal': return numVal >= targetNum;
        case 'less_than': return numVal < targetNum;
        case 'less_or_equal': return numVal <= targetNum;
        case 'is_zero': return numVal === 0;
        case 'is_not_zero': return numVal > 0;
        default: return true;
      }
    } else {
      // String / Text evaluation
      const strVal = (rawVal || '').toString().trim().toLowerCase();
      const targetStr = (rule.value || '').toString().trim().toLowerCase();
      const isEmpty = !rawVal || strVal === '' || strVal === '-' || strVal === 'belum ditentukan';

      switch (rule.operator) {
        case 'contains':
          return !targetStr ? true : strVal.includes(targetStr);
        case 'not_contains':
          return !targetStr ? true : !strVal.includes(targetStr);
        case 'equals':
          return strVal === targetStr;
        case 'not_equals':
          return strVal !== targetStr;
        case 'starts_with':
          return strVal.startsWith(targetStr);
        case 'ends_with':
          return strVal.endsWith(targetStr);
        case 'is_empty':
          return isEmpty;
        case 'is_not_empty':
          return !isEmpty;
        default:
          return true;
      }
    }
  };

  // Helper to evaluate all active custom rules
  const matchesCustomFilter = (item) => {
    if (!customRules || customRules.length === 0) return true;

    if (filterConjunction === 'AND') {
      return customRules.every((rule) => evaluateCustomRule(item, rule));
    } else {
      // OR conjunction
      return customRules.some((rule) => evaluateCustomRule(item, rule));
    }
  };

  // Add a new empty rule
  const handleAddRule = () => {
    const newRule = {
      id: Date.now().toString(),
      column: 'nama_perusahaan',
      operator: 'contains',
      value: ''
    };
    setCustomRules([...customRules, newRule]);
    setShowAdvancedFilter(true);
  };

  // Update a specific rule
  const handleUpdateRule = (ruleId, field, value) => {
    setCustomRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        const updated = { ...r, [field]: value };
        // If column changed, reset operator and value appropriately
        if (field === 'column') {
          const colDef = FILTER_COLUMNS.find((c) => c.key === value);
          updated.operator = colDef?.type === 'number' ? 'greater_than' : 'contains';
          updated.value = '';
        }
        return updated;
      })
    );
  };

  // Remove a specific rule
  const handleRemoveRule = (ruleId) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  // Clear all rules
  const handleResetRules = () => {
    setCustomRules([]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: rows, error: err } = await supabaseProd
        .from('v_luna_persona_analytics')
        .select('*');

      if (err) throw err;
      setData(rows || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Gagal memuat data analitik dari DB Production');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch candidate list when activeUserDetail is selected
  useEffect(() => {
    if (!activeUserDetail) {
      setUserCandidates([]);
      setCandidateFilter('real');
      return;
    }

    setCandidateFilter('real');
    const fetchUserCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const orgId = activeUserDetail.organization_id ? String(activeUserDetail.organization_id) : null;
        const compId = activeUserDetail.company_id ? String(activeUserDetail.company_id) : null;
        const uid = String(activeUserDetail.user_id);

        // Build OR condition matching exactly how total_kandidat is computed
        const orConditions = [`user_id.eq.${uid}`];
        if (orgId) orConditions.push(`company_id.eq.${orgId}`);
        if (compId && compId !== orgId) orConditions.push(`company_id.eq.${compId}`);

        const { data: cands, error: cErr } = await supabaseProd
          .from('v_luna_user_candidates')
          .select('*')
          .or(orConditions.join(','))
          .order('created_at', { ascending: false });

        if (cErr) throw cErr;
        setUserCandidates(cands || []);
      } catch (err) {
        console.error('Error fetching candidate details:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchUserCandidates();
  }, [activeUserDetail]);

  // Handle clickable column header sorting (3 states: desc -> asc -> default/deselect)
  const handleSortHeader = (columnKey) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        // Deselect / Reset to default
        setSortColumn('tanggal_daftar');
        setSortDirection('desc');
        setSortBy('newest');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('desc');
      if (columnKey === 'total_lowongan_asli') setSortBy('jobs_desc');
      else if (columnKey === 'total_kandidat') setSortBy('candidates_desc');
      else if (columnKey === 'segmen_retensi') setSortBy('active_first');
      else setSortBy('custom');
    }
  };

  // Synchronize dropdown sort with column sort
  const handleDropdownSortChange = (val) => {
    setSortBy(val);
    if (val === 'newest') {
      setSortColumn('tanggal_daftar');
      setSortDirection('desc');
    } else if (val === 'jobs_desc') {
      setSortColumn('total_lowongan_asli');
      setSortDirection('desc');
    } else if (val === 'candidates_desc') {
      setSortColumn('total_kandidat');
      setSortDirection('desc');
    } else if (val === 'active_first') {
      setSortColumn('segmen_retensi');
      setSortDirection('asc'); // Active starts with A, so asc puts Active first
    }
  };

  // Handle Date Preset Changes
  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'first_release') {
      setStartDate('2026-08-01');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = formatDate(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_week') {
      const day = today.getDay(); // 0 is Sunday
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      setStartDate(formatDate(monday));
      setEndDate(formatDate(new Date()));
    } else if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(new Date()));
    }
  };

  // Filtered and Sorted dataset (for Table)
  const processedData = useMemo(() => {
    // 1. Filter
    const filtered = data.filter((item) => {
      const matchSearch =
        !search ||
        (item.nama_pengguna && item.nama_pengguna.toLowerCase().includes(search.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
        (item.no_kontak && item.no_kontak.toLowerCase().includes(search.toLowerCase())) ||
        (item.nama_perusahaan && item.nama_perusahaan.toLowerCase().includes(search.toLowerCase())) ||
        (item.kota && item.kota.toLowerCase().includes(search.toLowerCase())) ||
        (item.industri && item.industri.toLowerCase().includes(search.toLowerCase()));

      const matchChannel =
        selectedChannel === 'ALL' || item.channel_akuisisi === selectedChannel;
      const matchDevice =
        selectedDevice === 'ALL' || item.kategori_perangkat === selectedDevice;
      const matchRetention =
        selectedRetention === 'ALL' || item.segmen_retensi === selectedRetention;

      // Date Range Match
      let matchDate = true;
      if (item.tanggal_daftar) {
        const itemDateStr = item.tanggal_daftar.split('T')[0];
        if (startDate && itemDateStr < startDate) matchDate = false;
        if (endDate && itemDateStr > endDate) matchDate = false;
      }

      // Advanced Custom Query Filter Match
      const matchCustom = matchesCustomFilter(item);

      return matchSearch && matchChannel && matchDevice && matchRetention && matchDate && matchCustom;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Custom priority for retention status
      if (sortColumn === 'segmen_retensi') {
        const order = { 'Active': 1, 'At Risk': 2, 'Dormant': 3 };
        const rankA = order[valA] || 4;
        const rankB = order[valB] || 4;
        return sortDirection === 'asc' ? rankA - rankB : rankB - rankA;
      }

      // Numeric comparison
      if (typeof valA === 'number' || typeof valB === 'number') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // String or Date comparison
      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, search, selectedChannel, selectedDevice, selectedRetention, startDate, endDate, sortColumn, sortDirection, customRules, filterConjunction]);

  // Dataset filtered strictly by Date Range (Periode Pendaftaran) - Basis angka total recruiter periode
  const periodData = useMemo(() => {
    return data.filter((item) => {
      if (item.tanggal_daftar) {
        const itemDateStr = item.tanggal_daftar.split('T')[0];
        if (startDate && itemDateStr < startDate) return false;
        if (endDate && itemDateStr > endDate) return false;
      }
      return true;
    });
  }, [data, startDate, endDate]);

  const periodTotalRecruiters = periodData.length;

  // Dataset filtered by Date Range (and optionally Advanced Query Filter) for Top Metrics & Charts
  const dateFilteredData = useMemo(() => {
    return periodData.filter((item) => {
      if (applyToCharts) {
        return matchesCustomFilter(item);
      }
      return true;
    });
  }, [periodData, customRules, filterConjunction, applyToCharts]);

  // Aggregate Top Metrics (Reflects selected Date Range)
  const metrics = useMemo(() => {
    const totalRecruiters = dateFilteredData.length;
    const totalPublishedJobs = dateFilteredData.reduce((acc, curr) => acc + (curr.lowongan_terbit_asli || 0), 0);
    const totalCompanyCandidates = dateFilteredData.reduce((acc, curr) => acc + (curr.total_kandidat || 0), 0);
    const activeUsers = dateFilteredData.filter((item) => item.segmen_retensi === 'Active').length;
    const activeRate = totalRecruiters > 0 ? Math.round((activeUsers / totalRecruiters) * 100) : 0;

    // Drop-off / Single visit rate: user who only logged in on 1 day (or 0) and never returned
    const dropOffUsers = dateFilteredData.filter((item) => (Number(item.hari_aktif) || 0) <= 1).length;
    const dropOffRate = totalRecruiters > 0 ? Math.round((dropOffUsers / totalRecruiters) * 100) : 0;

    return { totalRecruiters, totalPublishedJobs, totalCompanyCandidates, activeUsers, activeRate, dropOffUsers, dropOffRate };
  }, [dateFilteredData]);

  // Chart: Acquisition Channel Breakdown
  const channelChartData = useMemo(() => {
    const counts = {};
    dateFilteredData.forEach((item) => {
      const ch = item.channel_akuisisi || 'Other';
      counts[ch] = (counts[ch] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dateFilteredData]);

  // Chart: Device Preference Breakdown
  const deviceChartData = useMemo(() => {
    const counts = {};
    dateFilteredData.forEach((item) => {
      const dev = item.kategori_perangkat || 'Other';
      counts[dev] = (counts[dev] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dateFilteredData]);

  // Chart: Top Industries
  const industryChartData = useMemo(() => {
    const counts = {};
    dateFilteredData.forEach((item) => {
      const ind = item.industri && item.industri !== '-' ? item.industri : 'Belum Ditentukan';
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dateFilteredData]);

  // Chart 1: City / Kota Distribution (Top Cities)
  const cityChartData = useMemo(() => {
    const counts = {};
    dateFilteredData.forEach((item) => {
      let city = item.kota && item.kota !== '-' ? item.kota.trim() : 'Belum Ditentukan';
      // Clean long addresses to readable city names if needed
      if (city.includes('Jakarta') || city.includes('Setiabudi')) city = 'Jakarta';
      else if (city.toLowerCase().includes('sidoarjo')) city = 'Sidoarjo';
      else if (city.toLowerCase().includes('bekasi')) city = 'Bekasi';
      else if (city.toLowerCase().includes('bogor')) city = 'Bogor';
      else if (city.toLowerCase().includes('bandung')) city = 'Bandung';
      else if (city.toLowerCase().includes('malang')) city = 'Malang';
      else if (city.toLowerCase().includes('surabaya')) city = 'Surabaya';
      else if (city.toLowerCase().includes('tasikmalaya')) city = 'Tasikmalaya';
      else if (city.toLowerCase().includes('bantul')) city = 'Bantul';
      else if (city.toLowerCase().includes('papua')) city = 'Papua';
      else if (city.toLowerCase().includes('jawa barat')) city = 'Jawa Barat';

      counts[city] = (counts[city] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [dateFilteredData]);

  // Chart 2: Job Count Distribution (0 Lowongan, 1 Lowongan, > 1 Lowongan)
  const jobDistributionData = useMemo(() => {
    let zero = 0;
    let one = 0;
    let moreThanOne = 0;

    dateFilteredData.forEach((item) => {
      const count = Number(item.total_lowongan_asli) || 0;
      if (count === 0) zero += 1;
      else if (count === 1) one += 1;
      else moreThanOne += 1;
    });

    return [
      { name: '0 Lowongan (Belum Buat)', value: zero },
      { name: '1 Lowongan', value: one },
      { name: '> 1 Lowongan (Multi-Job)', value: moreThanOne }
    ];
  }, [dateFilteredData]);

  // Chart 3: Retention Days Opening Apps (Jumlah Hari Aktif / Login)
  const activeDaysData = useMemo(() => {
    let days0 = 0;
    let days1 = 0;
    let days2 = 0;
    let days3Plus = 0;

    dateFilteredData.forEach((item) => {
      const days = Number(item.hari_aktif) || 0;
      if (days === 0) days0 += 1;
      else if (days === 1) days1 += 1;
      else if (days === 2) days2 += 1;
      else days3Plus += 1;
    });

    return [
      { name: '0 Hari (Tidak Ada Log)', value: days0 },
      { name: '1 Hari (Hanya Hari Daftar)', value: days1 },
      { name: '2 Hari (Kembali di Hari Lain)', value: days2 },
      { name: '3+ Hari (Pengguna Berulang)', value: days3Plus }
    ];
  }, [dateFilteredData]);

  // Chart: Monthly Cohort Conversion Funnel (Agustus 2026 ke atas, termasuk data perangkat)
  const monthlyChartData = useMemo(() => {
    // Map to group by YYYY-MM
    const monthMap = {};

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    data.forEach((item) => {
      if (!item.tanggal_daftar) return;
      const d = new Date(item.tanggal_daftar);
      if (isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

      // Filter: Hanya tampilkan mulai Agustus 2026 ke atas (hilangkan yang di bawah Agustus)
      if (key < '2026-08') return;

      const label = `${monthNames[monthIdx]} ${year}`;

      if (!monthMap[key]) {
        monthMap[key] = {
          key,
          label,
          total_daftar: 0,
          punya_lowongan: 0,
          ada_kandidat: 0,
          desktop: 0,
          mobile: 0,
          other_device: 0,
          mobile_punya_lowongan: 0,
          desktop_punya_lowongan: 0,
          mobile_ada_kandidat: 0,
          desktop_ada_kandidat: 0
        };
      }

      // 1. Akun Terdaftar
      monthMap[key].total_daftar += 1;

      // Perangkat Pengguna
      const device = (item.kategori_perangkat || '').toLowerCase();
      const isDesktop = device.includes('desktop');
      const isMobile = device.includes('mobile');

      if (isDesktop) {
        monthMap[key].desktop += 1;
      } else if (isMobile) {
        monthMap[key].mobile += 1;
      } else {
        monthMap[key].other_device += 1;
      }

      // 2. Punya Minimal 1 Lowongan Asli
      const hasJob = (Number(item.total_lowongan_asli) || 0) >= 1;
      if (hasJob) {
        monthMap[key].punya_lowongan += 1;
        if (isMobile) monthMap[key].mobile_punya_lowongan += 1;
        if (isDesktop) monthMap[key].desktop_punya_lowongan += 1;
      }

      // 3. Lowongan Ada Kandidat Riil
      const hasCand = (Number(item.total_kandidat) || 0) >= 1;
      if (hasCand) {
        monthMap[key].ada_kandidat += 1;
        if (isMobile) monthMap[key].mobile_ada_kandidat += 1;
        if (isDesktop) monthMap[key].desktop_ada_kandidat += 1;
      }
    });

    // Sort chronologically by YYYY-MM key
    return Object.keys(monthMap)
      .sort()
      .map((k) => monthMap[k]);
  }, [data]);

  // Precomputed totals for accurate percentage calculation in tooltips
  const totalChannels = useMemo(() => channelChartData.reduce((acc, c) => acc + c.value, 0), [channelChartData]);
  const totalDevices = useMemo(() => deviceChartData.reduce((acc, c) => acc + c.value, 0), [deviceChartData]);
  const totalIndustries = useMemo(() => industryChartData.reduce((acc, c) => acc + c.value, 0), [industryChartData]);
  const totalCities = useMemo(() => cityChartData.reduce((acc, c) => acc + c.value, 0), [cityChartData]);
  const totalJobs = useMemo(() => jobDistributionData.reduce((acc, c) => acc + c.value, 0), [jobDistributionData]);
  const totalActiveDays = useMemo(() => activeDaysData.reduce((acc, c) => acc + c.value, 0), [activeDaysData]);

  const PIE_COLORS_CHANNEL = ['#0284c7', '#a855f7', '#64748b', '#f59e0b'];
  const PIE_COLORS_DEVICE = ['#3b82f6', '#10b981', '#f97316', '#64748b'];
  const PIE_COLORS_JOBS = ['#94a3b8', '#0ea5e9', '#10b981'];
  const BAR_COLORS_DAYS = ['#cbd5e1', '#60a5fa', '#34d399', '#f59e0b'];

  const renderSortArrow = (columnKey) => {
    if (sortColumn !== columnKey) return <span className="luna-sort-icon">⇅</span>;
    return <span className="luna-sort-icon active">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="luna-analytic-container">
      {/* Header */}
      <div className="luna-analytic-header">
        <div className="luna-analytic-title-area">
          <h1>
            Luna Analytic Dashboard
            <span className="luna-analytic-badge-prod">DB Production</span>
          </h1>
          <p className="luna-analytic-subtitle">
            Analisis persona recruiter riil, atribusi iklan, adopsi lowongan asli, dan basis kandidat perusahaan.
          </p>
        </div>
        <div className="luna-analytic-actions">
          <button
            className="luna-analytic-btn-refresh"
            onClick={fetchData}
            disabled={loading}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            {loading ? 'Menyinkronkan...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="luna-analytic-daterange-bar">
        <div className="luna-daterange-presets">
          <span className="luna-daterange-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Periode Pendaftaran:
          </span>
          <button
            type="button"
            className={`luna-daterange-pill ${datePreset === 'all' ? 'active' : ''}`}
            onClick={() => handleDatePresetChange('all')}
          >
            Semua (All Time)
          </button>
          <button
            type="button"
            className={`luna-daterange-pill ${datePreset === 'first_release' ? 'active' : ''}`}
            onClick={() => handleDatePresetChange('first_release')}
          >
            Release (1 Agt 2026 - Sekarang)
          </button>
          <button
            type="button"
            className={`luna-daterange-pill ${datePreset === 'today' ? 'active' : ''}`}
            onClick={() => handleDatePresetChange('today')}
          >
            Hari Ini
          </button>
          <button
            type="button"
            className={`luna-daterange-pill ${datePreset === 'this_week' ? 'active' : ''}`}
            onClick={() => handleDatePresetChange('this_week')}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            className={`luna-daterange-pill ${datePreset === 'this_month' ? 'active' : ''}`}
            onClick={() => handleDatePresetChange('this_month')}
          >
            Bulan Ini
          </button>
        </div>

        {/* Custom Calendar Inputs */}
        <div className="luna-daterange-custom">
          <div className="luna-date-input-group">
            <span>Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('custom');
              }}
              className="luna-date-input"
            />
          </div>
          <div className="luna-date-input-group">
            <span>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('custom');
              }}
              className="luna-date-input"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              className="luna-date-btn-clear"
              onClick={() => handleDatePresetChange('all')}
              title="Reset ke Semua Periode"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ⚠️ <strong>Peringatan:</strong> {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="luna-analytic-cards-grid">
        <div className="luna-analytic-card">
          <div className="luna-analytic-card-header">
            <span>Recruiter Riil (Non-Tester)</span>
            <div className="luna-analytic-card-icon" style={{ color: '#6366f1' }}>👥</div>
          </div>
          <div className="luna-analytic-card-value">{loading ? '...' : metrics.totalRecruiters}</div>
          <div className="luna-analytic-card-footer">Terverifikasi murni akun pengguna nyata</div>
        </div>

        <div className="luna-analytic-card">
          <div className="luna-analytic-card-header">
            <span>Lowongan Asli Terbit</span>
            <div className="luna-analytic-card-icon" style={{ color: '#10b981' }}>📢</div>
          </div>
          <div className="luna-analytic-card-value">{loading ? '...' : metrics.totalPublishedJobs}</div>
          <div className="luna-analytic-card-footer">Tayang live di portal karir publik</div>
        </div>

        <div className="luna-analytic-card">
          <div className="luna-analytic-card-header">
            <span>Total Kandidat di Perusahaan</span>
            <div className="luna-analytic-card-icon" style={{ color: '#0284c7' }}>📄</div>
          </div>
          <div className="luna-analytic-card-value">{loading ? '...' : metrics.totalCompanyCandidates.toLocaleString()}</div>
          <div className="luna-analytic-card-footer">Hanya pelamar riil (eksklusif non-contoh)</div>
        </div>

        <div className="luna-analytic-card">
          <div className="luna-analytic-card-header">
            <span>Tingkat Retensi Aktif</span>
            <div className="luna-analytic-card-icon" style={{ color: '#10b981' }}>⚡</div>
          </div>
          <div className="luna-analytic-card-value">{loading ? '...' : `${metrics.activeRate}%`}</div>
          <div className="luna-analytic-card-footer">{metrics.activeUsers} recruiter aktif dalam 7 hari terakhir</div>
        </div>

        <div className="luna-analytic-card">
          <div className="luna-analytic-card-header">
            <span>Tingkat Drop Out (1x Kunjung)</span>
            <div className="luna-analytic-card-icon" style={{ color: '#ef4444' }}>🚪</div>
          </div>
          <div className="luna-analytic-card-value" style={{ color: '#dc2626' }}>{loading ? '...' : `${metrics.dropOffRate}%`}</div>
          <div className="luna-analytic-card-footer">{metrics.dropOffUsers} recruiter tidak pernah kembali setelah hari pertama</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="luna-analytic-charts-grid">
        {/* Acquisition Channel Pie Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Sumber Akuisisi & Iklan</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>UTM Attribution</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelChartData}
                  cx="50%"
                  cy="46%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS_CHANNEL[index % PIE_COLORS_CHANNEL.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => {
                    const pct = totalChannels > 0 ? ((val / totalChannels) * 100).toFixed(1) : 0;
                    return [`${val} Pengguna (${pct}%)`, name];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', lineHeight: '18px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Preference Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Perangkat yang Digunakan</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>User-Agent</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="46%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-dev-${index}`} fill={PIE_COLORS_DEVICE[index % PIE_COLORS_DEVICE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => {
                    const pct = totalDevices > 0 ? ((val / totalDevices) * 100).toFixed(1) : 0;
                    return [`${val} Pengguna (${pct}%)`, name];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', lineHeight: '18px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Industries Bar Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Top Sektor Industri</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Firmographics</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => {
                    const pct = totalIndustries > 0 ? ((val / totalIndustries) * 100).toFixed(1) : 0;
                    return [`${val} Perusahaan (${pct}%)`, 'Jumlah'];
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1. City / Kota Distribution Bar Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Persebaran Kota Pengguna</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Geografis Perusahaan</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityChartData} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => {
                    const pct = totalCities > 0 ? ((val / totalCities) * 100).toFixed(1) : 0;
                    return [`${val} Akun (${pct}%)`, 'Jumlah Pengguna'];
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Job Count Distribution (0, 1, >1) Donut Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Adopsi Pembuatan Lowongan</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>0, 1, & &gt; 1 Lowongan</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobDistributionData}
                  cx="50%"
                  cy="46%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {jobDistributionData.map((entry, index) => (
                    <Cell key={`cell-job-${index}`} fill={PIE_COLORS_JOBS[index % PIE_COLORS_JOBS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => {
                    const pct = totalJobs > 0 ? ((val / totalJobs) * 100).toFixed(1) : 0;
                    return [`${val} Akun (${pct}%)`, name];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', lineHeight: '18px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Retention Opening Apps (Hari Aktif / Login) Bar Chart */}
        <div className="luna-analytic-chart-card">
          <div className="luna-analytic-chart-title">
            <span>Retensi Membuka Apps (Hari Aktif)</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Aktivitas / Login</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeDaysData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => {
                    const pct = totalActiveDays > 0 ? ((val / totalActiveDays) * 100).toFixed(1) : 0;
                    return [`${val} Pengguna (${pct}%)`, 'Jumlah Pengguna'];
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                  {activeDaysData.map((entry, index) => (
                    <Cell key={`cell-day-${index}`} fill={BAR_COLORS_DAYS[index % BAR_COLORS_DAYS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Monthly Cohort Conversion Funnel (All-Time / Independent) */}
        <div className="luna-analytic-chart-card luna-chart-card-full">
          <div className="luna-analytic-chart-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Tren Pertumbuhan & Funnel Konversi Bulanan</span>
              <span className="luna-badge-all-time" title="Chart ini merangkum seluruh kohort historis bulanan secara utuh, tidak dipotong oleh filter tanggal/query di atas">
                All-Time Cohort (Independen)
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Pendaftaran vs Buat Lowongan vs Punya Kandidat</span>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                barGap={8}
                barCategoryGap="25%"
              >
                <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0].payload;
                      const totalDaftar = row.total_daftar || 0;
                      const punyaLowongan = row.punya_lowongan || 0;
                      const adaKandidat = row.ada_kandidat || 0;
                      const pctJob = totalDaftar > 0 ? ((punyaLowongan / totalDaftar) * 100).toFixed(1) : 0;
                      const pctCand = punyaLowongan > 0 ? ((adaKandidat / punyaLowongan) * 100).toFixed(1) : 0;
                      const pctTotalCand = totalDaftar > 0 ? ((adaKandidat / totalDaftar) * 100).toFixed(1) : 0;

                      return (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                          fontSize: '12px',
                          minWidth: '260px'
                        }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                            📅 Periode: {label}
                          </div>
                          
                          {/* 1. Akun Terdaftar & Rincian Perangkat */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 600 }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#0284c7' }} />
                              <span>Akun Terdaftar: <strong>{totalDaftar} Akun</strong></span>
                            </div>
                            <div style={{ paddingLeft: '18px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <span>📱 Mobile: <strong>{row.mobile || 0}</strong> ({totalDaftar > 0 ? (((row.mobile || 0) / totalDaftar) * 100).toFixed(1) : 0}%)</span>
                              <span style={{ margin: '0 6px' }}>•</span>
                              <span>💻 Desktop: <strong>{row.desktop || 0}</strong> ({totalDaftar > 0 ? (((row.desktop || 0) / totalDaftar) * 100).toFixed(1) : 0}%)</span>
                              {row.other_device > 0 && (
                                <>
                                  <span style={{ margin: '0 6px' }}>•</span>
                                  <span>Lainnya: <strong>{row.other_device}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* 2. Punya Minimal 1 Lowongan & Konversi Perangkat */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 600 }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1' }} />
                              <span>Punya Lowongan: <strong>{punyaLowongan} Akun</strong> ({pctJob}% dari pendaftar)</span>
                            </div>
                            <div style={{ paddingLeft: '18px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <span>📱 Mobile: <strong>{row.mobile_punya_lowongan || 0} akun</strong> ({row.mobile > 0 ? (((row.mobile_punya_lowongan || 0) / row.mobile) * 100).toFixed(1) : 0}% konversi)</span>
                              <span style={{ margin: '0 6px' }}>•</span>
                              <span>💻 Desktop: <strong>{row.desktop_punya_lowongan || 0} akun</strong> ({row.desktop > 0 ? (((row.desktop_punya_lowongan || 0) / row.desktop) * 100).toFixed(1) : 0}% konversi)</span>
                            </div>
                          </div>

                          {/* 3. Ada Kandidat Masuk & Konversi Perangkat */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                              <span>Ada Kandidat Riil: <strong>{adaKandidat} Akun</strong> ({pctTotalCand}% dari pendaftar)</span>
                            </div>
                            <div style={{ paddingLeft: '18px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <span>📱 Mobile: <strong>{row.mobile_ada_kandidat || 0} akun</strong></span>
                              <span style={{ margin: '0 6px' }}>•</span>
                              <span>💻 Desktop: <strong>{row.desktop_ada_kandidat || 0} akun</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="total_daftar"
                  name="Akun Terdaftar"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="punya_lowongan"
                  name="Punya Minimal 1 Lowongan"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ada_kandidat"
                  name="Lowongan Ada Kandidat"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="luna-analytic-filter-bar">
        <div className="luna-analytic-search-box">
          <svg className="luna-analytic-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, email, no hp, perusahaan, kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="luna-analytic-filters-group">
          {/* Fitur Sort By */}
          <select
            className={`luna-analytic-select ${sortBy !== 'newest' ? 'luna-analytic-select-sort' : ''}`}
            value={sortBy}
            onChange={(e) => handleDropdownSortChange(e.target.value)}
          >
            <option value="newest">Sort: Default (Terbaru Terdaftar)</option>
            <option value="jobs_desc">Sort: Jumlah Lowongan Terbanyak</option>
            <option value="candidates_desc">Sort: Jumlah Kandidat Terbanyak</option>
            <option value="active_first">Sort: Status Aktif Dahulu</option>
            {sortBy === 'custom' && <option value="custom">Sort: Kustom (Header)</option>}
          </select>
          {sortBy !== 'newest' && (
            <button
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => {
                setSortColumn('tanggal_daftar');
                setSortDirection('desc');
                setSortBy('newest');
              }}
              title="Reset ke urutan default"
            >
              ✕ Reset Sort
            </button>
          )}

          <select
            className="luna-analytic-select"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
          >
            <option value="ALL">Semua Channel</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Direct / Organic">Direct / Organic</option>
          </select>

          <select
            className="luna-analytic-select"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="ALL">Semua Perangkat</option>
            <option value="Desktop">Desktop (PC/Laptop)</option>
            <option value="Mobile">Mobile (HP)</option>
            <option value="Tablet">Tablet</option>
          </select>

          <select
            className="luna-analytic-select"
            value={selectedRetention}
            onChange={(e) => setSelectedRetention(e.target.value)}
          >
            <option value="ALL">Semua Status Retensi</option>
            <option value="Active">Active (&le; 7 hari)</option>
            <option value="At Risk">At Risk (8-30 hari)</option>
            <option value="Dormant">Dormant (&gt; 30 hari)</option>
          </select>

          {/* Toggle Button for GA4-Style Advanced Query Filter */}
          <button
            type="button"
            className={`luna-query-filter-toggle-btn ${customRules.length > 0 || showAdvancedFilter ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            title="Buka / Tutup Filter Query Lanjutan (Logika AND / OR)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Query Filter {customRules.length > 0 && <span className="luna-query-badge-count">{customRules.length}</span>}
          </button>
        </div>
      </div>

      {/* Advanced Query Builder Filter Panel (GA4 / SQL Style) */}
      {showAdvancedFilter && (
        <div className="luna-query-builder-panel">
          <div className="luna-query-builder-header">
            <div className="luna-query-builder-title-group">
              <span className="luna-query-builder-icon">🔍</span>
              <div>
                <div className="luna-query-builder-title">Filter Query Lanjutan (GA4 Style)</div>
                <div className="luna-query-builder-desc">
                  Susun aturan logika pencarian multi-kondisi dengan operator teks, perbandingan angka, dan logika AND / OR.
                </div>
              </div>
            </div>

            <div className="luna-query-builder-actions">
              {/* Conjunction Selector (AND / OR) */}
              <div className="luna-query-conjunction-wrap">
                <span className="luna-query-conjunction-label">Kondisi:</span>
                <select
                  className="luna-query-conjunction-select"
                  value={filterConjunction}
                  onChange={(e) => setFilterConjunction(e.target.value)}
                >
                  <option value="AND">AND (Semua aturan harus cocok)</option>
                  <option value="OR">OR (Salah satu aturan cocok)</option>
                </select>
              </div>

              {/* Checkbox Apply to Charts */}
              <label className="luna-query-chart-sync-label" title="Jika dicentang, angka pada kartu metrik dan grafik di atas akan ikut tersaring">
                <input
                  type="checkbox"
                  checked={applyToCharts}
                  onChange={(e) => setApplyToCharts(e.target.checked)}
                />
                <span>Terapkan juga ke Grafik & Metrik</span>
              </label>

              {customRules.length > 0 && (
                <button
                  type="button"
                  className="luna-query-btn-reset"
                  onClick={handleResetRules}
                  title="Hapus semua aturan filter kustom"
                >
                  ✕ Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* List of Filter Rules */}
          <div className="luna-query-rules-list">
            {customRules.length === 0 ? (
              <div className="luna-query-rules-empty">
                Belum ada aturan filter aktif. Klik tombol <strong>"+ Tambah Aturan Filter"</strong> di bawah untuk mulai memfilter data berdasarkan nama, perusahaan, kota, kuota lowongan, hari aktif, dll.
              </div>
            ) : (
              customRules.map((rule, idx) => {
                const colDef = FILTER_COLUMNS.find((c) => c.key === rule.column) || { type: 'text' };
                const isNumeric = colDef.type === 'number';
                const operators = isNumeric ? NUMBER_OPERATORS : TEXT_OPERATORS;
                const noInputRequired = ['is_empty', 'is_not_empty', 'is_zero', 'is_not_zero'].includes(rule.operator);

                return (
                  <div key={rule.id} className="luna-query-rule-row">
                    <span className="luna-query-rule-index">
                      {idx === 0 ? 'Where' : filterConjunction}
                    </span>

                    {/* Column Select */}
                    <select
                      className="luna-query-select luna-query-col-select"
                      value={rule.column}
                      onChange={(e) => handleUpdateRule(rule.id, 'column', e.target.value)}
                    >
                      {FILTER_COLUMNS.map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label} {col.type === 'number' ? '(Angka)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Operator Select */}
                    <select
                      className="luna-query-select luna-query-op-select"
                      value={rule.operator}
                      onChange={(e) => handleUpdateRule(rule.id, 'operator', e.target.value)}
                    >
                      {operators.map((op) => (
                        <option key={op.key} value={op.key}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {/* Value Input (Hidden if operator doesn't need value) */}
                    {!noInputRequired ? (
                      <input
                        type={isNumeric ? 'number' : 'text'}
                        className="luna-query-input"
                        placeholder={isNumeric ? 'Nilai angka...' : 'Ketik nilai pencarian...'}
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                      />
                    ) : (
                      <div className="luna-query-no-input-placeholder">
                        (Tidak memerlukan input teks/angka tambahan)
                      </div>
                    )}

                    {/* Remove Rule Button */}
                    <button
                      type="button"
                      className="luna-query-btn-delete"
                      onClick={() => handleRemoveRule(rule.id)}
                      title="Hapus aturan ini"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer of Query Builder: Add Rule & Summary */}
          <div className="luna-query-builder-footer">
            <button
              type="button"
              className="luna-query-btn-add"
              onClick={handleAddRule}
            >
              + Tambah Aturan Filter
            </button>

            <div className="luna-query-result-count">
              {customRules.length > 0 ? (
                <>
                  Menampilkan <strong>{processedData.length}</strong> dari <strong>{periodTotalRecruiters}</strong> recruiter periode ini{' '}
                  <span className="luna-query-result-pct">
                    ({periodTotalRecruiters > 0 ? ((processedData.length / periodTotalRecruiters) * 100).toFixed(1) : 0}%)
                  </span>
                </>
              ) : (
                <>
                  Menampilkan <strong>{processedData.length}</strong> dari <strong>{periodTotalRecruiters}</strong> recruiter
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Summary Count Bar (Visible when Query Builder is closed or active) */}
      <div className="luna-analytic-table-info-bar">
        <div className="luna-analytic-table-info-text">
          {customRules.length > 0 ? (
            <>
              Menampilkan <strong>{processedData.length}</strong> dari <strong>{periodTotalRecruiters}</strong> recruiter{' '}
              <span className="luna-query-result-pct">
                ({periodTotalRecruiters > 0 ? ((processedData.length / periodTotalRecruiters) * 100).toFixed(1) : 0}%)
              </span>
              <span className="luna-analytic-filter-active-tag">
                ⚡ Query Aktif ({customRules.length} aturan)
              </span>
            </>
          ) : (
            <>
              Menampilkan <strong>{processedData.length}</strong> dari <strong>{periodTotalRecruiters}</strong> recruiter
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="luna-analytic-table-wrapper">
        <table className="luna-analytic-table">
          <thead>
            <tr>
              <th>Recruiter / Perusahaan</th>
              <th>No. HP / WA</th>
              <th>Industri & Kota</th>
              <th>Channel Iklan</th>
              <th>Perangkat</th>
              <th
                className="luna-th-sortable"
                style={{ textAlign: 'center' }}
                onClick={() => handleSortHeader('total_lowongan_asli')}
                title="Klik untuk urutkan berdasarkan jumlah lowongan"
              >
                Lowongan Asli {renderSortArrow('total_lowongan_asli')}
              </th>
              <th
                className="luna-th-sortable"
                style={{ textAlign: 'center' }}
                onClick={() => handleSortHeader('total_kandidat')}
                title="Klik untuk urutkan berdasarkan jumlah kandidat"
              >
                Jumlah Kandidat {renderSortArrow('total_kandidat')}
              </th>
              <th
                className="luna-th-sortable"
                onClick={() => handleSortHeader('segmen_retensi')}
                title="Klik untuk urutkan berdasarkan status retensi"
              >
                Status Retensi {renderSortArrow('segmen_retensi')}
              </th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Memuat data persona dari DB Production...
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Tidak ada data yang sesuai filter pencarian.
                </td>
              </tr>
            ) : (
              processedData.map((item) => {
                const getChannelBadge = (ch) => {
                  if (ch.includes('Google')) return 'luna-badge-google';
                  if (ch.includes('Meta')) return 'luna-badge-meta';
                  return 'luna-badge-direct';
                };

                const getRetentionBadge = (ret) => {
                  if (ret === 'Active') return 'luna-badge-active';
                  if (ret === 'At Risk') return 'luna-badge-atrisk';
                  return 'luna-badge-dormant';
                };

                return (
                  <tr
                    key={item.user_id}
                    onClick={() => setActiveUserDetail(item)}
                    style={{ cursor: 'pointer' }}
                    title="Klik untuk melihat persona lengkap"
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.nama_pengguna}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.nama_perusahaan}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.email}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: item.no_kontak !== '-' ? '#0f172a' : '#94a3b8', fontWeight: item.no_kontak !== '-' ? 600 : 400 }}>
                        {item.no_kontak}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.industri !== '-' ? item.industri : '—'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.kota !== '-' ? item.kota : '—'}</div>
                    </td>
                    <td>
                      <span className={`luna-badge ${getChannelBadge(item.channel_akuisisi)}`}>
                        {item.channel_akuisisi}
                      </span>
                    </td>
                    <td>
                      <span className={`luna-badge ${item.kategori_perangkat === 'Desktop' ? 'luna-badge-desktop' : 'luna-badge-mobile'}`}>
                        {item.kategori_perangkat} ({item.sistem_operasi})
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: item.lowongan_terbit_asli > 0 ? '#10b981' : '#64748b' }}>
                        {item.lowongan_terbit_asli}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}> / {item.total_lowongan_asli}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: item.total_kandidat > 0 ? '#0284c7' : '#94a3b8' }}>
                        {item.total_kandidat.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`luna-badge ${getRetentionBadge(item.segmen_retensi)}`}>
                        {item.segmen_retensi}
                      </span>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                        {item.umur_akun_hari} hari lalu
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveUserDetail(item);
                        }}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Drawer */}
      {activeUserDetail && (
        <div className="luna-analytic-modal-overlay" onClick={() => setActiveUserDetail(null)}>
          <div className="luna-analytic-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="luna-analytic-modal-header">
              <h2 className="luna-analytic-modal-title">
                Detail Persona: {activeUserDetail.nama_pengguna}
              </h2>
              <button className="luna-analytic-modal-close" onClick={() => setActiveUserDetail(null)}>
                &times;
              </button>
            </div>

            <div className="luna-analytic-modal-body">
              <div>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', marginBottom: '12px' }}>
                  1. Informasi Kontak & Akun
                </h3>
                <div className="luna-analytic-detail-grid">
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Email</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.email}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">No. Kontak / WhatsApp</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.no_kontak}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Jabatan Pembuat</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.jabatan}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Metode Login</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.metode_login}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', marginBottom: '12px' }}>
                  2. Profil Perusahaan
                </h3>
                <div className="luna-analytic-detail-grid">
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Nama Perusahaan</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.nama_perusahaan}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Sektor Industri</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.industri}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Ukuran Karyawan</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.ukuran_perusahaan}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Domisili Kota</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.kota}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', marginBottom: '12px' }}>
                  3. Jejak Kampanye Iklan & Perangkat
                </h3>
                <div className="luna-analytic-detail-grid">
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Channel Akuisisi</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.channel_akuisisi}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Perangkat & OS</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.kategori_perangkat} ({activeUserDetail.sistem_operasi})</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Nama Kampanye (Campaign)</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.kampanye_iklan}</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Materi Iklan (Creative/Content)</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.materi_iklan}</span>
                  </div>
                  <div className="luna-analytic-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="luna-analytic-detail-label">Kata Kunci Iklan (Search Keyword)</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.kata_kunci_iklan}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', marginBottom: '12px' }}>
                  4. Ringkasan Basis Data Rekrutmen
                </h3>
                <div className="luna-analytic-detail-grid">
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Total Lowongan Asli</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.total_lowongan_asli} ({activeUserDetail.lowongan_terbit_asli} Terbit)</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Total Kuota Dibuka</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.total_kuota_rekrut} orang</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Jumlah Pelamar Asli</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.total_kandidat} kandidat</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Status Keaktifan</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.segmen_retensi} (Umur akun: {activeUserDetail.umur_akun_hari} hari)</span>
                  </div>
                  <div className="luna-analytic-detail-item">
                    <span className="luna-analytic-detail-label">Frekuensi Buka Apps</span>
                    <span className="luna-analytic-detail-value">{activeUserDetail.hari_aktif || 1} hari aktif</span>
                  </div>
                </div>
              </div>

              {/* 5. DAFTAR KANDIDAT & FILTER KANDIDAT ASLI VS CONTOH */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', margin: 0 }}>
                    5. Daftar Kandidat ({userCandidates.filter(c => !c.name?.toLowerCase().includes('contoh') && !c.email?.includes('emailfiktif.com')).length} Pelamar Asli)
                  </h3>
                  
                  {/* Tab Selector Filter */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setCandidateFilter('real')}
                      style={{
                        border: 'none',
                        background: candidateFilter === 'real' ? '#10b981' : 'transparent',
                        color: candidateFilter === 'real' ? '#ffffff' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ✓ Pelamar Asli ({userCandidates.filter(c => !c.name?.toLowerCase().includes('contoh') && !c.email?.includes('emailfiktif.com')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateFilter('all')}
                      style={{
                        border: 'none',
                        background: candidateFilter === 'all' ? '#6366f1' : 'transparent',
                        color: candidateFilter === 'all' ? '#ffffff' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Semua ({userCandidates.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateFilter('contoh')}
                      style={{
                        border: 'none',
                        background: candidateFilter === 'contoh' ? '#ef4444' : 'transparent',
                        color: candidateFilter === 'contoh' ? '#ffffff' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Contoh Demo ({userCandidates.filter(c => c.name?.toLowerCase().includes('contoh') || c.email?.includes('emailfiktif.com')).length})
                    </button>
                  </div>
                </div>

                {loadingCandidates ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    Memuat daftar kandidat...
                  </div>
                ) : userCandidates.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    Belum ada data kandidat yang terhubung dengan akun ini.
                  </div>
                ) : (
                  (() => {
                    const displayedCandidates = userCandidates.filter((cand) => {
                      const isContoh =
                        (cand.name && cand.name.toLowerCase().includes('contoh')) ||
                        (cand.email && cand.email.includes('emailfiktif.com'));
                      if (candidateFilter === 'real') return !isContoh;
                      if (candidateFilter === 'contoh') return isContoh;
                      return true;
                    });

                    if (displayedCandidates.length === 0) {
                      return (
                        <div style={{ padding: '25px', textAlign: 'center', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                          {candidateFilter === 'real'
                            ? '🎯 Tidak ada pelamar asli yang masuk untuk perusahaan ini (seluruh kandidat adalah data contoh bawaan sistem).'
                            : 'Tidak ada data kandidat pada kategori filter ini.'}
                        </div>
                      );
                    }

                    return (
                      <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <table className="luna-candidate-mini-table" style={{ margin: 0, border: 'none' }}>
                          <thead>
                            <tr>
                              <th>Nama Kandidat</th>
                              <th>Email & Kontak</th>
                              <th style={{ textAlign: 'center' }}>Skor AI</th>
                              <th style={{ textAlign: 'center' }}>Tipe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedCandidates.map((cand) => {
                              const isContoh =
                                (cand.name && cand.name.toLowerCase().includes('contoh')) ||
                                (cand.email && cand.email.includes('emailfiktif.com'));

                              return (
                                <tr key={cand.id} style={{ background: isContoh ? '#fffbfa' : '#ffffff' }}>
                                  <td>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{cand.name || 'Tanpa Nama'}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                      {cand.created_at ? new Date(cand.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '11px', color: '#475569' }}>{cand.email || '-'}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{cand.no_contact || '-'}</div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{ fontWeight: 700, color: cand.ai_scoring > 70 ? '#10b981' : cand.ai_scoring > 50 ? '#f59e0b' : '#64748b' }}>
                                      {cand.ai_scoring !== null ? cand.ai_scoring : '—'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    {isContoh ? (
                                      <span className="luna-badge-contoh" title="Kandidat simulasi/dummy bawaan sistem">
                                        Contoh
                                      </span>
                                    ) : (
                                      <span className="luna-badge-real" title="Kandidat/pelamar riil">
                                        Asli
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
