create or replace function public.create_public_registration(
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

  select t.code into v_ticket_code
  from public.tickets as t
  where t.registration_id = v_registration_id;

  return query select 'success'::text, v_registration_id, v_ticket_code;
end;
$$;

revoke all on function public.create_public_registration(uuid, uuid, text, text) from public;
grant execute on function public.create_public_registration(uuid, uuid, text, text) to anon, authenticated;
