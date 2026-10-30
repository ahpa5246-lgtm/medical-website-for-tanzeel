import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { GraduationCap, Info, Stethoscope, User } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { signUp } from "@/features/auth/authRepository"
import AuthShell from "@/components/auth/AuthShell"
import HandUnderline from "@/components/decor/HandUnderline"

type Role = "patient" | "doctor" | "instructor"

const roles = [
  {
    id: "patient" as const,
    label: "مريض / مستخدم عادي",
    note: "أبحث عن استشارة أو محتوى صحي",
    icon: User,
  },
  {
    id: "doctor" as const,
    label: "طبيب",
    note: "أريد التقديم كمقدم خدمة صحية",
    icon: Stethoscope,
  },
  {
    id: "instructor" as const,
    label: "مدرّب / معلم",
    note: "أريد التقديم لإنشاء محتوى تعليمي",
    icon: GraduationCap,
  },
]

export default function Signup() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get("role") as Role || "patient"
  const [role, setRole] = useState<Role>(
    ["patient", "doctor", "instructor"].includes(initial) ? initial : "patient",
  )
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setMessage("")

    if (form.fullName.trim().length < 3) return setError("اكتب الاسم الكامل.")
    if (!/^\+?[0-9]{9,15}$/.test(form.phone.replace(/\s/g, "")))
      return setError("اكتب رقم هاتف صحيحًا.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("البريد الإلكتروني مطلوب وصيغته غير صحيحة.")
    if (form.password.length < 8)
      return setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.")
    if (form.password !== form.confirmPassword)
      return setError("كلمتا المرور غير متطابقتين.")
    if (!form.agree) return setError("يجب الموافقة على الشروط وسياسة الخصوصية.")

    setLoading(true)
    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        requestedRole: role,
      })
      if (result.session) navigate("/")
      else
        setMessage(
          "تم إنشاء الحساب. افتح رسالة التأكيد المرسلة إلى بريدك ثم سجّل الدخول.",
        )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر إنشاء الحساب.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell story="مساحة جديدة للقراءة والتعلّم، مع طلب صلاحيات متخصصة لا تصبح فعالة إلا بعد المراجعة.">
      <section className="auth-form-panel">
        <h1 className="text-3xl font-black text-slate-900">
          <HandUnderline>إنشاء حساب</HandUnderline>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          الحساب العادي يُنشأ مباشرة. طلب الطبيب أو المدرّب يبقى طلبًا فقط إلى أن
          تراجعه الإدارة.
        </p>

        <div className="mt-7 grid gap-3">
          {roles.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-right ${
                  role === option.id
                    ? "border-primary-400 bg-primary-50"
                    : "border-slate-200"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm text-slate-900">
                    {option.label}
                  </strong>
                  <span className="text-xs text-slate-500">{option.note}</span>
                </span>
              </button>
            )
          })}
        </div>

        {role !== "patient" && (
          <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
            <Info className="mt-1 h-4 w-4 shrink-0" />
            لن تحصل على صلاحيات طبية بمجرد التسجيل؛ يجب التحقق من الهوية
            والترخيص وربط الحساب بملف مقدم الخدمة من الإدارة.
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Input
            label="الاسم الكامل"
            value={form.fullName}
            onChange={(event) =>
              setForm((value) => ({ ...value, fullName: event.target.value }))
            }
            required
          />
          <Input
            label="رقم الهاتف"
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(event) =>
              setForm((value) => ({ ...value, phone: event.target.value }))
            }
            placeholder="+964..."
            required
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(event) =>
              setForm((value) => ({ ...value, email: event.target.value }))
            }
            required
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((value) => ({ ...value, password: event.target.value }))
            }
            required
          />
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                confirmPassword: event.target.value,
              }))
            }
            required
          />

          <label className="flex items-start gap-2 text-xs leading-6 text-slate-600">
            <input
              className="mt-1"
              type="checkbox"
              checked={form.agree}
              onChange={(event) =>
                setForm((value) => ({ ...value, agree: event.target.checked }))
              }
            />
            <span>
              أوافق على{" "}
              <Link
                className="font-bold text-primary-700 underline"
                to="/legal/terms"
              >
                الشروط
              </Link>{" "}
              و
              <Link
                className="font-bold text-primary-700 underline"
                to="/legal/privacy"
              >
                سياسة الخصوصية
              </Link>{" "}
              و
              <Link
                className="font-bold text-primary-700 underline"
                to="/legal/disclaimer"
              >
                التنويه الطبي
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              {message}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            إنشاء الحساب
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          لديك حساب؟{" "}
          <Link className="font-bold text-primary-700" to="/auth/login">
            سجّل الدخول
          </Link>
        </p>
      </section>
    </AuthShell>
  )
}
