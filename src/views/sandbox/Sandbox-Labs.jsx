import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPriceMap, estimateCostIDR, formatRupiah, formatLatencySeconds } from '../../utils/aiPricing';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 8;

function scoreBadgeClasses(score) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 20) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-100 text-slate-500 border-slate-200';
}

export default function SandboxLabs() {
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [priceMap, setPriceMap] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);

  const fetchRuns = async (targetPage = page) => {
    setIsLoading(true);
    try {
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from('ai_usage_history')
        .select('id, created_at, model_used, input_tokens, output_tokens, total_tokens, latency_ms, is_flex_mode, output_json', { count: 'exact' })
        .eq('function_name', 'Generate AI Scoring')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setRuns(data || []);
      setTotal(count || 0);
      setPage(targetPage);
    } catch (err) {
      console.error('Gagal memuat data Labs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRuns(0); fetchPriceMap().then(setPriceMap); }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectRun = (row) => {
    setSelectedId(row.id);
    setSelectedRun(row);
  };

  const scores = selectedRun?.output_json?.scores || [];
  const wajibScores = scores.filter(s => !(s.kategori || '').toLowerCase().includes('tambah'));
  const totalWeight = wajibScores.reduce((acc, s) => acc + (s.weight || 1), 0);
  const weightedSum = wajibScores.reduce((acc, s) => acc + ((s.score_evaluate || 0) * (s.weight || 1)), 0);
  const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2v6L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2l-6-12V2" />
              <path d="M8 2h8" />
              <path d="M7 14h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Labs</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Lihat rincian skor per kriteria dari tiap hasil AI Scoring yang pernah di-generate di Sandbox.</p>
          </div>
        </div>
      </div>

      {/* List Run */}
      <div className="px-8 py-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Daftar Hasil AI Scoring</h2>
          <button
            onClick={() => fetchRuns(page)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <svg className={isLoading ? 'animate-spin' : ''} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
            Refresh
          </button>
        </div>

        <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Waktu</th>
                <th className="text-left px-4 py-2.5 font-semibold">Kandidat / Posisi</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Jumlah Kriteria</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Model</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Estimasi Biaya</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Latensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map(row => {
                const active = selectedId === row.id;
                const oj = row.output_json || {};
                const scoreCount = (oj.scores || []).length;
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleSelectRun(row)}
                    className={`cursor-pointer transition-colors ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-2.5 text-slate-800">
                      <span className="font-medium">{oj.cand_id || 'Kandidat'}</span>
                      <span className="text-slate-400"> — {oj.job_id || 'Posisi'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{scoreCount} kriteria</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{(row.model_used || '-').replace('models/', '')}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatRupiah(estimateCostIDR(row, priceMap))}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatLatencySeconds(row.latency_ms)}</td>
                  </tr>
                );
              })}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-sm">
                    {isLoading ? 'Memuat data...' : 'Belum ada hasil AI Scoring.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">
              Menampilkan {page * PAGE_SIZE + 1}–{Math.min(total, page * PAGE_SIZE + runs.length)} dari {total} hasil
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchRuns(page - 1)}
                disabled={isLoading || page === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Sebelumnya
              </button>
              <span className="text-xs text-slate-500 font-medium px-1">
                Halaman {page + 1} dari {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              </span>
              <button
                onClick={() => fetchRuns(page + 1)}
                disabled={isLoading || (page + 1) * PAGE_SIZE >= total}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown skor per kriteria */}
      <div className="px-8 py-6">
        {!selectedRun ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
              <path d="M9 2v6L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2l-6-12V2" />
              <path d="M8 2h8" />
            </svg>
            <p className="text-sm">Pilih salah satu baris di atas untuk melihat rincian skor tiap kriteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Rincian Skor — {selectedRun.output_json?.cand_id || 'Kandidat'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRun.output_json?.job_id || 'Posisi'} · {formatDate(selectedRun.created_at)}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${scoreBadgeClasses(finalScore)}`}>
                Skor Akhir: {finalScore}
              </div>
            </div>

            {selectedRun.output_json?.summary && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 mb-4 text-sm text-slate-700">
                {selectedRun.output_json.summary}
              </div>
            )}

            <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">Kriteria</th>
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Kategori</th>
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Bobot</th>
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Skor</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((s, i) => {
                    const isPref = (s.kategori || '').toLowerCase().includes('tambah');
                    return (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-slate-800 font-medium align-top">{s.tag || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap align-top">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${isPref ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>
                            {s.kategori || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap align-top">{s.weight ?? '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap align-top">
                          <span className={`inline-flex items-center justify-center min-w-[42px] px-2 py-0.5 rounded-lg border text-xs font-bold ${scoreBadgeClasses(s.score_evaluate || 0)}`}>
                            {s.score_evaluate ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 align-top">{s.evidence || '-'}</td>
                      </tr>
                    );
                  })}
                  {scores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">Tidak ada data skor kriteria pada hasil ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
