import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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

      const { data, error: dbError } = await supabase
        .from('ai_usage_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Get latest 50 logs

      if (dbError) throw dbError;
      setLogs(data || []);
    } catch (err) {
      setError('Gagal memuat riwayat AI: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  };

  const getSpend = (log) => {
    const modelName = log.model_used?.replace('models/', '');
    const priceInfo = prices[modelName];
    if (!priceInfo) return '-';

    const inputPrice = log.is_flex_mode ? Number(priceInfo.flex_input_price) : Number(priceInfo.standard_input_price);
    const outputPrice = log.is_flex_mode ? Number(priceInfo.flex_output_price) : Number(priceInfo.standard_output_price);

    const inputCost = ((log.input_tokens || 0) / 1000000) * inputPrice;
    const outputCost = ((log.output_tokens || 0) / 1000000) * outputPrice;
    const totalUsd = inputCost + outputCost;

    if (usdToIdr && !isNaN(usdToIdr) && Number(usdToIdr) > 0) {
      const idr = totalUsd * Number(usdToIdr);
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(idr);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(totalUsd);
  };

  const formatLatency = (ms) => {
    if (!ms) return '-';
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
  };

  const calculateTotalSpend = () => {
    let totalUsd = 0;
    logs.forEach(log => {
      const modelName = log.model_used?.replace('models/', '');
      const priceInfo = prices[modelName];
      if (priceInfo) {
        const inputPrice = log.is_flex_mode ? Number(priceInfo.flex_input_price) : Number(priceInfo.standard_input_price);
        const outputPrice = log.is_flex_mode ? Number(priceInfo.flex_output_price) : Number(priceInfo.standard_output_price);
        const inputCost = ((log.input_tokens || 0) / 1000000) * inputPrice;
        const outputCost = ((log.output_tokens || 0) / 1000000) * outputPrice;
        totalUsd += (inputCost + outputCost);
      }
    });

    if (usdToIdr && !isNaN(usdToIdr) && Number(usdToIdr) > 0) {
      const idr = totalUsd * Number(usdToIdr);
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(idr);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(totalUsd);
  };

  return (
    <>
      <div className="sb-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Riwayat Penggunaan AI</h2>
          <p>Catatan pemakaian token AI langsung dari server Google Gemini. Refresh halaman untuk melihat aktivitas terbaru.</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', minWidth: '220px', textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spend (Data Saat Ini)</p>
          <h3 style={{ margin: 0, color: '#0977be', fontSize: '1.4rem' }}>{calculateTotalSpend()}</h3>
        </div>
      </div>

      <div className="sb-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="sb-card">
          <div className="sb-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <h3 style={{ margin: 0 }}>Log Transaksi Token</h3>
            </div>
            <button onClick={fetchLogs} className="sb-btn sb-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} disabled={isLoading}>
              {isLoading ? 'Memuat...' : 'Muat Ulang'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #eaeaea', backgroundColor: '#fcfcfc' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>Konversi 1 USD ke Rupiah:</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '6px', border: '1px solid #d1d5dc', overflow: 'hidden' }}>
              <span style={{ padding: '0.4rem 0.6rem', color: '#666', borderRight: '1px solid #d1d5dc', fontSize: '0.85rem', backgroundColor: '#f5f7fa' }}>Rp</span>
              <input
                type="number"
                value={usdToIdr}
                onChange={(e) => setUsdToIdr(e.target.value)}
                style={{ border: 'none', padding: '0.4rem 0.6rem', outline: 'none', background: 'transparent', width: '100px', fontSize: '0.9rem' }}
                placeholder="16000"
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>*Kosongkan untuk melihat total dalam USD</span>
          </div>

          <div className="sb-card-body" style={{ padding: 0 }}>
            {error && (
              <div className="sb-alert sb-alert-error" style={{ margin: '1.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{error}</span>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eaeaea', backgroundColor: '#fafafa' }}>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555' }}>Waktu</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555' }}>Model</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555' }}>Fungsi</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555' }}>Mode</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555', textAlign: 'right' }}>Input</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555', textAlign: 'right' }}>Output</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555', textAlign: 'right' }}>Total Token</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555', textAlign: 'right' }}>Waktu Respon</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#555', textAlign: 'right' }}>Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && logs.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                        <svg className="sb-spinner" viewBox="0 0 24 24" style={{ color: '#0977be' }}>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                        Belum ada riwayat penggunaan AI.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatDate(log.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ backgroundColor: '#f0f4ff', color: '#0977be', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                            {log.model_used.split('/')[1] || log.model_used}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>{log.function_name}</td>
                        <td style={{ padding: '1rem' }}>
                          {log.is_flex_mode ? (
                            <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>Flex</span>
                          ) : (
                            <span style={{ backgroundColor: '#e2e3e5', color: '#383d41', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>Standard</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>{log.input_tokens?.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>{log.output_tokens?.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#333' }}>{log.total_tokens?.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>{formatLatency(log.latency_ms)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#0977be' }}>{getSpend(log)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
