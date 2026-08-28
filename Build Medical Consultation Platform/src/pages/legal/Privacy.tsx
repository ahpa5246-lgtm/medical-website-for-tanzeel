import { Link } from "react-router-dom"

export default function Privacy() {
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
        سياسة الخصوصية
      </h1>
      <p className="text-slate-500 text-sm mb-8">آخر تحديث: يوليو 2025</p>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ١. التزامنا بخصوصيتك
          </h2>
          <p>
            نُدرك أن المعلومات الصحية من أكثر البيانات الشخصية حساسيةً. سياستنا
            واضحة:
            <strong>
              {" "}
              بياناتك لن تُباع أبدًا ولن تُشارك مع جهات خارجية لأغراض تسويقية
            </strong>
            . نجمع ما هو ضروري فقط لتقديم الخدمة وتحسينها.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٢. البيانات التي نجمعها
          </h2>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-800">بيانات الحساب:</p>
              <p>
                الاسم، رقم الهاتف، البريد الإلكتروني (اختياري)، كلمة المرور
                (مُشفرة ومحمية).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">البيانات الصحية:</p>
              <p>
                نص الاستشارات الطبية والمرفقات التي ترفعها. هذه البيانات مُشفرة
                في التخزين ولا يطلع عليها سوى الطبيب المعيّن لاستشارتك وفريق
                الإشراف الإداري المحدود عند الضرورة القصوى.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                وثائق التحقق (للأطباء والمدربين):
              </p>
              <p>
                الشهادات والتراخيص المهنية وبطاقة الهوية. تُخزن في نظام مشفر
                ويطلع عليها فريق المراجعة فقط. لا تظهر في أي استجابة عامة للـ
                API.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">بيانات الاستخدام:</p>
              <p>
                صفحات تزورها، مدة الجلسة، نوع الجهاز — لتحسين تجربة المستخدم
                فقط.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٣. كيف نحمي بياناتك
          </h2>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              تشفير البيانات الحساسة في حالة التخزين (Encryption at Rest).
            </li>
            <li>نقل البيانات دائمًا عبر اتصال مشفر (HTTPS / TLS).</li>
            <li>صلاحيات وصول محدودة وفق مبدأ «أدنى صلاحية ضرورية».</li>
            <li>
              سجل أثر لجميع عمليات الوصول للبيانات الحساسة من الفريق الإداري.
            </li>
            <li>جلسات تنتهي تلقائيًا لحماية حسابك.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٤. مشاركة البيانات
          </h2>
          <p>نشارك بياناتك فقط في الحالات التالية:</p>
          <ul className="list-disc ps-5 space-y-1 mt-2">
            <li>
              مع الطبيب المعيّن لاستشارتك (مقتصرة على محتوى الاستشارة فقط).
            </li>
            <li>
              مع مزودي الخدمة التقنية اللازمين لتشغيل المنصة (تخزين البيانات،
              الدفع الإلكتروني) وفق اتفاقيات سرية صارمة.
            </li>
            <li>حين تستوجبه جهة قانونية أو قضائية مختصة بأمر رسمي.</li>
            <li>لحماية سلامة مستخدم في خطر فوري ظاهر.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">٥. حقوقك</h2>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              <strong>حق الاطلاع:</strong> طلب نسخة من جميع بياناتك المخزنة.
            </li>
            <li>
              <strong>حق التصحيح:</strong> تصحيح أي معلومات خاطئة.
            </li>
            <li>
              <strong>حق الحذف:</strong> طلب حذف حسابك وجميع بياناتك المرتبطة
              به.
            </li>
            <li>
              <strong>حق النقل:</strong> استلام بياناتك بصيغة قابلة للقراءة
              الآلية.
            </li>
          </ul>
          <p className="mt-3">
            لممارسة أي من هذه الحقوق، راسلنا على:{" "}
            <strong>privacy@medconnect.app</strong>
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٦. الاحتفاظ بالبيانات
          </h2>
          <p>
            تُحتفظ بيانات الحساب طالما كان الحساب نشطًا. عند طلب الحذف، تُحذف
            بيانات الحساب والاستشارات خلال 30 يومًا، مع الاحتفاظ بسجلات لاغراض
            قانونية أو مالية لا تتجاوز ما تستوجبه الأنظمة المحلية.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            ٧. التواصل بشأن الخصوصية
          </h2>
          <p>
            أسئلة؟ مخاوف؟ راسلنا على <strong>privacy@medconnect.app</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
