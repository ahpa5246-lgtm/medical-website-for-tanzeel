import { useEffect, useRef, useState } from "react"
import { getTrainingTask, submitTraining } from "./trainingRepository"
import type { TrainingTask } from "@/features/content/types"
export default function TaskPlayer({
  stageId,
  onClose,
  onComplete,
}: {
  stageId: string
  onClose: () => void
  onComplete: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const [task, setTask] = useState<TrainingTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<number[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    heading.current?.focus()
    getTrainingTask(stageId)
      .then((data) => {
        if (active) setTask(data)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل النشاط.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [stageId])
  async function finish(e: React.FormEvent) {
    e.preventDefault()
    if (
      !task ||
      answers.length !== task.questions.length ||
      answers.some((v) => v === undefined)
    )
      return
    setBusy(true)
    setError("")
    try {
      const passed = await submitTraining(stageId, answers)
      if (passed) onComplete()
      else
        setError("الإجابات تحتاج مراجعة. أعيدي قراءة التعليمات ثم حاولي مجددًا.")
    } catch {
      setError("تعذر حفظ النتيجة أو لم تكتمل المتطلبات السابقة.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className="mt-6 rounded-2xl border bg-white p-6"
      aria-label="النشاط التدريبي"
    >
      <h2
        ref={heading}
        tabIndex={-1}
        className="text-xl font-bold outline-none"
      >
        {task?.title || "النشاط التدريبي"}
      </h2>
      {loading ? (
        <p role="status" className="mt-4">
          جارٍ تحميل النشاط…
        </p>
      ) : !task ? (
        <p className="mt-4">
          لم يُنشر نشاط معتمد لهذه المرحلة بعد. لا تُمنح نقاط بمجرد الضغط على
          البدء.
        </p>
      ) : (
        <form onSubmit={finish}>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
            {task.instructions}
          </p>
          {task.questions.map((question, index) => (
            <fieldset key={index} className="mt-5">
              <legend className="font-bold">{question.prompt}</legend>
              {question.options.map((option, value) => (
                <label
                  key={value}
                  className="mt-2 flex items-center gap-2 rounded-xl border p-3"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    required
                    checked={answers[index] === value}
                    onChange={() =>
                      setAnswers((old) => {
                        const next = [...old]
                        next[index] = value
                        return next
                      })
                    }
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button
            disabled={busy}
            className="mt-6 rounded-xl bg-primary-600 p-3 text-white"
          >
            {busy ? "جارٍ التحقق…" : "التحقق وحفظ النتيجة"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        className="mt-4 rounded-xl border p-3"
        onClick={onClose}
      >
        إغلاق النشاط
      </button>
    </section>
  )
}
