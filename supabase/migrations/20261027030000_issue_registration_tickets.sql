create type public.ticket_status as enum ('valid', 'used', 'revoked');

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations (id) on delete cascade,
  code text not null unique check (code ~ '^[0-9a-f]{64}$'),
  status public.ticket_status not null default 'valid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tickets_status_idx on public.tickets (status);

alter table public.tickets enable row level security;
revoke all on table public.tickets from anon, authenticated;

create trigger set_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

create or replace function public.issue_ticket_for_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.tickets (registration_id, code)
  values (new.id, encode(extensions.gen_random_bytes(32), 'hex'));
  return new;
end;
$$;

create trigger issue_ticket_after_registration
after insert on public.registrations
for each row execute function public.issue_ticket_for_registration();

-- Issue tickets for registrations created before this migration.
insert into public.tickets (registration_id, code)
select r.id, encode(extensions.gen_random_bytes(32), 'hex')
from public.registrations r
on conflict (registration_id) do nothing;

create or replace function public.get_public_ticket(p_code text)
returns table (
  ticket_code text,
  ticket_status public.ticket_status,
  attendee_name text,
  attendee_email text,
  event_title text,
  event_starts_at timestamptz,
  event_place text,
  ticket_type_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_code text := lower(btrim(coalesce(p_code, '')));
begin
  -- Reject malformed identifiers before touching the table. A valid code has
  -- 256 bits of entropy, so tickets cannot be discovered by incrementing IDs.
  if v_code !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  return query
  select
    t.code,
    t.status,
    r.attendee_name,
    r.attendee_email,
    e.title,
    e.starts_at,
    e.place,
    tt.name
  from public.tickets t
  join public.registrations r on r.id = t.registration_id
  join public.events e on e.id = r.event_id
  join public.ticket_types tt on tt.id = r.ticket_type_id
  where t.code = v_code;
end;
$$;

revoke all on function public.get_public_ticket(text) from public;
grant execute on function public.get_public_ticket(text) to anon, authenticated;

-- The registration endpoint now returns the issued ticket code so the
-- confirmation screen can link directly to the attendee's digital ticket.
drop function public.create_public_registration(uuid, uuid, text, text);

create function public.create_public_registration(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_attendee_name text,
  p_attendee_email text
)
returns table (outcome text, registration_id uuid, ticket_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_ticket public.ticket_types%rowtype;
  v_name text := btrim(coalesce(p_attendee_name, ''));
  v_email text := lower(btrim(coalesce(p_attendee_email, '')));
  v_registration_id uuid;
  v_ticket_code text;
  v_registered_count integer;
begin
  if char_length(v_name) not between 1 and 120 then
    return query select 'invalid_name'::text, null::uuid, null::text;
    return;
  end if;

  if char_length(v_email) not between 3 and 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return query select 'invalid_email'::text, null::uuid, null::text;
    return;
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found
    or v_event.status <> 'published'
    or (v_event.starts_at at time zone 'America/Mexico_City')::date
      < (now() at time zone 'America/Mexico_City')::date then
    return query select 'event_not_available'::text, null::uuid, null::text;
    return;
  end if;

  select * into v_ticket
  from public.ticket_types
  where id = p_ticket_type_id
    and event_id = v_event.id
  for update;

  if not found then
    return query select 'ticket_not_found'::text, null::uuid, null::text;
    return;
  end if;

  select count(*)::integer into v_registered_count
  from public.registrations
  where ticket_type_id = v_ticket.id;

  if v_registered_count >= v_ticket.max_capacity then
    return query select 'ticket_sold_out'::text, null::uuid, null::text;
    return;
  end if;

  insert into public.registrations (
    event_id,
    ticket_type_id,
    attendee_name,
    attendee_email
  )
  values (v_event.id, v_ticket.id, v_name, v_email)
  on conflict (event_id, lower(attendee_email)) do nothing
  returning id into v_registration_id;

  if v_registration_id is null then
    return query select 'duplicate_registration'::text, null::uuid, null::text;
    return;
  end if;

  select code into v_ticket_code
  from public.tickets
  where registration_id = v_registration_id;

  return query select 'success'::text, v_registration_id, v_ticket_code;
end;
$$;

revoke all on function public.create_public_registration(uuid, uuid, text, text) from public;
grant execute on function public.create_public_registration(uuid, uuid, text, text) to anon, authenticated;
