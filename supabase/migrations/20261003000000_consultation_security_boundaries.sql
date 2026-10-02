create or replace function public.is_active_account()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

-- Restrictive policies compose with existing participant policies (AND, not OR).
create policy "active accounts access consultations" on public.consultations
as restrictive for all to authenticated
using (public.is_active_account()) with check (public.is_active_account());
create policy "active accounts access messages" on public.consultation_messages
as restrictive for all to authenticated
using (public.is_active_account()) with check (public.is_active_account());
create policy "active accounts access ratings" on public.consultation_ratings
as restrictive for all to authenticated
using (public.is_active_account()) with check (public.is_active_account());
create policy "active accounts access payments" on public.consultation_payments
as restrictive for all to authenticated
using (public.is_active_account()) with check (public.is_active_account());
create policy "active accounts access private consultation files" on storage.objects
as restrictive for all to authenticated
using (bucket_id <> 'consultation-attachments' or public.is_active_account())
with check (bucket_id <> 'consultation-attachments' or public.is_active_account());

drop policy "patients create consultations" on public.consultations;
create policy "patients create consultations" on public.consultations
for insert to authenticated with check (
  patient_id = auth.uid() and doctor_id is null and status = 'open' and closed_at is null
);

create or replace function public.guard_consultation_changes()
returns trigger language plpgsql set search_path = public
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then return new; end if;
  if new.id is distinct from old.id or new.patient_id is distinct from old.patient_id or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'consultation ownership is immutable';
  end if;
  if not public.is_medical_admin() and (
    new.doctor_id is distinct from old.doctor_id
    or new.specialty_id is distinct from old.specialty_id
    or new.subject is distinct from old.subject
    or new.body is distinct from old.body
    or new.emergency_flag is distinct from old.emergency_flag
  ) then
    raise exception using errcode = '42501', message = 'provider cannot rewrite or reassign patient submissions';
  end if;
  new.closed_at := case when new.status = 'closed' then coalesce(old.closed_at, now()) else null end;
  return new;
end;
$$;
create trigger consultation_changes_guard before update on public.consultations
for each row execute function public.guard_consultation_changes();

create policy "closed consultations reject new messages" on public.consultation_messages
as restrictive for insert to authenticated with check (
  exists (select 1 from public.consultations c where c.id = consultation_id and c.status <> 'closed')
);

drop policy "patient updates own rating" on public.consultation_ratings;
create policy "patient updates own rating" on public.consultation_ratings
for update to authenticated using (patient_id = auth.uid()) with check (
  patient_id = auth.uid() and exists (
    select 1 from public.consultations c where c.id = consultation_id
    and c.patient_id = auth.uid() and c.status in ('answered', 'closed')
  )
);

grant execute on function public.is_active_account() to authenticated;
