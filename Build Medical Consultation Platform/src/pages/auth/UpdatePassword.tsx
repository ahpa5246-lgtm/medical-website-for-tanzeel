import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/features/auth/AuthProvider"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function UpdatePassword() {
  const { session, loading: authLoading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 8) return setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.")
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين.")
    setBusy(true)
    setError("")
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      setPassword("")
      setConfirm("")
    } catch {
      setError("تعذر تحديث كلمة المرور. قد يكون رابط الاستعادة منتهي الصلاحية.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black">تعيين كلمة مرور جديدة</h1>
        {authLoading ? <p className="mt-4" role="status">جارٍ التحقق من رابط الاستعادة…</p>
          : done ? (
            <div className="mt-5 space-y-4" role="status">
              <p>تم تغيير كلمة المرور. يمكنك الآن متابعة استخدام حسابك.</p>
              <Link className="font-bold text-primary-700 underline" to="/">العودة للرئيسية</Link>
            </div>
          ) : !session ? (
            <div className="mt-5 space-y-4" role="alert">
              <p>رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلبي رابطًا جديدًا.</p>
              <Link className="font-bold text-primary-700 underline" to="/auth/forgot-password">طلب رابط استعادة جديد</Link>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <Input label="كلمة المرور الجديدة" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required />
              <Input label="تأكيد كلمة المرور" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
              <Button type="submit" loading={busy} className="w-full">حفظ كلمة المرور</Button>
            </form>
          )}
      </section>
    </main>
  )
}
