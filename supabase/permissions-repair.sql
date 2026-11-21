-- Run once in Supabase SQL Editor if the app reports:
-- permission denied for table profiles
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant select, insert, update on public.shared_workspace to authenticated;
grant execute on function public.pin_session_active() to authenticated;
notify pgrst, 'reload schema';
