import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing scoring query...");
  // Use a hardcoded company_id or just limit 1
  const { data, error } = await supabase
    .from('scoring')
    .select('alur_proses, kategori_fit, seleksi_id, seleksi!inner(company_id, jabatan)')
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
