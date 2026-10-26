import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { SKOR_AWAL, HASIL_CEK } from './data/lowonganDummy.js';

// Sesi PALSU untuk mockup: tidak ada login sungguhan dan tidak menyentuh Supabase. Status masuk,
// skor kecocokan, dan proses "cek kecocokan" yang sedang berjalan disimpan di sini (di atas semua layar)
// supaya tidak hilang saat panel detail ditutup atau pindah layar. Status masuk disimpan di
// sessionStorage, jadi muat ulang halaman saat presentasi tidak membuat pengguna "keluar".
const KEY = 'luna_mockup_masuk';
const DURASI_CEK_MS = 3600;

export const PELAMAR_DUMMY = {
  id: 'mockup-pelamar',
  nama_lengkap: 'Dina Pratama',
  email: 'dina.pratama@email.com',
  phone: '0812-3456-7890',
  // Kolom preferensi di profil (bentuk sama dengan pelamar_profiles.pref_*), dipakai urutan rekomendasi di daftar.
  pref_posisi: ['Business Analyst', 'Data Analyst', 'Product Analyst'],
  pref_lokasi: ['Jakarta', 'Tangerang Selatan', 'Remote'],
  pref_gaji_min: 8000000,
  pref_gaji_nego: true,
  pref_ketersediaan: '1 Bulan Pemberitahuan (1 Month Notice)',
  pref_tipe_kerja: ['Penuh Waktu (Full-time)', 'Kontrak / Proyek'],
  pref_model_kerja: 'Hybrid / Remote Diutamakan',
  pref_status_pencarian: 'Aktif Menjelajah Peluang',
};

const Ctx = createContext(null);

const bacaMasuk = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const tulisMasuk = (v) => { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch { /* diabaikan */ } };

export function MockSessionProvider({ children }) {
  const [masuk, setMasuk] = useState(bacaMasuk);
  const [skor, setSkor] = useState(SKOR_AWAL);   // { [job.key]: angka }
  const [proses, setProses] = useState({});      // { [job.key]: waktuMulai }
  const [dilamar, setDilamar] = useState({});         // { [job.key]: true } lowongan Luna yang sudah dilamar
  const [lamarProses, setLamarProses] = useState({}); // { [job.key]: true } lamaran yang sedang "dikirim"
  const timers = useRef({});

  const login = useCallback(() => { tulisMasuk(true); setMasuk(true); }, []);

  const logout = useCallback(() => {
    tulisMasuk(false);
    setMasuk(false);
    // Kembali ke keadaan awal demo.
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setSkor(SKOR_AWAL);
    setProses({});
    setDilamar({});
    setLamarProses({});
  }, []);

  // Cek kecocokan tiruan: "memproses" beberapa detik, lalu hasilnya muncul.
  const mulaiCek = useCallback((key) => {
    if (timers.current[key]) return; // sudah berjalan
    setProses(p => ({ ...p, [key]: Date.now() }));
    timers.current[key] = setTimeout(() => {
      delete timers.current[key];
      setSkor(s => ({ ...s, [key]: HASIL_CEK[key] ?? 64 }));
      setProses(p => { const n = { ...p }; delete n[key]; return n; });
    }, DURASI_CEK_MS);
  }, []);

  // Lamaran cepat tiruan: berjalan sebentar lalu tercatat "sudah melamar". Disimpan di sesi (bukan di popup),
  // jadi menutup popup saat dikirim tidak menghentikannya, sama seperti di aplikasi.
  const lamar = useCallback((key) => {
    if (timers.current['lamar:' + key]) return;
    setLamarProses(p => ({ ...p, [key]: true }));
    timers.current['lamar:' + key] = setTimeout(() => {
      delete timers.current['lamar:' + key];
      setDilamar(d => ({ ...d, [key]: true }));
      setLamarProses(p => { const n = { ...p }; delete n[key]; return n; });
    }, 2000);
  }, []);

  const value = useMemo(() => ({
    masuk,
    user: masuk ? { id: PELAMAR_DUMMY.id, email: PELAMAR_DUMMY.email } : null,
    pelamarProfile: masuk ? PELAMAR_DUMMY : null,
    isPelamar: masuk,
    login, logout,
    skor, proses, mulaiCek, DURASI_CEK_MS,
    dilamar, lamarProses, lamar,
    simpanPreferensi: async () => true, // mockup: preferensi tidak disimpan ke mana pun
  }), [masuk, skor, proses, login, logout, mulaiCek, dilamar, lamarProses, lamar]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMockSession harus dipakai di dalam MockSessionProvider');
  return ctx;
}
