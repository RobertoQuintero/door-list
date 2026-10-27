create type public.event_status as enum ('published', 'deleted');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  description text,
  starts_at timestamptz not null,
  place text not null check (length(btrim(place)) > 0),
  status public.event_status not null default 'published',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint events_deleted_at_matches_status check (
    (status = 'published' and deleted_at is null)
    or (status = 'deleted' and deleted_at is not null)
  )
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  max_capacity integer not null check (max_capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_status_starts_at_idx on public.events (status, starts_at);
create index events_created_by_idx on public.events (created_by);
create index ticket_types_event_id_idx on public.ticket_types (event_id);
create unique index ticket_types_event_id_name_idx
  on public.ticket_types (event_id, lower(name));

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_ticket_types_updated_at
before update on public.ticket_types
for each row execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;

grant select on public.events, public.ticket_types to anon, authenticated;
grant insert, update, delete on public.events, public.ticket_types to authenticated;

create policy "Published events are publicly readable"
on public.events
for select
using (status = 'published' or created_by = auth.uid());

create policy "Authenticated users create their own events"
on public.events
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Creators update their own events"
on public.events
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Ticket types of published events are publicly readable"
on public.ticket_types
for select
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and (events.status = 'published' or events.created_by = auth.uid())
  )
);

create policy "Event creators add ticket types"
on public.ticket_types
for insert
to authenticated
with check (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.created_by = auth.uid()
  )
);

create policy "Event creators update ticket types"
on public.ticket_types
for update
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.created_by = auth.uid()
  )
);

create policy "Event creators delete ticket types"
on public.ticket_types
for delete
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.created_by = auth.uid()
  )
);
