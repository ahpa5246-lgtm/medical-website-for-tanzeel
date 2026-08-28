import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Phone } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function ForgotPassword() {
  const [method, setMethod] = useState<"phone" | "email">("phone")
  const [value, setValue] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!value.trim()) {
      setError(
        method === "phone" ? "أدخل رقم الهاتف" : "أدخل البريد الإلكتروني",
      )
      return
    }
    setError("")
    setDone(true)
  }

  return (
    <div
      dir="rtl"
      className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(16,42,67,.08)] sm:p-9">
        {done ? (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-700">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-ink">
              المسار جاهز للربط
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              في نسخة الإنتاج سيصل رمز آمن إلى وسيلة التواصل التي اخترتها. لم
              تُرسل أي رسالة في هذه المعاينة.
            </p>
            <Link to="/auth/login">
              <Button className="mt-7 w-full">العودة إلى الدخول</Button>
            </Link>
          </div>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
              <KeyRound className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-ink">
              استعادة الوصول
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              اختر أين تريد استلام رمز التحقق.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`rounded-lg py-2 text-sm font-bold ${
                  method === "phone"
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate-500"
                }`}
              >
                الهاتف
              </button>
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`rounded-lg py-2 text-sm font-bold ${
                  method === "email"
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate-500"
                }`}
              >
                البريد
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <Input
                label={method === "phone" ? "رقم الهاتف" : "البريد الإلكتروني"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                error={error}
                startIcon={
                  method === "phone" ? (
                    <Phone className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )
                }
              />
              <Button type="submit" size="lg" className="w-full">
                متابعة
              </Button>
            </form>
            <Link
              to="/auth/login"
              className="mt-6 flex items-center justify-center gap-1 text-sm font-bold text-primary-700"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" /> العودة إلى الدخول
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
