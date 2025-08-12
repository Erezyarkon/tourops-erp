-- === tourops-erp-full: Supabase schema (with sample data) ===
-- enable UUID if needed
-- create extension if not exists "uuid-ossp";

-- PROFILES / ROLES (maps to auth.users)
create table if not exists profiles (
  id uuid primary key,                 -- references auth.users.id
  full_name text,
  role text check (role in ('admin','sales','ops','finance')) default 'sales',
  created_at timestamptz default now()
);
alter table profiles enable row level security;

-- basic RLS: user sees own profile; admins see all (policy example)
create policy "read own profile" on profiles
for select using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- CORE ENTITIES
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null, -- hotel|bus|car_rental|tour|attraction|meal|addon|flight|transfer
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id) on delete cascade,
  name text not null,
  type text, -- room type / tour code / vehicle etc.
  description text,
  created_at timestamptz default now()
);

create table if not exists rate_cards (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  season text,
  min_group_size int,
  max_group_size int,
  price_per_person numeric,
  price_per_group numeric,
  free_pax_per_group int default 0,
  vehicle_capacity int, -- for buses/private
  night_surcharge numeric,
  distance_surcharge numeric,
  extra_hour numeric,
  currency text default 'USD',
  notes text,
  created_at timestamptz default now()
);

-- QUOTES & ITEMS
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  title text,
  destination text,
  start_date date,
  end_date date,
  group_size int not null,
  buses_capacity int default 50,
  markup_type text check (markup_type in ('percent','amount')) default 'percent',
  markup_value numeric default 0,
  status text default 'draft',
  language text default 'en',
  created_by uuid, -- profiles.id
  created_at timestamptz default now()
);

create table if not exists quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  service_type text not null,
  title text,
  cost_per_person numeric,
  cost_per_group numeric,
  free_pax int default 0,
  start_date date,
  end_date date,
  notes text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- BOOKINGS
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  title text,
  start_date date,
  end_date date,
  pax int,
  status text check (status in ('pending','confirmed','cancelled')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists booking_items (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  service_type text,
  title text,
  quantity int default 1,
  unit_price numeric,
  total_price numeric,
  currency text default 'USD',
  notes text,
  created_at timestamptz default now()
);

-- PASSENGERS
create table if not exists passengers (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text default 'pax', -- pax|guide|driver etc.
  created_at timestamptz default now()
);

create table if not exists rooming (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  room_code text, -- e.g., "DBL-101"
  capacity int default 2
);

create table if not exists rooming_assignments (
  id uuid primary key default uuid_generate_v4(),
  rooming_id uuid references rooming(id) on delete cascade,
  passenger_id uuid references passengers(id) on delete cascade
);

-- TOURS (PRIVATE & DAILY)
create table if not exists tours_private (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  default_pickup_time text,
  default_pickup_location text,
  vehicle_size text, -- sedan|van|minibus|bus
  base_hours int default 8,
  created_at timestamptz default now()
);

create table if not exists tours_daily (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  language text, -- en|he|... per run
  weekdays text, -- CSV e.g. "Mon,Tue,Thu"
  level text,    -- basic/premium
  created_at timestamptz default now()
);

create table if not exists pickup_points (
  id uuid primary key default uuid_generate_v4(),
  tour_daily_id uuid references tours_daily(id) on delete cascade,
  name text,
  time text
);

-- FINANCE
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete set null,
  number text,
  issue_date date default current_date,
  total numeric,
  currency text default 'USD',
  type text default 'tax', -- tax|proforma|manual
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete set null,
  amount numeric,
  currency text default 'USD',
  method text, -- card|bank|cash|paypal
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists subsidies (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  sponsor text,
  amount numeric,
  notes text,
  created_at timestamptz default now()
);

-- SAMPLE DATA
insert into customers (name, email, phone) values
  ('EM Travel Group', 'em@example.com', '+972-50-0000000')
on conflict do nothing;

insert into suppliers (name, category, contact_name, email, phone) values
  ('Jeru Grand Hotel', 'hotel', 'Dana', 'sales@jerugrand.example', '+972-2-5550001'),
  ('Tel-Aviv Coach Co.', 'bus', 'Avi', 'ops@tacoach.example', '+972-3-5550002'),
  ('Galilee Tours', 'tour', 'Neta', 'info@galileetours.example', '+972-4-5550003'),
  ('Masada Tickets', 'attraction', 'Omer', 'tickets@masada.example', '+972-8-5550004')
on conflict do nothing;

-- products
insert into products (supplier_id, name, type, description)
select id, 'DBL HB', 'room', 'Half-board double' from suppliers where name='Jeru Grand Hotel' limit 1;
insert into products (supplier_id, name, type, description)
select id, '50-seater coach', 'vehicle', 'Coach bus' from suppliers where name='Tel-Aviv Coach Co.' limit 1;

-- rate cards
insert into rate_cards (supplier_id, product_id, season, min_group_size, max_group_size, price_per_person, price_per_group, free_pax_per_group, vehicle_capacity, currency, notes)
select s.id, p.id, 'All Year', 1, 999, 85, null, 1, null, 'USD', '1 free per 20 pax applies'
from suppliers s join products p on p.supplier_id=s.id where s.name='Jeru Grand Hotel' and p.name='DBL HB' limit 1;

insert into rate_cards (supplier_id, product_id, season, min_group_size, max_group_size, price_per_person, price_per_group, free_pax_per_group, vehicle_capacity, currency, notes)
select s.id, p.id, 'All Year', 1, 999, null, 950, 0, 50, 'USD', null
from suppliers s join products p on p.supplier_id=s.id where s.name='Tel-Aviv Coach Co.' and p.name='50-seater coach' limit 1;

-- demo quote
with c as (select id from customers where name='EM Travel Group' limit 1)
insert into quotes (customer_id, title, destination, start_date, end_date, group_size, buses_capacity, markup_type, markup_value, status, language)
select c.id, 'Israel Highlights', 'Israel', current_date + 14, current_date + 20, 40, 50, 'percent', 12, 'draft', 'en' from c
on conflict do nothing;

with q as (select id from quotes where title='Israel Highlights' limit 1),
     h as (select id from suppliers where name='Jeru Grand Hotel' limit 1),
     p as (select id from products where name='DBL HB' limit 1),
     b as (select id from suppliers where name='Tel-Aviv Coach Co.' limit 1),
     pb as (select id from products where name='50-seater coach' limit 1),
     t as (select id from suppliers where name='Galilee Tours' limit 1)
insert into quote_items (quote_id, supplier_id, product_id, service_type, title, cost_per_person, cost_per_group, order_index)
select q.id, h.id, p.id, 'hotel', 'Hotel DBL HB', 85, null, 0 from q,h,p
union all
select q.id, b.id, pb.id, 'bus', '50-seater coach', null, 950, 1 from q,b,pb
union all
select q.id, t.id, null, 'tour', 'Galilee Day Tour', 28, null, 2 from q,t;