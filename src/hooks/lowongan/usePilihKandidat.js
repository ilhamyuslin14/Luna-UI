import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUpload } from '../../context/UploadContext.jsx';
import { getKandidat } from '../../services/kandidatService.js';
import { getScoringBySeleksi } from '../../services/scoringService.js';

export function getInisial(nama) {
  const parts = (nama || '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

// Dipakai bareng oleh Lowongan-TambahKandidat.jsx (desktop, tab
// PilihKandidatTab) dan MobilePilihKandidat.jsx — daftar kandidat yang
// sudah ada di sistem tapi belum ikut skoring di posisi (seleksi) ini.
// Tambah kandidat = enqueueScoringJob lewat UploadContext yang sama dipakai
// alur Unggah CV, jadi antreannya bergabung dengan proses upload yang lagi
// berjalan (kalau ada).
export default function usePilihKandidat(seleksiId, jabatan) {
  const { companyId } = useAuth();
  const { enqueueScoringJob } = useUpload();

  const [kandidatList, setKandidatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [added, setAdded] = useState(new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    getKandidat(companyId)
      .then(rows => setKandidatList(rows || []))
      .catch(() => setKandidatList([]))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  useEffect(() => {
    if (!seleksiId) return;
    getScoringBySeleksi(seleksiId)
      .then(rows => {
        const ids = new Set((rows || []).map(s => s.kandidat?.id || s.kandidat_id).filter(Boolean));
        setAdded(ids);
      })
      .catch(() => {});
  }, [seleksiId]);

  const handleTambah = (k) => {
    setAdded(prev => new Set([...prev, k.id]));
    if (seleksiId && k.id && companyId) {
      enqueueScoringJob(k.id, seleksiId, jabatan, k.nama_lengkap || '', companyId);
    }
  };

  const q = query.trim().toLowerCase();
  const availableList = kandidatList
    .filter(k => !added.has(k.id) && !k.arsip)
    .filter(k => !q || (k.nama_lengkap || '').toLowerCase().includes(q) || (k.jabatan_saat_ini || '').toLowerCase().includes(q))
    .sort((a, b) => (a.nama_lengkap || '').localeCompare(b.nama_lengkap || ''));

  const totalAvailable = kandidatList.filter(k => !added.has(k.id) && !k.arsip).length;

  return {
    isLoading, kandidatList, availableList, totalAvailable,
    query, setQuery, handleTambah,
  };
}
