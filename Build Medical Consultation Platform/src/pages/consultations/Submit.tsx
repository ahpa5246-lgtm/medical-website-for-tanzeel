import { useState, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  MessageCircle,
  Paperclip,
  X,
  ChevronDown,
  AlertTriangle,
  Info,
  Lock,
  Shield,
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
const MAX_ATTACHMENTS = 3

export default function SubmitConsultation() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    title: "",
    description: params.get("q") || "",
    specialty: params.get("specialty") || "",
    isAnonymous: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attachments, setAttachments] = useState<File[]>([])
  const [isEmergency, setIsEmergency] = useState(false)
  const [dismissedEmergency, setDismissedEmergency] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDescChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setForm((f) => ({ ...f, description: val }))
    const emergency = detectEmergency(val)
    if (emergency && !dismissedEmergency) setIsEmergency(true)
    if (!emergency) setIsEmergency(false)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const allowed = files.filter((f) => {
      const okType = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ].includes(f.type)
      const okSize = f.size < 5 * 1024 * 1024 // 5 MB
      return okType && okSize
    })
    setAttachments((prev) => [...prev, ...allowed].slice(0, MAX_ATTACHMENTS))
    e.target.value = ""
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
          لم تُرسل الاستشارة ولم تُحفظ المرفقات لأن هذه نسخة معاينة بلا خادم آمن.
          بعد ربط الحسابات وقاعدة البيانات ستظهر هنا حالة التوجيه والطبيب
          المستجيب.
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
          اكتب التفاصيل التي يحتاجها الطبيب، وسيُوجّه السؤال إلى التخصص الصحيح بعد
          ربط الخدمة.
        </p>
      </div>

      {/* Medical disclaimer - always visible */}
      <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>تذكير:</strong> هذه الخدمة لأغراض إرشادية فقط وليست بديلًا عن
          الفحص المباشر. في العراق، اتصل بالطوارئ الموحد 911 أو الإسعاف الفوري
          122.{" "}
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
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              انقر لإرفاق صور أو تقارير
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG، PNG، PDF — حد أقصى 5 MB للملف — {MAX_ATTACHMENTS} ملفات
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            onChange={handleFile}
            className="hidden"
          />
          {attachments.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachments.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                >
                  <Paperclip className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="truncate flex-1 text-slate-700">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="حذف المرفق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Anonymity toggle */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer w-full">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) =>
                setForm((f) => ({ ...f, isAnonymous: e.target.checked }))
              }
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30"
            />
            <div>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary-600" />
                إرسال الاستشارة بشكل مجهول
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                يظهر اسمك للطبيب كـ «مريض #XXXX» فقط، ولن يعرف هويتك الحقيقية.
              </p>
            </div>
          </label>
        </div>

        {/* Trust note */}
        <div className="flex gap-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          <p>
            استشارتك مشفرة ومؤمنة. لن تُشارك مع أحد دون إذنك. يجيبك طبيب معتمد
            ومتحقق منه فقط.
          </p>
        </div>

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
