begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

select ok((select relrowsecurity from pg_class where oid = 'public.content_entries'::regclass), 'content has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.lesson_progress'::regclass), 'lesson progress has RLS');

insert into auth.users (id, email, raw_user_meta_data) values
  ('44444444-4444-4444-8444-444444444444', 'author@example.test', '{"full_name":"Test Author","requested_role":"instructor"}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'reader@example.test', '{"full_name":"Test Reader","requested_role":"member"}'::jsonb);

update public.profiles set content_author_approved = true where id = '44444444-4444-4444-8444-444444444444';

insert into public.content_entries (id, kind, title, summary, body, category, author_id, status) values
  ('66666666-6666-4666-8666-666666666666', 'library', 'Test library resource', 'A summary long enough for this database fixture.', 'This is a complete body for a database fixture resource.', 'Reference', '44444444-4444-4444-8444-444444444444', 'draft');

alter table public.content_entries disable trigger content_prepare;
insert into public.content_entries (id, kind, title, summary, body, category, author_id, status, published_at) values
  ('77777777-7777-4777-8777-777777777777', 'library', 'Public library resource', 'A second summary long enough for the database fixture.', 'This is another complete body for a database fixture resource.', 'Reference', '44444444-4444-4444-8444-444444444444', 'published', now());
alter table public.content_entries enable trigger content_prepare;

set local role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);

select is((select count(*) from public.content_entries), 1::bigint, 'reader sees published content only');
select is(public.can_author_content(), false, 'ordinary member cannot author');
select throws_ok(
  $$insert into public.content_entries (kind, title, summary, body, category, author_id) values ('library', 'Unauthorized resource', 'This is a sufficiently long summary for testing.', 'This body is long enough for testing the permission.', 'Reference', '55555555-5555-4555-8555-555555555555')$$,
  '42501', null, 'ordinary member cannot insert a draft'
);

select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
select is(public.can_author_content(), true, 'approved instructor can author');
select is((select count(*) from public.content_entries), 2::bigint, 'author sees own draft and public entry');

select * from finish();
rollback;
