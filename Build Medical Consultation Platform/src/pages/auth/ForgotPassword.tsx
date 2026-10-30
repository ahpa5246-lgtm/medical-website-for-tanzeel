import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { requestPasswordReset } from "@/features/auth/authRepository"
import AuthShell from "@/components/auth/AuthShell"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("أدخلي بريدًا إلكترونيًا صحيحًا.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await requestPasswordReset(email.trim())
      setDone(true)
    } catch {
      setError("تعذر إرسال رسالة الاستعادة الآن. أعيدي المحاولة.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell story="إذا نسيت كلمة المرور يمكنك العودة بخطوة بسيطة إلى حسابك، دون تعقيد.">
      <section className="auth-form-panel">
        {done ? (
          <div className="text-center" role="status">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-5 text-2xl font-black text-slate-900">
              تحققي من بريدك
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              إذا كان البريد مرتبطًا بحساب، ستصل رسالة استعادة آمنة خلال دقائق.
            </p>
          </div>
        ) : (
          <>
            <KeyRound className="h-10 w-10 text-primary-700" />
            <h1 className="mt-5 text-2xl font-black text-slate-900">
              استعادة الوصول
            </h1>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={error}
                autoComplete="email"
                startIcon={<Mail className="h-4 w-4" />}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
              >
                إرسال رابط الاستعادة
              </Button>
            </form>
          </>
        )}
        <Link
          to="/auth/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-bold text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 rotate-180" /> العودة إلى الدخول
        </Link>
      </section>
    </AuthShell>
  )
}
