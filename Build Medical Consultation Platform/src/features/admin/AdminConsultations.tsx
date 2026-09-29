import { useEffect, useState } from "react"
import { Pencil, Save, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { listAdminDoctors } from "./adminRepository"
import {
  listAdminConsultations,
  updateConsultationAdmin,
  type ConsultationRecord,
  type ConsultationStatus,
} from "@/features/consultations/consultationRepository"

const statusOptions: {value:ConsultationStatus;label:string}[] = [
  {value:"open",label:"بانتظار المراجعة"},
  {value:"assigned",label:"تم تعيين طبيب"},
  {value:"answered",label:"تمت الإجابة"},
  {value:"closed",label:"مغلقة"},
]

export default function AdminConsultations() {
  const [items,setItems]=useState<ConsultationRecord[]>([])
  const [doctors,setDoctors]=useState<Array<{id:string;display_name:string}>>([])
  const [editing,setEditing]=useState<string|null>(null)
  const [draft,setDraft]=useState<Partial<ConsultationRecord>>({})
  const [error,setError]=useState("")
  const [saving,setSaving]=useState(false)

  async function load() {
    try {
      const [consultations, doctorResult]=await Promise.all([listAdminConsultations(),listAdminDoctors()])
      setItems(consultations)
      setDoctors(doctorResult.doctors.map(d=>({id:d.id,display_name:d.display_name})))
    } catch { setError("تعذر تحميل بيانات الاستشارات.") }
  }
  useEffect(()=>{ void load() },[])

  function begin(c:ConsultationRecord) {
    setEditing(c.id)
    setDraft({subject:c.subject,body:c.body,status:c.status,doctor_id:c.doctor_id})
  }

  async function save(id:string) {
    setSaving(true); setError("")
    try {
      const updated=await updateConsultationAdmin(id,{
        subject:draft.subject,
        body:draft.body,
        status:draft.status as ConsultationStatus|undefined,
        doctor_id:draft.doctor_id ?? null,
      })
      setItems(v=>v.map(x=>x.id===id?updated:x)); setEditing(null)
    } catch { setError("تعذر حفظ التعديلات.") }
    finally { setSaving(false) }
  }

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-black text-slate-900">إدارة الاستشارات</h1>
      <p className="mt-2 text-sm text-slate-500">عيّن الطبيب، عدّل النص والحالة، وأغلق الاستشارة من مكان واحد.</p>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-7 space-y-4">
        {items.map(c=>{
          const isEditing=editing===c.id
          return (
            <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <label className="block text-sm font-bold">العنوان
                    <input className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={draft.subject ?? ""} onChange={e=>setDraft(v=>({...v,subject:e.target.value}))}/>
                  </label>
                  <label className="block text-sm font-bold">الوصف
                    <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3" value={draft.body ?? ""} onChange={e=>setDraft(v=>({...v,body:e.target.value}))}/>
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-bold">الحالة
                      <select className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={draft.status ?? "open"} onChange={e=>setDraft(v=>({...v,status:e.target.value as ConsultationStatus}))}>
                        {statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-bold">الطبيب
                      <select className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={draft.doctor_id ?? ""} onChange={e=>setDraft(v=>({...v,doctor_id:e.target.value || null}))}>
                        <option value="">غير معيّن</option>
                        {doctors.map(d=><option key={d.id} value={d.id}>{d.display_name}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={()=>void save(c.id)} loading={saving} className="gap-2"><Save className="h-4 w-4"/> حفظ التعديل</Button>
                    <Button variant="secondary" onClick={()=>setEditing(null)} className="gap-2"><X className="h-4 w-4"/> إلغاء</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><h2 className="font-black text-slate-900">{c.subject}</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{c.body}</p></div>
                    <Button variant="secondary" onClick={()=>begin(c)} className="gap-2"><Pencil className="h-4 w-4"/> تعديل</Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{statusOptions.find(s=>s.value===c.status)?.label}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{c.doctor_id ? "طبيب معيّن" : "بلا طبيب"}</span>
                    {c.emergency_flag && <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700">تنبيه حالة عاجلة</span>}
                  </div>
                </div>
              )}
            </article>
          )
        })}
        {!items.length && !error && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">لا توجد استشارات بعد.</div>}
      </div>
    </div>
  )
}
