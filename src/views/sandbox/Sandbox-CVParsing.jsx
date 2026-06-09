import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import { normalizeRawText } from '../../utils/parseJobDescManual';
import { generateCVParsing } from '../../utils/generateCVParsing';
import KandidatRingkasan from '../kandidat/Kandidat-Ringkasan.jsx';
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

// ── Upload helper (sama persis dengan Sandbox-Kriteria) ──────────────────────

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

// ── Empty kandidat data untuk empty state ────────────────────────────────────
const EMPTY_KANDIDAT = {
  nama: '', linkedin: '', id: '', gender: '', jurusan: '', universitas: '',
  perusahaan: '', jabatan: '', pengalaman: '', tglLahir: '', domisili: '',
  email: '', phone: '', industri: '', tahunLulus: '', harapanUpah: '', harapanBenefit: '',
};

export default function SandboxCVParsing({ navigate }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName]           = useState('');
  const [uploadStatus, setUploadStatus]   = useState('idle'); // idle | uploading | done
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cvText, setCvText]               = useState('');
  
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useFlexMode, setUseFlexMode] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputJson, setOutputJson] = useState('');
  
  // Mapping ke state form KandidatRingkasan nanti (opsional jika dicolok)
  const [parsedKandidat, setParsedKandidat] = useState(EMPTY_KANDIDAT);
  const [parsedSkills, setParsedSkills] = useState([]);
  const [parsedPengalaman, setParsedPengalaman] = useState([]);
  const [parsedPendidikan, setParsedPendidikan] = useState([]);
  const [parsedSertifikasi, setParsedSertifikasi] = useState([]);

  // Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: configData } = await supabase.from('sandbox_configs').select('api_key').order('updated_at', { ascending: false }).limit(1);
        if (configData && configData.length > 0) setApiKey(configData[0].api_key);

        const { data: promptData } = await supabase.from('prompt_settings').select('*').eq('type', 'CV').limit(1);
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

  const handleGenerateParsing = async () => {
    if (!apiKey || !selectedModel) {
      alert('API Key dan Model AI belum dikonfigurasi. Silakan ke tab Konfigurasi API.');
      return;
    }
    if (!cvText || !cvText.trim()) {
      alert('Teks CV kosong. Unggah dokumen CV terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setLoadingMessage('AI sedang mem-parsing CV...');
    
    try {
      const result = await generateCVParsing({
        cvText: cvText,
        apiKey,
        model: selectedModel,
        prompt: customPrompt,
        useFlexMode,
        temperature
      });

      setOutputJson(result.rawJson);
      
      // Jika ingin mengisi preview (disederhanakan)
      if (result.parsedData) {
        if (result.parsedData.detail_kandidat) {
          const dk = result.parsedData.detail_kandidat;
          const dt = result.parsedData.detail_tambahan || {};
          setParsedKandidat(prev => ({
            ...prev,
            nama: dk.nama_lengkap || '',
            linkedin: dk.linkedin || '',
            gender: dk.gender || '',
            jurusan: dk.jurusan || '',
            universitas: dk.universitas || '',
            perusahaan: dk.perusahaan_saat_ini || '',
            jabatan: dk.jabatan_saat_ini || '',
            pengalaman: dk.pengalaman_kerja_tahun ? String(dk.pengalaman_kerja_tahun) : '',
            tglLahir: dk.tanggal_lahir || '',
            domisili: dk.domisili || '',
            email: dk.email || '',
            phone: dk.no_telpon || '',
            industri: dt.bidang_industri || '',
            tahunLulus: dt.tahun_kelulusan ? String(dt.tahun_kelulusan) : '',
            harapanUpah: dt.harapan_upah ? String(dt.harapan_upah) : '',
            harapanBenefit: dt.harapan_benefit || ''
          }));
        }
        
        // Map keahlian
        if (result.parsedData.keahlian) {
          setParsedSkills(result.parsedData.keahlian);
        }

        // Map pengalaman kerja
        if (result.parsedData.pengalaman_kerja) {
          const mappedPengalaman = result.parsedData.pengalaman_kerja.map(p => ({
            jabatan: p.jabatan || '',
            perusahaan: p.perusahaan || '',
            periode: `${p.start || ''} – ${p.end || 'Sekarang'}`,
            deskripsi: p.deskripsi || []
          }));
          setParsedPengalaman(mappedPengalaman);
        }

        // Map pendidikan
        if (result.parsedData.pendidikan) {
          const mappedPendidikan = result.parsedData.pendidikan.map(p => {
            const gelarArr = [];
            if (p.jenjang) gelarArr.push(p.jenjang);
            if (p.jurusan) gelarArr.push(p.jurusan);
            if (p.gpa) gelarArr.push(`GPA: ${p.gpa}`);

            return {
              institusi: p.institusi || '',
              gelar: gelarArr.join(' - '),
              periode: `${p.start || ''} – ${p.end || 'Sekarang'}`
            };
          });
          setParsedPendidikan(mappedPendidikan);
        }

        // Map sertifikasi
        if (result.parsedData.sertifikasi) {
          const mappedSertifikasi = result.parsedData.sertifikasi.map(s => ({
            judul: s.nama || '',
            penyelenggara: s.penerbit || '',
            periode: `${s.start || ''} – ${s.end || 'Sekarang'}`,
            deskripsi: s.deskripsi || []
          }));
          setParsedSertifikasi(mappedSertifikasi);
        }
      }

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="sp-view" style={{ flex: 1, width: '100%', minHeight: 0, overflowY: 'auto' }}>

      {/* ── Header ── */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="#0977be" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="sp-header-text">
            <h1 className="sp-header-title">CV Parsing</h1>
            <p className="sp-header-subtitle">Unggah CV kandidat untuk diekstrak dan ditampilkan ke profil kandidat secara otomatis.</p>
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
          <p className="sp-upload-title">Unggah CV kandidat untuk diekstrak secara otomatis</p>
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

        {/* Large textarea untuk teks CV */}
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
              height: '320px',
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
            style={{ width: '100%' }}
            onClick={handleGenerateParsing}
            disabled={isGenerating || !cvText.trim()}
          >
            {isGenerating ? (
              <>
                <SpinnerIcon />
                {loadingMessage || 'Memproses...'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Generate CV Parsing with AI
              </>
            )}
          </button>
        </div>

        {/* Output box hasil generate */}
        <div style={{ marginTop: '1.25rem' }}>
          <label className="sp-label" style={{ display: 'block', marginBottom: '8px' }}>
            Output JSON CV Parsing
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

      {/* ── Preview Kandidat Ringkasan ── */}
      <div>
        <div style={{ padding: '20px 30px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7e8799', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Preview
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e2e5ec' }} />
          <span style={{ fontSize: '0.75rem', color: '#abb2c1' }}>Profil Kandidat (Sandbox View)</span>
        </div>
        {/* Render ulang dengan parameter unique key agar trigger mount ulang saat data berubah */}
        <KandidatRingkasan
          key={JSON.stringify(parsedKandidat) + parsedSkills.length}
          kandidat={parsedKandidat}
          hideAIPanel={true}
          initialSkills={parsedSkills}
          initialPengalaman={parsedPengalaman}
          initialPendidikan={parsedPendidikan}
          initialSertifikasi={parsedSertifikasi}
        />
      </div>

    </div>
  );
}
