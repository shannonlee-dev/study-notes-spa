-- Fresh Supabase project: a shared, publicly readable notes catalog.
-- Run with the SQL editor's database owner after reviewing this access model.
begin;

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;
grant usage on schema public to anon, authenticated;
revoke all on public.notes from anon, authenticated;
grant select on public.notes to anon, authenticated;
grant insert, update, delete on public.notes to authenticated;

create policy notes_public_read on public.notes
  for select to anon, authenticated using (true);
create policy notes_authenticated_insert on public.notes
  for insert to authenticated with check (true);
create policy notes_authenticated_update on public.notes
  for update to authenticated using (true) with check (true);
create policy notes_authenticated_delete on public.notes
  for delete to authenticated using (true);

commit;
