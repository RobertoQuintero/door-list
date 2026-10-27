create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types (id) on delete restrict,
  attendee_name text not null check (char_length(btrim(attendee_name)) between 1 and 120),
  attendee_email text not null check (char_length(btrim(attendee_email)) between 3 and 320),
  created_at timestamptz not null default now()
);

create index registrations_ticket_type_id_idx on public.registrations (ticket_type_id);
create index registrations_event_id_idx on public.registrations (event_id);
create unique index registrations_event_email_idx
  on public.registrations (event_id, lower(attendee_email));

alter table public.registrations enable row level security;

-- Attendees never access registrations directly. The narrowly-scoped functions
-- below are the only public interface for availability and registration.
revoke all on table public.registrations from anon, authenticated;

create or replace function public.get_public_event_registration(p_event_id uuid)
returns table (
  event_id uuid,
  title text,
  description text,
  starts_at timestamptz,
  place text,
  ticket_type_id uuid,
  ticket_name text,
  ticket_capacity integer,
  registered_count integer,
  remaining_capacity integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.title,
    e.description,
    e.starts_at,
    e.place,
    tt.id,
    tt.name,
    tt.max_capacity,
    count(r.id)::integer,
    coalesce(tt.max_capacity - count(r.id)::integer, 0)
  from public.events e
  left join public.ticket_types tt on tt.event_id = e.id
  left join public.registrations r on r.ticket_type_id = tt.id
  where e.id = p_event_id
    and e.status = 'published'
    -- Registration remains open for the entire event date in the product's
    -- operating timezone, including after the event start time.
    and (e.starts_at at time zone 'America/Mexico_City')::date
      >= (now() at time zone 'America/Mexico_City')::date
  group by e.id, tt.id
  order by tt.created_at nulls last;
$$;

create or replace function public.create_public_registration(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_attendee_name text,
  p_attendee_email text
)
returns table (outcome text, registration_id uuid)
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
  v_registered_count integer;
begin
  if char_length(v_name) not between 1 and 120 then
    return query select 'invalid_name'::text, null::uuid;
    return;
  end if;

  if char_length(v_email) not between 3 and 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return query select 'invalid_email'::text, null::uuid;
    return;
  end if;

  -- Lock the event and then its selected ticket type. This serializes a
  -- registration with event/ticket updates and avoids overselling the last seat.
  select * into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found
    or v_event.status <> 'published'
    or (v_event.starts_at at time zone 'America/Mexico_City')::date
      < (now() at time zone 'America/Mexico_City')::date then
    return query select 'event_not_available'::text, null::uuid;
    return;
  end if;

  select * into v_ticket
  from public.ticket_types
  where id = p_ticket_type_id
    and event_id = v_event.id
  for update;

  if not found then
    return query select 'ticket_not_found'::text, null::uuid;
    return;
  end if;

  select count(*)::integer into v_registered_count
  from public.registrations
  where ticket_type_id = v_ticket.id;

  if v_registered_count >= v_ticket.max_capacity then
    return query select 'ticket_sold_out'::text, null::uuid;
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
    return query select 'duplicate_registration'::text, null::uuid;
    return;
  end if;

  return query select 'success'::text, v_registration_id;
end;
$$;

revoke all on function public.get_public_event_registration(uuid) from public;
revoke all on function public.create_public_registration(uuid, uuid, text, text) from public;
grant execute on function public.get_public_event_registration(uuid) to anon, authenticated;
grant execute on function public.create_public_registration(uuid, uuid, text, text) to anon, authenticated;
