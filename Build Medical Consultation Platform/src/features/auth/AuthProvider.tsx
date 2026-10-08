import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { registerLabAccessTokenProvider } from "@/pages/labs/labQuotaClient"
import {
  getProfile,
  signOut as performSignOut,
  type AccountProfile,
} from "./authRepository"

interface AuthContextValue {
  session: Session | null
  profile: AccountProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Obtain a fresh access token for every quota RPC rather than capturing a
  // token that becomes stale after an authentication refresh.
  useEffect(
    () =>
      registerLabAccessTokenProvider(async () => {
        const { data, error } = await supabase.auth.getSession()
        return error ? null : (data.session?.access_token ?? null)
      }),
    [],
  )

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null)
      return
    }
    try {
      setProfile(await getProfile(session.user.id))
    } catch {
      setProfile(null)
    }
  }, [session?.user.id])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setProfile(null)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  useEffect(() => {
    const enforceFreshRole = () => void refreshProfile()
    window.addEventListener("focus", enforceFreshRole)
    return () => window.removeEventListener("focus", enforceFreshRole)
  }, [refreshProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      refreshProfile,
      signOut: performSignOut,
    }),
    [session, profile, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
