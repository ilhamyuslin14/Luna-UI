import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LowonganHeader from '../../components/lowongan/LowonganHeader.jsx';
import KecocokanCardMock from './KecocokanCardMock.jsx';
import { formatDeskripsiToHtml } from '../../hooks/lowongan/useLamanKarirData.js';
import { formatDeskripsiEksternal } from '../../hooks/lowongan/useLamanKarirEksternalData.js';
import { formatTanggalPosting, formatWaktuPosting } from '../../utils/tanggalPosting.js';
import { itemProfilPerusahaan } from '../../utils/profilPerusahaan.js';
import '../../../css/lowongan/lowongan-drawer.css';

// Panel detail lowongan versi mockup (kanan di desktop, bawah di layar sempit). Isinya sama dengan
// LowonganDrawer asli, bedanya: tidak mencatat tayangan ke database, tidak ada tombol "buka di tab
// baru", dan "Lamar Sekarang" membuka tautan JobStreet asli lowongan itu di tab baru.
function baris(job) {
  const rows = job.is_external
    ? [['Perusahaan', job.company_name], ['Lokasi', job.location], ['Kategori', job.category], ['Ikatan Kerja', job.employment_label]]
    : [['Departemen', job.departments?.name], ['Level Jabatan', job.level_jabatan], ['Lokasi', job.location], ['Ikatan Kerja', job.employment_label], ['Min. Pendidikan', job.pendidikan], ['Min. Pengalaman', job.experience_label]];
  rows.push(['Upah / Gaji', job.salary_label, job.salary_text_only ? 'muted' : 'accent']);
  rows.push(['Tanggal Posting', formatTanggalPosting(job.posted_at)]);
  return rows.filter(([, v]) => v && v !== '-');
}

export default function LowonganDrawerMock({ job, onClose, onLamar }) {
  const [shown, setShown] = useState(false);
  const bodyRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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

  // Yang dikunci adalah <html>, bukan <body> (alasannya di LowonganDrawer asli): supaya navbar sticky tidak lepas.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, []);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [job.key]);

  const deskripsiHtml = job.is_external ? formatDeskripsiEksternal(job.description) : formatDeskripsiToHtml(job.deskripsi);

  return createPortal(
    <div className="ldr-root" role="dialog" aria-modal="true" aria-label={`Detail lowongan ${job.title}`}>
      <div className={`ldr-overlay${shown ? ' on' : ''}`} onClick={tutup} />
      <aside className={`ldr-panel${shown ? ' on' : ''}`}>
        <div className="ldr-bar">
          <span className="ldr-grip" aria-hidden="true" />
          <span className="ldr-bar-title">Detail lowongan</span>
          <div className="ldr-bar-actions">
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

          <KecocokanCardMock key={job.key} jobKey={job.key} />

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
        </div>

        <div className="ldr-foot">
          <button type="button" className="ldr-apply" onClick={() => onLamar(job)}>Lamar Sekarang</button>
          {job.source_label && <p className="ldr-apply-note">Lamar lewat {job.source_label}</p>}
        </div>
      </aside>
    </div>,
    document.body
  );
}
