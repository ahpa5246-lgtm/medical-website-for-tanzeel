import { useState } from "react"
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ShieldAlert,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ARTICLE_CATEGORIES } from "@/data/mockData"

export default function ArticleEditor() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (title.trim().length < 8 || !category || content.trim().length < 80) {
      setMessage(
        "أضف عنوانًا واضحًا، واختر التصنيف، واكتب 80 حرفًا على الأقل لمعاينة الإرسال.",
      )
      return
    }
    setMessage(
      "اكتمل اختبار المسودة. في الإنتاج ستنتقل إلى «قيد المراجعة» ولن تُنشر مباشرة.",
    )
  }

  return (
    <div dir="rtl" className="pb-20">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-bold text-primary-700">
            مساحة التحرير والمراجعة
          </p>
          <h1 className="mt-3 text-3xl font-black text-ink">
            اكتب للمريض، ثم راجع كطبيب.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            لا يوجد زر «نشر مباشر». كل محتوى طبي يمر بمراجعة الدليل والسلامة قبل
            ظهوره للعامة.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form
          onSubmit={submit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-ink">مسودة مقال</h2>
              <p className="text-xs text-slate-500">لن تُحفظ في نسخة المعاينة</p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <Input
              label="العنوان"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              hint="استخدم لغة مباشرة تتجنب التخويف أو الوعود."
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                التصنيف
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">اختر التصنيف</option>
                {ARTICLE_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                المحتوى
              </label>
              <textarea
                rows={14}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="ابدأ بالفكرة الأساسية، ثم ما يمكن فعله، ثم متى يجب طلب الرعاية..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7"
              />
              <p className="mt-1 text-left text-xs text-slate-400">
                {content.length} حرفًا
              </p>
            </div>
          </div>
          {message && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-primary-50 px-4 py-3 text-xs leading-6 text-primary-900"
            >
              {message}
            </p>
          )}
          <Button type="submit" size="lg" className="mt-6 w-full">
            إرسال إلى المراجعة
          </Button>
        </form>
        <aside className="space-y-4">
          <div className="rounded-3xl bg-ink p-5 text-white">
            <ClipboardCheck className="h-6 w-6 text-primary-300" />
            <h2 className="mt-4 font-black">قائمة المراجع الطبي</h2>
            <ul className="mt-4 space-y-3 text-xs leading-6 text-slate-300">
              {[
                "المعلومة مدعومة بدليل مناسب.",
                "لا توجد جرعات أو وعود خطرة.",
                "يُذكر متى يلزم الفحص المباشر.",
                "اللغة مفهومة ولا تُضخّم الخوف.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-300" />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-coral-200 bg-coral-50 p-5 text-xs leading-6 text-coral-900">
            <ShieldAlert className="mb-3 h-5 w-5 text-coral-600" />
            المقال الذي يفشل بند السلامة يعود للمؤلف مع سبب واضح؛ لا يُقبل بصمت
            ولا يُنشر جزئيًا.
          </div>
        </aside>
      </div>
    </div>
  )
}
