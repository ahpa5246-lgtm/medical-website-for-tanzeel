import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Phone, Lock, Eye, EyeOff, Stethoscope } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

type LoginMethod = "email" | "phone"

export default function Login() {
  const [method, setMethod] = useState<LoginMethod>("phone")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ identifier: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMessage, setPreviewMessage] = useState("")

  function validate() {
    const e: Record<string, string> = {}
    if (!form.identifier.trim()) {
      e.identifier =
        method === "phone" ? "رقم الهاتف مطلوب" : "البريد الإلكتروني مطلوب"
    } else if (
      method === "phone" &&
      !/^\+?[0-9]{9,15}$/.test(form.identifier.replace(/\s/g, ""))
    ) {
      e.identifier = "رقم هاتف غير صحيح"
    } else if (
      method === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.identifier)
    ) {
      e.identifier = "بريد إلكتروني غير صحيح"
    }
    if (!form.password) e.password = "كلمة المرور مطلوبة"
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setPreviewMessage(
        "تم اختبار النموذج فقط. لم يحدث تسجيل دخول لأن خدمة الحسابات غير مربوطة بعد.",
      )
    }, 700)
  }

  return (
    <div
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100 mb-4">
              <Stethoscope className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">مرحبًا بعودتك</h1>
            <p className="text-slate-500 text-sm mt-1">
              سجّل دخولك للوصول إلى حسابك
            </p>
          </div>

          {/* Method toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            {(["phone", "email"] as LoginMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMethod(m)
                  setErrors({})
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  method === m
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "phone" ? (
                  <>
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={method === "phone" ? "رقم الهاتف" : "البريد الإلكتروني"}
              type={method === "phone" ? "tel" : "email"}
              placeholder={
                method === "phone" ? "+964 XXX XXX XXXX" : "name@email.com"
              }
              value={form.identifier}
              onChange={(e) =>
                setForm((f) => ({ ...f, identifier: e.target.value }))
              }
              error={errors.identifier}
              autoComplete={method === "phone" ? "tel" : "email"}
              dir={method === "phone" ? "ltr" : "rtl"}
              startIcon={
                method === "phone" ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )
              }
              required
            />

            <div className="relative">
              <Input
                label="كلمة المرور"
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                error={errors.password}
                autoComplete="current-password"
                startIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              تسجيل الدخول
            </Button>
            {previewMessage && (
              <p
                role="status"
                className="rounded-xl bg-primary-50 px-4 py-3 text-xs leading-6 text-primary-900"
              >
                {previewMessage}
              </p>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ليس لديك حساب؟{" "}
            <Link
              to="/auth/signup"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              أنشئ حسابًا مجانًا
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-center text-xs text-slate-500 leading-relaxed px-4">
          بتسجيل الدخول، أنت توافق على{" "}
          <Link to="/legal/terms" className="underline hover:text-slate-700">
            شروط الاستخدام
          </Link>{" "}
          و{" "}
          <Link to="/legal/privacy" className="underline hover:text-slate-700">
            سياسة الخصوصية
          </Link>
        </p>
      </div>
    </div>
  )
}
