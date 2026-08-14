import { useState, useEffect, useRef } from 'react';
import { getSeleksiById, updateSeleksi as updateSeleksiRaw, duplicateSeleksi, archiveSeleksi, getMaxAlurForSeleksi } from '../../services/seleksiService.js';
import { getDepartments } from '../../services/departmentService.js';
import { getCompanyUsers } from '../../services/companyUserService.js';
import { getAlurSeleksi, alurNamaByLevel, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';
import { invalidate } from '../../services/dataCache.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { slugify } from '../../utils/slug.js';
import { supabase } from '../../config/supabase.js';

const updateSeleksi = async (id, updates) => {
  const result = await updateSeleksiRaw(id, updates);
  invalidate('seleksi');
  return result;
};

const DB_KEY_MAP = {
  jabatan: 'jabatan', levelJabatan: 'level_jabatan', dept: 'department_id', lokasi: 'lokasi', remote: 'remote',
  status: 'status', jumlah: 'jumlah_rekrut', ikatan: 'ikatan_kerja', upahMin: 'upah_min', upahMaks: 'upah_maks',
  siklus: 'siklus_upah', tglMulai: 'tgl_mulai', tglOnboard: 'tgl_onboard', pendidikan: 'pendidikan', pengalaman: 'pengalaman',
};

const DATE_KEYS = new Set(['tglMulai', 'tglOnboard']);

// Data + aksi untuk laman detail lowongan (tab Ringkasan). Dipakai oleh
// LowonganMobileDetail.jsx — belum dipakai desktop (LowonganDetail_001.jsx +
// Lowongan-Ringkasan_002.jsx) karena keduanya masih saling sinkron lewat
// custom window event & punya rich-text editor yang berisiko tinggi kalau
// direfactor tanpa pengujian visual. Service call & bentuk data sengaja
// dibuat identik supaya perilakunya tetap konsisten dengan desktop.
export default function useLowonganDetailData(seleksiId, companyId, companyPlan) {
  const isFreePlan = companyPlan === 'free';
  const statusOptions = isFreePlan
    ? DROPDOWN_OPTIONS.statusRekrutmen.filter(s => s === 'Rencana' || s === 'Aktif')
    : DROPDOWN_OPTIONS.statusRekrutmen;

  const [data, setData] = useState({
    jabatan: '', levelJabatan: '', dept: '', lokasi: '', remote: '', status: 'Rencana',
    jumlah: '', ikatan: '', upahMin: '', upahMaks: '', siklus: '', tglMulai: '', tglOnboard: '',
    pendidikan: '', pengalaman: '', kode: null,
  });
  const [departments, setDepartments] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [picUserId, setPicUserId] = useState('');
  const [deskripsiHtml, setDeskripsiHtml] = useState('');
  const [kriteria, setKriteria] = useState([]);
  const [isGeneratingKriteria, setIsGeneratingKriteria] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alurList, setAlurList] = useState([]);
  const [maxAlurLevel, setMaxAlurLevel] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const fetchData = () => {
    if (!seleksiId) return;
    getSeleksiById(seleksiId).then(item => {
      if (!item) return;
      setData({
        jabatan: item.jabatan || '',
        levelJabatan: item.level_jabatan || '',
        dept: item.department_id || '',
        lokasi: item.lokasi || '',
        remote: item.remote || '',
        status: item.status || 'Rencana',
        jumlah: item.jumlah_rekrut || '',
        ikatan: item.ikatan_kerja || '',
        upahMin: item.upah_min || '',
        upahMaks: item.upah_maks || '',
        siklus: item.siklus_upah || '',
        tglMulai: item.tgl_mulai || '',
        tglOnboard: item.tgl_onboard || '',
        pendidikan: item.pendidikan || '',
        pengalaman: item.pengalaman || '',
        kode: item.kode || null,
      });
      setPicUserId(item.pic_user_id || '');
      if (item.deskripsi) setDeskripsiHtml(item.deskripsi);
      if (item.kriteria && Array.isArray(item.kriteria)) {
        if (item.kriteria[0] && item.kriteria[0]._isGenerating) {
          setKriteria([]);
          setIsGeneratingKriteria(true);
        } else {
          setKriteria(item.kriteria);
        }
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (!seleksiId) return;
    setIsLoading(true);
    getDepartments().then(setDepartments).catch(console.error);
    if (companyId) getCompanyUsers(companyId).then(setCompanyUsers).catch(console.error);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleksiId, companyId]);

  useEffect(() => {
    if (companyId) getAlurSeleksi(companyId).then(setAlurList).catch(console.error);
  }, [companyId]);

  useEffect(() => {
    if (!seleksiId) return;
    const fetchMaxAlur = () => getMaxAlurForSeleksi(seleksiId).then(setMaxAlurLevel).catch(console.error);
    fetchMaxAlur();
    window.addEventListener('luna:activity_updated', fetchMaxAlur);
    return () => window.removeEventListener('luna:activity_updated', fetchMaxAlur);
  }, [seleksiId]);

  useEffect(() => {
    if (isGeneratingKriteria && seleksiId) {
      const interval = setInterval(() => {
        getSeleksiById(seleksiId).then(item => {
          if (item?.kriteria && Array.isArray(item.kriteria)) {
            if (!item.kriteria[0] || !item.kriteria[0]._isGenerating) {
              setKriteria(item.kriteria);
              setIsGeneratingKriteria(false);
              if (item.kriteria.length > 0) showToast('Selesai', 'Kriteria berhasil dirumuskan.');
            }
          }
        }).catch(console.error);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGeneratingKriteria, seleksiId]);

  const departmentName = data.dept
    ? (departments.find(d => String(d.id) === String(data.dept))?.name || null)
    : null;

  const picUser = companyUsers.find(u => u.id === picUserId) || null;

  const buildKaririUrl = (companyName) => data.kode
    ? `${window.location.origin}/?view=laman-karir&perusahaan=${slugify(companyName)}&posisi=${slugify(data.jabatan)}&kode=${encodeURIComponent(data.kode)}`
    : `${window.location.origin}/?view=laman-karir&jabatan=${encodeURIComponent(data.jabatan)}`;
  const karilEnabled = (data.status || '').toLowerCase() === 'aktif';

  const tahapTertinggi = maxAlurLevel != null
    ? (alurNamaByLevel(alurList.length ? alurList : DEFAULT_ALUR, maxAlurLevel) || 'Belum ada kandidat')
    : 'Belum ada kandidat';

  const updateField = async (key, value) => {
    const prev = data[key];
    setData(prev2 => ({ ...prev2, [key]: value }));
    const dbCol = DB_KEY_MAP[key];
    if (!seleksiId || !dbCol) return;
    const finalVal = DATE_KEYS.has(key) ? (value || null) : value;
    try {
      await updateSeleksi(seleksiId, { [dbCol]: finalVal });
      showToast('Berhasil', 'Data diperbarui.');
      if (key === 'status') {
        window.dispatchEvent(new CustomEvent('syncSeleksiStatus', { detail: value }));
      } else {
        window.dispatchEvent(new CustomEvent('syncSeleksiData'));
      }
    } catch (err) {
      console.error(err);
      setData(prev2 => ({ ...prev2, [key]: prev }));
      showToast('Gagal', err.message || 'Gagal memperbarui data.', 'error');
    }
  };

  const handleStatusChange = (newVal) => updateField('status', newVal);

  const handleShareAction = (platform, companyName) => {
    const kaririUrl = buildKaririUrl(companyName);
    const text = `Lowongan ${data.jabatan} di ${companyName || 'perusahaan kami'}`;
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${kaririUrl}`)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(kaririUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(kaririUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(kaririUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(kaririUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'instagram':
        navigator.clipboard.writeText(kaririUrl).then(() => {
          showToast('Link disalin', 'Instagram tidak mendukung share langsung — tempel link ini di bio atau story.');
        });
        break;
      default:
        navigator.clipboard.writeText(kaririUrl).then(() => {
          showToast('Tautan disalin', 'Link laman karier sudah disalin ke clipboard.');
        });
    }
  };

  const handleDuplicate = async (onDone) => {
    if (!seleksiId) return;
    try {
      const duplicated = await duplicateSeleksi(seleksiId);
      invalidate('seleksi');
      onDone?.(duplicated);
    } catch (err) {
      console.error(err);
      showToast('Gagal menduplikat', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleArchive = async (onDone) => {
    if (!seleksiId) return;
    try {
      await archiveSeleksi(seleksiId);
      invalidate('seleksi');
      onDone?.();
    } catch (err) {
      console.error(err);
      showToast('Gagal mengarsipkan', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const saveDeskripsi = async (html) => {
    setDeskripsiHtml(html);
    if (!seleksiId) return;
    try {
      await updateSeleksi(seleksiId, { deskripsi: html });
      showToast('Berhasil', 'Deskripsi berhasil diperbarui.');
    } catch (err) {
      console.error(err);
      showToast('Gagal', 'Gagal menyimpan deskripsi.', 'error');
    }
  };

  const handleRefreshKriteria = () => {
    if (!seleksiId || !deskripsiHtml) {
      showToast('Gagal', 'Deskripsi pekerjaan masih kosong', 'error');
      return;
    }
    const plainText = deskripsiHtml.replace(/<[^>]*>/g, '').trim();
    if (plainText.length < 300) {
      showToast('Gagal', 'Deskripsi minimal 300 karakter untuk merumuskan kriteria otomatis.', 'error');
      return;
    }
    setIsGeneratingKriteria(true);
    updateSeleksi(seleksiId, { kriteria: [{ _isGenerating: true }] }).catch(console.error);
    supabase.functions.invoke('generate-kriteria', { body: { seleksiId, deskripsi: deskripsiHtml } })
      .catch(err => {
        console.error(err);
        showToast('Gagal', 'Gagal memanggil server.', 'error');
        setIsGeneratingKriteria(false);
      });
  };

  const updateKriteria = async (newList) => {
    const prev = kriteria;
    setKriteria(newList);
    if (!seleksiId) return;
    try {
      await updateSeleksi(seleksiId, { kriteria: newList });
      showToast('Berhasil', 'Kriteria penilaian diperbarui.');
    } catch (err) {
      console.error(err);
      setKriteria(prev);
      showToast('Gagal', err.message || 'Gagal menyimpan kriteria.', 'error');
    }
  };

  const handlePicSave = async (userId) => {
    const prev = picUserId;
    setPicUserId(userId);
    if (!seleksiId) return;
    try {
      await updateSeleksi(seleksiId, { pic_user_id: userId || null });
      showToast('Berhasil', 'PIC lowongan berhasil diperbarui.');
    } catch (err) {
      console.error(err);
      setPicUserId(prev);
      showToast('Gagal', err.message || 'Gagal memperbarui PIC.', 'error');
    }
  };

  return {
    isLoading, isFreePlan, statusOptions,
    data, departments, departmentName, companyUsers, picUserId, picUser,
    deskripsiHtml, kriteria, isGeneratingKriteria,
    buildKaririUrl, karilEnabled, tahapTertinggi,
    toast, setToast, showToast,
    updateField, handleStatusChange, handleShareAction,
    handleDuplicate, handleArchive, saveDeskripsi, handleRefreshKriteria, updateKriteria, handlePicSave,
  };
}
