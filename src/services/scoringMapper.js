// Konversi 1 baris tabel `scoring` (join ke `seleksi`) jadi bentuk yang dipakai
// UI penilaian AI — dipakai bareng oleh useKandidatDetailData.js (Kandidat
// Detail, satu kandidat banyak posisi) dan useLowonganKandidatData.js
// (Lowongan Detail tab Kandidat, satu posisi banyak kandidat), makanya
// logic pencocokan kriteria yang cukup rumit ini ditaruh di satu tempat.

const KATEGORI_FIT_MAP = {
  'Sangat Fit': { fit: 'high', label: 'Tinggi' },
  'Fit': { fit: 'high', label: 'Tinggi' },
  'Cukup Fit': { fit: 'moderate', label: 'Sedang' },
  'Kurang Fit': { fit: 'low', label: 'Rendah' },
};

export function scoreLevelFromValue(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 20) return 'low';
  return 'none';
}

export function mapScoringRow(scoring) {
  const belumDinilai = scoring.total_score == null && scoring.kategori_fit == null;
  const { fit, label } = belumDinilai
    ? { fit: 'none', label: 'Belum Dinilai' }
    : (KATEGORI_FIT_MAP[scoring.kategori_fit] || { fit: 'low', label: scoring.kategori_fit });

  const aiOutput = scoring.detail_kriteria || [];
  const getAiMatch = (rawTag) => {
    if (!rawTag || aiOutput.length === 0) return null;
    const normTag = rawTag.toLowerCase().trim();
    let match = aiOutput.find(ai => ai.tag && ai.tag.toLowerCase().trim() === normTag);
    if (!match) {
      match = aiOutput.find(ai => {
        if (!ai.tag) return false;
        const t = ai.tag.toLowerCase().trim();
        return t.includes(normTag) || normTag.includes(t);
      });
    }
    return match;
  };

  const toItemFromRaw = rawKrit => {
    const aiMatch = getAiMatch(rawKrit.tag);
    const scoreVal = aiMatch ? (aiMatch.score_evaluate ?? 0) : 0;
    return {
      level: scoreLevelFromValue(scoreVal),
      name: rawKrit.tag || 'Kriteria',
      desc: aiMatch ? (aiMatch.evidence || 'Tidak ada analisis dari AI.') : 'Analisis AI tidak tersedia untuk kriteria ini.',
      req: rawKrit.teks || '',
      bobot: rawKrit.kategori === 'Wajib' ? 'tinggi' : 'rendah',
      score: scoreVal,
    };
  };

  const rawKriteriaList = scoring.raw_kriteria || [];
  const criteriaData = rawKriteriaList.filter(k => k.kategori === 'Wajib').map(toItemFromRaw);
  const prefData = rawKriteriaList.filter(k => k.kategori !== 'Wajib').map(toItemFromRaw);

  return {
    id: scoring.id,
    scoringId: scoring.id,
    kandidatId: scoring.kandidat_id,
    seleksiId: scoring.seleksi_id,
    posisi: scoring.seleksi?.jabatan || '-',
    departemen: scoring.seleksi?.departments?.name || '',
    alur: scoring.alur_proses ?? 1,
    fit, label,
    score: belumDinilai ? null : (scoring.total_score ?? 0),
    belumDinilai,
    aiSummary: scoring.ai_summary || '',
    criteriaData, prefData,
    alasan: scoring.alasan_tidak_sesuai || '',
    detail: scoring.alasan_tidak_sesuai_detail || '',
  };
}
