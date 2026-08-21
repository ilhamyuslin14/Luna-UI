import { useState, useEffect } from 'react';
import { getCompanyBySlug, getActiveSeleksiByCompany } from '../../services/seleksiService.js';
import { formatDeskripsiToHtml } from './useLamanKarirData.js';

export { formatDeskripsiToHtml };

export function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    let id = null;
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
    else id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

// Data untuk laman profil perusahaan publik (tanpa login) — dipakai bareng
// oleh Lowongan-Perusahaan_001.jsx (desktop) dan LamanPerusahaanMobile.jsx.
// `handleShareAction` sengaja identik dengan useLamanKarirData.js (bukan
// di-import ulang) karena teksnya beda (profil perusahaan, bukan lowongan).
export default function useLamanPerusahaanData(slug) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');

  useEffect(() => {
    let active = true;
    if (!slug) {
      setPageState('not-found');
      return;
    }
    getCompanyBySlug(slug)
      .then(data => {
        if (!active) return null;
        if (!data) {
          setPageState('not-found');
          return null;
        }
        setCompany(data);
        return getActiveSeleksiByCompany(data.id);
      })
      .then(jobList => {
        if (!active || !jobList) return;
        setJobs(jobList);
        setPageState('ready');
      })
      .catch(() => {
        if (active) setPageState('not-found');
      });
    return () => { active = false; };
  }, [slug]);

  const handleShareAction = (platform, onDone) => {
    const pageUrl = window.location.href;
    const shareText = `Profil Perusahaan ${company?.name || ''}`;

    switch (platform) {
      case 'wa':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + pageUrl)}`, '_blank', 'noopener,noreferrer');
        onDone?.('opened'); break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer');
        onDone?.('opened'); break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer');
        onDone?.('opened'); break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        onDone?.('opened'); break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        onDone?.('opened'); break;
      case 'instagram':
        if (navigator.clipboard) navigator.clipboard.writeText(pageUrl);
        onDone?.('instagram'); break;
      default:
        if (navigator.clipboard) navigator.clipboard.writeText(pageUrl);
        onDone?.('copied');
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return (j.jabatan || '').toLowerCase().includes(q) || (j.departments?.name || '').toLowerCase().includes(q) || (j.lokasi || '').toLowerCase().includes(q);
  });

  return {
    pageState, company, jobs, filteredJobs, jobSearch, setJobSearch,
    handleShareAction,
  };
}
