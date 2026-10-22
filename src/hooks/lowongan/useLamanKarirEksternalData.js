import { useState, useEffect } from 'react';
import { getExternalJobByKode, laporkanLowongan, recordExternalView } from '../../services/lowonganPublikService.js';
import { formatDeskripsiToHtml } from './useLamanKarirData.js';
import { shareLowongan } from '../../utils/shareLowongan.js';

// Deskripsi eksternal disimpan sebagai teks biasa. Di-escape dulu supaya
// markup apa pun dari sumber luar tidak ikut dirender, baru diubah jadi
// paragraf/daftar dengan formatter yang sama seperti lowongan Luna.
export function formatDeskripsiEksternal(text) {
  if (!text) return '';
  const escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return formatDeskripsiToHtml(escaped);
}

// Format waktu posting dipakai bersama lowongan Luna (utils/tanggalPosting.js).
export { formatWaktuPosting, formatTanggalPosting } from '../../utils/tanggalPosting.js';

export default function useLamanKarirEksternalData(kode) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [job, setJob] = useState(null);
  const [viewCount, setViewCount] = useState(null);

  const [laporanOpen, setLaporanOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [laporanState, setLaporanState] = useState('idle'); // idle | sending | done | error

  useEffect(() => {
    let active = true;
    setPageState('loading');
    getExternalJobByKode(kode).then(data => {
      if (!active) return;
      setJob(data);
      setPageState(data ? 'ready' : 'not-found');
    });
    return () => { active = false; };
  }, [kode]);

  // Tayangan dihitung setelah pengunjung bertahan 3 detik di halaman (sama
  // seperti lowongan Luna), supaya buka-tutup cepat tidak menaikkan hitungan.
  useEffect(() => {
    if (!job?.kode) return undefined;
    const initial = typeof job.view_count === 'number' ? job.view_count : 0;
    setViewCount(initial);
    const timer = setTimeout(() => {
      recordExternalView(job.kode, initial).then(n => { if (typeof n === 'number') setViewCount(n); });
    }, 3000);
    return () => clearTimeout(timer);
  }, [job?.kode]);

  const handleShareAction = (platform, onDone) => {
    shareLowongan(platform, {
      url: window.location.href,
      text: `Lowongan ${job?.title || ''}${job?.company_name ? ' - ' + job.company_name : ''}`,
    }, onDone);
  };

  const bukaLaporan = () => {
    setAlasan('');
    setCatatan('');
    setLaporanState('idle');
    setLaporanOpen(true);
  };
  const tutupLaporan = () => {
    if (laporanState !== 'sending') setLaporanOpen(false);
  };

  const kirimLaporan = async () => {
    if (!alasan || laporanState === 'sending') return;
    setLaporanState('sending');
    try {
      await laporkanLowongan({ kode, alasan, catatan: catatan.trim() || null });
      setLaporanState('done');
    } catch (err) {
      console.error('Gagal mengirim laporan:', err);
      setLaporanState('error');
    }
  };

  return {
    pageState, job, viewCount, handleShareAction,
    laporan: {
      open: laporanOpen, bukaLaporan, tutupLaporan,
      alasan, setAlasan, catatan, setCatatan,
      state: laporanState, kirimLaporan,
    },
  };
}
