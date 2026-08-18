import { useState, useRef, useEffect } from 'react';
import { useUpload } from '../../context/UploadContext.jsx';

const IconSpin = () => (<svg className="msh-scoring-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const IconClose = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);

// Padanan mobile dari bagian "Scoring" di UploadProgressWidget.jsx (desktop)
// — nampilin proses penilaian AI buat kandidat yang di-enqueue LANGSUNG
// (bukan lewat alur Unggah CV yang sudah punya progress detail sendiri):
// bulk "Tambahkan ke Lowongan" di menu Kandidat, dan tab "Pilih Kandidat"
// di Lowongan-detail — dua tempat itu sebelumnya cuma toast sekali lewat
// tanpa progress apapun. Dipasang GLOBAL di MobileApp.jsx (bukan
// per-halaman) supaya tetap kelihatan walau user pindah halaman, sama
// seperti prinsip "proses tidak boleh hilang secara UI" punya alur Unggah
// CV — sumber datanya `scoringQueue` di UploadContext, context yang sama,
// jadi otomatis ke-cover berapa pun titik yang manggil `enqueueScoringJob`.
export default function MobileScoringWidget() {
  const { scoringQueue } = useUpload();
  const [dismissed, setDismissed] = useState(false);
  const autoCloseTimer = useRef(null);
  const prevLen = useRef(0);

  const total = scoringQueue.length;
  const done = scoringQueue.filter(j => j.status === 'done' || j.status === 'error').length;
  const gagal = scoringQueue.filter(j => j.status === 'error').length;
  const isDone = total > 0 && done === total;
  const pct = total > 0 ? (done / total) * 100 : 0;

  useEffect(() => {
    clearTimeout(autoCloseTimer.current);
    if (isDone && !dismissed) {
      autoCloseTimer.current = setTimeout(() => setDismissed(true), 5000);
    }
    return () => clearTimeout(autoCloseTimer.current);
  }, [isDone, dismissed]);

  useEffect(() => {
    if (scoringQueue.length > prevLen.current) setDismissed(false);
    prevLen.current = scoringQueue.length;
  }, [scoringQueue.length]);

  if (total === 0 || dismissed) return null;

  return (
    <div className="msh-scoring-widget">
      <div className="msh-scoring-bar">
        <span className={isDone ? (gagal > 0 ? 'warn' : 'done') : ''} style={{ width: `${pct}%` }} />
      </div>
      <div className="msh-scoring-row">
        <div className={`msh-scoring-icon${isDone ? (gagal > 0 ? ' warn' : ' done') : ''}`}>
          {!isDone ? <IconSpin /> : gagal > 0 ? <IconAlert /> : <IconCheck />}
        </div>
        <div className="msh-scoring-text">
          <div className="msh-scoring-title">
            {isDone
              ? gagal > 0 ? `Penilaian selesai — ${gagal} gagal` : 'Semua penilaian selesai'
              : `Menilai ${done}/${total} kandidat...`}
          </div>
          <div className="msh-scoring-sub">Penilaian AI otomatis</div>
        </div>
        <button className="msh-scoring-close" onClick={() => { clearTimeout(autoCloseTimer.current); setDismissed(true); }}>
          <IconClose />
        </button>
      </div>
    </div>
  );
}
