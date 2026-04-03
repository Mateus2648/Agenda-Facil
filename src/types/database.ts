export type Barbershop = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  barbershop_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

export type Professional = {
  id: string;
  barbershop_id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
};

export type Appointment = {
  id: string;
  barbershop_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
};

export type Client = {
  id: string;
  barbershop_id: string;
  name: string;
  phone: string;
  email: string | null;
};
