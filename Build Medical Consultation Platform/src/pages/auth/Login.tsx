import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, Stethoscope } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { signIn } from "@/features/auth/authRepository"
import AuthShell from "@/components/auth/AuthShell"
import HandUnderline from "@/components/decor/HandUnderline"

function safeReturnPath(value: string | null) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : "/"
}

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError("أدخلي البريد الإلكتروني وكلمة المرور.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await signIn(form.email.trim(), form.password)
      navigate(safeReturnPath(params.get("returnTo")), { replace: true })
    } catch {
      setError("تعذر تسجيل الدخول. تحققي من البيانات ثم أعيدي المحاولة.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell story="عد إلى عالم المقالات والتدريب والتعلّم، في مساحة تتنفس بالألوان والرسومات.">
      <section className="auth-form-panel">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary-100 bg-primary-50">
            <Stethoscope className="h-6 w-6 text-primary-700" />
          </span>
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            <HandUnderline>تسجيل الدخول</HandUnderline>
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            أهلًا بعودتك. ادخلي إلى مساحتك لمتابعة المحتوى والمهام المتاحة بحسب صلاحيات حسابك.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            autoComplete="email"
            startIcon={<Mail className="h-4 w-4" />}
            required
          />
          <div className="relative">
            <Input
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              autoComplete="current-password"
              startIcon={<Lock className="h-4 w-4" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute end-3 top-9 text-slate-400 hover:text-slate-700"
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <Link
            to="/auth/forgot-password"
            className="block text-sm font-bold text-primary-700"
          >
            نسيت كلمة المرور؟
          </Link>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            تسجيل الدخول
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          ليس لديك حساب؟{" "}
          <Link to="/auth/signup" className="font-bold text-primary-700 underline">أنشئ حسابًا</Link>
        </p>
      </section>
    </AuthShell>
  )
}
