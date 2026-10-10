import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { supabase } from '../../../config/supabase.js';
import { ID_REGIONS } from '../../../utils/idRegions.js';
import '../../../../css/mobile/getting-started-profil.css';

/*
  Prototipe klik-tembus "Getting Started — Profil Perusahaan". Form "Isi
  Data" beneran menyimpan ke Supabase (tabel `companies`, field yang sama
  dipakai useAkunProfilData.js — nama, deskripsi, industri, ukuran, lokasi,
  telepon_kontak, logo_url) begitu step 'form' selesai, termasuk unggah logo
  ke Storage bucket `company_assets`. Nama perusahaan, id perusahaan & user
  diambil dari useAuth(), bukan dummy. Section ini TERPISAH dari Getting Started Lowongan
  (lihat ../getting-started-lowongan/GettingStartedLowongan.jsx) — menyusul
  setelah "Sebarkan Lowongannya" selesai, dengan penanda visual sendiri,
  bukan lanjutan bernomor dari journey itu.

  Dituju lewat navigate('getting-started-profil') dari ScreenSelesai di
  GettingStartedLowongan.jsx (navigasi SPA, bukan reload penuh), dan tombol
  "Buka Beranda" di layar akhir mengantar balik ke Beranda ASLI lewat prop
  `navigate`. Tidak ada gate otomatis terpisah untuk section ini — begitu
  entry point manapun ke sini (skip di ScreenWelcome atau "Lengkapi
  Sekarang" di ScreenSelesai Lowongan) sudah lebih dulu memanggil onExit
  Lowongan, jadi flow "Getting Started" gabungan tidak akan ter-trigger
  ulang di sesi yang sama — data yang sudah tersimpan di Supabase pun bikin
  section ini tidak relevan lagi untuk dibuka ulang.
*/

const INDUSTRI_OPTS = ['Teknologi & Digital', 'Retail & E-commerce', 'Manufaktur', 'Jasa Keuangan', 'Pendidikan', 'Kesehatan', 'Media & Kreatif', 'Lainnya'];

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5 19.5 9.5 8 21H3v-5Z" /></svg>
);
const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconExternal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></svg>
);
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
);
const IconText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" /></svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
);

function initialsOf(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

export default function GettingStartedProfil({ navigate }) {
  const { companyName, companyId, companyDetails, user, refreshCompanyData } = useAuth();
  const displayCompany = companyName || 'Perusahaan Kamu';

  // Tur produk (MobileTourGuide) dipicu tiap pintu keluar Getting Started
  // yang berujung ke Beranda; tampil sekali saja, dijaga di MobileTourGuide.
  const goBeranda = () => { localStorage.setItem('luna_trigger_tour', 'true'); navigate?.('beranda_002'); };
  const [step, setStep] = useState('intro'); // 'intro' | 'form' | 'selesai'

  return (
    <div className="msh-fullscreen-panel open gsp-panel">
      {step === 'intro' && <ScreenIntro onNext={() => setStep('form')} onSkip={goBeranda} company={displayCompany} />}
      {step === 'form' && (
        <ScreenForm
          onNext={() => setStep('selesai')}
          company={displayCompany}
          companyId={companyId}
          companyDetails={companyDetails}
          user={user}
          refreshCompanyData={refreshCompanyData}
        />
      )}
      {step === 'selesai' && <ScreenSelesai onDone={goBeranda} company={displayCompany} />}
    </div>
  );
}

/* ── 1. Kenapa Ini Penting (value-prop) ── */
function ScreenIntro({ onNext, onSkip, company }) {
  return (
    <>
      <div className="gsp-body" style={{ paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))' }}>
        <span className="gsp-kicker">Profil Perusahaan</span>
        <h2 className="gsp-h2">Profil perusahaan membentuk kepercayaan kandidat</h2>
        <p className="gsp-p">Kandidat tidak hanya menilai posisi yang ditawarkan, tetapi juga perusahaan yang merekrut.</p>

        <div className="gsp-proof">
          <div className="gsp-proof-card before">
            <span className="gsp-proof-tag">Profil kosong</span>
            <div className="gsp-proof-avatar">?</div>
            <div className="gsp-proof-name">Nama Perusahaan</div>
            <div className="gsp-proof-line" />
            <div className="gsp-proof-line short" />
          </div>
          <div className="gsp-proof-card after">
            <span className="gsp-proof-tag">Profil lengkap</span>
            <div className="gsp-proof-avatar">{initialsOf(company)}</div>
            <div className="gsp-proof-name">{company}</div>
            <div className="gsp-proof-line" />
            <div className="gsp-proof-line short" />
          </div>
        </div>

        <div className="gsp-stat-inline">
          <b>75%</b>
          <span>pencari kerja mempelajari profil perusahaan sebelum memutuskan untuk melamar.</span>
        </div>

        <div className="gsp-list">
          <div className="gsp-item">
            <div className="gsp-item-ic"><IconImage /></div>
            <div><div className="gsp-item-t">Logo dan identitas visual</div><div className="gsp-item-d">Membangun kesan pertama yang profesional bagi kandidat.</div></div>
          </div>
          <div className="gsp-item">
            <div className="gsp-item-ic"><IconText /></div>
            <div><div className="gsp-item-t">Deskripsi singkat perusahaan</div><div className="gsp-item-d">Menjelaskan nilai dan alasan kandidat tertarik bergabung.</div></div>
          </div>
          <div className="gsp-item">
            <div className="gsp-item-ic"><IconGlobe /></div>
            <div><div className="gsp-item-t">Tampil di laman karier</div><div className="gsp-item-d">Setelah disimpan, informasi langsung diperbarui di laman karier perusahaan.</div></div>
          </div>
        </div>
      </div>
      <div className="gsp-footer">
        <button className="gsp-btn gsp-btn-primary" onClick={onNext}>Lanjutkan</button>
        <button className="gsp-skip-link" onClick={onSkip}>Nanti saja, ke Beranda</button>
      </div>
    </>
  );
}

/* ── 2. Isi Data (form + preview live) ── */
// Field wajib: nama, industri (+ detail kalau "Lainnya"), ukuran,
// lokasi — tombol Simpan disabled sampai semuanya terisi. Nomor WhatsApp
// tetap opsional. Logo diunggah langsung ke bucket Storage `company_assets`
// (pola sama dengan useAkunProfilData.js) begitu dipilih — bukan nunggu klik
// Simpan — supaya kalau upload gagal, user tahu dari situ juga, bukan pas
// klik Simpan.
// Cari index INDUSTRI_OPTS yang cocok sama nilai `industri` yang sudah
// tersimpan di companyDetails — kalau nilainya custom (dulu diisi lewat
// "Lainnya" dan disimpan sebagai teks bebas, bukan literal "Lainnya"),
// perlakukan sebagai "Lainnya" + isi ulang teksnya ke field detail.
function resolveIndustriIdx(savedValue) {
  if (!savedValue) return -1;
  const idx = INDUSTRI_OPTS.indexOf(savedValue);
  if (idx >= 0) return idx;
  return INDUSTRI_OPTS.indexOf('Lainnya');
}

function ScreenForm({ onNext, company, companyId, companyDetails, user, refreshCompanyData }) {
  const initIndustriIdx = resolveIndustriIdx(companyDetails?.industri);
  const [nama, setNama] = useState(companyDetails?.name || company);
  const [deskripsi, setDeskripsi] = useState(companyDetails?.deskripsi || '');
  const [industriIdx, setIndustriIdx] = useState(initIndustriIdx); // -1 = belum dipilih
  const [industriLainnya, setIndustriLainnya] = useState(
    initIndustriIdx >= 0 && INDUSTRI_OPTS[initIndustriIdx] === 'Lainnya' && companyDetails?.industri !== 'Lainnya'
      ? companyDetails?.industri || ''
      : ''
  );
  const [ukuran, setUkuran] = useState(companyDetails?.ukuran || '');
  const [lokasi, setLokasi] = useState(companyDetails?.lokasi || '');
  const [lokasiSuggestions, setLokasiSuggestions] = useState([]);
  const [lokasiListOpen, setLokasiListOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState(companyDetails?.telepon_kontak || '');
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [industriSheetOpen, setIndustriSheetOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(companyDetails?.logo_url || '');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState(null);
  const fileInputRef = useRef(null);
  const lokasiInputRef = useRef(null);

  const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  // Autocomplete lokasi — pakai daftar statis ID_REGIONS yang sama dengan
  // dropdown "Lokasi" di InlineEditRow.jsx (versi desktop), bukan API luar.
  const handleLokasiChange = (val) => {
    setLokasi(val);
    if (!val.trim()) { setLokasiSuggestions([]); return; }
    const q = val.toLowerCase();
    setLokasiSuggestions(ID_REGIONS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 8));
  };
  const selectLokasi = (r) => {
    setLokasi(r.type === 'city' && r.province ? `${r.name}, ${r.province}` : r.name);
    setLokasiSuggestions([]);
    setLokasiListOpen(false);
    touch('lokasi');
  };

  const initials = initialsOf(nama);
  const industriPilihan = industriIdx >= 0 ? INDUSTRI_OPTS[industriIdx] : '';
  const isLainnya = industriPilihan === 'Lainnya';
  const industriFinal = isLainnya ? industriLainnya.trim() : industriPilihan;
  const metaParts = [industriFinal, lokasi].filter(Boolean);

  const errors = {
    nama: !nama.trim(),
    industri: industriIdx < 0 || (isLainnya && !industriLainnya.trim()),
    ukuran: !ukuran,
    lokasi: !lokasi.trim(),
  };
  const isValid = !Object.values(errors).some(Boolean);

  const handleLogoPick = () => fileInputRef.current?.click();

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!companyId) {
      setLogoError('Perusahaan tidak ditemukan — coba muat ulang halaman.');
      return;
    }
    setLogoUploading(true);
    setLogoError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${companyId}/logo/${fileName}`;
      const { error } = await supabase.storage.from('company_assets').upload(filePath, file);
      if (error) throw error;
      setLogoUrl(`${supabase.supabaseUrl}/storage/v1/object/public/company_assets/${filePath}`);
    } catch (err) {
      console.error(err);
      setLogoError('Gagal unggah logo. Coba lagi.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    setTouched({ nama: true, industri: true, ukuran: true, lokasi: true });
    if (!isValid || saving) return;
    if (!companyId) {
      setSaveError('Perusahaan tidak ditemukan — coba muat ulang halaman.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const payload = {
      name: nama.trim(),
      deskripsi: deskripsi.trim(),
      industri: industriFinal,
      ukuran,
      lokasi: lokasi.trim(),
      ...(whatsapp.trim() ? { telepon_kontak: whatsapp.trim() } : {}),
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    };
    const { error } = await supabase.from('companies').update(payload).eq('id', companyId);
    setSaving(false);
    if (error) {
      console.error(error);
      setSaveError('Gagal menyimpan data. Coba lagi.');
      return;
    }
    if (refreshCompanyData && user?.id) await refreshCompanyData(user.id);
    onNext();
  };

  return (
    <>
      <div className="gsp-top"><span className="gsp-step">Profil Perusahaan</span></div>
      <div className="gsp-body">

        <div className="gsp-avatar-upload">
          <button type="button" className="gsp-avatar-circle" aria-label="Ubah logo" onClick={handleLogoPick} disabled={logoUploading}>
            {logoUrl ? (
              <img className="fill img" src={logoUrl} alt="" />
            ) : (
              <div className="fill">{initials}</div>
            )}
            <div className="gsp-avatar-badge">{logoUploading ? <span className="gsp-spin"><IconSpinner /></span> : <IconCamera />}</div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          <div className="gsp-avatar-hint">{logoUploading ? 'Mengunggah…' : 'Ketuk untuk unggah logo'}</div>
          {logoError && <div className="gsp-field-err">{logoError}</div>}
        </div>

        <div className="gsp-field">
          <label>Nama Perusahaan <span className="prefill">Dari data daftar</span></label>
          <input
            className={`gsp-inp${touched.nama && errors.nama ? ' err' : ''}`}
            value={nama}
            onChange={e => setNama(e.target.value)}
            onBlur={() => touch('nama')}
          />
          {touched.nama && errors.nama && <div className="gsp-field-err">Nama perusahaan wajib diisi.</div>}
        </div>

        <div>
          <div className="gsp-sec-eyebrow">Cerita Singkat</div>
          <div className="gsp-field" style={{ marginTop: 9 }}>
            <label>Deskripsi Perusahaan <span className="opt">(opsional)</span></label>
            <textarea
              className="gsp-txa"
              placeholder="Studio desain yang bikin brand digital tampil beda…"
              value={deskripsi}
              maxLength={160}
              onChange={e => setDeskripsi(e.target.value)}
            />
            <div className="gsp-char-hint">{deskripsi.length}/160</div>
          </div>
        </div>

        <div>
          <div className="gsp-sec-eyebrow">Detail Perusahaan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 9 }}>
            <div className="gsp-field">
              <label>Industri <span className="req">*</span></label>
              <button
                type="button"
                className={`gsp-pick-field${touched.industri && errors.industri ? ' err' : ''}`}
                onClick={() => setIndustriSheetOpen(true)}
              >
                <span className={industriPilihan ? '' : 'ph'}>{industriPilihan || 'Pilih industri'}</span>
                <IconChevronDown />
              </button>
              {isLainnya && (
                <input
                  className={`gsp-inp${touched.industri && errors.industri ? ' err' : ''}`}
                  style={{ marginTop: 8 }}
                  placeholder="Sebutkan industrinya"
                  value={industriLainnya}
                  onChange={e => setIndustriLainnya(e.target.value)}
                  onBlur={() => touch('industri')}
                  autoFocus
                />
              )}
              {touched.industri && errors.industri && (
                <div className="gsp-field-err">{isLainnya ? 'Sebutkan industrinya.' : 'Pilih salah satu industri.'}</div>
              )}
            </div>
            <div className="gsp-field">
              <label>Ukuran Perusahaan <span className="req">*</span></label>
              <div className="gsp-seg">
                {['1–10', '11–50', '51–200', '200+'].map(opt => (
                  <button key={opt} type="button" className={`gsp-seg-opt${ukuran === opt ? ' sel' : ''}`} onClick={() => { setUkuran(opt); touch('ukuran'); }}>{opt}</button>
                ))}
              </div>
              {touched.ukuran && errors.ukuran && <div className="gsp-field-err">Pilih ukuran perusahaan.</div>}
            </div>
            <div className="gsp-field">
              <label>Lokasi <span className="req">*</span></label>
              <input
                ref={lokasiInputRef}
                className={`gsp-inp${touched.lokasi && errors.lokasi ? ' err' : ''}`}
                placeholder="Ketik nama kota atau provinsi…"
                value={lokasi}
                onChange={e => handleLokasiChange(e.target.value)}
                onFocus={() => setLokasiListOpen(true)}
                onBlur={() => { touch('lokasi'); setTimeout(() => setLokasiListOpen(false), 150); }}
              />
              {touched.lokasi && errors.lokasi && <div className="gsp-field-err">Lokasi wajib diisi.</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="gsp-sec-eyebrow">Kontak <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: 'var(--luna-ink-300)' }}>(opsional)</span></div>
          <div className="gsp-field" style={{ marginTop: 9 }}>
            <label>Nomor WhatsApp</label>
            <input className="gsp-inp" placeholder="08xx-xxxx-xxxx" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
        </div>

        <div className="gsp-browser">
          <div className="gsp-browser-bar">
            <span className="gsp-browser-dot" /><span className="gsp-browser-dot" /><span className="gsp-browser-dot" />
            <span className="gsp-browser-url">https://karir.lunasys.ai/...</span>
          </div>
          <div className="gsp-browser-body">
            <div className="gsp-prev-head">
              <div className="gsp-prev-logo filled">{initials}</div>
              <div>
                <div className="gsp-prev-name">{nama || 'Nama Perusahaan'}</div>
                <div className="gsp-prev-meta">{metaParts.join(' · ') || 'Isi industri & lokasi di atas'}</div>
              </div>
            </div>
            <div className={`gsp-prev-desc${deskripsi ? '' : ' placeholder'}`}>
              {deskripsi || 'Deskripsi perusahaan akan tampil di sini begitu kamu mengetik…'}
            </div>
          </div>
        </div>

      </div>
      <div className="gsp-footer">
        {saveError && <div className="gsp-save-error">{saveError}</div>}
        <button className="gsp-btn gsp-btn-primary" onClick={handleSave} disabled={!isValid || saving}>
          {saving ? <span className="gsp-spin"><IconSpinner /></span> : null}
          {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>

      {/* Bottom sheet standar (sama seperti picker di MobileBuatLowonganForm.jsx)
          — dulu tombol Industri cuma cycle ke opsi berikutnya tiap diklik,
          bukan benar-benar nampilkan daftar pilihan. */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${industriSheetOpen ? ' open' : ''}`} onClick={() => setIndustriSheetOpen(false)} />
          <div className={`msh-sheet${industriSheetOpen ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            <div className="gsp-sheet-title">Pilih Industri</div>
            {INDUSTRI_OPTS.map((opt, i) => (
              <button
                key={opt}
                className="gsp-sheet-opt"
                onClick={() => { setIndustriIdx(i); if (opt !== 'Lainnya') touch('industri'); setIndustriSheetOpen(false); }}
              >
                <span>{opt}</span>
                {industriIdx === i && <IconCheck />}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {/* Dropdown autocomplete Lokasi — di-portal ke document.body & dipatok
          posisinya (fixed) ke bounding rect input, sama seperti dropdown
          lokasi di InlineEditRow.jsx (desktop). Perlu portal karena elemen
          sibling di .gsp-body punya animasi fly-in (transform) yang bikin
          stacking context baru, jadi z-index lokal saja tidak cukup buat
          naik di atas field-field sesudahnya (Ukuran/Kontak dsb). */}
      {lokasiListOpen && lokasi.trim() && lokasiInputRef.current && createPortal(
        (() => {
          const rect = lokasiInputRef.current.getBoundingClientRect();
          return (
            <div className="gsp-loc-dropdown" style={{ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width }}>
              {lokasiSuggestions.length === 0 ? (
                <div className="gsp-loc-empty">Tidak ada kota/daerah ditemukan</div>
              ) : lokasiSuggestions.map((r, i) => (
                <button
                  type="button"
                  key={i}
                  className="gsp-loc-opt"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectLokasi(r)}
                >
                  <span>{r.name}{r.province ? `, ${r.province}` : ''}</span>
                  <span className="tag">{r.type === 'city' ? 'Kota/Kab' : 'Provinsi'}</span>
                </button>
              ))}
            </div>
          );
        })(),
        document.body
      )}
    </>
  );
}

/* ── 3. Selesai ── */
function ScreenSelesai({ onDone, company }) {
  const slug = company.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'perusahaan-kamu';
  return (
    <>
      <div className="gsp-body">
        <div className="gsp-conf-hero">
          <div className="gsp-conf-ring"><IconCheck /></div>
          <h2 className="gsp-h2">Profil perusahaan kamu sudah tayang</h2>
          <p className="gsp-p">{company} sekarang punya identitas lengkap di mata kandidat.</p>
        </div>

        <div className="gsp-browser">
          <div className="gsp-browser-bar">
            <span className="gsp-browser-dot" /><span className="gsp-browser-dot" /><span className="gsp-browser-dot" />
            <span className="gsp-browser-url">https://karir.lunasys.ai/...</span>
          </div>
          <div className="gsp-browser-body">
            <div className="gsp-prev-head">
              <div className="gsp-prev-logo filled">{initialsOf(company)}</div>
              <div><div className="gsp-prev-name">{company}</div><div className="gsp-prev-meta">Teknologi &amp; Digital · Jakarta</div></div>
            </div>
            <div className="gsp-prev-desc">Studio desain yang bikin brand digital tampil beda, dikerjakan tim kecil yang gerak cepat.</div>
          </div>
        </div>

        <div className="gsp-link-box">
          <span className="u">karir.lunasys.ai/{slug}</span>
          <div className="gsp-link-actions">
            <button type="button" className="gsp-link-act"><IconCopy />Salin</button>
            <span className="div" />
            <button type="button" className="gsp-link-act view"><IconExternal />Lihat</button>
          </div>
        </div>
      </div>
      <div className="gsp-footer">
        <button className="gsp-btn gsp-btn-primary" onClick={onDone}>Buka Beranda</button>
      </div>
    </>
  );
}
