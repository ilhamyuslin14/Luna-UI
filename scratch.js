import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('seleksi').select('id, company_id, jabatan, status').ilike('jabatan', '%Senior Product Manager%');
  console.log(data, error);
}
run();
