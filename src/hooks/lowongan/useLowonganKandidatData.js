import { useState, useEffect, useRef, useMemo } from 'react';
import { getScoringBySeleksi, updateAlurProses, markTidakSesuai, runRescore } from '../../services/scoringService.js';
import { getAlurSeleksi, seedDefaultAlur, DEFAULT_ALUR } from '../../services/alurSeleksiService.js';
import { mapScoringRow } from '../../services/scoringMapper.js';
import { invalidate } from '../../services/dataCache.js';

const PENILAIAN_OPTS = new Set(['Tinggi', 'Sedang', 'Rendah']);
const LEVEL_MAP = { Tinggi: 'high', Sedang: 'moderate', Rendah: 'low' };

// Data + aksi untuk tab Kandidat di laman Lowongan Detail versi mobile —
// daftar kandidat yang sudah dinilai untuk SATU posisi tertentu. Berbeda
// dari useKandidatDetailData.js (satu kandidat, banyak posisi): di sini
// satu posisi, banyak kandidat — tapi bentuk item skor & sheet detailnya
// sama persis (lihat MobileScoreDetailSheet), jadi mapScoringRow di-reuse
// dari scoringMapper.js lalu ditambah field milik kandidat (nama, LinkedIn,
// dst.) yang tidak dibutuhkan di konteks Kandidat Detail.
export default function useLowonganKandidatData(seleksiId, companyId) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alurList, setAlurList] = useState(DEFAULT_ALUR);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [activeSort, setActiveSort] = useState('skor_desc');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, subMessage, type = 'success') => {
    setToast({ message, subMessage, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const fetchData = () => {
    if (!seleksiId) { setIsLoading(false); return; }
    setIsLoading(true);
    getScoringBySeleksi(seleksiId)
      .then(data => {
        const mapped = (data || [])
          .filter(s => !s.kandidat?.arsip)
          .map(s => ({
            ...mapScoringRow(s),
            kandidatId: s.kandidat?.id || s.kandidat_id,
            seleksiId,
            nama: s.kandidat?.nama_lengkap || '-',
            sumber: s.kandidat?.sumber || '',
            jabatanKandidat: s.kandidat?.jabatan_saat_ini || '-',
            perusahaan: s.kandidat?.perusahaan_saat_ini || '-',
            pengalaman: s.kandidat?.pengalaman_tahun ?? null,
            linkedin: s.kandidat?.linkedin_url || '',
            domisili: s.kandidat?.domisili || '-',
          }));
        setRows(mapped);
      })
      .catch(err => { console.error(err); showToast('Gagal memuat data', err.message, 'error'); })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleksiId]);

  useEffect(() => {
    if (!companyId) return;
    seedDefaultAlur(companyId);
    getAlurSeleksi(companyId).then(setAlurList).catch(() => {});
  }, [companyId]);

  const toggleFilter = (s) => {
    setActiveFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const alurNama = (level) => alurList.find(a => a.level === level)?.nama ?? `Level ${level}`;

  const filteredData = useMemo(() => {
    let result = activeFilters.size === 0 ? rows : rows.filter(k => {
      const penilaianFilters = [...activeFilters].filter(f => PENILAIAN_OPTS.has(f));
      const alurFilters = [...activeFilters].filter(f => !PENILAIAN_OPTS.has(f));
      if (penilaianFilters.length > 0 && !penilaianFilters.some(f => LEVEL_MAP[f] === k.fit)) return false;
      if (alurFilters.length > 0 && !alurFilters.some(f => f === alurNama(k.alur))) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (activeSort) {
        case 'skor_desc': return (b.score ?? 0) - (a.score ?? 0);
        case 'skor_asc': return (a.score ?? 0) - (b.score ?? 0);
        case 'nama_asc': return (a.nama || '').localeCompare(b.nama || '');
        case 'nama_desc': return (b.nama || '').localeCompare(a.nama || '');
        default: return 0;
      }
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, activeFilters, activeSort, alurList]);

  // kandidat "Tidak Sesuai" (alur 0) tidak muncul di list, sama seperti desktop
  const listData = filteredData.filter(k => k.alur !== 0);
  const activeCount = rows.filter(r => r.alur !== 0).length;

  const changeAlur = async (item, level) => {
    const prevAlur = item.alur;
    setRows(prev => prev.map(r => r.scoringId === item.scoringId ? { ...r, alur: level } : r));
    try {
      await updateAlurProses(item.scoringId, level);
      invalidate('karyawan');
      showToast('Status diperbarui', `Kandidat dipindahkan ke ${alurNama(level)}`);
    } catch (err) {
      setRows(prev => prev.map(r => r.scoringId === item.scoringId ? { ...r, alur: prevAlur } : r));
      showToast('Gagal memperbarui status', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const rescore = async (item) => {
    if (!item.scoringId || !item.kandidatId || !item.seleksiId || !companyId) {
      showToast('Tidak bisa nilai ulang', 'Data kandidat atau posisi tidak lengkap.', 'error');
      return;
    }
    try {
      const row = await runRescore(item.scoringId, item.kandidatId, item.seleksiId, companyId);
      // runRescore lewat edge function, respons-nya tidak selalu ikut join
      // ke tabel seleksi seperti fetch awal — posisi/departemen dikunci ke
      // nilai item lama supaya tidak ke-timpa jadi "-" begitu rescore selesai
      // (nama posisi kandidat tidak mungkin berubah gara-gara rescore).
      const updated = { ...item, ...mapScoringRow(row), posisi: item.posisi, departemen: item.departemen };
      setRows(prev => prev.map(r => r.scoringId === item.scoringId ? updated : r));
      showToast('Penilaian ulang selesai', 'Hasil penilaian AI telah diperbarui.');
      return updated;
    } catch (err) {
      showToast('Gagal menilai ulang', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const reject = async (ids, alasan, detail) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(idArr.map(id => markTidakSesuai(id, alasan, detail)));
      setRows(prev => prev.map(r => idArr.includes(r.scoringId) ? { ...r, alur: 0 } : r));
      showToast(
        idArr.length > 1 ? `${idArr.length} kandidat ditandai tidak sesuai` : 'Kandidat ditandai tidak sesuai',
        `Alasan: ${alasan}`
      );
      return true;
    } catch (err) {
      showToast('Gagal', err.message || 'Gagal menandai tidak sesuai.', 'error');
      return false;
    }
  };

  return {
    isLoading, rows, listData, activeCount, alurList,
    activeFilters, toggleFilter, setActiveFilters,
    activeSort, setActiveSort,
    changeAlur, rescore, reject,
    toast, setToast, showToast,
  };
}
