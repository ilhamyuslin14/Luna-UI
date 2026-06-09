import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SandboxKonfigurasi() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configId, setConfigId] = useState(null);
  const [concurrentLimit, setConcurrentLimit] = useState(5);

  const defaultPromptJD = `Berdasarkan teks mentah dari Job Description berikut, hasilkan Kriteria Penilaian yang komprehensif dan kembalikan sesuai format JSON yang diminta. Pastikan kriteria yang dibuat relevan, spesifik, dan dapat diukur.`;
  const defaultPromptCV = `Berdasarkan dokumen CV berikut, ekstrak informasi pribadi, pengalaman kerja, pendidikan, dan keahlian yang relevan.`;
  const defaultPromptScoring = `Berdasarkan data CV Kandidat dan Kriteria Penilaian, hitung kecocokan (scoring) dan berikan analisa mendalam. Kembalikan hasil dalam format JSON sesuai skema yang diminta.`;
  
  const [configs, setConfigs] = useState({
    JD: { model: '', prompt: defaultPromptJD, use_flex: false, temperature: 0.2 },
    CV: { model: '', prompt: defaultPromptCV, use_flex: false, temperature: 0.2 },
    Scoring: { model: '', prompt: defaultPromptScoring, use_flex: false, temperature: 0.2 }
  });

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
          if (config.concurrent_limit) setConcurrentLimit(config.concurrent_limit);
          
          // Fetch prompt settings from the new table
          const { data: psData, error: psError } = await supabase.from('prompt_settings').select('*');
          let fallbackModel = '';
          if (!psError && psData) {
            const newConfigs = {
              JD: { model: '', prompt: defaultPromptJD, use_flex: false, temperature: 0.2 },
              CV: { model: '', prompt: defaultPromptCV, use_flex: false, temperature: 0.2 },
              Scoring: { model: '', prompt: defaultPromptScoring, use_flex: false, temperature: 0.2 }
            };
            psData.forEach(ps => {
              if (ps.type === 'JD' || ps.type === 'CV' || ps.type === 'Scoring') {
                let defaultPsPrompt = defaultPromptJD;
                if (ps.type === 'CV') defaultPsPrompt = defaultPromptCV;
                if (ps.type === 'Scoring') defaultPsPrompt = defaultPromptScoring;
                
                newConfigs[ps.type] = {
                  model: ps.model || '',
                  prompt: ps.prompt || defaultPsPrompt,
                  use_flex: ps.use_flex || false,
                  temperature: ps.temperature !== null ? ps.temperature : 0.2
                };
              }
            });
            setConfigs(newConfigs);
            if (newConfigs.JD.model) fallbackModel = newConfigs.JD.model;
            else if (newConfigs.CV.model) fallbackModel = newConfigs.CV.model;
            else if (newConfigs.Scoring.model) fallbackModel = newConfigs.Scoring.model;
          }
          
          if (fallbackModel) {
            setModels([{ name: fallbackModel, displayName: fallbackModel.replace('models/', '') + ' (Saved)' }]);
          }

          // Otomatis fetch models untuk api key ini
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
              if (name.includes('gemini')) {
                const match = name.match(/gemini-(\d+\.\d+)/);
                if (match && parseFloat(match[1]) >= 2.5) return true;
              }
              if (name.includes('gemma-4')) return true;
              return false;
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
        }
      } catch (err) {
        console.error('Failed to load sandbox config:', err.message);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchSavedConfig();
  }, []);

  const fetchModels = async () => {
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
        
        // Filter untuk Gemini versi 2.5 ke atas
        if (name.includes('gemini')) {
          const match = name.match(/gemini-(\d+\.\d+)/);
          if (match) {
            const version = parseFloat(match[1]);
            if (version >= 2.5) return true;
          }
        }
        
        // Filter untuk Gemma versi 4 (misal gemma-4-...)
        if (name.includes('gemma-4')) {
          return true;
        }
        
        return false;
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
    if (!apiKey) {
      setError('Mohon lengkapi API Key.');
      return;
    }
    setIsSaving(true);
    setError('');
    
    try {
      let dbError;
      
      // Update global API Key & Concurrent Limit
      if (configId) {
        const { error } = await supabase.from('sandbox_configs').update({ api_key: apiKey, concurrent_limit: concurrentLimit, updated_at: new Date().toISOString() }).eq('id', configId);
        dbError = error;
      } else {
        const { data, error } = await supabase.from('sandbox_configs').insert([{ api_key: apiKey, concurrent_limit: concurrentLimit, updated_at: new Date().toISOString() }]).select();
        dbError = error;
        if (data && data.length > 0) setConfigId(data[0].id);
      }
      if (dbError) throw dbError;

      // Update prompt_settings
      const upsertPayload = ['JD', 'CV', 'Scoring'].map(type => ({
        type,
        model: configs[type].model,
        prompt: configs[type].prompt,
        use_flex: configs[type].use_flex,
        temperature: configs[type].temperature,
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
    <>
      {/* Page Header */}
      <div className="sb-page-header">
        <h2>Konfigurasi Engine AI</h2>
        <p>Atur parameter model AI dan system instruction untuk ruang eksperimen (sandbox) ini. API Key Anda diproses secara lokal di browser dan tidak disimpan di server kami.</p>
      </div>

      {/* Settings Grid */}
      <div className="sb-grid">
        {/* Main Settings Form */}
        <div className="sb-col-main">
          <div className="sb-card">
            <div className="sb-card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h3>Kredensial & Model</h3>
            </div>
            
            <div className="sb-card-body">
              {error && (
                <div className="sb-alert sb-alert-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>{error}</span>
                </div>
              )}

              {/* API Key Input */}
              <div className="sb-form-group">
                <label className="sb-label">Gemini API Key</label>
                <div className="sb-input-group">
                  <input 
                    type="password" 
                    className="sb-input sb-input-flex" 
                    placeholder="AIzaSyA..." 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    disabled={isLoadingConfig}
                  />
                  <button 
                    onClick={fetchModels} 
                    disabled={loadingModels || !apiKey || isLoadingConfig}
                    className="sb-btn sb-btn-dark"
                  >
                    {loadingModels ? (
                      <svg className="sb-spinner" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                    )}
                    <span>Sync</span>
                  </button>
                </div>
                <p className="sb-help-text">Dapatkan API key secara gratis dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.</p>
              </div>

              {/* Concurrent Limit Slider */}
              <div className="sb-form-group" style={{ marginTop: '1.5rem' }}>
                <label className="sb-label">Batas Paralel Upload CV: <span style={{ color: '#0977be', fontWeight: 600 }}>{concurrentLimit} File Bersamaan</span></label>
                <input 
                  type="range" 
                  min="5" max="25" step="5" 
                  value={concurrentLimit}
                  onChange={(e) => setConcurrentLimit(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: '0.5rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px', padding: '0 4px' }}>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                </div>
                <p className="sb-help-text">Atur batas unggahan CV berbarengan untuk memaksimalkan kecepatan tanpa terpotong rate limit.</p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="sb-card-footer">
              <button onClick={handleSave} disabled={isSaving || !apiKey} className="sb-btn sb-btn-primary">
                {isSaving ? (
                  <svg className="sb-spinner" viewBox="0 0 24 24">
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

          {/* JD, CV, and Scoring Config Cards loop */}
          {['JD', 'CV', 'Scoring'].map((type) => {
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
            } else {
              title = 'Konfigurasi AI Scoring Kandidat';
              desc = 'Atur instruksi (prompt) spesifik dan model AI yang digunakan untuk menghitung kecocokan kandidat berdasarkan kriteria penilaian.';
              defaultPromptForType = defaultPromptScoring;
            }
            
            const handleConfigChange = (key, value) => {
              setConfigs(prev => ({ ...prev, [type]: { ...prev[type], [key]: value } }));
            };

            return (
              <div className="sb-card" style={{ marginTop: '2rem' }} key={type}>
                <div className="sb-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <h3>{title}</h3>
                </div>
                
                <div className="sb-card-body">
                  <p className="sb-help-text" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                    {desc} Konfigurasi ini disimpan dengan aman di database.
                  </p>

                  <div className="sb-form-group sb-fade-in">
                    <label className="sb-label">Pilih Model AI Penilai <span className="sb-req">*</span></label>
                    <div className="sb-select-wrapper">
                      <select 
                        className="sb-input sb-select" 
                        value={config.model} 
                        onChange={(e) => handleConfigChange('model', e.target.value)}
                        disabled={models.length === 0}
                      >
                        <option value="">-- Pilih Model --</option>
                        {models.map((model) => (
                          <option key={model.name} value={model.name}>{model.displayName} ({model.name.split('/')[1]})</option>
                        ))}
                      </select>
                      <div className="sb-select-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  <div className="sb-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="sb-label" style={{ marginBottom: 0 }}>Instruksi AI (Prompt) <span className="sb-req">*</span></label>
                      <button 
                        className="sb-btn" 
                        style={{ background: 'transparent', color: '#0977be', border: 'none', padding: 0, fontSize: '0.75rem', height: 'auto', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleConfigChange('prompt', defaultPromptForType)}
                      >
                        Reset ke Default
                      </button>
                    </div>
                    <textarea 
                      className="sb-input" 
                      rows="6"
                      style={{ resize: 'vertical', lineHeight: 1.5 }}
                      value={config.prompt}
                      onChange={(e) => handleConfigChange('prompt', e.target.value)}
                      placeholder={`Masukkan instruksi khusus untuk parsing ${type}...`}
                    />
                    <p className="sb-help-text">Teks mentah dari dokumen akan otomatis disisipkan di bawah prompt ini saat diproses.</p>
                  </div>

                  <div className="sb-form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="sb-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                      <input 
                        type="checkbox" 
                        checked={config.use_flex}
                        onChange={(e) => handleConfigChange('use_flex', e.target.checked)}
                        style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      Gunakan Flex Mode (Diskon 50%)
                    </label>
                  </div>

                  <div className="sb-form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="sb-label">Kreativitas AI (Temperature): <span style={{ color: '#0977be', fontWeight: 600 }}>{config.temperature}</span></label>
                    <input 
                      type="range" 
                      min="0" max="2" step="0.1" 
                      value={config.temperature}
                      onChange={(e) => handleConfigChange('temperature', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', marginTop: '0.5rem' }}
                    />
                    <p className="sb-help-text">Nilai 0 (Tegas/Kaku) hingga 2 (Sangat Kreatif/Acak).</p>
                  </div>
                </div>
                
                <div className="sb-card-footer">
                  <button onClick={handleSave} disabled={isSaving || !apiKey || !config.model} className="sb-btn sb-btn-primary">
                    {isSaving ? (
                      <svg className="sb-spinner" viewBox="0 0 24 24">
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
            );
          })}
        </div>

        {/* Right Panel / Info */}
        <div className="sb-col-side">
          <div className="sb-info-card">
            <div className="sb-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3>Mengapa Sandbox?</h3>
            <p>Sandbox ini dibuat secara terisolasi dari core dashboard untuk tujuan bereksperimen dengan model-model LLM terbaru tanpa mengganggu basis data utama.</p>
            <ul>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Aman untuk uji coba prompt</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Client-side execution</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Beralih model secara instan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast" style={{ borderLeftColor: toast.type === 'error' ? '#ef4444' : '#14b541' }}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b541" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
          </div>
          <div className="toast-text">
            <div className="toast-message">{toast.type === 'success' ? 'Berhasil' : 'Gagal'}</div>
            <div className="toast-sub">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </>
  );
}
