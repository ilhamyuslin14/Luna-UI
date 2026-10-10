import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import '../../../../css/mobile/getting-started-lowongan.css';

/*
  Prototipe klik-tembus "Getting Started" — dua cabang dari layar Situasi
  Kamu: "Membuka Lowongan Baru" (AI/Form → Sebarkan) dan "Rekrutmen Sedang
  Berjalan" (Form → Menyusun Kriteria → Unggah CV → Hasil Penilaian). Hampir
  semua data & aksi di sini masih dummy/statis — tidak ada panggilan Supabase,
  tidak ada koneksi ke komponen buat-lowongan/unggah-CV asli. Pengecualian:
  nama user & nama perusahaan (disapa di ScreenWelcome/ScreenSebarkan) diambil
  langsung dari useAuth() — bukan dummy lagi, karena ini yang pertama dilihat
  user begitu login. Kedua cabang berujung ke layar Selesai (completeness
  meter) yang sama, lalu keluar ke Beranda ASLI (activeMenu 'beranda_002'
  lewat prop `navigate`) — bukan preview dummy lagi.

  Dirender otomatis sebagai gate di mobile/MobileApp.jsx begitu user login
  dan `lowonganCount` perusahaannya masih 0 (lihat komentar di sana), juga
  tetap bisa diakses langsung lewat /getting-started-lowongan buat keperluan
  development/preview.

  Section "Profil Perusahaan" ada di route terpisah, lihat
  ../getting-started-profil/GettingStartedProfil.jsx.
*/

// Linear untuk bagian sebelum cabang metode (dipakai goBack generik).
// Setelah 'metode', jalur bercabang (wizard AI vs form) lalu ketemu lagi di
// 'draft' — dua step itu dikasih onBack eksplisit sendiri, tidak lewat array
// ini (lihat komentar di goBack).
const STEP_ORDER = ['welcome', 'skenario', 'metode', 'wizard1', 'wizard2', 'sebarkan', 'selesai'];

const STEP_META = {
  skenario: { label: 'Titik Awal Kamu', progress: 1 },
  // Dulu ada layar "Kenalan Yuk" tersendiri di sini (progress 2) — digabung
  // ke ScreenMetode (lihat banner gsl-ai-hint di sana) karena 2 dari 3
  // poinnya sudah terwakili di bullet kartu "Membuka Lowongan Baru" pada
  // ScreenSkenario, jadi kalau dipisah sendiri terasa mengulang.
  metode: { label: 'Mulai Buat Lowongan', progress: 2 },
  wizard1: { progress: 3 },
  wizard2: { progress: 3 },
  formfields: { label: 'Isi Data Lowongan', progress: 4 },
  draft: { label: 'Review & Terbitkan', progress: 4 },
  menerbitkan: { label: 'Menerbitkan Lowongan', progress: 5 },
  sebarkan: { label: 'Sebarkan Lowongannya', progress: 5 },
  // Cabang "Rekrutmen Sedang Berjalan" (ATS) — dipilih di ScreenSkenario
  kenalanAts: { label: 'Kenalan LUNA sebagai ATS', progress: 2 },
  formAts: { label: 'Isi Data Lowongan', progress: 3 },
  menyusunKriteria: { label: 'Menyusun Kriteria', progress: 4 },
  unggahKosong: { label: 'Unggah CV Kandidat', progress: 4 },
  unggahProses: { label: 'Unggah CV Kandidat', progress: 4 },
  unggahSelesai: { label: 'Unggah CV Kandidat', progress: 5 },
  hasilPenilaian: { label: 'Hasil Penilaian', progress: 5 },
};
const TOTAL_STEPS = 5;

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" /></svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.6 6.8-3.8M8.6 13.4l6.8 3.8" /></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.1 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.1 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1l-.1-.2Z" /><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
);
const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5ZM.4 8.5h4.2V23H.4V8.5ZM8.4 8.5h4v2h.06c.56-1.06 1.93-2.18 3.97-2.18 4.24 0 5.02 2.79 5.02 6.42V23h-4.2v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V23H8.4V8.5Z" /></svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const IconRetry = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
);
const IconWaiting = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconRegenerate = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
);

// Contoh ilustratif dipakai di sepanjang wizard (mis. jawaban pre-filled di
// pertanyaan "posisi apa") — tetap statis karena memang belum ada lowongan
// nyata untuk dicontohkan (justru itu kenapa alur ini muncul).
const DUMMY_JOB = 'Content Writer';

export default function GettingStartedLowongan({ navigate, onExit }) {
  // Nama & perusahaan asli dari akun yang sedang login — bukan dummy lagi.
  const { profileName, companyName } = useAuth();
  const displayName = profileName || 'Kamu';
  const displayCompany = companyName || 'perusahaanmu';

  const [step, setStep] = useState('welcome');
  const [method, setMethod] = useState('ai'); // 'ai' | 'form' — dipilih di ScreenMetode, dipakai buat tahu 'draft' & 'sebarkan' harus kembali ke mana
  const [scenario, setScenario] = useState('baru'); // 'baru' | 'lama' — dipilih di ScreenSkenario, menentukan seluruh cabang berikutnya

  const meta = STEP_META[step];
  const showTop = step !== 'welcome' && step !== 'selesai';
  const idx = STEP_ORDER.indexOf(step);
  const goBack = () => {
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  // Skip di layar Selamat Datang: BUKAN ke Beranda langsung, tapi ke alur
  // isi profil perusahaan (rute yang sama dengan "Lengkapi Sekarang" di
  // ScreenSelesai). Tetap tandai flow lowongan ini "sudah dilihat" biar user
  // tidak langsung ke-gate lagi ke sini pas kembali ke Beranda dari sana.
  const skipToProfil = () => { onExit?.(); navigate?.('getting-started-profil'); };

  const chooseSkenario = (chosen) => {
    setScenario(chosen);
    setStep(chosen === 'lama' ? 'kenalanAts' : 'metode');
  };
  const chooseMetode = (chosen) => {
    setMethod(chosen);
    setStep(chosen === 'form' ? 'formfields' : 'wizard1');
  };
  // 'draft' ketemu dari dua jalur berbeda (wizard AI atau form manual) — jadi
  // tombol kembalinya tidak bisa pakai goBack generik (STEP_ORDER linear),
  // harus tahu jalur mana yang tadi dipilih.
  const backFromDraft = () => setStep(method === 'form' ? 'formfields' : 'wizard2');

  return (
    <div className="msh-fullscreen-panel open gsl-panel">
      <div className="gsl-screen" key={step}>
        {showTop && (
          <>
            <div className="gsl-top">
              <span className="gsl-label">{meta?.label || (step === 'wizard1' || step === 'wizard2' ? 'PERTANYAAN' : '')}</span>
            </div>
            {meta?.progress && (
              <div className="gsl-rail"><i style={{ width: `${(meta.progress / TOTAL_STEPS) * 100}%` }} /></div>
            )}
          </>
        )}

        {step === 'welcome' && <ScreenWelcome onNext={() => setStep('skenario')} onSkip={skipToProfil} name={displayName} company={displayCompany} />}
        {step === 'skenario' && <ScreenSkenario onNext={chooseSkenario} />}
        {step === 'metode' && <ScreenMetode onNext={chooseMetode} onBack={goBack} />}
        {step === 'wizard1' && <ScreenWizard1 onNext={() => setStep('wizard2')} onBack={() => setStep('metode')} />}
        {step === 'wizard2' && <ScreenWizard2 onNext={() => setStep('draft')} />}
        {step === 'formfields' && <ScreenFormFields onNext={() => setStep('draft')} onBack={() => setStep('metode')} />}
        {step === 'draft' && (method === 'form'
          ? <ScreenDraftForm onNext={() => setStep('menerbitkan')} onBack={backFromDraft} />
          : <ScreenDraftAi onNext={() => setStep('menerbitkan')} onRestart={() => setStep('wizard1')} onFix={() => setStep('wizard2')} />
        )}
        {step === 'menerbitkan' && <ScreenMenerbitkan onNext={() => setStep('sebarkan')} />}
        {step === 'sebarkan' && <ScreenSebarkan onNext={() => setStep('selesai')} name={displayName} company={displayCompany} />}

        {/* Cabang "Rekrutmen Sedang Berjalan" (ATS) */}
        {step === 'kenalanAts' && <ScreenKenalanAts onNext={() => setStep('formAts')} onBack={() => setStep('skenario')} />}
        {step === 'formAts' && <ScreenFormAts onNext={() => setStep('menyusunKriteria')} onBack={() => setStep('kenalanAts')} />}
        {step === 'menyusunKriteria' && <ScreenMenyusunKriteria onNext={() => setStep('unggahKosong')} />}
        {step === 'unggahKosong' && <ScreenUnggahKosong onNext={() => setStep('unggahProses')} onSkip={skipToProfil} />}
        {step === 'unggahProses' && <ScreenUnggahProses onNext={() => setStep('unggahSelesai')} />}
        {step === 'unggahSelesai' && <ScreenUnggahSelesai onNext={() => setStep('hasilPenilaian')} />}
        {step === 'hasilPenilaian' && <ScreenHasilPenilaian onNext={() => setStep('selesai')} />}

        {step === 'selesai' && <ScreenSelesai scenario={scenario} navigate={navigate} onExit={onExit} />}
      </div>
    </div>
  );
}

/* ── 1. Selamat Datang ── */
function ScreenWelcome({ onNext, onSkip, name, company }) {
  return (
    <div className="gsl-body" style={{ paddingTop: 'calc(28px + env(safe-area-inset-top, 0px))', flex: 1 }}>
      <div>
        <div className="gsl-hi">Halo, {name} 👋</div>
        <h2 className="gsl-wc-h">Selamat bergabung di LUNA, {company}!</h2>
        <p className="gsl-p" style={{ marginTop: 8 }}>Ini akan jadi laman karier resmi kamu begitu lowongan pertama dibuat:</p>
      </div>

      <div className="gsl-browser">
        <div className="gsl-browser-bar">
          <span className="gsl-browser-dot" /><span className="gsl-browser-dot" /><span className="gsl-browser-dot" />
          <span className="gsl-browser-url">https://karir.lunasys.ai/...</span>
        </div>
        <div className="gsl-browser-body">
          <div className="gsl-browser-ic"><IconFile /></div>
          <div className="gsl-browser-t">Belum ada lowongan yang tayang</div>
          <div className="gsl-browser-d">Isi otomatis begitu kamu selesai di langkah berikutnya</div>
        </div>
      </div>

      <div className="gsl-feats">
        <div className="gsl-feat"><div className="gsl-feat-ic"><IconGlobe /></div><span>Portal karier sendiri</span></div>
        <div className="gsl-feat"><div className="gsl-feat-ic"><IconShare /></div><span>Sebar ke banyak kanal</span></div>
        <div className="gsl-feat"><div className="gsl-feat-ic"><IconSparkle /></div><span>ATS: CV dinilai otomatis</span></div>
        <div className="gsl-feat"><div className="gsl-feat-ic"><IconBriefcase /></div><span>Pipeline seleksi kandidat</span></div>
      </div>

      <div className="gsl-reassure">
        <span>5 menit</span><span className="dot" /><span>Gratis sepenuhnya</span><span className="dot" /><span>Bisa lanjut kapan saja</span>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onSkip}>Lewati, jelajah dulu</button>
      </div>
    </div>
  );
}

/* ── 2. Situasi Kamu ── */
function ScreenSkenario({ onNext }) {
  const [pilihan, setPilihan] = useState('baru'); // 'baru' | 'lama' — menentukan jalur berikutnya, dikirim lewat onNext(pilihan)

  return (
    <>
      <div className="gsl-body">
        <div>
          <h2 className="gsl-h2">Kamu ada di tahap mana sekarang?</h2>
          <p className="gsl-p" style={{ marginTop: 8 }}>Biar Luna bisa siapkan langkah yang paling pas buat kamu.</p>
        </div>

        <button type="button" className={`gsl-choice${pilihan === 'baru' ? ' sel' : ''}`} onClick={() => setPilihan('baru')}>
          {pilihan === 'baru' && <span className="gsl-choice-flag">Jalur Ini</span>}
          <div className="gsl-choice-head">
            <div className="gsl-choice-ico"><IconGlobe /></div>
            <div>
              <span className={`gsl-choice-badge${pilihan === 'baru' ? ' on' : ' off'}`}>Dapatkan Kandidat Baru</span>
              <div className="gsl-choice-t">Membuka Lowongan Baru</div>
            </div>
          </div>
          <div className="gsl-choice-d">Buka lowongan baru, sebarkan ke banyak kanal sekaligus, dan kumpulkan kandidat yang paling cocok buat posisi ini.</div>
          <div className="gsl-choice-list">
            <div className="gsl-choice-li"><IconCheck />Dibuat cepat dipandu AI Luna, atau unggah draf JD</div>
            <div className="gsl-choice-li"><IconCheck />Laman karier publik resmi terbit seketika</div>
            <div className="gsl-choice-li"><IconCheck />1-klik sebar ke WhatsApp, LinkedIn &amp; mitra loker</div>
          </div>
        </button>

        <button type="button" className={`gsl-choice${pilihan === 'lama' ? ' sel' : ''}`} onClick={() => setPilihan('lama')}>
          {pilihan === 'lama' && <span className="gsl-choice-flag">Jalur Ini</span>}
          <div className="gsl-choice-head">
            <div className="gsl-choice-ico"><IconFile /></div>
            <div>
              <span className={`gsl-choice-badge${pilihan === 'lama' ? ' on' : ' off'}`}>ATS &amp; Skoring CV</span>
              <div className="gsl-choice-t">Rekrutmen Sedang Berjalan</div>
            </div>
          </div>
          <div className="gsl-choice-d">Saring tumpukan CV yang sudah masuk lebih cepat dibantu AI yang menilai &amp; mengurutkan kandidat paling cocok secara otomatis.</div>
          <div className="gsl-choice-list">
            <div className="gsl-choice-li"><IconCheck />Ekstraksi kriteria otomatis dari file JD</div>
            <div className="gsl-choice-li"><IconCheck />Unggah tumpukan CV pelamar sekaligus (massal)</div>
            <div className="gsl-choice-li"><IconCheck />AI urutkan peringkat pelamar terbaik (&lt; 30 detik)</div>
          </div>
        </button>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={() => onNext(pilihan)}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ══════════════ Cabang "Rekrutmen Sedang Berjalan" (ATS) ══════════════ */

/* ── Kenalan LUNA sebagai ATS (value prop) ── */
function ScreenKenalanAts({ onNext, onBack }) {
  return (
    <>
      <div className="gsl-body gsl-lp">
        <span className="gsl-lp-kicker">LUNA sebagai ATS</span>
        <h2 className="gsl-h2">Seleksi CV kandidat yang lebih terukur dan objektif</h2>
        <p className="gsl-p">Luna membantu memberikan penilaian kecocokan data CV kandidat dengan kebutuhan posisi, sehingga kamu mendapat insight yang tepat dalam memilih kandidat.</p>

        <div>
          <div className="gsl-lp-feat">
            <div className="gsl-lp-feat-ic"><IconFile /></div>
            <div><div className="gsl-lp-feat-t">CV dibaca otomatis</div><div className="gsl-lp-feat-d">Diekstrak jadi data terstruktur — nama, pengalaman, skill.</div></div>
          </div>
          <div className="gsl-lp-feat">
            <div className="gsl-lp-feat-ic"><IconSparkle /></div>
            <div><div className="gsl-lp-feat-t">Dinilai &amp; diurutkan AI</div><div className="gsl-lp-feat-d">Skor kecocokan berbasis bukti nyata dari isi CV.</div></div>
          </div>
        </div>

        <div className="gsl-proof">
          <div className="gsl-proof-row"><div className="gsl-proof-avatar">DK</div><div className="gsl-proof-name">Dinda Kusuma</div><div className="gsl-proof-score">92%</div></div>
          <div className="gsl-proof-row"><div className="gsl-proof-avatar">FR</div><div className="gsl-proof-name">Fajar Ramadhan</div><div className="gsl-proof-score">78%</div></div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onBack}>Kembali</button>
      </div>
    </>
  );
}

/* ── Buat Lowongan (Form, khusus posisi yang sudah berjalan) ── */
function ScreenFormAts({ onNext, onBack }) {
  const [jabatan, setJabatan] = useState(DUMMY_JOB);
  const [lokasi, setLokasi] = useState('Jakarta Selatan');
  const [deskripsi, setDeskripsi] = useState('Kami mencari Content Writer yang bisa menulis copy tajam untuk kampanye digital, mengelola kalender konten, dan berkolaborasi dengan tim desain…');

  return (
    <>
      <div className="gsl-body">
        <div>
          <h2 className="gsl-h2">Isi data lowongan yang sudah berjalan</h2>
          <p className="gsl-p" style={{ marginTop: 6 }}>Sudah punya file JD? Unggah dulu — sisanya kami isikan otomatis.</p>
        </div>

        <div className="gsl-upload-box">
          <div className="gsl-upload-ic"><IconUpload /></div>
          <div><div className="gsl-upload-t">JD_Content_Writer.pdf</div><div className="gsl-upload-d">Terunggah — field di bawah terisi otomatis</div></div>
          <span className="gsl-upload-cta" style={{ color: '#1f8a4e' }}>✓</span>
        </div>
        <div className="gsl-or-divider">atau lengkapi manual</div>

        <div className="gsl-sec-label">Detail Posisi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gsl-field">
            <label>Nama Jabatan <span className="opt">*</span></label>
            <input className="gsl-input" value={jabatan} onChange={e => setJabatan(e.target.value)} />
          </div>
          <div className="gsl-field">
            <label>Level Jabatan</label>
            <button type="button" className="gsl-input"><span>Staff</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Departemen</label>
            <button type="button" className="gsl-input"><span>Content</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Lokasi</label>
            <input className="gsl-input" value={lokasi} onChange={e => setLokasi(e.target.value)} />
          </div>
          <div className="gsl-field">
            <label>Ikatan Kerja</label>
            <button type="button" className="gsl-input"><span>Penuh Waktu</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Jumlah Rekrut</label>
            <input className="gsl-input" defaultValue="1" />
          </div>
        </div>

        <div className="gsl-sec-label">Kompensasi &amp; Jadwal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gsl-field">
            <label>Status Rekrutmen <span className="opt">*</span></label>
            <button type="button" className="gsl-input"><span>Terbuka</span><IconChevronDown /></button>
          </div>
          <div className="gsl-row2">
            <div className="gsl-field"><label>Upah Min</label><input className="gsl-input" defaultValue="Rp 6.000.000" /></div>
            <div className="gsl-field"><label>Upah Maks</label><input className="gsl-input" defaultValue="Rp 9.000.000" /></div>
          </div>
          <div className="gsl-field">
            <label>Siklus Upah</label>
            <button type="button" className="gsl-input"><span>Bulanan</span><IconChevronDown /></button>
          </div>
          <div className="gsl-row2">
            <div className="gsl-field"><label>Tgl Mulai</label><input className="gsl-input" defaultValue="1 Okt 2026" /></div>
            <div className="gsl-field"><label>Target Onboard</label><input className="gsl-input" defaultValue="15 Okt 2026" /></div>
          </div>
          <div className="gsl-field">
            <label>Minimal Pendidikan</label>
            <button type="button" className="gsl-input"><span>S1</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Minimal Pengalaman (Tahun)</label>
            <input className="gsl-input" defaultValue="1" />
          </div>
        </div>

        <div className="gsl-sec-label">Deskripsi Pekerjaan</div>
        <div className="gsl-field">
          <label>Deskripsi <span className="opt">*</span></label>
          <textarea
            className="gsl-txa"
            placeholder="Jelaskan tanggung jawab & kualifikasi posisi ini…"
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
          />
          <div className="gsl-char-hint"><span>Minimal 300 karakter untuk kriteria otomatis</span><b>{deskripsi.length}/300</b></div>
        </div>
        <div className="gsl-progress-track"><div className="gsl-progress-fill" style={{ width: `${Math.min(100, (deskripsi.length / 300) * 100)}%` }} /></div>
        <div className="gsl-ai-hint">
          <IconSparkle />
          <p><b>Kriteria penilaian</b> akan otomatis disusun dari deskripsi ini begitu lowongan diterbitkan — tidak perlu diisi manual.</p>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onBack}>Kembali</button>
      </div>
    </>
  );
}

/* ── Menyusun Kriteria (loading) ── */
// Loading generik 3-step dipakai di dua tempat: ScreenMenyusunKriteria
// (cabang ATS, dummy sejak awal) & ScreenMenerbitkan (cabang lowongan baru,
// dipisah dari sini biar copy-nya bisa beda sesuai konteks masing-masing).
// Fase 1 = step kedua aktif, fase 2 = step kedua selesai & step ketiga aktif,
// lalu otomatis lanjut. Total ~6 detik, tanpa CTA — murni loading.
function ScreenProcessLoading({ onNext, heading, subtext, steps, note }) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 3500);
    const t2 = setTimeout(() => onNext(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onNext]);

  return (
    <div className="gsl-loading-wrap">
      <div className="gsl-loading-badge"><IconSparkle /></div>
      <div>
        <h2 className="gsl-h2">{heading}</h2>
        <p className="gsl-p" style={{ marginTop: 6 }}>{subtext}</p>
      </div>
      <div className="gsl-proc-steps">
        <div className="gsl-proc-step"><div className="gsl-proc-dot done"><IconCheck /></div><div className="gsl-proc-t done">{steps[0]}</div></div>
        <div className="gsl-proc-step">
          <div className={`gsl-proc-dot ${phase >= 2 ? 'done' : 'active'}`}>{phase >= 2 ? <IconCheck /> : null}</div>
          <div className={`gsl-proc-t ${phase >= 2 ? 'done' : 'active'}`}>{steps[1]}</div>
        </div>
        <div className="gsl-proc-step">
          <div className={`gsl-proc-dot ${phase >= 2 ? 'active' : 'pending'}`} />
          <div className={`gsl-proc-t ${phase >= 2 ? 'active' : ''}`}>{steps[2]}</div>
        </div>
      </div>
      <div className="gsl-proc-note">{note}</div>
    </div>
  );
}

function ScreenMenyusunKriteria({ onNext }) {
  return (
    <ScreenProcessLoading
      onNext={onNext}
      heading="Menyusun kriteria penilaian…"
      subtext="Luna sedang membaca deskripsi pekerjaan buat menyusun kriteria penilaian otomatis."
      steps={['Lowongan diterbitkan', 'Menyusun kriteria penilaian', 'Siap menerima & menilai CV']}
      note="Biasanya selesai dalam 15–30 detik — lanjut otomatis begitu siap"
    />
  );
}

// Transisi setelah "Terbitkan Lowongan" di cabang lowongan baru (AI & Form)
// — sebelumnya klik Terbitkan langsung lompat ke ScreenSebarkan tanpa jeda,
// padahal di komponen asli (MobileBuatLowonganQA.jsx step 'publishing') ada
// loading sebelum lowongan benar-benar siap dibagikan. Copy step & catatan
// "±30 detik"-nya disamakan dengan gsl-ai-hint di layar draft.
function ScreenMenerbitkan({ onNext }) {
  return (
    <ScreenProcessLoading
      onNext={onNext}
      heading="Menerbitkan lowonganmu…"
      subtext="Luna sedang menyiapkan laman karier & menyusun kriteria penilaian otomatis."
      steps={['Lowongan diterbitkan', 'Menyusun kriteria penilaian AI', 'Laman karier & link lamar aktif']}
      note="Biasanya selesai dalam 15–30 detik — lanjut otomatis begitu siap"
    />
  );
}

/* ── Unggah CV — kosong ── */
function ScreenUnggahKosong({ onNext, onSkip }) {
  return (
    <>
      <div className="gsl-body">
        <div>
          <h2 className="gsl-h2">Unggah CV kandidat yang telah melamar</h2>
          <p className="gsl-p" style={{ marginTop: 6 }}>Luna membantu menilai kecocokan setiap CV dengan kebutuhan posisi ini. Beberapa file dapat diunggah sekaligus.</p>
        </div>
        <div className="gsl-dropzone">
          <div className="gsl-dropzone-ic"><IconUpload /></div>
          <div className="gsl-dropzone-t">Pilih file CV</div>
          <div className="gsl-dropzone-d">Beberapa file dapat dipilih sekaligus</div>
        </div>
        <div className="gsl-meta-row"><span>PDF, DOC, DOCX, TXT</span><span className="gsl-meta-dot" /><span>Maksimal 10 MB per file</span></div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Pilih File</button>
        <button className="gsl-back-link" onClick={onSkip}>Lewati, lengkapi profil</button>
      </div>
    </>
  );
}

/* ── Unggah CV — sedang berjalan ── */
function ScreenUnggahProses({ onNext }) {
  return (
    <>
      <div className="gsl-body">
        <div className="gsl-up-top">
          <div className="gsl-up-status">Mengunggah…<span className="muted">1/3 file</span></div>
          <div className="gsl-up-count">38%</div>
        </div>
        <div className="gsl-progress-track"><div className="gsl-progress-fill" style={{ width: '38%' }} /></div>

        <div className="gsl-up-section-label">Berlangsung</div>
        <div>
          <div className="gsl-up-row">
            <div className="gsl-cv-ic">PDF</div><div className="gsl-cv-name">Fajar_Ramadhan_CV.pdf</div>
            <div className="gsl-up-row-right">
              <div className="gsl-file-progress-track"><div className="gsl-file-progress-fill" style={{ width: '55%' }} /></div>
              <span className="gsl-status-label uploading"><IconSpinner />Menilai</span>
            </div>
          </div>
          <div className="gsl-up-row">
            <div className="gsl-cv-ic">PDF</div><div className="gsl-cv-name">Salsa_Amelia_CV.pdf</div>
            <div className="gsl-up-row-right"><span className="gsl-status-label menunggu"><IconWaiting />Menunggu</span></div>
          </div>
        </div>

        <div className="gsl-up-section-label" style={{ marginTop: 16 }}>Selesai</div>
        <div>
          <div className="gsl-up-row">
            <div className="gsl-cv-ic">PDF</div><div className="gsl-cv-name">Dinda_Kusuma_CV.pdf</div>
            <div className="gsl-up-row-right"><span className="gsl-detail-badge">Detail</span><span className="gsl-status-label berhasil"><IconCheck />Skor 92%</span></div>
          </div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ── Unggah CV — selesai (dengan contoh error + retry) ── */
function ScreenUnggahSelesai({ onNext }) {
  return (
    <>
      <div className="gsl-body">
        <div className="gsl-up-top">
          <div className="gsl-up-status">Selesai<span className="muted">2 Berhasil, 1 Gagal</span></div>
          <div className="gsl-up-count">100%</div>
        </div>
        <div className="gsl-progress-track"><div className="gsl-progress-fill" style={{ width: '100%' }} /></div>

        <div className="gsl-up-section-label">Selesai</div>
        <div>
          <div className="gsl-up-row">
            <div className="gsl-cv-ic">PDF</div><div className="gsl-cv-name">Dinda_Kusuma_CV.pdf</div>
            <div className="gsl-up-row-right"><span className="gsl-detail-badge">Detail</span><span className="gsl-status-label berhasil"><IconCheck />Skor 92%</span></div>
          </div>
          <div className="gsl-up-row">
            <div className="gsl-cv-ic">PDF</div><div className="gsl-cv-name">Fajar_Ramadhan_CV.pdf</div>
            <div className="gsl-up-row-right"><span className="gsl-detail-badge">Detail</span><span className="gsl-status-label berhasil"><IconCheck />Skor 78%</span></div>
          </div>
        </div>

        <div className="gsl-gagal-section">
          <div className="gsl-gagal-title"><IconAlert />Terdapat Error</div>
          <div className="gsl-gagal-item">
            <div className="gsl-gagal-row">
              <div className="gsl-gagal-name"><span className="gsl-gagal-file">Salsa_Amelia_CV.pdf</span><span className="gsl-gagal-chip">Gagal dibaca</span></div>
              <button className="gsl-retry-btn"><IconRetry /></button>
            </div>
          </div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ── Hasil Penilaian ── */
function ScreenHasilPenilaian({ onNext }) {
  return (
    <>
      <div className="gsl-body" style={{ paddingTop: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="gsl-success-ring" style={{ margin: '0 auto' }}><IconCheck /></div>
          <h2 className="gsl-h2" style={{ marginTop: 14 }}>3 kandidat sudah dinilai</h2>
          <p className="gsl-p" style={{ marginTop: 6 }}>Diurutkan dari kecocokan tertinggi — lihat detail lengkapnya di halaman Kandidat.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="gsl-score-card"><div className="gsl-score-avatar">DK</div><div><div className="gsl-score-name">Dinda Kusuma</div><div className="gsl-score-role">{DUMMY_JOB}</div></div><div className="gsl-score-val">92%</div></div>
          <div className="gsl-score-card"><div className="gsl-score-avatar">FR</div><div><div className="gsl-score-name">Fajar Ramadhan</div><div className="gsl-score-role">{DUMMY_JOB}</div></div><div className="gsl-score-val">78%</div></div>
          <div className="gsl-score-card"><div className="gsl-score-avatar">SA</div><div><div className="gsl-score-name">Salsa Amelia</div><div className="gsl-score-role">{DUMMY_JOB}</div></div><div className="gsl-score-val">65%</div></div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ── 3. Cara Bikinnya ──
   Dulu didahului layar "Kenalan Yuk" (value-prop Portal Karier) tersendiri —
   digabung ke sini karena 2 dari 3 poinnya sudah kesebut di bullet kartu
   "Membuka Lowongan Baru" pada ScreenSkenario (laman karier terbit, sebar
   kanal). Yang tersisa & benar-benar baru cuma "pelamar tanpa buat akun" —
   jadi cukup 1 baris konteks (banner di bawah), bukan layar penuh sendiri. */
// Item detail per metode — ditampilkan di panel expandable "Lihat detail
// lengkap" di bawah kartu pilihan, bukan lagi checklist statis di dalam
// kartu (biar kartu pilihan tetap ringkas & tidak berulang dengan checklist
// di ScreenSkenario).
const METODE_ITEMS = {
  ai: ['Dijawab lewat 8 pertanyaan singkat', 'Deskripsi & kriteria penilaian tersusun otomatis', 'Draf tetap bisa direview & diedit sebelum terbit'],
  form: ['Unggah file Deskripsi Pekerjaan', 'Isi form data secara menyeluruh', 'Kontrol penuh atas setiap detail'],
};

function ScreenMetode({ onNext, onBack }) {
  const [pilihan, setPilihan] = useState('ai'); // 'ai' | 'form' — menentukan jalur berikutnya, dikirim lewat onNext(pilihan)
  const [detailOpen, setDetailOpen] = useState(true);
  const items = METODE_ITEMS[pilihan];
  const numColor = pilihan === 'ai' ? 'var(--luna-orange-500)' : 'var(--luna-ink-900)';

  return (
    <>
      <div className="gsl-body">
        <div>
          <h2 className="gsl-h2">Bagaimana ingin membuat lowongan?</h2>
          <p className="gsl-p" style={{ marginTop: 8, marginBottom: 10 }}>Pilih cara yang paling nyaman untukmu.</p>
          <div className="gsl-metode-note">
            <IconSparkle />
            <span>Laman karier otomatis aktif saat terbit, Kandidat dapat mendaftar secara langsung.</span>
          </div>
        </div>

        <div className="gsl-metode-grid">
          <button type="button" className={`gsl-metode-card${pilihan === 'ai' ? ' sel' : ''}`} onClick={() => setPilihan('ai')}>
            <span className="gsl-metode-card-wm"><IconSparkle /></span>
            <div className="gsl-metode-card-title">Dengan Bantuan Luna</div>
            <p className="gsl-metode-card-desc">Cepat, dipandu AI dari nol.</p>
          </button>

          <button type="button" className={`gsl-metode-card${pilihan === 'form' ? ' sel' : ''}`} onClick={() => setPilihan('form')}>
            <span className="gsl-metode-card-wm"><IconFile /></span>
            <div className="gsl-metode-card-title">Isi Form Sendiri</div>
            <p className="gsl-metode-card-desc">Kontrol penuh, dari file kamu.</p>
          </button>
        </div>

        <button type="button" className="gsl-detail-toggle" onClick={() => setDetailOpen(v => !v)}>
          {detailOpen ? 'Sembunyikan detail' : 'Lihat detail lengkap'}
          <span style={{ display: 'flex', transform: detailOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><IconChevronDown /></span>
        </button>

        {detailOpen && (
          <div className="gsl-detail-panel">
            {items.map((label, i) => (
              <div className="gsl-detail-item" key={label}>
                <div className="gsl-detail-num" style={{ background: numColor }}>{i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={() => onNext(pilihan)}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onBack}>Kembali</button>
      </div>
    </>
  );
}

/* ── 5a. Wizard AI — dummy pertanyaan 1 ── */
function ScreenWizard1({ onNext, onBack }) {
  return (
    <>
      <div className="gsl-top" style={{ paddingTop: 0 }}><span className="gsl-qcount">PERTANYAAN 1 / 8</span></div>
      <div className="gsl-rail"><i style={{ width: '12%' }} /></div>
      <div className="gsl-body">
        <h2 className="gsl-h2">Untuk posisi apa lowongan ini dibuka?</h2>
        <div className="gsl-field">
          <label>Judul Posisi</label>
          <div className="gsl-input focus">{DUMMY_JOB}</div>
        </div>
        <div className="gsl-field">
          <label>Departemen <span className="opt">(opsional)</span></label>
          <div className="gsl-input"><span className="ph">Pilih departemen</span><IconChevronDown /></div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onBack}>Kembali</button>
      </div>
    </>
  );
}

/* ── 5b. Wizard AI — dummy pertanyaan 3 ── */
function ScreenWizard2({ onNext }) {
  const [pengalaman, setPengalaman] = useState('1–2 tahun');
  const opsi = ['Tanpa pengalaman', '1–2 tahun', '3–5 tahun', '5+ tahun'];
  return (
    <>
      <div className="gsl-top" style={{ paddingTop: 0 }}><span className="gsl-qcount">PERTANYAAN 3 / 8</span></div>
      <div className="gsl-rail"><i style={{ width: '37%' }} /></div>
      <div className="gsl-body">
        <h2 className="gsl-h2">Berapa tahun pengalaman minimum yang dibutuhkan?</h2>
        <div className="gsl-chip-grid">
          {opsi.map(o => (
            <button key={o} type="button" className={`gsl-chip${pengalaman === o ? ' sel' : ''}`} onClick={() => setPengalaman(o)}>{o}</button>
          ))}
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ── 5c. Isi Form Sendiri — versi ringkas dari MobileBuatLowonganForm.jsx
   asli (unggah JD, "atau isi manual", field Detail Posisi). Statis/dummy,
   cuma Nama Jabatan & Lokasi yang benar-benar bisa diketik. ── */
function ScreenFormFields({ onNext, onBack }) {
  const [jabatan, setJabatan] = useState(DUMMY_JOB);
  const [lokasi, setLokasi] = useState('Jakarta Selatan');
  const [deskripsi, setDeskripsi] = useState('');

  return (
    <>
      <div className="gsl-body">
        <div className="gsl-upload-box">
          <div className="gsl-upload-ic"><IconUpload /></div>
          <div>
            <div className="gsl-upload-t">Sudah punya draf JD?</div>
            <div className="gsl-upload-d">Unggah .pdf/.docx, form di bawah terisi otomatis</div>
          </div>
          <span className="gsl-upload-cta">Unggah</span>
        </div>
        <div className="gsl-or-divider">atau isi manual</div>

        <div className="gsl-sec-label">Detail Posisi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gsl-field">
            <label>Nama Jabatan <span className="opt">*</span></label>
            <input className="gsl-input" value={jabatan} onChange={e => setJabatan(e.target.value)} />
          </div>
          <div className="gsl-field">
            <label>Level Jabatan</label>
            <button type="button" className="gsl-input"><span className="ph">Pilih level jabatan</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Departemen</label>
            <button type="button" className="gsl-input"><span className="ph">Pilih departemen</span><IconChevronDown /></button>
          </div>
          <div className="gsl-field">
            <label>Lokasi</label>
            <input className="gsl-input" value={lokasi} onChange={e => setLokasi(e.target.value)} />
          </div>
          <div className="gsl-field">
            <label>Ikatan Kerja</label>
            <button type="button" className="gsl-input"><span className="ph">Pilih ikatan kerja</span><IconChevronDown /></button>
          </div>
        </div>

        <div className="gsl-sec-label">Deskripsi Pekerjaan</div>
        <div className="gsl-field">
          <label>Deskripsi <span className="opt">*</span></label>
          <textarea
            className="gsl-txa"
            placeholder="Jelaskan tanggung jawab & kualifikasi posisi ini…"
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
          />
          <div className="gsl-char-hint"><span>Minimal 300 karakter untuk kriteria otomatis</span><b>{deskripsi.length}/300</b></div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsl-back-link" onClick={onBack}>Kembali</button>
      </div>
    </>
  );
}

/* ── 5d. Draft & Review — dua tampilan BEDA menyesuaikan sumbernya, samain
   persis dengan aslinya (bukan 1 layar digeneralisir untuk dua jalur):
   - method 'ai'   → ScreenDraftAi, samain ke step 'summary' di
     MobileBuatLowonganQA.jsx (eyebrow rangkuman, kartu baris tanpa badge,
     deskripsi multi-section, tombol Buat Ulang/Perbaiki).
   - method 'form' → ScreenDraftForm, samain ke phase 'review' di
     MobileBuatLowonganForm.jsx (badge + baris, deskripsi expandable, hint
     kriteria AI, tombol Kembali + Terbitkan).
   Catatan: MobileReportKendalaButton di kedua layar asli sengaja TIDAK
   diikutkan — itu komponen nyata yang benar-benar mengirim laporan,
   dan tidak pas dipasang di prototipe klik-tembus ini. "Buat Ulang"/
   "Perbaiki" tetap dikasih aksi (balik ke wizard1/wizard2) supaya tidak
   jadi tombol mati, walau di aslinya keduanya memicu re-generate AI
   yang sungguhan. */
function ScreenDraftAi({ onNext, onRestart, onFix }) {
  return (
    <>
      <div className="gsl-body">
        <span className="gsl-lp-kicker"><IconSparkle />Dirangkum otomatis dari 8 jawaban kamu</span>
        <h2 className="gsl-h2" style={{ marginTop: 10 }}>Deskripsi Lowongan Siap</h2>

        <div className="gsl-draft-card">
          <div className="gsl-draft-job">{DUMMY_JOB}</div>
          <div className="gsl-draft-row"><span>Level</span><span>Staff</span></div>
          <div className="gsl-draft-row"><span>Lokasi</span><span>Jakarta Selatan</span></div>
          <div className="gsl-draft-row"><span>Jumlah rekrut</span><span>1 orang</span></div>
          <div className="gsl-draft-row"><span>Ikatan kerja</span><span>Penuh Waktu</span></div>
          <div className="gsl-draft-row"><span>Upah</span><span>Rp 6.000.000 – Rp 9.000.000</span></div>
          <div className="gsl-draft-row"><span>Pendidikan minimal</span><span>S1</span></div>
          <div className="gsl-draft-row"><span>Pengalaman minimal</span><span>1–2 Tahun</span></div>
        </div>

        <div className="gsl-draft-card">
          <div className="gsl-draft-desc-label" style={{ marginTop: 0 }}>Deskripsi</div>
          <div className="gsl-draft-desc">Kami mencari Content Writer yang bisa menulis copy tajam untuk kampanye digital, mengelola kalender konten, dan berkolaborasi dengan tim desain.</div>

          <div className="gsl-draft-desc-label">Tanggung Jawab</div>
          <ul className="gsl-draft-list">
            <li>Menulis &amp; menyunting konten untuk berbagai kanal digital</li>
            <li>Merancang kalender konten bulanan</li>
            <li>Berkoordinasi dengan tim desain &amp; marketing</li>
          </ul>

          <div className="gsl-draft-desc-label">Kualifikasi</div>
          <ul className="gsl-draft-list">
            <li>Minimal 1–2 tahun pengalaman sebagai content writer</li>
            <li>Terbiasa riset &amp; menulis dengan tenggat ketat</li>
            <li>Punya portofolio tulisan yang relevan</li>
          </ul>
        </div>

        <div className="gsl-note">
          <div className="gsl-note-title">Catatan dari Luna</div>
          <p className="gsl-note-body">Deskripsi ini disusun dari jawabanmu tadi — kamu masih bisa mengedit detailnya kapan saja sebelum atau sesudah diterbitkan.</p>
        </div>
      </div>
      <div className="gsl-footer">
        <div className="gsl-btn-row">
          <button className="gsl-btn gsl-btn-ghost" onClick={onRestart}>Buat Ulang</button>
          <button className="gsl-btn gsl-btn-outline" onClick={onFix}><IconRegenerate />Perbaiki</button>
        </div>
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}><IconCheck />Terbitkan Lowongan</button>
      </div>
    </>
  );
}

function ScreenDraftForm({ onNext, onBack }) {
  const [descExpanded, setDescExpanded] = useState(false);
  return (
    <>
      <div className="gsl-body">
        <div className="gsl-draft-card">
          <div className="gsl-draft-top">
            <div className="gsl-draft-job">{DUMMY_JOB}</div>
            <button type="button" className="gsl-draft-edit-link" onClick={onBack}>Ubah</button>
          </div>
          <div className="gsl-draft-badges">
            <span className="gsl-draft-badge">Staff</span>
            <span className="gsl-draft-badge">Content</span>
            <span className="gsl-draft-badge">Jakarta Selatan</span>
            <span className="gsl-draft-badge">Penuh Waktu</span>
          </div>
          <div className="gsl-draft-divider" />
          <span className="gsl-draft-status">Terbuka</span>
          <div className="gsl-draft-row"><span>Jumlah Rekrut</span><span>1 orang</span></div>
          <div className="gsl-draft-row"><span>Estimasi Upah</span><span>Rp 6.000.000 – Rp 9.000.000</span></div>
          <div className="gsl-draft-row"><span>Tgl Mulai</span><span>1 Okt 2026</span></div>
          <div className="gsl-draft-row"><span>Target Onboard</span><span>15 Okt 2026</span></div>
          <div className="gsl-draft-row"><span>Pendidikan Min.</span><span>S1</span></div>
          <div className="gsl-draft-row"><span>Pengalaman Min.</span><span>1–2 Tahun</span></div>
          <div className="gsl-draft-desc-label">Deskripsi</div>
          <div className="gsl-draft-desc" style={descExpanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            Kami mencari Content Writer yang bisa menulis copy tajam untuk kampanye digital, mengelola kalender konten, dan berkolaborasi dengan tim desain. Cocok untuk yang terbiasa bekerja dengan tenggat ketat dan senang riset topik baru.
          </div>
          <span className="gsl-draft-more" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}</span>
        </div>

        <div className="gsl-ai-hint">
          <IconSparkle />
          <p>Begitu diterbitkan, <b>kriteria penilaian AI</b> disusun otomatis di latar belakang (±30 detik) — bisa dipantau &amp; diedit di halaman detail lowongan.</p>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}><IconCheck />Terbitkan Lowongan</button>
      </div>
    </>
  );
}

/* ── 6. Sebarkan Lowongannya ── */
function ScreenSebarkan({ onNext, name, company }) {
  return (
    <>
      <div className="gsl-body">
        <div>
          <div className="gsl-hi">Halo, {name} 👋</div>
          <h2 className="gsl-wc-h">Lowongan kamu sudah tayang, {company}!</h2>
          <p className="gsl-p" style={{ marginTop: 8 }}>Ini laman karier resmi kamu sekarang — sama seperti yang dijanjikan di awal:</p>
        </div>

        <div className="gsl-browser">
          <div className="gsl-browser-bar">
            <span className="gsl-browser-dot" /><span className="gsl-browser-dot" /><span className="gsl-browser-dot" />
            <span className="gsl-browser-url">https://karir.lunasys.ai/...</span>
          </div>
          <div className="gsl-browser-body">
            <div className="gsl-browser-ic live"><IconCheck /></div>
            <div className="gsl-browser-t">Halaman karier kamu sudah tayang</div>
            <div className="gsl-browser-d">1 lowongan aktif, siap menerima pelamar</div>
          </div>
        </div>

        <div className="gsl-sec-label">Sebarkan biar kandidat mulai masuk</div>
        <button type="button" className="gsl-wa-cta"><IconWhatsapp />Bagikan ke WhatsApp</button>

        <div className="gsl-secondary-row">
          <button type="button" className="gsl-ssq"><div className="gsl-ssq-ic" style={{ background: '#f9fafc', color: 'var(--luna-ink-600)' }}><IconCopy /></div><span>Salin Link</span></button>
          <button type="button" className="gsl-ssq"><div className="gsl-ssq-ic" style={{ background: '#0A66C214', color: '#0A66C2' }}><IconLinkedin /></div><span>LinkedIn</span></button>
          <button type="button" className="gsl-ssq"><div className="gsl-ssq-ic" style={{ background: '#f9fafc', color: 'var(--luna-ink-600)' }}><IconShare /></div><span>Lainnya</span></button>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={onNext}>Lanjutkan</button>
      </div>
    </>
  );
}

/* ── 7. Selesai ──
   Titik pertemuan kedua cabang (baru/lama) — begitu layar ini tampil,
   dianggap "Getting Started" sudah selesai: tandai gate di MobileApp.jsx
   supaya tidak muncul lagi sesi ini (onExit), dan trigger auto-start Tur
   Produk sama seperti yang dulu dilakukan OnboardingMobile.jsx (sekarang
   diarsipkan) begitu user mendarat di Beranda asli. */
function ScreenSelesai({ scenario, navigate, onExit }) {
  // Ring mulai dari 0% terus dianimasikan ke progress asli sesaat setelah
  // mount (bukan langsung tampil penuh) — transisi stroke-dashoffset-nya
  // sudah ada di CSS (.gsl-ring svg circle), tinggal geser nilai awalnya.
  const [ringFilled, setRingFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRingFilled(true), 150);
    return () => clearTimeout(t);
  }, []);

  // onExit baru dipanggil saat user BENAR-BENAR keluar lewat salah satu CTA
  // di bawah — bukan begitu layar ini mount. Kalau dipanggil di mount (versi
  // lama), render ulang MobileApp.jsx apa pun sebabnya (mis. AuthContext
  // refresh) bisa bikin gate getting-started langsung gugur dan user
  // "terlempar" ke Beranda tanpa pernah klik apa-apa di layar ini.
  const goIsiProfil = () => { onExit?.(); navigate?.('getting-started-profil'); };
  const goBeranda = () => { onExit?.(); localStorage.setItem('luna_trigger_tour', 'true'); navigate?.('beranda_002'); };
  const step2Text = scenario === 'lama' ? '3 kandidat dinilai' : 'Siap dibagikan';

  // Lingkaran progres: r=56, keliling = 2*pi*56 ≈ 351.9. 65% terisi -> dashoffset = 351.9*(1-0.65)
  const RING_CIRCUMFERENCE = 351.9;
  const PROGRESS = 0.65;

  return (
    <>
      <div className="gsl-body" style={{ paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))' }}>
        <div className="gsl-ring-wrap">
          <div className="gsl-ring">
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle cx="66" cy="66" r="56" fill="none" stroke="var(--luna-ink-100)" strokeWidth="11" />
              <circle
                cx="66" cy="66" r="56" fill="none" stroke="var(--luna-orange-500)" strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - (ringFilled ? PROGRESS : 0))}
              />
            </svg>
            <div className="gsl-ring-label">
              <div className="gsl-ring-num">{Math.round(PROGRESS * 100)}%</div>
              <div className="gsl-ring-cap">Akun Siap</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 className="gsl-h2">Tinggal sedikit lagi</h2>
          <p className="gsl-p" style={{ marginTop: 6 }}>Lengkapi profil perusahaan biar makin kredibel di mata kandidat.</p>
        </div>

        <div className="gsl-missing-list">
          <div className="gsl-missing-item"><div className="gsl-missing-dot done"><IconCheck /></div><div className="gsl-missing-t done">Lowongan dibuat &amp; aktif</div></div>
          <div className="gsl-missing-item"><div className="gsl-missing-dot done"><IconCheck /></div><div className="gsl-missing-t done">{step2Text}</div></div>
          <div className="gsl-missing-item"><div className="gsl-missing-dot" /><div className="gsl-missing-t">Tambahkan logo &amp; cerita singkat perusahaan</div></div>
          <div className="gsl-missing-item"><div className="gsl-missing-dot" /><div className="gsl-missing-t">Lengkapi info dasar perusahaan</div></div>
        </div>
      </div>
      <div className="gsl-footer">
        <button className="gsl-btn gsl-btn-primary" onClick={goIsiProfil}>Lengkapi Sekarang</button>
        <button className="gsl-back-link" onClick={goBeranda}>Nanti saja, ke Beranda</button>
        <p className="gsl-settings-note">Data ini bisa kamu isi kapan saja lewat <b>Pengaturan Akun</b>.</p>
      </div>
    </>
  );
}
