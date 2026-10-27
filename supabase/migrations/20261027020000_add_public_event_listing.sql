create or replace function public.get_public_events()
returns table (
  event_id uuid,
  title text,
  description text,
  starts_at timestamptz,
  place text,
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
    sum(greatest(tt.max_capacity - (
      select count(*)::integer
      from public.registrations r
      where r.ticket_type_id = tt.id
    ), 0))::integer
  from public.events e
  join public.ticket_types tt on tt.event_id = e.id
  where e.status = 'published'
    and (e.starts_at at time zone 'America/Mexico_City')::date
      >= (now() at time zone 'America/Mexico_City')::date
  group by e.id
  having sum(greatest(tt.max_capacity - (
    select count(*)::integer
    from public.registrations r
    where r.ticket_type_id = tt.id
  ), 0)) > 0
  order by e.starts_at;
$$;

revoke all on function public.get_public_events() from public;
grant execute on function public.get_public_events() to anon, authenticated;
