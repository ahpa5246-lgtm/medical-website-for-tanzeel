import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  getContent,
  getLearningState,
  setLearningState,
} from "./contentRepository"
import type { ContentItem, ContentKind } from "./types"
import { contentPath } from "./ContentList"
import { validateReport } from "./validation.mjs"
export default function ContentDetail({ kind }: { kind: ContentKind }) {
  const operationId = useRef(crypto.randomUUID())
  const { id = "" } = useParams()
  const { session } = useAuth()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState("")
  const [reportOpen, setReportOpen] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    getContent(id)
      .then(async (data) => {
        if (!active) return
        if (!data || data.kind !== kind) {
          setItem(null)
          return
        }
        setItem(data)
        if (session && kind !== "article") {
          const value = await getLearningState(id, kind, session.user.id)
          if (active) setSaved(value)
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
  }, [id, kind, session?.user.id])
  async function toggle() {
    if (!session) return
    setBusy(true)
    setError("")
    try {
      await setLearningState(id, kind, session.user.id, !saved)
      setSaved(!saved)
    } catch {
      setError("تعذر حفظ التغيير.")
    } finally {
      setBusy(false)
    }
  }
  async function report(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    const validation = validateReport({ contentId: id, reason })
    if (!validation.ok) {
      setMessage(validation.message)
      return
    }
    setBusy(true)
    setMessage("")
    try {
      const response = await fetch("/api/content-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          contentId: id,
          reason,
          operationId: operationId.current,
        }),
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error()
      setMessage("حُفظ البلاغ للمراجعة.")
      setReason("")
      operationId.current = crypto.randomUUID()
    } catch {
      setMessage("تعذر إرسال البلاغ. بقي النص محفوظًا هنا لإعادة المحاولة.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <article dir="rtl" className="mx-auto max-w-3xl px-4 py-10">
      <Link
        className="font-bold text-primary-700 underline"
        to={contentPath(kind)}
      >
        العودة إلى القائمة
      </Link>
      {loading ? (
        <p role="status" className="py-10">
          جارٍ التحميل…
        </p>
      ) : !item ? (
        <p role="status" className="py-10">
          المحتوى غير موجود أو غير متاح.
        </p>
      ) : (
        <>
          <p className="mt-7 text-sm text-primary-700">{item.category}</p>
          <h1 className="mt-2 text-3xl font-black">{item.title}</h1>
          <p className="mt-3 text-xs text-slate-500">
            آخر تحديث: {new Date(item.updated_at).toLocaleDateString("ar-IQ")}
          </p>
          <div className="mt-8 whitespace-pre-wrap text-base leading-9">
            {item.body}
          </div>
          {session && kind !== "article" && (
            <button
              disabled={busy}
              onClick={() => void toggle()}
              className="mt-8 rounded-xl bg-primary-600 px-5 py-3 text-white"
            >
              {kind === "course"
                ? saved
                  ? "إلغاء علامة الإكمال"
                  : "تعليم المحتوى كمكتمل"
                : saved
                  ? "إزالة من المحفوظات"
                  : "حفظ المورد"}
            </button>
          )}
          <div className="mt-10 border-t pt-5">
            {session ? (
              <button
                className="font-bold text-primary-700 underline"
                aria-expanded={reportOpen}
                onClick={() => setReportOpen((v) => !v)}
              >
                الإبلاغ عن مشكلة في المحتوى
              </button>
            ) : (
              <Link className="text-primary-700 underline" to="/auth/login">
                سجلي الدخول لحفظ التقدم أو إرسال بلاغ
              </Link>
            )}
            {reportOpen && (
              <form onSubmit={report} className="mt-4">
                <label
                  htmlFor="report-reason"
                  className="block text-sm font-bold"
                >
                  سبب البلاغ
                </label>
                <textarea
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={1000}
                  className="mt-2 w-full rounded-xl border p-3"
                />
                <button
                  disabled={busy}
                  className="mt-3 rounded-xl bg-primary-600 p-3 text-white"
                >
                  {busy ? "جارٍ الإرسال…" : "إرسال البلاغ"}
                </button>
                <p role="status" className="mt-3 text-sm">
                  {message}
                </p>
              </form>
            )}
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
    </article>
  )
}
