import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function check() {
    const { data: d1, error: e1 } = await supabase.from('barbershops').select('active').limit(1);
    console.log('barbershops active:', e1 ? e1.message : 'exists');
    
    const { data: d2, error: e2 } = await supabase.from('profiles').select('active').limit(1);
    console.log('profiles active:', e2 ? e2.message : 'exists');
  }
  check();
} else {
  console.log('Missing env vars');
}
