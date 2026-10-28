-- Organizer reporting is exposed only through owner-scoped functions. Direct
-- access to registrations and tickets remains revoked for browser clients.
create or replace function public.get_organizer_events()
returns table (
  event_id uuid,
  title text,
  starts_at timestamptz,
  place text,
  max_capacity integer,
  registered_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.title,
    e.starts_at,
    e.place,
    e.max_capacity,
    count(r.id)::integer
  from public.events e
  left join public.registrations r on r.event_id = e.id
  where e.created_by = (select auth.uid())
    and e.status = 'published'
  group by e.id
  order by e.starts_at;
$$;

create or replace function public.get_organizer_event_dashboard(p_event_id uuid)
returns table (
  event_id uuid,
  event_title text,
  event_starts_at timestamptz,
  event_place text,
  event_max_capacity integer,
  ticket_type_id uuid,
  ticket_type_name text,
  ticket_type_capacity integer,
  registered_count integer,
  registration_id uuid,
  attendee_name text,
  attendee_email text,
  registered_at timestamptz,
  ticket_code text,
  ticket_status public.ticket_status
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.title,
    e.starts_at,
    e.place,
    e.max_capacity,
    tt.id,
    tt.name,
    tt.max_capacity,
    count(r.id) over (partition by tt.id)::integer,
    r.id,
    r.attendee_name,
    r.attendee_email,
    r.created_at,
    t.code,
    t.status
  from public.events e
  left join public.ticket_types tt on tt.event_id = e.id
  left join public.registrations r on r.ticket_type_id = tt.id
  left join public.tickets t on t.registration_id = r.id
  where e.id = p_event_id
    and e.created_by = (select auth.uid())
    and e.status = 'published'
  order by tt.created_at nulls last, r.created_at nulls last;
$$;

revoke all on function public.get_organizer_events() from public;
revoke all on function public.get_organizer_event_dashboard(uuid) from public;
grant execute on function public.get_organizer_events() to authenticated;
grant execute on function public.get_organizer_event_dashboard(uuid) to authenticated;
