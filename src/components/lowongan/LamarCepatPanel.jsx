import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { kirimLamaranProfil, sedangMengirim } from '../../services/lamarProfilService.js';
import '../../../css/lowongan/lamar-cepat.css';

// Isi "lamar cepat": ringkasan data profil yang akan dikirim, persetujuan, dan tombol kirim. Dipakai di
// popup (daftar & panel detail lowongan) dan di kartu lamar pada halaman detail lowongan Luna.
// `onFormBiasa` membuka cara lama (form di halaman detail, tab baru) bagi yang memilih mengisi sendiri.
const tanggal = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function LamarCepatPanel({ lp, jabatan, onFormBiasa, onSelesai }) {
  const { pelamarProfile } = useAuth() || {};
  const { status, resume, tandaiSudah, seleksiId } = lp;
  const [phone, setPhone] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [kirim, setKirim] = useState(() => (sedangMengirim(lp.seleksiId) ? 'proses' : 'diam')); // diam | proses | sukses | gagal
  const [pesan, setPesan] = useState('');

  const phoneProfil = (pelamarProfile?.phone || '').trim();
  const butuhPhone = !phoneProfil;
  const phoneOk = !butuhPhone || phone.replace(/\D/g, '').length >= 9;
  const bisaKirim = setuju && phoneOk && kirim !== 'proses';

  // Popup ditutup lalu dibuka lagi saat lamaran masih diproses: sambung ke permintaan yang berjalan.
  useEffect(() => {
    const berjalan = sedangMengirim(seleksiId);
    if (!berjalan) return undefined;
    let aktif = true;
    setKirim('proses');
    berjalan.then(() => { if (aktif) { setKirim('sukses'); onSelesai?.(); } })
      .catch((err) => {
        if (!aktif) return;
        if (err.code === 'sudah-melamar') { tandaiSudah(); setKirim('diam'); return; }
        setPesan(err.message || 'Lamaran belum bisa dikirim sekarang. Coba lagi.');
        setKirim('gagal');
      });
    return () => { aktif = false; };
  }, [seleksiId]);

  const lamar = async () => {
    if (!bisaKirim) return;
    setKirim('proses');
    setPesan('');
    try {
      await kirimLamaranProfil({ seleksiId, phone: butuhPhone ? phone : '' });
      setKirim('sukses');
      onSelesai?.();
    } catch (err) {
      if (err.code === 'sudah-melamar') { tandaiSudah(); setKirim('diam'); return; }
      setPesan(err.message || 'Lamaran belum bisa dikirim sekarang. Coba lagi.');
      setKirim('gagal');
    }
  };

  if (kirim === 'proses') {
    return (
      <div className="lcp lcp-center" role="status" aria-live="polite">
        <span className="lcp-spin" aria-hidden="true" />
        <h4>Mengirim lamaran…</h4>
        <p>Profil dan CV kamu sedang dikirim ke perusahaan. Jendela ini boleh ditutup, prosesnya tetap berjalan.</p>
      </div>
    );
  }
  if (kirim === 'sukses') {
    return (
      <div className="lcp lcp-center" role="status">
        <span className="lcp-ok" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
        <h4>Lamaran terkirim</h4>
        <p>Lamaranmu untuk posisi <b>{jabatan}</b> sudah diterima perusahaan. Semoga berhasil!</p>
      </div>
    );
  }
  if (status === 'memuat') return <div className="lcp"><div className="lcp-skel" aria-hidden="true"><span /><span /><span /></div></div>;
  if (status === 'sudah') {
    return (
      <div className="lcp lcp-center" role="status">
        <span className="lcp-ok muted" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
        <h4>Kamu sudah melamar</h4>
        <p>Lamaranmu untuk posisi ini sudah diterima perusahaan, jadi tidak bisa dikirim lagi.</p>
      </div>
    );
  }
  if (status === 'tanpa-cv' || status === 'galat') {
    return (
      <div className="lcp">
        <h4>{status === 'galat' ? 'Lamar cepat belum tersedia' : 'Belum ada CV di profilmu'}</h4>
        <p>{status === 'galat' ? 'Kami belum bisa memeriksa profilmu sekarang. Kamu tetap bisa melamar lewat form.' : 'Unggah CV di Profil Saya supaya bisa melamar cepat, atau isi form lamaran secara manual.'}</p>
        <div className="lcp-actions">
          {status === 'tanpa-cv' && <a className="lcp-btn ghost" href="/?view=profil-pelamar_001" target="_blank" rel="noopener noreferrer">Unggah CV di profil</a>}
          <button type="button" className="lcp-btn primary" onClick={onFormBiasa}>Isi form lamaran</button>
        </div>
      </div>
    );
  }

  // status 'siap' (atau 'tamu', yang tidak seharusnya sampai ke sini)
  if (status === 'tamu') {
    return (
      <div className="lcp">
        <h4>Lamar lewat form</h4>
        <p>Masuk sebagai pelamar untuk melamar cepat dengan data profilmu, atau isi form lamaran.</p>
        <div className="lcp-actions"><button type="button" className="lcp-btn primary" onClick={onFormBiasa}>Isi form lamaran</button></div>
      </div>
    );
  }

  return (
    <div className="lcp">
      <h4>Lamar dengan profil Luna</h4>
      <p>Data di bawah dikirim ke perusahaan sebagai lamaranmu untuk posisi <b>{jabatan}</b>. Tanpa mengisi form dan tanpa mengunggah CV lagi.</p>

      <dl className="lcp-data">
        <div><dt>Nama</dt><dd>{pelamarProfile?.nama_lengkap || '-'}</dd></div>
        <div><dt>Email</dt><dd>{pelamarProfile?.email || '-'}</dd></div>
        <div>
          <dt>Nomor HP</dt>
          <dd>
            {butuhPhone ? (
              <input className="lcp-input" inputMode="tel" placeholder="Contoh: 0812 3456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Nomor HP" />
            ) : phoneProfil}
          </dd>
        </div>
        <div>
          <dt>CV</dt>
          <dd>{resume?.file_name || 'CV di profil'}{resume?.updated_at ? <span className="lcp-sub"> · diperbarui {tanggal(resume.updated_at)}</span> : null}</dd>
        </div>
      </dl>
      {butuhPhone && <div className="lcp-hint">Nomor HP belum ada di profilmu. Ia disimpan ke profil setelah lamaran dikirim.</div>}

      <label className="lcp-setuju">
        <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
        <span>Saya setuju profil dan CV saya dikirim ke perusahaan ini untuk keperluan seleksi.</span>
      </label>

      {kirim === 'gagal' && <div className="lcp-error" role="alert">{pesan}</div>}

      <div className="lcp-actions">
        <button type="button" className="lcp-btn primary" disabled={!bisaKirim} onClick={lamar}>{kirim === 'proses' ? 'Mengirim lamaran…' : 'Kirim lamaran'}</button>
        <button type="button" className="lcp-link" onClick={onFormBiasa} disabled={kirim === 'proses'}>Isi form sendiri</button>
      </div>
    </div>
  );
}
