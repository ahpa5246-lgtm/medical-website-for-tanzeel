import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  FileLock2,
  Info,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { SPECIALTIES } from "@/data/specialties"

export default function VerificationApplication() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    license: "",
    experience: "",
    bio: "",
    consent: false,
  })
  const [error, setError] = useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name || !form.specialty || !form.license || !form.consent) {
      setError("أكمل الحقول المطلوبة ووافق على إقرار صحة المعلومات.")
      return
    }
    setError("")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary-50 text-primary-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-black text-ink">
          تمت معاينة مسار الطلب
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-slate-600">
          لم تُحفظ البيانات ولم تُرفع مستندات. ولا توجد مراجعة أو حالة طلب أو سجل
          تدقيق في هذا النموذج.
        </p>
        <Link to="/">
          <Button className="mt-8">العودة للرئيسية</Button>
        </Link>
      </div>
    )
  }

  return (
    <div dir="rtl" className="pb-20">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" /> الرئيسية
          </Link>
          <div className="mt-7 grid gap-8 md:grid-cols-[1fr_18rem] md:items-end">
            <div>
              <p className="text-xs font-bold text-primary-300">
                التحقق المهني
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                الثقة تبدأ قبل أول إجابة.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
                هذا تصور خيالي لواجهة تحقق لم تُنفذ؛ لا يوجد مسؤول مراجعة أو
                صلاحيات أو أطباء حقيقيون.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
              <ShieldCheck className="mb-3 h-6 w-6 text-primary-300" />
              الطلب يمر بالحالات: مسودة ← قيد المراجعة ← مقبول أو يحتاج معلومات.
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-7 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <form
          onSubmit={submit}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-ink">المعلومات المهنية</h2>
              <p className="text-xs text-slate-500">حقول معاينة لبنية الطلب</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input
              label="الاسم الرباعي"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                التخصص <span className="text-red-500">*</span>
              </label>
              <select
                value={form.specialty}
                onChange={(event) =>
                  setForm({ ...form, specialty: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">اختر التخصص</option>
                {SPECIALTIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="رقم الإجازة أو النقابة"
              value={form.license}
              onChange={(event) =>
                setForm({ ...form, license: event.target.value })
              }
              required
            />
            <Input
              label="سنوات الخبرة"
              type="number"
              min="0"
              value={form.experience}
              onChange={(event) =>
                setForm({ ...form, experience: event.target.value })
              }
            />
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              نبذة مهنية
            </label>
            <textarea
              rows={5}
              value={form.bio}
              onChange={(event) =>
                setForm({ ...form, bio: event.target.value })
              }
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="flex gap-3">
              <FileLock2 className="h-6 w-6 shrink-0 text-primary-700" />
              <div>
                <p className="text-sm font-bold text-ink">
                  رفع الوثائق معطّل في المعاينة
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  سيُفعّل فقط بعد ربط تخزين خاص وروابط موقّتة. لا ترفع هوية أو
                  ترخيصًا هنا.
                </p>
              </div>
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) =>
                setForm({ ...form, consent: event.target.checked })
              }
              className="mt-1"
            />
            أقر بأن المعلومات صحيحة وأفهم أن الصلاحيات لن تُمنح قبل المراجعة.
          </label>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="mt-6 w-full">
            معاينة إرسال الطلب
          </Button>
        </form>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-primary-100 bg-primary-50 p-5">
            <Info className="h-5 w-5 text-primary-700" />
            <h2 className="mt-3 text-sm font-black text-ink">
              من يرى الوثائق؟
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              لا أحد؛ اختيار الوثائق ورفعها معطّلان بالكامل في هذا النموذج.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs leading-6 text-slate-500">
            <p className="font-black text-ink">قبل الإطلاق</p>
            <p className="mt-2">
              يلزم اعتماد قائمة التخصصات، وتحديد مسؤول المراجعة وزمن الاستجابة
              المتوقع.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
