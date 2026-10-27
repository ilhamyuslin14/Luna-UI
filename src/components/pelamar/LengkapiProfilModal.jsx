import { useState } from 'react';
import { createPortal } from 'react-dom';
import PilihanMultiChip from './PilihanMultiChip.jsx';
import { MAKS_PILIHAN, GAJI_MIN, GAJI_MAX, POSISI_REKOMENDASI, LOKASI_REKOMENDASI, PORTAL_LOWONGAN_REKOMENDASI, rupiah } from '../../data/preferensiKerja.js';
import '../../../css/pelamar/pelamar-masuk_001.css';
import '../../../css/pelamar/pelamar-onboarding_001.css';
import '../../../css/pelamar/lengkapi-profil-modal.css';

// Langkah setelah daftar: unggah CV (langkah 1) lalu tiga pertanyaan preferensi (langkah 2).
// Tampil sebagai lapisan paling atas yang menutupi seluruh layar (termasuk navbar) dan tidak bisa
// ditutup dan tanpa tombol keluar, supaya terasa sebagai tahap setelah daftar. Komponen ini tidak tahu cara menyimpan:
// prototype dan mockup mengirim fungsi `unggahCv` dan `simpan` masing-masing.
//   cvTiruan  : (mockup) klik area unggah langsung memilih CV contoh, tanpa membuka pemilih file
//   namaCv    : nama file CV yang sudah tersimpan (saat modal dilanjutkan di login berikutnya), ditampilkan di pertanyaan pertama
//   nama      : nama depan pelamar untuk sapaan di panel kiri (opsional)
//   stageAwal : 'cv' bila belum punya CV, 'posisi' bila CV sudah ada tapi preferensi belum lengkap
//   unggahCv  : async (file, onProgress) => void, melempar Error bila gagal
//   simpan    : async ({ posisi, lokasi, gajiMin, gajiNego, akunPortal }) => void, melempar Error bila gagal
const MAKS_BYTES = 5 * 1024 * 1024;
const TANYA = ['posisi', 'lokasi', 'gaji', 'portal'];
// Dua tahap yang tampak di panel kiri: CV, lalu empat pertanyaan personalisasi yang dihitung sebagai satu tahap.
const LANGKAH = [
  { k: 'cv', n: 'Unggah CV', s: 'Dasar skor kecocokan' },
  { k: 'personalisasi', n: 'Personalisasi lowongan', s: 'Posisi, lokasi, gaji, dan akun lain' },
];
const ukuranFile = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const IconCheck = ({ size = 14, width = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArrow = ({ dir = 'right' }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'right' ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
);

export default function LengkapiProfilModal({ stageAwal = 'cv', unggahCv, simpan, onSelesai, nama, cvTiruan, namaCv }) {
  const [stage, setStage] = useState(stageAwal); // 'cv' | 'posisi' | 'lokasi' | 'gaji' | 'selesai'
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [proses, setProses] = useState(null); // { persen, label } selama CV diunggah dan dibaca AI
  const [cvTersimpan, setCvTersimpan] = useState(stageAwal !== 'cv');
  const [dragOver, setDragOver] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState('');

  const [posisi, setPosisi] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [gaji, setGaji] = useState(5_000_000);
  const [nego, setNego] = useState(false);
  const [portal, setPortal] = useState([]);

  const idxTanya = TANYA.indexOf(stage);
  const gajiSlider = Math.min(GAJI_MAX, Math.max(GAJI_MIN, gaji));

  const terimaFile = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx?)$/i.test(f.name)) { setFileError('Format tidak didukung. Gunakan PDF, DOC, atau DOCX.'); return; }
    if (f.size > MAKS_BYTES) { setFileError('Ukuran file melebihi 5 MB.'); return; }
    setFile({ name: f.name, size: ukuranFile(f.size), raw: f });
    setFileError('');
  };

  const pilihCvTiruan = () => { setFile({ name: 'CV_Dina_Pratama.pdf', size: '240 KB', raw: null }); setFileError(''); };

  let tidakBisaLanjut = false;
  let petunjuk = '';
  let labelLanjut = 'Lanjut';
  if (stage === 'cv') { tidakBisaLanjut = !file || !!proses; petunjuk = 'Unggah CV dulu untuk melanjutkan.'; labelLanjut = proses ? 'Memproses…' : 'Unggah dan lanjut'; }
  if (stage === 'posisi') { tidakBisaLanjut = posisi.length === 0; petunjuk = 'Pilih minimal satu posisi.'; }
  if (stage === 'lokasi') { tidakBisaLanjut = lokasi.length === 0; petunjuk = 'Pilih minimal satu lokasi.'; }
  if (stage === 'gaji') { tidakBisaLanjut = !(gaji > 0); petunjuk = 'Isi perkiraan gaji dulu.'; }
  if (stage === 'portal') { tidakBisaLanjut = menyimpan; labelLanjut = menyimpan ? 'Menyimpan…' : 'Selesai'; }
  if (stage === 'selesai') labelLanjut = 'Mulai';

  const prosesCv = async () => {
    if (!file || proses) return;
    setFileError('');
    setProses({ persen: 3, label: 'Memulai…' });
    try {
      await unggahCv(file.raw, (persen, label) => setProses((p) => ({ persen: Math.max(p?.persen || 0, persen), label })));
      setCvTersimpan(true);
      setStage('posisi');
    } catch (err) {
      console.error('Gagal memproses CV:', err);
      setFileError(err.message || 'CV belum bisa diproses. Coba lagi, atau pakai file lain.');
    } finally {
      setProses(null);
    }
  };

  const prosesSimpan = async () => {
    setMenyimpan(true);
    setGalat('');
    try {
      await simpan({ posisi, lokasi, gajiMin: gaji, gajiNego: nego, akunPortal: portal });
      setStage('selesai');
    } catch (err) {
      console.error('Gagal menyimpan preferensi:', err);
      setGalat('Jawabanmu belum tersimpan. Coba lagi.');
    } finally {
      setMenyimpan(false);
    }
  };

  const lanjut = () => {
    if (tidakBisaLanjut || proses) return;
    if (stage === 'selesai') { onSelesai?.(); return; }
    if (stage === 'cv') { prosesCv(); return; }
    if (stage === 'portal') { prosesSimpan(); return; }
    setStage(TANYA[idxTanya + 1]);
  };

  const mundur = () => {
    if (idxTanya > 0) setStage(TANYA[idxTanya - 1]);
    else if (idxTanya === 0 && !cvTersimpan) setStage('cv');
  };
  const bisaMundur = (idxTanya > 0) || (idxTanya === 0 && !cvTersimpan);

  // Panel kiri: perjalanan lima langkah dan satu alasan singkat untuk langkah yang sedang dikerjakan.
  const idxLangkah = stage === 'selesai' ? LANGKAH.length : (stage === 'cv' ? 0 : 1);
  const ALASAN = {
    cv: ['Untuk personalisasi lowongan', 'CV dipakai menghitung skor kecocokan tiap lowongan, lalu mengurutkan yang paling pas untukmu.'],
    pref: ['Untuk personalisasi lowongan', 'Posisi, lokasi, dan gaji menentukan lowongan mana yang tampil lebih dulu untukmu.'],
    portal: ['Untuk personalisasi lowongan', 'Kami tahu dari mana kamu biasa mencari kerja, jadi rekomendasinya lebih tepat.'],
    selesai: ['Lowonganmu sudah personal', 'Daftar lowongan diurutkan sesuai profilmu, lengkap dengan skor kecocokan.'],
  };
  const [alasanJudul, alasanIsi] = ALASAN[stage === 'cv' || stage === 'portal' || stage === 'selesai' ? stage : 'pref'];

  return createPortal(
    <div className="lpm-overlay" role="dialog" aria-modal="true" aria-labelledby="lpm-judul">
      <div className="lpm-card">
        <aside className="lpm-side">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" className="lpm-side-logo" />
          <div className="lpm-welcome">
            <h2>{nama ? `Selamat datang, ${nama}!` : 'Selamat datang di Luna!'}</h2>
            <p>Pendaftaranmu berhasil. Atur dulu lowongan yang paling pas untukmu.</p>
          </div>
          <ol className="lpm-steps" aria-label="Langkah melengkapi profil">
            {LANGKAH.map((l, i) => {
              const status = i < idxLangkah ? 'done' : (i === idxLangkah ? 'now' : '');
              return (
                <li key={l.k} className={status} aria-current={status === 'now' ? 'step' : undefined}>
                  <span className="lpm-dot">{status === 'done' ? <IconCheck size={12} width={3.4} /> : i + 1}</span>
                  <span>{l.n}<small>{l.s}</small></span>
                </li>
              );
            })}
          </ol>
          <div className="lpm-why"><b>{alasanJudul}</b>{alasanIsi}</div>
        </aside>
        <div className="lpm-main">
        <span className="lpm-kicker">{stage === 'selesai' ? 'Profil siap' : idxLangkah === 0 ? `Langkah 1 dari ${LANGKAH.length}` : `Langkah 2 dari ${LANGKAH.length} · Pertanyaan ${idxTanya + 1} dari ${TANYA.length}`}</span>

        <div className="lpm-body pob001-body" key={stage}>
          {stage === 'cv' && (
            <>
              <h1 id="lpm-judul">Unggah CV kamu</h1>
              <p className="pob001-lead">Pendaftaranmu sudah selesai. Sekarang kita personalisasi lowongannya, supaya yang tampil paling sesuai denganmu.</p>

              {!file ? (
                <>
                  <label
                    className={`pob001-drop${dragOver ? ' over' : ''}`}
                    {...(cvTiruan ? { role: 'button', tabIndex: 0, onClick: pilihCvTiruan, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pilihCvTiruan(); } } } : {})}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); terimaFile(e.dataTransfer.files?.[0]); }}
                  >
                    <span className="pob001-drop-ic">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
                    </span>
                    <b>Tarik file ke sini, atau <u>pilih dari perangkat</u></b>
                    <span>PDF, DOC, atau DOCX · maksimal 5 MB</span>
                    {!cvTiruan && <input className="pob001-sr" type="file" accept=".pdf,.doc,.docx" onChange={(e) => { terimaFile(e.target.files?.[0]); e.target.value = ''; }} />}
                  </label>
                  {fileError && <div className="pm001-error" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>{fileError}</div>}
                </>
              ) : (
                <>
                  <div className="pob001-file">
                    <span className="pob001-file-ic">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                    </span>
                    <div className="pob001-file-info">
                      <div className="pob001-file-name">{file.name}</div>
                      {!proses && <div className="pob001-file-ok"><IconCheck size={14} width={3} />Siap diunggah · {file.size}</div>}
                      {proses && <div className="pob001-up-label">{proses.label}</div>}
                    </div>
                    {!proses && <button type="button" className="pob001-link" onClick={() => { setFile(null); setFileError(''); }}>Ganti</button>}
                  </div>
                  {proses && <div className="pob001-up-bar" role="progressbar" aria-valuenow={proses.persen} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${proses.persen}%` }} /></div>}
                  {fileError && <div className="pm001-error" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>{fileError}</div>}
                  <div className="pob001-after">{proses ? 'Mohon tunggu, jangan tutup halaman ini. Biasanya selesai dalam beberapa detik.' : 'Setelah ini kami tanya preferensi kerjamu.'}</div>
                </>
              )}

              <div className="pob001-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                <span>CV kamu bisa diganti kapan saja dari halaman Profil.</span>
              </div>
            </>
          )}

          {stage === 'posisi' && (
            <>
              <h1 id="lpm-judul">Posisi apa yang kamu cari?</h1>
              <p className="pob001-lead">Boleh pilih lebih dari satu, maksimal {MAKS_PILIHAN}. Kalau posisinya belum ada, ketik lalu tambahkan sendiri.</p>
              {(namaCv || file?.name) && (
                <div className="lpm-cv-ok"><IconCheck size={13} width={3} /><span>CV tersimpan: <b>{namaCv || file.name}</b></span></div>
              )}
              <PilihanMultiChip rekomendasi={POSISI_REKOMENDASI} value={posisi} onChange={setPosisi} placeholder="Ketik posisi lain, lalu Enter untuk menambah" label="Cari atau tambah posisi" />
            </>
          )}

          {stage === 'lokasi' && (
            <>
              <h1 id="lpm-judul">Di mana kamu mau bekerja?</h1>
              <p className="pob001-lead">Pilih kota yang kamu mau, maksimal {MAKS_PILIHAN}. Kalau kotamu belum ada, ketik lalu tambahkan sendiri.</p>
              <PilihanMultiChip rekomendasi={LOKASI_REKOMENDASI} value={lokasi} onChange={setLokasi} placeholder="Ketik kota atau daerah lain, lalu Enter" label="Cari atau tambah lokasi" ikonLokasi labelChip={(l) => (l === 'Remote' ? 'Remote (seluruh Indonesia)' : l)} />
            </>
          )}

          {stage === 'gaji' && (
            <>
              <h1 id="lpm-judul">Berapa gaji yang kamu harapkan?</h1>
              <p className="pob001-lead">Perkiraan gaji bulanan minimum. Ini hanya untuk menyaring, bukan angka final.</p>
              <div className="pob001-gaji">
                <div className="pob001-gaji-label">Minimal per bulan</div>
                <label className="pob001-money">
                  <span>Rp</span>
                  <input type="text" inputMode="numeric" placeholder="0" aria-label="Gaji minimal per bulan (Rupiah)" value={gaji > 0 ? gaji.toLocaleString('id-ID') : ''} onChange={(e) => setGaji(Math.min(999_999_999, Number(e.target.value.replace(/\D/g, '')) || 0))} />
                  <span>/ bulan</span>
                </label>
                <input className="pob001-range" type="range" min={GAJI_MIN} max={GAJI_MAX} step={500_000} value={gajiSlider} onChange={(e) => setGaji(Number(e.target.value))} aria-label="Geser gaji minimal per bulan" />
                <div className="pob001-range-ends"><span>Rp 2 jt</span><span>Rp 20 jt+</span></div>
              </div>
              <label className="pob001-nego">
                <input type="checkbox" checked={nego} onChange={(e) => setNego(e.target.checked)} />
                Gaji masih bisa dinegosiasikan
              </label>
            </>
          )}

          {stage === 'portal' && (
            <>
              <h1 id="lpm-judul">Kamu sudah punya akun di situs lowongan lain?</h1>
              <p className="pob001-lead">Pilih semua yang kamu pakai. Boleh dikosongkan kalau belum ada.</p>
              <PilihanMultiChip rekomendasi={PORTAL_LOWONGAN_REKOMENDASI} value={portal} onChange={setPortal} placeholder="Ketik situs lain, lalu Enter" label="Cari atau tambah situs" />
              {galat && <div className="pm001-error" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>{galat}</div>}
            </>
          )}

          {stage === 'selesai' && (
            <>
              <h1 id="lpm-judul">Profil kamu siap</h1>
              <p className="pob001-lead">Mulai sekarang, setiap lowongan yang kamu buka menampilkan skor kecocokan dengan CV kamu.</p>
              <dl className="pob001-summary">
                <div><dt>Posisi</dt><dd>{posisi.join(', ')}</dd></div>
                <div><dt>Lokasi</dt><dd>{lokasi.join(', ')}</dd></div>
                <div><dt>Gaji</dt><dd>Minimal {rupiah(gaji)} / bulan{nego ? ' · bisa nego' : ''}</dd></div>
                <div><dt>Akun lain</dt><dd>{portal.length ? portal.join(', ') : 'Belum ada'}</dd></div>
              </dl>
            </>
          )}
        </div>

        <div className="pob001-nav lpm-nav">
          {bisaMundur && stage !== 'selesai' && (
            <button type="button" className="pob001-btn ghost" onClick={mundur}><IconArrow dir="left" />Kembali</button>
          )}
          <button type="button" className="pob001-btn primary" disabled={tidakBisaLanjut} onClick={lanjut}>{labelLanjut}<IconArrow /></button>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
