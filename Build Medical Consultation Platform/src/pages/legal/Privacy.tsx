import { Link } from "react-router-dom"

export default function Privacy() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/" className="text-sm text-primary-600">
        ← العودة للرئيسية
      </Link>
      <h1 className="mt-8 text-3xl font-bold text-slate-900">
        إشعار خصوصية النموذج الأولي
      </h1>
      <div className="mt-6 space-y-5 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-8 text-amber-950">
        <p>
          <strong>هذا النموذج غير تشغيلي.</strong> لا توجد حسابات أو قاعدة
          بيانات أو خدمة إرسال أو تخزين أو فريق طبي خلف هذه الواجهة.
        </p>
        <p>
          لا تُدخل اسمًا أو رقم هاتف أو بريدًا أو كلمة مرور أو معلومات طبية حقيقية.
          القيم المكتوبة تبقى مؤقتًا داخل صفحة المتصفح لتجربة الواجهة، ولم ننفذ
          لها حفظًا أو إرسالًا.
        </p>
        <p>
          لا ندّعي توفير تشفير أو إخفاء هوية أو ضوابط وصول أو سجل تدقيق. كما لا
          توجد في النموذج بيانات مخزنة يمكن حذفها أو تصديرها.
        </p>
        <p>
          قبل أي إطلاق حقيقي، يلزم أن يراجع مختصون مستقلون الخصوصية والأمن
          والأساس القانوني وسياسات الاحتفاظ وحقوق المستخدمين.
        </p>
      </div>
    </div>
  )
}
