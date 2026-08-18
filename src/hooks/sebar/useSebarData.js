import { useState, useEffect, useRef } from 'react';
import { getSeleksi } from '../../services/seleksiService.js';
import { supabase } from '../../config/supabase.js';
import { slugify } from '../../utils/slug.js';

// Logic (fetch lowongan aktif + jumlah kandidat, generate tautan laman
// karier & draf teks broadcast, salin ke clipboard, data & filter akun
// mitra) dipakai bareng oleh Sebar_001.jsx (desktop) dan SebarMobile.jsx —
// markup & CSS beda total, sumber data & handler sama. Ikon platform tetap
// didefinisikan lokal di tiap file konsumen (svg React component, bukan
// data), dipetakan lewat nama platform di sini.
const PARTNER_ACCOUNTS = [
  {
    platform: 'Facebook',
    color: '#1877F2',
    bg: '#EFF6FF',
    accounts: [
      { name: 'Lowongan Kerja Surabaya Sidoarjo', category: 'Grup Publik • 120rb+ Anggota', url: 'https://facebook.com/groups/lowongankerjasurabayasidoarjo' },
      { name: 'Info Loker Bandung Raya', category: 'Grup Publik • 85rb+ Anggota', url: 'https://facebook.com/infolokerbandungraya' },
      { name: 'Info Lowongan Kerja Jabodetabek', category: 'Grup Publik • 210rb+ Anggota', url: 'https://facebook.com/groups/lokerjabodetabek' },
    ],
  },
  {
    platform: 'Instagram',
    color: '#E1306C',
    bg: '#FDF2F8',
    accounts: [
      { name: 'Loker.Nasional', category: 'Komunitas IG • 340rb+ Pengikut', url: 'https://instagram.com' },
      { name: 'InfoLoker.Bandung', category: 'Komunitas IG • 95rb+ Pengikut', url: 'https://instagram.com' },
    ],
  },
  {
    platform: 'Telegram',
    color: '#0088CC',
    bg: '#F0F9FF',
    accounts: [
      { name: 'Channel Info Loker Indonesia', category: 'Channel • 50rb+ Pelanggan', url: 'https://t.me' },
      { name: 'Grup HRD & Pencari Kerja', category: 'Grup Telegram • 28rb+ Anggota', url: 'https://t.me' },
    ],
  },
  {
    platform: 'WhatsApp',
    color: '#25D366',
    bg: '#F0FDF4',
    accounts: [
      { name: 'Grup Broadcast Loker Jabar', category: 'Komunitas WA • 1.2rb+ Anggota', url: 'https://wa.me' },
    ],
  },
  {
    platform: 'X / Twitter',
    color: '#0F172A',
    bg: '#F8FAFC',
    accounts: [
      { name: 'Workfess (@workfess)', category: 'Base Twitter • 450rb+ Pengikut', url: 'https://x.com' },
    ],
  },
  {
    platform: 'Threads',
    color: '#0F172A',
    bg: '#F8FAFC',
    accounts: [
      { name: 'Diskusi Karir Indonesia', category: 'Komunitas Threads', url: 'https://threads.net' },
    ],
  },
];

const ALL_PARTNER_ACCOUNTS = PARTNER_ACCOUNTS.flatMap(p =>
  p.accounts.map(acc => ({ ...acc, platform: p.platform, color: p.color, bg: p.bg }))
);

export default function useSebarData(companyId, companyName, profileName) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedPartnerPlatform, setSelectedPartnerPlatform] = useState('Semua');
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const toastTimer = useRef(null);
  const copiedTimer = useRef(null);

  const namaPerusahaan = companyName || 'Perusahaan Anda';
  const namaPengirim = profileName || 'Tim Rekrutmen';

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!companyId) { setIsLoading(false); return; }
    let isMounted = true;
    setIsLoading(true);

    async function fetchJobsWithCandidates() {
      try {
        const seleksiData = await getSeleksi(companyId);
        const activeJobs = (seleksiData || []).filter(s => s.status === 'Aktif');

        if (activeJobs.length > 0) {
          const seleksiIds = activeJobs.map(s => s.id);

          // Kandidat terhubung ke lowongan lewat tabel scoring (scoring.kandidat_id
          // + scoring.seleksi_id) — tabel kandidat sendiri tidak punya kolom seleksi_id.
          const { data: scoringData } = await supabase
            .from('scoring')
            .select('seleksi_id, kandidat_id, kandidat:kandidat_id(arsip)')
            .in('seleksi_id', seleksiIds);

          const countMap = {};
          seleksiIds.forEach(id => { countMap[id] = new Set(); });
          (scoringData || []).forEach(s => {
            if (s.kandidat?.arsip) return;
            if (s.kandidat_id && countMap[s.seleksi_id]) countMap[s.seleksi_id].add(s.kandidat_id);
          });

          const jobsWithCounts = activeJobs.map(job => ({
            ...job,
            kandidatCount: countMap[job.id] ? countMap[job.id].size : 0,
          }));
          if (isMounted) setJobs(jobsWithCounts);
        } else if (isMounted) {
          setJobs([]);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar lowongan:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchJobsWithCandidates();
    return () => { isMounted = false; };
  }, [companyId]);

  const getKarirLink = (job) => {
    const posisi = job.posisi || job.jabatan || '';
    if (job.kode) {
      return `${window.location.origin}/?view=laman-karir&perusahaan=${slugify(namaPerusahaan)}&posisi=${slugify(posisi)}&kode=${encodeURIComponent(job.kode)}`;
    }
    return `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(posisi)}`;
  };

  const getKualifikasiText = (job) => {
    const posisi = job.posisi || job.jabatan || 'Lowongan';
    const kriteria = Array.isArray(job.kriteria) ? job.kriteria : [];
    if (kriteria.length > 0) {
      const wajib = kriteria.filter(k => k?.teks && k.kategori === 'Wajib');
      const lainnya = kriteria.filter(k => k?.teks && k.kategori !== 'Wajib');
      const top3 = [...wajib, ...lainnya].slice(0, 3);
      if (top3.length > 0) return top3.map(k => `• ${k.teks}`).join('\n');
    }
    return job.kualifikasi ||
      `• Pengalaman minimal 1 tahun sebagai ${posisi.toLowerCase()}\n• Menguasai keahlian utama posisi ini\n• Bersedia kerja dengan komitmen tinggi`;
  };

  const getBroadcastText = (job) => {
    const posisi = job.posisi || job.jabatan || 'Lowongan';
    const lokasi = job.lokasi || job.domisili || 'Indonesia';
    const kualifikasi = getKualifikasiText(job);
    const karirLink = getKarirLink(job);
    return `Kami, ${namaPerusahaan}, sedang membuka lowongan ${posisi} untuk penempatan di ${lokasi}.\n\nKualifikasi:\n${kualifikasi}\n\nKirim lamaran lewat link berikut dan akan langsung kami proses.\n\n${karirLink}`;
  };

  const getPartnerIntro = (job) => {
    const posisi = job.posisi || job.jabatan || 'Lowongan';
    const lokasi = job.lokasi || job.domisili || 'Indonesia';
    return `Halo, Kak Admin. Saya ${namaPengirim} dari ${namaPerusahaan}.\n\nKami sedang membuka lowongan ${posisi} di ${lokasi}. Boleh minta tolong dibantu posting di akun kakak, ya. Terima kasih, kak.`;
  };

  const getPartnerMessage = (job) => `${getPartnerIntro(job)}\n\n—\n\n${getBroadcastText(job)}`;

  const copyText = (key, text, successMessage) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(successMessage);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedKey(null), 2000);
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchedJobs = trimmedQuery.length >= 2
    ? jobs.filter(job => {
      const posisi = (job.posisi || job.jabatan || '').toLowerCase();
      const lokasi = (job.lokasi || job.domisili || '').toLowerCase();
      return posisi.includes(trimmedQuery) || lokasi.includes(trimmedQuery);
    })
    : jobs;

  const trimmedPartnerQuery = partnerSearchQuery.trim().toLowerCase();
  const filteredPartnerAccounts = ALL_PARTNER_ACCOUNTS.filter(acc => {
    const matchesPlatform = selectedPartnerPlatform === 'Semua' || acc.platform === selectedPartnerPlatform;
    const matchesSearch = trimmedPartnerQuery === '' ||
      acc.name.toLowerCase().includes(trimmedPartnerQuery) ||
      (acc.category && acc.category.toLowerCase().includes(trimmedPartnerQuery)) ||
      acc.platform.toLowerCase().includes(trimmedPartnerQuery);
    return matchesPlatform && matchesSearch;
  });

  return {
    isLoading, jobs, searchQuery, setSearchQuery, searchedJobs,
    namaPerusahaan, namaPengirim,
    getKarirLink, getKualifikasiText, getBroadcastText, getPartnerIntro, getPartnerMessage,
    copiedKey, copyText,
    toast, setToast, showToast,
    PARTNER_ACCOUNTS, ALL_PARTNER_ACCOUNTS,
    selectedPartnerPlatform, setSelectedPartnerPlatform,
    partnerSearchQuery, setPartnerSearchQuery, filteredPartnerAccounts,
  };
}
