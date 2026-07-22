-- Timesheet photos: uploaded from the New Invoice tab (camera or library),
-- stored in the private "timesheets" storage bucket, tracked in this table.

create table if not exists timesheets (
  id uuid primary key default gen_random_uuid(),
  photo_path text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table timesheets enable row level security;

drop policy if exists "authenticated full access" on timesheets;
create policy "authenticated full access" on timesheets
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('timesheets', 'timesheets', false)
on conflict (id) do nothing;

drop policy if exists "authenticated timesheets storage access" on storage.objects;
create policy "authenticated timesheets storage access" on storage.objects
  for all to authenticated
  using (bucket_id = 'timesheets')
  with check (bucket_id = 'timesheets');
