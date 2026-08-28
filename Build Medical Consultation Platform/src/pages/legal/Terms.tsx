import { Link } from "react-router-dom"

export default function Terms() {
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

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        شروط الاستخدام
      </h1>
      <p className="text-slate-500 text-sm mb-8">آخر تحديث: يوليو 2025</p>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ١. قبول الشروط
          </h2>
          <p>
            باستخدامك منصة ميدكونكت، سواء بالتصفح أو التسجيل أو تقديم محتوى،
            فأنت توافق على الشروط الواردة في هذه الوثيقة وعلى{" "}
            <Link to="/legal/privacy" className="text-primary-600 underline">
              سياسة الخصوصية
            </Link>{" "}
            و{" "}
            <Link to="/legal/disclaimer" className="text-primary-600 underline">
              التنويه الطبي
            </Link>
            . إذا لم توافق، يرجى التوقف عن استخدام المنصة.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٢. طبيعة الخدمة
          </h2>
          <p>
            ميدكونكت منصة معلوماتية وتعليمية تتيح التواصل مع أطباء معتمدين
            للحصول على إرشاد طبي عام. الخدمة ليست خدمة طوارئ ولا تُنشئ علاقة
            رعاية طبية رسمية كما يفهمها القانون. يُحظر الاعتماد عليها وحدها في
            اتخاذ قرارات طبية مصيرية.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٣. أهلية المستخدم
          </h2>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              يجب أن يكون المستخدم بالغًا (18 عامًا أو أكثر) أو تحت إشراف وليّ أمر.
            </li>
            <li>يتعهد المستخدم بتقديم بيانات صحيحة عند التسجيل.</li>
            <li>يُحظر إنشاء أكثر من حساب لشخص واحد أو تقديم هوية مزيفة.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٤. الاستخدام المقبول
          </h2>
          <p>يوافق المستخدم على:</p>
          <ul className="list-disc ps-5 space-y-1 mt-2">
            <li>عدم نشر محتوى مُضلل أو طبيًا خاطئًا.</li>
            <li>عدم استخدام المنصة للترويج لمنتجات أو خدمات غير مرخصة.</li>
            <li>عدم انتهاك خصوصية المستخدمين الآخرين أو الأطباء.</li>
            <li>عدم الإساءة أو التحرش بأي مستخدم أو طبيب.</li>
            <li>الإبلاغ فورًا عن أي محتوى مشبوه أو خاطئ طبيًا.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٥. التحقق من الأطباء والمدربين
          </h2>
          <p>
            يتعهد كل طبيب أو مدرب بتقديم وثائق حقيقية وصحيحة للتحقق. أي تزوير أو
            انتحال للهوية المهنية يُعرّض الحساب للإغلاق الفوري والإحالة للجهات
            القانونية المختصة.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٦. الملكية الفكرية
          </h2>
          <p>
            المحتوى المنشور على المنصة من مقالات ودورات ومواد تعليمية محمي بحقوق
            الملكية الفكرية للمؤلف أو المنصة. يُحظر نسخ أي محتوى أو إعادة نشره
            دون إذن كتابي مسبق.
          </p>
          <p className="mt-2">
            بنشر محتوى على المنصة، تمنح ميدكونكت رخصة استخدام غير حصرية لعرض
            المحتوى وتوزيعه على المستخدمين ضمن نطاق الخدمة.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٧. إنهاء الخدمة
          </h2>
          <p>
            تحتفظ ميدكونكت بحقها في تعليق أو إنهاء أي حساب يخالف هذه الشروط أو
            يشكّل خطرًا على سلامة المستخدمين أو يضر بمصداقية المنصة.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٨. تعديل الشروط
          </h2>
          <p>
            قد تُعدّل هذه الشروط بحسب احتياجات المنصة أو المتطلبات القانونية. يُعلَن
            عن أي تعديل جوهري قبل سريانه بسبعة أيام على الأقل عبر البريد
            الإلكتروني أو الإشعارات داخل التطبيق.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٩. التواصل معنا
          </h2>
          <p>
            لأي استفسار قانوني أو شكوى: <strong>legal@medconnect.app</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
