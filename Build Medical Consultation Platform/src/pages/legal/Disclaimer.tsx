import { Link } from "react-router-dom"
import EmergencyBanner from "@/components/EmergencyBanner"

export default function MedicalDisclaimer() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          to="/"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← العودة للرئيسية
        </Link>
      </div>

      {/* Emergency callout uses the single shared emergency source. */}
      <div className="mb-8">
        <EmergencyBanner />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        التنويه الطبي
      </h1>
      <p className="text-slate-500 text-sm mb-8">هذه مسودة تنويه غير معتمدة قانونيًا أو طبيًا للنسخة التجريبية.</p>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ١. هذه المنصة ليست بديلًا عن الرعاية الطبية
          </h2>
          <p>
            <strong>ميدكونكت نموذج واجهة غير تشغيلي وليس خدمة طبية.</strong> كل
            الاستشارات والأطباء والمقالات والهويات المعروضة أمثلة خيالية لم
            تُراجع طبيًا.
          </p>
          <p className="mt-3">
            المعلومات المقدمة لا تُعادل في أي حال من الأحوال الفحصَ الطبي المباشر،
            التشخيص السريري الرسمي، أو وصف العلاج. لا شيء في هذه المنصة يُنشئ
            علاقة طبيب-مريض رسمية ما لم يُصرَّح بذلك صراحةً.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ٢. قيود استخدام هذه الخدمة
          </h2>
          <p>لا تستخدم هذه المنصة:</p>
          <ul className="list-disc ps-5 mt-2 space-y-1">
            <li>في الحالات الطارئة أو التي تتطلب رعاية فورية.</li>
            <li>كبديل عن مراجعة طبيبك المعالج أو متابعة حالاتك المزمنة معه.</li>
            <li>
              لاتخاذ قرارات دوائية دون استشارة طبيب مرخص (جرعة، تغيير دواء،
              إيقاف علاج).
            </li>
            <li>
              في حالات الأفكار الانتحارية أو الأذى الذاتي — اتصل بخط دعم نفسي
              متخصص فورًا.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ٣. التحقق من هوية الأطباء
          </h2>
          <p>
            لا يوجد أطباء مشاركون ولم تُنفذ عملية تحقق. الأسماء والصور والتراخيص
            والإجابات المعروضة خيالية ولا تثبت هوية أو اعتماد أي شخص.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ٤. المسؤولية
          </h2>
          <p>
            لا تتحمل منصة ميدكونكت أي مسؤولية قانونية عن قرارات صحية تُتخذ بناءً
            على المعلومات المقدمة هنا. المستخدم مسؤول بالكامل عن قراراته الصحية،
            وتحمّل أي مخاطر ناتجة عن الاعتماد على المحتوى بدلًا من مراجعة متخصص
            صحي بشكل مباشر.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ٥. دقة المعلومات وتحديثها
          </h2>
          <p>
            المعلومات الطبية تتطور باستمرار. نسعى لتقديم محتوى محدّث ودقيق، لكن
            لا نضمن أن يعكس كل محتوى أحدث التوجيهات الطبية في وقت قراءته. راجع
            دائمًا مصادر موثوقة وطبيبك للتأكد من دقة أي معلومة طبية تؤثر على قرار
            علاجي.
          </p>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-900 font-semibold text-xs">
            باستخدامك هذه المنصة، تُقرّ بأنك قرأت هذا التنويه وتفهمه وتوافق عليه
            كاملًا.
          </p>
        </section>
      </div>
    </div>
  )
}
