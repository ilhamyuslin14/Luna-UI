import { useState, useEffect } from 'react';
import { getSeleksiByKode, getAllActiveJobs, recordJobView } from '../../services/seleksiService.js';
import { uploadAndExtractCV, updateKandidat, createActivityLog, updateActivityLog } from '../../services/kandidatService.js';
import { runScoring } from '../../services/scoringService.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;

export function isValidUrl(str) {
  if (!str) return true;
  try {
    new URL(str.startsWith('http') ? str : 'https://' + str);
    return str.includes('.');
  } catch {
    return false;
  }
}

export function formatDeskripsiToHtml(text) {
  if (!text) return '';
  if (text.includes('<p>') || text.includes('<ul>') || text.includes('<ol>') || text.includes('<br')) return text;

  const lines = text.split('\n');
  let inList = false;
  let listType = null; // 'ul' | 'ol'
  let html = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      return;
    }

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
    const isNumbered = /^\d+[\.\)]\s*/.test(trimmed);

    if (isBullet) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ul';
        html += '<ul>';
      }
      const content = trimmed.replace(/^[•\-\*]\s*/, '');
      html += `<li>${content}</li>`;
    } else if (isNumbered) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = true;
        listType = 'ol';
        html += '<ol>';
      }
      const content = trimmed.replace(/^\d+[\.\)]\s*/, '');
      html += `<li>${content}</li>`;
    } else {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      html += `<p>${trimmed}</p>`;
    }
  });

  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  return html;
}

export function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '-';
  }
}

function stripRupiahPrefix(val) {
  if (!val) return val;
  return String(val).trim().replace(/^rp\.?\s*/i, '');
}

export function formatPengalaman(val) {
  if (!val && val !== 0) return null;
  const trimmed = String(val).trim();
  return /^\d+$/.test(trimmed) ? `${trimmed} Tahun` : trimmed;
}

export function formatUpah(data) {
  if (!data) return null;
  const min = data.upah_min || data.gaji_min || null;
  const maks = data.upah_maks || data.gaji_maks || null;
  if (min || maks) {
    const minStr = stripRupiahPrefix(min) || '-';
    const maksStr = stripRupiahPrefix(maks) || '-';
    return `${minStr} – ${maksStr}${data.siklus_upah ? ' / ' + data.siklus_upah : ''}`;
  }
  if (data.gaji || data.upah) return stripRupiahPrefix(data.gaji || data.upah);
  return null;
}

export function getApplyErrorInfo(msg) {
  if (!msg) return { title: 'Gagal Mengirim Lamaran', desc: 'Terjadi kesalahan saat memproses lamaran Anda. Silakan coba lagi.' };
  if (/sudah pernah diunggah/i.test(msg)) {
    return { title: 'CV Sudah Pernah Dikirim', desc: 'CV dengan isi yang sama pernah dikirim sebelumnya. Lamaran Anda tetap akan kami proses pada posisi ini.' };
  }
  if (/bukan cv|lowongan|brosur/i.test(msg)) {
    return { title: 'Dokumen Bukan CV', desc: 'File yang Anda unggah terdeteksi bukan merupakan CV/resume. Silakan unggah dokumen CV yang sesuai.' };
  }
  if (/konfigurasi ai/i.test(msg)) {
    return { title: 'Sistem Sedang Bermasalah', desc: 'Sistem kami sedang mengalami gangguan. Silakan coba beberapa saat lagi.' };
  }
  if (/format file/i.test(msg)) {
    return { title: 'Format File Tidak Didukung', desc: 'File yang Anda unggah berupa gambar atau format lain yang tidak dapat dibaca sistem kami. Silakan gunakan file PDF, DOC, atau DOCX yang berisi teks CV Anda.' };
  }
  return { title: 'Gagal Mengirim Lamaran', desc: msg };
}

export function getAdminActivityState(data) {
  if (!data) return { isOnline: true, text: 'Rekruter Online' };

  const compId = data.company_id || data.companies?.id;
  const localActive = (compId && localStorage.getItem(`luna_admin_last_login_${compId}`)) || localStorage.getItem('luna_admin_last_login');

  const timestamp = localActive || data.companies?.updated_at || data.companies?.created_at || data.updated_at || data.created_at;
  if (!timestamp) {
    return { isOnline: true, text: 'Rekruter Online' };
  }

  const past = new Date(timestamp);
  const now = new Date();
  const diffMs = now - past;

  if (isNaN(diffMs) || diffMs < 0) {
    return { isOnline: true, text: 'Rekruter Online' };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 30) {
    return { isOnline: true, text: 'Rekruter Online' };
  }

  if (diffMinutes < 60) {
    return { isOnline: true, text: `Rekruter aktif ${diffMinutes} mnt lalu` };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return { isOnline: true, text: `Rekruter aktif ${diffHours} jam lalu` };
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return { isOnline: false, text: `Rekruter aktif 1 hr lalu` };
  }
  if (diffDays < 7) {
    return { isOnline: false, text: `Rekruter aktif ${diffDays} hr lalu` };
  }

  return { isOnline: true, text: 'Rekruter Online' };
}

export const MOCK_PORTAL_JOBS = [
  {
    id: 'mock-p1', jabatan: 'Senior Project Manager', lokasi: 'Jakarta Selatan', remote: 'Hibrid', ikatan_kerja: 'Penuh Waktu',
    upah_min: '15.000.000', upah_maks: '25.000.000', siklus_upah: 'Bulan',
    companies: { name: 'PT Arkademi Daya Indonesia', logo_url: null }, departments: { name: 'Operational' },
  },
  {
    id: 'mock-p2', jabatan: 'Full-Stack Software Engineer', lokasi: 'Bandung', remote: 'Remote', ikatan_kerja: 'Penuh Waktu',
    upah_min: '14.000.000', upah_maks: '22.000.000', siklus_upah: 'Bulan',
    companies: { name: 'TechIndo Solutions', logo_url: null }, departments: { name: 'Engineering' },
  },
  {
    id: 'mock-p3', jabatan: 'Digital Marketing & Growth Lead', lokasi: 'Jakarta Pusat', remote: 'Onsite', ikatan_kerja: 'Penuh Waktu',
    upah_min: '10.000.000', upah_maks: '16.000.000', siklus_upah: 'Bulan',
    companies: { name: 'MarketPulse Asia', logo_url: null }, departments: { name: 'Marketing' },
  },
  {
    id: 'mock-p4', jabatan: 'UI/UX Product Designer', lokasi: 'Surabaya', remote: 'Remote', ikatan_kerja: 'Penuh Waktu',
    upah_min: '9.000.000', upah_maks: '15.000.000', siklus_upah: 'Bulan',
    companies: { name: 'Designative Studio', logo_url: null }, departments: { name: 'Design' },
  },
  {
    id: 'mock-p5', jabatan: 'Business Development Specialist', lokasi: 'Jakarta Selatan', remote: 'Onsite', ikatan_kerja: 'Penuh Waktu',
    upah_min: '8.000.000', upah_maks: '13.000.000', siklus_upah: 'Bulan',
    companies: { name: 'PT Arkademi Daya Indonesia', logo_url: null }, departments: { name: 'Business' },
  },
];

// Data + aksi untuk laman karier publik (tanpa login) — detail lowongan +
// form lamar + layar berhasil/portal. Dipakai bareng oleh
// Lowongan-LamanKarir_001.jsx (desktop) dan LamanKarirMobile.jsx — markup
// & CSS beda total (2-kolom sticky sidebar di desktop vs sheet+sticky-bar
// di mobile), tapi fetch data, validasi form, dan alur submit (upload CV →
// ekstrak AI → scoring) sama persis, termasuk urutan progress text/percent
// yang ditampilkan supaya kandidat tetap yakin lamarannya benar diproses.
export default function useLamanKarirData(kode) {
  const [pageState, setPageState] = useState('loading'); // loading | ready | not-found
  const [seleksiData, setSeleksiData] = useState(null);
  const [viewCount, setViewCount] = useState(0);

  const [form, setForm] = useState({ nama: '', email: '', phone: '', linkedin: '' });
  const [cvFile, setCvFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitState, setSubmitState] = useState('idle'); // idle | uploading | success | error
  const [submitErrorMsg, setSubmitErrorMsg] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [portalJobs, setPortalJobs] = useState([]);
  const [portalSearch, setPortalSearch] = useState('');
  const [portalCategory, setPortalCategory] = useState('Semua');
  const [dragOver, setDragOver] = useState(false);
  const [linkedinError, setLinkedinError] = useState(false);

  useEffect(() => {
    if (submitState === 'success') {
      getAllActiveJobs().then(data => {
        setPortalJobs(data && data.length > 0 ? data : MOCK_PORTAL_JOBS);
      }).catch(err => {
        console.error('Error fetching portal jobs:', err);
        setPortalJobs(MOCK_PORTAL_JOBS);
      });
    }
  }, [submitState]);

  const handleProgressUpdate = (msg) => {
    if (!msg) return;
    const str = String(msg).trim();

    if (/^\d+%?$/.test(str)) {
      const num = parseInt(str, 10);
      if (!isNaN(num)) setUploadPercent(num);
      return;
    }

    const numMatch = str.match(/(\d+)%/);
    if (numMatch) {
      setUploadPercent(parseInt(numMatch[1], 10));
    } else if (/unggah|upload/i.test(str)) {
      setUploadPercent(30);
    } else if (/ekstrak|parsing|analisis|membaca/i.test(str)) {
      setUploadPercent(65);
    } else if (/menilai|scoring|kriteria/i.test(str)) {
      setUploadPercent(88);
    }

    if (/unggah|upload/i.test(str)) {
      setProgressText('Mengunggah berkas CV Anda ke server...');
    } else if (/ekstrak|parsing|analisis|membaca/i.test(str)) {
      setProgressText('Mengekstrak data profil & keahlian dengan AI...');
    } else if (/menilai|scoring|kriteria/i.test(str)) {
      setProgressText('Menilai kualifikasi dengan kriteria posisi...');
    } else if (!/^\d+%?$/.test(str)) {
      setProgressText(str);
    }
  };

  useEffect(() => {
    let active = true;
    if (!kode) {
      setPageState('not-found');
      return;
    }
    getSeleksiByKode(kode).then(data => {
      if (!active) return;
      if (!data || (data.status || '').trim().toLowerCase() !== 'aktif') {
        setPageState('not-found');
        return;
      }
      setSeleksiData(data);
      setPageState('ready');
    }).catch(() => {
      if (active) setPageState('not-found');
    });
    return () => { active = false; };
  }, [kode]);

  useEffect(() => {
    if (!seleksiData?.id) return;

    // Mulai murni dari nilai DB asli atau 0
    const initialViews = typeof seleksiData.view_count === 'number' ? seleksiData.view_count : 0;
    setViewCount(initialViews);

    // Anti-spam dwell-time 3 detik: tunggu kandidat tetap di halaman 3 detik
    const timer = setTimeout(() => {
      recordJobView(seleksiData, initialViews).then(newCount => {
        if (typeof newCount === 'number') setViewCount(newCount);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [seleksiData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'linkedin') setLinkedinError(value ? !isValidUrl(value) : false);
  };

  const handlePhoneChange = (e) => {
    const filtered = e.target.value.replace(/[^0-9+\-\s]/g, '');
    if (filtered.replace(/[^0-9]/g, '').length <= 14) {
      setForm(f => ({ ...f, phone: filtered }));
    }
  };

  const handleFileChange = (file) => {
    setFileError('');
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setFileError('Format file tidak didukung. Harap unggah file PDF, DOC, atau DOCX.');
      return;
    }

    setCvFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    handleFileChange(e.target.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!cvFile) {
      setFileError('Harap unggah file CV Anda.');
      return;
    }

    if (form.linkedin && !isValidUrl(form.linkedin)) {
      setLinkedinError(true);
      return;
    }

    setSubmitState('uploading');
    setSubmitErrorMsg(null);
    setUploadPercent(15);
    setProgressText('Mengunggah berkas CV Anda ke server...');

    const batchId = `pb-${Date.now()}`;
    let logId = null;
    try {
      const log = await createActivityLog({
        batch_id: batchId,
        company_id: seleksiData.company_id,
        nama_file: cvFile.name,
        tipe_aktivitas: 'upload_and_scoring',
        upload_status: 'memproses',
        source: 'Portal Karir',
        posisi_nama: seleksiData?.jabatan || null,
      });
      logId = log?.id;

      setUploadPercent(30);
      const kandidat = await uploadAndExtractCV(
        seleksiData.company_id,
        cvFile,
        seleksiData.jabatan,
        handleProgressUpdate,
        'public'
      );

      const updates = {};
      if (form.nama.trim()) updates.nama_lengkap = form.nama.trim();
      if (form.email.trim()) updates.email = form.email.trim();
      if (form.phone.trim()) updates.phone = form.phone.trim();
      if (form.linkedin.trim()) updates.linkedin_url = form.linkedin.trim();

      if (kandidat?.id && Object.keys(updates).length > 0) {
        await updateKandidat(kandidat.id, updates);
      }

      setUploadPercent(75);
      setProgressText('Menilai kualifikasi Anda dengan kriteria posisi...');

      // CV sudah tersimpan di titik ini — kalau scoring AI gagal, jangan
      // gagalkan submission-nya juga, cukup catat di activity log.
      let scoringStatus = 'gagal';
      if (kandidat?.id && seleksiData?.id) {
        try {
          await runScoring(kandidat.id, seleksiData.id, seleksiData.company_id);
          scoringStatus = 'berhasil';
          setUploadPercent(95);
        } catch (scoreErr) {
          console.error('Scoring gagal:', scoreErr);
        }
      }

      if (logId) {
        await updateActivityLog(logId, {
          kandidat_id: kandidat?.id || null,
          upload_status: 'berhasil',
          scoring_status: scoringStatus,
        });
      }

      setUploadPercent(100);
      setSubmitState('success');
    } catch (err) {
      console.error('Error submitting application:', err);
      try {
        await createActivityLog({
          batch_id: batchId,
          company_id: seleksiData.company_id,
          nama_file: cvFile.name,
          tipe_aktivitas: 'upload_and_scoring',
          upload_status: 'gagal',
          upload_fail_reason: err.message,
          source: 'Portal Karir',
          posisi_nama: seleksiData?.jabatan || null,
        });
      } catch (e) {}

      setSubmitErrorMsg(err.message);
      setSubmitState('error');
    }
  };

  const resetApply = () => {
    setSubmitState('idle');
    setCvFile(null);
    setForm({ nama: '', email: '', phone: '', linkedin: '' });
  };

  const handleShareAction = (platform, onDone) => {
    const pageUrl = window.location.href;
    const shareText = `Lowongan ${seleksiData?.jabatan || ''}${seleksiData?.companies?.name ? ' - ' + seleksiData.companies.name : ''}`;

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

  return {
    pageState, seleksiData, viewCount,
    form, handleChange, handlePhoneChange, linkedinError,
    cvFile, setCvFile, fileError, dragOver, setDragOver, handleFileChange, handleDrop, handleFileInput,
    submitState, submitErrorMsg, progressText, uploadPercent, handleSubmit, resetApply,
    portalJobs, portalSearch, setPortalSearch, portalCategory, setPortalCategory,
    handleShareAction,
  };
}
