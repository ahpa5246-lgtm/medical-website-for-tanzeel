import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/AsyncState"
import {
  completeLesson,
  getCompletedLessons,
  getContent,
  isContentDemo,
  type ContentEntry,
  type ContentKind,
} from "./contentRepository"

export default function ContentDetail({ kind }: { kind: ContentKind }) {
  const { id = "" } = useParams()
  const [entry, setEntry] = useState<ContentEntry | null | undefined>()
  const [error, setError] = useState("")
  const [lessonIndex, setLessonIndex] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const base = kind === "course" ? "/courses" : "/library"

  useEffect(() => {
    let active = true
    getContent(id)
      .then((value) => {
        if (active) setEntry(value?.kind === kind ? value : null)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل المحتوى.")
      })
    if (kind === "course")
      getCompletedLessons(id)
        .then((value) => active && setCompleted(value))
        .catch(() => {})
    return () => {
      active = false
    }
  }, [id, kind])

  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (entry === undefined) return <LoadingState label="جارٍ تحميل المحتوى…" />
  if (!entry)
    return (
      <EmptyState
        title="المحتوى غير موجود"
        description="قد يكون غير منشور أو تغيّر رابطه."
      />
    )

  const lesson = entry.lessons[lessonIndex]
  const correct = lesson && answer === lesson.correct_index

  async function finishLesson() {
    if (!entry || !correct) return
    try {
      await completeLesson(entry.id, lessonIndex)
      setCompleted((current) => [...new Set([...current, lessonIndex])])
    } catch {
      setError("تعذر حفظ التقدم. سجّلي الدخول أو أعيدي المحاولة.")
    }
  }

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
        <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-black text-teal-700">{entry.category}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-600">
            {entry.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>بقلم {entry.author_name}</span>
            {isContentDemo() && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">
                محتوى عرض تجريبي
              </span>
            )}
          </div>
          <div className="mt-8 space-y-5 border-t border-slate-100 pt-8 text-base leading-9 text-slate-700">
            {entry.body.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {kind === "library" && entry.source_url && (
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center font-bold text-teal-800 underline"
            >
              افتحي المصدر الأصلي
            </a>
          )}
          {kind === "course" && (
            <section className="mt-10 border-t border-slate-100 pt-8">
              <h2 className="text-2xl font-black text-slate-900">الدروس</h2>
              <p className="mt-2 text-sm text-slate-600">
                أكملتِ {completed.length} من {entry.lessons.length} دروس على هذا
                الحساب أو المتصفح.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
                <nav aria-label="دروس الدورة" className="space-y-2">
                  {entry.lessons.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setLessonIndex(index)
                        setAnswer(null)
                      }}
                      aria-current={lessonIndex === index ? "step" : undefined}
                      className={`flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-right font-bold ${
                        lessonIndex === index
                          ? "bg-teal-800 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-teal-50"
                      }`}
                    >
                      <span>
                        {index + 1}. {item.title}
                      </span>
                      {completed.includes(index) && (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                  ))}
                </nav>
                {lesson && (
                  <div className="rounded-2xl border border-slate-200 p-5 sm:p-7">
                    <h3 className="text-xl font-black text-slate-900">
                      {lesson.title}
                    </h3>
                    <p className="mt-4 whitespace-pre-line text-base leading-9 text-slate-700">
                      {lesson.body}
                    </p>
                    <fieldset className="mt-8 space-y-3">
                      <legend className="mb-3 font-black text-slate-900">
                        {lesson.question}
                      </legend>
                      {lesson.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-teal-400"
                        >
                          <input
                            type="radio"
                            name={`answer-${lessonIndex}`}
                            checked={answer === index}
                            onChange={() => setAnswer(index)}
                            className="accent-teal-700"
                          />
                          {option}
                        </label>
                      ))}
                    </fieldset>
                    {answer !== null && (
                      <p
                        role="status"
                        className={`mt-4 text-sm font-bold ${
                          correct ? "text-emerald-700" : "text-amber-800"
                        }`}
                      >
                        {correct
                          ? "إجابة صحيحة. يمكنك حفظ تقدمك."
                          : "راجعي الدرس ثم حاولي مجددًا."}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={!correct || completed.includes(lessonIndex)}
                      onClick={() => void finishLesson()}
                      className="mt-5 min-h-11 rounded-xl bg-teal-800 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {completed.includes(lessonIndex)
                        ? "أُكمل الدرس"
                        : "احفظي إكمال الدرس"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  )
}
