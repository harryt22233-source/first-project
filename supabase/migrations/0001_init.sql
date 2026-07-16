-- Field service app schema: clients, jobs, invoices, settings.
-- Single-user app: any authenticated user has full access to all rows,
-- and only one row is allowed in settings.

create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  property_address text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  date date not null default current_date,
  description text,
  hours numeric,
  crew_size integer,
  source_photo_url text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete restrict,
  invoice_number text not null unique,
  line_items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  sent_date date,
  paid_date date,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default '',
  business_address text not null default '',
  business_phone text not null default '',
  hourly_rate numeric not null default 60,
  next_invoice_number integer not null default 1
);

insert into settings (id) values (1) on conflict (id) do nothing;

alter table clients enable row level security;
alter table jobs enable row level security;
alter table invoices enable row level security;
alter table settings enable row level security;

drop policy if exists "authenticated full access" on clients;
create policy "authenticated full access" on clients
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on jobs;
create policy "authenticated full access" on jobs
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on invoices;
create policy "authenticated full access" on invoices
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on settings;
create policy "authenticated full access" on settings
  for all to authenticated using (true) with check (true);

-- Atomically claims the next invoice number and advances the counter,
-- so two concurrent invoice creations can't collide on the same number.
create or replace function claim_next_invoice_number()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update settings set next_invoice_number = next_invoice_number + 1
  where id = 1
  returning next_invoice_number - 1 into n;
  return n;
end;
$$;

revoke all on function claim_next_invoice_number() from public;
grant execute on function claim_next_invoice_number() to authenticated;
