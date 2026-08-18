import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.js';

const WA_SUPPORT_PHONE = '6281234567890';

// Logic (sync data diri dari AuthContext, simpan perubahan ke Supabase, link
// WhatsApp support) dipakai bareng oleh Bantuan_001.jsx (desktop) dan
// BantuanMobile.jsx — markup & CSS beda total. Form "kendala" sengaja TIDAK
// dikirim ke backend di sini — desktop pun cuma memindahkan UI ke state
// sukses tanpa submit sungguhan ke server, jadi mobile menyamai perilaku itu
// apa adanya, bukan menambah fitur baru yang belum ada di desktop.
export default function useBantuanData(user, profileName, companyName, companyDetails, companyId, refreshCompanyData) {
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    nama: '', email: '', whatsapp: '', perusahaan: '', industri: '', karyawan: '', lokasi: '',
  });

  useEffect(() => {
    setProfileData({
      nama: profileName || user?.user_metadata?.nama_lengkap || user?.user_metadata?.name || '',
      email: user?.email || '',
      whatsapp: companyDetails?.telepon_kontak || companyDetails?.phone || companyDetails?.whatsapp || user?.user_metadata?.whatsapp || user?.phone || '',
      perusahaan: companyName || companyDetails?.namaPerusahaan || companyDetails?.name || user?.user_metadata?.nama_perusahaan || '',
      industri: companyDetails?.industri || companyDetails?.industry || '',
      karyawan: companyDetails?.ukuran || companyDetails?.employee_count || companyDetails?.size || companyDetails?.karyawan || '',
      lokasi: companyDetails?.lokasi || companyDetails?.location || companyDetails?.address || '',
    });
  }, [user, profileName, companyName, companyDetails]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (user?.id) {
        await supabase.from('profiles').update({ nama_lengkap: profileData.nama }).eq('id', user.id);
      }
      if (companyId) {
        await supabase.from('companies').update({
          name: profileData.perusahaan,
          namaPerusahaan: profileData.perusahaan,
          industri: profileData.industri,
          ukuran: profileData.karyawan,
          employee_count: profileData.karyawan,
          lokasi: profileData.lokasi,
          location: profileData.lokasi,
          telepon_kontak: profileData.whatsapp,
          phone: profileData.whatsapp,
        }).eq('id', companyId);
      }
      if (refreshCompanyData && user?.id) await refreshCompanyData(user.id);
    } catch (err) {
      console.error('Gagal memperbarui data profil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const waUrl = `https://wa.me/${WA_SUPPORT_PHONE}?text=${encodeURIComponent(
    `Halo Tim Support LUNA, saya ${profileData.nama} dari ${profileData.perusahaan} ingin bertanya tentang kendala rekrutmen.`
  )}`;

  return { profileData, setProfileData, isSaving, handleSaveProfile, waUrl };
}
