-- Providers must be able to see their own linked doctor row even before publication.
-- Consultation RLS relies on this relationship to identify the assigned doctor.
-- This policy exposes only the row whose provider_user_id matches auth.uid().

create policy "provider reads own doctor profile"
on public.doctors
for select
to authenticated
using (provider_user_id = auth.uid());
