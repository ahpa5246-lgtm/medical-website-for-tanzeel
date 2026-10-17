import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Pencil, Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import { ErrorState, LoadingState } from "@/components/system/AsyncState"
import { listAdminDoctors } from "./adminRepository"

type Result = Awaited<ReturnType<typeof listAdminDoctors>>

export default function AdminDoctors() {
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    listAdminDoctors()
      .then(setResult)
      .catch(() => setError("تعذر تحميل ملفات الأطباء."))
  }, [])

  if (error)
    return (
      <ErrorState
        description={error}
        onRetry={() => window.location.reload()}
      />
    )

  if (!result) return <LoadingState label="جارٍ تحميل ملفات الأطباء…" />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الأطباء</h1>
          <p className="mt-2 text-sm text-slate-500">
            {result.count} ملفًا محفوظًا
          </p>
        </div>
        <Link to="/admin/doctors/new">
          <Button as="span" className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة ملف
          </Button>
        </Link>
      </div>

      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">نوع الملف</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">آخر تحديث</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {result.doctors.map((doctor) => (
              <tr key={doctor.id} className="border-t border-slate-100">
                <td className="p-4 font-bold text-slate-900">
                  <Link to={`/admin/doctors/${doctor.id}`}>
                    {doctor.display_name}
                  </Link>
                </td>
                <td className="p-4 text-slate-600">
                  {doctor.profile_kind === "fictional_demo"
                    ? "تجريبي"
                    : "مزود حقيقي"}
                </td>
                <td className="p-4 text-slate-600">
                  {doctor.publication_status}
                </td>
                <td className="p-4 text-slate-500">
                  {new Date(doctor.updated_at).toLocaleDateString("ar-IQ")}
                </td>
                <td className="p-4">
                  <Link
                    to={`/admin/doctors/${doctor.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
