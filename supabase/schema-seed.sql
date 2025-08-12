-- TourOps ERP • Full Setup + Demo Seed (MVP)
-- Safe/idempotent. Run in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE resource_type AS ENUM ('vehicle','guide','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE markup_type   AS ENUM ('percent','fixed');          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','draft'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('draft','sent','paid','void'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('paypal','credit_card','wire','cash'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  company_email text,
  company_phone text,
  company_address text,
  logo_url text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid primary key default gen_random_uuid(),
  first_name text, last_name text, full_name text,
  email text, phone text, country text, notes text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid primary key default gen_random_uuid(),
  name text, category text, contact_name text,
  phone text, email text, address text, notes text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS rate_cards (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  product_name text, service_type text,
  season_name text, season_start date, season_end date,
  min_group_size int, max_group_size int,
  price_per_person numeric, price_per_group numeric,
  free_passengers_ratio int, bus_capacity int,
  extra_hour_cost numeric, overnight_cost numeric,
  currency text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid primary key default gen_random_uuid(),
  type resource_type, name text, contact text, capacity int, notes text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS trips (
  id uuid primary key default gen_random_uuid(),
  title text, start_date date, end_date date, customer_name text, status text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  quote_number text, group_name text, destination text,
  start_date date, end_date date, group_size int,
  markup_type markup_type, markup_value numeric,
  status text, valid_until date, notes text,
  final_price_total numeric, final_price_per_person numeric,
  created_at timestamptz not null default now(), updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  service_type text, item_name text, description text,
  cost_per_person numeric, cost_per_group numeric,
  pricing_type text, quantity int,
  free_passengers int, buses_needed int, days_included int,
  order_index int, created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete set null,
  supplier text, currency text, due_date timestamptz,
  status booking_status, notes text,
  quote_id uuid references quotes(id) on delete set null,
  booking_number text,
  total_amount numeric, paid_amount numeric, payment_status text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  first_name text, last_name text, passport_number text,
  date_of_birth date, nationality text, room_type text, special_requests text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS allocations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  resource_id uuid references resources(id) on delete set null,
  start_time timestamptz, end_time timestamptz, notes text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS daily_tours (
  id uuid primary key default gen_random_uuid(),
  name text, description text,
  departure_time time, return_time time, duration_hours int,
  adult_price numeric, child_price numeric, infant_price numeric,
  min_participants int, max_participants int,
  operating_days int[], pickup_points text[],
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS private_tours (
  id uuid primary key default gen_random_uuid(),
  name text, description text, duration_hours int,
  max_passengers int, base_price numeric, price_per_extra_hour numeric,
  overnight_supplement numeric, pickup_points text,
  included_services text, excluded_services text, languages text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS client_intakes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  requested_start date, requested_end date, pax int,
  notes text, status text, created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references client_intakes(id) on delete cascade,
  type text, supplier_id uuid references suppliers(id) on delete set null,
  title text, quantity int, start_date date, end_date date,
  price numeric, currency text, notes text, order_index int,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete set null,
  total numeric, currency text, status invoice_status,
  issued_at timestamptz, provider text, provider_ref text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete set null,
  amount numeric, method payment_method, provider_ref text,
  paid_at timestamptz, booking_id uuid references bookings(id) on delete set null,
  payment_method text, currency text, transaction_id text,
  created_at timestamptz not null default now()
);

-- Seed
INSERT INTO company_settings (company_name, company_email, company_phone, company_address, logo_url)
SELECT * FROM (VALUES ('Tourops Ltd','ops@tourops.example','+972-3-555-0000','Tel Aviv, IL', NULL)) v
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

INSERT INTO customers (first_name,last_name,full_name,email,phone,country,notes)
SELECT * FROM (
  VALUES
  ('Erez','Mizrahi','Erez Mizrahi','erez@example.com','+972-50-0000000','Israel','VIP / Hebrew'),
  ('Sarah','Levi','Sarah Levi','sarah.levi@example.com','+972-52-1111111','Israel','Gluten free'),
  ('David','Cohen','David Cohen','david.cohen@example.com','+1-555-2000','USA','Wheelchair')
) v
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.email=v.email);

INSERT INTO suppliers (name,category,contact_name,phone,email,address,notes)
SELECT * FROM (
  VALUES
  ('Jerusalem Grand Hotel','hotel','Yael Levi','+972-2-5551111','sales@jghotel.example','Jerusalem','1 free / 20'),
  ('Dead Sea Resort & Spa','hotel','Avi Bar','+972-8-5552222','sales@dsresort.example','Ein Bokek','1 free / 20'),
  ('Tel Aviv Coach Co.','bus','Moshe Azulay','+972-3-5553333','ops@tacc.example','Tel Aviv','50-seat coach'),
  ('Galilee Tours Ltd','tour','Ruth Ben-Ami','+972-4-5554444','info@galileetours.example','Tiberias', NULL),
  ('Mediterranean Flavors','meal','Sarit Mizrahi','+972-3-5555555','orders@medflavors.example','Tel Aviv', NULL)
) v
WHERE NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.name=v.name);

INSERT INTO rate_cards (supplier_id,product_name,service_type,season_name,season_start,season_end,min_group_size,max_group_size,price_per_person,price_per_group,free_passengers_ratio,bus_capacity,extra_hour_cost,overnight_cost,currency)
SELECT (SELECT id FROM suppliers WHERE name='Jerusalem Grand Hotel' LIMIT 1),'DBL HB','hotel','All Year',DATE '2025-01-01',DATE '2025-12-31',1,200,120,NULL,20,NULL,NULL,NULL,'USD'
WHERE NOT EXISTS (SELECT 1 FROM rate_cards r JOIN suppliers s ON s.id=r.supplier_id WHERE s.name='Jerusalem Grand Hotel' AND r.product_name='DBL HB');

INSERT INTO rate_cards (supplier_id,product_name,service_type,season_name,season_start,season_end,min_group_size,max_group_size,price_per_person,price_per_group,free_passengers_ratio,bus_capacity,extra_hour_cost,overnight_cost,currency)
SELECT (SELECT id FROM suppliers WHERE name='Dead Sea Resort & Spa' LIMIT 1),'DBL BB','hotel','All Year',DATE '2025-01-01',DATE '2025-12-31',1,200,140,NULL,20,NULL,NULL,NULL,'USD'
WHERE NOT EXISTS (SELECT 1 FROM rate_cards r JOIN suppliers s ON s.id=r.supplier_id WHERE s.name='Dead Sea Resort & Spa' AND r.product_name='DBL BB');

INSERT INTO rate_cards (supplier_id,product_name,service_type,season_name,season_start,season_end,min_group_size,max_group_size,price_per_person,price_per_group,free_passengers_ratio,bus_capacity,extra_hour_cost,overnight_cost,currency)
SELECT (SELECT id FROM suppliers WHERE name='Tel Aviv Coach Co.' LIMIT 1),'50-seater coach','bus','All Year',DATE '2025-01-01',DATE '2025-12-31',1,200,NULL,1500,NULL,50,120,200,'USD'
WHERE NOT EXISTS (SELECT 1 FROM rate_cards r JOIN suppliers s ON s.id=r.supplier_id WHERE s.name='Tel Aviv Coach Co.' AND r.product_name='50-seater coach');

INSERT INTO resources (type,name,contact,capacity,notes)
SELECT 'vehicle'::resource_type,'Coach #1 (50 seats)','dispatch@tacc.example | +972-3-5553333',50,'AC, microphone'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name='Coach #1 (50 seats)');

INSERT INTO resources (type,name,contact,capacity,notes)
SELECT 'guide'::resource_type,'Amit Goldberg','amit.guide@example.com | +972-52-7000001',35,'EN/HE multilingual'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name='Amit Goldberg');

INSERT INTO trips (title,start_date,end_date,customer_name,status)
SELECT * FROM (VALUES ('Jerusalem & Dead Sea – EM Group',DATE '2025-05-01',DATE '2025-05-07','Erez Mizrahi','planning')) v
WHERE NOT EXISTS (SELECT 1 FROM trips t WHERE t.title=v.title AND t.start_date=v.start_date);

WITH c AS (SELECT id FROM customers WHERE email='erez@example.com' LIMIT 1)
INSERT INTO quotes (customer_id,quote_number,group_name,destination,start_date,end_date,group_size,markup_type,markup_value,status,valid_until,notes)
SELECT (SELECT id FROM c),'Q-2025-001','EM Travel Group','Israel',DATE '2025-05-01',DATE '2025-05-07',40,'percent'::markup_type,12,'draft',DATE '2025-03-31','1 free per 20'
WHERE NOT EXISTS (SELECT 1 FROM quotes q WHERE q.quote_number='Q-2025-001');

WITH q1 AS (SELECT id,group_size FROM quotes WHERE quote_number='Q-2025-001' LIMIT 1),
     s1 AS (SELECT id FROM suppliers WHERE name='Jerusalem Grand Hotel' LIMIT 1),
     s2 AS (SELECT id FROM suppliers WHERE name='Dead Sea Resort & Spa' LIMIT 1),
     sb AS (SELECT id FROM suppliers WHERE name='Tel Aviv Coach Co.' LIMIT 1)
INSERT INTO quote_items (quote_id,supplier_id,service_type,item_name,description,cost_per_person,cost_per_group,pricing_type,quantity,free_passengers,buses_needed,days_included,order_index)
SELECT * FROM (
  VALUES
  ((SELECT id FROM q1),(SELECT id FROM s1),'hotel','Jerusalem Grand DBL HB','3 nights HB',120,NULL,'per_pax',40, FLOOR(40/20), NULL, 3, 1),
  ((SELECT id FROM q1),(SELECT id FROM s2),'hotel','Dead Sea Resort DBL BB','2 nights BB',140,NULL,'per_pax',40, FLOOR(40/20), NULL, 2, 2),
  ((SELECT id FROM q1),(SELECT id FROM sb),'bus','50-seater coach','Bus for itinerary',NULL,1500,'per_group',1,0,5,3,3)
) v
WHERE v.quote_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quote_items qi WHERE qi.quote_id=v.quote_id AND qi.item_name=v.item_name);

UPDATE quotes q SET
  final_price_total = ROUND((sub.net * (1 + COALESCE(q.markup_value,0)/100.0))::numeric,2),
  final_price_per_person = ROUND(((sub.net / NULLIF(q.group_size,0)) * (1 + COALESCE(q.markup_value,0)/100.0))::numeric,2),
  updated_at = now()
FROM (
  SELECT qi.quote_id,
         SUM(COALESCE(qi.cost_per_group,0)*COALESCE(qi.quantity,1) +
             COALESCE(qi.cost_per_person,0)* (CASE WHEN qi.service_type='hotel' THEN GREATEST(q.group_size - FLOOR(q.group_size/20),0) ELSE q.group_size END)
         ) AS net
  FROM quote_items qi JOIN quotes q ON q.id=qi.quote_id
  GROUP BY qi.quote_id, q.group_size
) sub
WHERE q.id=sub.quote_id;

WITH q AS (SELECT * FROM quotes WHERE quote_number='Q-2025-001' LIMIT 1)
INSERT INTO bookings (trip_id,supplier,currency,due_date,status,notes,quote_id,booking_number,total_amount,paid_amount,payment_status)
SELECT NULL,NULL,'USD',(q.start_date)::timestamptz,'pending'::booking_status,'Auto-created from Q-2025-001',q.id,'BKG-2025-001',q.final_price_total,0,'unpaid'
FROM q WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.booking_number='BKG-2025-001');

SELECT 'OK' as status;
