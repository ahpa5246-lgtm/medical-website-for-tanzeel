import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/features/auth/AuthProvider"
import AuthShell from "@/components/auth/AuthShell"

type Result = "pending" | "success" | "error"

export default function AcceptInvitation() {
  const { session, loading, refreshProfile } = useAuth()
  const attempted = useRef<string | null>(null)
  const [result, setResult] = useState<Result>("pending")

  useEffect(() => {
    if (loading || !session || attempted.current === session.user.id) return
    attempted.current = session.user.id
    const accept = async () => {
      try {
        // Retrieve invitation metadata from authenticated Supabase, not a
        // query parameter or a user-entered role.
        const { data, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        const token = data.user?.user_metadata?.invitation_token
        if (typeof token !== "string") throw new Error("missing invitation")
        const { error } = await supabase.rpc("accept_admin_invitation", {
          p_token: token,
        })
        if (error) throw error
        await refreshProfile()
        // The role grant is already committed; cleanup is best-effort.
        await supabase.auth.updateUser({ data: { invitation_token: null } })
        setResult("success")
      } catch {
        setResult("error")
      }
    }
    void accept()
  }, [session?.user.id, loading, refreshProfile])

  return (
    <AuthShell story="مساحة فريق الإدارة تتطلب دعوة صالحة وتحققًا حقيقيًا من الصلاحيات.">
      <section className="auth-form-panel">
        <h1 className="text-2xl font-black">قبول دعوة فريق الإدارة</h1>
        {loading ? (
          <p className="mt-5" role="status">
            جارٍ التحقق من الحساب…
          </p>
        ) : !session ? (
          <div className="mt-5 space-y-4">
            <p>سجّلي الدخول بالبريد الذي وصلته الدعوة حتى نتحقق من صلاحيتها.</p>
            <Link
              className="font-bold text-primary-700 underline"
              to="/auth/login?returnTo=%2Fauth%2Faccept-invite"
            >
              تسجيل الدخول
            </Link>
          </div>
        ) : result === "pending" ? (
          <p className="mt-5" role="status">
            جارٍ التحقق من الدعوة وتفعيل الدور…
          </p>
        ) : result === "success" ? (
          <div className="mt-5 space-y-4" role="status">
            <p>تم قبول الدعوة وتحديث صلاحيات الحساب.</p>
            <Link className="font-bold text-primary-700 underline" to="/admin">
              فتح لوحة الإدارة
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4" role="alert">
            <p>
              تعذر قبول الدعوة. تحققي من البريد أو مدة صلاحيتها أو تواصلي مع
              مالكة المنصة.
            </p>
            <Link className="font-bold text-primary-700 underline" to="/">
              العودة للرئيسية
            </Link>
          </div>
        )}
      </section>
    </AuthShell>
  )
}
