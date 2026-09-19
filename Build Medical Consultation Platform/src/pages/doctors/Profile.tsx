import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowRight, Languages, Sparkles } from "lucide-react"
import DoctorKindBadge from "@/features/doctors/DoctorKindBadge"
import {
  doctorImageUrl,
  getPublishedDoctorBySlug,
} from "@/features/doctors/doctorRepository"
import type { DoctorCardRecord } from "@/features/doctors/types"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"

export default function DoctorProfile() {
  const { id: slug = "" } = useParams()
  const [doctor, setDoctor] = useState<DoctorCardRecord | null | undefined>()
  const [error, setError] = useState("")

  useEffect(() => {
    setDoctor(undefined)
    getPublishedDoctorBySlug(slug)
      .then(setDoctor)
      .catch(() => setError("تعذر تحميل الملف الآن."))
  }, [slug])

  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (doctor === undefined) return <LoadingState label="جارٍ تحميل الملف…" />
  if (!doctor)
    return (
      <EmptyState
        title="الملف غير موجود"
        description="قد يكون الملف غير منشور أو تغيّر رابطه."
      />
    )

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 py-10">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-[18rem_1fr]">
          <img
            src={doctorImageUrl(doctor.image_path)}
            alt={doctor.image_alt}
            width="640"
            height="800"
            className="h-full min-h-72 w-full object-cover"
          />
          <div className="p-7 sm:p-10">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-700"
            >
              <ArrowRight className="h-4 w-4" /> العودة إلى الدليل
            </Link>
            <div className="mt-6">
              <DoctorKindBadge kind={doctor.profile_kind} />
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">
              {doctor.display_name}
            </h1>
            <p className="mt-2 font-bold text-primary-700">
              {doctor.specialties?.name_ar}
            </p>
            <p className="mt-6 leading-8 text-slate-600">{doctor.bio}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl bg-slate-50 p-4">
                <h2 className="flex items-center gap-2 font-black text-slate-900">
                  <Languages className="h-4 w-4" /> اللغات
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {doctor.languages.join("، ")}
                </p>
              </section>
              <section className="rounded-2xl bg-slate-50 p-4">
                <h2 className="flex items-center gap-2 font-black text-slate-900">
                  <Sparkles className="h-4 w-4" /> مجالات الاهتمام
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {doctor.interests.join("، ")}
                </p>
              </section>
            </div>
            {doctor.profile_kind === "fictional_demo" ? (
              <p className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                هذه شخصية افتراضية توضح تجربة المنصة فقط. لا يمكن طلب استشارة أو
                الاعتماد عليها كمقدم رعاية حقيقي.
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </main>
  )
}
