-- QuietZone — Initial Schema Migration
-- Phase 1: Scaffold only.
-- Phase 3: Create noise_logs table and RLS policies.
-- All schema changes must go through versioned migration files — never dashboard-only.

create table if not exists noise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  latitude double precision not null,
  longitude double precision not null,
  source text not null,
  disruption_score smallint not null check (disruption_score between 1 and 10),
  description text not null,
  audio_path text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table noise_logs enable row level security;

-- Policies
create policy "Public can select noise_logs" 
on noise_logs for select 
to authenticated 
using (true);

-- Storage bucket for audio recordings
insert into storage.buckets (id, name, public) 
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do nothing;

-- (RLS is already enabled by default on storage.objects in Supabase)

-- Storage Policies
create policy "Users can only access their own audio"
on storage.objects for select
to authenticated
using ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can upload their own audio"
on storage.objects for insert
to authenticated
with check ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own audio"
on storage.objects for update
to authenticated
using ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own audio"
on storage.objects for delete
to authenticated
using ( auth.uid()::text = (storage.foldername(name))[1] );
