import { Link } from "react-router-dom"

export default function Privacy() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black text-slate-900">سياسة الخصوصية</h1>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        مسودة سياسة خصوصية تحتاج مراجعة قانونية قبل إطلاق الخدمات الفعلية.
        نسخة العرض العامة لا تستقبل حسابات أو استشارات أو ملفات طبية،
        والأقسام التفاعلية المغلقة لا تحفظ بيانات المستخدم.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-8 text-slate-700">
        <section>
          <h2 className="text-lg font-black text-slate-900">ما الذي نخزنه؟</h2>
          <p>
            بيانات الحساب الأساسية مثل الاسم والبريد ورقم الهاتف، والاستشارات
            التي يرسلها المستخدم، والرسائل والمرفقات والتقييمات المرتبطة بها،
            إضافة إلى سجلات تشغيل إدارية لازمة لحماية المنصة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">
            من يستطيع رؤية الاستشارة؟
          </h2>
          <p>
            المريض صاحب الاستشارة، والطبيب الذي تعيّنه الإدارة لها، وحسابات
            الإدارة الطبية المخوّلة فقط. محررو المحتوى لا تمنحهم قاعدة البيانات
            صلاحية قراءة السجلات الطبية.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">المرفقات</h2>
          <p>
            مرفقات الاستشارات تحفظ في مساحة تخزين خاصة وليست عامة، مع تقييد
            الأنواع والحجم. لا ترفع ملفًا لا تحتاجه للاستشارة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">الحسابات الطبية</h2>
          <p>
            اختيار «طبيب» أثناء التسجيل لا يمنح صلاحية الإجابة على المرضى. يلزم
            تحقق إداري وربط الحساب بملف مقدم خدمة قبل منحه وصولًا إلى استشارة
            معيّنة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">الاحتفاظ والحذف</h2>
          <p>
            يجب على مشغل النسخة المنشورة تحديد مدة الاحتفاظ المناسبة للبلد الذي
            يعمل فيه، وتوفير قناة موثقة لطلبات الوصول أو التصحيح أو التصدير أو
            الحذف. لا ينبغي إطلاق المنصة تجاريًا قبل تحديد هذه الإجراءات قانونيًا
            وتشغيليًا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900">الطوارئ</h2>
          <p>
            لا تستخدم المنصة للطوارئ ولا تنتظر ردًا منها إذا كانت الحالة تستدعي
            مساعدة عاجلة. راجع{" "}
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
