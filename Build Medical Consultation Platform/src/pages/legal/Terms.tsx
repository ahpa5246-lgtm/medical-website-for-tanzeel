import { Link } from "react-router-dom"

export default function Terms() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black text-slate-900">شروط الاستخدام</h1>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        آخر تحديث: 29 سبتمبر 2026. يجب مراجعة هذه الشروط قانونيًا وفق بلد تشغيل
        الخدمة قبل استقبال مدفوعات أو مرضى حقيقيين.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-8 text-slate-700">
        <section>
          <h2 className="text-lg font-black text-slate-900">طبيعة الخدمة</h2>
          <p>
            المنصة تنظّم التواصل والاستشارات عن بُعد والمحتوى الصحي، لكنها لا
            تستبدل الفحص السريري أو خدمات الطوارئ ولا تضمن تشخيصًا أو نتيجة
            علاجية.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">الحساب</h2>
          <p>
            يجب استخدام بيانات صحيحة للحساب وعدم مشاركة بيانات الدخول. طلب
            التسجيل كطبيب لا يمنح صلاحيات طبية تلقائيًا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">مقدمو الخدمة</h2>
          <p>
            لا يجوز لحساب أن يجيب بصفة طبيب إلا بعد تحقق الإدارة وربط الحساب
            بملف مقدم خدمة. الملفات الموسومة «تجريبية» شخصيات غير حقيقية ولا
            يجوز التعامل معها كمقدمي خدمة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">
            المحتوى والاستشارات
          </h2>
          <p>
            لا تنشر معلومات لا تملك حق مشاركتها. تحتفظ الإدارة بحق إزالة المحتوى
            المخالف أو تقييد الحسابات عند الحاجة لحماية المستخدمين والخدمة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">المدفوعات</h2>
          <p>
            لا تعتبر أي استشارة مدفوعة إلا بعد تأكيد بوابة الدفع المعتمدة من
            الخادم. وجود سجل دفع في الواجهة أو قاعدة البيانات وحده لا يثبت تحصيل
            المال.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">الخصوصية</h2>
          <p>
            استخدام الخدمة يخضع أيضًا إلى{" "}
            <Link
              className="font-bold text-primary-700 underline"
              to="/legal/privacy"
            >
              سياسة الخصوصية
            </Link>{" "}
            و
            <Link
              className="font-bold text-primary-700 underline"
              to="/legal/disclaimer"
            >
              التنويه الطبي
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
