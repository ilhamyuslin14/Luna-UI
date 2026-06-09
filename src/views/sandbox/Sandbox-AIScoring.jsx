import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import { normalizeRawText } from '../../utils/parseJobDescManual';
import { generateAIScoring } from '../../utils/generateAIScoring';
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

async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return await pdfToText(file);
  } else if (ext === 'docx') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          resolve(result.value);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  } else if (ext === 'txt' || ext === 'doc') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  throw new Error('Format file tidak didukung. Harap unggah PDF, DOCX, atau TXT.');
}

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
  const [customPrompt, setCustomPrompt] = useState('');
  const [useFlexMode, setUseFlexMode] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputJson, setOutputJson] = useState('');
  const [parsedScoring, setParsedScoring] = useState(DEFAULT_KANDIDAT);

  // Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: configData } = await supabase.from('sandbox_configs').select('api_key').order('updated_at', { ascending: false }).limit(1);
        if (configData && configData.length > 0) setApiKey(configData[0].api_key);

        const { data: promptData } = await supabase.from('prompt_settings').select('*').eq('type', 'Scoring').limit(1);
        if (promptData && promptData.length > 0) {
          if (promptData[0].model) setSelectedModel(promptData[0].model);
          if (promptData[0].prompt) setCustomPrompt(promptData[0].prompt);
          if (promptData[0].use_flex !== undefined) setUseFlexMode(promptData[0].use_flex);
          if (promptData[0].temperature !== undefined && promptData[0].temperature !== null) {
            setTemperature(promptData[0].temperature);
          }
        }
      } catch (err) { console.error('Gagal mengambil konfigurasi AI:', err); }
    };
    fetchConfig();
  }, []);

  const handleGenerateScoring = async () => {
    if (!apiKey || !selectedModel) {
      alert('API Key dan Model AI belum dikonfigurasi. Silakan ke tab Konfigurasi API.');
      return;
    }
    if (!cvText || !cvText.trim()) {
      alert('Teks CV kosong. Unggah atau ketik CV terlebih dahulu.');
      return;
    }
    if (!kriteriaText || !kriteriaText.trim()) {
      alert('Teks Kriteria Penilaian kosong. Isi terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setLoadingMessage('AI sedang menilai kecocokan...');

    try {
      const result = await generateAIScoring({
        cvText,
        kriteriaText,
        apiKey,
        model: selectedModel,
        prompt: customPrompt,
        useFlexMode,
        temperature
      });
      setOutputJson(result.rawJson);

      const parsed = result.parsedData;
      const allScores = parsed.scores || [];
      
      let parsedKriteria = [];
      try {
        parsedKriteria = JSON.parse(kriteriaText);
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
        
        let level = 'none';
        if (s >= 100) level = 'high';
        else if (s >= 70) level = 'moderate';
        else if (s >= 40) level = 'low';

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
    <div className="sp-view" style={{ flex: 1, width: '100%', minHeight: 0, overflowY: 'auto' }}>

      {/* ── Header ── */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#0977be" strokeWidth="1.8" />
              <path d="M16 12l-4 4-4-4M12 8v8" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sp-header-text">
            <h1 className="sp-header-title">AI Scoring</h1>
            <p className="sp-header-subtitle">Unggah CV kandidat untuk dinilai secara otomatis oleh AI berdasarkan kriteria penilaian yang telah dikonfigurasi.</p>
          </div>
        </div>
        <div className="sp-header-actions">
          <button className="sp-btn-cancel" onClick={() => navigate && navigate('seleksi')}>Kembali</button>
        </div>
      </div>

      {/* ── Upload + Text Box ── */}
      <div style={{ padding: '24px 30px', borderBottom: '1px solid #e2e5ec' }}>

        {/* Upload Card */}
        <div className="sp-upload-card" style={{ marginBottom: '20px' }}>
          <p className="sp-upload-title">Unggah CV kandidat untuk diekstrak dan dinilai secara otomatis</p>
          <div className="sp-upload-inner">
            <div className="sp-upload-row">
              <button
                className={`sp-upload-btn${uploadStatus === 'uploading' ? ' sp-upload-btn-disabled' : ''}`}
                onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
              >
                Unggah CV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {uploadStatus === 'idle' && (
                <span className="sp-upload-empty-text">Belum ada file terpilih</span>
              )}
              {uploadStatus === 'uploading' && (
                <div className="sp-upload-progress-wrapper">
                  <span className="sp-upload-progress-label">{loadingMessage || 'Mengunggah...'}</span>
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

        {/* Textarea teks CV */}
        <div>
          <label className="sp-label" style={{ display: 'block', marginBottom: '8px' }}>
            Teks CV
          </label>
          <textarea
            className="sp-input"
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            placeholder="Teks CV akan muncul di sini setelah file diunggah, atau ketik/paste langsung..."
            style={{
              height: '240px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              padding: '1rem',
              borderRadius: '8px',
            }}
          />
        </div>

        {/* Textarea Kriteria Penilaian */}
        <div style={{ marginTop: '1.25rem' }}>
          <label className="sp-label" style={{ display: 'block', marginBottom: '8px' }}>
            Teks Kriteria Penilaian
          </label>
          <textarea
            className="sp-input"
            value={kriteriaText}
            onChange={e => setKriteriaText(e.target.value)}
            placeholder="Ketik atau tempel Kriteria Penilaian di sini (bisa format teks biasa atau JSON dari fitur Kriteria)..."
            style={{
              height: '160px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              padding: '1rem',
              borderRadius: '8px',
            }}
          />
        </div>

        {/* CTA Generate with AI */}
        <div style={{ marginTop: '1.25rem' }}>
          <button
            className="sb-btn sb-btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Generate AI Scoring
              </>
            )}
          </button>
        </div>

        {/* Output box JSON */}
        <div style={{ marginTop: '1.25rem' }}>
          <label className="sp-label" style={{ display: 'block', marginBottom: '8px' }}>
            Output JSON AI Scoring
          </label>
          <textarea
            className="sp-input"
            readOnly
            value={outputJson}
            placeholder="Hasil generate AI berupa JSON akan muncul di sini..."
            style={{
              height: '280px',
              resize: 'vertical',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.85rem',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1rem',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>

      {/* ── Preview KandidatPenilaian (embedded, no overlay) ── */}
      <div>
        <div style={{ padding: '20px 30px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7e8799', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Preview
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e2e5ec' }} />
          <span style={{ fontSize: '0.75rem', color: '#abb2c1' }}>Hasil Penilaian AI (Sandbox View)</span>
        </div>
        <KandidatPenilaian
          key={JSON.stringify(parsedScoring.skor.score)} // Force remount untuk re-trigger animasi gauge chart
          kandidat={parsedScoring}
          onClose={() => { }}
          embedded={true}
        />
      </div>

    </div>
  );
}
