import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  listContent,
  reviewContent,
} from "@/features/content/contentRepository"
import type { ContentItem, ContentKind } from "@/features/content/types"
export default function AdminContent() {
  const { profile } = useAuth()
  const [kind, setKind] = useState<ContentKind>("article")
  const [items, setItems] = useState<ContentItem[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    listContent(kind, "", page, true)
      .then((r) => {
        if (active) {
          setItems(r.items)
          setCount(r.count)
        }
      })
      .catch(() => {
        if (active) setError("تعذر تحميل المحتوى.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [kind, page, refresh])
  async function transition(
    item: ContentItem,
    status: "published" | "archived" | "draft",
  ) {
    setBusy(item.id)
    setError("")
    try {
      await reviewContent(item, status)
      setRefresh((v) => v + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الحفظ.")
    } finally {
      setBusy(null)
    }
  }
  const canPublish = profile && ["owner", "admin"].includes(profile.role)
  return (
    <section>
      <h1 className="text-2xl font-black">المحتوى والمراجعة</h1>
      <label className="mt-5 block">
        نوع المحتوى
        <select
          className="ms-3 rounded-xl border p-2"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as ContentKind)
            setPage(1)
          }}
        >
          <option value="article">مقالات</option>
          <option value="course">الأكاديمية</option>
          <option value="resource">المكتبة</option>
        </select>
      </label>
      <Link
        className="mt-4 inline-block text-primary-700 underline"
        to={`/articles/new?kind=${kind}`}
      >
        إضافة محتوى
      </Link>
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
          <button
            className="ms-3 underline"
            onClick={() => setRefresh((v) => v + 1)}
          >
            إعادة التحميل
          </button>
        </p>
      )}
      {loading ? (
        <p role="status" className="mt-6">
          جارٍ التحميل…
        </p>
      ) : !items.length ? (
        <p className="mt-6">لا يوجد محتوى.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article className="rounded-xl border bg-white p-5" key={item.id}>
              <h2 className="font-bold">{item.title}</h2>
              <p className="mt-2 text-sm">{item.status}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                {item.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/articles/new?id=${item.id}`}
                  className="rounded-xl border p-3"
                >
                  تحرير
                </Link>
                {canPublish && (
                  <>
                    <button
                      disabled={busy === item.id}
                      onClick={() => void transition(item, "published")}
                      className="rounded-xl bg-primary-600 p-3 text-white"
                    >
                      اعتماد ونشر
                    </button>
                    <button
                      disabled={busy === item.id}
                      onClick={() => void transition(item, "draft")}
                      className="rounded-xl border p-3"
                    >
                      إرجاع للمسودة
                    </button>
                    <button
                      disabled={busy === item.id}
                      onClick={() => void transition(item, "archived")}
                      className="rounded-xl border p-3"
                    >
                      إخفاء
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <nav className="mt-5 flex gap-3" aria-label="صفحات إدارة المحتوى">
        <button
          disabled={page === 1}
          onClick={() => setPage((v) => v - 1)}
          className="rounded-xl border p-3"
        >
          السابق
        </button>
        <button
          disabled={page * 12 >= count}
          onClick={() => setPage((v) => v + 1)}
          className="rounded-xl border p-3"
        >
          التالي
        </button>
      </nav>
    </section>
  )
}
