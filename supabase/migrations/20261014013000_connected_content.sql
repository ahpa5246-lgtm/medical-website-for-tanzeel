-- Additive connected-content workflows. Test on synthetic staging before deployment.
create table public.content_items (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('article','course','resource')),
 title text not null check (char_length(trim(title)) between 8 and 200),
 body text not null check (char_length(trim(body)) between 80 and 50000),
 category text not null check (char_length(trim(category)) between 1 and 80),
 author_id uuid not null references public.profiles(id),
 status public.publication_status not null default 'draft',
 reviewed_by uuid references public.profiles(id),
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index content_public_index on public.content_items(kind,status,created_at desc,id);
create function public.can_author_content() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.profiles where id=auth.uid() and status='active') and (public.current_role() in ('owner','admin','editor') or exists(select 1 from public.doctors where provider_user_id=auth.uid() and profile_kind='real_provider' and verification_status='verified'));
$$;
create function public.guard_content_write() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and status='active') then raise exception 'inactive profile' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.author_id<>old.author_id then raise exception 'author immutable'; end if;
  new.revision:=old.revision+1;
 end if;
 if public.current_role() not in ('owner','admin') then
  if new.status not in ('draft','review') then raise exception 'publication requires review authority'; end if;
  new.reviewed_by:=null;
 elsif new.status='published' then new.reviewed_by:=auth.uid();
 end if;
 new.updated_at:=now(); return new;
end $$;
create trigger content_guard before insert or update on public.content_items for each row execute function public.guard_content_write();
alter table public.content_items enable row level security;
create policy content_read on public.content_items for select using (status='published' or author_id=auth.uid() or public.current_role() in ('owner','admin'));
create policy content_create on public.content_items for insert to authenticated with check(author_id=auth.uid() and public.can_author_content());
create policy content_edit on public.content_items for update to authenticated using (public.current_role() in ('owner','admin') or (author_id=auth.uid() and public.can_author_content() and status in ('draft','review'))) with check(public.current_role() in ('owner','admin') or (author_id=auth.uid() and public.can_author_content() and status in ('draft','review')));
grant select on public.content_items to anon,authenticated;
grant insert,update on public.content_items to authenticated;

create table public.resource_bookmarks (
 user_id uuid not null references public.profiles(id) on delete cascade,
 content_id uuid not null references public.content_items(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,content_id)
);
create table public.course_progress (
 user_id uuid not null references public.profiles(id) on delete cascade,
 content_id uuid not null references public.content_items(id) on delete cascade,
 completed boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(user_id,content_id)
);
alter table public.resource_bookmarks enable row level security;
alter table public.course_progress enable row level security;
create policy bookmark_own on public.resource_bookmarks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and status='active') and exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.kind='resource'));
create policy progress_own on public.course_progress for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and status='active') and exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.kind='course'));
grant select,insert,update,delete on public.resource_bookmarks,public.course_progress to authenticated;

create table public.verification_applications (
 id uuid primary key default gen_random_uuid(),
 applicant_id uuid not null unique references public.profiles(id),
 full_name text not null check(char_length(trim(full_name)) between 3 and 120),
 specialty_id uuid not null references public.specialties(id),
 license_number text not null check(char_length(trim(license_number)) between 3 and 100),
 experience integer not null check(experience between 0 and 80),
 bio text not null default '' check(char_length(bio)<=2000),
 consent boolean not null check(consent),
 status text not null default 'pending' check(status in ('pending','approved','needs_information','rejected')),
 review_note text not null default '' check(char_length(review_note)<=2000),
 reviewed_by uuid references public.profiles(id),
 document_path text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.verification_applications enable row level security;
create policy verification_read on public.verification_applications for select to authenticated using(applicant_id=auth.uid() or public.current_role() in ('owner','admin'));
create policy verification_create on public.verification_applications for insert to authenticated with check(applicant_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and status='active') and status='pending' and reviewed_by is null and review_note='');
create policy verification_update on public.verification_applications for update to authenticated using(public.current_role() in ('owner','admin') or (applicant_id=auth.uid() and status in ('pending','needs_information'))) with check(public.current_role() in ('owner','admin') or (applicant_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and status='active') and status='pending' and reviewed_by is null and review_note=''));
create function public.guard_verification() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if tg_op='UPDATE' and new.applicant_id<>old.applicant_id then raise exception 'applicant immutable'; end if;
 if public.current_role() in ('owner','admin') and new.status<>'pending' then new.reviewed_by:=auth.uid(); end if;
 new.updated_at:=now(); return new;
end $$;
create trigger verification_guard before update on public.verification_applications for each row execute function public.guard_verification();
grant select,insert,update on public.verification_applications to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('verification-documents','verification-documents',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy verification_document_insert on storage.objects for insert to authenticated with check(bucket_id='verification-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy verification_document_read on storage.objects for select to authenticated using(bucket_id='verification-documents' and ((storage.foldername(name))[1]=auth.uid()::text or public.current_role() in ('owner','admin')));

create table public.training_progress (
 user_id uuid not null references public.profiles(id) on delete cascade,
 stage_id text not null,
 xp integer not null check(xp between 0 and 1000),
 completed_at timestamptz not null default now(),
 primary key(user_id,stage_id)
);
alter table public.training_progress enable row level security;
create policy training_read on public.training_progress for select to authenticated using(user_id=auth.uid());
grant select on public.training_progress to authenticated;
-- IDs and awards match the client catalog. Client cannot write/choose awards.
create function public.complete_training_stage(p_stage_id text,p_answers integer[]) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare
 stages text[]:=array['vital-signs','patient-safety','medical-language','chest-pain','triage','case-handoff','anatomy','lab-results','final-scenario'];
 rewards integer[]:=array[100,130,150,220,260,280,350,390,500];
 i integer:=array_position(stages,p_stage_id);
 principal uuid:=auth.uid();
 expected integer[];
begin
 if principal is null or public.current_role() is null then raise exception 'authentication required'; end if;
 perform 1 from public.profiles where id=principal and status='active' for update;
 if not found then raise exception 'inactive profile'; end if;
 if i is null then raise exception 'unknown stage'; end if;
 if exists(select 1 from public.training_progress where user_id=principal and stage_id=p_stage_id) then return true; end if;
 if (select count(*) from public.training_progress where user_id=principal and stage_id=any(stages[1:i-1]))<>i-1 then raise exception 'prerequisite missing'; end if;
 select k.answers into expected from public.training_answer_keys k join public.training_tasks t using(stage_id) where k.stage_id=p_stage_id and t.is_published;
 if expected is null then raise exception 'task unavailable'; end if;
 if p_answers<>expected or p_answers is null then return false; end if;
 insert into public.training_progress(user_id,stage_id,xp) values(principal,p_stage_id,rewards[i]) on conflict do nothing;
 return true;
end $$;
create function public.reset_training_progress() returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or public.current_role() is null then raise exception 'authentication required'; end if;
 perform 1 from public.profiles where id=auth.uid() and status='active' for update;
 if not found then raise exception 'inactive profile'; end if;
 delete from public.training_progress where user_id=auth.uid();
end $$;
revoke all on function public.complete_training_stage(text,integer[]),public.reset_training_progress() from public,anon;
grant execute on function public.complete_training_stage(text,integer[]),public.reset_training_progress() to authenticated;

-- Public question data is separated from private server-side answer keys.
create table public.training_tasks (
 stage_id text primary key,
 title text not null,
 instructions text not null,
 questions jsonb not null check(jsonb_typeof(questions)='array'),
 is_published boolean not null default false
);
create table public.training_answer_keys (
 stage_id text primary key references public.training_tasks(stage_id) on delete cascade,
 answers integer[] not null
);
alter table public.training_tasks enable row level security;
alter table public.training_answer_keys enable row level security;
create policy training_task_public on public.training_tasks for select using(is_published or public.current_role() in ('owner','admin'));
create policy training_task_admin on public.training_tasks for all to authenticated using(public.current_role() in ('owner','admin')) with check(public.current_role() in ('owner','admin'));
grant select on public.training_tasks to anon,authenticated;
grant insert,update,delete on public.training_tasks to authenticated;
revoke all on public.training_answer_keys from anon,authenticated;
-- This seed teaches platform use, not medicine, diagnosis or treatment.
insert into public.training_tasks(stage_id,title,instructions,questions,is_published) values(
 'vital-signs','استخدام المنصة بأمان','تمرين تمهيدي غير سريري: اختبري فهم الحفظ والخصوصية وحدود المحتوى. ليس اختبارًا لمهارات التشخيص.',
 '[{"prompt":"هل يمكن الاعتماد على نموذج غير مراجع للتشخيص؟","options":["نعم","لا"]},{"prompt":"أين يجب أن تُحفظ الاستشارة حتى تظهر بعد تسجيل الدخول من جهاز آخر؟","options":["في الحساب على الخادم","في رابط الصفحة"]},{"prompt":"هل يجوز مشاركة رابط وثيقة تحقق خاصة مع الجميع؟","options":["نعم","لا"]}]'::jsonb,true
);
insert into public.training_answer_keys values('vital-signs',array[1,0,1]);

create table public.content_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references public.profiles(id),
 content_id uuid not null references public.content_items(id),
 operation_id uuid not null,
 reason text not null check(char_length(trim(reason)) between 10 and 1000),
 created_at timestamptz not null default now(),
 unique(reporter_id,operation_id)
);
create index report_rate_index on public.content_reports(reporter_id,created_at);
alter table public.content_reports enable row level security;
create policy report_read on public.content_reports for select to authenticated using(reporter_id=auth.uid() or public.current_role() in ('owner','admin'));
grant select on public.content_reports to authenticated;
create function public.submit_content_report(p_content_id uuid,p_reason text,p_operation_id uuid) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare previous public.content_reports; result uuid;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 perform 1 from public.profiles where id=auth.uid() and status='active' for update;
 if not found then raise exception 'inactive profile' using errcode='42501'; end if;
 select * into previous from public.content_reports where reporter_id=auth.uid() and operation_id=p_operation_id;
 if found then
  if previous.content_id<>p_content_id or previous.reason<>trim(p_reason) then raise exception 'operation payload mismatch'; end if;
  return previous.id;
 end if;
 if not exists(select 1 from public.content_items where id=p_content_id and status='published') then raise exception 'content unavailable' using errcode='42501'; end if;
 if (select count(*) from public.content_reports where reporter_id=auth.uid() and created_at>now()-interval '1 minute')>=5 then raise exception 'report rate limit'; end if;
 insert into public.content_reports(reporter_id,content_id,operation_id,reason) values(auth.uid(),p_content_id,p_operation_id,trim(p_reason)) returning id into result;
 return result;
end $$;
revoke all on function public.submit_content_report(uuid,text,uuid) from public,anon;
grant execute on function public.submit_content_report(uuid,text,uuid) to authenticated;

-- Supabase may grant table rights by default: explicitly narrow privileges.
revoke all on public.content_items,public.resource_bookmarks,public.course_progress,public.verification_applications,public.training_progress,public.training_tasks,public.training_answer_keys,public.content_reports from anon,authenticated;
grant select on public.content_items,public.training_tasks to anon;
grant select,insert,update on public.content_items,public.verification_applications to authenticated;
grant select,insert,update,delete on public.resource_bookmarks,public.course_progress,public.training_tasks to authenticated;
grant select on public.training_progress,public.content_reports to authenticated;
-- Training question reads are needed by signed-in users too.
grant select on public.training_tasks to authenticated;
alter table public.verification_applications add constraint verification_document_owner check(document_path is null or starts_with(document_path,applicant_id::text||'/'));

create function public.save_training_task(p_stage_id text,p_title text,p_instructions text,p_questions jsonb,p_answers integer[],p_published boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare q jsonb; i integer:=1;stage_ids text[]:=array['vital-signs','patient-safety','medical-language','chest-pain','triage','case-handoff','anatomy','lab-results','final-scenario'];
begin
 if public.current_role() not in ('owner','admin') then raise exception 'review authority required' using errcode='42501';end if;
 if p_stage_id is null or not p_stage_id=any(stage_ids) or p_title is null or char_length(trim(p_title)) not between 5 and 200 or p_instructions is null or char_length(trim(p_instructions)) not between 20 and 5000 or p_questions is null or jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 1 and 10 or p_answers is null or cardinality(p_answers)<>jsonb_array_length(p_questions) or p_published is null then raise exception 'invalid task';end if;
 for q in select value from jsonb_array_elements(p_questions) loop
  if jsonb_typeof(q->'prompt') is distinct from 'string' or char_length(q->>'prompt') not between 5 and 500 or jsonb_typeof(q->'options') is distinct from 'array' or jsonb_array_length(q->'options') not between 2 and 6 or p_answers[i] is null or p_answers[i]<0 or p_answers[i]>=jsonb_array_length(q->'options') then raise exception 'invalid question';end if;
  if exists(select 1 from jsonb_array_elements(q->'options') o where jsonb_typeof(o)<>'string' or char_length(o#>>'{}') not between 1 and 500) then raise exception 'invalid option';end if;
  i:=i+1;
 end loop;
 insert into public.training_tasks(stage_id,title,instructions,questions,is_published) values(p_stage_id,trim(p_title),trim(p_instructions),p_questions,p_published) on conflict(stage_id) do update set title=excluded.title,instructions=excluded.instructions,questions=excluded.questions,is_published=excluded.is_published;
 insert into public.training_answer_keys(stage_id,answers) values(p_stage_id,p_answers) on conflict(stage_id) do update set answers=excluded.answers;
end $$;
revoke all on function public.save_training_task(text,text,text,jsonb,integer[],boolean) from public,anon;
grant execute on function public.save_training_task(text,text,text,jsonb,integer[],boolean) to authenticated;
-- Only the audited RPC can change questions and private grading keys together.
revoke insert,update,delete on public.training_tasks from authenticated;
