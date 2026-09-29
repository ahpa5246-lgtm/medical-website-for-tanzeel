-- Safe development/demo content only. These are fictional records, never real clinicians.
insert into public.specialties (slug, name_ar, description, sort_order) values
('cardiology','القلب والأوعية الدموية','محتوى تجريبي لتخصص القلب.',1),
('family-medicine','طب الأسرة','محتوى تجريبي للرعاية الأولية.',2),
('dermatology','الأمراض الجلدية','محتوى تجريبي للأمراض الجلدية.',3),
('pediatrics','طب الأطفال','محتوى تجريبي لطب الأطفال.',4),
('orthopedics','العظام والمفاصل','محتوى تجريبي للعظام والمفاصل.',5)
on conflict (slug) do update set
  name_ar=excluded.name_ar,
  description=excluded.description,
  sort_order=excluded.sort_order,
  is_active=true;

insert into public.doctors (
  id, slug, display_name, profile_kind, specialty_id, bio, languages, interests,
  image_alt, verification_status, publication_status, published_at
) values
(
 '20000000-0000-0000-0000-000000000001','dr-noor-al-hashimi','د. نور الهاشمي','fictional_demo',
 (select id from public.specialties where slug='cardiology'),
 'شخصية طبية افتراضية أُنشئت لاختبار تصميم المنصة ومسار عرض الملفات الطبية فقط، وليست طبيبًا حقيقيًا.',
 '{"العربية","الإنجليزية"}','{"صحة القلب","الوقاية"}','صورة افتراضية لطبيبة','not_applicable','published',now()
),
(
 '20000000-0000-0000-0000-000000000002','dr-ali-al-rubaie','د. علي الربيعي','fictional_demo',
 (select id from public.specialties where slug='family-medicine'),
 'شخصية طبية افتراضية لعرض تجربة طب الأسرة داخل النسخة التجريبية، ولا تمثل مقدم خدمة حقيقيًا.',
 '{"العربية"}','{"الرعاية الأولية","الصحة العامة"}','صورة افتراضية لطبيب','not_applicable','published',now()
),
(
 '20000000-0000-0000-0000-000000000003','dr-zahraa-kareem','د. زهراء كريم','fictional_demo',
 (select id from public.specialties where slug='dermatology'),
 'شخصية طبية افتراضية لاختبار ملفات تخصص الجلدية وإدارة المحتوى، وليست شخصًا حقيقيًا.',
 '{"العربية","الإنجليزية"}','{"العناية بالبشرة","التثقيف الصحي"}','صورة افتراضية لطبيبة','not_applicable','published',now()
),
(
 '20000000-0000-0000-0000-000000000004','dr-yousif-hassan','د. يوسف حسن','fictional_demo',
 (select id from public.specialties where slug='pediatrics'),
 'شخصية طبية افتراضية لاختبار تجربة طب الأطفال في المنصة، ولا تحمل ادعاءات مهنية حقيقية.',
 '{"العربية"}','{"نمو الطفل","التوعية الأسرية"}','صورة افتراضية لطبيب','not_applicable','published',now()
),
(
 '20000000-0000-0000-0000-000000000005','dr-maryam-saad','د. مريم سعد','fictional_demo',
 (select id from public.specialties where slug='orthopedics'),
 'شخصية طبية افتراضية لاختبار صفحات العظام والمفاصل، وليست طبيبة أو مزودًا صحيًا حقيقيًا.',
 '{"العربية","الإنجليزية"}','{"صحة المفاصل","التأهيل"}','صورة افتراضية لطبيبة','not_applicable','published',now()
)
on conflict (slug) do update set
  display_name=excluded.display_name,
  specialty_id=excluded.specialty_id,
  bio=excluded.bio,
  languages=excluded.languages,
  interests=excluded.interests,
  profile_kind='fictional_demo',
  provider_user_id=null,
  verification_status='not_applicable',
  publication_status='published',
  published_at=excluded.published_at;
