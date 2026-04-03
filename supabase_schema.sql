-- 1. Barbershops Table
create table barbershops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  owner_email text,
  name text not null,
  slug text unique not null,
  primary_color text default '#1a1a1a',
  secondary_color text default '#ffffff',
  logo_url text,
  banner_url text,
  whatsapp_number text,
  expiration_date timestamp with time zone,
  is_active boolean default true,
  creation_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Profiles (Users/Admins)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text unique not null,
  barbershop_id uuid references barbershops(id),
  full_name text,
  role text check (role in ('admin', 'professional')),
  created_at timestamp with time zone default now()
);

-- 3. Professionals
create table professionals (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) not null,
  name text not null,
  bio text,
  avatar_url text,
  commission_rate numeric default 0,
  created_at timestamp with time zone default now()
);

-- 4. Services
create table services (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) not null,
  name text not null,
  description text,
  price numeric not null,
  duration_minutes integer not null,
  created_at timestamp with time zone default now()
);

-- 5. Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) not null,
  name text not null,
  phone text not null,
  email text,
  created_at timestamp with time zone default now()
);

-- 6. Appointments
create table appointments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) not null,
  client_id uuid references clients(id) not null,
  professional_id uuid references professionals(id) not null,
  service_id uuid references services(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'cancelled', 'completed')),
  total_price numeric not null,
  created_at timestamp with time zone default now()
);

-- 7. Working Hours
create table working_hours (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) on delete cascade not null,
  professional_id uuid references professionals(id) on delete cascade,
  day_of_week integer check (day_of_week between 0 and 6),
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  intervals jsonb default '[]',
  is_active boolean default true,
  constraint barbershop_day_unique unique (barbershop_id, day_of_week)
);

-- 8. Working Hours Overrides (Calendar Exceptions)
create table working_hours_overrides (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) on delete cascade not null,
  specific_date date not null,
  start_time time default '09:00',
  end_time time default '18:00',
  intervals jsonb default '[]',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  constraint barbershop_date_unique unique (barbershop_id, specific_date)
);

-- 9. Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops(id) not null,
  appointment_id uuid references appointments(id) not null,
  amount numeric not null,
  payment_method text check (payment_method in ('cash', 'pix', 'card')),
  created_at timestamp with time zone default now()
);

-- 10. Partner Access Table
create table partner_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text not null,
  full_name text,
  role text check (role in ('admin', 'professional')),
  barbershop_id uuid references barbershops(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- 11. Activity Logs
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  action text not null,
  details text,
  barbershop_id uuid references barbershops(id) on delete set null,
  deleted_barbershop_name text,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table barbershops enable row level security;
alter table profiles enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table working_hours enable row level security;
alter table working_hours_overrides enable row level security;
alter table payments enable row level security;
alter table activity_logs enable row level security;
alter table partner_access enable row level security;

-- Policies
create policy "Barbershops are viewable by everyone" on barbershops for select using (true);
create policy "Services are viewable by everyone" on services for select using (true);
create policy "Professionals are viewable by everyone" on professionals for select using (true);
create policy "Working hours are viewable by everyone" on working_hours for select using (true);
create policy "Working hours overrides are viewable by everyone" on working_hours_overrides for select using (true);
create policy "Activity logs are viewable by Master only" on activity_logs for select using (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com');
create policy "Anyone can insert activity logs" on activity_logs for insert with check (true);

-- Admin policies
create policy "Owners and Master can manage their barbershop" on barbershops for all using (
  owner_id = auth.uid() or 
  owner_email = auth.jwt() ->> 'email' or
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from partner_access where partner_access.barbershop_id = barbershops.id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their services" on services for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = services.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = services.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their professionals" on professionals for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = professionals.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = professionals.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their working hours" on working_hours for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = working_hours.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = working_hours.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their working hours overrides" on working_hours_overrides for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = working_hours_overrides.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = working_hours_overrides.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their appointments" on appointments for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = appointments.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = appointments.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

create policy "Owners and Master can manage their clients" on clients for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  exists (select 1 from barbershops where barbershops.id = clients.barbershop_id and (barbershops.owner_id = auth.uid() or barbershops.owner_email = auth.jwt() ->> 'email')) or
  exists (select 1 from partner_access where partner_access.barbershop_id = clients.barbershop_id and (partner_access.user_id = auth.uid() or partner_access.email = auth.jwt() ->> 'email'))
);

-- Clients can create appointments
create policy "Anyone can create a client" on clients for insert with check (true);
create policy "Anyone can create an appointment" on appointments for insert with check (true);
create policy "Clients can view their own appointments" on appointments for select using (true);

create policy "Users and Master can manage profiles" on profiles for all using (
  auth.uid() = user_id or
  (email = auth.jwt() ->> 'email' and user_id is null) or
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com')
);

create policy "Master and Partners can manage partner_access" on partner_access for all using (
  (auth.jwt() ->> 'email' = 'mateusaparecidoferreira@outlook.com' or auth.jwt() ->> 'email' = 'fast01light@gmail.com') or
  auth.uid() = user_id or
  email = auth.jwt() ->> 'email'
);
