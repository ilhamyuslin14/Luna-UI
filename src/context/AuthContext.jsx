import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase.js';

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
  const [loading, setLoading] = useState(true);

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
    // Mengecek sesi aktif saat pertama kali muat
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchCompanyId(session.user.id);
      }
      setLoading(false);
    });

    // Mendengarkan perubahan status autentikasi (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchCompanyId(session.user.id);
      } else {
        setCompanyId(null);
        setCompanyName(null);
        setCompanyDetails({});
        setCompanyPlan(null);
        setUserRole(null);
        setMustChangePassword(false);
        setOtpVerified(true);
        setOnboardingCompleted(true);
      }
      setLoading(false);
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
    loading,
    login,
    register,
    logout,
    refreshCompanyData: fetchCompanyId,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
