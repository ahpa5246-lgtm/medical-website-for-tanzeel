alter table public.consultations add column client_operation_id uuid;
create unique index consultation_operation_unique on public.consultations(patient_id,client_operation_id) where client_operation_id is not null;
alter table public.consultation_messages add column client_operation_id uuid;
create unique index message_operation_unique on public.consultation_messages(sender_id,client_operation_id) where client_operation_id is not null;
create function public.create_consultation(p_specialty_id uuid,p_subject text,p_body text,p_emergency boolean,p_operation_id uuid) returns public.consultations language plpgsql security definer set search_path=public,pg_temp as $$
declare result public.consultations;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() and status='active' for update;
 if not found then raise exception 'inactive profile' using errcode='42501';end if;
 if p_operation_id is null or p_emergency is null or p_emergency then raise exception 'invalid or urgent submission';end if;
 if not exists(select 1 from public.specialties where id=p_specialty_id and is_active) then raise exception 'specialty unavailable';end if;
 select * into result from public.consultations where patient_id=auth.uid() and client_operation_id=p_operation_id;
 if found then
  if result.specialty_id<>p_specialty_id or result.subject<>trim(p_subject) or result.body<>trim(p_body) then raise exception 'operation payload mismatch';end if;
  return result;
 end if;
 if (select count(*) from public.consultations where patient_id=auth.uid() and created_at>now()-interval '1 minute')>=5 then raise exception 'submission rate limit';end if;
 insert into public.consultations(patient_id,specialty_id,subject,body,emergency_flag,client_operation_id) values(auth.uid(),p_specialty_id,trim(p_subject),trim(p_body),false,p_operation_id) returning * into result;
 return result;
end $$;
create function public.send_consultation_message(p_consultation_id uuid,p_body text,p_operation_id uuid) returns public.consultation_messages language plpgsql security definer set search_path=public,pg_temp as $$
declare c public.consultations;result public.consultation_messages;kind public.message_sender_kind;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and status='active') then raise exception 'authentication required' using errcode='42501';end if;
 select * into c from public.consultations where id=p_consultation_id for update;
 if not found or not public.can_access_consultation(p_consultation_id) then raise exception 'access denied' using errcode='42501';end if;
 select * into result from public.consultation_messages where sender_id=auth.uid() and client_operation_id=p_operation_id;
 if found then
  if result.consultation_id<>p_consultation_id or result.body<>trim(p_body) then raise exception 'operation payload mismatch';end if;
  return result;
 end if;
 if c.status='closed' or p_operation_id is null then raise exception 'closed or invalid request';end if;
 kind:=case when c.patient_id=auth.uid() then 'patient'::public.message_sender_kind when public.is_medical_admin() then 'staff'::public.message_sender_kind else 'doctor'::public.message_sender_kind end;
 if (select count(*) from public.consultation_messages where sender_id=auth.uid() and created_at>now()-interval '1 minute')>=20 then raise exception 'message rate limit';end if;
 insert into public.consultation_messages(consultation_id,sender_id,sender_kind,body,client_operation_id) values(p_consultation_id,auth.uid(),kind,trim(p_body),p_operation_id) returning * into result;
 return result;
end $$;
revoke all on function public.create_consultation(uuid,text,text,boolean,uuid),public.send_consultation_message(uuid,text,uuid) from public,anon;
grant execute on function public.create_consultation(uuid,text,text,boolean,uuid),public.send_consultation_message(uuid,text,uuid) to authenticated;

create table public.consultation_attachments (
 id uuid primary key default gen_random_uuid(),
 consultation_id uuid not null references public.consultations(id),
 uploaded_by uuid not null references public.profiles(id),
 path text not null unique,
 file_name text not null check(char_length(file_name) between 1 and 200),
 file_size integer not null check(file_size between 1 and 10485760),
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 created_at timestamptz not null default now(),
 check(starts_with(path,consultation_id::text||'/'))
);
alter table public.consultation_attachments enable row level security;
create policy attachment_read on public.consultation_attachments for select to authenticated using(public.can_access_consultation(consultation_id));
create policy attachment_create on public.consultation_attachments for insert to authenticated with check(uploaded_by=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and status='active') and exists(select 1 from public.consultations where id=consultation_id and patient_id=auth.uid() and status<>'closed') and exists(select 1 from storage.objects where bucket_id='consultation-attachments' and name=path));
revoke all on public.consultation_attachments from anon,authenticated;
grant select,insert on public.consultation_attachments to authenticated;

create or replace function public.can_access_consultation(target uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.profiles where id=auth.uid() and status='active') and exists(select 1 from public.consultations c left join public.doctors d on d.id=c.doctor_id where c.id=target and (c.patient_id=auth.uid() or d.provider_user_id=auth.uid() or public.is_medical_admin()));
$$;
create policy active_consultations_only on public.consultations as restrictive for all to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and status='active')) with check(exists(select 1 from public.profiles where id=auth.uid() and status='active'));
create policy active_messages_only on public.consultation_messages as restrictive for all to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and status='active')) with check(exists(select 1 from public.profiles where id=auth.uid() and status='active'));

-- All creation must pass the transactional, rate-limited RPCs above.
revoke insert on public.consultations, public.consultation_messages from anon, authenticated;

create function public.guard_consultation_operation_key() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
 if new.client_operation_id is distinct from old.client_operation_id then
  raise exception 'operation key is immutable' using errcode='42501';
 end if;
 return new;
end $$;
create trigger consultation_operation_key_immutable before update on public.consultations
for each row execute function public.guard_consultation_operation_key();
create trigger message_operation_key_immutable before update on public.consultation_messages
for each row execute function public.guard_consultation_operation_key();
