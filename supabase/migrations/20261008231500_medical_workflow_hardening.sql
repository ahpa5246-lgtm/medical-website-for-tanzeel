-- Harden medical consultation edits and message lifecycle.
-- The UI must never be the sole gate for medical data mutations.

create or replace function public.guard_doctor_consultation_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if public.is_medical_admin() then
    return new;
  end if;

  if not exists (
    select 1 from public.doctors d
    where d.id = old.doctor_id
      and d.provider_user_id = auth.uid()
  ) then
    raise exception using errcode = '42501', message = 'doctor_update_forbidden';
  end if;

  if new.patient_id is distinct from old.patient_id
    or new.doctor_id is distinct from old.doctor_id
    or new.specialty_id is distinct from old.specialty_id
    or new.subject is distinct from old.subject
    or new.body is distinct from old.body
    or new.emergency_flag is distinct from old.emergency_flag
    or new.created_at is distinct from old.created_at
  then
    raise exception using errcode = '42501', message = 'doctor_update_forbidden';
  end if;

  if new.status is distinct from old.status and not (
    (old.status = 'assigned' and new.status in ('answered', 'closed'))
    or (old.status = 'answered' and new.status = 'closed')
  ) then
    raise exception using errcode = '42501', message = 'doctor_status_transition_forbidden';
  end if;

  if old.status = 'closed' then
    raise exception using errcode = '42501', message = 'closed_consultation_immutable';
  end if;

  -- Server owns the closure timestamp, not an untrusted browser clock.
  new.closed_at := case
    when new.status = 'closed' then clock_timestamp()
    else old.closed_at
  end;
  return new;
end;
$$;

drop trigger if exists consultation_doctor_update_guard on public.consultations;
create trigger consultation_doctor_update_guard
before update on public.consultations
for each row execute function public.guard_doctor_consultation_update();

drop policy if exists "participants send messages" on public.consultation_messages;
create policy "participants send messages" on public.consultation_messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.can_access_consultation(consultation_id)
  and exists (
    select 1 from public.consultations c
    where c.id = consultation_id and c.status <> 'closed'
  )
  and (
    (sender_kind = 'patient' and exists (
      select 1 from public.consultations c
      where c.id = consultation_id and c.patient_id = auth.uid()
    ))
    or (sender_kind = 'doctor' and exists (
      select 1 from public.consultations c
      join public.doctors d on d.id = c.doctor_id
      where c.id = consultation_id and d.provider_user_id = auth.uid()
    ))
    or (sender_kind = 'staff' and public.is_medical_admin())
  )
);

-- Accept invitations in one database transaction. Neither the requested
-- role nor the target account comes from caller-provided browser metadata.
create or replace function public.accept_admin_invitation(p_token text)
returns public.app_role
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_invitation public.invitations%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  v_email := lower(btrim(coalesce(auth.jwt()->>'email', '')));
  if v_email = '' or p_token is null or length(p_token) <> 36 then
    raise exception using errcode = '22023', message = 'invalid_invitation';
  end if;

  select * into v_invitation
  from public.invitations
  where lower(email) = v_email
    and token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and accepted_at is null and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'invitation_expired_or_invalid';
  end if;

  update public.profiles
  set role = v_invitation.role
  where id = auth.uid() and status = 'active';

  if not found then
    raise exception using errcode = '42501', message = 'profile_inactive_or_missing';
  end if;

  update public.invitations
  set accepted_at = now()
  where id = v_invitation.id;

  return v_invitation.role;
end;
$$;

revoke execute on function public.accept_admin_invitation(text) from public, anon;
grant execute on function public.accept_admin_invitation(text) to authenticated;

revoke execute on function public.guard_doctor_consultation_update() from public, anon, authenticated;
