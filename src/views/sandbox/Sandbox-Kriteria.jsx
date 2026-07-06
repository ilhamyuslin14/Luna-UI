import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import { createClient } from '@supabase/supabase-js';
import { parseJobDescManual, normalizeRawText } from '../../utils/parseJobDescManual';
import { generateKriteria } from '../../utils/generateKriteria';
import { generateKriteriaOpenAI } from '../../utils/generateKriteriaOpenAI';
import { fetchPriceMap, estimateCostIDR, formatRupiah as formatBiayaRupiah, formatLatencySeconds } from '../../utils/aiPricing';
import KriteriaPenilaian from '../../components/KriteriaPenilaian';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M1.5 7.5h15" stroke="#abb2c1" strokeWidth="1.2" />
    <path d="M6 1.5v3M12 1.5v3" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2.5V4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 9.5V11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M2.5 7H4.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 7H11.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.1 4.1L5.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.5 8.5L9.9 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.9 4.1L8.5 5.5" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M5.5 8.5L4.1 9.9" stroke="#abb2c1" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Toolbar icon helpers ────────────────────────────────────────
const IcOrderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="0.5" y="0.5" width="2.5" height="4" rx="0.4" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M0.5 8.5h1.5c.55 0 1 .45 1 1s-.45 1-1 1H0.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcUnorderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <circle cx="1.5" cy="2.5" r="1.3" fill="currentColor"/>
    <circle cx="1.5" cy="8.5" r="1.3" fill="currentColor"/>
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignLeft = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignCenter = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="4" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="10" x2="10.5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignRight = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignJustify = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export default function SandboxKriteria({ navigate }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'done'
  const [uploadProgress, setUploadProgress] = useState(0);

  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeProvider, setActiveProvider] = useState('gemini'); // 'gemini' | 'openai'
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');
  const [useFlexMode, setUseFlexMode] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [reasoningEffort, setReasoningEffort] = useState('low');

  // ── Riwayat Kriteria Penilaian (dari ai_usage_history, diisi tiap kali generate) ──
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
        .select('id, created_at, model_used, input_tokens, output_tokens, total_tokens, latency_ms, is_flex_mode, input_text, output_json', { count: 'exact' })
        .eq('function_name', 'Generate Kriteria Penilaian')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setHistoryList(data || []);
      setHistoryTotal(count || 0);
      setHistoryPage(page);
    } catch (err) {
      console.error('Gagal mengambil riwayat Kriteria Penilaian:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchHistory(0); fetchPriceMap().then(setPriceMap); }, []);

  // Normalisasi output_json dari Riwayat ke bentuk yang dipahami KriteriaPenilaian
  // ({ id, kategori, tag, teks, bobot, point }). Bentuk mentahnya beda antar
  // provider: Gemini menyimpan array kriteria langsung, OpenAI membungkusnya
  // { kriteria: [...] } (wajib root object untuk strict mode OpenAI).
  const normalizeHistoryOutput = (raw) => {
    let arr = raw;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (Array.isArray(raw.kriteria)) arr = raw.kriteria;
      else if (Array.isArray(raw.data)) arr = raw.data;
    }
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => item && (item.teks || item.Teks))
      .map((item, index) => {
        const kategori = (item.kategori || 'Wajib') === 'Nilai Tambah' ? 'Nilai Tambah' : 'Wajib';
        let bobotText = 'sedang';
        const pointNum = Number(item.point || item.Point || item.bobot_angka || 100);
        if (item.bobot && ['tinggi', 'sedang', 'rendah'].includes(item.bobot.toLowerCase())) {
          bobotText = item.bobot.toLowerCase();
        } else {
          if (pointNum >= 150) bobotText = 'tinggi';
          else if (pointNum <= 50) bobotText = 'rendah';
        }
        return {
          id: index + 1,
          kategori,
          tag: String(item.tag || item.Tag || '').trim(),
          teks: String(item.teks || item.Teks || '').trim(),
          bobot: bobotText,
          point: pointNum,
        };
      });
  };

  const handleSelectHistory = (row) => {
    setSelectedHistoryId(row.id);
    setOutputJson(JSON.stringify(row.output_json, null, 2));
    setKriteria(normalizeHistoryOutput(row.output_json));
  };

  const formatHistoryDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

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
      const { data: configData } = await supabase
        .from('sandbox_configs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (configData && configData.length > 0) {
        const config = configData[0];
        provider = config.active_provider === 'openai' ? 'openai' : 'gemini';
        resolvedApiKey = provider === 'openai' ? (config.openai_api_key || '') : (config.api_key || '');
      }

      const { data: promptData } = await supabase
        .from('prompt_settings')
        .select('*')
        .eq('type', 'JD')
        .limit(1);

      if (promptData && promptData.length > 0) {
        const p = promptData[0];
        resolvedModel = provider === 'openai' ? (p.model_openai || '') : (p.model || '');
        if (p.prompt) resolvedPrompt = p.prompt;
        if (p.use_flex !== undefined) resolvedUseFlex = p.use_flex;
        if (p.temperature !== undefined && p.temperature !== null) resolvedTemperature = p.temperature;
        if (p.reasoning_effort) resolvedReasoningEffort = p.reasoning_effort;
      }
    } catch (err) {
      console.error('Gagal mengambil konfigurasi AI:', err);
    }

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

  const [kriteria, setKriteria] = useState([]);
  const [isGeneratingKriteria, setIsGeneratingKriteria] = useState(false);
  const [outputJson, setOutputJson] = useState('');

  const handleGenerateKriteria = async () => {
    if (!form.deskripsi || !form.deskripsi.trim()) {
      alert('Deskripsi pekerjaan kosong. Isi atau parse dokumen terlebih dahulu.');
      return;
    }
    setIsGeneratingKriteria(true);
    setOutputJson('');

    // Selalu re-fetch config di sini supaya provider/model yang baru disimpan
    // di tab Konfigurasi selalu terpakai, bukan state basi hasil mount.
    const liveConfig = await fetchConfig();

    if (!liveConfig.apiKey || !liveConfig.model) {
      alert(`API Key dan Model AI (${liveConfig.provider === 'openai' ? 'OpenAI' : 'Gemini'}) belum dikonfigurasi. Silakan ke tab Konfigurasi API.`);
      setIsGeneratingKriteria(false);
      return;
    }

    try {
      const generateFn = liveConfig.provider === 'openai' ? generateKriteriaOpenAI : generateKriteria;
      const { kriteria: result, rawJson, warning } = await generateFn({
        deskripsi:   form.deskripsi,
        apiKey:      liveConfig.apiKey,
        model:       liveConfig.model,
        prompt:      liveConfig.prompt,
        useFlexMode: liveConfig.useFlexMode,
        temperature: liveConfig.temperature,
        reasoningEffort: liveConfig.reasoningEffort,
      });

      try {
        setOutputJson(JSON.stringify(JSON.parse(rawJson), null, 2));
      } catch (e) {
        setOutputJson(rawJson);
      }
      
      setKriteria(result || []);
      setSelectedHistoryId(null);

      // Insert ke ai_usage_history di generateKriteria(OpenAI) adalah fire-and-forget,
      // jadi kasih jeda sebentar sebelum refresh daftar riwayat (kembali ke halaman 1
      // supaya hasil generate yang baru langsung kelihatan).
      setTimeout(() => fetchHistory(0), 800);

      if (warning) {
        alert('Peringatan: ' + warning);
      }
    } catch (err) {
      console.error('Generate kriteria gagal:', err);
      setOutputJson(JSON.stringify({ error: err.message }, null, 2));
      alert('Gagal generate kriteria: ' + err.message);
    } finally {
      setIsGeneratingKriteria(false);
    }
  };

  const [form, setForm] = useState({
    namaJabatan: '',
    departemen: '',
    lokasi: '',
    statusRekrutmen: '',
    jumlahRekrut: '',
    ikatanKerja: '',
    upahMin: '',
    upahMax: '',
    siklusUpah: '',
    tglMulai: '',
    tglOnboarding: '',
    pendidikan: '',
    pengalaman: '',
    deskripsi: '',
  });

  const [extractedRawText, setExtractedRawText] = useState('');

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const formatRupiah = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? `Rp. ${rupiah}` : '';
  };

  const handleUpah = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: formatRupiah(e.target.value) }));
  };

  const extractTextFromFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return await pdfToText(file);
    } else if (extension === 'docx') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
            resolve(result.value);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } else if (extension === 'txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    } else {
      throw new Error('Format file tidak didukung. Harap unggah PDF, DOCX, atau TXT.');
    }
  };

  const callGeminiAPI = async (text, key, model, overridePrompt, useFlex) => {
    const schema = {
      type: "OBJECT",
      properties: {
        namaJabatan: { type: "STRING", description: "Nama jabatan atau posisi pekerjaan" },
        departemen: { type: "STRING", description: "Departemen. Pilih salah satu dari: Product, Tech, HR, Engineering, Marketing, Finance. Jika tidak ada yang cocok kembalikan string kosong." },
        lokasi: { type: "STRING", description: "Lokasi penempatan kerja" },
        statusRekrutmen: { type: "STRING", description: "Status rekrutmen. Kembalikan 'Rencana' jika tidak disebutkan." },
        jumlahRekrut: { type: "STRING", description: "Jumlah orang yang direkrut. Jika tidak disebutkan kembalikan '1'." },
        ikatanKerja: { type: "STRING", description: "Ikatan kerja. Pilih dari: Waktu Tertentu, Waktu Tidak Tertentu, Freelance, Magang, Part Time, Temporer." },
        upahMin: { type: "STRING", description: "Upah minimum (hanya angka) jika ada" },
        upahMax: { type: "STRING", description: "Upah maksimum (hanya angka) jika ada" },
        siklusUpah: { type: "STRING", description: "Siklus upah. Pilih dari: Jam, Harian, Mingguan, Bulanan, Kwartal, Tahunan. Default 'Bulanan'." },
        pendidikan: { type: "STRING", description: "Minimal pendidikan. Pilih HANYA SALAH SATU dari list: SD/Sederajat, SMP/Sederajat, SMA/SMK/Sederajat, DI/DII/DIII (Diploma), D4/S1 (Sarjana), S2 (Magister), S3 (Doktor). Jika tidak ada di list biarkan kosong." },
        pengalaman: { type: "STRING", description: "Minimal pengalaman kerja dalam hitungan tahun (hanya angka, contoh: '2')." },
        deskripsi: { type: "STRING", description: "Deskripsi pekerjaan lengkap, diubah ke format HTML bersih (gunakan tag <p>, <ul>, <li>, <strong> dsb) yang rapi dan siap dirender." }
      }
    };

    const defaultPrompt = `Ekstrak informasi dari teks deskripsi pekerjaan (Job Description) berikut dan kembalikan sesuai format JSON yang diminta. Jika informasi tidak tersedia di teks mentah, biarkan kosong ('').`;
    const userPrompt = overridePrompt || defaultPrompt;
    const prompt = `${userPrompt}\n\nTeks:\n${text}`;

    const modelId = model.startsWith('models/') ? model : `models/${model}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...(useFlex && { service_tier: 'flex' }),
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: schema,
          temperature: 0.1
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gagal menghubungi API Gemini');
    
    if (data.usageMetadata) {
      const usage = data.usageMetadata;
      supabase.from('ai_usage_history').insert([{
        model_used: model,
        function_name: 'Parsing Job Desc',
        input_tokens: usage.promptTokenCount || 0,
        output_tokens: usage.candidatesTokenCount || 0,
        total_tokens: usage.totalTokenCount || 0
      }]).then(({ error }) => {
        if (error) console.error('Gagal mencatat riwayat AI:', error);
      });
    }

    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) throw new Error('Respon AI kosong');
    
    return JSON.parse(contentText);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!apiKey || !selectedModel) {
      alert('API Key dan Model AI belum dikonfigurasi. Silakan ke tab Konfigurasi API.');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(10);
    setAiLoadingMessage('Mengekstrak teks dokumen...');
    
    try {
      // 1. Ekstrak Teks, langsung normalize untuk tampilan yang bersih
      const rawText = await extractTextFromFile(file);
      setExtractedRawText(normalizeRawText(rawText));
      setUploadProgress(100);
      setAiLoadingMessage('Ekstraksi teks selesai!');
      setTimeout(() => setUploadStatus('done'), 500);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan: ' + err.message);
      setUploadStatus('idle');
      setUploadProgress(0);
    }
    
    e.target.value = '';
  };

  const handleManualParse = () => {
    if (!extractedRawText) return;
    setUploadStatus('uploading');
    setAiLoadingMessage('Memproses manual dengan Regex...');
    setUploadProgress(50);

    setTimeout(() => {
      const parsed = parseJobDescManual(extractedRawText);

      // Format salary fields konsisten dengan flow AI parse
      if (parsed.upahMin) parsed.upahMin = formatRupiah(parsed.upahMin);
      if (parsed.upahMax) parsed.upahMax = formatRupiah(parsed.upahMax);

      setForm(prev => ({ ...prev, ...parsed }));

      setUploadProgress(100);
      setAiLoadingMessage('Ekstraksi Manual Selesai!');
      setTimeout(() => setUploadStatus('done'), 500);
    }, 400);
  };

  const handleAIParse = async () => {
    if (!extractedRawText) return;
    if (!apiKey || !selectedModel) {
      alert('API Key dan Model AI belum dikonfigurasi. Silakan ke tab Konfigurasi API.');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadProgress(40);
    
    try {
      setAiLoadingMessage(useFlexMode ? 'AI sedang memparsing (Flex Mode berjalan)...' : 'AI sedang memparsing kriteria...');
      const extractedData = await callGeminiAPI(extractedRawText, apiKey, selectedModel, customPrompt, useFlexMode);
      setUploadProgress(90);

      const finalData = { ...extractedData };
      if (finalData.upahMin) finalData.upahMin = formatRupiah(finalData.upahMin);
      if (finalData.upahMax) finalData.upahMax = formatRupiah(finalData.upahMax);

      setForm(prev => ({ ...prev, ...finalData }));
      setUploadProgress(100);
      setAiLoadingMessage('Selesai di-parsing oleh AI!');
      setTimeout(() => setUploadStatus('done'), 500);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan AI: ' + err.message);
      setUploadStatus('done');
      setUploadProgress(100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur animate-in fade-in duration-300 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kriteria Penilaian</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Uji coba pembuatan Kriteria Penilaian AI dari Deskripsi Pekerjaan.</p>
          </div>
        </div>
      </div>

      {/* ── Riwayat Kriteria Penilaian ── */}
      <div className="px-8 py-6 border-b border-slate-200/60 flex-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Riwayat Kriteria Penilaian</h2>
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
                <th className="text-left px-4 py-2.5 font-semibold">Deskripsi Pekerjaan</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Model</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Token</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Estimasi Biaya</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Latensi</th>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Flex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyList.map(row => {
                const preview = row.input_text;
                const active = selectedHistoryId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleSelectHistory(row)}
                    className={`cursor-pointer transition-colors ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatHistoryDate(row.created_at)}</td>
                    <td className="px-4 py-2.5 text-slate-800 max-w-md truncate" title={preview || ''}>
                      {preview ? (preview.length > 90 ? preview.slice(0, 90) + '…' : preview) : <span className="text-slate-400 italic font-normal">Tidak ada teks</span>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{(row.model_used || '-').replace('models/', '')}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{row.total_tokens ?? '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatBiayaRupiah(estimateCostIDR(row, priceMap))}</td>
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
                    {loadingHistory ? 'Memuat riwayat...' : 'Belum ada riwayat Kriteria Penilaian.'}
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

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-8 p-8 flex-none overflow-visible">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Upload Card */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-4">Unggah deskripsi pekerjaan untuk mengisi form secara otomatis</p>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <button
                  className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all ${uploadStatus === 'uploading' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-orange-600 text-white shadow hover:bg-orange-700 active:scale-[0.98]'}`}
                  onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                >
                  Unggah Data
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

                {uploadStatus === 'idle' && (
                  <span className="text-sm text-slate-400 italic">Belum ada file terpilih</span>
                )}
                {uploadStatus === 'uploading' && (
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-xs font-semibold text-orange-600 mb-1">
                      <span>{aiLoadingMessage || 'Mengunggah...'}</span>
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

          <p className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mt-4">Detail Posisi</p>

          {/* Nama Jabatan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Nama Jabatan <span className="text-red-500">*</span></label>
            <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="Isi Nama Jabatan" value={form.namaJabatan} onChange={set('namaJabatan')} />
          </div>

          {/* Departemen */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Departemen <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" style={{ color: form.departemen ? '#0f172a' : '#94a3b8' }} value={form.departemen} onChange={set('departemen')}>
                <option value="" disabled>Pilih Departemen</option>
                {['Product', 'Tech', 'HR', 'Engineering', 'Marketing', 'Finance'].map(d => <option key={d} value={d}>{d}</option>)}
                <option value="new">+ Buat Departemen Baru</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronIcon /></span>
            </div>
          </div>

          {/* Lokasi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Lokasi <span className="text-red-500">*</span></label>
            <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="Lokasi Penempatan Kerja" value={form.lokasi} onChange={set('lokasi')} />
          </div>

          {/* Status + Jumlah Rekrut */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Status Rekrutmen <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className="w-full appearance-none bg-slate-50 border border-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" style={{ color: form.statusRekrutmen ? '#0f172a' : '#94a3b8' }} value={form.statusRekrutmen} onChange={set('statusRekrutmen')}>
                  <option value="" disabled>Pilih Status</option>
                  {['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronIcon /></span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Jumlah Rekrut <span className="text-red-500">*</span></label>
              <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" type="number" min="1" placeholder="—" value={form.jumlahRekrut} onChange={set('jumlahRekrut')} />
            </div>
          </div>

          {/* Ikatan Kerja */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Ikatan Kerja <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" style={{ color: form.ikatanKerja ? '#0f172a' : '#94a3b8' }} value={form.ikatanKerja} onChange={set('ikatanKerja')}>
                <option value="" disabled>Pilih Ikatan Kerja</option>
                {['Waktu Tertentu', 'Waktu Tidak Tertentu', 'Freelance', 'Magang', 'Part Time', 'Temporer'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronIcon /></span>
            </div>
          </div>

          {/* Upah Min + Max */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Upah Minimum</label>
              <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="Masukan Nominal" value={form.upahMin} onChange={handleUpah('upahMin')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Upah Maksimum</label>
              <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="Masukan Nominal" value={form.upahMax} onChange={handleUpah('upahMax')} />
            </div>
          </div>

          {/* Siklus Upah */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Siklus Upah <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" style={{ color: form.siklusUpah ? '#0f172a' : '#94a3b8' }} value={form.siklusUpah} onChange={set('siklusUpah')}>
                <option value="" disabled>Pilih Siklus Upah</option>
                {['Jam', 'Harian', 'Mingguan', 'Bulanan', 'Kwartal', 'Tahunan'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronIcon /></span>
            </div>
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal Mulai Rekrutmen</label>
              <div className="relative">
                <input type="date" className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none" placeholder="Pilih Tanggal" value={form.tglMulai} onChange={set('tglMulai')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><CalendarIcon /></span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal Target On-boarding</label>
              <div className="relative">
                <input type="date" className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none" placeholder="Pilih Tanggal" value={form.tglOnboarding} onChange={set('tglOnboarding')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><CalendarIcon /></span>
              </div>
            </div>
          </div>

          <p className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mt-8">Kualifikasi dan Deskripsi Pekerjaan</p>

          {/* Minimal Pendidikan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Minimal Pendidikan <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" style={{ color: form.pendidikan ? '#0f172a' : '#94a3b8' }} value={form.pendidikan} onChange={set('pendidikan')}>
                <option value="" disabled>Pilih Jenjang Minimal</option>
                {['SD/Sederajat', 'SMP/Sederajat', 'SMA/SMK/Sederajat', 'DI/DII/DIII (Diploma)', 'D4/S1 (Sarjana)', 'S2 (Magister)', 'S3 (Doktor)'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronIcon /></span>
            </div>
          </div>

          {/* Minimal Pengalaman */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Minimal Pengalaman Kerja (Tahun) <span className="text-red-500">*</span></label>
            <input className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" type="number" min="0" placeholder="—" value={form.pengalaman} onChange={set('pengalaman')} />
          </div>

          {/* Rich Text Editor */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-semibold text-slate-700">Deskripsi Pekerjaan dan Rincian Syarat &amp; Kualifikasi <span className="text-red-500">*</span></label>
            <div className="flex flex-col flex-1 border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-slate-100/50 flex-wrap">
                <select className="text-sm bg-transparent border-none focus:outline-none cursor-pointer text-slate-700 font-medium" defaultValue="p">
                  <option value="p">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 font-bold" title="Bold" type="button">B</button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 italic font-serif" title="Italic" type="button">I</button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 underline" title="Underline" type="button">U</button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Ordered List" type="button"><IcOrderedList /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Unordered List" type="button"><IcUnorderedList /></button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Align Left" type="button"><IcAlignLeft /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Align Center" type="button"><IcAlignCenter /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Align Right" type="button"><IcAlignRight /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600" title="Justify" type="button"><IcAlignJustify /></button>
              </div>
              <textarea
                className="w-full flex-1 p-4 bg-transparent border-none focus:outline-none text-sm text-slate-900 resize-none min-h-[200px]"
                placeholder="Masukan deskripsi pekerjaan dan Rincian Kualifikasi disini"
                value={form.deskripsi}
                onChange={set('deskripsi')}
              />
            </div>
          </div>
        </div>

        {/* Divider for desktop */}
        <div className="hidden lg:block w-px bg-slate-200" />

        {/* Right Column */}
        <div className="flex-1 flex flex-col">
          {/* Area Teks Mentah (Ekstraksi) */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-bold text-orange-600 border-b-2 border-orange-600 pb-2 mb-2 self-start inline-block">
              Hasil Ekstraksi Teks Mentah (Sandbox View)
            </label>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-md">
              Teks di bawah ini adalah hasil pembacaan murni dari dokumen PDF/Word yang diunggah, belum diproses oleh AI.
            </p>
            <textarea
              className="w-full flex-1 bg-slate-50/80 border border-slate-300 text-slate-800 text-sm rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono resize-none min-h-[300px]"
              readOnly
              placeholder="Hasil teks mentah akan muncul di sini setelah Anda mengunggah dokumen..."
              value={extractedRawText}
            />
            
            <div className="flex gap-4 mt-6">
              <button
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all border ${extractedRawText && uploadStatus !== 'uploading' ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                onClick={handleManualParse}
                disabled={!extractedRawText || uploadStatus === 'uploading'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                Generate Manual (Regex)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Kriteria Penilaian — lebar dibatasi 50% agar sesuai kolom kanan di Seleksi-Ringkasan */}
      <div className="px-8 pb-8 pt-6 border-t border-slate-200/60 bg-slate-50/50">
        <div className="w-full lg:w-1/2">
          <button
            className="w-full inline-flex items-center justify-center gap-2 font-bold text-base px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mb-6 mt-2"
            disabled={isGeneratingKriteria}
            onClick={handleGenerateKriteria}
          >
            {isGeneratingKriteria ? (
              <>
                <SpinnerIcon />
                Sedang Membuat Kriteria...
              </>
            ) : (
              'Generate Kriteria Penilaian'
            )}
          </button>
          
          {/* Output Box JSON (UI Only) */}
          <div className="flex flex-col gap-1.5 mb-8">
            <label className="text-sm font-semibold text-slate-700">Output JSON Kriteria Penilaian</label>
            <textarea
              className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono resize-none min-h-[250px]"
              readOnly
              value={outputJson}
              placeholder="Hasil generate AI berupa JSON akan muncul di sini..."
            />
          </div>

          <KriteriaPenilaian kriteria={kriteria} onChange={setKriteria} isGenerating={isGeneratingKriteria} />
        </div>
      </div>
    </div>
  );
}
