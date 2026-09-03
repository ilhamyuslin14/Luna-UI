import { useState, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getLastError, subscribeLastError, clearLastError } from '../utils/lastErrorMemory.js';
import { submitLaporanMasalah } from '../services/laporanMasalahService.js';

// Logic dipakai bareng oleh ReportKendalaButton (desktop) dan
// MobileReportKendalaButton — cuma tempat render trigger/panel-nya beda,
// state & submit-nya sama.
export default function useReportKendala(halaman) {
  const { user, companyId } = useAuth() || {};
  const lastError = useSyncExternalStore(subscribeLastError, getLastError, getLastError);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (onDone) => {
    setSubmitting(true);
    try {
      await submitLaporanMasalah({
        companyId,
        userId: user?.id,
        halaman,
        pesanError: lastError?.pesan || null,
        catatanUser: note,
      });
      setSent(true);
      clearLastError();
      setTimeout(() => {
        onDone?.();
        setSent(false);
        setNote('');
      }, 1500);
    } catch (err) {
      console.error('Gagal mengirim laporan masalah:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return { lastError, note, setNote, submitting, sent, handleSubmit };
}
