import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPriceMap, estimateCostIDR, formatRupiah } from '../../utils/aiPricing';
import { normalizeRawText } from '../../utils/parseJobDescManual';
import { extractTextFromFile } from '../../utils/extractTextFromFile';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

const ROW_LIMIT = 8;

function scoreBadgeClasses(score) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 20) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-100 text-slate-500 border-slate-200';
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function DetailPlaceholder({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 border border-slate-200/60 rounded-xl">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2.5 opacity-50">
        <path d="M9 2v6L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2l-6-12V2" />
        <path d="M8 2h8" />
      </svg>
      <p className="text-sm">{text}</p>
    </div>
  );
}

/* ── Kolom simple yang sama untuk ketiga tabel ── */
function SimpleUsageTable({ title, functionName, priceMap, onRowClick, selectedId }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRows = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_usage_history')
        .select('id, created_at, model_used, input_tokens, output_tokens, total_tokens, latency_ms, is_flex_mode, output_json')
        .eq('function_name', functionName)
        .order('created_at', { ascending: false })
        .limit(ROW_LIMIT);
      if (error) throw error;
      setRows(data || []);
    } catch (err) {
      console.error(`Gagal memuat data ${functionName}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <button
          onClick={fetchRows}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
        >
          <svg className={isLoading ? 'animate-spin' : ''} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
        </button>
      </div>

      <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
            <tr>
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Waktu</th>
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Model</th>
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Estimasi Biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => {
              const active = selectedId === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className={`cursor-pointer transition-colors ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{formatDate(row.created_at)}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{(row.model_used || '-').replace('models/', '')}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{formatRupiah(estimateCostIDR(row, priceMap))}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-400 text-sm">
                  {isLoading ? 'Memuat...' : 'Belum ada data.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Detail: rincian skor AI Scoring ── */
function ScoringDetail({ run }) {
  if (!run) return <DetailPlaceholder text="Pilih salah satu baris di tabel AI Scoring untuk melihat rincian skor tiap kriteria." />;

  const scores = run.output_json?.scores || [];
  const wajibScores = scores.filter(s => !(s.kategori || '').toLowerCase().includes('tambah'));
  const totalWeight = wajibScores.reduce((acc, s) => acc + (s.weight || 1), 0);
  const weightedSum = wajibScores.reduce((acc, s) => acc + ((s.score_evaluate || 0) * (s.weight || 1)), 0);
  const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Rincian Skor</h3>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(run.created_at)} · {(run.model_used || '-').replace('models/', '')}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${scoreBadgeClasses(finalScore)}`}>
          Skor Akhir: {finalScore}
        </div>
      </div>

      {run.output_json?.summary && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 mb-4 text-sm text-slate-700">
          {run.output_json.summary}
        </div>
      )}

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-slate-700">Output JSON AI Scoring</label>
        <textarea
          className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono resize-none min-h-[250px]"
          readOnly
          value={JSON.stringify(run.output_json, null, 2)}
        />
      </div>

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
  );
}

/* ── Detail: daftar kriteria hasil Generate Kriteria Penilaian ── */
function KriteriaDetail({ run }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | done
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(10);
    setLoadingMessage('Mengekstrak teks dokumen...');

    try {
      const raw = await extractTextFromFile(file);
      setExtractedText(normalizeRawText(raw));
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

  if (!run) return <DetailPlaceholder text="Pilih salah satu baris di tabel Kriteria Penilaian untuk melihat rincian kriterianya." />;

  const raw = run.output_json;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.kriteria) ? raw.kriteria : []);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Rincian Kriteria</h3>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(run.created_at)} · {(run.model_used || '-').replace('models/', '')}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
          {list.length} kriteria
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Unggah dokumen untuk mengekstrak teksnya</p>
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

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-slate-700">Hasil Ekstraksi Teks Upload</label>
        <textarea
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all leading-relaxed font-mono resize-none"
          value={extractedText}
          onChange={e => setExtractedText(e.target.value)}
          placeholder="Teks akan muncul di sini setelah Anda mengunggah dokumen, atau ketik/paste langsung..."
          style={{ height: '250px' }}
        />
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-slate-700">Output JSON Kriteria Penilaian</label>
        <textarea
          className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono resize-none min-h-[250px]"
          readOnly
          value={JSON.stringify(raw, null, 2)}
        />
      </div>

      <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold">Kriteria</th>
              <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Kategori</th>
              <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Bobot</th>
              <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Point</th>
              <th className="text-left px-4 py-2.5 font-semibold">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((k, i) => {
              const isPref = (k.kategori || '').toLowerCase().includes('tambah');
              return (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-800 font-medium align-top">{k.tag || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${isPref ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>
                      {k.kategori || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap align-top capitalize">{k.bobot || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap align-top">{k.point ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600 align-top">{k.teks || '-'}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">Tidak ada data kriteria pada hasil ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Detail: profil kandidat hasil Generate CV Parsing ── */
function CvParsingDetail({ run }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | done
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(10);
    setLoadingMessage('Mengekstrak teks CV...');

    try {
      const raw = await extractTextFromFile(file);
      setExtractedText(normalizeRawText(raw));
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

  if (!run) return <DetailPlaceholder text="Pilih salah satu baris di tabel CV Parsing untuk melihat hasil ekstraksinya." />;

  const oj = run.output_json || {};
  const kandidat = oj.detail_kandidat || {};
  const tambahan = oj.detail_tambahan || {};
  const fields = [
    ['Nama Lengkap', kandidat.nama_lengkap],
    ['Email', kandidat.email],
    ['No. Telepon', kandidat.no_telpon],
    ['Domisili', kandidat.domisili],
    ['Jabatan Saat Ini', kandidat.jabatan_saat_ini],
    ['Perusahaan Saat Ini', kandidat.perusahaan_saat_ini],
    ['Universitas', kandidat.universitas],
    ['Jurusan', kandidat.jurusan],
    ['Bidang Industri', tambahan.bidang_industri],
    ['Harapan Upah', tambahan.harapan_upah],
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Hasil Ekstraksi CV</h3>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(run.created_at)} · {(run.model_used || '-').replace('models/', '')}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${oj.is_valid_cv === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {oj.is_valid_cv === false ? 'CV Tidak Valid' : 'CV Valid'}
        </div>
      </div>

      {oj.is_valid_cv === false && oj.reason_not_valid && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
          {oj.reason_not_valid}
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Unggah CV untuk mengekstrak teksnya</p>
        <div>
          <div className="flex items-center gap-4 mb-3">
            <button
              className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all ${uploadStatus === 'uploading' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-orange-600 text-white shadow hover:bg-orange-700 active:scale-[0.98]'}`}
              onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
              disabled={uploadStatus === 'uploading'}
            >
              Unggah CV
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

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

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-slate-700">Hasil Ekstraksi Teks Upload</label>
        <textarea
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all leading-relaxed font-mono resize-none"
          value={extractedText}
          onChange={e => setExtractedText(e.target.value)}
          placeholder="Teks akan muncul di sini setelah Anda mengunggah CV, atau ketik/paste langsung..."
          style={{ height: '250px' }}
        />
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-slate-700">Output JSON Hasil Ekstraksi CV</label>
        <textarea
          className="w-full bg-[#1e1e1e] border border-[#333] text-[#d4d4d4] text-[13px] rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono resize-none min-h-[250px]"
          readOnly
          value={JSON.stringify(oj, null, 2)}
        />
      </div>

      <div className="border border-slate-200/60 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {fields.map(([label, value]) => (
              <tr key={label} className="hover:bg-slate-50/60">
                <td className="px-4 py-2.5 text-slate-500 font-medium whitespace-nowrap w-48">{label}</td>
                <td className="px-4 py-2.5 text-slate-800">{value || <span className="text-slate-300 italic">-</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SandboxLabs() {
  const [priceMap, setPriceMap] = useState({});
  const [selectedKriteria, setSelectedKriteria] = useState(null);
  const [selectedCvParsing, setSelectedCvParsing] = useState(null);
  const [selectedScoring, setSelectedScoring] = useState(null);

  useEffect(() => { fetchPriceMap().then(setPriceMap); }, []);

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
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Ringkasan hasil generate AI di Sandbox — Kriteria Penilaian, CV Parsing, dan AI Scoring. Klik salah satu baris untuk lihat rinciannya di bawah.</p>
          </div>
        </div>
      </div>

      {/* 3 tabel sampingan */}
      <div className="px-8 py-6 border-b border-slate-200/60 flex gap-6 items-start">
        <SimpleUsageTable title="Kriteria Penilaian" functionName="Generate Kriteria Penilaian" priceMap={priceMap} onRowClick={setSelectedKriteria} selectedId={selectedKriteria?.id} />
        <SimpleUsageTable title="CV Parsing" functionName="Generate CV Parsing" priceMap={priceMap} onRowClick={setSelectedCvParsing} selectedId={selectedCvParsing?.id} />
        <SimpleUsageTable title="AI Scoring" functionName="Generate AI Scoring" priceMap={priceMap} onRowClick={setSelectedScoring} selectedId={selectedScoring?.id} />
      </div>

      {/* 3 panel rincian, satu per tabel di atas */}
      <div className="px-8 py-6 border-b border-slate-200/60">
        <KriteriaDetail run={selectedKriteria} />
      </div>
      <div className="px-8 py-6 border-b border-slate-200/60">
        <CvParsingDetail run={selectedCvParsing} />
      </div>
      <div className="px-8 py-6">
        <ScoringDetail run={selectedScoring} />
      </div>
    </div>
  );
}
