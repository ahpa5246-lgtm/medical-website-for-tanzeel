import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen, GraduationCap, Search } from "lucide-react"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  isContentDemo,
  listContent,
  type ContentEntry,
  type ContentKind,
} from "./contentRepository"

export default function ContentList({ kind }: { kind: ContentKind }) {
  const [entries, setEntries] = useState<ContentEntry[] | null>(null)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [reload, setReload] = useState(0)
  const { session } = useAuth()
  const course = kind === "course"
  const base = course ? "/courses" : "/library"

  useEffect(() => {
    let active = true
    listContent(kind)
      .then((value) => active && setEntries(value))
      .catch(() => active && setError("تعذر تحميل المحتوى الآن."))
    return () => {
      active = false
    }
  }, [kind, reload])

  const filtered = useMemo(
    () =>
      (entries ?? []).filter((entry) =>
        `${entry.title} ${entry.summary} ${entry.category}`
          .toLocaleLowerCase("ar")
          .includes(search.trim().toLocaleLowerCase("ar")),
      ),
    [entries, search],
  )

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f8f7] pb-20">
      <section className="border-b border-teal-100 bg-gradient-to-l from-[#e7f7f4] to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-sm font-black text-teal-700">
            {course ? "تعلّم خطوة بخطوة" : "معرفة يمكن الرجوع إليها"}
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-900 sm:text-5xl">
            {course ? "الأكاديمية" : "المكتبة"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            {course
              ? "دورات منشورة بدروس وأسئلة قصيرة. افتحي دورة لتجربة مسار التعلم الحقيقي."
              : "مراجع ومقالات قابلة للتحرير والمراجعة والنشر، منظّمة للقراءة بوضوح."}
          </p>
          {isContentDemo() && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              بيانات عرض تجريبية؛ التحرير والنشر هنا محفوظان في هذا المتصفح فقط.
            </p>
          )}
          {(isContentDemo() || session) && (
            <Link
              to={`${base}/manage`}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 py-2 font-bold text-white hover:bg-teal-900"
            >
              مساحة التحرير <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <label className="relative block max-w-lg">
          <span className="sr-only">
            ابحثي في {course ? "الدورات" : "المكتبة"}
          </span>
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحثي بالعنوان أو التصنيف"
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white py-3 pe-4 ps-12 pr-12 text-base shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </label>
        {error && (
          <div className="mt-8">
            <ErrorState
              description={error}
              onRetry={() => {
                setError("")
                setReload((value) => value + 1)
              }}
            />
          </div>
        )}
        {!entries && !error && (
          <div className="mt-8">
            <LoadingState label="جارٍ تحميل المحتوى…" />
          </div>
        )}
        {entries && !error && filtered.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="لا توجد نتائج"
              description={
                search ? "جرّبي كلمة بحث أخرى." : "لم يُنشر محتوى بعد."
              }
            />
          </div>
        )}
        {filtered.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-800">
                  {course ? <GraduationCap /> : <BookOpen />}
                </span>
                <p className="mt-5 text-xs font-bold text-teal-700">
                  {entry.category}
                </p>
                <h2 className="mt-2 text-xl font-black leading-8 text-slate-900">
                  {entry.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {entry.summary}
                </p>
                <p className="mt-5 text-xs text-slate-500">
                  بقلم {entry.author_name}
                  {course ? ` · ${entry.lessons.length} دروس` : ""}
                </p>
                <Link
                  to={`${base}/${entry.id}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-teal-800 hover:underline"
                >
                  {course ? "ابدئي التعلم" : "اقرئي المرجع"}{" "}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
