create policy "players read own active access grant"
on public.game_access_grants
for select
to authenticated
using (user_id = auth.uid() and expires_at > now());
