import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Send, Star } from "lucide-react"
import type { Attachment } from "@/features/content/types"
import Button from "@/components/ui/Button"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  updateConsultationAdmin,
  listAttachments,
  attachmentUrl,
  getConsultation,
  listMessages,
  saveRating,
  sendMessage,
  type ConsultationMessage,
  type ConsultationRecord,
} from "@/features/consultations/consultationRepository"

const statusLabels: Record<string, string> = {
  open: "بانتظار المراجعة",
  assigned: "تم تعيين طبيب",
  answered: "تمت الإجابة",
  closed: "مغلقة",
}

export default function ConsultationThread() {
  const { id = "" } = useParams()
  const { session, profile } = useAuth()
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(
    null,
  )
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [rating, setRating] = useState(0)
  const messageOperation = useRef(crypto.randomUUID())
  const request = useRef(0)
  const [files, setFiles] = useState<Attachment[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  async function reload() {
    if (!id) return

    const current = ++request.current
    setConsultation(null)
    setMessages([])
    setFiles([])
    setLoading(true)
    setError("")
    try {
      const [record, thread, attachments] = await Promise.all([
        getConsultation(id),
        listMessages(id, page),
        listAttachments(id),
      ])
      if (current !== request.current) return
      setFiles(attachments)
      setConsultation(record)
      setMessages(thread)
      if (!record)
        setError("الاستشارة غير موجودة أو لا تملك صلاحية الوصول إليها.")
    } catch {
      if (current === request.current)
        setError("تعذر تحميل الاستشارة أو لا تملك صلاحية الوصول إليها.")
    } finally {
      if (current === request.current) setLoading(false)
    }
  }

  useEffect(() => {
    setDraft("")
    setRating(0)
    setUrls({})
    setSending(false)
    messageOperation.current = crypto.randomUUID()
    void reload()
    return () => {
      ++request.current
    }
  }, [id, page, session?.user.id])

  const senderKind = useMemo<"patient" | "doctor" | "staff">(() => {
    if (profile && ["owner", "admin"].includes(profile.role)) return "staff"
    if (consultation && session?.user.id === consultation.patient_id)
      return "patient"
    return "doctor"
  }, [profile, consultation, session])

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    if (sending || !session || !consultation || !draft.trim()) return

    const generation = request.current
    setSending(true)
    try {
      const message = await sendMessage({
        consultationId: consultation.id,
        senderId: session.user.id,
        senderKind,
        operationId: messageOperation.current,
        body: draft,
      })
      if (generation !== request.current) return
      setMessages((value) =>
        value.some((row) => row.id === message.id)
          ? value
          : [...value, message],
      )
      setDraft("")
      messageOperation.current = crypto.randomUUID()
    } catch {
      if (generation === request.current) setError("تعذر إرسال الرسالة.")
    } finally {
      if (generation === request.current) setSending(false)
    }
  }

  async function handleRating(value: number) {
    if (
      !session ||
      !consultation ||
      session.user.id !== consultation.patient_id
    )
      return

    const generation = request.current
    try {
      await saveRating({
        consultationId: consultation.id,
        patientId: session.user.id,
        rating: value,
      })
      if (generation === request.current) setRating(value)
    } catch {
      if (generation === request.current) setError("تعذر حفظ التقييم.")
    }
  }

  if (loading)
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-20 text-slate-500">
        جارٍ تحميل الاستشارة…
      </div>
    )

  if (error && !consultation)
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-20">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
        <Link className="mt-4 inline-block underline" to="/consultations">
          العودة للاستشارات
        </Link>
      </div>
    )

  if (!consultation) return null

  const isPatient = session?.user.id === consultation.patient_id

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/consultations" className="text-sm font-bold text-primary-700">
        العودة للاستشارات
      </Link>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {consultation.subject}
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(consultation.created_at).toLocaleString("ar-IQ")}
            </p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
            {statusLabels[consultation.status] ?? consultation.status}
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-8 text-slate-700">
          {consultation.body}
        </div>
      </div>

      {consultation.emergency_flag && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          تم رصد كلمات قد تدل على حالة عاجلة. لا تعتمد على المنصة في الطوارئ
          واطلب مساعدة طبية مباشرة.
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <section className="mt-6 rounded-xl border p-4">
          <h2 className="font-bold">المرفقات الخاصة</h2>
          {files.map((file) => (
            <div className="mt-3" key={file.id}>
              <button
                type="button"
                className="text-primary-700 underline"
                onClick={async () => {
                  const generation = request.current
                  try {
                    const url = await attachmentUrl(file.path, file.file_name)
                    if (generation === request.current)
                      setUrls((v) => ({ ...v, [file.id]: url }))
                  } catch {
                    if (generation === request.current)
                      setError("تعذر إنشاء رابط المرفق.")
                  }
                }}
              >
                {file.file_name}
              </button>
              {urls[file.id] && (
                <a
                  href={urls[file.id]}
                  target="_blank"
                  rel="noreferrer"
                  className="ms-3 underline"
                >
                  تنزيل — الرابط مؤقت
                </a>
              )}
            </div>
          ))}
        </section>
      )}
      <div className="mt-6 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl border p-4 ${
              message.sender_kind === "patient"
                ? "border-slate-200 bg-white"
                : "border-primary-100 bg-primary-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-700">
                {message.sender_kind === "patient"
                  ? "المريض"
                  : message.sender_kind === "doctor"
                    ? "الطبيب"
                    : "فريق المنصة"}
              </span>
              <span className="text-slate-400">
                {new Date(message.created_at).toLocaleString("ar-IQ")}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-700">
              {message.body}
            </p>
          </div>
        ))}
      </div>

      <nav aria-label="صفحات الرسائل" className="mt-4 flex gap-3">
        <button
          disabled={page === 1}
          className="rounded-xl border p-3"
          onClick={() => setPage((v) => v - 1)}
        >
          رسائل أقدم
        </button>
        <button
          disabled={messages.length < 50}
          className="rounded-xl border p-3"
          onClick={() => setPage((v) => v + 1)}
        >
          رسائل أحدث
        </button>
      </nav>
      {consultation.status !== "closed" && session && (
        <form
          onSubmit={handleSend}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <label
            htmlFor="message-draft"
            className="mb-2 block text-sm font-bold"
          >
            رسالة متابعة
          </label>
          <textarea
            id="message-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={5000}
            className="min-h-28 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-7"
            placeholder="اكتب رسالة متابعة…"
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={sending} className="gap-2">
              <Send className="h-4 w-4" />
              إرسال
            </Button>
          </div>
        </form>
      )}

      {!isPatient && session && consultation.status !== "closed" && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="rounded-xl border p-3"
            onClick={async () => {
              const generation = request.current
              try {
                const row = await updateConsultationAdmin(consultation.id, {
                  status: "answered",
                })
                if (generation === request.current) setConsultation(row)
              } catch {
                if (generation === request.current)
                  setError("تعذر تحديث الحالة.")
              }
            }}
          >
            تعليمها كمجابة
          </button>
          <button
            type="button"
            className="rounded-xl border p-3"
            onClick={async () => {
              if (!window.confirm("إغلاق الاستشارة ومنع الرسائل الجديدة؟"))
                return
              const generation = request.current
              try {
                const row = await updateConsultationAdmin(consultation.id, {
                  status: "closed",
                })
                if (generation === request.current) setConsultation(row)
              } catch {
                if (generation === request.current)
                  setError("تعذر إغلاق الاستشارة.")
              }
            }}
          >
            إغلاق الاستشارة
          </button>
        </div>
      )}
      {isPatient && ["answered", "closed"].includes(consultation.status) && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm font-bold">قيّم تجربتك</p>
          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => void handleRating(value)}
                aria-label={`${value} نجوم`}
              >
                <Star
                  className={`h-7 w-7 ${
                    value <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
