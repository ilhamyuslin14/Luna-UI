import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { uploadAndParseResume } from '../../services/pelamarResumeService.js';
import PilihanMultiChip from '../../components/pelamar/PilihanMultiChip.jsx';
import { MAKS_PILIHAN, GAJI_MIN, GAJI_MAX, POSISI_REKOMENDASI, LOKASI_REKOMENDASI, rupiah } from '../../data/preferensiKerja.js';
import '../../../css/pelamar/pelamar-masuk_001.css';
import '../../../css/pelamar/pelamar-onboarding_001.css';

// MOCKUP onboarding pelamar setelah verifikasi OTP: langkah 1 unggah CV (wajib, dasar penilaian
// kecocokan), langkah 2 tiga pertanyaan satu per satu (posisi, lokasi, gaji). Belum ada yang
// disimpan: file CV tidak diunggah dan jawaban hilang saat halaman ditutup. Bisa dibuka langsung
// lewat /?view=pelamar-onboarding. Tampilannya mengikuti gaya Daftar/Masuk/OTP pelamar (pm001-*).
const STAGES = ['cv', 'posisi', 'lokasi', 'gaji', 'selesai'];
const MAKS_BYTES = 5 * 1024 * 1024;
const ukuranFile = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const sama = (a, b) => a.toLowerCase() === b.trim().toLowerCase();

const IconCheck = ({ size = 14, width = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArrow = ({ dir = 'right' }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'right' ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
);

export default function PelamarOnboarding_001({ navigate }) {
  const { user, simpanPreferensi } = useAuth() || {};
  const [galatSimpan, setGalatSimpan] = useState('');
  const [stage, setStage] = useState('cv');
  const [file, setFile] = useState(null); // { name, size }
  const [fileError, setFileError] = useState('');
  const [proses, setProses] = useState(null); // { persen, label } selama CV diunggah dan diproses AI
  const [cvTersimpan, setCvTersimpan] = useState(null); // File yang sudah berhasil diproses (tidak diunggah ulang bila tidak diganti)
  const [dragOver, setDragOver] = useState(false);

  const [posisi, setPosisi] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [gaji, setGaji] = useState(5_000_000);
  const [nego, setNego] = useState(false);

  const idx = STAGES.indexOf(stage);

  const terimaFile = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx?)$/i.test(f.name)) { setFileError('Format tidak didukung. Gunakan PDF, DOC, atau DOCX.'); return; }
    if (f.size > MAKS_BYTES) { setFileError('Ukuran file melebihi 5 MB.'); return; }
    setFile({ name: f.name, size: ukuranFile(f.size), raw: f });
    setFileError('');
  };

  const gajiSlider = Math.min(GAJI_MAX, Math.max(GAJI_MIN, gaji));

  let tidakBisaLanjut = false;
  let petunjuk = '';
  let labelLanjut = 'Lanjut';
  if (stage === 'cv') { tidakBisaLanjut = !file || !!proses; petunjuk = 'Unggah CV dulu untuk melanjutkan.'; if (file && !proses) labelLanjut = 'Unggah dan lanjut'; if (proses) labelLanjut = 'Memproses…'; }
  if (stage === 'posisi') { tidakBisaLanjut = posisi.length === 0; petunjuk = 'Pilih minimal satu posisi.'; }
  if (stage === 'lokasi') { tidakBisaLanjut = lokasi.length === 0; petunjuk = 'Pilih minimal satu lokasi.'; }
  if (stage === 'gaji') { tidakBisaLanjut = !(gaji > 0); petunjuk = 'Isi perkiraan gaji dulu.'; labelLanjut = 'Selesai'; }
  if (stage === 'selesai') labelLanjut = 'Mulai cari lowongan';

  // Jawaban disimpan ke profil (kolom pref_*). Gagal menyimpan tidak menghalangi lanjut; pelamar bisa
  // mengisinya lagi di Profil Saya, jadi cukup diberi tahu.
  const simpan = async () => {
    setGalatSimpan('');
    try {
      await simpanPreferensi?.({ posisi, lokasi, gajiMin: gaji, gajiNego: nego });
    } catch (err) {
      console.error('Gagal menyimpan preferensi:', err);
      setGalatSimpan('Jawabanmu belum tersimpan. Kamu bisa mengisinya lagi nanti di Profil Saya.');
    }
  };

  // CV diunggah dan dibaca AI (parse-cv-pelamar) lewat service yang sama dengan Profil Saya, sehingga
  // pengalaman, pendidikan, dan keahlian di profil langsung terisi. Lanjut hanya kalau berhasil.
  const unggahCv = async () => {
    if (!file || proses) return;
    if (cvTersimpan && cvTersimpan === file.raw) { setStage('posisi'); return; }
    if (!user?.id) { setFileError('Sesi tidak ditemukan. Masuk dulu, lalu ulangi dari awal.'); return; }
    setFileError('');
    setProses({ persen: 3, label: 'Memulai…' });
    try {
      await uploadAndParseResume(user.id, file.raw, (persen, label) => setProses((p) => ({ persen: Math.max(p?.persen || 0, persen), label })));
      setCvTersimpan(file.raw);
      setStage('posisi');
    } catch (err) {
      console.error('Gagal memproses CV:', err);
      setFileError(err.message || 'CV belum bisa diproses. Coba lagi, atau pakai file lain.');
    } finally {
      setProses(null);
    }
  };

  const lanjut = () => {
    if (tidakBisaLanjut || proses) return;
    if (stage === 'selesai') { navigate?.('semua-lowongan_002'); return; }
    if (stage === 'cv') { unggahCv(); return; }
    if (stage === 'gaji') simpan();
    setStage(STAGES[idx + 1]);
  };

  const langkah1Selesai = idx > 0;
  const langkah2Selesai = stage === 'selesai';
  const sedangTanya = idx >= 1 && idx <= 3;
  const subLangkah2 = sedangTanya ? ['Posisi yang kamu cari', 'Lokasi kerja', 'Gaji yang diharapkan'][idx - 1] : 'Posisi, lokasi, dan gaji.';
  const labelTahap = stage === 'cv' ? 'Langkah 1 · Unggah CV' : (stage === 'selesai' ? 'Selesai' : 'Langkah 2 · Preferensi kerja');

  return (
    <div className="pm001-shell pob001-shell">
      <div className="pm001-hero">
        <div className="pm001-hero-top">
          <img src="/assets/logos/luna-logo-clean.png" alt="Luna" className="pm001-hero-logo" />
          <span className="pm001-hero-badge">Portal Karir</span>
        </div>

        <div className="pm001-hero-mid pob001-hero-mid">
          <h2>Kenalan dulu, biar rekomendasinya pas.</h2>
          <p>Dua langkah singkat: unggah CV, lalu atur preferensi kerja.</p>

          <ol className="pob001-steps">
            <li className="pob001-step">
              <div className="pob001-step-rail">
                <span className={`pob001-step-dot ${langkah1Selesai ? 'done' : 'now'}`}>{langkah1Selesai ? <IconCheck /> : 1}</span>
                <span className={`pob001-step-line${langkah1Selesai ? ' done' : ''}`} />
              </div>
              <div className="pob001-step-text">
                <b>Unggah CV</b>
                <span>{langkah1Selesai && file ? file.name : 'Dasar skor kecocokan.'}</span>
              </div>
            </li>
            <li className="pob001-step">
              <div className="pob001-step-rail">
                <span className={`pob001-step-dot ${langkah2Selesai ? 'done' : (sedangTanya ? 'now' : '')}`}>{langkah2Selesai ? <IconCheck /> : 2}</span>
              </div>
              <div className="pob001-step-text">
                <b>Preferensi kerja</b>
                <span>{subLangkah2}</span>
              </div>
            </li>
          </ol>
        </div>

        <div className="pob001-why">
          <div className="pob001-why-score"><b>86</b><span>/100</span></div>
          <div>
            <b>Kenapa CV wajib?</b>
            <p>CV dipakai menghitung skor kecocokan tiap lowongan.</p>
          </div>
        </div>
      </div>

      <div className="pm001-form-side">
        <div className="pm001-form-col pob001-col">
          <div className="pob001-progress">
            <div className="pob001-progress-top">
              <b>{labelTahap}</b>
              <span>{stage === 'selesai' ? '4 dari 4' : `${idx + 1} dari 4`}</span>
            </div>
            <div className="pob001-segs" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={Math.min(idx, 4)} aria-label="Progres onboarding">
              {[0, 1, 2, 3].map((i) => <span key={i} className={`pob001-seg${i < idx ? ' done' : (i === idx ? ' now' : '')}`} />)}
            </div>
          </div>

          <div className="pob001-body" key={stage}>
            {stage === 'cv' && (
              <>
                <h1>Unggah CV kamu</h1>
                <p className="pob001-lead">Ini bagian terpenting. Tanpa CV, kami tidak bisa menghitung seberapa cocok kamu dengan lowongan yang ada.</p>

                {!file ? (
                  <>
                    <label
                      className={`pob001-drop${dragOver ? ' over' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); terimaFile(e.dataTransfer.files?.[0]); }}
                    >
                      <span className="pob001-drop-ic">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
                      </span>
                      <b>Tarik file ke sini, atau <u>pilih dari perangkat</u></b>
                      <span>PDF, DOC, atau DOCX · maksimal 5 MB</span>
                      <input className="pob001-sr" type="file" accept=".pdf,.doc,.docx" onChange={(e) => { terimaFile(e.target.files?.[0]); e.target.value = ''; }} />
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
                        {!proses && <div className="pob001-file-ok"><IconCheck size={14} width={3} />{cvTersimpan === file.raw ? 'Sudah diproses' : 'Siap diunggah'} · {file.size}</div>}
                        {proses && <div className="pob001-up-label">{proses.label}</div>}
                      </div>
                      {!proses && <button type="button" className="pob001-link" onClick={() => { setFile(null); setCvTersimpan(null); setFileError(''); }}>Ganti</button>}
                    </div>
                    {proses && <div className="pob001-up-bar" role="progressbar" aria-valuenow={proses.persen} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${proses.persen}%` }} /></div>}
                    {fileError && <div className="pm001-error" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>{fileError}</div>}
                    <div className="pob001-after">{proses ? 'Mohon tunggu, jangan tutup halaman ini. Biasanya selesai dalam beberapa detik.' : 'Setelah ini kami baca CV kamu dan tanya preferensi kerja.'}</div>
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
                <div className="pob001-eyebrow">Pertanyaan 1 dari 3</div>
                <h1>Posisi apa yang kamu cari?</h1>
                <p className="pob001-lead">Boleh pilih lebih dari satu, maksimal {MAKS_PILIHAN}. Kalau posisinya belum ada, ketik lalu tambahkan sendiri.</p>
                <PilihanMultiChip
                  rekomendasi={POSISI_REKOMENDASI}
                  value={posisi}
                  onChange={setPosisi}
                  placeholder="Ketik posisi lain, lalu Enter untuk menambah"
                  label="Cari atau tambah posisi"
                />
              </>
            )}

            {stage === 'lokasi' && (
              <>
                <div className="pob001-eyebrow">Pertanyaan 2 dari 3</div>
                <h1>Di mana kamu mau bekerja?</h1>
                <p className="pob001-lead">Pilih kota yang kamu mau, maksimal {MAKS_PILIHAN}. Kalau kotamu belum ada, ketik lalu tambahkan sendiri.</p>
                <PilihanMultiChip
                  rekomendasi={LOKASI_REKOMENDASI}
                  value={lokasi}
                  onChange={setLokasi}
                  placeholder="Ketik kota atau daerah lain, lalu Enter"
                  label="Cari atau tambah lokasi"
                  ikonLokasi
                  labelChip={(l) => (l === 'Remote' ? 'Remote (seluruh Indonesia)' : l)}
                />
              </>
            )}

            {stage === 'gaji' && (
              <>
                <div className="pob001-eyebrow">Pertanyaan 3 dari 3</div>
                <h1>Berapa gaji yang kamu harapkan?</h1>
                <p className="pob001-lead">Perkiraan gaji bulanan minimum. Ini hanya untuk menyaring, bukan angka final.</p>
                <div className="pob001-gaji">
                  <div className="pob001-gaji-label">Minimal per bulan</div>
                  <label className="pob001-money">
                    <span>Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      aria-label="Gaji minimal per bulan (Rupiah)"
                      value={gaji > 0 ? gaji.toLocaleString('id-ID') : ''}
                      onChange={(e) => setGaji(Math.min(999_999_999, Number(e.target.value.replace(/\D/g, '')) || 0))}
                    />
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

            {stage === 'selesai' && (
              <>
                <h1>Profil kamu siap</h1>
                <p className="pob001-lead">Mulai sekarang, setiap lowongan yang kamu buka menampilkan skor kecocokan dengan CV kamu.</p>
                <dl className="pob001-summary">
                  <div><dt>CV</dt><dd>{file?.name}</dd></div>
                  <div><dt>Posisi</dt><dd>{posisi.join(', ')}</dd></div>
                  <div><dt>Lokasi</dt><dd>{lokasi.join(', ')}</dd></div>
                  <div><dt>Gaji</dt><dd>Minimal {rupiah(gaji)} / bulan{nego ? ' · bisa nego' : ''}</dd></div>
                </dl>
                {galatSimpan && <div className="pm001-error" role="alert" style={{ marginTop: 14, marginBottom: 0 }}>{galatSimpan}</div>}
                <div style={{ marginTop: 14 }}>
                  <button type="button" className="pob001-link" onClick={() => setStage('posisi')}>Ubah jawaban</button>
                </div>
              </>
            )}
          </div>

          <div className="pob001-nav">
            {idx > 0 && idx < 4 && (
              <button type="button" className="pob001-btn ghost" onClick={() => setStage(STAGES[idx - 1])}><IconArrow dir="left" />Kembali</button>
            )}
            <button type="button" className="pob001-btn primary" disabled={tidakBisaLanjut} onClick={lanjut}>{labelLanjut}<IconArrow /></button>
          </div>
          {tidakBisaLanjut && <div className="pob001-hint">{petunjuk}</div>}
        </div>
      </div>
    </div>
  );
}
