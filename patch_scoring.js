import { supabase } from './src/config/supabase.js';

async function testCheck(kandidatId, seleksiId) {
  const { data, error } = await supabase
    .from('scoring')
    .select('id')
    .eq('kandidat_id', kandidatId)
    .eq('seleksi_id', seleksiId)
    .maybeSingle();
  console.log(data, error);
}
