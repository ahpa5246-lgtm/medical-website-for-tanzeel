import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { listContent } from "./contentRepository"
import type { ContentItem, ContentKind } from "./types"
const titles = {
  article: "المعرفة الصحية",
  course: "الأكاديمية",
  resource: "المكتبة",
}
export const contentPath = (kind: ContentKind) =>
  kind === "article" ? "/articles" : kind === "course" ? "/courses" : "/library"
export default function ContentList({ kind }: { kind: ContentKind }) {
  const { profile } = useAuth()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<ContentItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    const timer = setTimeout(() => {
      listContent(kind, query, page)
        .then((result) => {
          if (active) {
            setItems(result.items)
            setCount(result.count)
          }
        })
        .catch(() => {
          if (active) setError("تعذر تحميل المحتوى. أعيدي المحاولة.")
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 200)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [kind, query, page, retry])
  return (
    <section dir="rtl" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-ink">{titles[kind]}</h1>
      <p className="mt-3 text-sm text-slate-600">
        المحتوى المنشور بعد المراجعة. لا تُعرض المسودات للعامة.
      </p>
      <label className="mt-6 block max-w-lg">
        <span className="text-sm font-bold">البحث في المحتوى</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          className="mt-2 w-full rounded-xl border p-3"
        />
      </label>
      {profile && ["owner", "admin", "editor"].includes(profile.role) && (
        <Link
          className="mt-5 inline-block font-bold text-primary-700 underline"
          to={`/articles/new?kind=${kind}`}
        >
          إضافة محتوى
        </Link>
      )}
      {loading ? (
        <p role="status" className="py-12">
          جارٍ التحميل…
        </p>
      ) : error ? (
        <div role="alert" className="py-8">
          <p>{error}</p>
          <button
            className="mt-3 rounded-xl border p-3"
            onClick={() => setRetry((v) => v + 1)}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`${contentPath(kind)}/${item.id}`}
                className="rounded-2xl border bg-white p-5 transition-colors hover:border-primary-500"
              >
                <p className="text-xs text-primary-700">{item.category}</p>
                <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.body.slice(0, 240)}
                </p>
              </Link>
            ))}
          </div>
          {!items.length && (
            <p role="status" className="py-12">
              {query ? "لا توجد نتائج لهذا البحث." : "لم يُنشر محتوى بعد."}
            </p>
          )}
          <nav aria-label="صفحات المحتوى" className="mt-6 flex gap-3">
            <button
              disabled={page === 1}
              className="rounded-xl border p-3 disabled:opacity-40"
              onClick={() => setPage((v) => v - 1)}
            >
              السابق
            </button>
            <span className="p-3">{page}</span>
            <button
              disabled={page * 12 >= count}
              className="rounded-xl border p-3 disabled:opacity-40"
              onClick={() => setPage((v) => v + 1)}
            >
              التالي
            </button>
          </nav>
        </>
      )}
    </section>
  )
}
