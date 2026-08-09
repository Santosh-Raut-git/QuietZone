-- QuietZone Pro Phase
-- Monetization, Entitlements, and Predictive Analytics

create table if not exists user_entitlements (
  user_id uuid references auth.users primary key,
  is_pro boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table user_entitlements enable row level security;

-- Users can read their own entitlements
create policy "Users can read own entitlements"
on user_entitlements for select
to authenticated
using (auth.uid() = user_id);

-- RPC for Predictive Filtering
-- Gated exclusively to Pro users
CREATE OR REPLACE FUNCTION get_predictive_noise(target_day INT, target_hour INT)
RETURNS TABLE (
  id uuid,
  latitude double precision,
  longitude double precision,
  source text,
  disruption_score smallint,
  description text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_user_pro BOOLEAN;
BEGIN
  -- Check if user is Pro
  SELECT is_pro INTO is_user_pro 
  FROM user_entitlements 
  WHERE user_id = auth.uid();

  IF is_user_pro IS NOT TRUE THEN
    RAISE EXCEPTION 'QuietZone Pro subscription required for predictive filtering.';
  END IF;

  -- Return historical noise logs matching the day of week (0-6) and hour (0-23)
  -- For a real production app, this would cluster and average scores spatially.
  RETURN QUERY
  SELECT 
    n.id, n.latitude, n.longitude, n.source, n.disruption_score, n.description, n.created_at
  FROM noise_logs n
  WHERE EXTRACT(DOW FROM n.created_at) = target_day
    AND EXTRACT(HOUR FROM n.created_at) = target_hour
  ORDER BY n.created_at DESC
  LIMIT 100;
END;
$$;
