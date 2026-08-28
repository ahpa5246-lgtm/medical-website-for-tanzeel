import { Link } from "react-router-dom"
import { AlertTriangle, Phone } from "lucide-react"

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

      {/* Emergency callout */}
      <div className="flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 mb-8">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
        <div>
          <p className="font-bold text-red-800 text-sm">
            في حالة الطوارئ — لا تتأخر
          </p>
          <p className="text-xs text-red-700 mt-1">
            إذا كانت حالتك طارئة، اتصل بالإسعاف فورًا ولا تنتظر ردًا من هذه
            المنصة.
          </p>
          <div className="flex gap-2 mt-2">
            <a
              href="tel:911"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> الطوارئ: 911
            </a>
            <a
              href="tel:122"
              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> الإسعاف: 122
            </a>
            <a
              href="tel:122"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> طوارئ: 122
            </a>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        التنويه الطبي
      </h1>
      <p className="text-slate-500 text-sm mb-8">آخر تحديث: يوليو 2025</p>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            ١. هذه المنصة ليست بديلًا عن الرعاية الطبية
          </h2>
          <p>
            منصة <strong>ميدكونكت</strong> هي خدمة معلومات وإرشاد طبي عام.
            المحتوى المقدم — سواء كان استشارات مكتوبة من الأطباء، أو مقالات، أو
            مواد تعليمية — يهدف إلى تعزيز الوعي الصحي وتقديم إرشاد أولي فقط.
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
            نُحكّم على تحقق جميع الأطباء المشاركين من خلال التحقق من شهاداتهم
            الأكاديمية وتراخيصهم المهنية وأرقام تسجيلهم في نقابات الأطباء. مع
            ذلك، لا يمكننا ضمان دقة المعلومات التي يقدمها كل طبيب في كل استشارة،
            إذ تُقدَّم الإجابات بحسن نية ولا تمثل موقف المؤسسة الطبية الرسمية.
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
