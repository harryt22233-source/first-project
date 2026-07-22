-- Draft jobs parsed from timesheet photos.
-- Jobs from a timesheet may not yet be linked to a confirmed client, so
-- client_id becomes nullable; client_name_raw holds the extracted text
-- until a human confirms/links it.

alter table jobs alter column client_id drop not null;

alter table jobs add column if not exists timesheet_id uuid references timesheets(id) on delete set null;
alter table jobs add column if not exists client_name_raw text;
alter table jobs add column if not exists materials jsonb not null default '[]'::jsonb;
alter table jobs add column if not exists suggested_amount numeric;
alter table jobs add column if not exists field_confidence jsonb not null default '{}'::jsonb;

alter table timesheets add column if not exists error_message text;
