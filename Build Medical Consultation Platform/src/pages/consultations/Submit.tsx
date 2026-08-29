import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  MessageCircle,
  ChevronDown,
  AlertTriangle,
  Info,
  Upload,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import EmergencyBanner from "@/components/EmergencyBanner"
import { SPECIALTIES } from "@/data/specialties"
import { detectEmergency } from "@/lib/emergency"

const MAX_CHARS = 2000
export default function SubmitConsultation() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    title: "",
    description: "",
    specialty: params.get("specialty") || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEmergency, setIsEmergency] = useState(false)
  const [dismissedEmergency, setDismissedEmergency] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleDescChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setForm((f) => ({ ...f, description: val }))
    const emergency = detectEmergency(val)
    if (emergency && !dismissedEmergency) setIsEmergency(true)
    if (!emergency) setIsEmergency(false)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.trim().length < 5)
      e.title = "العنوان مطلوب (5 أحرف على الأقل)"
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = "يرجى وصف حالتك بتفصيل أكثر (20 حرفًا على الأقل)"
    if (!form.specialty) e.specialty = "يرجى اختيار تخصص طبي"
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 700)
  }

  if (submitted) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary-50 text-primary-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="mt-6 text-xs font-bold text-primary-700">
          اكتمل اختبار النموذج
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">
          مسار الاستشارة جاهز للربط
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-slate-600">
          لم تُرسل الاستشارة ولم تُحفظ أي قيمة. هذا النموذج الأولي بلا خادم؛
          النتيجة المعروضة محاكاة واجهة فقط.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/consultations">
            <Button>عرض نموذج الاستشارات</Button>
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-50"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" /> تعديل النموذج
          </button>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span>استشارة جديدة</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          اطرح سؤالك الطبي
        </h1>
        <p className="text-slate-600 text-sm">
          اختبر الواجهة ببيانات خيالية فقط. لا يوجد طبيب أو توجيه أو إرسال فعلي.
        </p>
      </div>

      {/* Medical disclaimer - always visible */}
      <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>تذكير:</strong> هذه ليست خدمة طبية. لا تُدخل تفاصيل حالة
          حقيقية.{" "}
          <Link
            to="/legal/disclaimer"
            className="underline font-medium hover:text-amber-900"
          >
            التنويه الطبي الكامل
          </Link>
        </p>
      </div>

      {/* Emergency banner */}
      {isEmergency && !dismissedEmergency && (
        <div className="mb-6">
          <EmergencyBanner onDismiss={() => setDismissedEmergency(true)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            التخصص الطبي <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.specialty}
              onChange={(e) =>
                setForm((f) => ({ ...f, specialty: e.target.value }))
              }
              className={`w-full appearance-none rounded-xl border px-4 py-2.5 pe-10 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors ${
                errors.specialty
                  ? "border-red-400"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <option value="">اختر التخصص...</option>
              {SPECIALTIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.specialty && (
            <p className="mt-1.5 text-xs text-red-600">{errors.specialty}</p>
          )}
        </div>

        {/* Title */}
        <Input
          label="عنوان الاستشارة"
          placeholder="مثال: ألم في الظهر عند الجلوس لفترات طويلة"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
          required
          hint="عنوان موجز يصف شكواك الرئيسية"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            وصف الحالة <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={7}
            placeholder={`صِف حالتك بالتفصيل:\n• متى بدأت الأعراض؟\n• أين يتمركز الألم؟\n• هل تتناول أدوية حالية؟\n• هل لديك أمراض مزمنة؟`}
            value={form.description}
            onChange={handleDescChange}
            maxLength={MAX_CHARS}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors ${
              errors.description
                ? "border-red-400"
                : "border-slate-200 hover:border-slate-300"
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description}</p>
            ) : (
              <p className="text-xs text-slate-500">
                كلما كان الوصف أكثر تفصيلًا، كان الرد أدق
              </p>
            )}
            <span
              className={`text-xs ${
                form.description.length > MAX_CHARS * 0.9
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {form.description.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            مرفقات (صور أو تقارير) — اختياري
          </label>
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center"
            aria-disabled="true"
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              اختيار الملفات معطّل في النموذج الأولي
            </p>
            <p className="text-xs text-slate-400 mt-1">
              لا يمكن اختيار أو رفع أي ملف، ولا تُدخل تقارير أو صورًا حقيقية.
            </p>
          </div>
        </div>

        <p className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-700">
          لا يوفر هذا النموذج تشفيرًا أو إخفاء هوية أو إرسالًا أو حفظًا أو مراجعة
          من طبيب. استخدم نصًا خياليًا فقط.
        </p>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          loading={loading}
        >
          <MessageCircle className="w-5 h-5" />
          إرسال الاستشارة
        </Button>
      </form>
    </div>
  )
}
