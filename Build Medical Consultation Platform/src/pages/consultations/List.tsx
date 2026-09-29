import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MessageCircle, Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import { useAuth } from "@/features/auth/AuthProvider"
import { listMyConsultations, type ConsultationRecord } from "@/features/consultations/consultationRepository"

const labels: Record<string,string> = { open:"بانتظار المراجعة", assigned:"تم تعيين طبيب", answered:"تمت الإجابة", closed:"مغلقة" }

export default function ConsultationList() {
  const { session, loading:authLoading } = useAuth()
  const [items,setItems] = useState<ConsultationRecord[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")

  useEffect(()=>{
    if (authLoading) return
    if (!session) { setLoading(false); return }
    listMyConsultations(session.user.id).then(setItems).catch(()=>setError("تعذر تحميل الاستشارات.")).finally(()=>setLoading(false))
  },[session,authLoading])

  if (!authLoading && !session) return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-20 text-center">
      <MessageCircle className="mx-auto h-10 w-10 text-slate-400"/>
      <h1 className="mt-4 text-2xl font-black">استشاراتك خاصة بحسابك</h1>
      <p className="mt-3 text-slate-500">سجّل الدخول لعرض الاستشارات المحفوظة.</p>
      <Link to="/auth/login"><Button className="mt-6">تسجيل الدخول</Button></Link>
    </div>
  )

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-3xl font-black">استشاراتي</h1><p className="mt-2 text-sm text-slate-500">كل الاستشارات المحفوظة في حسابك.</p></div>
        <Link to="/consultations/new"><Button className="gap-2"><Plus className="h-4 w-4"/> استشارة جديدة</Button></Link>
      </div>
      {loading && <p className="mt-8 text-sm text-slate-500">جارٍ التحميل…</p>}
      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && items.length===0 && <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">لا توجد استشارات بعد.</div>}
      <div className="mt-8 space-y-3">
        {items.map(c=>(
          <Link key={c.id} to={`/consultations/${c.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-bold text-slate-900">{c.subject}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{c.body}</p></div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{labels[c.status] ?? c.status}</span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{new Date(c.created_at).toLocaleString("ar-IQ")}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
