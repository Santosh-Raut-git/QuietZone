-- Add INSERT and DELETE policies for noise_logs

create policy "Users can insert their own noise_logs"
on noise_logs for insert
to authenticated
with check ( auth.uid() = user_id );

create policy "Users can delete their own noise_logs"
on noise_logs for delete
to authenticated
using ( auth.uid() = user_id );
