// Penanda asal lowongan di kartu & laman detail: lowongan asli Luna vs
// lowongan agregat dari situs lain. Hanya teks nama sumber (tanpa logo
// pihak ketiga); ikatannya ada di chip ikon bulat supaya terbaca sekilas.
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconExternal = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export default function SumberLowonganBadge({ job, className = '' }) {
  if (job.is_external) {
    return (
      <span className={`src-badge ext ${className}`} title={`Lowongan dari ${job.source_label}`}>
        <span className="src-ic"><IconExternal /></span>via {job.source_label}
      </span>
    );
  }
  return (
    <span className={`src-badge luna ${className}`} title="Lowongan resmi di Luna, bisa langsung dilamar">
      <span className="src-ic"><IconCheck /></span>Lowongan Luna
    </span>
  );
}
