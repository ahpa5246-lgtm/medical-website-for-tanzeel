import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowRight, Plus, Trash2 } from "lucide-react"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  canAuthorContent,
  getContent,
  isContentDemo,
  publishContent,
  saveContent,
  submitContent,
  type ContentDraft,
  type ContentEntry,
  type ContentKind,
  type Lesson,
} from "./contentRepository"

const emptyLesson = (): Lesson => ({
  title: "",
  body: "",
  question: "",
  options: ["", ""],
  correct_index: 0,
})
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"

export default function ContentEditor({ kind }: { kind: ContentKind }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, profile, loading: authLoading } = useAuth()
  const demo = isContentDemo()
  const staff =
    profile?.role === "owner" ||
    profile?.role === "admin" ||
    profile?.role === "editor"
  const base = kind === "course" ? "/courses" : "/library"
  const [allowed, setAllowed] = useState<boolean | null>(demo ? true : null)
  const [entry, setEntry] = useState<ContentEntry | null>(null)
  const [draft, setDraft] = useState<ContentDraft>({
    kind,
    title: "",
    summary: "",
    body: "",
    category: "",
    author_name: "",
    lessons: kind === "course" ? [emptyLesson()] : [],
    source_url: "",
  })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (demo) return
    if (!session) {
      setAllowed(false)
      return
    }
    canAuthorContent()
      .then(setAllowed)
      .catch(() => setAllowed(false))
  }, [demo, session])

  useEffect(() => {
    if (!id) return
    let active = true
    getContent(id)
      .then((value) => {
        if (!active) return
        if (!value || value.kind !== kind) {
          setError("المسودة غير موجودة.")
          return
        }
        setEntry(value)
        setDraft({
          id: value.id,
          kind,
          title: value.title,
          summary: value.summary,
          body: value.body,
          category: value.category,
          author_name: value.author_name,
          lessons: value.lessons,
          source_url: value.source_url,
        })
      })
      .catch(() => active && setError("تعذر تحميل المسودة."))
    return () => {
      active = false
    }
  }, [id, kind])

  function updateLesson(index: number, value: Lesson) {
    setDraft((current) => ({
      ...current,
      lessons: current.lessons.map((lesson, at) =>
        at === index ? value : lesson,
      ),
    }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    try {
      const saved = await saveContent(
        {
          ...draft,
          author_name: demo ? draft.author_name : profile?.display_name || "",
        },
        entry?.revision,
      )
      setEntry(saved)
      setDraft((current) => ({ ...current, id: saved.id }))
      setMessage("حُفظت المسودة. يمكنك معاينتها أو إرسالها للنشر.")
      if (!id) navigate(`${base}/${saved.id}/edit`, { replace: true })
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "تعذر حفظ المسودة.")
    } finally {
      setBusy(false)
    }
  }

  async function publish() {
    if (!entry) return
    setBusy(true)
    setMessage("")
    try {
      const updated =
        demo || staff
          ? await publishContent(entry.id, entry.revision)
          : await submitContent(entry.id, entry.revision)
      setEntry(updated)
      setMessage(
        updated.status === "published"
          ? "نُشر المحتوى ويمكن رؤيته في القائمة الآن."
          : "أُرسلت المسودة للمراجعة قبل ظهورها للعامة.",
      )
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "تعذر تحديث حالة المحتوى.",
      )
    } finally {
      setBusy(false)
    }
  }

  if (authLoading && !demo)
    return <LoadingState label="جارٍ التحقق من الحساب…" />
  if (!demo && !session)
    return (
      <EmptyState
        title="سجّلي الدخول للتحرير"
        description="تحتاج مساحة التحرير إلى حساب معتمد."
      />
    )
  if (allowed === null)
    return <LoadingState label="جارٍ التحقق من صلاحية التحرير…" />
  if (!allowed && !staff)
    return (
      <EmptyState
        title="صلاحية التحرير بانتظار الاعتماد"
        description="يمكن للطبيب المعتمد أو المدرّس الموافق عليه إنشاء المحتوى. اطلبي اعتماد حسابك من إدارة المنصة."
      />
    )
  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (id && !entry) return <LoadingState label="جارٍ فتح المسودة…" />
  if (entry && !demo && !staff && entry.author_id !== session?.user.id)
    return (
      <EmptyState
        title="لا تملكين صلاحية تحرير هذا المحتوى"
        description="يمكنك تعديل منشوراتك فقط."
      />
    )

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f8f7] pb-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          to={`${base}/manage`}
          className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-800"
        >
          <ArrowRight className="h-4 w-4" /> مساحة التحرير
        </Link>
        <h1 className="mt-4 text-3xl font-black text-slate-900">
          {entry
            ? "تحرير المنشور"
            : `إنشاء ${kind === "course" ? "دورة" : "مرجع"} جديد`}
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {demo
            ? "معاينة تجريبية؛ الحفظ والنشر يظهران في هذا المتصفح فقط."
            : "احفظي مسودة، ثم أرسليها للمراجعة. ينشر فريق التحرير المحتوى المعتمد."}
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <form
            onSubmit={(event) => void save(event)}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <label className="block text-sm font-bold text-slate-800">
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
            <label className="block text-sm font-bold text-slate-800">
              التصنيف
              <input
                required
                minLength={2}
                maxLength={80}
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                className={inputClass}
                placeholder="مثل: مهارات صحية"
              />
            </label>
            {demo && (
              <label className="block text-sm font-bold text-slate-800">
                اسم الكاتب التجريبي
                <input
                  required
                  value={draft.author_name}
                  onChange={(event) =>
                    setDraft({ ...draft, author_name: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
            )}
            <label className="block text-sm font-bold text-slate-800">
              ملخص البطاقة
              <textarea
                required
                minLength={20}
                maxLength={500}
                rows={3}
                value={draft.summary}
                onChange={(event) =>
                  setDraft({ ...draft, summary: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-bold text-slate-800">
              {kind === "course" ? "مقدمة الدورة" : "نص المرجع"}
              <textarea
                required
                minLength={30}
                rows={8}
                value={draft.body}
                onChange={(event) =>
                  setDraft({ ...draft, body: event.target.value })
                }
                className={inputClass}
              />
            </label>
            {kind === "library" && (
              <label className="block text-sm font-bold text-slate-800">
                رابط المصدر الأصلي، إن وجد
                <input
                  type="url"
                  pattern="https://.*"
                  value={draft.source_url}
                  onChange={(event) =>
                    setDraft({ ...draft, source_url: event.target.value })
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>
            )}
            {kind === "course" && (
              <section className="space-y-5 border-t border-slate-100 pt-6">
                <h2 className="text-xl font-black text-slate-900">
                  الدروس والأسئلة
                </h2>
                {draft.lessons.map((lesson, index) => (
                  <fieldset
                    key={index}
                    className="space-y-4 rounded-2xl border border-teal-100 bg-teal-50/30 p-5"
                  >
                    <legend className="px-2 font-black text-teal-900">
                      الدرس {index + 1}
                    </legend>
                    <label className="block text-sm font-bold">
                      عنوان الدرس
                      <input
                        required
                        value={lesson.title}
                        onChange={(event) =>
                          updateLesson(index, {
                            ...lesson,
                            title: event.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="block text-sm font-bold">
                      المحتوى
                      <textarea
                        required
                        rows={5}
                        value={lesson.body}
                        onChange={(event) =>
                          updateLesson(index, {
                            ...lesson,
                            body: event.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="block text-sm font-bold">
                      سؤال المراجعة
                      <input
                        required
                        value={lesson.question}
                        onChange={(event) =>
                          updateLesson(index, {
                            ...lesson,
                            question: event.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                    {lesson.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="block text-sm font-bold"
                      >
                        الخيار {optionIndex + 1}
                        <input
                          required
                          value={option}
                          onChange={(event) =>
                            updateLesson(index, {
                              ...lesson,
                              options: lesson.options.map((current, at) =>
                                at === optionIndex
                                  ? event.target.value
                                  : current,
                              ),
                            })
                          }
                          className={inputClass}
                        />
                      </label>
                    ))}
                    <label className="block text-sm font-bold">
                      الإجابة الصحيحة
                      <select
                        value={lesson.correct_index}
                        onChange={(event) =>
                          updateLesson(index, {
                            ...lesson,
                            correct_index: Number(event.target.value),
                          })
                        }
                        className={inputClass}
                      >
                        {lesson.options.map((_, optionIndex) => (
                          <option key={optionIndex} value={optionIndex}>
                            الخيار {optionIndex + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    {draft.lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            lessons: draft.lessons.filter(
                              (_, at) => at !== index,
                            ),
                          })
                        }
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-red-700"
                      >
                        <Trash2 className="h-4 w-4" /> حذف الدرس
                      </button>
                    )}
                  </fieldset>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lessons: [...draft.lessons, emptyLesson()],
                    })
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-700 px-4 font-bold text-teal-800"
                >
                  <Plus className="h-4 w-4" /> أضيفي درسًا
                </button>
              </section>
            )}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={busy}
                className="min-h-11 rounded-xl bg-teal-800 px-6 font-bold text-white disabled:opacity-50"
              >
                حفظ المسودة
              </button>
              {entry && entry.status !== "published" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void publish()}
                  className="min-h-11 rounded-xl border border-teal-700 px-5 font-bold text-teal-800 disabled:opacity-50"
                >
                  {demo
                    ? "نشر تجريبي"
                    : staff
                      ? "نشر المحتوى"
                      : "إرسال للمراجعة"}
                </button>
              )}
              {entry?.status === "published" && (
                <Link
                  to={`${base}/${entry.id}`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-teal-700 px-5 font-bold text-teal-800"
                >
                  شاهدي المنشور
                </Link>
              )}
            </div>
            {message && (
              <p
                role="status"
                className="rounded-xl bg-teal-50 px-4 py-3 text-sm leading-7 text-teal-900"
              >
                {message}
              </p>
            )}
          </form>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs font-black text-teal-700">معاينة مباشرة</p>
            <h2 className="mt-3 text-xl font-black leading-8 text-slate-900">
              {draft.title || "عنوان المنشور"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {draft.summary || "سيظهر الملخص هنا في بطاقة القائمة."}
            </p>
            <p className="mt-5 text-xs text-slate-500">
              {draft.author_name || profile?.display_name || "اسم الكاتب"} ·{" "}
              {draft.category || "التصنيف"}
            </p>
            {kind === "course" && (
              <p className="mt-4 text-sm font-bold text-teal-800">
                {draft.lessons.length} دروس
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
