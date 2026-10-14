import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
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
  const profileRequest = useRef(0)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authEpoch, setAuthEpoch] = useState(0)
  const identity = useRef<string | undefined>(undefined)

  const refreshProfile = useCallback(async () => {
    const request = ++profileRequest.current
    if (!session?.user.id) {
      setProfile(null)
      return
    }
    try {
      const nextProfile = await getProfile(session.user.id)
      if (request === profileRequest.current) setProfile(nextProfile)
    } catch {
      if (request === profileRequest.current) setProfile(null)
    }
  }, [session?.user.id])

  useEffect(() => {
    let active = true
    let eventReceived = false
    supabase.auth.getSession().then(({ data }) => {
      if (!active || eventReceived) return
      identity.current = data.session?.user.id
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      eventReceived = true
      ++profileRequest.current
      if (identity.current !== nextSession?.user.id) setProfile(null)
      identity.current = nextSession?.user.id
      setSession(nextSession)
      setLoading(false)
      setAuthEpoch((value) => value + 1)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile, authEpoch])

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
