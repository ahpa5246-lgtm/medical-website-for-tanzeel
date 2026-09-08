import { Link } from "react-router-dom"

const UNAVAILABLE_FEATURES = [
  "لا توجد حسابات مستخدمين أو تسجيل فعلي.",
  "لا يوجد أطباء أو ممارسون صحيون متصلون بالنموذج.",
  "لا توجد عملية تحقق من الهوية أو الترخيص أو الوثائق.",
  "لا توجد خدمة لنشر المقالات أو الدورات أو أي محتوى.",
  "لا توجد قواعد استخدام تشغيلية أو آلية إنفاذ أو تعليق أو إغلاق حسابات.",
  "لا تُرسل إشعارات أو رسائل بريد إلكتروني أو تنبيهات داخل التطبيق.",
  "لا توجد قناة دعم قانوني أو فريق قانوني تشغيلي للتواصل معه.",
  "لا توجد حقوق تشغيلية للمنصة أو للمستخدمين مطبقة في هذا النموذج.",
]

export default function Terms() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        to="/"
        className="text-sm text-primary-600 transition-colors hover:text-primary-700"
      >
        ← العودة للرئيسية
      </Link>

      <h1 className="mt-8 text-2xl font-bold text-slate-900 sm:text-3xl">
        حالة النموذج الأولي
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        إشعار وصفي لواجهة خيالية غير تشغيلية — وليس شروط خدمة.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-8 text-slate-700">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h2 className="font-bold">لا ينشئ استخدام هذه الواجهة اتفاقًا</h2>
          <p className="mt-2">
            التصفح أو تجربة الحقول لا يعني قبول شروط، ولا ينشئ حسابًا أو علاقة
            طبية أو قانونية أو خدمة. لا تُدخل معلومات شخصية أو طبية حقيقية؛ القيم
            التجريبية لا تُرسل ولا تُحفظ.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">
            ما الذي لم يُنفّذ؟
          </h2>
          <ul className="mt-3 list-disc space-y-2 ps-5">
            {UNAVAILABLE_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-bold text-slate-900">المحتوى والوثائق</h2>
          <p className="mt-2">
            لا يمكن تسجيل بيانات حقيقية أو تقديم وثائق مهنية أو نشر محتوى عبر
            هذه الواجهة. لا تمنح تجربة حقول العرض أي ترخيص للمحتوى، ولا يوجد
            حساب يمكن تعليقه أو سياسة تشغيلية يمكن الإخطار بتغييرها.
          </p>
        </section>

        <p>
          صفحات العرض الأخرى، بما فيها إشعار الخصوصية و
          <Link to="/legal/disclaimer" className="text-primary-700 underline">
            التنويه الطبي
          </Link>
          ، تصف حدود النموذج فقط ولا تمثل خدمة قائمة.
        </p>
      </div>
    </div>
  )
}
