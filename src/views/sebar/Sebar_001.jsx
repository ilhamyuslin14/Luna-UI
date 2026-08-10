import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSeleksi } from '../../services/seleksiService.js';
import { supabase } from '../../config/supabase.js';
import { slugify } from '../../utils/slug.js';
import '../../../css/sebar/sebar_001.css';

const PER_PAGE = 4;

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconTelegram = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconThreads = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8a4 4 0 1 0 4 4v.5a1.5 1.5 0 0 1-3 0V12" />
  </svg>
);

const PARTNER_ACCOUNTS = [
  {
    platform: 'Facebook',
    Icon: IconFacebook,
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
    Icon: IconInstagram,
    color: '#E1306C',
    bg: '#FDF2F8',
    accounts: [
      { name: 'Loker.Nasional', category: 'Komunitas IG • 340rb+ Pengikut', url: 'https://instagram.com' },
      { name: 'InfoLoker.Bandung', category: 'Komunitas IG • 95rb+ Pengikut', url: 'https://instagram.com' },
    ],
  },
  {
    platform: 'Telegram',
    Icon: IconTelegram,
    color: '#0088CC',
    bg: '#F0F9FF',
    accounts: [
      { name: 'Channel Info Loker Indonesia', category: 'Channel • 50rb+ Pelanggan', url: 'https://t.me' },
      { name: 'Grup HRD & Pencari Kerja', category: 'Grup Telegram • 28rb+ Anggota', url: 'https://t.me' },
    ],
  },
  {
    platform: 'WhatsApp',
    Icon: IconWhatsApp,
    color: '#25D366',
    bg: '#F0FDF4',
    accounts: [
      { name: 'Grup Broadcast Loker Jabar', category: 'Komunitas WA • 1.2rb+ Anggota', url: 'https://wa.me' },
    ],
  },
  {
    platform: 'X / Twitter',
    Icon: IconX,
    color: '#0F172A',
    bg: '#F8FAFC',
    accounts: [
      { name: 'Workfess (@workfess)', category: 'Base Twitter • 450rb+ Pengikut', url: 'https://x.com' },
    ],
  },
  {
    platform: 'Threads',
    Icon: IconThreads,
    color: '#0F172A',
    bg: '#F8FAFC',
    accounts: [
      { name: 'Diskusi Karir Indonesia', category: 'Komunitas Threads', url: 'https://threads.net' },
    ],
  },
];

const ALL_PARTNER_ACCOUNTS = PARTNER_ACCOUNTS.flatMap(p =>
  p.accounts.map(acc => ({
    ...acc,
    platform: p.platform,
    Icon: p.Icon,
    color: p.color,
    bg: p.bg
  }))
);

export default function Sebar_001({ onNavigate, navigate }) {
  const nav = navigate || onNavigate;
  const { companyId, companyName, profileName } = useAuth() || {};
  const [activeTab, setActiveTab] = useState('sendiri'); // 'sendiri' | 'lain'
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Table filter & search state for Akun Mitra
  const [selectedPartnerPlatform, setSelectedPartnerPlatform] = useState('Semua');
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');

  const filteredPartnerAccounts = ALL_PARTNER_ACCOUNTS.filter(acc => {
    const matchesPlatform = selectedPartnerPlatform === 'Semua' || acc.platform === selectedPartnerPlatform;
    const matchesSearch = partnerSearchQuery.trim() === '' ||
      acc.name.toLowerCase().includes(partnerSearchQuery.toLowerCase()) ||
      (acc.category && acc.category.toLowerCase().includes(partnerSearchQuery.toLowerCase())) ||
      acc.platform.toLowerCase().includes(partnerSearchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const namaPerusahaan = companyName || 'PT Arkademi Daya Indonesia';
  const namaPengirim = profileName || 'Tim Rekrutmen';

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setIsLoading(true);

    async function fetchJobsWithCandidates() {
      try {
        const seleksiData = await getSeleksi(companyId);
        const activeJobs = (seleksiData || []).filter(s => s.status === 'Aktif');

        if (activeJobs.length > 0) {
          const seleksiIds = activeJobs.map(s => s.id);

          // Kandidat terhubung ke lowongan lewat tabel scoring (scoring.kandidat_id +
          // scoring.seleksi_id) — tabel kandidat sendiri tidak punya kolom seleksi_id.
          const { data: scoringData } = await supabase
            .from('scoring')
            .select('seleksi_id, kandidat_id, kandidat:kandidat_id(arsip)')
            .in('seleksi_id', seleksiIds);

          const countMap = {};
          seleksiIds.forEach(id => { countMap[id] = new Set(); });

          (scoringData || []).forEach(s => {
            if (s.kandidat?.arsip) return;
            if (s.kandidat_id && countMap[s.seleksi_id]) {
              countMap[s.seleksi_id].add(s.kandidat_id);
            }
          });

          const jobsWithCounts = activeJobs.map(job => ({
            ...job,
            kandidatCount: countMap[job.id] ? countMap[job.id].size : 0
          }));

          if (isMounted) setJobs(jobsWithCounts);
        } else {
          if (isMounted) setJobs([]);
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

  // Reset ke halaman 1 setiap kali pencarian atau tab berubah
  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeTab]);

  const toggleExpand = (key) => {
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePlatform = (platform) => {
    setExpandedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

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
    const posisi = job.posisi || job.jabatan || 'Barista';
    const lokasi = job.lokasi || job.domisili || 'Bandung';
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

  const handleCopy = (job, mode) => {
    const fullText = mode === 'lain' ? getPartnerMessage(job) : getBroadcastText(job);
    navigator.clipboard.writeText(fullText);
    setCopiedId(`${job.id}:${mode}`);
    setToastMsg(mode === 'lain' ? 'Pesan untuk admin berhasil disalin!' : 'Teks & link lowongan berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2500);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyUrlOnly = (job) => {
    const url = getKarirLink(job);
    navigator.clipboard.writeText(url);
    setToastMsg('Link Laman Karier berhasil disalin!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Mock data fallback if database has no active jobs
  const displayJobs = jobs.length > 0 ? jobs : [
    {
      id: 'mock-1',
      posisi: 'Barista',
      lokasi: 'Bandung',
      dept: 'Operational',
      kualifikasi: '• Pengalaman minimal 1 tahun sebagai barista\n• Menguasai manual brew dan espresso\n• Bersedia kerja sistem shift'
    },
    {
      id: 'mock-2',
      posisi: 'Frontend Engineer',
      lokasi: 'Jakarta',
      dept: 'Engineering',
      kualifikasi: '• Pengalaman React.js min. 2 tahun\n• Menguasai CSS Modern, Tailwind & Responsive Design\n• Memahami integrasi REST API & Supabase'
    }
  ];

  // Filter berjalan otomatis begitu query minimal 2 karakter
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchedJobs = trimmedQuery.length >= 2
    ? displayJobs.filter(job => {
      const posisi = (job.posisi || job.jabatan || '').toLowerCase();
      const lokasi = (job.lokasi || job.domisili || '').toLowerCase();
      return posisi.includes(trimmedQuery) || lokasi.includes(trimmedQuery);
    })
    : displayJobs;

  const totalPages = Math.max(1, Math.ceil(searchedJobs.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedJobs = searchedJobs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const renderJobCard = (job, mode, isFirstCard = false) => {
    const key = `${job.id}:${mode}`;
    const isExpanded = expandedCards[key] !== undefined ? expandedCards[key] : isFirstCard;
    const isCopied = copiedId === key;
    const karirLink = getKarirLink(job);
    const posisi = job.posisi || job.jabatan || 'Lowongan';
    const lokasi = job.lokasi || job.domisili || 'Indonesia';
    const dept = job.dept || job.departemen;
    const candidateNum = typeof job.kandidatCount === 'number'
      ? job.kandidatCount
      : (Array.isArray(job.kandidat) ? job.kandidat.length : (Array.isArray(job.kandidatList) ? job.kandidatList.length : 0));

    return (
      <div key={key} className={`sebar-card ${isExpanded ? 'is-expanded' : ''}`} onClick={() => toggleExpand(key)}>
        {/* Card Header Info & Right Top Action Group */}
        <div className="sebar-card-header">
          <div className="sebar-card-main-info">
            <div className="sebar-card-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>

            <div className="sebar-card-title-group">
              <div className="sebar-card-heading-row">
                <h3 className="sebar-card-title">{posisi}</h3>
                <span className="sebar-card-status-badge">Aktif</span>
              </div>
              <div className="sebar-card-meta-row">
                <span className="sebar-card-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {lokasi}
                </span>
                {dept && (
                  <>
                    <span className="sebar-card-meta-dot">•</span>
                    <span className="sebar-card-meta-item">{dept}</span>
                  </>
                )}
                <span className="sebar-card-meta-dot">•</span>
                <span className="sebar-card-meta-item highlight-candidates">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {candidateNum} Kandidat
                </span>
              </div>
            </div>
          </div>

          {/* Right Top Action Group: 2 Icon CTAs + Salin Teks Button */}
          <div className="sebar-card-header-actions" onClick={(e) => e.stopPropagation()}>
            {/* Icon CTA 1: View Laman Karier with Tooltip */}
            <div className="sebar-icon-cta-wrap">
              <button
                className="sebar-icon-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(karirLink, '_blank');
                }}
                aria-label="Lihat Laman Karier"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <span className="sebar-icon-cta-tooltip">Lihat Laman Karier</span>
            </div>

            {/* Icon CTA 2: Lihat Ringkasan Lowongan with Tooltip */}
            <div className="sebar-icon-cta-wrap">
              <button
                className="sebar-icon-action-btn primary-subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  if (nav) {
                    nav('lowongan-detail_001', { seleksiId: job.id, jabatan: posisi, activeTab: 'ringkasan' });
                  }
                }}
                aria-label="Lihat Ringkasan Lowongan"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </button>
              <span className="sebar-icon-cta-tooltip">Lihat Ringkasan Lowongan</span>
            </div>

            <button
              className={`sebar-copy-btn ${isCopied ? 'copied' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(job, mode);
              }}
            >
              {isCopied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Tersalin!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  {mode === 'lain' ? 'Salin Teks' : 'Salin Teks'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Preview Box */}
        {isExpanded && (
          <div className="sebar-preview-box" onClick={(e) => e.stopPropagation()}>
            {mode === 'lain' && (
              <>
                <p style={{ margin: '0 0 12px 0' }}>
                  Halo, Kak Admin. Saya <strong>{namaPengirim}</strong> dari <strong>{namaPerusahaan}</strong>.
                </p>
                <p style={{ margin: '0 0 14px 0' }}>
                  Kami sedang membuka lowongan <strong>{posisi}</strong> di {lokasi}. Boleh minta tolong dibantu posting di akun kakak, ya. Terima kasih, kak.
                </p>
                <p className="sebar-preview-sep">—</p>
              </>
            )}
            <p style={{ margin: '0 0 12px 0' }}>
              Kami, <strong>{namaPerusahaan}</strong>, sedang membuka lowongan <strong>{posisi}</strong> untuk penempatan di {lokasi}.
            </p>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Kualifikasi:</p>
            <div style={{ margin: '0 0 14px 0', whiteSpace: 'pre-line' }}>
              {getKualifikasiText(job)}
            </div>
            <p style={{ margin: '0 0 6px 0' }}>
              Kirim lamaran lewat link berikut dan akan langsung kami proses.
            </p>
            <a
              href={karirLink}
              target="_blank"
              rel="noopener noreferrer"
              className="sebar-preview-link"
              onClick={(e) => e.stopPropagation()}
            >
              {karirLink}
            </a>
          </div>
        )}

        {/* Bottom Hover Hint Indicator */}
        <div className="sebar-card-hover-hint">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>{isExpanded ? 'Klik kartu untuk menyembunyikan draf teks' : 'Klik kartu untuk menampilkan draf teks'}</span>
        </div>
      </div>
    );
  };

  const renderJobsSection = (mode) => (
    <>
      <div className="sebar-search-row">
        <div className="sebar-search-box">
          <svg className="sebar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="sebar-search-input"
            placeholder="Cari posisi atau lokasi lowongan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="sebar-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="sebar-cards-list">
        {isLoading ? (
          <div className="sebar-empty">
            <p className="sebar-empty-title">Memuat lowongan pekerjaan...</p>
          </div>
        ) : searchedJobs.length === 0 ? (
          <div className="sebar-empty">
            <p className="sebar-empty-title">Tidak ada lowongan yang cocok dengan "{searchQuery.trim()}"</p>
          </div>
        ) : (
          pagedJobs.map((job, index) => renderJobCard(job, mode, index === 0))
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="sebar-pagination">
          <button
            className="sebar-page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <span className="sebar-page-info">Halaman {currentPage} dari {totalPages}</span>
          <button
            className="sebar-page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Halaman berikutnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="sebar-view">
      {/* Hero Banner */}
      <div className="sebar-hero-card">
        <div className="sebar-hero-glow"></div>
        <div className="sebar-hero-content">
          <div className="sebar-hero-badge">
            <span className="sebar-hero-badge-dot"></span>
            Sebar Lowongan
          </div>
          <h1 className="sebar-hero-title">Sebarkan Lowongan ke Semua Kanal</h1>
          <p className="sebar-hero-subtitle">
            Sebar sendiri ke WhatsApp, Instagram, dan LinkedIn Anda, atau titipkan ke akun loker lain yang followers-nya ribuan. Makin banyak jalur, makin banyak pelamar.
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="sebar-tabs">
        <button
          className={`sebar-tab-btn ${activeTab === 'sendiri' ? 'active' : ''}`}
          onClick={() => setActiveTab('sendiri')}
        >
          Akun Sendiri
        </button>
        <button
          className={`sebar-tab-btn ${activeTab === 'lain' ? 'active' : ''}`}
          onClick={() => setActiveTab('lain')}
        >
          Akun Mitra
        </button>
      </div>

      {/* Info Tip Card */}
      <div className="sebar-tip-card">
        <span className="sebar-tip-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </span>
        <div className="sebar-tip-body">
          <span className="sebar-tip-lead">
            {activeTab === 'lain' ? 'Titip ke akun loker yang followernya ribuan' : 'Sebar ke semua kanal sekaligus'}
          </span>
          <span className="sebar-tip-detail">
            {activeTab === 'lain'
              ? 'Kirim DM ke admin akun loker — kebanyakan bersedia posting gratis, jangkauannya jauh lebih luas dari akun sendiri.'
              : 'WhatsApp, Instagram, Facebook, LinkedIn, Telegram — cukup salin sekali, tempel di mana saja.'}
          </span>
        </div>
      </div>

      {/* Tab Content 1: Sebar di akun sendiri */}
      {activeTab === 'sendiri' && renderJobsSection('sendiri')}

      {/* Tab Content 2: Titip di akun lain */}
      {activeTab === 'lain' && (
        <>
          {renderJobsSection('lain')}

          <div className="sebar-partner-section">
            <div className="sebar-divider" />
            <div className="sebar-partner-header-row">
              <div>
                <h2 className="sebar-partner-heading">Daftar Akun Mitra</h2>
                <p className="sebar-partner-subheading">Kumpulan akun & komunitas loker publik terverifikasi untuk sebar lowongan secara luas</p>
              </div>
              <span className="sebar-partner-count-badge">{filteredPartnerAccounts.length} Akun Mitra</span>
            </div>

            {/* Filter Bar & Search Input */}
            <div className="sebar-table-filter-bar">
              <div className="sebar-table-platform-tabs">
                <button
                  className={`sebar-platform-tab-item ${selectedPartnerPlatform === 'Semua' ? 'active' : ''}`}
                  onClick={() => setSelectedPartnerPlatform('Semua')}
                >
                  Semua ({ALL_PARTNER_ACCOUNTS.length})
                </button>
                {PARTNER_ACCOUNTS.filter(p => (p.accounts || []).length > 0).map(p => {
                  const count = p.accounts.length;
                  const isActive = selectedPartnerPlatform === p.platform;
                  const Icon = p.Icon;
                  return (
                    <button
                      key={p.platform}
                      className={`sebar-platform-tab-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedPartnerPlatform(p.platform)}
                    >
                      <span className="sebar-tab-icon" style={{ color: isActive ? '#FFFFFF' : p.color }}>
                        <Icon />
                      </span>
                      <span>{p.platform}</span>
                      <span className="sebar-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="sebar-table-search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama akun / komunitas mitra..."
                  value={partnerSearchQuery}
                  onChange={(e) => setPartnerSearchQuery(e.target.value)}
                />
                {partnerSearchQuery && (
                  <button className="sebar-search-clear-btn" onClick={() => setPartnerSearchQuery('')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Modern Data Table */}
            <div className="sebar-table-card">
              <div className="sebar-table-responsive-wrapper">
                <table className="sebar-modern-table">
                  <thead>
                    <tr>
                      <th>PLATFORM</th>
                      <th>NAMA AKUN MITRA</th>
                      <th>KATEGORI & JANGKAUAN</th>
                      <th>STATUS VERIFIKASI</th>
                      <th style={{ textAlign: 'right' }}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartnerAccounts.length > 0 ? (
                      filteredPartnerAccounts.map((acc, index) => {
                        const Icon = acc.Icon;
                        return (
                          <tr key={`${acc.platform}-${acc.name}-${index}`}>
                            <td>
                              <div className="sebar-table-platform-badge" style={{ background: acc.bg, color: acc.color, borderColor: `${acc.color}22` }}>
                                <Icon />
                                <span>{acc.platform}</span>
                              </div>
                            </td>
                            <td>
                              <span className="sebar-table-account-name">{acc.name}</span>
                            </td>
                            <td>
                              <span className="sebar-table-account-category">{acc.category || '-'}</span>
                            </td>
                            <td>
                              <span className="sebar-table-verified-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Terverifikasi
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <a
                                href={acc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="sebar-table-action-btn"
                              >
                                <span>Buka Akun</span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="sebar-table-empty-td">
                          <div className="sebar-table-empty-box">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p className="sebar-table-empty-title">Akun mitra tidak ditemukan</p>
                            <p className="sebar-table-empty-sub">Coba kata kunci pencarian lain atau pilih tab platform yang berbeda.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="sebar-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
