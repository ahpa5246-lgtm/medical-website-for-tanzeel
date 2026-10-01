import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Plus } from "lucide-react"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  canAuthorContent,
  isContentDemo,
  listMyContent,
  listReviewContent,
  type ContentEntry,
  type ContentKind,
} from "./contentRepository"

export default function ContentManage({ kind }: { kind: ContentKind }) {
  const { session, profile, loading } = useAuth()
  const [entries, setEntries] = useState<ContentEntry[] | null>(null)
  const [reviews, setReviews] = useState<ContentEntry[]>([])
  const [allowed, setAllowed] = useState<boolean | null>(
    isContentDemo() ? true : null,
  )
  const [error, setError] = useState("")
  const base = kind === "course" ? "/courses" : "/library"
  const staff =
    profile?.role === "owner" ||
    profile?.role === "admin" ||
    profile?.role === "editor"

  useEffect(() => {
    if (!isContentDemo() && !session) return
    let active = true
    listMyContent()
      .then(
        (value) =>
          active && setEntries(value.filter((entry) => entry.kind === kind)),
      )
      .catch(() => active && setError("تعذر تحميل المسودات."))
    if (!isContentDemo())
      canAuthorContent()
        .then((value) => active && setAllowed(value))
        .catch(() => active && setAllowed(false))
    if (staff)
      listReviewContent()
        .then(
          (value) =>
            active && setReviews(value.filter((entry) => entry.kind === kind)),
        )
        .catch(() => {})
    return () => {
      active = false
    }
  }, [kind, session, staff])

  if (loading && !isContentDemo())
    return <LoadingState label="جارٍ التحقق من الحساب…" />
  if (!isContentDemo() && !session)
    return (
      <EmptyState
        title="سجّلي الدخول للتحرير"
        description="تحتاج مساحة التحرير إلى حساب معتمد."
      />
    )
  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (allowed === null || entries === null)
    return <LoadingState label="جارٍ تحميل مساحة التحرير…" />
  if (!allowed && !staff)
    return (
      <EmptyState
        title="التحرير بانتظار الاعتماد"
        description="اطلبي من مالك المنصة اعتماد حساب المدرّس أو ربط ملف طبيب معتمد."
      />
    )

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f8f7] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          to={base}
          className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-800"
        >
          <ArrowRight className="h-4 w-4" /> العودة إلى{" "}
          {kind === "course" ? "الأكاديمية" : "المكتبة"}
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-teal-700">مساحة المؤلف</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {kind === "course" ? "إدارة الدورات" : "إدارة المكتبة"}
            </h1>
          </div>
          <Link
            to={`${base}/new`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 font-bold text-white"
          >
            <Plus className="h-4 w-4" />{" "}
            {kind === "course" ? "دورة جديدة" : "مرجع جديد"}
          </Link>
        </div>
        {isContentDemo() && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            هذه مساحة تجربة محلية. ما تنشرينه هنا يظهر في هذا المتصفح فقط، ولا
            يصل إلى زوار الموقع الآخرين.
          </p>
        )}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-black text-slate-900">
            منشوراتي ومسوداتي
          </h2>
          {entries.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-slate-600">
              لا توجد مسودات بعد. أنشئي أول منشور.
            </p>
          )}
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div>
                <span className="text-xs font-bold text-teal-700">
                  {entry.status === "published"
                    ? "منشور"
                    : entry.status === "review"
                      ? "قيد المراجعة"
                      : "مسودة"}
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {entry.author_name}
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  to={`${base}/${entry.id}/edit`}
                  className="font-bold text-teal-800 hover:underline"
                >
                  تحرير
                </Link>
                {entry.status === "published" && (
                  <Link
                    to={`${base}/${entry.id}`}
                    className="font-bold text-teal-800 hover:underline"
                  >
                    عرض
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>
        {staff && reviews.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              بانتظار مراجعة التحرير
            </h2>
            {reviews.map((entry) => (
              <article
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <h3 className="font-black text-slate-900">{entry.title}</h3>
                  <p className="text-sm text-slate-500">{entry.author_name}</p>
                </div>
                <Link
                  to={`${base}/${entry.id}/edit`}
                  className="font-bold text-teal-800"
                >
                  مراجعة ونشر
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
