import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { ALL_STAGES } from "@/pages/training/trainingPath.mjs"
export default function AdminTraining() {
  const [stage, setStage] = useState(ALL_STAGES[0].id)
  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [questions, setQuestions] = useState([
    { prompt: "", options: ["", ""] },
  ])
  const [answers, setAnswers] = useState([0])
  const [published, setPublished] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const { error } = await supabase.rpc("save_training_task", {
        p_stage_id: stage,
        p_title: title,
        p_instructions: instructions,
        p_questions: questions,
        p_answers: answers,
        p_published: published,
      })
      if (error) throw error
      setMessage(
        published
          ? "حُفظ النشاط ونُشر بعد اعتمادك."
          : "حُفظ النشاط كمسودة غير متاحة للمتعلمين.",
      )
    } catch {
      setError("تعذر الحفظ. راجعي الحقول والصلاحيات.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-black">إعداد الأنشطة التدريبية</h1>
      <p className="mt-3 text-sm leading-7">
        لا تنشري مادة سريرية قبل مراجعتها من مختص. استبدال نشاط قائم يحدّث
        أسئلته، ولا يمنح المتعلمين نقاطًا جديدة لمجرد التغيير.
      </p>
      <form className="mt-5 space-y-5" onSubmit={save}>
        <label className="block">
          المرحلة
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
          >
            {ALL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          عنوان النشاط
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={200}
            required
            className="mt-2 w-full rounded-xl border p-3"
          />
        </label>
        <label className="block">
          تعليمات النشاط
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            minLength={20}
            maxLength={5000}
            required
            className="mt-2 w-full rounded-xl border p-3"
          />
        </label>
        {questions.map((q, index) => (
          <fieldset key={index} className="space-y-3 rounded-xl border p-4">
            <legend className="font-bold">السؤال {index + 1}</legend>
            <label className="block">
              نص السؤال
              <input
                value={q.prompt}
                onChange={(e) =>
                  setQuestions((old) =>
                    old.map((v, i) =>
                      i === index ? { ...v, prompt: e.target.value } : v,
                    ),
                  )
                }
                minLength={5}
                maxLength={500}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>
            {q.options.map((option, o) => (
              <label key={o} className="block">
                الاختيار {o + 1}
                <input
                  value={option}
                  onChange={(e) =>
                    setQuestions((old) =>
                      old.map((v, i) =>
                        i === index
                          ? {
                              ...v,
                              options: v.options.map((x, j) =>
                                j === o ? e.target.value : x,
                              ),
                            }
                          : v,
                      ),
                    )
                  }
                  maxLength={500}
                  required
                  className="mt-2 w-full rounded-xl border p-3"
                />
              </label>
            ))}
            <label className="block">
              الإجابة الصحيحة
              <select
                value={answers[index]}
                onChange={(e) =>
                  setAnswers((old) =>
                    old.map((v, i) =>
                      i === index ? Number(e.target.value) : v,
                    ),
                  )
                }
                className="ms-3 rounded-xl border p-3"
              >
                <option value={0}>الاختيار الأول</option>
                <option value={1}>الاختيار الثاني</option>
              </select>
            </label>
          </fieldset>
        ))}
        <button
          type="button"
          disabled={questions.length >= 10}
          className="rounded-xl border p-3"
          onClick={() => {
            setQuestions((v) => [...v, { prompt: "", options: ["", ""] }])
            setAnswers((v) => [...v, 0])
          }}
        >
          إضافة سؤال
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          اعتمدت المحتوى وأريد نشره
        </label>
        <button
          disabled={busy}
          className="rounded-xl bg-primary-600 p-3 text-white"
        >
          {busy ? "جارٍ الحفظ…" : "حفظ النشاط"}
        </button>
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
