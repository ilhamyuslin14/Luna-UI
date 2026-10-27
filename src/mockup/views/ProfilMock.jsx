// MOCKUP: salinan ProfilPelamar_001 untuk presentasi. Berisi PROFIL_DUMMY dan sesi palsu; unggah CV hanya simulasi,
// tidak ada panggilan ke database/AI, dan preferensi tidak disimpan. Interaksi di dalam halaman (modal edit, tambah/hapus)
// tetap bekerja di sisi layar saja.
import { useState, useRef, useEffect } from 'react';
import { useMockSession } from '../MockSession.jsx';
import { MockNavMenu, MockMobileNav } from '../components/MockNav.jsx';
import { PROFIL_DUMMY, RESUME_DUMMY_ROW } from '../data/profilDummy.js';
import PilihanMultiChip from '../../components/pelamar/PilihanMultiChip.jsx';
import { POSISI_REKOMENDASI, LOKASI_REKOMENDASI, KETERSEDIAAN_OPSI, STATUS_PENCARIAN_OPSI, TIPE_KERJA_OPSI, MODEL_KERJA_OPSI, PORTAL_LOWONGAN_REKOMENDASI, GAJI_MAX, prefDariBaris, rupiah } from '../../data/preferensiKerja.js';
import useIsMobile from '../../hooks/useIsMobile.js';
import '../../../css/mobile/shell.css';
import '../../../css/mobile/lowongan/laman-karir.css';
import '../../../css/pelamar/profil-pelamar_001.css';
import '../../../css/lowongan/semua-lowongan_002.css';
import '../../../css/mobile/lowongan/semua-lowongan_002.css';

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// AI selalu kasih tanggal ISO (YYYY-MM-DD) atau literal "Sekarang" (lihat
// parse-cv-pelamar) — dipecah jadi {month, year} buat field form yang sudah
// ada di halaman ini (startMonth/startYear dst, bukan ISO string).
function isoToMonthYear(iso) {
  if (!iso || iso === 'Sekarang') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { month: BULAN_ID[d.getMonth()], year: String(d.getFullYear()) };
}

function formatRelativeTime(iso) {
  if (!iso) return '-';
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return 'Hari ini';
  if (days === 1) return '1 hari lalu';
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

// Mapping hasil parsing AI (public.pelamar_resumes) ke bentuk kartu yang
// sudah dipakai halaman ini — TIDAK pernah mengarang nilai untuk field yang
// memang tidak diekstrak AI (tipe kerja & lokasi per-pengalaman, IPK, dst):
// dibiarkan string kosong, bukan placeholder palsu.
function mapPengalamanFromResume(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item, idx) => {
    const start = isoToMonthYear(item.start);
    const isCurrent = (item.end || '').toLowerCase() === 'sekarang' || !item.end;
    const end = isCurrent ? null : isoToMonthYear(item.end);
    const periode = start
      ? `${start.month} ${start.year} – ${isCurrent ? 'Sekarang' : (end ? `${end.month} ${end.year}` : '')}`
      : '';
    return {
      id: `resume-exp-${idx}`,
      jabatan: item.jabatan || '',
      perusahaan: item.perusahaan || '',
      tipe: '',
      startMonth: start?.month || 'Jan',
      startYear: start?.year || '',
      endMonth: end?.month || 'Des',
      endYear: end?.year || '',
      isCurrent,
      lokasi: '',
      deskripsi: Array.isArray(item.deskripsi) ? item.deskripsi.join(' ') : (item.deskripsi || ''),
      periode,
    };
  });
}

function mapPendidikanFromResume(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item, idx) => {
    const start = isoToMonthYear(item.start);
    const end = isoToMonthYear(item.end);
    return {
      id: `resume-edu-${idx}`,
      institusi: item.institusi || '',
      gelar: item.jenjang || '',
      jurusan: item.jurusan || '',
      startYear: start?.year || '',
      endYear: end?.year || (item.end === 'Sekarang' ? 'Sekarang' : ''),
      ipk: item.gpa || '',
      periode: `${start?.year || ''} – ${item.end === 'Sekarang' ? 'Sekarang' : (end?.year || '')}`,
    };
  });
}

function mapSertifikasiFromResume(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item, idx) => {
    const start = isoToMonthYear(item.start);
    return {
      id: `resume-cert-${idx}`,
      nama: item.nama || '',
      penerbit: item.penerbit || '',
      terbitMonth: start?.month || '',
      terbitYear: start?.year || '',
      terbit: start ? `${start.month} ${start.year}` : '',
      kredensial: '',
    };
  });
}

// Skill dari AI cuma nama string polos, TANPA level — jangan pernah dikasih
// level default yang dikarang FE (lihat permintaan eksplisit: biarkan kosong,
// chip-nya ditampilkan tanpa badge level sama sekali kalau belum ada levelnya).
function mapSkillsFromResume(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(nama => ({ nama, level: null }));
}

const IconFooterLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" /></svg>
);
const IconFooterInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
);

export default function ProfilMock({ navigate }) {
  const { user, pelamarProfile, simpanPreferensi } = useMockSession();
  const isMobile = useIsMobile();

  // Di mobile, daftar yang bisa panjang (riwayat karier, pendidikan, sertifikasi, keahlian) hanya menampilkan
  // beberapa item pertama dengan tombol "lihat lainnya"; deskripsi karier panjang dipotong dengan "Selengkapnya".
  const [lihatSemua, setLihatSemua] = useState({});
  const [deskripsiBuka, setDeskripsiBuka] = useState({});
  const potong = (daftar, kunci, batas) => (isMobile && !lihatSemua[kunci] ? daftar.slice(0, batas) : daftar);
  const tombolLebih = (daftar, kunci, batas, satuan) => {
    if (!isMobile || daftar.length <= batas) return null;
    const terbuka = !!lihatSemua[kunci];
    return (
      <button type="button" className="pp001-more-btn" aria-expanded={terbuka} onClick={() => setLihatSemua((v) => ({ ...v, [kunci]: !v[kunci] }))}>
        {terbuka ? 'Tampilkan lebih sedikit' : `Lihat ${daftar.length - batas} ${satuan} lainnya`}
      </button>
    );
  };
  const deskripsiPanjang = (teks) => isMobile && (teks || '').length > 150;
  // State interaktif mockup
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // State data profil terstruktur — dimulai KOSONG (bukan mock "Ilham
  // Yuslin"), karena halaman ini sekarang jalan untuk akun pelamar
  // sungguhan. nama/email diisi dari pelamar_profiles (akun asli) lewat
  // effect di bawah; pengalaman/pendidikan/sertifikasi/keahlian diisi dari
  // resume yang diunggah (kalau ada). headline/ringkasan/bahasa/preferensi
  // memang manual-only sesuai kesepakatan — tetap kosong sampai diisi user.
  const [profile, setProfile] = useState(PROFIL_DUMMY);

  // Nama & email sumbernya akun asli (pelamar_profiles), bukan field yang
  // diedit lewat modal "Info Dasar" di halaman ini — begitu context auth
  // selesai load, isi otomatis (kalau user belum sempat override manual).
  useEffect(() => {
    if (!pelamarProfile) return;
    setProfile(prev => ({
      ...prev,
      nama: prev.nama || pelamarProfile.nama_lengkap || '',
      email: prev.email || pelamarProfile.email || '',
      telepon: prev.telepon || pelamarProfile.phone || '',
      preferensi: prefDariBaris(pelamarProfile),
    }));
  }, [pelamarProfile]);

  // State: Resume (Berkas CV Utama) — resumeRow = baris mentah dari
  // public.pelamar_resumes (atau null kalau belum pernah unggah), dipakai
  // dua arah: ditampilkan di kartu resume DAN dipakai mengisi
  // pengalaman/pendidikan/sertifikasi/keahlian lewat mapper di atas.
  const [resumeRow, setResumeRow] = useState(RESUME_DUMMY_ROW);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [showModalResume, setShowModalResume] = useState(false);
  const [resumeTempFile, setResumeTempFile] = useState(null); // File asli yang dipilih, belum diunggah
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeProgress, setResumeProgress] = useState({ percent: 0, label: '' });
  const resumeInputRef = useRef(null);

  // Saat memproses, modal tidak boleh ditutup (termasuk menutup tab) supaya
  // pelamar tahu prosesnya sedang berjalan dan tidak terputus di tengah jalan.
  const closeResumeModal = () => {
    if (resumeUploading) return;
    setShowModalResume(false);
    setResumeTempFile(null);
    setResumeUploadError('');
    setResumeProgress({ percent: 0, label: '' });
  };

  useEffect(() => {
    if (!resumeUploading) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [resumeUploading]);

  // Tahap "Parsing data dengan AI" tidak melapor progres sendiri; bar dijalankan
  // pelan-pelan sampai 92% agar terlihat bergerak, lalu loncat ke akhir saat selesai.
  useEffect(() => {
    if (!resumeUploading || resumeProgress.percent < 60 || resumeProgress.percent >= 92) return undefined;
    const t = setTimeout(() => setResumeProgress(p => ({ ...p, percent: Math.min(92, p.percent + 1) })), 600);
    return () => clearTimeout(t);
  }, [resumeUploading, resumeProgress.percent]);

  const applyResumeRow = (row) => setResumeRow(row);

  // resumeData = bentuk tampilan kartu resume, diturunkan dari resumeRow.
  const resumeData = resumeRow ? {
    fileName: resumeRow.file_name || 'resume.pdf',
    fileType: (resumeRow.file_name || '').split('.').pop()?.toUpperCase() || 'PDF',
    fileSize: resumeRow.file_size ? `${(resumeRow.file_size / (1024 * 1024)).toFixed(1)} MB` : null,
    updatedAt: formatRelativeTime(resumeRow.updated_at),
    cv_url: resumeRow.cv_url,
  } : null;

  // Unduh = beneran buka file aslinya di tab baru, BUKAN menghapus resume
  // (versi mockup sebelumnya cuma simulasi "beralih ke state kosong").
  const handleDownloadResume = () => {
    if (resumeData?.cv_url) window.open(resumeData.cv_url, '_blank');
  };

  const handleResumeFileSelect = (e) => {
    const file = e.target.files?.[0];
    setResumeUploadError('');
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError('Ukuran file melebihi batas maksimal 5MB.');
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setResumeUploadError('Format file tidak didukung. Harap unggah PDF atau DOCX.');
      return;
    }
    setResumeTempFile(file);
  };

  // Mockup: tidak ada unggahan sungguhan. Progres dijalankan sebentar lalu kartu resume diganti nama file yang dipilih.
  const handleSaveResume = () => {
    if (!resumeTempFile || resumeUploading) return;
    setResumeUploading(true);
    setResumeUploadError('');
    setResumeProgress({ percent: 8, label: 'Mengunggah berkas…' });
    setTimeout(() => setResumeProgress({ percent: 55, label: 'Membaca isi CV…' }), 600);
    setTimeout(() => setResumeProgress({ percent: 90, label: 'Parsing data dengan AI…' }), 1200);
    setTimeout(() => {
      applyResumeRow({ ...RESUME_DUMMY_ROW, file_name: resumeTempFile.name, file_size: resumeTempFile.size, updated_at: new Date().toISOString() });
      setResumeUploading(false);
      setShowModalResume(false);
      setResumeTempFile(null);
      setResumeProgress({ percent: 0, label: '' });
      triggerToast('Resume baru berhasil diunggah & diproses AI!');
    }, 1900);
  };

  // State & Handlers: Modal Unggah Foto Profil
  const [showModalPhoto, setShowModalPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleOpenPhotoModal = () => {
    setPhotoPreview(profile.avatarUrl || null);
    setShowModalPhoto(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('Ukuran file maksimal 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoPreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    setProfile(prev => ({ ...prev, avatarUrl: photoPreview }));
    setShowModalPhoto(false);
    triggerToast(photoPreview ? 'Foto profil berhasil diperbarui!' : 'Foto profil berhasil dihapus.');
  };

  // State & Handlers: Modal Edit Info Dasar (LinkedIn & Portofolio)
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [editInfo, setEditInfo] = useState({
    nama: '',
    headline: '',
    lokasi: '',
    email: '',
    telepon: '',
    linkedinUrl: '',
    websiteUrl: ''
  });

  const handleOpenInfoModal = () => {
    setEditInfo({
      nama: profile.nama,
      headline: profile.headline,
      lokasi: profile.lokasi,
      email: profile.email,
      telepon: profile.telepon,
      linkedinUrl: profile.linkedinUrl,
      websiteUrl: profile.websiteUrl || ''
    });
    setShowModalInfo(true);
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!editInfo.nama.trim()) {
      triggerToast('Nama lengkap tidak boleh kosong.');
      return;
    }
    setProfile(prev => ({
      ...prev,
      nama: editInfo.nama.trim(),
      headline: editInfo.headline.trim(),
      lokasi: editInfo.lokasi.trim(),
      email: editInfo.email.trim(),
      telepon: editInfo.telepon.trim(),
      linkedinUrl: editInfo.linkedinUrl.trim(),
      websiteUrl: editInfo.websiteUrl.trim()
    }));
    setShowModalInfo(false);
    triggerToast('Info dasar profil berhasil disimpan!');
  };

  // ─── Modal State & Handlers: Ringkasan Pribadi ───
  const [showModalRingkasan, setShowModalRingkasan] = useState(false);
  const [editRingkasan, setEditRingkasan] = useState('');

  const handleOpenRingkasanModal = () => {
    setEditRingkasan(profile.ringkasan);
    setShowModalRingkasan(true);
  };

  const handleSaveRingkasan = (e) => {
    e.preventDefault();
    setProfile(prev => ({ ...prev, ringkasan: editRingkasan.trim() }));
    setShowModalRingkasan(false);
    triggerToast('Ringkasan pribadi berhasil diperbarui!');
  };

  // ─── Modal State & Handlers: Riwayat Karier / Pengalaman ───
  const [showModalExp, setShowModalExp] = useState(false);
  const [expForm, setExpForm] = useState({
    id: null,
    jabatan: '',
    perusahaan: '',
    tipe: 'Penuh Waktu · Hybrid',
    startMonth: 'Jan',
    startYear: '2023',
    endMonth: 'Des',
    endYear: '2024',
    isCurrent: true,
    lokasi: '',
    deskripsi: ''
  });

  // State: Modal Konfirmasi Hapus Jabatan
  const [deleteConfirmExp, setDeleteConfirmExp] = useState(null); // id of item to delete or null

  const handleOpenExpModal = (exp = null) => {
    if (exp) {
      setExpForm({
        id: exp.id,
        jabatan: exp.jabatan || '',
        perusahaan: exp.perusahaan || '',
        tipe: exp.tipe || 'Penuh Waktu · Hybrid',
        startMonth: exp.startMonth || 'Jan',
        startYear: exp.startYear || '2023',
        endMonth: exp.endMonth || 'Des',
        endYear: exp.endYear || '2024',
        isCurrent: exp.isCurrent ?? false,
        lokasi: exp.lokasi || '',
        deskripsi: exp.deskripsi || ''
      });
    } else {
      setExpForm({
        id: null,
        jabatan: '',
        perusahaan: '',
        tipe: 'Penuh Waktu · Hybrid',
        startMonth: 'Jan',
        startYear: '2024',
        endMonth: 'Agu',
        endYear: '2025',
        isCurrent: true,
        lokasi: 'Jakarta, Indonesia',
        deskripsi: ''
      });
    }
    setShowModalExp(true);
  };

  const handleSaveExp = (e) => {
    e.preventDefault();
    if (!expForm.jabatan.trim() || !expForm.perusahaan.trim()) {
      triggerToast('Jabatan dan Nama Perusahaan wajib diisi.');
      return;
    }

    const periodeStr = expForm.isCurrent
      ? `${expForm.startMonth} ${expForm.startYear} – Sekarang`
      : `${expForm.startMonth} ${expForm.startYear} – ${expForm.endMonth} ${expForm.endYear}`;

    const formattedItem = {
      ...expForm,
      periode: periodeStr
    };

    if (expForm.id) {
      setProfile(prev => ({
        ...prev,
        pengalaman: prev.pengalaman.map(item => item.id === expForm.id ? formattedItem : item)
      }));
      triggerToast('Riwayat pekerjaan berhasil diperbarui!');
    } else {
      const newItem = { ...formattedItem, id: Date.now() };
      setProfile(prev => ({
        ...prev,
        pengalaman: [newItem, ...prev.pengalaman]
      }));
      triggerToast('Pengalaman kerja baru berhasil ditambahkan!');
    }
    setShowModalExp(false);
  };

  // State: Modal Konfirmasi Hapus Universal (Karier, Pendidikan, Sertifikasi)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null); // { type: 'exp' | 'edu' | 'cert', data: object } or null

  const handlePromptDeleteExp = (expId) => {
    const item = profile.pengalaman.find(p => p.id === expId);
    if (item) setDeleteConfirmItem({ type: 'exp', data: item });
  };

  const handlePromptDeleteEdu = (eduId) => {
    const item = profile.pendidikan.find(p => p.id === eduId);
    if (item) setDeleteConfirmItem({ type: 'edu', data: item });
  };

  const handlePromptDeleteCert = (certId) => {
    const item = profile.sertifikasi.find(c => c.id === certId);
    if (item) setDeleteConfirmItem({ type: 'cert', data: item });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    const { type, data } = deleteConfirmItem;

    if (type === 'exp') {
      setProfile(prev => ({
        ...prev,
        pengalaman: prev.pengalaman.filter(item => item.id !== data.id)
      }));
      setShowModalExp(false);
      triggerToast('Riwayat pengalaman berhasil dihapus.');
    } else if (type === 'edu') {
      setProfile(prev => ({
        ...prev,
        pendidikan: prev.pendidikan.filter(item => item.id !== data.id)
      }));
      setShowModalEdu(false);
      triggerToast('Riwayat pendidikan berhasil dihapus.');
    } else if (type === 'cert') {
      setProfile(prev => ({
        ...prev,
        sertifikasi: prev.sertifikasi.filter(item => item.id !== data.id)
      }));
      setShowModalCert(false);
      triggerToast('Lisensi / sertifikasi berhasil dihapus.');
    }

    setDeleteConfirmItem(null);
  };

  // ─── Modal State & Handlers: Pendidikan ───
  const [showModalEdu, setShowModalEdu] = useState(false);
  const [eduForm, setEduForm] = useState({
    id: null,
    institusi: '',
    gelar: '',
    jurusan: '',
    startYear: '2019',
    endYear: '2023',
    ipk: ''
  });

  const handleOpenEduModal = (edu = null) => {
    if (edu) {
      setEduForm({
        id: edu.id,
        institusi: edu.institusi || '',
        gelar: edu.gelar || '',
        jurusan: edu.jurusan || '',
        startYear: edu.startYear || (edu.periode ? edu.periode.split('–')[0]?.trim() : '2019'),
        endYear: edu.endYear || (edu.periode ? edu.periode.split('–')[1]?.trim() : '2023'),
        ipk: edu.ipk || ''
      });
    } else {
      setEduForm({
        id: null,
        institusi: '',
        gelar: 'Sarjana Komputer (S.Kom)',
        jurusan: 'Sistem Informasi',
        startYear: '2019',
        endYear: '2023',
        ipk: '3.80'
      });
    }
    setShowModalEdu(true);
  };

  const handleSaveEdu = (e) => {
    e.preventDefault();
    if (!eduForm.institusi.trim()) {
      triggerToast('Nama Institusi / Universitas wajib diisi.');
      return;
    }

    const formattedItem = {
      ...eduForm,
      periode: `${eduForm.startYear} – ${eduForm.endYear}`
    };

    if (eduForm.id) {
      setProfile(prev => ({
        ...prev,
        pendidikan: prev.pendidikan.map(item => item.id === eduForm.id ? formattedItem : item)
      }));
      triggerToast('Data pendidikan berhasil diperbarui!');
    } else {
      const newItem = { ...formattedItem, id: Date.now() };
      setProfile(prev => ({
        ...prev,
        pendidikan: [...prev.pendidikan, newItem]
      }));
      triggerToast('Pendidikan baru berhasil ditambahkan!');
    }
    setShowModalEdu(false);
  };

  // ─── Modal State & Handlers: Sertifikasi ───
  const [showModalCert, setShowModalCert] = useState(false);
  const [certForm, setCertForm] = useState({
    id: null,
    nama: '',
    penerbit: '',
    terbitMonth: 'Agu',
    terbitYear: '2022',
    kredensial: ''
  });

  const handleOpenCertModal = (cert = null) => {
    if (cert) {
      setCertForm({
        id: cert.id,
        nama: cert.nama || '',
        penerbit: cert.penerbit || '',
        terbitMonth: cert.terbitMonth || (cert.terbit ? cert.terbit.split(' ')[0] : 'Agu'),
        terbitYear: cert.terbitYear || (cert.terbit ? cert.terbit.split(' ')[1] : '2022'),
        kredensial: cert.kredensial || ''
      });
    } else {
      setCertForm({
        id: null,
        nama: '',
        penerbit: '',
        terbitMonth: 'Jan',
        terbitYear: '2024',
        kredensial: ''
      });
    }
    setShowModalCert(true);
  };

  const handleSaveCert = (e) => {
    e.preventDefault();
    if (!certForm.nama.trim() || !certForm.penerbit.trim()) {
      triggerToast('Nama Sertifikasi & Lembaga Penerbit wajib diisi.');
      return;
    }

    const formattedCert = {
      ...certForm,
      terbit: `${certForm.terbitMonth} ${certForm.terbitYear}`
    };

    if (certForm.id) {
      setProfile(prev => ({
        ...prev,
        sertifikasi: prev.sertifikasi.map(item => item.id === certForm.id ? formattedCert : item)
      }));
      triggerToast('Sertifikasi berhasil diperbarui!');
    } else {
      const newItem = { ...formattedCert, id: Date.now() };
      setProfile(prev => ({
        ...prev,
        sertifikasi: [...prev.sertifikasi, newItem]
      }));
      triggerToast('Sertifikasi baru berhasil ditambahkan!');
    }
    setShowModalCert(false);
  };

  // ─── Modal State & Handlers: Keahlian ───
  const [showModalSkill, setShowModalSkill] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Tingkat Lanjut');

  const handleOpenSkillModal = () => {
    setSkillsList([...profile.keahlian]);
    setNewSkillName('');
    setShowModalSkill(true);
  };

  const handleAddSkillItem = () => {
    if (!newSkillName.trim()) return;
    setSkillsList(prev => [...prev, { nama: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkillItem = (idx) => {
    setSkillsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveSkill = () => {
    setProfile(prev => ({ ...prev, keahlian: skillsList }));
    setShowModalSkill(false);
    triggerToast('Daftar keahlian berhasil diperbarui!');
  };

  // ─── Modal State & Handlers: Bahasa ───
  const [showModalLang, setShowModalLang] = useState(false);
  const [langList, setLangList] = useState([]);
  const [newLangName, setNewLangName] = useState('');
  const [newLangProf, setNewLangProf] = useState('Kemampuan Kerja Profesional');

  const handleOpenLangModal = () => {
    setLangList([...profile.bahasa]);
    setNewLangName('');
    setShowModalLang(true);
  };

  const handleAddLangItem = () => {
    if (!newLangName.trim()) return;
    setLangList(prev => [...prev, { bahasa: newLangName.trim(), level: newLangProf, kefasihan: newLangProf }]);
    setNewLangName('');
  };

  const handleRemoveLangItem = (idx) => {
    setLangList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveLang = () => {
    setProfile(prev => ({ ...prev, bahasa: langList }));
    setShowModalLang(false);
    triggerToast('Penguasaan bahasa berhasil disimpan!');
  };

  // ─── Modal State & Handlers: Preferensi Pekerjaan Berikutnya ───
  const [showModalPref, setShowModalPref] = useState(false);
  const [prefForm, setPrefForm] = useState(prefDariBaris(null));
  const [savingPref, setSavingPref] = useState(false);

  const handleOpenPrefModal = () => {
    const p = profile.preferensi;
    setPrefForm({ ...p, posisi: [...p.posisi], lokasi: [...p.lokasi], tipeKerja: [...p.tipeKerja], akunPortal: [...(p.akunPortal || [])] });
    setShowModalPref(true);
  };

  const handleSavePref = async (e) => {
    e.preventDefault();
    if (prefForm.posisi.length === 0) { triggerToast('Pilih minimal satu posisi yang dicari.'); return; }
    setSavingPref(true);
    try {
      await simpanPreferensi?.(prefForm);
      setProfile(prev => ({ ...prev, preferensi: { ...prefForm } }));
      setShowModalPref(false);
      triggerToast('Preferensi pekerjaan berhasil diperbarui!');
    } catch (err) {
      console.error('Gagal menyimpan preferensi:', err);
      triggerToast('Gagal menyimpan preferensi. Coba lagi.');
    } finally {
      setSavingPref(false);
    }
  };

  // ─── Dynamic Profile Strength Calculation ───
  const profileFactors = [
    {
      id: 'info',
      label: 'Lengkapi info dasar & kontak',
      weight: 15,
      isDone: Boolean(profile.nama && profile.headline && profile.email && profile.lokasi),
      action: handleOpenInfoModal
    },
    {
      id: 'ringkasan',
      label: 'Isi ringkasan profil pribadi',
      weight: 10,
      isDone: Boolean(profile.ringkasan && profile.ringkasan.trim().length > 20),
      action: handleOpenRingkasanModal
    },
    {
      id: 'pengalaman',
      label: 'Tambahkan riwayat pengalaman kerja',
      weight: 20,
      isDone: profile.pengalaman && profile.pengalaman.length > 0,
      action: () => handleOpenExpModal()
    },
    {
      id: 'pendidikan',
      label: 'Tambahkan riwayat pendidikan',
      weight: 15,
      isDone: profile.pendidikan && profile.pendidikan.length > 0,
      action: () => handleOpenEduModal()
    },
    {
      id: 'keahlian',
      label: 'Tambahkan minimal 3 keahlian utama',
      weight: 10,
      isDone: profile.keahlian && profile.keahlian.length >= 3,
      action: handleOpenSkillModal
    },
    {
      id: 'resume',
      label: 'Unggah berkas CV terbaru (PDF)',
      weight: 15,
      isDone: Boolean(resumeData && resumeData.fileName),
      action: () => setShowModalResume(true)
    },
    {
      id: 'portofolio',
      label: 'Tautkan link portofolio (Dribbble/GitHub/Web)',
      weight: 10,
      isDone: Boolean(profile.websiteUrl && profile.websiteUrl.trim().length > 0),
      action: handleOpenInfoModal
    },
    {
      id: 'preferensi',
      label: 'Atur preferensi pekerjaan berikutnya',
      weight: 5,
      isDone: Boolean(profile.preferensi && profile.preferensi.posisi.length > 0),
      action: handleOpenPrefModal
    }
  ];

  const overallStrengthScore = profileFactors.reduce((acc, cur) => acc + (cur.isDone ? cur.weight : 0), 0);

  const goPerusahaan = () => {}; // mockup: tombol tampil tapi tidak berpindah halaman

  return (
    <div className="pp001-layout">
      {isMobile ? (
        /* ─── Navbar mobile ("Opsi 2" — avatar + sheet konsolidasi) ─── */
        <div className="lk-head">
          <a className="lk-logo" href="/?view=semua-lowongan_002" onClick={(e) => { e.preventDefault(); navigate?.('landingpage-pelamar'); }}>
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
            <span className="lk-logo-divider" />
            <span className="lk-badge-portal">PORTAL KARIR</span>
          </a>
          <div className="lk-head-actions">
            <MockMobileNav navigate={navigate} activeTab="profil" />
          </div>
        </div>
      ) : (
        /* ─── Topbar Selaras Portal Karir / Semua Lowongan ─── */
        <header className="pp001-navbar">
          <div className="pp001-navbar-container">
            <div className="pp001-nav-left">
              <a className="pp001-nav-brand" href="/?view=semua-lowongan_002" onClick={(e) => { e.preventDefault(); navigate?.('landingpage-pelamar'); }}>
                <img src="/assets/logos/luna-logo-clean.png" alt="Luna UI" />
                <span className="pp001-nav-divider" />
                <span className="pp001-nav-badge">PORTAL KARIR</span>
              </a>

              <div className="pp001-nav-links">
                <span className="pp001-nav-link" onClick={() => navigate?.('semua-lowongan_002')}>
                  Cari Lowongan
                </span>
                <span className="pp001-nav-link active">
                  Profil Saya
                </span>
              </div>
            </div>

            <div className="pp001-nav-right">
              <MockNavMenu navigate={navigate} />

              <span className="pp001-nav-separator" />

              {/* CTA Untuk Perusahaan: Persis di paling kanan dengan styling lingkaran ikon briefcase */}
              <button
                type="button"
                className="pp001-btn-perusahaan"
                onClick={goPerusahaan}
                title="Untuk Perusahaan (Masuk ke Dashboard Recruiter)"
              >
                <span className="pp001-btn-perusahaan-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </span>
                Untuk Perusahaan
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ─── Hero Cover Pattern ─── */}
      <div className="pp001-hero-cover">
        <div className="pp001-cover-pattern" />
        <div className="pp001-cover-rings" />
      </div>

      {/* ─── Main Container ─── */}
      <div className="pp001-container">

        {/* ─── Profile Header Identity Card ─── */}
        <section className="pp001-identity-card">
          <div className="pp001-identity-main">
            <div className="pp001-identity-left">
              <div className="pp001-avatar-wrap">
                <div className="pp001-avatar-img" style={{ overflow: 'hidden' }}>
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(profile.nama)
                  )}
                </div>
                <button
                  type="button"
                  className="pp001-avatar-btn-edit"
                  title="Ubah Foto Profil"
                  onClick={handleOpenPhotoModal}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              <div className="pp001-identity-info">
                <div className="pp001-name-row">
                  <h1 className="pp001-name">{profile.nama}</h1>
                </div>

                <p className="pp001-headline">{profile.headline}</p>

                <div className="pp001-meta-list">
                  {profile.lokasi && (
                    <span className="pp001-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {profile.lokasi}
                    </span>
                  )}

                  {profile.email && (
                    <span className="pp001-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {profile.email}
                    </span>
                  )}

                  {profile.linkedinUrl && (
                    <span className="pp001-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0A66C2' }}>
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <a
                        href={`https://${profile.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pp001-meta-link"
                        onClick={(e) => {
                          e.preventDefault();
                          navigator.clipboard?.writeText(`https://${profile.linkedinUrl}`);
                          triggerToast('Tautan LinkedIn berhasil disalin!');
                        }}
                        title="Klik untuk salin tautan LinkedIn"
                      >
                        {profile.linkedinUrl}
                      </a>
                    </span>
                  )}

                  {profile.websiteUrl && (
                    <span className="pp001-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D66800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <a
                        href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pp001-meta-link"
                        onClick={(e) => {
                          e.preventDefault();
                          const fullUrl = profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`;
                          navigator.clipboard?.writeText(fullUrl);
                          triggerToast('Tautan portofolio berhasil disalin!');
                        }}
                        title="Klik untuk salin tautan portofolio"
                      >
                        {profile.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </span>
                  )}

                  {(!profile.lokasi || !profile.linkedinUrl || !profile.websiteUrl) && (
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        color: '#D66800',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={handleOpenInfoModal}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Tambah Detail
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pp001-identity-actions">
              <button
                type="button"
                className="pp001-btn-primary"
                onClick={handleOpenInfoModal}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Info Dasar
              </button>
            </div>
          </div>
        </section>

        {/* ─── Grid 2 Kolom (Konten 70% + Sidebar 30%) ─── */}
        <div className="pp001-grid">

          {/* ════════ KOLOM UTAMA (KIRI) ════════ */}
          <div className="pp001-main-col">

            {/* 1. Dokumen Resume / CV Utama (Di Paling Atas) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <h2 className="pp001-section-title">Dokumen Resume / CV Utama</h2>
                </div>
              </div>
              <p className="pp001-section-desc">
                Unggah dokumen resume (PDF/DOCX). AI LUNA otomatis membaca berkas ini untuk mengisi profil dan melamar ke lowongan perusahaan.
              </p>

              {resumeLoading ? (
                <p className="pp001-empty-hint">Memuat resume…</p>
              ) : resumeData ? (
                <div className="pp001-resume-box">
                  <div className="pp001-resume-info">
                    <div className="pp001-resume-icon-badge">{resumeData.fileType || 'PDF'}</div>
                    <div className="pp001-resume-meta">
                      <h5>{resumeData.fileName}</h5>
                      <p>{resumeData.fileSize ? `${resumeData.fileSize} · ` : ''}Terakhir diperbarui {resumeData.updatedAt}</p>
                    </div>
                  </div>

                  <div className="pp001-resume-actions">
                    <button
                      type="button"
                      className="pp001-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={handleDownloadResume}
                      title="Klik untuk mengunduh (akan mensimulasikan state tanpa resume)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Unduh
                    </button>
                    <button
                      type="button"
                      className="pp001-btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => setShowModalResume(true)}
                    >
                      Unggah Resume Baru
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pp001-resume-empty">
                  <div className="pp001-resume-empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="pp001-resume-empty-text">
                    <h5 className="pp001-resume-empty-title">Belum ada resume yang terunggah</h5>
                    <p className="pp001-resume-empty-sub">Unggah dokumen resume (PDF atau DOCX) Anda untuk memudahkan perusahaan membaca kualifikasi Anda.</p>
                  </div>
                  <button
                    type="button"
                    className="pp001-btn-primary"
                    style={{ padding: '8px 18px', fontSize: 13 }}
                    onClick={() => setShowModalResume(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Unggah Resume Sekarang
                  </button>
                </div>
              )}
            </section>

            {/* 2. Ringkasan Pribadi (About / Bio) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h2 className="pp001-section-title">Ringkasan Pribadi</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={handleOpenRingkasanModal}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ubah
                </button>
              </div>
              <p className="pp001-section-desc">
                Ceritakan singkat siapa Anda, fokus keahlian, dan apa yang Anda cari — ini yang pertama kali dibaca recruiter.
              </p>
              {profile.ringkasan ? (
                <p style={{ margin: 0, fontSize: 14, color: '#3D3B36', lineHeight: 1.65 }}>
                  {profile.ringkasan}
                </p>
              ) : (
                <p className="pp001-empty-hint">Belum ada ringkasan — ceritakan singkat pengalaman dan keahlian Anda.</p>
              )}
            </section>

            {/* 3. Riwayat Karier (Work Experience) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <h2 className="pp001-section-title">Riwayat Karier</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={() => handleOpenExpModal(null)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Tambah Jabatan
                </button>
              </div>
              <p className="pp001-section-desc">
                Semakin lengkap riwayat posisi dan pencapaian Anda, semakin tinggi skor rekomendasi AI ke recruiter.
              </p>

              <div className="pp001-item-list">
                {profile.pengalaman.length === 0 && (
                  <p className="pp001-empty-hint">Belum ada riwayat karier — unggah resume atau tambah manual lewat "Tambah Jabatan".</p>
                )}
                {potong(profile.pengalaman, 'pengalaman', 2).map((exp) => (
                  <div key={exp.id} className="pp001-item">
                    <div className="pp001-item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>

                    <div className="pp001-item-body">
                      <div className="pp001-item-top">
                        <div>
                          <h3 className="pp001-item-title">{exp.jabatan}</h3>
                          <div className="pp001-item-company">{exp.perusahaan}</div>
                        </div>
                        <div className="pp001-item-actions">
                          <button
                            type="button"
                            className="pp001-btn-action-icon"
                            title="Edit Jabatan"
                            onClick={() => handleOpenExpModal(exp)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pp001-btn-action-icon pp001-btn-action-danger"
                            title="Hapus Jabatan"
                            onClick={() => handlePromptDeleteExp(exp.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="pp001-item-meta">
                        <span>{exp.tipe}</span>
                        <span>•</span>
                        <span>{exp.periode}</span>
                        {exp.isCurrent && <span className="pp001-tag-current">Sekarang Bekerja</span>}
                        <span>•</span>
                        <span>{exp.lokasi}</span>
                      </div>

                      <p className={`pp001-item-desc${deskripsiPanjang(exp.deskripsi) && !deskripsiBuka[exp.id] ? ' is-clamp' : ''}`}>{exp.deskripsi}</p>
                      {deskripsiPanjang(exp.deskripsi) && (
                        <button type="button" className="pp001-more-inline" onClick={() => setDeskripsiBuka((v) => ({ ...v, [exp.id]: !v[exp.id] }))}>
                          {deskripsiBuka[exp.id] ? 'Lebih sedikit' : 'Selengkapnya'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {tombolLebih(profile.pengalaman, 'pengalaman', 2, 'riwayat')}
            </section>

            {/* 4. Pendidikan (Education) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  <h2 className="pp001-section-title">Pendidikan</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={() => handleOpenEduModal(null)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Tambah Pendidikan
                </button>
              </div>
              <p className="pp001-section-desc">
                Riwayat pendidikan membantu perusahaan menilai kualifikasi dasar Anda untuk posisi yang mensyaratkan jenjang tertentu.
              </p>

              <div className="pp001-item-list">
                {profile.pendidikan.length === 0 && (
                  <p className="pp001-empty-hint">Belum ada riwayat pendidikan — unggah resume atau tambah manual lewat "Tambah Pendidikan".</p>
                )}
                {potong(profile.pendidikan, 'pendidikan', 2).map((edu) => (
                  <div key={edu.id} className="pp001-item">
                    <div className="pp001-item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>

                    <div className="pp001-item-body">
                      <div className="pp001-item-top">
                        <div>
                          <h3 className="pp001-item-title">{edu.institusi}</h3>
                          <div className="pp001-item-company">{edu.gelar} — {edu.jurusan}</div>
                        </div>
                        <div className="pp001-item-actions">
                          <button
                            type="button"
                            className="pp001-btn-action-icon"
                            title="Edit Pendidikan"
                            onClick={() => handleOpenEduModal(edu)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pp001-btn-action-icon pp001-btn-action-danger"
                            title="Hapus Pendidikan"
                            onClick={() => handlePromptDeleteEdu(edu.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="pp001-item-meta">
                        <span>{edu.periode}</span>
                        <span>•</span>
                        <span>IPK: <strong>{edu.ipk}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {tombolLebih(profile.pendidikan, 'pendidikan', 2, 'pendidikan')}
            </section>

            {/* 5. Lisensi & Sertifikasi */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <h2 className="pp001-section-title">Lisensi &amp; Sertifikasi</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={() => handleOpenCertModal(null)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Tambah Sertifikat
                </button>
              </div>
              <p className="pp001-section-desc">
                Sertifikasi dan lisensi resmi jadi bukti tambahan kompetensi Anda di luar riwayat pendidikan formal.
              </p>

              <div className="pp001-item-list">
                {profile.sertifikasi.length === 0 && (
                  <p className="pp001-empty-hint">Belum ada lisensi atau sertifikasi — unggah resume atau tambah manual lewat "Tambah Sertifikat".</p>
                )}
                {potong(profile.sertifikasi, 'sertifikasi', 2).map((cert) => (
                  <div key={cert.id} className="pp001-item">
                    <div className="pp001-item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    </div>

                    <div className="pp001-item-body">
                      <div className="pp001-item-top">
                        <div>
                          <h3 className="pp001-item-title">{cert.nama}</h3>
                          <div className="pp001-item-company">{cert.penerbit}</div>
                        </div>
                        <div className="pp001-item-actions">
                          <button
                            type="button"
                            className="pp001-btn-action-icon"
                            title="Edit Sertifikasi"
                            onClick={() => handleOpenCertModal(cert)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pp001-btn-action-icon pp001-btn-action-danger"
                            title="Hapus Sertifikasi"
                            onClick={() => handlePromptDeleteCert(cert.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="pp001-item-meta">
                        <span>Diterbitkan {cert.terbit}</span>
                        <span>•</span>
                        <span>ID: {cert.kredensial}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {tombolLebih(profile.sertifikasi, 'sertifikasi', 2, 'sertifikasi')}
            </section>

            {/* 6. Keahlian (Skills) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <h2 className="pp001-section-title">Keahlian &amp; Kompetensi</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={handleOpenSkillModal}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Kelola Keahlian
                </button>
              </div>
              <p className="pp001-section-desc">
                Keahlian ini digunakan oleh mesin pencarian LUNA untuk mencocokkan profil Anda dengan kriteria lowongan perusahaan.
              </p>

              <div className="pp001-skills-grid">
                {profile.keahlian.length === 0 && (
                  <p className="pp001-empty-hint">Belum ada keahlian — unggah resume atau tambah manual lewat "Kelola Keahlian".</p>
                )}
                {potong(profile.keahlian, 'keahlian', 8).map((skill, idx) => (
                  <div key={idx} className="pp001-skill-chip">
                    <span>{skill.nama}</span>
                    {skill.level && <span className="pp001-skill-level">{skill.level}</span>}
                  </div>
                ))}
              </div>
              {tombolLebih(profile.keahlian, 'keahlian', 8, 'keahlian')}
            </section>

            {/* 7. Penguasaan Bahasa */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <h2 className="pp001-section-title">Bahasa</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={handleOpenLangModal}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Kelola Bahasa
                </button>
              </div>
              <p className="pp001-section-desc">
                Cantumkan bahasa yang Anda kuasai dan tingkat kefasihannya, terutama kalau posisi incaran butuh bahasa asing.
              </p>

              <div>
                {profile.bahasa.length === 0 && (
                  <p className="pp001-empty-hint">Belum ada bahasa yang ditambahkan — kelola lewat "Kelola Bahasa".</p>
                )}
                {profile.bahasa.map((item, idx) => (
                  <div key={idx} className="pp001-lang-row">
                    <span className="pp001-lang-name">{item.bahasa}</span>
                    <span className="pp001-lang-prof">{item.kefasihan}</span>
                  </div>
                ))}
              </div>
            </section>



            {/* 9. Preferensi Pekerjaan Berikutnya (Sesuai JobStreet Referensi) */}
            {/* 9. Preferensi Pekerjaan Berikutnya (1 CTA Kelola Terpadu) */}
            <section className="pp001-section-card">
              <div className="pp001-section-header">
                <div className="pp001-section-title-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <h2 className="pp001-section-title">Tentang Jabatan Anda Selanjutnya</h2>
                </div>
                <button
                  type="button"
                  className="pp001-btn-add"
                  onClick={handleOpenPrefModal}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Kelola Preferensi
                </button>
              </div>
              <p className="pp001-section-desc">
                Beri tahu kriteria pekerjaan impian Anda agar rekomendasi lowongan tepat sasaran.
              </p>

              <div className="pp001-pref-table">
                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Posisi yang Dicari</span>
                  <div className="pp001-pref-value">
                    {profile.preferensi.posisi.length > 0
                      ? <div className="pp001-pref-chips">{profile.preferensi.posisi.map(x => <span key={x} className="pp001-pref-chip">{x}</span>)}</div>
                      : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Lokasi yang Diharapkan</span>
                  <div className="pp001-pref-value">
                    {profile.preferensi.lokasi.length > 0
                      ? <div className="pp001-pref-chips">{profile.preferensi.lokasi.map(x => <span key={x} className="pp001-pref-chip">{x}</span>)}</div>
                      : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Gaji Minimum</span>
                  <div className="pp001-pref-value">
                    {profile.preferensi.gajiMin ? (
                      <span style={{ color: '#D66800', fontWeight: 600 }}>
                        {rupiah(profile.preferensi.gajiMin)} / bulan
                        {profile.preferensi.gajiNego && <span className="pp001-pref-badge">Bisa nego</span>}
                      </span>
                    ) : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Jenis Pekerjaan</span>
                  <div className="pp001-pref-value">
                    {profile.preferensi.tipeKerja.length > 0
                      ? <div className="pp001-pref-chips">{profile.preferensi.tipeKerja.map(x => <span key={x} className="pp001-pref-chip">{x}</span>)}</div>
                      : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Model Kerja Diinginkan</span>
                  <div className="pp001-pref-value">{profile.preferensi.modelKerja || <span className="pp001-empty-hint">Belum diisi</span>}</div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Ketersediaan Memulai</span>
                  <div className="pp001-pref-value">{profile.preferensi.ketersediaan || <span className="pp001-empty-hint">Belum diisi</span>}</div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Akun Situs Lowongan Lain</span>
                  <div className="pp001-pref-value">
                    {(profile.preferensi.akunPortal || []).length > 0
                      ? <div className="pp001-pref-chips">{profile.preferensi.akunPortal.map(x => <span key={x} className="pp001-pref-chip">{x}</span>)}</div>
                      : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>

                <div className="pp001-pref-row">
                  <span className="pp001-pref-label">Status Pencarian</span>
                  <div className="pp001-pref-value">
                    {profile.preferensi.statusPencarian ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F8A4E' }} />
                        {profile.preferensi.statusPencarian}
                      </span>
                    ) : <span className="pp001-empty-hint">Belum diisi</span>}
                  </div>
                </div>
              </div>
            </section>

          </div>


          {/* ════════ KOLOM SAMPING / SIDEBAR (KANAN) ════════ */}
          <div className="pp001-side-col">

            {/* Widget 1: Kekuatan Profil (Dinamis Berdasarkan Data Profil) */}
            <div className="pp001-side-widget">
              <h3 className="pp001-widget-title">
                <span>Kelengkapan</span>
                <span className="pp001-progress-percent">{overallStrengthScore}%</span>
              </h3>

              <div className="pp001-progress-container">
                <div className="pp001-progress-track">
                  <div
                    className="pp001-progress-fill"
                    style={{
                      width: `${overallStrengthScore}%`,
                      background: overallStrengthScore === 100
                        ? 'linear-gradient(90deg, #1F8A4E 0%, #2ecc71 100%)'
                        : undefined
                    }}
                  />
                </div>
              </div>

              <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#5E5C56', lineHeight: 1.45 }}>
                {overallStrengthScore === 100 ? (
                  <strong style={{ color: '#1F8A4E' }}>🎉 Luar biasa! Profil Anda sudah 100% lengkap dan siap menarik perhatian recruiter.</strong>
                ) : (
                  <>Profil yang terisi 100% mendapatkan <strong>3.5x lebih banyak undangan interview</strong> dari recruiter.</>
                )}
              </p>

              <div className="pp001-checklist">
                {profileFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="pp001-check-item"
                    style={{
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 6,
                      transition: 'background 0.15s ease'
                    }}
                    onClick={factor.action}
                    title={factor.isDone ? 'Klik untuk melihat/mengubah data' : 'Klik untuk melengkapi data ini'}
                  >
                    <span className={`pp001-check-dot ${factor.isDone ? 'done' : ''}`}>
                      {factor.isDone ? (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </span>
                    <span style={{
                      fontWeight: factor.isDone ? 400 : 600,
                      color: factor.isDone ? 'var(--pp-ink-muted)' : '#D66800',
                      textDecoration: factor.isDone ? 'none' : 'none'
                    }}>
                      {factor.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ─── Footer: sama dengan halaman Semua Lowongan (desktop dan mobile) ─── */}
      {isMobile ? (
        <footer className="sl2m-footer">
          <div className="sl2m-footer-brand">
            <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
            <b>Luna</b>
          </div>
          <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>

          <div className="sl2m-footer-cols">
            <div className="sl2m-footer-col">
              <h5>Untuk Pelamar</h5>
              <button type="button" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</button>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Profil Saya</button>
            </div>
            <div className="sl2m-footer-col">
              <h5>Untuk Perusahaan</h5>
              <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
              <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
            </div>
          </div>

          <div className="sl2m-footer-bottom">
            <span>© {new Date().getFullYear()} Luna. Semua hak dilindungi.</span>
            <div className="sl2m-footer-social">
              <span><IconFooterLinkedIn /></span>
              <span><IconFooterInstagram /></span>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="sl2-footer">
          <div className="sl2-footer-top">
            <div>
              <div className="sl2-footer-brand">
                <img src="/assets/logos/luna-logo-clean.png" alt="Luna" />
                <b>Luna</b>
              </div>
              <p>Platform rekrutmen &amp; portal karier buat perusahaan kecil-menengah di Indonesia.</p>
            </div>
            <div className="sl2-footer-col">
              <h4>Untuk Pelamar</h4>
              <button type="button" onClick={() => navigate?.('semua-lowongan_002')}>Cari Lowongan</button>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Profil Saya</button>
            </div>
            <div className="sl2-footer-col">
              <h4>Untuk Perusahaan</h4>
              <button type="button" onClick={goPerusahaan}>Pasang Lowongan</button>
              <button type="button" onClick={goPerusahaan}>Masuk Dashboard</button>
            </div>
            <div className="sl2-footer-col">
              <h4>Luna</h4>
              <span>Tentang Kami</span>
              <span>Bantuan</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
          <div className="sl2-footer-bottom">
            <span>© 2026 Luna. Seluruh hak cipta dilindungi.</span>
            <div className="sl2-footer-social">
              <span><IconFooterLinkedIn /></span>
              <span><IconFooterInstagram /></span>
            </div>
          </div>
        </footer>
      )}

      {/* ─── Modal 1: Unggah / Ganti Foto Profil ─── */}
      {showModalPhoto && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalPhoto(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Foto Profil</h3>
                <p className="pp001-modal-subtitle">Unggah foto formal atau kasual profesional Anda.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalPhoto(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="pp001-modal-body">
              <div className="pp001-photo-preview-wrap">
                <div className="pp001-photo-big-avatar">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview Foto" />
                  ) : (
                    getInitials(profile.nama)
                  )}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0A0908' }}>
                    {photoPreview ? 'Pratinjau Foto Terpilih' : 'Foto Default (Inisial)'}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#5E5C56', lineHeight: 1.45 }}>
                    Format yang didukung: JPG, PNG, atau WebP. Disarankan rasio 1:1 persegi dengan resolusi minimal 400x400 px.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div
                className="pp001-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="pp001-dropzone-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="pp001-dropzone-title">
                  <span>Pilih file foto</span> atau tarik file ke sini
                </p>
                <p className="pp001-dropzone-sub">Maksimal ukuran berkas 5 MB</p>
              </div>

              {photoPreview && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9342B',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    onClick={() => setPhotoPreview(null)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Hapus Foto (Gunakan Inisial)
                  </button>
                </div>
              )}
            </div>

            <div className="pp001-modal-footer">
              <button
                type="button"
                className="pp001-btn-secondary"
                onClick={() => setShowModalPhoto(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="pp001-btn-primary"
                onClick={handleSavePhoto}
              >
                Simpan Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Edit Informasi Dasar ─── */}
      {showModalInfo && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalInfo(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Edit Informasi Dasar</h3>
                <p className="pp001-modal-subtitle">Perbarui data identitas utama dan kontak yang dilihat oleh recruiter.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalInfo(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInfo}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Nama Lengkap <span>(Wajib)</span>
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={editInfo.nama}
                    placeholder="Contoh: Ilham Yuslin"
                    onChange={e => setEditInfo({ ...editInfo, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Headline Profesional
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={editInfo.headline}
                    placeholder="Contoh: Senior Product Designer & UI/UX Specialist"
                    onChange={e => setEditInfo({ ...editInfo, headline: e.target.value })}
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Domisili / Lokasi Tempat Tinggal
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={editInfo.lokasi}
                    placeholder="Contoh: Jakarta Selatan, DKI Jakarta, Indonesia"
                    onChange={e => setEditInfo({ ...editInfo, lokasi: e.target.value })}
                  />
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="pp001-form-input"
                      value={editInfo.email}
                      placeholder="email@domain.com"
                      onChange={e => setEditInfo({ ...editInfo, email: e.target.value })}
                    />
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      No. WhatsApp / Telepon
                    </label>
                    <input
                      type="tel"
                      className="pp001-form-input"
                      value={editInfo.telepon}
                      placeholder="+62 812-xxxx-xxxx"
                      onChange={e => setEditInfo({ ...editInfo, telepon: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Tautan LinkedIn
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: 14,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0A66C2',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      className="pp001-form-input"
                      style={{ paddingLeft: 135 }}
                      value={editInfo.linkedinUrl.replace(/^linkedin\.com\/in\//, '')}
                      placeholder="username-anda"
                      onChange={e => setEditInfo({ ...editInfo, linkedinUrl: `linkedin.com/in/${e.target.value.trim().replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}` })}
                    />
                  </div>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Tautan Portofolio / Website Proyek <span>(Dribbble, GitHub, Behance, atau Personal Web)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: 14,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#D66800',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      https://
                    </span>
                    <input
                      type="text"
                      className="pp001-form-input"
                      style={{ paddingLeft: 78 }}
                      value={editInfo.websiteUrl ? editInfo.websiteUrl.replace(/^https?:\/\//, '') : ''}
                      placeholder="dribbble.com/username atau portofolio-anda.com"
                      onChange={e => {
                        const val = e.target.value.trim().replace(/^https?:\/\//, '');
                        setEditInfo({ ...editInfo, websiteUrl: val ? `https://${val}` : '' });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pp001-modal-footer">
                <button
                  type="button"
                  className="pp001-btn-secondary"
                  onClick={() => setShowModalInfo(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pp001-btn-primary"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Unggah Resume Baru ─── */}
      {showModalResume && (
        <div className="pp001-modal-overlay" onClick={closeResumeModal}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Unggah Resume / CV Baru</h3>
                <p className="pp001-modal-subtitle">Format didukung: PDF atau DOCX (Maks. 5 MB). File ini akan dijadikan CV utama Anda.</p>
              </div>
              {!resumeUploading && (
                <button
                  type="button"
                  className="pp001-modal-close"
                  onClick={closeResumeModal}
                  title="Tutup"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="pp001-modal-body">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                style={{ display: 'none' }}
                onChange={handleResumeFileSelect}
              />

              {!resumeTempFile && (
                <div
                  className="pp001-dropzone"
                  onClick={() => setResumeTempFile({ name: 'CV_Dina_Pratama_2026.pdf', size: 496 * 1024 })}
                >
                  <div className="pp001-dropzone-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <p className="pp001-dropzone-title">
                    <span>Klik untuk pilih file resume</span> atau tarik &amp; lepas di sini
                  </p>
                  <p className="pp001-dropzone-sub">
                    PDF, DOCX hingga 5MB. AI LUNA akan langsung menyelaraskan data kompetensi.
                  </p>
                </div>
              )}

              {resumeTempFile && (
                <div style={{
                  marginTop: 0,
                  padding: 12,
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#0284C7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800
                  }}>
                    {resumeTempFile.name.split('.').pop().toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C4A6E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resumeTempFile.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#0284C7' }}>
                      {(resumeTempFile.size / (1024 * 1024)).toFixed(1)} MB · {resumeUploading ? 'Sedang diproses' : 'Siap disimpan'}
                    </div>
                  </div>
                  {!resumeUploading && (
                    <button
                      type="button"
                      onClick={() => setResumeTempFile({ name: 'CV_Dina_Pratama_2026.pdf', size: 496 * 1024 })}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: '#0369A1', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                    >
                      Ganti file
                    </button>
                  )}
                </div>
              )}

              {resumeUploading && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>{resumeProgress.label || 'Memproses…'}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#EA580C', fontVariantNumeric: 'tabular-nums' }}>{Math.round(resumeProgress.percent)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${resumeProgress.percent}%`, borderRadius: 999, background: '#FF8D21', transition: 'width 0.5s ease' }} />
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 11.5, color: '#64748B', lineHeight: 1.5 }}>
                    Jangan tutup halaman ini sampai selesai. Proses ini biasanya memakan waktu sekitar setengah menit.
                  </p>
                </div>
              )}

              {resumeUploadError && (
                <p style={{ marginTop: 12, fontSize: 12.5, fontWeight: 600, color: '#B91C1C' }}>{resumeUploadError}</p>
              )}
            </div>

            <div className="pp001-modal-footer">
              {!resumeUploading && (
                <button
                  type="button"
                  className="pp001-btn-secondary"
                  onClick={closeResumeModal}
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                className="pp001-btn-primary"
                onClick={handleSaveResume}
                disabled={!resumeTempFile || resumeUploading}
              >
                {resumeUploading ? 'Memproses…' : 'Simpan & Terapkan Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 4: Edit Ringkasan Pribadi ─── */}
      {showModalRingkasan && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalRingkasan(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Ubah Ringkasan Pribadi</h3>
                <p className="pp001-modal-subtitle">Gambarkan latar belakang, pencapaian utama, dan nilai lebih Anda kepada calon perusahaan.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalRingkasan(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRingkasan}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Ringkasan Profesional
                  </label>
                  <textarea
                    rows={6}
                    className="pp001-form-input"
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                    value={editRingkasan}
                    placeholder="Tulis ringkasan pengalaman dan fokus keahlian Anda..."
                    onChange={e => setEditRingkasan(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#8A8780', marginTop: 4, display: 'block' }}>
                    Tip: Jelaskan peran terkini, pencapaian berdampak tinggi, dan keahlian spesifik Anda.
                  </span>
                </div>
              </div>

              <div className="pp001-modal-footer">
                <button
                  type="button"
                  className="pp001-btn-secondary"
                  onClick={() => setShowModalRingkasan(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pp001-btn-primary"
                >
                  Simpan Ringkasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 5: Tambah / Edit Riwayat Karier ─── */}
      {showModalExp && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalExp(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">{expForm.id ? 'Edit Riwayat Jabatan' : 'Tambah Riwayat Jabatan'}</h3>
                <p className="pp001-modal-subtitle">Cantumkan posisi, perusahaan, periode kerja, dan rincian pencapaian utama Anda.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalExp(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExp}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Nama Posisi / Jabatan <span>(Wajib)</span>
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={expForm.jabatan}
                    placeholder="Contoh: Senior Product Designer"
                    onChange={e => setExpForm({ ...expForm, jabatan: e.target.value })}
                    required
                  />
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Perusahaan <span>(Wajib)</span>
                    </label>
                    <input
                      type="text"
                      className="pp001-form-input"
                      value={expForm.perusahaan}
                      placeholder="Contoh: PT Teknologi Inovasi"
                      onChange={e => setExpForm({ ...expForm, perusahaan: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Tipe Pekerjaan
                    </label>
                    <select
                      className="pp001-form-input"
                      value={expForm.tipe}
                      onChange={e => setExpForm({ ...expForm, tipe: e.target.value })}
                    >
                      <option value="Penuh Waktu · Hybrid">Penuh Waktu · Hybrid</option>
                      <option value="Penuh Waktu · Remote">Penuh Waktu · Remote</option>
                      <option value="Penuh Waktu · On-site">Penuh Waktu · On-site</option>
                      <option value="Kontrak / Proyek">Kontrak / Proyek</option>
                      <option value="Magang">Magang</option>
                    </select>
                  </div>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Lokasi Kantor
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={expForm.lokasi}
                    placeholder="Contoh: Jakarta, Indonesia"
                    onChange={e => setExpForm({ ...expForm, lokasi: e.target.value })}
                  />
                </div>

                {/* ─── Periode Kerja: Clean & Flat Professional ─── */}
                <div className="pp001-form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label className="pp001-form-label" style={{ margin: 0 }}>
                      Periode Masa Kerja <span>(Wajib)</span>
                    </label>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#4A4843',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={expForm.isCurrent}
                        onChange={e => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                        style={{ width: 15, height: 15, accentColor: '#2B2A27', cursor: 'pointer' }}
                      />
                      Masih bekerja di posisi ini
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Waktu Mulai */}
                    <div>
                      <span style={{ fontSize: 11.5, fontWeight: 500, color: '#716E65', display: 'block', marginBottom: 6 }}>
                        Mulai Bekerja
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                        <select
                          className="pp001-form-input"
                          value={expForm.startMonth}
                          onChange={e => setExpForm({ ...expForm, startMonth: e.target.value })}
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          className="pp001-form-input"
                          value={expForm.startYear}
                          onChange={e => setExpForm({ ...expForm, startYear: e.target.value })}
                        >
                          {Array.from({ length: 30 }, (_, i) => 2026 - i).map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Waktu Berakhir */}
                    <div>
                      <span style={{ fontSize: 11.5, fontWeight: 500, color: expForm.isCurrent ? '#9CA3AF' : '#716E65', display: 'block', marginBottom: 6 }}>
                        Berakhir Bekerja
                      </span>
                      {expForm.isCurrent ? (
                        <div style={{
                          height: 42,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 14px',
                          background: '#F9F8F6',
                          border: '1px solid #E6E4DE',
                          borderRadius: 8,
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: '#716E65',
                          userSelect: 'none'
                        }}>
                          Sekarang (Aktif)
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                          <select
                            className="pp001-form-input"
                            value={expForm.endMonth}
                            onChange={e => setExpForm({ ...expForm, endMonth: e.target.value })}
                          >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            className="pp001-form-input"
                            value={expForm.endYear}
                            onChange={e => setExpForm({ ...expForm, endYear: e.target.value })}
                          >
                            {Array.from({ length: 30 }, (_, i) => 2026 - i).map(yr => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Rincian Tanggung Jawab &amp; Pencapaian
                  </label>
                  <textarea
                    rows={4}
                    className="pp001-form-input"
                    style={{ resize: 'vertical', lineHeight: 1.55 }}
                    value={expForm.deskripsi}
                    placeholder="Jelaskan peran Anda, tools yang dipakai, dan metrik keberhasilan yang dicapai..."
                    onChange={e => setExpForm({ ...expForm, deskripsi: e.target.value })}
                  />
                </div>
              </div>

              <div className="pp001-modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {expForm.id && (
                    <button
                      type="button"
                      className="pp001-btn-delete-item"
                      onClick={() => handlePromptDeleteExp(expForm.id)}
                    >
                      Hapus Riwayat
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="pp001-btn-secondary"
                    onClick={() => setShowModalExp(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="pp001-btn-primary"
                  >
                    Simpan Riwayat
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Pop-up Notif: Konfirmasi Hapus Universal (Compact & Clean) ─── */}
      {deleteConfirmItem && (
        <div className="pp001-modal-overlay" onClick={() => setDeleteConfirmItem(null)} style={{ zIndex: 10000 }}>
          <div
            className="pp001-modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 360,
              padding: '24px 22px 20px 22px',
              borderRadius: 14,
              textAlign: 'center',
              boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.22)'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#0A0908' }}>
              {deleteConfirmItem.type === 'exp' && 'Hapus Riwayat Karier?'}
              {deleteConfirmItem.type === 'edu' && 'Hapus Riwayat Pendidikan?'}
              {deleteConfirmItem.type === 'cert' && 'Hapus Lisensi / Sertifikasi?'}
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#5E5C56', lineHeight: 1.5, padding: '0 6px' }}>
              {deleteConfirmItem.type === 'exp' && (
                <>Apakah Anda yakin ingin menghapus <strong style={{ color: '#0A0908' }}>{deleteConfirmItem.data.jabatan}</strong> di <strong style={{ color: '#0A0908' }}>{deleteConfirmItem.data.perusahaan}</strong>?</>
              )}
              {deleteConfirmItem.type === 'edu' && (
                <>Apakah Anda yakin ingin menghapus pendidikan <strong style={{ color: '#0A0908' }}>{deleteConfirmItem.data.institusi}</strong> ({deleteConfirmItem.data.gelar})?</>
              )}
              {deleteConfirmItem.type === 'cert' && (
                <>Apakah Anda yakin ingin menghapus sertifikasi <strong style={{ color: '#0A0908' }}>{deleteConfirmItem.data.nama}</strong>?</>
              )}
            </p>

            {/* Tombol Aksi Compact & Centered */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10
            }}>
              <button
                type="button"
                style={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  color: '#3D3B36',
                  border: '1px solid #D5D3CD',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0 12px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#F6F5F2'}
                onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
                onClick={() => setDeleteConfirmItem(null)}
              >
                Batal
              </button>
              <button
                type="button"
                style={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0 12px',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#B91C1C'}
                onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 6: Tambah / Edit Pendidikan ─── */}
      {showModalEdu && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalEdu(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">{eduForm.id ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}</h3>
                <p className="pp001-modal-subtitle">Cantumkan nama institusi, jenjang pendidikan, program studi, dan IPK Anda.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalEdu(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdu}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Institusi / Universitas <span>(Wajib)</span>
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={eduForm.institusi}
                    placeholder="Contoh: Universitas Indonesia (UI)"
                    onChange={e => setEduForm({ ...eduForm, institusi: e.target.value })}
                    required
                  />
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Gelar / Jenjang
                    </label>
                    <input
                      type="text"
                      className="pp001-form-input"
                      value={eduForm.gelar}
                      placeholder="Contoh: Sarjana Komputer (S.Kom)"
                      onChange={e => setEduForm({ ...eduForm, gelar: e.target.value })}
                    />
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Jurusan / Bidang Studi
                    </label>
                    <input
                      type="text"
                      className="pp001-form-input"
                      value={eduForm.jurusan}
                      placeholder="Contoh: Sistem Informasi"
                      onChange={e => setEduForm({ ...eduForm, jurusan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Tahun Periode <span>(Mulai – Lulus)</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <select
                        className="pp001-form-input"
                        value={eduForm.startYear}
                        onChange={e => setEduForm({ ...eduForm, startYear: e.target.value })}
                      >
                        {Array.from({ length: 35 }, (_, i) => 2026 - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                      <select
                        className="pp001-form-input"
                        value={eduForm.endYear}
                        onChange={e => setEduForm({ ...eduForm, endYear: e.target.value })}
                      >
                        {Array.from({ length: 35 }, (_, i) => 2030 - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Nilai Akhir / IPK
                    </label>
                    <input
                      type="text"
                      className="pp001-form-input"
                      value={eduForm.ipk}
                      placeholder="Contoh: 3.82 / 4.00"
                      onChange={e => setEduForm({ ...eduForm, ipk: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pp001-modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {eduForm.id && (
                    <button
                      type="button"
                      className="pp001-btn-delete-item"
                      onClick={() => handlePromptDeleteEdu(eduForm.id)}
                    >
                      Hapus Pendidikan
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="pp001-btn-secondary"
                    onClick={() => setShowModalEdu(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="pp001-btn-primary"
                  >
                    Simpan Pendidikan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 7: Tambah / Edit Lisensi & Sertifikasi ─── */}
      {showModalCert && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalCert(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">{certForm.id ? 'Edit Lisensi / Sertifikasi' : 'Tambah Lisensi / Sertifikasi'}</h3>
                <p className="pp001-modal-subtitle">Cantumkan sertifikat profesional yang memperkuat kredibilitas Anda.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalCert(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCert}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Nama Sertifikasi <span>(Wajib)</span>
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={certForm.nama}
                    placeholder="Contoh: Google UX Design Professional Certificate"
                    onChange={e => setCertForm({ ...certForm, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Organisasi / Lembaga Penerbit <span>(Wajib)</span>
                  </label>
                  <input
                    type="text"
                    className="pp001-form-input"
                    value={certForm.penerbit}
                    placeholder="Contoh: Google Career Certificates"
                    onChange={e => setCertForm({ ...certForm, penerbit: e.target.value })}
                    required
                  />
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      Bulan &amp; Tahun Terbit
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                      <select
                        className="pp001-form-input"
                        value={certForm.terbitMonth}
                        onChange={e => setCertForm({ ...certForm, terbitMonth: e.target.value })}
                      >
                        {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        className="pp001-form-input"
                        value={certForm.terbitYear}
                        onChange={e => setCertForm({ ...certForm, terbitYear: e.target.value })}
                      >
                        {Array.from({ length: 30 }, (_, i) => 2026 - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">
                      ID Kredensial / No. Lisensi
                    </label>
                    <input
                      type="text"
                      className="pp001-form-input"
                      value={certForm.kredensial}
                      placeholder="Contoh: GGL-UX-892109"
                      onChange={e => setCertForm({ ...certForm, kredensial: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pp001-modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {certForm.id && (
                    <button
                      type="button"
                      className="pp001-btn-delete-item"
                      onClick={() => handlePromptDeleteCert(certForm.id)}
                    >
                      Hapus Sertifikat
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="pp001-btn-secondary"
                    onClick={() => setShowModalCert(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="pp001-btn-primary"
                  >
                    Simpan Sertifikasi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 8: Kelola Keahlian ─── */}
      {showModalSkill && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalSkill(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Kelola Keahlian &amp; Kompetensi</h3>
                <p className="pp001-modal-subtitle">Tambah keahlian baru atau hapus keahlian yang ada dalam daftar profil.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalSkill(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="pp001-modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <input
                  type="text"
                  className="pp001-form-input"
                  style={{ flex: 1 }}
                  placeholder="Ketik keahlian (contoh: TypeScript, Agile)..."
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkillItem())}
                />
                <select
                  className="pp001-form-input"
                  style={{ width: 140 }}
                  value={newSkillLevel}
                  onChange={e => setNewSkillLevel(e.target.value)}
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Tingkat Lanjut">Tingkat Lanjut</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  className="pp001-btn-primary"
                  onClick={handleAddSkillItem}
                >
                  + Tambah
                </button>
              </div>

              <label className="pp001-form-label">Keahlian Saat Ini ({skillsList.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 220, overflowY: 'auto', padding: 4 }}>
                {skillsList.map((skill, idx) => (
                  <div key={idx} className="pp001-skill-chip-edit">
                    <span style={{ fontWeight: 600 }}>{skill.nama}</span>
                    <span style={{ fontSize: 10, background: '#F4F2EE', padding: '1px 6px', borderRadius: 4, color: '#5E5C56' }}>
                      {skill.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillItem(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#C92A2A',
                        fontWeight: 'bold',
                        padding: '0 2px'
                      }}
                      title="Hapus keahlian"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp001-modal-footer">
              <button
                type="button"
                className="pp001-btn-secondary"
                onClick={() => setShowModalSkill(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="pp001-btn-primary"
                onClick={handleSaveSkill}
              >
                Simpan Daftar Keahlian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 9: Kelola Bahasa ─── */}
      {showModalLang && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalLang(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Kelola Penguasaan Bahasa</h3>
                <p className="pp001-modal-subtitle">Cantumkan bahasa dan tingkat kemahiran komunikasi Anda.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalLang(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="pp001-modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <input
                  type="text"
                  className="pp001-form-input"
                  style={{ flex: 1 }}
                  placeholder="Ketik bahasa (contoh: Bahasa Mandarin, Jepang)..."
                  value={newLangName}
                  onChange={e => setNewLangName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLangItem())}
                />
                <select
                  className="pp001-form-input"
                  style={{ width: 170 }}
                  value={newLangProf}
                  onChange={e => setNewLangProf(e.target.value)}
                >
                  <option value="Dasar (Elementary)">Dasar</option>
                  <option value="Kemampuan Kerja Terbatas">Kerja Terbatas</option>
                  <option value="Kemampuan Kerja Profesional">Kerja Profesional</option>
                  <option value="Penutur Asli / Fasih Penuh">Penutur Asli / Fasih</option>
                </select>
                <button
                  type="button"
                  className="pp001-btn-primary"
                  onClick={handleAddLangItem}
                >
                  + Tambah
                </button>
              </div>

              <label className="pp001-form-label">Bahasa Saat Ini ({langList.length})</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {langList.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#FAF9F8',
                    border: '1px solid #ECEAE5',
                    borderRadius: 8
                  }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0908', marginRight: 8 }}>{item.bahasa}</span>
                      <span style={{ fontSize: 11, color: '#5E5C56' }}>({item.kefasihan})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLangItem(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#C92A2A',
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp001-modal-footer">
              <button
                type="button"
                className="pp001-btn-secondary"
                onClick={() => setShowModalLang(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="pp001-btn-primary"
                onClick={handleSaveLang}
              >
                Simpan Bahasa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 10: Kelola Preferensi Pekerjaan Berikutnya ─── */}
      {showModalPref && (
        <div className="pp001-modal-overlay" onClick={() => setShowModalPref(false)}>
          <div className="pp001-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="pp001-modal-header">
              <div>
                <h3 className="pp001-modal-title">Kelola Preferensi Pekerjaan</h3>
                <p className="pp001-modal-subtitle">Atur kriteria pekerjaan impian Anda agar rekomendasi lowongan dan screening AI tepat sasaran.</p>
              </div>
              <button
                type="button"
                className="pp001-modal-close"
                onClick={() => setShowModalPref(false)}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePref}>
              <div className="pp001-modal-body">
                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Posisi / Jabatan yang Dicari <span>(Wajib, maks 5)</span>
                  </label>
                  <PilihanMultiChip
                    rekomendasi={POSISI_REKOMENDASI}
                    value={prefForm.posisi}
                    onChange={(posisi) => setPrefForm(f => ({ ...f, posisi }))}
                    placeholder="Ketik posisi lain, lalu Enter untuk menambah"
                    label="Cari atau tambah posisi"
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Lokasi yang Diharapkan <span>(maks 5)</span>
                  </label>
                  <PilihanMultiChip
                    rekomendasi={LOKASI_REKOMENDASI}
                    value={prefForm.lokasi}
                    onChange={(lokasi) => setPrefForm(f => ({ ...f, lokasi }))}
                    placeholder="Ketik kota atau daerah lain, lalu Enter"
                    label="Cari atau tambah lokasi"
                    ikonLokasi
                    labelChip={(l) => (l === 'Remote' ? 'Remote (seluruh Indonesia)' : l)}
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Gaji Minimum / Bulan
                  </label>
                  <div className="pp001-input-affix-group">
                    <span className="pp001-input-prefix">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="pp001-form-input"
                      value={prefForm.gajiMin ? Number(prefForm.gajiMin).toLocaleString('id-ID') : ''}
                      placeholder="0"
                      onChange={e => {
                        const digit = Number(e.target.value.replace(/\D/g, '')) || 0;
                        setPrefForm(f => ({ ...f, gajiMin: digit ? Math.min(999_999_999, digit) : null }));
                      }}
                    />
                    <span className="pp001-input-suffix">/ bulan</span>
                  </div>
                  <label className="pp001-pref-nego">
                    <input type="checkbox" checked={prefForm.gajiNego} onChange={e => setPrefForm(f => ({ ...f, gajiNego: e.target.checked }))} />
                    Gaji masih bisa dinegosiasikan
                  </label>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Jenis Pekerjaan <span>(boleh lebih dari satu)</span>
                  </label>
                  <div className="pob001-chips" style={{ marginTop: 0 }}>
                    {TIPE_KERJA_OPSI.map(opt => {
                      const on = prefForm.tipeKerja.includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          className={`pob001-chip${on ? ' on' : ''}`}
                          aria-pressed={on}
                          onClick={() => setPrefForm(f => ({ ...f, tipeKerja: on ? f.tipeKerja.filter(x => x !== opt) : [...f.tipeKerja, opt] }))}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pp001-form-row">
                  <div className="pp001-form-group">
                    <label className="pp001-form-label">Model Kerja Diinginkan</label>
                    <select className="pp001-form-input" value={prefForm.modelKerja} onChange={e => setPrefForm(f => ({ ...f, modelKerja: e.target.value }))}>
                      <option value="">Belum dipilih</option>
                      {MODEL_KERJA_OPSI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="pp001-form-group">
                    <label className="pp001-form-label">Ketersediaan Memulai</label>
                    <select className="pp001-form-input" value={prefForm.ketersediaan} onChange={e => setPrefForm(f => ({ ...f, ketersediaan: e.target.value }))}>
                      <option value="">Belum dipilih</option>
                      {KETERSEDIAAN_OPSI.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">
                    Akun di Situs Lowongan Lain <span>(boleh dikosongkan)</span>
                  </label>
                  <PilihanMultiChip
                    rekomendasi={PORTAL_LOWONGAN_REKOMENDASI}
                    value={prefForm.akunPortal || []}
                    onChange={(akunPortal) => setPrefForm(f => ({ ...f, akunPortal }))}
                    placeholder="Ketik situs lain, lalu Enter"
                    label="Cari atau tambah situs"
                  />
                </div>

                <div className="pp001-form-group">
                  <label className="pp001-form-label">Status Pencarian</label>
                  <select className="pp001-form-input" value={prefForm.statusPencarian} onChange={e => setPrefForm(f => ({ ...f, statusPencarian: e.target.value }))}>
                    <option value="">Belum dipilih</option>
                    {STATUS_PENCARIAN_OPSI.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="pp001-modal-footer">
                <button
                  type="button"
                  className="pp001-btn-secondary"
                  onClick={() => setShowModalPref(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pp001-btn-primary"
                  disabled={savingPref}
                >
                  {savingPref ? 'Menyimpan…' : 'Simpan Preferensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Floating Toast Feedback ─── */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0A0908',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.2s ease'
        }}>
          <span style={{ color: '#FF8D21' }}>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
