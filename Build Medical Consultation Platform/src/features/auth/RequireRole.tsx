import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { DeniedState, LoadingState } from "@/components/system/AsyncState"
import { useAuth } from "./AuthProvider"
import type { AppRole } from "./authRepository"

interface RequireRoleProps {
  allow: AppRole[]
  children: ReactNode
}

export default function RequireRole({ allow, children }: RequireRoleProps) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState label="جارٍ التحقق من صلاحية الحساب…" />
  if (!session) {
    const returnTo = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    )
  }
  if (!profile || profile.status !== "active") {
    return (
      <DeniedState description="هذا الحساب غير نشط أو لم يعد يملك صلاحية الوصول." />
    )
  }
  if (!allow.includes(profile.role)) {
    return <DeniedState />
  }

  return children
}
