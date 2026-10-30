import { Link } from "react-router-dom"
import { ArrowLeft, BookOpenText, Construction } from "lucide-react"

export default function UnavailableService({ service }: { service: string }) {
  return (
    <section
      dir="rtl"
      aria-labelledby="service-unavailable-title"
      className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center"
    >
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-700" aria-hidden="true">
        <Construction className="h-8 w-8" />
      </span>
      <h1 id="service-unavailable-title" className="text-3xl font-black text-ink">
        {service} قيد التطوير
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600">
        هذه الخدمة غير متاحة حاليًا. لا تُرسل بيانات شخصية أو معلومات طبية.
        لا توجد طلبات أو مواعيد أو مراجعات فعلية في هذه النسخة.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <Link to="/articles" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white">
          <BookOpenText className="h-4 w-4" aria-hidden="true" /> مقالات تجريبية
        </Link>
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> العودة للرئيسية
        </Link>
      </div>
    </section>
  )
}
