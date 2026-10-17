import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { getContent, saveContent } from "@/features/content/contentRepository"
import type { ContentKind } from "@/features/content/types"
export default function ArticleEditor() {
  const { session, profile } = useAuth()
  const [params, setParams] = useSearchParams()
  const [id, setId] = useState(params.get("id") || "")
  const [revision, setRevision] = useState<number>()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState("")
  const [kind, setKind] = useState<ContentKind>(
    params.get("kind") === "course"
      ? "course"
      : params.get("kind") === "resource"
        ? "resource"
        : "article",
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    const target = params.get("id")
    if (!target || (target === id && revision)) return
    let active = true
    setBusy(true)
    getContent(target)
      .then((item) => {
        if (active && item) {
          setId(item.id)
          setRevision(item.revision)
          setTitle(item.title)
          setBody(item.body)
          setCategory(item.category)
          setKind(item.kind)
        }
      })
      .catch(() => {
        if (active) setError("تعذر تحميل المسودة.")
      })
      .finally(() => {
        if (active) setBusy(false)
      })
    return () => {
      active = false
    }
  }, [params.get("id")])
  async function save(status: "draft" | "review") {
    if (busy) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const item = await saveContent(
        { id: id || undefined, kind, title, body, category, status },
        revision,
      )
      setId(item.id)
      setRevision(item.revision)
      setParams({ id: item.id }, { replace: true })
      setMessage(
        status === "draft" ? "حُفظت المسودة." : "حُفظ المحتوى وأُرسل للمراجعة.",
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الحفظ.")
    } finally {
      setBusy(false)
    }
  }
  if (!session)
    return (
      <section className="mx-auto max-w-xl p-10">
        <h1>كتابة المحتوى</h1>
        <Link to="/auth/login?returnTo=%2Farticles%2Fnew" className="underline">
          سجلي الدخول أولًا
        </Link>
      </section>
    )
  return (
    <section dir="rtl" className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black">مسودة محتوى</h1>
      <p className="mt-3 text-sm text-slate-600">
        الحفظ يتم في حسابك؛ النشر يحتاج مراجعة وصلاحية مخولة.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        الدور الحالي: {profile?.role}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void save("review")
        }}
        className="mt-6 space-y-5"
      >
        <label className="block">
          النوع
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ContentKind)}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="article">مقال</option>
            <option value="course">محتوى أكاديمية</option>
            <option value="resource">مورد مكتبة</option>
          </select>
        </label>
        <label className="block">
          العنوان
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="mt-2 w-full rounded-xl border p-3"
          />
        </label>
        <label className="block">
          التصنيف
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={80}
            required
            className="mt-2 w-full rounded-xl border p-3"
          />
        </label>
        <label className="block">
          المحتوى
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={50000}
            rows={12}
            required
            className="mt-2 w-full rounded-xl border p-3 leading-8"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save("draft")}
            className="rounded-xl border p-3"
          >
            حفظ مسودة
          </button>
          <button
            disabled={busy}
            className="rounded-xl bg-primary-600 p-3 text-white"
          >
            إرسال إلى المراجعة
          </button>
        </div>
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
