import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';
import useBuatLowonganPanduanCore from '../hooks/lowongan/useBuatLowonganPanduan.js';

const BuatLowonganPanduanContext = createContext(null);

export function useBuatLowonganPanduanContext() {
  return useContext(BuatLowonganPanduanContext);
}

// Wizard "Buat Lowongan dengan Bantuan Luna" tetap halaman biasa — terikat ke
// activeMenu === 'buat-lowongan-panduan_001' sama seperti sebelumnya, dibuka
// lewat navigate() dan ditutup lewat back()/navigate() juga, PERSIS pola
// halaman lain di app ini. Yang beda cuma: datanya (step, jawaban, draf, dst,
// dari useBuatLowonganPanduan) diangkat ke sini, dipasang sekali di main.jsx
// di atas percabangan isMobile di App.jsx — supaya kalau user ganti device
// (resize browser / buka HP vs desktop) SAAT activeMenu masih di halaman ini,
// progress-nya tidak ikut hilang seperti dulu (dulu tiap platform punya
// instance hook-nya sendiri2, hilang tiap kali tree lamanya di-unmount).
export function BuatLowonganPanduanProvider({ children }) {
  const { companyId, companyPlan } = useAuth() || {};
  const wizard = useBuatLowonganPanduanCore(companyId, companyPlan);

  return (
    <BuatLowonganPanduanContext.Provider value={wizard}>
      {children}
    </BuatLowonganPanduanContext.Provider>
  );
}
