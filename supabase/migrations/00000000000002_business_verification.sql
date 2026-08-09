-- QuietZone - Business Verification Phase

create table if not exists verified_businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table verified_businesses enable row level security;

-- Policies

-- 1. Public can see approved businesses
create policy "Public can see approved businesses"
on verified_businesses for select
to authenticated
using (status = 'approved');

-- 2. Users can see their own applications (even pending/rejected)
create policy "Users can see own business applications"
on verified_businesses for select
to authenticated
using (auth.uid() = user_id);

-- 3. Users can submit new business applications
create policy "Users can submit business applications"
on verified_businesses for insert
to authenticated
with check (auth.uid() = user_id);
