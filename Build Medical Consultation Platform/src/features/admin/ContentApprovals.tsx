import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Button from "@/components/ui/Button"

type Applicant = {
  id: string
  display_name: string
  content_author_approved: boolean
}

export default function ContentApprovals() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error: issue } = await supabase
      .from("profiles")
      .select("id, display_name, content_author_approved")
      .eq("requested_role", "instructor")
      .order("display_name")
    if (issue) {
      setError("تعذر تحميل طلبات المدرسين.")
      return
    }
    setApplicants(data ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  async function setApproval(applicant: Applicant) {
    setBusy(true)
    setError("")
    const { error: issue } = await supabase
      .from("profiles")
      .update({ content_author_approved: !applicant.content_author_approved })
      .eq("id", applicant.id)
    if (issue) setError("تعذر تعديل صلاحية المدرّس.")
    else await load()
    setBusy(false)
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-900">
        اعتماد مؤلفي الأكاديمية والمكتبة
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        اعتمدي المدرّسين بعد التحقق منهم. يتيح الاعتماد إنشاء مسوداتهم وتعديلها؛
        النشر العام يبقى بيد فريق التحرير.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {applicants.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">لا توجد طلبات مدرسين بعد.</p>
      )}
      <div className="mt-4 space-y-3">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
          >
            <div>
              <p className="font-bold">{applicant.display_name}</p>
              <p className="text-xs text-slate-500">
                {applicant.content_author_approved
                  ? "معتمد للتحرير"
                  : "بانتظار الاعتماد"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void setApproval(applicant)}
            >
              {applicant.content_author_approved
                ? "سحب الاعتماد"
                : "اعتماد المدرّس"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
