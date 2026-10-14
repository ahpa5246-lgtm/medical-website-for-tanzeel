import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MessageCircle, Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  listMyConsultations,
  type ConsultationRecord,
} from "@/features/consultations/consultationRepository"

const labels: Record<string, string> = {
  open: "بانتظار المراجعة",
  assigned: "تم تعيين طبيب",
  answered: "تمت الإجابة",
  closed: "مغلقة",
}

export default function ConsultationList() {
  const { session, loading: authLoading } = useAuth()
  const [items, setItems] = useState<ConsultationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setItems([])
    setError("")
    setLoading(true)
    if (authLoading) return
    if (!session) {
      setLoading(false)
      return
    }
    listMyConsultations(session.user.id, page)
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل الاستشارات.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [session?.user.id, authLoading, page, retry])

  if (!authLoading && !session)
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-20 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-4 text-2xl font-black">استشاراتك خاصة بحسابك</h1>
        <p className="mt-3 text-slate-500">
          سجّل الدخول لعرض الاستشارات المحفوظة.
        </p>
        <Link to="/auth/login">
          <Button as="span" className="mt-6">
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    )

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">استشاراتي</h1>
          <p className="mt-2 text-sm text-slate-500">
            استشاراتك والاستشارات المعيّنة لك بحسب صلاحياتك.
          </p>
        </div>
        <Link to="/consultations/new">
          <Button as="span" className="gap-2">
            <Plus className="h-4 w-4" />
            استشارة جديدة
          </Button>
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-slate-500">جارٍ التحميل…</p>}
      {error && (
        <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          لا توجد استشارات بعد.
        </div>
      )}

      {error && (
        <button
          className="mt-3 underline"
          onClick={() => setRetry((v) => v + 1)}
        >
          إعادة المحاولة
        </button>
      )}
      <div className="mt-8 space-y-3">
        {items.map((consultation) => (
          <Link
            key={consultation.id}
            to={`/consultations/${consultation.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  {consultation.subject}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {consultation.body}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {labels[consultation.status] ?? consultation.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {new Date(consultation.created_at).toLocaleString("ar-IQ")}
            </p>
          </Link>
        ))}
      </div>
      <nav aria-label="صفحات الاستشارات" className="mt-5 flex gap-3">
        <button
          disabled={page === 1 || loading}
          className="rounded-xl border p-3"
          onClick={() => setPage((v) => v - 1)}
        >
          السابق
        </button>
        <button
          disabled={items.length < 20 || loading}
          className="rounded-xl border p-3"
          onClick={() => setPage((v) => v + 1)}
        >
          التالي
        </button>
      </nav>
    </div>
  )
}
