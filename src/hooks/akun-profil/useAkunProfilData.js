import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase.js';

// Logic (sync data perusahaan & profil pengguna dari AuthContext, simpan
// perubahan field ke Supabase, unggah aset perusahaan) dipakai bareng oleh
// KelolaPengguna-AkunProfil.jsx (desktop) dan AkunProfilMobile.jsx — markup
// & CSS beda total. Modal crop logo/banner desktop sengaja TIDAK dipindah ke
// sini — itu murni UI desktop; mobile pakai unggah langsung tanpa crop.
export default function useAkunProfilData(companyId, companyName, companyDetails, user, refreshCompanyData) {
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const [perusahaan, setPerusahaan] = useState({
    namaPerusahaan: '', industri: '', ukuran: '', lokasi: '', logo_url: '', banner_url: '',
    tagline: '', tahun_didirikan: '', jenis_badan_usaha: '', alamat: '', website: '',
    email_kontak: '', telepon_kontak: '', deskripsi: '', media_sosial: {}, video_profil_url: '',
  });

  const [profil, setProfil] = useState({
    namaLengkap: '', namaTampilan: '', email: '', telepon: '', lokasi: '',
  });

  useEffect(() => {
    if (companyDetails || companyName) {
      setPerusahaan({
        namaPerusahaan: companyName || '',
        industri: companyDetails?.industri || '',
        ukuran: companyDetails?.ukuran || '',
        lokasi: companyDetails?.lokasi || '',
        logo_url: companyDetails?.logo_url || '',
        banner_url: companyDetails?.banner_url || '',
        tagline: companyDetails?.tagline || '',
        tahun_didirikan: companyDetails?.tahun_didirikan || '',
        jenis_badan_usaha: companyDetails?.jenis_badan_usaha || '',
        alamat: companyDetails?.alamat || '',
        website: companyDetails?.website || '',
        email_kontak: companyDetails?.email_kontak || '',
        telepon_kontak: companyDetails?.telepon_kontak || '',
        deskripsi: companyDetails?.deskripsi || '',
        media_sosial: companyDetails?.media_sosial || {},
        video_profil_url: companyDetails?.video_profil_url || '',
      });
    }
    if (user) {
      setProfil({
        namaLengkap: user.user_metadata?.nama_lengkap || '',
        namaTampilan: user.user_metadata?.nama_tampilan || '',
        email: user.email || '',
        telepon: user.user_metadata?.telepon || '',
        lokasi: user.user_metadata?.lokasi || '',
      });
    }
  }, [companyDetails, companyName, user]);

  const handleUpdateCompany = async (field, value) => {
    if (!companyId) return;
    const updatePayload = {};
    if (field === 'namaPerusahaan') updatePayload.name = value;
    else updatePayload[field] = value;

    const { error } = await supabase.from('companies').update(updatePayload).eq('id', companyId);

    if (!error) {
      setPerusahaan(prev => ({ ...prev, [field]: value }));
      if (refreshCompanyData && user?.id) await refreshCompanyData(user.id);
      showToast('Berhasil', 'Data perusahaan berhasil disimpan', 'success');
    } else {
      console.error(error);
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan data perusahaan', 'error');
      throw error;
    }
  };

  const handleUpdateSocial = async (platform, value) => {
    await handleUpdateCompany('media_sosial', { ...(perusahaan.media_sosial || {}), [platform]: value });
  };

  const handleUpdateProfile = async (field, value) => {
    if (!user) return;
    const metadataUpdate = {};
    if (field === 'namaLengkap') metadataUpdate.nama_lengkap = value;
    else if (field === 'namaTampilan') metadataUpdate.nama_tampilan = value;
    else if (field === 'telepon') metadataUpdate.telepon = value;
    else if (field === 'lokasi') metadataUpdate.lokasi = value;

    const { error } = await supabase.auth.updateUser({ data: metadataUpdate });

    if (!error) {
      setProfil(prev => ({ ...prev, [field]: value }));
      showToast('Berhasil', 'Data profil berhasil disimpan', 'success');
    } else {
      console.error(error);
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan data profil', 'error');
      throw error;
    }
  };

  const uploadCompanyAsset = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${companyId}/${folder}/${fileName}`;
    const { error } = await supabase.storage.from('company_assets').upload(filePath, file);
    if (error) throw error;
    return `${supabase.supabaseUrl}/storage/v1/object/public/company_assets/${filePath}`;
  };

  return {
    perusahaan, profil,
    handleUpdateCompany, handleUpdateSocial, handleUpdateProfile, uploadCompanyAsset,
    toast, setToast, showToast,
  };
}
