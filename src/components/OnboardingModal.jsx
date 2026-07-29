import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../config/supabase.js';
import { DROPDOWN_OPTIONS } from '../utils/dropdownOptions.js';

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="onb-chip-group">
      {options.map(opt => (
        <button
          type="button"
          key={opt}
          className={`onb-chip${value === opt ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// Field ini juga dipakai buat "Lainnya" text follow-up: kalau opsi yang
// dipilih === 'Lainnya', tampilkan input teks buat spesifikasi jawabannya.
function LainnyaInput({ value, onChange, placeholder }) {
  return (
    <input
      className="onb-input onb-lainnya-input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

export default function OnboardingModal() {
  const { user, companyId, onboardingCompleted, refreshCompanyData } = useAuth();

  const [noWa, setNoWa] = useState('');
  const [industri, setIndustri] = useState('');
  const [industriLainnya, setIndustriLainnya] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [jabatanLainnya, setJabatanLainnya] = useState('');
  const [pernahPakaiAts, setPernahPakaiAts] = useState('');
  const [pernahPakaiAtsLainnya, setPernahPakaiAtsLainnya] = useState('');
  const [sumberTahuLuna, setSumberTahuLuna] = useState('');
  const [sumberTahuLunaLainnya, setSumberTahuLunaLainnya] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user || onboardingCompleted) return null;

  const rawWa = noWa.replace(/\D/g, '');
  const isValid = rawWa.length >= 9
    && industri && (industri !== 'Lainnya' || industriLainnya.trim())
    && ukuran
    && lokasi.trim()
    && jabatan && (jabatan !== 'Lainnya' || jabatanLainnya.trim())
    && pernahPakaiAts && (pernahPakaiAts !== 'Lainnya' || pernahPakaiAtsLainnya.trim())
    && sumberTahuLuna && (sumberTahuLuna !== 'Lainnya' || sumberTahuLunaLainnya.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const finalIndustri = industri === 'Lainnya' ? industriLainnya.trim() : industri;
      const finalJabatan = jabatan === 'Lainnya' ? jabatanLainnya.trim() : jabatan;
      const finalPernahPakaiAts = pernahPakaiAts === 'Lainnya' ? pernahPakaiAtsLainnya.trim() : pernahPakaiAts;
      const finalSumberTahuLuna = sumberTahuLuna === 'Lainnya' ? sumberTahuLunaLainnya.trim() : sumberTahuLuna;

      if (companyId) {
        const { error: companyErr } = await supabase
          .from('companies')
          .update({ industri: finalIndustri, ukuran, lokasi: lokasi.trim() })
          .eq('id', companyId);
        if (companyErr) throw companyErr;
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          no_wa: rawWa,
          jabatan_perusahaan: finalJabatan,
          pernah_pakai_ats: finalPernahPakaiAts,
          sumber_tahu_luna: finalSumberTahuLuna,
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (profileErr) throw profileErr;

      await refreshCompanyData(user.id);
      localStorage.setItem('luna_trigger_tour', 'true');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data. Silakan coba lagi.');
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="onb-backdrop">
      <form className="onb-modal" onSubmit={handleSubmit}>
        <div className="onb-header">
          <h2 className="onb-title">Lengkapi Profil Perusahaan Anda</h2>
          <p className="onb-subtitle">Sebelum mulai menggunakan LUNA, bantu kami memahami kebutuhan Anda lewat beberapa pertanyaan singkat berikut.</p>
        </div>

        <div className="onb-body">
          <div className="onb-field">
            <label className="onb-label">Nomor WhatsApp</label>
            <div className="onb-phone-wrap">
              <span className="onb-phone-prefix">+62</span>
              <input
                className="onb-input"
                type="tel"
                inputMode="numeric"
                placeholder="8xx-xxxx-xxxx"
                value={noWa}
                onChange={e => setNoWa(e.target.value.replace(/[^\d-]/g, ''))}
              />
            </div>
          </div>

          <div className="onb-field">
            <label className="onb-label">Industri Perusahaan</label>
            <select className="onb-select" value={industri} onChange={e => setIndustri(e.target.value)}>
              <option value="" disabled>Pilih Industri</option>
              {DROPDOWN_OPTIONS.industriPerusahaan.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {industri === 'Lainnya' && (
              <LainnyaInput value={industriLainnya} onChange={setIndustriLainnya} placeholder="Sebutkan industri perusahaan Anda" />
            )}
          </div>

          <div className="onb-field">
            <label className="onb-label">Jumlah Karyawan</label>
            <ChipGroup options={DROPDOWN_OPTIONS.ukuranPerusahaan} value={ukuran} onChange={setUkuran} />
          </div>

          <div className="onb-field">
            <label className="onb-label">Lokasi Perusahaan</label>
            <input
              className="onb-input"
              type="text"
              placeholder="Kota, Provinsi"
              value={lokasi}
              onChange={e => setLokasi(e.target.value)}
            />
          </div>

          <div className="onb-field">
            <label className="onb-label">Jabatan Anda di Perusahaan</label>
            <ChipGroup options={DROPDOWN_OPTIONS.jabatanPerusahaan} value={jabatan} onChange={setJabatan} />
            {jabatan === 'Lainnya' && (
              <LainnyaInput value={jabatanLainnya} onChange={setJabatanLainnya} placeholder="Sebutkan jabatan Anda" />
            )}
          </div>

          <div className="onb-field">
            <label className="onb-label">Aplikasi Rekrutmen yang Pernah Dipakai</label>
            <ChipGroup options={DROPDOWN_OPTIONS.pernahPakaiAts} value={pernahPakaiAts} onChange={setPernahPakaiAts} />
            {pernahPakaiAts === 'Lainnya' && (
              <LainnyaInput value={pernahPakaiAtsLainnya} onChange={setPernahPakaiAtsLainnya} placeholder="Sebutkan aplikasi yang pernah dipakai" />
            )}
          </div>

          <div className="onb-field">
            <label className="onb-label">Tau LUNA dari Mana?</label>
            <ChipGroup options={DROPDOWN_OPTIONS.sumberTahuLuna} value={sumberTahuLuna} onChange={setSumberTahuLuna} />
            {sumberTahuLuna === 'Lainnya' && (
              <LainnyaInput value={sumberTahuLunaLainnya} onChange={setSumberTahuLunaLainnya} placeholder="Ceritakan dari mana Anda tau LUNA" />
            )}
          </div>
        </div>

        <div className="onb-footer">
          <button type="submit" className="onb-submit" disabled={!isValid || isSaving}>
            {isSaving ? 'Menyimpan...' : 'Mulai Menggunakan LUNA'}
          </button>
          {errorMsg && <p className="onb-error">{errorMsg}</p>}
        </div>
      </form>
    </div>,
    document.body
  );
}
