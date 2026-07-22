-- Remembers a raw client name (as extracted from a handwritten timesheet)
-- once a human resolves it to a real client, so future timesheet parses
-- auto-match it without asking again.

create table if not exists client_aliases (
  id uuid primary key default gen_random_uuid(),
  raw_name text not null unique,
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table client_aliases enable row level security;

drop policy if exists "authenticated full access" on client_aliases;
create policy "authenticated full access" on client_aliases
  for all to authenticated using (true) with check (true);
