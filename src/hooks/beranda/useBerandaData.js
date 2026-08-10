import { useState, useEffect } from 'react';
import { getDashboardMetrics, getRecentJobs } from '../../services/dashboardService.js';
import { getCached } from '../../services/dataCache.js';

export default function useBerandaData(companyId) {
  const [metrics, setMetrics] = useState({
    totalKandidat: 0,
    lowonganAktif: 0,
    direkrut: 0,
    rataKecocokan: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Baru dianggap "kembali" kalau sudah pernah punya lowongan atau kandidat —
  // sebelum metrics selesai dimuat ini default false, jadi user baru gak
  // sempat kelihatan sapaan "Kembali" yang salah.
  const hasActivity = metrics.totalKandidat > 0 || metrics.lowonganAktif > 0;

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    getCached(`beranda_002:${companyId}`, async () => {
      const [m, jobs] = await Promise.all([
        getDashboardMetrics(companyId),
        getRecentJobs(companyId),
      ]);
      return { metrics: m, recentJobs: jobs };
    })
      .then(data => {
        setMetrics(data.metrics || {});
        setRecentJobs(data.recentJobs || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [companyId]);

  const buildKaririUrl = (job) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const kode = job.slug || job.kode || job.id || 'k7bx2m';
    return `${origin}/?view=laman-karir_001&kode=${kode}`;
  };

  // Melakukan aksi share (copy/window.open) dan mengembalikan pesan feedback
  // (kalau ada) — biar UI toast/snackbar-nya bisa beda antara desktop & mobile.
  const shareToPlatform = (platform, job) => {
    const url = buildKaririUrl(job);
    const text = `Lowongan ${job.posisi} di ${job.departemen || job.dept || 'perusahaan kami'}. Daftarkan diri Anda di: ${url}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      return { message: 'Link Laman Karier berhasil disalin!' };
    }

    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    else if (platform === 'x') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    else if (platform === 'telegram') shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    else if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
      shareUrl = 'https://www.instagram.com/';
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
    return platform === 'instagram' ? { message: 'Link disalin, silakan buka Instagram' } : null;
  };

  return { metrics, recentJobs, isLoading, hasActivity, buildKaririUrl, shareToPlatform };
}
