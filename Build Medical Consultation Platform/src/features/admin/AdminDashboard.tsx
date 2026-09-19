import { useEffect, useState } from "react"
import { FileClock, FilePenLine, Globe2, Archive } from "lucide-react"
import { ErrorState, LoadingState } from "@/components/system/AsyncState"
import { getAdminSummary } from "./adminRepository"

type Summary = Awaited<ReturnType<typeof getAdminSummary>>

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState("")
  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch(() => setError("تعذر تحميل ملخص الإدارة."))
  }, [])
  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (!summary) return <LoadingState label="جارٍ تحميل لوحة التحكم…" />

  const cards = [
    ["المسودات", summary.draft, FilePenLine],
    ["بانتظار المراجعة", summary.review, FileClock],
    ["المنشور", summary.published, Globe2],
    ["المؤرشف", summary.archived, Archive],
  ] as const
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
      <p className="mt-2 text-sm text-slate-500">
        ملخص مباشر للمحتوى المحفوظ في قاعدة البيانات.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <section
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Icon className="h-6 w-6 text-primary-700" />
            <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
