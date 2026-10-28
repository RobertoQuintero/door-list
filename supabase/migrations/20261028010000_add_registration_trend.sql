create index registrations_event_created_at_idx
on public.registrations (event_id, created_at);

create or replace function public.get_organizer_registration_trend(p_event_id uuid)
returns table (
  registration_date date,
  registration_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    registration_day.day::date,
    count(r.id)::integer
  from public.events e
  cross join lateral generate_series(
    (e.created_at at time zone 'America/Mexico_City')::date,
    (now() at time zone 'America/Mexico_City')::date,
    interval '1 day'
  ) as registration_day(day)
  left join public.registrations r
    on r.event_id = e.id
    and r.created_at >= (registration_day.day::date::timestamp at time zone 'America/Mexico_City')
    and r.created_at < ((registration_day.day::date + 1)::timestamp at time zone 'America/Mexico_City')
  where e.id = p_event_id
    and e.created_by = (select auth.uid())
    and e.status = 'published'
  group by registration_day.day
  order by registration_day.day;
$$;

revoke all on function public.get_organizer_registration_trend(uuid) from public;
grant execute on function public.get_organizer_registration_trend(uuid) to authenticated;
