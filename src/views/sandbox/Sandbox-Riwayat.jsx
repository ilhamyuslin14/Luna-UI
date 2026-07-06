import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Setup Supabase Client
const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SandboxRiwayat() {
  const [logs, setLogs] = useState([]);
  const [prices, setPrices] = useState({});
  const [usdToIdr, setUsdToIdr] = useState(16000);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [timeFilter, setTimeFilter] = useState('7'); // '7', '30', 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: dbPrices, error: priceError } = await supabase.from('api_prices').select('*');
      if (priceError) throw priceError;
      const priceMap = {};
      (dbPrices || []).forEach(p => {
        priceMap[p.model_name] = p;
      });
      setPrices(priceMap);

      let allLogs = [];
      let start = 0;
      let step = 1000;
      let fetchMore = true;

      while (fetchMore) {
        const { data, error: dbError } = await supabase
          .from('ai_usage_history')
          .select('*')
          .order('created_at', { ascending: false })
          .range(start, start + step - 1);

        if (dbError) throw dbError;
        
        if (data && data.length > 0) {
          allLogs = [...allLogs, ...data];
          start += step;
          if (data.length < step) {
            fetchMore = false;
          }
        } else {
          fetchMore = false;
        }
      }
      setLogs(allLogs);
    } catch (err) {
      setError('Gagal memuat riwayat AI: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (timeFilter === 'all') return logs;
    const days = parseInt(timeFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return logs.filter(log => new Date(log.created_at) >= cutoff);
  }, [logs, timeFilter]);

  const metrics = useMemo(() => {
    let inputTokens = 0;
    let outputTokens = 0;
    let spendUsd = 0;
    let totalLatency = 0;
    let validLatencyCount = 0;
    let maxLatency = 0;

    filteredLogs.forEach(log => {
      inputTokens += (log.input_tokens || 0);
      outputTokens += (log.output_tokens || 0);
      
      const modelName = log.model_used?.replace('models/', '');
      const priceInfo = prices[modelName];
      if (priceInfo) {
        const inputPrice = log.is_flex_mode ? Number(priceInfo.flex_input_price) : Number(priceInfo.standard_input_price);
        const outputPrice = log.is_flex_mode ? Number(priceInfo.flex_output_price) : Number(priceInfo.standard_output_price);
        spendUsd += (((log.input_tokens || 0) / 1000000) * inputPrice);
        spendUsd += (((log.output_tokens || 0) / 1000000) * outputPrice);
      }

      if (log.latency_ms > 0) {
        totalLatency += log.latency_ms;
        validLatencyCount++;
        if (log.latency_ms > maxLatency) maxLatency = log.latency_ms;
      }
    });

    const totalRequests = filteredLogs.length;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      totalRequests,
      spendUsd,
      avgLatency: validLatencyCount > 0 ? Math.round(totalLatency / validLatencyCount) : 0,
      maxLatency,
      avgSpend: totalRequests > 0 ? (spendUsd / totalRequests) : 0
    };
  }, [filteredLogs, prices]);

  // Bentang hari yang dipakai kedua grafik (jumlah + biaya) supaya konsisten.
  // Untuk "Semua Waktu", bentang hari dari log tertua sampai hari ini (bukan
  // dipatok 30 hari) supaya data lama tidak diam-diam hilang dari grafik.
  const dayRange = useMemo(() => {
    let dayCount;
    if (timeFilter === 'all') {
      if (filteredLogs.length === 0) {
        dayCount = 1;
      } else {
        const oldest = filteredLogs.reduce((min, log) => {
          const t = new Date(log.created_at).getTime();
          return t < min ? t : min;
        }, Date.now());
        const diffDays = Math.floor((Date.now() - oldest) / 86400000);
        dayCount = diffDays + 1;
      }
    } else {
      dayCount = parseInt(timeFilter);
    }

    const days = [];
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ sortKey: key, date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) });
    }
    return days;
  }, [filteredLogs, timeFilter]);

  const chartData = useMemo(() => {
    const rawMap = {};
    dayRange.forEach(day => { rawMap[day.sortKey] = { ...day }; });

    filteredLogs.forEach(log => {
      const d = new Date(log.created_at);
      const key = d.toISOString().split('T')[0];
      if (rawMap[key]) {
        const model = log.model_used?.split('/')[1] || log.model_used || 'unknown';
        if (!rawMap[key][model]) rawMap[key][model] = 0;
        rawMap[key][model] += 1;
      }
    });

    return Object.values(rawMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredLogs, dayRange]);

  const chartModels = useMemo(() => {
    const models = new Set();
    chartData.forEach(day => {
      Object.keys(day).forEach(k => {
        if (k !== 'date' && k !== 'sortKey') models.add(k);
      });
    });
    return Array.from(models);
  }, [chartData]);

  // Grafik biaya AI harian — sama persis strukturnya dengan chartData (stacked
  // per model per hari), tapi menjumlahkan estimasi biaya (USD) bukan cuma
  // menghitung banyaknya request.
  const costChartData = useMemo(() => {
    const rawMap = {};
    dayRange.forEach(day => { rawMap[day.sortKey] = { ...day }; });

    filteredLogs.forEach(log => {
      const d = new Date(log.created_at);
      const key = d.toISOString().split('T')[0];
      if (rawMap[key]) {
        const model = log.model_used?.split('/')[1] || log.model_used || 'unknown';
        const modelName = log.model_used?.replace('models/', '');
        const priceInfo = prices[modelName];
        let cost = 0;
        if (priceInfo) {
          const inputPrice = log.is_flex_mode ? Number(priceInfo.flex_input_price) : Number(priceInfo.standard_input_price);
          const outputPrice = log.is_flex_mode ? Number(priceInfo.flex_output_price) : Number(priceInfo.standard_output_price);
          cost = (((log.input_tokens || 0) / 1000000) * inputPrice) + (((log.output_tokens || 0) / 1000000) * outputPrice);
        }
        if (!rawMap[key][model]) rawMap[key][model] = 0;
        rawMap[key][model] += cost;
      }
    });

    return Object.values(rawMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredLogs, dayRange, prices]);

  const costChartModels = useMemo(() => {
    const models = new Set();
    costChartData.forEach(day => {
      Object.keys(day).forEach(k => {
        if (k !== 'date' && k !== 'sortKey') models.add(k);
      });
    });
    return Array.from(models);
  }, [costChartData]);

  const COLORS = ['#0977be', '#089f32', '#f59e0b', '#8b5cf6', '#fb484b'];

  const formatCurrency = (usd) => {
    if (usdToIdr && !isNaN(usdToIdr) && Number(usdToIdr) > 0) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(usd * Number(usdToIdr));
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(usd);
  };

  const getLogSpend = (log) => {
    const modelName = log.model_used?.replace('models/', '');
    const priceInfo = prices[modelName];
    if (!priceInfo) return '-';
    const inputPrice = log.is_flex_mode ? Number(priceInfo.flex_input_price) : Number(priceInfo.standard_input_price);
    const outputPrice = log.is_flex_mode ? Number(priceInfo.flex_output_price) : Number(priceInfo.standard_output_price);
    const usd = (((log.input_tokens || 0) / 1000000) * inputPrice) + (((log.output_tokens || 0) / 1000000) * outputPrice);
    return formatCurrency(usd);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  };

  const formatLatency = (ms) => {
    if (!ms) return '-';
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
  };

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const currentTableData = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter]);

  return (
    <div className="max-w-[1200px] mx-auto pb-8 animate-in fade-in duration-300">
      {/* Header & Filter */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="m-0 mb-2 text-slate-900 text-2xl font-bold tracking-tight">Developer Dashboard</h2>
          <p className="m-0 text-slate-500 text-sm">Pantau performa, penggunaan token, dan metrik latensi AI API Anda.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm">
            <span className="px-3 py-2 text-slate-500 border-r border-slate-300 text-sm bg-slate-50 font-medium">1 USD = Rp</span>
            <input
              type="number"
              value={usdToIdr}
              onChange={(e) => setUsdToIdr(e.target.value)}
              className="border-none px-3 py-2 outline-none w-24 text-sm font-semibold text-slate-900"
              placeholder="16000"
            />
          </div>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="p-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none cursor-pointer shadow-sm font-medium text-slate-700 hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
          <button onClick={fetchLogs} className="px-5 py-2.5 rounded-lg bg-orange-600 text-white text-sm cursor-pointer font-semibold shadow-sm hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-600 p-4 rounded-xl mb-6 shadow-sm">
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Input Token', value: metrics.inputTokens.toLocaleString('id-ID') },
          { label: 'Total Output Token', value: metrics.outputTokens.toLocaleString('id-ID') },
          { label: 'Total Tokens', value: metrics.totalTokens.toLocaleString('id-ID') },
          { label: 'Total Spend', value: formatCurrency(metrics.spendUsd), color: 'text-orange-600' },
          { label: 'Avg Spend / Req', value: formatCurrency(metrics.avgSpend) },
          { label: 'Total Request', value: metrics.totalRequests.toLocaleString('id-ID') },
          { label: 'Avg Latency', value: formatLatency(metrics.avgLatency) },
          { label: 'Max Latency', value: formatLatency(metrics.maxLatency), color: 'text-red-500' },
        ].map((card, i) => (
          <div key={i} className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
            <p className="m-0 mb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
            <h3 className={`m-0 text-2xl font-bold tracking-tight ${card.color || 'text-slate-900'}`}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 className="m-0 mb-6 text-lg font-bold text-slate-800 tracking-tight">Grafik Penggunaan AI Harian (Berdasarkan Model)</h3>
          <div className="w-full h-[300px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Memuat grafik...</div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 500 }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 500, color: '#475569' }} />
                  {chartModels.map((model, index) => (
                    <Bar key={model} dataKey={model} name={model} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Tidak ada data pada periode ini</div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 className="m-0 mb-6 text-lg font-bold text-slate-800 tracking-tight">Grafik Biaya AI Harian (Berdasarkan Model)</h3>
          <div className="w-full h-[300px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Memuat grafik...</div>
            ) : costChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} width={90} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 500 }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 500, color: '#475569' }} />
                  {costChartModels.map((model, index) => (
                    <Bar key={model} dataKey={model} name={model} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Tidak ada data pada periode ini</div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/60 bg-slate-50/50">
          <h3 className="m-0 text-lg font-bold text-slate-800 tracking-tight">Log Transaksi 10 Teratas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-4 pl-6 font-semibold text-slate-600 border-b border-slate-200/60">Waktu</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200/60">Model</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200/60">Fungsi</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200/60">Mode</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200/60 text-right">Total Token</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200/60 text-right">Latensi</th>
                <th className="p-4 pr-6 font-semibold text-slate-600 border-b border-slate-200/60 text-right">Biaya</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">Memuat riwayat...</td></tr>
              ) : currentTableData.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">Belum ada riwayat pada periode ini.</td></tr>
              ) : (
                currentTableData.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap text-slate-600 font-medium">{formatDate(log.created_at)}</td>
                    <td className="p-4">
                      <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                        {log.model_used?.split('/')[1] || log.model_used}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{log.function_name}</td>
                    <td className="p-4">
                      {log.is_flex_mode ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">Flex</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700">{log.total_tokens?.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right text-slate-500 font-medium">{formatLatency(log.latency_ms)}</td>
                    <td className="p-4 pr-6 text-right font-bold text-orange-600">{getLogSpend(log)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="p-4 px-6 flex justify-between items-center bg-slate-50/50 border-t border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-700">{((currentPage - 1) * itemsPerPage) + 1}</strong> - <strong className="text-slate-700">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</strong> dari <strong className="text-slate-700">{filteredLogs.length}</strong> data
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${currentPage === 1 ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${currentPage === totalPages ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
