import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SandboxKonfigurasi() {
  const [apiKey, setApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [models, setModels] = useState([]);
  const [openaiModels, setOpenaiModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configId, setConfigId] = useState(null);
  const [concurrentLimit, setConcurrentLimit] = useState(5);
  const [activeProvider, setActiveProvider] = useState('gemini'); // 'gemini' | 'openai'

  const defaultPromptJD = `Berdasarkan teks mentah dari Job Description berikut, hasilkan Kriteria Penilaian yang komprehensif dan kembalikan sesuai format JSON yang diminta. Pastikan kriteria yang dibuat relevan, spesifik, dan dapat diukur.`;
  const defaultPromptCV = `Berdasarkan dokumen CV berikut, ekstrak informasi pribadi, pengalaman kerja, pendidikan, dan keahlian yang relevan.`;
  const defaultPromptScoring = `Berdasarkan data CV Kandidat dan Kriteria Penilaian, hitung kecocokan (scoring) dan berikan analisa mendalam. Kembalikan hasil dalam format JSON sesuai skema yang diminta.`;
  const defaultPromptBuatLowonganTanya = `Kamu adalah Luna, pewawancara yang membantu pemilik usaha kecil menyusun lowongan pekerjaan lewat obrolan singkat. Berdasarkan riwayat jawaban sejauh ini, ajukan SATU pertanyaan berikutnya yang paling relevan untuk melengkapi gambaran posisi yang mau direkrut (tugas harian, jam kerja, gaji, kriteria kandidat, lokasi usaha, jumlah yang direkrut, dsb). Pertanyaan harus singkat, memakai bahasa Indonesia sehari-hari (bukan bahasa korporat), dan tidak mengulang topik yang sudah ditanyakan. Kembalikan hasil dalam format JSON sesuai skema yang diminta.`;
  const defaultPromptBuatLowonganDraft = `Berdasarkan seluruh riwayat jawaban pengguna atas pertanyaan panduan, susun draf lowongan pekerjaan yang lengkap dan rapi: judul posisi, detail (level jabatan, ikatan kerja, lokasi, jumlah rekrut, upah, pendidikan minimal, pengalaman minimal), deskripsi peran, tanggung jawab, kualifikasi, dan nilai tambah (dalam bentuk poin-poin). Tulis dengan bahasa Indonesia yang sederhana dan jujur, sesuai jawaban yang diberikan — jangan mengarang detail yang tidak disebutkan. Sertakan juga satu "catatan dari Luna": tips praktis dan singkat terkait posisi ini, berdasarkan pola umum perekrutan untuk peran sejenis. Kembalikan hasil dalam format JSON sesuai skema yang diminta.`;

  const [configs, setConfigs] = useState({
    JD: { model: '', model_openai: '', prompt: defaultPromptJD, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
    CV: { model: '', model_openai: '', prompt: defaultPromptCV, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
    Scoring: { model: '', model_openai: '', prompt: defaultPromptScoring, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
    BuatLowonganTanya: { model: '', model_openai: '', prompt: defaultPromptBuatLowonganTanya, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
    BuatLowonganDraft: { model: '', model_openai: '', prompt: defaultPromptBuatLowonganDraft, use_flex: false, temperature: 0.2, reasoning_effort: 'low' }
  });

  // Kolom model yang relevan tergantung provider aktif (prompt/use_flex/temperature tetap dishare)
  const modelField = activeProvider === 'openai' ? 'model_openai' : 'model';

  useEffect(() => {
    const fetchSavedConfig = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('sandbox_configs')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          const config = data[0];
          setConfigId(config.id);
          setApiKey(config.api_key);
          setOpenaiApiKey(config.openai_api_key || '');
          if (config.active_provider) setActiveProvider(config.active_provider);
          if (config.concurrent_limit) setConcurrentLimit(config.concurrent_limit);

          // Fetch prompt settings from the new table
          const { data: psData, error: psError } = await supabase.from('prompt_settings').select('*');
          let fallbackModel = '';
          let fallbackOpenaiModel = '';
          if (!psError && psData) {
            const newConfigs = {
              JD: { model: '', model_openai: '', prompt: defaultPromptJD, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
              CV: { model: '', model_openai: '', prompt: defaultPromptCV, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
              Scoring: { model: '', model_openai: '', prompt: defaultPromptScoring, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
              BuatLowonganTanya: { model: '', model_openai: '', prompt: defaultPromptBuatLowonganTanya, use_flex: false, temperature: 0.2, reasoning_effort: 'low' },
              BuatLowonganDraft: { model: '', model_openai: '', prompt: defaultPromptBuatLowonganDraft, use_flex: false, temperature: 0.2, reasoning_effort: 'low' }
            };
            psData.forEach(ps => {
              if (ps.type === 'JD' || ps.type === 'CV' || ps.type === 'Scoring' || ps.type === 'BuatLowonganTanya' || ps.type === 'BuatLowonganDraft') {
                let defaultPsPrompt = defaultPromptJD;
                if (ps.type === 'CV') defaultPsPrompt = defaultPromptCV;
                if (ps.type === 'Scoring') defaultPsPrompt = defaultPromptScoring;
                if (ps.type === 'BuatLowonganTanya') defaultPsPrompt = defaultPromptBuatLowonganTanya;
                if (ps.type === 'BuatLowonganDraft') defaultPsPrompt = defaultPromptBuatLowonganDraft;

                newConfigs[ps.type] = {
                  model: ps.model || '',
                  model_openai: ps.model_openai || '',
                  prompt: ps.prompt || defaultPsPrompt,
                  use_flex: ps.use_flex || false,
                  temperature: ps.temperature !== null ? ps.temperature : 0.2,
                  reasoning_effort: ps.reasoning_effort || 'low'
                };
              }
            });
            setConfigs(newConfigs);
            if (newConfigs.JD.model) fallbackModel = newConfigs.JD.model;
            else if (newConfigs.CV.model) fallbackModel = newConfigs.CV.model;
            else if (newConfigs.Scoring.model) fallbackModel = newConfigs.Scoring.model;

            if (newConfigs.JD.model_openai) fallbackOpenaiModel = newConfigs.JD.model_openai;
            else if (newConfigs.CV.model_openai) fallbackOpenaiModel = newConfigs.CV.model_openai;
            else if (newConfigs.Scoring.model_openai) fallbackOpenaiModel = newConfigs.Scoring.model_openai;
          }

          if (fallbackModel) {
            setModels([{ name: fallbackModel, displayName: fallbackModel.replace('models/', '') + ' (Saved)' }]);
          }
          if (fallbackOpenaiModel) {
            setOpenaiModels([{ name: fallbackOpenaiModel, displayName: fallbackOpenaiModel + ' (Saved)' }]);
          }

          // Otomatis fetch models Gemini untuk api key ini
          setLoadingModels(true);
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.api_key}`);
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error?.message || `Gagal mengambil model dari Google API (Status: ${response.status})`);
            }
            const resData = await response.json();
            const availableModels = (resData.models || []).filter(m => {
              const name = m.name.toLowerCase();
              // Hanya ambil varian Flash-Lite (tier termurah Gemini)
              return name.includes('gemini') && name.includes('flash-lite');
            });

            const savedModels = Object.values(configs).map(c => c.model).filter(Boolean);
            savedModels.forEach(mName => {
              if (!availableModels.some(m => m.name === mName)) {
                availableModels.unshift({ name: mName, displayName: mName.replace('models/', '') + ' (Saved)' });
              }
            });

            setModels(availableModels);
          } catch (fetchErr) {
            console.error('Error fetching models:', fetchErr);
            setError(`Gagal memuat daftar model AI: ${fetchErr.message}`);
          } finally {
            setLoadingModels(false);
          }

          // Otomatis fetch models OpenAI kalau key-nya sudah pernah diisi
          if (config.openai_api_key) {
            try {
              const oaModels = await fetchOpenAIModelList(config.openai_api_key);
              const savedOaModels = Object.values(configs).map(c => c.model_openai).filter(Boolean);
              savedOaModels.forEach(mName => {
                if (!oaModels.some(m => m.name === mName)) {
                  oaModels.unshift({ name: mName, displayName: mName + ' (Saved)' });
                }
              });
              setOpenaiModels(oaModels);
            } catch (fetchErr) {
              console.error('Error fetching OpenAI models on load:', fetchErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load sandbox config:', err.message);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchSavedConfig();
  }, []);

  // Daftar model OpenAI diambil langsung dari browser (client-side). Perlu diingat:
  // OpenAI tidak mengizinkan CORS untuk request langsung dari browser, jadi panggilan ini
  // kemungkinan besar akan gagal kena CORS kecuali di-proxy lewat backend/edge function.
  const fetchOpenAIModelList = async (key) => {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP Error ${response.status}: Gagal mengambil model OpenAI`);
    }
    const data = await response.json();
    return (data.data || [])
      // Hanya ambil varian "nano" (tier termurah) dari keluarga gpt-5 ke atas
      // (mis. gpt-5-nano, gpt-5.4-nano) — gpt-4.1-nano di-exclude karena bukan
      // reasoning model, jadi punya perilaku (dan parameter) berbeda dari
      // model gpt-5+ yang kita target di sandbox ini.
      .filter(m => {
        const match = m.id.match(/^gpt-(\d+(?:\.\d+)?)-nano$/i);
        return match && parseFloat(match[1]) >= 5;
      })
      .map(m => ({ name: m.id, displayName: m.id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchModels = async () => {
    if (activeProvider === 'openai') {
      if (!openaiApiKey) {
        setError('Mohon masukkan API Key OpenAI terlebih dahulu.');
        return;
      }
      setLoadingModels(true);
      setError('');
      try {
        const availableModels = await fetchOpenAIModelList(openaiApiKey);
        const savedModels = Object.values(configs).map(c => c.model_openai).filter(Boolean);
        savedModels.forEach(mName => {
          if (!availableModels.some(m => m.name === mName)) {
            availableModels.unshift({ name: mName, displayName: mName + ' (Saved)' });
          }
        });
        setOpenaiModels(availableModels);
        if (availableModels.length === 0) {
          throw new Error('API key valid, tetapi tidak ada model yang ditemukan.');
        }
      } catch (err) {
        setError(`Error: ${err.message}${/Failed to fetch/i.test(err.message) ? ' (kemungkinan diblokir CORS oleh OpenAI — panggilan langsung dari browser belum didukung, perlu proxy backend)' : ''}`);
      } finally {
        setLoadingModels(false);
      }
      return;
    }

    if (!apiKey) {
      setError('Mohon masukkan API Key Gemini terlebih dahulu.');
      return;
    }
    setLoadingModels(true);
    setError('');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP Error ${response.status}: Gagal mengambil model`);
      }
      const data = await response.json();

      const availableModels = (data.models || []).filter(m => {
        const name = m.name.toLowerCase();
        // Hanya ambil varian Flash-Lite (tier termurah Gemini)
        return name.includes('gemini') && name.includes('flash-lite');
      });

      const savedModels = Object.values(configs).map(c => c.model).filter(Boolean);
      savedModels.forEach(mName => {
        if (!availableModels.some(m => m.name === mName)) {
          availableModels.unshift({ name: mName, displayName: mName.replace('models/', '') + ' (Saved)' });
        }
      });

      setModels(availableModels);
      if (availableModels.length === 0) {
        throw new Error('API key valid, tetapi tidak ada model yang ditemukan.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey && !openaiApiKey) {
      setError('Mohon lengkapi minimal satu API Key (Gemini atau OpenAI).');
      return;
    }
    setIsSaving(true);
    setError('');

    try {
      let dbError;

      // Update global API Key & Concurrent Limit
      if (configId) {
        const { error } = await supabase.from('sandbox_configs').update({ api_key: apiKey, openai_api_key: openaiApiKey, active_provider: activeProvider, concurrent_limit: concurrentLimit, updated_at: new Date().toISOString() }).eq('id', configId);
        dbError = error;
      } else {
        const { data, error } = await supabase.from('sandbox_configs').insert([{ api_key: apiKey, openai_api_key: openaiApiKey, active_provider: activeProvider, concurrent_limit: concurrentLimit, updated_at: new Date().toISOString() }]).select();
        dbError = error;
        if (data && data.length > 0) setConfigId(data[0].id);
      }
      if (dbError) throw dbError;

      // Update prompt_settings
      const upsertPayload = ['JD', 'CV', 'Scoring', 'BuatLowonganTanya', 'BuatLowonganDraft'].map(type => ({
        type,
        model: configs[type].model,
        model_openai: configs[type].model_openai,
        prompt: configs[type].prompt,
        use_flex: configs[type].use_flex,
        temperature: configs[type].temperature,
        reasoning_effort: configs[type].reasoning_effort,
        updated_at: new Date().toISOString()
      }));

      const { error: promptError } = await supabase.from('prompt_settings').upsert(upsertPayload, { onConflict: 'type' });
      if (promptError) throw promptError;

      if (dbError) throw dbError;
      
      setToast({ type: 'success', message: 'Konfigurasi berhasil disimpan!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menyimpan ke database Supabase: ' + err.message });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Konfigurasi Engine AI</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">Atur parameter model AI dan system instruction untuk ruang eksperimen (sandbox) ini. API Key Anda diproses secara lokal di browser dan tidak disimpan di server kami.</p>
      </div>

      {/* Provider Selector */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Provider Aktif</label>
        <div className="flex gap-4 max-w-xl">
          {[
            {
              id: 'gemini',
              name: 'Google Gemini',
              desc: 'Model Gemini Flash-Lite (tier termurah)',
              configured: !!apiKey,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              ),
            },
            {
              id: 'openai',
              name: 'OpenAI',
              desc: 'Model gpt & o-series',
              configured: !!openaiApiKey,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 12l-4 4-4-4M12 8v8" />
                </svg>
              ),
            },
          ].map((p) => {
            const active = activeProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`flex-1 flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150 ${active ? 'bg-orange-50 border-orange-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {p.icon}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${active ? 'text-orange-700' : 'text-slate-800'}`}>{p.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.configured ? 'bg-green-500' : 'bg-slate-300'}`} title={p.configured ? 'API key tersimpan' : 'Belum dikonfigurasi'}></span>
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">{p.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50 flex items-center gap-3">
              <svg className="text-orange-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h3 className="text-base font-bold text-slate-900">Kredensial & Model</h3>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-700">
                  <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>{error}</span>
                </div>
              )}

              {/* API Key Input (tergantung provider aktif) */}
              {activeProvider === 'gemini' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Gemini API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="flex-1 w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                      placeholder="AIzaSyA..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={isLoadingConfig}
                    />
                    <button
                      onClick={fetchModels}
                      disabled={loadingModels || !apiKey || isLoadingConfig}
                      className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-slate-800 text-white shadow hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingModels ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                      )}
                      <span>Sync</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Dapatkan API key secara gratis dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">Google AI Studio</a>.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">OpenAI API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="flex-1 w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                      placeholder="sk-..."
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      disabled={isLoadingConfig}
                    />
                    <button
                      onClick={fetchModels}
                      disabled={loadingModels || !openaiApiKey || isLoadingConfig}
                      className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-slate-800 text-white shadow hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingModels ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                      )}
                      <span>Sync</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Dapatkan API key dari <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">OpenAI Platform</a>. Hanya varian <strong>nano</strong> (tier termurah, mis. gpt-5-nano) yang ditampilkan. Catatan: sync bisa gagal karena kebijakan CORS OpenAI untuk panggilan langsung dari browser.</p>
                </div>
              )}

              {/* Concurrent Limit Slider */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-sm font-semibold text-slate-700">Batas Paralel Upload CV: <span className="text-orange-600 ml-1">{concurrentLimit} File Bersamaan</span></label>
                <input 
                  type="range" 
                  min="5" max="25" step="5" 
                  value={concurrentLimit}
                  onChange={(e) => setConcurrentLimit(Number(e.target.value))}
                  className="w-full mt-2 accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 px-1 font-medium">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Atur batas unggahan CV berbarengan untuk memaksimalkan kecepatan tanpa terpotong rate limit.</p>
              </div>
            </div>
          </div>

          {/* JD, CV, Scoring, dan Buat Lowongan (Tanya + Draft) Config Cards loop */}
          {['JD', 'CV', 'Scoring', 'BuatLowonganTanya', 'BuatLowonganDraft'].map((type) => {
            const config = configs[type];
            let title = '';
            let desc = '';
            let defaultPromptForType = '';

            if (type === 'JD') {
              title = 'Konfigurasi Generate Kriteria Penilaian (JD)';
              desc = 'Atur instruksi (prompt) spesifik dan model AI yang digunakan khusus untuk fitur otomatisasi pembuatan Kriteria Penilaian dari Job Description.';
              defaultPromptForType = defaultPromptJD;
            } else if (type === 'CV') {
              title = 'Konfigurasi AI Parsing CV';
              desc = 'Atur instruksi (prompt) spesifik dan model AI yang digunakan khusus untuk fitur ekstraksi data otomatis dari dokumen CV pelamar.';
              defaultPromptForType = defaultPromptCV;
            } else if (type === 'Scoring') {
              title = 'Konfigurasi AI Scoring Kandidat';
              desc = 'Atur instruksi (prompt) spesifik dan model AI yang digunakan untuk menghitung kecocokan kandidat berdasarkan kriteria penilaian.';
              defaultPromptForType = defaultPromptScoring;
            } else if (type === 'BuatLowonganTanya') {
              title = 'Buat Lowongan — Ajukan Pertanyaan';
              desc = 'Atur instruksi (prompt) dan model AI yang dipakai untuk menyusun pertanyaan berikutnya di wizard "Bantuan Luna", berdasarkan riwayat jawaban sejauh ini.';
              defaultPromptForType = defaultPromptBuatLowonganTanya;
            } else {
              title = 'Buat Lowongan — Susun Draf Lowongan';
              desc = 'Atur instruksi (prompt) dan model AI yang dipakai untuk merangkai seluruh jawaban wizard menjadi draf lowongan lengkap di langkah terakhir.';
              defaultPromptForType = defaultPromptBuatLowonganDraft;
            }
            
            const handleConfigChange = (key, value) => {
              setConfigs(prev => ({ ...prev, [type]: { ...prev[type], [key]: value } }));
            };

            return (
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden" key={type}>
                <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50 flex items-center gap-3">
                  <svg className="text-orange-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                </div>
                
                <div className="p-6 flex flex-col gap-6">
                  <p className="text-sm text-slate-500 leading-relaxed -mt-2">
                    {desc} Konfigurasi ini disimpan dengan aman di database.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Pilih Model AI Penilai <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                        value={config[modelField]}
                        onChange={(e) => handleConfigChange(modelField, e.target.value)}
                        disabled={(activeProvider === 'gemini' ? models : openaiModels).length === 0}
                      >
                        <option value="">
                          {(activeProvider === 'gemini' ? models : openaiModels).length === 0
                            ? `-- Sync API Key ${activeProvider === 'gemini' ? 'Gemini' : 'OpenAI'} dulu --`
                            : '-- Pilih Model --'}
                        </option>
                        {(activeProvider === 'gemini' ? models : openaiModels).map((model) => {
                          const rawId = model.name.includes('/') ? model.name.split('/')[1] : model.name;
                          const label = model.displayName && model.displayName !== rawId ? `${model.displayName} (${rawId})` : rawId;
                          return <option key={model.name} value={model.name}>{label}</option>;
                        })}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-semibold text-slate-700">Instruksi AI (Prompt) <span className="text-red-500">*</span></label>
                      <button 
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        onClick={() => handleConfigChange('prompt', defaultPromptForType)}
                      >
                        Reset ke Default
                      </button>
                    </div>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono leading-relaxed" 
                      rows="6"
                      value={config.prompt}
                      onChange={(e) => handleConfigChange('prompt', e.target.value)}
                      placeholder={`Masukkan instruksi khusus untuk parsing ${type}...`}
                    />
                    <p className="text-xs text-slate-500 mt-1">Teks mentah dari dokumen akan otomatis disisipkan di bawah prompt ini saat diproses.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="flex items-center cursor-pointer select-none text-sm font-semibold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={config.use_flex}
                        onChange={(e) => handleConfigChange('use_flex', e.target.checked)}
                        className="w-4 h-4 mr-3 accent-orange-600 cursor-pointer rounded border-slate-300"
                      />
                      Gunakan Flex Mode (Diskon 50%)
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-sm font-semibold text-slate-700">Kreativitas AI (Temperature): <span className="text-orange-600 ml-1">{config.temperature}</span></label>
                    <input 
                      type="range" 
                      min="0" max="2" step="0.1" 
                      value={config.temperature}
                      onChange={(e) => handleConfigChange('temperature', Number(e.target.value))}
                      className="w-full mt-2 accent-orange-600 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 mt-1">Nilai 0 (Tegas/Kaku) hingga 2 (Sangat Kreatif/Acak).</p>
                  </div>

                  {activeProvider === 'openai' && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-sm font-semibold text-slate-700">Reasoning Effort (OpenAI)</label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                          value={config.reasoning_effort}
                          onChange={(e) => handleConfigChange('reasoning_effort', e.target.value)}
                        >
                          <option value="minimal">Minimal</option>
                          <option value="none">None</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="xhigh">X-High</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Mengontrol seberapa dalam model "berpikir" sebelum menjawab — makin rendah, makin cepat &amp; hemat token. <strong>Catatan kompatibilitas:</strong> <code>minimal</code> hanya didukung <code>gpt-5-nano</code>; <code>none</code> hanya didukung <code>gpt-5.4-nano</code>; <code>low</code>/<code>medium</code>/<code>high</code> didukung keduanya; <code>xhigh</code> hanya <code>gpt-5.4-nano</code>. Pilih sesuai model yang dipakai di atas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel / Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white shadow-lg sticky top-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">Mengapa Sandbox?</h3>
            <p className="text-orange-100 text-sm leading-relaxed mb-6">
              Sandbox ini dibuat secara terisolasi dari core dashboard untuk tujuan bereksperimen dengan model-model LLM terbaru tanpa mengganggu basis data utama.
            </p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-sm font-medium text-white">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Aman untuk uji coba prompt
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Client-side execution
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Beralih model secara instan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Single sticky Save bar — satu CTA untuk semua card (Kredensial + JD/CV/Scoring),
          karena handleSave() memang selalu menyimpan semuanya sekaligus dalam satu panggilan. */}
      <div className="sticky bottom-6 z-10 mt-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Menyimpan seluruh pengaturan di halaman ini sekaligus: kredensial API, provider aktif, dan konfigurasi JD/CV/Scoring.
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving || (!apiKey && !openaiApiKey)}
            className="inline-flex items-center justify-center gap-2 shrink-0 font-semibold text-sm px-5 py-2.5 rounded-lg bg-orange-600 text-white shadow hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSaving ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            )}
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-white border-l-4 rounded-xl shadow-xl z-50 animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <div className="shrink-0">
            {toast.type === 'success' ? (
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            ) : (
              <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-bold text-slate-900">{toast.type === 'success' ? 'Berhasil' : 'Gagal'}</div>
            <div className="text-xs text-slate-500">{toast.message}</div>
          </div>
          <button className="ml-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setToast(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </div>
  );
}
