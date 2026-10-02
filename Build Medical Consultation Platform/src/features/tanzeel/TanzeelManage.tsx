import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Plus, Save, Send, Archive } from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"
import { ErrorState, LoadingState } from "@/components/system/AsyncState"
import {
  archiveSpaceEntry,
  isSpaceDemo,
  listSpaceEntries,
  publishSpaceEntry,
  saveSpaceEntry,
  type SpaceDraft,
  type SpaceEntry,
  type SpaceKind,
} from "./spaceRepository"

const labels: Record<SpaceKind, string> = {
  book_review: "مراجعة كتاب",
  article: "مقال",
  achievement: "إنجاز",
  course: "دورة",
}

const emptyDraft = (): SpaceDraft => ({
  kind: "book_review",
  title: "",
  summary: "",
  body: "",
  rating: 5,
  link_url: "",
})

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-base text-slate-900 focus:border-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-100"

export default function TanzeelManage() {
  const { profile, loading: authLoading } = useAuth()
  const demo = isSpaceDemo()
  const allowed =
    demo || ["owner", "admin", "editor"].includes(profile?.role ?? "")
  const [entries, setEntries] = useState<SpaceEntry[] | null>(null)
  const [selected, setSelected] = useState<SpaceEntry | null>(null)
  const [draft, setDraft] = useState<SpaceDraft>(emptyDraft)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function refresh() {
    setEntries(await listSpaceEntries(true))
  }

  useEffect(() => {
    if (!allowed) return
    let active = true
    listSpaceEntries(true)
      .then((value) => {
        if (active) setEntries(value)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل منشورات مساحة تنزيل.")
      })
    return () => {
      active = false
    }
  }, [allowed])

  function choose(entry: SpaceEntry | null) {
    setSelected(entry)
    setDraft(
      entry
        ? {
            id: entry.id,
            kind: entry.kind,
            title: entry.title,
            summary: entry.summary,
            body: entry.body,
            rating: entry.rating,
            link_url: entry.link_url,
          }
        : emptyDraft(),
    )
    setMessage("")
    setError("")
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const saved = await saveSpaceEntry(draft, selected?.revision)
      choose(saved)
      await refresh()
      setMessage("حُفظت المسودة. انشريها بعد مراجعتها لتظهر للقراء.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر حفظ المسودة.")
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(status: "published" | "archived") {
    if (!selected) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const changed =
        status === "published"
          ? await publishSpaceEntry(selected.id, selected.revision)
          : await archiveSpaceEntry(selected.id, selected.revision)
      choose(changed)
      await refresh()
      setMessage(
        status === "published"
          ? "نُشر المنشور في مساحة تنزيل."
          : "أُرشف المنشور ولم يعد ظاهرًا للقراء.",
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تحديث المنشور.")
    } finally {
      setBusy(false)
    }
  }

  if (!demo && authLoading)
    return <LoadingState label="جارٍ التحقق من صلاحية التحرير…" />
  if (!allowed)
    return (
      <main dir="rtl" className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState
          title="هذه المساحة للمحررين"
          description="سجّلي الدخول بحساب إدارة معتمد لتحرير مساحة تنزيل."
        />
      </main>
    )

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#fff7fb] px-4 py-12 text-slate-900 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          to="/tanzeel"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#8c3566]"
        >
          <ArrowRight className="h-4 w-4" /> مساحة تنزيل
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#a34478]">
              لوحة النشر الشخصي
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#321d48] sm:text-4xl">
              تحرير مساحة تنزيل
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              أضيفي مراجعة كتاب أو مقالًا أو إنجازًا أو رابط دورة، ثم انشريه بعد
              التأكد من معلوماته.
            </p>
          </div>
          <button
            type="button"
            onClick={() => choose(null)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4b286c] px-5 font-bold text-white"
          >
            <Plus className="h-4 w-4" /> منشور جديد
          </button>
        </div>
        {demo && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            هذه معاينة: أمثلة المحتوى تجريبية، وأي تعديل تحفظينه هنا يبقى في هذا
            المتصفح فقط.
          </p>
        )}
        <div className="mt-8 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <h2 className="px-2 text-lg font-black text-[#321d48]">
              المنشورات
            </h2>
            {!entries && !error && (
              <p className="p-3 text-sm text-slate-500">جارٍ التحميل…</p>
            )}
            <div className="mt-3 space-y-2">
              {entries?.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => choose(entry)}
                  className={`w-full rounded-xl border p-3 text-right ${
                    selected?.id === entry.id
                      ? "border-pink-400 bg-pink-50"
                      : "border-transparent hover:bg-rose-50"
                  }`}
                >
                  <span className="block text-xs font-bold text-[#9c4273]">
                    {labels[entry.kind]} ·{" "}
                    {entry.status === "published"
                      ? "منشور"
                      : entry.status === "archived"
                        ? "مؤرشف"
                        : "مسودة"}
                  </span>
                  <strong className="mt-1 block text-sm leading-6">
                    {entry.title}
                  </strong>
                  {entry.is_demo && (
                    <span className="text-xs text-slate-500">مثال تجريبي</span>
                  )}
                </button>
              ))}
            </div>
          </aside>
          <form
            onSubmit={save}
            className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-black text-[#321d48]">
              {selected ? "تعديل المنشور" : "منشور جديد"}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                القسم
                <select
                  value={draft.kind}
                  onChange={(event) => {
                    const kind = event.target.value as SpaceKind
                    setDraft({
                      ...draft,
                      kind,
                      rating: kind === "book_review" ? 5 : null,
                    })
                  }}
                  className={inputClass}
                >
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {draft.kind === "book_review" && (
                <label className="block text-sm font-bold">
                  التقييم من 5
                  <select
                    value={draft.rating ?? 5}
                    onChange={(event) =>
                      setDraft({ ...draft, rating: Number(event.target.value) })
                    }
                    className={inputClass}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} من 5
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block text-sm font-bold sm:col-span-2">
                العنوان
                <input
                  required
                  minLength={8}
                  maxLength={180}
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-bold sm:col-span-2">
                الملخص الظاهر في البطاقة
                <textarea
                  required
                  minLength={20}
                  maxLength={500}
                  rows={2}
                  value={draft.summary}
                  onChange={(event) =>
                    setDraft({ ...draft, summary: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-bold sm:col-span-2">
                النص الكامل
                <textarea
                  required
                  minLength={30}
                  maxLength={30000}
                  rows={7}
                  value={draft.body}
                  onChange={(event) =>
                    setDraft({ ...draft, body: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-bold sm:col-span-2">
                رابط اختياري للدورة أو المصدر
                <input
                  type="text"
                  inputMode="url"
                  dir="ltr"
                  placeholder="/courses/… أو https://…"
                  value={draft.link_url}
                  onChange={(event) =>
                    setDraft({ ...draft, link_url: event.target.value })
                  }
                  className={inputClass}
                />
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                  يُقبل رابط HTTPS أو رابط دورة/مقال منشور داخل الموقع.
                </span>
              </label>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-800"
              >
                {message}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3 border-t border-rose-100 pt-6">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4b286c] px-5 font-bold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> حفظ المسودة
              </button>
              {selected && selected.status !== "published" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus("published")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b3487e] px-5 font-bold text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> نشر الآن
                </button>
              )}
              {selected && selected.status !== "archived" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus("archived")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-5 font-bold text-slate-700 disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" /> أرشفة
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
