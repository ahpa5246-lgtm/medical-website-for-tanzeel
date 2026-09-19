import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> إضافة ملف
          </Button>
        </Link>
      </div>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">التخصص</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">آخر تحديث</th>
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
                  {(doctor.specialties as { name_ar?: string } | null)
                    ?.name_ar ?? "—"}
                </td>
                <td className="p-4 text-slate-600">
                  {doctor.publication_status}
                </td>
                <td className="p-4 text-slate-500">
                  {new Date(doctor.updated_at).toLocaleDateString("ar-IQ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
