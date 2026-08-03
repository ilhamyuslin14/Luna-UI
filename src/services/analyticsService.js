import { supabase } from '../config/supabase.js';

// Non-critical logging — jangan sampai gagal insert menghalangi alur signup.
export async function logSignupIntent(intent) {
  try {
    await supabase.from('signup_intent_events').insert({ intent });
  } catch (e) {
    console.error('Gagal mencatat signup intent:', e);
  }
}
