import { useState, useEffect, useRef } from 'react';
import {
  getKandidatById, updateKandidat as updateKandidatRaw, archiveKandidat,
} from '../../services/kandidatService.js';
import { getScoringByKandidat, runRescore, markTidakSesuai, updateAlurProses } from '../../services/scoringService.js';
import { getSeleksi } from '../../services/seleksiService.js';
import { getAlurSeleksi, seedDefaultAlur, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';
import { mapScoringRow } from '../../services/scoringMapper.js';
import { invalidate } from '../../services/dataCache.js';
import { useUpload } from '../../context/UploadContext.jsx';

const updateKandidat = async (id, updates) => {
  const result = await updateKandidatRaw(id, updates);
  invalidate('kandidat');
  return result;
};

const DB_KEY_MAP = {
  nama: 'nama_lengkap', linkedin_url: 'linkedin_url', portfolio_url: 'portfolio_url',
  gender: 'gender', jurusan: 'jurusan', universitas: 'universitas',
  perusahaan: 'perusahaan_saat_ini', jabatan: 'jabatan_saat_ini', pengalaman: 'pengalaman_tahun',
  tglLahir: 'tgl_lahir', domisili: 'domisili', email: 'email', phone: 'phone',
  industri: 'industri', tahun_terakhir_bekerja: 'tahun_terakhir_bekerja',
  harapanUpah: 'harapan_upah', harapanBenefit: 'harapan_benefit',
};

const toDbExp = e => { const p = (e.periode || '').split(' – '); return { jabatan: e.jabatan, perusahaan: e.perusahaan, start: p[0] || '', end: p[1] || '', deskripsi: e.deskripsi || [] }; };
const toDbEdu = e => { const p = (e.periode || '').split(' – '); return { institusi: e.institusi, jenjang: e.gelar || '', jurusan: e.jurusan || '', gpa: e.gpa || '', start: p[0] || '', end: p[1] || '' }; };
const toDbSert = s => { const p = (s.periode || '').split(' – '); return { nama: s.judul, penerbit: s.penyelenggara, start: p[0] || '', end: p[1] || '', deskripsi: s.deskripsi || [] }; };

const ENTRY_CONFIG = {
  pengalaman: { dbCol: 'pengalaman_kerja', toDb: toDbExp, fromDb: e => ({ jabatan: e.jabatan || '', perusahaan: e.perusahaan || '', periode: [e.start, e.end].filter(Boolean).join(' – ') || '', deskripsi: e.deskripsi || [] }) },
  pendidikan: { dbCol: 'pendidikan', toDb: toDbEdu, fromDb: e => ({ institusi: e.institusi || '', gelar: e.jenjang || '', jurusan: e.jurusan || '', gpa: e.gpa || '', periode: [e.start, e.end].filter(Boolean).join(' – ') || '' }) },
  sertifikasi: { dbCol: 'sertifikasi', toDb: toDbSert, fromDb: s => ({ judul: s.nama || '', penyelenggara: s.penerbit || '', periode: [s.start, s.end].filter(Boolean).join(' – ') || '', deskripsi: s.deskripsi || [] }) },
};

export default function useKandidatDetailData(kandidatId, companyId) {
  const { enqueueScoringJob, scoringQueue } = useUpload();
  const [raw, setRaw] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  const [pengalamanList, setPengalamanList] = useState([]);
  const [pendidikanList, setPendidikanList] = useState([]);
  const [sertifikasiList, setSertifikasiList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [aiScores, setAiScores] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [seleksiListForAdd, setSeleksiListForAdd] = useState([]);
  const [isLoadingSeleksi, setIsLoadingSeleksi] = useState(false);
  const refreshedJobIds = useRef(new Set());
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const refreshScores = () => {
    if (!kandidatId) return;
    setIsLoadingScores(true);
    getScoringByKandidat(kandidatId)
      .then(rows => setAiScores((rows || []).map(r => mapScoringRow(r))))
      .catch(console.error)
      .finally(() => setIsLoadingScores(false));
  };

  useEffect(() => {
    if (!kandidatId) { setIsLoading(false); return; }
    setIsLoading(true);
    getKandidatById(kandidatId).then(item => {
      if (!item) return;
      setRaw(item);
      setData({
        id: item.id, nama: item.nama_lengkap || '', sumber: item.sumber,
        linkedin_url: item.linkedin_url || '', portfolio_url: item.portfolio_url || '',
        gender: (!item.gender || item.gender === 'N/A') ? '' : item.gender,
        jurusan: item.jurusan || '', universitas: item.universitas || '',
        perusahaan: item.perusahaan_saat_ini || '', jabatan: item.jabatan_saat_ini || '',
        pengalaman: item.pengalaman_tahun ?? '', tglLahir: item.tgl_lahir || '',
        domisili: item.domisili || '', email: item.email || '', phone: item.phone || '',
        industri: item.industri || '', tahun_terakhir_bekerja: item.tahun_terakhir_bekerja ?? '',
        harapanUpah: item.harapan_upah || '', harapanBenefit: item.harapan_benefit || '',
        created_at: item.created_at,
      });
      setSkills(item.skills || []);
      setPengalamanList(((item.pengalaman_kerja || [])).map(ENTRY_CONFIG.pengalaman.fromDb).map((e, i) => ({ ...e, id: i })));
      setPendidikanList(((item.pendidikan || [])).map(ENTRY_CONFIG.pendidikan.fromDb).map((e, i) => ({ ...e, id: i })));
      setSertifikasiList(((item.sertifikasi || [])).map(ENTRY_CONFIG.sertifikasi.fromDb).map((e, i) => ({ ...e, id: i })));
    }).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kandidatId]);

  useEffect(() => {
    refreshScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kandidatId]);

  useEffect(() => {
    if (!companyId) return;
    seedDefaultAlur(companyId);
    getAlurSeleksi(companyId).then(setAlurList).catch(() => {});
  }, [companyId]);

  // `scoringJobs` diturunkan dari `scoringQueue` (UploadContext, global) —
  // bukan state lokal — supaya progress "Tambah ke Posisi" tetap kelihatan
  // (di sheet ini maupun widget global) walau sheet ditutup atau user
  // pindah halaman lalu balik lagi, sama seperti alur Unggah CV & Pilih
  // Kandidat.
  const scoringJobs = {};
  scoringQueue
    .filter(j => j.kandidatId === kandidatId)
    .forEach(j => {
      scoringJobs[j.seleksiId] = {
        nama: j.seleksiNama,
        status: (j.status === 'queued' || j.status === 'scoring') ? 'loading' : j.status,
        error: j.error,
      };
    });

  useEffect(() => {
    scoringQueue
      .filter(j => j.kandidatId === kandidatId && j.status === 'done' && !refreshedJobIds.current.has(j.id))
      .forEach(j => {
        refreshedJobIds.current.add(j.id);
        refreshScores();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoringQueue, kandidatId]);

  const updateField = async (key, value) => {
    const prev = data[key];
    setData(prev2 => ({ ...prev2, [key]: value }));
    const dbCol = DB_KEY_MAP[key];
    if (!kandidatId || !dbCol) return;
    try {
      await updateKandidat(kandidatId, { [dbCol]: value });
      showToast('Berhasil', 'Data diperbarui.');
    } catch (err) {
      console.error(err);
      setData(prev2 => ({ ...prev2, [key]: prev }));
      showToast('Gagal', err.message || 'Gagal memperbarui data.', 'error');
    }
  };

  const LIST_STATE = {
    pengalaman: [pengalamanList, setPengalamanList],
    pendidikan: [pendidikanList, setPendidikanList],
    sertifikasi: [sertifikasiList, setSertifikasiList],
  };

  const saveEntry = async (kind, entry) => {
    const [list, setList] = LIST_STATE[kind];
    const cfg = ENTRY_CONFIG[kind];
    const isNew = entry.id == null;
    const finalEntry = isNew ? { ...entry, id: Date.now() } : entry;
    const newList = isNew ? [...list, finalEntry] : list.map(e => e.id === entry.id ? finalEntry : e);
    setList(newList);
    if (!kandidatId) return;
    try {
      await updateKandidat(kandidatId, { [cfg.dbCol]: newList.map(cfg.toDb) });
      showToast(isNew ? 'Berhasil ditambahkan' : 'Berhasil diperbarui', 'Data tersimpan.');
    } catch (err) {
      console.error(err);
      setList(list);
      showToast('Gagal', err.message || 'Gagal menyimpan data.', 'error');
    }
  };

  const deleteEntry = async (kind, id) => {
    const [list, setList] = LIST_STATE[kind];
    const cfg = ENTRY_CONFIG[kind];
    const newList = list.filter(e => e.id !== id);
    setList(newList);
    if (!kandidatId) return;
    try {
      await updateKandidat(kandidatId, { [cfg.dbCol]: newList.map(cfg.toDb) });
      showToast('Berhasil dihapus', 'Data telah dihapus.');
    } catch (err) {
      console.error(err);
      setList(list);
      showToast('Gagal', err.message || 'Gagal menghapus data.', 'error');
    }
  };

  const saveSkills = async (newList) => {
    setSkills(newList);
    if (!kandidatId) return;
    try {
      await updateKandidat(kandidatId, { skills: newList });
      showToast('Berhasil', 'Keahlian berhasil diperbarui.');
    } catch (err) {
      console.error(err);
      showToast('Gagal', err.message || 'Gagal menyimpan keahlian.', 'error');
    }
  };
  const addSkill = (text) => {
    const t = text.trim();
    if (!t || skills.includes(t)) return;
    saveSkills([...skills, t]);
  };
  const editSkill = (idx, text) => {
    const t = text.trim();
    if (!t) return;
    saveSkills(skills.map((s, i) => i === idx ? t : s));
  };
  const removeSkill = (idx) => saveSkills(skills.filter((_, i) => i !== idx));

  const rescore = async (item) => {
    if (!item.scoringId || !item.kandidatId || !item.seleksiId || !companyId) {
      showToast('Tidak bisa nilai ulang', 'Data kandidat atau posisi tidak lengkap.', 'error');
      return;
    }
    try {
      const row = await runRescore(item.scoringId, item.kandidatId, item.seleksiId, companyId);
      // runRescore lewat edge function, respons-nya tidak selalu ikut join
      // ke tabel seleksi seperti fetch awal — posisi/departemen dikunci ke
      // nilai item lama supaya tidak ke-timpa jadi "-" begitu rescore selesai
      // (nama posisi kandidat tidak mungkin berubah gara-gara rescore).
      const updated = { ...item, ...mapScoringRow(row), posisi: item.posisi, departemen: item.departemen };
      setAiScores(prev => prev.map(s => s.id === item.id ? updated : s));
      showToast('Penilaian ulang selesai', 'Hasil penilaian AI telah diperbarui.');
      return updated;
    } catch (err) {
      showToast('Gagal menilai ulang', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const reject = async (item, alasan, detail) => {
    if (!item.scoringId) return;
    try {
      await markTidakSesuai(item.scoringId, alasan, detail);
      refreshScores();
      showToast('Kandidat ditandai', 'Kandidat dikeluarkan dari proses posisi ini.');
    } catch (err) {
      showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const changeAlur = async (item, level) => {
    const prevAlur = item.alur;
    setAiScores(prev => prev.map(s => s.id === item.id ? { ...s, alur: level } : s));
    try {
      await updateAlurProses(item.scoringId, level);
      invalidate('karyawan');
      showToast('Status diperbarui', `Dipindahkan ke ${alurList.find(a => a.level === level)?.nama ?? '-'}`);
    } catch (err) {
      setAiScores(prev => prev.map(s => s.id === item.id ? { ...s, alur: prevAlur } : s));
      showToast('Gagal memperbarui status', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const loadSeleksiForAdd = () => {
    if (!companyId) return;
    setIsLoadingSeleksi(true);
    getSeleksi(companyId)
      .then(rows => setSeleksiListForAdd((rows || []).filter(s => !s.arsip).map(s => ({
        id: s.id, nama: s.jabatan || '-', dept: s.departments?.name || s.departemen || '-',
      }))))
      .catch(err => { console.error(err); showToast('Gagal memuat', 'Gagal memuat daftar posisi.', 'error'); })
      .finally(() => setIsLoadingSeleksi(false));
  };

  const startScoring = (posisiId, posisiNama) => {
    enqueueScoringJob(kandidatId, posisiId, posisiNama, data.nama ? `${data.nama} - Penilaian AI` : 'Penilaian AI', companyId);
  };

  const doArchive = async () => {
    if (!kandidatId) return;
    try {
      await archiveKandidat([kandidatId]);
      invalidate('kandidat');
      showToast('Kandidat diarsipkan', 'Data dipindahkan ke arsip.');
      return true;
    } catch (err) {
      showToast('Gagal', err.message || 'Tidak dapat mengarsipkan kandidat.', 'error');
      return false;
    }
  };

  return {
    isLoading, data, raw,
    pengalamanList, pendidikanList, sertifikasiList, saveEntry, deleteEntry,
    skills, addSkill, editSkill, removeSkill,
    aiScores, isLoadingScores, rescore, reject, alurList, changeAlur,
    seleksiListForAdd, isLoadingSeleksi, loadSeleksiForAdd, scoringJobs, startScoring,
    updateField, doArchive,
    toast, setToast, showToast,
  };
}
