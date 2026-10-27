-- Capacity is owned by the event. Ticket type capacities may use only that pool.
alter table public.events
add column max_capacity integer not null default 1 check (max_capacity > 0);

create or replace function public.enforce_ticket_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  event_capacity integer;
  allocated_capacity integer;
begin
  select max_capacity into event_capacity
  from public.events
  where id = new.event_id
  for update;

  select coalesce(sum(max_capacity), 0) into allocated_capacity
  from public.ticket_types
  where event_id = new.event_id
    and id is distinct from new.id;

  if allocated_capacity + new.max_capacity > event_capacity then
    raise exception 'The ticket capacities exceed the event capacity'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_ticket_capacity_before_write
before insert or update of event_id, max_capacity on public.ticket_types
for each row execute function public.enforce_ticket_capacity();

create or replace function public.enforce_event_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allocated_capacity integer;
begin
  select coalesce(sum(max_capacity), 0) into allocated_capacity
  from public.ticket_types
  where event_id = new.id;

  if allocated_capacity > new.max_capacity then
    raise exception 'The event capacity cannot be lower than allocated ticket capacity'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_event_capacity_before_update
before update of max_capacity on public.events
for each row execute function public.enforce_event_capacity();
