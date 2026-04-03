import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('Fetching appointments...');
  const { data: appts, error: fetchErr } = await supabase
    .from('appointments')
    .select('id, service_id, services(id, name, price, duration_minutes)');

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  console.log(`Found ${appts.length} appointments.`);

  for (const appt of appts) {
    if (appt.services && !appt.services_json) { // Assuming we add services_json column or just use the existing one
      // Wait, we can't add a column via JS client easily without raw SQL.
      // But we can just use the existing `service_id` for the first service, and maybe add `additional_services`?
      // No, we can't add a column without SQL.
    }
  }
}

migrate();
