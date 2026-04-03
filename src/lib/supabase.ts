import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type Barbershop = {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  banner_url: string;
  whatsapp_number: string;
};

export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

export type Professional = {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
};

export type Appointment = {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
};
