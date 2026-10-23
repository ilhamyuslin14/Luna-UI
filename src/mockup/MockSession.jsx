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
};

const Ctx = createContext(null);

const bacaMasuk = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const tulisMasuk = (v) => { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch { /* diabaikan */ } };

export function MockSessionProvider({ children }) {
  const [masuk, setMasuk] = useState(bacaMasuk);
  const [skor, setSkor] = useState(SKOR_AWAL);   // { [job.key]: angka }
  const [proses, setProses] = useState({});      // { [job.key]: waktuMulai }
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

  const value = useMemo(() => ({
    masuk,
    user: masuk ? { id: PELAMAR_DUMMY.id, email: PELAMAR_DUMMY.email } : null,
    pelamarProfile: masuk ? PELAMAR_DUMMY : null,
    isPelamar: masuk,
    login, logout,
    skor, proses, mulaiCek, DURASI_CEK_MS,
  }), [masuk, skor, proses, login, logout, mulaiCek]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMockSession harus dipakai di dalam MockSessionProvider');
  return ctx;
}
