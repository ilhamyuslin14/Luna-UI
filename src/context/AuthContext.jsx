import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase.js';
import { prefKeBaris } from '../data/preferensiKerja.js';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [companyDetails, setCompanyDetails] = useState({});
  const [companyPlan, setCompanyPlan] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileName, setProfileName] = useState(null);
  const [lowonganCount, setLowonganCount] = useState(0);
  const [kandidatCount, setKandidatCount] = useState(0);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [otpVerified, setOtpVerified] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [pelamarProfile, setPelamarProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Akun pelamar hidup di pelamar_profiles (tabel terpisah dari profiles
  // milik perusahaan — lihat handle_new_user() di DB), jadi dicek lewat
  // query sendiri, bukan ikut fetchCompanyId. Tidak error kalau usernya
  // ternyata akun perusahaan (baris cuma tidak ketemu, pelamarProfile null).
  const fetchPelamarProfile = async (userId) => {
    if (!userId) {
      setPelamarProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('pelamar_profiles')
      .select('nama_lengkap, email, phone, pref_posisi, pref_lokasi, pref_gaji_min, pref_gaji_nego, pref_ketersediaan, pref_tipe_kerja, pref_model_kerja, pref_status_pencarian, pref_akun_portal')
      .eq('id', userId)
      .maybeSingle();
    setPelamarProfile(!error && data ? data : null);
  };

  // Simpan preferensi pekerjaan pelamar (onboarding dan Profil Saya). Melempar error bila gagal.
  const simpanPreferensi = async (pref) => {
    if (!user?.id) return false;
    const baris = prefKeBaris(pref);
    const { error } = await supabase.from('pelamar_profiles').update(baris).eq('id', user.id);
    if (error) throw error;
    setPelamarProfile((prev) => (prev ? { ...prev, ...baris } : prev));
    return true;
  };

  const fetchCompanyId = async (userId) => {
    if (!userId) {
      setCompanyId(null);
      setCompanyName(null);
      setCompanyDetails({});
      setCompanyPlan(null);
      setUserRole(null);
      setProfileName(null);
      setLowonganCount(0);
      setKandidatCount(0);
      setMustChangePassword(false);
      setOtpVerified(true);
      setOnboardingCompleted(true);
      return;
    }
    const [{ data, error }, { data: profile }] = await Promise.all([
      supabase
        .from('company_users')
        .select('company_id, role, companies(*)')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('nama_lengkap, must_change_password, otp_verified, onboarding_completed')
        .eq('id', userId)
        .maybeSingle(),
    ]);

    setMustChangePassword(!!profile?.must_change_password);
    setOtpVerified(profile?.otp_verified !== false);
    setOnboardingCompleted(profile?.onboarding_completed !== false);
    setProfileName(profile?.nama_lengkap || null);

    if (data && !error) {
      setCompanyId(data.company_id);
      setUserRole(data.role);
      setCompanyName(data.companies?.name || null);
      setCompanyDetails(data.companies || {});
      setCompanyPlan(data.companies?.plan || null);

      if (data.company_id) {
        const [{ count: lCount }, { count: kCount }] = await Promise.all([
          supabase.from('seleksi').select('*', { count: 'exact', head: true }).eq('company_id', data.company_id),
          supabase.from('kandidat').select('*', { count: 'exact', head: true }).eq('company_id', data.company_id),
        ]);
        setLowonganCount(lCount || 0);
        setKandidatCount(kCount || 0);
      }
    } else {
      setCompanyId(null);
      setUserRole(null);
      setCompanyName(null);
      setCompanyDetails({});
      setCompanyPlan(null);
      setLowonganCount(0);
      setKandidatCount(0);
    }
  };

  useEffect(() => {
    // onAuthStateChange sudah fire sekali dengan sesi saat ini begitu di-subscribe
    // (event INITIAL_SESSION), jadi tidak perlu getSession() terpisah di atasnya —
    // dulu ada dua-duanya dan berjalan paralel, menggandakan round-trip ke Supabase
    // di setiap muat halaman.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (session?.user) {
          localStorage.setItem('luna_admin_last_login', new Date().toISOString());
          const [cid] = await Promise.all([
            fetchCompanyId(session.user.id),
            fetchPelamarProfile(session.user.id),
          ]);
          if (cid) {
            localStorage.setItem(`luna_admin_last_login_${cid}`, new Date().toISOString());
          }
        } else {
          setCompanyId(null);
          setCompanyName(null);
          setCompanyDetails({});
          setCompanyPlan(null);
          setUserRole(null);
          setMustChangePassword(false);
          setOtpVerified(true);
          setOnboardingCompleted(true);
          setPelamarProfile(null);
        }
      } catch (err) {
        // Kalau fetchCompanyId gagal (query error, RLS, dsb), jangan biarkan
        // loading nyangkut true selamanya — itu bikin App.jsx nge-spinner
        // permanen tanpa ada cara keluar sama sekali selain refresh manual.
        console.error('Gagal memuat data perusahaan setelah login:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, { nama_lengkap, nama_perusahaan }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap,
          nama_perusahaan,
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const registerPelamar = async (email, password, { nama_lengkap, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: 'pelamar',
          nama_lengkap,
          phone,
        }
      }
    });
    if (error) throw error;
    return data;
  };

  // Menambahkan peran pelamar ke akun yang SUDAH login (satu identitas auth
  // bisa punya profil perusahaan dan profil pelamar sekaligus — tapi
  // masing-masing tetap harus "didaftarkan" eksplisit, tidak otomatis ikut
  // saat signUp yang satu lagi). Dipakai saat email yang dipakai daftar
  // pelamar ternyata sudah punya akun (mis. akun HR) dan passwordnya cocok.
  const addPelamarRole = async ({ nama_lengkap, phone }) => {
    const { data: { user: authedUser } } = await supabase.auth.getUser();
    if (!authedUser) throw new Error('Tidak ada sesi aktif.');
    const { error } = await supabase.from('pelamar_profiles').insert({
      id: authedUser.id,
      nama_lengkap,
      email: authedUser.email,
      phone: phone || null,
    });
    // 23505 = sudah ada row pelamar_profiles buat akun ini (sudah pernah
    // daftar pelamar juga sebelumnya) — bukan error, anggap sukses.
    if (error && error.code !== '23505') throw error;
    await fetchPelamarProfile(authedUser.id);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Reset gate "Getting Started" (lihat mobile/MobileApp.jsx) supaya
    // benar-benar dievaluasi ulang tiap login baru, bukan cuma tiap tab/sesi.
    sessionStorage.removeItem('luna_getting_started_seen');
  };

  const value = {
    user,
    session,
    companyId,
    companyName,
    companyDetails,
    companyPlan,
    userRole,
    profileName,
    lowonganCount,
    kandidatCount,
    mustChangePassword,
    otpVerified,
    onboardingCompleted,
    pelamarProfile,
    isPelamar: !!pelamarProfile,
    simpanPreferensi,
    loading,
    login,
    register,
    registerPelamar,
    addPelamarRole,
    logout,
    refreshCompanyData: fetchCompanyId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
