# تشغيل Codespace الحالي مع Supabase

هذا الدليل للـCodespace الموجود باسم `potential happiness` على الفرع
`feat/academy-library-workflow`. لا تحتاج إلى إنشاء Codespace ثانٍ.

> نسخة التطوير ليست خدمة طبية منشورة. استخدم حسابات تجريبية وحالات وهمية فقط.
> لا تنقل بيانات مرضى أو وثائق هوية حقيقية إلى هذه البيئة.

## 1. تحديث Codespace الموجود

افتح Codespace من GitHub، ثم افتح Terminal **في جذر المستودع**:

```bash
git branch --show-current
git status --short
git pull --ff-only origin feat/academy-library-workflow
```

يجب أن يُظهر الأمر الأول الفرع `feat/academy-library-workflow`.
إذا كانت هناك تعديلات محلية غير محفوظة، احتفظ بها أولًا؛ لا تستخدم
`git reset --hard` أو `git clean` لإصلاح تعارض دون مراجعتها.

بعد السحب، استخدم **Codespaces: Rebuild Container** من لوحة الأوامر لتطبيق
اسم البيئة وإعداد المنفذ. يبقى منفذ `8443` **Private**.

## 2. ربط واجهة Vite بمشروع Supabase

خذ **Publishable key** من مشروع Supabase
`medical-website-for-tanzeel` في صفحة **API Keys**.
لا تستخدم **Secret key** ولا **service_role**.

من Terminal في جذر المستودع:

```bash
bash .devcontainer/setup-supabase.sh
```

ألصق Publishable key عندما يطلبه السكربت؛ لن يعرضه أثناء الإدخال.
سيتعرف على Project Ref `enicmfiyoahlklmwdcnq` من مشروع Supabase الذي
اخترته، ويكتب ملفًا محليًا خاصًا:

```text
Build Medical Consultation Platform/.env.local
```

يحتوي الملف على إعدادات `VITE_SUPABASE_URL` و
`VITE_SUPABASE_ANON_KEY`، ويضبط `VITE_ENABLE_PROTOTYPE=false`
و`VITE_ENABLE_CONSULTATIONS=false`.

بعد ذلك **أوقف Codespace ثم شغّله مرة أخرى** ليتحمّل Vite
ملف الإعدادات الجديد. افتح **Ports → 8443 → Open in Browser**.
إذا تعذّر التشغيل اقرأ `/tmp/medical-prototype-vite.log`.

بديل: يمكن تخزين Publishable key في **GitHub Codespaces secrets**
تحت اسم `VITE_SUPABASE_ANON_KEY`، ثم تشغيل السكربت؛
سيستخدم قيمة المتغير دون طباعتها.

## 3. تجهيز قاعدة بيانات Supabase البعيدة

لا تطبّق SQL تلقائيًا مع تشغيل Codespace. المشروع في Dashboard
موسوم Production، ولذلك يجب فحص migration plan ومحتويات القاعدة
قبل أي كتابة. نفّذ من **جذر المستودع**، حيث يوجد `supabase/migrations`:

```bash
# فقط إذا لم يكن supabase/config.toml موجودًا
npx --yes supabase@2 init

npx --yes supabase@2 login
npx --yes supabase@2 link --project-ref enicmfiyoahlklmwdcnq
npx --yes supabase@2 db push --dry-run
```

يجب التأكد من أن قائمة الـmigrations مطابقة للملفات الموجودة في المستودع.
إذا كانت القاعدة غير فارغة، أو ظهر تغيير غير متوقع، لا تُنفّذ
الأوامر التالية قبل تحليل الفارق.

بعد مراجعة ناجحة على **مشروع تجريبي**:

```bash
npx --yes supabase@2 db push --include-seed
npx --yes supabase@2 functions deploy
```

ملف `supabase/seed.sql` يُنشئ ملفات أطباء **خيالية** للتجربة.
تُحدَّث جداول Postgres وStorage وسياسات RLS بواسطة الـmigrations.
راجع إعدادات **Authentication → URL Configuration** وأضف روابط
إعادة التوجيه الخاصة بعنوان المعاينة الفعلي.

**ملاحظة:** `supabase db push` ليس `db reset`.
لا تستخدم `db reset --linked` لأنه قد يحذف بيانات القاعدة البعيدة.

## 4. اختبارات قبل تفعيل الاستشارات

```bash
cd "Build Medical Consultation Platform"
pnpm test
pnpm typecheck
pnpm build
```

بعد التأكد من الجداول، RLS، وتسجيل الحسابات التجريبية،
يمكن تغيير `VITE_ENABLE_CONSULTATIONS` إلى `true` في
`.env.local` **لهذه التجربة فقط**، ثم إعادة تشغيل Vite.
الاستشارات مقفلة افتراضيًا حفاظًا على حدود نسخة المعاينة.
بعض وحدات التدريب والمحتوى في هذا الفرع ما تزال تجريبية أو مؤجلة.

## 5. العرض النهائي على Render

Render Static Site مناسب للواجهة: استخدم الفرع الصحيح ومجلد
`Build Medical Consultation Platform` كـRoot Directory، وأضف متغيرات
`VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` من إعدادات Render.
لا تنشر `service_role` أو مفاتيح سرية كمتغيرات `VITE_`.

الفرع الحالي غير مدمج في `main`؛ أي نشر يعتمد على `main`
لن يتضمن تلقائيًا التحديثات الموجودة في `feat/academy-library-workflow`.
