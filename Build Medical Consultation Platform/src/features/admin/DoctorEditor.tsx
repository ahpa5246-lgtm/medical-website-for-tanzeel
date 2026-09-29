import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Button from "@/components/ui/Button"
import { LoadingState } from "@/components/system/AsyncState"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  DoctorRevisionConflict,
  getAdminDoctor,
  listSpecialties,
  listProviderCandidates,
  saveDoctor,
  transitionDoctor,
} from "./adminRepository"
import DoctorPreview from "./DoctorPreview"
import {
  clearRecoveryDraft,
  EMPTY_DOCTOR_DRAFT,
  loadRecoveryDraft,
  saveRecoveryDraft,
  validateDoctorDraft,
  type DoctorDraft,
} from "./doctorDraft"
import { uploadDoctorImage } from "./imageUpload"

interface SpecialtyOption {
  id: string
  name_ar: string
}
interface ProviderCandidate {
  id: string
  display_name: string
  status: string
  requested_role: string | null
}

export default function DoctorEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const recoveryId = id ?? "new"
  const [draft, setDraft] = useState<DoctorDraft>(EMPTY_DOCTOR_DRAFT)
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [providers, setProviders] = useState<ProviderCandidate[]>([])
  const [revision, setRevision] = useState<number | undefined>()
  const [doctorId, setDoctorId] = useState(id)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState(validateDoctorDraft(EMPTY_DOCTOR_DRAFT))
  const canPublish = profile?.role === "owner" || profile?.role === "admin"

  useEffect(() => {
    void Promise.all([listSpecialties(), listProviderCandidates()])
      .then(([specialtyRows, providerRows]) => {
        setSpecialties(specialtyRows)
        setProviders(providerRows as ProviderCandidate[])
      })
      .catch(() => setMessage("تعذر تحميل بيانات الإدارة."))
    const recovered = loadRecoveryDraft(recoveryId)
    if (recovered) setDraft(recovered)
    if (!id) return
    void getAdminDoctor(id)
      .then((doctor) => {
        if (!recovered)
          setDraft({
            display_name: doctor.display_name,
            specialty_id: doctor.specialty_id,
            bio: doctor.bio,
            profile_kind: doctor.profile_kind,
            provider_user_id: doctor.provider_user_id,
            verification_status:
              doctor.verification_status as DoctorDraft["verification_status"],
            languages: doctor.languages,
            interests: doctor.interests,
            image_path: doctor.image_path,
            image_alt: doctor.image_alt,
          })
        setRevision(doctor.revision)
      })
      .catch(() => setMessage("تعذر تحميل الملف."))
      .finally(() => setLoading(false))
  }, [id, recoveryId])

  useEffect(() => {
    const timer = window.setTimeout(
      () => saveRecoveryDraft(recoveryId, draft),
      500,
    )
    return () => window.clearTimeout(timer)
  }, [draft, recoveryId])

  const invalid = useMemo(() => Object.keys(errors).length > 0, [errors])
  const change = <K extends keyof DoctorDraft,>(
    key: K,
    value: DoctorDraft[K],
  ) => {
    const next = { ...draft, [key]: value }
    setDraft(next)
    setErrors(validateDoctorDraft(next))
  }

  const persist = async () => {
    const nextErrors = validateDoctorDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setMessage("راجع الحقول المطلوبة قبل الحفظ.")
      return null
    }
    setSaving(true)
    setMessage("")
    try {
      const saved = await saveDoctor({ ...draft, id: doctorId }, revision)
      setDoctorId(saved.id)
      setRevision(saved.revision)
      clearRecoveryDraft(recoveryId)
      setMessage("تم حفظ الملف بنجاح.")
      if (!id) navigate(`/admin/doctors/${saved.id}`, { replace: true })
      return saved
    } catch (error) {
      setMessage(
        error instanceof DoctorRevisionConflict
          ? "تعارض في التعديلات. حدّث الصفحة وقارن النسخة الأحدث قبل إعادة الحفظ."
          : "تعذر الحفظ. بقيت المسودة محفوظة على هذا الجهاز ويمكنك المحاولة مجددًا.",
      )
      return null
    } finally {
      setSaving(false)
    }
  }

  const moveTo = async (
    status: "review" | "published" | "draft" | "archived",
  ) => {
    const saved = doctorId ? { id: doctorId, revision } : await persist()
    if (!saved?.id || saved.revision === undefined) return
    if (
      status === "archived" &&
      !window.confirm("هل تريد أرشفة هذا الملف؟ لن يظهر للعامة.")
    )
      return
    setSaving(true)
    try {
      const result = await transitionDoctor(saved.id, status, saved.revision)
      setRevision(result.revision)
      setMessage("تم تحديث حالة النشر.")
    } catch (error) {
      setMessage(
        error instanceof DoctorRevisionConflict
          ? "تعارض في التعديلات. أعد تحميل النسخة الأحدث."
          : "تعذر تحديث حالة النشر.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="جارٍ تحميل الملف…" />
  const field =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-bold text-primary-700">إدارة المحتوى</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">
          {id ? "تحرير ملف طبيب" : "إضافة ملف طبيب"}
        </h1>
      </div>
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)]">
        <form
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault()
            void persist()
          }}
          noValidate
        >
          <label className="block text-sm font-bold text-slate-800">
            الاسم العربي
            <input
              className={field}
              value={draft.display_name}
              onChange={(e) => change("display_name", e.target.value)}
              aria-invalid={Boolean(errors.display_name)}
            />
            {errors.display_name && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.display_name}
              </span>
            )}
          </label>
          <label className="block text-sm font-bold text-slate-800">
            التخصص
            <select
              className={field}
              value={draft.specialty_id}
              onChange={(e) => change("specialty_id", e.target.value)}
            >
              <option value="">اختر التخصص</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_ar}
                </option>
              ))}
            </select>
            {errors.specialty_id && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.specialty_id}
              </span>
            )}
          </label>
          <label className="block text-sm font-bold text-slate-800">
            نوع الملف
            <select
              className={field}
              value={draft.profile_kind}
              onChange={(e) =>
                change(
                  "profile_kind",
                  e.target.value as DoctorDraft["profile_kind"],
                )
              }
            >
              <option value="fictional_demo">ملف تعريفي تجريبي</option>
              <option value="real_provider">مزود حقيقي (يتطلب تحققًا)</option>
            </select>
          </label>
          {draft.profile_kind === "real_provider" && (
            <>
              <label className="block text-sm font-bold text-slate-800">
                حساب الطبيب المسجل
                <select
                  className={field}
                  value={draft.provider_user_id ?? ""}
                  onChange={(e) =>
                    change("provider_user_id", e.target.value || null)
                  }
                >
                  <option value="">اختر حساب الطبيب</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.display_name}
                    </option>
                  ))}
                </select>
                {errors.provider_user_id && (
                  <span className="mt-1 block text-xs text-red-700">
                    {errors.provider_user_id}
                  </span>
                )}
              </label>
              <label className="block text-sm font-bold text-slate-800">
                حالة التحقق
                <select
                  className={field}
                  value={draft.verification_status}
                  onChange={(e) =>
                    change(
                      "verification_status",
                      e.target.value as DoctorDraft["verification_status"],
                    )
                  }
                >
                  <option value="pending">بانتظار التحقق</option>
                  <option value="verified">تم التحقق</option>
                  <option value="rejected">مرفوض</option>
                  <option value="suspended">موقوف</option>
                </select>
              </label>
            </>
          )}
          <label className="block text-sm font-bold text-slate-800">
            النبذة
            <textarea
              className={field}
              rows={8}
              value={draft.bio}
              onChange={(e) => change("bio", e.target.value)}
            />
            {errors.bio && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.bio}
              </span>
            )}
          </label>
          <label className="block text-sm font-bold text-slate-800">
            اللغات (افصل بفاصلة)
            <input
              className={field}
              value={draft.languages.join("، ")}
              onChange={(e) =>
                change(
                  "languages",
                  e.target.value
                    .split(/[،,]/)
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <label className="block text-sm font-bold text-slate-800">
            مجالات الاهتمام
            <input
              className={field}
              value={draft.interests.join("، ")}
              onChange={(e) =>
                change(
                  "interests",
                  e.target.value
                    .split(/[،,]/)
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <label className="block text-sm font-bold text-slate-800">
            الصورة
            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  const targetId = doctorId ?? crypto.randomUUID()
                  const path = await uploadDoctorImage(file, targetId)
                  setDoctorId(targetId)
                  change("image_path", path)
                  setMessage("تم رفع الصورة. احفظ الملف لإتمام الربط.")
                } catch (error) {
                  setMessage(
                    error instanceof Error ? error.message : "تعذر رفع الصورة.",
                  )
                }
              }}
            />
          </label>
          <label className="block text-sm font-bold text-slate-800">
            النص البديل للصورة
            <input
              className={field}
              value={draft.image_alt}
              onChange={(e) => change("image_alt", e.target.value)}
            />
            {errors.image_alt && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.image_alt}
              </span>
            )}
          </label>
          {message && (
            <p
              role="status"
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700"
            >
              {message}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={saving} disabled={invalid}>
              حفظ المسودة
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void moveTo("review")}
              disabled={saving}
            >
              إرسال للمراجعة
            </Button>
            {canPublish && (
              <Button
                type="button"
                variant="accent"
                onClick={() => void moveTo("published")}
                disabled={saving}
              >
                نشر الملف
              </Button>
            )}
            {doctorId && (
              <Button
                type="button"
                variant="danger"
                onClick={() => void moveTo("archived")}
                disabled={saving}
              >
                أرشفة
              </Button>
            )}
          </div>
        </form>
        <DoctorPreview draft={draft} />
      </div>
    </div>
  )
}
