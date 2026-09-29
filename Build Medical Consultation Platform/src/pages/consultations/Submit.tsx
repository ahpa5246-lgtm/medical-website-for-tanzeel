import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertTriangle, Upload } from "lucide-react"
import Button from "@/components/ui/Button"
import EmergencyBanner from "@/components/EmergencyBanner"
import { detectEmergency } from "@/lib/emergency"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  createConsultation,
  listActiveSpecialties,
  uploadAttachment,
  type SpecialtyOption,
} from "@/features/consultations/consultationRepository"

const MAX_CHARS = 5000

export default function SubmitConsultation() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    title: "",
    description: "",
    specialty: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const emergency = detectEmergency(form.description)

  useEffect(() => {
    listActiveSpecialties()
      .then((items) => {
        setSpecialties(items)
        const requested = params.get("specialty")
        if (requested) {
          const match = items.find(
            (specialty) =>
              specialty.id === requested || specialty.slug === requested,
          )
          if (match)
            setForm((value) => ({ ...value, specialty: match.id }))
        }
      })
      .catch(() => setError("تعذر تحميل التخصصات من قاعدة البيانات."))
  }, [params])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!session)
      return setError("سجّل الدخول أولًا حتى تُحفظ الاستشارة باسم حسابك.")

    if (
      form.title.trim().length < 5 ||
      form.description.trim().length < 20 ||
      !form.specialty
    )
      return setError("أكمل التخصص والعنوان ووصف الحالة قبل الإرسال.")

    if (files.some((file) => file.size > 10 * 1024 * 1024))
      return setError("حجم كل مرفق يجب ألا يتجاوز 10MB.")

    setLoading(true)
    setError("")
    try {
      const consultation = await createConsultation({
        patientId: session.user.id,
        specialtyId: form.specialty,
        subject: form.title,
        body: form.description,
        emergencyFlag: emergency,
      })
      for (const file of files)
        await uploadAttachment(consultation.id, file)
      navigate(`/consultations/${consultation.id}`)
    } catch {
      setError(
        "تعذر حفظ الاستشارة. تحقق من اتصال قاعدة البيانات ثم أعد المحاولة.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">استشارة جديدة</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          تُحفظ الاستشارة في حسابك، ولا يراها إلا أنت والطبيب المعيّن والإدارة
          الطبية المخوّلة.
        </p>
      </div>

      {emergency && (
        <div className="mb-6">
          <EmergencyBanner />
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
        <AlertTriangle className="mb-2 h-5 w-5" />
        الخدمة لا تستبدل الطوارئ أو الفحص المباشر. لا تنتظر رد المنصة إذا كانت
        الحالة عاجلة.
      </div>

      {!session && (
        <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900">
          تحتاج إلى{" "}
          <Link className="font-bold underline" to="/auth/login">
            تسجيل الدخول
          </Link>{" "}
          قبل الإرسال.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm font-bold text-slate-700">
          التخصص
          <select
            value={form.specialty}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                specialty: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="">اختر التخصص</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name_ar}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-700">
          عنوان الاستشارة
          <input
            value={form.title}
            onChange={(event) =>
              setForm((value) => ({ ...value, title: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            maxLength={160}
            placeholder="مثال: ألم متكرر عند الحركة"
          />
        </label>

        <label className="block text-sm font-bold text-slate-700">
          وصف الحالة
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                description: event.target.value,
              }))
            }
            className="mt-2 min-h-44 w-full rounded-xl border border-slate-200 px-4 py-3 leading-7"
            maxLength={MAX_CHARS}
            placeholder="اكتب الأعراض، مدتها، الأدوية الحالية وأي معلومات مهمة."
          />
          <span className="mt-1 block text-xs text-slate-400">
            {form.description.length}/{MAX_CHARS}
          </span>
        </label>

        <label className="block rounded-2xl border-2 border-dashed border-slate-200 p-5 text-sm text-slate-600">
          <span className="mb-2 flex items-center gap-2 font-bold">
            <Upload className="h-4 w-4" />
            مرفقات اختيارية
          </span>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(event) =>
              setFiles(Array.from(event.target.files ?? []).slice(0, 5))
            }
          />
          <span className="mt-2 block text-xs text-slate-400">
            حتى 5 ملفات، وبحد أقصى 10MB للملف.
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!session}
        >
          حفظ وإرسال الاستشارة
        </Button>
      </form>
    </div>
  )
}
