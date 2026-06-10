import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxmkwfncpxcibjnwnmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ3MDc0NCwiZXhwIjoyMDk2MDQ2NzQ0fQ.zFv48sUjL_13qO7o0zM-D2jL860b_0rR4X3aQvK1Y34'; // Need service role key, but wait, anon key + RLS policies I added might allow it? Let's try anon key first.
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWt3Zm5jcHhjaWJqbndubXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA3NDQsImV4cCI6MjA5NjA0Njc0NH0.igrn_j_7WK0vmHjwDNEid15g_3aYbHeaX7tLvI7N-94';

const supabase = createClient(supabaseUrl, anonKey);

async function clean() {
  const { data, error } = await supabase.storage.from('cv_documents').list('', { limit: 1000 });
  if (error) {
    console.error(error);
    return;
  }
  
  if (data && data.length > 0) {
    const filesToRemove = data.map((x) => x.name);
    console.log("Removing files:", filesToRemove);
    const { error: rmError } = await supabase.storage.from('cv_documents').remove(filesToRemove);
    if (rmError) console.error(rmError);
    else console.log("Removed files successfully.");
  } else {
    console.log("No files to remove.");
  }
}

clean();
