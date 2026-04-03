import { supabase } from './src/lib/supabase';

async function check() {
  const { data: d1, error: e1 } = await supabase.from('barbershops').select('active').limit(1);
  console.log('barbershops active:', e1 ? e1.message : 'exists');
  
  const { data: d2, error: e2 } = await supabase.from('profiles').select('active').limit(1);
  console.log('profiles active:', e2 ? e2.message : 'exists');
}
check();
