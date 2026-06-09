import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import { createClient } from '@supabase/supabase-js';
import { parseJobDescManual, normalizeRawText } from '../../utils/parseJobDescManual';
import { generateKriteria } from '../../utils/generateKriteria';
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
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');
  const [useFlexMode, setUseFlexMode] = useState(false);
  const [temperature, setTemperature] = useState(0.2);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: configData, error: configError } = await supabase
          .from('sandbox_configs')
          .select('api_key')
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (configData && configData.length > 0) {
          setApiKey(configData[0].api_key);
        }

        const { data: promptData, error: promptError } = await supabase
          .from('prompt_settings')
          .select('*')
          .eq('type', 'JD')
          .limit(1);

        if (promptData && promptData.length > 0) {
          if (promptData[0].model) setSelectedModel(promptData[0].model);
          if (promptData[0].prompt) setCustomPrompt(promptData[0].prompt);
          if (promptData[0].use_flex !== undefined) setUseFlexMode(promptData[0].use_flex);
          if (promptData[0].temperature !== undefined && promptData[0].temperature !== null) {
            setTemperature(promptData[0].temperature);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil konfigurasi AI:', err);
      }
    };
    fetchConfig();
  }, []);

  const [kriteria, setKriteria] = useState([]);
  const [isGeneratingKriteria, setIsGeneratingKriteria] = useState(false);
  const [outputJson, setOutputJson] = useState('');

  const handleGenerateKriteria = async () => {
    if (!apiKey || !selectedModel) {
      alert('API Key dan Model AI belum dikonfigurasi. Silakan ke tab Konfigurasi API.');
      return;
    }
    if (!form.deskripsi || !form.deskripsi.trim()) {
      alert('Deskripsi pekerjaan kosong. Isi atau parse dokumen terlebih dahulu.');
      return;
    }
    setIsGeneratingKriteria(true);
    setOutputJson('');
    try {
      const { kriteria: result, rawJson, warning } = await generateKriteria({
        deskripsi:   form.deskripsi,
        apiKey,
        model:       selectedModel,
        prompt:      customPrompt,
        useFlexMode,
        temperature,
      });
      
      try {
        setOutputJson(JSON.stringify(JSON.parse(rawJson), null, 2));
      } catch (e) {
        setOutputJson(rawJson);
      }
      
      setKriteria(result || []);

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

  const handleSimpan = () => {
    navigate('seleksi');
  };

  return (
    <div className="sp-view" style={{ flex: 1, width: '100%', minHeight: 0, overflowY: 'auto' }}>
      {/* Header Bar */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="#0977be" strokeWidth="1.8" />
              <path d="M8 7h8M8 11h8M8 15h5" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sp-header-text">
            <h1 className="sp-header-title">Setup Penilaian</h1>
            <p className="sp-header-subtitle">Mulai setup penilaian AI untuk role baru. Luna akan membaca Deskripsi Pekerjaan kamu dan menyiapkan kriteria seleksi otomatis.</p>
          </div>
        </div>
        <div className="sp-header-actions">
          <button className="sp-btn-cancel" onClick={() => navigate('seleksi')}>Batal</button>
          <button className="sp-btn-primary" onClick={handleSimpan}>Simpan</button>
        </div>
      </div>

      {/* Body */}
      <div className="sp-body" style={{ flex: 'none', overflow: 'visible' }}>
        {/* Left Column */}
        <div className="sp-col">
          {/* Upload Card */}
          <div className="sp-upload-card">
            <p className="sp-upload-title">Unggah deskripsi pekerjaan untuk mengisi form secara otomatis</p>
            <div className="sp-upload-inner">
              <div className="sp-upload-row">
                <button
                  className={`sp-upload-btn${uploadStatus === 'uploading' ? ' sp-upload-btn-disabled' : ''}`}
                  onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                >
                  Unggah Data
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />

                {uploadStatus === 'idle' && (
                  <span className="sp-upload-empty-text">Belum ada file terpilih</span>
                )}
                {uploadStatus === 'uploading' && (
                  <div className="sp-upload-progress-wrapper">
                    <span className="sp-upload-progress-label">{aiLoadingMessage || 'Mengunggah...'}</span>
                    <div className="sp-upload-progress-track">
                      <div className="sp-upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {uploadStatus === 'done' && (
                  <div className="sp-upload-file-pill">
                    <span className="sp-upload-file-name">{fileName}</span>
                  </div>
                )}
              </div>
              <div className="sp-upload-hint-row">
                <p className="sp-upload-hint">Mendukung file : PDF, DOC, DOCX, TXT</p>
                <div className="sp-upload-hint-dot" />
                <p className="sp-upload-hint">Ukuran file maksimal 10 Mb</p>
              </div>
            </div>
          </div>

          <p className="sp-section-title">Detail Posisi</p>

          {/* Nama Jabatan */}
          <div className="sp-field">
            <label className="sp-label">Nama Jabatan <span className="sp-req">*</span></label>
            <input className="sp-input" placeholder="Isi Nama Jabatan" value={form.namaJabatan} onChange={set('namaJabatan')} />
          </div>

          {/* Departemen */}
          <div className="sp-field">
            <label className="sp-label">Departemen <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.departemen ? '#171e2c' : '#abb2c1' }} value={form.departemen} onChange={set('departemen')}>
                <option value="" disabled>Pilih Departemen</option>
                {['Product', 'Tech', 'HR', 'Engineering', 'Marketing', 'Finance'].map(d => <option key={d} value={d}>{d}</option>)}
                <option value="new">+ Buat Departemen Baru</option>
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Lokasi */}
          <div className="sp-field">
            <label className="sp-label">Lokasi <span className="sp-req">*</span></label>
            <input className="sp-input" placeholder="Lokasi Penempatan Kerja" value={form.lokasi} onChange={set('lokasi')} />
          </div>

          {/* Status + Jumlah Rekrut */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Status Rekrutmen <span className="sp-req">*</span></label>
              <div className="sp-select-wrapper">
                <select className="sp-select" style={{ color: form.statusRekrutmen ? '#171e2c' : '#abb2c1' }} value={form.statusRekrutmen} onChange={set('statusRekrutmen')}>
                  <option value="" disabled>Pilih Status Rekrutmen</option>
                  {['Rencana', 'Aktif', 'Ditahan', 'Selesai', 'Dibatalkan'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="sp-select-icon"><ChevronIcon /></span>
              </div>
            </div>
            <div className="sp-field sp-field-160">
              <label className="sp-label">Jumlah Rekrut (Orang) <span className="sp-req">*</span></label>
              <div className="sp-spinner-wrapper">
                <input className="sp-input" type="number" min="1" placeholder="—" value={form.jumlahRekrut} onChange={set('jumlahRekrut')} />
              </div>
            </div>
          </div>

          {/* Ikatan Kerja */}
          <div className="sp-field">
            <label className="sp-label">Ikatan Kerja <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.ikatanKerja ? '#171e2c' : '#abb2c1' }} value={form.ikatanKerja} onChange={set('ikatanKerja')}>
                <option value="" disabled>Pilih Ikatan Kerja</option>
                {['Waktu Tertentu', 'Waktu Tidak Tertentu', 'Freelance', 'Magang', 'Part Time', 'Temporer'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Upah Min + Max */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Upah Minimum</label>
              <input className="sp-input" placeholder="Masukan Nominal" value={form.upahMin} onChange={handleUpah('upahMin')} />
            </div>
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Upah Maksimum</label>
              <input className="sp-input" placeholder="Masukan Nominal" value={form.upahMax} onChange={handleUpah('upahMax')} />
            </div>
          </div>

          {/* Siklus Upah */}
          <div className="sp-field">
            <label className="sp-label">Siklus Upah <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.siklusUpah ? '#171e2c' : '#abb2c1' }} value={form.siklusUpah} onChange={set('siklusUpah')}>
                <option value="" disabled>Pilih Siklus Upah</option>
                {['Jam', 'Harian', 'Mingguan', 'Bulanan', 'Kwartal', 'Tahunan'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Tanggal */}
          <div className="sp-row">
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Tanggal Mulai Rekrutmen</label>
              <div className="sp-date-wrapper">
                <input type="date" className="sp-input sp-input-date" placeholder="Pilih Tanggal" value={form.tglMulai} onChange={set('tglMulai')} />
                <span className="sp-date-icon"><CalendarIcon /></span>
              </div>
            </div>
            <div className="sp-field sp-field-flex">
              <label className="sp-label">Tanggal Target On-boarding</label>
              <div className="sp-date-wrapper">
                <input type="date" className="sp-input sp-input-date" placeholder="Pilih Tanggal" value={form.tglOnboarding} onChange={set('tglOnboarding')} />
                <span className="sp-date-icon"><CalendarIcon /></span>
              </div>
            </div>
          </div>

          <p className="sp-section-title" style={{ marginTop: '2rem' }}>Kualifikasi dan Deskripsi Pekerjaan</p>

          {/* Minimal Pendidikan */}
          <div className="sp-field">
            <label className="sp-label">Minimal Pendidikan <span className="sp-req">*</span></label>
            <div className="sp-select-wrapper">
              <select className="sp-select" style={{ color: form.pendidikan ? '#171e2c' : '#abb2c1' }} value={form.pendidikan} onChange={set('pendidikan')}>
                <option value="" disabled>Pilih Jenjang Minimal</option>
                {['SD/Sederajat', 'SMP/Sederajat', 'SMA/SMK/Sederajat', 'DI/DII/DIII (Diploma)', 'D4/S1 (Sarjana)', 'S2 (Magister)', 'S3 (Doktor)'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="sp-select-icon"><ChevronIcon /></span>
            </div>
          </div>

          {/* Minimal Pengalaman */}
          <div className="sp-field">
            <label className="sp-label">Minimal Pengalaman Kerja (Tahun) <span className="sp-req">*</span></label>
            <div className="sp-spinner-wrapper">
              <input className="sp-input" type="number" min="0" placeholder="—" value={form.pengalaman} onChange={set('pengalaman')} />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="sp-field sp-field-grow">
            <label className="sp-label">Deskripsi Pekerjaan dan Rincian Syarat &amp; Kualifikasi <span className="sp-req">*</span></label>
            <div className="sp-editor">
              <div className="sd-deskripsi-toolbar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #d1d5dc' }}>
                <select className="sd-deskripsi-style-select" defaultValue="p">
                  <option value="p">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
                <span className="sd-deskripsi-toolbar-sep" />
                <button className="sd-deskripsi-toolbar-btn" title="Bold" type="button"><b>B</b></button>
                <button className="sd-deskripsi-toolbar-btn" title="Italic" type="button"><i>I</i></button>
                <button className="sd-deskripsi-toolbar-btn" title="Underline" type="button"><u>U</u></button>
                <span className="sd-deskripsi-toolbar-sep" />
                <button className="sd-deskripsi-toolbar-btn" title="Ordered List" type="button"><IcOrderedList /></button>
                <button className="sd-deskripsi-toolbar-btn" title="Unordered List" type="button"><IcUnorderedList /></button>
                <span className="sd-deskripsi-toolbar-sep" />
                <button className="sd-deskripsi-toolbar-btn" title="Align Left" type="button"><IcAlignLeft /></button>
                <button className="sd-deskripsi-toolbar-btn" title="Align Center" type="button"><IcAlignCenter /></button>
                <button className="sd-deskripsi-toolbar-btn" title="Align Right" type="button"><IcAlignRight /></button>
                <button className="sd-deskripsi-toolbar-btn" title="Justify" type="button"><IcAlignJustify /></button>
              </div>
              <textarea
                className="sp-editor-area"
                placeholder="Masukan deskripsi pekerjaan dan Rincian Kualifikasi disini"
                value={form.deskripsi}
                onChange={set('deskripsi')}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="sp-divider" />

        {/* Right Column */}
        <div className="sp-col">          {/* Area Teks Mentah (Ekstraksi) */}
          <div className="sp-field sp-field-grow" style={{ marginTop: '0' }}>
            <label className="sp-label" style={{ color: '#0977be', borderBottom: '2px solid #0977be', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Hasil Ekstraksi Teks Mentah (Sandbox View)
            </label>
            <p className="sp-help-text" style={{ marginBottom: '1rem', color: '#666' }}>
              Teks di bawah ini adalah hasil pembacaan murni dari dokumen PDF/Word yang diunggah, belum diproses oleh AI.
            </p>
            <textarea
              className="sp-input"
              readOnly
              placeholder="Hasil teks mentah akan muncul di sini setelah Anda mengunggah dokumen..."
              value={extractedRawText}
              style={{ height: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: '#fafafa', color: '#333', padding: '1rem', border: '1px solid #d1d5dc', borderRadius: '8px' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="sp-btn-outline"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', border: '1px solid #d1d5dc', borderRadius: '8px', cursor: extractedRawText ? 'pointer' : 'not-allowed', color: extractedRawText ? '#333' : '#a0a0a0' }}
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
      <div style={{ padding: '0 30px 30px', borderTop: '1px solid #e2e5ec' }}>
        <div style={{ width: '50%' }}>
          <button
            className="sb-btn sb-btn-primary"
            style={{ marginBottom: '1rem', marginTop: '15pt' }}
            disabled={isGeneratingKriteria}
            onClick={handleGenerateKriteria}
          >
            {isGeneratingKriteria ? (
              <>
                <svg className="sb-spinner" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Sedang Membuat Kriteria...
              </>
            ) : (
              'Generate Kriteria Penilaian'
            )}
          </button>
          
          {/* Output Box JSON (UI Only) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="sp-label" style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Output JSON Kriteria Penilaian
            </label>
            <textarea
              className="sp-input"
              readOnly
              value={outputJson}
              placeholder="Hasil generate AI berupa JSON akan muncul di sini..."
              style={{ 
                height: '250px', 
                resize: 'vertical', 
                fontFamily: 'monospace', 
                fontSize: '0.85rem', 
                backgroundColor: '#1e1e1e', 
                color: '#d4d4d4', 
                padding: '1rem', 
                border: '1px solid #333', 
                borderRadius: '6px',
                width: '100%'
              }}
            />
          </div>

          <KriteriaPenilaian kriteria={kriteria} onChange={setKriteria} isGenerating={isGeneratingKriteria} />
        </div>
      </div>
    </div>
  );
}
