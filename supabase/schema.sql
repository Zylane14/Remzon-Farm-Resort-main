-- Remzon's Farm & Resort — booking system schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  space text not null,
  stay text not null,
  date date not null,
  guests int,
  name text,
  phone text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  source text not null default 'website'
    check (source in ('website', 'manual'))
);

create index bookings_confirmed_dates on public.bookings (space, date)
  where status = 'confirmed';

alter table public.bookings enable row level security;

-- Visitors may only create pending website requests. They can never read,
-- change, or delete rows, so guest names and numbers stay private.
create policy "anon submits pending requests" on public.bookings
  for insert to anon
  with check (status = 'pending' and source = 'website');

-- Logged-in admins (the family account) can do everything.
create policy "admins manage bookings" on public.bookings
  for all to authenticated
  using (true) with check (true);

-- Availability check for the public booking form. Security definer lets it
-- bypass row security, but it only ever returns dates - no guest details.
create or replace function public.taken_dates(space_filter text, from_date date, to_date date)
returns table (taken date)
language sql
security definer
set search_path = public
stable
as $$
  select distinct date from public.bookings
  where status = 'confirmed'
    and space = space_filter
    and date between from_date and to_date;
$$;

grant execute on function public.taken_dates to anon, authenticated;
