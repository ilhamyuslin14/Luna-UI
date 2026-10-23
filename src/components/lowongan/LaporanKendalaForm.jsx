import { ALASAN_LAPORAN } from '../../data/lowonganEksternalConfig.js';
import '../../../css/lowongan/laporan-kendala.css';

// Isi dialog "Laporkan kendala" untuk lowongan eksternal. Dipakai di modal
// (desktop) dan bottom sheet (mobile); pembungkusnya yang beda, formnya sama.
export default function LaporanKendalaForm({ laporan }) {
  const { alasan, setAlasan, catatan, setCatatan, state, kirimLaporan, tutupLaporan } = laporan;
  const sending = state === 'sending';

  if (state === 'done') {
    return (
      <div className="lkd-done">
        <span className="lkd-done-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <h4>Terima kasih atas laporanmu</h4>
        <p>Tim kami akan memeriksa lowongan ini dan menonaktifkannya kalau memang sudah tidak tersedia.</p>
        <button type="button" className="lkd-btn primary" onClick={tutupLaporan}>Tutup</button>
      </div>
    );
  }

  return (
    <div className="lkd-form">
      <h4 className="lkd-title">Laporkan kendala</h4>
      <p className="lkd-sub">Bantu kami menjaga daftar lowongan tetap akurat. Pilih kendala yang kamu temui.</p>

      <div className="lkd-options" role="radiogroup" aria-label="Jenis kendala">
        {ALASAN_LAPORAN.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={alasan === opt.value}
            className={`lkd-option${alasan === opt.value ? ' active' : ''}`}
            onClick={() => setAlasan(opt.value)}
          >
            <span className="lkd-radio" />
            {opt.label}
          </button>
        ))}
      </div>

      <label className="lkd-label" htmlFor="lkd-catatan">Catatan tambahan <span>(opsional)</span></label>
      <textarea
        id="lkd-catatan"
        className="lkd-textarea"
        rows={3}
        maxLength={300}
        placeholder="Ceritakan singkat apa yang terjadi…"
        value={catatan}
        onChange={e => setCatatan(e.target.value)}
      />

      {state === 'error' && <div className="lkd-error">Laporan belum terkirim. Coba lagi sebentar lagi.</div>}

      <div className="lkd-actions">
        <button type="button" className="lkd-btn" onClick={tutupLaporan} disabled={sending}>Batal</button>
        <button type="button" className="lkd-btn primary" onClick={kirimLaporan} disabled={!alasan || sending}>
          {sending ? 'Mengirim…' : 'Kirim Laporan'}
        </button>
      </div>
    </div>
  );
}
