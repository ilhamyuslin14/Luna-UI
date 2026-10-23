// Mockup verifikasi OTP email untuk pendaftaran pelamar (PelamarVerifikasiOtp_001).
// Belum ada pengiriman email atau validasi kode sungguhan: layar ini hanya memperlihatkan alur.
//
// OTP_MOCKUP_AKTIF = true  -> setelah "Daftar Akun" berhasil, pelamar diarahkan ke layar OTP ini.
// OTP_MOCKUP_AKTIF = false -> alur Daftar kembali seperti semula (layar OTP tetap bisa dibuka lewat
//                             /?view=pelamar-verifikasi-otp untuk ditinjau).
export const OTP_MOCKUP_AKTIF = true;

const KEY = 'luna_pelamar_otp_email';

export function simpanEmailOtp(email) {
  try { sessionStorage.setItem(KEY, email || ''); } catch { /* sessionStorage bisa diblokir */ }
}

export function bacaEmailOtp() {
  try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
}
