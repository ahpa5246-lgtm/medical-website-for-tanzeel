import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, Stethoscope } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import DemoLabel from "@/components/DemoLabel"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"
import DoctorKindBadge from "@/features/doctors/DoctorKindBadge"
import {
  doctorImageUrl,
  listPublishedDoctors,
} from "@/features/doctors/doctorRepository"
import type { DoctorPage } from "@/features/doctors/types"

export default function DoctorDirectory() {
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? ""
  const page = Math.max(1, Number(params.get("page")) || 1)
  const [result, setResult] = useState<DoctorPage | null>(null)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    setError("")
    setResult(null)
    const timer = window.setTimeout(() => {
      listPublishedDoctors({ query, page })
        .then((data) => active && setResult(data))
        .catch(() => active && setError("تعذر تحميل دليل الأطباء الآن."))
    }, 200)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query, page, reload])

  function updateSearch(value: string) {
    const next = new URLSearchParams(params)
    value.trim() ? next.set("q", value) : next.delete("q")
    next.delete("page")
    setParams(next)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-primary-100 bg-gradient-to-l from-primary-50 to-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-kicker">الدليل الطبي</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            تعرّفي إلى شكل شبكة الأطباء
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            الملفات الموسومة بالتجريبية شخصيات افتراضية للعرض، ولا تمثل أطباء
            حقيقيين أو خدمات متاحة للحجز.
          </p>
          <label className="relative mt-7 block max-w-xl">
            <span className="sr-only">ابحثي في دليل الأطباء</span>
            <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              defaultValue={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="الاسم أو التخصص أو مجال الاهتمام"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pe-4 ps-12 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </label>
        </div>
      </header>

      <section
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
        aria-live="polite"
      >
        {!result && !error ? (
          <LoadingState label="جارٍ تحميل الملفات المنشورة…" />
        ) : null}
        {error ? (
          <ErrorState
            description={error}
            onRetry={() => setReload((v) => v + 1)}
          />
        ) : null}
        {result?.doctors.length === 0 ? (
          <EmptyState
            title="لا توجد نتائج"
            description="جرّبي عبارة بحث أخرى أو أعيدي ضبط البحث."
          />
        ) : null}
        {result?.doctors.length ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {result.count} ملف منشور
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="overflow-hidden"
                  padding="none"
                >
                  <img
                    src={doctorImageUrl(doctor.image_path)}
                    alt={
                      doctor.image_alt ||
                      `صورة تعريفية لـ ${doctor.display_name}`
                    }
                    width="640"
                    height="480"
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-primary-50 object-cover"
                  />
                  <div className="space-y-4 p-5">
                    <DoctorKindBadge kind={doctor.profile_kind} />
                    {doctor.profile_kind === "fictional_demo" ? (
                      <DemoLabel>شخصية وصورة ومعلومات افتراضية</DemoLabel>
                    ) : null}
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {doctor.display_name}
                      </h2>
                      <p className="mt-1 text-sm font-bold text-primary-700">
                        {doctor.specialties?.name_ar}
                      </p>
                    </div>
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                      {doctor.bio}
                    </p>
                    <Link to={`/doctors/${doctor.slug}`} className="block">
                      <Button as="span" className="w-full justify-center gap-2">
                        <Stethoscope className="h-4 w-4" /> تعرّف إلى شكل الخدمة
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            <nav
              className="mt-8 flex justify-center gap-3"
              aria-label="صفحات دليل الأطباء"
            >
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setParams({ q: query, page: String(page - 1) })}
              >
                <ChevronRight className="h-4 w-4" /> السابق
              </Button>
              <Button
                variant="outline"
                disabled={page * 9 >= result.count}
                onClick={() => setParams({ q: query, page: String(page + 1) })}
              >
                التالي <ChevronLeft className="h-4 w-4" />
              </Button>
            </nav>
          </>
        ) : null}
      </section>
    </div>
  )
}
