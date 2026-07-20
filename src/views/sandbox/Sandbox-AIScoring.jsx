import { useState, useRef, useEffect } from 'react';
import { normalizeRawText } from '../../utils/parseJobDescManual';
import { extractTextFromFile } from '../../utils/extractTextFromFile';
import { generateAIScoring } from '../../utils/generateAIScoring';
import { generateAIScoringOpenAI } from '../../utils/generateAIScoringOpenAI';
import { fetchPriceMap, estimateCostIDR, formatRupiah, formatLatencySeconds } from '../../utils/aiPricing';
import KandidatPenilaian from '../kandidat/Kandidat-Penilaian.jsx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'sb-spin 1s linear infinite' }}>
    <path d="M7 2.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 9.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M2.5 7H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 7H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.1 4.1L5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.5 8.5L9.9 9.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.9 4.1L8.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M5.5 8.5L4.1 9.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const DEFAULT_KANDIDAT = {
  nama: 'Kandidat',
  jabatan: 'Posisi',
  alur: 'Terseleksi',
  skor: { level: 'moderate', score: 75 },
};

export default function SandboxAIScoring({ navigate }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cvText, setCvText] = useState('');
  const [kriteriaText, setKriteriaText] = useState('');

  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeProvider, setActiveProvider] = useState('gemini'); // 'gemini' | 'openai'
  const [customPrompt, setCustomPrompt] = useState('');
  const [useFlexMode, setUseFlexMode] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [reasoningEffort, setReasoningEffort] = useState('low');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputJson, setOutputJson] = useState('');
  const [parsedScoring, setParsedScoring] = useState(DEFAULT_KANDIDAT);

  // ── Riwayat AI Scoring (dari ai_usage_history, diisi tiap kali generate) ──
  const HISTORY_PAGE_SIZE = 5;
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [priceMap, setPriceMap] = useState({});

  const fetchHistory = async (page = historyPage) => {
    setLoadingHistory(true);
    try {
      const from = page * HISTORY_PAGE_SIZE;
      const to = from + HISTORY_PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from('ai_usage_history')
        .select('id, created_at, model_used, input_tokens, output_tokens, total_tokens, latency_ms, is_flex_mode, output_json', { count: 'exact' })
        .eq('function_name', 'Generate AI Scoring')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setHistoryList(data || []);
      setHistoryTotal(count || 0);
      setHistoryPage(page);
    } catch (err) {
      console.error('Gagal mengambil riwayat AI Scoring:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchHistory(0); fetchPriceMap().then(setPriceMap); }, []);

  // Ambil config AI terbaru dari DB. Dipanggil baik saat mount maupun tepat
  // sebelum generate — semua tab Sandbox dimount sekaligus dan tidak pernah
  // unmount saat pindah tab, jadi kalau cuma di-fetch sekali di mount,
  // perubahan provider yang disimpan lewat tab Konfigurasi setelahnya tidak
  // akan pernah ke-pick up.
  const fetchConfig = async () => {
    let provider = 'gemini';
    let resolvedApiKey = '';
    let resolvedModel = '';
    let resolvedPrompt = customPrompt;
    let resolvedUseFlex = useFlexMode;
    let resolvedTemperature = temperature;
    let resolvedReasoningEffort = reasoningEffort;

    try {
      const { data: configData } = await supabase.from('sandbox_configs').select('*').order('updated_at', { ascending: false }).limit(1);
      if (configData && configData.length > 0) {
        const config = configData[0];
        provider = config.active_provider === 'openai' ? 'openai' : 'gemini';
        resolvedApiKey = provider === 'openai' ? (config.openai_api_key || '') : (config.api_key || '');
      }

      const { data: promptData } = await supabase.from('prompt_settings').select('*').eq('type', 'Scoring').limit(1);
      if (promptData && promptData.length > 0) {
        const p = promptData[0];
        resolvedModel = provider === 'openai' ? (p.model_openai || '') : (p.model || '');
        if (p.prompt) resolvedPrompt = p.prompt;
        if (p.use_flex !== undefined) resolvedUseFlex = p.use_flex;
        if (p.temperature !== undefined && p.temperature !== null) resolvedTemperature = p.temperature;
        if (p.reasoning_effort) resolvedReasoningEffort = p.reasoning_effort;
      }
    } catch (err) { console.error('Gagal mengambil konfigurasi AI:', err); }

    setActiveProvider(provider);
    setApiKey(resolvedApiKey);
    setSelectedModel(resolvedModel);
    setCustomPrompt(resolvedPrompt);
    setUseFlexMode(resolvedUseFlex);
    setTemperature(resolvedTemperature);
    setReasoningEffort(resolvedReasoningEffort);

    return { provider, apiKey: resolvedApiKey, model: resolvedModel, prompt: resolvedPrompt, useFlexMode: resolvedUseFlex, temperature: resolvedTemperature, reasoningEffort: resolvedReasoningEffort };
  };

  useEffect(() => { fetchConfig(); }, []);

  // Mapping hasil parsedData (scores + summary) ke bentuk yang dipahami
  // KandidatPenilaian. Dipakai baik setelah generate baru maupun saat memuat
  // ulang JSON dari Riwayat, supaya kedua alur konsisten. Pencocokan
  // teks/bobot kriteria memakai `kriteriaText` yang sedang ada di textarea saat
  // ini — untuk item Riwayat lama, ini best-effort karena teks kriteria asli
  // saat generate tidak disimpan di ai_usage_history.
  const applyParsedScoringToPreview = (parsed) => {
    if (!parsed) return;
    const allScores = parsed.scores || [];

    // Teks kriteria yang di-paste bisa berupa array (output Gemini) atau
    // { kriteria: [...] } (output OpenAI, dibungkus karena strict mode
    // mewajibkan root object) — normalisasi keduanya ke array biasa.
    let parsedKriteria = [];
    try {
      const parsedJson = JSON.parse(kriteriaText);
      if (Array.isArray(parsedJson)) parsedKriteria = parsedJson;
      else if (parsedJson && Array.isArray(parsedJson.kriteria)) parsedKriteria = parsedJson.kriteria;
    } catch (e) {
      // Ignore if not a valid JSON
    }

    const mappedReq = [];
    const mappedPref = [];
    let totalScore = 0;
    let totalWeight = 0;

    allScores.forEach(item => {
      const w = item.weight || 1;
      const s = item.score_evaluate || 0;

      // Threshold sama persis dengan scoreLevelFromValue() di production
      // (src/views/kandidat/Kandidat-Penilaian.jsx) — sebelumnya beda (>=100
      // untuk "tinggi"), bikin skor 85-95 salah kebaca "sedang" padahal di
      // production itu sudah "tinggi".
      let level = 'none';
      if (s >= 80) level = 'high';
      else if (s >= 50) level = 'moderate';
      else if (s >= 20) level = 'low';

      const matched = parsedKriteria.find(k => k.tag === item.tag) || {};
      const isPref = (item.kategori || matched.kategori || '').toLowerCase().includes('tambah');

      const reqTeks = matched.teks || item.tag || 'Kriteria';
      const reqBobot = matched.bobot ? `Bobot: ${matched.bobot}` : `Point: ${w}`;

      const mappedItem = {
        level,
        name: item.tag || 'Kriteria',
        desc: item.evidence || 'Tidak ada penjelasan',
        req: reqTeks,
        bobot: reqBobot,
        score: s
      };

      if (isPref) {
        mappedPref.push(mappedItem);
      } else {
        mappedReq.push(mappedItem);
        totalScore += (s * w);
        totalWeight += w;
      }
    });

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    setParsedScoring(prev => ({
      ...prev,
      nama: parsed.cand_id || prev.nama,
      jabatan: parsed.job_id || prev.jabatan,
      skor: {
        score: finalScore,
        criteriaData: mappedReq,
        prefData: mappedPref,
        aiSummary: parsed.summary
      }
    }));
  };

  const handleSelectHistory = (row) => {
    setSelectedHistoryId(row.id);
    setOutputJson(JSON.stringify(row.output_json, null, 2));
    applyParsedScoringToPreview(row.output_json);
  };

  const formatHistoryDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleGenerateScoring = async () => {
    if (!cvText || !cvText.trim()) {
      alert('Teks CV kosong. Unggah atau ketik CV terlebih dahulu.');
      return;
    }
    if (!kriteriaText || !kriteriaText.trim()) {
      alert('Teks Kriteria Penilaian kosong. Isi terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setLoadingMessage('Memuat konfigurasi terbaru...');

    const liveConfig = await fetchConfig();

    if (!liveConfig.apiKey || !liveConfig.model) {
      alert(`API Key dan Model AI (${liveConfig.provider === 'openai' ? 'OpenAI' : 'Gemini'}) belum dikonfigurasi. Silakan ke tab Konfigurasi API.`);
      setIsGenerating(false);
      setLoadingMessage('');
      return;
    }

    setLoadingMessage('AI sedang menilai kecocokan...');

    try {
      const generateFn = liveConfig.provider === 'openai' ? generateAIScoringOpenAI : generateAIScoring;
      const result = await generateFn({
        cvText,
        kriteriaText,
        apiKey: liveConfig.apiKey,
        model: liveConfig.model,
        prompt: liveConfig.prompt,
        useFlexMode: liveConfig.useFlexMode,
        temperature: liveConfig.temperature,
        reasoningEffort: liveConfig.reasoningEffort
      });
      setOutputJson(result.rawJson);
      setSelectedHistoryId(null);
      applyParsedScoringToPreview(result.parsedData);

      // Insert ke ai_usage_history di generateAIScoring(OpenAI) adalah fire-and-forget,
      // jadi kasih jeda sebentar sebelum refresh daftar riwayat (kembali ke halaman 1
      // supaya hasil generate yang baru langsung kelihatan).
      setTimeout(() => fetchHistory(0), 800);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(10);
    setLoadingMessage('Mengekstrak teks CV...');

    try {
      const raw = await extractTextFromFile(file);
      const normalized = normalizeRawText(raw);
      setCvText(normalized);
      setUploadProgress(100);
      setLoadingMessage('Ekstraksi selesai!');
      setTimeout(() => setUploadStatus('done'), 500);
    } catch (err) {
      console.error(err);
      alert('Gagal membaca file: ' + err.message);
      setUploadStatus('idle');
      setUploadProgress(0);
    }

    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M16 12l-4 4-4-4M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Scoring</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Unggah CV kandidat untuk dinilai secara otomatis oleh AI berdasarkan kriteria penilaian yang telah dikonfigurasi.</p>
          </div>
        </div>
      </div>

      {/* ── Riwayat AI Scoring ── */}
      <div className="px-8 py-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Riwayat AI Scoring</h2>
            <p className="text-xs text-slate-500 mt-0.5">Klik salah satu baris untuk memuat kembali hasil JSON-nya ke box Output JSON di bawah.</p>
          </div>
          <button
            onClick={() => fetchHistory(historyPage)}
            disabled={loadingHistory}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <svg className={loadingHistory ? 'animate-spin' : ''} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
            Refresh
          </button>
        </div>

        <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Waktu</th>
                <th className="text-left px-4 py-2.5 font-semibold">Ringkasan</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Model</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Token</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Estimasi Biaya</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Latensi</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Flex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyList.map(row => {
                const summary = row.output_json?.summary;
                const active = selectedHistoryId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleSelectHistory(row)}
                    className={`cursor-pointer transition-colors ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatHistoryDate(row.created_at)}</td>
                    <td className="px-4 py-2.5 text-slate-800 max-w-md truncate" title={summary || ''}>
                      {summary ? (summary.length > 90 ? summary.slice(0, 90) + '…' : summary) : <span className="text-slate-400 italic font-normal">Tidak ada ringkasan</span>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{(row.model_used || '-').replace('models/', '')}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{row.total_tokens ?? '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatRupiah(estimateCostIDR(row, priceMap))}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatLatencySeconds(row.latency_ms)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {row.is_flex_mode ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-semibold">Flex</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {historyList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-sm">
                    {loadingHistory ? 'Memuat riwayat...' : 'Belum ada riwayat AI Scoring.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {historyTotal > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">
              Menampilkan {historyPage * HISTORY_PAGE_SIZE + 1}–{Math.min(historyTotal, historyPage * HISTORY_PAGE_SIZE + historyList.length)} dari {historyTotal} riwayat
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchHistory(historyPage - 1)}
                disabled={loadingHistory || historyPage === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Sebelumnya
              </button>
              <span className="text-xs text-slate-500 font-medium px-1">
                Halaman {historyPage + 1} dari {Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE))}
              </span>
              <button
                onClick={() => fetchHistory(historyPage + 1)}
                disabled={loadingHistory || (historyPage + 1) * HISTORY_PAGE_SIZE >= historyTotal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Upload + Text Box ── */}
      <div className="p-8 border-b border-slate-200/60">

        {/* Upload Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-4">Unggah CV kandidat untuk diekstrak dan dinilai secara otomatis</p>
          <div>
            <div className="flex items-center gap-4 mb-3">
              <button
                className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all ${uploadStatus === 'uploading' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-orange-600 text-white shadow hover:bg-orange-700 active:scale-[0.98]'}`}
                onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
              >
                Unggah CV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadStatus === 'idle' && (
                <span className="text-sm text-slate-400 italic">Belum ada file terpilih</span>
              )}
              {uploadStatus === 'uploading' && (
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs font-semibold text-orange-600 mb-1">
                    <span>{loadingMessage || 'Mengunggah...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              {uploadStatus === 'done' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium rounded-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>{fileName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <p>Mendukung file: PDF, DOC, DOCX, TXT</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p>Ukuran maksimal 10 Mb</p>
            </div>
          </div>
        </div>

        {/* Textarea teks CV */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Teks CV</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all leading-relaxed"
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            placeholder="Teks CV akan muncul di sini setelah file diunggah, atau ketik/paste langsung..."
            style={{ height: '240px', resize: 'vertical' }}
          />
        </div>

        {/* Textarea Kriteria Penilaian */}
        <div className="flex flex-col gap-1.5 mt-6">
          <label className="text-sm font-semibold text-slate-700">Teks Kriteria Penilaian</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all leading-relaxed"
            value={kriteriaText}
            onChange={e => setKriteriaText(e.target.value)}
            placeholder="Ketik atau tempel Kriteria Penilaian di sini (bisa format teks biasa atau JSON dari fitur Kriteria)..."
            style={{ height: '160px', resize: 'vertical' }}
          />
        </div>

        {/* CTA Generate with AI */}
        <div className="mt-8">
          <button
            className="w-full inline-flex items-center justify-center gap-2 font-bold text-base px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            onClick={handleGenerateScoring}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <SpinnerIcon />
                {loadingMessage || 'Memproses...'}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Generate AI Scoring
              </>
            )}
          </button>
        </div>

        {/* Output box JSON */}
        <div className="flex flex-col gap-1.5 mt-8">
          <label className="text-sm font-semibold text-slate-700">Output JSON AI Scoring</label>
          <textarea
            className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono"
            readOnly
            value={outputJson}
            placeholder="Hasil generate AI berupa JSON akan muncul di sini..."
            style={{ height: '280px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* ── Preview KandidatPenilaian (embedded, no overlay) ── */}
      <div className="bg-slate-50/50 pb-8">
        <div className="flex items-center gap-3 px-8 py-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Preview
          </span>
          <div className="flex-1 h-px bg-slate-200/60" />
          <span className="text-xs font-medium text-slate-400">Hasil Penilaian AI (Sandbox View)</span>
        </div>
        <div className="px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <KandidatPenilaian
              key={JSON.stringify(parsedScoring.skor.score)} // Force remount untuk re-trigger animasi gauge chart
              kandidat={parsedScoring}
              onClose={() => { }}
              embedded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
