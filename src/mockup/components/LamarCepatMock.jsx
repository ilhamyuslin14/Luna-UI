import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockSession } from '../MockSession.jsx';
import { RESUME_DUMMY_ROW } from '../data/profilDummy.js';
import '../../../css/lowongan/lamar-cepat.css';

// Popup "lamar dengan profil Luna" versi mockup: tampilan dan alurnya sama dengan LamarCepatModal asli
// (ringkasan data, persetujuan, kirim, sukses, dan "sudah melamar"), tapi tanpa server. Status kirim dan
// "sudah melamar" disimpan di sesi palsu, jadi menutup popup saat dikirim tidak menghentikannya dan membukanya
// lagi menyambung. Memakai class lcm-* / lcp-* yang sama dengan aslinya.
const tanggal = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function LamarCepatMock({ job, onClose }) {
  const { pelamarProfile, dilamar, lamarProses, lamar } = useMockSession();
  const [setuju, setSetuju] = useState(false);
  const [selesaiBaru, setSelesaiBaru] = useState(false); // bedakan "baru terkirim" dari "sudah melamar sebelumnya"
  const proses = !!lamarProses[job.key];
  const sudah = !!dilamar[job.key];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { if (proses) setSelesaiBaru(true); }, [proses]);

  let isi;
  if (proses) {
    isi = (
      <div className="lcp lcp-center" role="status" aria-live="polite">
        <span className="lcp-spin" aria-hidden="true" />
        <h4>Mengirim lamaran…</h4>
        <p>Profil dan CV kamu sedang dikirim ke perusahaan. Jendela ini boleh ditutup, prosesnya tetap berjalan.</p>
      </div>
    );
  } else if (sudah) {
    isi = (
      <div className="lcp lcp-center" role="status">
        <span className={`lcp-ok${selesaiBaru ? '' : ' muted'}`} aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
        <h4>{selesaiBaru ? 'Lamaran terkirim' : 'Kamu sudah melamar'}</h4>
        <p>{selesaiBaru
          ? <>Lamaranmu untuk posisi <b>{job.title}</b> sudah diterima perusahaan. Semoga berhasil!</>
          : 'Lamaranmu untuk posisi ini sudah diterima perusahaan, jadi tidak bisa dikirim lagi.'}</p>
      </div>
    );
  } else {
    isi = (
      <div className="lcp">
        <h4>Lamar dengan profil Luna</h4>
        <p>Data di bawah dikirim ke perusahaan sebagai lamaranmu untuk posisi <b>{job.title}</b>. Tanpa mengisi form dan tanpa mengunggah CV lagi.</p>
        <dl className="lcp-data">
          <div><dt>Nama</dt><dd>{pelamarProfile?.nama_lengkap}</dd></div>
          <div><dt>Email</dt><dd>{pelamarProfile?.email}</dd></div>
          <div><dt>Nomor HP</dt><dd>{pelamarProfile?.phone}</dd></div>
          <div><dt>CV</dt><dd>{RESUME_DUMMY_ROW.file_name}<span className="lcp-sub"> · diperbarui {tanggal(RESUME_DUMMY_ROW.updated_at)}</span></dd></div>
        </dl>
        <label className="lcp-setuju">
          <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
          <span>Saya setuju profil dan CV saya dikirim ke perusahaan ini untuk keperluan seleksi.</span>
        </label>
        <div className="lcp-actions">
          <button type="button" className="lcp-btn primary" disabled={!setuju} onClick={() => lamar(job.key)}>Kirim lamaran</button>
          <button type="button" className="lcp-link" onClick={onClose}>Isi form sendiri</button>
        </div>
      </div>
    );
  }

  return createPortal(
    <div className="lcm-overlay" onClick={onClose}>
      <div className="lcm-card" role="dialog" aria-modal="true" aria-label={`Lamar ${job.title}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lcm-close" onClick={onClose} aria-label="Tutup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        {isi}
      </div>
    </div>,
    document.body
  );
}
