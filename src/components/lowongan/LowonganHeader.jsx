import { getAdminActivityState } from '../../hooks/lowongan/useLamanKarirData.js';
import CompanyLogoBox from './CompanyLogoBox.jsx';
import '../../../css/lowongan/lowongan-header.css';

// Header halaman detail lowongan (Luna & eksternal, desktop & mobile): gaya
// editorial tanpa kartu supaya tidak bersaing dengan kartu kecocokan CV.
const ICONS = {
  pin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  brief: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
  desk: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" /></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};

const IconClockSm = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconEyeSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

// "Rp 15.000.000 – 20.000.000 / bulan" → nominal besar + periode redup.
function splitSalary(label) {
  if (!label) return [null, null];
  const i = label.indexOf(' / ');
  return i === -1 ? [label, null] : [label.slice(0, i), label.slice(i + 3)];
}

// Badge status untuk lowongan Luna (lowongan aktif, aktivitas rekruter, tayangan).
export function LunaHeaderBadges({ job, viewCount }) {
  const activity = getAdminActivityState(job);
  return (
    <>
      <span className="lkh-badge live"><span className="lkh-dot" />Lowongan Aktif</span>
      <span className={`lkh-badge ${activity.isOnline ? 'live' : 'idle'}`}>
        {activity.isOnline ? <span className="lkh-dot pulse" /> : <IconClockSm />}
        {activity.text}
      </span>
      <ViewCountBadge count={viewCount} />
    </>
  );
}

// Badge "N Dilihat" — dipakai lowongan Luna dan lowongan eksternal.
export function ViewCountBadge({ count }) {
  if (typeof count !== 'number' || count < 0) return null;
  return (
    <span className="lkh-badge idle" title="Total tayangan halaman lowongan ini">
      <IconEyeSm />{count.toLocaleString('id-ID')} Dilihat
    </span>
  );
}

export default function LowonganHeader({
  companyName, companyHref, logoUrl, badges, companyInfo = [], title, meta = [], salaryLabel, salaryMuted,
}) {
  const [nominal, period] = splitSalary(salaryLabel);
  const logoBox = (
    <CompanyLogoBox
      className="lkh-logo"
      src={logoUrl}
      alt={companyName}
      color="#FFF4EC"
      initials={(companyName || '?').charAt(0).toUpperCase()}
    />
  );

  return (
    // Sengaja <div>, bukan <header>: style.css punya aturan global untuk tag
    // header (flex, space-between, latar putih) yang akan menimpa tampilan ini.
    <div className="lkh">
      <div className="lkh-company-row">
        {companyHref
          ? <a className="lkh-logo-link" href={companyHref} title={`Lihat profil ${companyName || ''}`}>{logoBox}</a>
          : logoBox}
        {companyName && (companyHref
          ? <a className="lkh-company" href={companyHref}>{companyName}</a>
          : <span className="lkh-company">{companyName}</span>)}
        {badges}
      </div>

      {companyInfo.length > 0 && (
        <div className="lkh-company-info">
          {companyInfo.map(m => <span key={`${m.icon}:${m.text}`} className="lkh-company-info-item">{ICONS[m.icon]}{m.text}</span>)}
        </div>
      )}

      <h1 className="lkh-title">{title}</h1>

      {meta.length > 0 && (
        <div className="lkh-meta">
          {meta.map(m => <span key={`${m.icon}:${m.text}`} className="lkh-meta-item">{ICONS[m.icon]}{m.text}</span>)}
        </div>
      )}

      {salaryLabel && (salaryMuted
        ? <div className="lkh-salary muted">{salaryLabel}</div>
        : (
          <div className="lkh-salary">
            <span className="lkh-salary-num">{nominal}</span>
            {period && <span className="lkh-salary-per">/ {period}</span>}
          </div>
        ))}
    </div>
  );
}
