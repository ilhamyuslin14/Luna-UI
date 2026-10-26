import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LowonganHeader from './LowonganHeader.jsx';
import KecocokanCard from './KecocokanCard.jsx';
import { formatDeskripsiToHtml } from '../../hooks/lowongan/useLamanKarirData.js';
import { formatDeskripsiEksternal } from '../../hooks/lowongan/useLamanKarirEksternalData.js';
import { formatTanggalPosting, formatWaktuPosting } from '../../utils/tanggalPosting.js';
import { itemProfilPerusahaan } from '../../utils/profilPerusahaan.js';
import { bukaLamar, bukaDetail } from '../../utils/lamarLowongan.js';
import { recordJobView } from '../../services/seleksiService.js';
import { recordExternalView } from '../../services/lowonganPublikService.js';
import '../../../css/lowongan/lowongan-drawer.css';

// Panel detail lowongan di halaman daftar: dari kanan (desktop, setengah layar) atau dari
// bawah (layar sempit). Isinya ringkasan halaman detail; formulir lamar lowongan Luna tetap
// di laman karir, jadi tombol "Lamar Sekarang" membukanya di tab baru.
const TUNDA_KECOCOKAN_MS = 1200; // jeda sebelum kecocokan dihitung otomatis, supaya menelusuri cepat tidak memakai jatah AI

function baris(job) {
  const rows = job.is_external
    ? [['Perusahaan', job.company_name], ['Lokasi', job.location], ['Kategori', job.category], ['Ikatan Kerja', job.employment_label]]
    : [['Departemen', job.departments?.name], ['Level Jabatan', job.level_jabatan], ['Lokasi', job.location], ['Ikatan Kerja', job.employment_label], ['Min. Pendidikan', job.pendidikan], ['Min. Pengalaman', job.experience_label]];
  rows.push(['Upah / Gaji', job.salary_label, job.salary_text_only ? 'muted' : 'accent']);
  rows.push(['Tanggal Posting', formatTanggalPosting(job.posted_at)]);
  return rows.filter(([, v]) => v && v !== '-');
}

export default function LowonganDrawer({ job, onClose, navigate, onHasilKecocokan, onLamar }) {
  const [shown, setShown] = useState(false);
  const bodyRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Masuk dengan animasi, dan fokus ke tombol tutup supaya Esc/Tab langsung bekerja di panel.
  useEffect(() => {
    const id = requestAnimationFrame(() => { setShown(true); closeRef.current?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(id);
  }, []);

  const tutup = () => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    setTimeout(() => onCloseRef.current?.(), 220);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') tutup(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Halaman di belakang tidak ikut tergulir selama panel terbuka. Yang dikunci adalah <html>,
  // bukan <body>: html di proyek ini sudah punya overflow-y: scroll, jadi overflow body tidak
  // diteruskan ke viewport. Body yang di-hidden menjadi wadah gulir sendiri, dan elemen sticky
  // (navbar, filter) lepas dari viewport lalu ikut tergulir pergi. Di html posisi gulir tetap
  // tersimpan dan sticky tetap menempel; lebar halaman tidak bergeser karena scrollbar-gutter: stable.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, []);

  // Pindah ke lowongan lain: mulai dari atas lagi.
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [job.key]);

  // Tayangan dihitung kalau panel bertahan 3 detik pada lowongan itu (aturan 24 jam ada di service).
  useEffect(() => {
    const t = setTimeout(() => {
      if (job.is_external) recordExternalView(job.kode, job.view_count || 0);
      else recordJobView(job, 0);
    }, 3000);
    return () => clearTimeout(t);
  }, [job.key]);

  const deskripsiHtml = job.is_external ? formatDeskripsiEksternal(job.description) : formatDeskripsiToHtml(job.deskripsi);
  const kualifikasiHtml = !job.is_external && job.kualifikasi ? formatDeskripsiToHtml(job.kualifikasi) : '';

  return createPortal(
    <div className="ldr-root" role="dialog" aria-modal="true" aria-label={`Detail lowongan ${job.title}`}>
      <div className={`ldr-overlay${shown ? ' on' : ''}`} onClick={tutup} />
      <aside className={`ldr-panel${shown ? ' on' : ''}`}>
        <div className="ldr-bar">
          <span className="ldr-grip" aria-hidden="true" />
          <span className="ldr-bar-title">Detail lowongan</span>
          <div className="ldr-bar-actions">
            <button type="button" className="ldr-newtab" onClick={() => bukaDetail(job)} title="Buka di tab baru" aria-label="Buka halaman lengkap lowongan ini di tab baru">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </button>
            <button type="button" ref={closeRef} className="ldr-close" onClick={tutup} aria-label="Tutup detail lowongan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        <div className="ldr-body" ref={bodyRef}>
          <LowonganHeader
            companyName={job.company_name}
            logoUrl={job.logo_url}
            companyInfo={job.is_external ? itemProfilPerusahaan(job) : []}
            title={job.title}
            meta={[
              job.location && { icon: 'pin', text: job.location },
              job.employment_label && { icon: 'brief', text: job.employment_label },
              formatWaktuPosting(job.posted_at) && { icon: 'clock', text: formatWaktuPosting(job.posted_at) },
            ].filter(Boolean)}
            salaryLabel={job.salary_label}
            salaryMuted={job.salary_text_only}
          />

          <KecocokanCard
            key={job.key}
            jobKey={job.key}
            jobTitle={job.title}
            navigate={navigate}
            tundaOtomatis={TUNDA_KECOCOKAN_MS}
            onHasil={(score) => onHasilKecocokan?.(job.key, score)}
          />

          <section className="ldr-card">
            <h3>Detail Pekerjaan</h3>
            {baris(job).map(([label, value, tone]) => (
              <div className="ldr-row" key={label}>
                <span>{label}</span>
                <b className={tone || ''}>{value}</b>
              </div>
            ))}
          </section>

          <section className="ldr-card">
            <h3>Deskripsi &amp; Tanggung Jawab Pekerjaan</h3>
            <div className="lk-rich-content" dangerouslySetInnerHTML={{ __html: deskripsiHtml || '<p>Tidak ada deskripsi pekerjaan khusus.</p>' }} />
          </section>

          {kualifikasiHtml && (
            <section className="ldr-card">
              <h3>Kualifikasi</h3>
              <div className="lk-rich-content" dangerouslySetInnerHTML={{ __html: kualifikasiHtml }} />
            </section>
          )}
        </div>

        <div className="ldr-foot">
          <button type="button" className="ldr-apply" onClick={() => (onLamar ? onLamar(job) : bukaLamar(job))}>Lamar Sekarang</button>
          {job.source_label && <p className="ldr-apply-note">Lamar lewat {job.source_label}</p>}
        </div>
      </aside>
    </div>,
    document.body
  );
}
