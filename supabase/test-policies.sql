-- Run on a disposable test database as its owner. All fixture writes roll back.
begin;
insert into public.notes (id, title, body, category) values
  ('00000000-0000-0000-0000-000000000001', 'Shared fixture', 'Body', 'Test');

set local role anon;
do $$
begin
  if not exists (select 1 from public.notes where id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Anonymous readers cannot read the shared catalog';
  end if;
  begin
    insert into public.notes (title, body, category) values ('Forbidden', 'Body', 'Test');
    raise exception 'Anonymous insert unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.notes set title = 'Forbidden' where id = '00000000-0000-0000-0000-000000000001';
    raise exception 'Anonymous update unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.notes where id = '00000000-0000-0000-0000-000000000001';
    raise exception 'Anonymous delete unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role authenticated;
do $$
declare affected uuid;
begin
  insert into public.notes (id, title, body, category) values
    ('00000000-0000-0000-0000-000000000002', 'Authenticated fixture', 'Body', 'Test')
    returning id into affected;
  if affected is null then raise exception 'Authenticated insert failed'; end if;
  update public.notes set title = 'Shared edit' where id = '00000000-0000-0000-0000-000000000001'
    returning id into affected;
  if affected is null then raise exception 'Authenticated shared update failed'; end if;
  delete from public.notes where id = '00000000-0000-0000-0000-000000000002'
    returning id into affected;
  if affected is null then raise exception 'Authenticated delete failed'; end if;
end $$;
rollback;
