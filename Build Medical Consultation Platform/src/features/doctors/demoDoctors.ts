import type { DoctorCardRecord } from "./types"

// Fictional records appear only when the explicit prototype mode is enabled.
export const DEMO_DOCTORS: DoctorCardRecord[] = [
  {
    id: "demo-family",
    slug: "demo-family",
    display_name: "طبيبة تجريبية للأسرة",
    profile_kind: "fictional_demo",
    bio: "ملف عرض افتراضي يوضح كيف ستظهر نبذة الطبيب بعد اعتماد معلوماته ونشرها. لا تمثل هذه الشخصية مقدمة رعاية حقيقية.",
    image_path: null,
    image_alt: "رسم توضيحي لملف طبي تجريبي",
    languages: ["العربية"],
    interests: ["الرعاية الأولية", "التثقيف الصحي"],
    specialties: { name_ar: "طب الأسرة", slug: "family-medicine" },
  },
  {
    id: "demo-child",
    slug: "demo-child",
    display_name: "طبيب تجريبي للأطفال",
    profile_kind: "fictional_demo",
    bio: "ملف عرض افتراضي لاختبار تخطيط بطاقة الطبيب وصفحة الملف. لا تتوفر من خلاله استشارة أو حجز.",
    image_path: null,
    image_alt: "رسم توضيحي لملف طبي تجريبي",
    languages: ["العربية"],
    interests: ["صحة الطفل", "توعية الأسر"],
    specialties: { name_ar: "طب الأطفال", slug: "pediatrics" },
  },
]
