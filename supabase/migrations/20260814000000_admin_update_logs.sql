-- Add Admin policy to noise_logs so admins can update any log
CREATE POLICY "Admins can update any noise_logs"
  ON noise_logs FOR UPDATE
  USING ( public.is_admin() );
