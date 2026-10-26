// MOCKUP: salinan PelamarOnboarding_001 untuk presentasi. Tidak ada login/pendaftaran sungguhan; tombol hanya berpindah layar.
import { useState } from 'react';
import '../../../css/pelamar/pelamar-masuk_001.css';
import '../../../css/pelamar/pelamar-onboarding_001.css';

// MOCKUP onboarding pelamar setelah verifikasi OTP: langkah 1 unggah CV (wajib, dasar penilaian
// kecocokan), langkah 2 tiga pertanyaan satu per satu (posisi, lokasi, gaji). Belum ada yang
// disimpan: file CV tidak diunggah dan jawaban hilang saat halaman ditutup. Bisa dibuka langsung
// lewat /?view=pelamar-onboarding. Tampilannya mengikuti gaya Daftar/Masuk/OTP pelamar (pm001-*).
const STAGES = ['cv', 'posisi', 'lokasi', 'gaji', 'selesai'];
const MAKS_PILIHAN = 5;
const MAKS_BYTES = 5 * 1024 * 1024;
const GAJI_MIN = 2_000_000;
const GAJI_MAX = 20_000_000;

const POSISI_REKOMENDASI = ['Content Writer', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Desainer Grafis', 'Digital Marketing', 'Social Media Specialist', 'Admin Operasional', 'Customer Service', 'Staf HR', 'Akuntan', 'Sales Executive', 'Data Analyst', 'Staf Gudang', 'Kasir'];
const LOKASI_REKOMENDASI = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Malang', 'Denpasar', 'Makassar', 'Remote'];

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const ukuranFile = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const sama = (a, b) => a.toLowerCase() === b.trim().toLowerCase();

const IconCheck = ({ size = 14, width = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconArrow = ({ dir = 'right' }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'right' ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
);

// Input teks yang sekaligus mencari di chip rekomendasi dan menambah pilihan baru
// kalau yang diketik belum ada (Enter atau tombol Tambah).
function PilihanMulti({ rekomendasi, custom, terpilih, query, setQuery, onToggle, onTambah, placeholder, label, ikonLokasi, labelChip }) {
  const semua = [...custom, ...rekomendasi];
  const q = query.trim();
  const tampil = semua.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
  const bisaTambah = q !== '' && !semua.some((x) => sama(x, q));
  const penuh = terpilih.length >= MAKS_PILIHAN;
  const tambahMati = q === '' || (penuh && !terpilih.some((x) => sama(x, q)));

  return (
    <>
      <div className="pob001-search">
        <IconSearch />
        <input
          type="text"
          placeholder={placeholder}
          aria-label={label}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onTambah(); } }}
        />
        <button type="button" className="pob001-add" disabled={tambahMati} onClick={onTambah}>Tambah</button>
      </div>

      <div className="pob001-chips">
        {tampil.map((item) => {
          const on = terpilih.includes(item);
          return (
            <button type="button" key={item} className={`pob001-chip${on ? ' on' : ''}`} aria-pressed={on} disabled={!on && penuh} onClick={() => onToggle(item)}>
              {on ? <IconCheck /> : ikonLokasi && <IconPin />}
              {labelChip ? labelChip(item) : item}
            </button>
          );
        })}
      </div>

      {bisaTambah && (
        <div className="pob001-addrow">
          <button type="button" className="pob001-chip new" disabled={penuh} onClick={onTambah}>+ Tambah “{q}”</button>
        </div>
      )}
      <div className="pob001-count">{terpilih.length} dari {MAKS_PILIHAN} dipilih</div>
    </>
  );
}

export default function PelamarOnboardingMock({ navigate }) {
  const [stage, setStage] = useState('cv');
  const [file, setFile] = useState(null); // { name, size }
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [posisi, setPosisi] = useState([]);
  const [posisiCustom, setPosisiCustom] = useState([]);
  const [posisiQuery, setPosisiQuery] = useState('');
  const [lokasi, setLokasi] = useState([]);
  const [lokasiCustom, setLokasiCustom] = useState([]);
  const [lokasiQuery, setLokasiQuery] = useState('');
  const [gaji, setGaji] = useState(5_000_000);
  const [nego, setNego] = useState(false);

  const idx = STAGES.indexOf(stage);

  const terimaFile = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx?)$/i.test(f.name)) { setFileError('Format tidak didukung. Gunakan PDF, DOC, atau DOCX.'); return; }
    if (f.size > MAKS_BYTES) { setFileError('Ukuran file melebihi 5 MB.'); return; }
    setFile({ name: f.name, size: ukuranFile(f.size) });
    setFileError('');
  };

  const toggle = (list, setList) => (item) => setList((cur) => (cur.includes(item) ? cur.filter((x) => x !== item) : (cur.length < MAKS_PILIHAN ? [...cur, item] : cur)));

  const tambah = ({ query, setQuery, rekomendasi, custom, setCustom, terpilih, setTerpilih }) => () => {
    let raw = query.trim().replace(/\s+/g, ' ');
    if (!raw) return;
    if (raw === raw.toLowerCase()) raw = raw.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    const ada = [...rekomendasi, ...custom].find((x) => sama(x, raw));
    const nama = ada || raw;
    if (!terpilih.includes(nama) && terpilih.length >= MAKS_PILIHAN) return;
    if (!ada) setCustom((cur) => [...cur, nama]);
    setTerpilih((cur) => (cur.includes(nama) ? cur : [...cur, nama]));
    setQuery('');
  };

  const gajiSlider = Math.min(GAJI_MAX, Math.max(GAJI_MIN, gaji));

  let tidakBisaLanjut = false;
  let petunjuk = '';
  let labelLanjut = 'Lanjut';
  if (stage === 'cv') { tidakBisaLanjut = !file; petunjuk = 'Unggah CV dulu untuk melanjutkan.'; }
  if (stage === 'posisi') { tidakBisaLanjut = posisi.length === 0; petunjuk = 'Pilih minimal satu posisi.'; }
  if (stage === 'lokasi') { tidakBisaLanjut = lokasi.length === 0; petunjuk = 'Pilih minimal satu lokasi.'; }
  if (stage === 'gaji') { tidakBisaLanjut = !(gaji > 0); petunjuk = 'Isi perkiraan gaji dulu.'; labelLanjut = 'Selesai'; }
  if (stage === 'selesai') labelLanjut = 'Mulai cari lowongan';

  const lanjut = () => {
    if (tidakBisaLanjut) return;
    if (stage === 'selesai') { navigate?.('semua-lowongan_002'); return; }
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
                      onClick={(e) => { e.preventDefault(); setFile({ name: 'CV_Dina_Pratama.pdf', size: '482 KB' }); setFileError(''); }}
                    >
                      <span className="pob001-drop-ic">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
                      </span>
                      <b>Tarik file ke sini, atau <u>pilih dari perangkat</u></b>
                      <span>PDF, DOC, atau DOCX · maksimal 5 MB</span>
                      
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
                        <div className="pob001-file-ok"><IconCheck size={14} width={3} />Terunggah · {file.size}</div>
                      </div>
                      <button type="button" className="pob001-link" onClick={() => setFile(null)}>Ganti</button>
                    </div>
                    <div className="pob001-after">Siap. Di langkah berikutnya kami tanya preferensi kerja kamu.</div>
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
                <PilihanMulti
                  rekomendasi={POSISI_REKOMENDASI}
                  custom={posisiCustom}
                  terpilih={posisi}
                  query={posisiQuery}
                  setQuery={setPosisiQuery}
                  onToggle={toggle(posisi, setPosisi)}
                  onTambah={tambah({ query: posisiQuery, setQuery: setPosisiQuery, rekomendasi: POSISI_REKOMENDASI, custom: posisiCustom, setCustom: setPosisiCustom, terpilih: posisi, setTerpilih: setPosisi })}
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
                <PilihanMulti
                  rekomendasi={LOKASI_REKOMENDASI}
                  custom={lokasiCustom}
                  terpilih={lokasi}
                  query={lokasiQuery}
                  setQuery={setLokasiQuery}
                  onToggle={toggle(lokasi, setLokasi)}
                  onTambah={tambah({ query: lokasiQuery, setQuery: setLokasiQuery, rekomendasi: LOKASI_REKOMENDASI, custom: lokasiCustom, setCustom: setLokasiCustom, terpilih: lokasi, setTerpilih: setLokasi })}
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
