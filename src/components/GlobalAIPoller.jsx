import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase.js';
import Toast from './Toast.jsx';

export default function GlobalAIPoller() {
  const [toast, setToast] = useState(null);
  const trackingRef = useRef(new Set());

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const checkPending = async () => {
      try {
        const { data, error } = await supabase
          .from('seleksi')
          .select('id, jabatan, kriteria');

        if (error || !data) return;

        data.forEach(sel => {
          const isGenerating = sel.kriteria?.[0]?._isGenerating === true;

          if (isGenerating) {
            // Jika statusnya sedang generating, catat ID-nya ke tracker
            if (!trackingRef.current.has(sel.id)) {
              trackingRef.current.add(sel.id);
            }
          } else {
            // Jika sebelumnya dicatat sedang generating, tapi sekarang sudah hilang flag-nya
            if (trackingRef.current.has(sel.id)) {
              trackingRef.current.delete(sel.id);
              // Pastikan kriteria terisi, bukan array kosong (jika gagal/error)
              if (sel.kriteria && sel.kriteria.length > 0) {
                if (sel.kriteria[0]?._isError) {
                  showToast('Perumusan Gagal', `AI gagal menyiapkan kriteria untuk ${sel.jabatan || 'posisi ini'}. (${sel.kriteria[0].message || 'Server Sibuk'})`, 'error');
                  // Reset kembali ke array kosong agar bersih dan tidak render error object di UI
                  supabase.from('seleksi').update({ kriteria: [] }).eq('id', sel.id).then();
                } else {
                  showToast('Kriteria Selesai Dirumuskan!', `AI berhasil menyiapkan kriteria untuk posisi ${sel.jabatan || 'baru'}.`);
                }
              }
            }
          }
        });
      } catch (err) {
        // Abaikan error polling (misal koneksi putus)
      }
    };

    // Jalankan sekali saat mount, lalu ulangi tiap 4 detik
    checkPending();
    const intervalId = setInterval(checkPending, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
