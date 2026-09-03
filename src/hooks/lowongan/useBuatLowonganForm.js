import { useState, useRef, useEffect } from 'react';
import { createSeleksi } from '../../services/seleksiService.js';
import { getDepartments, createDepartment } from '../../services/departmentService.js';
import { invalidate } from '../../services/dataCache.js';
import { DROPDOWN_OPTIONS } from '../../utils/dropdownOptions.js';
import { ID_REGIONS } from '../../utils/idRegions.js';
import { parseJobDescManual } from '../../utils/parseJobDescManual.js';
import { extractTextFromFile } from '../../utils/extractTextFromFile.js';
import { formatDeskripsiToHtml } from '../../utils/formatDeskripsiToHtml.js';
import { supabase } from '../../config/supabase.js';
import { reportLastError } from '../../utils/lastErrorMemory.js';

// Draft key sendiri (bukan 'sp001-draft' punya desktop) — sengaja dipisah
// supaya perubahan bentuk draft di salah satu sisi (mobile/desktop) tidak
// saling bentrok, walau sekarang bentuk `deskripsi`-nya sama-sama HTML.
const DRAFT_KEY = 'mblf-draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
}

const EMPTY_FORM = {
  jabatan: '', levelJabatan: '', departemen: '', lokasi: '', statusRekrutmen: 'Aktif',
  jumlahRekrut: '', ikatanKerja: '', upahMin: '', upahMax: '', siklusUpah: '',
  tglMulai: '', tglOnboarding: '', pendidikan: '', pengalaman: '', deskripsi: '',
};

function formatRupiah(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  if (!digits) return '';
  return 'Rp ' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Padanan mobile dari Lowongan-SetupPenilaian_001.jsx (desktop) — field &
// alur submit (createSeleksi lalu generate-kriteria via AI fire-and-forget)
// dibuat identik. `deskripsi` juga sama-sama HTML dari contentEditable
// (bukan textarea polos) supaya toolbar format (heading/bold/italic/list)
// bisa jalan persis seperti desktop — komponen yang pegang editor-nya
// langsung (lihat MobileBuatLowonganForm.jsx), hook ini cuma nyimpen hasil
// akhirnya di `form.deskripsi`.
export default function useBuatLowonganForm(companyId, companyPlan, navigate) {
  const isFreePlan = companyPlan === 'free';
  const statusOptions = isFreePlan
    ? DROPDOWN_OPTIONS.statusRekrutmen.filter(s => s === 'Rencana' || s === 'Aktif')
    : DROPDOWN_OPTIONS.statusRekrutmen;

  const draftRef = useRef(loadDraft());
  const discardedRef = useRef(false);

  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...(draftRef.current?.form || {}) }));
  const [departments, setDepartments] = useState([]);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState(draftRef.current?.uploadFileName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getDepartments().then(data => setDepartments(data || [])).catch(console.error);
  }, []);

  // Draft auto-save tiap form berubah — padanan sessionStorage desktop,
  // supaya keluar-masuk laman ini di tengah pengisian tidak menghilangkan isian.
  // `form.deskripsi` cuma sinkron ke sini saat editor di-blur (lihat
  // komponen) — bukan tiap ketikan, supaya caret contentEditable tidak lompat.
  useEffect(() => {
    if (discardedRef.current) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, uploadFileName })); } catch {}
  }, [form, uploadFileName]);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const setUpah = (key) => (value) => setForm(prev => ({ ...prev, [key]: formatRupiah(value) }));

  const [lokasiSuggestions, setLokasiSuggestions] = useState([]);
  const handleLokasiChange = (val) => {
    setField('lokasi', val);
    if (!val.trim()) { setLokasiSuggestions([]); return; }
    const q = val.toLowerCase();
    setLokasiSuggestions(ID_REGIONS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 6));
  };
  const selectLokasi = (s) => {
    setField('lokasi', s.type === 'city' && s.province ? `${s.name}, ${s.province}` : s.name);
    setLokasiSuggestions([]);
  };

  const createNewDepartment = async (name) => {
    if (!name.trim() || !companyId) return;
    setIsCreatingDept(true);
    try {
      const newDept = await createDepartment(companyId, { name: name.trim(), description: '' });
      invalidate('departemen');
      setDepartments(prev => [newDept, ...prev]);
      setField('departemen', newDept.id);
      showToast('Berhasil', `Departemen ${newDept.name} ditambahkan.`);
      return newDept;
    } catch (err) {
      showToast('Gagal', 'Tidak dapat menambahkan departemen.', 'error');
    } finally {
      setIsCreatingDept(false);
    }
  };

  // Mengembalikan HTML deskripsi hasil parsing (kalau ada) supaya komponen
  // bisa nulis langsung ke DOM editor (contentEditable itu uncontrolled,
  // update lewat state saja tidak akan kelihatan di layar — sama seperti
  // pola `editorRef.current.innerHTML = ...` di desktop).
  const handleFileUpload = async (file) => {
    if (!file) return null;
    setUploadFileName(file.name);
    setIsUploading(true);
    try {
      const rawText = await extractTextFromFile(file);
      const parsed = parseJobDescManual(rawText);
      if (parsed.upahMin) parsed.upahMin = formatRupiah(parsed.upahMin);
      if (parsed.upahMax) parsed.upahMax = formatRupiah(parsed.upahMax);
      if (parsed.namaJabatan) { parsed.jabatan = parsed.namaJabatan; delete parsed.namaJabatan; }
      const htmlDeskripsi = formatDeskripsiToHtml(parsed.deskripsi || '');
      parsed.deskripsi = htmlDeskripsi;
      setForm(prev => ({ ...prev, ...parsed }));
      showToast('Berhasil', 'Isi dokumen telah diurai ke dalam form.');
      return htmlDeskripsi;
    } catch (err) {
      console.error(err);
      showToast('Gagal', err.message || 'Gagal mengekstrak dokumen.', 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // liveHtml: nilai innerHTML editor saat ini (diambil komponen langsung
  // dari ref pas tombol submit ditekan) — dipakai kalau ada supaya tidak
  // bergantung ke `form.deskripsi` yang cuma ke-update saat blur.
  const submit = async (liveHtml) => {
    if (!companyId) return false;
    const htmlDeskripsi = liveHtml ?? form.deskripsi;
    const plainText = htmlDeskripsi.replace(/<[^>]*>/g, '').trim();
    if (!form.jabatan || !form.statusRekrutmen || !plainText) {
      showToast('Lengkapi Form', 'Harap isi semua field wajib (*)', 'error');
      return false;
    }
    setIsSaving(true);
    try {
      const meetsDescLength = plainText.length >= 300;
      const isSufficientDesc = !isFreePlan && meetsDescLength;

      const dataBaru = await createSeleksi(companyId, {
        department_id: form.departemen || null,
        jabatan: form.jabatan,
        level_jabatan: form.levelJabatan,
        lokasi: form.lokasi,
        status: form.statusRekrutmen,
        jumlah_rekrut: parseInt(form.jumlahRekrut) || null,
        ikatan_kerja: form.ikatanKerja,
        upah_min: form.upahMin,
        upah_maks: form.upahMax,
        siklus_upah: form.siklusUpah,
        tgl_mulai: form.tglMulai || null,
        tgl_onboard: form.tglOnboarding || null,
        pendidikan: form.pendidikan,
        pengalaman: form.pengalaman,
        deskripsi: htmlDeskripsi,
        kode: `LUN-${Math.floor(Math.random() * 10000)}`,
        kriteria: isSufficientDesc ? [{ _isGenerating: true }] : [],
      });
      invalidate('seleksi');

      if (isSufficientDesc) {
        supabase.functions.invoke('generate-kriteria', {
          body: { seleksiId: dataBaru.id, deskripsi: htmlDeskripsi },
        }).catch(err => console.error('Gagal memanggil generate-kriteria:', err));
      } else if (!isFreePlan && !meetsDescLength) {
        showToast('Info', 'Deskripsi kurang dari 300 karakter. Kriteria AI tidak dirumuskan.', 'warning');
      }

      discardedRef.current = true;
      clearDraft();
      navigate('lowongan-detail_001', { seleksiId: dataBaru.id, jabatan: form.jabatan, activeTab: 'ringkasan' });
      return true;
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat menyimpan lowongan.';
      showToast('Gagal', msg, 'error');
      reportLastError('buat-lowongan-form-mobile', msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    discardedRef.current = true;
    clearDraft();
    navigate('lowongan_001');
  };

  return {
    form, setField, setUpah,
    departments, createNewDepartment, isCreatingDept,
    lokasiSuggestions, handleLokasiChange, selectLokasi,
    isUploading, uploadFileName, handleFileUpload,
    isSaving, submit, cancel,
    isFreePlan, statusOptions,
    toast, setToast,
  };
}
