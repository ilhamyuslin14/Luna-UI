import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runBackfill() {
  console.log('Fetching records to backfill...');
  const { data, error } = await supabase
    .from('kandidat')
    .select('*')
    .not('output_ai_raw', 'is', null);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log(`Found ${data.length} records. Processing...`);

  let updatedCount = 0;

  for (const row of data) {
    try {
      if (!row.output_ai_raw) continue;
      
      let parsedAiData = null;
      try {
        parsedAiData = JSON.parse(row.output_ai_raw);
      } catch (e) {
        console.warn(`Row ${row.id} has invalid JSON output_ai_raw, skipping.`);
        continue;
      }

      const dk = parsedAiData?.detail_kandidat || {};
      const dt = parsedAiData?.detail_tambahan || {};

      const updatePayload = {
        email: dk.email || row.email,
        phone: dk.no_telpon || row.phone,
        linkedin_url: dk.linkedin || row.linkedin_url,
        gender: dk.gender || row.gender,
        tgl_lahir: dk.tanggal_lahir || row.tgl_lahir,
        domisili: dk.domisili || row.domisili,
        universitas: dk.universitas || row.universitas,
        jurusan: dk.jurusan || row.jurusan,
        perusahaan_saat_ini: dk.perusahaan_saat_ini || row.perusahaan_saat_ini,
        jabatan_saat_ini: dk.jabatan_saat_ini || row.jabatan_saat_ini,
        pengalaman_tahun: dk.pengalaman_kerja_tahun ? String(dk.pengalaman_kerja_tahun) : row.pengalaman_tahun,
        
        industri: dt.bidang_industri || row.industri,
        tahun_lulus: dt.tahun_kelulusan ? String(dt.tahun_kelulusan) : row.tahun_lulus,
        harapan_upah: dt.harapan_upah ? String(dt.harapan_upah) : row.harapan_upah,
        harapan_benefit: dt.harapan_benefit || row.harapan_benefit,
        
        skills: parsedAiData?.keahlian || row.skills || [],
        pengalaman_kerja: parsedAiData?.pengalaman_kerja || row.pengalaman_kerja || [],
        pendidikan: parsedAiData?.pendidikan || row.pendidikan || [],
        sertifikasi: parsedAiData?.sertifikasi || row.sertifikasi || []
      };

      // Handle nama_lengkap override if it starts with 'CV Baru'
      if (row.nama_lengkap && row.nama_lengkap.startsWith('CV Baru') && dk.nama_lengkap) {
        updatePayload.nama_lengkap = dk.nama_lengkap;
      }

      const { error: updateError } = await supabase
        .from('kandidat')
        .update(updatePayload)
        .eq('id', row.id);

      if (updateError) {
        console.error(`Error updating row ${row.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Successfully updated row ${row.id} (${updatePayload.nama_lengkap || row.nama_lengkap})`);
      }
    } catch (err) {
      console.error(`Unexpected error processing row ${row.id}:`, err);
    }
  }

  console.log(`\nBackfill complete! Successfully updated ${updatedCount} out of ${data.length} records.`);
}

runBackfill();
