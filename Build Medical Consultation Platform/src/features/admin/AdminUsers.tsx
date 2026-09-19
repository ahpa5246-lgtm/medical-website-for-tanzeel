import { useEffect, useState, type FormEvent } from "react"
import Button from "@/components/ui/Button"
import { ErrorState, LoadingState } from "@/components/system/AsyncState"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  inviteAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "./userAdminRepository"

type Users = Awaited<ReturnType<typeof listAdminUsers>>

export default function AdminUsers() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<Users | null>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "editor">("editor")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const isOwner = profile?.role === "owner"

  const load = () =>
    listAdminUsers()
      .then(setUsers)
      .catch(() => setMessage("تعذر تحميل المستخدمين."))
  useEffect(() => {
    void load()
  }, [])

  const invite = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    try {
      const result = await inviteAdminUser(email, role)
      setMessage(result.message)
      setEmail("")
    } catch {
      setMessage("تعذر إرسال الدعوة. تحقق من البريد والصلاحية ثم حاول مجددًا.")
    } finally {
      setBusy(false)
    }
  }

  if (!users && !message) return <LoadingState label="جارٍ تحميل المستخدمين…" />
  if (!users) return <ErrorState description={message} onRetry={load} />
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900">
        المستخدمون والصلاحيات
      </h1>
      <form
        onSubmit={(event) => void invite(event)}
        className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_12rem_auto]"
      >
        <label className="text-sm font-bold text-slate-700">
          البريد الإلكتروني
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          الدور
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "editor")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="editor">محرر</option>
            {isOwner && <option value="admin">مدير</option>}
          </select>
        </label>
        <Button type="submit" loading={busy} className="self-end">
          دعوة مستخدم
        </Button>
      </form>
      {message && (
        <p role="status" className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">
          {message}
        </p>
      )}
      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">الدور</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="p-4 font-bold">{user.display_name}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  {user.status === "active" ? "نشط" : "معطل"}
                </td>
                <td className="p-4">
                  {user.role !== "owner" && user.id !== profile?.id && (
                    <Button
                      size="sm"
                      variant={user.status === "active" ? "danger" : "outline"}
                      onClick={async () => {
                        setBusy(true)
                        try {
                          await updateAdminUser(
                            user.id,
                            user.status === "active" ? "disable" : "enable",
                          )
                          await load()
                        } catch {
                          setMessage("تعذر تعديل الحساب.")
                        } finally {
                          setBusy(false)
                        }
                      }}
                    >
                      {user.status === "active" ? "تعطيل" : "تفعيل"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
