import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Send, Star } from "lucide-react"
import Button from "@/components/ui/Button"
import { useAuth } from "@/features/auth/AuthProvider"
import {
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

  async function reload() {
    if (!id) return

    setLoading(true)
    setError("")
    try {
      const [record, thread] = await Promise.all([
        getConsultation(id),
        listMessages(id),
      ])
      setConsultation(record)
      setMessages(thread)
      if (!record)
        setError("الاستشارة غير موجودة أو لا تملك صلاحية الوصول إليها.")
    } catch {
      setError("تعذر تحميل الاستشارة أو لا تملك صلاحية الوصول إليها.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [id])

  const senderKind = useMemo<"patient" | "doctor" | "staff">(() => {
    if (profile && ["owner", "admin"].includes(profile.role)) return "staff"
    if (consultation && session?.user.id === consultation.patient_id)
      return "patient"
    return "doctor"
  }, [profile, consultation, session])

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    if (!session || !consultation || !draft.trim()) return

    setSending(true)
    try {
      const message = await sendMessage({
        consultationId: consultation.id,
        senderId: session.user.id,
        senderKind,
        body: draft,
      })
      setMessages((value) => [...value, message])
      setDraft("")
    } catch {
      setError("تعذر إرسال الرسالة.")
    } finally {
      setSending(false)
    }
  }

  async function handleRating(value: number) {
    if (
      !session ||
      !consultation ||
      session.user.id !== consultation.patient_id
    )
      return

    try {
      await saveRating({
        consultationId: consultation.id,
        patientId: session.user.id,
        rating: value,
      })
      setRating(value)
    } catch {
      setError("تعذر حفظ التقييم.")
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

      {consultation.status !== "closed" && session && (
        <form
          onSubmit={handleSend}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <textarea
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
