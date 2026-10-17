import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  listActiveSpecialties,
  type SpecialtyOption,
} from "@/features/consultations/consultationRepository"
import {
  loadVerification,
  submitVerification,
  uploadVerification,
} from "@/features/content/contentRepository"
import type { VerificationRecord } from "@/features/content/types"
export default function VerificationApplication() {
  const { session } = useAuth()
  const [record, setRecord] = useState<VerificationRecord | null>(null)
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    license: "",
    experience: "0",
    bio: "",
    consent: false,
  })
  useEffect(() => {
    let active = true
    if (!session) return
    Promise.all([listActiveSpecialties(), loadVerification(session.user.id)])
      .then(([options, records]) => {
        if (!active) return
        setSpecialties(options)
        const old = records[0]
        if (old) {
          setRecord(old)
          setForm({
            name: old.full_name,
            specialty: old.specialty_id,
            license: old.license_number,
            experience: String(old.experience),
            bio: old.bio,
            consent: old.consent,
          })
        }
      })
      .catch(() => {
        if (active) setError("تعذر تحميل الطلب أو التخصصات.")
      })
    return () => {
      active = false
    }
  }, [session?.user.id])
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    setMessage("")
    let saved: VerificationRecord | null = null
    try {
      saved = await submitVerification(form)
      setRecord(saved)
      if (file) {
        await uploadVerification(saved, file)
        setFile(null)
      }
      setMessage(
        "حُفظ الطلب وأُرسل للمراجعة. لا يمنح الطلب صلاحية طبيب قبل التحقق.",
      )
    } catch (e) {
      setError(
        saved
          ? "حُفظ الطلب لكن تعذر رفع الوثيقة. يمكنك إعادة رفعها دون إنشاء طلب جديد."
          : e instanceof Error
            ? e.message
            : "تعذر الحفظ.",
      )
    } finally {
      setBusy(false)
    }
  }
  if (!session)
    return (
      <section className="mx-auto max-w-xl p-10">
        <h1>التحقق المهني</h1>
        <Link
          to="/auth/login?returnTo=%2Fverification%2Fapply"
          className="underline"
        >
          سجلي الدخول لتقديم الطلب
        </Link>
      </section>
    )
  const locked = record?.status === "approved" || record?.status === "rejected"
  return (
    <section dir="rtl" className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black">طلب تحقق مهني</h1>
      {record && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p>
            حالة الطلب:{" "}
            {
              {
                pending: "قيد المراجعة",
                approved: "مقبول",
                rejected: "مرفوض",
                needs_information: "يحتاج معلومات",
              }[record.status]
            }
          </p>
          <p>{record.review_note}</p>
        </div>
      )}
      <form onSubmit={submit} className="mt-6 space-y-5">
        <fieldset disabled={busy || locked} className="space-y-5">
          <label className="block">
            الاسم الكامل
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={120}
              required
              className="mt-2 w-full rounded-xl border p-3"
            />
          </label>
          <label className="block">
            التخصص
            <select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              required
              className="mt-2 w-full rounded-xl border p-3"
            >
              <option value="">اختاري التخصص</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_ar}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            رقم الإجازة أو النقابة
            <input
              value={form.license}
              onChange={(e) => setForm({ ...form, license: e.target.value })}
              maxLength={100}
              required
              className="mt-2 w-full rounded-xl border p-3"
            />
          </label>
          <label className="block">
            سنوات الخبرة
            <input
              type="number"
              min={0}
              max={80}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="mt-2 w-full rounded-xl border p-3"
            />
          </label>
          <label className="block">
            نبذة مهنية
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={2000}
              rows={4}
              className="mt-2 w-full rounded-xl border p-3"
            />
          </label>
          <label className="block">
            وثيقة تحقق خاصة — PDF أو صورة حتى 5 ميغابايت
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full"
            />
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              required
            />
            أقر بصحة المعلومات وأفهم أن الصلاحيات لا تُمنح تلقائيًا.
          </label>
          <button className="rounded-xl bg-primary-600 p-3 text-white">
            {busy ? "جارٍ الحفظ…" : "حفظ وإرسال الطلب"}
          </button>
        </fieldset>
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
