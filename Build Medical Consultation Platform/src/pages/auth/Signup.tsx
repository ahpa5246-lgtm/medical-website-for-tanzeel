import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  User,
  Stethoscope,
  GraduationCap,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { cn } from "@/lib/utils"

type Role = "patient" | "doctor" | "instructor"

const ROLE_OPTIONS: {
  id: Role
  label: string
  sublabel: string
  icon: React.ReactNode
}[] = [
  {
    id: "patient",
    label: "مريض / مستخدم عادي",
    sublabel: "أبحث عن استشارة طبية أو محتوى صحي",
    icon: <User className="w-5 h-5" />,
  },
  {
    id: "doctor",
    label: "طبيب",
    sublabel: "أريد الإجابة على الاستشارات ومشاركة خبرتي",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "instructor",
    label: "مدرّب / معلم",
    sublabel: "أريد إنشاء دورات تعليمية طبية",
    icon: <GraduationCap className="w-5 h-5" />,
  },
]

export default function Signup() {
  const [params] = useSearchParams()
  const initialRole = params.get("role") as Role || "patient"
  const [role, setRole] = useState<Role>(initialRole)
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMessage, setPreviewMessage] = useState("")

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 3)
      e.fullName = "الاسم الكامل مطلوب (3 أحرف على الأقل)"
    return e
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (
      !form.phone.trim() ||
      !/^\+?[0-9]{9,15}$/.test(form.phone.replace(/\s/g, ""))
    )
      e.phone = "رقم هاتف صحيح مطلوب"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "بريد إلكتروني غير صحيح"
    if (!form.password || form.password.length < 8)
      e.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "كلمتا المرور غير متطابقتين"
    if (!form.agreeTerms) e.agreeTerms = "يجب الموافقة على الشروط للمتابعة"
    return e
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateStep1()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep(2)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setPreviewMessage(
        "تم اختبار النموذج فقط. لم يُنشأ حساب ولم تُحفظ أي بيانات في نسخة المعاينة.",
      )
    }, 700)
  }

  const needsVerification = role === "doctor" || role === "instructor"

  return (
    <div
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              إنشاء حساب جديد
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              مجاني تمامًا — لا بطاقة مطلوبة
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      step >= s
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 rounded-full transition-colors",
                        step > s ? "bg-primary-600" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Role + name */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  كيف ستستخدم ميدكونكت؟ <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRole(opt.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all duration-150",
                        role === opt.id
                          ? "border-primary-400 bg-primary-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          role === opt.id
                            ? "bg-primary-100 text-primary-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {opt.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {opt.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {opt.sublabel}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-4.5 h-4.5 rounded-full border-2 ms-auto shrink-0 transition-colors",
                          role === opt.id
                            ? "border-primary-600 bg-primary-600"
                            : "border-slate-300",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {needsVerification && (
                <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    ستحتاج إلى تقديم وثائق ترخيص طبي للتحقق من هويتك قبل الوصول
                    لصلاحيات{" "}
                    {role === "doctor"
                      ? "الإجابة على الاستشارات"
                      : "إنشاء الدورات"}
                    .
                  </p>
                </div>
              )}

              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="محمد الأحمد"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                error={errors.fullName}
                startIcon={<User className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full" size="lg">
                التالي
              </Button>
            </form>
          )}

          {/* Step 2: Account credentials */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-2"
              >
                ← رجوع
              </button>

              <Input
                label="رقم الهاتف"
                type="tel"
                dir="ltr"
                placeholder="+964 XXX XXX XXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                error={errors.phone}
                startIcon={<Phone className="w-4 h-4" />}
                hint="لن يُرسل رمز؛ استخدم قيمة خيالية فقط"
                required
              />

              <Input
                label="البريد الإلكتروني (اختياري)"
                type="email"
                dir="ltr"
                placeholder="name@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                error={errors.email}
                startIcon={<Mail className="w-4 h-4" />}
              />

              <div className="relative">
                <Input
                  label="كلمة المرور"
                  type={showPassword ? "text" : "password"}
                  placeholder="8 أحرف على الأقل"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  error={errors.password}
                  startIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "إخفاء" : "إظهار"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Input
                label="تأكيد كلمة المرور"
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                error={errors.confirmPassword}
                startIcon={<Lock className="w-4 h-4" />}
                required
              />

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, agreeTerms: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    أوافق على{" "}
                    <Link
                      to="/legal/terms"
                      target="_blank"
                      className="text-primary-600 underline hover:text-primary-700"
                    >
                      شروط الاستخدام
                    </Link>{" "}
                    و{" "}
                    <Link
                      to="/legal/privacy"
                      target="_blank"
                      className="text-primary-600 underline hover:text-primary-700"
                    >
                      سياسة الخصوصية
                    </Link>{" "}
                    و{" "}
                    <Link
                      to="/legal/disclaimer"
                      target="_blank"
                      className="text-primary-600 underline hover:text-primary-700"
                    >
                      التنويه الطبي
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                إنشاء الحساب
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
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              سجّل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
