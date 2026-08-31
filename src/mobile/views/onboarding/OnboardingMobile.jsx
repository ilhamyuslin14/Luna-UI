import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { supabase } from '../../../config/supabase.js';
import { DROPDOWN_OPTIONS } from '../../../utils/dropdownOptions.js';
import '../../../../css/mobile/onboarding.css';

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

function formatWaDigits(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  if (digits.length > 7) return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
  if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3);
  return digits;
}

export default function OnboardingMobile() {
  const { user, companyId, refreshCompanyData } = useAuth();

  const [step, setStep] = useState('company'); // company -> contact -> success
  const [industri, setIndustri] = useState('');
  const [industriLainnya, setIndustriLainnya] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [noWa, setNoWa] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [enteringBeranda, setEnteringBeranda] = useState(false);

  const finalIndustri = industri === 'Lainnya' ? industriLainnya.trim() : industri;
  const step1Valid = !!industri && (industri !== 'Lainnya' || industriLainnya.trim().length > 0) && !!ukuran;
  const step2Valid = lokasi.trim().length > 0;

  const handleSubmit = async () => {
    if (!step2Valid || isSaving) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      if (companyId) {
        const { error: companyErr } = await supabase
          .from('companies')
          .update({ industri: finalIndustri, ukuran, lokasi: lokasi.trim() })
          .eq('id', companyId);
        if (companyErr) throw companyErr;
      }

      const rawWa = noWa.replace(/\D/g, '');
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ no_wa: rawWa || null, onboarding_completed: true })
        .eq('id', user.id);
      if (profileErr) throw profileErr;

      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMasukBeranda = async () => {
    setEnteringBeranda(true);
    await refreshCompanyData(user.id);
  };

  return (
    <div className="msh-fullscreen-panel open onbm-panel">
      <div className="onbm-rail">
        <div className="onbm-rail-fill" style={{ width: step === 'contact' || step === 'success' ? '100%' : '50%' }} />
      </div>

      {step === 'company' && (
        <>
          <div className="onbm-top">
            <span className="onbm-progress-label">Langkah 1 dari 2</span>
          </div>

          <div className="onbm-body">
            <h2 className="onbm-question">Cerita dulu soal perusahaan kamu</h2>
            <p className="onbm-subnote">Biar Luna kasih rekomendasi kriteria &amp; kandidat yang pas buat tim ini.</p>

            <label className="onbm-label">Industri Perusahaan</label>
            <button
              type="button"
              className={`onbm-pick-field${industri ? ' filled' : ''}`}
              onClick={() => setSheetOpen(true)}
            >
              <span>{industri || 'Pilih industri'}</span>
              <IconChevronDown />
            </button>
            {industri === 'Lainnya' && (
              <input
                className="onbm-input"
                style={{ marginTop: 8 }}
                placeholder="Sebutkan industri perusahaan Anda"
                value={industriLainnya}
                onChange={e => setIndustriLainnya(e.target.value)}
              />
            )}

            <label className="onbm-label" style={{ marginTop: 22 }}>Jumlah Karyawan</label>
            <div className="onbm-chip-grid">
              {DROPDOWN_OPTIONS.ukuranPerusahaan.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`onbm-chip${ukuran === opt ? ' active' : ''}`}
                  onClick={() => setUkuran(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="onbm-hint">Jangan khawatir, ini bisa diubah kapan pun lewat Pengaturan.</div>
          </div>

          <div className="onbm-footer">
            <button className="onbm-next-btn" disabled={!step1Valid} onClick={() => setStep('contact')}>
              Lanjutkan<IconChevronRight />
            </button>
          </div>
        </>
      )}

      {step === 'contact' && (
        <>
          <div className="onbm-top">
            <button className="onbm-back" onClick={() => setStep('company')} aria-label="Kembali"><IconBack /></button>
            <span className="onbm-progress-label">Langkah 2 dari 2</span>
          </div>

          <div className="onbm-body">
            <h2 className="onbm-question">Terakhir, di mana &amp; ke mana</h2>
            <p className="onbm-subnote">Supaya tim kamu gampang ditemukan &amp; dihubungi.</p>

            <label className="onbm-label">Lokasi Perusahaan</label>
            <input
              className="onbm-input"
              placeholder="Kota, Provinsi"
              value={lokasi}
              onChange={e => setLokasi(e.target.value)}
            />

            <label className="onbm-label" style={{ marginTop: 18 }}>Nomor WhatsApp <span className="onbm-optional">(Opsional)</span></label>
            <div className="onbm-phone-row">
              <div className="onbm-phone-prefix">+62</div>
              <input
                className="onbm-input"
                inputMode="numeric"
                placeholder="8xx-xxxx-xxxx"
                value={noWa}
                onChange={e => setNoWa(formatWaDigits(e.target.value))}
              />
            </div>

            {errorMsg && <p className="onbm-error">{errorMsg}</p>}
          </div>

          <div className="onbm-footer">
            <button className="onbm-next-btn" disabled={!step2Valid || isSaving} onClick={handleSubmit}>
              {isSaving ? <span className="onbm-spinner" /> : 'Mulai Menggunakan LUNA'}
            </button>
          </div>
        </>
      )}

      {step === 'success' && (
        <div className="onbm-success">
          <div className="onbm-success-badge"><IconCheck /></div>
          <h2 className="onbm-success-title">Semua siap.</h2>
          <p className="onbm-success-sub">Profil perusahaan sudah tersimpan. Mulai buat lowongan pertama kamu.</p>

          <div className="onbm-recap">
            <div className="onbm-recap-row"><span>Industri</span><b>{finalIndustri}</b></div>
            <div className="onbm-recap-row"><span>Jumlah Karyawan</span><b>{ukuran}</b></div>
            <div className="onbm-recap-row"><span>Lokasi</span><b>{lokasi}</b></div>
          </div>

          <button className="onbm-next-btn" style={{ marginTop: 20 }} disabled={enteringBeranda} onClick={handleMasukBeranda}>
            {enteringBeranda ? <span className="onbm-spinner" /> : <>Masuk ke Beranda<IconChevronRight /></>}
          </button>
        </div>
      )}

      <div className={`msh-sheet-overlay${sheetOpen ? ' open' : ''}`} onClick={() => setSheetOpen(false)} />
      <div className={`msh-sheet onbm-sheet${sheetOpen ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="onbm-sheet-title">Pilih Industri Perusahaan</div>
        {DROPDOWN_OPTIONS.industriPerusahaan.map(name => (
          <button
            key={name}
            className={`msh-sheet-item${industri === name ? ' selected' : ''}`}
            onClick={() => { setIndustri(name); setSheetOpen(false); }}
          >
            <span>{name}</span>
            {industri === name && <IconCheck />}
          </button>
        ))}
      </div>
    </div>
  );
}
