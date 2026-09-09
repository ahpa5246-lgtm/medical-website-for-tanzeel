# معاينة الموقع الطبي في GitHub Codespaces

هذه معاينة خيالية مغلقة وليست خدمة طبية تشغيلية. لا تدخل بيانات شخصية أو طبية حقيقية.

## الفتح السريع

1. افتح المستودع في GitHub Codespaces من فرع `codex/med-v1-codespaces-preview`.
2. انتظر اكتمال `postCreateCommand`؛ يثبت pnpm 9.15.9 والاعتماديات من ملف القفل.
3. يبدأ Vite تلقائيًا على المنفذ 8443.
4. من تبويب **Ports** اختر **Open in Browser** أمام **Medical prototype preview**.

المنفذ يبقى خاصًا بصاحب Codespace افتراضيًا. لا تغيّر **Port Visibility** إلى Public.

## إذا لم تفتح المعاينة تلقائيًا

شغّل داخل الطرفية:

```bash
cd "Build Medical Consultation Platform"
pnpm dev
```

ثم افتح المنفذ 8443 من تبويب **Ports**.

سجل التشغيل عند البدء التلقائي موجود في:

```text
/tmp/medical-prototype-vite.log
```

## التحقق قبل العرض

```bash
cd "Build Medical Consultation Platform"
pnpm test
pnpm typecheck
pnpm format:check
pnpm build
```

## حدود العرض

- لا تضف متغيرات Supabase لمجرد المعاينة.
- لا تطبق SQL أو migrations.
- لا تستخدم بيانات مرضى، ملفات، أسماء أطباء أو حالات حقيقية.
- التحذير الدائم ووسم البيانات الخيالية و`noindex` جزء من بوابة الأمان.
- الأزرار المقفلة عمدًا ليست عطلًا؛ الوظائف التي تحتاج خادمًا أو مراجعة مختص تبقى مغلقة.
